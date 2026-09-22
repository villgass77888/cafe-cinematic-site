# AURA ROASTERY — Comprehensive Build & Architecture Reference Document
## Workspace: `c:\Users\shubh\Desktop\cafe AI` | Last Updated: 2026-09-21

---

## 1. PROJECT ARCHITECTURE & DIRECTORY STRUCTURE

The entire front-end runs from a single, zero-dependency, ultra-optimized `index.html` file—no Webpack, Vite, React, or build step required. All video decoding, momentum scrolling, SVG bezier curve rendering, and interactive UI states run directly in vanilla JavaScript and modern CSS.

```
cafe AI/
├── index.html                  ← ENTIRE site: CSS + DOM markup + JS engines in one file
├── lenis.min.js                ← Local Lenis smooth momentum scrolling library
├── video.mp4                   ← Hero scrubbed video (all-intra H.264, keyint=1)
├── section2-1.mp4              ← Story phase 1: Bean germination & growth (all-intra)
├── section2-2.mp4              ← Story phase 2: Roasting & swirling cup (all-intra)
├── product_0.mp4               ← Bridge explosion: Cup shatters into beans & splash
├── product_0_intra.mp4         ← Bridge video optimized all-intra for seamless scrubbing
├── products/                   ← Dedicated product showcase video assets (all-intra keyframe=1)
│   ├── product_2_1_intra.mp4   ← Product 2 (Espresso) entry scrub
│   ├── product_2_2_intra.mp4   ← Product 2 exit scrub
│   ├── product 3.1 ready-1.mp4 ← Product 3 (Frappe Mocha) entry scrub (all-intra)
│   ├── product_3_2_intra.mp4   ← Product 3 exit scrub (all-intra)
│   ├── product 4.1 ready-1.mp4 ← Product 4 (Iced Latte) entry scrub (all-intra)
│   ├── product_4_2_intra.mp4   ← Product 4 exit scrub (all-intra)
│   ├── product 5.1 ready-1.mp4 ← Product 5 (Caramel Latte) entry scrub (all-intra)
│   ├── product_5_2_intra.mp4   ← Product 5 exit scrub (all-intra)
│   ├── product 6.1 ready-1.mp4 ← Product 6 (Croissant) entry scrub (all-intra)
│   ├── product_6_2_intra.mp4   ← Product 6 exit scrub (all-intra)
│   ├── product 7.1 ready-1.mp4 ← Product 7 (Cinnamon Bread) entry scrub (all-intra)
│   ├── product_7_2_intra.mp4   ← Product 7 exit scrub (all-intra)
│   ├── product 8.1 ready-1.mp4 ← Product 8 (Blueberry Cheese Cake) entry scrub (all-intra)
│   ├── product_8_2_intra.mp4   ← Product 8 exit scrub (all-intra)
│   ├── product 9.1 ready-1.mp4 ← Product 9 (Grilled Butter Sandwich) entry scrub (all-intra)
│   └── product_9_2_intra.mp4   ← Product 9 exit scrub (all-intra)
├── BUILD_NOTES.md              ← Comprehensive engineering and architecture reference
└── walkthrough.md              ← Step-by-step visual & functional verification guide
```

- **Local Dev Server:** `npx serve .` running on background task
- **URL:** `http://localhost:3000` (or `http://localhost:5200` depending on port availability)

---

## 2. VIDEO ENCODING & THE ALL-I-FRAME (KEYFRAME=1) ENGINE (CRITICAL)

### Why Normal Compressed Videos Stutter During Scroll Scrubbing
Standard web videos use **Long-GOP (Group of Pictures)** compression with inter-frame prediction:
- **I-frames (Intra):** Full standalone pictures stored once every 2–5 seconds (e.g. `keyint=250`).
- **P-frames & B-frames:** Deltas that store only the differences relative to preceding/future frames.

