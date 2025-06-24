modVersion = "v1.2.4"
module.exports = {
  data: {
    name: "Extract From Text"
  },
  aliases: ["Number Extraction", "Regex Extraction", "Text Extractions"],
  modules: [],
  category: "Text",
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
    "-",
    {
      element: "typedDropdown",
      storeAs: "extraction",
      name: "Extract",
      choices: {
        string: {name: "Regex", field: true, placeholder: "Regex"},
        number: {name: "Number", field: false},
        text: {name: "Text", field: true, placeholder: "Words That Include"}
      },
    },
    {
      element: "toggle",
      storeAs: "caseInsensitive",
      name: "Case Insensitive?",
      true: "Yes",
      false: "No",
    },
    "-",
    {
      element: "store",
      storeAs: "extractedItem",
      name: "Store Extracted Array As"
    },
    {
      element: "text",
      text: modVersion,
    },
  ],

  subtitle: (values, constants, thisAction) => {
    let type = values.extraction.type
    let regexExp
    switch (type){
      case "string":{
        regexExp = values.extraction.value.replace("\\", "\\\\") || ""
        break
      }

      case "number":{
        regexExp = `-?\\d+(?:\\.\\d+)?`
        break
      }

      case "text":{
        regexExp = values.extraction.value
      }
    }
    return `Extract ${thisAction.UI.find((e) => e.element == "typedDropdown").choices[values.extraction.type].name}(${regexExp})`
  },

  compatibility: ["Any"],

  async run(values, message, client, bridge){
    let source = bridge.transf(values.sourceText)
    let extractionType = bridge.transf(values.extraction.type)

    let extracts
    switch(extractionType){
      case "string":{
        let extractionReg = bridge.transf(values.extraction.value) || ""
        let regexExpression = new RegExp(extractionReg, "g" + (values.caseInsensitive? "i":""))
        extracts = [...source.matchAll(regexExpression)].map((match) => match[0])
        break
      }
      
      case "number":{
        extracts = (source.match(/-?\d+(?:\.\d+)?/g) || []).map(Number)
        break
      }

      case "text":{
        let lookFor = bridge.transf(values.extraction.value) || ""
        let words = source.split(" ")
        if (values.caseInsensitive){
          extracts = words.filter(word => word.toLowerCase().includes(lookFor.toLowerCase()))
        } else {
          extracts = words.filter(word => word.includes(lookFor))
        }

        extracts = (extracts || []).map(extractedWord => extractedWord.replace(/[!"#$%&'()*+,./:;<=>?@[\\\]^_`{|}~‘’“”]/g, ""))
        break
      }
    }
    let results = (extracts && extracts.length > 0) ? extracts : []
    bridge.store(values.extractedItem, results)
  }
}