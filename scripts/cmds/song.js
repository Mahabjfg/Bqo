const axios = require("axios");
const fs = require("fs");

module.exports = {
  config: {
    name: "song",
    category: "youtube song downloader",
    author: "Romim",
  },

  onStart: async ({ message, args }) => {
    const query = args.join(" ");
    if (!query) return message.reply("Please provide a search query!");

    try {
      const searchResponse = await axios.get(`https://www.noobz-api.rf.gd/api/yts?name=${query}`);
      const data = searchResponse.data.data;

      if (!data.length) return message.reply("No results found!");

      const selectedVideo = data[0]; // Automatically select the first result

      message.reply(`Downloading: ${selectedVideo.name} (${selectedVideo.dur})...`);

      const downloadResponse = await axios.get(`https://www.noobz-api.rf.gd/api/ytmp3?query=${selectedVideo.id}&format=mp3`);
      const songUrl = downloadResponse.data.data;

      // Ensure cache directory exists
      const cacheDir = __dirname + "/cache/";
      if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir, { recursive: true });

      const filePath = cacheDir + `${selectedVideo.name}.mp3`;

      // Download the MP3 file
      const response = await axios.get(songUrl, { responseType: "arraybuffer" });
      fs.writeFileSync(filePath, Buffer.from(response.data, "binary"));

      // Shorten URL
      const tinyUrlResponse = await axios.get(`https://tinyurl.com/api-create.php?url=${songUrl}`);
      const tinyUrl = tinyUrlResponse.data;

      await message.reply({
        body: `Here's your requested song: ${selectedVideo.name}\nDuration: ${selectedVideo.dur}\nDownload Link: ${tinyUrl}`,
        attachment: fs.createReadStream(filePath),
      });

    } catch (error) {
      console.error("Download error:", error);
      message.reply("Error: Unable to fetch the song. Please try again later.");
    }
  },
};
