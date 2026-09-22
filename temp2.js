
    (function () {
      "use strict";

      // ── PRODUCT DATA ───────────────────────────────────────────────────────────
      var PRODUCTS = {
        2: {
          name: "Espresso",
          isLarge: false,
          eyebrow: "Selection · No. 02",
          tag: "Craft & Ritual",
          prep: "9 Bar Extraction · 1:2 Brew Ratio · 28s Pull",
          desc: "Pure, unfiltered intensity. A double shot pulled to exacting standards — bold crema, rich body, no compromise.",
          macros: [
            { label: "ENERGY", val: "5 kcal" },
            { label: "CAFFEINE", val: "140 mg" },
            { label: "ROAST", val: "Med-Dark" },
            { label: "ORIGIN", val: "Ethiopia" }
          ]
        },
        3: {
          name: "Frappe<br>Mocha",
          isLarge: true,
          eyebrow: "Selection · No. 03",
          tag: "Craft & Ritual",
          prep: "Blended Craft · Single-Origin Espresso · Cold Ganache",
          desc: "Dark Belgian cacao melted into freshly extracted espresso, whipped with ice and topped with chocolate curls.",
          macros: [
            { label: "ENERGY", val: "320 kcal" },
            { label: "CAFFEINE", val: "110 mg" },
            { label: "CACAO", val: "72% Belgian" },
            { label: "BASE", val: "Whole Milk" }
          ]
        },
        4: {
          name: "Iced<br>Latte",
          isLarge: true,
          eyebrow: "Selection · No. 04",
          tag: "Craft & Ritual",
          prep: "Cold Layering · Slow Pour · Hand-Cut Ice",
          desc: "Chilled oat milk layered over concentrated espresso and artisanal crystal ice. Refreshingly crisp with subtle nutty undertones.",
          macros: [
            { label: "ENERGY", val: "160 kcal" },
            { label: "CAFFEINE", val: "130 mg" },
            { label: "TEMP", val: "3°C Chill" },
            { label: "DAIRY", val: "Oat / Almond" }
          ]
        },
        5: {
          name: "Caramel<br>Latte",
          isLarge: true,
          eyebrow: "Selection · No. 05",
          tag: "Craft & Ritual",
          prep: "Slow-Cooked Amber Glaze · Velvety Microfoam · Sea Salt",
          desc: "Rich espresso swirled with golden slow-cooked caramel, velvety steamed milk, and a delicate caramel drizzle.",
          macros: [
            { label: "ENERGY", val: "290 kcal" },
            { label: "CAFFEINE", val: "120 mg" },
            { label: "CARAMEL", val: "House Craft" },
            { label: "BUTTER", val: "A2 Jersey" }
          ]
        },
        6: {
          name: "Croissant",
          isLarge: false,
          eyebrow: "Selection · No. 06",
          tag: "Craft & Ritual",
          prep: "72-Hour Fermentation · Tournage 27 Layers · 4 AM Bake",
          desc: "Flaky, multi-layered French butter pastry baked fresh every morning to an airy, golden crisp.",
          macros: [
            { label: "ENERGY", val: "310 kcal" },
            { label: "BUTTER", val: "84% Churned" },
            { label: "CARBS", val: "32 g" },
            { label: "PROTEIN", val: "6 g" }
          ]
        },
        7: {
          name: "Cinnamon<br>Bread",
          isLarge: true,
          eyebrow: "Selection · No. 07",
          tag: "Craft & Ritual",
          prep: "Ceylon Cinnamon Swirl · Sourdough Brioche · Raw Demerara",
          desc: "Pillowy brioche dough braided with fragrant Ceylon cinnamon and brown sugar, crowned with vanilla glaze.",
          macros: [
            { label: "ENERGY", val: "280 kcal" },
            { label: "SPICE", val: "Pure Ceylon" },
            { label: "FLOUR", val: "Stone Ground" },
            { label: "SWEETENER", val: "Raw Cane" }
          ]
        },
        8: {
          name: "Blueberry<br>Cheese Cake",
          isLarge: true,
          eyebrow: "Selection · No. 08",
          tag: "Craft & Ritual",
          prep: "Slow Water Bath · Wild Forest Blueberry Compote · Graham Base",
          desc: "Silky New York-style cheesecake topped with house-simmered wild blueberry compote on a buttery graham crust.",
          macros: [
            { label: "ENERGY", val: "380 kcal" },
            { label: "CHEESE", val: "Cream Curd" },
            { label: "COMPOTE", val: "Wild Forest" },
            { label: "CARBS", val: "38 g" }
          ]
        },
        9: {
          name: "Grilled Butter<br>Sandwich",
          isLarge: true,
          eyebrow: "Selection · No. 09",
          tag: "Craft & Ritual",
          prep: "Cast Iron Pressed · Cultured Salted Butter · Gruyère Crust",
          desc: "Artisanal sourdough slathered in slow-churned butter and pressed on cast iron until deeply toasted and molten within.",
          macros: [
            { label: "ENERGY", val: "340 kcal" },
            { label: "BUTTER", val: "Farm Churned" },
            { label: "BREAD", val: "24h Sourdough" },
            { label: "CHEESE", val: "Aged Gruyère" }
          ]
        }
      };

      var PRODUCT_IDS = [2, 3, 4, 5, 6, 7, 8, 9];
      var DEFAULT_PRODUCT = 2;

      // ── REFS ──────────────────────────────────────────────────────────────────
      var showcase = document.getElementById("productShowcase");
      var infoEl = document.getElementById("productInfo");
      var nameEl = document.getElementById("productName");
      var eyebrowEl = document.getElementById("productEyebrow");
      var tagEl = document.getElementById("productTag");
      var prepEl = document.getElementById("productPrep");
      var descEl = document.getElementById("productDesc");

      var macroLabel1 = document.getElementById("macroLabel1");
      var macroVal1 = document.getElementById("macroVal1");
      var macroLabel2 = document.getElementById("macroLabel2");
      var macroVal2 = document.getElementById("macroVal2");
      var macroLabel3 = document.getElementById("macroLabel3");
      var macroVal3 = document.getElementById("macroVal3");
      var macroLabel4 = document.getElementById("macroLabel4");
      var macroVal4 = document.getElementById("macroVal4");

      var retryBtn = document.getElementById("productRetry");
      var selectorEl = document.getElementById("productSelector");
      var prevBtn = document.getElementById("productPrev");
      var nextBtn = document.getElementById("productNext");
      var tabs = [].slice.call(document.querySelectorAll(".product-tab"));

      // Build video ref map: { 2: { entry: <video>, exit: <video> }, ... }
      var videos = {};
      PRODUCT_IDS.forEach(function (id) {
        videos[id] = {
          entry: document.getElementById("vid-" + id + "-entry"),
          exit: document.getElementById("vid-" + id + "-exit")
        };
      });

      // ── STATE ─────────────────────────────────────────────────────────────────
      var activeProduct = DEFAULT_PRODUCT;
      var isLocked = false;
      var transitionToken = 0;
      var pendingRetry = null;

      // ── HELPERS ───────────────────────────────────────────────────────────────

      // Directly set opacity + sync class (avoids !important fights)
      function setVidOpacity(videoEl, val) {
        if (!videoEl) return;
        videoEl.style.opacity = val;
        if (val > 0) videoEl.classList.add("product-video--visible");
        else videoEl.classList.remove("product-video--visible");
      }

      function hideAllProductVideos() {
        PRODUCT_IDS.forEach(function (id) {
          if (!videos[id]) return;
          setVidOpacity(videos[id].entry, 0);
          setVidOpacity(videos[id].exit, 0);
          if (videos[id].entry && !videos[id].entry.paused) videos[id].entry.pause();
          if (videos[id].exit  && !videos[id].exit.paused)  videos[id].exit.pause();
        });
      }

      function updateInfo(productId) {
        var data = PRODUCTS[productId];
        if (!data) return;
        if (nameEl) nameEl.innerHTML = data.name;
        if (eyebrowEl) eyebrowEl.textContent = data.eyebrow || "Selection";
        if (tagEl) tagEl.textContent = data.tag || "Craft & Ritual";
        if (prepEl) prepEl.textContent = data.prep || "";
        if (descEl) descEl.textContent = data.desc || "";
        if (data.macros && data.macros.length >= 4) {
          if (macroLabel1 && macroVal1) { macroLabel1.textContent = data.macros[0].label; macroVal1.textContent = data.macros[0].val; }
          if (macroLabel2 && macroVal2) { macroLabel2.textContent = data.macros[1].label; macroVal2.textContent = data.macros[1].val; }
          if (macroLabel3 && macroVal3) { macroLabel3.textContent = data.macros[2].label; macroVal3.textContent = data.macros[2].val; }
          if (macroLabel4 && macroVal4) { macroLabel4.textContent = data.macros[3].label; macroVal4.textContent = data.macros[3].val; }
        }
      }

      function setActiveTab(productId) {
        tabs.forEach(function (tab) {
          var tabId = parseInt(tab.getAttribute("data-product"), 10);
          if (tabId === productId) {
            tab.classList.add("product-tab--active");
            try { tab.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" }); } catch (e) {}
          } else {
            tab.classList.remove("product-tab--active");
          }
        });
      }

      function lockControls() {
        isLocked = true;
        if (showcase) showcase.classList.add("product-showcase--transitioning");
      }

      function unlockControls() {
        isLocked = false;
        if (showcase) showcase.classList.remove("product-showcase--transitioning");
      }

      function showRetry(from, to) {
        pendingRetry = { from: from, to: to };
        if (retryBtn) retryBtn.classList.add("product-retry--visible");
      }

      function hideRetry() {
        pendingRetry = null;
        if (retryBtn) retryBtn.classList.remove("product-retry--visible");
      }

      // Hold a video on its terminal frame
      function holdTerminalFrame(videoEl) {
        videoEl.pause();
        if (videoEl.duration > 0.08) {
          try { videoEl.currentTime = videoEl.duration - 0.04; } catch(e) {}
        }
      }

      // Play a video from frame 0 to completion; resolve when ended
      // Returns a cancel function; use token to abort stale callbacks
      function playVideo(videoEl, token) {
        return new Promise(function(resolve, reject) {
          if (!videoEl || token !== transitionToken) { reject(new Error("stale")); return; }

          // Remove any old ended/error listeners
          function cleanup() {
            videoEl.removeEventListener("ended", onEnded);
            videoEl.removeEventListener("error", onError);
          }

          function onEnded() {
            cleanup();
            if (token !== transitionToken) { reject(new Error("stale")); return; }
            resolve();
          }
          function onError(e) {
            cleanup();
            reject(e);
          }

          videoEl.addEventListener("ended", onEnded);
          videoEl.addEventListener("error", onError);

          videoEl.currentTime = 0;
          var p = videoEl.play();
          if (p && p.catch) {
            p.catch(function(err) {
              cleanup();
              reject(err);
            });
          }
        });
      }

      // ── SEQUENTIAL EXIT → ENTRY TRANSITION ENGINE ──────────────────────────────
      // Exactly per spec:
      //   1. Lock controls
      //   2. Show current product's exit video; play to completion
      //   3. Show target product's entry video; play to completion
      //   4. Hold last frame; commit activeProduct; unlock
      function transitionTo(targetId) {
        if (isLocked) return;
        if (targetId === activeProduct) return;

        var fromId = activeProduct;
        var token = ++transitionToken;

        hideRetry();
        lockControls();

        if (infoEl) infoEl.classList.add("product-info--fading");

        var exitVid  = videos[fromId]  ? videos[fromId].exit   : null;
        var entryVid = videos[targetId]? videos[targetId].entry : null;

        if (!exitVid || !entryVid) {
          unlockControls();
          if (infoEl) infoEl.classList.remove("product-info--fading");
          return;
        }

        // Ensure target videos are preloaded
        if (entryVid.preload !== "auto") { entryVid.preload = "auto"; entryVid.load(); }

        // Hide the current product's entry (keep it positioned so no flash)
        setVidOpacity(videos[fromId].entry, 0);

        // Zero out all other products
        PRODUCT_IDS.forEach(function(id) {
          if (id === fromId || !videos[id]) return;
          setVidOpacity(videos[id].entry, 0);
          setVidOpacity(videos[id].exit,  0);
          if (!videos[id].entry.paused) videos[id].entry.pause();
          if (!videos[id].exit.paused)  videos[id].exit.pause();
        });

        // Step 1: play exit video of current product
        setVidOpacity(exitVid, 1);

        playVideo(exitVid, token)
          .then(function() {
            if (token !== transitionToken) throw new Error("stale");
            // Exit done — hide it
            setVidOpacity(exitVid, 0);
            exitVid.pause();

            // Step 2: play entry video of target product
            setVidOpacity(entryVid, 1);
            return playVideo(entryVid, token);
          })
          .then(function() {
            if (token !== transitionToken) throw new Error("stale");

            // Entry done — hold last frame
            holdTerminalFrame(entryVid);

            // Commit new state
            activeProduct = targetId;
            setActiveTab(targetId);
            updateInfo(targetId);
            setTimeout(function() {
              if (infoEl) infoEl.classList.remove("product-info--fading");
            }, 60);
            unlockControls();
          })
          .catch(function(err) {
            if (err && err.message === "stale") return;  // superseded by newer click
            console.warn("[product] transition failed:", err);
            // Recovery: show entry vid at frame 0 so something is visible
            setVidOpacity(entryVid, 1);
            try { entryVid.currentTime = 0; } catch(e) {}
            if (infoEl) infoEl.classList.remove("product-info--fading");
            unlockControls();
            showRetry(fromId, targetId);
          });
      }

      // ── RETRY ─────────────────────────────────────────────────────────────────
      if (retryBtn) {
        retryBtn.addEventListener("click", function() {
          if (!pendingRetry) return;
          var target = pendingRetry.to;
          hideRetry();
          transitionTo(target);
        });
      }

      // ── TAB CLICK HANDLERS ───────────────────────────────────────────────────
      tabs.forEach(function (tab) {
        tab.addEventListener("click", function () {
          var targetId = parseInt(this.getAttribute("data-product"), 10);
          transitionTo(targetId);
        });
      });

      // ── CAROUSEL ARROWS NAVIGATION ───────────────────────────────────────────
      if (prevBtn) {
        prevBtn.addEventListener("click", function () {
          if (isLocked) return;
          var currIdx = PRODUCT_IDS.indexOf(activeProduct);
          var nextIdx = (currIdx - 1 + PRODUCT_IDS.length) % PRODUCT_IDS.length;
          transitionTo(PRODUCT_IDS[nextIdx]);
        });
      }

      if (nextBtn) {
        nextBtn.addEventListener("click", function () {
          if (isLocked) return;
          var currIdx = PRODUCT_IDS.indexOf(activeProduct);
          var nextIdx = (currIdx + 1) % PRODUCT_IDS.length;
          transitionTo(PRODUCT_IDS[nextIdx]);
        });
      }

      // ── HORIZONTAL TRACKPAD / WHEEL SCROLL ON MENU BAR ──────────────────────
      if (selectorEl) {
        selectorEl.addEventListener("wheel", function (e) {
          if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
            e.preventDefault();
            selectorEl.scrollLeft += e.deltaY;
          }
        }, { passive: false });
      }

      // ── CURSOR INTERACTION ────────────────────────────────────────────────────
      document.querySelectorAll(".product-tab, .product-carousel-arrow, .product-retry").forEach(function (el) {
        el.addEventListener("mouseenter", function () { document.body.classList.add("hovering"); });
        el.addEventListener("mouseleave", function () { document.body.classList.remove("hovering"); });
      });

      // ── MAGNETIC SCROLL SNAP ──────────────────────────────────────────────────
      (function initProductScrollSnap() {
        var orderEl = document.getElementById("order");
        if (!orderEl) return;
        var snapLocked = false;
        var scrollTimeout = null;
        function checkSnap() {
          if (snapLocked) return;
          var rect = orderEl.getBoundingClientRect();
          var distance = rect.top;
          if (Math.abs(distance) > 6 && Math.abs(distance) < 220) {
            snapLocked = true;
            if (window.lenis) {
              window.lenis.scrollTo(orderEl, {
                duration: 0.85,
                easing: function (t) { return Math.min(1, 1.001 - Math.pow(2, -10 * t)); },
                onComplete: function () { setTimeout(function () { snapLocked = false; }, 400); }
              });
            } else {
              orderEl.scrollIntoView({ behavior: "smooth" });
              setTimeout(function () { snapLocked = false; }, 800);
            }
          }
        }
        window.addEventListener("scroll", function () {
          clearTimeout(scrollTimeout);
          var rect = orderEl.getBoundingClientRect();
          if (Math.abs(rect.top) > 380) snapLocked = false;
          scrollTimeout = setTimeout(checkSnap, 100);
        }, { passive: true });
      })();

      // ── EXPORTS — read by paintStory / readScroll in main script ─────────────
      window.__getActiveProduct = function () { return activeProduct; };
      // Return real isLocked so paintStory respects the transition in progress
      window.__isProductLocked = function () { return isLocked; };

      // ── INITIAL STATE ─────────────────────────────────────────────────────────
      updateInfo(DEFAULT_PRODUCT);
      setActiveTab(DEFAULT_PRODUCT);
      // Seek default product's entry to frame 0 (paintStory will show it when storyProgress >= 0.77)
      if (videos[DEFAULT_PRODUCT] && videos[DEFAULT_PRODUCT].entry) {
        try { videos[DEFAULT_PRODUCT].entry.currentTime = 0; } catch(e) {}
      }

      // ── VISIBILITY API ────────────────────────────────────────────────────────
      document.addEventListener("visibilitychange", function () {
        if (document.hidden) {
          PRODUCT_IDS.forEach(function (id) {
            if (videos[id] && !videos[id].entry.paused) videos[id].entry.pause();
            if (videos[id] && !videos[id].exit.paused)  videos[id].exit.pause();
          });
        }
      });

    })();
  