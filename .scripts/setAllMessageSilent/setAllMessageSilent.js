const fs = require("fs")
const path = require("path")
const readline = require("readline")

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

function modifyFile(filePath){
  const baseName = path.basename(filePath)
  if (baseName !== "data.json") {
    console.error("❌ The file must be named exactly 'data.json'.")
    return
  }
  
  try {
    const rawData = fs.readFileSync(filePath, "utf8")
    const data = JSON.parse(rawData)

    setSilentTrue(data)

    const outputFilePath = path.join(
      path.dirname(filePath),
      "modified_" + path.basename(filePath)
    )

    fs.writeFileSync(outputFilePath, JSON.stringify(data, null, 2))
    console.log(`✅ Modified file saved as: ${outputFilePath}`)
  } catch (err) {
    console.error("❌ Failed to process the file:", err.message)
  }
}

// Get the input file path from the command-line args
const inputFilePath = process.argv[2]

if (inputFilePath) {
  modifyFile(inputFilePath)
} else {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  })

  rl.question("📝 Enter the path to the JSON file: ", (answer) => {
    rl.close()
    modifyFile(answer.trim())
  })
}