const root = document.documentElement;
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const clamp = (v, min, max) => Math.min(max, Math.max(min, v));

document.getElementById("year").textContent = new Date().getFullYear();

// Bungkus setiap kata dalam elemen (tetap mempertahankan <strong> dsb.)
function splitWords(el, wrap) {
  let i = 0;
  const walk = (node) => {
    [...node.childNodes].forEach((child) => {
      if (child.nodeType === Node.ELEMENT_NODE) return walk(child);
      if (child.nodeType !== Node.TEXT_NODE || !child.textContent.trim()) return;
      const frag = document.createDocumentFragment();
      child.textContent.split(/(\s+)/).forEach((part) => {
        if (!part) return;
        frag.appendChild(/^\s+$/.test(part) ? document.createTextNode(" ") : wrap(part, i++));
      });
      child.replaceWith(frag);
    });
  };
  walk(el);
  return i;
}

// Judul hero: kata naik satu per satu
document.querySelectorAll(".split").forEach((el) => {
  splitWords(el, (word, i) => {
    const outer = document.createElement("span");
    const inner = document.createElement("span");
    outer.className = "w";
    inner.style.setProperty("--i", i);
    inner.textContent = word;
    outer.appendChild(inner);
    return outer;
  });
});

// Pernyataan: kata menyala mengikuti scroll
const scrubs = [...document.querySelectorAll(".scrub")].map((el) => {
  splitWords(el, (word) => {
    const s = document.createElement("span");
    s.className = "sw";
    s.textContent = word;
    return s;
  });
  return { el, words: [...el.querySelectorAll(".sw")] };
});

const start = () => requestAnimationFrame(() => root.classList.add("loaded"));
(document.fonts ? document.fonts.ready : Promise.resolve()).then(start);
setTimeout(start, 1500);

// Header diberi latar setelah melewati bagian atas
const header = document.querySelector(".site-header");
const onScrollHeader = () => header.classList.toggle("scrolled", window.scrollY > 40);
window.addEventListener("scroll", onScrollHeader, { passive: true });
onScrollHeader();

// ---------- Menu ----------
const menuBtn = document.querySelector(".menu-btn");
const menu = document.getElementById("menu");
menu.querySelectorAll("a").forEach((a, i) => a.style.setProperty("--i", i));

function setMenu(open) {
  menuBtn.setAttribute("aria-expanded", open);
  menuBtn.setAttribute("aria-label", open ? "Tutup menu" : "Buka menu");
  if (open) {
    menu.hidden = false;
    requestAnimationFrame(() => document.body.classList.add("menu-open"));
  } else {
    document.body.classList.remove("menu-open");
    setTimeout(() => { if (!document.body.classList.contains("menu-open")) menu.hidden = true; }, reduceMotion ? 0 : 800);
  }
}
menuBtn.addEventListener("click", () => setMenu(!document.body.classList.contains("menu-open")));
menu.addEventListener("click", (e) => { if (e.target.closest("a")) setMenu(false); });
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && document.body.classList.contains("menu-open")) { setMenu(false); menuBtn.focus(); }
});

// ---------- Muncul saat di-scroll ----------
const reveals = document.querySelectorAll(".reveal");
if ("IntersectionObserver" in window) {
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) { e.target.classList.add("visible"); io.unobserve(e.target); }
    });
  }, { threshold: 0.2 });
  reveals.forEach((el) => io.observe(el));
} else {
  reveals.forEach((el) => el.classList.add("visible"));
}

// ---------- Efek yang mengikuti scroll ----------
const parallax = [...document.querySelectorAll("[data-speed]")];
const stackItems = [...document.querySelectorAll(".stack-item")];
stackItems.forEach((item, i) => item.style.setProperty("--i", i));

const mouse = { x: 0, y: 0 };

function update() {
  const vh = window.innerHeight;

  parallax.forEach((el) => {
    const r = el.getBoundingClientRect();
    const offset = (r.top + r.height / 2 - vh / 2) * parseFloat(el.dataset.speed);
    const tilt = parseFloat(el.dataset.tilt || 0);
    el.style.transform = `translate3d(${mouse.x * tilt}px, ${offset + mouse.y * tilt}px, 0)`;
  });

  // Kartu yang tertimpa kartu berikutnya mengecil dan meredup
  stackItems.forEach((item, i) => {
    const next = stackItems[i + 1];
    const card = item.firstElementChild;
    if (!next) return;
    const a = item.getBoundingClientRect();
    const b = next.getBoundingClientRect();
    const p = clamp(1 - (b.top - a.top) / a.height, 0, 1);
    card.style.transform = `scale(${1 - p * 0.08})`;
    card.style.filter = `brightness(${1 - p * 0.15})`;
  });

  scrubs.forEach(({ el, words }) => {
    const r = el.getBoundingClientRect();
    const p = clamp((vh * 0.85 - r.top) / (vh * 0.6), 0, 1);
    words.forEach((w, i) => {
      w.style.opacity = 0.15 + 0.85 * clamp(p * words.length - i, 0, 1);
    });
  });
}

let ticking = false;
const requestUpdate = () => {
  if (ticking) return;
  ticking = true;
  requestAnimationFrame(() => { update(); ticking = false; });
};

if (!reduceMotion) {
  window.addEventListener("scroll", requestUpdate, { passive: true });
  window.addEventListener("resize", requestUpdate);
  update();

  const finePointer = window.matchMedia("(pointer: fine)").matches;
  if (finePointer) {
    // Kolase hero bergerak sedikit mengikuti kursor
    window.addEventListener("mousemove", (e) => {
      mouse.x = e.clientX / window.innerWidth - 0.5;
      mouse.y = e.clientY / window.innerHeight - 0.5;
      requestUpdate();
    });

    // Label "Lihat proyek" mengikuti kursor di atas kartu
    document.querySelectorAll(".work-card").forEach((card) => {
      const pill = card.querySelector(".cursor-pill");
      card.addEventListener("mousemove", (e) => {
        const r = card.getBoundingClientRect();
        pill.style.left = `${e.clientX - r.left + 14}px`;
        pill.style.top = `${e.clientY - r.top + 14}px`;
      });
    });

    // Tombol "magnetis"
    document.querySelectorAll(".magnetic, .menu-btn").forEach((el) => {
      el.addEventListener("mousemove", (e) => {
        const r = el.getBoundingClientRect();
        const x = (e.clientX - r.left - r.width / 2) * 0.3;
        const y = (e.clientY - r.top - r.height / 2) * 0.3;
        el.style.translate = `${x}px ${y}px`;
      });
      el.addEventListener("mouseleave", () => { el.style.translate = ""; });
    });
  }
}
