// ==========================================
//  📟 mechanical rolling visitor counter
// ==========================================

class VisitorCounter {
  constructor() {
    this.key = (window.CONFIG && window.CONFIG.counter && window.CONFIG.counter.key) || "pawfreak-com-counter";
    this.apiBase = (window.CONFIG && window.CONFIG.counter && window.CONFIG.counter.apiBase) || "https://countapi.mileshilliard.com/api/v1";
    this.fallbackInitial = (window.CONFIG && window.CONFIG.counter && typeof window.CONFIG.counter.fallbackInitialCount === "number")
      ? window.CONFIG.counter.fallbackInitialCount
      : 0;
    this.count = 0;
    this.sessionVisits = 0;

    // Reset legacy counter value if it was initialized with 1337 in previous tests
    const prev = parseInt(localStorage.getItem("pawfreak_last_count") || "0", 10);
    if (prev >= 1300) {
      localStorage.removeItem("pawfreak_last_count");
      sessionStorage.removeItem("pawfreak_hit_registered");
    }
  }

  async init() {
    this.trackSession();
    await this.fetchRealCount();
    this.render();
  }

  trackSession() {
    // Track session visits
    let sess = parseInt(sessionStorage.getItem("pawfreak_session_views") || "0", 10);
    sess += 1;
    sessionStorage.setItem("pawfreak_session_views", sess.toString());
    this.sessionVisits = sess;
  }

  async fetchRealCount() {
    // Check if we already hit CountAPI in this session (avoid inflating on every F5 refresh in 10s if desired, or count every pageview)
    const hasCountedInSession = sessionStorage.getItem("pawfreak_hit_registered");

    try {
      const endpoint = hasCountedInSession
        ? `${this.apiBase}/get/${this.key}`
        : `${this.apiBase}/hit/${this.key}`;

      const res = await fetch(endpoint, {
        headers: { "Accept": "application/json" },
        cache: "no-store"
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const data = await res.json();
      if (typeof data.value === "number") {
        this.count = data.value + this.fallbackInitial;
        localStorage.setItem("pawfreak_last_count", this.count.toString());
        sessionStorage.setItem("pawfreak_hit_registered", "true");
        return;
      }
    } catch (err) {
      console.warn("CountAPI network notice (using cached/fallback):", err.message);
    }

    // Fallback: use persistent localStorage count
    let cached = parseInt(localStorage.getItem("pawfreak_last_count") || "0", 10);
    if (!cached || cached < this.fallbackInitial) {
      cached = this.fallbackInitial + this.sessionVisits;
    } else {
      if (!hasCountedInSession) cached += 1;
    }
    this.count = cached;
    localStorage.setItem("pawfreak_last_count", cached.toString());
    sessionStorage.setItem("pawfreak_hit_registered", "true");
  }

  render() {
    const odometerEl = document.getElementById("visitor-odometer");
    const sessionCountEl = document.getElementById("session-count-val");

    if (sessionCountEl) {
      sessionCountEl.textContent = this.sessionVisits.toString().padStart(2, "0");
    }

    if (!odometerEl) return;

    // Format number to 6 digits with leading zeros e.g. 001338
    const digitsStr = this.count.toString().padStart(6, "0");
    odometerEl.innerHTML = "";

    // Build retro odometer roller drums
    [...digitsStr].forEach((digit, i) => {
      const drum = document.createElement("div");
      drum.className = "odometer-drum";
      
      const inner = document.createElement("div");
      inner.className = "odometer-inner";

      // Render stack of numbers 0-9
      for (let n = 0; n <= 9; n++) {
        const numSpan = document.createElement("span");
        numSpan.className = "odometer-num";
        numSpan.textContent = n.toString();
        inner.appendChild(numSpan);
      }

      drum.appendChild(inner);
      odometerEl.appendChild(drum);

      // Trigger rolling animation with slight delay per drum
      setTimeout(() => {
        const targetDigit = parseInt(digit, 10);
        inner.style.transform = `translateY(-${targetDigit * 10}%)`;
      }, 100 + i * 80);
    });
  }
}

const Counter = new VisitorCounter();
if (typeof window !== "undefined") {
  window.Counter = Counter;
}
