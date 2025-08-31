const fs = require("node:fs")
const path = require("node:path")
const readline = require("node:readline")

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
})

function readAndPush(fileLocation, commands) {
  let rawCommandJson
  try {
    rawCommandJson = fs.readFileSync(fileLocation, "utf8")
  } catch {
    console.error(`Could not read file "${fileLocation}"`)
    return
  }

  let commandJson
  try {
    commandJson = JSON.parse(rawCommandJson)
  } catch {
    console.error(`The content inside "${fileLocation}" isn't valid JSON!`)
    return
  }

  if (Array.isArray(commandJson)) {
    commands.push(...commandJson)
  } else {
    commands.push(commandJson)
  }

  console.log(`Content inside "${fileLocation}" has been merged into "data.json"`)
}

rl.question(`Drag the "data.json" file into this terminal: `, (inputPath) => {
  inputPath = inputPath.replaceAll(`"`, "")

  if (path.basename(inputPath) !== "data.json") {
    console.error(`File isn't "data.json"!`)
    rl.close()
    return
  }

  let projectDir = path.dirname(inputPath)
  let rawData = fs.readFileSync(path.normalize(inputPath), "utf-8")
  let botData = JSON.parse(rawData)
  let commands = botData.commands

  let backupPath = path.join(projectDir, "backupdata.json")
  fs.writeFileSync(backupPath, JSON.stringify(botData, null, 2), "utf-8")
  console.log(`Backup created.`)
  console.log(`Bot data loaded.`)

  rl.question(`\nPlease drag the file / folder you're importing into this terminal: `, (question2Input) => {
    let location = question2Input.replaceAll(`"`, "")
    let stats

    try {
      stats = fs.statSync(location)
    } catch {
      console.error(`Path "${location}" does not exist.`)
      rl.close()
      return
    }

    if (stats.isDirectory()) {
      for (let file of fs.readdirSync(location)) {
        if (path.extname(file) !== ".json") {
          console.warn(`Skipping non-JSON file: ${file}`)
          continue
        }
        let fileLocation = path.join(location, file)
        readAndPush(fileLocation, commands)
      }
    } else if (stats.isFile()) {
      readAndPush(location, commands)
    } else {
      console.error(`"${location}" is neither a file nor a directory.`)
    }

    botData.commands = commands
    fs.writeFileSync(inputPath, JSON.stringify(botData, null, 2))
    console.log(`Commands merged in.`)
    rl.close()
  })
})
