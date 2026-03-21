/* ============================================================
   Landsgemeinde 2026 – App Logic
   ============================================================ */

// ── State ────────────────────────────────────────────────────
let mediaRecorder = null;
let audioChunks   = [];
let timerInterval = null;
let elapsedSec    = 0;
let silenceTimer  = null;
let audioCtx      = null;
let analyserNode  = null;
let silenceRAF    = null;

// ── DOM refs ─────────────────────────────────────────────────
const btnRecord      = document.getElementById('btn-record');
const recordLabel    = document.getElementById('record-label');
const recordTimer    = document.getElementById('record-timer');
const recordStatus   = document.getElementById('record-status');
const uploadFeedback = document.getElementById('upload-feedback');
const uploadSuccess  = document.getElementById('upload-success');
const tickerStatus   = document.getElementById('ticker-status');
const tickerList     = document.getElementById('ticker-list');
const navBtns        = document.querySelectorAll('.nav-btn');
const screens        = document.querySelectorAll('.screen');

// ── Navigation ───────────────────────────────────────────────
navBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    const target = btn.dataset.screen;
    navBtns.forEach(b => b.classList.remove('active'));
    screens.forEach(s => s.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById('screen-' + target).classList.add('active');

    if (target === 'ticker') startTickerPolling();
  });
});

// ── Recording ────────────────────────────────────────────────
btnRecord.addEventListener('click', () => {
  if (mediaRecorder && mediaRecorder.state === 'recording') {
    stopRecording();
  } else {
    startRecording();
  }
});

async function startRecording() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mimeType = getSupportedMimeType();

    audioChunks = [];
    mediaRecorder = new MediaRecorder(stream, { mimeType });

    mediaRecorder.addEventListener('dataavailable', e => {
      if (e.data.size > 0) audioChunks.push(e.data);
    });

    mediaRecorder.addEventListener('stop', () => {
      stream.getTracks().forEach(t => t.stop());
      const blob = new Blob(audioChunks, { type: mimeType });
      uploadAudio(blob, mimeType);
    });

    mediaRecorder.start(250); // collect chunks every 250ms

    setRecordingUI(true);
    startTimer();

    // Auto-stop after max duration
    setTimeout(() => {
      if (mediaRecorder && mediaRecorder.state === 'recording') stopRecording();
    }, config.MAX_RECORDING_MS);

    // Optional silence detection
    if (config.SILENCE_DETECTION) {
      setupSilenceDetection(stream);
    }

  } catch (err) {
    console.error('Mikrofon-Fehler:', err);
    setStatus(recordStatus, 'Kein Mikrofon', '');
    recordLabel.textContent = 'Mikrofonzugriff verweigert – Einstellungen prüfen';
  }
}

function stopRecording() {
  if (!mediaRecorder) return;
  clearInterval(timerInterval);
  cancelAnimationFrame(silenceRAF);
  if (audioCtx) { audioCtx.close(); audioCtx = null; }
  mediaRecorder.stop();
  setRecordingUI(false);
}

function setRecordingUI(active) {
  btnRecord.classList.toggle('active', active);
  recordTimer.hidden  = !active;
  recordLabel.textContent = active ? 'Tippen zum Stoppen' : 'Tippen zum Aufnehmen';
  uploadFeedback.hidden = true;
  uploadSuccess.hidden  = true;
  if (!active) {
    elapsedSec = 0;
    recordTimer.textContent = '0:00';
  }
  setStatus(recordStatus, active ? 'REC' : 'Bereit', active ? 'recording' : '');
}

function startTimer() {
  elapsedSec = 0;
  clearInterval(timerInterval);
  timerInterval = setInterval(() => {
    elapsedSec++;
    const m = Math.floor(elapsedSec / 60);
    const s = String(elapsedSec % 60).padStart(2, '0');
    recordTimer.textContent = `${m}:${s}`;
  }, 1000);
}

// ── Silence Detection ────────────────────────────────────────
function setupSilenceDetection(stream) {
  audioCtx    = new (window.AudioContext || window.webkitAudioContext)();
  analyserNode = audioCtx.createAnalyser();
  analyserNode.fftSize = 1024;

  const source = audioCtx.createMediaStreamSource(stream);
  source.connect(analyserNode);

  const buf = new Float32Array(analyserNode.fftSize);
  let silenceStart = null;

  function checkSilence() {
    analyserNode.getFloatTimeDomainData(buf);
    const rms = Math.sqrt(buf.reduce((s, v) => s + v * v, 0) / buf.length);

    if (rms < config.SILENCE_THRESHOLD) {
      if (!silenceStart) silenceStart = Date.now();
      else if (Date.now() - silenceStart >= config.SILENCE_DURATION_MS) {
        stopRecording();
        return;
      }
    } else {
      silenceStart = null;
    }

    silenceRAF = requestAnimationFrame(checkSilence);
  }

  silenceRAF = requestAnimationFrame(checkSilence);
}

