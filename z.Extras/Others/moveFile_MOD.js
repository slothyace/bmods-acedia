modVersion = "v1.0.0"
module.exports = {
  data: {
    name: "Move File"
  },
  aliases: ["Move File"],
  modules: ["node:path", "node:fs"],
  category: "Files",
  info: {
    source: "https://github.com/slothyace/bmods-acedia/tree/main/Actions",
    creator: "Acedia",
    donate: "https://ko-fi.com/slothyacedia",
  },
  UI: [
    {
      element: "input",
      storeAs: "originFileLocation",
      name: "Origin File Location",
    },
    {
      element: "input",
      storeAs: "destinationFolderLocation",
      name: "Destination Folder",
    },
    "-",
    {
      element: "typedDropdown",
      storeAs: "movement",
      name: "Movement Type",
      choices: {
        copy: {name: "Copy"},
        move: {name: "Move"},
      }
    },
    "-",
    {
      element: "text",
      text: modVersion
    }
  ],

  subtitle: (values, constants, thisAction) =>{ // To use thisAction, constants must also be present
    const titleCase = string => string.split(" ").map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(" ")
    return titleCase(`${values.movement.type} `) + `${values.originFileLocation} To ${values.destinationFolderLocation}`
  },

  compatibility: ["Any"],

  async run(values, message, client, bridge){ // This is the exact order of things required, other orders will brick
    for (const moduleName of this.modules){
      await client.getMods().require(moduleName)
    }
    
    const fs = require("node:fs")
    const path = require("node:path")
    let originFileLocation = bridge.transf(values.originFileLocation)
    let destinationFolderLocation = bridge.transf(values.destinationFolderLocation)
    let originFilePath
    let destinationFilePath
    if (originFileLocation.startsWith("/")){
      originFileLocation = "." + originFileLocation
    }

    if (path.isAbsolute(originFileLocation) == false){
      const botData = require("../data.json")
      const workingDir = path.normalize(process.cwd())
      let projectFolder
      if (workingDir.includes(path.join("common", "Bot Maker For Discord"))){
        projectFolder = botData.prjSrc
      } else {projectFolder = workingDir}
      originFilePath = path.join(projectFolder, originFileLocation)
    } else {
      originFilePath = path.normalize(originFileLocation)
    }

    let fileName = path.basename(originFilePath)

    if (path.isAbsolute(destinationFolderLocation) == false){
      const botData = require("../data.json")
      const workingDir = path.normalize(process.cwd())
      let projectFolder
      if (workingDir.includes(path.join("common", "Bot Maker For Discord"))){
        projectFolder = botData.prjSrc
      } else {projectFolder = workingDir}
      destinationFilePath = path.join(projectFolder, destinationFolderLocation, fileName)
    } else {
      destinationFilePath = path.join(destinationFolderLocation, fileName)
    }

    let destinationFolderPath = path.dirname(destinationFilePath)

    if(!fs.existsSync(destinationFolderPath)){
      fs.mkdirSync(destinationFolderPath)
    }

    fs.copyFileSync(originFilePath, destinationFilePath)
    if (values.movement.type == "move"){
      fs.unlinkSync(originFilePath)
    }
  }
}