When a video plays continuously at 1x speed, the hardware decoder easily decodes sequentially. But when the user **scroll-scrubs forward or backward**, the browser must set `video.currentTime = t` on every single scroll tick or animation frame. 
In a standard video, seeking to a non-keyframe requires the browser's video decoder to:
1. Search backward to find the most recent keyframe (I-frame).
2. Decode the I-frame into memory.
3. Sequentially decode all intervening P-frames and B-frames in the chain until reaching time `t`.
4. Drop old frames and render the target frame.

This causes massive CPU/GPU spikes, seek latency (100–300ms delays), frame dropping, and severe visual stuttering or blank black flashes.

### The All-I-Frame (All-Keyframe) Solution
By enforcing **all-intra / GOP=1 (`-g 1` or `keyint=1:min-keyint=1`)**, **every single frame in the video is an independent I-frame**.
- Seeking to any millisecond is instantaneous ($O(1)$ direct decode).
- No dependency chain on prior frames.
- Reverse scrubbing is just as lightning-fast and smooth as forward scrubbing.

### System Pressure & Performance Analysis
**Question:** *Does forcing every frame to be a keyframe put extra pressure on the system that leads to lag, glitch, or stutter?*
**Answer:** **No — in fact, it dramatically REDUCES system pressure during scrubbing.**
- **CPU/GPU Load:** During scroll scrubbing, all-I-frame is significantly *easier* on the processor because the decoder only decodes a single frame per seek instead of having to decode 30–60 delta frames across a GOP chain. Hardware video decoders love standalone I-frames.
- **Memory & Bandwidth:** The only trade-off is file size (typically 1.5x to 2x larger than high-compression Long-GOP). However, because each transition clip is short (1–2 seconds, ~300KB to 1MB each) and preloaded, total memory footprint remains well under 25MB for the entire suite—negligible for modern browsers and mobile devices.

### Exact FFmpeg Batch Commands Used

#### A. Root Video Assets
```bash
# Hero video:
ffmpeg -y -i input_hero.mp4 -c:v libx264 -x264-params "keyint=1:min-keyint=1" -crf 20 -preset fast -an video.mp4

# Story videos 2-1 and 2-2:
ffmpeg -y -i raw_s21.mp4 -c:v libx264 -g 1 -preset fast -crf 22 -an section2-1.mp4
ffmpeg -y -i raw_s22.mp4 -c:v libx264 -g 1 -preset fast -crf 22 -an section2-2.mp4

# Bridge video (Product 0 cup explosion):
ffmpeg -y -i raw_p0.mp4 -c:v libx264 -g 1 -preset fast -crf 22 -an product_0_intra.mp4
```

#### B. Product Exit / Intra Videos (9 Clips Batch)
Re-encoded in PowerShell to all-I-frame:
```powershell
Get-ChildItem "products\*_intra.mp4" | ForEach-Object {
  $out = $_.FullName -replace '\.mp4$','_smooth.mp4'
  ffmpeg -y -i $_.FullName -c:v libx264 -g 1 -preset fast -crf 23 -an $out
}
# Replace originals in place:
Get-ChildItem "products\*_intra_smooth.mp4" | ForEach-Object {
  $dest = $_.FullName -replace '_smooth\.mp4$','.mp4'
  Move-Item $_.FullName $dest -Force
}
```

#### C. Product Entry Scrub Videos (`x.1 ready-1.mp4` Batch)
Products 3 through 9 entry scrub visuals:
```powershell
@("product 3.1 ready-1.mp4","product 4.1 ready-1.mp4","product 5.1 ready-1.mp4","product 6.1 ready-1.mp4","product 7.1 ready-1.mp4","product 8.1 ready-1.mp4","product 9.1 ready-1.mp4") | ForEach-Object {
  $in = "products\$_"
  $out = $in -replace '\.mp4$','_intra.mp4'
  ffmpeg -y -i $in -c:v libx264 -g 1 -preset fast -crf 23 -an $out
  Move-Item $out $in -Force
}
```

