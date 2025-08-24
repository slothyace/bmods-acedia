// Switch To Project Dir If Running From BMD
const botData = require("../data.json")
const workingDir = path.normalize(process.cwd())
let projectFolder
if (workingDir.includes(path.join("common", "Bot Maker For Discord"))){
  projectFolder = botData.prjSrc
} else {projectFolder = workingDir}

// Checks If Something Is A JSON Object
function isJSON(testObject){
  return (testObject != undefined && typeof testObject === "object" && testObject.constructor === Object)
}