modVersion = "v1.0.2";
module.exports = {
  data: {
    name: "Create Independent Scheduled Actions",
  },
  aliases: [],
  modules: [],
  category: "",
  info: {
    source: "https://github.com/slothyace/bmods-acedia/tree/main/Actions",
    creator: "Acedia",
    donate: "https://ko-fi.com/slothyacedia",
  },
  UI: [
    {
      element: "typedDropdown",
      storeAs: "time",
      name: "Run",
      choices: {
        timestamp: { name: "At Timestamp", field: true },
        seconds: { name: "In # Seconds", field: true },
        minutes: { name: "In # Minutes", field: true },
        hours: { name: "In # Hours", field: true },
        days: { name: "In # Days", field: true },
        weeks: { name: "In # Weeks", field: true },
        months: { name: "In # Months", field: true },
      },
    },
    "_",
    {
      element: "menu",
      max: 1,
      required: false,
      types: {
        customID: "Custom ID",
      },
      name: "Custom ID",
      storeAs: "customID",
      UItypes: {
        customID: {
          name: "Custom ID",
          data: {},
          UI: [
            {
              element: "input",
              name: "Custom ID",
              storeAs: "customID",
            },
          ],
        },
      },
    },
    "-",
    {
      element: "variable",
      name: "Associated Information",
      optional: true,
      storeAs: "associatedInfo",
      additionalOptions: {
        text: { name: "Text", field: true },
      },
    },
    "-",
    {
      element: "menu",
      max: 1,
      required: true,
      storeAs: "scheduled",
      types: {
        scheduleActions: "Schedule Actions",
      },
      UItypes: {
        scheduleActions: {
          name: "Scheduled Actions",
          inheritData: true,
          UI: [
            {
              element: "store",
              name: "When The Job Runs, Store Associated Information As",
              storeAs: "store",
              optional: true,
              help: {
                title: "Associated Information",
                UI: [
                  {
                    element: "text",
                    header: true,
                    text: "Why is this an option?",
                  },
                  {
                    element: "text",
                    text: `
                    This is an option because the scheduled actions work similar to persistent components. They work across restarts but they cannot access variables created outside of them. You can assign some information via the "Associated Information" option outside of this menu, in the action. It will allow you to use that information you stored when the scheduled actions run.
                    `,
                  },
                ],
              },
            },
            "-",
            {
              element: "actions",
              name: "Scheduled Actions",
              storeAs: "actions",
            },
          ],
        },
      },
    },
    "-",
    {
      element: "store",
      name: "Store ID As",
      storeAs: "storeID",
    },
    "-",
    {
      element: "text",
      text: modVersion,
    },
  ],

  subtitle: (values, constants, thisAction) => {
    // To use thisAction, constants must also be present
    return `${values.actions.length} Actions - Store ID As ${constants.variable(values.storeID)}`;
  },

  compatibility: ["Any"],

  startup: (bridge) => {
    const altPath = require("node:path");
    const altFs = require("node:fs");

    const botData = require("../data.json");
    const workingDir = altPath.normalize(process.cwd());
    let projectFolder;
    if (workingDir.includes(altPath.join("common", "Bot Maker For Discord"))) {
      projectFolder = botData.prjSrc;
    } else {
      projectFolder = workingDir;
    }

    let schedulesJsonFilePath = altPath.join(projectFolder, "schedules.json");

    if (!altFs.existsSync(schedulesJsonFilePath)) {
      altFs.writeFileSync(schedulesJsonFilePath, "{}");
    }

    var cache = JSON.parse(altFs.readFileSync(schedulesJsonFilePath, "utf8"));

    let getData = () => {
      return bridge.data.IO.schedules.cache;
    };
    let writeData = (data) => {
      bridge.data.IO.schedules.cache = JSON.parse(JSON.stringify(data));
      altFs.writeFileSync(schedulesJsonFilePath, JSON.stringify(data, null, 2));
    };

    bridge.data.IO.schedules = {
      get: getData,
      write: writeData,
      cache,
    };
  },
  init: (values, bridge) => {
    setInterval(async () => {
      let schedules = bridge.data.IO.schedules.get();
      let currentTime = Date.now();
      for (let schedule in schedules) {
        if (schedules[schedule].time < currentTime && schedules[schedule].id == bridge.data.id) {
          if (schedules[schedule].store) {
            bridge.store(schedules[schedule].store, schedules[schedule].associatedInfo);
          } else {
            bridge.store(bridge.actions[bridge.atAction].data.store, schedules[schedule].associatedInfo);
          }
          await bridge.runActions(schedules[schedule].actions);
          delete schedules[schedule];
          bridge.data.IO.schedules.write(schedules);
        }
      }
    }, 5000);
  },
  run(values, message, client, bridge) {
    let time;

    let timeUnits = {
      seconds: 1000,
      minutes: 1000 * 60,
      hours: 1000 * 60 * 60,
      days: 1000 * 60 * 60 * 24,
      weeks: 1000 * 60 * 60 * 24 * 7,
      months: 1000 * 60 * 60 * 24 * 30,
    };

    if (timeUnits[values.time.type]) {
      time = Date.now() + timeUnits[values.time.type] * bridge.transf(values.time.value);
    } else {
      time = bridge.transf(values.time.value);
    }

    let data = bridge.data.IO.schedules.get() || {};
    let assignedID = `${time}#${bridge.data.id}`;
    if (values.customID && values.customID[0]?.data.customID) {
      assignedID = bridge.transf(values.customID[0].data.customID);
    }

    data[assignedID] = {
      id: bridge.data.id,
      associatedInfo:
        values.associatedInfo.type == "text"
          ? bridge.transf(values.associatedInfo.value)
          : bridge.get(values.associatedInfo),
      time,
      createdAt: new Date().getTime(),
      actions: values.actions,
      store: values.store,
    };

    bridge.data.IO.schedules.write(data);
    bridge.store(values.storeID, assignedID);
  },
};
