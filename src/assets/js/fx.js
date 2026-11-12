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
    var targets = ".row, .article__figure, .pullquote, .article__body > h2, .tips, .panel, .comments, .xlink";
    document.querySelectorAll(targets).forEach(function (el) {
      if (el.getBoundingClientRect().top < window.innerHeight) return; // already on screen
      el.classList.add("fx-wait");
      watcher.observe(el);
    });
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
