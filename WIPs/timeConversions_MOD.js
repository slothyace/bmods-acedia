modVersion = "u.v1.0"
module.exports = {
  data: {
    name: "Time Conversions"
  },
  aliases: [],
  modules: [],
  category: "Time",
  info: {
    source: "https://github.com/slothyace/bmods-acedia/tree/main/Actions",
    creator: "Acedia",
    donate: "https://ko-fi.com/slothyacedia",
  },
  UI: [
    {
      element: "input",
      storeAs: "timeInput",
      name: "Time",
    },
    {
      element: "typedDropdown",
      storeAs: "inputUnit",
      name: "Time Input Unit",
      choices: {
        ms: {name: "Milliseconds", field: false},
        sec: {name: "Seconds", field: false},
        min: {name: "Minutes", field: false},
        hour: {name: "Hours", field: false},
        day: {name: "Days", field: false}
      }
    },
    {
      element: "typedDropdown",
      storeAs: "outputUnit",
      name: "Output As",
      choices: {
        ms: {name: "Milliseconds", field: false},
        sec: {name: "Seconds", field: false},
        min: {name: "Minutes", field: false},
        hour: {name: "Hours", field: false},
        day: {name: "Days", field: false},
        custom: {name: "Custom", field: true}
      }
    },
    {
      element: "",
      text: `<div style="font-size:20px">Syntax</div>`
    },
    {
      element: "",
      text: `<div style="text-align:left">
        <span>Days - <code>DD</code></span><br></br>
        <span>Hours - <code>HH</code></span><br></br>
        <span>Minutes - <code>MM</code></span><br></br>
        <span>Seconds - <code>SS</code></span><br></br>
        <span>Milliseconds - <code>MS</code></span><br></br>
      </div>`
    },
    "-",
    {
      element: "store",
      storeAs: "outputResult",
      name: "Store As"
    },
  ],

  script: (values)=>{
    function refelm(skipAnimation){
      if (values.data.outputUnit.type == "custom"){
        values.UI[3].element = "text"
        values.UI[4].element = "text"
      } else {
        values.UI[3].element = ""
        values.UI[4].element = ""
      }

      setTimeout(()=>{
        values.updateUI()
      },skipAnimation?1:values.commonAnimation*100)
    }
    refelm(true)

    values.event.on("change", ()=>{refelm()})
  },

  subtitle: (values, constants, thisAction)=>{
    let inputUnits = values.inputUnit.type
    let outputAs = values.outputUnit.type

    let inputType
    switch (inputUnits){
      case "ms":
        inputType = "Milliseconds"
        break

      case "sec":
        inputType = "Seconds"
        break

      case "min":
        inputType = "Minutes"
        break

      case "hour":
        inputType = "Hours"
        break

      case "day":
        inputType = "Days"
        break
    }

    let outputType
    switch (outputAs){
      case "ms":
        outputType = "Milliseconds"
        break

      case "sec":
        outputType = "Seconds"
        break

      case "min":
        outputType = "Minutes"
        break

      case "hour":
        outputType = "Hours"
        break

      case "day":
        outputType = "Days"
        break

      case "custom":
        outputType = values.outputUnit.value
        break
    }

    return `Format ${values.timeInput} From ${inputType} To ${outputType}`
  },

  compatibility: ["Any"],

  async run(values, message, client, bridge){
    let timeInput = parseFloat(bridge.transf(values.timeInput))
    let inputUnitType = bridge.transf(values.inputUnit.type)
    let outputUnitType = bridge.transf(values.outputUnit.type)
    let resultOutput
    
    if (isNaN(timeInput)){
      console.error(`${timeInput} is not a valid number!`)
      return
    }
    
    let msTimeBase
    switch (inputUnitType){
      case "ms":
        msTimeBase = timeInput
        break

      case "sec":
        msTimeBase = timeInput*1000
        break

      case "min":
        msTimeBase = timeInput*1000*60
        break

      case "hour":
        msTimeBase = timeInput*1000*60*60
        break

      case "day":
        msTimeBase = timeInput*1000*60*60*24
        break
    }

    switch (outputUnitType){
      case "ms":
        resultOutput = msTimeBase
        break

      case "sec":
        resultOutput = msTimeBase/1000
        break

      case "min":
        resultOutput = msTimeBase/(1000*60)
        break

      case "hour":
        resultOutput = msTimeBase/(1000*60*60)
        break

      case "day":
        resultOutput = msTimeBase/(1000*60*60*24)
        break

      case "custom":
        let format = bridge.transf(values.outputUnit.value)

        let days = Math.floor(msTimeBase / (1000 * 60 * 60 * 24))
        msTimeBase %= 1000 * 60 * 60 * 24

        let hours = Math.floor(msTimeBase / (1000 * 60 * 60))
        msTimeBase %= 1000 * 60 * 60

        let minutes = Math.floor(msTimeBase / (1000 * 60))
        msTimeBase %= 1000 * 60

        let seconds = Math.floor(msTimeBase / 1000)

        let milliseconds = msTimeBase % 1000
    }
  }
}