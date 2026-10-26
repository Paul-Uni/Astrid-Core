# Hosting-Plan — astridcore.dev

> Ziel: Die Website läuft **selbst gehostet** bei mir zu Hause, ist unter `https://astridcore.dev` erreichbar, und das Setup kann später die private Seite (Login → Chat mit Astrid) mittragen.
> Nebenziel: Dabei verstehen, was passiert, und es in Obsidian (`30 Projects/Website`) mitschreiben.

---

## 0. Ausgangslage

| Was | Stand |
|---|---|
| Framework | Next.js 16 (App Router), React 19, R3F/three.js |
| Server-Features | **Keine.** Kein API-Route, keine Server Actions, kein `cookies()`. `/login` ist nur ein Platzhalter. |
| Fonts | `next/font/google` → werden beim Build heruntergeladen und **selbst ausgeliefert** (gut für DSGVO, keine Requests zu Google zur Laufzeit) |
| Domain | `astridcore.dev`, registriert bei Cloudflare |
| Code | `github.com/Paul-Uni/Astrid-Core` |
| Hardware | Haupt-PC „Astrid“ (Windows), Raspberry Pi, FRITZ!Box 6690 Cable (LAN `192.168.178.x`) |
| Anschluss | Kabel (DOCSIS). Kabelanbieter geben oft nur DS-Lite → keine eigene öffentliche IPv4 → Portfreigaben gehen nicht zuverlässig. Der Tunnel umgeht das. |

Heißt: Die öffentliche Seite ist im Moment technisch eine statische Seite. Sobald die private Seite kommt, brauchst du einen echten Server-Teil (Auth-Check, Proxy zum Agenten). Der Plan unten ist so gebaut, dass du **jetzt einfach startest und später nichts umbauen musst**.

---

## 1. Entscheidung: Wo läuft das Ding?

| Option | Selbst gehostet? | Pro | Contra |
|---|---|---|---|
| **A) Raspberry Pi + Cloudflare Tunnel** ✅ | Ja | 24/7 an, stromsparend, kein Port-Forwarding, Heim-IP bleibt versteckt, HTTPS automatisch, funktioniert auch hinter DS-Lite/CGNAT | Pi muss Node + Build packen (Pi 4/5 ok) |
| B) Astrid-PC direkt | Ja | Viel Power | Läuft nicht 24/7, ist dein Gaming-/Arbeitsrechner → schlechtester Ort für einen öffentlichen Server |
| C) VPS (z. B. Hetzner, ~4–5 €/Monat) | Halb | Feste IP, Rechenzentrum | Kostet, ist „fremde Hardware“, mehr Härtung nötig |
| D) Cloudflare Pages / Vercel | Nein | 5 Minuten, gratis | Verfehlt dein Ziel „selbst hosten & lernen“ — aber guter **Notfall-Fallback** |

**Empfehlung: A.** Die Domain liegt eh schon bei Cloudflare, und der Tunnel nimmt dir die zwei nervigsten Heim-Hosting-Probleme ab: Router-Ports öffnen und dynamische IP.

### Architektur

```
Besucher ──HTTPS──▶ Cloudflare (DNS, TLS, Cache, DDoS-Schutz)
                         │
                         │  ausgehende Verbindung vom Pi (Tunnel)
                         ▼
              ┌──────── Raspberry Pi ────────┐
              │ cloudflared  ──▶  Next.js    │
              │                  :3000       │
              │ (systemd hält beides am Laufen)
              └──────────────────────────────┘

   Später:  core.astridcore.dev ──▶ Cloudflare Access (Login) ──▶ Pi ──LAN──▶ Astrid-PC (Ollama/Agent)
```

Der Pi baut die Verbindung **nach außen** auf. In der FRITZ!Box wird kein einziger Port geöffnet.

---

## 2. Phasen (Checkliste)

### Phase 1 — Pi vorbereiten
- [ ] Pi-Modell checken: **Pi 4 oder 5 mit ≥ 2 GB RAM**, 64-bit Raspberry Pi OS Lite (Bookworm oder neuer)
- [ ] Optional, aber sinnvoll: SSD per USB statt SD-Karte (SD-Karten sterben bei Dauerbetrieb gern)
- [ ] In der FRITZ!Box dem Pi eine **feste IP** geben („Diesem Netzwerkgerät immer die gleiche IPv4-Adresse zuweisen“)
- [ ] SSH nur mit Key, Passwort-Login aus (`PasswordAuthentication no`)
- [ ] `sudo apt update && sudo apt full-upgrade`, dann `unattended-upgrades` für Sicherheitsupdates
- [ ] Eigener User `web` für die Seite (nicht als `pi`/root laufen lassen)
- [ ] Node.js **22 LTS** installieren (NodeSource-Repo oder `nvm`) → `node -v` prüfen

