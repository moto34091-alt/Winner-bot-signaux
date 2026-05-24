require("dotenv").config();

const express = require("express");
const axios = require("axios");
const { EMA, RSI, ATR } = require("technicalindicators");
const TelegramBot = require("node-telegram-bot-api");

const app = express();
app.use(express.json());

const bot = new TelegramBot(process.env.BOT_TOKEN, { polling: false });

let latestSignal = null;

// 📡 SERVER OVERLAY
app.get("/signal", (req, res) => {
  res.json(latestSignal);
});

// 📊 FETCH DATA
async function getData(pair) {
  try {
    const res = await axios.get(
      `https://api.twelvedata.com/time_series?symbol=${pair}&interval=1min&outputsize=100&apikey=${process.env.TWELVE_API_KEY}`
    );

    if (!res.data.values) return null;
    return res.data.values.reverse();
  } catch {
    return null;
  }
}

// 🧠 INDICATORS
function calc(data) {
  const close = data.map(c => +c.close);
  const high = data.map(c => +c.high);
  const low = data.map(c => +c.low);

  const ema9 = EMA.calculate({ period: 9, values: close });
  const ema21 = EMA.calculate({ period: 21, values: close });
  const rsi = RSI.calculate({ period: 14, values: close });
  const atr = ATR.calculate({ high, low, close, period: 10 });

  if (!ema9.length || !ema21.length || !rsi.length || !atr.length) return null;

  return {
    close: close.at(-1),
    prev: close.at(-2),
    ema9: ema9.at(-1),
    ema21: ema21.at(-1),
    rsi: rsi.at(-1),
    atr: atr.at(-1)
  };
}

// 🔥 SIGNAL ENGINE
function signal(i) {
  let score = 0;
  let type = null;

  const up = i.ema9 > i.ema21;
  const down = i.ema9 < i.ema21;

  const atrP = (i.atr / i.close) * 100;
  if (atrP < 0.04) return null;

  if (up && i.rsi > 50) {
    type = "BUY";
    score += 60;
  }

  if (down && i.rsi < 50) {
    type = "SELL";
    score += 60;
  }

  if (!type) return null;

  if (score < 70) return null;

  return {
    pair: "MARKET",
    signal: type,
    score,
    mode: score > 85 ? "ULTRA" : "ELITE"
  };
}

// 📡 ANALYSE LOOP
async function run() {
  const pairs = ["EUR/USD", "BTC/USD", "ETH/USD"];

  for (let p of pairs) {
    const data = await getData(p);
    if (!data) continue;

    const i = calc(data);
    if (!i) continue;

    const s = signal(i);
    if (!s) continue;

    s.pair = p;
    latestSignal = s;

    // Telegram alert
    const msg = `
🟢 ${s.signal} ${p}
Score: ${s.score}%
Mode: ${s.mode}
`;

    bot.sendMessage(process.env.CHAT_ID, msg);
  }
}

setInterval(run, 30000);
run();

// 🚀 START SERVER
app.listen(3000, () => {
  console.log("TRADING DESK PRO RUNNING ON PORT 3000");
});