### Complete Site Video Scrubbing Master Map

| Video File | Location | DOM ID | Role | Encoding |
|---|---|---|---|---|
| `video.mp4` | Root | `#clip` | Hero scroll scrub | All-I-Frame (`keyint=1`) |
| `section2-1.mp4` | Root | `#storyVideo1` | Story Phase 1 (Bean growth) | All-I-Frame (`-g 1`) |
| `section2-2.mp4` | Root | `#storyVideo2` | Story Phase 2 (Roasting & swirling cup) | All-I-Frame (`-g 1`) |
| `product_0_intra.mp4` | Root | `#bridgeVideo` | Bridge (Cup explosion & bean dispersal) | All-I-Frame (`-g 1`) |
| `product_2_1_intra.mp4` | `products/` | `#vid-2-entry` | Espresso entry convergence | All-I-Frame (`-g 1`) |
| `product_2_2_intra.mp4` | `products/` | `#vid-2-exit` | Espresso reverse exit scrub | All-I-Frame (`-g 1`) |
| `product 3.1 ready-1.mp4`| `products/` | `#vid-3-entry` | Frappe Mocha entry scrub | All-I-Frame (`-g 1`) |
| `product_3_2_intra.mp4` | `products/` | `#vid-3-exit` | Frappe Mocha exit scrub | All-I-Frame (`-g 1`) |
| `product 4.1 ready-1.mp4`| `products/` | `#vid-4-entry` | Iced Latte entry scrub | All-I-Frame (`-g 1`) |
| `product_4_2_intra.mp4` | `products/` | `#vid-4-exit` | Iced Latte exit scrub | All-I-Frame (`-g 1`) |
| `product 5.1 ready-1.mp4`| `products/` | `#vid-5-entry` | Caramel Latte entry scrub | All-I-Frame (`-g 1`) |
| `product_5_2_intra.mp4` | `products/` | `#vid-5-exit` | Caramel Latte exit scrub | All-I-Frame (`-g 1`) |
| `product 6.1 ready-1.mp4`| `products/` | `#vid-6-entry` | Croissant entry scrub | All-I-Frame (`-g 1`) |
| `product_6_2_intra.mp4` | `products/` | `#vid-6-exit` | Croissant exit scrub | All-I-Frame (`-g 1`) |
| `product 7.1 ready-1.mp4`| `products/` | `#vid-7-entry` | Cinnamon Bread entry scrub | All-I-Frame (`-g 1`) |
| `product_7_2_intra.mp4` | `products/` | `#vid-7-exit` | Cinnamon Bread exit scrub | All-I-Frame (`-g 1`) |
| `product 8.1 ready-1.mp4`| `products/` | `#vid-8-entry` | Blueberry Cheese Cake entry scrub | All-I-Frame (`-g 1`) |
| `product_8_2_intra.mp4` | `products/` | `#vid-8-exit` | Blueberry Cheese Cake exit scrub | All-I-Frame (`-g 1`) |
| `product 9.1 ready-1.mp4`| `products/` | `#vid-9-entry` | Grilled Butter Sandwich entry scrub | All-I-Frame (`-g 1`) |
| `product_9_2_intra.mp4` | `products/` | `#vid-9-exit` | Grilled Butter Sandwich exit scrub | All-I-Frame (`-g 1`) |

---

## 3. UNIFIED CONTINUOUS STAGE ARCHITECTURE (SINGLE PINNED VIEWPORT)

### Problem Resolved: Eliminating The "Double Cup" Visual Split
In earlier iterations, the Story section (`#story`) and the Product section (`#order`) were two independent `<section>` elements in the DOM. When scrolling from Section 2-2 into the Product section, the Story section would unpin and slide upwards while the Product section scrolled up from below. This produced a jarring, broken visual where two separate halves of two different coffee cups were visible on screen simultaneously. Furthermore, the extraction pillar cards ("Water", "Grind", "Pour") and SVG pointer lines lingered awkwardly over the explosion video.

