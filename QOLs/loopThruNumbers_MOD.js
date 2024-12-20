//Im just adding this to spite rat kekw

module.exports = {
  data: {
    name: "Loop Through Numbers"
  },
  info: {
  source: "https://github.com/slothyace/bmods-acedia/tree/main/QOLs",
  creator: "Acedia QOLs",
  donate: "https://ko-fi.com/slothyacedia",
  },
  category: "Loops",
  modules: [],
  UI: [
    {
      element: "inputGroup",
      storeAs: ["startAt", "endAt", "increment"],
      placeholder: ["1", "100", "1"],
      name: ["Start At", "End At", "Increment"],
    },
    {
      element: "store",
      storeAs: "iterationVal",
      name: "Store Iteration Value As"
    },
    {
      element: "actions",
      storeAs: "runActions",
      name: "Run Actions At Each Increment"
    },
    "-",
    {
      element: "toggle",
      storeAs: "await",
      name: "Wait For Each Iteration To Finish"
    }
  ],

  subtitle: (values) => {
    return `Loop through ${values.startAt} - ${values.endAt} in ${values.increment} increments.`
  },

  compatibility: ["Any"],

  async run(values, message, client, bridge){
    let startNum = bridge.transf(values.startAt)
    let endNum = bridge.transf(values.endAt)
    let increment = bridge.transf(values.increment)

    for (let start = startNum; start <= endNum; start += increment){
      bridge.store(values.iterationVal, start)

      if (values.await == true){
        await bridge.runner(values.runActions, message, client, bridge.variables)
      } else {
        bridge.runner(values.runActions, message, client, bridge.variables)
      }
    }
  }
}