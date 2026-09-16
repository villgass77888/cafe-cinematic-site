# Aura Roastery — Cinematic Site Walkthrough

## What Was Built

A single `index.html` file — **zero dependencies, no build step, no React, no GSAP** — that delivers a fully cinematic, scroll-scrubbed video experience for a cafe. Built by studying and adapting the reference prompt's architecture.

---

## The Technique (How It Works)

- **The page does not scroll.** A `<div class="track" style="height:700vh">` is the only element that creates scroll length.
- **Everything is `position:fixed`** — the video, header, all 5 text panels, the footer.
- A `requestAnimationFrame` loop converts `scrollY / maxScroll` → `0..1` progress, which simultaneously drives:
  - `video.currentTime` (lerped with 0.115 factor for smooth cinematic easing)
  - Each panel's `opacity` + `translateY` (via a cue table with deliberate dead zones between panels)
  - The gold scroll progress bar at the very top
- The video is **fetched as a full Blob first** before scrubbing begins — this is what makes seeking instant rather than choppy.
- The video was **re-encoded with ffmpeg `keyint=1`** (all-intra) — every frame is a keyframe, enabling O(1) random access.

---

## Screenshots

````carousel
![Hero Section — "Coffee is a ceremony."](file:///C:/Users/shubh/.gemini/antigravity-ide/brain/2f82bdc2-5d60-4c43-82fb-bad1af03e4cb/hero_section.png)
<!-- slide -->
![Contact Panel — "The door is always open."](file:///C:/Users/shubh/.gemini/antigravity-ide/brain/2f82bdc2-5d60-4c43-82fb-bad1af03e4cb/contact_panel.png)
````

---

## Scroll Journey Recording

![Full scroll demo of Aura Roastery](file:///C:/Users/shubh/.gemini/antigravity-ide/brain/2f82bdc2-5d60-4c43-82fb-bad1af03e4cb/aura_cafe_scroll_demo_1789585048191.webp)

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

> [!IMPORTANT]
> **To swap in your own videos:** Replace `video.mp4` in the `aura-cafe/` folder with your new clip. If it wasn't encoded all-intra, run: `ffmpeg -i yourclip.mp4 -c:v libx264 -x264-params "keyint=1:min-keyint=1" -crf 20 -an video.mp4 -y`
