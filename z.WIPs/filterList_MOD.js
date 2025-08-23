modVersion = "v1.0.0"
module.exports = {
  data: {
    name: "Filter List"
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
      element: "typedDropdown",
      storeAs: "filterType",
      name: "Filter Type",
      choices: {
        for: {name: "Filter For Elements", field:false},
        out: {name: "Filter Out Elements", field:false},
      },
    },
    {
      element: "typedDropdown",
      storeAs: "filter",
      name: "Filter For Elements That",
      choices: {
        startsWith: {name: "Starts With", field: true},
        endsWith: {name: "Ends With", field: true},
        includes: {name: "Includes", field: true},
        equals: {name: "Equals", field: true},
        strings: {name: "Are Strings", field: false},
        numbers: {name: "Are Numbers", field: false},
      }
    },
    {
      element: "toggle",
      storeAs: "caseSens",
      name: "Case Sensitive",
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

  script: (values) =>{
    function reflem(skipAnimation){
      let filterType = values.data.filterType.type

      switch (filterType){
        case "for": {
          values.UI[3].name = "Filter For Elements That"
          break
        }

        case "out": {
          values.UI[3].name = "Filter Out Elements That"
          break
        }
      }

      setTimeout(()=>{
        values.updateUI()
      }, skipAnimation?1: values.commonAnimation*100)
    }

    reflem(true)

    values.events.on("change", ()=>{
      reflem()
    })
  },

  compatibility: ["Any"],

  async run(values, message, client, bridge){ // This is the exact order of things required, other orders will brick
    for (const moduleName of this.modules){
      await client.getMods().require(moduleName)
    }
    
    let list = bridge.get(values.list)

    let filterType = bridge.transf(values.filterType.type)
    let filter = bridge.transf(values.filter.type)
    let filterValue = bridge.transf(values.filter.value)
    let caseSens = values.caseSens
    if (caseSens == true){
      list = list.map(el => el.toLowerCase())
    }

    let masterFilter = `${filterType}_${filter}`
    let filteredList

    switch (filterType){
      case "for_startsWith":{
        if (caseSens == true){
          filteredList = list.filter(el => el.startsWith(filterValue))
        } else {
          filteredList = list.filter(el => el.toLowerCase().startsWith(filterValue.toLowerCase()))
        }
        break
      }

      case "out_startsWith":{
        if (caseSens == true){
          filteredList = list.filter(el => !el.startsWith(filterValue))
        } else {
          filteredList = list.filter(el => !el.toLowerCase().startsWith(filterValue.toLowerCase()))
        }
        break
      }
    }
  }
}