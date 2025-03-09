const fs = require('fs');
const axios = require('axios');

module.exports = {
	config: {
		name: "audio",
		version: "1.0",
		author: "AceGun",
		countDown: 5,
		role: 0,
		shortDescription: "no prefix",
		longDescription: "no prefix",
		category: "no prefix",
	},
	onStart: async function () { },

	onChat: async function ({ event, message }) {
		if (event.body) {
			const word = event.body.toLowerCase();
			let audioURL = null;

			// 🔹 Map trigger words to Google Drive Direct Links
			switch (word) {
				case "women":
					audioURL = "https://docs.google.com/uc?export=download&id=1A2B3C4D5E6F7G8H9I0";
					break;
				case "yamate":
					audioURL = "https://docs.google.com/uc?export=download&id=YOUR_FILE_ID_HERE";
					break;
				case "dazai":
					audioURL = "https://docs.google.com/uc?export=download&id=YOUR_FILE_ID_HERE";
					break;
				case "ara":
					audioURL = "https://docs.google.com/uc?export=download&id=YOUR_FILE_ID_HERE";
					break;
				default:
					return;
			}

			if (audioURL) {
				try {
					// 🔹 Fetch the MP3 file from Google Drive
					const response = await axios({
						url: audioURL,
						method: 'GET',
						responseType: 'stream'
					});

					const audioPath = `./temp_audio.mp3`;
					const writer = fs.createWriteStream(audioPath);
					response.data.pipe(writer);

					writer.on('finish', async () => {
						await message.reply({
							body: `「 ${word.charAt(0).toUpperCase() + word.slice(1)} 」`,
							attachment: fs.createReadStream(audioPath),
						});

						// 🔹 Delete temp file after sending
						fs.unlinkSync(audioPath);
					});
				} catch (error) {
					console.error("❌ Error downloading file:", error);
					message.reply("Failed to fetch the audio file.");
				}
			}
		}
	}
};
