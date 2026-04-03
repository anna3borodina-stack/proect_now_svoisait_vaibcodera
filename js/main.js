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

  /* --- Hero: появление по словам --- */
  function splitHeroTitle() {
    const line = document.querySelector(".hero-title__line[data-split]");
    if (!line || prefersReduced) return;

    const raw = line.textContent.trim();
    const words = raw.split(/\s+/);
    line.textContent = "";
    words.forEach((w, i) => {
      const span = document.createElement("span");
      span.className = "word";
      span.textContent = w;
      span.style.animationDelay = 0.08 * i + "s";
      line.appendChild(span);
      if (i < words.length - 1) {
        const sp = document.createElement("span");
        sp.className = "word space";
        sp.innerHTML = "&nbsp;";
        line.appendChild(sp);
      }
    });
  }

  splitHeroTitle();

  /* --- Стек карточек: одна активная, предыдущие «уезжают» вверх --- */
  const stackScroll = document.getElementById("stack-scroll");
  const cards = stackScroll
    ? Array.from(stackScroll.querySelectorAll(".stack-card"))
    : [];

  function updateCardStack() {
    if (!stackScroll || cards.length === 0) return;

    const rect = stackScroll.getBoundingClientRect();
    const scrollable = stackScroll.offsetHeight - window.innerHeight;
    if (scrollable <= 0) return;

    let progress = -rect.top / scrollable;
    progress = Math.max(0, Math.min(1, progress));

    const n = cards.length;
    const idx = Math.min(n - 1, Math.floor(progress * n + 1e-6));

    cards.forEach((card, i) => {
      const dist = i - idx;
      card.classList.toggle("is-active", dist === 0);

      if (dist === 0) {
        card.style.setProperty("--offset", "0");
        card.style.setProperty("--scale", "1");
        card.style.setProperty("--opacity", "1");
        card.style.setProperty("--z", "100");
        card.style.setProperty("--rot", "0deg");
      } else if (dist < 0) {
        card.style.setProperty("--offset", "-200");
        card.style.setProperty("--scale", "0.9");
        card.style.setProperty("--opacity", "0");
        card.style.setProperty("--z", String(i));
        card.style.setProperty("--rot", "-4deg");
      } else {
        card.style.setProperty("--offset", "160");
        card.style.setProperty("--scale", "0.94");
        card.style.setProperty("--opacity", "0");
        card.style.setProperty("--z", String(i));
        card.style.setProperty("--rot", "4deg");
      }
    });
  }

  if (stackScroll && cards.length && !prefersReduced) {
    window.addEventListener("scroll", updateCardStack, { passive: true });
    window.addEventListener("resize", updateCardStack);
    updateCardStack();
  } else if (stackScroll && cards.length && prefersReduced) {
    cards.forEach((card, i) => {
      card.style.setProperty("--offset", i === 0 ? "0" : "0");
      card.style.setProperty("--scale", "1");
      card.style.setProperty("--opacity", i === 0 ? "1" : "0");
      card.style.setProperty("--z", i === 0 ? "100" : String(i));
      card.style.setProperty("--rot", "0deg");
      card.classList.toggle("is-active", i === 0);
    });
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
