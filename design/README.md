# Handoff: qBittorrent WebUI — native mobile & desktop interface

## Overview

A redesign of the qBittorrent Web UI (server `192.168.178.165:8090`, qBittorrent 5.0.4) as a
phone-first app with a matching desktop layout. It replaces the default table-only Web UI with:

* a **phone app** (402 × 874) — torrent list, torrent detail, add-torrent sheet, delete dialog, settings
* a **desktop layout** (1520 × 860) — sidebar + table + persistent detail column

The visual language follows the user's own **"Modern Dark + Red" style guide** (bundled as
`uploads/STYLE_GUIDE.md`) for accent colour, dark surfaces and the display font, combined with
Apple HIG structure (grouped cards, hairline dividers, sheets, push navigation).

## About the Design Files

The files in this bundle are **design references written in HTML** — prototypes that show the
intended look and behaviour. They are **not production code to copy**. The task is to **recreate
these designs in the target codebase's environment** using its established patterns and libraries.
The user's other apps are **Angular standalone components + plain CSS custom properties**
(see `uploads/STYLE_GUIDE.md` §10), which is the recommended target here; if the project is
started fresh, Angular with the token block from the style guide is the intended stack.

The prototypes render through a small runtime (`support.js`) that is part of the design tool, not
part of the product. Ignore it — read the markup and the token values, not the runtime.

## Fidelity

**High fidelity.** Colours, type, spacing, radii, motion and copy are final. Recreate pixel-exact
using the codebase's own component library. Every number in this document is authoritative.

## Data source

All ten torrents, categories, trackers and paths come from the user's live installation. Categories
in use: `radarr` (6), `tv-sonarr` (3), `prowlarr` (0). Save paths: `/downloads/movies`,
`/downloads/tv`. All copy is **English** (the original handoff specified German; the
implementation was switched to English, see the label tables below).

---

## Design Tokens

Declared as CSS custom properties on the app root; light is the default, dark overrides.

### Light

| Token | Value | Use |
|---|---|---|
| `--bg` | `#F2F2F7` | page background |
| `--c1` | `#FFFFFF` | cards, list groups, sheets |
| `--sep` | `rgba(60,60,67,0.16)` | row dividers (1px) |
| `--t1` | `#000000` | primary text |
| `--t2` | `rgba(60,60,67,0.60)` | secondary text |
| `--t3` | `rgba(60,60,67,0.32)` | tertiary / placeholder |
| `--fill` | `rgba(118,118,128,0.12)` | filled fields, inactive pills, tracks |
| `--nav` | `rgba(249,249,249,0.80)` | nav bar (with 20px backdrop blur) |
| `--ac` | `#C80815` | accent — actions, links, destructive |
| `--dl` | `#007AFF` | download / in-progress state |
| `--ok` | `#34C759` | seeding, complete |
| `--warn` | `#FF9F0A` | stalled, pause action |
| `--bad` | `#C80815` | errors, delete |

### Dark (from the style guide's "Soft Slate" scale)

| Token | Value |
|---|---|
| `--bg` | `#1C1D22` |
| `--c1` | `#25272D` |
| `--sep` | `rgba(255,255,255,0.06)` |
| `--t1` | `#F5F5F7` |
| `--t2` | `rgba(245,245,247,0.72)` |
| `--t3` | `rgba(245,245,247,0.48)` |
| `--fill` | `#2D3038` (elevated) |
| `--nav` | `rgba(37,39,45,0.88)` |
| `--ac` | `#E0202C` |
| `--dl` | `#0A84FF` |
| `--ok` | `#3DC960` |
| `--warn` | `#E8A033` |
| `--bad` | `#E0202C` |

Pure black `#000` is only the device bezel, never a surface.

### Radii

`10px` search field · `14px` buttons, menus, sheet fields · `16px` pills, speed card ·
`18px` list groups & cards · `22px` sheet top corners · `16px` switch (pill).

### Spacing

4 / 8 / 12 / 16 / 20 / 26 px. Screen side padding **20px**; list groups inset **16px** from the edge.

### Typography