// ── Upload ───────────────────────────────────────────────────
async function uploadAudio(blob, mimeType) {
  const ext  = mimeType.includes('mp4') ? 'mp4' : 'webm';
  const form = new FormData();
  form.append('audio', blob, `aufnahme.${ext}`);

  uploadFeedback.hidden = false;
  setStatus(recordStatus, 'Sendet…', 'sending');

  try {
    const res = await fetch(config.WEBHOOK_URL, { method: 'POST', body: form });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    uploadFeedback.hidden = true;
    uploadSuccess.hidden  = false;
    setStatus(recordStatus, 'Gesendet ✓', 'ok');

    setTimeout(() => {
      uploadSuccess.hidden = true;
      setStatus(recordStatus, 'Bereit', '');
    }, 3000);

  } catch (err) {
    console.error('Upload-Fehler:', err);
    uploadFeedback.hidden = true;
    setStatus(recordStatus, 'Fehler – nochmals versuchen', '');
    recordLabel.textContent = 'Upload fehlgeschlagen – Verbindung prüfen';
  }
}

// ── Ticker Polling ───────────────────────────────────────────
let pollingTimer = null;
let knownIds     = new Set();

function startTickerPolling() {
  if (pollingTimer) return; // already running
  fetchTicker();
  pollingTimer = setInterval(fetchTicker, config.POLL_INTERVAL_MS);
}

async function fetchTicker() {
  try {
    const res  = await fetch(config.TICKER_URL);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    renderTicker(data);
    setStatus(tickerStatus, 'Live', 'ok');
  } catch (err) {
    console.error('Ticker-Fehler:', err);
    setStatus(tickerStatus, 'Offline', '');
  }
}

/**
 * Expected JSON shape from n8n:
 * {
 *   "entries": [
 *     {
 *       "id": "unique-string",          // optional but recommended
 *       "timestamp": "14:23",
 *       "summary": "Antrag angenommen",
 *       "transcript": "Der Landammann hat …"
 *     }
 *   ]
 * }
 *
 * If n8n returns a flat array, that also works.
 */
function renderTicker(data) {
  const entries = Array.isArray(data) ? data : (data.entries || []);
  if (!entries.length) return;

  // Remove placeholder if present
  const placeholder = tickerList.querySelector('.ticker-placeholder');
  if (placeholder) placeholder.remove();

  let hasNew = false;

  // Prepend new entries (newest on top)
  entries.slice().reverse().forEach(entry => {
    const id = entry.id || entry.timestamp + entry.summary;
    if (knownIds.has(id)) return;
    knownIds.add(id);
    hasNew = true;

    const li = document.createElement('li');
    li.className = 'ticker-entry new';
    li.innerHTML = `
      <div class="entry-meta">
        <span>${escHtml(entry.timestamp || '')}</span>
      </div>
      <div class="entry-summary">${escHtml(entry.summary || '')}</div>
      ${entry.transcript ? `
        <button class="entry-toggle" aria-expanded="false">Transkript anzeigen ▸</button>
        <div class="entry-transcript">${escHtml(entry.transcript)}</div>
      ` : ''}
    `;

    // Toggle transcript
    const toggle = li.querySelector('.entry-toggle');
    if (toggle) {
      toggle.addEventListener('click', () => {
        li.classList.toggle('expanded');
        const open = li.classList.contains('expanded');
        toggle.textContent = open ? 'Transkript ausblenden ▾' : 'Transkript anzeigen ▸';
        toggle.setAttribute('aria-expanded', open);
      });
    }

    tickerList.prepend(li);

    // Remove "new" highlight after 10s
    setTimeout(() => li.classList.remove('new'), 10000);
  });

  if (hasNew) {
    // Flash status
    setStatus(tickerStatus, 'Neu!', 'recording');
    setTimeout(() => setStatus(tickerStatus, 'Live', 'ok'), 2000);
  }
}

// ── Helpers ──────────────────────────────────────────────────
function getSupportedMimeType() {
  const types = [
    'audio/webm;codecs=opus',
    'audio/webm',
    'audio/ogg;codecs=opus',
    'audio/mp4',
  ];
  return types.find(t => MediaRecorder.isTypeSupported(t)) || '';
}

function setStatus(el, text, cls) {
  el.textContent = text;
  el.className   = 'status-badge' + (cls ? ' ' + cls : '');
}

function escHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// ── Service Worker ───────────────────────────────────────────
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('sw.js').catch(console.warn);
}
