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
  const apiUrl = `https://simsimi-99qa.onrender.com/sim`; // SimSimi API URL
  const userMessage = args.join(" ").toLowerCase();

  try {
    if (!args[0]) {
      return api.sendMessage("Say something! 😊", event.threadID, event.messageID);
    }

    // Request to SimSimi API
    const response = await axios.get(`${apiUrl}?reply=${encodeURIComponent(userMessage)}`);
    const reply = response.data.message || "I couldn't understand that.";

    api.sendMessage(reply, event.threadID, event.messageID);
  } catch (error) {
    console.error(error);
    api.sendMessage("Error: Unable to fetch response.", event.threadID, event.messageID);
  }
};

module.exports.onReply = async ({ api, event }) => {
  try {
    if (event.type === "message_reply") {
      const apiUrl = `https://simsimi-99qa.onrender.com/sim`; // SimSimi API URL
      const response = await axios.get(`${apiUrl}?reply=${encodeURIComponent(event.body.toLowerCase())}`);
      const reply = response.data.message || "I couldn't understand that.";

      api.sendMessage(reply, event.threadID, event.messageID);
    }
  } catch (error) {
    api.sendMessage(`Error: ${error.message}`, event.threadID, event.messageID);
  }
};

module.exports.onChat = async ({ api, event }) => {
  try {
    const body = event.body ? event.body.toLowerCase() : "";
    if (body.startsWith("baby") || body.startsWith("bby") || body.startsWith("janu")) {
      const userMessage = body.replace(/^\S+\s*/, "");
      if (!userMessage) return api.sendMessage("কথা দাও তুমি আমাকে পটিয়ে নিবা!🥺", event.threadID, event.messageID);

      const apiUrl = `https://simsimi-99qa.onrender.com/sim`; // SimSimi API URL
      const response = await axios.get(`${apiUrl}?reply=${encodeURIComponent(userMessage)}`);
      const reply = response.data.message || "I couldn't understand that.";

      api.sendMessage(reply, event.threadID, event.messageID);
    }
  } catch (error) {
    api.sendMessage(`Error: ${error.message}`, event.threadID, event.messageID);
  }
};
