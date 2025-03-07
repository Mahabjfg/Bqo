const axios = require('axios');

module.exports = {
  config: {
    name: "imgur",
    version: "1.3",
    author: "ArYAN (Modified by ChatGPT)",
    countDown: 5,
    role: 0,
    shortDescription: { en: "Upload image to Imgur" },
    longDescription: { en: "Upload image to Imgur by replying to a photo" },
    category: "tools",
    guide: { en: "Reply to an image and type the command to upload it." }
  },

  onStart: async function ({ api, event }) {
    const linkanh = event.messageReply?.attachments?.[0]?.url;

    if (!linkanh) {
      return api.sendMessage('❌ Please reply to an image to upload.', event.threadID, event.messageID);
    }

    try {
      const res = await axios.get(`https://imgur-upload-mahabub-x-imran.onrender.com/mahabub?link=${encodeURIComponent(linkanh)}`);

      // Ensure API response has "image" property
      if (!res.data || !res.data.image) {
        return api.sendMessage('❌ Error: Invalid response from the API.', event.threadID, event.messageID);
      }

      const imgurLink = res.data.image; // Only using "image" property
      return api.sendMessage(`✅ Image uploaded successfully:\n${imgurLink}`, event.threadID, event.messageID);
    } catch (error) {
      console.error("Upload Error:", error.response?.data || error.message);
      return api.sendMessage('❌ Failed to upload image. Please try again later.', event.threadID, event.messageID);
    }
  }
};
