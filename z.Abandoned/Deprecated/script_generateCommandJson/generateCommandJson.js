const fs = require("node:fs")
const path = require("node:path")
const readline = require("node:readline")
const { exec } = require("node:child_process")
const { stdout, stderr } = require("node:process")
const { error } = require("node:console")

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

rl.question(`Drag the "data.json" file into this terminal: `, (inputPath)=>{
  inputPath = inputPath.replaceAll(`"`, "")

  if (path.basename(inputPath) !== "data.json"){
    console.error(`File isn't "data.json"!`)
    rl.close()
    return
  }

  let projectDir = path.dirname(inputPath)
  let rawData = fs.readFileSync(path.normalize(inputPath), "utf-8")
  let botData = JSON.parse(rawData)
  const commandsFolder = path.join(projectDir, botData.name)

  if(!fs.existsSync(commandsFolder)){
    fs.mkdirSync(commandsFolder, {recursive: true})
  }

  const commands = botData.commands
  commands.forEach(command =>{
    let commandFilePath = path.join(commandsFolder, `${command.name}.json`)
    fs.writeFileSync(commandFilePath, JSON.stringify(command, null, 2), "utf-8")
    console.log(`${commandFilePath} created...`)
  })

  console.log(`Converted All Commands Into Individual Json In ${commandsFolder}`)

  rl.question(`\nCompress To Zip? (y/n): `, (answer)=>{
    if(answer.trim().toLowerCase() == "y"){
      const zipFile = `${commandsFolder}.zip`
      const zipCommand = process.platform === 'win32'
        ? `powershell -command "Compress-Archive -Path '${commandsFolder}\\*' -DestinationPath '${zipFile}'"`
        : `zip -r "${zipFile}" "${path.basename(commandsFolder)}"`

      console.log(`Creating Zip...`)
      exec(zipCommand, {cwd: projectDir}, (error, stdout, stderr)=>{
        if (error){
          console.error(`Zip Creation Failed...`)
        } else {
          console.log(`Zip Creation Success: ${zipFile}`)
        }
        rl.close()
      })
    } else {
      console.log(`Skipping Zip Creation...`)
      rl.close()
    }
  })
})