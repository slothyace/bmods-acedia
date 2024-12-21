module.exports = {
  data: {
    name: "Timestamp Conversions",
    nameAlias: ["Format Timestamp"]
  },
  info: {
    source: "https://github.com/slothyace/bmods-acedia/tree/main/Actions",
    creator: "Acedia",
    donate: "https://ko-fi.com/slothyacedia",
  },
  category: "Time",
  modules: [],
  UI: [
    {
      element: "input",
      storeAs: "timestamp",
      name: "Timestamp",
    },
    {
      element: "typedDropdown",
      storeAs: "format",
      name: "Format As",
      choices: {
        default: {name: "Default", field: false},
        shortTime: {name: "Short Time", field: false},
        longTime: {name: "Long Time", field: false},
        shortDate: {name: "Short Date", field: false},
        longDate: {name: "Long Date", field: false},
        shortDateTime: {name: "Short Date / Time", field: false},
        longDateTime: {name: "Long Date / Time", field: false},
        relative: {name: "Relative", field: false},
        custom: {name: "Custom", field: true}
      }
    },
    {
      element: "store",
      storeAs: "store",
      name: "Store Output As"
    },
    {
      element: "text",
      text: "",
      name: "Example Output"
    }
  ],

  script: (values)=>{
    function refElm(skipAnimation){
      type = values.data.format.type
      let fmtEx

      switch(type){
        default:
          fmtEx = "November 28, 2018 9:01 AM | 28 November 2018 09:01"
          break

        case "shortTime":
          fmtEx = "9:01 AM | 09:01"
          break

        case "longTime":
          fmtEx = "9:01:00 AM | 09:01:00"
          break

        case "shortDate":
          fmtEx = "11/28/2018 (MM/DD/YYYY)| 28/11/2018 (DD/MM/YYYY)"
          break

        case "longDate":
          fmtEx = "November 28, 2018 | 28 November 2018"
          break

        case "shortDateTime":
          fmtEx = "November 28, 2018 9:01 AM | 28 November 2018 09:01"
          break

        case "longDateTime":
          fmtEx = "Wednesday, November 28, 2018 9:01 AM | Wednesday, 28 November 2018 09:01"
          break

        case "relative":
          fmtEx = "3 years ago | 3 years ago"
          break

        case "custom":
          fmtEx = "Syntax:\nYear - YYYY | YY\nMonth - Mth | MMM | MM\nDate - DD\nDay - Day | dd\nHour - hh\nMinute - mm\nSecond - ss"
      }

      values.UI[3].text = fmtEx

      setTimeout(()=>{
        values.updateUI()
      }, skipAnimation?1: values.commonAnimation*100)
    }

    refElm(true)

    values.events.on("change", ()=>{
      refElm()
    })
  },

  subtitle: (values) => {
    
  }
}