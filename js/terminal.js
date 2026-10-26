// ==========================================
//  💻 pawsh - fuzzy's retro terminal emulator
//  handles commands, easter eggs, & cozy dog ASCII :3
// ==========================================

class RetroTerminal {
  constructor() {
    this.history = [];
    this.historyIndex = -1;
    this.commands = {};
    this.petCount = parseInt(localStorage.getItem("pawfreak_pet_count") || "0", 10);
    this.startTime = Date.now();
    this.isMatrixRunning = false;
  }

  init() {
    this.outputEl = document.getElementById("terminal-output");
    this.inputEl = document.getElementById("terminal-input");
    this.promptUserEl = document.getElementById("terminal-prompt-user");

    if (!this.inputEl || !this.outputEl) return;

    this.registerCommands();
    this.setupEventListeners();
    this.setupQuickChips();
    this.printGreeting();
  }

  registerCommands() {
    this.commands = {
      help: {
        desc: "List all available terminal commands",
        exec: () => this.cmdHelp()
      },
      clear: {
        desc: "Clear the terminal screen",
        exec: () => this.cmdClear()
      },
      history: {
        desc: "Display previously executed commands",
        exec: () => this.cmdHistory()
      },
      date: {
        desc: "Print current date, time, and timezone",
        exec: () => this.cmdDate()
      },
      echo: {
        desc: "Print text back to the terminal",
        exec: (args) => this.cmdEcho(args)
      },
      neofetch: {
        desc: "Display system specs and ASCII mascot art",
        exec: () => this.cmdNeofetch()
      },
      exit: {
        desc: "Simulate terminal shutdown and reboot",
        exec: () => this.cmdExit()
      },
      pet: {
        desc: "Pet Hamburger the fuzzy mascot dog",
        exec: () => this.cmdPet()
      },
      about: {
        desc: "Print creator information directly in CLI",
        exec: () => this.cmdAbout()
      },
      socials: {
        desc: "Display social profiles and links",
        exec: () => this.cmdSocials()
      },
      music: {
        desc: "Show current Spotify track info",
        exec: () => this.cmdMusic()
      },
      spotify: {
        desc: "Alias for 'music'",
        exec: () => this.cmdMusic()
      },
      theme: {
        desc: "Switch website theme (dark, light, cyber)",
        exec: (args) => this.cmdTheme(args)
      },
      lang: {
        desc: "Switch language: 'lang en' or 'lang pl'",
        exec: (args) => this.cmdLang(args)
      },
      sl: {
        desc: "An ASCII steam locomotive runs across your screen!",
        exec: () => this.cmdSl()
      },
      matrix: {
        desc: "Toggle falling digital rain in the terminal",
        exec: () => this.cmdMatrix()
      },
      cowsay: {
        desc: "ASCII animal speaks your message",
        exec: (args) => this.cmdCowsay(args)
      },
      dogsay: {
        desc: "Cute ASCII dog speaks your message",
        exec: (args) => this.cmdDogsay(args)
      },
      fuzsay: {
        desc: "Alias for 'dogsay'",
        exec: (args) => this.cmdDogsay(args)
      },
      "1987": {
        hidden: true,
        desc: "Five Nights at Freddy's easter egg",
        exec: () => this.cmd1987()
      },
      "1897": {
        hidden: true,
        desc: "Five Nights at Freddy's easter egg (alias)",
        exec: () => this.cmd1987()
      },
      quote: {
        desc: "Display a random retro cyber fortune",
        exec: () => this.cmdQuote()
      },
      fortune: {
        desc: "Alias for 'quote'",
        exec: () => this.cmdQuote()
      },
      whoami: {
        desc: "Display current user session information",
        exec: () => this.cmdWhoami()
      },
      sudo: {
        desc: "Superuser execution (easter egg)",
        exec: () => this.cmdSudo()
      },
      hamburger: {
        desc: "Mascot easter egg and sound",
        exec: () => this.cmdHamburger()
      },
      bork: {
        desc: "Make Hamburger bork!",
        exec: () => this.cmdBork()
      },
      secret: {
        desc: "Unlock the hidden lair secret",
        exec: () => this.cmdSecret()
      }
    };
  }

