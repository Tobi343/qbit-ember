# Regenerating the screenshots

Shoots the app against demo data instead of a real qBittorrent instance, so no real torrent
names or server addresses end up in the public repo. Needs only Node and an installed Google
Chrome — no npm dependencies.

```bash
ng build
node tools/screenshot/mock-server.mjs dist/qbit-ember/browser &
node tools/screenshot/shoot.mjs docs/screenshots
kill %1
```
