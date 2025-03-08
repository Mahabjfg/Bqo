const axios = require("axios");
const fs = require("fs");
const { createReadStream, unlinkSync } = require("fs-extra");

module.exports = {
  config: {
    name: "scloud",
    category: "cdna",
    author: "Mostakim",
  },

  onReply: async ({ api, event, handleReply }) => {
    try {
      const { results, messageID } = handleReply;
      const choice = event.body - 1;

      if (isNaN(choice) || choice < 0 || choice >= results.length) {
        api.unsendMessage(messageID);
        return api.sendMessage("❌ Invalid selection! Please choose a valid number.", event.threadID);
      }

      const track = results[choice];
      api.sendMessage("⬇️ Downloading track...", event.threadID);
      
      const apiUrl = `https://nayan-video-downloader.vercel.app/soundcloud?url=${encodeURIComponent(track.permalink_url)}`;
      console.log("Fetching:", apiUrl);

      const { data } = await axios.get(apiUrl);
      console.log("API Response:", JSON.stringify(data, null, 2));

      if (!data.data || !data.data.download_url) {
        return api.sendMessage("⚠️ Failed to fetch the download link!", event.threadID);
      }

      const { title, download_url } = data.data;
      const filePath = `${__dirname}/cache/${title}.mp3`;

      console.log("Starting download:", download_url);
      const writer = fs.createWriteStream(filePath);
      const response = await axios.get(download_url, { responseType: "stream" });

      response.data.pipe(writer);

      writer.on("finish", async () => {
        console.log("Download complete:", filePath);

        const fileSize = fs.statSync(filePath).size;
        console.log("File size:", fileSize);

        if (fileSize > 26214400) {
          unlinkSync(filePath);
          return api.sendMessage("❌ File size exceeds 25MB limit!", event.threadID);
        }

        api.unsendMessage(messageID);
        api.sendMessage(
          {
            body: `🎵 Successfully Downloaded:\n\nTitle: ${title}`,
            attachment: createReadStream(filePath),
          },
          event.threadID,
          (err) => {
            if (err) {
              console.error("Error sending audio:", err);
              return api.sendMessage("⚠️ Failed to send the audio file.", event.threadID);
            }
            unlinkSync(filePath);
          }
        );
      });

      writer.on("error", (err) => {
        console.error("Download error:", err);
        return api.sendMessage("⚠️ Error downloading the file.", event.threadID);
      });
    } catch (error) {
      console.error("Error in onReply:", error);
      api.sendMessage("⚠️ Failed to process your request.", event.threadID);
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
        console.log("Fetching:", apiUrl);

        const { data } = await axios.get(apiUrl);
        console.log("API Response:", JSON.stringify(data, null, 2));

        if (!data.data || !data.data.download_url) {
          return api.sendMessage("⚠️ Failed to fetch the download link!", event.threadID);
        }

        const { title, download_url } = data.data;
        const filePath = `${__dirname}/cache/${title}.mp3`;

        console.log("Starting download:", download_url);
        const writer = fs.createWriteStream(filePath);
        const response = await axios.get(download_url, { responseType: "stream" });

        response.data.pipe(writer);

        writer.on("finish", async () => {
          console.log("Download complete:", filePath);

          const fileSize = fs.statSync(filePath).size;
          console.log("File size:", fileSize);

          if (fileSize > 26214400) {
            unlinkSync(filePath);
            return api.sendMessage("❌ File size exceeds 25MB limit!", event.threadID);
          }

          api.sendMessage(
            {
              body: `✅ Downloaded Successfully:\n\nTitle: ${title}`,
              attachment: createReadStream(filePath),
            },
            event.threadID,
            (err) => {
              if (err) {
                console.error("Error sending audio:", err);
                return api.sendMessage("⚠️ Failed to send the audio file.", event.threadID);
              }
              unlinkSync(filePath);
            }
          );
        });

        writer.on("error", (err) => {
          console.error("Download error:", err);
          return api.sendMessage("⚠️ Error downloading the file.", event.threadID);
        });
      } else {
        api.sendMessage("🔍 Searching SoundCloud...", event.threadID);

        const searchUrl = `https://nayan-video-downloader.vercel.app/soundcloud-search?name=${encodeURIComponent(input)}&limit=6`;
        console.log("Searching:", searchUrl);

        const { data } = await axios.get(searchUrl);
        console.log("Search API Response:", JSON.stringify(data, null, 2));

        if (!data.results || data.results.length === 0) {
          return api.sendMessage("❌ No results found for your search.", event.threadID);
        }

        const results = data.results;
        const message = results.map((track, index) => `${index + 1}. ${track.title}`).join("\n\n");

        api.sendMessage(
          `🎧 Found ${results.length} tracks:\n\n${message}\n\nReply with the track number (1-${results.length}) to download.`,
          event.threadID,
          (err, info) => {
            if (err) {
              console.error("Error sending track list:", err);
              return;
            }

            global.GoatBot.onReply.set(info.messageID, {
              type: "reply",
              name: this.config.name,
              messageID: info.messageID,
              author: event.senderID,
              results: results,
            });
          }
        );
      }
    } catch (error) {
      console.error("Error in onStart:", error);
      api.sendMessage("⚠️ An error occurred while processing your request.", event.threadID);
    }
  },
};
