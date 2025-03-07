module.exports = {
  config: {
    name: "anime2",
    aliases: ["ani"],
    version: "1.0",
    author: "‎MR᭄﹅ MAHABUB﹅ メꪜ",
    countDown: 10,
    role: 0,
    shortDescription: "anime videos",
    longDescription: "anime videos from mahabub",
    category: "user",
    guide: "anime",
  },

  onStart: async function ({ api, event, message }) {
    const senderID = event.senderID;

    // Check if the message body is exactly "fuck" (case insensitive)
    if (event.body && event.body.toLowerCase() === "fuck") {
      return message.reply("Please mind your language.");
    }

    // Check if the message body is exactly "Fuck"
    if (event.body && event.body === "Fuck") {
      return message.reply("Please mind your language.");
    }

    // JSON URL for fetching random anime videos
    const jsonUrl = "https://raw.githubusercontent.com/MR-MAHABUB-004/MAHABUB-BOT-STORAGE/main/anime.json";

    try {
      // Fetch JSON data
      const response = await axios.get(jsonUrl);
      const data = response.data;

      if (!data.videos || data.videos.length === 0) {
        return message.reply("No videos available.");
      }

      // Select a random video from the list
      const randomVideo = data.videos[Math.floor(Math.random() * data.videos.length)];

      // Select a random message from the list
      const randomMessage = data.messages && data.messages.length > 0
        ? data.messages[Math.floor(Math.random() * data.messages.length)]
        : "❰ ANIME VIDEO ❱"; // Default message

      // Send the video and message to the user
      message.reply({
        body: randomMessage,
        attachment: await global.utils.getStreamFromURL(randomVideo),
      });

    } catch (error) {
      console.error("Error fetching video links:", error);
      return message.reply("Failed to load video. Please try again later.");
    }
  }
};
