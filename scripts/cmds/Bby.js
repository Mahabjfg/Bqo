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
  const link = `https://simsimi-99qa.onrender.com/sim`; // SimSimi API URL
  const dipto = args.join(" ").toLowerCase();
  const uid = event.senderID;

  try {
    if (!args[0]) {
      const ran = ["Bolo baby", "hum", "type help baby", "type !baby hi"];
      return api.sendMessage(ran[Math.floor(Math.random() * ran.length)], event.threadID, event.messageID);
    }

    // Request to SimSimi API
    const response = await axios.get(`${link}?reply=${encodeURIComponent(dipto)}`);
    const reply = response.data.response || "I couldn't understand that.";

    api.sendMessage(reply, event.threadID, (error, info) => {
      global.GoatBot.onReply.set(info.messageID, {
        commandName: this.config.name,
        type: "reply",
        messageID: info.messageID,
        author: event.senderID,
        reply
      });
    }, event.messageID);
  } catch (e) {
    console.log(e);
    api.sendMessage("Error: Unable to fetch response.", event.threadID, event.messageID);
  }
};

module.exports.onReply = async ({ api, event }) => {
  try {
    if (event.type === "message_reply") {
      const link = `https://simsimi-99qa.onrender.com/sim`; // SimSimi API URL
      const response = await axios.get(`${link}?reply=${encodeURIComponent(event.body.toLowerCase())}`);
      const reply = response.data.response || "I couldn't understand that.";

      await api.sendMessage(reply, event.threadID, (error, info) => {
        global.GoatBot.onReply.set(info.messageID, {
          commandName: this.config.name,
          type: "reply",
          messageID: info.messageID,
          author: event.senderID,
          reply
        });
      }, event.messageID);
    }
  } catch (err) {
    return api.sendMessage(`Error: ${err.message}`, event.threadID, event.messageID);
  }
};

module.exports.onChat = async ({ api, event, message }) => {
  try {
    const body = event.body ? event.body.toLowerCase() : "";
    if (body.startsWith("baby") || body.startsWith("bby") || body.startsWith("janu")) {
      const arr = body.replace(/^\S+\s*/, "");
      if (!arr) return message.reply("কথা দাও তুমি আমাকে পটিয়ে নিবা!🥺");

      const link = `https://simsimi-99qa.onrender.com/sim`; // SimSimi API URL
      const response = await axios.get(`${link}?reply=${encodeURIComponent(arr)}`);
      const reply = response.data.response || "I couldn't understand that.";

      await api.sendMessage(reply, event.threadID, (error, info) => {
        global.GoatBot.onReply.set(info.messageID, {
          commandName: this.config.name,
          type: "reply",
          messageID: info.messageID,
          author: event.senderID,
          reply
        });
      }, event.messageID);
    }
  } catch (err) {
    return api.sendMessage(`Error: ${err.message}`, event.threadID, event.messageID);
  }
};
