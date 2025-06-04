modVersion = "u.v1.0"
module.exports = {
  data: {
    name: "Reduce Duplicates In List"
  },
  aliases: [],
  modules: [],
  category: "List",
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
      element: "typedDropdown",
      storeAs: "affix",
      name: "Affix With",
      choices: {
        prefix: {name: "Prefix", field: true, placeholder: "Result: ×5 Example"},
        suffix: {name: "Suffix", field: true, placeholder: "Result: Example ×5"}
      }
    },
    "-",
    {
      element: "store",
      storeAs: "reducedList",
      name: "Store Reduced List As"
    },
    "-",
    {
      element: "text",
      text: modVersion
    }
  ],

  subtitle: (values, constants, thisAction) =>{ // To use thisAction, constants must also be present
    return `Reduce duplicates in ${values.inputList.type}(${values.inputList.value})`
  },

  compatibility: ["Any"],

  async run(values, message, client, bridge){ // This is the exact order of things required, other orders will brick
    for (const moduleName of this.modules){
      await client.getMods().require(moduleName)
    }

    let inputList = bridge.get(values.inputList)
    
    elementMap = {}
    for (element of inputList){
      elementMap[element] = (elementMap[element]||0) + 1
    }

    let affixType = bridge.transf(values.affix.type)
    let affixValue = bridge.transf(values.affix.value) || `×`
    let reduced = []
    for (let [item, count] of Object.entries(elementMap)){
      if (affixType == "prefix" && count > 1){
        reduced.push(`${affixValue}${count} ${item}`)
      } else if (affixType == "suffix" && count > 1){
        reduced.push(`${item} ${affixValue}${count}`)
      } else {
        reduced.push(item)
      }
    }

    bridge.store(values.reducedList, reduced)
  }
}