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
const apiUrl = https://simsimi-99qa.onrender.com/sim; // SimSimi API URL
const userMessage = args.join(" ").toLowerCase();
const senderName = (await usersData.get(event.senderID)).name;

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

// If message starts with "bby" and is followed by something like "hi", "ki koro", "kmn aso", get response from SimSimi  
if (userMessage.startsWith("bby")) {  
  const response = await axios.get(`${apiUrl}?reply=${encodeURIComponent(userMessage.replace("bby ", ""))}`);  
  const reply = response.data.message || "আমি বুঝতে পারলাম না।";  

  return api.sendMessage(`@${senderName} ${reply}`, event.threadID, event.messageID);  
}  

// Fallback to SimSimi API for other messages  
const response = await axios.get(`${apiUrl}?reply=${encodeURIComponent(userMessage)}`);  
const reply = response.data.message || "আমি বুঝতে পারলাম না।";  

api.sendMessage(`@${senderName} ${reply}`, event.threadID, event.messageID);

} catch (error) {
console.error(error);
api.sendMessage("Error: Unable to fetch response.", event.threadID, event.messageID);
}
};

module.exports.onReply = async ({ api, event, usersData }) => {
try {
if (event.type === "message_reply") {
const apiUrl = https://simsimi-99qa.onrender.com/sim; // SimSimi API URL
const senderName = (await usersData.get(event.senderID)).name;
const response = await axios.get(${apiUrl}?reply=${encodeURIComponent(event.body.toLowerCase())});
const reply = response.data.message || "আমি বুঝতে পারলাম না।";

api.sendMessage(`@${senderName} ${reply}`, event.threadID, event.messageID);  
}

} catch (error) {
api.sendMessage(Error: ${error.message}, event.threadID, event.messageID);
}
};

module.exports.onChat = async ({ api, event, usersData }) => {
try {
const body = event.body ? event.body.toLowerCase() : "";
const senderName = (await usersData.get(event.senderID)).name;

if (body === "bby" || body === "baby" || body === "janu") {  
  const randomReplies = [  
    "হুম বলো? 😊",   
    "কি বলবা আমাকে? 😏",   
    "আমি কিন্তু তোমার জন্য ওয়েট করছিলাম! 😍",   
    "বলো বেবি, কেমন আছো? 🥰"  
  ];  
  return api.sendMessage(randomReplies[Math.floor(Math.random() * randomReplies.length)], event.threadID, event.messageID);  
}  

// If the message starts with 'bby' and has additional text, make a request to SimSimi API  
if (body.startsWith("bby")) {  
  const response = await axios.get(`https://simsimi-99qa.onrender.com/sim?reply=${encodeURIComponent(body.replace("bby ", ""))}`);  
  const reply = response.data.message || "আমি বুঝতে পারলাম না।";  
    
  return api.sendMessage(`@${senderName} ${reply}`, event.threadID, event.messageID);  
}  

// Fallback to SimSimi API for other types of messages  
const apiUrl = `https://simsimi-99qa.onrender.com/sim`;  
const response = await axios.get(`${apiUrl}?reply=${encodeURIComponent(body)}`);  
const reply = response.data.message || "আমি বুঝতে পারলাম না।";  

api.sendMessage(`@${senderName} ${reply}`, event.threadID, event.messageID);

} catch (error) {
api.sendMessage(Error: ${error.message}, event.threadID, event.messageID);
}
};

