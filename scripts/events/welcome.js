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
			session1: "𝗺𝗼𝗿𝗻𝗶𝗻𝗴",
			session2: "𝗻𝗼𝗼𝗻",
			session3: "𝗮𝗳𝘁𝗲𝗿𝗻𝗼𝗼𝗻",
			session4: "𝗲𝘃𝗲𝗻𝗶𝗻𝗴",
			welcomeMessage: "━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n❁𝐌𝐀𝐇𝐀𝐁𝐔𝐁𓇽𝐁𝐎𝐓☔︎ 𝗖𝗢𝗡𝗡𝗘𝗖𝗧𝗘𝗗 𝗦𝗨𝗖𝗖𝗘𝗦𝗙𝗨𝗟𝗟\n━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n𝗕𝗢𝗧 𝗔𝗗𝗠𝗜𝗡: 𝐌𝐀𝐇𝐀𝐁𝐔𝐁 𝐑𝐀𝐇𝐌𝐀𝐍\n━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n𝗙𝗔𝗖𝗘𝗕𝗢𝗢𝗞: https://www.facebook.com/www.xnxx.com140\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n𝗪𝗛𝗔𝗧𝗦 𝗔𝗣𝗣: wa.me/+8801613356376\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n𝗧𝗘𝗟𝗘𝗚𝗥𝗔𝗠: t.me/Mahabub_x_Rahman\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━ ",
			multiple1: "𝘆𝗼𝘂",
			multiple2: "𝘆𝗼𝘂 𝗴𝘂𝘆𝘀",
			defaultWelcomeMessage: `𝙰𝚂𝚂𝙰𝙻𝙰𝙼𝚄𝚆𝙰𝙻𝙰𝙸𝙺𝚄𝙼 {userName}  𝚆𝙴𝙻𝙻𝙲𝙾𝙼𝙴  \n𝚆𝙴𝙻𝙻𝙲𝙾𝙼𝙴  {multiple} 𝚃𝙾 𝚃𝙷𝙴 𝙲𝙷𝙰𝚃 𝙱𝙾𝚇: {boxName}\n𝙷𝙰𝚅𝙴 𝙰 𝙽𝙸𝙲𝙴  {session}🐼♲︎︎︎\n𝙰𝚞𝚝𝚑𝚘𝚛: MR᭄﹅ MAHABUB﹅ メꪜ...`
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
