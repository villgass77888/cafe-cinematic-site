
    (function () {
      "use strict";

      // ── VIDEO ─────────────────────────────────────────────────────────────────
      // All-intra encoded with ffmpeg (keyint=1:min-keyint=1).
      // Every frame is a keyframe → instant random-access on seek.
      // Served locally at /video.mp4 (copied to project root).
      var VIDEO_URL = "video.mp4";

      // ── REFS ──────────────────────────────────────────────────────────────────
      var clip = document.getElementById("clip");
      var boot = document.getElementById("boot");
      var bootBar = document.getElementById("bootBar");
      var bootPct = document.getElementById("bootPct");
      var meter = document.getElementById("meter");
      var trackEl = document.getElementById("track");
      var fixedFoot = document.getElementById("fixedFoot");
      var scrollHint = document.getElementById("scrollHint");
      var dot = document.getElementById("cursor-dot");
      var ring = document.getElementById("cursor-ring");
      var panels = [].slice.call(document.querySelectorAll("[data-panel]"));

      // Hero slides — driven individually per frame (one at a time on scroll)
      var heroSlides = [
        document.getElementById("heroSlide0"),
        document.getElementById("heroSlide1"),
        document.getElementById("heroSlide2"),
        document.getElementById("heroSlide3")
      ].filter(Boolean);

      // ── CUES ──────────────────────────────────────────────────────────────────
      // Panel cue table: [fadeInStart, fadeInEnd, fadeOutStart, fadeOutEnd]
      // All values in 0..1 trackProgress (0 = top of track, 1 = bottom of track)
      var CUES = [
        [0.00, 0.00, 0.85, 1.00]  // Hero panel: visible from start, exits near track end
      ];

      // Per-slide scroll windows [inStart, inEnd, outStart, outEnd].
      // Each slide enters with a bottom-up rise (translateY).
      var SLIDE_WINDOWS = [
        [0.00, 0.06, 0.16, 0.22],
        [0.20, 0.26, 0.36, 0.42],
        [0.40, 0.46, 0.56, 0.62],
        [0.60, 0.66, 0.76, 0.82]
      ];
      var SLIDE_RISE_PX = 60;  // vertical rise distance in pixels

      var DRIFT = 24;  // px of overall panel parallax (counter-scroll feel)

      // ── HELPERS ───────────────────────────────────────────────────────────────
      function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
      // Smoothstep — feels more cinematic than linear
      function smooth(t) { return t * t * (3 - 2 * t); }
      function ramp(p, a, b) {
        if (b <= a) return p >= b ? 1 : 0;
        return smooth(clamp((p - a) / (b - a), 0, 1));
      }

      // ── STATE ─────────────────────────────────────────────────────────────────
      var trackProgress = 0;  // 0..1 within scroll track (drives video + hero panel)
      var pageProgress = 0;  // 0..1 over full page height (drives scroll meter)
      var seekTo = 0, seekAt = 0, seekVel = 0;
      var duration = 0, ready = false, started = false, attached = false;
      var trackMax = 1;

      // ── STORY SECTION REFS & STATE ───────────────────────────────────────────
      var storyTrackEl = document.getElementById("storyTrack");
      var storyTextArea = document.getElementById("storyTextArea");
      var storyEyebrow = document.getElementById("storyEyebrow");
      var storyTitle = document.getElementById("storyTitle");
      var storyArcSvg = document.getElementById("storyArcSvg");
      var storyArcPath = document.getElementById("storyArcPath");
      var storyArcBgPath = document.getElementById("storyArcBgPath");
      var storyPillarsArea = document.getElementById("storyPillarsArea");
      var storyVideo1 = document.getElementById("storyVideo1");
      var storyVideo2 = document.getElementById("storyVideo2");
      var bridgeVideo = document.getElementById("bridgeVideo");
      var vid2Entry = document.getElementById("vid-2-entry");
      var vid2Exit = document.getElementById("vid-2-exit");
      var productInfoLeft = document.getElementById("productInfoLeft");
      var productInfoRight = document.getElementById("productInfoRight");
      var productCarouselWrap = document.getElementById("productCarouselWrap");
      var productVignette = document.getElementById("productVignette");
      var durationS1 = 0, durationS2 = 0, durationBridge = 0, durationP2E = 0, durationP2X = 0;
      var seekToS1 = 0, seekAtS1 = 0, seekVelS1 = 0;
      var seekToS2 = 0, seekAtS2 = 0, seekVelS2 = 0;
      var seekToBridge = 0, seekAtBridge = 0, seekVelBridge = 0;
      var seekToProd = 0, seekAtProd = 0, seekVelProd = 0;
      var curScrubVideo = null, curScrubDuration = 0;
      var lastStoryProgress = 0;
      var isScrollingReverse = false;
      var storyTl = [
        document.getElementById("storyTl0"),
        document.getElementById("storyTl1"),
        document.getElementById("storyTl2"),
        document.getElementById("storyTl3"),
        document.getElementById("storyTl4")
      ];

      // Split text into words for cascade animation
      function splitTextIntoWords(el) {
        var walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, null, false);
        var nodes = [];
        while (walker.nextNode()) nodes.push(walker.currentNode);

        nodes.forEach(function (node) {
          if (!node.nodeValue.trim()) return;
          var words = node.nodeValue.split(/(\s+)/);
          var fragment = document.createDocumentFragment();
          words.forEach(function (w) {
            if (w.trim() === '') {
              fragment.appendChild(document.createTextNode(w));
            } else {
              var span = document.createElement('span');
              span.className = 'tl-word';
              span.textContent = w;
              fragment.appendChild(span);
            }
          });
          node.parentNode.replaceChild(fragment, node);
        });
      }

      storyTl.forEach(function (entry) {
        if (entry) {
          var inner = entry.querySelector('.tl-inner > div:nth-child(2)');
          if (inner) {
            splitTextIntoWords(inner);
            entry._words = Array.from(inner.querySelectorAll('.tl-word'));
          }
        }
      });

      var spCards = [
        document.getElementById("spCard0"),
        document.getElementById("spCard1"),
        document.getElementById("spCard2"),
        document.getElementById("spCard3"),
        document.getElementById("spCard4"),
        document.getElementById("spCard5")
      ];
      var spDescs = [
        document.getElementById("spDesc0"),
        document.getElementById("spDesc1"),
        document.getElementById("spDesc2"),
        document.getElementById("spDesc3"),
        document.getElementById("spDesc4"),
        document.getElementById("spDesc5")
      ];
      var storyProgress = 0;
      var arcTotalLen = 0;
      var arcP0 = { x: 0, y: 0 }, arcCtrl = { x: 0, y: 0 }, arcP2 = { x: 0, y: 0 };

      // Cached layout values (recalc on resize)
      var storyLayoutW = window.innerWidth;
      var stickyPadX = 100;
      var spActiveW = 340;
      var spActiveH = 460;
      var spRetiredW = 220;
      var spRetiredH = 84;

      function quadBez(p0, p1, p2, t) {
        var u = 1 - t;
        return { x: u * u * p0.x + 2 * u * t * p1.x + t * t * p2.x, y: u * u * p0.y + 2 * u * t * p1.y + t * t * p2.y };
      }

      function cacheStoryLayout() {
        storyLayoutW = window.innerWidth;
        stickyPadX = Math.min(Math.max(24, storyLayoutW * 0.07), 100);
        spActiveW = Math.min(Math.max(280, storyLayoutW * 0.26), 360);
        spActiveH = Math.min(Math.max(380, window.innerHeight * 0.60), 500);
        spRetiredW = Math.min(Math.max(180, storyLayoutW * 0.16), 260);

        // Calculate arc within the story-text-area (60% of viewport)
        if (!storyTextArea) return;
        var cw = storyTextArea.offsetWidth;
        var ch = storyTextArea.offsetHeight;

        // Arc: quadratic bezier — starts bottom, bulges right, ends top (downward to upward flow, shifted right)
        arcP0 = { x: cw * 0.38, y: ch * 0.90 }; // start (bottom)
        arcCtrl = { x: cw * 0.76, y: ch * 0.50 }; // control (right bulge)
        arcP2 = { x: cw * 0.38, y: ch * 0.10 }; // end (top)

        // Update SVG path
        var d = "M " + arcP0.x + " " + arcP0.y + " Q " + arcCtrl.x + " " + arcCtrl.y + " " + arcP2.x + " " + arcP2.y;
        if (storyArcPath) {
          storyArcPath.setAttribute("d", d);
          arcTotalLen = storyArcPath.getTotalLength();
          storyArcPath.style.strokeDasharray = arcTotalLen;
          storyArcPath.style.strokeDashoffset = arcTotalLen;
        }
      }
      cacheStoryLayout();
      window.addEventListener("resize", cacheStoryLayout);

      // ── CURSOR ────────────────────────────────────────────────────────────────
      var mx = 0, my = 0, rx = 0, ry = 0;
      window.addEventListener("mousemove", function (e) { mx = e.clientX; my = e.clientY; });

      // Expand cursor on any hoverable element
      document.querySelectorAll("a, button, .menu-card, .location-card, .form-input, .form-select, .pillar-card").forEach(function (el) {
        el.addEventListener("mouseenter", function () { document.body.classList.add("hovering"); });
        el.addEventListener("mouseleave", function () { document.body.classList.remove("hovering"); });
      });

      // Smooth ring-lag via lerp in its own RAF loop
      (function cursorLoop() {
        rx += (mx - rx) * 0.11;
        ry += (my - ry) * 0.11;
        dot.style.left = mx + "px";
        dot.style.top = my + "px";
        ring.style.left = rx + "px";
        ring.style.top = ry + "px";
        requestAnimationFrame(cursorLoop);
      })();

      // ── LENIS MOMENTUM SMOOTH SCROLL ──────────────────────────────────────────
      var lenis = null;
      if (typeof Lenis !== "undefined") {
        lenis = new Lenis({
          duration: 1.2,
          easing: function (t) { return Math.min(1, 1.001 - Math.pow(2, -10 * t)); },
          orientation: "vertical",
          gestureOrientation: "vertical",
          smoothWheel: true,
          wheelMultiplier: 1.0,
          touchMultiplier: 1.5,
          infinite: false
        });
        lenis.on("scroll", readScroll);
        window.lenis = lenis;
      }

      // Cached product vid refs for paintStory (avoids getElementById on every frame)
      var _vidCache = {};
      function getVidRef(id, type) {
        var k = id + "-" + type;
        if (!_vidCache[k]) _vidCache[k] = document.getElementById("vid-" + id + "-" + type);
        return _vidCache[k];
      }

      // ── READ SCROLL ───────────────────────────────────────────────────────────
      // Computes TWO separate progress values:
      //   trackProgress — 0..1 clamped to the track div height (for video + hero)
      //   pageProgress  — 0..1 over the entire page (for scroll meter)
      function readScroll() {
        var scrollY = lenis ? lenis.scroll : window.pageYOffset;
        var pageMax = document.documentElement.scrollHeight - window.innerHeight;

        // Track max = track height minus viewport (how much we can scroll within track)
        trackMax = (trackEl ? trackEl.offsetHeight - window.innerHeight : window.innerHeight * 3.5);
        if (trackMax < 1) trackMax = 1;

        pageProgress = pageMax > 0 ? clamp(scrollY / pageMax, 0, 1) : 0;
        trackProgress = clamp(scrollY / trackMax, 0, 1);

        if (duration) seekTo = trackProgress * duration;

        // Fade fixed footer out as user crosses into regular sections
        if (fixedFoot) {
          fixedFoot.style.opacity = trackProgress > 0.90 ? "0" : "1";
        }

        // Story section progress (0..1 within its own scroll track)
        // Zones (900vh track):
        //   0.00–0.275: Section 2-1 video
        //   0.275–0.69: Section 2-2 video + story content (phases 1-3)
        //   0.69–0.72: Crossfade S2-2 → bridge
        if (storyTrackEl) {
          var stRect = storyTrackEl.getBoundingClientRect();
          var stMax = storyTrackEl.offsetHeight - window.innerHeight;
          if (stMax < 1) stMax = 1;
          storyProgress = clamp(-stRect.top / stMax, 0, 1);

          isScrollingReverse = (storyProgress < lastStoryProgress - 0.0002);
          lastStoryProgress = storyProgress;

          window.__storyProgress = storyProgress;
          window.__isScrollingReverse = isScrollingReverse;

          // ── MILESTONE-TRIGGERED NATURAL PLAYBACK for story videos ──
          // Story videos are NOT all-keyframe encoded → seeking them causes stutter.
          // Instead, we play them at natural speed when their scroll zone is entered.
          // We only seek to 0 to reset; actual frames advance in real-time at 30fps.

          // Zone 0.00–0.26: storyVideo1
          if (storyProgress >= 0.005 && storyProgress < 0.26) {
            if (storyVideo1 && storyVideo1.paused && durationS1 > 0) {
              storyVideo1.currentTime = 0;
              storyVideo1.play().catch(function() {});
            }
            if (storyVideo2 && !storyVideo2.paused) storyVideo2.pause();
            if (bridgeVideo && !bridgeVideo.paused) bridgeVideo.pause();
          } else if (storyProgress >= 0.26 && storyProgress < 0.67) {
            // Zone 0.26–0.67: storyVideo2
            if (storyVideo1 && !storyVideo1.paused) storyVideo1.pause();
            if (storyVideo2 && storyVideo2.paused && durationS2 > 0) {
              storyVideo2.currentTime = 0;
              storyVideo2.play().catch(function() {});
            }
            if (bridgeVideo && !bridgeVideo.paused) bridgeVideo.pause();
          } else if (storyProgress >= 0.67 && storyProgress < 0.78) {
            // Zone 0.67–0.78: bridge video (product_0_intra is all-keyframe — can be scrubbed)
            if (storyVideo1 && !storyVideo1.paused) storyVideo1.pause();
            if (storyVideo2 && !storyVideo2.paused) storyVideo2.pause();
            if (bridgeVideo && bridgeVideo.paused && durationBridge > 0) {
              bridgeVideo.currentTime = 0;
              bridgeVideo.play().catch(function() {});
            }
          } else if (storyProgress < 0.005) {
            // At top — reset all
            if (storyVideo1 && !storyVideo1.paused) storyVideo1.pause();
            if (storyVideo2 && !storyVideo2.paused) storyVideo2.pause();
            if (bridgeVideo && !bridgeVideo.paused) bridgeVideo.pause();
          }
        }
      }


      // ── PAINT ─────────────────────────────────────────────────────────────────
      // Imperatively drives every animated element from the rAF loop.
      // NO CSS transitions on panel or hero-line elements — this loop owns them.
      function paint() {
        // Scroll meter uses full-page progress
        meter.style.transform = "scaleX(" + pageProgress + ")";

        // Drive the hero panel (single panel)
        for (var i = 0; i < panels.length; i++) {
          var c = CUES[i] || [0, 0, 0.8, 1];
          var el = panels[i];
          var enter = ramp(trackProgress, c[0], c[1]);
          var leave = ramp(trackProgress, c[2], c[3]);
          var pO = enter * (1 - leave);
          var pY = (1 - enter) * DRIFT - leave * DRIFT;
          el.style.opacity = pO;
          el.style.transform = "translate3d(0," + pY + "px,0)";
          el.style.pointerEvents = pO > 0.5 ? "auto" : "none";
        }

        // Drive individual hero slides — one at a time, bottom-up rise
        for (var j = 0; j < heroSlides.length; j++) {
          var sw = SLIDE_WINDOWS[j];
          var sIn = ramp(trackProgress, sw[0], sw[1]);
          var sOut = ramp(trackProgress, sw[2], sw[3]);
          var sO = sIn * (1 - sOut);
          // Rise up as it enters, fall back down as it exits
          var sY = (1 - sIn) * SLIDE_RISE_PX - sOut * SLIDE_RISE_PX * 0.6;
          heroSlides[j].style.opacity = sO;
          heroSlides[j].style.transform = "translateY(" + sY + "px)";
        }

        // Scroll hint fades out after first scroll movement
        if (scrollHint) {
          scrollHint.style.opacity = 1 - ramp(trackProgress, 0, 0.05);
        }

        // Premium fade to blurred black transition for the video background
        // Fades out and blurs the video while moving it upwards as the user scrolls into the next section
        var videoFade = ramp(trackProgress, 0.96, 1.00);
        var videoY = videoFade * -120; // Moves upward by 120px at the end
        clip.style.filter = "contrast(1.04) brightness(" + (0.80 - videoFade * 0.80) + ") blur(" + (videoFade * 24) + "px)";
        clip.style.transform = "translate(-50%, calc(-50% + " + videoY + "px)) scale(1.04)";
      }

      // ── PAINT STORY — scroll-driven cinematic animation ───────────────────────
      function paintStory() {
        var p = storyProgress;

        if (storyVideo1) {
          var op = ramp(p, 0.00, 0.04) * (1 - ramp(p, 0.26, 0.29));
          storyVideo1.style.opacity = op;
        }
        if (storyVideo2) {
          var op = ramp(p, 0.26, 0.29) * (1 - ramp(p, 0.67, 0.70));
          storyVideo2.style.opacity = op;
        }
        if (bridgeVideo) {
          var op = ramp(p, 0.67, 0.70) * (1 - ramp(p, 0.77, 0.80));
          bridgeVideo.style.opacity = op;
        }

        // Product video opacity:
        // – While scrolling in (0.77 ≤ p < 1.0) AND not locked: scroll-scrub controls opacity
        // – Once fully in product section (p ≥ 1.0): click engine owns opacity
        // – During a transition (isLocked): click engine owns opacity entirely
        var activeId = (window.__getActiveProduct ? window.__getActiveProduct() : 2) || 2;
        var isProductLocked = (window.__isProductLocked ? window.__isProductLocked() : false);

        if (p < 1.0 && !isProductLocked) {
          // Scrub zone: zero out all inactive products, drive active via scroll
          var allPids = [2, 3, 4, 5, 6, 7, 8, 9];
          for (var pi = 0; pi < allPids.length; pi++) {
            var pid = allPids[pi];
            if (pid !== activeId) {
              var otherE = getVidRef(pid, "entry");
              var otherX = getVidRef(pid, "exit");
              if (otherE && otherE.style.opacity !== "0") otherE.style.opacity = "0";
              if (otherX && otherX.style.opacity !== "0") otherX.style.opacity = "0";
            }
          }

          var entryVid = getVidRef(activeId, "entry");
          var exitVid  = getVidRef(activeId, "exit");

          if (p >= 0.77) {
            if (isScrollingReverse && p < 0.88) {
              if (exitVid)  exitVid.style.opacity  = ramp(p, 0.77, 0.80);
              if (entryVid) entryVid.style.opacity = 0;
            } else {
              if (entryVid) entryVid.style.opacity = ramp(p, 0.77, 0.80);
              if (exitVid)  exitVid.style.opacity  = 0;
            }
          } else {
            if (entryVid) entryVid.style.opacity = 0;
            if (exitVid)  exitVid.style.opacity  = 0;
          }
        }
        // p >= 1.0 OR isProductLocked: click engine owns product video opacity

        // Synchronous Product UI entrance with scroll (0.79 to 0.88)
        var uiProg = 0;
        if (p >= 0.88) {
          uiProg = 1;
        } else if (p > 0.78) {
          uiProg = ramp(p, 0.79, 0.88);
        }

        if (productInfoLeft) {
          productInfoLeft.style.opacity = uiProg;
          productInfoLeft.style.transform = "translateY(-50%) translateX(" + (-(1 - uiProg) * 44) + "px)";
          productInfoLeft.style.filter = "blur(" + ((1 - uiProg) * 6) + "px)";
          productInfoLeft.style.pointerEvents = uiProg > 0.8 ? "auto" : "none";
        }
        if (productInfoRight) {
          productInfoRight.style.opacity = uiProg;
          productInfoRight.style.transform = "translateY(-50%) translateX(" + ((1 - uiProg) * 44) + "px)";
          productInfoRight.style.filter = "blur(" + ((1 - uiProg) * 6) + "px)";
          productInfoRight.style.pointerEvents = uiProg > 0.8 ? "auto" : "none";
        }
        if (productCarouselWrap) {
          productCarouselWrap.style.opacity = uiProg;
          productCarouselWrap.style.transform = "translateX(-50%) translateY(" + ((1 - uiProg) * 36) + "px)";
          productCarouselWrap.style.pointerEvents = uiProg > 0.8 ? "auto" : "none";
        }
        if (productVignette) {
          productVignette.style.opacity = uiProg;
        }

        // ─── Phase 1: Title + Arc + Timeline entries ───────────────────────
        // Adjusted for 900vh track proportions
        var titleIn = ramp(p, 0.00, 0.04);
        var titleY = (1 - titleIn) * 80;

        // Phase 2: Swipe right and vanish
        var swipe = ramp(p, 0.26, 0.31);
        var swipeX = swipe * 280;
        var swipeO = 1 - swipe;

        // Apply to text container
        storyTextArea.style.transform = "translateX(" + swipeX + "px)";
        storyTextArea.style.opacity = swipeO;

        // Title block
        storyEyebrow.style.opacity = titleIn * swipeO;
        storyTitle.style.opacity = titleIn * swipeO;
        storyEyebrow.style.transform = "translateY(" + titleY + "px)";
        storyTitle.style.transform = "translateY(" + titleY + "px)";

        // Paragraph motion on the arc (t goes 0 -> 1 as they move bottom -> top)
        // Adjusted timeline paragraph motion for 900vh track
        var ts = [
          ramp(p, 0.00, 0.12),
          ramp(p, 0.04, 0.15),
          ramp(p, 0.07, 0.19),
          ramp(p, 0.11, 0.23),
          ramp(p, 0.14, 0.26)
        ];

        // Find exact min and max active t values among visible paragraphs to anchor the glowing arc line perfectly
        var tMin = 1.0, tMax = 0.0, hasActive = false;
        for (var k = 0; k < ts.length; k++) {
          var opCheck = ramp(ts[k], 0.05, 0.25) * (1 - ramp(ts[k], 0.75, 0.95));
          if (opCheck > 0.01) {
            if (ts[k] < tMin) tMin = ts[k];
            if (ts[k] > tMax) tMax = ts[k];
            hasActive = true;
          }
        }
        if (!hasActive) { tMin = 0; tMax = 0; }

        // Dynamic glowing Arc stroke perfectly joining the active dots
        if (storyArcPath && arcTotalLen > 0) {
          var L = (tMax - tMin) * arcTotalLen;
          var O = tMin * arcTotalLen;
          storyArcPath.style.strokeDasharray = L + " " + arcTotalLen;
          storyArcPath.style.strokeDashoffset = -O;
          storyArcPath.style.opacity = (L > 0 ? 0.95 : 0) * swipeO;
        }

        for (var t = 0; t < storyTl.length; t++) {
          if (!storyTl[t]) continue;
          var ti = ts[t];
          var entry = storyTl[t];

          if (ti <= 0 || ti >= 1) {
            entry.style.opacity = 0;
            continue;
          }

          entry.style.opacity = swipeO; // container is visible, words do the fading/blur

          // Fade in early (0.05-0.25), fade out late (0.75-0.95)
          var E = ramp(ti, 0.05, 0.25);
          var X = ramp(ti, 0.75, 0.95);

          var words = entry._words || [];
          var wLen = words.length;
          for (var w = 0; w < wLen; w++) {
            var w_prog = wLen > 1 ? w / (wLen - 1) : 0;

            // Cascading effect: words enter and exit sequentially
            var wordEnter = ramp(E, w_prog * 0.5, w_prog * 0.5 + 0.5);
            var wordExit = ramp(X, w_prog * 0.5, w_prog * 0.5 + 0.5);

            var wOp = wordEnter * (1 - wordExit);
            var wBlur = (1 - wordEnter) * 12 + wordExit * 12;

            words[w].style.opacity = wOp;
            words[w].style.filter = "blur(" + wBlur + "px)";
          }

          // Position on parabolic bezier arc
          var pos = quadBez(arcP0, arcCtrl, arcP2, ti);

          // Focus factor: 1 at dead center (ti = 0.5), 0 near edges (ti <= 0.25 or ti >= 0.75)
          var distFromCenter = Math.abs(ti - 0.5);
          var focusFactor = Math.max(0, 1 - distFromCenter / 0.25);
          focusFactor = Math.sin(focusFactor * Math.PI * 0.5); // Smooth sine ease for focus region

          // Container opacity: unfocused paras have lower opacity (~0.35), focused paras reach 1.0
          var entryOp = swipeO * (0.35 + focusFactor * 0.65);
          entry.style.opacity = entryOp;

          // All paragraphs are kept completely straight (0deg tilt)
          // Scale: unfocused paras are noticeably smaller (0.72) as they enter/exit, scaling to 1.02 when centered in focus
          var scale = 0.72 + focusFactor * 0.30;

          entry.style.filter = "none";
          entry.style.transform = "translate(" + pos.x + "px, " + pos.y + "px) scale(" + scale.toFixed(3) + ")";

          // Active dot pulse & illumination animation
          var dot = entry.querySelector(".tl-dot");
          if (dot) {
            var dotScale = 1 + focusFactor * 0.75;
            var glowBlur1 = Math.round(focusFactor * 14);
            var glowBlur2 = Math.round(focusFactor * 28);
            dot.style.transform = "scale(" + dotScale.toFixed(2) + ")";
            dot.style.boxShadow = focusFactor > 0.05
              ? "0 0 " + glowBlur1 + "px var(--green), 0 0 " + glowBlur2 + "px rgba(163, 201, 104, 0.85)"
              : "0 0 4px rgba(90,112,64,0.4)";
            dot.style.opacity = (0.5 + focusFactor * 0.5).toFixed(2);
          }
        }

        // ─── Phase 3: Pillar boxes ───────────────────────────────────────────
        // Each box: enter from left → active at left → retire to right (shrink)
        // Pillar card timing adjusted for 900vh track
        // All pillar content must finish before bridge zone starts (0.69)
        var SP_ENTER = [
          [0.31, 0.35], // 0
          [0.37, 0.41], // 1
          [0.43, 0.47], // 2
          [0.49, 0.53], // 3
          [0.55, 0.59], // 4
          [0.61, 0.65]  // 5
        ];
        var SP_RETIRE = [
          [0.37, 0.41], // 0 retires when 1 enters
          [0.43, 0.47], // 1 retires when 2 enters
          [0.49, 0.53], // 2 retires when 3 enters
          [0.55, 0.59], // 3 retires when 4 enters
          [0.61, 0.65], // 4 retires when 5 enters
          [0.66, 0.69]  // 5 retires just before bridge
        ];

        if (storyPillarsArea) {
          var pilOp = ramp(p, 0.28, 0.33) * (1 - ramp(p, 0.66, 0.69));
          storyPillarsArea.style.opacity = pilOp;
          storyPillarsArea.style.pointerEvents = pilOp > 0.5 ? "auto" : "none";
        }

        var rightEdgeX = storyLayoutW - stickyPadX - spRetiredW;

        for (var b = 0; b < spCards.length; b++) {
          if (!spCards[b]) continue;
          var enterT = ramp(p, SP_ENTER[b][0], SP_ENTER[b][1]);
          var retireT = ramp(p, SP_RETIRE[b][0], SP_RETIRE[b][1]);

          // Opacity: fade in during enter, retire, then dissolve completely before bridge
          var bO = enterT * (1 - ramp(p, 0.66, 0.69));
          if (bO < 0.001) {
            spCards[b].style.opacity = 0;
            spCards[b].style.transform = "translateY(-50%) translateX(-110%)";
            var pLine = document.getElementById('ptrLine' + b);
            if (pLine) pLine.style.opacity = 0;
            continue;
          }

          // Position interpolation
          var activeX = stickyPadX;

          // X: active position → right edge
          var bX = activeX + retireT * (rightEdgeX - activeX);
          // Width & Height: active (portrait) → retired (landscape strip)
          var bW = spActiveW + retireT * (spRetiredW - spActiveW);
          var bH = spActiveH + retireT * (spRetiredH - spActiveH);

          // Padding shrinks
          var bPad = 32 + retireT * (10 - 32);
          // Gap shrinks
          var bGap = 14 + retireT * (4 - 14);

          // Enter from left: slide in
          var enterX = activeX - (1 - enterT) * (spActiveW + 80);
          if (retireT < 0.01) bX = enterX;

          // Dynamic target Y to stack exactly 6 retired boxes vertically around the center
          // retiredHeight = 56px, gap = 12px -> 68px pitch.
          // For 6 boxes (indices 0 to 5), their centered offsets are: -170, -102, -34, 34, 102, 170.
          var targetBaseY = (b - 2.5) * (spRetiredH + 12);

          var baseY = retireT * targetBaseY;

          // Description opacity/height collapses
          var descO = 1 - retireT;
          var descH = (1 - retireT) * 240;

          spCards[b].style.opacity = bO;
          spCards[b].style.left = bX + "px";
          spCards[b].style.width = bW + "px";
          spCards[b].style.height = bH + "px";
          spCards[b].style.padding = bPad + "px";
          spCards[b].style.gap = bGap + "px";
          spCards[b].style.transform = "translateY(calc(-50% + " + baseY + "px))";

          if (spDescs[b]) {
            spDescs[b].style.opacity = descO;
            spDescs[b].style.maxHeight = descH + "px";
          }
          var tagEl = spCards[b].querySelector('.pillar-tag');
          var divEl = spCards[b].querySelector('.pillar-divider');
          if (tagEl) tagEl.style.opacity = descO;
          if (divEl) divEl.style.opacity = descO;

          // Pointer line towards center visual with curved bezier bends
          var ptrLine = document.getElementById('ptrLine' + b);
          var linesContainer = document.querySelector('.sp-lines');
          if (ptrLine && linesContainer) {
            var cardRect = spCards[b].getBoundingClientRect();

            var screenCenterX = window.innerWidth / 2;
            var screenCenterY = window.innerHeight / 2;
            var visualRadius = 240; // Radius where line stops
            var screenBx = cardRect.left;
            var screenBoxCenter = screenBx + cardRect.width / 2;

            var lineStartX, targetX;
            if (screenBoxCenter < screenCenterX) {
              // Box is on the left
              lineStartX = screenBx + cardRect.width;
              targetX = screenCenterX - visualRadius;
            } else {
              // Box is on the right
              lineStartX = screenBx;
              targetX = screenCenterX + visualRadius;
            }

            var dist = Math.abs(targetX - lineStartX);
            var lineStartY = screenCenterY + baseY;
            var targetY = screenCenterY;

            // Cubic bezier for a smooth elegant S-curve bend
            var cp1x = lineStartX + (targetX - lineStartX) * 0.4;
            var cp1y = lineStartY;
            var cp2x = lineStartX + (targetX - lineStartX) * 0.6;
            var cp2y = targetY;

            var pathD = "M " + lineStartX + " " + lineStartY + " C " + cp1x + " " + cp1y + " " + cp2x + " " + cp2y + " " + targetX + " " + targetY;

            ptrLine.setAttribute("d", pathD);
            ptrLine.style.opacity = bO * Math.min(0.6, dist / 50);
          }
        }
      }

      // ── rAF LOOP ──────────────────────────────────────────────────────────────
      function frame(time) {
        if (lenis) lenis.raf(time);
        readScroll();

        // ── HERO VIDEO SEEK (all-intra encoded → instant random-access) ──
        if (ready && duration) {
          var gap = seekTo - seekAt;
          seekVel = seekVel * 0.72 + gap * 0.16;
          if (Math.abs(seekVel) > 0.0001 || Math.abs(gap) > 0.0005) {
            seekAt = clamp(seekAt + seekVel, 0, duration);
            if (clip.readyState >= 2 && !clip.seeking) {
              try { clip.currentTime = seekAt; } catch (e) { }
            }
          }
        }
        // Story videos play at natural speed (milestone-triggered in readScroll)
        // Bridge video (all-intra) plays at natural speed too for simplicity
        // Product videos: click-engine owns playback after storyProgress >= 1.0

        paint();
        paintStory();
        requestAnimationFrame(frame);
      }

      // ── LOADING PROGRESS ──────────────────────────────────────────────────────
      function setProgress(f) {
        if (bootBar) bootBar.style.transform = "scaleX(" + f + ")";
        if (bootPct) bootPct.textContent = "Loading " + Math.round(f * 100) + "%";
      }

      // ── START ─────────────────────────────────────────────────────────────────
      function start() {
        if (started) return;
        started = true; ready = true;
        if (boot) boot.classList.add("done");
        readScroll(); seekAt = seekTo;
      }

      // ── ATTACH VIDEO ──────────────────────────────────────────────────────────
      function attach(src) {
        if (attached) return;
        attached = true;
        if (clip) {
          clip.addEventListener("loadedmetadata", function () {
            duration = clip.duration || 0;
            clip.pause(); readScroll(); seekAt = seekTo;
            try { clip.currentTime = seekAt; } catch (e) { }
          });
          clip.addEventListener("loadeddata", start);
          clip.addEventListener("canplaythrough", start);
          clip.addEventListener("error", start);
          clip.src = src; clip.load();
        }
        // Attach and preload all story / bridge videos
        var storyVids = [
          { el: storyVideo1, setDur: function(d) { durationS1 = d; } },
          { el: storyVideo2, setDur: function(d) { durationS2 = d; } },
          { el: bridgeVideo, setDur: function(d) { durationBridge = d; } },
          { el: vid2Entry,   setDur: function(d) { durationP2E = d; } },
          { el: vid2Exit,    setDur: function(d) { durationP2X = d; } }
        ];
        storyVids.forEach(function(item) {
          if (!item.el) return;
          (function(el, setDur) {
            el.addEventListener("loadedmetadata", function() {
              setDur(el.duration || 0);
              el.pause();
            });
            // Re-trigger load to ensure events fire even if already cached
            el.load();
          })(item.el, item.setDur);
        });
        // Preload all product videos in parallel with staggered starts to avoid bandwidth spike
        var ALL_PIDS = [3, 4, 5, 6, 7, 8, 9];
        ALL_PIDS.forEach(function(id, idx) {
          setTimeout(function() {
            var eEl = document.getElementById("vid-" + id + "-entry");
            var xEl = document.getElementById("vid-" + id + "-exit");
            if (eEl && eEl.preload !== "auto") { eEl.preload = "auto"; eEl.load(); }
            if (xEl && xEl.preload !== "auto") { xEl.preload = "auto"; xEl.load(); }
          }, 800 + idx * 300); // stagger: 800ms, 1100ms, 1400ms… after hero loads
        });
        setTimeout(start, 1200);
      }

      // ── BLOB PRELOADER ────────────────────────────────────────────────────────
      function preload() {
        var ctrl = typeof AbortController !== "undefined" ? new AbortController() : null;
        var signal = ctrl ? ctrl.signal : undefined;
        var bailed = false;

        // 1.5s safety: if fetch is slow, stream directly instead of blocking user
        var bail = setTimeout(function () {
          bailed = true;
          if (ctrl) ctrl.abort();
          setProgress(1); attach(VIDEO_URL);
        }, 1500);

        // Start preloading video, but also attach immediately so video & page don't wait
        attach(VIDEO_URL);

        fetch(VIDEO_URL, signal ? { signal: signal } : {})
          .then(function (res) {
            if (!res.ok || !res.body) throw new Error("fetch failed");
            var total = parseInt(res.headers.get("content-length") || "0", 10);
            var got = 0, chunks = [];
            var reader = res.body.getReader();
            function pump() {
              return reader.read().then(function (r) {
                if (r.done) return;
                chunks.push(r.value); got += r.value.byteLength;
                setProgress(total ? got / total : Math.min(got / 13e6, 0.95));
                return pump();
              });
            }
            return pump().then(function () { return new Blob(chunks, { type: "video/mp4" }); });
          })
          .then(function (blob) {
            if (bailed) return;
            clearTimeout(bail); setProgress(1);
            if (clip) { clip.src = URL.createObjectURL(blob); clip.load(); }
          })
          .catch(function () {
            if (bailed) return;
            clearTimeout(bail); setProgress(1);
          });
      }

      // Always guarantee boot overlay vanishes quickly even if all events fail
      setTimeout(start, 1500);
      window.addEventListener("load", function () { setTimeout(start, 500); });

      // ── iOS UNLOCK ────────────────────────────────────────────────────────────
      // iOS will not render a video frame until the element has played at least once.
      // Nudge it once on first user interaction (play + immediate pause) to unlock
      // the frame buffer for our currentTime scrubbing.
      function unlock() {
        var p = clip.play();
        if (p && p.then) p.then(function () { clip.pause(); }).catch(function () { });
        else clip.pause();

        if (storyVideo1) { var p1 = storyVideo1.play(); if (p1 && p1.then) p1.then(function () { storyVideo1.pause(); }).catch(function () { }); else storyVideo1.pause(); }
        if (storyVideo2) { var p2 = storyVideo2.play(); if (p2 && p2.then) p2.then(function () { storyVideo2.pause(); }).catch(function () { }); else storyVideo2.pause(); }
        if (bridgeVideo) { var pb = bridgeVideo.play(); if (pb && pb.then) pb.then(function () { bridgeVideo.pause(); }).catch(function () { }); else bridgeVideo.pause(); }
        if (vid2Entry) { var pe = vid2Entry.play(); if (pe && pe.then) pe.then(function () { vid2Entry.pause(); }).catch(function () { }); else vid2Entry.pause(); }
        if (vid2Exit) { var px = vid2Exit.play(); if (px && px.then) px.then(function () { vid2Exit.pause(); }).catch(function () { }); else vid2Exit.pause(); }
      }
      ["touchstart", "pointerdown", "wheel", "keydown"].forEach(function (ev) {
        window.addEventListener(ev, unlock, { once: true, passive: true });
      });

      // ── CUSTOM UI LOGIC ───────────────────────────────────────────────────────
      // Custom Selects
      document.querySelectorAll('.custom-select-wrapper').forEach(function (wrap) {
        if (wrap.id === 'datePickerWrapper' || wrap.querySelector('.custom-calendar-popup')) return;

        var trigger = wrap.querySelector('.custom-select-trigger');
        var options = wrap.querySelectorAll('.custom-option');
        var input = wrap.querySelector('input[type="hidden"]');

        if (!trigger || !input) return;

        trigger.addEventListener('click', function (e) {
          e.stopPropagation();
          var wasOpen = wrap.classList.contains('open');
          document.querySelectorAll('.custom-select-wrapper').forEach(w => w.classList.remove('open'));
          if (!wasOpen) wrap.classList.add('open');
        });

        options.forEach(function (opt) {
          opt.addEventListener('click', function (e) {
            e.stopPropagation();
            trigger.textContent = this.textContent;
            trigger.classList.add('has-val');
            input.value = this.getAttribute('data-value');
            wrap.classList.remove('open');
          });
        });
      });

      // Custom Calendar
      var dateWrap = document.getElementById('datePickerWrapper');
      var dateTrigger = document.getElementById('dateTrigger');
      var dateInput = document.getElementById('dateInput');
      var calDaysGrid = document.getElementById('calDaysGrid');
      var calMonthYear = document.getElementById('calMonthYear');
      var calPopup = document.getElementById('calendarPopup');
      var currentCalDate = new Date();

      if (dateWrap && dateTrigger) {
        if (calPopup) {
          calPopup.addEventListener('click', function (e) {
            e.stopPropagation();
          });
        }

        dateTrigger.addEventListener('click', function (e) {
          e.stopPropagation();
          var wasOpen = dateWrap.classList.contains('open');
          document.querySelectorAll('.custom-select-wrapper').forEach(w => w.classList.remove('open'));
          if (!wasOpen) dateWrap.classList.add('open');
          renderCalendar();
        });

        var prevBtn = document.getElementById('prevMonth');
        var nextBtn = document.getElementById('nextMonth');
        if (prevBtn) {
          prevBtn.addEventListener('click', function (e) {
            e.stopPropagation();
            currentCalDate.setMonth(currentCalDate.getMonth() - 1);
            renderCalendar();
          });
        }
        if (nextBtn) {
          nextBtn.addEventListener('click', function (e) {
            e.stopPropagation();
            currentCalDate.setMonth(currentCalDate.getMonth() + 1);
            renderCalendar();
          });
        }
      }

      function renderCalendar() {
        if (!calDaysGrid) return;
        calDaysGrid.innerHTML = '';
        var month = currentCalDate.getMonth();
        var year = currentCalDate.getFullYear();

        var monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        calMonthYear.textContent = monthNames[month] + " " + year;

        var days = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
        days.forEach(function (d) {
          var el = document.createElement('div');
          el.className = 'cal-day-label';
          el.textContent = d;
          calDaysGrid.appendChild(el);
        });

        var firstDay = new Date(year, month, 1).getDay();
        var daysInMonth = new Date(year, month + 1, 0).getDate();

        for (var i = 0; i < firstDay; i++) {
          var empty = document.createElement('div');
          empty.className = 'cal-day empty';
          calDaysGrid.appendChild(empty);
        }

        for (var d = 1; d <= daysInMonth; d++) {
          var dayEl = document.createElement('div');
          dayEl.className = 'cal-day';
          dayEl.textContent = d;
          dayEl.dataset.date = year + "-" + String(month + 1).padStart(2, '0') + "-" + String(d).padStart(2, '0');

          if (dateInput.value === dayEl.dataset.date) dayEl.classList.add('selected');

          dayEl.addEventListener('click', function (e) {
            e.stopPropagation();
            dateInput.value = this.dataset.date;
            dateTrigger.textContent = this.dataset.date;
            dateTrigger.classList.add('has-val');
            dateWrap.classList.remove('open');
          });
          calDaysGrid.appendChild(dayEl);
        }
      }

      document.addEventListener('click', function () {
        document.querySelectorAll('.custom-select-wrapper').forEach(w => w.classList.remove('open'));
      });

      // ── INTERSECTION OBSERVER — regular section reveals ───────────────────────
      if (typeof IntersectionObserver !== "undefined") {
        var obs = new IntersectionObserver(function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              entry.target.classList.add("revealed");
              obs.unobserve(entry.target);
            }
          });
        }, { threshold: 0.12 });
        document.querySelectorAll(".reveal").forEach(function (el) { obs.observe(el); });
      } else {
        // Fallback for old browsers
        document.querySelectorAll(".reveal").forEach(function (el) {
          el.classList.add("revealed");
        });
      }

      // ── WIRE-UP ───────────────────────────────────────────────────────────────
      document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
        anchor.addEventListener("click", function (e) {
          var targetId = this.getAttribute("href");
          if (targetId && targetId.length > 1) {
            var targetEl = document.querySelector(targetId);
            if (targetEl) {
              e.preventDefault();
              if (lenis) {
                lenis.scrollTo(targetEl, { duration: 1.4 });
              } else {
                targetEl.scrollIntoView({ behavior: "smooth" });
              }
            }
          }
        });
      });

      window.addEventListener("scroll", readScroll, { passive: true });
      window.addEventListener("resize", function () {
        if (lenis) lenis.resize();
        readScroll();
      });

      readScroll();
      paint();
      preload();
      requestAnimationFrame(frame);

    })();
  