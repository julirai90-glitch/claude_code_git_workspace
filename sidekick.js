// Somedia Sidekick - Main Script
// Wird via Bookmarklet in Purple Hub CMS injiziert

(function() {
  'use strict';

  // Verhindere mehrfache Initialisierung
  if (window.SOMEDIA_SIDEKICK_LOADED) {
    console.log('Somedia Sidekick already loaded');
    return;
  }
  window.SOMEDIA_SIDEKICK_LOADED = true;

  // ============================================================================
  // KONFIGURATION
  // ============================================================================

  const CLAUDE_API = {
    endpoint: 'https://api.anthropic.com/v1/messages',
    model: 'claude-sonnet-4-5-20250929',
    version: '2023-06-01',
    maxTokens: 2048
  };

  const SELECTORS = {
    // Gutenberg + Fallback Selektoren
    title: '.editor-post-title__input, .wp-block-post-title, h1[contenteditable="true"]',
    lead: '[data-placeholder="Lead"], .editor-post-excerpt__textarea',
    content: '.block-editor-block-list__layout, .editor-styles-wrapper, .block-editor-writing-flow, .ProseMirror',
    images: 'img'
  };

  // ============================================================================
  // API KEY MANAGEMENT
  // ============================================================================

  function getAPIKey() {
    return localStorage.getItem('somedia_sidekick_api_key');
  }

  function setAPIKey(key) {
    localStorage.setItem('somedia_sidekick_api_key', key);
  }

  function promptForAPIKey() {
    const key = prompt('Claude API-Key eingeben:\n\n(Wird nur lokal im Browser gespeichert)');
    if (key && key.trim()) {
      setAPIKey(key.trim());
      return key.trim();
    }
    return null;
  }

  function ensureAPIKey() {
    let key = getAPIKey();
    if (!key) {
      key = promptForAPIKey();
      if (!key) {
        alert('Kein API-Key eingegeben. Sidekick kann nicht gestartet werden.');
        return null;
      }
    }
    return key;
  }

  // ============================================================================
  // CONTENT EXTRACTION
  // ============================================================================

  function extractContent() {
    const content = {
      title: '',
      lead: '',
      body: '',
      images: []
    };

    // Titel extrahieren
    const titleEl = document.querySelector(SELECTORS.title);
    if (titleEl) {
      content.title = titleEl.textContent.trim();
    }

    // Lead extrahieren
    const leadEl = document.querySelector(SELECTORS.lead);
    if (leadEl) {
      content.lead = leadEl.textContent.trim();
    }

    // Hauptinhalt extrahieren
    const contentEl = document.querySelector(SELECTORS.content);
    if (contentEl) {
      content.body = contentEl.textContent.trim();
    }

    // Bilder extrahieren
    const imageEls = document.querySelectorAll(SELECTORS.images);
    imageEls.forEach(img => {
      content.images.push({
        url: img.src,
        alt: img.alt || '',
        title: img.title || ''
      });
    });

    return content;
  }

  function getFullArticleText() {
    const content = extractContent();
    let text = '';

    if (content.title) text += `Titel: ${content.title}\n\n`;
    if (content.lead) text += `Lead: ${content.lead}\n\n`;
    if (content.body) text += `Inhalt:\n${content.body}`;

    return text.trim() || 'Kein Inhalt gefunden';
  }

  // ============================================================================
  // N8N BACKEND API
  // ============================================================================

  const N8N_API = {
    endpoint: 'https://n8n.julianreich.ch/webhook/somedia-sidekick'
  };

  async function callN8NAPI(type, content, context = {}) {
    const response = await fetch(N8N_API.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        type: type,
        content: content,
        context: context
      })
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`API-Fehler: ${error}`);
    }

    const data = await response.json();
    return data.result;
  }

  // ============================================================================
  // AI FUNKTIONEN
  // ============================================================================

  async function generateTitles() {
    const content = getFullArticleText();
    const extractedContent = extractContent();

    return await callN8NAPI('titles', content, {
      title: extractedContent.title,
      lead: extractedContent.lead
    });
  }

  async function generateAltText() {
    const content = extractContent();
    if (content.images.length === 0) {
      return 'Keine Bilder gefunden im Artikel.';
    }

    const imageInfo = `Anzahl Bilder: ${content.images.length}`;

    return await callN8NAPI('alttext', imageInfo, {
      title: content.title,
      lead: content.lead,
      articleSnippet: content.body ? content.body.substring(0, 500) : ''
    });
  }

  async function checkStyleGuide() {
    const content = getFullArticleText();
    const extractedContent = extractContent();

    return await callN8NAPI('check', content, {
      title: extractedContent.title,
      lead: extractedContent.lead
    });
  }

  async function generateLead() {
    const content = extractContent();
    const articleText = content.body || 'Kein Inhalt vorhanden';

    return await callN8NAPI('lead', articleText, {
      title: content.title
    });
  }

  async function generateSocialPost() {
    const content = extractContent();
    const articleSnippet = content.body ? content.body.substring(0, 800) : '';

    return await callN8NAPI('social', articleSnippet, {
      title: content.title,
      lead: content.lead
    });
  }

  // ============================================================================
  // UI
  // ============================================================================

  function createSidebar() {
    // Prüfe ob schon vorhanden
    if (document.getElementById('somedia-sidekick')) {
      return;
    }

    const sidebar = document.createElement('div');
    sidebar.id = 'somedia-sidekick';
    sidebar.innerHTML = `
      <div class="sidekick-header">
        <h3>🪄 Somedia Sidekick</h3>
        <button class="sidekick-close" onclick="document.getElementById('somedia-sidekick').remove()">×</button>
      </div>
      <div class="sidekick-body">
        <button class="sidekick-btn" data-action="titles">🎯 Titelvorschläge</button>
        <button class="sidekick-btn" data-action="alttext">🖼️ ALT-Texte</button>
        <button class="sidekick-btn" data-action="check">✅ Schreibregeln prüfen</button>
        <button class="sidekick-btn" data-action="lead">📝 Lead generieren</button>
        <button class="sidekick-btn" data-action="social">📱 Social Media Post</button>
        <div class="sidekick-result" id="sidekick-result"></div>
      </div>
      <div class="sidekick-footer">
        <small style="color: #666; text-align: center; padding: 8px;">Powered by AI</small>
      </div>
    `;

    // Styles
    const style = document.createElement('style');
    style.textContent = `
      #somedia-sidekick {
        position: fixed;
        top: 20px;
        right: 20px;
        width: 380px;
        max-height: 90vh;
        background: white;
        border: 1px solid #000;
        border-radius: 2px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.08);
        z-index: 999999;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        overflow: hidden;
        display: flex;
        flex-direction: column;
      }
      .sidekick-header {
        background: #000;
        color: white;
        padding: 16px;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      .sidekick-header h3 {
        margin: 0;
        font-size: 18px;
        font-weight: 600;
      }
      .sidekick-close {
        background: transparent;
        border: none;
        color: white;
        font-size: 24px;
        width: 32px;
        height: 32px;
        border-radius: 2px;
        cursor: pointer;
        transition: background 0.2s;
      }
      .sidekick-close:hover {
        background: rgba(255,255,255,0.15);
      }
      .sidekick-body {
        padding: 16px;
        overflow-y: auto;
        flex: 1;
      }
      .sidekick-btn {
        width: 100%;
        padding: 12px 16px;
        margin-bottom: 8px;
        background: white;
        border: 1px solid #ddd;
        border-radius: 2px;
        font-size: 14px;
        font-weight: 400;
        cursor: pointer;
        transition: all 0.15s;
        text-align: left;
      }
      .sidekick-btn:hover {
        background: #f9f9f9;
        border-color: #3b82f6;
      }
      .sidekick-btn:active {
        transform: scale(0.99);
      }
      .sidekick-btn:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
      .sidekick-result {
        margin-top: 16px;
        padding: 12px;
        background: #fafafa;
        border: 1px solid #eee;
        border-radius: 2px;
        font-size: 13px;
        line-height: 1.6;
        white-space: pre-wrap;
        display: none;
        max-height: 400px;
        overflow-y: auto;
      }
      .sidekick-result.visible {
        display: block;
      }
      .sidekick-result.loading {
        display: block;
        text-align: center;
        color: #6b7280;
      }
      .sidekick-result.error {
        display: block;
        background: #fee2e2;
        color: #991b1b;
      }
      .sidekick-footer {
        padding: 12px 16px;
        border-top: 1px solid #eee;
        background: white;
      }
      .sidekick-btn-secondary {
        width: 100%;
        padding: 8px;
        background: white;
        border: 1px solid #ddd;
        border-radius: 2px;
        font-size: 12px;
        cursor: pointer;
        transition: all 0.15s;
      }
      .sidekick-btn-secondary:hover {
        border-color: #3b82f6;
        color: #3b82f6;
      }
    `;

    document.head.appendChild(style);
    document.body.appendChild(sidebar);

    // Event Listeners
    sidebar.querySelectorAll('.sidekick-btn[data-action]').forEach(btn => {
      btn.addEventListener('click', handleAction);
    });
  }

  async function handleAction(e) {
    const action = e.target.dataset.action;
    const resultDiv = document.getElementById('sidekick-result');
    const allButtons = document.querySelectorAll('.sidekick-btn');

    // Disable all buttons
    allButtons.forEach(btn => btn.disabled = true);

    // Show loading
    resultDiv.className = 'sidekick-result loading';
    resultDiv.textContent = 'Wird generiert...';

    try {
      let result;
      switch(action) {
        case 'titles':
          result = await generateTitles();
          break;
        case 'alttext':
          result = await generateAltText();
          break;
        case 'check':
          result = await checkStyleGuide();
          break;
        case 'lead':
          result = await generateLead();
          break;
        case 'social':
          result = await generateSocialPost();
          break;
      }

      resultDiv.className = 'sidekick-result visible';
      resultDiv.textContent = result;

    } catch (error) {
      resultDiv.className = 'sidekick-result error';
      resultDiv.textContent = `Fehler: ${error.message}`;
      console.error('Sidekick Error:', error);
    } finally {
      // Re-enable buttons
      allButtons.forEach(btn => btn.disabled = false);
    }
  }

  // ============================================================================
  // INIT
  // ============================================================================

  function init() {
    // Prüfe ob im CMS
    if (!window.location.href.includes('purpleshub.com') &&
        !window.location.href.includes('wp-admin')) {
      if (confirm('Sidekick sollte nur im WordPress-CMS verwendet werden. Trotzdem starten?')) {
        createSidebar();
      }
      return;
    }

    // Sidebar erstellen
    createSidebar();

    console.log('✓ Somedia Sidekick geladen');
  }

  // Start
  init();

})();
