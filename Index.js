require('dotenv').config();

const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');

const {
  EMA,
  RSI,
  ATR
} = require('technicalindicators');

const bot = new TelegramBot(process.env.BOT_TOKEN, {
  polling: false
});

const PAIRS = [
  'EUR/USD',
  'GBP/JPY',
  'EUR/JPY',
  'GBP/USD',
  'USD/JPY',
  'BTC/USD'
];

const INTERVAL = '1min';

async function fetchMarketData(symbol) {
  try {
    const response = await axios.get(
      `https://api.twelvedata.com/time_series?symbol=${symbol}&interval=${INTERVAL}&outputsize=100&apikey=${process.env.TWELVE_API_KEY}`
    );

    return response.data.values.reverse();
  } catch (error) {
    console.log('DATA ERROR:', error.message);
    return null;
  }
}

function calculateIndicators(data) {
  const closes = data.map(c => parseFloat(c.close));
  const highs = data.map(c => parseFloat(c.high));
  const lows = data.map(c => parseFloat(c.low));

  const ema9 = EMA.calculate({
    period: 9,
    values: closes
  });

  const ema21 = EMA.calculate({
    period: 21,
    values: closes
  });

  const rsi = RSI.calculate({
    period: 14,
    values: closes
  });

  const atr = ATR.calculate({
    high: highs,
    low: lows,
    close: closes,
    period: 10
  });

  return {
    close: closes[closes.length - 1],
    previousClose: closes[closes.length - 2],
    ema9: ema9[ema9.length - 1],
    ema21: ema21[ema21.length - 1],
    rsi: rsi[rsi.length - 1],
    atr: atr[atr.length - 1]
  };
}

function generateSignal(indicators) {
  let confidence = 0;
  let signal = null;
  let momentum = 'LOW';

  const bullishMomentum =
    indicators.close > indicators.previousClose;

  const bearishMomentum =
    indicators.close < indicators.previousClose;

  if (
    indicators.ema9 > indicators.ema21 &&
    bullishMomentum &&
    indicators.rsi > 45
  ) {
    signal = 'BUY';
    confidence += 40;
  }

  if (
    indicators.ema9 < indicators.ema21 &&
    bearishMomentum &&
    indicators.rsi < 55
  ) {
    signal = 'SELL';
    confidence += 40;
  }

  if (indicators.rsi > 60 || indicators.rsi < 40) {
    confidence += 20;
  }

  if (indicators.atr > 0.05) {
    confidence += 20;
    momentum = 'HIGH';
  }

  if (confidence >= 80) {
    return {
      signal,
      confidence,
      momentum,
      mode: 'ULTRA'
    };
  }

  if (confidence >= 60) {
    return {
      signal,
      confidence,
      momentum,
      mode: 'SNIPER'
    };
  }

  return null;
}

async function sendTelegramSignal(pair, result) {
  if (!result || !result.signal) return;

  const emoji = result.signal === 'BUY' ? '🟢' : '🔴';

  const message = `
${emoji} ${result.mode} ${result.signal}

Pair: ${pair}
Confidence: ${result.confidence}%
Momentum: ${result.momentum}
Expiry: 15s

OTC Sniper AI
`;

  try {
    await bot.sendMessage(process.env.CHAT_ID, message);
    console.log('SIGNAL SENT:', pair);
  } catch (error) {
    console.log('TELEGRAM ERROR:', error.message);
  }
}

async function analyzePair(pair) {
  const data = await fetchMarketData(pair);

  if (!data || data.length < 30) return;

  const indicators = calculateIndicators(data);

  const signal = generateSignal(indicators);

  await sendTelegramSignal(pair, signal);
}

async function runBot() {
  console.log('OTC SNIPER BOT STARTED...');

  for (const pair of PAIRS) {
    await analyzePair(pair);
  }
}

setInterval(runBot, 15000);

runBot();
