# Aura Roastery — Cinematic Scroll-Scrubbed Layout Plan

## How The Reference Technique Works (Key Learnings)

The reference prompt taught us one critical architectural truth:

> **The page doesn't scroll. The video does.**

Here's the exact mechanism, adapted for our cafe:

1. **A `.track` div** — the only element that has `height` (e.g. `560vh`). It's the scroll runway. Nothing else contributes height.
2. **Everything else is `position:fixed`** — the video, the header, all panels, the footer. They never move.
3. **A `rAF` loop reads `window.pageYOffset / (documentHeight - windowHeight)`** to get a `progress` value from `0.0` to `1.0`.
4. **`progress` is mapped to `video.currentTime`** — with a 0.115 lerp factor so it eases to the target frame smoothly instead of jumping.
5. **Panels have a cue table** like `[fadeInStart, fadeInEnd, fadeOutStart, fadeOutEnd]` — the rAF loop drives their `opacity` and a subtle `translateY` counter-scroll (parallax feel). No CSS transitions, no IntersectionObserver — pure imperative JS.
6. **The video is fetched as a full blob first** so every frame is instantly seekable (range requests over network = choppy scrub).
7. **The video must be all-intra (every frame is a keyframe)** for instant random access. This is the most important constraint for source video.

---

## Our Adaptation: The Cafe Scroll Journey

### Page Structure (All Fixed, One Scroll Track)

```
<body>
  <div class="boot">          ← Preloader
  <div class="stage">         ← Fixed full-screen video background
    <video id="clip">
    <div class="veil">        ← Gradient overlay for contrast
    <div class="grain">       ← Subtle noise texture
  </div>
  <header class="chrome">     ← Fixed frosted glass nav bar
  <main class="panels">       ← All 5 sections, fixed, crossfaded by JS
    <section data-panel="hero">
    <section data-panel="story">
    <section data-panel="menu">
    <section data-panel="places">
    <section data-panel="contact">
  </main>
  <i class="meter">           ← 2px top scroll progress bar
  <footer class="foot">       ← Fixed minimal footer with address
  <div class="track">         ← ONLY thing with height: 600vh
  <script> ... </script>
</body>
```

---

## Section Cue Table (Scroll Progress 0.0 → 1.0)

Each row: `[fadeInStart, fadeInEnd, fadeOutStart, fadeOutEnd]`

The gaps between sections are **deliberate dead zones** — video scrubs silently, no text visible. This creates the "cinematic pause" effect.

| Panel | Section | Fade In | Visible | Fade Out | Dead Zone After |
|-------|---------|---------|---------|----------|-----------------|
| 0 | **Hero** | `0.00 → 0.00` | immediately | `0.12 → 0.20` | 0.20 → 0.32 |
| 1 | **Our Story** | `0.32 → 0.40` | hold | `0.52 → 0.60` | 0.60 → 0.72 |
| 2 | **The Menu** | `0.72 → 0.78` | hold | `0.84 → 0.90` | 0.90 → 0.96 |
| 3 | **Our Places** | *(separate page section)* | | | |
| 4 | **Contact** | `0.96 → 1.00` | hold | stays | none |

> [!NOTE]
> For a 5-section site we need a longer scroll track. We'll use `700vh` with `min-height: 4000px`. Panels 3 and 4 can share the last 30% of scroll with no dead zone between them.

**Full Cue Table (JS):**
```js
var CUES = [
  [0.00, 0.00, 0.12, 0.20],  // Hero — appears immediately
  [0.32, 0.40, 0.52, 0.60],  // Our Story
  [0.65, 0.72, 0.80, 0.87],  // The Menu
  [0.88, 0.92, 0.96, 1.00],  // Our Places
  [1.00, 1.00, 9.00, 9.00],  // Contact — stays on screen at end
];
var DRIFT = 28; // px vertical parallax travel per panel
```

---

## Header Design — Frosted Morphism Glass Bar

```
.chrome {
  position: fixed;
  top: 0; left: 0; right: 0;
  z-index: 40;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px clamp(20px, 4vw, 52px);

  /* THE FROSTED GLASS EFFECT */
  background: rgba(10, 8, 6, 0.45);
  backdrop-filter: blur(18px) saturate(1.6);
  -webkit-backdrop-filter: blur(18px) saturate(1.6);
  border-bottom: 1px solid rgba(212, 175, 55, 0.12);
}
```

Nav items: Logo left · Links centre · CTA pill right.  
CTA pill: dark gold `background: #d4af37`, dark text, border-radius 999px.

---

## Panel Content (Verbatim Copy Per Section)

### Panel 0 — Hero
- **Eyebrow**: `Aura Roastery · Est. 2024`
- **h1**: `Coffee is<br>a ceremony.`
- **Sub**: `Every pour is considered. Every bean is a choice. Scroll into our world.`
- **CTA**: pill → `Begin the journey ↓`

### Panel 1 — Our Story
- **Eyebrow**: `The origin`
- **h1**: `Born from<br>obsession.`
- **Sub**: `We started with one espresso machine, a single-origin Ethiopia, and a refusal to compromise. Nothing has changed.`
- **CTA**: pill → `Read the full story`

