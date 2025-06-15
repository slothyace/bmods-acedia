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
      element: "actions",
      storeAs: "actionSet1",
      name: "Action Set 1"
    },
    "-",
    {
      element: "actions",
      storeAs: "actionSet2",
      name: "Action Set 2"
    },
    "-",
    {
      element: "text",
      text: modVersion
    },
  ],

  subtitle: (values, constants, thisAction) =>{ // To use thisAction, constants must also be present
    return `Create Race Condition`
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

    try{
      await Promise.race([
        runWithCancel(values.actionSet1),
        runWithCancel(values.actionSet2)
      ])
      cancelled = true
    } catch (err){console.log(err)}
  }
}