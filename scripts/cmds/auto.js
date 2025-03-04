const fs = require("fs-extra");
const axios = require("axios");
const { shortenURL } = global.utils;

function loadAutoLinkStates() {
  try {
    const data = fs.readFileSync("autolink.json", "utf8");
    return JSON.parse(data);
  } catch (err) {
    return {};
  }
}

function saveAutoLinkStates(states) {
  fs.writeFileSync("autolink.json", JSON.stringify(states, null, 2));
}

let autoLinkStates = loadAutoLinkStates();

module.exports = {
  threadStates: {},
  config: {
    name: "autolinkjd",
    version: "3.0",
    author: "Vex_Kshitiz",
    countDown: 5,
    role: 0,
    shortDescription: "Auto video downloader for multiple platforms",
    longDescription: "",
    category: "media",
    guide: {
      en: "{p}{n}",
    },
  },
  
  onStart: async function ({ api, event }) {
    const threadID = event.threadID;

    if (!autoLinkStates[threadID]) {
      autoLinkStates[threadID] = "on";
      saveAutoLinkStates(autoLinkStates);
    }

    if (!this.threadStates[threadID]) {
      this.threadStates[threadID] = {};
    }

    if (event.body.toLowerCase().includes("autolink off")) {
      autoLinkStates[threadID] = "off";
      saveAutoLinkStates(autoLinkStates);
      api.sendMessage("✅ AutoLink is now turned OFF for this chat.", event.threadID, event.messageID);
    } else if (event.body.toLowerCase().includes("autolink on")) {
      autoLinkStates[threadID] = "on";
      saveAutoLinkStates(autoLinkStates);
      api.sendMessage("✅ AutoLink is now turned ON for this chat.", event.threadID, event.messageID);
    }
  },

  onChat: async function ({ api, event }) {
    const threadID = event.threadID;
    const messageBody = event.body;

    if (this.checkLink(messageBody)) {
      const { url } = this.checkLink(messageBody);
      console.log(`🔍 Processing URL: ${url}`);

      if (autoLinkStates[threadID] === "on" || !autoLinkStates[threadID]) {
        this.downloadMedia(url, api, event);
      }
    }
  },

  downloadMedia: async function (url, api, event) {
    try {
      api.setMessageReaction("⏳", event.messageID, () => {}, true);
      const response = await axios.get(`https://mr-mahabub-004.onrender.com/down?url=${encodeURIComponent(url)}`);
      
      if (!response.data || !response.data.url) {
        return api.sendMessage("❌ Sorry, couldn't find a download link for this video.", event.threadID, event.messageID);
      }

      const videoUrl = response.data.url;
      const title = response.data.title || "Unknown Title";
      const shortUrl = await shortenURL(videoUrl);
      const messageBody = `🎬 *Title:* ${title}\n🔗 *Download URL:* ${shortUrl}`;

      const path = __dirname + `/cache/video.mp4`;
      const videoResponse = await axios({
        method: "GET",
        url: videoUrl,
        responseType: "stream",
      });

      if (parseInt(videoResponse.headers["content-length"]) > 80000000) {
        return api.sendMessage(messageBody, event.threadID, event.messageID);
      }

      videoResponse.data.pipe(fs.createWriteStream(path));
      videoResponse.data.on("end", () => {
        api.sendMessage({ body: messageBody, attachment: fs.createReadStream(path) }, event.threadID, () => fs.unlinkSync(path), event.messageID);
      });

      api.setMessageReaction("✅", event.messageID, () => {}, true);
    } catch (err) {
      console.error("❌ Error downloading media:", err);
      api.sendMessage("⚠️ Failed to process the video. Try another link.", event.threadID, event.messageID);
    }
  },

  checkLink: function (url) {
    if (url.includes("instagram") || url.includes("facebook") || url.includes("tiktok") || url.includes("x.com") || url.includes("pin.it") || url.includes("youtu")) {
      return { url: url };
    }

    return null;
  },
};
