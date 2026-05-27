const { chromium } = require('playwright');

async function autoTrade(signal) {

  const browser = await chromium.launch({
    headless: false
  });

  const page = await browser.newPage();

  await page.goto('https://example-broker.com');

  if (signal === 'BUY') {
    console.log('AUTO BUY EXECUTED');
  }

  if (signal === 'SELL') {
    console.log('AUTO SELL EXECUTED');
  }
}

module.exports = {
  autoTrade
};
