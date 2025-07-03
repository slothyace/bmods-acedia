modVersion = "v1.0.0"
module.exports = {
  data: {
    name: "Create Scheduled Actions V2"
  },
  aliases: [],
  modules: [],
  category: "Schedules",
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
      }
    },
    "_",
    {
      element: "menu",
      max: 1,
      required: false,
      types: {
        customID: "Custom ID"
      },
      name: "Custom ID",
      storeAs: "customID",
      UItypes: {
        customID: {
          name: "Custom ID",
          UI: [
            {
              element: "input",
              name: "Custom ID",
              storeAs: "customID"
            },
          ]
        }
      }
    },
    "-",
    {
      element: "variable",
      name: "Associated Information",
      optional: true,
      storeAs: "associatedInfo",
      additionalOptions: {
        text: { name: "Text", field: true }
      }
    },
    "-",
    {
      element: "menu",
      max: 1,
      required: true,
      storeAs: "scheduled",
      types: {
        scheduleActions: "Schedule Actions"
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
                    text: "Why is this an option?"
                  },
                  {
                    element: "text",
                    text: `
                    This is an option because the scheduled actions work similar to persistent components. They work across restarts but they cannot access variables created outside of them. You can assign some information via the "Associated Information" option outside of this menu, in the action. It will allow you to use that information you stored when the scheduled actions run.
                    `
                  }
                ]
              }
            },
            "-",
            {
              element: "actions",
              name: "Scheduled Actions",
              storeAs: "actions"
            },
          ]
        }
      }
    },
    "-",
    {
      element: "store",
      name: "Store ID As",
      storeAs: "storeID"
    },
    "-",
    {
      element: "text",
      text: modVersion
    }
  ],

  subtitle: (values, constants, thisAction) =>{ // To use thisAction, constants must also be present
    return `${values.actions.length} Actions - Store ID As ${constants.variable(values.storeID)}`
  },

  compatibility: ["Any"],

  async run(values, message, client, bridge){ // This is the exact order of things required, other orders will brick
    for (const moduleName of this.modules){
      await client.getMods().require(moduleName)
    }

    
  }
}