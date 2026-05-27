const TelegramBot = require('node-telegram-bot-api');

const token = 'YOUR_BOT_TOKEN';

const bot = new TelegramBot(token, {
  polling: true
});

bot.onText(/\/start/, (msg) => {

  bot.sendMessage(msg.chat.id,
`🚀 SNIPER AI PRO ACTIVATED\n\nAUTO TRADING READY`
  );
});

function sendSignal(signal) {

  bot.sendMessage(
    'CHAT_ID',
`📈 ${signal.signal}\n🔥 ${signal.confidence}%`
  );
}

module.exports = {
  sendSignal
};
