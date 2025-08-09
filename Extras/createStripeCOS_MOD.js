modVersion = "v2.0.0"
module.exports = {
  data: {
    name: "Create Stripe Checkout Session"
  },
  aliases: [],
  modules: ["stripe"],
  category: "Payment",
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
      element: "menu",
      storeAs: "items",
      name: "Items",
      max: 100,
      types: {
        item: "item",
      },
      UItypes: {
        item: {
          data: {},
          name: "Item",
          preview: "`${option.data.count || '1'}x ${option.data.name || 'Unnamed Product'} @ $${option.data.price || '0.00'}ea`",
          UI: [
            {
              element: "input",
              storeAs: "name",
              name: "Product Name",
              placeholder: "A Product",
            },
            {
              element: "input",
              storeAs: "description",
              name: "Description",
              placeholder: "A Product"
            },
            "-",
            {
              element: "input",
              storeAs: "price",
              name: "Price",
              placeholder: "XX.xx || If Currency Isn't Decimal Based, Divide By 100",
              help: {
                title: "Pricing",
                UI: [
                  {
                    element: "text",
                    text: `<div style="font-size:20px">
                      The Behavior Of Pricing Is That It Will Always Multiply The Value By 100. So For A Charge Of 5.00, It Will Become 500 During The Processing<br></br>
                      For Currencies Like JPY Where It There Is No Decimal Point, If You Want To Charge 567 YEN, Put The Price As 5.67
                    </div>`
                  }
                ]
              }
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
            "-",
            {
              element: "input",
              storeAs: "count",
              name: "Count",
              placeholder: "1",
            }
          ]
        },
      }
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
    "-",
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
      storeAs: "subtotal",
      name: "Store Subtotal As",
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
    return `Create ${values.items.length} Item Stripe Checkout Session`
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

    let successUrl = (bridge.transf(values.successUrl) || `https://example.com/success`).trim()
    let cancelUrl = (bridge.transf(values.cancelUrl) || `https://example.com/cancel`).trim()

    let line_items = []
    if (values.items.length == 0){
      return console.log(`Number Of Items In Checkout Can't Be 0!`)
    }

    for (let item of values.items){
      let itemData = item.data

      let name = (bridge.transf(itemData.name) || "Unnamed Product").trim()
      let description = (bridge.transf(itemData.description) || "").trim()

      let rawPrice = parseFloat(bridge.transf(itemData.price))
      let price = isNaN(rawPrice) ? 100 : Math.round(rawPrice*100)
      let currency = bridge.transf(itemData.currency.type).toLowerCase() || "usd"
      let rawQuantity = parseFloat(bridge.transf(itemData.count))
      let quantity = (isNaN(rawQuantity) || rawQuantity < 1) ? 1 : Math.ceil(rawQuantity)

      if (currency == "iso4217"){
        currency = bridge.transf(itemData.currency.value).toLowerCase().trim() || "usd"
      }

      let product_data = {
        name
      }
      if (description !== ""){
        product_data.description = description
      }

      line_items.push(
        {
          price_data: {
            currency,
            unit_amount: price,
            product_data
          },
          quantity
        }
      )
    }

    let metadata = {}
    for (let entry of values.metadatas){
      let dataName = bridge.transf(entry.data.dataName)
      let dataVal = bridge.transf(entry.data.dataVal) || "No Metadata"

      if (dataName){
        metadata[dataName] = dataVal
      }
    }

    try {
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        mode: "payment",
        line_items,
        success_url: successUrl,
        cancel_url: cancelUrl,
        metadata
      })

      let subtotal
      if (values.subtotal.value !== ""){
        subtotal = 0
        const sessionLineItems = await stripe.checkout.sessions.listLineItems(session.id)
        sessionLineItems.data.forEach(item =>{
          subtotal += item.amount_subtotal
        })
      }

      bridge.store(values.paymentUrl, session.url)
      bridge.store(values.sessionId, session.id)
      bridge.store(values.fullSession, session)
      bridge.store(values.subtotal, subtotal)
    } catch (error){
      return console.error(`An Error Occured When Trying To Create A Checkout Session: ${error.message}`)
    }
  }
}