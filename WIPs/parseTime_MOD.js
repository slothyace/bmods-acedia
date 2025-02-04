modVersion = "u.v1.0"
module.exports = {
  data: {
    name: "Parse Time"
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
      element: "input",
      storeAs: "timeStatement",
      name: "Time Statement"
    },
    {
      element: "typedDropdown",
      storeAs: "outputTimeUnits",
      name: "Output Time Unit",
      choices: {
        milliseconds: {name: "Milliseconds", field: false},
        seconds: {name: "Seconds", field: false},
        minutes: {name: "Minutes", field: false},
        hours: {name: "Hours", field: false},
        days: {name: "Days", field: false},
        weeks: {name: "Weeks", field: false},
        months: {name: "Months", field: false},
        years: {name: "Years", field: false},
        custom: {name: "Custom", field: false}
      }
    },
    {
      element: "store",
      storeAs: "outputTime",
      name: "Store Parsed Time As",
    },
    {
      element: "text",
      text: modVersion,
    }
  ],

  subtitle: (values, thisAction) =>{
    let unitSelection = values.outputTimeUnits.type
    let dispText
    switch (unitSelection){
      case "custom":
        dispText = values.outputTimeUnits.value
        break
      
      default:
        dispText = thisAction.UI.find((e) => e.element == "typedDropdown").choices[values.outputTimeUnits.type].name
        break
    }
    return `Parse ${values.timeStatement} Into ${dispText}`
  },

  compatibility: ["Any"],

  async run(client, message, values, bridge){
    let timeStatement = bridge.transf(values.timeStatement)
    let outputUnits = bridge.transf(values.outputTimeUnits.type)
    
    const extractionRegexes = {
      year: /(\d+) ?(year|years|yrs|yr|y)/gi,
      month: /(\d+) ?(mo|month|months|mth)/gi,
      week: /(\d+) ?(week|weeks|wk|wks|w)/gi,
      day: /(\d+) ?(day|days|d)/gi,
      hour: /(\d+) ?(hour|hours|hr|hrs|h)/gi,
      minute: /(\d+) ?(minute|minutes|min|mins|m)/gi,
      second: /(\d+) ?(second|seconds|sec|secs|s)/gi,
      millisecond: /(\d+) ?(millisecond|milliseconds|ms)/gi,
    }

    const toMilli = {
      year: 365.25 * 24 * 60 * 60 * 1000,
      month: 30.44 * 24 * 60 * 60 * 1000,
      week: 7 * 24 * 60 * 60 * 1000,
      day: 24 * 60 * 60 * 1000,
      hour: 60 * 60 * 1000,
      minute: 60 * 1000,
      second: 1000,
      millisecond: 1
    }
    
    let extractedValues = {}
    for (let unit in extractionRegexes){
      let matches = [...timeStatement.matchAll(extractionRegexes[unit])]

      if (matches.length > 0) {
        extractedValues[unit] = matches.map(match => parseFloat(match[1])).reduce((sum,num) => sum+num, 0)
      } else {
        extractedValues[unit] = 0
      }
    }

    let msTimeBase = 0
    for (let unit in extractedValues){
      msTimeBase += extractedValues[unit]*toMilli[unit]
    }

    let result
    switch(outputUnits){
      case "milliseconds":
        result = msTimeBase
        break

      case "seconds":
        result = msTimeBase/1000
        break

      case "minutes":
        result = msTimeBase/(60*1000)
        break

      case "hours":
        result = msTimeBase/(60*60*1000)
        break

      case "days":
        result = msTimeBase/(24*60*60*1000)
        break

      case "weeks":
        result = msTimeBase/(7*24*60*60*1000)
        break

      case "months":
        result = msTimeBase/(30.44*24*60*60*1000)
        break

      case "years":
        result = msTimeBase/(365.25*24*60*60*1000)
        break

      case "custom":
        let format = bridge.transf(values.outputTimeUnits.value)
    }
  }
}