# Modern Dark + Red — App Design Pattern

A reusable design system for building modern, mobile-first apps. Phone-first, but scales to tablet and desktop. Designed for **Angular**, but every token is plain CSS custom properties — works anywhere.

This guide is **app-agnostic.** It defines the visual language, components, and motion. Each new app supplies its own content, screens, and domain concepts on top of this foundation.

---

## 1 — How to use this guide with an AI

When starting a new app, give the AI **three things**:

1. **This document** (paste the whole thing, or attach the file).
2. **A one-paragraph product brief**: what the app does, who it's for, the key user actions.
3. **The list of screens you want.**

Then prompt:

> Build [APP NAME], a [DESCRIPTION], following the attached design pattern exactly. Use the CSS custom properties verbatim — do not invent new colors, radii, or fonts. Use Font Awesome 6 Free (solid) for all icons. Build the screens as if for an iPhone (390 × 844). Match the component patterns (list rows, sheets, FAB, switches) from the guide. Use Angular standalone components.

The pattern below is intentionally tight: one accent, one font family, one easing curve, one shadow language. That tightness is what makes every app feel like part of the same family.

---

## 2 — Core principles

1. **One accent, used sparingly.** The red is for state (selected, active, important). Everything else is grayscale on the dark base. If two things on screen are red, one of them is probably wrong.
2. **Dark, but not black.** Surfaces are layered greys with a hint of warmth or coolness. True black is reserved for the device frame.
3. **Hairlines, not borders.** Borders are 1px at 6% white. Heavy borders only on inputs and buttons.
4. **Soft motion, fast feedback.** 140ms for taps, 240ms for state changes, 420ms for sheets and pages. One easing curve handles 95% of cases.
5. **Type does the work.** Weight and size, not color, create hierarchy. Body text is 500 weight (not 400 — looks anemic on dark).
6. **Generous tap targets.** 44px minimum, always. Density "compact" still respects this.
7. **No filler.** Empty space is fine. Don't add icons, stats, or copy to fill a card.

---

## 3 — Design tokens

Drop this `:root` block into `styles.scss` (or `app.component.scss` with `:host`). Every component reads from these — never hard-code a hex value.

```css
:root {
  /* ── Surface scale (dark base — "Soft Slate") ──────────── */
  --bg:        #1c1d22;   /* page background */
  --surface:   #25272d;   /* cards, list groups, sheets */
  --elevated:  #2d3038;   /* inputs, chips, hover states */
  --border:    #353841;   /* visible borders on inputs/buttons */
  --hairline:  rgba(255,255,255,0.06); /* row dividers */

  /* ── Text scale ────────────────────────────────────────── */
  --text:    #f5f5f7;                    /* primary — headlines, body */
  --text-2:  rgba(245,245,247,0.72);     /* secondary — supporting */
  --text-3:  rgba(245,245,247,0.48);     /* tertiary — metadata, labels */
  --text-4:  rgba(245,245,247,0.30);     /* disabled, placeholders */

  /* ── Accent (Venetian red) ─────────────────────────────── */
  --accent:      #C80815;
  --accent-h:    color-mix(in oklab, var(--accent) 82%, white);   /* hover */
  --accent-soft: color-mix(in srgb,  var(--accent) 22%, transparent); /* tint fill */
  --accent-line: color-mix(in srgb,  var(--accent) 38%, transparent); /* tint border */
  --on-accent:   #ffffff;

  /* ── Radius ────────────────────────────────────────────── */
  --r-sm:    7px;     /* small chips, tags */
  --r-md:    12px;    /* buttons, inputs, default */
  --r-lg:    18px;    /* cards, list groups */
  --r-xl:    26px;    /* sheets, hero cards */
  --r-pill:  9999px;  /* pills, switches, FAB */

  /* ── Spacing scale (4px base) ──────────────────────────── */
  --s-1: 4px;  --s-2: 8px;  --s-3: 12px; --s-4: 16px;
  --s-5: 20px; --s-6: 24px; --s-7: 32px; --s-8: 40px;

  /* ── Type ──────────────────────────────────────────────── */
  --font:         "Outfit", system-ui, -apple-system, sans-serif;
  --font-display: "WildBreath", "Outfit", system-ui, sans-serif;

  /* ── Motion ────────────────────────────────────────────── */
  --dur-fast: 140ms;
  --dur-base: 240ms;
  --dur-slow: 420ms;
  --ease:        cubic-bezier(0.2, 0.8, 0.2, 1);    /* default — soft ease-out */
  --ease-in:     cubic-bezier(0.5, 0, 0.75, 0);     /* exits / dismiss */
  --ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1); /* checks, sheet open */

  /* ── Density (compact — default for information-dense screens) ── */
  --row-h:     50px;
  --row-pad-y: 10px;
  /* Comfy alternative — swap when a screen wants more breathing room
     --row-h: 60px; --row-pad-y: 14px;
   */

  /* ── Shadows ───────────────────────────────────────────── */
  --shadow-1: 0 1px 0 rgba(255,255,255,0.04) inset,
              0 1px 2px rgba(0,0,0,0.25);
  --shadow-2: 0 4px 12px rgba(0,0,0,0.30),
              0 1px 2px rgba(0,0,0,0.20);
  --shadow-fab: 0 12px 28px color-mix(in srgb, var(--accent) 40%, transparent),
                0 4px 10px rgba(0,0,0,0.4);
}

html, body {
  background: var(--bg);
  color: var(--text);
  font-family: var(--font);
  -webkit-font-smoothing: antialiased;
}
```

