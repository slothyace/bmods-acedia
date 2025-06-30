modVersion = "v1.0.0"
module.exports = {
  data: {
    name: "Check Stripe Payment Status"
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
    {
      element: "input",
      storeAs: "sessionId",
      name: "Checkout Session Id",
    },
    "-",
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

    const Stripe = require("stripe")
    let stripeKey = bridge.transf(values.stripeKey)
    let sessionId = bridge.transf(values.sessionId)

    if (!stripeKey || !sessionId){
      return console.error(`A Stripe Key And Session Id Is Required!`)
    }

    const stripe = Stripe(stripeKey)
    try {
      const session = await stripe.checkout.sessions.retrieve(sessionId)

      bridge.store(values.paymentStatus, session.payment_status)
      bridge.store(values.fullSession, session)
    } catch (error){
      return console.error(`An Error Occured When Checking Session Status: ${error.message}`)
    }
  }
}