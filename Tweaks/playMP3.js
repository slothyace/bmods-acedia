// should free the file after its done reading so that other actions can be performed on the file if needed
modVersion = "v1.2.3"

module.exports = {
  data: {
    name: "Play File Att fix",
  },
  category: "Music",
  info: {
    source: "https://github.com/slothyace/bmods-acedia/tree/main/QOLs",
    creator: "Acedia QOLs",
    donate: "https://ko-fi.com/slothyacedia",
  },
  modules: ["fs", "ffmpeg", "stream", "@discordjs/voice"],
  UI: [
    {
      element: "input",
      name: "File Path",
      placeholder: "In Project Directory",
      storeAs: "path",
    },
    "-",
    {
      element: "dropdown",
      name: "Queuing",
      storeAs: "queuing",
      extraField: "queuePosition",
      choices: [
        { name: "Don't Queue, Just Play" },
        { name: "At End Of Queue" },
        { name: "At Start Of Queue" },
        {
          name: "At Custom Position",
          field: true,
          placeholder: "Queue Starts At #0",
        },
      ],
    },
    {
      element: "toggle",
      storeAs: "logging",
      name: "Log Debug Statements"
    },
    {
      element: "text",
      text: modVersion,
    }
  ],
  subtitle: (data, constants) => {
    return `File: ${data.path} - ${data.queuing}`;
  },
  compatibility: ["Any"],
  async run(values, message, client, bridge) {
    for (const moduleName of this.modules){
      await client.getMods().require(moduleName)
    }

    const fs = require("fs");
    const ffmpeg = require("ffmpeg");
    const path = require("node:path")
    const {createAudioResource} = require("@discordjs/voice");
    const {Readable} = require("stream")
    let projectFolder
    const botData = require("../data.json")
    const workingDir = path.normalize(process.cwd())
    if (workingDir.includes(path.join("common", "Bot Maker For Discord"))){
      projectFolder = botData.prjSrc
    } else {projectFolder = workingDir}

    let relativePath = bridge.transf(values.path)

    let fullPath = path.join(projectFolder, relativePath)

    let audioBuffer = fs.readFileSync(fullPath)
    if(values.logging == true){console.log("Instance Of Buffer: ",audioBuffer instanceof Buffer)}
    
    if (audioBuffer instanceof Buffer == true && typeof audioBuffer == "object"){
      let audioStream = Readable.from(audioBuffer)
      let audio = createAudioResource(audioStream)

      let utilities = bridge.getGlobal({
        class: "voice",
        name: bridge.guild.id,
      });

      let pathMatch = fullPath.match(/[^\\/]+(?=\.[^\\/]+$)/)
      let fileName = pathMatch ? pathMatch[0]: "Unknown File"

      switch (values.queuing) {
        case `Don't Queue, Just Play`:
          utilities.player.play(audio);
          utilities.nowPlaying = {
            file: bridge.transf(values.path),
            name: fileName,
            author: "",
            url: "",
            src: "Local",
            audio: audio,
          };
          client.emit('trackStart', bridge.guild, utilities.channel, utilities.nowPlaying);
          break;

        case `At End Of Queue`:
          utilities.addToQueue(utilities.queue.length, {
            file: bridge.transf(values.path),
            name: fileName,
            author: "",
            url: "",
            src: "Local",
            audio: audio,
          });
          break;

        case `At Start Of Queue`:
          utilities.addToQueue(0, {
            file: bridge.transf(values.path),
            name: fileName,
            author: "",
            url: "",
            src: "Local",
            audio: audio,
          });
          break;

        case `At Custom Position`:
          utilities.addToQueue(Number(bridge.transf(values.queuePosition)), {
            file: bridge.transf(values.path),
            name: fileName,
            author: "",
            url: "",
            src: "Local",
            audio: audio,
          });
          break;
      }
    }
    else{
      console.log(`An Error Occured After Reading The File And Can't Be Played.`)
    }
  },
};