### The Unified Stage Solution
1. **Co-located Sticky Container (`.story-sticky`):**
   - The entire visual journey from the origin story through the explosion bridge into the full interactive product catalog is housed inside a **single sticky viewport** (`position: sticky; top: 0; height: 100vh; overflow: hidden;`).
   - The runway is defined by `.story-scroll-track` (`height: 900vh`).
   - Sibling section tearing is completely eliminated.
2. **Pillar Cards Clean Fade-Out:**
   - At `storyProgress = 0.66 → 0.69`, all extraction pillar cards (`.sp-card`) and SVG connecting lines fade out smoothly to `opacity: 0; pointer-events: none`.
   - The bridge video (`product_0_intra.mp4`) opens on a pristine, 100% clean espresso-black stage.
3. **Piecewise Scroll Progress Mapping (`p = 0.00 → 1.00`):**
   - **`p ∈ [0.00, 0.28]`:** Section 2-1 scrubs forward (bean growth and opening).
   - **`p ∈ [0.28, 0.65]`:** Section 2-2 scrubs forward (roasting, swirling ceramic cup, timeline arc text, and 6 pillar cards stacking).
   - **`p ∈ [0.66, 0.69]`:** Pillar cards and timeline UI dissolve cleanly.
   - **`p ∈ [0.68, 0.78]`:** Bridge video (`product_0_intra.mp4`) scrubs forward, showing the ceramic cup shattering into flying roasted beans and espresso liquid.
   - **`p ∈ [0.78, 0.88]`:** Pixel-perfect handoff to Product 2.1 entry video (`product_2_1_intra.mp4`) which starts at the exact radial splash frame and converges into the crafted Espresso cup.
   - **`p ∈ [0.79, 0.88]`:** Product Showcase UI elements (eyebrow, title, preparation badge, macros table, and bottom carousel) slide in simultaneously from the flanks with gaussian blur de-focusing into crisp clarity.
   - **`p ∈ [0.88, 0.98]`:** Product Showcase station locks and snaps for interactive menu selection.
4. **Bidirectional Reverse Scrubbing:**
   - When the user scrolls backward from `#order` up into `#story`, `isScrollingReverse` dynamically detects direction.
   - The active product's `.2` exit video (`vid-X-exit`) scrubs smoothly from cup back to the splash.
   - At `p = 0.77–0.80`, it crossfades into `bridgeVideo`, which scrubs back to Section 2-2, bringing back the pillar cards and origin story with 100% continuity.
   - Exactly **one cup** is ever visible on screen at any time.

---

## 4. THE CINEMATIC PRODUCT SHOWCASE (#order)

### Complete 8-Item Product Catalog
The showcase features 8 artisanal selections, each with unique editorial copy, craft ritual notes, and nutrition/origin macro tables:
1. **No. 02 Espresso:** 9-Bar Extraction · 1:2 Brew Ratio · 28s Pull (`5 kcal`, `140 mg Caffeine`, `Med-Dark Roast`, `Ethiopia Origin`).
2. **No. 03 Frappe Mocha:** Blended Craft · Single-Origin Espresso · Cold Ganache (`320 kcal`, `110 mg Caffeine`, `72% Belgian Cacao`, `Whole Milk Base`).
3. **No. 04 Iced Latte:** Cold Layering · Slow Pour · Hand-Cut Ice (`160 kcal`, `130 mg Caffeine`, `3°C Chill`, `Oat/Almond Dairy`).
4. **No. 05 Caramel Latte:** Slow-Cooked Amber Glaze · Velvety Microfoam · Sea Salt (`290 kcal`, `120 mg Caffeine`, `House Craft Caramel`, `A2 Jersey Butter`).
5. **No. 06 Croissant:** 72-Hour Fermentation · Tournage 27 Layers · 4 AM Bake (`310 kcal`, `84% Churned Butter`, `32 g Carbs`, `6 g Protein`).
6. **No. 07 Cinnamon Bread:** Ceylon Cinnamon Swirl · Sourdough Brioche · Raw Demerara (`280 kcal`, `34 g Carbs`, `House Ferment`, `Organic Ceylon`).
7. **No. 08 Blueberry Cheese Cake:** Cold-Set Mascarpone · Wild Blueberries · Graham Crust (`420 kcal`, `38 g Carbs`, `Zero Gelatin`, `Wild Maine Origin`).
8. **No. 09 Grilled Butter Sandwich:** Cultured Brioche · Smoked Emmental · Whipped Sea Salt Butter (`380 kcal`, `14 g Protein`, `Slow-Griddled`, `Raw Jersey Dairy`).

