modVersion = "u.v1.0"
module.exports = {
  data: {
    name: "Extract From Text"
  },
  aliases: ["Number Extraction", "Regex Extraction"],
  modules: [],
  category: "",
  info: {
    source: "https://github.com/slothyace/bmods-acedia/tree/main/Actions",
    creator: "Acedia",
    donate: "https://ko-fi.com/slothyacedia",
  },
  UI: [
    {
      element: "largeInput",
      storeAs: "sourceText",
      name: "Source"
    },
    {
      element: "typedDropdown",
      storeAs: "extractionType",
      name: "Extract",
      choices: {
        string: {name: "String", field: true},
        number: {name: "Number", field: false}
      },
    },
    {
      element: "store",
      storeAs: "extractedItem",
      name: "Store As"
    },
    {
      element: "text",
      text: modVersion,
    },
  ],

  subtitle: (values, thisAction) => {
    let type = values.extractionType.type
    regexExp
    if (type == "string"){
      regexExp = values.extraction.value
    } else if (type == "number"){
      regexExp = `(\d+?)`
    }
    return `Extract ${thisAction.UI.find((e) => e.element == "typedDropdown").choices[values.extraction.type].name}(${regexExp})`
  },

  compatibility: ["Any"],

  async run(client, message, values, bridge){
    let sourceText = bridge.transf(values.sourceText)
    let extractionType = bridge.transf(values.extractionType.type)

    let extracts
    switch (extractionType){
      case "string":
        let extractionRegex = bridge.transf(values.extractionType.value)
        extracts = [...sourceText.matchAll(new RegExp("^" + extractionRegex + "$", "gi"))]
        break

      case "number":
        extracts = [...sourceText.matchAll(/(\d+)/gi)]
        break
    }

    let result = (extracts && extracts.length > 0) ? extracts : undefined

    bridge.store(values.extractedItem, result)
  }
}