modVersion = "u.v1.0"
module.exports = {
  data: {
    name: "Create Status Page",
    host: "0.0.0.0",
    port: "8080"
  },
  aliases: [],
  modules: ["node:http", "node:os", "node:fs", "node:path", "node:url", "node:https"],
  category: "Utilities",
  info: {
    source: "https://github.com/slothyace/bmods-acedia/tree/main/Actions",
    creator: "Acedia",
    donate: "https://ko-fi.com/slothyacedia",
  },
  UI: [
    {
      element: "input",
      storeAs: "host",
      name: "Host",
      placeholder: "0.0.0.0 (Available On Local Network)"
    },
    {
      element: "input",
      storeAs: "port",
      name: "Port"
    },
    "-",
    {
      element: "input",
      storeAs: "password",
      name: "Login Password (Optional)"
    },
    {
      element: "text",
      text: modVersion
    }
  ],

  subtitle: (values, constants, thisAction) =>{ // To use thisAction, constants must also be present
    return `Create Status Page View On ${values.host}:${values.port}`
  },

  compatibility: ["Any"],

  async run(values, message, client, bridge){ // This is the exact order of things required, other orders will brick
    for (const moduleName of this.modules){
      await client.getMods().require(moduleName)
    }

    const http = require("node:http")
    const https = require("node:https")
    const os = require("node:os")
    const path = require("node:path")
    const fs = require("node:fs")

    const host = bridge.transf(values.host) || "0.0.0.0"
    const port = parseInt(bridge.transf(values.port), 10) || 8080
    const password = bridge.transf(values.password) || "password"

    const botData = require("../data.json")
    const appName = botData.name || "NodeJS"
    const workingDir = path.normalize(process.cwd())

    let workingPath
    if (workingDir.includes(path.join("common", "Bot Maker For Discord"))){
      workingPath = botData.prjSrc
    } else {
      workingPath = workingDir
    }

    let webUiHtmlFile = path.join(workingPath, "webUI", "monitor.html")
    let webUiDir = path.dirname(webUiHtmlFile)
    if (!fs.existsSync(webUiDir)){
      fs.mkdirSync(webUiDir, { recursive: true })
    }

    let coreHtmlUrl = `https://raw.githubusercontent.com/slothyace/bmods-acedia/refs/heads/main/.assets/webUi/monitor.html`
    if (!fs.existsSync(webUiHtmlFile)){
      try{
        await new Promise((resolve, reject)=>{
          https.get(coreHtmlUrl, (response)=>{
            if(response.statusCode !== 200){
              reject(new Error(`Failed to download "monitor.html" from GitHub. Status Code: ${response.statusCode}`))
              return
            }

            let data = ""
            response.on("data", chunk => data += chunk)
            response.on("end", ()=>{
              try{
                fs.writeFileSync(webUiHtmlFile, data, "utf-8")
                console.log(`"monitor.html" downloaded from GitHub.`)
                resolve()
              } catch (err){
                reject(err)
              }
            })
          }).on("error", (err)=>{
            reject(err)
          })
        })
      } catch (err){
        console.error(`Error while downloading "monitor.html" from GitHub:`, err)
      }
    }


  }
}