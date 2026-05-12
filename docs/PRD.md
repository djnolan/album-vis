# Album Burst — Product Requirements

**Version 1.3 · Design & Build Reference**

---

## 1. Project Overview

Album Burst is a web application that generates organic, data-driven visualizations of music albums. Each song in an album is represented as a hand-drawn burst/flower shape whose visual properties are encoded from musical data: duration, BPM, key, accidental, and mode. Shapes are arranged in a circle-packed layout and colored using a chromatic key ramp.

The primary use case is personal and exploratory — users upload their own album data via CSV and receive a downloadable phone wallpaper visualization. A set of preloaded albums is provided so users can explore the tool before uploading their own data.

---

## 2. Data Model

### 2.1 Song Data Schema

Each song is represented by the following fields:

| Field | Type | Description |
|---|---|---|
| `track` | Integer | Track number (used for layout order) |
| `name` | String | Song title |
| `duration` | Integer | Duration in seconds |
| `bpm` | Integer | Beats per minute |
| `key` | String | Root note letter only: C, D, E, F, G, A, or B |
| `accidental` | String | One of: `natural`, `sharp`, `flat` |
| `mode` | String | One of: `major`, `minor` |

### 2.2 Visual Encoding

| Property | Encoding |
|---|---|
| **Size** | Duration — square root scale, diameter range 36–130px |
| **Petal count** | BPM ÷ 15, minimum 3 petals |
| **Petal shape** | Accidental — natural = rounded egg/teardrop, sharp = narrow spike triangle, flat = rectangular plank |
| **Center cutout** | Mode — major = irregular hand-drawn oval, minor = irregular hand-drawn triangle (randomly rotated) |
| **Color** | Key letter (A–B), mapped to a 12-step chromatic ramp (C = colorStart, B = colorEnd). Accidentals share the root letter color. Interpolated using `d3.interpolateHcl` for perceptual uniformity. |

### 2.3 Shape Library

Each petal type uses a set of 5 unique hand-drawn SVG paths. Petals cycle through the library and are rotated into position around the flower center. Each petal gets a slight random rotation jitter (±6° for most types, ±3° for sharp petals at low counts) seeded per flower. The overall flower receives a random global rotation.

Center cutouts (major oval and minor triangle) are hand-drawn paths stored as normalized SVG coordinates. Both receive a random rotation per flower instance.

---

## 3. Layout Engine

Songs are arranged using a D3 force simulation:

- Initial positions seeded using a golden angle spiral to prevent grid structure.
- `forceCollide`: radius = 80% of shape radius, strength 1.0, **6 iterations**.
- `forceCenter`: strength 0.08.
- `forceX/Y` toward spiral seed positions: strength 0.04.
- **800 ticks**, run synchronously before render.
- Slight overlap between shapes is intentional.

A dynamic `viewBox` is computed from the bounding box of all placed shapes plus padding, scaled to fill the available display area.

---

## 4. Color & Palette System

Palettes are defined in `src/data/palettes.js`. This is the only file that needs to be edited to add, remove, or modify palettes. Each palette has:

| Field | Description |
|---|---|
| `id` | Unique string identifier (kebab-case) |
| `name` | Display name shown in the palette picker |
| `bg` | Hex background color (also used for center cutout 'hole' color) |
| `colorStart` | Hex color for the C end of the chromatic ramp (low/dark end) |
| `colorEnd` | Hex color for the B end of the chromatic ramp (high/light end) |

The color ramp uses `d3.scaleSequential` with `d3.interpolateHcl`. The 12 chromatic steps map C, C#, D, D# … B. Accidentals share the root letter color.

### Current Palette Set (12 palettes)

Light-background palettes (those with `lightBg: true`) trigger dark UI overrides on the Visualization Screen — see design-spec.md §3.