| Role | Family | Size / weight | Notes |
|---|---|---|---|
| Screen title (h1) | **WildBreath** → fallback Outfit, system-ui | 46 / 400, `letter-spacing:0.015em`, `line-height:1.0` | one per screen ("Torrents", "Settings") |
| Detail title | -apple-system / Outfit | 19 / 640, `-0.3px` | |
| Body, list rows | -apple-system / Outfit | 16 / 400 · row title 15 / 590 | |
| Meta line | | 12–12.5 / 500, `--t2` / `--t3` | |
| Section caption | | 11 / 590–640, `0.4–0.5px`, UPPERCASE, `--t2` | |
| Numbers | | 17–30 / 640, `font-variant-numeric: tabular-nums` | en-US decimal point throughout |

`WildBreath.ttf` is bundled in `uploads/`. Load via `@font-face`, `font-display: swap`.

### Motion

| Purpose | Value |
|---|---|
| Push screen (detail, settings) | `translateX(100% → 0)`, 300ms `cubic-bezier(0.32,0.72,0,1)` |
| Sheet up | `translateY(100% → 0)`, 340ms same curve |
| Backdrop / menu fade | 140–250ms ease-out |
| Swipe snap-back | `transform` 280ms `cubic-bezier(0.32,0.72,0,1)` (no transition while dragging) |
| Sort-direction arrow flip | `rotate(180deg)`, 220ms same curve |
| Toast | 1.8s total: fade+8px rise in, hold, fade out |
| Progress bar width | `width` 900ms linear (matches the 1.1s poll) |

---

## Screens

### 1 — Torrent list (`list`, default)

Vertical scroll, no tab bar.

**Header** (padding `64px 20px 0`)
* Eyebrow: server address, 13/590, `--t2`.
* Title "Torrents" in the display font (see type table).
* Right: two 36px circles, 8px apart — **gear** (`--fill` bg, accent glyph) opens Settings;
  **plus** (accent bg, white glyph, shadow `0 2px 8px rgba(200,8,21,0.32)`) opens the add sheet.
* Search field: 36px tall, `--fill`, radius 10, magnifier at `--t3`, placeholder
  "Search torrents". Filters live on title + category.

**Speed card** (12px below search): white card, radius 16, three columns divided by 1px `--sep` —
`DOWNLOAD` (arrow + total, `--dl`), `UPLOAD` (`--ok`), `FREE` (`1.24 TB`, `--t1`). Labels 11/590
uppercase; values 18/640 tabular.

**Control row** (padding `14px 20px 8px`), left to right:
* **Filter dropdown** pill — funnel icon, current label, count, chevron.
  Options: Active (default) · All · Downloading · Complete · Queued, each with a live count and a check mark.
* **Sort dropdown** pill — sort icon, current label, chevron. Options: Status (default) · Name ·
  Size · Progress.
* **Direction button** — 32px circle, down-arrow, rotates 180° for ascending.
* Right-aligned result count ("3 torrents").

Pills: radius 16, 7×11px padding, 13.5/590.
*Light* — `--fill` background, accent text; open pill turns white with a soft shadow.
*Dark* — **accent background, white text**; open pill adds `0 4px 14px rgba(224,32,44,0.35)`.

Menus: anchored 54px below the row at the left edge, min-width 214/198px, `--c1`, radius 14, 5px
padding, shadow `0 12px 32px rgba(0,0,0,0.18)` + `0 0 0 0.5px --sep`, items 15px with a leading
14px check (accent, `opacity:0` when unselected) and trailing count. A transparent full-screen
layer behind the menu closes it.

**List group**: 16px inset, `--c1`, radius 18, rows divided by 1px `--sep`.

**Row** (12px 14px 12px 16px, ~76px tall):
1. **Progress ring** 34px — track `--fill` 3px, arc 3px round cap, `dasharray = 87.96·p / 87.96`,
   rotated −90°. Colour = state colour.
2. Text stack: title 15/590 single-line ellipsis · tech line 12/500 `--t3`
   (`1080p · BluRay · x265 · 35.6 GB · tv-sonarr`) · status line 12.5px = coloured state label +
   `--t2` detail.
3. Chevron 8×13, `--t3`.

