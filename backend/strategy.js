const { RSI } = require('technicalindicators');
const { MACD } = require('technicalindicators');

async function analyzeMarket() {

  const closes = [
    1.10,1.11,1.12,1.13,1.14,
    1.15,1.16,1.17,1.18,1.19,
    1.20,1.21,1.22,1.23,1.24
  ];

  const rsi = RSI.calculate({
    values: closes,
    period: 14
  });

  const macd = MACD.calculate({
    values: closes,
    fastPeriod: 12,
    slowPeriod: 26,
    signalPeriod: 9,
    SimpleMAOscillator: false,
    SimpleMASignal: false
  });

  let score = 0;
  let signal = 'WAIT';

  const latestRSI = rsi[rsi.length - 1] || 50;

  if (latestRSI < 30) {
    score += 30;
  }

  if (latestRSI > 70) {
    score += 30;
  }

  if (score >= 90) {
    signal = 'BUY';
  }

  return {
    pair: 'EUR/USD',
    signal,
    confidence: score,
    rsi: latestRSI,
    trend: signal
  };
}

module.exports = {
  analyzeMarket
};
