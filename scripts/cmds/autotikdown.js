const fs = require("fs-extra");
const axios = require("axios");
const path = require("path");

module.exports = {

	threadStates: {},

	config: {
		name: 'autotik',
		version: '1.4',
		author: 'Kshitiz', //fixed by cliff
		countDown: 5,
		role: 0,
		shortDescription: 'Auto downloader for any media from URLs',
		longDescription: '',
		category: 'media',
		guide: {
			en: '{p}{n}',
		}
	},
	onStart: async function ({ api, event }) {
		const threadID = event.threadID;

		if (!this.threadStates[threadID]) {
			this.threadStates[threadID] = {
				autoTikEnabled: false,
			};
		}

		if (event.body.toLowerCase().includes('autotik')) {

			if (event.body.toLowerCase().includes('on')) {
				this.threadStates[threadID].autoTikEnabled = true;
				api.sendMessage("AutoTik is now ON.", event.threadID, event.messageID);
			} else if (event.body.toLowerCase().includes('off')) {
				this.threadStates[threadID].autoTikEnabled = false;
				api.sendMessage("AutoTik is now OFF.", event.threadID, event.messageID);
			} else {
				api.sendMessage("Type 'autotik on' to turn on and\n'autotik off' to turn off.", event.threadID, event.messageID);
			}
		}
	},
	onChat: async function ({ api, event }) {
		const threadID = event.threadID;

		if (this.threadStates[threadID] && this.threadStates[threadID].autoTikEnabled && this.checkLink(event.body)) {
			const { url } = this.checkLink(event.body);
			this.downLoad(url, api, event);
			api.setMessageReaction("©️", event.messageID, (err) => {}, true);
		}
	},
	downLoad: function (url, api, event) {
		const time = Date.now();
		const fileExtension = url.includes('mp4') ? 'mp4' : url.includes('jpg') || url.includes('png') ? 'jpg' : 'mp4'; // Default to 'mp4' for most cases
		const filePath = path.join(__dirname, `/cache/${time}.${fileExtension}`);

		console.log(`Fetching media from URL: ${url}`);

		axios({
			method: "GET",
			url: url,
			responseType: "arraybuffer"
		}).then(res => {
			fs.writeFileSync(filePath, Buffer.from(res.data, "utf-8"));
			const fileSize = fs.statSync(filePath).size / 1024 / 1024; // Convert size to MB

			if (fileSize > 25) {
				console.log("File size is too large, deleting file.");
				// Send a download link or notification for large files
				const downloadLink = "https://example.com/large-file"; // Replace with your actual hosting method
				return api.sendMessage(`The file is too large to be sent directly. You can download it from the following link: ${downloadLink}`, event.threadID, event.messageID);
			}

			console.log("File downloaded successfully, sending...");
			api.sendMessage({
				body: "Successful Download!",
				attachment: fs.createReadStream(filePath)
			}, event.threadID, () => fs.unlinkSync(filePath), event.messageID);
		}).catch(err => {
			console.error("Download failed:", err);
			api.sendMessage("An error occurred while downloading the media.", event.threadID, event.messageID);
		});
	},
	checkLink: function (url) {
		// Check if the URL starts with 'https://'
		if (url.startsWith("https://")) {
			return { url: url };
		}
		console.log("Invalid media link.");
		return null;
	}
};
