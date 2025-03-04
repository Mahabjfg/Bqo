// Import your npm package
const axios = require('axios');
const myImageUploader = require('imgur'); // Replace with your package name

module.exports = {
  config: {
    name: "imgur",
    version: "1.0",
    author: "MR᭄﹅ MAHABUB﹅ メꪜ",
    countDown: 5,
    role: 0,
    shortDescription: {
      en: "Upload image to Imgur"
    },
    longDescription: {
      en: "Upload image to Imgur by replying to a photo"
    },
    category: "tools",
    guide: {
      en: ""
    }
  },

  onStart: async function ({ api, event }) {
    const linkanh = event.messageReply?.attachments[0]?.url;
    if (!linkanh) {
      return api.sendMessage('Please reply to an image.', event.threadID, event.messageID);
    }

    try {
      // Use your npm package for image upload
      const uploadResult = await myImageUploader.upload(linkanh); // Assume the method is called 'upload'

      // Send the uploaded image URL back to the chat
      return api.sendMessage(uploadResult.imageUrl, event.threadID, event.messageID);
    } catch (error) {
      console.log(error);
      return api.sendMessage('Failed to upload image to Imgur. Please try again later.', event.threadID, event.messageID);
    }
  }
};
