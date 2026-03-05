# Deployment Guide - Somedia Sidekick

## Variante 1: GitHub Pages (Empfohlen)

### Schritt 1: Git initialisieren

```bash
cd C:\Users\julir\Claude_Code_Workspace\somedia-sidekick

# Git initialisieren
git init

# Alle Dateien hinzufügen
git add .

# Ersten Commit erstellen
git commit -m "Initial commit: Somedia Sidekick v1.0"
```

### Schritt 2: GitHub Repository erstellen

1. Gehe zu [github.com/new](https://github.com/new)
2. Repository-Name: `somedia-sidekick`
3. Beschreibung: "AI-gestützter Schreibassistent für Somedia"
4. Visibility: **Public** (für GitHub Pages)
5. Klicke "Create repository"

### Schritt 3: Code auf GitHub pushen

```bash
# Remote hinzufügen (ersetze DEIN-USERNAME)
git remote add origin https://github.com/DEIN-USERNAME/somedia-sidekick.git

# Branch umbenennen
git branch -M main

# Pushen
git push -u origin main
```

### Schritt 4: GitHub Pages aktivieren

1. Gehe zu Repository → Settings
2. Navigiere zu "Pages" (links im Menü)
3. Source: **main** branch
4. Folder: **/ (root)**
5. Klicke "Save"
6. Warte 1-2 Minuten

### Schritt 5: URL testen

Deine Seite ist nun erreichbar unter:
```
https://DEIN-USERNAME.github.io/somedia-sidekick/
```

Teste:
- `https://DEIN-USERNAME.github.io/somedia-sidekick/` (Setup-Seite)
- `https://DEIN-USERNAME.github.io/somedia-sidekick/test.html` (Test-Seite)
- `https://DEIN-USERNAME.github.io/somedia-sidekick/sidekick.js` (Script)

### Schritt 6: Bookmarklet-URL anpassen

Öffne `index.html` und ändere die Bookmarklet-URL:

**Vorher:**
```javascript
javascript:(function(){
  var s=document.createElement('script');
  s.src='https://raw.githubusercontent.com/YOUR-USERNAME/somedia-sidekick/main/sidekick.js?'+Date.now();
  document.body.appendChild(s);
})();
```

**Nachher:**
```javascript
javascript:(function(){
  var s=document.createElement('script');
  s.src='https://DEIN-USERNAME.github.io/somedia-sidekick/sidekick.js?'+Date.now();
  document.body.appendChild(s);
})();
```

### Schritt 7: Änderungen committen

```bash
git add index.html
git commit -m "Update: Bookmarklet-URL für GitHub Pages"
git push
```

Warte 1-2 Minuten, dann ist die aktualisierte Seite live.

---

## Variante 2: Eigener Server (n8n)

Falls du es auf deinem Hetzner-Server (91.98.76.206) hosten willst:

### Schritt 1: Dateien auf Server kopieren

```bash
# Via SCP (von lokalem Terminal)
scp -r C:\Users\julir\Claude_Code_Workspace\somedia-sidekick root@91.98.76.206:/home/n8n/

# ODER via SSH:
ssh root@91.98.76.206
cd /home/n8n
mkdir somedia-sidekick
# Dann Dateien manuell hochladen via SFTP
```

### Schritt 2: Nginx/Caddy konfigurieren

Da du bereits Caddy verwendest (für n8n), füge einen neuen Block hinzu:

```bash
ssh root@91.98.76.206
cd /home/n8n/n8n-docker-caddy
nano Caddyfile
```

Füge hinzu:
```
sidekick.julianreich.ch {
    root * /home/n8n/somedia-sidekick
    file_server
    encode gzip
}
```

Caddy neu laden:
```bash
docker-compose restart caddy
```

### Schritt 3: DNS-Eintrag erstellen

Bei deinem DNS-Provider (wo julianreich.ch gehostet ist):

- **Type**: A
- **Name**: sidekick
- **Value**: 91.98.76.206
- **TTL**: 3600

### Schritt 4: Testen

Nach 5-10 Minuten (DNS-Propagierung):
```
https://sidekick.julianreich.ch/
```

### Schritt 5: Bookmarklet-URL anpassen

In `index.html`:
```javascript
s.src='https://sidekick.julianreich.ch/sidekick.js?'+Date.now();
```

---

## Variante 3: Lokaler Python-Server (nur für Tests)

Für lokale Entwicklung ohne Deployment:

```bash
cd C:\Users\julir\Claude_Code_Workspace\somedia-sidekick

# Python 3
python -m http.server 8000

# Öffne Browser:
# http://localhost:8000/
```

**Nachteil**: Funktioniert nur auf deinem Computer, nicht im echten CMS.

---

## Updates deployen

### Bei GitHub Pages:

```bash
# Änderungen machen
# Dann:
git add .
git commit -m "Update: Beschreibung der Änderung"
git push
```

GitHub Pages aktualisiert automatisch (1-2 Minuten).

### Bei eigenem Server:

```bash
# Lokal
git add .
git commit -m "Update: Änderung"
git push

# Auf Server
ssh root@91.98.76.206
cd /home/n8n/somedia-sidekick
git pull
```

---

## Bookmarklet erstellen (für Nutzer)

### Desktop (Chrome/Edge/Firefox):

1. Öffne deine Deployment-URL (z.B. `https://DEIN-USERNAME.github.io/somedia-sidekick/`)
2. Ziehe den 🪄-Button in die Lesezeichen-Leiste
3. Fertig!

### Alternative (Manuell):

1. Rechtsklick auf Lesezeichen-Leiste → "Neues Lesezeichen"
2. Name: `🪄 Sidekick`
3. URL:
```javascript
javascript:(function(){var s=document.createElement('script');s.src='https://DEINE-URL/sidekick.js?'+Date.now();document.body.appendChild(s);})();
```
4. Speichern

---

## SSL/HTTPS

- **GitHub Pages**: Automatisch SSL ✓
- **Eigener Server mit Caddy**: Automatisch Let's Encrypt SSL ✓
- **Lokal**: Kein SSL (nur http://localhost)

**Wichtig**: Bookmarklets müssen über HTTPS geladen werden, wenn das CMS HTTPS nutzt!

---

## Monitoring & Logs

### GitHub Pages:

- Kein direktes Logging verfügbar
- Schaue auf GitHub: Settings → Pages für Deployment-Status

### Eigener Server:

```bash
# Nginx/Caddy Logs
ssh root@91.98.76.206
tail -f /var/log/caddy/access.log
```

### Browser (User-Side):

- Öffne Browser-Console (F12)
- Schaue nach Fehlermeldungen

---

## Backup

### GitHub:

Code ist automatisch auf GitHub gesichert ✓

### Eigener Server:

```bash
# Backup erstellen
ssh root@91.98.76.206
cd /home/n8n
tar -czf somedia-sidekick-backup-$(date +%Y%m%d).tar.gz somedia-sidekick/

# Backup herunterladen
scp root@91.98.76.206:/home/n8n/somedia-sidekick-backup-*.tar.gz .
```

---

## Nächste Schritte

1. ✅ Deployment abschließen (GitHub Pages ODER eigener Server)
2. ✅ Bookmarklet-URL anpassen
3. ✅ Im echten Purple Hub CMS testen
4. ✅ API-Key Kosten im Auge behalten
5. ⏭️ Optional: n8n-Backend aufsetzen (für Team-Nutzung)

---

## Troubleshooting

**Problem**: "Script could not be loaded"
- Prüfe ob URL erreichbar ist (im Browser direkt öffnen)
- Prüfe CORS-Einstellungen

**Problem**: GitHub Pages zeigt "404"
- Warte 2-5 Minuten nach Aktivierung
- Prüfe ob Branch "main" heißt (nicht "master")
- Schaue Settings → Pages für Fehler

**Problem**: "Mixed Content" Error
- Stelle sicher, dass Script-URL HTTPS nutzt
- GitHub Pages hat automatisch HTTPS