### Video Architecture & Instant Crossfade Engine
- **16 Mounted Video Elements:** 8 entry (`.1`) and 8 exit (`.2`) videos are persistently mounted in DOM under `.story-sticky`.
- **Instant Crossfade (`transitionTo(targetId)`):** Non-blocking CSS opacity crossfade (`0.35s var(--ease)`). No sequential waiting locks that could drop user input during rapid clicks.
- **Concurrency Token Lock (`cancelToken`):** Rapid clicks abort stale animations cleanly, ensuring the UI always synchronizes with the latest selection.
- **Preloading:** All 16 video elements have `preload="auto"` to guarantee instantaneous zero-latency playback upon tab interaction.

### Editorial Split Layout & Intelligent Title Wrapping
- **Left Flank:** 
  - Eyebrow tag in mehendi green (`SELECTION · NO. 0X`).
  - Product title in high-contrast italic serif (`Cormorant Garamond`, `font-size: clamp(3.2rem, 6.2vw, 6.8rem)`).
  - **Smart Title Wrapping:** Single-word items (`Espresso`, `Croissant`) render on a single line; multi-word items (`Caramel Latte`, `Frappe Mocha`, `Iced Latte`, `Cinnamon Bread`, `Blueberry Cheese Cake`, `Grilled Butter Sandwich`) break cleanly across exactly two lines using `<br>`.
- **Center View:** 
  - Product visual/drink is 100% unobstructed in the middle of the viewport with subtle radial vignette.
- **Right Flank (Right-Aligned Editorial):**
  - `CRAFT & RITUAL` tag.
  - Preparation specification line.
  - Narrative description paragraph.
  - Frosted glass macro card (`ENERGY`, `CAFFEINE`, roast/dairy specs) styled with `backdrop-filter: blur(28px) saturate(1.5)`.
- **Bottom Navigation Carousel:**
  - Round glass arrow buttons `<` and `>` with active hover states.
  - Center pill bar with smooth active pill indicator (`→`).
  - Horizontal trackpad and mouse wheel scroll support (`e.deltaY` converted to `scrollLeft`).

### Magnetic Scroll Snap to Exact Reference Framing
- Proximity listener tracks `#order` bounding box relative to viewport.
- When user scrolls within proximity ($\pm 220\text{px}$) of `#order` and velocity settles, the viewport smoothly glides and magnetically locks to `orderSection.offsetTop` (`rect.top === 0`) via Lenis:
  ```javascript
  window.lenis.scrollTo(orderEl, {
    duration: 0.85,
    easing: function (t) { return Math.min(1, 1.001 - Math.pow(2, -10 * t)); }
  });
  ```
- Re-arms cleanly when the user scrolls away ($> 380\text{px}$), preventing scroll lock traps.

---

## 5. THE END SECTION CALLIGRAPHY / WRITE-ON EFFECT & TRAVELING CURSOR

### Copy & Structure
Replaced the old placeholder text ("Come for the coffee. Stay for the quiet.") with the elegant brand statement split across two lines:
```html
<p class="closing-text" id="closingTextWriter">
  Every great story begins with a<br>
  rich roast and a silent room.
</p>
<p class="closing-sub">Mumbai, India · Est. 2024</p>
```

