const axios = require("axios");
const fs = require("fs");
const { createReadStream, unlinkSync } = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "scloud",
    category: "cdna",
    author: "Mostakim"
  },

  onReply: async ({ api, event, handleReply }) => {
    try {
      const { results, messageID } = handleReply;
      const choice = parseInt(event.body) - 1;

      if (isNaN(choice) || choice < 0 || choice >= results.length) {
        api.unsendMessage(messageID);
        return api.sendMessage("❌ Invalid selection! Please choose a number from the list.", event.threadID);
      }

      const track = results[choice];
      console.log("Track selected:", track.permalink_url); // Debugging: Track URL
      api.sendMessage("⬇️ Downloading track...", event.threadID);

      const apiUrl = `https://nayan-video-downloader.vercel.app/soundcloud?url=${encodeURIComponent(track.permalink_url)}`;
      console.log("Fetching:", apiUrl); // Debugging: API URL

      const { data } = await axios.get(apiUrl);
      console.log("API Response:", data); // Debugging: API response

      if (!data || !data.data || !data.data.download_url) {
        return api.sendMessage("⚠️ Failed to fetch track download link.", event.threadID);
      }

      const { title, download_url } = data.data;
      const cacheDir = path.join(__dirname, "cache");

      if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir, { recursive: true });

      const filePath = path.join(cacheDir, `${title}.mp3`);
      const writer = fs.createWriteStream(filePath);

      const response = await axios.get(download_url, { responseType: "stream" });
      response.data.pipe(writer);

      await new Promise((resolve, reject) => {
        writer.on("finish", resolve);
        writer.on("error", reject);
      });

      const fileSize = fs.statSync(filePath).size;
      console.log("File size:", fileSize); // Debugging: File size

      if (fileSize > 26214400) {
        unlinkSync(filePath);
        return api.sendMessage("❌ File size exceeds the 25MB limit!", event.threadID);
      }

      api.unsendMessage(messageID);
      api.sendMessage({
        body: `🎵 Successfully Downloaded:\n\nTitle: ${title}`,
        attachment: createReadStream(filePath)
      }, event.threadID, () => unlinkSync(filePath));

    } catch (error) {
      console.error("Error in onReply:", error); // Debugging: Log errors
      api.sendMessage("⚠️ Failed to download the selected track.", event.threadID);
    }
  },

  onStart: async ({ api, event, args }) => {
    try {
      const input = args.join(" ");

      if (!input) {
        return api.sendMessage("🔍 Please provide a SoundCloud URL or search query.", event.threadID);
      }

      if (input.startsWith("https://soundcloud.com/")) {
        api.sendMessage("⏳ Processing direct link...", event.threadID);

        const apiUrl = `https://nayan-video-downloader.vercel.app/soundcloud?url=${encodeURIComponent(input)}`;
        console.log("Fetching:", apiUrl); // Debugging: API URL

        const { data } = await axios.get(apiUrl);
        console.log("API Response:", data); // Debugging: API response

        if (!data || !data.data || !data.data.download_url) {
          return api.sendMessage("⚠️ Failed to fetch track details.", event.threadID);
        }

        const { title, download_url } = data.data;
        const cacheDir = path.join(__dirname, "cache");

        if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir, { recursive: true });

        const filePath = path.join(cacheDir, `${title}.mp3`);
        const writer = fs.createWriteStream(filePath);

        const response = await axios.get(download_url, { responseType: "stream" });
        response.data.pipe(writer);

        await new Promise((resolve, reject) => {
          writer.on("finish", resolve);
          writer.on("error", reject);
        });

        api.sendMessage({
          body: `✅ Downloaded Successfully:\n\nTitle: ${title}`,
          attachment: createReadStream(filePath)
        }, event.threadID, () => unlinkSync(filePath));

      } else {
        api.sendMessage("🔍 Searching SoundCloud...", event.threadID);

        const searchApiUrl = `https://nayan-video-downloader.vercel.app/soundcloud-search?name=${encodeURIComponent(input)}&limit=6`;
        console.log("Fetching:", searchApiUrl); // Debugging: API URL

        const { data } = await axios.get(searchApiUrl);
        console.log("API Response:", data); // Debugging: API response

        if (!data || !data.results || data.results.length === 0) {
          return api.sendMessage("❌ No results found for your search.", event.threadID);
        }

        const results = data.results;
        const message = results.map((track, index) => `${index + 1}. ${track.title}`).join("\n\n");

        api.sendMessage(
          `🎧 Found ${results.length} tracks:\n\n${message}\n\nReply with the track number (1-${results.length}) to download.`,
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
      console.error("Error in onStart:", error); // Debugging: Log errors
      api.sendMessage("⚠️ An error occurred while processing your request.", event.threadID);
    }
  }
};
