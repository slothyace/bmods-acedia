modVersion = "v1.1.0"
module.exports = {
  data: {
    name: "Catbox.moe",
  },
  aliases: [],
  modules: ["node:fs", "node:path", "node:buffer", "undici"],
  category: "WebAPIs",
  info: {
    source: "https://github.com/slothyace/bmods-acedia/tree/main/Actions",
    creator: "Acedia",
    donate: "https://ko-fi.com/slothyacedia",
  },
  UI: [
    {
      element: "input",
      storeAs: "userHash",
      name: "User Hash",
      help: {
        title: "What Is User Hash For?",
        UI: [
          {
            element: "text",
            text: `
            User hash is needed if you want to keep track of what has been uploaded to your account.<br>
            This lets you delete the file if needed.
            `,
          },
        ],
      },
    },
    "-",
    {
      element: "typedDropdown",
      storeAs: "action",
      name: "Action (Read The Help Section First!)",
      choices: {
        uploadFile: { name: "Upload File", field: true, placeholder: "path/to/file.ext" },
        uploadUrl: { name: "Upload URL", field: true, placeholder: "http://example.com/url" },
        uploadBuffer: { name: "Upload Buffer", field: true, placeholder: "fileName.ext" },
        deleteFile: { name: "Delete File(s)", field: true, placeholder: "fileName.ext" },
      },
      help: {
        title: "What To Fill The Field With",
        UI: [
          {
            element: "text",
            text: `
            Upload File: The Path To The File To Upload, Relative To The Project Folder.<br><br>
            Upload URL: The URL Of The Content To Upload.<br><br>
            Upload Buffer: The Filename Of The Buffer.<br><br>
            Delete File: The Filename On catbox.moe.<br>
            For Example:<br>
            If My File Is Uploaded To catbox And It Returns "https://files.catbox.moe/6px9c6.html", The Filename Is "6px9c6.html"<br>
            Deleting Multiple Files At Once Is Also Possible, Simply Separate Each Filename With A Space (" ").
            `,
          },
        ],
      },
    },
    "_",
    {
      element: "variable",
      storeAs: "buffer",
      name: "Buffer",
    },
    "-",
    {
      element: "store",
      storeAs: "response",
      name: "Store Response As",
    },
    "-",
    {
      element: "text",
      text: modVersion,
    },
  ],

  subtitle: (values, constants, thisAction) => {
    // To use thisAction, constants must also be present
    let subtitle
    switch (values.action.type) {
      case "uploadFile": {
        subtitle = `Upload File "${values.action.value}" To catbox.moe`
        break
      }

      case "uploadUrl": {
        subtitle = `Upload URL "${values.action.value}" To catbox.moe`
        break
      }

      case "uploadBuffer": {
        subtitle = `Upload Buffer ${values.buffer.type}(${values.buffer.value}) To catbox.moe`
        break
      }

      case "deleteFile": {
        subtitle = `Delete File(s) "${values.action.value}" From catbox.moe`
        break
      }
    }
    return subtitle
  },

  script: (values) => {
    function reflem(skipAnimation) {
      if (values.data.action.type == "uploadBuffer") {
        values.UI[3].element = "_"
        values.UI[4].element = "variable"
      } else {
        values.UI[3].element = ""
        values.UI[4].element = ""
      }

      setTimeout(
        () => {
          values.updateUI()
        },
        skipAnimation ? 1 : values.commonAnimation * 100
      )
    }

    reflem(true)

    values.events.on("change", () => {
      reflem()
    })
  },

  compatibility: ["Any"],

  async run(values, message, client, bridge) {
    // This is the exact order of things required, other orders will brick
    for (const moduleName of this.modules) {
      await client.getMods().require(moduleName)
    }

    const fs = require("node:fs")
    const path = require("node:path")
    const { FormData } = require("undici")
    const { Blob } = require("node:buffer")

    let catBoxApi = `https://catbox.moe/user/api.php`
    let action = bridge.transf(values.action.type)
    let actionData = bridge.transf(values.action.value)
    let userHash = bridge.transf(values.userHash)

    const botData = require("../data.json")
    const workingDir = path.normalize(process.cwd())
    let projectFolder
    if (workingDir.includes(path.join("common", "Bot Maker For Discord"))) {
      projectFolder = botData.prjSrc
    } else {
      projectFolder = workingDir
    }

    async function sendForm(form) {
      // for (const [key, val] of form) {
      //   console.log(key, val);
      // }
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

    function parseInput(input) {
      if (typeof input === "string") {
        try {
          const parsed = JSON.parse(input)
          if (Array.isArray(parsed)) return parsed
        } catch {}
      }
      return Array.isArray(input) ? input : [input]
    }

    function extractFileName(actionDataString) {
      try {
        let parsed = new URL(actionDataString)
        return parsed.pathname.split("/").pop()
      } catch {
        return actionDataString
      }
    }

    function randomString(length) {
      const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
      let result = ""
      for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length))
      }
      return result
    }

    let result

    try {
      switch (action) {
        case "uploadFile": {
          let relativePath = path.normalize(actionData)
          let filePath = path.join(projectFolder, relativePath)
          if (!fs.existsSync(path.dirname(filePath))) {
            fs.mkdirSync(path.dirname(filePath), { recursive: true })
          }
          if (!fs.existsSync(filePath)) {
            throw new Error(`File "${filePath}" Not Found!`)
          }

          let form = new FormData()
          let fileBuffer = fs.readFileSync(filePath)
          let fileName = path.basename(filePath)
          form.append("reqtype", "fileupload")
          if (userHash) {
            form.append("userhash", userHash)
          }
          form.append("fileToUpload", new Blob([fileBuffer]), fileName)
          result = await sendForm(form)
          break
        }

        case "uploadBuffer": {
          let form = new FormData()
          let fileBuffer = bridge.get(values.buffer)
          if (!Buffer.isBuffer(fileBuffer)) {
            throw new Error(`Variable Provided Isn't A Buffer!`)
          }
          let fileName = actionData.trim() || `upload-${randomString(16)}.bin`
          form.append("reqtype", "fileupload")
          if (userHash) {
            form.append("userhash", userHash)
          }
          form.append("fileToUpload", new Blob([fileBuffer]), fileName)
          result = await sendForm(form)
          break
        }

        case "uploadUrl": {
          let form = new FormData()
          form.append("reqtype", "urlupload")
          if (userHash) {
            form.append("userhash", userHash)
          }
          form.append("url", actionData)
          result = await sendForm(form)
          break
        }

        case "deleteFile": {
          if (!userHash) {
            throw new Error(`User Hash Is Required To Delete Files!`)
          }
          let form = new FormData()
          form.append("reqtype", "deletefiles")
          form.append("userhash", userHash)
          let files = parseInput(actionData)
          let fileNames = []
          for (let file of files) {
            fileNames.push(extractFileName(file))
          }
          form.append("files", fileNames.join(" "))
          result = await sendForm(form)
          break
        }
      }

      bridge.store(values.response, result)
    } catch (error) {
      bridge.store(values.response, error.message)
    }
  },
}