📝 *Notiz-Thema: SSH-Keys, Linux-User & Rechte, warum man Dienste nicht als root laufen lässt.*

### Phase 2 — Build produktionsreif machen (im Repo)
- [ ] In `next.config.ts` ergänzen: `output: "standalone"` → Next packt alles, was der Server braucht, in `.next/standalone` (kleiner, kein komplettes `node_modules` nötig)
- [ ] `allowedDevOrigins` kann bleiben (wirkt nur im Dev-Modus)
- [ ] Lokal testen: `npm run build` → `npm start` → `http://localhost:3000` ansehen
- [ ] `npm run typecheck`, `npm run lint`, `npm run test` grün
- [ ] README: „Live“-Link stimmt erst, wenn Phase 4 durch ist

> **Alternative:** Weil gerade nichts serverseitig passiert, ginge auch `output: "export"` (reine HTML-Dateien, ausgeliefert z. B. von Caddy). Noch leichter für den Pi — aber sobald die private Seite kommt, musst du auf einen Node-Server umbauen. Darum lieber direkt `standalone`.

### Phase 3 — Seite auf dem Pi laufen lassen
- [ ] Repo auf den Pi klonen: `git clone https://github.com/Paul-Uni/Astrid-Core.git /srv/astrid-core`
- [ ] Auf dem Pi bauen: `npm ci && npm run build` (Pi 4/5: ein paar Minuten — **auf dem Pi bauen**, weil native Pakete wie `sharp` zur ARM-Architektur passen müssen; ein Build vom Windows-PC läuft dort nicht)
- [ ] Statische Dateien in den Standalone-Ordner kopieren (macht Next nicht von selbst):
  ```bash
  cp -r public .next/standalone/
  cp -r .next/static .next/standalone/.next/
  ```
- [ ] Test: `PORT=3000 HOSTNAME=127.0.0.1 node .next/standalone/server.js` → im LAN prüfen
- [ ] **systemd-Service** anlegen, damit die Seite nach Absturz/Neustart von allein wieder hochkommt:
  ```ini
  # /etc/systemd/system/astrid-core.service
  [Unit]
  Description=astridcore.dev (Next.js)
  After=network-online.target

  [Service]
  User=web
  WorkingDirectory=/srv/astrid-core/.next/standalone
  Environment=NODE_ENV=production PORT=3000 HOSTNAME=127.0.0.1
  ExecStart=/usr/bin/node server.js
  Restart=always
  RestartSec=5

  [Install]
  WantedBy=multi-user.target
  ```
  `sudo systemctl enable --now astrid-core` · Logs: `journalctl -u astrid-core -f`

📝 *Notiz-Thema: Was ist ein Build, was macht `standalone`, was ist systemd, warum `127.0.0.1` statt `0.0.0.0`.*

### Phase 4 — Cloudflare Tunnel (der eigentliche „Online“-Moment)
- [ ] Cloudflare Dashboard → **Zero Trust → Networks → Tunnels → Create tunnel** (Typ *Cloudflared*), Name z. B. `astrid-pi`
- [ ] Den angezeigten Install-Befehl auf dem Pi ausführen → installiert `cloudflared` als Service mit Token
- [ ] **Public Hostname** anlegen: `astridcore.dev` → `http://localhost:3000`
- [ ] Zweiten Hostname `www.astridcore.dev` → gleich, und per Redirect Rule auf `astridcore.dev` umleiten
- [ ] Alte/kaputte DNS-Einträge (A-Records o. ä.) für die Domain entfernen — der Tunnel legt selbst CNAMEs an
- [ ] SSL/TLS: **Always Use HTTPS** an, Min. TLS 1.2
- [ ] Von außen testen (Handy im Mobilfunk, nicht WLAN!)

📝 *Notiz-Thema: DNS (A vs. CNAME), Reverse Proxy, warum ein ausgehender Tunnel kein offener Port ist, was TLS macht.*

### Phase 5 — Feinschliff bei Cloudflare
- [ ] Caching: `/_next/static/*` hat schon `immutable`-Header von Next → Cloudflare cached das automatisch. Prüfen mit DevTools (`cf-cache-status: HIT`)
- [ ] Security-Header (per Cloudflare Transform Rule oder `headers()` in `next.config.ts`): `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`. **CSP** erst später und vorsichtig (WebGL/Shader + Next-Inline-Scripts)
- [ ] HSTS erst aktivieren, wenn alles stabil auf HTTPS läuft (lässt sich schwer zurücknehmen)
- [ ] Optional: **Cloudflare Web Analytics** (ohne Cookies) statt Google Analytics
- [ ] Lighthouse-Check auf der Live-Seite (Performance mit dem 3D-Stream im Blick behalten)

