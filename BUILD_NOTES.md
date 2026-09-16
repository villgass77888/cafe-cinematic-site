# AURA ROASTERY — Build Reference Document
## Generated: 2026-09-17 | For use as recall context

---

## 1. PROJECT STRUCTURE

```
aura-cafe/
├── index.html     ← ENTIRE site: CSS + markup + JS in one file (no build step)
└── video.mp4      ← All-intra re-encoded video (keyint=1, ~22MB)
```

Served locally via: `npx serve . --listen 5200`
Open at: http://localhost:5200

---

## 2. VIDEO ENCODING (CRITICAL)

Original source: `C:\Users\shubh\Downloads\NatureRitual_Wellness_Lifestyle.mp4`
Duration: 6.75s | 270 frames | 40fps | 1920×1416

Re-encode command (all-intra = every frame is a keyframe → instant random-access):
```
ffmpeg -i "C:\Users\shubh\Downloads\NatureRitual_Wellness_Lifestyle.mp4" ^
  -c:v libx264 -x264-params "keyint=1:min-keyint=1" ^
  -crf 20 -preset fast -vf "scale=1920:-2" -an ^
  "C:\Users\shubh\.gemini\antigravity-ide\scratch\aura-cafe\video.mp4" -y
```

When you add a NEW video: replace video.mp4 in the project root, re-encode it the same way.

---

## 3. ARCHITECTURE — HOW IT WORKS

### The Inverted Scroll Trick
The page DOES NOT scroll. Only the video scrubs.

- `.track` div (height: 420vh, min-height: 2600px) = the ONLY element with height in the fixed section
- Everything in the hero: `position: fixed` (video, header, panels, footer label)
- A `requestAnimationFrame` loop reads `scrollY / trackHeight` → `trackProgress` (0..1)
- `trackProgress * video.duration = video.currentTime` (lerped at 0.115 factor for smoothness)
- After the `.track` div ends, REGULAR HTML sections begin (Story, Order, Contact)
- Regular sections are `position: relative; z-index: 5; background: #080604` → they cover the fixed video naturally

### Two Scroll Progress Values (important!)
```js
trackProgress = clamp(scrollY / trackMax, 0, 1);  // drives video + hero panel
pageProgress  = clamp(scrollY / pageMax, 0, 1);   // drives scroll meter bar
```

---

## 4. COLOR PALETTE — "Roasted Dark"

| Token | Value | Use |
|-------|-------|-----|
| `--bg` | `#080604` | Deep espresso black background |
| `--fg` | `#f0ece4` | Off-white oat milk text |
| `--fg-soft` | `rgba(240,236,228,.58)` | Body text, muted |
| `--fg-faint` | `rgba(240,236,228,.32)` | Footer labels, placeholders |
| `--green` | `#5a7040` | Mehendi green — primary accent |
| `--green-soft` | `rgba(90,112,64,.22)` | Hover backgrounds |
| `--green-border` | `rgba(90,112,64,.18)` | Card/glass borders |
| `--green-glow` | `rgba(90,112,64,.07)` | Ambient glow on sections |
| `--rule` | `rgba(240,236,228,.08)` | Dividers |
| `--ease` | `cubic-bezier(.22,.61,.36,1)` | All transitions |

---

## 5. TYPOGRAPHY

```
Display / Headlines: 'Cormorant Garamond' (font-weight: 300, font-style: italic)
UI / Body / Nav:     'Inter Tight' (font-weight: 400, 500)
Eyebrows / Labels:   Inter Tight 400, letter-spacing: .20em+, text-transform: uppercase
```

Font import (in <head>):
```html
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&family=Inter+Tight:wght@300;400;500&display=swap" rel="stylesheet">
```

---

## 6. HEADER (CHROME) — Mossary Style

- Layout: CSS Grid `1fr auto 1fr` (logo | centred nav | right actions)
- Height: 62px, fixed to top
- Background: `linear-gradient` dark overlay, NO `backdrop-filter` blur
- Corner bracket decorations: CSS `::before`/`::after` pseudo-elements
- Logo: 2×2 CSS grid icon + "AURA ROASTERY" in Inter Tight 500 wide-tracked
- Nav: all-caps, letter-spacing: .18em, opacity .68 → 1 on hover
- Right: "Reserve" in `--green` + hamburger (2 CSS lines)
- IMPORTANT: `.chrome` is `position: fixed`. ::before/::after work because fixed elements act as containing blocks. DO NOT add `position: relative` — it would break fixed positioning.

---

## 7. HERO PANEL — Directional Text Lines

3 lines of "Coffee / is a / ceremony." each animated from different directions.

### Cue Table (trackProgress 0..1)
```js
var CUES = [
  [0.00, 0.00, 0.80, 1.00]  // Hero: appears at start, fades at 80-100%
];
```

### Line Direction Config
```js
var LINE_DIRS         = [-1,   1,  -1];       // -1=from left, 1=from right
var LINE_ENTER_STARTS = [0.00, 0.04, 0.08];   // stagger
var LINE_ENTER_ENDS   = [0.10, 0.14, 0.18];
var LINE_SLIDE_PX     = 72;                   // px of horizontal travel
```

Line 1 (.hero-l1): left-aligned, enters from LEFT
Line 2 (.hero-l2): right-aligned, enters from RIGHT, caption in --green
Line 3 (.hero-l3): left-aligned + padding-left indent, enters from LEFT

