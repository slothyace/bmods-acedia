modVersion = "u.v1.0"
module.exports = {
  data: {
    name: "Create Status Page",
    host: "localhost",
    port: "19739"
  },
  aliases: [],
  modules: ["node:http", "node:os", "node:fs", "node:path", "node:url"],
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
      placeholder: "localhost"
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
    const os = require("node:os")
    const host = bridge.transf(values.host) || "localhost"
    const port = parseInt(bridge.transf(values.port), 10) || 19739
    const password = bridge.transf(values.password) || ""
    const botData = require("../data.json")
    const appName = botData.name || "NodeJS"

    const maxPoints = 300
    const cpuHistory = []
    const memHistory = []
    const logHistory = []

    let lastCPUUsage = process.cpuUsage()
    let lastTime = process.hrtime()

    function getProcessCPUPercent() {
      const currentCPU = process.cpuUsage(lastCPUUsage)
      lastCPUUsage = process.cpuUsage()
      const currentTime = process.hrtime(lastTime)
      lastTime = process.hrtime()
      const elapsedMicroSec = (currentTime[0] * 1e6) + (currentTime[1] / 1000)
      return ((currentCPU.user + currentCPU.system) / elapsedMicroSec) * 100 || 0
    }

    function updateStats() {
      const cpuPercent = getProcessCPUPercent()
      const memMB = process.memoryUsage().heapUsed / (1024 * 1024)
      if (cpuHistory.length >= maxPoints) cpuHistory.shift()
      if (memHistory.length >= maxPoints) memHistory.shift()
      cpuHistory.push(cpuPercent)
      memHistory.push(memMB)
    }

    function formatDate(d = new Date()) {
      const pad = (n) => n.toString().padStart(2, "0")
      const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
      return `${pad(d.getDate())}-${months[d.getMonth()]}-${String(d.getFullYear()).slice(-2)}@${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
    }

    const originalConsoleError = console.error
    console.error = (...args) => {
      const msg = args.join(" ")
      logHistory.push({ msg, ts: formatDate(), error: true })
      if (logHistory.length > 100) logHistory.shift()
      originalConsoleError(...args)
    }

    console.log = ((orig) => (...args) => {
      const msg = args.join(" ")
      logHistory.push({ msg, ts: formatDate(), error: false })
      if (logHistory.length > 100) logHistory.shift()
      orig(...args)
    })(console.log)

    setInterval(updateStats, 1000)
    updateStats()

    function checkAuth(req) {
      if (!password) return true
      const auth = req.headers.authorization
      if (!auth || !auth.startsWith("Basic ")) return false
      const [user, pass] = Buffer.from(auth.split(" ")[1], "base64").toString().split(":")
      return pass === password
    }

    const server = http.createServer((req, res) => {
      if (!checkAuth(req)) {
        res.writeHead(401, { "WWW-Authenticate": 'Basic realm="Process Monitor"' })
        return res.end("Unauthorized")
      }

      if (req.url === "/monitor") {
        res.writeHead(200, { "Content-Type": "text/html" })
        
      } else if (req.url === "/monitor/stats") {
        res.writeHead(200, { "Content-Type": "application/json" })
        res.end(JSON.stringify({
          cpu: cpuHistory,
          mem: memHistory,
          uptime: process.uptime(),
          logs: logHistory
        }))
      } else {
        res.writeHead(404)
        res.end("Not Found")
      }
    })

    server.listen(port, host, () => {
      console.log(`Process Monitor running at http://user:password@${host}:${port}/monitor`)
    })
  }
}