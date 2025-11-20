modVersion = "v1.0.0"
module.exports = {
  data: {
    name: "Generate Canvas Progress Bar URL",
  },
  aliases: [],
  modules: ["canvas", "undici", "node:buffer"],
  category: "Acedia Commissions",
  info: {
    source: "https://github.com/slothyace/bmods-acedia/tree/main/Actions",
    creator: "Acedia",
    donate: "https://ko-fi.com/slothyacedia",
  },
  UI: [
    {
      element: "input",
      storeAs: "width",
      name: "Width",
    },
    {
      element: "input",
      storeAs: "height",
      name: "Height",
    },
    {
      element: "input",
      storeAs: "lineWidth",
      name: "Line Width",
    },
    {
      element: "typedDropdown",
      storeAs: "lineCap",
      name: "Line Cap",
      choices: {
        0: { name: "Square" },
        1: { name: "Round" },
      },
    },
    {
      element: "input",
      storeAs: "percent",
      name: "Percent",
    },
    {
      element: "input",
      storeAs: "color",
      name: "Color (Hex)",
    },
    "-",
    {
      element: "store",
      storeAs: "store",
      name: "Store URL As",
    },
    {
      element: "text",
      text: modVersion,
    },
  ],

  subtitle: (values, constants, thisAction) => {
    // To use thisAction, constants must also be present
    return ``
  },

  compatibility: ["Any"],

  async run(values, message, client, bridge) {
    // This is the exact order of things required, other orders will brick
    for (const moduleName of this.modules) {
      await client.getMods().require(moduleName)
    }

    const Canvas = require("canvas")
    const { FormData } = require("undici")
    const { Blob } = require("node:buffer")
    let progressBarBuffer
    try {
      const width = Math.max(1, parseInt(bridge.transf(values.width), 10))
      const height = Math.max(1, parseInt(bridge.transf(values.height), 10))
      const percent = Math.min(100, Math.max(0, parseFloat(bridge.transf(values.percent))))
      const lineWidth = Math.min(height, Math.max(1, parseInt(bridge.transf(values.lineWidth), 10)))
      const isRound = values.lineCap?.type === "1"

      const canvas = Canvas.createCanvas(width, height)
      const ctx = canvas.getContext("2d")

      // Clear canvas
      ctx.clearRect(0, 0, width, height)

      // Draw background track
      ctx.beginPath()
      ctx.strokeStyle = "#333333"
      ctx.lineWidth = lineWidth
      ctx.lineCap = isRound ? "round" : "butt"

      if (isRound) {
        const offset = lineWidth / 2
        ctx.moveTo(offset, height / 2)
        ctx.lineTo(width - offset, height / 2)
      } else {
        ctx.moveTo(0, height / 2)
        ctx.lineTo(width, height / 2)
      }
      ctx.stroke()

      // Draw progress
      ctx.beginPath()
      ctx.strokeStyle = bridge.transf(values.color) || "#ffffff"

      if (isRound) {
        const offset = lineWidth / 2
        ctx.moveTo(offset, height / 2)
        ctx.lineTo(offset + (width - lineWidth) * (percent / 100), height / 2)
      } else {
        ctx.moveTo(0, height / 2)
        ctx.lineTo(width * (percent / 100), height / 2)
      }
      ctx.stroke()

      progressBarBuffer = canvas.toBuffer("image/png")
    } catch (err) {
      return console.log("Canvas Generate Progress Bar Error:", err)
    }

    let catBoxApi = `https://catbox.moe/user/api.php`

    async function sendForm(form) {
      for (const [key, val] of form) {
        console.log(key, val)
      }
      const response = await fetch(catBoxApi, {
        method: "POST",
        body: form,
        headers: {
          "user-agent": "bmods/Acedia",
        },
      })
      const responseText = await response.text()
      if (!response.ok) {
        throw new Error(`Catbox API Error: ${responseText}`)
      }
      return responseText.trim()
    }

    function randomString(length) {
      const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
      let result = ""
      for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length))
      }
      return result
    }

    try {
      let form = new FormData()
      let fileName = `${Date.now()}Image-${randomString(16)}.png`
      form.append("reqtype", "fileupload")
      form.append("fileToUpload", new Blob([progressBarBuffer]), fileName)
      let result = await sendForm(form)
      bridge.store(values.store, result)
    } catch (err) {
      bridge.store(values.store, err.message)
    }
  },
}
