# Implementierungs-Auftrag: qbit-ember

Du baust **qbit-ember**, eine eigenständige, mobile-first Web-UI für qBittorrent (ersetzt die
hässliche Standard-WebUI). Das komplette High-Fidelity-Design ist bereits fertig und liegt in
diesem Repo unter `design/` – lies **`design/README.md`** und **`design/uploads/STYLE_GUIDE.md`**
vollständig, bevor du irgendetwas implementierst. Jede Zahl darin (Farben, Radien, Abstände,
Timing, Copy) ist verbindlich, nicht nur Anhaltspunkt.

Die Dateien `design/qbit WebUI.dc.html` und `design/qbitPhone.dc.html` sind interaktive
Prototypen aus einem Design-Tool und laufen über eine proprietäre Runtime (`design/support.js`).
**Das ist kein Code zum Übernehmen.** Nutze sie nur, um das Verhalten/Layout visuell
nachzuvollziehen – portiere nicht das Markup, sondern baue die Screens sauber im Zielstack neu.

## Produkt

Reines Frontend, kein eigenes Backend, keine Datenbank, kein User-Auth-System (Login läuft 1:1
über die qBittorrent-Zugangsdaten). Die App kommuniziert ausschließlich mit der offiziellen
qBittorrent WebUI API v2 (`/api/v2/...`), primär über `sync/maindata` für effizientes
Delta-Polling. Der volle Funktionsumfang, alle Screens, das API-Mapping und der State sind in
`design/README.md` (Abschnitte "Screens", "API", "State") bereits exakt spezifiziert – setze das
1:1 um.

Einziger Nutzer bin ich, kein Multi-Tenant, keine Rollen/Rechte.

## Stack (verbindlich)

- **Angular, standalone components**, TypeScript strict. Das ist der Stack, für den
  `STYLE_GUIDE.md` geschrieben ist (§10) und der zu meinen anderen Apps passt – kein React/Vue.
- Design-Tokens als CSS Custom Properties exakt aus `STYLE_GUIDE.md` §3 übernehmen, keine
  eigenen Farben/Radien/Fonts erfinden.
- Font Awesome 6 Free (solid) über CDN, einfarbig via `currentColor`, wie in §6 beschrieben.
- Kein State-Management-Framework nötig – ein schlanker `QbitApiService` (RxJS oder Signals) für
  Login/Session-Cookie und das Polling von `sync/maindata` reicht.
- PWA via `@angular/pwa`: `manifest.json` (Name, Icons, `display: standalone`, `theme-color` aus
  den Design-Tokens), Safe-Area-Insets für iPhone (Notch/Home-Indicator) berücksichtigen. Der
  Service Worker cached nur statische Assets, **niemals** API-Responses.
- Für lokale Entwicklung: Angular Dev-Proxy (`proxy.conf.json`) auf eine echte qBittorrent-Instanz
  zeigen lassen, damit `ng serve` ohne CORS-Probleme läuft (Same-Origin-Trick wie im Prod-Setup).

## Deployment / Docker (wichtig für die Komodo-Einbindung)

Ziel: **ein einziger, in sich geschlossener Container**, der genauso funktioniert wie das bereits
im Homelab laufende `iQbit` – Static Build + eingebauter Reverse-Proxy zur qBittorrent-API, damit
kein CORS-Setup und keine manuelle Split-Konfiguration im vorgelagerten Reverse-Proxy nötig ist.

- **Multi-Stage Dockerfile**: Node-Stage baut `ng build --configuration production`, Runtime-Stage
  ist `nginx:alpine` und liefert `dist/`.
- **nginx.conf im Image** übernimmt zwei Aufgaben:
  1. Angular-App ausliefern mit Fallback auf `index.html` (Client-Side-Routing).
  2. `/api/v2/` (inkl. Cookies) auf ein per Umgebungsvariable konfigurierbares Backend
     reverse-proxyen, z. B. `QBIT_API_URL` (Default `http://gluetun:8090`, da qBittorrent bei mir
     hinter Gluetun/VPN im selben Docker-Netzwerk läuft und dessen Netzwerk-Namespace teilt).
     Umsetzung via `envsubst` auf ein `nginx.conf.template` beim Container-Start (Standardmuster
     des offiziellen nginx-Images).
- **Zielplattform ist ein Raspberry Pi (arm64)**. Baue das Image daher **nicht** auf dem Pi selbst
  (das hat in der Vergangenheit an DNS/Buildx-Problemen gehakt), sondern über eine
  **GitHub-Actions-Workflow**, die bei Push auf `main` bzw. bei Tags ein Multi-Arch-Image
  (mind. `linux/arm64`, gerne zusätzlich `linux/amd64`) baut und nach **GHCR** pusht
  (`ghcr.io/<github-user>/qbit-ember`). Komodo zieht dann nur noch ein fertiges Image, statt es
  vor Ort zu bauen.
- Liefere eine Beispiel-`docker-compose.yml` (bzw. Snippet) im README, die zu meinem bestehenden
  Stack passt: eigener Service, `QBIT_API_URL=http://gluetun:8090`, im selben Docker-Netzwerk wie
  `gluetun`, kein Port-Publish nötig, falls über einen vorgelagerten Reverse-Proxy (nginx) auf
  einer eigenen Subdomain erreichbar gemacht wird.

## Repo

- Öffentliches GitHub-Repo, Name `qbit-ember` (gerne anpassen falls es schon vergeben ist).
- Lizenz: MIT.
- Sinnvolle `.gitignore` (Angular/Node-Standard, `dist/`, `node_modules/`).
- README mit: Kurzbeschreibung, Screenshot(s)/GIF sobald vorhanden, lokalem Dev-Setup
  (`proxy.conf.json`), Build-Anleitung, Docker-Compose-Beispiel, Hinweis auf `design/` als
  Referenz für das Designsystem.
- `design/`-Ordner aus diesem Handoff unverändert ins Repo übernehmen (dient als lebende
  Referenzdokumentation für Farben/Komponenten/Screens, auch für spätere Änderungen).

## Vorgehen

Wie in `STYLE_GUIDE.md` §13 beschrieben: erst alle Screens mit ihren drei Zonen (Header / Content
/ FAB) und der jeweiligen Primäraktion auflisten, dann **Screen für Screen** bauen und vor dem
nächsten Screen kurz Rückmeldung einholen. Vor jedem "fertig" die Checkliste aus §11 durchgehen
(Tokens statt Hex-Werten, 44px Tap-Targets, Motion nur aus der 3-Werte-Skala, etc.).
