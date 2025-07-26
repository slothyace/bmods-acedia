modVersion = "v1.0.0"
module.exports = {
  data: {
    name: "Extract Audio File Info"
  },
  aliases: [],
  modules: ["node:fs", "node:path", "music-metadata"],
  category: "Files",
  info: {
    source: "https://github.com/slothyace/bmods-acedia/tree/main/Actions",
    creator: "Acedia",
    donate: "https://ko-fi.com/slothyacedia",
  },
  UI: [
    {
      element: "input",
      storeAs: "filePath",
      name: "File Path",
    },
    "-",
    {
      element: ""
    }
    {
      element: "text",
      text: modVersion
    }
  ],

  subtitle: (values, constants, thisAction) =>{ // To use thisAction, constants must also be present
    return ``
  },

  compatibility: ["Any"],

  async run(values, message, client, bridge){ // This is the exact order of things required, other orders will brick
    for (const moduleName of this.modules){
      await client.getMods().require(moduleName)
    }

    
  }
}