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
    version: '3.4',
    author: 'MOHAMMAD NAYAN',
    countDown: 5,
    role: 0,
    shortDescription: 'Auto-download and send videos from links',
    category: 'media',
  },

  onStart: async function ({ api, event }) {
    const threadID = event.threadID;

    if (!autoLinkStates[threadID]) {
      autoLinkStates[threadID] = 'on';
      saveAutoLinkStates(autoLinkStates);
    }

    if (event.body.toLowerCase().includes('autolink off')) {
      autoLinkStates[threadID] = 'off';
      saveAutoLinkStates(autoLinkStates);
      api.sendMessage("✅ AutoLink is now turned OFF.", event.threadID, event.messageID);
    } else if (event.body.toLowerCase().includes('autolink on')) {
      autoLinkStates[threadID] = 'on';
      saveAutoLinkStates(autoLinkStates);
      api.sendMessage("✅ AutoLink is now turned ON.", event.threadID, event.messageID);
    }
  },

  onChat: async function ({ api, event }) {
    const threadID = event.threadID;
    const message = event.body;

    const linkMatch = message.match(/(https?:\/\/[^\s]+)/);
    if (!linkMatch) return;
    
    const url = linkMatch[0];

    if (autoLinkStates[threadID] !== 'on') return;

    api.setMessageReaction("⏳", event.messageID, () => {}, true);

    try {
      const res = await axios.get(`https://nayan-video-downloader.vercel.app/alldown?url=${encodeURIComponent(url)}`);
      if (!res.data.data || !res.data.data.high) {
        return api.sendMessage("❌ Couldn't find a high-quality video link.", event.threadID, event.messageID);
      }

      const { title, high } = res.data.data;

      const msg = `🎬 *${title}*\n\n📥 Downloading & Sending Video...`;

      api.sendMessage(msg, event.threadID, async () => {
        const videoStream = request(high);
        api.sendMessage(
          {
            attachment: videoStream
          },
          event.threadID,
          event.messageID
        );
      });

    } catch (err) {
      console.error("Error fetching video:", err);
      api.sendMessage("❌ Error while fetching video. Please try again later.", event.threadID, event.messageID);
    }
  }
};
