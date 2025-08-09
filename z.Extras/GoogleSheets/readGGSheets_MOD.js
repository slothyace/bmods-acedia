modVersion = "v1.0.1"
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
      },
      help: {
        title: "Which To Use",
        UI:[
          {
            element: "text",
            text: `<div style="font-size:20px">
              A Key File Would Be Better In This Case As Using A API Key Would Require The Sheet To Be Public.<br></br>
              Set The Sheet Permissions To Allow Anyone With The Link To View The Sheet.
            </div>`
          }
        ]
      }
    },
    "-",
    {
      element: "menu",
      storeAs: "rangeList",
      name: "Ranges",
      types: {
        range: "range",
      },
      max: 1000,
      UItypes: {
        range: {
          data: {},
          name: "Range",
          preview: "`${option.data.tab + '!'||'Sheet1!'}${option.data.cellRange||'A1'}`",
          UI: [
            {
              element: "input",
              storeAs: "tab",
              name: "Tab",
              placeholder: "Sheet1"
            },
            {
              element: "input",
              storeAs: "cellRange",
              name: "Cell",
              placeholder: "A1 or A1:C3"
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
              name: "Store Range Result As"
            }
          ]
        }
      }
    },
    "-",
    {
      element: "text",
      text: modVersion
    }
  ],

  subtitle: (values, constants, thisAction) =>{ // To use thisAction, constants must also be present
    return `Read ${values.ranges.length} Range(s) From Sheet: ${values.sheetLink}`
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
    let match = sheetLink.match(/\/d\/([a-zA-Z0-9-_]+)/)
    let spreadsheetId = match[1]


    let sheets = google.sheets({
      version: "v4",
      auth: ggClient
    })

    let rangeList = []
    let rangeMap = {}

    for (let range of values.rangeList){
      let rangeData = range.data
      let tab = bridge.transf(rangeData.tab).trim()
      let cellRange = bridge.transf(rangeData.cellRange).trim().toUpperCase()
      if (!tab || !cellRange) continue

      let rangeString = `${tab}!${cellRange}`
      rangeList.push(rangeString)
      rangeMap[rangeString] = {
        parseResults: rangeData.parseResults,
        result: rangeData.result
      }
    }

    let batchResponse = await sheets.spreadsheets.values.batchGet({
      spreadsheetId,
      ranges: rangeList
    })

    for (let rangeResult of batchResponse.data.valueRanges){
      let rangeId = rangeResult.range
      let rowData = rangeResult.values || []

      let meta = rangeMap[rangeId]
      let parsedText

      if (meta.parseResults){
        parsedText = rowData.map(row => row.join(" | ")).join("\n")
      } else {
        parsedText = rowData
      }

      bridge.store(meta.result, parsedText)
    }
  }
}