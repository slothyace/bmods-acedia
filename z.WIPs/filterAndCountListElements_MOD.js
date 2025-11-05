modVersion = "v1.0.0"
module.exports = {
  data: {
    name: "Filter And Count List Elements"
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
      storeAs: "inputList",
      name: "List",
    },
    "_",
    {
      element: "menu",
      storeAs: "listElements",
      name: "Look For Elements",
      types: {
        elements: "elements"
      },
      max: 1000,
      UItypes: {
        elements: {
          data: {},
          name: "Element",
          preview: "`${option.data.elementValue}, Case Sensitive: ${option.data.caseSens}`",
          UI: [
            {
              element: "input",
              storeAs: "elementValue",
              name: "Element Value (Filter For)",
              placeholder: "A"
            },
            {
              element: "toggle",
              storeAs: "caseSens",
              name: "Case Sensitive?",
            },
            "-",
            {
              element: "store",
              storeAs: "store",
              name: "Store Number Of Occurences As"
            }
          ]
        }
      }
    },
    "-",
    {
      element: "text",
      text: modVersion
    }
  ],

  subtitle: (values, constants, thisAction) =>{ // To use thisAction, constants must also be present
    return `Look And Count For ${values.listElements.length} Elements`
  },

  compatibility: ["Any"],

  async run(values, message, client, bridge){ // This is the exact order of things required, other orders will brick
    for (const moduleName of this.modules){
      await client.getMods().require(moduleName)
    }
    
    let inputList = bridge.get(values.inputList)
    for (let listElement of values.listElements){
      let listElementData = listElement.data
      let elementValue = listElementData.elementValue
      let comparisonValue = elementValue
      let filteredList = inputList.filter(e => {
        if (listElementData.caseSens == false){
          e = e.toLowerCase()
          comparisonValue = elementValue.toLowerCase()
        }
        return e == comparisonValue
      })
      bridge.store(listElementData.store, filteredList.length)
    }
  }
}