---

## 4 — Typography

**Two fonts.** Display for page-level titles only. Body Outfit for everything else.

| Role | Family | Size | Weight | Letter-spacing | Usage |
|---|---|---|---|---|---|
| Display | `var(--font-display)` | 30–42 | 400 | +0.01em | Top of a screen only (h1) |
| Title | Outfit | 24 | 700 | -0.02em | Section heads, modal titles |
| Heading | Outfit | 18 | 700 | -0.01em | Card titles, group labels |
| Body | Outfit | 16 | 500 | -0.005em | Default reading text |
| Small | Outfit | 13 | 500 | 0 | Supporting copy, metadata |
| Caption | Outfit | 11 | 600 | +0.08em, UPPERCASE | Section labels, eyebrows |

**Rules**
- Body weight is **500**, not 400. 400 looks washed-out on dark.
- Use letter-spacing tightening on large sizes (anything 18px+).
- Never use accent color for text except on chips, links, and the rare emphasis.
- Numbers in stats/qty should be `font-variant-numeric: tabular-nums`.

---

## 5 — Spacing & radius

- **Spacing scale** is the 4px base: 4, 8, 12, 16, 20, 24, 32, 40. Don't invent values between.
- **Default radius is 12px** (`--r-md`). Use `--r-lg` (18) for cards, `--r-xl` (26) for sheets and hero, `--r-pill` for switches and FABs.
- **Page padding**: 16px horizontal on phone, 32px on tablet/desktop.
- **List group margin**: 16px from screen edges.
- **Vertical rhythm between sections**: 22–32px.

---

## 6 — Iconography

- **Font Awesome 6 Free**, solid style only. Load via CDN:
  ```html
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
  ```
- **Single color.** Inherit `currentColor` — never multi-color icons.
- **Default color**: `var(--text-2)` (secondary). `var(--accent)` only for selected/active state or brand moments.
- **Common sizes**: 11px (caption-ish, in pills), 13–14px (in list rows), 16–18px (toolbar / FAB), 20px (FAB).
- **Inside circular tinted backgrounds**: 30 × 30 box with 10px radius, icon at 13px.

---

## 7 — Component patterns

### 7.1 Buttons

```html
<!-- Primary -->
<button class="btn btn--primary">
  <i class="fa-solid fa-plus"></i> Add to list
</button>

<!-- Secondary -->
<button class="btn btn--secondary">Cancel</button>

<!-- Ghost -->
<button class="btn btn--ghost">Learn more →</button>
```

