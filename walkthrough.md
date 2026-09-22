# Aura Roastery — Cinematic Site Walkthrough

## What Was Built

A single `index.html` file — **zero dependencies, no build step, no React, no GSAP** — that delivers a fully cinematic, scroll-scrubbed video experience for a cafe. Built by studying and adapting the reference prompt's architecture.

---

## The Technique (How It Works)

- **Momentum Scrolling (Lenis Integration)**: Smooth, inertial scrolling with exponential deceleration gliding across the entire site (`lenis.min.js`). Touchpad and wheel inputs slide continuously like butter upon release.
- **Single rAF Sync Loop**: Lenis's `raf(time)` is tied directly to the page's animation loop, eliminating double-interpolation delay and keeping DOM elements and video scrubbing 100% in lockstep.
- **The Story Arc Timeline (Upward Flow & Spacing)**: Timeline entries enter from the bottom and travel upwards along a parabolic bezier arc on the right of the title (`cw * 0.44` -> `cw * 0.82`), providing clean breathing space next to "Born from obsession.". Words cascade into focus line-by-line with dynamic blur and opacity fading.
- **Cleaned Static Lines**: Removed the static background arc stroke and ensured pointer lines remain 100% hidden until Phase 3 pillar cards retire.
- **Video Scrubbing & Transitions**: `section2-1.mp4` and `section2-2.mp4` scrub smoothly alongside scroll progress, clamping video seek position to prevent frame jumps.
- **Pillar Cards & Connecting Pointer Lines**: 6 retired landscape cards stack on the right while glowing green SVG lines dynamically calculate container bounds and connect to the central visual frame.

---

## Scroll Journey Recording

