const fs = require('fs');
const path = require('path');

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
			const folderPath = path.join(__dirname, "noprefix"); // Folder where MP3s are stored

			const audioResponses = {
				"🙈","🙉","🙊","🐵": { text: "কিরে বানর তোর কি হলো🐒", file: "banortor.mp3" },
				"yamate": { text: "Yamate 🥵", file: "yamate.mp3" },
				"dazai": { text: "ahhh~", file: "Dazai.mp3" },
				"ara": { text: "ara ara", file: "ara.mp3" },
				"good night": { text: "Good Night 🌉", file: "night.mp3" },
				"sus": { text: "ඞ", file: "sus.mp3" },
				"good morning": { text: "Good Morning 🌄", file: "gm.mp3" },
				"yourmom": { text: "Bujis ki nai?", file: "yourmom.mp3" },
				"machikney": { text: "Machikney", file: "machikney.mp3" },
				"randi": { text: "Randi ko Chora", file: "randi.mp3" },
				"sachiin": { text: "GAYY", file: "sachiin.mp3" },
				"omg": { text: "OMG WoW 😳", file: "omg.mp3" }
			};

			if (audioResponses[word]) {
				const filePath = path.join(folderPath, audioResponses[word].file);

				// Check if file exists before sending
				if (fs.existsSync(filePath)) {
					return message.reply({
						body: `「 ${audioResponses[word].text} 」`,
						attachment: fs.createReadStream(filePath),
					});
				} else {
					return message.reply(`Error: File "${audioResponses[word].file}" not found!`);
				}
			}
		}
	}
};
