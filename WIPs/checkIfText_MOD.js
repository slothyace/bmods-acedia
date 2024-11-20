module.exports = {
  data: {
    name: "Check If Text",
  },
  info: {
    source: "https://github.com/slothyace/bmd-ace/tree/main/Actions",
    creator: "Acedia",
    donate: "https://ko-fi.com/slothyacedia",
  },
  category: "Text",
  modules: [],
  UI: [
    {
      element: "largeInput",
      storeAs: "sourceText",
      name: "Source Text",
    },
    {
      element: "typedDropdown",
      storeAs: "criteria",
      name: "Check If Text",
      choices: {
        startWith = {name: "Starts With", field: false},
        endWith = {name: "Ends With", field: false},
        includes = {name: "Includes", field: false},
        matchRegex = {name: "Matches Regex", field: false}
      }
    },
    {
      element: "largeInput",
      storeAs: "lookup",
      name: (values) => {
        type = values.criteria.type
        switch (type){
          case "startWith" || "endWith" || "includes":
            return `Text`
            break
          
          case "matchRegex":
            return `Regex Term`
            break
        }
      }
    },
    {
      element: "condition",
      storeAs: "true",
      storeActionsAs: "trueActions",
      name: "If True"
    },
    {
      element: "condition",
      storeAs: "false",
      storeActionsAs: "falseActions",
      name: "If False"
    },
  ],

  subtitles: (values) => {
    let looktype
    switch (values.crtiteria.type){
      case "startWith":
        looktype = `Starts With`
        break

      case "endWith":
        looktype = `Ends With`
        break

      case "matchRegex":
        looktype = `Matches Regex`
        break

      case "includes":
        looktype = `Includes`
        break
    }
    return `Check If Text ${looktype} "${values.lookup.type}"`
  },

  compatibility: ["Any"],

  async run(values, message, client, bridge){
    srcTxt = bridge.transf(values.sourceText)
    lookFor = bridge.transf(values.lookup)
    criterion = bridge.transf(values.criteria)

    let result = false

    switch (criterion) {
      case "startWith":
        if (srcTxt.startWith(lookFor)){
          result = true
        } else {result = false}
        break

      case "endWith":
        if (srcTxt.endWith(lookFor)){
          result = true
        } else {result = false}
        break

      case "includes":
        if (srcTxt.includes(lookFor)){
          result = true
        } else {result = false}
        break

      case "matchRegex":
        if (srcTxt.match(new RegExp("^" + lookFor + "$", "i"))){
          result = true
        } else {result = false}
        break
    }

    if (result == true){
      await bridge.call(values.true, values.trueActions)
    } else (await bridge.call(values.false, values.falseActions))
  }
}