modVersion = "v1.0.0"
module.exports = {
  data: {
    name: "Console Forwarder"
  },
  aliases: [],
  modules: [],
  category: "Utilities",
  info: {
    source: "https://github.com/slothyace/bmods-acedia/tree/main/Actions",
    creator: "Acedia",
    donate: "https://ko-fi.com/slothyacedia",
  },
  UI: [
    {
      element: "text",
      text: "This Mod Is Activated On Startup, Allowing Console Events To Be Forwarded."
    },
    {
      element: "text",
      text: modVersion
    }
  ],

  startup: async (bridge, client)=>{
    const EventEmitter = require("events")
    const consoleEmitter = new EventEmitter()

    const methods = ["log", "info", "warn", "error", "debug"]
    methods.forEach((method) => {
      const originalFunc = console[method];
      console[method] = (...args) => {
        originalFunc.apply(console, args);       // prints normally
        client.emit("consoleEvent", ...args); // emits exact same args
      };
    });
  },

  subtitle: (values, constants, thisAction) =>{ // To use thisAction, constants must also be present
    return `This Mod Is Activated On Startup`
  },

  compatibility: ["Any"],

  async run(values, message, client, bridge){ // This is the exact order of things required, other orders will brick
    for (const moduleName of this.modules){
      await client.getMods().require(moduleName)
    }
    
    console.log(`This Mod Is Already Activated On Startup!`)
  }
}