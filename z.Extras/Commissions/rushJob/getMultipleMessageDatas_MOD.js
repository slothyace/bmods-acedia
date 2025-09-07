modVersion = "v1.0.0"
module.exports = {
  data: {
    name: "Get Multiple Message Datas",
  },
  info: {
    source: "https://github.com/slothyace/bmods-acedia/tree/main/Actions",
    creator: "Acedia",
    donate: "https://ko-fi.com/slothyacedia",
  },
  category: "Message Data",
  UI: [
    {
      element: "menu",
      storeAs: "retrieveList",
      name: "List of Message Datas",
      types: {
        data: "datas",
      },
      max: 1000,
      UItypes:{
        data: {
          data: {},
          name: "Data Name:",
          preview: "`${option.data.dataname}`",
          UI: [
            {
              element: "message",
              storeAs: "message",
              name: "Message",
            },
            {
              element: "input",
              storeAs: "dataname",
              name: "Data Name",
            },
            "-",
            {
              element: "input",
              storeAs: "defaultValue",
              name: "Default Value",
            },
            {
              element: "store",
              storeAs: "store",
              name: "Stored Value As"
            }
          ],
        },
      },
    },
    {
      element: "text",
      text: modVersion,
    }
  ],

  subtitle: (values, constants) => {
    return `Control ${values.retrieveList.length} Message Datas.`
  },

  compatibility: ["Any"],

  async run (values, message, client, bridge) {
    let storedData = bridge.data.IO.get();
    let dataType = "messages"

    for (let edit of values.retrieveList) {
      let editData = edit.data
      let message = await bridge.getMessage(editData.message)
      let id = message.id

      let defaultVal = bridge.transf(editData.defaultValue)
      let currentData = defaultVal
      let dataName = bridge.transf(editData.dataname)

      if (storedData[dataType][id][dataName]){
        currentData = storedData[dataType][id][dataName]
      }

      bridge.store(editData.store, currentData)
    }
  }
}