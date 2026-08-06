# qbit-ember

Eine selbst gebaute, mobile-first Web-UI für [qBittorrent](https://www.qbittorrent.org/) —
Ersatz für die Standard-WebUI. Dunkles Design mit rotem Akzent ("Modern Dark + Red"),
iOS-artige Navigation, Desktop-Layout mit Sidebar + Tabelle + Detail-Spalte.

Reines Frontend: kein eigenes Backend, keine Datenbank. Die App spricht ausschließlich die
offizielle [qBittorrent WebUI API v2](https://github.com/qbittorrent/qBittorrent/wiki/WebUI-API-(qBittorrent-4.1))
(`/api/v2/...`), primär `sync/maindata` als Delta-Polling im 1,1s-Takt. Login läuft 1:1 über
die qBittorrent-Zugangsdaten.

<!-- Screenshot folgt -->

## Stack

- Angular (standalone components, Signals), TypeScript strict
- Design-Tokens als CSS Custom Properties — Light/Dark, siehe [`design/`](design/README.md)
- Font Awesome 6 Free (CDN), WildBreath-Display-Font

## Lokale Entwicklung

`proxy.conf.json` zeigt auf eine echte qBittorrent-Instanz (Same-Origin-Trick, kein CORS):

```json
{ "/api": { "target": "http://192.168.178.165:8090", "changeOrigin": true } }
```

```bash
npm ci
npx ng serve        # http://localhost:4200, /api/v2/* wird zur Instanz geproxied
```

## Build & Docker

Ein einziger Container: Multi-Stage-Build (Node → nginx:alpine). nginx liefert den statischen
Build aus und reverse-proxied `/api/v2/` auf das per `QBIT_API_URL` konfigurierte Backend
(Default `http://gluetun:8090`) — kein CORS-Setup nötig.

```bash
docker build -t qbit-ember .
docker run -p 8080:80 -e QBIT_API_URL=http://192.168.178.165:8090 qbit-ember
```

Bei Push auf `main` (bzw. Tags `v*`) baut GitHub Actions ein Multi-Arch-Image
(`linux/arm64` + `linux/amd64`) und pusht es nach GHCR — der Pi baut nichts selbst.

## Deployment (docker-compose / Komodo)

```yaml
services:
  qbit-ember:
    image: ghcr.io/<github-user>/qbit-ember:latest
    container_name: qbit-ember
    environment:
      - QBIT_API_URL=http://gluetun:8090
    networks:
      - gluetun-net          # dasselbe Netzwerk wie der gluetun-Container
    restart: unless-stopped
    # kein Port-Publish nötig, wenn ein vorgelagerter Reverse-Proxy (nginx)
    # auf einer eigenen Subdomain auf qbit-ember:80 zeigt
```

Hinweis: nginx löst den `QBIT_API_URL`-Hostnamen beim Start auf — der `gluetun`-Container
muss also laufen, bevor `qbit-ember` startet (`depends_on` bzw. Stack-Reihenfolge in Komodo).

## Design

Der komplette High-Fidelity-Designhandoff (Tokens, Screens, Style Guide, interaktive
Prototypen) liegt unter [`design/`](design/README.md) und ist die verbindliche Referenz
für Farben, Komponenten und Verhalten — auch für spätere Änderungen.

## Lizenz

[MIT](LICENSE)
