# Screenshots neu erzeugen

Fotografiert die App mit Demo-Daten statt mit einer echten qBittorrent-Instanz —
so landen keine realen Torrentnamen oder Serveradressen im öffentlichen Repo.
Braucht nur Node und ein installiertes Google Chrome, keine npm-Abhängigkeiten.

```bash
ng build
node tools/screenshot/mock-server.mjs dist/qbit-ember/browser &
node tools/screenshot/shoot.mjs docs/screenshots
kill %1
```
