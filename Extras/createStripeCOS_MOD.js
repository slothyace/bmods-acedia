modVersion = "v1.0.0"
module.exports = {
  data: {
    name: "Create Stripe Checkout Session"
  },
  aliases: [],
  modules: ["stripe"],
  category: "Stripe",
  info: {
    source: "https://github.com/slothyace/bmods-acedia/tree/main/Actions",
    creator: "Acedia",
    donate: "https://ko-fi.com/slothyacedia",
  },
  UI: [
    {
      element: "input",
      storeAs: "stripeKey",
      name: "Stripe Secret Key",
      placeholder: "https://dashboard.stripe.com/apikeys",
    },
    "-",
    {
      element: "input",
      storeAs: "productName",
      name: "Product Name",
      placeholder: "A Product",
    },
    {
      element: "input",
      storeAs: "price",
      name: "Price (In Dollars)",
      placeholder: "XX.xx",
    },
    "-",
    {
      element: "menu",
      storeAs: "metadatas",
      name: "Metadata",
      max: 100,
      types: {
        metadata: "metadata",
      },
      UItypes: {
        metadata: {
          data: {},
          name: "Metadata",
          preview: "`${option.data.dataName}: ${option.data.dataVal}`",
          UI: [
            {
              element: "input",
              storeAs: "dataName",
              name: "Metadata Name",
            },
            {
              element: "input",
              storeAs: "dataVal",
              name: "Metadata Value",
            },
          ],
        },
      },
    },
    {
      element: "input",
      storeAs: "successUrl",
      name: "Payment Success Redirect",
    },
    {
      element: "input",
      storeAs: "cancelUrl",
      name: "Payment Cancel Redirect",
    },
    "-",
    {
      element: "store",
      storeAs: "paymentUrl",
      name: "Store Checkout Page URL As",
    },
    {
      element: "store",
      storeAs: "sessionId",
      name: "Store Session Id As",
    },
    {
      element: "store",
      storeAs: "fullSession",
      name: "Store Full Session Object As"
    },
    "-",
    {
      element: "text",
      text: modVersion
    }
  ],

  subtitle: (values, constants, thisAction) =>{ // To use thisAction, constants must also be present
    return `Create Stripe Checkout Session For ${values.productName || "Unnamed Product"} @ $${values.price || "0.00"}`
  },

  compatibility: ["Any"],

  async run(values, message, client, bridge){ // This is the exact order of things required, other orders will brick
    for (const moduleName of this.modules){
      await client.getMods().require(moduleName)
    }

    const Stripe = require("stripe")
    let stripeKey = bridge.transf(values.stripeKey)
    if (stripeKey == undefined){
      return console.error(`A Stripe API Key Is Required, You Can Get One At https://dashboard.stripe.com/apikeys`)
    }

    const stripe = Stripe(stripeKey)
    let productName = bridge.transf(values.productName) || `Unnamed Product`
    let price = Math.round(parseFloat(bridge.transf(values.price)) * 100) || "0"
    let successUrl = bridge.transf(values.successUrl)
    let cancelUrl = bridge.transf(values.cancelUrl)
    let metadata = {}
    for (let entry of values.metadatas){
      let dataName = bridge.transf(entry.data.dataName)
      let dataVal = bridge.transf(entry.data.dataVal)

      metadata[dataName] = dataVal
    }

    try {
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        mode: "payment",
        line_items: [
          {
            price_data: {
              currency: "usd",
              unit_amount: price,
              product_data: {
                name: productName
              }
            },
            quantity: 1
          }
        ],
        success_url: successUrl,
        cancel_url: cancelUrl,
        metadata
      })

      bridge.store(values.paymentUrl, session.url)
      bridge.store(values.sessionId, session.id)
      bridge.store(values.fullSession, session)
    } catch (error){
      return console.error(`An Error Occured When Trying To Create A Checkout Session: ${error.message}`)
    }
  }
}