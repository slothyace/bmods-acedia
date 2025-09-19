modVersion = "s.v1.0"
module.exports = {
  name: "Console Event",
  nameSchemes: ["Store Console Printout As"],
  initialize(client, data, run) {
    client.on('consoleEvent', (...args) => {
      const message = args.map(a=>String(a)).join(" ")
        run([message], {})
    })
  }
};