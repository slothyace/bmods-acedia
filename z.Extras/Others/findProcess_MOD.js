modVersion = "v1.0.0"
module.exports = {
  data: {
    name: "Find Process",
  },
  aliases: ["Get Process", "Get PID"],
  modules: ["find-process"],
  category: "Utilities",
  info: {
    source: "https://github.com/slothyace/bmods-acedia/tree/main/Actions",
    creator: "Acedia",
    donate: "https://ko-fi.com/slothyacedia",
  },
  UI: [
    {
      element: "typedDropdown",
      storeAs: "searchType",
      name: "Search Process By",
      choices: {
        name: { name: "Name", field: true, placeholder: "Process Name" },
        port: { name: "Port", field: true, placeholder: "Port Number" },
        pid: { name: "Process ID", field: true, placeholder: "Process Id" },
      },
    },
    "-",
    {
      element: "typedDropdown",
      storeAs: "filter",
      name: "Filter Results",
      choices: {
        none: { name: "Dont Filter", field: false },
        name: { name: "Name", field: true, placeholder: "Process Name" },
        bin: { name: "Binary", field: true, placeholder: "Binary Path" },
        cmd: { name: "Command", field: true, placeholder: "Execution Command" },
      },
    },
    {
      element: "toggle",
      storeAs: "strictFilter",
      name: "Strict Filter",
    },
    "-",
    {
      element: "store",
      storeAs: "searchResults",
      name: "Store Result List As",
    },
    "-",
    {
      element: "text",
      text: modVersion,
    },
  ],

  subtitle: (values, constants, thisAction) => {
    // To use thisAction, constants must also be present
    return `Find Process with ${thisAction.UI.find((e) => e.storeAs == "searchType").choices[values.searchType.type].name}: ${
      values.searchType.value
    }`
  },

  compatibility: ["Any"],

  async run(values, message, client, bridge) {
    // This is the exact order of things required, other orders will brick
    for (const moduleName of this.modules) {
      await client.getMods().require(moduleName)
    }

    const find = require("find-process")
    let searchType = bridge.transf(values.searchType.type)
    let searchValue = bridge.transf(values.searchType.value)
    let filterType = bridge.transf(values.filter.type)
    let filterValue = bridge.transf(values.filter.value)
    let strictFilter = values.strictFilter

    let results
    let processes = await find(searchType, searchValue, { strict: true })

    if (filterType == "none") {
      results = processes
    } else {
      results = processes.filter((process) => {
        if (strictFilter == true) {
          return process[filterType] === `"${filterValue}"`
        } else {
          return process[filterType].includes(`"${filterValue}"`)
        }
      })
    }

    if (results.length == "0") {
      bridge.store(values.searchResults, undefined)
    } else {
      bridge.store(values.searchResults, results)
    }
  },
}
