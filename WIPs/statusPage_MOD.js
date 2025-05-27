modVersion = "u.v1.0"
module.exports = {
  data: {
    name: "Create Status Page",
    host: "0.0.0.0",
    port: "8080",
    historyCount: 60
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
    {
      element: "input",
      storeAs: "password",
      name: "Login Password (Optional)"
    },
    "-",
    {
      element: "input",
      storeAs: "historyCount",
      name: "History Count",
      placeholder: 60
    },
    {
      element: "input",
      storeAs: "interval",
      name: "Update Interval (In Seconds)",
      placeholder: 5
    },
    "-",
    {
      element: "menu",
      storeAs: "replacements",
      name: "HTML Content Replacements",
      types: {
        replacements: "replacements"
      },
      UItypes: {
        replacements:{
          data:{},
          name: "Replace",
          preview: "`${option.data.findText} with ${option.data.replaceText}",
          UI: [
            {
              element: "input",
              storeAs: "findText",
              name: "Find Text",
            },
            {
              element: "input",
              storeAs: "replaceText",
              name: "Replacement Text",
            },
          ],
        },
      },
    },
    "-",
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
    const historyCount = parseInt(bridge.transf(values.historyCount)) || 60
    const interval = parseInt(bridge.transf(values.interval))*1000 || 5000

    const botData = require("../data.json")
    const appName = botData.name || "NodeJS"
    const workingDir = path.normalize(process.cwd())

    let workingPath
    if (workingDir.includes(path.join("common", "Bot Maker For Discord"))){
      workingPath = botData.prjSrc
    } else {
      workingPath = workingDir
    }

    let htmlFilePath = path.join(workingPath, "statusPage", "index.html")
    let icoFilePath = path.join(workingPath, "statusPage", "bmd.ico")
    let statusPageDir = path.dirname(htmlFilePath)
    if (!fs.existsSync(statusPageDir)){
      fs.mkdirSync(statusPageDir, { recursive: true })
    }

    const siteFiles = {
      html: {github: `https://raw.githubusercontent.com/slothyace/bmods-acedia/refs/heads/main/.assets/statusPage/index.html`, path: htmlFilePath, name: `index.html`},
      ico: {github: `https://raw.githubusercontent.com/slothyace/bmods-acedia/refs/heads/main/.assets/statusPage/bmd.ico`, path: icoFilePath, name: `bmd.ico`}
    }
    for (let coreKey in siteFiles) {
      const file = siteFiles[coreKey];

      if (!fs.existsSync(file.path)) {
        console.log(`Missing "${file.name}" in ${statusPageDir}, downloading from GitHub.`);

        try {
          await new Promise((resolve, reject) => {
            https.get(file.github, (response) => {
              if (response.statusCode !== 200) {
                reject(new Error(`Failed to download "${file.name}" from GitHub. Status Code: ${response.statusCode}`));
                return;
              }

              const chunks = [];

              response.on("data", (chunk) => chunks.push(chunk));

              response.on("end", () => {
                try {
                  const data = Buffer.concat(chunks);
                  fs.writeFileSync(file.path, data); // No encoding specified so it works for binary too
                  console.log(`"${file.name}" downloaded from GitHub.`);
                  resolve();
                } catch (err) {
                  reject(err);
                }
              });
            }).on("error", (err) => {
              reject(err);
            });
          });
        } catch (err) {
          console.error(`Error while downloading "${file.name}" from GitHub:`, err);
        }
      }
    }
    
    let cpuHistory = []
    let memoryHistory = []
    let logHistory = []
    let dataHistory = []

    // Cpu Usage
    let lastCpuUsage = process.cpuUsage()
    let lastCpuTime = process.hrtime()
    function getProcessCpuPercent(){
      const currentCpu = process.cpuUsage(lastCpuUsage)
      const currentTime = process.hrtime(lastCpuTime)
      lastCpuUsage = process.cpuUsage()
      lastCpuTime = process.hrtime()
      const elapsedMicroSeconds = (currentTime[0]*1e6)+(currentTime[1]/1000)
      const totalCpuUsage = currentCpu.user + currentCpu.system
      return ((totalCpuUsage/elapsedMicroSeconds)*100).toFixed(2)
    }

    // Ram Usage
    function getProcessRamMb(){
      return (process.memoryUsage().heapUsed/(1024*1024)).toFixed(2)
    }

    function updateStats(){
      const cpuUsagePercent = getProcessCpuPercent()
      const ramUsageMb = getProcessRamMb()
      const timestamp = Date.now()
      if (dataHistory.length >= historyCount){
        dataHistory.shift()
      }
      dataHistory.push({timestamp, cpu: cpuUsagePercent, memory: ramUsageMb})
    }

    function createConsoleTimestamp (date = new Date()){
      const pad = (num)=> num.toString().padStart(2, "0")
      const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
      return `${pad(date.getDate())}-${months[date.getMonth()]}-${String(date.getFullYear()).slice(-2)}@${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
    }

    const originalConsoleError = console.error
    console.error = (...args)=>{
      const msg = args.join(" ")
      logHistory.push({msg, ts:createConsoleTimestamp(), error:true})
      if (logHistory.length > 100){
        logHistory.shift()
      }
      originalConsoleError(...args)
    }
    console.log =((original)=>(...args)=>{
      const msg = args.join(" ")
      logHistory.push({msg, ts:createConsoleTimestamp(), error:false})
      if (logHistory.length > 100){
        logHistory.shift()
      }
      original(...args)
    })(console.log)

    setInterval(updateStats, interval)
    updateStats()

    function checkAuthorization(request){
      if (!password){
        return true
      }
      const auth = request.headers.authorization
      if (!auth || !auth.startsWith("Basic ")){
        return false
      }
      const [user, pass] = Buffer.from(auth.split(" ")[1], "base64").toString().split(":")
      return pass === password
    }

    const server = http.createServer((request, response)=>{
      if(!checkAuthorization(request)){
        response.writeHead(401, {
          "www-authenticate": `Basic realm="Process Monitor"`
        })
        return response.end("Unauthorized")
      }

      let endPoint = request.url
      switch(endPoint){
        case "/bmd.ico":
          if (fs.existsSync(icoFilePath)){
            response.writeHead(200, {
              "content-type": "image/x-icon"
            })
            fs.createReadStream(icoFilePath).pipe(response)
          } else {
            response.writeHead(404)
            response.end("Favicon Not Found!")
          }
          break

        case "/monitor":
          response.writeHead(200, {
            "content-type": "text/html"
          })
          let htmlTemplate = fs.readFileSync(htmlFilePath, "utf-8")
          htmlTemplate = htmlTemplate.replaceAll(/\$\{appName\}/g, appName).replaceAll(/\$\{updateInterval\}/g, interval)
          for (let replacement of values.replacements){
            const find = bridge.transf(replacement.data.findText)
            const replace = bridge.transf(replacement.data.replaceText)
            htmlTemplate = htmlTemplate.replaceAll(find, replace)
          }
          response.end(htmlTemplate)
          break

        case "/raw":
          response.writeHead(200, {
            "content-type": "application/json"
          })
          response.end(JSON.stringify({
            data: dataHistory,
            uptime: process.uptime(),
            logs: logHistory
          }))
          break

        default:
          response.writeHead(404)
          response.end("Page Not Found!")
          break
      }
    })

    server.listen(port, host, ()=>{
      console.log(`Status Page Available At "http://user:${password}@${host}:${port}/monitor"`)
    })
  }
}