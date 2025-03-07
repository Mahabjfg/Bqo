/cmd install imgur.js const axios = require('axios');

module.exports = {
  config: {
    name: "imgur",
    version: "1.4",
    author: "MR᭄﹅ MAHABUB﹅ メꪜ",
    countDown: 5,
    role: 0,
    shortDescription: { en: "Upload image to Imgur" },
    longDescription: { en: "Upload an image to Imgur by replying to a photo" },
    category: "tools",
    guide: { en: "Reply to an image and type the command to upload it." }
  },

  onStart: async function ({ api, event }) {
    const attachment = event.messageReply?.attachments?.[0];

    if (!attachment || attachment.type !== 'photo') {
      return api.sendMessage(' অনুগ্রহ করে কোনো নির্দিষ্ট ফটো ভিডিও নির্বাচন করুন...! MR᭄﹅ MAHABUB﹅ メꪜ😴', event.threadID, event.messageID);
    }

    const imageUrl = attachment.url;
    const CLIENT_ID = "0c9f64d6e3ec804"; // Ensure no extra line break here

    try {
      const res = await axios.post(
        "https://api.imgur.com/3/image",
        { image: imageUrl, type: "url" },
        { headers: { Authorization: `Client-ID ${CLIENT_ID}` } }
      );

      if (!res.data || !res.data.data || !res.data.data.link) {
        return api.sendMessage(' দুঃখিত এই মুহূর্তে প্রসেসটি complete করতে ব্যর্থ...!😿 ', event.threadID, event.messageID);
      }

      return api.sendMessage(`uploaded successfully:\n"${res.data.data.link}",`, event.threadID, event.messageID);
    } catch (error) {
      console.error("Upload Error:", error.response?.data || error.message);

      let errorMsg = "ছবি আপলোড করতে ব্যর্থ হয়েছে।...🥲";
      if (error.response?.status === 429) {
        errorMsg += " API অনুরোধের সীমা অতিক্রম করা হয়েছে। পরে আবার চেষ্টা করুন।.";
      } else if (error.response?.status === 500) {
        errorMsg += " Imgur API বর্তমানে ডাউন আছে।.";
      }

      return api.sendMessage(errorMsg, event.threadID, event.messageID);
    }
  }
};
