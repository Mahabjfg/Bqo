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

module.exports.onStart = async ({ api, event, args, usersData }) => {
  const senderID = event.senderID;  // Get the sender's ID
  const senderName = (await usersData.get(senderID)).name; // Get the sender's name

  try {
    // If the user just types "bby", give a random reply with username mention
    if (args[0].toLowerCase() === "bby") {
      const randomReplies = [
        "হুম বলো? 😊", 
        "কি বলবা আমাকে? 😏", 
        "আমি কিন্তু তোমার জন্য ওয়েট করছিলাম! 😍", 
        "বলো বেবি, কেমন আছো? 🥰"
      ];
      const reply = randomReplies[Math.floor(Math.random() * randomReplies.length)];
      
      // Send message with sender's username mention
      return api.sendMessage({
        body: `@${senderName} ${reply}`, // Mention the sender's name
      }, event.threadID, event.messageID);
    }

    // If there are more arguments, fallback to SimSimi API
    const userMessage = args.join(" ").toLowerCase();
    const apiUrl = `https://simsimi-99qa.onrender.com/sim`; // SimSimi API URL
    const response = await axios.get(`${apiUrl}?reply=${encodeURIComponent(userMessage)}`);
    const reply = response.data.message || "আমি বুঝতে পারলাম না।";

    api.sendMessage({
      body: `@${senderName} ${reply}`,
    }, event.threadID, event.messageID);
  } catch (error) {
    console.error(error);
    api.sendMessage("Error: Unable to fetch response.", event.threadID, event.messageID);
  }
};

module.exports.onReply = async ({ api, event, usersData }) => {
  try {
    if (event.type === "message_reply") {
      const apiUrl = `https://simsimi-99qa.onrender.com/sim`; // SimSimi API URL
      const senderID = event.senderID;  // Get the sender's ID
      const senderName = (await usersData.get(senderID)).name; // Get the sender's name
      const response = await axios.get(`${apiUrl}?reply=${encodeURIComponent(event.body.toLowerCase())}`);
      const reply = response.data.message || "আমি বুঝতে পারলাম না।";

      api.sendMessage({
        body: `@${senderName} ${reply}`,
      }, event.threadID, event.messageID);
    }
  } catch (error) {
    api.sendMessage(`Error: ${error.message}`, event.threadID, event.messageID);
  }
};

module.exports.onChat = async ({ api, event, usersData }) => {
  try {
    const body = event.body ? event.body.toLowerCase() : "";
    const senderID = event.senderID;  // Get the sender's ID
    const senderName = (await usersData.get(senderID)).name; // Get the sender's name
    
    if (body === "bby" || body === "baby" || body === "janu") {
      const randomReplies = [
        "হুম বলো? 😊", 
        "কি বলবা আমাকে? 😏", 
        "আমি কিন্তু তোমার জন্য ওয়েট করছিলাম! 😍", 
        "বলো বেবি, কেমন আছো? 🥰"
      ];
      const reply = randomReplies[Math.floor(Math.random() * randomReplies.length)];
      return api.sendMessage({
        body: `@${senderName} ${reply}`,
      }, event.threadID, event.messageID);
    }

    // If the message starts with 'bby' and has additional text, make a request to SimSimi API
    if (body.startsWith("bby")) {
      const response = await axios.get(`https://simsimi-99qa.onrender.com/sim?reply=${encodeURIComponent(body.replace("bby ", ""))}`);
      const reply = response.data.message || "আমি বুঝতে পারলাম না।";
      
      return api.sendMessage({
        body: `@${senderName} ${reply}`,
      }, event.threadID, event.messageID);
    }

    // Fallback to SimSimi API for other types of messages
    const apiUrl = `https://simsimi-99qa.onrender.com/sim`;
    const response = await axios.get(`${apiUrl}?reply=${encodeURIComponent(body)}`);
    const reply = response.data.message || "আমি বুঝতে পারলাম না।";

    api.sendMessage({
      body: `@${senderName} ${reply}`,
    }, event.threadID, event.messageID);
  } catch (error) {
    api.sendMessage(`Error: ${error.message}`, event.threadID, event.messageID);
  }
};
