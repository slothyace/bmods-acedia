modVersion = "s.v1.0"
module.exports = {
  data: {
    name: "Read Json File"
  },
  aliases: [],
  modules: ["node:path", "node:fs"],
  category: "JSON",
  info: {
    source: "https://github.com/slothyace/bmods-acedia/tree/main/Actions",
    creator: "Acedia",
    donate: "https://ko-fi.com/slothyacedia",
  },
  UI: [
    {
      element: "input",
      storeAs: "pathToJson",
      name: "Path To Json File",
      placeholder: "path/to/file.json"
    },
    {
      element: "store",
      storeAs: "jsonObject",
      name: "Store JSON Object As",
    },
    "-",
    {
      element: "text",
      text: modVersion
    }
  ],

  subtitle: (values, constants, thisAction) =>{ // To use thisAction, constants must also be present
    return `Store ${values.pathToJson} As JSON Object`
  },

  compatibility: ["Any"],

  async run(values, message, client, bridge){ // This is the exact order of things required, other orders will brick
    for (const moduleName of this.modules){
      await client.getMods().require(moduleName)
    }

    const path = require("node:path")
    const fs = bridge.fs

    const botData = require("../data.json")
    const workingDir = path.normalize(process.cwd())
    let projectFolder
    if (workingDir.includes(path.join("common", "Bot Maker For Discord"))){
      projectFolder = botData.prjSrc
    } else {projectFolder = workingDir}

    let pathToJson = path.normalize(bridge.transf(values.pathToJson))

    let fullPath = path.join(path.normalize(projectFolder), pathToJson)
    if (!fs.existsSync(fullPath)){
      return console.error(`File ${fullPath} Doesn't Exist!`)
    }

    const originalFileContent = fs.readFileSync(fullPath, "utf8")
    let jsonObject
    try {
      jsonObject = JSON.parse(originalFileContent)
    } catch (err){
      return console.error(`Invalid Original JSON Content: ${err.message}`)
      jsonObject = {}
    }

    bridge.store(values.jsonObject, jsonObject)
  }
}