### Phase 6 — Deploy-Workflow (Updates ohne Gefrickel)
- [ ] Erstmal simpel: `deploy.sh` auf dem Pi
  ```bash
  #!/usr/bin/env bash
  set -euo pipefail
  cd /srv/astrid-core
  git pull --ff-only
  npm ci
  npm run build
  cp -r public .next/standalone/
  cp -r .next/static .next/standalone/.next/
  sudo systemctl restart astrid-core
  ```
  Ablauf: am PC entwickeln → `git push` → per SSH auf den Pi → `./deploy.sh`
- [ ] Später (Level-up): GitHub Actions mit **self-hosted Runner auf dem Pi** → Push auf `main` deployt automatisch
- [ ] Fallback bereithalten: Wenn der Pi ausfällt, ist Cloudflare Pages in 5 Min. eingerichtet

### Phase 7 — Monitoring & Backup
- [ ] Uptime-Check von außen (z. B. UptimeRobot, gratis) → Mail, wenn die Seite down ist
- [ ] Pi-Setup dokumentieren (oder als Script/Ansible), damit eine neue SD-Karte in 30 Min. wieder läuft
- [ ] Code liegt eh auf GitHub; zu sichern sind nur Configs (`/etc/systemd/...`, `deploy.sh`) → mit ins Repo unter `ops/`
- [ ] 💡 Tie-in: Das **Telemetry-Panel** auf der Seite kann später genau das anzeigen — „Pi online, Uptime X Tage“

### Phase 8 — Rechtliches (Deutschland)
- [ ] **Impressum** (§ 5 DDG) — bei einer persönlichen Lebenslauf-Seite umstritten, ob Pflicht; sicherer ist: haben. Problem: Wohnadresse wird öffentlich → Alternativen sind ein Impressum-Service / c/o-Adresse
- [ ] **Datenschutzerklärung**: Cloudflare verarbeitet IP-Adressen (Auftragsverarbeitung, AVV im Dashboard akzeptieren), Server-Logs, ggf. Analytics. Keine Cookies auf der öffentlichen Seite → kein Cookie-Banner nötig
- [ ] Beides als eigene Seiten (`/impressum`, `/privacy`), im Footer verlinken

> Kein Rechtsrat — für den finalen Text lohnt ein Generator (z. B. e-recht24) oder kurz jemanden fragen, der sich auskennt.

---

## 3. Später: Die private Seite („Enter Core“)

Das ist der Grund, warum das Setup so gebaut ist:

1. **Login über Cloudflare Access** (Zero Trust, im Free-Plan für kleine Nutzerzahlen drin) vor `core.astridcore.dev` oder dem Pfad `/core/*`. Login per E-Mail-Code oder GitHub. → Niemand erreicht den privaten Teil, bevor Cloudflare ihn reingelassen hat. Erfüllt deine Regel „nichts Privates ohne echten serverseitigen Login“.
2. **Zweite Absicherung im Next-Server**: das von Access mitgeschickte JWT (`Cf-Access-Jwt-Assertion`) prüfen. Falls jemand den Tunnel umgeht, bleibt die Tür trotzdem zu.
3. **Chat zu Astrid**: Next-Server auf dem Pi leitet Anfragen per LAN an den Agenten auf dem Astrid-PC weiter (Ollama/Agent-API). Der PC wird **nie** direkt ins Internet gehängt.
4. **PC aus?** → Pi schickt Wake-on-LAN, Seite zeigt „Core waking up…“.
5. **File-System-Zugriff** ganz zum Schluss und nur read-only zuerst.

Dann wird aus der `/login`-Platzhalterseite ein Weiterleitungs-Punkt zu Cloudflare Access.

---

## 4. Lern-Notizen für Obsidian (Vorschlag für Notizen-Titel)

- `DNS — A, AAAA, CNAME, Proxy-Status`
- `Reverse Proxy & Tunnel — warum kein Port-Forwarding`
- `TLS/HTTPS — wer hat das Zertifikat?`
- `systemd — Services, Restart, journalctl`
- `Next.js Build — dev vs. build vs. standalone`
- `Zero Trust / Cloudflare Access`
- `Server-Härtung Pi — SSH, User, Updates`

---

## 5. Offene Fragen (vor dem Start klären)

1. Welches Pi-Modell / wie viel RAM? (Pi 3 wäre zu schwach zum Bauen → dann per GitHub Actions bauen)
2. Läuft auf dem Pi schon was anderes (Pi-hole, Home Assistant …), das Port 3000 o. ä. belegt?
3. Website unter `astridcore.dev` oder lieber zuerst unter einer Test-Subdomain (`beta.astridcore.dev`) live gehen?
4. Impressum: eigene Adresse ok oder Service nutzen?

---

### Reihenfolge auf einen Blick

```
Pi härten → standalone-Build → systemd → Tunnel → online 🎉
        → Header/Cache → deploy.sh → Monitoring → Impressum/DSGVO
        → (später) Cloudflare Access → Astrid-Chat
```