Status line by state (`metadata` was added after the original handoff — folding
qBittorrent's `metaDL` into `downloading` made a torrent with no size, no peers and no
progress look like a healthy download):
* `downloading` → `Downloading` (blue) + `↓ 84.6 KB/s · ETA 4d 8h`
* `metadata` → `Fetching metadata` (blue) + `for 3d 1h` — no size is known yet, so the
  tech line omits it and the desktop table shows `–`. It counts as *Active* but not as
  *Downloading*: nothing is being downloaded yet.
* any downloading torrent at 0 B/s for over 30 min → detail becomes `stuck for 3d 1h`
  (no percentage — the progress ring already carries it, and the English labels would truncate)
* `seeding` → `Seeding` (green) + `↑ 473.2 KB/s · 263 peers`
* `completed` → `Complete` (green) + `Ratio 0.55`
* `queued` → `Queued` (grey) + `In queue`
* `stalled` → `Stalled` (amber) + `No connection to peers`
* `paused` → `Paused` (amber) + `5.3 GB downloaded`

**Swipe actions**: dragging a row left reveals two 76px buttons — **Pause/Start** (`--warn`) and
**Delete** (`--bad`), white 12/590 label under a 17px icon. Open offset −152px, threshold −70px,
max −176px. `touch-action: pan-y`. A drag under 5px counts as a tap and opens the detail screen;
tapping an open row closes it.

**Attention line** (between speed card and control row, added after the original handoff):
a single row, radius 12, 44px min height, present *only* when something needs the user —
errored, stalled or stuck torrents, low free space, or an optional Cleanuparr that is
unreachable, rejecting the key, or has failing jobs. Warning variant: `--warn` text on a 14% `--warn` tint. Quiet variant: `--t2` on `--fill`,
used to report what Cleanuparr cleaned up. Tapping switches to the **Attention** filter, which contains exactly what the line counts —
errored, stalled and stuck torrents — or opens settings when the problem is Cleanuparr itself.
That filter is listed in the phone dropdown and at the top of the desktop sidebar only while it
holds something (or is currently selected); an entry permanently reading 0 is noise. Its empty
state reads "Nothing needs attention" rather than "No matches", because here that is the good
outcome.
Stalled and stuck torrents are reported regardless of Cleanuparr: suppressing them left the list
looking healthy while nothing moved. Whether Cleanuparr is already on it belongs on the detail
screen, not in this line.

**Empty state** (search/filter with no hits): centred "No matches" 15/590 +
"Adjust your search or filter." 13px `--t2`, 44px vertical padding.

### 2 — Torrent detail (`detail`)

Full-screen push over the list.

* **Nav bar**: 56px top padding, `--nav` + 20px blur, 0.5px bottom hairline. Left "‹ Torrents"
  (accent, 17px) pops back; centre truncated short title 16/600; right a vertical "⋯" (accent) that
  opens the delete dialog.
* **Header**: full title 19/640 (`text-wrap: pretty`) + tech line 13px `--t2`.
* **Progress card** (`--c1`, radius 18, 16px): percentage 30/700 in the state colour +
  "5.33 GB of 35.6 GB" 13px `--t2` right-aligned; 8px track radius 4 with the state-coloured fill;
  below, three columns split by hairlines — DOWNLOAD (`--dl`), UPLOAD (`--ok`), REMAINING (`--t1`),
  labels 11/590 uppercase, values 19/640 tabular.
* **Action row**: four equal cards, radius 14, `--c1`, 20px icon over a 12/590 label —
  Pause / Reannounce / Share in `--t2`, **Delete in `--bad`**.
* **Segmented control** (`--fill`, radius 9, 2px padding; active segment `--c1` + `0 1px 3px
  rgba(0,0,0,0.12)`): Info · Files · Trackers.
  * **Info** — when Cleanuparr knows this torrent (matched on hash via its events API), a
    **CLEANUPARR** card comes first: strikes (amber above zero), last action, reason, timestamp.
    Then a **DETAILS** card: Status, Category, Ratio, Seeds, Peers, Added, Save path, Hash.
    Without Cleanuparr, or for a torrent it has never touched, only the details card is shown.
  * **Files** — file name + size, with a 3px progress line (blue while incomplete, green at 100%).
  * **Trackers** — 8px status dot (green working / red unreachable), URL + status, peer count.
    Includes `** [DHT] **`, `** [PeX] **`.

### 3 — Settings (`settings`)

