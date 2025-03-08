const axios = require("axios");
const fs = require("fs");
const { createReadStream, unlinkSync, ensureDirSync } = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "scloud",
    category: 'cdna ',
    author: 'Mostakim x Mahabub'
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

      if (!data || !data.data || !data.data.download_url) {
        return api.sendMessage("⚠️ Could not retrieve download link. Please try again.", event.threadID);
      }

      const { title, download_url } = data.data;
      const filePath = path.join(__dirname, "cache", `${title}.mp3`);

    
      ensureDirSync(path.dirname(filePath));

      const writer = fs.createWriteStream(filePath);
      const response = await axios.get(download_url, { responseType: "stream" });

      response.data.pipe(writer);

      writer.on("finish", () => {
        const fileSize = fs.statSync(filePath).size;
        if (fileSize > 26214400) { // 25MB limit
          unlinkSync(filePath);
          return api.sendMessage("❌ File size exceeds 25MB limit!", event.threadID);
        }

        api.unsendMessage(messageID);
        api.sendMessage({
          body: `🎵 Successfully Downloaded:\n\nTitle: ${title}`,
          attachment: createReadStream(filePath)
        }, event.threadID, () => unlinkSync(filePath));
      });

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
        return;
      }

      if (input.startsWith("https://soundcloud.com/")) {
        api.sendMessage("⏳ Processing direct link...", event.threadID);

        const { data } = await axios.get(
          `https://nayan-video-downloader.vercel.app/soundcloud?url=${input}`
        );

        if (!data || !data.data || !data.data.download_url) {
          return api.sendMessage("⚠️ Could not retrieve download link. Please try again.", event.threadID);
        }

        const { title, download_url } = data.data;
        const filePath = path.join(__dirname, "cache", `${title}.mp3`);

        // Ensure the cache directory exists
        ensureDirSync(path.dirname(filePath));

        const writer = fs.createWriteStream(filePath);
        const response = await axios.get(download_url, { responseType: "stream" });
        response.data.pipe(writer);

        writer.on("finish", () => {
          api.sendMessage({
            body: `✅ Downloaded Successfully:\n\nTitle: ${title}`,
            attachment: createReadStream(filePath)
          }, event.threadID, () => unlinkSync(filePath));
        });

        writer.on("error", (error) => {
          console.error("Error writing file:", error);
          api.sendMessage("⚠️ Failed to download the track.", event.threadID);
        });

      } else {
        api.sendMessage("🔍 Searching SoundCloud...", event.threadID);

        const { data } = await axios.get(
          `https://nayan-video-downloader.vercel.app/soundcloud-search?name=${encodeURIComponent(input)}&limit=6`
        );

        if (!data.results || !data.results.length) {
          api.sendMessage("❌ No results found for your search", event.threadID);
          return;
        }

        const results = data.results;
        const firstResult = results[0];

        api.sendMessage("⬇️ Downloading the first result...", event.threadID);

        const { title, permalink_url } = firstResult;

        const downloadData = await axios.get(
          `https://nayan-video-downloader.vercel.app/soundcloud?url=${permalink_url}`
        );

        if (!downloadData || !downloadData.data || !downloadData.data.download_url) {
          return api.sendMessage("⚠️ Could not retrieve download link. Please try again.", event.threadID);
        }

        const { download_url } = downloadData.data.data;
        const filePath = path.join(__dirname, "cache", `${title}.mp3`);

        
        ensureDirSync(path.dirname(filePath));

        const writer = fs.createWriteStream(filePath);
        const response = await axios.get(download_url, { responseType: "stream" });
        response.data.pipe(writer);

        writer.on("finish", () => {
          const fileSize = fs.statSync(filePath).size;

          if (fileSize > 26214400) { 
            unlinkSync(filePath);
            return api.sendMessage("❌ File size exceeds 25MB limit!", event.threadID);
          }

          api.sendMessage({
            body: `🎵 Successfully Downloaded:\n\nTitle: ${title}`,
            attachment: createReadStream(filePath)
          }, event.threadID, () => unlinkSync(filePath));
        });

        writer.on("error", (error) => {
          console.error("Error writing file:", error);
          api.sendMessage("⚠️ Failed to download the track.", event.threadID);
        });
      }
    } catch (error) {
      console.error("Error in onStart:", error);
      api.sendMessage("⚠️ An error occurred while processing your request", event.threadID);
    }
  }
};