| ID | Name | bg | colorStart | colorEnd | lightBg |
|---|---|---|---|---|---|
| `neon-citrus` | Neon Citrus | `#1F1F1F` | `#2A6F6A` | `#F2FF4D` | — |
| `terracotta-punch` | Terracotta Punch | `#DAD2C3` | `#C49A7A` | `#3A6FF2` | ✓ |
| `acid-bloom` | Acid Bloom | `#222222` | `#3A8F2A` | `#FF00C8` | — |
| `ultraviolet-clash` | Ultraviolet Clash | `#140F2D` | `#2E0F7A` | `#F72585` | — |
| `electric-orchid` | Electric Orchid | `#2A1F3D` | `#3F2A6B` | `#00E5FF` | — |
| `prism-bloom` | Prism Bloom | `#FFF6E0` | `#FF9F1C` | `#2EC4FF` | ✓ |
| `burnt-hologram` | Burnt Hologram | `#2B1F1A` | `#FF7A00` | `#FFD9F7` | — |
| `deep-sea-tape` | Deep Sea Tape | `#06141F` | `#006D77` | `#83C5BE` | — |
| `signal-decay` | Signal Decay | `#1E2430` | `#5B8CFF` | `#FF8A5B` | — |
| `blue-screen-life` | Blue Screen Life | `#2146C7` | `#A7C7FF` | `#FFE66D` | — |
| `lava-lamp` | Lava Lamp | `#A63A50` | `#FFD166` | `#7BFFB7` | — |
| `green-room` | Green Room | `#0B6E4F` | `#C2F970` | `#FF6B6B` | — |

---

## 5. Screens & UI

### 5.1 Home Screen

A vertically scrolling feed of album visualizations. The page title **"In Bloom"** appears at the top in display serif, with a short tagline below.

- Body scrolls natively (not an inner container) so the iOS address bar minimizes on scroll.
- **Your Albums** section: if the user has created any albums, they appear in a bordered box above the preloaded albums. Long-pressing a user album opens a removal confirmation sheet.
- **Preloaded albums**: 5 albums displayed below the Your Albums section (or at the top if no user albums exist). Each shows a square thumbnail, album title (`text-text-primary`), and artist name (`text-text-secondary`).
- Fixed bottom bar: full-width **CREATE +** button (opens Upload Data overlay), anchored over a gradient fade from `surface-0`.
- Palette changes made during a session are reflected on home screen album thumbnails, but reset to defaults on page refresh (preloaded albums only; user-created albums persist palette choice via localStorage).

### 5.2 Upload Data Overlay

Full-height bottom sheet (minus a 48px top margin). Contains:

- Title **"Create Your Visualization"** + X close button.
- Two accordion steps, one open at a time:
  - **Step 1 — Get Your Data**: Copyable LLM prompt with a COPY button. Collapsed by default; expand to reveal the full prompt.
  - **Step 2 — Paste In Your Data**: Multiline textarea with placeholder "Paste your data here." and a **UPLOAD CSV** submit button.

On successful upload: overlay closes, navigates to Visualization Screen. CSV text is validated for required columns and value ranges before navigating.

### 5.3 Visualization Screen

Main view after selecting a preloaded album or uploading data.

- **Top bar**: Back arrow (left) · Album title + artist name centered (tappable, opens Edit Album overlay) · blank spacer (right). Floats over the visualization with a top-to-transparent gradient using the active palette's bg color.
- **Center**: Visualization filling the full screen. Container is 116% of screen width (slightly overflowing) to give a fuller visual feel. Shifts up 10% when a song card is active.
- **Bottom bar**: ⓘ Info icon (left, opens Key/Legend overlay) · Palette icon (center, opens Palette overlay) · Download icon (right).
- Screen uses `position: fixed; inset: 0` so it fills the true visual viewport on mobile (not `100vh`), preventing bottom buttons from being hidden by the browser address bar.
- Body scroll is locked while the screen is visible via `useScrollLock` (iOS: `position:fixed` body trick; others: `overflow:hidden`). All overlays that appear on top of the viz screen also apply scroll lock.

**Song Card Carousel:**

- Tapping a flower reveals a song card at the bottom of the screen.
- Cards are swipeable horizontally to navigate through all songs in track order.
- Active flower is highlighted; non-active flowers are dimmed to 30% opacity.
- Dismiss by tapping outside, swiping down, or close button.
- Each card shows: song name, duration (m:ss), BPM, key + accidental, major/minor.

### 5.4 Palette Overlay

