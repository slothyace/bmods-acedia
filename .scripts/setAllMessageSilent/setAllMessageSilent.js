const fs = require("node:fs")
const path = require("node:path")
const readline = require("node:readline")

function setSilentTrue(obj) {
  if (Array.isArray(obj)) {
    obj.forEach(setSilentTrue)
  } else if (typeof obj === "object" && obj !== null) {
    if (obj.file === "sendmessage.js") {
      if (!obj.data) obj.data = {}
      obj.data.silent = true
    }
    for (const key in obj) {
      setSilentTrue(obj[key])
    }
  }
}

function modifyFile(filePath) {
  if (path.basename(filePath) !== "data.json") {
    console.error(`File Isn't "data.json"!`)
    return
  }

  try {
    const rawData = fs.readFileSync(path.normalize(filePath), "utf-8")
    const data = JSON.parse(rawData)

    setSilentTrue(data)

    const outputFilePath = path.join(
      path.dirname(filePath),
      "modified_" + path.basename(filePath)
    )

    fs.writeFileSync(outputFilePath, JSON.stringify(data, null, 2), "utf-8")
    console.log(`Modified File Saved As: ${outputFilePath}`)
  } catch (err) {
    console.error("Failed To Process The File:", err.message)
  }
}

// Always prompt user for the file path
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
})

rl.question(`Drag the "data.json" file into this terminal: `, (answer) => {
  const filePath = answer.trim().replaceAll(`"`, ``)
  modifyFile(filePath)
  rl.close()
})