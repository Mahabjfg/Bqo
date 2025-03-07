const axios = require("axios");

module.exports = {
  config: {
    name: "rndm",
    aliases: ["mahabub", "rndm", "random", "status"],
    version: "2.1",
    author: "‎MR᭄﹅ MAHABUB﹅ メꪜ",
    countDown: 5,
    role: 0,
    shortDescription: "Sends random anime videos",
    longDescription: "Fetches and sends a random anime video from an external JSON file.",
    category: "fun",
    guide: "{pn}"
  },

  onStart: async function ({ api, event, message }) {
    await sendAnimeVideo(api, event, message);
  },

  onChat: async function ({ api, event, message }) {
    const { body } = event;
    if (!body) return;

    const messageText = body.trim().toLowerCase();

    if (["rndm", "random", "status"].includes(messageText)) {
      await sendAnimeVideo(api, event, message);
    }
  }
};

async function sendAnimeVideo(api, event, message) {
  const { threadID, messageID } = event;

  message.reply("🔄 Fetching a random status video... Please wait!");

  const jsonUrl = "https://raw.githubusercontent.com/MR-MAHABUB-004/MAHABUB-BOT-STORAGE/main/anime.json";

  try {
    const response = await axios.get(jsonUrl);
    const data = response.data;

    if (!data.videos || data.videos.length === 0) {
      return message.reply("❌ No videos found. Please try again later.");
    }

    const randomVideo = data.videos[Math.floor(Math.random() * data.videos.length)];

    // Validate the video URL
    if (!randomVideo.startsWith("http")) {
      return message.reply("❌ Invalid video URL. Please try again later.");
    }

    const randomMessage = data.messages && data.messages.length > 0
      ? data.messages[Math.floor(Math.random() * data.messages.length)]
      : "❰ ANIME VIDEO ❱";

    // ✅ Send the video directly from URL (without downloading)
    message.reply({
      body: randomMessage,
      attachment: await global.utils.getStreamFromURL(randomVideo)
    });

  } catch (error) {
    console.error("❌ Error fetching video:", error);
    return message.reply("❌ Failed to load video. Please try again later.");
  }
}
