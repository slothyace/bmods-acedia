modVersion = "v1.0.2"
module.exports = {
  data: {
    name: "Find Uniques In List",
  },
  aliases: ["Filter List"],
  modules: [],
  category: "Lists",
  info: {
    source: "https://github.com/slothyace/bmods-acedia/tree/main/Actions",
    creator: "Acedia",
    donate: "https://ko-fi.com/slothyacedia",
  },
  UI: [
    {
      element: "variable",
      storeAs: "inputList",
      name: "List",
    },
    {
      element: "store",
      storeAs: "uniques",
      name: "Store List Of Uniques As",
    },
    "-",
    {
      element: "text",
      text: modVersion,
    },
  ],

  subtitle: (values, constants, thisAction) => {
    // To use thisAction, constants must also be present
    return `Find Uniques In List ${inputList.type}(${inputList.value})`
  },

  compatibility: ["Any"],

  async run(values, message, client, bridge) {
    // This is the exact order of things required, other orders will brick
    for (const moduleName of this.modules) {
      await client.getMods().require(moduleName)
    }

    let inputList = bridge.get(values.inputList)
    let uniques = []

    for (let element of inputList) {
      if (uniques.includes(element) == false) {
        uniques.push(element)
      }
    }

    bridge.store(values.uniques, uniques)
  },
}
