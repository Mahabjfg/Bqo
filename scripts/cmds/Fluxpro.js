function hi() {
  console.log("Hello World!");
}
hi();
const axios = require("axios");
const {
  getStreamFromURL
} = global.utils;
module.exports = {
  'config': {
    'name': "flux",
    'version': '1.1',
    'author': "Redwan",
    'countDown': 0x0,
    'longDescription': {
      'en': "Generate AI images based on your prompt."
    },
    'category': "image",
    'role': 0x0,
    'guide': {
      'en': "{pn} <prompt>"
    }
  },
  'onStart': async function ({
    api: _0x66bb00,
    event: _0x45752a,
    args: _0x1b82be,
    message: _0x245c6c
  }) {
    if (!this.checkAuthor()) {
      return _0x245c6c.reply("Author verification failed. Command cannot be executed.");
    }
    const _0x56c287 = _0x1b82be.join(" ").trim();
    if (!_0x56c287) {
      return _0x245c6c.reply("Please provide a prompt to generate an image.");
    }
    _0x245c6c.reply('Creating......!', async (_0x29bbfe, _0x31ad3a) => {
      if (_0x29bbfe) {
        return console.error(_0x29bbfe);
      }
      try {
        const _0x1743e5 = "https://global-redwans-apis.onrender.com/api/flux?p=" + encodeURIComponent(_0x56c287) + "&mode=flux";
        const _0x2b4615 = await axios.get(_0x1743e5);
        const {
          html: _0x263f09
        } = _0x2b4615.data.data;
        const _0x2fd488 = _0x263f09.match(/https:\/\/aicdn\.picsart\.com\/[a-zA-Z0-9-]+\.jpg/);
        if (!_0x2fd488) {
          return _0x245c6c.reply("Failed to generate the image. Please try again.");
        }
        const _0x38b91a = await getStreamFromURL(_0x2fd488[0x0], 'generated_image.png');
        _0x245c6c.reply({
          'body': "✅ Image generated successfully!",
          'attachment': _0x38b91a
        });
      } catch (_0xb3d076) {
        console.error(_0xb3d076);
        _0x245c6c.reply("An error occurred while generating the image. Please try again.");
      }
    });
  },
  'checkAuthor': function () {
    return this.config.author === 'Redwan';
  }
};
