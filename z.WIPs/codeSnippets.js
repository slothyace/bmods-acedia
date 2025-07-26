const botData = require("../data.json")
const workingDir = path.normalize(process.cwd())
let projectFolder
if (workingDir.includes(path.join("common", "Bot Maker For Discord"))){
  projectFolder = botData.prjSrc
} else {projectFolder = workingDir}