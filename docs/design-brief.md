# Design brief: custom qBittorrent WebUI (mobile-first PWA)

## Context

I run a self-hosted qBittorrent container (Docker) at home whose stock WebUI I find ugly and hard to scan. I have already tried alternatives such as **iQbit** (iOS-style theme) and **VueTorrent**, but I want to build my own, better solution — with a deliberate design of my own rather than an existing theme.

The result will later be implemented by Claude Code as a standalone GitHub repo and deployed as a separate Docker container alongside the existing qBittorrent setup. Your task right now is **the design only** (screens/mockups/design system), not the implementation.

## Technical frame (context, not for you to build)

- Pure frontend, no backend of its own, no database — the app talks exclusively to the official qBittorrent WebUI API (`/api/v2/...`), primarily via the `sync/maindata` endpoint for efficient delta polling.
- Stack: Vite + React (or Vue) + Tailwind CSS, as a PWA (installable on iPhone via "Add to Home Screen").
- Deployment: its own Docker container, running behind an nginx reverse proxy on a dedicated subdomain.
- Target devices: **primarily iPhone** (PWA, standalone, without Safari chrome), but the same app has to be fully usable in a desktop browser as well (responsive, not just "usable on mobile in a pinch").

## User context

Just me as the single user, technically experienced, no multi-user/auth system needed (login goes straight through the qBittorrent credentials). The app gets used several times a day to quickly check download status, add new torrents/magnet links and occasionally adjust settings (speed limits, categories).

## Design principles

- Look and feel modelled on native iOS apps (Apple Human Interface Guidelines): generous touch targets, safe-area insets, transitions/animations that feel native, bottom-tab navigation on mobile.
- Tidy and information-dense, but not cluttered — a deliberate contrast to the messy original WebUI.
- Automatic light/dark mode following the system.
- One-handed operation on the iPhone: important actions (pause/resume/delete) reachable in the lower part of the screen, e.g. via swipe gestures on list rows (like the Mail app).
- On desktop: responsive rework into sidebar navigation instead of bottom tabs, same information architecture.

## Scope / required screens

1. **Login screen** — qBittorrent credentials (username/password), minimal.
2. **Torrent list (main screen)** — per torrent: name, progress (visual, e.g. ring or bar), download/upload speed, ETA, size, state (downloading/seeding/paused/error), seeds/peers. Swipe actions (pause/resume/delete). Filtering/sorting by state and category. Multi-select for bulk actions.
3. **Torrent detail screen** — files inside the torrent (with adjustable priority), tracker list, peers, per-torrent speed limits, assigning category/tags.
4. **Add torrent** — via magnet link (paste/share-sheet integration on iOS would be ideal), via .torrent file upload, or via URL. Choice of save location/category while adding.
5. **Global status bar** — current total download/upload speed, free disk space, alt-speed toggle (turtle mode).
6. **Settings** — global speed limits, manage categories, plus any base settings controllable through the API.

## Out of scope

- No multi-user/accounts system
- No torrent search/discovery (managing existing/manually added ones only)
- No server-side persistence or analytics
- No support for several qBittorrent instances at once (just one for now)

## What I expect from you

Please create a mockup/design (visual, as an HTML/CSS prototype or equivalent) for the screens listed above, primarily for the iPhone viewport (respecting safe areas), plus an indication of how the whole thing behaves responsively at desktop width. Also define a small design system (colours for light/dark mode, typography, spacing, icon style) that I can then hand over 1:1 to an implementation.
