modVersion = "v1.0.0"
module.exports = {
  data: {
    name: "Control Multiple Message Datas",
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
      storeAs: "editList",
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
            {
              element: "typedDropdown",
              storeAs: "control",
              name: "Control",
              choices: {
                add: {name: "Add To Value", field: true, placeholder:"Value To Add"},
                overwrite: {name: "Overwrite", field:true, placeholder:"New Value"}
              }
            },
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
    return `Control ${values.editList.length} Message Datas.`
  },

  compatibility: ["Any"],

  async run (values, message, client, bridge) {
    let storedData = bridge.data.IO.get();
    let dataType = "messages"

    for (let edit of values.editList) {
      let editData = edit.data
      let message = await bridge.getMessage(editData.message)
      let id = message.id

      let currentData = ""

      if (!storedData[dataType][id]){
        storedData[dataType][id] = {}
      }

      let dataName = bridge.transf(editData.dataname)
      if (storedData[dataType][id][dataName]){
        currentData = storedData[dataType][id][dataName]
      }

      let controlValue = bridge.transf(editData.control.value)

      if (editData.control.type == "add"){
        if (parseFloat(currentData) != NaN && parseFloat(controlValue)!= NaN && currentData && editData.control.value){
          currentData = Number(currentData) + Number(controlValue)
        } else {
          currentData = `${currentData}${controlValue}`
        }
      } else {
        currentData = controlValue
      }

      storedData[type][id][dataName] = currentData
      bridge.data.IO.write(storedData)
    }
  }
}