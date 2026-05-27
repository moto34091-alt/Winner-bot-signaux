function detectHammer(candle) {

  const body = Math.abs(candle.open - candle.close);

  const wick = candle.high - candle.low;

  return wick > body * 2;
}

function engulfing(prev, current) {

  return (
    current.open < prev.close &&
    current.close > prev.open
  );
}

module.exports = {
  detectHammer,
  engulfing
};