  setupEventListeners() {
    this.inputEl.addEventListener("keydown", (e) => {
      // Sound on keypress
      if (window.Sound && e.key.length === 1) {
        window.Sound.terminalKey();
      }

      if (e.key === "Enter") {
        e.preventDefault();
        const cmdText = this.inputEl.value.trim();
        if (cmdText) {
          this.executeCommand(cmdText);
          this.history.push(cmdText);
          this.historyIndex = this.history.length;
          this.inputEl.value = "";
        }
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        if (this.history.length > 0 && this.historyIndex > 0) {
          this.historyIndex--;
          this.inputEl.value = this.history[this.historyIndex];
        }
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        if (this.historyIndex < this.history.length - 1) {
          this.historyIndex++;
          this.inputEl.value = this.history[this.historyIndex];
        } else {
          this.historyIndex = this.history.length;
          this.inputEl.value = "";
        }
      } else if (e.key === "Tab") {
        e.preventDefault();
        this.handleTabComplete();
      }
    });

    // Keep focus when clicking inside terminal body
    const termBody = document.getElementById("terminal-body");
    if (termBody) {
      termBody.addEventListener("click", () => {
        this.inputEl.focus();
      });
    }

    // Terminal window buttons
    const clearBtn = document.getElementById("terminal-btn-clear");
    if (clearBtn) {
      clearBtn.addEventListener("click", () => this.cmdClear());
    }
  }

  setupQuickChips() {
    const chips = document.querySelectorAll(".cmd-chip");
    chips.forEach(chip => {
      chip.addEventListener("click", () => {
        const cmd = chip.getAttribute("data-cmd");
        if (cmd) {
          if (window.Sound) window.Sound.click();
          this.inputEl.value = cmd;
          this.executeCommand(cmd);
          this.history.push(cmd);
          this.historyIndex = this.history.length;
          this.inputEl.value = "";
          this.inputEl.focus();
        }
      });
    });
  }

  handleTabComplete() {
    const cur = this.inputEl.value.trim().toLowerCase();
    if (!cur) return;
    const matches = Object.keys(this.commands).filter(c => c.startsWith(cur));
    if (matches.length === 1) {
      this.inputEl.value = matches[0] + " ";
    } else if (matches.length > 1) {
      this.printLine(`<span class="term-dim">${matches.join("  ")}</span>`);
    }
  }

  executeCommand(fullCmd) {
    if (window.Sound) window.Sound.terminalEnter();

    // Echo command line
    const userPrompt = this.promptUserEl ? this.promptUserEl.textContent : "pawfreak@retro-os:~$";
    this.printLine(`<div class="term-cmd-echo"><span class="term-prompt">${userPrompt}</span> <span class="term-cmd-text">${this.escapeHtml(fullCmd)}</span></div>`);

    const parts = fullCmd.split(" ").filter(p => p.length > 0);
    const cmdName = parts[0].toLowerCase();
    const args = parts.slice(1);

    if (this.commands[cmdName]) {
      this.commands[cmdName].exec(args);
    } else {
      this.printLine(`<span class="term-err">pawsh: command not found: '${this.escapeHtml(cmdName)}'. Type 'help' for available commands.</span>`);
    }

    this.scrollToBottom();
  }

  printLine(html) {
    const line = document.createElement("div");
    line.className = "term-line";
    line.innerHTML = html;
    this.outputEl.appendChild(line);
    this.scrollToBottom();
  }

  scrollToBottom() {
    const termBody = document.getElementById("terminal-body");
    if (termBody) {
      termBody.scrollTop = termBody.scrollHeight;
    }
  }

