// =============================================================
//  Landsgemeinde 2026 – Konfiguration
// =============================================================
const config = {
  // n8n Webhook-URL für Audio-Upload (POST, multipart/form-data)
  WEBHOOK_URL: 'https://n8n.julianreich.ch/webhook/45725b38-c799-4334-991a-4e9081f9042c',

  // n8n Webhook-URL für Ticker (GET, liefert JSON)
  TICKER_URL: 'https://n8n.julianreich.ch/webhook/ticker-landsgemeinde',

  // Polling-Intervall für Live-Ticker (ms)
  POLL_INTERVAL_MS: 5000,

  // Maximale Aufnahmedauer (ms) – danach automatischer Stopp
  MAX_RECORDING_MS: 180000, // 3 Minuten

  // Stille-Erkennung (optional)
  SILENCE_DETECTION: false,     // auf true setzen zum Aktivieren
  SILENCE_THRESHOLD: 0.01,      // RMS-Wert unter dem Stille gilt
  SILENCE_DURATION_MS: 2000,    // wie lange Stille bis Auto-Stopp
};
