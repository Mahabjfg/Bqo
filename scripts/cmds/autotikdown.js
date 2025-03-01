const fs = require("fs-extra");
const axios = require("axios");
const path = require("path");

module.exports = {

	threadStates: {},

	config: {
		name: 'autotik',
		version: '1.5',
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
		const filePath = path.join(__dirname, `/cache/${time}.file`);

		console.log(`Fetching media from URL: ${url}`);

		// Make a GET request to the media URL to fetch the file
		axios({
			method: "GET",
			url: url,
			responseType: "arraybuffer"
		}).then(res => {
			// Check if the file type is video or image from content type
			const contentType = res.headers['content-type'];

			// Check for video or image file types
			let fileExtension = 'mp4'; // Default to mp4 for video
			if (contentType.includes('video')) {
				fileExtension = 'mp4'; // For video, save as .mp4
			} else if (contentType.includes('image')) {
				fileExtension = 'jpg'; // For image, save as .jpg
			}

			// Write the file to cache
			const file = path.join(__dirname, `/cache/${time}.${fileExtension}`);
			fs.writeFileSync(file, Buffer.from(res.data, "utf-8"));

			const fileSize = fs.statSync(file).size / 1024 / 1024; // Convert size to MB

			// Check if file size is over 25MB and notify user if so
			if (fileSize > 25) {
				console.log("File size is too large, deleting file.");
				// Send a download link or notification for large files
				const downloadLink = "https://example.com/large-file"; // Replace with your actual hosting method
				return api.sendMessage(`The file is too large to be sent directly. You can download it from the following link: ${downloadLink}`, event.threadID, event.messageID);
			}

			// If the file is small enough, send it as an attachment
			console.log("File downloaded successfully, sending...");
			api.sendMessage({
				body: "Successful Download!",
				attachment: fs.createReadStream(file)
			}, event.threadID, () => fs.unlinkSync(file), event.messageID);
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
