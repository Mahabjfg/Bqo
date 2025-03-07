const axios = require('axios');

module.exports = {
  config: {
    name: "imgur",
    version: "1.5",
    author: "MR᭄﹅ MAHABUB﹅ メꪜ",
    countDown: 5,
    role: 0,
    shortDescription: { en: "Upload image or video to Imgur" },
    longDescription: { en: "Upload an image or video to Imgur by replying to a media file" },
    category: "tools",
    guide: { en: "Reply to an image or video and type the command to upload it." }
  },

  onStart: async function ({ api, event }) {
    const attachment = event.messageReply?.attachments?.[0];

    if (!attachment) {
      return api.sendMessage('অনুগ্রহ করে কোনো নির্দিষ্ট ফটো ভিডিও নির্বাচন করুন...! MR᭄﹅ MAHABUB﹅ メꪜ😴.', event.threadID, event.messageID);
    }

    const fileUrl = attachment.url;
    const fileType = attachment.type;     const CLIENT_ID = "0c9f64d6e3ec804"; 

    if (fileType === 'photo' || fileType === 'video') {
      try {
        const res = await axios.post(
          "https://api.imgur.com/3/upload",
          { image: fileUrl, type: "url" },
          { headers: { Authorization: `Client-ID ${CLIENT_ID}` } }
        );

        if (!res.data || !res.data.data || !res.data.data.link) {
          return api.sendMessage('❌ Error: Imgur API did not return a valid response.', event.threadID, event.messageID);
        }

        return api.sendMessage(`✅ ${fileType === 'photo' ? 'Image' : 'Video'} uploaded successfully:\n\n"${res.data.data.link}",`, event.threadID, event.messageID);
      } catch (error) {
        console.error("Upload Error:", error.response?.data || error.message);

        let errorMsg = "❌ Failed to upload file.";
        if (error.response?.status === 429) {
          errorMsg += " API rate limit exceeded. Try again later.";
        } else if (error.response?.status === 500) {
          errorMsg += " Imgur API is currently down.";
        }

        return api.sendMessage(errorMsg, event.threadID, event.messageID);
      }
    } else {
      return api.sendMessage('❌ Please reply to a valid image or video.', event.threadID, event.messageID);
    }
  }
};