Panel overall parallax: `DRIFT = 24` px (counter-scroll feel)

### IMPORTANT: NO CSS transitions on .hero-line or .panel
The rAF loop drives them imperatively every frame. CSS transitions would lag behind.

---

## 8. rAF LOOP — The Animation Engine

```js
function frame() {
  if (ready && duration) {
    var gap = seekTo - seekAt;
    if (Math.abs(gap) > 0.0008) {
      seekAt += gap * 0.115;  // lerp factor — DO NOT change
      if (clip.readyState >= 2 && !clip.seeking) {
        try { clip.currentTime = seekAt; } catch (e) {}
      }
    }
  }
  paint();  // drives panel opacity, line transforms, meter
  requestAnimationFrame(frame);
}
```

The 0.115 lerp factor is carefully tuned: lower = more lag but smoother, higher = more responsive but jerkier. 0.115 is the sweet spot for this duration video.

---

## 9. BLOB PRELOADER (why it's needed)

Without it: `video.currentTime = N` triggers a network range-request → 200-400ms stutter per seek.
With it: entire mp4 is fetched into memory as a Blob → seeks are instant (O(1)).

Approx file size used as fallback denominator: `22e6` bytes (22MB). Update this if video changes significantly.

---

## 10. REGULAR SECTIONS (after .track)

### Story Section (#story)
- Layout: 2-column grid (left: timeline, right: frosted glass quote card)
- Left: Cormorant italic h2 + vertical green rule + timeline (dot + year + text)
- Right: `.glass` card with italic quote + founder signature
- Ambient: `radial-gradient` green glow at bottom-left + top-right

### Order Section (#order)
- Header: flex row (title left, sub-copy right)
- Grid: `repeat(auto-fit, minmax(280px, 1fr))` with 1px gap on `--green-border` bg
- Each card: `border-top: 1px solid var(--green)`, hover lifts 5px
- Price in Cormorant + "Order" ghost button

### Contact Section (#contact)
- Layout: 2-column (left: locations, right: contact form)
- Locations: stacked `.location-card` in 1px-gap grid
- Form: `.glass` card with input styling (green focus glow on :focus)
- Bottom: large italic closing statement "The door is always open."

### Shared Design Rules for Sections
- `position: relative; z-index: 5; background: var(--bg)` (covers fixed video)
- Background has subtle SVG noise texture for frosted glass to blur
- Section-specific `::before` ambient glow (different position per section)
- `.glass` = `backdrop-filter: blur(28px) saturate(1.5)` + green border

---

## 11. REVEAL ANIMATION SYSTEM (sections)

CSS classes:
```css
.reveal         { opacity:0; transform:translateY(30px); transition: 1s var(--ease) }
.reveal-left    { transform:translateX(-40px) }
.reveal-right   { transform:translateX(40px) }
.reveal-d1/d2/d3/d4  { transition-delay: .12/.26/.42/.58s (applied on .revealed) }
.reveal.revealed { opacity:1; transform:none; }
```

Triggered by `IntersectionObserver` at 12% threshold. Once revealed, element is unobserved.

---

## 12. CUSTOM CURSOR

- Dot: 7px, background: `--green`, follows mouse directly
- Ring: 34px, `border: 1px solid rgba(90,112,64,.42)`, follows mouse with 0.11 lerp lag
- On hover (`.hovering` class): dot → 12px white, ring → 54px
- Cursor loop runs in its own `requestAnimationFrame` chain (separate from video RAF)

---

## 13. RESPONSIVE BREAKPOINTS

| Breakpoint | Changes |
|---|---|
| `≤900px` | story/contact go single-column, veil darkens |
| `≤720px` | nav links hide (only logo + reserve + burger), smaller hero text |
| `≤420px` | grid icon hides, menu grid single-col, reduced padding |
| `≤height 520px landscape` | smaller hero text, tighter gaps |

---

## 14. KEY FILES & LOCATIONS

| File | Path |
|------|------|
| Main site | `C:\Users\shubh\.gemini\antigravity-ide\scratch\aura-cafe\index.html` |
| Video | `C:\Users\shubh\.gemini\antigravity-ide\scratch\aura-cafe\video.mp4` |
| Source video | `C:\Users\shubh\Downloads\NatureRitual_Wellness_Lifestyle.mp4` |
| Dev server | `npx serve . --listen 5200` from the aura-cafe directory |

---

## 15. WHAT'S PLACEHOLDER (user will replace)

- **All 3 section contents** — Story, Order, Contact are placeholder per user's plan
- **Cafe name** — "Aura Roastery" is working name
- **Video** — current video is a wellness clip; cinematic coffee videos coming later
- **Pricing, addresses, founders** — all fake, to be replaced
- **Hero copy** — "Coffee is a ceremony." is placeholder

## 16. THINGS NOT TO BREAK

1. `position: fixed` on `.chrome` — never add `position: relative` (breaks header)
2. `will-change` on `.hero-line` — keep it, ensures GPU compositing
3. The lerp factor `0.115` in the rAF loop — don't change
4. `.track` must be the ONLY element with height in the fixed-panel section
5. Regular sections MUST have `position: relative; z-index: 5` to cover the video stage
6. Do NOT add CSS transitions to `.panel` or `.hero-line` — they conflict with rAF
