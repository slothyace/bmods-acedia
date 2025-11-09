modVersion = "v1.0.0"
module.exports = {
  data: {
    name: "Methods"
  },
  aliases: [],
  modules: [],
  category: "Extensions",
  info: {
    source: "https://github.com/slothyace/bmods-acedia/tree/main/Actions",
    creator: "Acedia",
    donate: "https://ko-fi.com/slothyacedia",
  },
  UI: [
    {
      element: "text",
      text: "" 
    },
    "-",
    {
      element: "text",
      text: modVersion
    }
  ],

  subtitle: (values, constants, thisAction) =>{ // To use thisAction, constants must also be present
    return `The Methods Extension Is Activated On Startup`
  },

  startup: (bridge) => {
    const loremIpsumText = `Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.

    Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt. Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, sed quia non numquam eius modi tempora incidunt ut labore et dolore magnam aliquam quaerat voluptatem. Ut enim ad minima veniam, quis nostrum exercitationem ullam corporis suscipit laboriosam, nisi ut aliquid ex ea commodi consequatur? Quis autem vel eum iure reprehenderit qui in ea voluptate velit esse quam nihil molestiae consequatur, vel illum qui dolorem eum fugiat quo voluptas nulla pariatur?`

    let titleCase = string => string.split(" ").map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(" ")

    let randInt = (min, max) => {
      let lower = Math.min(parseInt(min), parseInt(max))
      let upper = Math.max(parseInt(min), parseInt(max))
      return Math.floor(Math.random() * (upper - lower + 1)) + lower
    }

    let loremIpsum = (length) => {
      let words = loremIpsumText.split(/\s+/)
      return Array.from({length}, (_, i) => words[i%words.length]).join(" ")
    }

    bridge.methods = {
      titleCase,
      randInt,
      loremIpsum
    }
    console.log(`Methods Initiated`, bridge)
  },

  compatibility: ["Any"],

  async run(values, message, client, bridge){ // This is the exact order of things required, other orders will brick
    for (const moduleName of this.modules){
      await client.getMods().require(moduleName)
    }
    
  }
}