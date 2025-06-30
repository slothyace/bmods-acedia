modVersion = "v1.0.6"
module.exports = {
  data: {
    name: "Map And Sort Object Data"
  },
  aliases: [],
  modules: [],
  category: "Data",
  info: {
    source: "https://github.com/slothyace/bmods-acedia/tree/main/Actions",
    creator: "Acedia",
    donate: "https://ko-fi.com/slothyacedia",
  },
  UI: [
    {
      element: "variable",
      storeAs: "data",
      name: "JSON Data",
    },
    "-",
    {
      element: "input",
      storeAs: "elementPath",
      name: "Path To Comparison Value",
      placeholder: "path.to.value"
    },
    {
      element: "input",
      storeAs: "defaultValue",
      name: "Default Value",
    },
    "-",
    {
      element: "typedDropdown",
      storeAs: "sortType",
      name: "Sort By",
      choices: {
        numberInc: {name: "Numbers Increasing 0 -> 9", field: false},
        numberDec: {name: "Numbers Decreasing 9 -> 0", field: false},
        alphabInc: {name: "Alphabet A -> Z", field: false},
        alphabDec: {name: "Alphabet Z -> A", field: false},
      },
    },
    "-",
    {
      element: "typedDropdown",
      storeAs: "returnAmount",
      name: "Store Amount",
      choices: {
        all: {name: "All", field: false},
        topN: {name: "Top #", field: true, placeholder: 10},
      },
    },
    {
      element: "typedDropdown",
      storeAs: "returnType",
      name: "Return Sorted JSON Data As",
      choices: {
        json: {name: "JSON Object", field: false},
        list: {name: "List", field: false}
      }
    },
    "-",
    {
      element: "store",
      storeAs: "sorted",
      name: "Store As",
    },
    "-",
    {
      element: "text",
      text: modVersion
    },
  ],

  subtitle: (values, constants, thisAction) =>{ // To use thisAction, constants must also be present
    return `Map And Sort Data ${values.data.type}(${values.data.value})`
  },

  compatibility: ["Any"],

  async run(values, message, client, bridge){ // This is the exact order of things required, other orders will brick
    for (const moduleName of this.modules){
      await client.getMods().require(moduleName)
    }

    let dataObject = bridge.get(values.data) || undefined
    let objectPath = bridge.transf(values.elementPath).trim()
    let defaultValue = bridge.transf(values.defaultValue)
    let sortType = bridge.transf(values.sortType.type)
    let returnAmount = bridge.transf(values.returnAmount.type)
    let returnType = bridge.transf(values.returnType.type)

    if (dataObject == undefined){
      return console.error(`Please Provide Data!`)
    }

    if (objectPath.startsWith(".")){
      objectPath = objectPath.slice(1)
    }

    if (
      objectPath === "" || 
      objectPath.includes("..") || 
      objectPath.startsWith(".") || 
      objectPath.endsWith(".")
    ){
      return console.error(`Invalid Path: "${objectPath}"`)
    }

    const getValueByPath = (object, path) =>{
      let objectValue = path.split(".").reduce((acc, key)=>acc?.[key], object)
      if (objectValue === undefined){
        return defaultValue
      } else {
        return objectValue
      }
    }
    
    if (typeof dataObject !== "object"){
      return console.error(`Provided Data Is Not A Valid JSON Object.`)
    }

    let objectArray = Object.entries(dataObject).map(([id, data])=>({
      id, data, sortValue: getValueByPath(data, objectPath)
    }))

    switch(sortType){
      case "numberInc":
        objectArray.sort((a,b)=> {
          return (Number(a.sortValue)||0) - (Number(b.sortValue)||0)
        })
        break

      case "numberDec":
        objectArray.sort((a,b)=> {
          return (Number(b.sortValue)||0) - (Number(a.sortValue)||0)
        })
        break

      case "alphabInc":
        objectArray.sort((a,b)=> {
          return String(a.sortValue).localeCompare(String(b.sortValue))
        })
        break

      case "alphabDec":
        objectArray.sort((a,b)=> {
          return String(b.sortValue).localeCompare(String(a.sortValue))
        })
        break
    }

    if (returnAmount === "topN"){
      objectArray = objectArray.slice(0, (Number(bridge.transf(values.returnAmount.value))||10))
    }

    let result
    switch (returnType){
      case "list":
        result = objectArray
        break

      case "json":
        result = {}
        for (let object of objectArray){
          result[object.id] = object.data
        }
        break
    }

    bridge.store(values.sorted, result)
  }
}