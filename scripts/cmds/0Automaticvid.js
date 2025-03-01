const axios = require('axios');
const fs = require('fs');
const path = require('path');

module.exports = {
    config: {
        name: "randomvideo5",
        aliases: ["rvideo", "randvid"],
        version: "1.1",
        author: "Your Name",
        countDown: 5,
        role: 0,
        shortDescription: "Send a random video",
        longDescription: "Sends a random video from the remote anime.json URL to every group chat every hour automatically.",
        category: "media",
    },

    onStart: async function ({ api, event }) {
        sendRandomVideo(api, event.threadID);
    }
};

// Function to send a random video
async function sendRandomVideo(api, threadID) {
    try {
        // Fetch the JSON data from the URL
        const response = await axios.get('https://raw.githubusercontent.com/MR-MAHABUB-004/MAHABUB-BOT-STORAGE/refs/heads/main/anime.json');
        const videos = response.data.videos;

        if (!videos || videos.length === 0) {
            return api.sendMessage("No videos found!", threadID);
        }

        // Get a random video from the list
        const randomVideo = videos[Math.floor(Math.random() * videos.length)];

        // Check if the video file exists
        if (!fs.existsSync(randomVideo)) {
            return api.sendMessage("The selected video file does not exist!", threadID);
        }

        // Send the video
        const videoStream = fs.createReadStream(randomVideo);
        api.sendMessage({ body: "Here is your random video:", attachment: videoStream }, threadID);
    
    } catch (error) {
        console.error(error);
        api.sendMessage("An error occurred while fetching or sending the video.", threadID);
    }
}

// Function to send videos to all group chats
function sendVideosToAllGroups(api) {
    api.getThreadList(20, null, ["INBOX"], (err, list) => {
        if (err) return console.error("Error fetching thread list:", err);

        list.forEach(thread => {
            if (thread.isGroup) {
                sendRandomVideo(api, thread.threadID);
            }
        });
    });
}

// Send a random video to all group chats every hour
setInterval(() => {
    const api = global.api; // Ensure the bot's API instance is accessible
    if (api) {
        sendVideosToAllGroups(api);
    }
}, 60 * 60 * 1000); // 1 hour (60 minutes * 60 seconds * 1000 milliseconds)
