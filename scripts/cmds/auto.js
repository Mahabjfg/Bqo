const fs = require("fs-extra");
const axios = require("axios");
const request = require("request");

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
  config: {
    name: 'autolink',
    version: '3.5',
    author: 'MOHAMMAD NAYAN',
    countDown: 5,
    role: 0,
    shortDescription: 'Auto-download and send videos with title',
    category: 'media',
  },

  onStart: async function ({ api, event }) {
  },

  onChat: async function ({ api, event }) {
    const threadID = event.threadID;
    const message = event.body;

    const linkMatch = message.match(/(https?:\/\/[^\s]+)/);
    if (!linkMatch) return;

    const url = linkMatch[0];

    // স্টেট চেকিং করা হয়নি, তাই যেকোনো লিংকেই কাজ করবে
    api.setMessageReaction("⏳", event.messageID, () => {}, true);

    try {
      const res = await axios.get(`https://nayan-video-downloader.vercel.app/alldown?url=${encodeURIComponent(url)}`);
      if (!res.data.data || (!res.data.data.high && !res.data.data.low)) {
        return api.sendMessage("", event.threadID, event.messageID);
      }

      const { title, high, low } = res.data.data;

      const msg = `《 TITLE 》🎬 : *${title}*`;

      const videoUrl = high || low; // If high link isn't available, use the low link

      request(videoUrl).pipe(fs.createWriteStream("video.mp4")).on("close", () => {
        api.sendMessage(
          {
            body: msg,
            attachment: fs.createReadStream("video.mp4")
          },
          event.threadID,
          () => {
            fs.unlinkSync("video.mp4"); // Delete after sending
          }
        );
      });

    } catch (err) {
      console.error("Error fetching video:", err);
      api.sendMessage("❌ Error while fetching video. Please try again later.", event.threadID, event.messageID);
    }
  }
};