Below the qBittorrent connection card sits a second, tappable card for the optional Cleanuparr
integration, showing at a glance whether it is set up: green *Connected*, red *Key rejected*
(Cleanuparr answered but refused the key), amber *Not reachable* (it worked before and is gone
now) or a neutral grey *Not connected* when it was never configured — the integration is
optional, so never having it is not a fault. Tapping pushes the Cleanuparr screen.

### 3b — Cleanuparr (`cleanuparr`)

Pushed from settings, pops back to it. Display-font title, the same connection card, a
three-column card with REMOVED / STRIKES / EVENTS for the last 24 hours, and a JOBS list with
runs per job type (failures in `--warn`). When it is not connected, an empty state names the
environment variable to fix instead of showing zeros.

Push screen: "‹ Torrents" back button, then the display-font title "Settings".

* **Connection card**: 44px green rounded-square with a check, "Connected",
  "192.168.178.165:8090 · qBittorrent 5.0.4".
* **SPEED**: switch "Alternative limits" (turning it on changes the upload limit value to
  `2.5 MB/s`), rows "Download limit ∞", "Upload limit".
* **APPEARANCE**: segmented Light / Dark / Automatic.
* **BEHAVIOUR**: three switch rows with sub-labels — "Resume on start", "Notifications",
  "Wi-Fi only".

Switch: 51 × 31, radius 16, 2px padding, 27px white knob with `0 2px 5px rgba(0,0,0,0.18)`,
`--ok` when on, `--fill` when off, justify-content flips.

### 4 — Add sheet (`add`)

Bottom sheet over a `rgba(0,0,0,0.32)` scrim; `--bg` panel, top radius 22, max height 82%,
36 × 5 grab handle.
Header row: "Cancel" · "Add torrent" 16/600 · "Done" (600).
Fields: magnet input in a card (11px uppercase label + monospace 13px input,
placeholder `magnet:?xt=urn:btih:…`); **CATEGORY** list (radarr / tv-sonarr / prowlarr / None)
with a trailing accent check; **DESTINATION** card with the derived save path (monospace, RTL-truncated)
and a "Start immediately" switch. Full-width accent button "Add" (radius 14, 15px padding,
17/600). Confirming closes the sheet and shows the toast "Torrent added".

### 5 — Delete dialog

iOS-style centred alert stack pinned to the bottom (10px inset): card with
"Remove torrent?" 15/640 + the torrent name 13px `--t2`, an "Also delete files" switch row,
and a destructive "Remove" button; a separate "Cancel" card 8px below.
Result toast: "Torrent removed" or "Torrent and files deleted".

### 6 — Toast

Centred, 56px above the bottom edge, `rgba(30,30,32,0.92)` + blur, white 14/510, radius 22,
`0 8px 24px rgba(0,0,0,0.22)`. Auto-dismisses after 1.8s.

### 7 — Desktop (1520 × 860)

Three columns:
* **Sidebar 236px** — `rgba(246,246,248,0.92)`, right hairline. Filter field, then groups
  **STATUS** (Active first and selected by default, then All 10, Downloading 1, Seeding 3,
  Complete 6, Queued 3, Stalled 1, Error 0),
  **CATEGORIES** (radarr 6, tv-sonarr 3, prowlarr 0, Uncategorized 1), **TAGS** (Untagged 10).
  Each item: 7px state dot, label, right-aligned count 12px `--t2`. Footer shows Down/Up totals.
* **Centre** — 52px toolbar ("Torrents" 17/640, "10 total · 1 active" 13px `--t2`, right
  "Sort" secondary + accent "Add"), then a grid table.
  Columns `minmax(240px,1fr) 84px 132px 100px 96px 96px 76px`, 12px gap, 9px 16px padding,
  hairline under each row: Name (state dot + title 13/560 + sub 11px), Size, Progress
  (5px bar + right-aligned % in a 42px nowrap column), Status (coloured 560), Down, Up, Ratio.
  The selected row is tinted `rgba(0,122,255,0.07)`.
* **Detail column 316px** — left hairline, `rgba(255,255,255,0.75)`: title, tech line, progress card
  (24/700 percentage, 6px bar, Down/Up/Remaining), three buttons (Pause, Reannounce, Delete in
  `--bad`), then a **TRANSFER** card (Ratio, Seeds, Peers, Connected for, Category,
  Save path, Added, Tracker). It is always visible — it replaces the original UI's
  collapsible bottom tab panel.

