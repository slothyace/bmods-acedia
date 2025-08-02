modVersion = "v1.0.0"
module.exports = {
  data: {
    name: "Modify Google Sheet"
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
              A Key File Would Be Better In This Case As Using A API Key Would Require The Sheet To Be Both Public And Editable.
            </div>`
          }
        ]
      }
    },
    "-",
    {
      element: "typedDropdown",
      storeAs: "amount",
      name: "Modification Count",
      choices: {
        single: {name: "Update 1 Cell", field:false},
        multi: {name: "Update Multiple Cells", field:false}
      }
    },
    {
      element: "",
      storeAs: "modifications",
      name: "Modifications",
      types: {
        modification: "modification",
      },
      max: 1000,
      UItypes: {
        modification: {
          data: {},
          name: "Modification",
          preview: "`${option.data.tab||'Sheet1'}!${option.data.cell||'A1'} -> ${option.data.newValue||'newValue'}`",
          UI: [
            {
              element: "input",
              storeAs: "tab",
              name: "Tab",
              placeholder: "Sheet1"
            },
            {
              element: "input",
              storeAs: "cell",
              name: "Cell",
              placeholder: "A1"
            },
            "-",
            {
              element: "largeInput",
              storeAs: "newValue",
              name: "New Value",
              placeholder: "newValue"
            },
          ],
        },
      },
    },
    {
      element: "",
      storeAs: "tab",
      name: "Tab",
      placeholder: "Sheet1"
    },
    {
      element: "",
      storeAs: "cell",
      name: "Cell",
      placeholder: "A1"
    },
    "-",
    {
      element: "",
      storeAs: "newValue",
      name: "New Value",
      placeholder: "New Value"
    },
    "-",
    {
      element: "store",
      storeAs: "result",
      name: "Store Update Response As"
    },
    "-",
    {
      element: "text",
      text: modVersion
    }
  ],

  script: (values) =>{
    function refElm(skipAnimation){
      let cellsToUpdate = values.data.amount.type

      if (cellsToUpdate == "single"){
        values.UI[4].element = ""
        values.UI[5].element = "input"
        values.UI[6].element = "input"
        values.UI[7].element = "-"
        values.UI[8].element = "largeInput"
      } else if(cellsToUpdate == "multi"){
        values.UI[4].element = "menu"
        values.UI[5].element = ""
        values.UI[6].element = ""
        values.UI[7].element = ""
        values.UI[8].element = ""
      }

      setTimeout(()=>{
        values.updateUI()
      }, skipAnimation?1: values.commonAnimation*100)
    }

    refElm(true)

    values.events.on("change", ()=>{
      refElm()
    })
  },

  subtitle: (values, constants, thisAction) =>{ // To use thisAction, constants must also be present
    let subtitle
    switch (values.amount.type){
      case "single":{
        subtitle = `Update Cell ${values.tab||"Sheet1"}!${values.cell||"A1"} To ${values.newValue} For Sheet: ${values.sheetLink}`
        break
      }

      case "multi":{
        subtitle = `Update ${values.modifications.length} Cells In Sheet ${values.sheetLink}`
        break
      }
    }

    return subtitle
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

    let amount = bridge.transf(values.amount.type)

    let updateData = []

    switch(amount){
      case "single":{
        let tab = bridge.transf(values.tab)
        let cell = bridge.transf(values.cell).split(":")[0].toUpperCase()
        let tabCell = `${tab}!${cell}`

        let updateSnippet = {
          range: tabCell,
          values: [[bridge.transf(values.newValue)]]
        }

        updateData.push(updateSnippet)
        break
      }

      case "multi":{
        for (let modification of values.modifications){
          let modificationData = modification.data

          let tab = bridge.transf(modificationData.tab)
          let cell = bridge.transf(modificationData.cell).split(":")[0].toUpperCase()

          let tabCell = `${tab}!${cell}`

          let updateSnippet = {
            range: tabCell,
            values: [[bridge.transf(modificationData.newValue)]]
          }

          updateData.push(updateSnippet)
        }
        break
      }
    }

    

    let sheets = google.sheets({
      version: "v4",
      auth: ggClient
    })

    let response = await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId,
      requestBody: {
        valueInputOption: "USER_ENTERED",
        data: updateData
      }
    })

    bridge.store(values.result, response.data)
  }
}