  escapeHtml(str) {
    return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  // --- commands ---

  printGreeting() {
    this.printLine(`
<pre class="term-ascii-logo">
   ___  ___ _    _____  ___ ___ ___   _   _  __
  / _ \\/ _ \\ | /| / / _/ _ \\ __/ _ \\ /_\\ | |/ /
 / ___/ __ | |/ |/ / _/ , _/ _/ __ |/ _ \\| ' &lt; 
/_/  /_/ |_|__/|__/_//_/|_/___/_/ |_/_/ \\_\\_|\\_\\
</pre>
<div class="term-highlight">FuzzyOS Pawsh Terminal v2.0</div>
<div class="term-dim">Type '<span class="term-yellow">help</span>' for available commands or '<span class="term-yellow">pet</span>' to pet the fuzzy.</div>
<div class="term-divider">----------------------------------------------------</div>
`);
  }

  cmdHelp() {
    let out = `<div class="term-highlight">Available commands:</div><br>`;
    out += `<div class="term-help-grid">`;
    for (const [cmd, data] of Object.entries(this.commands)) {
      if (data.hidden) continue;
      out += `<div class="term-help-row"><span class="term-yellow">${cmd.padEnd(10, " ")}</span> <span class="term-dim">- ${data.desc}</span></div>`;
    }
    out += `</div><br><span class="term-dim">Tip: Use Up/Down arrows for history, Tab for autocompletion.</span>`;
    this.printLine(out);
  }

  cmdClear() {
    this.outputEl.innerHTML = "";
    if (window.Sound) window.Sound.click();
  }

  cmdHistory() {
    if (this.history.length === 0) {
      this.printLine(`<span class="term-dim">No commands in history yet.</span>`);
      return;
    }
    let out = `<div class="term-highlight">Command History:</div>`;
    this.history.forEach((cmd, idx) => {
      out += `<div><span class="term-dim">${(idx + 1).toString().padStart(3, " ")}:</span> ${this.escapeHtml(cmd)}</div>`;
    });
    this.printLine(out);
  }

  cmdDate() {
    const now = new Date();
    this.printLine(`<span class="term-yellow">${now.toString()}</span>`);
  }

  cmdEcho(args) {
    this.printLine(`<div>${this.escapeHtml(args.join(" "))}</div>`);
  }

  cmdPet() {
    this.petCount++;
    localStorage.setItem("pawfreak_pet_count", this.petCount.toString());
    if (window.Sound) window.Sound.pet();

    const msg = "you pet a fuzzy! *happy tail wags and soft borks* [Achievement unlocked: Good Boy]";
    const dogAscii = `
<pre class="term-ascii-dog">
        / \\__
       (    @\\___
       /         O   *tail wagging intensifies*
      /   (_____/    "${msg.split("[")[0].trim()}"
     /_____/   U     *happy soft borks*
</pre>
<div class="term-highlight">[★ Total Pets: ${this.petCount} ★]</div>
`;
    this.printLine(dogAscii);
  }

  cmdNeofetch() {
    const uptimeSec = Math.floor((Date.now() - this.startTime) / 1000);
    const mins = Math.floor(uptimeSec / 60);
    const secs = uptimeSec % 60;
    const uptimeStr = `${mins}m ${secs}s`;

    const out = `
<div class="neofetch-container">
<pre class="neofetch-art">
  __      __
 /  \\.-""-.\\  \\
 \\_ /  o  o \\ _/
  |    ^    |
  \\  '-^-'  /
   \`'-----'\`
     DOGGO
</pre>
<div class="neofetch-info">
  <div class="neo-title"><span class="term-yellow">fuzzy</span>@<span class="term-purple">pawfreak</span></div>
  <div class="term-dim">-----------------------</div>
  <div><span class="neo-key">os:</span> FuzzyOS X (x86_64)</div>
  <div><span class="neo-key">host:</span> SillyBeans-9000</div>
  <div><span class="neo-key">kernel:</span> 6.7.420-fuzzy</div>
  <div><span class="neo-key">theme:</span> purple &amp; yellow</div>
  <div><span class="neo-key">Mascot:</span> Hamburger</div>
  <div><span class="neo-key">uptime:</span> ${uptimeStr}</div>
  <div><span class="neo-key">shell:</span> pawsh v2.0</div>
  <div class="neo-palette">
    <span class="swatch sw-black"></span>
    <span class="swatch sw-purple-dark"></span>
    <span class="swatch sw-purple"></span>
    <span class="swatch sw-purple-light"></span>
    <span class="swatch sw-yellow"></span>
    <span class="swatch sw-yellow-light"></span>
    <span class="swatch sw-white"></span>
  </div>
</div>
</div>`;
    this.printLine(out);
  }

  cmdExit() {
    if (window.Sound) window.Sound.click();
    this.printLine(`<span class="term-err">Rebooting FuzzyOS Pawsh shell...</span>`);
    setTimeout(() => {
      this.cmdClear();
      this.printGreeting();
    }, 1200);
  }

  cmdAbout() {
    this.printLine(`<div><span class="term-yellow">Fuzzy:</span> A silly goofster who tinkers with tech!</div>
<div><span class="term-purple">Favorite colors:</span> lavender purple &amp; pastel shades of yellow.. <span class="term-yellow">Companion:</span> Hamburger Mascot</div>
<div><span class="term-highlight">Style:</span> 🐶🐾🐾</div>`);
  }

  cmdSocials() {
    if (!window.CONFIG || !window.CONFIG.socials) return;
    let out = `<div class="term-highlight">Social Channels & Links:</div><br>`;
    window.CONFIG.socials.forEach(s => {
      out += `<div>${s.icon} <span class="term-yellow">${s.label.padEnd(12, " ")}:</span> <a href="${s.url}" target="_blank" class="term-link">${s.value}</a></div>`;
    });
    this.printLine(out);
  }

  cmdMusic() {
    const sp = window.Spotify;
    if (sp && sp.isPlaying && sp.currentTrack) {
      const tr = sp.currentTrack;
      this.printLine(`
<div class="term-highlight">🎵 Currently Listening to on Spotify:</div>
<div><span class="term-yellow">Track:</span> ${this.escapeHtml(tr.title)}</div>
<div><span class="term-yellow">Artist:</span> ${this.escapeHtml(tr.artist)}</div>
<div><span class="term-yellow">Album:</span> ${this.escapeHtml(tr.album || "Unknown")}</div>
<div><span class="term-yellow">Link:</span> <a href="${tr.spotifyUrl}" target="_blank" class="term-link">${tr.spotifyUrl}</a></div>
`);
    } else {
      this.printLine(`<div class="term-dim">Fuzzy isn't playing music on Spotify right now. Currently resting or away from keyboard! :3</div>`);
    }
  }

  cmdTheme(args) {
    const theme = (args[0] || "").toLowerCase();
    if (theme === "light") {
      document.body.classList.add("light-mode");
      localStorage.setItem("pawfreak_theme", "light");
      this.printLine(`<span class="term-yellow">Switched to Light Mode (Vintage Desktop).</span>`);
    } else if (theme === "dark") {
      document.body.classList.remove("light-mode");
      localStorage.setItem("pawfreak_theme", "dark");
      this.printLine(`<span class="term-purple">Switched to Dark Mode (#101010 CRT Void).</span>`);
    } else {
      // Toggle
      const isLight = document.body.classList.toggle("light-mode");
      localStorage.setItem("pawfreak_theme", isLight ? "light" : "dark");
      this.printLine(`<span>Theme toggled to: <strong>${isLight ? "light" : "dark"}</strong>. (Usage: 'theme dark' or 'theme light')</span>`);
    }
    if (window.Sound) window.Sound.theme();
  }

  cmdLang() {
    this.printLine(`<span>Language is set to English (english-only mode active :3)</span>`);
  }

  cmdSl() {
    if (window.Sound) window.Sound.fanfare();
    const trainFrames = [
      "      (  ) (@@) ( )  (@)  ()    @@    O  ",
      "  (@@@)                                 ",
      "====        ________                ___________ ",
      "_D _|  __   | _____ |   __   __   __ | ________ |",
      " [___| (_) | |_______| |__|_|__|_|__| |__________|\n",
      "  O--O-O     o-o-o-o     o-o-o-o       o-o-o-o  "
    ];
    this.printLine(`<pre class="term-train">${trainFrames.join("\n")}</pre>`);
  }

  cmdMatrix() {
    if (this.isMatrixRunning) {
      this.isMatrixRunning = false;
      this.printLine(`<span class="term-dim">Matrix stream halted.</span>`);
      return;
    }
    this.isMatrixRunning = true;
    this.printLine(`<span class="term-highlight">Waking up the Matrix... Type 'matrix' or 'clear' to halt.</span>`);

    let count = 0;
    const interval = setInterval(() => {
      if (!this.isMatrixRunning || count > 20) {
        clearInterval(interval);
        this.isMatrixRunning = false;
        return;
      }
      const chars = "PAWFREAK1010#8B5CF6#FACC15CYBERVOID0123456789";
      let line = "";
      for (let i = 0; i < 40; i++) {
        line += chars[Math.floor(Math.random() * chars.length)] + " ";
      }
      this.printLine(`<div class="term-matrix-line">${line}</div>`);
      count++;
    }, 100);
  }

  cmdCowsay(args) {
    const text = args.join(" ") || "Hamburgers are delicious.";
    const cow = `
  &lt; ${this.escapeHtml(text)} &gt;
  -------------------------
         \\   ^__^
          \\  (oo)\\_______
             (__)\\       )\\/\\
                 ||----w |
                 ||     ||
`;
    this.printLine(`<pre class="term-yellow">${cow}</pre>`);
  }

  cmdQuote() {
    const quotes = (window.CONFIG && window.CONFIG.quotes) || [
      "The web was better when everyone had their own weird corner of it."
    ];
    const picked = quotes[Math.floor(Math.random() * quotes.length)];
    this.printLine(`<div>💬 <em>"${picked}"</em></div>`);
  }

  cmdWhoami() {
    this.printLine(`<div><strong>guest@pawfreak</strong> (A friendly cyber wanderer traversing the indie web)</div>`);
  }

  cmdSudo() {
    this.printLine(`<div>pawsh: [sudo] password for guest: <br><span class="term-err">Permission denied. Hamburger ate your root access. Here is a cookie instead: 🍪</span></div>`);
  }

  cmdHamburger() {
    if (window.Sound) window.Sound.bork();
    this.printLine(`
<pre class="term-yellow">
     .---.       *bork!*
    /  _  \\      "hamburger says hello!"
   |  (_)  |     [Mascot: Hamburger - 512x512 of Pure Floof]
    \\  -  /
     \`---\`
</pre>
`);
  }

  cmdBork() {
    if (window.Sound) window.Sound.bork();
    this.printLine(`<span class="term-yellow"><strong>*BORK BORK BORK!*</strong> 🐾🐾🐾</span>`);
  }

  cmdSecret() {
    if (window.Sound) window.Sound.fanfare();
    this.printLine(`
<div class="term-highlight">★ SECRET UNLOCKED ★</div>
<div class="term-yellow">You found the hidden chamber of the lair!</div>
<div>Take this golden 88x31 badge with you on your digital travels.</div>
<div class="term-dim">[Achievement: Master of the Weird Web 2026]</div>
`);
  }

  cmdDogsay(args) {
    if (window.Sound) window.Sound.bork();
    const text = (args && args.length > 0) ? args.join(" ") : "bork! hamburgers are delicious!";
    const border = "-".repeat(Math.max(text.length + 4, 12));
    const dog = `
  ${border}
 &lt;  ${this.escapeHtml(text)}  &gt;
  ${border}
         \\
          \\   /^ ^\\
             / 0 0 \\
             V\\ Y /V   *wag wag*
              / - \\
             /    |
            (____/\\)
`;
    this.printLine(`<pre class="term-yellow">${dog}</pre>`);
  }

  cmd1987() {
    if (window.Sound) window.Sound.fanfare();
    const fnafAscii = `
<pre class="term-yellow" style="font-size: 0.72rem; line-height: 1.15; overflow-x: auto;">
⠀⠀⠀⠀⡏⠀⢀⣾⣏⠀⠀⠀⠀⠀⠈⣹⣷⣶⣯⠁⠀⠀⠀⠀⠀⣶⣶⣕⠈⠹⣎⢳⡾⠇⠀⠀⠀
⠀⠀⠀⠀⠃⠘⢸⣿⣟⢀⣴⣶⣾⣿⣾⣿⣿⣿⣿⣿⣿⣿⣶⣦⡲⣿⣿⣿⡇⠀⢻⣦⣀⠇⠀⠀⠀
⠀⠀⠀⠀⠀⠀⣼⣿⣼⣷⡹⠟⠛⠻⣿⣿⣿⣿⣿⣿⠟⠉⠻⣿⣷⡽⣿⣿⣿⠀⠀⠉⠛⠃⠀⠀⠀
⠀⠀⠀⠀⠀⢸⣿⣿⣿⣿⡇⡴⠶⣦⠘⣿⣿⣷⡿⠇⣶⠟⣶⡈⣿⣿⣿⣿⣿⠀⠀⠀⠀⠀⠀⠀⠀   "IT'S ME..."
⠀⠀⠀⠀⢀⢿⣿⣿⣿⣿⡆⠳⣤⡿⠀⣯⠿⢿⡷⠀⠙⠦⠾⠁⣿⣿⣿⣿⣿⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⢨⣼⣿⣿⣿⣿⣇⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢠⣿⣿⣾⣿⣿⣇⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⡿⣵⣿⡿⠟⢛⣩⣀⡀⠓⠀⠀⠀⢠⣤⠀⠴⠄⢀⣬⣛⠿⣿⣿⣿⣿⠧⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⣿⣿⡿⣡⣶⣿⣿⣿⣿⣷⣤⣀⠀⢀⣀⣀⣀⣾⣿⣿⣷⣷⡌⢻⣿⣏⢧⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⣿⡿⣰⣏⣹⣋⣻⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣻⣿⡙⣟⣹⡜⣿⣏⣯⠆⠀⠀⠀⠀⠀
⠀⠀⠀⠀⣿⢥⣿⡿⢻⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⠟⣿⣿⣹⣿⡎⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⢿⡸⣿⣿⣾⣿⣿⣿⣿⣿⣿⣿⣿⣻⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⢃⠿⠁⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠃⢿⣿⣿⣯⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡿⡟⠠⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⢠⡌⠻⠿⢺⣿⣯⣛⢿⣿⡿⣿⣯⡿⣿⣿⣟⣿⣿⣟⣟⡰⣰⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⢸⡀⠈⠂⠀⠀⠀⠉⠉⠙⠛⠛⠙⠛⠛⠉⠉⠈⠉⠉⠉⠀⣿⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⢸⠃⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⣿⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⢸⠂⠀⠀⢀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⡀⡼⣿⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⢸⠀⠀⠀⢸⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣰⢣⢇⣿⡆⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⢸⠅⠀⠀⣸⠇⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⢰⡷⠸⢹⣿⡇⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⢸⠂⠀⠀⣿⢸⡄⠀⠀⠀⠀⠀⠀⠀⠀⢀⣴⣿⣸⠃⡁⢸⣿⡇⠀⠀⠀⠀⠀⠀⠀⠀
</pre>
<div class="term-highlight">★★★ 1987 // FIVE NIGHTS AT FREDDY'S ★★★</div>
<div class="term-purple">"WAS THAT THE BITE OF '87?!"</div>
<div class="term-dim">Freddy Fazbear and the animatronics are lurking in the shadows...</div>
`;
    this.printLine(fnafAscii);
  }

  cmd1897() {
    this.cmd1987();
  }
}

const Terminal = new RetroTerminal();
if (typeof window !== "undefined") {
  window.Terminal = Terminal;
}
