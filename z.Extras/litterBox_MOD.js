modVersion = "v1.0.0";
module.exports = {
  data: {
    name: "Litterbox.Catbox.moe",
  },
  aliases: [],
  modules: ["node:fs", "node:path", "node:buffer", "undici"],
  category: "WebAPIs",
  info: {
    source: "https://github.com/slothyace/bmods-acedia/tree/main/Actions",
    creator: "Acedia",
    donate: "https://ko-fi.com/slothyacedia",
  },
  UI: [
    {
      element: "typedDropdown",
      storeAs: "action",
      name: "Action (Read The Help Section First!)",
      choices: {
        uploadFile: { name: "Upload File", field: true, placeholder: "path/to/file.ext" },
        uploadBuffer: { name: "Upload Buffer", field: true, placeholder: "fileName.ext" },
      },
      help: {
        title: "What To Fill The Field With",
        UI: [
          {
            element: "text",
            text: `
            Upload File: The Path To The File To Upload, Relative To The Project Folder.<br><br>
            Upload Buffer: The Filename Of The Buffer.<br><br>
            `,
          },
        ],
      },
    },
    "_",
    {
      element: "variable",
      storeAs: "buffer",
      name: "Buffer"
    },
    "-",
    {
      element: "typedDropdown",
      storeAs: "duration",
      name: "Valid For",
      choices: {
        "1h": {name: "1 Hour", field:false},
        "12h": {name: "12 Hours", field:false},
        "24h": {name: "24 Hours", field:false},
        "72h": {name: "72 Hours", field:false},
      }
    },
    "-",
    {
      element: "store",
      storeAs: "response",
      name: "Store Response As",
    },
    "-",
    {
      element: "text",
      text: modVersion,
    },
  ],

  subtitle: (values, constants, thisAction) => {
    // To use thisAction, constants must also be present
    let subtitle;
    switch (values.action.type) {
      case "uploadFile": {
        subtitle = `Upload File "${values.action.value}" To litterbox.catbox.moe`;
        break;
      }

      case "uploadBuffer": {
        subtitle = `Upload Buffer ${values.buffer.type}(${values.buffer.value}) To litterbox.catbox.moe`;
        break
      }
    }
    return subtitle;
  },

  script: (values) => {
    function reflem(skipAnimation) {
      if (values.data.action.type == "uploadBuffer") {
        values.UI[1].element = "_"
        values.UI[2].element = "variable"
      } else {
        values.UI[1].element = ""
        values.UI[2].element = ""
      }

      setTimeout(() => {
        values.updateUI()
      }, skipAnimation ? 1 : values.commonAnimation * 100)
    }

    reflem(true)

    values.events.on("change", () => {
      reflem()
    })
  },

  compatibility: ["Any"],

  async run(values, message, client, bridge) {
    // This is the exact order of things required, other orders will brick
    for (const moduleName of this.modules) {
      await client.getMods().require(moduleName);
    }

    const fs = require("node:fs");
    const path = require("node:path");
    const { FormData } = require("undici");
    const { Blob } = require("node:buffer");

    let litterBoxApi = `https://litterbox.catbox.moe/resources/internals/api.php`;
    let action = bridge.transf(values.action.type);
    let actionData = bridge.transf(values.action.value);

    const botData = require("../data.json");
    const workingDir = path.normalize(process.cwd());
    let projectFolder;
    if (workingDir.includes(path.join("common", "Bot Maker For Discord"))) {
      projectFolder = botData.prjSrc;
    } else {
      projectFolder = workingDir;
    }

    let duration = bridge.transf(values.duration.type)
    async function sendForm(form) {
      // for (const [key, val] of form) {
      //   console.log(key, val);
      // }
      const response = await fetch(litterBoxApi, {
        method: "POST",
        body: form,
        headers: {
          "user-agent": "bmods/Acedia",
        },
      });
      const responseText = await response.text();
      if (!response.ok) {
        throw new Error(`LitterBox API Error: ${responseText}`);
      }
      return responseText.trim();
    }

    function randomString(length) {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
      let result = '';
      for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return result;
    }

    let result;

    try {
      switch (action) {
        case "uploadFile": {
          let relativePath = path.normalize(actionData);
          let filePath = path.join(projectFolder, relativePath);
          if (!fs.existsSync(path.dirname(filePath))) {
            fs.mkdirSync(path.dirname(filePath), { recursive: true });
          }
          if (!fs.existsSync(filePath)) {
            throw new Error(`File "${filePath}" Not Found!`);
          }

          let form = new FormData();
          let fileBuffer = fs.readFileSync(filePath);
          let fileName = path.basename(filePath);
          form.append("reqtype", "fileupload");
          form.append("fileToUpload", new Blob([fileBuffer]), fileName);
          form.append("time", duration)
          result = await sendForm(form);
          break;
        }

        case "uploadBuffer": {
          let form = new FormData();
          let fileBuffer = bridge.get(values.buffer)
          if (!Buffer.isBuffer(fileBuffer)) {
            throw new Error(`Variable Provided Isn't A Buffer!`)
          }
          let fileName = actionData.trim() || `upload-${randomString(16)}.bin`
          form.append("reqtype", "fileupload");
          form.append("fileToUpload", new Blob([fileBuffer]), fileName);
          form.append("time", duration)
          result = await sendForm(form);
          break;
        }
      }

      bridge.store(values.response, result);
    } catch (error) {
      bridge.store(values.response, error.message);
    }
  },
};