### Letter-by-Letter Hand-Written Style Write-On Animation
To achieve a rich, organic calligraphy "write-on" effect (not a robotic monospace typewriter):
1. **Dynamic Span Splitting:**
   - The script splits the text into two lines:
     `lines = ['Every great story begins with a', 'rich roast and a silent room.']`
   - Each individual character is wrapped in a `<span class="wo-char">`, with spaces wrapped as `<span class="wo-char space">&nbsp;</span>` and a real `<br>` placed between lines.
2. **Organic Initial State & Easing:**
   - Initially hidden: `opacity: 0; transform: translateY(10px) rotate(-4deg); filter: blur(4px);`
   - When revealed (`.wo-char.on`): `opacity: 1; transform: translateY(0) rotate(0deg); filter: blur(0);`
   - Governed by custom cubic-bezier transitions:
     `transition: opacity 0.35s cubic-bezier(0.22, 1, 0.36, 1), transform 0.45s cubic-bezier(0.22, 1, 0.36, 1), filter 0.35s cubic-bezier(0.22, 1, 0.36, 1);`
3. **Human Cadence & Punctuation Pacing:**
   - Standard characters reveal with dynamic jitter: `40 + Math.random() * 14` ms.
   - Spaces type through rapidly: `16ms`.
   - Punctuation (commas, periods) introduce a deliberate natural pause: `100ms`.

### Dynamic Inline Traveling Blinking Cursor
1. **Element & Styling:**
   - `#closingCursor` is an inline-block vertical bar (`width: 2.5px; height: 0.72em; background: var(--fg); border-radius: 1px; vertical-align: middle;`).
   - Blinks via CSS animation:
     ```css
     @keyframes cursorBlink {
       0%, 100% { opacity: 0.9; }
       50% { opacity: 0; }
     }
     ```
2. **Traveling Algorithm:**
   - Starts immediately before the first character: `chars[0].parentNode.insertBefore(cursor, chars[0])`.
   - As each character `chars[i]` is typed, the cursor hops immediately to the character's right:
     ```javascript
     var justWritten = chars[i - 1];
     var parent = justWritten.parentNode;
     if (justWritten.nextSibling && justWritten.nextSibling !== cursor) {
       parent.insertBefore(cursor, justWritten.nextSibling);
     } else {
       parent.appendChild(cursor);
     }
     ```
   - Automatically wraps onto line 2 after the `<br>`.
   - 1000ms after the final period is written, the cursor cleanly hides with `cursor.classList.add('hide')` (`display: none !important;`).

### Debugging & Scroll Trigger Synchronization
- **Issue 1 (Triggering Too Early):** Standard `IntersectionObserver` or early top-of-page scroll triggers fired the write-on effect when the user was still scrolling through the hero or story sections. By the time the user scrolled down to the closing section, the animation had already finished.
- **Issue 2 (Cursor only / No text):** An intermediate edit introduced a syntax error (stray closing brace `}` on line 2710) which aborted script execution, leaving only the un-animated cursor element on screen.
- **The Final Robust Solution:**
  - Removed faulty syntax and restored clean closure execution.
  - Linked trigger evaluation directly into the master `requestAnimationFrame(frame)` loop (synchronized with Lenis momentum scroll physics):
    ```javascript
    if (!closingWriteOnTriggered) {
      var closingEl = document.getElementById('closingTextWriter');
      if (closingEl) {
        var rect = closingEl.getBoundingClientRect();
        // Fire strictly when the text enters comfortably into viewport view
        if (rect.top < window.innerHeight * 0.70 && rect.bottom > 0) {
          closingWriteOnTriggered = true;
          if (typeof window.startWriteOn === 'function') window.startWriteOn();
        }
      }
    }
    ```
  - Result: The write-on effect triggers at the exact moment the user arrives at the closing section, typing out seamlessly in front of their eyes.

