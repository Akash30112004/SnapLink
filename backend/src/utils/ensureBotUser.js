const crypto = require('crypto');
const User = require('../models/User');

const BOT_EMAIL = 'snaplinkai@bot.com';
const BOT_NAME = 'SnapLink AI';
const BOT_AVATAR = 'https://api.dicebear.com/7.x/bottts/svg?seed=SnapLinkAI';

const ensureBotUser = async () => {
  try {
    const existingBot = await User.findOne({ email: BOT_EMAIL });
    if (existingBot) {
      let updated = false;

      if (existingBot.isBot !== true) {
        existingBot.isBot = true;
        updated = true;
      }

      if (!existingBot.name || existingBot.name !== BOT_NAME) {
        existingBot.name = BOT_NAME;
        updated = true;
      }

      if (!existingBot.avatar) {
        existingBot.avatar = BOT_AVATAR;
        updated = true;
      }

      if (updated) {
        await existingBot.save();
        console.log('Bot user updated:', existingBot.email);
      }

      return existingBot;
    }

    const randomPassword = crypto.randomBytes(16).toString('hex');

    const botUser = await User.create({
      name: BOT_NAME,
      email: BOT_EMAIL,
      password: randomPassword,
      avatar: BOT_AVATAR,
      isBot: true,
    });

    console.log('Bot user created:', botUser.email);
    return botUser;
  } catch (error) {
    console.error('Failed to ensure bot user:', error);
    return null;
  }
};

module.exports = ensureBotUser;
