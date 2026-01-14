/* ==========================
   Shared utilities
   ========================== */

function setCurrentNav() {
  const path = location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll(".navlinks a").forEach(a => {
    const href = a.getAttribute("href");
    if (href === path) a.setAttribute("aria-current", "page");
    else a.removeAttribute("aria-current");
  });
}

function prefersReducedMotion() {
  return window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function animateCount(el, to, suffix="") {
  if (prefersReducedMotion()) {
    el.textContent = `${to}${suffix}`;
    return;
  }
  const start = 0;
  const duration = 900;
  const startTime = performance.now();
  function tick(now){
    const p = Math.min(1, (now - startTime) / duration);
    const val = Math.round(start + (to - start) * (p*p*(3-2*p))); // smoothstep
    el.textContent = `${val}${suffix}`;
    if (p < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

function observeCounters() {
  const counters = document.querySelectorAll("[data-count]");
  if (!counters.length) return;

  const io = new IntersectionObserver(entries => {
    for (const e of entries) {
      if (e.isIntersecting) {
        const el = e.target;
        const to = Number(el.getAttribute("data-count"));
        const suffix = el.getAttribute("data-suffix") || "";
        animateCount(el, to, suffix);
        io.unobserve(el);
      }
    }
  }, {threshold: 0.25});

  counters.forEach(c => io.observe(c));
}

/* ==========================
   Share helpers
   ========================== */
async function sharePage() {
  const url = location.href;
  const title = document.title;
  const text = "Learning about how low income—rooted in colonial systems—impacts quality of life in First Nations communities.";
  if (navigator.share) {
    try { await navigator.share({ title, text, url }); }
    catch (_) {}
  } else {
    await copyToClipboard(url);
    alert("Link copied. You can paste it into a message or post.");
  }
}

async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
  } catch (e) {
    const ta = document.createElement("textarea");
    ta.value = text;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand("copy");
    ta.remove();
  }
}

/* ==========================
   Impacts page: tabbed sections
   ========================== */
function setupTabs() {
  const tablist = document.querySelector("[data-tablist]");
  if (!tablist) return;

  const tabs = Array.from(tablist.querySelectorAll("[role='tab']"));
  const panels = Array.from(document.querySelectorAll("[role='tabpanel']"));

  function activate(id) {
    tabs.forEach(t => t.setAttribute("aria-selected", String(t.dataset.tab === id)));
    panels.forEach(p => p.hidden = p.dataset.panel !== id);
  }

  tabs.forEach(t => {
    t.addEventListener("click", () => activate(t.dataset.tab));
    t.addEventListener("keydown", (e) => {
      const i = tabs.indexOf(t);
      if (e.key === "ArrowRight" || e.key === "ArrowDown") {
        e.preventDefault(); tabs[(i+1) % tabs.length].focus();
      } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        e.preventDefault(); tabs[(i-1+tabs.length) % tabs.length].focus();
      }
    });
  });

  // default first
  activate(tabs[0].dataset.tab);
}

/* ==========================
   Stat drawers
   ========================== */
function setupStatDrawers() {
  document.querySelectorAll(".stat").forEach(stat => {
    stat.addEventListener("click", () => {
      const drawer = stat.querySelector(".drawer");
      if (!drawer) return;
      drawer.classList.toggle("open");
      stat.setAttribute("aria-expanded", drawer.classList.contains("open") ? "true" : "false");
    });
    stat.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        stat.click();
      }
    });
  });
}

/* ==========================
   Flip cards
   ========================== */
function setupFlipCards() {
  document.querySelectorAll(".flip").forEach(card => {
    const btn = card.querySelector("button");
    btn?.addEventListener("click", () => {
      card.classList.toggle("is-flipped");
      const expanded = card.classList.contains("is-flipped");
      btn.setAttribute("aria-expanded", expanded ? "true" : "false");
    });
  });
}

/* ==========================
   Quiz
   ========================== */
function setupQuiz() {
  const quiz = document.querySelector("[data-quiz]");
  if (!quiz) return;

  quiz.addEventListener("change", (e) => {
    const input = e.target;
    if (!(input instanceof HTMLInputElement)) return;
    if (!input.name) return;

    const qEl = input.closest(".q");
    const feedback = qEl?.querySelector(".feedback");
    if (!feedback) return;

    const correct = input.dataset.correct === "true";
    feedback.classList.add("show");
    feedback.classList.toggle("bad", !correct);

    // lock question after answer
    qEl.querySelectorAll("input").forEach(i => i.disabled = true);
  });

  const resetBtn = document.querySelector("[data-quiz-reset]");
  resetBtn?.addEventListener("click", () => location.reload());
}

/* ==========================
   Init
   ========================== */
document.addEventListener("DOMContentLoaded", () => {
  setCurrentNav();
  observeCounters();
  setupTabs();
  setupStatDrawers();
  setupFlipCards();
  setupQuiz();

  document.querySelectorAll("[data-share]").forEach(btn => {
    btn.addEventListener("click", sharePage);
  });

  document.querySelectorAll("[data-copy-link]").forEach(btn => {
    btn.addEventListener("click", async () => {
      await copyToClipboard(location.href);
      btn.textContent = "Copied!";
      setTimeout(() => btn.textContent = "Copy link", 1200);
    });
  });
});