### Panel 2 — The Menu
- **Eyebrow**: `The craft`
- **h1**: `Roasted this<br>morning.`
- **Sub**: `Our seasonal menu changes with the harvest. Espresso, pour-over, cold brew — made to order, never in advance.`
- **CTA**: pill → `Explore the menu`

### Panel 3 — Our Places
- **Eyebrow**: `Find us`
- **h1**: `Two spaces,<br>one philosophy.`
- **Sub**: `A roastery in Bandra, a café in Colaba. Both open before the city wakes.`
- **CTA**: pill → `Get directions`

### Panel 4 — Contact
- **Eyebrow**: `Come in`
- **h1**: `The door is<br>always open.`
- **Sub**: `Reservations for 6+ guests. Private events. Wholesale inquiries. We respond to everything.`
- **CTA**: pill → `Write to us`

---

## Color Theme — "Roasted Dark"

> [!IMPORTANT]
> Since the reference site uses a **light** editorial look (`#f2f0ec` paper), ours will be the **dark inverse** — matching the "midnight roastery" aesthetic requested. This requires adjusting the veil gradient direction (darker, not lighter overlay).

```css
:root {
  --bg:       #0a0806;          /* deep espresso black */
  --fg:       #f0ece4;          /* oat milk white */
  --fg-soft:  rgba(240,236,228,.62);
  --fg-faint: rgba(240,236,228,.38);
  --gold:     #d4af37;          /* crema gold accent */
  --gold-dim: rgba(212,175,55,.18);
  --rule:     rgba(240,236,228,.12);
  --pill-bg:  #d4af37;
  --pill-fg:  #0a0806;
  --ease:     cubic-bezier(.22,.61,.36,1);
}
```

**Veil (dark version)** — adds warmth and keeps text readable over the video:
```css
.veil {
  background:
    linear-gradient(to bottom, rgba(10,8,6,.72) 0%, rgba(10,8,6,.18) 22%,
      rgba(10,8,6,.18) 78%, rgba(10,8,6,.80) 100%),
    radial-gradient(100% 80% at 50% 48%, rgba(10,8,6,0) 0%, rgba(10,8,6,.40) 100%),
    rgba(10,8,6,.25);
}
```

---

## Typography

- **Display font**: `Cormorant Garamond` (weight 300, 400) — deeply elegant, high contrast serif, fashion-editorial feel. Loaded from Google Fonts.
- **UI / Body font**: `Inter Tight` (weight 400, 500) — same as reference, for all nav, labels, sub-copy.
- `h1` size: `clamp(48px, 9vw, 120px)`, `line-height: 0.95`, `letter-spacing: -0.04em`

---

## The Video File

- **Source**: `C:\Users\shubh\Downloads\NatureRitual_Wellness_Lifestyle.mp4`
- **Serving**: We'll copy it to the `public/` folder and reference it as `/NatureRitual_Wellness_Lifestyle.mp4`.
- **Critical Requirement**: For smooth scrubbing, the video ideally needs to be **re-encoded as all-intra (every frame a keyframe)**. We can do this with ffmpeg:
  ```
  ffmpeg -i input.mp4 -c:v libx264 -x264-params "keyint=1:min-keyint=1" -an output.mp4
  ```

> [!IMPORTANT]
> If you don't re-encode, scrubbing will still work but may exhibit "stale frame" artifacts as the decoder has to back-seek to the nearest keyframe. For a cinematic experience, the re-encode is worth it.

---

## Implementation Plan (One `index.html`)

Following the reference's single-file, no-build rule:

1. **Document head** — preconnects, Google Fonts (Cormorant Garamond + Inter Tight)
2. **CSS block** — CSS custom properties, reset, all component styles (stage, veil, grain, chrome, nav, pill, panels, panel content, footer, preloader, meter, track, breakpoints)
3. **HTML markup** — in the exact order specified: boot → stage → meter → chrome → panels → foot → track
4. **JS IIFE** — video blob preloader → rAF loop → cue-driven panel fade → scroll meter → iOS unlock → event wiring

### Key differences from the reference:
| Feature | Reference (Cast & Render) | Ours (Aura Roastery) |
|---------|--------------------------|----------------------|
| Color theme | Light (`#f2f0ec` paper) | Dark (`#0a0806` espresso) |
| Veil direction | Light wash, hold type | Dark wash, warm edges |
| Font | Inter Tight only | Cormorant Garamond + Inter Tight |
| Sections | 3 panels | 5 panels |
| Scroll track | `560vh` | `700vh` |
| Header style | Clean flat gradient | Frosted glass + gold rule |
| CTA pill | Dark/black | Gold `#d4af37` with dark text |
| Video | CloudFront CDN | Local `/video.mp4` |

---

## Open Questions Before Execution

> [!IMPORTANT]
> 1. **Do you want me to re-encode the video with ffmpeg for all-intra keyframes?** (Recommended for smooth scrubbing — will process the file from Downloads). Or will you provide a pre-encoded version?
> 2. **Cafe name**: Should we use "Aura Roastery" or do you have a specific brand name?
> 3. **Are you providing more videos** for individual sections (e.g. one video for hero, one for beans etc.) or is this single video the entire scroll track?
> 4. **Do you want the site in a new single `index.html` file** (per the reference's single-file approach), replacing the Vite project entirely?
