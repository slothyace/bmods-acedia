modVersion = "v1.0.0"
module.exports = {
  data: {
    name: "Read Google Sheet"
  },
  aliases: [],
  modules: ["googleapis", "node:fs", "node:path"],
  category: "Google API",
  info: {
    source: "https://github.com/slothyace/bmods-acedia/tree/main/Actions",
    creator: "Acedia",
    donate: "https://ko-fi.com/slothyacedia",
  },
  UI: [
    {
      element: "input",
      storeAs: "sheetLink",
      name: "Link To Google Sheets",
      placeholder: "https://docs.google.com/spreadsheets/d/.../edit#gid=0"
    },
    {
      element: "typedDropdown",
      storeAs: "authType",
      name: "Authorize With",
      choices: {
        keyFile: {name: "Key File", field:true, placeholder:"path/to/keyfile.json"},
        apiKey: {name: "API Key", field:true, placeholder:"API Key"}
      }
    },
    "-",
    {
      element: "input",
      storeAs: "tab",
      name: "Tab",
      placeholder: "Sheet1"
    },
    {
      element: "input",
      storeAs: "range",
      name: "Range",
      placeholder: "A1:C3 or A1"
    },
    "-",
    {
      element: "toggle",
      storeAs: "parseResults",
      name: "Parse Results (Convert It To Matrix Form)",
    },
    {
      element: "store",
      storeAs: "result",
      name: "Store Result As"
    },
    "-",
    {
      element: "text",
      text: modVersion
    }
  ],

  subtitle: (values, constants, thisAction) =>{ // To use thisAction, constants must also be present
    return `Read ${values.range} From Sheet: ${values.sheetLink}`
  },

  compatibility: ["Any"],

  async run(values, message, client, bridge){ // This is the exact order of things required, other orders will brick
    for (const moduleName of this.modules){
      await client.getMods().require(moduleName)
    }

    const fs = require("node:fs")
    const path = require("node:path")
    const {google} = require("googleapis")
    
    let authType = bridge.transf(values.authType.type)

    let ggClient

    switch(authType){
      case "keyFile": {
        const botData = require("../data.json")
        const workingDir = path.normalize(process.cwd())
        let projectFolder
        if (workingDir.includes(path.join("common", "Bot Maker For Discord"))){
          projectFolder = botData.prjSrc
        } else {projectFolder = workingDir}

        let relativeKeyFilePath = bridge.transf(values.authType.value)
        let keyFilePath = path.join(projectFolder, relativeKeyFilePath)

        const auth = new google.auth.GoogleAuth({
          keyFile: keyFilePath,
          scopes: ['https://www.googleapis.com/auth/spreadsheets']
        })

        ggClient = await auth.getClient()
        break
      }

      case "apiKey": {
        ggClient = bridge.transf(values.authType.value)
      }
    }

    
    let sheetLink = bridge.transf(values.sheetLink)
    let tab = bridge.transf(values.tab).trim()
    let range = bridge.transf(values.range).trim().toUpperCase()
    if (!tab || !range){
      console.log(`A Tab And Range Is Needed!`)
      bridge.store(values.result, `A Tab And Range Is Needed!`)
    }
    let tabRange = `${tab}!${range}`
    let match = sheetLink.match(/\/d\/([a-zA-Z0-9-_]+)/)
    let spreadsheetId = match[1]

    let sheets = google.sheets({
      version: "v4",
      auth: ggClient
    })

    let response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range
    })

    let responseData = response.data.values
    let parsedText
    if (values.parseResults == true){
      parsedText = responseData.map(row => row.join(" | ")).join("\n")
    } else {
      parsedText = response.data.values
    }

    bridge.store(values.result, parsedText)
  }
}