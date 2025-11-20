modVersion = "v1.0.0"
module.exports = {
  data: {
    name: "Generate Multiple Random Numbers",
  },
  aliases: [],
  modules: [],
  category: "Numbers",
  info: {
    source: "https://github.com/slothyace/bmods-acedia/tree/main/Actions",
    creator: "Acedia",
    donate: "https://ko-fi.com/slothyacedia",
  },
  UI: [
    {
      element: "menu",
      storeAs: "randomNumbers",
      name: "Random Numbers",
      types: {
        random: "random",
      },
      max: 250,
      UITypes: {
        random: {
          data: {},
          name: "Random Number",
          preview: "`Between ${option.data.min} - ${option.data.max}`",
          UI: [
            {
              element: "inputGroup",
              storeAs: ["min", "max"],
              nameSchemes: ["Minimum", "Maximum"],
            },
            "-",
            {
              element: "store",
              storeAs: "store",
              name: "Store Random Number As",
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
    return `Generate ${values.randomNumbers.length} Random Numbers`
  },

  compatibility: ["Any"],

  async run(values, message, client, bridge) {
    // This is the exact order of things required, other orders will brick
    for (const moduleName of this.modules) {
      await client.getMods().require(moduleName)
    }

    for (let entry of values.randomNumbers) {
      let entryData = entry.data
      let min = Number(bridge.transf(entryData.min))
      let max = Number(bridge.transf(entryData.max))
      if (isNaN(min) || isNaN(max)) {
        continue
      }

      let low = Math.min(min, max)
      let high = Math.max(min, max)

      let randomNumber = Math.floor(Math.random() * (high - low + 1)) + low
      bridge.store(entryData.store, randomNumber)
    }
  },
}