```css
.btn {
  font: 600 14px/1 var(--font);
  padding: 11px 18px;
  border-radius: var(--r-md);
  border: 0;
  cursor: pointer;
  display: inline-flex; align-items: center; gap: 8px;
  transition: background var(--dur-fast) var(--ease);
}
.btn--primary  { background: var(--accent);   color: var(--on-accent); box-shadow: var(--shadow-fab); }
.btn--primary:hover { background: var(--accent-h); }
.btn--secondary{ background: var(--elevated); color: var(--text); border: 1px solid var(--border); }
.btn--ghost    { background: transparent;    color: var(--accent); padding: 11px 4px; }
```

### 7.2 Text input

```css
.field {
  display: flex; align-items: center; gap: 10px;
  background: var(--elevated);
  border: 1px solid var(--border);
  border-radius: var(--r-md);
  padding: 10px 12px;
  transition: border-color var(--dur-fast) var(--ease),
              box-shadow var(--dur-fast) var(--ease);
}
.field:focus-within {
  border-color: var(--accent);
  box-shadow: 0 0 0 3px var(--accent-soft);
}
.field.is-error {
  border-color: var(--accent);
}
.field input {
  flex: 1; border: 0; background: transparent;
  color: var(--text); font: 500 14px var(--font);
  outline: none;
}
.field i { color: var(--text-3); font-size: 12px; }
```

### 7.3 List row + list group

A "list group" is a rounded card that contains rows separated by hairlines.

```css
.list-group {
  margin: 0 16px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--r-lg);
  overflow: hidden;
  box-shadow: var(--shadow-1);
}
.row {
  display: flex; align-items: center; gap: 14px;
  min-height: var(--row-h);
  padding: var(--row-pad-y) 18px;
  background: var(--surface);
  border-bottom: 1px solid var(--hairline);
  transition: background var(--dur-fast) var(--ease);
}
.row:last-child { border-bottom: 0; }
.row:hover { background: var(--elevated); }
```

Row anatomy: `[icon-tile] [title + subtitle stack] [trailing: chip / switch / chevron]`.

### 7.4 Switch (toggle)

```css
.switch {
  width: 40px; height: 24px;
  padding: 2px;
  border-radius: 9999px;
  background: var(--border);
  transition: background var(--dur-base) var(--ease);
  display: flex; align-items: center;
}
.switch[aria-checked="true"] { background: var(--accent); }
.switch .thumb {
  width: 20px; height: 20px; border-radius: 50%;
  background: #fff;
  transform: translateX(0);
  transition: transform var(--dur-base) var(--ease-spring);
  box-shadow: 0 1px 3px rgba(0,0,0,0.4);
}
.switch[aria-checked="true"] .thumb { transform: translateX(16px); }
```

### 7.5 Custom checkbox (circular)

```css
.check {
  width: 22px; height: 22px;
  border-radius: 50%;
  border: 2px solid var(--text-4);
  background: transparent;
  display: grid; place-items: center;
  transition: background var(--dur-base) var(--ease),
              border-color var(--dur-base) var(--ease);
}
.check[aria-checked="true"] {
  background: var(--accent);
  border-color: var(--accent);
}
.check i {
  color: var(--on-accent); font-size: 11px;
  opacity: 0; transform: scale(0.4);
  transition: opacity var(--dur-base) var(--ease),
              transform var(--dur-base) var(--ease-spring);
}
.check[aria-checked="true"] i { opacity: 1; transform: scale(1); }
```

### 7.6 Chips

```css
.chip {
  font: 600 12px var(--font);
  padding: 6px 12px;
  border-radius: 9999px;
  background: var(--elevated);
  border: 1px solid var(--border);
  color: var(--text-2);
  display: inline-flex; align-items: center; gap: 6px;
}
.chip.is-selected {
  background: var(--accent-soft);
  border-color: var(--accent);
  color: var(--accent);
}
```

### 7.7 Floating Action Button (FAB)

