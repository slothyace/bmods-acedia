module.exports = {
  data: {
    name: "Get Mentions",
  },
  info: {
  source: "https://github.com/slothyace/bmods-acedia/tree/main/Actions",
  creator: "Acedia",
  donate: "https://ko-fi.com/slothyacedia",
  },
  category: "Shortcuts",
  modules: [],
  UI: [
    {
      element: "var",
      storeAs: "membersList",
      name: "Initial List",
    },
    "-",
    {
      element: "typedDropdown",
      storeAs: "style",
      name: "List or Text?",
      choices:{
        list: {name: "List", field: false},
        text: {name: "Text", field: true, placeholder: "Delimiter"},
      },
    },
    {
      element: "store",
      storeAs: "result",
      name: "Store Result As:",
    },
  ],

  subtitle: (values, constants) => {
    return `Get Mentions Of ${constants.variable(values.membersList)}`
  },

  async run(values, message, client, bridge){
    let memList = bridge.get(values.membersList)

    memList = memList.map(member =>{
      return `<@${member.id}>`
    })

    let mentionList
    if (values.style.type == "text"){
      mentionList = memList.join(bridge.transf(values.style.value))
    } else {mentionList = memList}

    bridge.store(values.result, mentionList)
  }
}

