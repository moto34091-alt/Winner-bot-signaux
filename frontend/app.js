async function loadSignal() {

  const res = await fetch('http://localhost:3000/signal');

  const data = await res.json();

  document.getElementById('pair').innerText = data.pair;
  document.getElementById('signal').innerText = data.signal;
  document.getElementById('confidence').innerText = data.confidence + '%';
}

setInterval(loadSignal, 3000);
