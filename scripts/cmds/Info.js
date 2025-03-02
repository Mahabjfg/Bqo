const axios = require('axios');
const moment = require('moment-timezone');

module.exports = {
    config: {
        name: "info",
        aliases: ["inf", "in4"],
        version: "2.0",
        author: "VEX_ADNAN",
        countDown: 5,
        role: 0,
        shortDescription: { en: "Sends bot and admin info with an image." },
        longDescription: { en: "Sends bot and admin info with an image." },
        category: "Information",
        guide: { en: "{pn}" }
    },

    onStart: async function ({ message }) {
        this.sendInfo(message);
    },

    onChat: async function ({ event, message }) {
        if (event.body && event.body.trim().toLowerCase() === "info") {
            this.sendInfo(message);
        }
    },

    sendInfo: async function (message) {
        const botName = "𝗠𝗔𝗛𝗔𝗕𝗨𝗕-𝗕𝗢𝗧";
        const botPrefix = "/";
        const authorName = "𝗠𝗔𝗛𝗔𝗕𝗨𝗕 𝗥𝗔𝗛𝗠𝗔𝗡";
        const authorFB = "m.me/www.xnxx.com140";
        const authorInsta = "@mahabub_rahman_404";
        const status = "𝚂𝙸𝙽𝙶𝙻𝙴..!";

        const now = moment().tz('Asia/Dhaka');
        const date = now.format('dddd, MMMM Do YYYY');
        const time = now.format('h:mm:ss A');

        const uptime = process.uptime();
        const seconds = Math.floor(uptime % 60);
        const minutes = Math.floor((uptime / 60) % 60);
        const hours = Math.floor((uptime / (60 * 60)) % 24);
        const days = Math.floor(uptime / (60 * 60 * 24));
        const uptimeString = `${days}d ${hours}h ${minutes}m ${seconds}s`;

        try {
            const response = await axios.get("https://raw.githubusercontent.com/MR-MAHABUB-004/MAHABUB-BOT-STORAGE/refs/heads/main/Commands/Mahabub.json");
            const urls = response.data;
            const link = urls[Math.floor(Math.random() * urls.length)];

            message.reply({
                body: `╭────────────◊
├‣ 𝐁𝐨𝐭 & 𝐎𝐰𝐧𝐞𝐫 𝐈𝐧𝐟𝐨𝐫𝐦𝐚𝐭𝐢𝐨𝐧 
├‣ 𝐍𝐚𝐦𝐞: ${authorName}
├‣ 𝐁𝐨𝐭 𝐍𝐚𝐦𝐞: ${botName}
├‣ 𝐏𝐫𝐞𝐟𝐢𝐱: ${botPrefix}
├‣ 𝐅𝐛: ${authorFB}
├‣ 𝐈𝐧𝐬𝐭𝐚𝐠𝐫𝐚𝐦: ${authorInsta}
├‣ 𝐑𝐞𝐥𝐚𝐭𝐢𝐨𝐧𝐬𝐡𝐢𝐩: ${status} 
├‣ 𝐃𝐚𝐭𝐞: ${date}
├‣ 𝐓𝐢𝐦𝐞: ${time}
├‣ 𝐔𝐩𝐭𝐢𝐦𝐞: ${uptimeString}
╰────────────◊`,
                attachment: await global.utils.getStreamFromURL(link)
            });
        } catch (error) {
            console.error("Error fetching JSON data:", error);
            message.reply("❌ Error fetching bot info. Please try again later.");
        }
    }
};