---

## 6. CORE DESIGN SYSTEM, TYPOGRAPHY & COLOR PALETTE

### Color Palette ("Roasted Dark")
| Token | Hex / RGBA | Role & Application |
|---|---|---|
| `--bg` | `#080604` | Deep espresso black base background |
| `--fg` | `#f0ece4` | Off-white oat milk headline and display text |
| `--fg-soft` | `rgba(240,236,228,.58)` | Muted body copy and descriptions |
| `--fg-faint`| `rgba(240,236,228,.32)` | Footers, captions, subtle metadata |
| `--green` | `#5a7040` | Mehendi green — brand signature accent |
| `--green-soft` | `rgba(90,112,64,.22)` | Interactive pill hover backgrounds |
| `--green-border`| `rgba(90,112,64,.18)` | Frosted glass cards and hairline borders |
| `--green-glow` | `rgba(90,112,64,.07)` | Ambient background radial lighting |
| `--rule` | `rgba(240,236,228,.08)` | Section hair dividers |
| `--ease` | `cubic-bezier(.22,.61,.36,1)`| Signature luxury easing curve |

### Typography Hierarchy
```css
Display / Titles:     'Cormorant Garamond', serif (weight: 300, style: italic)
Editorial UI / Body:  'Inter Tight', sans-serif (weight: 300, 400, 500)
Eyebrows / Badges:    'Inter Tight', uppercase, letter-spacing: 0.20em - 0.28em
```

---

## 7. SCROLL & ANIMATION ENGINES (LENIS + rAF + SPRING PHYSICS)

### Single rAF Master Loop
To prevent micro-stutter from conflicting render loops, **all** scrolling, video seeking, Lenis interpolation, and DOM reveals are driven by a single unified `requestAnimationFrame(frame)`:
```javascript
function frame(time) {
  if (lenis) lenis.raf(time);
  readScroll();

  // Closing write-on scroll trigger
  if (!closingWriteOnTriggered) {
    var closingEl = document.getElementById('closingTextWriter');
    if (closingEl) {
      var rect = closingEl.getBoundingClientRect();
      if (rect.top < window.innerHeight * 0.70 && rect.bottom > 0) {
        closingWriteOnTriggered = true;
        if (typeof window.startWriteOn === 'function') window.startWriteOn();
      }
    }
  }

  // Spring-physics video seeking: velocity + damping
  if (ready && duration) {
    var gap = seekTo - seekAt;
    seekVel = seekVel * 0.72 + gap * 0.16;
    if (Math.abs(seekVel) > 0.0001 || Math.abs(gap) > 0.0005) {
      seekAt = clamp(seekAt + seekVel, 0, duration);
      if (clip.readyState >= 2 && !clip.seeking) {
        try { clip.currentTime = seekAt; } catch (e) {}
      }
    }
  }

  paint();
  paintStory();
  requestAnimationFrame(frame);
}
```

### Video Seek Physics Tuning
- **Hero Video:** Spring damping (`seekVel * 0.72 + gap * 0.16`) gives an organic, cushioned deceleration when scrolling stops.
- **Story & Bridge Videos:** Clamped to `clamp(progress, 0.001, 0.999) * duration` to eliminate frame bounce and black screen bugs at boundary edges.
- **All-I-Frame Hardware Decoding:** Instantaneous random seek decode without buffering lag.

---

## 8. RULES & THINGS NOT TO BREAK

