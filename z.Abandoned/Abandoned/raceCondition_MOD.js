modVersion = "v1.0.0"
module.exports = {
  data: {
    name: "Race Condition"
  },
  aliases: ["Action Race"],
  modules: [],
  category: "Utilities",
  info: {
    source: "https://github.com/slothyace/bmods-acedia/tree/main/Actions",
    creator: "Acedia",
    donate: "https://ko-fi.com/slothyacedia",
  },
  UI: [
    {
      element: "menu",
      storeAs: "races",
      name: "Races",
      types: {
        races: "races"
      },
      max: 1000,
      UItypes: {
        races: {
          name: "Action Set",
          preview: "`${option.data.label || ''}`",
          UI: [
            {
              element: "input",
              storeAs: "label",
              name: "Label"
            },
            {
              element: "actions",
              storeAs: "actionSet",
              name: "Actions"
            },
          ]
        }
      }
    },
    "-",
    {
      element: "text",
      text: modVersion
    },
  ],

  subtitle: (values, constants, thisAction) =>{ // To use thisAction, constants must also be present
    return `Create ${values.races.length} Race Condition(s)`
  },

  compatibility: ["Any"],

  async run(values, message, client, bridge){ // This is the exact order of things required, other orders will brick
    for (const moduleName of this.modules){
      await client.getMods().require(moduleName)
    }

    let cancelled = false
    const runWithCancel = async(actionSet)=>{
      for (const action of actionSet){
        if (cancelled == true){
          break
        } else {
          await bridge.runner([action], message, client, bridge.variables)
        }
      }
    }

    let actionSets = values.races.map(race => race.data.actionSet)
    if (actionSets.length < 2){
      return console.log(`You Need Minimum 2 Sets Of Actions To Race Them!`)
    }

    try{
      await Promise.race(actionSets.map(set => runWithCancel(set)))
      cancelled = true
    } catch (err){console.log(err)}
  }
}