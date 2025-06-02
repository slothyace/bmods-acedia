modVersion = "u.v1.0"
module.exports = {
  data: {
    name: "Map And Sort JSON Data"
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
      name: "Element Path",
      placeholder: "path.to.item"
    },
    {
      element: "input",
      storeAs: "defaultValue",
      name: "Default Value If Item Doesn't Exist",
    },
    "-",
    {
      element: "typedDropdown",
      storeAs: "sortType",
      name: "Sort By",
      choices: {
        numberInc: {name: "Numbers Increasing", field: false},
        numberDec: {name: "Numbers Decreasing", field: false},
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

    let originalData = bridge.get(values.data) || undefined
    let objectPath = bridge.transf(values.elementPath).trim()
    let defaultValue = bridge.transf(values.defaultValue)
    let sortType = bridge.transf(values.sortType.type)
    let returnAmount = bridge.transf(values.returnAmount.type)
    let returnType = bridge.transf(values.returnType.type)

    if (originalData == undefined){
      return console.error(`Please Provide Data!`)
    }

    if (objectPath.startsWith(".")){
      objectPath = objectPath.slice(1)
    }

    if (objectPath === "" || objectPath.includes("..") || objectPath.startsWith(".") || objectPath.endsWith(".")){
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

    let result
    if (typeof originalData === "object"){

      let sortedArray = Object.entries(originalData).map(([id, data])=>({
        id, data, sortValue: getValueByPath(data, objectPath)
      }))

      switch(sortType){
        case "numberInc":
          sortedArray.sort((a,b)=> {
            return (Number(b.sortValue)||0) - (Number(a.sortValue)||0)
          })
          break

        case "numberDec":
          sortedArray.sort((a,b)=> {
            return (Number(a.sortValue)||0) - (Number(b.sortValue)||0)
          })
          break

        case "alphabInc":
          sortedArray.sort((a,b)=> {
            return String(a.sortValue).localeCompare(String(b.sortValue))
          })
          break

        case "alphabDec":
          sortedArray.sort((a,b)=> {
            return String(b.sortValue).localeCompare(String(a.sortValue))
          })
          break
      }

      if (returnAmount === "topN"){
        sortedArray = sortedArray.slice(0, (Number(bridge.transf(values.returnAmount.value))||10))
      }

      result = {}
      for (let {id, data} of sortedArray){
        result[id] = data
      }
    } else {
      result = undefined
      return console.error(`Provided Data Is Not A Valid JSON Object.`)
    }

    if (returnType === "list"){
      result = Object.entries(result).map(([id, data])=>({
        id, data, sortValue: getValueByPath(data, objectPath)
      }))
    }

    bridge.store(values.sorted, result)
  }
}