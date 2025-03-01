module.exports = {
  config: {
    name: "autuano",
    version: "0.0.2",
    author: "Nayan",
    countDown: 5,
    role: 0,
    shortDescription: "Auto video download",
    longDescription: "",
    category: "media",
    guide: {
      en: "{p}{n}",
  },
  start: async function({ nayan, events, args }) {},
  handleEvent: async function ({ api, event, args }) {
    const axios = require("axios");
    const request = require("request");
    const fs = require("fs-extra");
    const { alldown } = require("nayan-videos-downloader");
    
    const content = event.body ? event.body : '';
    const body = content.toLowerCase();

    if (body.startsWith("https://")) {
      try {
        // Set initial reaction (loading)
        await api.setMessageReaction("🔍", event.messageID, () => {}, true);
        
        // Download video data
        const data = await alldown(content);
        console.log(data);
        
        const { low, high, title } = data.data;

        // Set success reaction once video download starts
        await api.setMessageReaction("✔️", event.messageID, () => {}, true);

        // Fetch the high-quality video
        const video = (await axios.get(high, { responseType: "arraybuffer" })).data;
        fs.writeFileSync(__dirname + "/cache/auto.mp4", Buffer.from(video, "utf-8"));

        // Send video
        await api.sendMessage({
          body: `《TITLE》: ${title}`,
          attachment: fs.createReadStream(__dirname + "/cache/auto.mp4")
        }, event.threadID, event.messageID);

        // Clean up the cache after sending the video
        fs.removeSync(__dirname + "/cache/auto.mp4");

      } catch (error) {
        console.error("Error during video download or sending:", error);
        // Optionally, you can send an error message to the user
        await api.sendMessage("Sorry, there was an error processing your request.", event.threadID, event.messageID);
      }
    }
  }
};
