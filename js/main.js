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

  /* --- Hero: эффект печати (логика как в React Bits TextType, без GSAP) --- */
  const HERO_TEXT_PHRASES = [
    "Я делаю сайты, интерфейсы и digital-проекты, которые выглядят как вайб, а работают как система",
    "От идеи до экрана — стиль, логика и ощущение в одном флаконе",
    "Не шаблон, а характер: лендинги, портфолио и AI-first проекты",
  ];

  function initHeroTextType() {
    const root = document.getElementById("hero-text-type");
    const contentEl = root && root.querySelector(".text-type__content");
    const cursorEl = root && root.querySelector(".text-type__cursor");
    if (!root || !contentEl || HERO_TEXT_PHRASES.length === 0) return;

    const typingSpeed = 160;
    const deletingSpeed = 75;
    const pauseDuration = 3800;
    const initialDelay = 450;
    const loop = true;

    if (prefersReduced) {
      contentEl.textContent = HERO_TEXT_PHRASES[0];
      if (cursorEl) cursorEl.hidden = true;
      return;
    }

    let textIndex = 0;
    let charIndex = 0;
    let displayed = "";
    let deleting = false;
    let timer = null;

    function clearTimer() {
      if (timer !== null) {
        clearTimeout(timer);
        timer = null;
      }
    }

    function schedule(fn, delay) {
      clearTimer();
      timer = setTimeout(fn, delay);
    }

    function tick() {
      const phrase = HERO_TEXT_PHRASES[textIndex];
      if (!phrase) return;

      if (!deleting) {
        if (charIndex < phrase.length) {
          displayed += phrase.charAt(charIndex);
          charIndex += 1;
          contentEl.textContent = displayed;
          schedule(tick, typingSpeed);
          return;
        }
        if (!loop && textIndex === HERO_TEXT_PHRASES.length - 1) {
          return;
        }
        schedule(function () {
          deleting = true;
          tick();
        }, pauseDuration);
        return;
      }

      if (displayed.length > 0) {
        displayed = displayed.slice(0, -1);
        contentEl.textContent = displayed;
        schedule(tick, deletingSpeed);
        return;
      }

      deleting = false;
      charIndex = 0;
      if (!loop && textIndex === HERO_TEXT_PHRASES.length - 1) {
        return;
      }
      textIndex = (textIndex + 1) % HERO_TEXT_PHRASES.length;
      schedule(tick, pauseDuration);
    }

    function startWhenVisible() {
      const hero = document.getElementById("hero");
      function go() {
        schedule(tick, initialDelay);
      }
      if (!hero) {
        go();
        return;
      }
      const r = hero.getBoundingClientRect();
      if (r.top < window.innerHeight * 1.05 && r.bottom > -40) {
        go();
        return;
      }
      const io = new IntersectionObserver(
        function (entries) {
          if (entries[0].isIntersecting) {
            io.disconnect();
            go();
          }
        },
        { threshold: 0.12 }
      );
      io.observe(hero);
    }

    startWhenVisible();
  }

  initHeroTextType();

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
