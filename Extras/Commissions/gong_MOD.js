modVersion = "v1.0.0"
module.exports = {
  data: {
    name: "gong"
  },
  aliases: [],
  modules: ["fs", "path", "music-metadata"],
  category: "gong",
  info: {
    source: "https://github.com/slothyace/bmods-acedia/tree/main/Actions",
    creator: "Acedia",
    donate: "https://ko-fi.com/slothyacedia",
  },
  UI: [
    {
      element: "input",
      storeAs: "folderPath",
      name: "Folder Path",
    },
    "-",
    {
      element: "store",
      storeAs: "jsonData",
      name: "Store JSON As"
    },
    "-",
    {
      element: "text",
      text: modVersion
    }
  ],

  subtitle: (values, constants, thisAction) =>{ // To use thisAction, constants must also be present
    return `gong`
  },

  compatibility: ["Any"],

  async run(values, message, client, bridge){ // This is the exact order of things required, other orders will brick
    for (const moduleName of this.modules){
      await client.getMods().require(moduleName)
    }

    const fs = require("fs")
    const path = require("path")
    const mm = require("music-metadata")
    
    const botData = require("../data.json")
    const workingDir = path.normalize(process.cwd())
    let projectFolder
    if (workingDir.includes(path.join("common", "Bot Maker For Discord"))){
      projectFolder = botData.prjSrc
    } else {projectFolder = workingDir}

    let relativePath = bridge.transf(values.folderPath)

    let folderPath = path.join(projectFolder, relativePath)

    let jsonData = {}

    let files = fs.readdirSync(folderPath)

    for (let file of files){
      let filePath = path.join(folderPath, file)
      if (fs.lstatSync(filePath).isFile()){
        let metadata = await mm.parseFile(filePath)
        let duration = metadata.format.duration * 1000

        jsonData[file] = {
          name: file,
          relativePath: filePath.replace(projectFolder),
          duration
        }
      }
    }

    bridge.store(values.jsonData, jsonData)
  }
}