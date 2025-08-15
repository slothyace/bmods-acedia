modVersion = "v1.0.0"
module.exports = {
  data: {
    name: "Check PayPal Payment Status",
    autoCapture: true
  },
  aliases: [],
  modules: [],
  category: "Payment",
  info: {
    source: "https://github.com/slothyace/bmods-acedia/tree/main/Actions",
    creator: "Acedia",
    donate: "https://ko-fi.com/slothyacedia",
  },
  UI: [
    {
      element: "input",
      storeAs: "clientId",
      name: "Client ID",
    },
    {
      element: "input",
      storeAs: "clientSecret",
      name: "Client Secret",
    },
    {
      element: "toggle",
      storeAs: "sandboxMode",
      name: "Operation Mode",
      true: "Sandbox",
      false: "Live",
      help: {
        title: "What Is Operation Mode For?",
        UI: [
          {
            element: "text",
            text: `<div style="font-size:20px">
              Sandbox Mode Is For Testing Purposes And Doesn't Make Actual Charges.<br><br>
              Live Mode On The Other Hand, Does Actually Make Charges And Should Be Enabled When You're Ready To Ask For Money.
            </div>`
          },
        ],
      } ,
    },
    "-",
    {
      element: "input",
      storeAs: "sessionId",
      name: "Checkout Session Id",
    },
    "-",
    {
      element: "toggle",
      storeAs: "autoCapture",
      name: "Auto Capture Payment",
      help: {
        title: "What Is Capture Payment",
        UI: [
          {
            element: "text",
            text: `<div style="font-size:20px">
              After Initial Payment By The Person, The Funds Are Held By PayPal Until You "Capture" It. If You Do Not "Capture" It, You WON'T Get Paid<br><br>
              By Toggling On This Toggle, It Would Check If The Status Is "APPROVED" And If It Is, "Captures" It For You
            </div>`
          }
        ]
      }
    },
    {
      element: "store",
      storeAs: "paymentStatus",
      name: "Store Payment Status As",
    },
    {
      element: "store",
      storeAs: "fullSession",
      name: "Store Full Session Object As",
    },
    "-",
    {
      element: "text",
      text: modVersion
    }
  ],

  subtitle: (values, constants, thisAction) =>{ // To use thisAction, constants must also be present
    return `Check Payment Status for Session ID: ${values.sessionId || "?"}`
  },

  compatibility: ["Any"],

  async run(values, message, client, bridge){ // This is the exact order of things required, other orders will brick
    for (const moduleName of this.modules){
      await client.getMods().require(moduleName)
    }

    let clientId = bridge.transf(values.clientId).trim()
    let clientSecret = bridge.transf(values.clientSecret).trim()
    let sessionId = bridge.transf(values.sessionId).trim()
    let sandboxMode = values.sandboxMode
    let apiUrl
    if (sandboxMode === true){
      apiUrl = `https://api-m.sandbox.paypal.com`
    } else {apiUrl = `https://api-m.paypal.com`}

    // Getting Access Token
    if (!clientId || !clientSecret || !sessionId){
      return console.log(`Missing Client ID Or Client Secret Or Session ID!`)
    }

    let basicAuth = Buffer.from(`${clientId}:${clientSecret}`).toString("base64")

    let tokenResponse = await fetch(`${apiUrl}/v1/oauth2/token`, {
      method: "POST",
      headers: {
        "Authorization": `Basic ${basicAuth}`,
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: "grant_type=client_credentials",
    })

    let tokenData = await tokenResponse.json()
    let accessToken = tokenData.access_token

    await new Promise(resolve => setTimeout(resolve, 500))

    let statusResponse = await fetch(`${apiUrl}/v2/checkout/orders/${sessionId}`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      }
    })

    let statusData = await statusResponse.json()
    let paymentStatus = statusData.status

    if (values.autoCapture === true){
      if (paymentStatus === "APPROVED"){
        let captureUrl = statusData.links?.find(link => link.rel === "capture")?.href
        let captureResponse = await fetch(captureUrl, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: "{}"
        })

        let captureData = await captureResponse.json()
        if (captureResponse.ok){
          paymentStatus = captureData.status
          statusData = captureData
        } else {
          console.log(`Failed To Auto Capture For Session: ${sessionId}`)
        }
      }
    }

    bridge.store(values.paymentStatus, paymentStatus)
    bridge.store(values.fullSession, statusData)
  }
}