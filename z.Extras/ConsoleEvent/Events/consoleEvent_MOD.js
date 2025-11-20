modVersion = "v1.0.0"
module.exports = {
  name: "Console Event",
  nameSchemes: ["Store Console Printout As"],
  initialize(client, data, run) {
    client.on("consoleEvent", (...args) => {
      const message = args
        .map((arg) => {
          if (arg instanceof Error) {
            return arg.stack
          }
          if (typeof arg === "object") {
            return JSON.stringify(arg, null, 2)
          }
          return String(arg)
        })
        .join(" ")
      run([message], {})
    })
  },
}
