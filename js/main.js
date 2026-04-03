(function () {
  "use strict";

  const prefersReduced =
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* --- Курсор: кольцо + точка (идея с reactbits / custom cursor) --- */
  const dot = document.querySelector(".cursor-dot");
  const ring = document.querySelector(".cursor-ring");
  let mx = 0;
  let my = 0;
  let rx = 0;
  let ry = 0;
  let rafCursor = 0;

  function isFinePointer() {
    return window.matchMedia("(pointer: fine)").matches;
  }

  function moveCursor(e) {
    mx = e.clientX;
    my = e.clientY;
  }

  function tickCursor() {
    if (!dot || !ring) return;
    const k = 0.22;
    rx += (mx - rx) * k;
    ry += (my - ry) * k;
    dot.style.left = mx + "px";
    dot.style.top = my + "px";
    ring.style.left = rx + "px";
    ring.style.top = ry + "px";
    rafCursor = requestAnimationFrame(tickCursor);
  }

  if (!prefersReduced && isFinePointer() && dot && ring) {
    document.addEventListener("mousemove", moveCursor);
    document.addEventListener("mousedown", () => ring.classList.add("is-press"));
    document.addEventListener("mouseup", () => ring.classList.remove("is-press"));
    requestAnimationFrame(tickCursor);
    document.body.classList.add("is-cursor-ready");
  }

  /* --- Шапка: плотнее фон при скролле --- */
  const header = document.querySelector(".site-header");
  function onScrollHeader() {
    if (!header) return;
    header.classList.toggle("is-scrolled", window.scrollY > 48);
  }
  onScrollHeader();
  window.addEventListener("scroll", onScrollHeader, { passive: true });

  /* --- Лёгкий параллакс фото в hero --- */
  const heroVisual = document.querySelector(".hero__visual.js-parallax");
  function onScrollParallax() {
    if (!heroVisual || prefersReduced) return;
    const y = window.scrollY;
    const max = Math.min(500, window.innerHeight);
    const p = Math.max(0, Math.min(1, y / max));
    heroVisual.style.transform = "translateY(" + p * 18 + "px)";
  }
  if (heroVisual && !prefersReduced) {
    window.addEventListener("scroll", onScrollParallax, { passive: true });
    onScrollParallax();
  }

  /* --- Появление секций при скролле --- */
  const revealEls = document.querySelectorAll(".reveal");
  if (revealEls.length && !prefersReduced) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((en) => {
          if (en.isIntersecting) en.target.classList.add("is-visible");
        });
      },
      { root: null, threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
    );
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add("is-visible"));
  }
})();
