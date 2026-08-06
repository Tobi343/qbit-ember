# Design-Auftrag: Eigene qBittorrent WebUI (Mobile-First PWA)

## Kontext

Ich betreibe zuhause einen qBittorrent-Container (self-hosted, Docker), dessen Standard-WebUI ich hässlich und unübersichtlich finde. Ich habe bereits Alternativen wie **iQbit** (iOS-artiges Theme) und **VueTorrent** ausprobiert, will aber eine eigene, bessere Lösung bauen – mit eigenem, durchdachtem Design statt einem bestehenden Theme.

Das Ergebnis wird später von Claude Code als eigenständiges GitHub-Repo implementiert und als separater Docker-Container neben dem bestehenden qBittorrent-Setup deployt. Deine Aufgabe jetzt ist **nur das Design** (Screens/Mockups/Designsystem), keine Implementierung.

## Technischer Rahmen (für Kontext, nicht für dich zu bauen)

- Reines Frontend, kein eigenes Backend, keine Datenbank – die App kommuniziert ausschließlich mit der offiziellen qBittorrent WebUI API (`/api/v2/...`), primär über den `sync/maindata`-Endpoint für effizientes Delta-Polling.
- Stack: Vite + React (oder Vue) + Tailwind CSS, als PWA (installierbar auf iPhone via „Zum Home-Bildschirm").
- Deployment: eigener Docker-Container, läuft hinter nginx-Reverse-Proxy auf eigener Subdomain.
- Zielgeräte: **primär iPhone** (PWA, standalone, ohne Safari-Chrome), aber die gleiche App muss auch im Desktop-Browser vollwertig nutzbar sein (responsive, nicht nur „mobile notfall-tauglich").

## Nutzerkontext

Nur ich als einziger Nutzer, technisch versiert, kein Multi-User/Auth-System nötig (Login läuft direkt über die qBittorrent-Credentials). Genutzt wird die App mehrmals täglich, um kurz den Download-Status zu checken, neue Torrents/Magnet-Links hinzuzufügen und gelegentlich Einstellungen (Speed-Limits, Kategorien) anzupassen.

## Design-Prinzipien

- Look & Feel angelehnt an native iOS-Apps (Apple Human Interface Guidelines): großzügige Touch-Targets, Safe-Area-Insets, native wirkende Übergänge/Animationen, Bottom-Tab-Navigation auf Mobile.
- Aufgeräumt und informationsdicht, aber nicht überladen – bewusster Kontrast zum unübersichtlichen Original-WebUI.
- Automatischer Light/Dark Mode passend zum System.
- Einhändige Bedienbarkeit auf dem iPhone: wichtige Aktionen (Pause/Resume/Delete) im unteren Bildschirmbereich erreichbar, z.B. via Swipe-Gesten auf Listeneinträgen (wie Mail-App).
- Auf Desktop: responsive Umbau zu einer Sidebar-Navigation statt Bottom-Tabs, gleiche Informationsarchitektur.

## Funktionsumfang / benötigte Screens

1. **Login-Screen** – qBittorrent-Zugangsdaten (Username/Passwort), minimalistisch.
2. **Torrent-Liste (Hauptscreen)** – pro Torrent: Name, Fortschritt (visuell, z.B. Ring oder Balken), Download-/Upload-Geschwindigkeit, ETA, Größe, Status (downloading/seeding/paused/error), Seeds/Peers. Swipe-Aktionen (Pause/Resume/Delete). Filter/Sortierung nach Status und Kategorie. Mehrfachauswahl für Bulk-Aktionen.
3. **Torrent-Detail-Screen** – Dateien im Torrent (mit Priorität einstellbar), Tracker-Liste, Peers, individuelle Speed-Limits, Kategorie/Tags zuweisen.
4. **Torrent hinzufügen** – per Magnet-Link (Paste/Share-Sheet-Integration auf iOS wäre ideal), per .torrent-Datei-Upload, oder per URL. Auswahl Speicherort/Kategorie beim Hinzufügen.
5. **Globale Status-Leiste** – aktuelle Gesamt-Download-/Upload-Geschwindigkeit, freier Speicherplatz, Alt-Speed-Toggle (Turtle Mode).
6. **Einstellungen** – globale Speed-Limits, Kategorien verwalten, ggf. Grundeinstellungen die über die API steuerbar sind.

## Nicht im Scope

- Kein Multi-User/Accounts-System
- Keine Suche/Discovery von Torrents (nur Verwaltung bestehender/manuell hinzugefügter)
- Keine Server-seitige Persistenz oder Analytics
- Keine Unterstützung für mehrere qBittorrent-Instanzen gleichzeitig (erstmal nur eine)

## Was ich von dir erwarte

Bitte erstelle ein Mockup/Design (visuell, als HTML/CSS-Prototyp oder vergleichbar) für die oben genannten Screens, in erster Linie für iPhone-Viewport (mit Safe-Area-Berücksichtigung), plus eine Andeutung, wie sich das Ganze responsive auf Desktop-Breite verhält. Definiere dabei auch ein kleines Designsystem (Farben für Light/Dark Mode, Typografie, Abstände, Icon-Stil), das ich danach 1:1 an eine Implementierung übergeben kann.
