const axios = require('axios');

module.exports.config = {
  name: "bby",
  aliases: ["baby", "bbe", "babe"],
  version: "6.9.0",
  author: "dipto",
  countDown: 0,
  role: 0,
  description: "better than all sim simi",
  category: "chat",
  guide: {
    en: "{pn} [anyMessage]"
  }
};

module.exports.onStart = async ({ api, event, args }) => {
  const apiUrl = `https://simsimi-99qa.onrender.com/sim`;
  const userMessage = args.join(" ").toLowerCase();

  try {
    if (!args[0]) {
      const randomReplies = [
        "হুম বলো? 😊", 
        "কি বলবা আমাকে? 😏", 
        "আমি কিন্তু তোমার জন্য ওয়েট করছিলাম! 😍", 
        "বলো বেবি, কেমন আছো? 🥰"
      ];
      return api.sendMessage(randomReplies[Math.floor(Math.random() * randomReplies.length)], event.threadID, event.messageID);
    }

    // SimSimi API request
    const response = await axios.get(`${apiUrl}?reply=${encodeURIComponent(userMessage)}`);
    const reply = response.data.message || "আমি বুঝতে পারলাম না।";

    api.sendMessage(reply, event.threadID, event.messageID);
  } catch (error) {
    console.error(error);
    api.sendMessage("Error: Unable to fetch response.", event.threadID, event.messageID);
  }
};

module.exports.onReply = async ({ api, event }) => {
  try {
    if (event.type === "message_reply") {
      const apiUrl = `https://simsimi-99qa.onrender.com/sim`;
      const response = await axios.get(`${apiUrl}?reply=${encodeURIComponent(event.body.toLowerCase())}`);
      const reply = response.data.message || "আমি বুঝতে পারলাম না।";

      api.sendMessage(reply, event.threadID, event.messageID);
    }
  } catch (error) {
    api.sendMessage(`Error: ${error.message}`, event.threadID, event.messageID);
  }
};

module.exports.onChat = async ({ api, event }) => {
  try {
    const body = event.body ? event.body.toLowerCase() : "";
    if (body === "bby" || body === "baby" || body === "janu") {
      const randomReplies = [
        "হুম বলো? 😊", 
        "কি বলবা আমাকে? 😏", 
        "আমি কিন্তু তোমার জন্য ওয়েট করছিলাম! 😍", 
        "বলো বেবি, কেমন আছো? 🥰"
      ];
      return api.sendMessage(randomReplies[Math.floor(Math.random() * randomReplies.length)], event.threadID, event.messageID);
    }

    const apiUrl = `https://simsimi-99qa.onrender.com/sim`;
    const response = await axios.get(`${apiUrl}?reply=${encodeURIComponent(body)}`);
    const reply = response.data.message || "আমি বুঝতে পারলাম না।";

    api.sendMessage(reply, event.threadID, event.messageID);
  } catch (error) {
    api.sendMessage(`Error: ${error.message}`, event.threadID, event.messageID);
  }
};
