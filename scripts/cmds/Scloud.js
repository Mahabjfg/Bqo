const axios = require("axios");
const fs = require("fs");
const { createReadStream, unlinkSync } = require("fs-extra");

module.exports = {
  config: {
    name: "scloud",
    category: 'cdna ',
    author: 'Mostakim'
  },

  onReply: async ({ api, event, handleReply }) => {
    try {
      const { results, messageID } = handleReply;
      const choice = event.body - 1;

      if (isNaN(choice) || choice < 0 || choice >= results.length) {
        api.unsendMessage(messageID);
        return api.sendMessage("❌ Invalid selection! Please choose a number from the list.", event.threadID);
      }

      const track = results[choice];
      api.sendMessage("⬇️ Downloading track...", event.threadID);

      const { data } = await axios.get(
        `https://nayan-video-downloader.vercel.app/soundcloud?url=${track.permalink_url}`
      );

      const { title, download_url } = data.data;
      const filePath = `${__dirname}/cache/${title}.mp3`;

      const writer = fs.createWriteStream(filePath);
      const response = await axios.get(download_url, { responseType: "stream" });

      // Pipe data to file
      response.data.pipe(writer);

      // Handle file writing completion
      writer.on("finish", () => {
        console.log(`File downloaded and saved at: ${filePath}`);
        const fileSize = fs.statSync(filePath).size;

        // Check if file size is above limit
        if (fileSize > 26214400) {
          unlinkSync(filePath);
          return api.sendMessage("❌ File size exceeds 25MB limit!", event.threadID);
        }

        api.unsendMessage(messageID);
        api.sendMessage({
          body: `🎵 Successfully Downloaded:\n\nTitle: ${title}`,
          attachment: createReadStream(filePath)
        }, event.threadID, () => unlinkSync(filePath));
      });

      // Handle errors during file writing
      writer.on("error", (error) => {
        console.error("Error writing file:", error);
        api.sendMessage("⚠️ Failed to download the track.", event.threadID);
      });

    } catch (error) {
      console.error("Error in onReply:", error);
      api.sendMessage("⚠️ Failed to download the selected track", event.threadID);
    }
  },

  onStart: async ({ api, event, args }) => {
    try {
      const input = args.join(" ");

      if (!input) {
        api.sendMessage("🔍 Please provide a SoundCloud URL or search query", event.threadID);
      }
      if (input.startsWith("https://soundcloud.com/") || input.startsWith("khankirPola Nayan")) {
        api.sendMessage("⏳ Processing direct link...", event.threadID);

        const { data } = await axios.get(
          `https://nayan-video-downloader.vercel.app/soundcloud?url=${input}`
        );

        const { title, download_url } = data.data;
        const filePath = `${__dirname}/cache/${title}.mp3`;

        const writer = fs.createWriteStream(filePath);
        const response = await axios.get(download_url, { responseType: "stream" });
        response.data.pipe(writer);

        writer.on("finish", () => {
          console.log(`File downloaded and saved at: ${filePath}`);
          api.sendMessage({
            body: `✅ Downloaded Successfully:\n\nTitle: ${title}`,
            attachment: createReadStream(filePath)
          }, event.threadID, () => unlinkSync(filePath));
        });

        // Handle errors during file writing
        writer.on("error", (error) => {
          console.error("Error writing file:", error);
          api.sendMessage("⚠️ Failed to download the track.", event.threadID);
        });

      } else {
        api.sendMessage("🔍 Searching SoundCloud...", event.threadID);

        const { data } = await axios.get(
          `https://nayan-video-downloader.vercel.app/soundcloud-search?name=${encodeURIComponent(input)}&limit=6`
        );

        if (!data.results.length) {
          api.sendMessage("❌ No results found for your search", event.threadID);
        }

        const results = data.results;
        const message = results.map((track, index) =>
          `${index + 1}. ${track.title}`
        ).join("\n\n");

        api.sendMessage(
          `🎧 Found ${results.length} tracks:\n\n${message}\n\nReply with the track number (1-${results.length}) to download`,
          event.threadID,
          (err, info) => {
            global.GoatBot.onReply.set(info.messageID, {
              type: "reply",
              name: this.config.name,
              messageID: info.messageID,
              author: event.senderID,
              results: results
            });
          }
        );
      }
    } catch (error) {
      console.error("Error in onStart:", error);
      api.sendMessage("⚠️ An error occurred while processing your request", event.threadID);
    }
  }
};