---

## Interactions & Behaviour

| Trigger | Result |
|---|---|
| Tap row | Push detail screen |
| Swipe row left | Reveal Pause + Delete; tap elsewhere or on the row closes it |
| Tap Pause | Toggles `paused` ⇄ previous state, zeroes speeds, toast "Paused" / "Resumed" |
| Tap gear | Push settings; "‹ Torrents" returns |
| Tap + | Add sheet |
| Filter / sort pill | Opens its menu; picking an option closes it and re-renders the list |
| Direction button | Reverses the current sort, arrow rotates |
| Search input | Live filter on title + category |
| Delete (row, detail "⋯", detail button) | Delete dialog → removes the torrent, returns to the list if the detail screen was open |

**Polling**: the prototype simulates the WebUI API on a **1.1s interval** — the downloading torrent
gains `dl · 1.1` bytes with the rate jittering 62–110 KB/s, seeding torrents jitter their upload
rate, totals are recomputed. In production, poll `/api/v2/sync/maindata?rid=<n>` at the same
cadence and apply the deltas.

**Responsive**: below ~900px use the phone layout; above, the three-column desktop. The detail
column collapses first, then the sidebar becomes a drawer.

---

## State

```
screen        'list' | 'detail' | 'settings'      // push navigation
sheet         null | 'add' | 'del'
sel           torrent id shown in detail
dtab          'info' | 'files' | 'trackers'
filter        'active' (default) | 'all' | 'down' | 'done' | 'paused'
sort          'status' (default) | 'name' | 'size' | 'progress'
dir           1 | -1
menu          null | 'filter' | 'sort'
q             search string
open, drag    swipe target id + current x offset
delFiles      'delete files too' switch
startNow, cat add-sheet fields
alt, behave[] settings switches
toastMsg      transient string
```

Per torrent: `id, title, short, tags, cat, size, done, prog, st, dl, up, seeds, peers, ratio,
added, tracker`.

Sorting: `status` keeps the server's curated order, `name` uses `localeCompare(…, 'en')`,
`size`/`progress` sort descending; `dir === -1` reverses the result.

---

## API (qBittorrent WebUI v2)

```
GET  /api/v2/torrents/info?filter=all
GET  /api/v2/sync/maindata?rid=<n>          // delta polling, 1.1s
GET  /api/v2/transfer/info                  // global speeds
POST /api/v2/torrents/pause    {hashes}
POST /api/v2/torrents/resume   {hashes}
POST /api/v2/torrents/delete   {hashes, deleteFiles}
POST /api/v2/torrents/add      {urls, category, savepath, paused}
POST /api/v2/torrents/reannounce {hashes}
GET  /api/v2/torrents/files?hash=…
GET  /api/v2/torrents/trackers?hash=…
```

Auth: `POST /api/v2/auth/login {username, password}` → session cookie.

---

## Assets

* `uploads/WildBreath.ttf` — display font for screen titles, supplied by the user.
* `uploads/STYLE_GUIDE.md` — the user's "Modern Dark + Red" pattern; the source of the accent and
  dark surface scale. Follow it for anything this document does not cover.
* Icons are inline SVG strokes (1.8–2.2px, round caps) drawn to match SF Symbols. The style guide
  specifies **Font Awesome 6 Free (solid)** — use that in the real app, single-colour via
  `currentColor`, `--t2` by default and `--ac` only for active/destructive.
* No bitmap imagery is used anywhere in the design.

## Files

| File | What it is |
|---|---|
| `qbit WebUI.dc.html` | The design document: option 1a phone (light), 1b phone (dark, detail), 1c desktop, 1d design-system sheet. Open this one. |
| `qbitPhone.dc.html` | The phone app itself — all mobile screens, state and interactions. Mounted twice by the document above. |
| `ios-frame.jsx` | Device bezel used for presentation only. Not part of the product. |
| `browser-window.jsx` | Browser chrome around the desktop layout. Presentation only. |
| `support.js` | Design-tool runtime. Presentation only — do not port. |

Open `qbit WebUI.dc.html` in a browser to see everything; the phone is fully interactive.
