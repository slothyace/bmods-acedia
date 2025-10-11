modVersion = "v1.0.0";
module.exports = {
  run: async (options) => {
    const fs = require("node:fs");
    const path = require("node:path");
    const os = require("node:os");

    const dataJSONPath = path.join(process.cwd(), "AppData", "data.json");
    const botData = require(dataJSONPath);
    const commands = botData.commands;
    const downloadsDir = path.join(os.homedir(), "Downloads");

    const commandTypes = {
      textCommand: "Text Cmd",
      slashCommand: "Slash Cmd",
      anyMessage: "Any Message",
      messageContent: "Message Content",
      message: "Message Cmd",
      user: "User Cmd",
      event: "Event",
    };

    const data = await options.showInterface([
      {
        element: "typedDropdown",
        storeAs: "action",
        name: "Action",
        choices: {
          export: { name: "Export" },
          import: { name: "Import" },
        },
      },
      "-",
      {
        element: "text",
        text: modVersion
      }
    ]);

    // =========================
    // EXPORT SECTION
    // =========================
    if (data.action.type === "export") {
      const exportUI = [];

      commands.forEach((command) => {
        exportUI.push({
          element: "menu",
          max: 1,
          name: `[${commandTypes[command.trigger] || "Unknown"}] ${command.name}`,
          storeAs: `${command.customId}`,
          types: { command: "command" },
          UItypes: {
            command: {
              name: command.name,
              UI: [
                { element: "input", storeAs: "name", name: "Name" },
                "-",
                { element: "actions", storeAs: "actions", name: "Actions" },
              ],
              data: {
                name: command.name,
                actions: command.actions,
                data: command,
              },
            },
          },
        });
        exportUI.push("_");
      });

      options.showInterface(exportUI).then((resultData) => {
        let exportedCount = 0;
        const selectedIds = Object.keys(resultData).filter((k) => resultData[k]?.length && k !== "name");

        if (selectedIds.length === 0) return options.result(`⚠️ No Commands Were Selected For Export`);

        for (const id of selectedIds) {
          const selectedData = resultData[id][0].data;
          const fileName = (selectedData.name || "Unnamed_Command").replace(/[^\w\-]+/g, "_");
          const exportPath = path.join(downloadsDir, `${fileName}.json`);

          fs.writeFileSync(exportPath, JSON.stringify(selectedData.data, null, 2));
          exportedCount++;
        }

        options.result(`✅ Exported ${exportedCount} command(s) to ${downloadsDir}`);
      });
    }

    // =========================
    // IMPORT SECTION
    // =========================
    else if (data.action.type === "import") {
      const defaultData = { path: "", generateBackup: true };

      const importUI = [
        {
          element: "input",
          storeAs: "path",
          name: "Path Of File / Folder",
          placeholder: "C:\\Path\\To\\file.json | C:\\Path\\To\\JSONfolder",
        },
        "-",
        {
          element: "toggle",
          storeAs: "generateBackup",
          name: "Generate Backup?",
        },
      ];

      // Helper to read and merge one file
      const readAndPush = (fileLocation) => {
        let rawCommandJson;
        try {
          rawCommandJson = fs.readFileSync(fileLocation, "utf8");
        } catch {
          options.burstInform({ element: "text", text: `⚠️ Could Not Read File ${fileLocation}` });
          return false;
        }

        let commandJson;
        try {
          commandJson = JSON.parse(rawCommandJson);
        } catch {
          options.burstInform({ element: "text", text: `⚠️ ${fileLocation} Contains Invalid JSON` });
          return false;
        }

        if (Array.isArray(commandJson)) commands.push(...commandJson);
        else commands.push(commandJson);

        options.burstInform({ element: "text", text: `✅ Imported ${fileLocation}` });
        return true;
      };

      options.showInterface(importUI, defaultData).then((resultData) => {
        const resultDataPath = resultData.path.replaceAll(`"`, "").replaceAll(`'`, "");
        const generateBackup = resultData.generateBackup;
        let commandsMerged = 0;

        // Backup first if requested
        if (generateBackup) {
          const projectDir = botData.prjSrc;
          const backupPath = path.join(projectDir, "backup_data.json");
          console.log(backupPath);
          fs.writeFileSync(backupPath, JSON.stringify(botData, null, 2), "utf8");
          options.burstInform({ element: "text", text: `✅ Backup Saved To ${backupPath}` });
        }

        // Validate target path
        let stats;
        try {
          stats = fs.statSync(resultDataPath);
        } catch {
          return options.result(`⚠️ Path ${resultDataPath} Doesn't Exist`);
        }

        // Merge based on type
        if (stats.isDirectory()) {
          const files = fs.readdirSync(resultDataPath);
          for (const file of files) {
            if (path.extname(file).toLowerCase() !== ".json") continue;
            const fileLocation = path.join(resultDataPath, file);
            if (readAndPush(fileLocation)) commandsMerged++;
          }
        } else if (stats.isFile()) {
          if (readAndPush(resultDataPath)) commandsMerged++;
        } else {
          return options.result(`⚠️ ${resultDataPath} Is Neither A File Nor A Folder`);
        }

        // Save merged data
        botData.commands = commands;
        fs.writeFileSync(dataJSONPath, JSON.stringify(botData, null, 2), "utf8");

        options.result(`✅ ${commandsMerged} Command(s) Imported Successfully, Reloading...`);
        setTimeout(()=>location.reload(), 1000)
      });
    }
  },
};
