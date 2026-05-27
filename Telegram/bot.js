const TelegramBot = require('node-telegram-bot-api');

const token = 'TON_TOKEN_ICI';

const bot = new TelegramBot(token, {
  polling: true
});

bot.onText(/\/start/, (msg) => {

  bot.sendMessage(msg.chat.id,

`🚀 SNIPER AI PRO ACTIVATED

✅ STATUS: ONLINE
✅ AUTO TRADE: READY
✅ OTC MODE: ACTIVE
✅ AI ENGINE: ACTIVE
✅ SIGNAL SYSTEM: CONNECTED`

  );

});

function sendSignal(signal, confidence) {

  bot.sendMessage(
    '5161872804',

`📈 SIGNAL ALERT

PAIR: EUR/USD
SIGNAL: ${signal}
CONFIDENCE: ${confidence}%

🔥 SNIPER AI PRO`
  );

}

console.log('BOT RUNNING...');
