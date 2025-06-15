modVersion = "v1.0.2"
module.exports = {
  data: {
    name: "Start HTML Upload Webpage",
    host: "localhost",
    port: "3001",
  },
  aliases: [],
  modules: ["node:http","node:os","node:fs","node:path","node:url","node:crypto",],
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
    },
    {
      element: "input",
      storeAs: "port",
      name: "Port",
    },
    "-",
    {
      element: "input",
      storeAs: "storageFolder",
      name: "Store File In",
      placeholer: "/tempHtml"
    },
    "-",
    {
      element: "input",
      storeAs: "uploadPassword",
      name: "Password To Authorize Upload"
    },
    "-",
    {
      element: "text",
      text: modVersion
    }
  ],

  subtitle: (values, constants, thisAction) =>{ // To use thisAction, constants must also be present
    return `Create HTML View Site`
  },

  compatibility: ["Any"],

  async run(values, message, client, bridge){ // This is the exact order of things required, other orders will brick
    for (const moduleName of this.modules){
      await client.getMods().require(moduleName)
    }

    const http = require("node:http")
    const os = require("node:os")
    const path = require("node:path")
    const fs = require("node:fs")
    const crypto = require("node:crypto")
    const oceanic = require("oceanic.js")

    const host = bridge.transf(values.host) || "0.0.0.0"
    const port = parseInt(bridge.transf(values.port), 10) || 3000
    const uploadPassword = bridge.transf(values.uploadPassword) || `password`

    const botData = require("../data.json")
    const workingDir = path.normalize(process.cwd())
    let workingPath
    if (workingDir.includes(path.join("common", "Bot Maker For Discord"))) {
      workingPath = botData.prjSrc
    } else {
      workingPath = workingDir
    }
    let storageDir = bridge.transf(values.storageFolder) || `/tempHtml`

    let storageFolder = path.join(workingPath, storageDir)

    if (!fs.existsSync(storageFolder)) {
      fs.mkdirSync(storageFolder, { recursive: true })
    }

    const server = http.createServer((request, response)=>{
      let endPoint = request.url

      switch(endPoint){
        case "/upload":
          if (request.method == "POST" && request.headers["uploadpass"] == uploadPassword.trim()){
            let postBody = ""
            let fileLoc
            request.on("data", (dataChunk)=> (postBody += dataChunk))
            request.on("end", ()=>{
              let json = JSON.parse(postBody)
              let htmlContent = json.htmlContent
              htmlContent = Buffer.from(htmlContent, "base64").toString("utf-8")
              let fileHash = crypto.createHash("md5").update(htmlContent).digest("hex")
              let fileName = `${Date.now()}-${fileHash}`
              fileLoc = path.join(storageFolder, `${fileName}.html`)
              fs.writeFileSync(fileLoc, htmlContent, "utf-8")
              let returnUrl = `http://${host}:${port}/${fileName}`
              response.writeHead(200, {
                "content-type": "application/json"
              })
              response.end(JSON.stringify({success: true, url: returnUrl, fileName: `${storageDir}/${fileName}.html`}))
            })
          } else {
            response.writeHead(404)
            response.end(`Invalid Endpoint!`)
          }
          break

        default:
          let lookForFile = endPoint.replaceAll("/", "")
          if (fs.existsSync(path.join(storageFolder, `${lookForFile}.html`))){
            response.writeHead(200, {
              "content-type": "text/html"
            })
            fs.createReadStream(path.join(storageFolder, `${lookForFile}.html`)).pipe(response)
          } else {
            response.writeHead(404)
            response.end(`No File Found!`)
          }
          break
      }
    })

    server.listen(port, host, ()=>{
      console.log(`Upload Endpoint Started On /upload`)
    })
  }
}