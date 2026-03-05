// Somedia Sidekick - Konfiguration
// Purple Hub CMS Selektoren

const CONFIG = {
  // Claude API
  api: {
    endpoint: 'https://api.anthropic.com/v1/messages',
    model: 'claude-sonnet-4-5-20250929',
    version: '2023-06-01',
    maxTokens: 2048
  },

  // Purple Hub CMS Selektoren
  selectors: {
    // Hauptfelder
    title: 'h1[contenteditable="true"]', // Titel-Feld
    lead: '[data-placeholder="Lead"]',    // Lead-Feld
    content: '.ProseMirror',              // Hauptinhalt

    // Fallback-Selektoren (falls Structure ändert)
    titleFallback: [
      'h1[contenteditable]',
      '[placeholder*="Titel"]',
      'input[type="text"][class*="title"]'
    ],

    leadFallback: [
      '[data-placeholder="Lead"]',
      '[placeholder*="Lead"]',
      'p[contenteditable="true"]:first-of-type'
    ],

    contentFallback: [
      '.ProseMirror',
      '[contenteditable="true"]',
      '#content'
    ],

    // Bilder
    images: 'img',
    imageContainer: '.image-container, figure'
  },

  // UI-Konfiguration
  ui: {
    position: 'right',  // right oder left
    width: '380px',
    zIndex: 999999
  },

  // Speicher-Keys
  storage: {
    apiKey: 'somedia_sidekick_api_key',
    settings: 'somedia_sidekick_settings'
  },

  // CMS-Detection
  cms: {
    host: 'purpleshub.com',
    paths: ['/wp-admin/', '/post-new.php', '/post.php']
  }
};

// Export für Module (falls verwendet)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = CONFIG;
}