- Bottom right of the screen, 22px from edges
- 56–60px circle, accent fill, white icon at 20px
- Always uses `--shadow-fab` (red-tinted glow)
- Scales to 0.94 on press

### 7.8 Bottom sheet

- Full-width sticky to bottom
- Radius `var(--r-xl)` top corners only (26px)
- Drag handle: 40 × 4px pill, `var(--border)`, 6/14 padding above/below
- Background: `var(--surface)`, top border `var(--border)`
- Backdrop scrim: `rgba(0,0,0,0.55)` with 2px blur
- Enters with `transform: translateY(110%) → 0`, exits reverse
- Easing: `var(--ease-spring)` for entry, `var(--ease-in)` for dismiss

### 7.9 Segmented control

Small pill container with internal pill buttons. Selected segment becomes solid accent.

```css
.segmented {
  display: inline-flex; padding: 3px;
  background: var(--elevated);
  border: 1px solid var(--border);
  border-radius: 9999px;
}
.segmented button {
  font: 600 12px var(--font);
  padding: 6px 14px;
  border: 0; background: transparent;
  border-radius: 9999px;
  color: var(--text-2);
  transition: all var(--dur-fast) var(--ease);
}
.segmented button.is-active {
  background: var(--accent);
  color: var(--on-accent);
}
```

### 7.10 Side sheet (slide-in drawer)

Companion to the bottom sheet — for **list options**, **filters**, **quick settings** anything you'd reach for a "⋯" or sliders icon. Slides in from the right, takes 80–90% of the phone width, full height. Use it instead of a navigation push when the user should be able to dismiss quickly and return to where they were.

- Width: `min(84%, 340px)` on phone
- Background: `var(--surface)`, left border `var(--border)`
- Top-left + bottom-left corners: `var(--r-xl)` (26px). Right corners are square (sheet is anchored to that edge).
- Header padding: 60px top (clears notch), 20px sides, 16px bottom. Hairline divider at bottom of header.
- Title in display font, scaled down (h2 size, 26px).
- Close button top-right: 32 × 32 circle, `var(--elevated)` bg, X icon at 13px.
- Backdrop scrim: `rgba(0,0,0,0.55)` with 2px blur.
- Entry: `transform: translateX(110%) → 0`, easing `var(--ease-spring)`, duration `var(--dur-slow)`.
- Body is its own scroll container — section labels in caption style (UPPERCASE 11px 700 with 0.08em tracking) separated by 22px.
- Drop shadow: `-20px 0 60px rgba(0,0,0,0.5)` on the leading edge.

When to choose which sheet:
- **Bottom sheet** — *creating* something or capturing input. Up to ~60% of screen height.
- **Side sheet** — *adjusting* something about the current view (filters, sort, options). Full height.

### 7.11 Settings group (iOS-style)

The repeating "label + rounded card of rows" pattern used on settings, profile, and detail screens. **This is your default container for related rows on a phone.**

```html
<section class="settings-group">
  <header>Preferences</header>     <!-- caption-style label -->
  <div class="card">                <!-- rounded card -->
    <button class="row">…</button>
    <button class="row">…</button>
    <button class="row">…</button>  <!-- last child has no divider -->
  </div>
</section>
```

```css
.settings-group { margin-bottom: 22px; }
.settings-group > header {
  padding: 0 20px 8px;
  font: 700 11px/1 var(--font);
  letter-spacing: 0.08em; text-transform: uppercase;
  color: var(--text-3);
}
.settings-group .card {
  margin: 0 16px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--r-lg);
  overflow: hidden;
  box-shadow: var(--shadow-1);
}
.settings-group .row {
  display: flex; align-items: center; gap: 14px;
  width: 100%; padding: 12px 16px;
  background: transparent; border: 0; border-bottom: 1px solid var(--hairline);
  color: var(--text); font: 500 15px var(--font); text-align: left;
  cursor: pointer;
  transition: background var(--dur-fast) var(--ease);
}
.settings-group .row:last-child { border-bottom: 0; }
.settings-group .row:hover { background: var(--elevated); }
.settings-group .row .icon-tile {
  width: 30px; height: 30px; border-radius: 8px;
  background: var(--accent); color: var(--on-accent);
  display: grid; place-items: center; flex-shrink: 0;
}
.settings-group .row.is-destructive { color: var(--accent); }
```