Bottom sheet. Title 'Pick Your Palette' + X close. 2-column scrollable grid of palette thumbnails, each showing a mini visualization preview with palette name below. Tapping applies immediately and closes. Active palette shown with selected state.

- **Preloaded albums**: palette change applies for the current session only; resets to album default on page refresh.
- **User-created albums**: palette choice persists via localStorage.

### 5.5 Key / Legend Overlay

Triggered by ⓘ button. Currently a simple bottom sheet with text-only descriptions of the encoding system.

Content:
- SIZE = how long the song is
- PETALS = tempo (BPM)
- PETAL SHAPE = accidental — rounded (natural), spiky (sharp), rectangular (flat)
- CENTER SHAPE = mode — oval hole (major), triangle hole (minor)
- COLOR = musical key, C through B

> **TODO**: Full visual redesign planned for a later iteration.

### 5.6 Song Card

Bottom card with clean list of song data fields. Swipe/tap-away dismiss behavior implemented.

Card fields: Song name (prominent), Duration, BPM, Key + accidental, Major/Minor.

> **TODO**: Full visual redesign planned for a later iteration.

### 5.7 Download

Tapping the download button (↓) on the Visualization Screen generates and saves a high-resolution PNG wallpaper — no overlay or options dialog.

- **Output size**: 1170 × 2532px (iPhone 14 native resolution — scales well on any modern phone).
- **Format**: Phone wallpaper (portrait).
- **Content**: Visualization only — no text, labels, or UI chrome.
- **Positioning**: Flower cluster rendered at 116% of wallpaper width (matching screen appearance), centered with the cluster midpoint at 55% from the top (clears the phone status bar area).
- **Background**: Full wallpaper filled with the current palette's `bg` color.
- **Filename**: `{album-title}-wallpaper.png`

---

## 6. CSV Format

Required columns (headers case-insensitive):

| Column | Type | Constraints |
|---|---|---|
| `track` | integer | — |
| `name` | string | — |
| `duration` | integer (seconds) | — |
| `bpm` | integer | — |
| `key` | string | One of: C, D, E, F, G, A, B |
| `accidental` | string | One of: natural, sharp, flat |
| `mode` | string | One of: major, minor |

---

## 7. LLM Prompt

The following prompt is displayed in the Upload Data overlay for users to copy into their LLM of choice:

```
I need you to look up music data for an album and format it as a CSV file I can download.

Album: [ALBUM NAME] by [ARTIST NAME]

Please look up the following data for every track on the album using a source like Musicstax,
Tunebat, or GetSongBPM, and create a CSV with these exact column headers:

track, name, duration, bpm, key, accidental, mode

Rules for each field:
- track — track number as an integer (1, 2, 3...)
- name — song title as a string
- duration — song length in seconds as an integer (e.g. 3:45 = 225)
- bpm — beats per minute as an integer. If two sources disagree, prefer the higher value.
  If the track has no clear beat, use your best estimate.
- key — the root note letter only, one of: C, D, E, F, G, A, B (no sharps or flats here)
- accidental — one of: natural, sharp, flat
  (e.g. F# = key F, accidental sharp / Bb = key B, accidental flat / C = key C, accidental natural)
- mode — one of: major or minor

Please include every track on the standard album (no bonus tracks or deluxe editions unless
specified). Output only the CSV data with no explanation, just the header row followed by one
row per track.
```

> **Note**: `[ALBUM NAME]` and `[ARTIST NAME]` should be inline-editable in the UI before copying (open item).

---

## 8. Technical Stack

| Layer | Technology |
|---|---|
| Framework | React (Vite) |
| Visualization | D3 (force simulation, color scales) |
| SVG rendering | Inline React SVG components |
| CSV parsing | PapaParse |
| Styling | Tailwind CSS |
| Hosting | GitHub Pages (deployed from `gh-pages` branch) |
| Backend | None — all processing client-side |

---

## 9. Preloaded Albums

Display order on Home Screen:

