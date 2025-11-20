modVersion = "v1.0.0"
module.exports = {
  data: {
    name: "Get Multiple Data Elements",
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
      storeAs: "dataInput",
      name: "Data",
    },
    "_",
    {
      element: "menu",
      storeAs: "keys",
      name: "Data Key",
      types: {
        key: "key",
      },
      max: 250,
      UItypes: {
        key: {
          data: {},
          name: "Key",
          preview: "`${option.data.key}`",
          UI: [
            {
              element: "input",
              storeAs: "key",
              name: "Key",
            },
            "-",
            {
              element: "store",
              storeAs: "store",
              name: "Store Data Value As",
            },
          ],
        },
      },
    },
    "-",
    {
      element: "text",
      text: modVersion,
    },
  ],

  subtitle: (values, constants, thisAction) => {
    // To use thisAction, constants must also be present
    return `Get ${values.keys.length} Data Elements`
  },

  compatibility: ["Any"],

  async run(values, message, client, bridge) {
    // This is the exact order of things required, other orders will brick
    for (const moduleName of this.modules) {
      await client.getMods().require(moduleName)
    }

    let dataInput = bridge.get(values.dataInput)

    for (let key of values.keys) {
      let keyData = key.data
      let keyValue = dataInput[keyData.key]
      bridge.store(keyData.store, keyValue)
    }
  },
}
