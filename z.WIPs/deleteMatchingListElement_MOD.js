modVersion = "v1.0.0"
module.exports = {
  data: {
    name: "Delete Matching List Element"
  },
  aliases: [],
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
      storeAs: "list",
      name: "List",
    },
    "-",
    {
      element: "largeInput",
      storeAs: "findElement",
      name: "Delete Element That Matches"
    },
    {
      element: "toggle",
      storeAs: "caseSensitive",
      name: "Case Sensitive?"
    },
    "-",
    {
      element: "store",
      storeAs: "modifiedList",
      name: "Store Modified List As"
    },
    "-",
    {
      element: "text",
      text: modVersion
    }
  ],

  subtitle: (values, constants, thisAction) =>{ // To use thisAction, constants must also be present
    return ``
  },

  compatibility: ["Any"],

  async run(values, message, client, bridge){ // This is the exact order of things required, other orders will brick
    for (const moduleName of this.modules){
      await client.getMods().require(moduleName)
    }
    
    let list = bridge.get(values.list)
    let findElement = bridge.transf(values.findElement)
    if (!Array.isArray(list)){
      list = []
    }

    let modifiedList
    if (values.caseSensitive == true){
      modifiedList = list.filter(element => element !== findElement)
    } else {
      modifiedList = list.filter(element => {
        if (typeof element === "string" && typeof findElement === "string"){
          return element.toLowerCase() !== findElement.toLowerCase()
        } else {
          return element !== findElement
        }
      })
    }
    
    bridge.store(values.modifiedList, modifiedList)
  }
}