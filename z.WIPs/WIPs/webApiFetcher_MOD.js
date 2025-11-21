modVersion = "v1.0.0"
module.exports = {
  data: {
    name: "Get Response From WebAPI",
    headers: [
      {
        type: "header",
        data: {
          headerKey: "User-Agent",
          headerValue: "bmd/bmods",
        },
      },
    ],
  },
  aliases: ["Get HTML From Webpage"],
  modules: ["Post Request To WebAPI", "Put Request To WebAPI", "Patch Request To WebAPI"],
  category: "WebAPIs",
  info: {
    source: "https://github.com/slothyace/bmods-acedia/tree/main/Actions",
    creator: "Acedia",
    donate: "https://ko-fi.com/slothyacedia",
  },
  UI: [
    {
      element: "input",
      storeAs: "url",
      name: "URL",
    },
    "_",
    {
      element: "typedDropdown",
      storeAs: "method",
      name: "Method",
      choices: {
        get: { name: "GET" },
        post: { name: "POST" },
        put: { name: "PUT" },
        patch: { name: "PATCH" },
      },
    },
    "_",
    {
      element: "largeInput",
      storeAs: "body",
      name: "Body To Send",
    },
    "-",
    {
      element: "menu",
      storeAs: "headers",
      name: "Headers",
      types: { header: "header" },
      max: 100,
      UItypes: {
        header: {
          data: {},
          name: "Header:",
          preview: "`${option.data.headerKey || ''}: ${option.data.headerValue || ''}`",
          UI: [
            {
              element: "input",
              storeAs: "headerKey",
              name: "Header Key",
            },
            "-",
            {
              element: "largeInput",
              storeAs: "headerValue",
              name: "Value",
            },
          ],
        },
      },
    },
    "-",
    {
      element: "store",
      storeAs: "response",
      name: "Store Response As",
    },
    {
      element: "store",
      storeAs: "responseType",
      name: "Store Response Type As",
    },
    "-",
    {
      element: "text",
      text: modVersion,
    },
  ],

  subtitle: (values, constants, thisAction) => {
    // To use thisAction, constants must also be present
    const titleCase = (string) =>
      string
        .split(" ")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ")
    return `Get [${titleCase(values.method.type)}] Response From ${values.url || ""}`
  },

  script: (values) => {
    function relfem(skipAnimation) {
      let method = values.data.method.type

      if (method == "get") {
        values.UI[3].element = ""
        values.UI[4].element = ""
      } else {
        values.UI[3].element = "_"
        values.UI[4].element = "largeInput"
      }
      setTimeout(
        () => {
          values.updateUI()
        },
        skipAnimation ? 1 : values.commonAnimation * 100
      )
    }

    relfem(true)
    values.events.on("change", () => {
      relfem()
    })
  },

  compatibility: ["Any"],

  async run(values, message, client, bridge) {
    // This is the exact order of things required, other orders will brick
    for (const moduleName of this.modules) {
      await client.getMods().require(moduleName)
    }

    let url = bridge.transf(values.url)
    let headers = {}

    for (let header of values.headers) {
      let headerData = header.data
      let headerKey = bridge.transf(headerData.headerKey).trim() || undefined
      let headerValue = bridge.transf(headerData.headerValue).trim() || undefined
      if (headerKey !== undefined && headerValue !== undefined && !headers[headerKey]) {
        headers[headerKey] = headerValue
      }
    }

    let method = bridge.transf(values.method.type).toUpperCase()
    let body
    if (method == "POST" || method == "PUT" || method == "PATCH") {
      body = bridge.transf(values.body).trim()
      try {
        body = JSON.stringify(JSON.parse(body))
      } catch {}
    }

    let response = await fetch(url, {
      method,
      headers,
      body,
    })

    let responseResult
    let responseType
    if (!response.ok) {
      console.log(`Fetch Error: [${response.status}] ${url}: ${response.statusText}`)
    } else {
      responseResult = await response.text()
    }
    responseType = response.headers.get("Content-Type")

    bridge.store(values.response, responseResult)
    bridge.store(values.responseType, responseType)
  },
}
