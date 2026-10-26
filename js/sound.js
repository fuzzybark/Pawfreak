// ==========================================
//  🔊 procedural 8-bit sound effects
//  zero audio files, pure web audio oscillators :D
// ==========================================

class RetroAudio {
  constructor() {
    this.ctx = null;
    this.muted = localStorage.getItem("pawfreak_muted") === "true";
  }

  init() {
    if (!this.ctx && typeof window !== "undefined") {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume();
    }
  }

  isMuted() {
    return this.muted;
  }

  toggleMute() {
    this.muted = !this.muted;
    localStorage.setItem("pawfreak_muted", this.muted ? "true" : "false");
    if (!this.muted) {
      this.init();
      this.playBlip(600, 900, "sine", 0.08);
    }
    return this.muted;
  }

  // Base tone generator
  playTone(freq, type = "sine", duration = 0.08, startGain = 0.15) {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

      gain.gain.setValueAtTime(startGain, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + duration);
    } catch (e) {
      // Audio playback can occasionally be blocked prior to user interaction
    }
  }

  playBlip(startFreq, endFreq, type = "square", duration = 0.07, maxGain = 0.12) {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(startFreq, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(endFreq, this.ctx.currentTime + duration);

      gain.gain.setValueAtTime(maxGain, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + duration);
    } catch (e) {}
  }

  // UI Click
  click() {
    this.playBlip(800, 300, "square", 0.04, 0.08);
  }

  // Terminal Keypress
  terminalKey() {
    this.playTone(400 + Math.random() * 80, "triangle", 0.02, 0.04);
  }

  // Terminal Enter / Execution
  terminalEnter() {
    this.playBlip(520, 780, "square", 0.06, 0.09);
  }

  // Pet the Fuzzy!
  pet() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6 arpeggio
    notes.forEach((freq, idx) => {
      setTimeout(() => {
        this.playTone(freq, "triangle", 0.12, 0.14);
      }, idx * 60);
    });
  }

  // Hamburger Mascot Click / Bork
  bork() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    // Dual pitch cute dog bark simulation
    this.playBlip(240, 140, "sawtooth", 0.14, 0.16);
    setTimeout(() => {
      this.playBlip(320, 180, "sine", 0.16, 0.14);
    }, 40);
  }

  // Theme switch warp
  theme() {
    this.playBlip(250, 950, "sine", 0.16, 0.12);
  }

  // Easter egg victory chime
  fanfare() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    const notes = [440, 554.37, 659.25, 880];
    notes.forEach((freq, idx) => {
      setTimeout(() => {
        this.playTone(freq, "square", 0.18, 0.13);
      }, idx * 90);
    });
  }
}

const Sound = new RetroAudio();
if (typeof window !== "undefined") {
  window.Sound = Sound;
}
