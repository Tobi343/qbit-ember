# Implementation brief: qbit-ember

You are building **qbit-ember**, a standalone, mobile-first web UI for qBittorrent (replacing the
ugly stock WebUI). The complete high-fidelity design already exists and lives in this repo under
`design/` — read **`design/README.md`** and **`design/uploads/STYLE_GUIDE.md`** in full before
implementing anything. Every number in there (colours, radii, spacing, timing, copy) is binding,
not just a hint.

The files `design/qbit WebUI.dc.html` and `design/qbitPhone.dc.html` are interactive prototypes
from a design tool and run on a proprietary runtime (`design/support.js`).
**That is not code to adopt.** Use them only to understand the behaviour/layout visually — do not
port the markup, rebuild the screens cleanly in the target stack.

## Product

Pure frontend, no backend of its own, no database, no user auth system (login goes 1:1 through the
qBittorrent credentials). The app talks exclusively to the official qBittorrent WebUI API v2
(`/api/v2/...`), primarily via `sync/maindata` for efficient delta polling. The full feature set,
all screens, the API mapping and the state are already specified exactly in `design/README.md`
(sections "Screens", "API", "State") — implement that 1:1.

I am the only user, no multi-tenancy, no roles/permissions.

## Stack (binding)

- **Angular, standalone components**, TypeScript strict. That is the stack `STYLE_GUIDE.md` was
  written for (§10) and the one that matches my other apps — no React/Vue.
- Take the design tokens as CSS custom properties exactly from `STYLE_GUIDE.md` §3, do not invent
  your own colours/radii/fonts.
- Font Awesome 6 Free (solid) via CDN, single-colour via `currentColor`, as described in §6.
- No state-management framework needed — a lean `QbitApiService` (RxJS or signals) for
  login/session cookie and the `sync/maindata` polling is enough.
- PWA via `@angular/pwa`: `manifest.json` (name, icons, `display: standalone`, `theme-color` from
  the design tokens), respect safe-area insets for iPhone (notch/home indicator). The service
  worker caches static assets only, **never** API responses.
- For local development: point the Angular dev proxy (`proxy.conf.json`) at a real qBittorrent
  instance so `ng serve` runs without CORS problems (same-origin trick as in the prod setup).

## Deployment / Docker (important for the Komodo integration)

Goal: **a single, self-contained container** that works just like the `iQbit` already running in
my homelab — static build plus a built-in reverse proxy to the qBittorrent API, so no CORS setup
and no manual split configuration in the upstream reverse proxy is needed.

- **Multi-stage Dockerfile**: a Node stage builds `ng build --configuration production`, the
  runtime stage is `nginx:alpine` and serves `dist/`.
- **nginx.conf inside the image** does two jobs:
  1. Serve the Angular app with a fallback to `index.html` (client-side routing).
  2. Reverse-proxy `/api/v2/` (including cookies) to a backend configurable via an environment
     variable, e.g. `QBIT_API_URL` (default `http://gluetun:8090`, since my qBittorrent runs behind
     Gluetun/VPN in the same Docker network and shares its network namespace).
     Implement it via `envsubst` on an `nginx.conf.template` at container start (the standard
     pattern of the official nginx image).
- **The target platform is a Raspberry Pi (arm64).** So do **not** build the image on the Pi itself
  (that has stalled on DNS/buildx problems in the past), but via a **GitHub Actions workflow** that
  builds a multi-arch image (at least `linux/arm64`, ideally `linux/amd64` too) on push to `main`
  or on tags and pushes it to **GHCR** (`ghcr.io/<github-user>/qbit-ember`). Komodo then only pulls
  a finished image instead of building it on site.
- Provide an example `docker-compose.yml` (or snippet) in the README that fits my existing stack:
  its own service, `QBIT_API_URL=http://gluetun:8090`, in the same Docker network as `gluetun`, no
  port publishing needed if it is exposed on its own subdomain through an upstream reverse proxy
  (nginx).

## Repo

- Public GitHub repo, named `qbit-ember` (feel free to adjust if taken).
- Licence: MIT.
- Sensible `.gitignore` (Angular/Node standard, `dist/`, `node_modules/`).
- README with: short description, screenshot(s)/GIF once available, local dev setup
  (`proxy.conf.json`), build instructions, docker-compose example, a pointer to `design/` as the
  reference for the design system.
- Take the `design/` folder from this handoff into the repo unchanged (it serves as living
  reference documentation for colours/components/screens, including for later changes).

## Approach

As described in `STYLE_GUIDE.md` §13: first list all screens with their three zones (header /
content / FAB) and their respective primary action, then build **screen by screen**, checking back
briefly before moving on to the next one. Before every "done", walk through the checklist in §11
(tokens instead of hex values, 44px tap targets, motion only from the 3-value scale, etc.).