Row anatomy: `[accent icon tile] [title + subtitle stack] [trailing: value text · switch · chevron]`. Use **chevron** for "tap goes somewhere", **switch** for boolean state, **value text + chevron** to show the current value of a setting.

### 7.12 Profile / hero card

A single rounded card pinned above settings groups. Avatar + name/meta + secondary action button.

- Padding: 16px
- Avatar: 52px circle, accent-to-darker-accent gradient, white initials at 18px 700 weight, soft accent-tinted shadow
- Right action: small ghost button (`var(--elevated)` bg, 1px `var(--border)`), 12px text, pill radius

### 7.13 Radio card (large tappable option)

Used inside sheets and forms when there are 3–5 mutually-exclusive choices and you want full labels visible. Each option is its own card; selected card switches to accent border + `--accent-soft` fill + accent text.

```css
.radio-card {
  display: flex; align-items: center; gap: 10px;
  padding: 10px 12px;
  background: var(--elevated);
  border: 1px solid var(--border);
  border-radius: var(--r-md);
  color: var(--text); font: 500 14px var(--font);
  cursor: pointer;
  transition: all var(--dur-fast) var(--ease);
}
.radio-card.is-selected {
  background: var(--accent-soft);
  border-color: var(--accent);
  color: var(--accent);
}
```

Pair with a small leading FA icon at 13px (column-aligned: `width: 16px; text-align: center`) and a trailing check icon that appears only when selected.

### 7.14 Stepper (numeric)

For quantities, counts. Always pill-grouped, single-row.

```css
.stepper {
  display: inline-flex; align-items: center;
  background: var(--elevated);
  border: 1px solid var(--border);
  border-radius: var(--r-md);
  padding: 4px;
}
.stepper button {
  width: 30px; height: 30px; border-radius: 9999px;
  background: transparent; border: 0;
  color: var(--text-2); cursor: pointer;
}
.stepper .value {
  min-width: 36px; text-align: center;
  font: 600 14px var(--font);
  font-variant-numeric: tabular-nums;
}
```

### 7.15 Slider (range)

- Track: 4px high, `var(--elevated)` background, `var(--r-pill)` radius
- Fill (left portion): `var(--accent)`, same radius
- Thumb: 20px circle, `var(--accent)`, with `--shadow-fab` glow and a 4px `var(--accent-soft)` halo

The native `<input type="range">` should be visually hidden (opacity:0) over a CSS-drawn track for full styling control.

---

## 8 — Motion

**Three durations, three eases. That's it.**

| Token | Value | When |
|---|---|---|
| `--dur-fast` | 140ms | Hover, tap, button press, focus ring |
| `--dur-base` | 240ms | State change (checked, toggled, color shift) |
| `--dur-slow` | 420ms | Sheet open/close, page transition, list reorder |
| `--ease` | `cubic-bezier(0.2, 0.8, 0.2, 1)` | Default — soft ease-out — use for 95% |
| `--ease-in` | `cubic-bezier(0.5, 0, 0.75, 0)` | Dismissals, things leaving |
| `--ease-spring` | `cubic-bezier(0.34, 1.56, 0.64, 1)` | Confirmations: switch thumb, check fill, sheet entry |

**Animation rules**

- **User caused → fast.** Hover, focus, press: 140ms.
- **System responding → base.** Switch toggling, row reordering, error showing: 240ms.
- **Page-level → slow.** Sheets opening, tabs changing, list items entering: 420ms.
- **Stagger lists by 30ms** on initial load (`animation-delay: ${idx * 30}ms`). Nothing past 8 items — keep total under 240ms.
- **Press feedback** on tappable elements: `transform: scale(0.94)` on `:active`, `var(--dur-fast)`.
- **Respect `prefers-reduced-motion`** — drop spring eases to linear, halve durations.

