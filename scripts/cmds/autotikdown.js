const fs = require("fs-extra");
const axios = require("axios");
const path = require("path");

module.exports = {

	threadStates: {},

	config: {
		name: 'autotik',
		version: '1.2',
		author: 'Kshitiz', //fixed by cliff
		countDown: 5,
		role: 0,
		shortDescription: 'auto media downloader for TikTok, Facebook, Instagram, YouTube, Pinterest',
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
			const { url, mediaType } = this.checkLink(event.body);
			this.downLoad(url, api, event, mediaType);
			api.setMessageReaction("©️", event.messageID, (err) => {}, true);
		}
	},
	downLoad: function (url, api, event, mediaType) {
		const time = Date.now();
		const ext = mediaType === 'video' ? 'mp4' : 'jpg'; // Determine file extension based on media type
		const filePath = path.join(__dirname, `/cache/${time}.${ext}`);

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
				return api.sendMessage("The file is too large, cannot be sent", event.threadID, () => fs.unlinkSync(filePath), event.messageID);
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
	getLink: function (url) {
		// Handle TikTok URL
		if (url.includes("tiktok") && url.includes("video")) {
			return this.getTikTokVideo(url);
		}
		// Handle Facebook URL
		else if (url.includes("facebook") && url.includes("video")) {
			return this.getFacebookVideo(url);
		}
		// Handle Instagram URL
		else if (url.includes("instagram") && url.includes("p")) {
			return this.getInstagramImage(url);
		}
		// Handle YouTube URL
		else if (url.includes("youtube") || url.includes("youtu.be")) {
			return this.getYouTubeVideo(url);
		}
		// Handle Pinterest URL
		else if (url.includes("pinterest")) {
			return this.getPinterestImage(url);
		}
		// If URL doesn't match any of the supported formats
		else {
			return null;
		}
	},
	getTikTokVideo: function (url) {
		return new Promise((resolve, reject) => {
			axios({
				method: "GET",
				url: `https://nayan-video-downloader.vercel.app/alldown?=${url}`
			}).then(res => {
				if (res.data && res.data.data && res.data.data.play) {
					resolve({ url: res.data.data.play, mediaType: 'video' });
				} else {
					reject("Invalid response format.");
				}
			}).catch(err => {
				console.error("Error while fetching TikTok video URL:", err);
				reject(err);
			});
		});
	},
	getFacebookVideo: function (url) {
		// Placeholder for Facebook video downloader logic
		// You could use third-party services or scraping techniques for Facebook video downloading
		return { url: url, mediaType: 'video' }; // Example, you would need to replace this with a valid API or service
	},
	getInstagramImage: function (url) {
		// Placeholder for Instagram image downloader logic
		// Similar to TikTok, you might need a scraping tool or API for Instagram images
		return { url: url, mediaType: 'image' }; // Example, replace with actual logic
	},
	getYouTubeVideo: function (url) {
		// Placeholder for YouTube video downloader logic
		// Use a YouTube download service like youtube-dl or an API to get the video download URL
		return { url: url, mediaType: 'video' }; // Example, replace with actual logic
	},
	getPinterestImage: function (url) {
		// Placeholder for Pinterest image downloader logic
		// Pinterest images could be downloaded using an API or scraping
		return { url: url, mediaType: 'image' }; // Example, replace with actual logic
	},
	checkLink: function (url) {
		const result = this.getLink(url);
		if (result) {
			return result;
		}
		console.log("Invalid media link.");
		return null;
	}
};