| Order | Artist | Album | Tracks | Default Palette |
|---|---|---|---|---|
| 1 | Frank Ocean | Blonde | 17 | Neon Citrus |
| 2 | Boards of Canada | Music Has the Right to Children | 18 | Terracotta Punch |
| 3 | Taylor Swift | Speak Now | 14 | Ultraviolet Clash |
| 4 | Sex Pistols | Never Mind the Bollocks | 12 | Acid Bloom |
| 5 | Radiohead | In Rainbows | 10 | Prism Bloom |

---

## 10. Open Items

| Item | Status | Notes |
|---|---|---|
| Key/Legend overlay visual design | Open | Placeholder text in place; full visual design TBD |
| Download — additional format options | Open | Current: wallpaper only. Future: square poster, title on/off, etc. |
| iOS address bar behavior on viz screen | Resolved | `useScrollLock` hook implemented; iOS uses `position:fixed` body trick, others use `overflow:hidden` |
| LLM prompt inline-editable fields | Open | `[ALBUM NAME]` / `[ARTIST NAME]` should be editable in the UI before copy |
| Cut-paper edge effect on petals | Open | Low priority for v1 |
| Spotify API integration | Blocked | Blocked by endpoint deprecation (post Nov 2024); revisit if access restored |
| Desktop layout | Open | Currently mobile-first; desktop layout TBD |

---

## 11. Implementation Notes

### 11.1 File Structure

```
src/
  components/
    Flower.jsx              — SVG flower renderer
    Visualization.jsx       — D3 layout + SVG container (forwardRef for download)
    VisualizationScreen.jsx — Full viz screen with download handler
    HomeScreen.jsx          — Album feed, body-scroll layout
    PaletteOverlay.jsx      — Palette picker bottom sheet
    LegendOverlay.jsx       — Key/legend bottom sheet (v1 text-only placeholder)
    SongCard.jsx            — Song detail card carousel
    UploadOverlay.jsx       — Two-step accordion CSV upload sheet
    EditAlbumOverlay.jsx    — Edit album title/artist
    RemoveAlbumSheet.jsx    — Long-press delete confirmation sheet
    PrimaryButton.jsx       — Full-width primary action button
    SecondaryButton.jsx     — Ghost/secondary action button
  hooks/
    useScrollLock.js        — Prevents body scroll while overlays are open (iOS-safe)
  data/
    albums.js               — Preloaded album data + PRELOADED_ALBUMS export
    palettes.js             — PALETTES array + DEFAULT_PALETTE_ID
    petalPaths.js           — Hand-drawn SVG petal path libraries
  App.jsx                   — Screen routing + state management
  index.css                 — Global styles
docs/
  sketches/                 — UI wireframe references (4 screens)
  PRD.md                    — This document
prototypes/                 — Original prototype components (reference only)
```

### 11.2 Stable — Do Not Change

- All SVG petal path data (`NATURAL_PETALS`, `SHARP_PETALS`, `FLAT_PETALS`) — hand-drawn, cannot be regenerated algorithmically.
- `MAJOR_PATH` and `MINOR_PATH` — hand-drawn center cutout shapes.
- `parseBBox()` and `seededRand()` utility functions.
- Flower component rendering logic — petal placement, width scaling, jitter, cutout rendering.
- D3 force simulation layout — golden angle spiral seed, force parameters, 800 ticks.
- HCL color interpolation (`d3.interpolateHcl`).
- NOTE_ORDER chromatic scale mapping (C through B, 12 steps).

### 11.3 Key Implementation Notes

- Center cutout color must always match `palette.bg` so it reads as a hole, not a filled shape.
- Sharp petals at 5 or fewer use reduced jitter (±3°) to prevent corner gaps at the base; all other petal types use ±6°.
- Sharp petals extend their base 6% deeper into center (`baseY` adjustment) to cover gaps from rotation.
- Natural petals use a smaller center patch radius (9% of size) vs flat/sharp (14%) due to how petal bases overlap.
- Width scaling uses `Math.sqrt(9 / petalCount)` with a cap of 1.15× for sharp petals.
- `viewBox` is computed dynamically from the actual bounding box of placed nodes — not a fixed value.
- Flowers render at full opacity (`opacity: 1`); non-active flowers during song card mode dim to `opacity: 0.3`.
- `Visualization` is a `forwardRef` component — the ref points to the `<svg>` element, used by the download handler.