**Stock keyframes**

```css
@keyframes fadeUp {
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes scaleIn {
  from { opacity: 0; transform: scale(0.94); }
  to   { opacity: 1; transform: scale(1); }
}
```

---

## 9 — Screen layout (phone)

A typical screen has **three vertical zones**:

1. **Header (sticky)**
   - Top padding: 60px (clears notch / dynamic island)
   - Bottom padding: 14px
   - Horizontal padding: 20px
   - Layout: **three-slot row** — `[app icon · LEFT] [centered display-font h1] [action button · RIGHT]`
   - **Heading is always centered.** Both flanking slots are 38 × 38 — if one side has no action, use an invisible 38 × 38 spacer to keep the title visually centered.
   - **App icon (left):** 38 × 38 circle, `background: var(--accent)`, `border: 1px solid var(--accent-line)`, icon at 14px in `var(--on-accent)`. This is the only place a solid-accent bubble appears in the header — it carries the brand.
   - **Action button (right):** 38 × 38 circle, `background: var(--surface)`, `border: 1px solid var(--border)`, icon at 14px in `var(--text-2)`. Hover lifts to `var(--elevated)` / `var(--text)`. Use for screen-level actions: list options, filters, edit, etc.
   - **Same bubble geometry on both sides.** Only the fill differs — accent for the brand mark, surface for the interactive button. This pairing reads as "identity ↔ action".
   - **No dates, no eyebrows, no breadcrumbs in the header.** The title does the work. Date / metadata, if needed, belongs in the content scroll area below.
   - **Heading style:** display font, 36px, weight 400, `letter-spacing: 0.01em`, `line-height: 1.05`, `color: var(--text)`. One h1 per screen.
   - On scroll: bottom 1px hairline border fades in (border-color animates from transparent → `var(--hairline)`).

2. **Scrollable content**
   - Top padding: 6–14px below header
   - Bottom padding: ≥80px (keep clear of FAB)
   - Use list groups for grouped content, full-width sections for hero
   - Stagger animate items on first paint (30ms delay each)

3. **FAB (optional)**
   - Position: absolute, `bottom: 44px; right: 22px`
   - Sits above content; never blocks important info

**Status bar / device chrome** comes from your platform — don't paint over it.

**Screen header — code reference**

```html
<header class="screen-head">
  <div class="bubble bubble--brand" aria-hidden="true">
    <i class="fa-solid fa-utensils"></i>
  </div>
  <h1>Shopping list</h1>
  <button class="bubble bubble--action" aria-label="List options">
    <i class="fa-solid fa-gear"></i>
  </button>
</header>
```

```css
.screen-head {
  display: flex; align-items: center; justify-content: space-between;
  gap: 12px;
  padding: 60px 20px 14px;
  background: var(--bg);
  border-bottom: 1px solid transparent;
  transition: border-color var(--dur-base) var(--ease);
}
.screen-head.is-scrolled { border-bottom-color: var(--hairline); }
.screen-head h1 {
  margin: 0; flex: 1; text-align: center;
  font-family: var(--font-display);
  font-size: 36; font-weight: 400;
  letter-spacing: 0.01em; line-height: 1.05;
  color: var(--text);
}
.bubble {
  width: 38px; height: 38px; border-radius: 9999px;
  display: grid; place-items: center;
  flex-shrink: 0;
}
.bubble--brand {
  background: var(--accent);
  border: 1px solid var(--accent-line);
  color: var(--on-accent);
}
.bubble--action {
  appearance: none; cursor: pointer;
  background: var(--surface);
  border: 1px solid var(--border);
  color: var(--text-2);
  transition: background var(--dur-fast) var(--ease),
              color var(--dur-fast) var(--ease);
}
.bubble--action:hover { background: var(--elevated); color: var(--text); }
.bubble i { font-size: 14px; }
```

---

## 10 — Angular implementation