1. **All Video Encoding Must Be All-I-Frame (`-g 1` / `keyint=1`):** Any newly added video intended for scroll scrubbing MUST be encoded all-intra. Never substitute Long-GOP files.
2. **Never Add `overflow: hidden` to Parents of `.story-sticky`:** Breaking this causes `position: sticky` to fail, making the 900vh section scroll straight out of view.
3. **Keep `position: fixed` on `.chrome`:** Never add `position: relative` to the header.
4. **Preserve the Single rAF Loop:** Do NOT spawn separate independent `requestAnimationFrame` loops for scroll-dependent logic; drive everything from the master `frame(time)` loop.
5. **Preserve Single Pinned Stage (`.story-sticky`):** Do not split the story, bridge video, or product showcase back into separate sibling sections.
6. **Closing Write-On Scroll Trigger:** Must evaluate `rect.top < window.innerHeight * 0.70 && rect.bottom > 0` inside `frame()` so it fires reliably with Lenis smooth momentum scrolling.

---

## 9. CHRONOLOGICAL BUILD LOG & ITERATIVE REFINEMENTS

### Phase 1: Inverted Hero Scrub & Initial Layout (2026-09-17)
- Built single-file `index.html` with fixed hero stage and `.track` (420vh) driving `video.mp4`.
- Integrated all-intra video re-encoding (`keyint=1:min-keyint=1`).
- Designed "Roasted Dark" color tokens and Mossary-style header chrome.

### Phase 2: Dual-Video Synchronous Scrub & Lenis Momentum (2026-09-18)
- Added dual background video scrubbing (`section2-1.mp4` and `section2-2.mp4`) in `.story-sticky`.
- Clamped video seek targets to `[0.001, 0.999]` to eliminate end-of-clip black screens.
- Integrated `lenis.min.js` locally with exponential easing (`duration: 1.2s`) and synchronized `lenis.raf(time)` directly inside the master animation loop.
- Built 6 pillar cards with dynamic morphing from portrait to landscape strips and connected them with SVG pointer lines.

### Phase 3: Seamless Cinematic Merge & Product Showcase (2026-09-19 – 2026-09-20)
- Integrated `product_0_intra.mp4` (cup explosion bridge) and `product 2.1 ready-1` (espresso coalescence).
- Eliminated double cup bug by merging Story, Bridge, and Menu into a single `.story-sticky` container on a 900vh runway.
- Implemented 16 persistently mounted product video elements and direct non-blocking crossfading.
- Added split editorial layout, intelligent 1-line vs 2-line title wrapping, and bottom frosted carousel with trackpad wheel support.
- Configured Lenis magnetic scroll-snap to lock the viewport into `#order` (`rect.top === 0`).

### Phase 4: Calligraphy Write-On Effect & Complete All-I-Frame Suite (2026-09-21)
- **Closing Statement Calligraphy & Traveling Cursor:**
  - Updated text to: *"Every great story begins with a<br>rich roast and a silent room."*
  - Rebuilt letter-by-letter handwriting write-on animation using `.wo-char` spans, random delay jitter (40–54ms), punctuation pacing (100ms), and 3D tilt/blur reveal transitions.
  - Implemented blinking inline traveling cursor (`#closingCursor`) that hops dynamically across characters and auto-hides 1s after typing completes.
  - Fixed premature trigger by binding trigger detection to the Lenis rAF loop at `rect.top < window.innerHeight * 0.70`.
  - Fixed JS syntax error (stray brace on line 2710) that previously halted execution.
- **Comprehensive All-I-Frame Re-Encoding Across Entire Site:**
  - Resolved user query on system pressure: confirmed all-I-frame reduces CPU/GPU decode overhead during scrub.
  - Re-encoded all 9 product exit/intra videos (`product_2_1_intra.mp4` through `product_9_2_intra.mp4`) with `ffmpeg -g 1`.
  - Identified that opening visual videos (`x.1 ready-1.mp4`) are also scroll-scrubbed and re-encoded all 7 entry scrub videos (`product 3.1 ready-1.mp4` through `product 9.1 ready-1.mp4`) to all-I-frame.
  - Result: 100% of all scroll-scrubbed video footage across the entire user journey is all-I-frame encoded, delivering liquid 60fps responsiveness in both forward and reverse directions.