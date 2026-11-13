// Motion effects for Global Mayhem. Each one only runs when its switch
// (a class like "fx-reveal" on the page) is on, and all of them stay off
// for readers who have asked their device to reduce motion.
(function () {
  var root = document.documentElement;
  var has = function (name) { return root.classList.contains("fx-" + name); };
  var calm = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (calm) return;

  // 2. Scrambled tagline: the letters start as noise and settle into the
  // words, left to right. Chaos, then explained.
  if (has("scramble")) {
    var noise = "!<>-_\\/[]{}=+*^?#";
    var scramble = function (el) {
      if (el.fxBusy) return;
      el.fxBusy = true;
      var text = el.getAttribute("data-text") || el.textContent;
      el.setAttribute("data-text", text);
      el.setAttribute("aria-label", text);
      var start = null;
      var length = 900;
      var step = function (now) {
        if (start === null) start = now;
        var done = Math.min(1, (now - start) / length);
        var settled = Math.floor(done * text.length);
        var out = "";
        for (var i = 0; i < text.length; i++) {
          var ch = text.charAt(i);
          out += i < settled || ch === " " ? ch : noise.charAt(Math.floor(Math.random() * noise.length));
        }
        el.textContent = out;
        if (done < 1) requestAnimationFrame(step);
        else { el.textContent = text; el.fxBusy = false; }
      };
      requestAnimationFrame(step);
    };
    document.querySelectorAll("[data-scramble]").forEach(function (el) {
      scramble(el);
      el.addEventListener("mouseenter", function () { scramble(el); });
    });
  }

  // 4. Reveal on scroll: things below the first screen rise into place
  // as they come into view.
  if (has("reveal") && "IntersectionObserver" in window) {
    var watcher = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("fx-in");
        watcher.unobserve(entry.target);
      });
    }, { rootMargin: "0px 0px -8% 0px" });
    var targets = ".row, .article__figure, .pullquote, .article__body > h2, .tips, .panel, .comments, .xlink, .film, .sechead, .empty, .studio .button, .player";
    document.querySelectorAll(targets).forEach(function (el) {
      if (el.getBoundingClientRect().top < window.innerHeight) return; // already on screen
      el.classList.add("fx-wait");
      watcher.observe(el);
    });
  }

  // 11. Big titles rise in: each word slides up from behind a mask, one
  // after the other, when the title comes into view.
  if (has("hero")) {
    var count;
    var split = function (node) {
      [].slice.call(node.childNodes).forEach(function (child) {
        if (child.nodeType === 1) return split(child);
        if (child.nodeType !== 3 || !child.textContent.trim()) return;
        var piece = document.createDocumentFragment();
        child.textContent.split(/(\s+)/).forEach(function (part) {
          if (!part) return;
          if (/^\s+$/.test(part)) { piece.append(" "); return; }
          var outer = document.createElement("span");
          var inner = document.createElement("span");
          outer.className = "rise-w";
          inner.style.setProperty("--i", count++);
          inner.textContent = part;
          outer.append(inner);
          piece.append(outer);
        });
        child.replaceWith(piece);
      });
    };
    var riseWatcher = "IntersectionObserver" in window ? new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-in");
        riseWatcher.unobserve(entry.target);
      });
    }, { rootMargin: "0px 0px -6% 0px" }) : null;
    document.querySelectorAll("[data-rise]").forEach(function (el) {
      el.setAttribute("aria-label", el.textContent.trim());
      count = 0;
      split(el);
      el.classList.add("is-split");
      if (riseWatcher) riseWatcher.observe(el); else el.classList.add("is-in");
    });

    // The big mark in the hero drifts a little against the pointer
    var stageMark = document.querySelector(".stage__mark");
    if (stageMark && matchMedia("(pointer: fine)").matches) {
      addEventListener("mousemove", function (e) {
        stageMark.style.setProperty("--mx", (e.clientX / innerWidth - 0.5).toFixed(3));
        stageMark.style.setProperty("--my", (e.clientY / innerHeight - 0.5).toFixed(3));
      }, { passive: true });
    }
  }

  // 12. Moving band: leans in the direction of the scroll
  var band = document.querySelector(".marquee__track");
  if (has("marquee") && band) {
    var lastY = scrollY, lean = 0, leaning = false;
    var settle = function () {
      lean *= 0.88;
      band.style.setProperty("--lean", lean.toFixed(2) + "deg");
      if (Math.abs(lean) > 0.05) requestAnimationFrame(settle);
      else { leaning = false; band.style.setProperty("--lean", "0deg"); }
    };
    addEventListener("scroll", function () {
      lean = Math.max(-14, Math.min(14, lean + (scrollY - lastY) * 0.12));
      lastY = scrollY;
      if (!leaning) { leaning = true; requestAnimationFrame(settle); }
    }, { passive: true });
  }

  // 13. Pink pointer: a dot that trails the mouse and swells over links
  if (has("cursor") && matchMedia("(hover: hover) and (pointer: fine)").matches) {
    var dot = document.createElement("div");
    dot.className = "fxcursor";
    document.body.append(dot);
    var tx = 0, ty = 0, x = 0, y = 0, shown = false;
    var follow = function () {
      x += (tx - x) * 0.22;
      y += (ty - y) * 0.22;
      dot.style.transform = "translate(" + x.toFixed(1) + "px," + y.toFixed(1) + "px)";
      requestAnimationFrame(follow);
    };
    addEventListener("mousemove", function (e) {
      tx = e.clientX; ty = e.clientY;
      if (!shown) { shown = true; x = tx; y = ty; dot.classList.add("is-on"); follow(); }
      var over = e.target.closest && e.target.closest("a, button, label, input, textarea");
      dot.classList.toggle("is-big", Boolean(over));
    }, { passive: true });
    document.addEventListener("mouseleave", function () { dot.classList.remove("is-on"); shown = false; });
  }

  // 6. Reading progress bar: a pink line across the top of a story that
  // fills as the reader moves through it.
  var story = document.querySelector(".article__body");
  if (has("progress") && story && document.querySelector(".article__footer")) {
    var bar = document.createElement("div");
    bar.className = "readbar";
    document.body.append(bar);
    var ticking = false;
    var draw = function () {
      ticking = false;
      var box = story.getBoundingClientRect();
      // 0 at the top of the page, 1 when the end of the story text is on screen
      var end = box.bottom + window.scrollY - window.innerHeight * 0.85;
      var read = Math.max(0, Math.min(1, end > 0 ? window.scrollY / end : 1));
      bar.style.transform = "scaleX(" + read + ")";
    };
    addEventListener("scroll", function () {
      if (!ticking) { ticking = true; requestAnimationFrame(draw); }
    }, { passive: true });
    draw();
  }
})();
