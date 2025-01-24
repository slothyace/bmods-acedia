modVersion = "s.v2.0"
module.exports = {
  data: {
    name: "Toggle"
  },
  aliases: [],
  info: {
    source: "https://github.com/slothyace/bmods-acedia/tree/main/QOLs",
    creator: "Acedia QOLs",
    donate: "https://ko-fi.com/slothyacedia",
  },
  category: "Control",
  modules: [],
  UI: [
    {
      element: "toggle",
      storeAs: "toggle",
      name: "Set Value",
      true: "True",
      false: "False"
    },
    {
      element: "actions",
      storeAs: "actions",
      name: "Run Actions",
      large: true
    },
    {
      element: "largeInput",
      storeAs: "comment",
      name: "Comments",
    },
    {
      element: "text",
      text: modVersion,
    }
  ],

  subtitle: (values, constants) =>{
    return `${values.comment}`
  },

  compatibility: ["Any"],

  async run(values, message, client, bridge){
    if (!!bridge.transf(values.toggle) == true){
      let promise = new Promise(async res => {
        await bridge.runner(values.actions)
        res()
      })
      promise.catch(err => console.log(err))
      await promise
    } else {
      // noop
    }
  }
}