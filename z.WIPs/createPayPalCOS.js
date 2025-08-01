modVersion = "v1.0.0"
module.exports = {
  data: {
    name: "Create PayPal Checkout Session",
    applicationContext: [
      {
        "type": "context",
        "data": {
          "brandName": "",
          "landingPage": {
            "type": "billing",
            "value": ""
          },
          "userAction": {
            "type": "payNow",
            "value": ""
          },
          "shippingPref": {
            "type": "noShipping",
            "value": ""
          },
          "paymentTimeline": {
            "type": "immediate",
            "value": ""
          }
        }
      }
    ]
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
      storeAs: "price",
      name: "Price",
      placeholder: "XX.xx || XXXX",
    },
    {
      element: "typedDropdown",
      storeAs: "currency",
      name: "Currency",
      choices: (()=>{
        let currencies = {}
        currencies["iso4217"] = {name: "Currency TriCode", field: true, placeholder: "e.g: USD"}
        let supportedCurrencies = Intl.supportedValuesOf("currency")
        supportedCurrencies.forEach(currency =>{
          currencies[currency] = {name: `${currency.toUpperCase()}`, field:false}
        })
        return currencies
      })()
    },
    {
      element: "input",
      storeAs: "successUrl",
      name: "Payment Success Redirect",
      placeholder: "https://example.com/success"
    },
    {
      element: "input",
      storeAs: "cancelUrl",
      name: "Payment Cancel Redirect",
      placeholder: "https://example.com/cancel"
    },
    "-",
    {
      element: "menu",
      storeAs: "applicationContext",
      name: "Checkout Customisations",
      max: 1,
      types: {context: "context"},
      UItypes: {
        context: {
          data: {},
          name: "Customisations",
          UI: [
            {
              element: "input",
              storeAs: "brandName",
              name: "Brand Name",
            },
            "-",
            {
              element: "typedDropdown",
              storeAs: "landingPage",
              name: "Landing Page",
              choices: {
                billing: {name: "Billing Page", field:false},
                login: {name: "Login Page", field:false}
              },
            },
            "-",
            {
              element: "typedDropdown",
              storeAs: "userAction",
              name: "Checkout Button Text",
              choices: {
                payNow: {name: "Pay Now", field:false},
                continue: {name: "Continue", field:false}
              },
            },
            "-",
            {
              element: "typedDropdown",
              storeAs: "shippingPref",
              name: "Shipping Preference",
              choices: {
                noShipping: {name: "No Shipping", field:false},
                getFromFile: {name: "Get From File", field:false},
                setProvAddr: {name: "Set Provided Address", field:false}
              },
            },
            "-",
            {
              element: "typedDropdown",
              storeAs: "paymentTimeline",
              name: "Payment Timeline",
              choices: {
                immediate: {name: "Immediate Payment Required", field:false},
                eCheck: {name: "Unrestricted (Allows eChecks)", field:false},
              },
            }
          ]
        }
      }
    },
    "-",
    {
      element: "store",
      storeAs: "checkoutUrl",
      name: "Store Checkout Page URL As"
    },
    {
      element: "store",
      storeAs: "sessionId",
      name: "Store Session ID As",
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
    return `Create PayPal Checkout Session For $${values.price || "0.00"}`
  },

  compatibility: ["Any"],

  async run(values, message, client, bridge){ // This is the exact order of things required, other orders will brick
    for (const moduleName of this.modules){
      await client.getMods().require(moduleName)
    }

    let clientId = bridge.transf(values.clientId).trim()
    let clientSecret = bridge.transf(values.clientSecret).trim()
    let price = parseFloat(bridge.transf(values.price)) || 0
    let currency = bridge.transf(values.currency.type) || "USD"
    if (currency == "iso4217"){
      currency = bridge.transf(values.currency.value) || "USD"
    }
    let successUrl = bridge.transf(values.successUrl) || `https://example.com/success`
    let cancelUrl = bridge.transf(values.cancelUrl) || `https://example.com/cancel`
    let sandboxMode = values.sandboxMode
    let apiUrl
    if (sandboxMode === true){
      apiUrl = `https://api-m.sandbox.paypal.com`
    } else {apiUrl = `https://api-m.paypal.com`}

    // Getting Access Token
    if (!clientId || !clientSecret){
      return console.log(`Missing Client ID Or Client Secret!`)
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

    // Initiating A Checkout
    let orderResponse = await fetch(`${apiUrl}/v2/checkout/orders`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        intent: "CAPTURE",
        purchase_units: [
          {
            amount: {
              currency_code: currency,
              value: price,
            },
          },
        ],
        application_context: {
          return_url: successUrl,
          cancel_url: cancelUrl
        }
      })
    })

    let orderData = await orderResponse.json()
    let checkoutUrl = orderData.links?.find(link => link.rel === "approve")?.href

    bridge.store(values.checkoutUrl, checkoutUrl)
    bridge.store(values.sessionId, orderData.id)
    bridge.store(values.fullSession, orderData)
  }
}