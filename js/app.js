// ==========================================
//  🐾 fuzzy's main app controller
// ==========================================

document.addEventListener("DOMContentLoaded", () => {
  App.init();
});

const App = {
  init() {
    this.initTheme();
    this.initCrt();
    this.initAudioUI();
    this.initClock();
    this.initHamburgerMascot();
    this.initAboutTabs();
    this.initSocials();
    this.initWebring();
    this.initBackToTop();

    // spin up modules
    if (window.Counter) window.Counter.init();
    if (window.Spotify) window.Spotify.init();
    if (window.Terminal) window.Terminal.init();

    console.log("%c🐾 PAWFREAK // CYBER LAIR READY :3", "color: #facc15; background: #581c87; font-size: 13px; padding: 4px 8px; font-weight: bold; border-radius: 3px;");
  },

  // dark / light mode toggle
  initTheme() {
    const savedTheme = localStorage.getItem("pawfreak_theme") || "dark";
    if (savedTheme === "light") {
      document.body.classList.add("light-mode");
    } else {
      document.body.classList.remove("light-mode");
    }

    const themeBtn = document.getElementById("theme-toggle-btn");
    if (themeBtn) {
      themeBtn.addEventListener("click", () => {
        const isLight = document.body.classList.toggle("light-mode");
        localStorage.setItem("pawfreak_theme", isLight ? "light" : "dark");
        if (window.Sound) window.Sound.theme();
      });
    }
  },

  // crt scanline toggle
  initCrt() {
    const savedCrt = localStorage.getItem("pawfreak_crt") !== "false";
    if (savedCrt) {
      document.body.classList.add("crt-active");
    } else {
      document.body.classList.remove("crt-active");
    }

    const crtBtn = document.getElementById("crt-toggle-btn");
    if (crtBtn) {
      crtBtn.addEventListener("click", () => {
        const active = document.body.classList.toggle("crt-active");
        localStorage.setItem("pawfreak_crt", active ? "true" : "false");
        if (window.Sound) window.Sound.click();
      });
    }
  },

  // 8-bit sound effects button
  initAudioUI() {
    const soundBtn = document.getElementById("sound-toggle-btn");
    const updateIcon = () => {
      if (!soundBtn) return;
      const muted = window.Sound ? window.Sound.isMuted() : false;
      soundBtn.textContent = muted ? "🔇 MUTE" : "🔊 SFX: ON";
      soundBtn.classList.toggle("is-muted", muted);
    };

    updateIcon();

    if (soundBtn) {
      soundBtn.addEventListener("click", () => {
        if (window.Sound) {
          window.Sound.toggleMute();
          updateIcon();
        }
      });
    }

    // click sound for retro feel
    document.querySelectorAll("button, .nav-btn, .tab-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        if (window.Sound && !btn.id.includes("sound-toggle")) {
          window.Sound.click();
        }
      });
    });
  },

  // live system clock in header
  initClock() {
    const clockEl = document.getElementById("live-clock");
    const update = () => {
      if (!clockEl) return;
      const d = new Date();
      const yr = d.getFullYear();
      const mo = (d.getMonth() + 1).toString().padStart(2, "0");
      const da = d.getDate().toString().padStart(2, "0");
      const hr = d.getHours().toString().padStart(2, "0");
      const mi = d.getMinutes().toString().padStart(2, "0");
      const sc = d.getSeconds().toString().padStart(2, "0");
      clockEl.textContent = `${yr}-${mo}-${da} ${hr}:${mi}:${sc}`;
    };
    update();
    setInterval(update, 1000);
  },

  // hamburger mascot wiggle & speech bubbles
  initHamburgerMascot() {
    const mascotImg = document.getElementById("mascot-avatar");
    this.updateMascotQuote();

    if (mascotImg) {
      mascotImg.addEventListener("click", () => {
        mascotImg.classList.remove("mascot-wiggle");
        void mascotImg.offsetWidth;
        mascotImg.classList.add("mascot-wiggle");

        if (window.Sound) {
          if (Math.random() > 0.4) {
            window.Sound.bork();
          } else {
            window.Sound.pet();
          }
        }

        this.updateMascotQuote();
      });
    }
  },

  updateMascotQuote() {
    const bubbleText = document.getElementById("mascot-bubble-text");
    if (!bubbleText || !window.CONFIG || !window.CONFIG.mascotQuotes) return;

    const quotes = Array.isArray(window.CONFIG.mascotQuotes)
      ? window.CONFIG.mascotQuotes
      : (window.CONFIG.mascotQuotes.en || []);
    if (quotes.length === 0) return;
    const picked = quotes[Math.floor(Math.random() * quotes.length)];
    bubbleText.textContent = picked;
  },

  // tabs in about window
  initAboutTabs() {
    const tabBtns = document.querySelectorAll(".about-tab-btn");
    const tabPanels = document.querySelectorAll(".about-tab-panel");

    tabBtns.forEach(btn => {
      btn.addEventListener("click", () => {
        const targetTab = btn.getAttribute("data-tab");

        tabBtns.forEach(b => b.classList.remove("active"));
        tabPanels.forEach(p => p.classList.remove("active"));

        btn.classList.add("active");
        const panel = document.getElementById(`about-panel-${targetTab}`);
        if (panel) panel.classList.add("active");

        if (window.Sound) window.Sound.click();
      });
    });
  },

  // socials & profile cards
  initSocials() {
    const container = document.getElementById("socials-container");
    if (!container || !window.CONFIG || !window.CONFIG.socials) return;

    container.innerHTML = "";
    window.CONFIG.socials.forEach(s => {
      const card = document.createElement("div");
      card.className = "social-card";
      card.style.borderColor = s.color || "#8b5cf6";

      const isCopy = s.action === "copy";
      const hint = isCopy ? "Click to copy tag!" : "Visit link ↗";

      card.innerHTML = `
        <div class="social-icon">${s.icon}</div>
        <div class="social-details">
          <div class="social-label" style="color: ${s.color || '#facc15'}">${s.label}</div>
          <div class="social-value">${s.value}</div>
          <div class="social-hint">${hint}</div>
        </div>
      `;

      card.addEventListener("click", () => {
        if (isCopy) {
          navigator.clipboard.writeText(s.value).then(() => {
            this.showToast(`${s.label}: ${s.value} copied!`);
            if (window.Sound) window.Sound.pet();
          }).catch(() => {
            window.open(s.url, "_blank");
          });
        } else {
          if (window.Sound) window.Sound.click();
          window.open(s.url, "_blank");
        }
      });

      container.appendChild(card);
    });
  },

  // cute toast notification
  showToast(msg) {
    let toast = document.getElementById("retro-toast");
    if (!toast) {
      toast = document.createElement("div");
      toast.id = "retro-toast";
      toast.className = "retro-toast";
      document.body.appendChild(toast);
    }
    toast.textContent = msg;
    toast.classList.add("show");
    setTimeout(() => {
      toast.classList.remove("show");
    }, 2800);
  },

  // indie webring clicker
  initWebring() {
    const prevBtn = document.getElementById("webring-prev");
    const nextBtn = document.getElementById("webring-next");
    const randBtn = document.getElementById("webring-random");

    const sites = [
      "https://neocities.org",
      "https://sadgrl.online",
      "https://cyber.dabamos.de/88x31/",
      "https://yesterweb.org"
    ];

    const pickRandom = (e) => {
      e.preventDefault();
      const site = sites[Math.floor(Math.random() * sites.length)];
      if (window.Sound) window.Sound.click();
      window.open(site, "_blank");
    };

    if (randBtn) randBtn.addEventListener("click", pickRandom);
    if (prevBtn) prevBtn.addEventListener("click", pickRandom);
    if (nextBtn) nextBtn.addEventListener("click", pickRandom);
  },

  // scroll back to top button
  initBackToTop() {
    const topBtn = document.getElementById("back-to-top-btn");
    if (topBtn) {
      topBtn.addEventListener("click", (e) => {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: "smooth" });
        if (window.Sound) window.Sound.click();
      });
    }
  }
};

window.App = App;
