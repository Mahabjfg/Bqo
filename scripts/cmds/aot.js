const axios = require("axios");

module.exports = {
  config: {
    name: "anime2",
    aliases: ["s", "rndm", "random", "status"], // Adding aliases to catch various commands
    version: "1.0",
    author: "‎MR᭄﹅ MAHABUB﹅ メꪜ",
    countDown: 10,
    role: 0,
    shortDescription: "anime videos",
    longDescription: "anime videos from mahabub",
    category: "user",
    guide: "anime2",  // No prefix needed now
  },

  onStart: async function ({ api, event, message }) {
    const senderID = event.senderID;

    // Normalize the input command to lowercase for comparison
    const messageText = event.body.trim().toLowerCase();

    // Check if the message is any of the commands we want to respond to
    if (["rndm", "random", "status"].includes(messageText)) {
      // Send loading message
      const loadingMessage = await message.reply({
        body: "Loading random video... Please wait! (up to 5 sec)...\n𝐍𝐨𝐰 𝐥𝐨𝐚𝐝𝐢𝐧𝐠. . .\n█▒▒▒▒▒▒▒▒▒",
      });

      // URL to the JSON file containing the video list
      const jsonUrl = "https://raw.githubusercontent.com/MR-MAHABUB-004/MAHABUB-BOT-STORAGE/main/anime.json";

      try {
        // Fetch data from the JSON file
        const response = await axios.get(jsonUrl);
        const data = response.data;

        if (!data.videos || data.videos.length === 0) {
          return message.reply("No videos available.");
        }

        // Pick a random video from the list
        const randomVideo = data.videos[Math.floor(Math.random() * data.videos.length)];

        // Choose a random message (if any exists in the JSON file)
        const randomMessage = data.messages && data.messages.length > 0
          ? data.messages[Math.floor(Math.random() * data.messages.length)]
          : "❰ ANIME VIDEO ❱"; // Default message if no custom message is found

        // Send the video along with a message
        await api.sendMessage({
          body: randomMessage, // The message that was randomly selected
          attachment: await global.utils.getStreamFromURL(randomVideo), // Attachment for the video
        }, senderID);

      } catch (error) {
        console.error("Error fetching video links:", error);
        return message.reply("Failed to load video. Please try again later.");
      }
    } else {
      // Inform the user about invalid commands if needed
      return message.reply("Invalid command. Please use 'rndm', 'random', or 'status' to get a video.");
    }
  }
};
