/**
 * True Focus — порт React Bits / motion: рамка фокуса и blur по словам.
 * Без React и motion/react: CSS transitions + измерение getBoundingClientRect.
 */
(function () {
  "use strict";

  var root = document.getElementById("hero-true-focus");
  if (!root) return;

  var prefersReduced =
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var sentence = root.getAttribute("data-sentence") || "Вайб Система Digital Ощущение";
  var separator = root.getAttribute("data-separator") || " ";
  var manualMode = root.getAttribute("data-manual") === "true";
  var blurAmount = parseFloat(root.getAttribute("data-blur") || "5", 10);
  var animationDuration = parseFloat(root.getAttribute("data-duration") || "0.5", 10);
  var pauseBetween = parseFloat(root.getAttribute("data-pause") || "1", 10);

  var words = sentence.split(separator).filter(function (w) {
    return w.length > 0;
  });
  if (words.length === 0) return;

  var wordEls = [];
  var currentIndex = 0;
  var timer = null;
  var frame = null;

  root.style.setProperty("--focus-blur", blurAmount + "px");
  root.style.setProperty("--focus-duration", animationDuration + "s");

  words.forEach(function (word, index) {
    var span = document.createElement("span");
    span.className = "focus-word" + (manualMode ? " focus-word--manual" : "");
    span.textContent = word;
    span.setAttribute("data-index", String(index));
    root.appendChild(span);
    wordEls.push(span);

    if (manualMode) {
      span.addEventListener("mouseenter", function () {
        currentIndex = index;
        updateWords();
        updateFrame();
      });
    }
  });

  if (manualMode) {
    root.addEventListener("mouseleave", function () {
      currentIndex = 0;
      updateWords();
      updateFrame();
    });
  }

  frame = document.createElement("div");
  frame.className = "focus-frame";
  frame.setAttribute("aria-hidden", "true");
  ["top-left", "top-right", "bottom-left", "bottom-right"].forEach(function (pos) {
    var c = document.createElement("span");
    c.className = "corner " + pos;
    frame.appendChild(c);
  });
  root.appendChild(frame);

  function updateWords() {
    wordEls.forEach(function (el, i) {
      var active = i === currentIndex;
      el.classList.toggle("is-active", active);
      if (prefersReduced) {
        el.style.filter = "none";
        return;
      }
      el.style.filter = active ? "blur(0px)" : "blur(" + blurAmount + "px)";
      el.style.transition = "filter " + animationDuration + "s ease";
    });
    frame.style.opacity = prefersReduced ? "0" : currentIndex >= 0 ? "1" : "0";
  }

  function updateFrame() {
    if (!frame || prefersReduced) return;
    if (currentIndex < 0 || !wordEls[currentIndex]) return;
    var parentRect = root.getBoundingClientRect();
    var activeRect = wordEls[currentIndex].getBoundingClientRect();
    frame.style.left = activeRect.left - parentRect.left + root.scrollLeft + "px";
    frame.style.top = activeRect.top - parentRect.top + root.scrollTop + "px";
    frame.style.width = activeRect.width + "px";
    frame.style.height = activeRect.height + "px";
    frame.style.transition =
      "left " + animationDuration + "s ease, top " + animationDuration + "s ease, width " + animationDuration + "s ease, height " + animationDuration + "s ease, opacity 0.3s ease";
  }

  function tick() {
    if (manualMode || prefersReduced) return;
    currentIndex = (currentIndex + 1) % words.length;
    updateWords();
    updateFrame();
  }

  function schedule() {
    if (timer) clearInterval(timer);
    if (manualMode || prefersReduced) return;
    var ms = (animationDuration + pauseBetween) * 1000;
    timer = setInterval(tick, ms);
  }

  function onResize() {
    updateFrame();
  }

  if (prefersReduced) {
    currentIndex = 0;
    wordEls.forEach(function (el, i) {
      el.style.filter = "none";
      el.classList.toggle("is-active", i === 0);
    });
    frame.style.opacity = "0";
    return;
  }

  updateWords();
  requestAnimationFrame(function () {
    updateFrame();
  });

  if (!manualMode) {
    schedule();
  }

  window.addEventListener("resize", onResize);
  if (typeof ResizeObserver !== "undefined") {
    var ro = new ResizeObserver(function () {
      updateFrame();
    });
    ro.observe(root);
  }

  document.fonts &&
    document.fonts.ready.then(function () {
      updateFrame();
    });
})();
