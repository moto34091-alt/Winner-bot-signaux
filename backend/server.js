const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const cors = require('cors');

const { analyzeMarket } = require('./strategy');
const { autoTrade } = require('./auto-trade');

const app = express();
const server = http.createServer(app);
const io = socketIO(server, {
  cors: {
    origin: '*'
  }
});

app.use(cors());
app.use(express.json());

let currentSignal = {
  pair: 'EUR/USD',
  signal: 'WAIT',
  confidence: 50,
  trend: 'NEUTRAL'
};

setInterval(async () => {
  const analysis = await analyzeMarket();

  currentSignal = analysis;

  io.emit('signal', analysis);

  if (analysis.confidence >= 90) {
    await autoTrade(analysis.signal);
  }

}, 5000);

app.get('/signal', (req, res) => {
  res.json(currentSignal);
});

io.on('connection', (socket) => {
  console.log('Client connected');
});

server.listen(3000, () => {
  console.log('SNIPER AI PRO running on port 3000');
});