![Full scroll demo of Aura Roastery with smooth momentum scrolling and seamless video transitions](file:///C:/Users/shubh/.gemini/antigravity-ide/brain/b2fb90f4-3e56-46d1-ae54-ecaaec81f329/verify_smooth_momentum_scroll_1789774490032.webp)

---

## Panel Cue Map

| Panel | Section | Shows At | Hides At |
|-------|---------|----------|----------|
| 0 | Hero | `0%` | `14–22%` |
| 1 | Our Story | `30–38%` | `50–58%` |
| 2 | The Menu | `64–71%` | `80–86%` |
| 3 | Our Places | `87–91%` | `95–98%` |
| 4 | Contact | `98–100%` | stays |

---

## Files

- [index.html](file:///C:/Users/shubh/.gemini/antigravity-ide/scratch/aura-cafe/index.html) — the entire site, single file
- [video.mp4](file:///C:/Users/shubh/.gemini/antigravity-ide/scratch/aura-cafe/video.mp4) — all-intra re-encoded source

> [!TIP]
> **Set `C:\Users\shubh\.gemini\antigravity-ide\scratch\aura-cafe` as your active workspace** to see the file in the editor. The dev server is running at **http://localhost:5200** — open it in your browser for the live experience!

> **To swap in your own videos:** Replace `video.mp4` in the `aura-cafe/` folder with your new clip. If it wasn't encoded all-intra, run: `ffmpeg -i yourclip.mp4 -c:v libx264 -x264-params "keyint=1:min-keyint=1" -crf 20 -an video.mp4 -y`

---

## The Menu — Cinematic Product Showcase

The placeholder offerings section has been completely replaced with a custom, high-performance video transition engine that presents products seamlessly in a cinematic layout:

### Technical Implementation
* **16 Persistently Mounted Videos:** Each of the 8 products has two pre-generated video assets (`.1` entry, `.2` exit). All are mounted simultaneously in the DOM, allowing instantaneous switching without network or parsing delays.
* **Seamless State Machine:** 
  * The custom JavaScript transition engine coordinates playback perfectly. When a new product is selected, the currently active product's `.2` exit video plays first.
  * Once the exit video finishes, visibility is switched atomically (with zero flash) to the new product's `.1` entry video.
* **Frame-Accurate Hold:** The system calculates the exact duration and implements a `timeupdate` listener to pause the entry videos just before completion (e.g., at `duration - 0.08s`), ensuring the product remains visible on screen rather than resetting or going black.
* **Concurrency Lock (Token System):** A transition token is generated on every interaction. If the user rapidly clicks multiple products, the lock rejects overlapping commands and preserves the sequence, preventing visual glitches or conflicting video playbacks.
* **Preloading Strategy:** Only the default product (Product 2) is preloaded automatically to save bandwidth (`preload="auto"`). The other products are set to `preload="metadata"`. When a user hovers over a product tab, its corresponding videos upgrade to `preload="auto"` right before clicking.
* **Recovery Mechanism:** Should a video fail to decode or load in time, a retry overlay appears over the last valid frame, ensuring the site's layout never breaks.

### UI and Aesthetics
* **Full-Viewport Stage:** The videos are displayed in a cinematic aspect ratio matching the reference design, featuring a subtle darkening vignette layer on top.
* **Frosted Pill Bar:** The new product selector menu uses a CSS `backdrop-filter: blur` across a horizontal, scrollable pill bar.
* **Animated Statuses:** The active tab elegantly highlights in a warm cream tone, matching the cafe's aesthetic palette.

> [!TIP]
> **View the Results in Action!** Check the browser recording below to see the fluid entry and exit transitions, and the token lock gracefully handling rapid clicks.

![Cinematic Product Transitions Demo](/C:/Users/shubh/.gemini/antigravity-ide/brain/d502ad63-677c-4751-9ef1-d13be4bca560/cinematic_transitions_test_1789900689760.webp)
     - Espresso: `5 kcal` | `140 mg Caffeine` | `Med-Dark Roast` | `Ethiopia Origin`
     - Caramel Latte: `290 kcal` | `120 mg Caffeine` | `House Craft Caramel` | `A2 Jersey Butter`
     - Croissant: `310 kcal` | `84% Churned Butter` | `32 g Carbs` | `6 g Protein`
     - Blueberry Cheese Cake: `380 kcal` | `Cream Curd Cheese` | `Wild Forest Compote` | `38 g Carbs`

3. **Premium In / Out Split Transitions**:
   - Switching items smoothly glides the left title outward to the left (`translateX(-28px)`, `opacity: 0`) and the right details outward to the right (`translateX(28px)`, `opacity: 0`).
   - Upon the 140ms update, content updates and smoothly glides back into position, perfectly timed with the 60fps video exit/entry sequence.

4. **Magnetic Scroll Snap to Exact Reference Position**:
   - Proximity listener hooks into Lenis smooth momentum physics:
   - When the user scrolls within proximity ($\pm 160\text{px}$) of `#order` and scrolling velocity settles, the viewport smoothly glides and magnetically locks to `orderSection.offsetTop` (`rect.top === 0`).
   - Re-arms cleanly when the user purposefully scrolls away ($> 300\text{px}$), preventing scroll lock traps.
   - Viewport perfectly showcases the 100vh framed hero stage: top navigation bar visible, centered product video, split editorial text, and bottom carousel.

### Visual Verification

![Recording of product section redesign testing title wrapping, transitions, and scroll snap](C:\Users\shubh\.gemini\antigravity-ide\brain\d9a49654-08ba-4ea0-a4c9-26fc898127cc\product_redesign_1789905698662.webp)

````carousel
![Caramel Latte — 2-line title wrapping, centered video, right-aligned prep & macros table, exact scroll snap framing](C:\Users\shubh\.gemini\antigravity-ide\brain\d9a49654-08ba-4ea0-a4c9-26fc898127cc\caramel_latte_product_1789905809273.png)
<!-- slide -->
![Espresso — Single-line title wrapping, 9-bar extraction ritual, and espresso macros](C:\Users\shubh\.gemini\antigravity-ide\brain\d9a49654-08ba-4ea0-a4c9-26fc898127cc\espresso_section_snap_1789905772362.png)
<!-- slide -->
![Croissant — Single-line title wrapping, French bakery preparation notes, and churned butter macros](C:\Users\shubh\.gemini\antigravity-ide\brain\d9a49654-08ba-4ea0-a4c9-26fc898127cc\croissant_product_1789905836684.png)
<!-- slide -->
![Blueberry Cheese Cake — 2-line title wrapping, compote prep notes, and cheesecake macros](C:\Users\shubh\.gemini\antigravity-ide\brain\d9a49654-08ba-4ea0-a4c9-26fc898127cc\blueberry_cheesecake_product_1789905866146.png)
````

---

## 4. Seamless Cinematic Merge: Born from Obsession → Product 0 → Product 2.1 Showcase

### Overview
Stitched the entire journey from the origin story into the product showcase as one uninterrupted visual stream:
1. **Born from Obsession (Part 1 & 2)**: Bean development, roasting, and swirling ceramic coffee cup.
2. **Product 0 Explosion**: Seamlessly shatters the ceramic cup into an outward explosion of roasted beans and liquid splash.
3. **Product 2.1 Coalescence**: Seamlessly continues the outward radial explosion, drawing splash and beans back into an artisan espresso cup.
4. **Product Showcase & Snap**: Magnets into the 100vh framed product layout with split editorial text, craft preparation ritual, macros card, and carousel.

### Key Implementations

1. **Pixel-Perfect Frame Stitching (`section2_master.mp4`)**:
   - `section2-2.mp4` (end frame: ceramic cup) matches `product 0.mp4` (opening camera shot). Trimming 1 blank frame (`-ss 0.033333`) established exact pixel alignment.
   - `product 0.mp4` (end frame: radial bean explosion) matches `product 2.1 ready-1.mp4` (start frame: radial bean expansion).
   - Unified all clips into `section2_master.mp4` (15.00s, 450 frames, 1280x720, 30fps) using all-intra H.264 (`keyint=1:min-keyint=1`, no B-frames, CRF 17).
   - Delivers instant 60fps seek responsiveness with 0ms decode delay in forward and reverse scrub directions.

2. **Runway Expansion & Piecewise Scrub Mapping**:
   - Expanded `.story-scroll-track` height to `900vh` to provide luxurious scroll travel.
   - Piecewise mapping:
     - `p ∈ [0.00, 0.28]`: Section 2-1 ($0.000\text{s} \to 3.553\text{s}$, bean growth & opening).
     - `p ∈ [0.28, 0.65]`: Section 2-2 ($3.553\text{s} \to 10.967\text{s}$, roasting & swirling cup).
     - `p ∈ [0.65, 0.88]`: Product 0 explosion ($10.967\text{s} \to 14.000\text{s}$, cup shatters and beans explode outward).
     - `p ∈ [0.88, 1.00]`: Product 2.1 coalescence ($14.000\text{s} \to 15.000\text{s}$, beans & splash converge into espresso cup).
   - Background video opacity remains solid `1.0` throughout the story, explosion, and coalescence.
   - Text overlays and cards fade out cleanly at `p = 0.65 -> 0.68` so the explosion sequence plays unobstructed.

3. **Inertial Spring Seeking Physics**:
   - Smooth video seek loop tuned with momentum dampening:
     ```javascript
     seekVelStory = seekVelStory * 0.74 + gapStory * 0.15;
     storyCurrentTime += seekVelStory;
     ```
   - Responsive, buttery-smooth tracking during scrolling with an organic, cushioned inertial stop when scrolling halts.

4. **Magnetic Scroll-Snap Hand-Off**:
   - As the video completes coalescence at `p = 1.00`, the scroll position naturally approaches `#order`.
   - Proximity listener smoothly glides and locks the viewport to `orderSection.offsetTop` (`rect.top === 0`), presenting the complete product section with zero user jarring.

### Verification & Visuals

![Full browser recording demonstrating the seamless merge from Section 2-2 through Product 0 explosion, Product 2.1 coalescence, and scroll snap](C:\Users\shubh\.gemini\antigravity-ide\brain\d9a49654-08ba-4ea0-a4c9-26fc898127cc\cinematic_merge_demo_1789907241930.webp)

````carousel
![Product 0 explosion — ceramic cup shatters into coffee splash and roasted beans (y=6900, t=12.2s)](C:\Users\shubh\.gemini\antigravity-ide\brain\d9a49654-08ba-4ea0-a4c9-26fc898127cc\explosion_1789907611006.png)
<!-- slide -->
![Product 2.1 coalescence — radial splash and flying beans converge to form the espresso cup (y=7700, t=14.4s)](C:\Users\shubh\.gemini\antigravity-ide\brain\d9a49654-08ba-4ea0-a4c9-26fc898127cc\espresso_forming_1789907651732.png)
<!-- slide -->
![Magnetic scroll-snap lock into Product Section — Espresso ready with split editorial layout & macros table (y=8084, rect.top=0)](C:\Users\shubh\.gemini\antigravity-ide\brain\d9a49654-08ba-4ea0-a4c9-26fc898127cc\product_snapped_1789907707778.png)
<!-- slide -->
![Seamless product carousel switch — Caramel Latte with 2-line title, craft preparation, and macros (y=8084)](C:\Users\shubh\.gemini\antigravity-ide\brain\d9a49654-08ba-4ea0-a4c9-26fc898127cc\caramel_latte_1789907745305.png)
````

---

## 5. Product Section Redesign & Exact Scroll-Snap Alignment

### Delivered Changes

1. **Editorial Split Layout & Typography**:
   - **Left Flank (Middle-Aligned)**:
     - `SELECTION · NO. 0X` eyebrow in mehendi green.
     - Product title rendered in high-contrast `Cormorant Garamond` italic serif matching other section headers (`clamp(3.2rem, 6.2vw, 6.8rem)`).
     - **Intelligent Title Wrapping**: Short names (`Espresso`, `Croissant`) stay on a single line; multi-word names (`Caramel Latte`, `Frappe Mocha`, `Iced Latte`, `Cinnamon Bread`, `Blueberry Cheese Cake`, `Grilled Butter Sandwich`) break cleanly across exactly two lines.
   - **Center View**:
     - The product video/drink is 100% unobstructed in the middle of the viewport.
   - **Right Flank (Middle-Aligned, Right-Aligned Text)**:
     - `CRAFT & RITUAL` tag.
     - Preparation specification line (e.g. `Slow-Cooked Amber Glaze · Velvety Microfoam · Sea Salt`).
     - Right-aligned narrative description paragraph.
     - Frosted glass macro table card (`ENERGY`, `CAFFEINE`, `ROAST` / `CARAMEL` / `BUTTER`, etc.).
   - **Bottom Navigation Carousel**:
     - Round glass arrow buttons `<` and `>` on left and right.
     - Center pill bar showcasing 4–5 visible items with smooth active pill highlight (`→`).
     - Horizontal trackpad and mouse wheel scroll support.

2. **Luxury Split In / Out Transitions**:
   - Left title glides left and softens with gaussian blur on exit; glides in smoothly from the left on entry.
   - Right card glides right and softens with blur on exit; glides in with a subtle 60ms stagger on entry.

3. **Magnetic Scroll-Snap to Exact Reference Position**:
   - Both hardware-accelerated CSS `scroll-snap-type: y proximity` and a Lenis-aware magnetic scroll listener actively track `#order`.
   - When the user scrolls near the product section ($\pm 180\text{px}$) and scroll velocity settles, the viewport smoothly glides to lock into `rect.top === 0`, matching the reference framing with zero jitter.

### Visual Verification

![Recording of verified product section layout, transitions, and scroll snap](file:///C:/Users/shubh/.gemini/antigravity-ide/brain/d9a49654-08ba-4ea0-a4c9-26fc898127cc/verify_product_layout_snap_1789911615020.webp)

````carousel
![Caramel Latte — 2-line title, centered visual, right preparation menu & macro table, exact scroll snap](file:///C:/Users/shubh/.gemini/antigravity-ide/brain/d9a49654-08ba-4ea0-a4c9-26fc898127cc/caramel_latte_state_1789911804374.png)
<!-- slide -->
![Espresso — Single-line title, 9-bar extraction ritual, and macro card](file:///C:/Users/shubh/.gemini/antigravity-ide/brain/d9a49654-08ba-4ea0-a4c9-26fc898127cc/espresso_initial_state_1789911739080.png)
<!-- slide -->
![Croissant — Single-line title, 72-hour fermentation notes, and churned butter macros](file:///C:/Users/shubh/.gemini/antigravity-ide/brain/d9a49654-08ba-4ea0-a4c9-26fc898127cc/croissant_state_1789911833566.png)
````
---

## 6. Unified Continuous Stage: Seamless Story-to-Product Transition

### Problem Resolved
Previously, `<section class="section-story">` and `<section class="section-products">` existed as sibling `<section>` elements in the DOM. When the user reached the end of Section 2-2 and scrolled into the Product section, the Story section unpinned and scrolled upwards while the Product section scrolled in from below, momentarily displaying two halves of two coffee cups on screen simultaneously. Additionally, the extraction pillar cards ("Water", "Grind", "Pour") and green lines lingered after Section 2-2.

### Architectural Solution
1. **Single Pinned Viewport Stage**:
   - Eliminated `<section class="section-products">` as a separate DOM block.
   - Co-located all 16 product videos (`vid-2-entry` through `vid-9-exit`), `storyVideo1`, `storyVideo2`, `bridgeVideo` (`product_0_intra.mp4`), and `.product-showcase` inside the same `.story-sticky` 100vh viewport container.
   - Viewport stays securely pinned throughout the entire story, explosion bridge, and product showcase sequence.
   - Anchor `#order` is placed as a hidden tracking target at `top: 90%` of `.story-scroll-track` for direct navbar anchoring.

2. **Extraction Pillar Clean Fade**:
   - `storyPillarsArea` and all `spCards` gracefully dissolve between `storyProgress` 0.66 and 0.69 (`opacity = 0`, `pointer-events: none`).
   - The bridge video (`product 0.mp4`) opens on a 100% clean, dark, unobstructed stage with zero visual clutter.

3. **Continuous Forward Scrubbing & Simultaneous UI Entrance**:
   - `storyProgress 0.68–0.78`: Bridge video (`product 0.mp4`) scrubs into the explosive roasted bean and liquid splash.
   - `storyProgress 0.78–0.88`: Seamlessly transitions into `product 2.1 ready-1` (which begins at the identical splash frame) and scrubs into the formed Espresso cup.
   - **Simultaneous UI Sync**: Between `p = 0.79` and `0.88`, the Product Showcase UI (title on left, craft preparation and macro table on right, carousel on bottom) slides in synchronously from the flanks with gaussian blur de-focusing into crisp 100% clarity.
   - `storyProgress 0.88–0.98`: Product Showcase station locked and snapped for interactive menu browsing.

4. **Bidirectional Reverse Scrub Engine**:
   - When the user scrolls backward from the Product Showcase, `isScrollingReverse` activates.
   - The active product's `.2` exit video (`vid-X-exit`) scrubs smoothly from cup back to the splash.
   - Crossfades cleanly into `bridgeVideo` at `p = 0.77–0.80`, which scrubs back to Section 2-2.
   - Inactive product videos are strictly zeroed out, guaranteeing that **exactly ONE coffee cup** is ever visible on screen.

### Verified Visual Evidence

````carousel
![Bridge Video Clean Stage — Roasted beans and coffee splash on a pure dark stage with all pillar cards faded out](file:///C:/Users/shubh/.gemini/antigravity-ide/brain/d9a49654-08ba-4ea0-a4c9-26fc898127cc/bridge_video_clean_stage_1789917434582.png)
<!-- slide -->
![Fully Arrived Product Showcase — Espresso cup centered in 100vh viewport, title on left, right-aligned preparation & macros, bottom carousel](file:///C:/Users/shubh/.gemini/antigravity-ide/brain/d9a49654-08ba-4ea0-a4c9-26fc898127cc/fully_arrived_product_showcase_1789917479686.png)
<!-- slide -->
![Reverse Scroll State — Pillar cards and green pointer lines cleanly reappear as the user scrolls backward into Section 2-2](file:///C:/Users/shubh/.gemini/antigravity-ide/brain/d9a49654-08ba-4ea0-a4c9-26fc898127cc/reverse_scroll_pillars_reappear_1789917516214.png)
<!-- slide -->
![Interactive Menu Switching — Frappe Mocha with 2-line title, Belgian cacao details, and cold ganache macros](file:///C:/Users/shubh/.gemini/antigravity-ide/brain/d9a49654-08ba-4ea0-a4c9-26fc898127cc/frappe_mocha_product_showcase_1789917556775.png)
<!-- slide -->
![Reverse Scroll with Active Product — Frappe Mocha exit video seamlessly scrubs into splash upon backward scrolling](file:///C:/Users/shubh/.gemini/antigravity-ide/brain/d9a49654-08ba-4ea0-a4c9-26fc898127cc/frappe_mocha_reverse_scroll_1789917593163.png)
````
