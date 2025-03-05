const { getTime } = global.utils;
const axios = require("axios");
const fs = require("fs");
const path = require("path");

if (!global.temp.welcomeEvent) global.temp.welcomeEvent = {};

module.exports = {
	config: {
		name: "welcome",
		version: "2.0",
		author: "NTKhang & Customized",
		category: "events"
	},

	langs: {
		en: {
			session1: "morning",
			session2: "noon",
			session3: "afternoon",
			session4: "evening",
			welcomeMessage: "Thank you for inviting me to the group!\nBot prefix: %1\nTo view the list of commands, please enter: %1help",
			multiple1: "you",
			multiple2: "you guys",
			defaultWelcomeMessage: `Hello {userName}.\nWelcome {multiple} To the group: {boxName}\nHave a nice {session}!`
		}
	},

	onStart: async ({ threadsData, message, event, api, getLang }) => {
		if (event.logMessageType == "log:subscribe") {
			return async function () {
				const hours = getTime("HH");
				const { threadID } = event;
				const { nickNameBot } = global.GoatBot.config;
				const prefix = global.utils.getPrefix(threadID);
				const dataAddedParticipants = event.logMessageData.addedParticipants;

				// If bot is added
				if (dataAddedParticipants.some((item) => item.userFbId == api.getCurrentUserID())) {
					if (nickNameBot) api.changeNickname(nickNameBot, threadID, api.getCurrentUserID());
					return message.send(getLang("welcomeMessage", prefix));
				}

				if (!global.temp.welcomeEvent[threadID]) {
					global.temp.welcomeEvent[threadID] = {
						joinTimeout: null,
						dataAddedParticipants: []
					};
				}

				global.temp.welcomeEvent[threadID].dataAddedParticipants.push(...dataAddedParticipants);
				clearTimeout(global.temp.welcomeEvent[threadID].joinTimeout);

				global.temp.welcomeEvent[threadID].joinTimeout = setTimeout(async function () {
					const threadData = await threadsData.get(threadID);
					if (threadData.settings.sendWelcomeMessage == false) return;

					const dataAddedParticipants = global.temp.welcomeEvent[threadID].dataAddedParticipants;
					const threadName = threadData.threadName;
					const userName = [], mentions = [];
					let multiple = dataAddedParticipants.length > 1 ? true : false;

					for (const user of dataAddedParticipants) {
						userName.push(user.fullName);
						mentions.push({ tag: user.fullName, id: user.userFbId });
					}

					if (userName.length == 0) return;
					let { welcomeMessage = getLang("defaultWelcomeMessage") } = threadData.data;
					welcomeMessage = welcomeMessage
						.replace(/\{userName\}/g, userName.join(", "))
						.replace(/\{boxName\}/g, threadName)
						.replace(/\{multiple\}/g, multiple ? getLang("multiple2") : getLang("multiple1"))
						.replace(/\{session\}/g, hours <= 10 ? getLang("session1") : hours <= 12 ? getLang("session2") : hours <= 18 ? getLang("session3") : getLang("session4"));

					const form = { body: welcomeMessage, mentions };

					// **Fetch Random Video from JSON Server**
					try {
						const response = await axios.get("https://raw.githubusercontent.com/MR-MAHABUB-004/MAHABUB-BOT-STORAGE/refs/heads/main/events/welcome.json");
						const videoList = response.data.videos; // JSON file এর "videos" array থেকে data নিচ্ছি
						const randomVideoURL = videoList[Math.floor(Math.random() * videoList.length)].url;

						// Download the video and store it temporarily
						const videoPath = path.join(__dirname, "temp_video.mp4");
						const videoResponse = await axios({
							url: randomVideoURL,
							method: "GET",
							responseType: "stream"
						});

						// Save video to local storage
						const writer = fs.createWriteStream(videoPath);
						videoResponse.data.pipe(writer);

						writer.on("finish", () => {
							form.attachment = fs.createReadStream(videoPath);
							message.send(form);
						});

						writer.on("error", (err) => {
							console.error("Error saving video:", err);
						});
					} catch (error) {
						console.error("Error fetching video:", error.message);
						message.send(form);
					}

					delete global.temp.welcomeEvent[threadID];
				}, 1500);
			};
		}
	}
};
