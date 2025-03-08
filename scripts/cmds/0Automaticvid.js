module.exports = {
	config: {
		name: "audio",
		version: "1.0",
		author: "AceGun",
		countDown: 5,
		role: 0,
		shortDescription: "no prefix",
		longDescription: "no prefix",
		category: "no prefix",
	},
	onStart: async function(){},
	onChat: async function({ event, message }) {
		if (event.body) {
			const word = event.body.toLowerCase();
			switch (word) {
				case "i love you":
					return message.reply({
						body: "「 i love you too 😘」",
						attachment: [ "https://docs.google.com/uc?export=download&id=1ckhnXkIkn8j4lqav2IlSTcqjFe040NLF" ],
					});
				case "yamate":
					return message.reply({
						body: "「 Yamate 🥵 」",
						attachment: [ "https://docs.google.com/uc?export=download&id=YOUR_FILE_ID_HERE" ],
					});
				case "dazai":
					return message.reply({
						body: "「 ahhh~ 」",
						attachment: [ "https://docs.google.com/uc?export=download&id=YOUR_FILE_ID_HERE" ],
					});
				case "ara":
					return message.reply({
						body: "「 ara ara 」",
						attachment: [ "https://docs.google.com/uc?export=download&id=YOUR_FILE_ID_HERE" ],
					});
				default:
					return; 
			}
		}
	}
};
