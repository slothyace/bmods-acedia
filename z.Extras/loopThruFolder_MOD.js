modVersion = "v1.0.2"
module.exports = {
  data: {
    name: "Loop Thru Files In Folder"
  },
  aliases: [],
  modules: ["node:fs", "node:path"],
  category: "Files",
  info: {
    source: "https://github.com/slothyace/bmods-acedia/tree/main/Actions",
    creator: "Acedia",
    donate: "https://ko-fi.com/slothyacedia",
  },
  UI: [
    {
      element: "input",
      storeAs: "folderPath",
      name: "Folder Path"
    },
    {
      element: "input",
      storeAs: "extensionFilter",
      name: "Extension Filter",
      placeholder: ".mp3"
    },
    "-",
    {
      element: "store",
      storeAs: "fileName",
      name: "Store File Name As"
    },
    {
      element: "store",
      storeAs: "relativePath",
      name: "Store Relative Path As",
    },
    "-",
    {
      element: "actions",
      storeAs: "actions",
      name: "Actions"
    },
    "-",
    {
      element: "text",
      text: modVersion
    }
  ],

  subtitle: (values, constants, thisAction) =>{ // To use thisAction, constants must also be present
    return `Loop Thru ${values.folderPath.startsWith("/") ? values.folderPath : "/${values.folderPath}"}`
  },

  compatibility: ["Any"],

  async run(values, message, client, bridge){ // This is the exact order of things required, other orders will brick
    for (const moduleName of this.modules){
      await client.getMods().require(moduleName)
    }

    const fs = require("node:fs")
    const path = require("node:path")

    const botData = require("../data.json")
    const workingDir = path.normalize(process.cwd())
    let projectFolder
    if (workingDir.includes(path.join("common", "Bot Maker For Discord"))){
      projectFolder = botData.prjSrc
    } else {projectFolder = workingDir}

    let relativeFolder = bridge.transf(values.folderPath)

    let folderPath = path.join(projectFolder, relativeFolder)

    if (!fs.existsSync(folderPath)){
      fs.mkdirSync(folderPath, { recursive: true })
    }

    let files = fs.readdirSync(folderPath)

    let extensionFilter = bridge.transf(values.extensionFilter) || ".*"
    if (!extensionFilter.startsWith(".")){
      extensionFilter = `.${extensionFilter}`
    }

    if (extensionFilter !== ".*"){
      files = files.filter(file => file.toLowerCase().endsWith(extensionFilter.toLowerCase()))
    }

    for(let file of files){
      let fullPath = path.join(folderPath, file)
      let storedRelativePath = fullPath.replace(projectFolder, "")
      let fileName = path.basename(fullPath)
      bridge.store(values.fileName, fileName)
      bridge.store(values.relativePath, storedRelativePath)
      await bridge.runner(values.actions, message, client, bridge.variables)
    }
  }
}