```ts
// app/styles.scss
// Paste the :root block from section 3 here.

// app/components/list-row/list-row.component.ts
@Component({
  standalone: true,
  selector: 'app-list-row',
  template: `
    <button class="row" (click)="rowClick.emit()">
      <span class="icon-tile" *ngIf="icon">
        <i class="fa-solid" [class]="icon"></i>
      </span>
      <div class="stack">
        <span class="title">{{ title }}</span>
        <span class="sub" *ngIf="sub">{{ sub }}</span>
      </div>
      <ng-content select="[trailing]"></ng-content>
    </button>
  `,
  styleUrls: ['./list-row.component.scss'],
})
export class ListRowComponent {
  @Input() icon?: string;
  @Input() title!: string;
  @Input() sub?: string;
  @Output() rowClick = new EventEmitter<void>();
}
```

- **One component per pattern** (Button, Field, Switch, ListRow, ListGroup, BottomSheet, FAB, Chip, Segmented).
- All standalone, all read from CSS custom properties.
- Use Angular Animations API for sheets and page transitions; keep CSS transitions for everything else.
- Wrap reusable patterns in a `@core/ui` library so every app imports the same components.

**Theme swap**: every token lives on `:root`. To make a tenant or sub-brand variation, swap a class on `<body>`:

```css
body.theme--firebrick { --accent: #B22222; --accent-soft: color-mix(in srgb, #B22222 22%, transparent); }
body.base--warm       { --bg: #1c1518; --surface: #241c1f; --elevated: #2c2327; --border: #352b30; }
```

---

## 11 — Quality checklist

Before shipping a screen, verify:

- [ ] No raw hex codes in component CSS — all tokens
- [ ] All tappable areas ≥ 44px
- [ ] One primary action per screen (FAB or primary button — not both)
- [ ] Accent color used 3 times or fewer per visible viewport
- [ ] Body text at 500 weight, not 400
- [ ] Lists use list-group containers with hairline dividers
- [ ] Focus state visible on every interactive element (`--accent-soft` ring)
- [ ] Motion durations from the 3-value scale, not arbitrary
- [ ] Icons are Font Awesome solid, single color, inheriting currentColor
- [ ] Reduced-motion respected
- [ ] Empty states feel intentional, not lazy (don't pad with icons or stats)

---

## 12 — Anti-patterns (don't do)

- ❌ Multi-color icons (defeats the single-accent system)
- ❌ Gradients except on the FAB shadow and large brand surfaces
- ❌ Two accent colors competing for attention
- ❌ Hard black (#000) as a fill — looks like a modal overlay
- ❌ Borders heavier than 1px
- ❌ Inventing radii between the scale (no 10px, no 14px)
- ❌ Free-form drop shadows — only `--shadow-1`, `--shadow-2`, `--shadow-fab`
- ❌ Custom fonts beyond the two declared
- ❌ Animation longer than 420ms (drag handles, page transitions max)
- ❌ Filler stats, decorative icons, dummy badges to "make a card look full"
- ❌ Using a side sheet when a bottom sheet would do (or vice versa) — see §7.10 for the rule

---

## 13 — Prompt template for an AI

Paste this **as-is** when starting a new app, after the design tokens above:

> You are building a [APP TYPE] called [NAME] using the design pattern above. Constraints:
>
> 1. Use the exact CSS custom properties from section 3 — do not invent colors, radii, fonts, or durations.
> 2. Font Awesome 6 Free (solid) for all icons, single color via `currentColor`. Default to `var(--text-2)`; use `var(--accent)` only for active/selected states.
> 3. Build for a phone first (390 × 844). Use the screen-layout zones from section 9.
> 4. Components must match the patterns in section 7. If you need a new component, model it after the closest existing pattern.
> 5. Motion uses only the durations and eases from section 8.
> 6. Run the checklist in section 11 before claiming a screen is done.
> 7. Use Angular standalone components, one per pattern, reading from CSS custom properties.
>
> **Product brief**: [1–2 sentence brief]
> **Screens to build**: [list]
> **Primary actions per screen**: [list]
>
> Start by listing the screens with their three zones (header / content / FAB) and the primary action of each. Then build one screen at a time, asking for approval before moving on.
