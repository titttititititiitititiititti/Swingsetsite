// The motion on the page: words rising, devices tilting in, tiles flipping,
// switches turning on. Everything starts when it scrolls into view, once.

const calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// ------------------------------------------------------------------ icons
// The same line icons as the ad, drawn in-house.
const ICONS = {
  doc: '<path d="M6 3h8l4 4v14H6z"/><path d="M14 3v4h4M9 12h6M9 16h6"/>',
  card: '<rect x="3" y="6" width="18" height="13" rx="2"/><circle cx="8.5" cy="12" r="2"/><path d="M13 11h5M13 14.5h4M6 16.5h5"/>',
  heart: '<path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"/>',
  bell: '<path d="M6 16V11a6 6 0 1 1 12 0v5l2 2H4z"/><path d="M10 20a2 2 0 0 0 4 0"/>',
  grid: '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 9h18M3 14h18M9 4v16M15 4v16"/>',
  form: '<rect x="5" y="3" width="14" height="18" rx="2"/><path d="M8 8h8M8 12h8M8 16h4"/><path d="m14 16 1.5 1.5L19 14"/>',
  person: '<circle cx="12" cy="8" r="3.5"/><path d="M5 20a7 7 0 0 1 14 0"/>',
  people: '<circle cx="9" cy="8" r="3"/><circle cx="17" cy="9" r="2.5"/><path d="M3 20a6 6 0 0 1 12 0M14 20a5 5 0 0 1 7-4.5"/>',
  plane: '<path d="M3 13l18-8-6 16-3-7z M12 14l3-3"/>',
  calendar: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4M7 14h3M14 14h3M7 17h3"/>',
  pen: '<path d="M4 20l4-1 11-11-3-3L5 16z"/><path d="M4 20c4 0 6-2 9-2s4 1 7 1"/>',
  mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/>',
  megaphone: '<path d="M4 10v4h3l8 4V6L7 10z"/><path d="M18 9a4 4 0 0 1 0 6"/>',
  shield: '<path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6z"/><path d="m9 12 2 2 4-4"/>',
  clock: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>',
  search: '<circle cx="11" cy="11" r="6.5"/><path d="m16 16 4.5 4.5"/>',
  phone: '<rect x="7" y="2.5" width="10" height="19" rx="2.5"/><path d="M11 18.5h2"/>',
  chart: '<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>',
  history: '<path d="M4 12a8 8 0 1 0 2.4-5.7L4 8.5"/><path d="M4 4v4.5h4.5M12 8v4l3 2"/>',
  check: '<path d="m5 12.5 4.5 4.5L19 7.5"/>',
  inbox: '<path d="M3 13l3-8h12l3 8v6H3z"/><path d="M3 13h5l1.5 2.5h5L16 13h5"/>',
  folder: '<path d="M3 6h7l2 2h9v11H3z"/>',
  roster: '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 9h18"/><path d="M6 13h3M11 13h3M16 13h2M6 16.5h3M11 16.5h3"/>',
  chat: '<path d="M4 5h16v11H9l-5 4z"/><path d="M8 9.5h8M8 12.5h5"/>',
};
const svg = (name) =>
  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[name] ?? ""}</svg>`;
document.querySelectorAll("[data-icon]").forEach((el) => (el.innerHTML = svg(el.dataset.icon)));

// ------------------------------------------------------------------ headlines
// Wrap each word so it can rise out of a mask, keeping the teal accent words.
document.querySelectorAll(".rise").forEach((el) => {
  const words = [];
  el.childNodes.forEach((node) => {
    const cls = node.nodeType === 1 ? node.className : "";
    (node.textContent || "").split(/\s+/).filter(Boolean).forEach((w) => words.push({ w, cls }));
  });
  el.setAttribute("aria-label", el.textContent.replace(/\s+/g, " ").trim());
  el.innerHTML = words
    .map(({ w, cls }, i) => `<span class="w" aria-hidden="true"><span class="${cls}" style="--i:${i}">${w}</span></span>`)
    .join(" ");
});

// Stagger anything that comes in as a group.
document.querySelectorAll(".tile").forEach((t, i) => t.style.setProperty("--delay", `${(i % 4) * 0.06 + Math.floor(i / 4) * 0.1}s`));
document.querySelectorAll(".toggle-row").forEach((t, i) => t.style.setProperty("--delay", `${0.2 + i * 0.12}s`));
document.querySelectorAll(".sort-files span, .sort-people span").forEach((t) => {
  t.style.setProperty("--i", [...t.parentElement.children].indexOf(t));
});

// ------------------------------------------------------------------ on scroll
const seen = new IntersectionObserver(
  (entries) => {
    for (const e of entries) {
      if (!e.isIntersecting) continue;
      e.target.classList.add("in");
      if (e.target.matches(".stats")) countUp(e.target);
      seen.unobserve(e.target);
    }
  },
  { threshold: 0.18, rootMargin: "0px 0px -6% 0px" },
);
document.querySelectorAll(".rise, .reveal, .tilt-in, .tiles").forEach((el) => seen.observe(el));

function countUp(root) {
  root.querySelectorAll("[data-count]").forEach((el, i) => {
    const to = Number(el.dataset.count);
    if (calm) return;
    const start = performance.now() + i * 120;
    const tick = (now) => {
      const t = Math.min(1, Math.max(0, (now - start) / 1200));
      el.textContent = Math.round(to * (1 - Math.pow(1 - t, 4)));
      if (t < 1) requestAnimationFrame(tick);
    };
    el.textContent = "0";
    requestAnimationFrame(tick);
  });
}

// ------------------------------------------------------------------ word cycles
function cycle(container, every) {
  const items = [...container.children];
  let i = 0;
  items[0].classList.add("on");
  if (calm) return;
  setInterval(() => {
    const prev = items[i];
    i = (i + 1) % items.length;
    prev.classList.remove("on");
    prev.classList.add("off");
    setTimeout(() => prev.classList.remove("off"), 600);
    items[i].classList.add("on");
  }, every);
}
document.querySelectorAll(".cycle-words").forEach((c) => cycle(c, 1300));
document.querySelectorAll(".yours-word").forEach((c) => cycle(c, 1500));

// ------------------------------------------------------------------ hero paperwork
// The paperwork the ad opens on, drifting behind the headline.
const PAPERS = [
  ["card", "Driver Licence", "Expires ??/??/20??"],
  ["heart", "Coal Board Medical", "Due for renewal"],
  ["doc", "Working at Heights", "RIIWHS204E"],
  ["calendar", "Timesheet — week 43", "Not signed"],
  ["roster", "Roster_FINAL_v7.xlsx", "Last edited by ?"],
  ["inbox", "Inbox", "214 unread"],
  ["chat", "Crew group chat", "86 new messages"],
  ["plane", "Flight booking form", "Sent? Confirmed?"],
];
const papers = document.querySelector(".papers");
if (papers && !calm && window.innerWidth > 700) {
  const spots = [
    [4, 8], [30, 3], [56, 6], [82, 12], [2, 72], [44, 86], [70, 78], [88, 54],
  ];
  PAPERS.forEach(([icon, label, sub], i) => {
    const p = document.createElement("div");
    p.className = "paper";
    const [x, y] = spots[i];
    const depth = 0.55 + ((i * 37) % 10) / 22;
    p.style.cssText = `left:${x}%;top:${y}%;opacity:${0.14 + depth * 0.18};scale:${depth};filter:blur(${(1 - depth) * 4}px);
      rotate:${((i * 53) % 17) - 8}deg;--t:${9 + (i % 4) * 2}s;--dx:${((i * 29) % 40) - 20}px;--dy:${((i * 41) % 50) - 25}px;--r2:${((i * 19) % 10) - 5}deg`;
    p.innerHTML = `<i>${svg(icon)}</i><div><b>${label}</b><small>${sub}</small></div>`;
    papers.appendChild(p);
  });
}

// ------------------------------------------------------------------ nav
const nav = document.querySelector(".nav");
const onScroll = () => nav.classList.toggle("scrolled", window.scrollY > 10);
window.addEventListener("scroll", onScroll, { passive: true });
onScroll();

// ------------------------------------------------------------------ tour
// Only when the page has one: there is no tour video yet. Adding one is a
// .tour dialog holding the <video>, and a [data-open-tour] button to open it.
const tour = document.querySelector(".tour");
if (tour) {
  const video = tour.querySelector("video");
  let opener = null;
  const closeTour = () => {
    video.pause();
    tour.hidden = true;
    opener?.focus();
  };
  document.querySelectorAll("[data-open-tour]").forEach((b) =>
    b.addEventListener("click", () => {
      opener = b;
      tour.hidden = false;
      tour.querySelector(".tour-close").focus();
      video.play().catch(() => {});
    }),
  );
  tour.querySelector(".tour-close").addEventListener("click", closeTour);
  tour.addEventListener("click", (e) => e.target === tour && closeTour());
  document.addEventListener("keydown", (e) => e.key === "Escape" && !tour.hidden && closeTour());
}
