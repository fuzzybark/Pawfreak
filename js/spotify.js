// ==========================================
//  📻 fuzzy's winamp / spotify jukebox
//  streams what i'm listening to via lanyard
// ==========================================

class SpotifyJukebox {
  constructor() {
    this.config = (window.CONFIG && window.CONFIG.spotify) || {};
    // Exclusively bound to Fuzzy's Spotify via Discord ID
    this.discordId = this.config.discordId || "424326894083637258";
    this.lastFmUser = this.config.lastFmUser || "";
    this.ws = null;
    this.pollTimer = null;
    this.progressTimer = null;
    this.currentTrack = null;
    this.isPlaying = false;
  }

  init() {
    this.startTracking();
  }

  startTracking() {
    if (this.discordId) {
      this.initLanyardSocket();
      this.fetchLanyardRest(); // Initial quick fetch while socket connects
    } else if (this.lastFmUser) {
      this.pollLastFm();
    } else {
      this.renderFallback();
    }
  }

  // Lanyard WebSocket for zero-delay real-time presence updates
  initLanyardSocket() {
    if (!this.discordId) return;

    try {
      if (this.ws) {
        this.ws.close();
      }

      this.ws = new WebSocket("wss://api.lanyard.rest/socket");

      this.ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          const { op, d, t } = message;

          // Opcode 1: Hello from Lanyard, start heartbeat
          if (op === 1) {
            const heartbeatInterval = d.heartbeat_interval;
            setInterval(() => {
              if (this.ws && this.ws.readyState === WebSocket.OPEN) {
                this.ws.send(JSON.stringify({ op: 3 }));
              }
            }, heartbeatInterval);

            // Opcode 2: Initialize subscription to Discord user ID
            this.ws.send(
              JSON.stringify({
                op: 2,
                d: { subscribe_to_id: this.discordId }
              })
            );
          }

          // Event data (INIT_STATE or PRESENCE_UPDATE)
          if (t === "INIT_STATE" || t === "PRESENCE_UPDATE") {
            this.handleLanyardData(d);
          }
        } catch (err) {
          console.warn("Lanyard WS parse error:", err);
        }
      };

      this.ws.onerror = () => {
        this.fallbackToPolling();
      };

      this.ws.onclose = () => {
        // Reconnect after 10s if socket drops
        setTimeout(() => this.initLanyardSocket(), 10000);
      };
    } catch (e) {
      this.fallbackToPolling();
    }
  }

  fallbackToPolling() {
    if (this.pollTimer) clearInterval(this.pollTimer);
    this.pollTimer = setInterval(() => {
      this.fetchLanyardRest();
    }, this.config.pollIntervalMs || 5000);
  }

  async fetchLanyardRest() {
    if (!this.discordId) return;
    try {
      const res = await fetch(`https://api.lanyard.rest/v1/users/${this.discordId}`);
      if (!res.ok) return;
      const json = await res.json();
      if (json && json.success && json.data) {
        this.handleLanyardData(json.data);
      }
    } catch (e) {
      // Ignore network flutter
    }
  }

  handleLanyardData(data) {
    if (data.listening_to_spotify && data.spotify) {
      const sp = data.spotify;
      this.isPlaying = true;
      this.currentTrack = {
        title: sp.song,
        artist: sp.artist,
        album: sp.album,
        albumArt: sp.album_art_url,
        trackId: sp.track_id,
        spotifyUrl: `https://open.spotify.com/track/${sp.track_id}`,
        startTime: sp.timestamps.start,
        endTime: sp.timestamps.end,
        duration: sp.timestamps.end - sp.timestamps.start
      };
      this.renderLive();
    } else {
      this.isPlaying = false;
      this.renderIdle();
    }
  }

  async pollLastFm() {
    if (!this.lastFmUser) return;
    // Last.fm public scrobbler method
    const apiKey = "2c62f23b1855e902b781df55f6d61002"; // Public read-only scrobble API token
    try {
      const url = `https://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=${this.lastFmUser}&api_key=${apiKey}&format=json&limit=1`;
      const res = await fetch(url);
      if (!res.ok) throw new Error();
      const json = await res.json();
      const track = json?.recenttracks?.track?.[0];
      if (track && track["@attr"] && track["@attr"].nowplaying === "true") {
        this.isPlaying = true;
        this.currentTrack = {
          title: track.name,
          artist: track.artist["#text"] || track.artist.name,
          album: track.album["#text"],
          albumArt: track.image?.[2]?.["#text"] || "hamburger.png",
          spotifyUrl: track.url,
          startTime: Date.now() - 30000,
          endTime: Date.now() + 150000,
          duration: 180000
        };
        this.renderLive();
        return;
      }
    } catch (e) {}

    this.isPlaying = false;
    this.renderIdle();
  }

  renderLive() {
    const root = document.getElementById("spotify-player-root");
    if (!root) return;

    root.classList.add("is-live");
    root.classList.remove("is-offline");

    const track = this.currentTrack;
    const liveBadge = document.getElementById("spotify-status-badge");
    if (liveBadge) {
      liveBadge.innerHTML = `<span class="pulse-indicator"></span><span>LIVE STREAM</span>`;
      liveBadge.className = "jukebox-badge live";
    }

    const titleEl = document.getElementById("spotify-song-title");
    const artistEl = document.getElementById("spotify-song-artist");
    const albumEl = document.getElementById("spotify-song-album");
    const artEl = document.getElementById("spotify-album-art");
    const linkEl = document.getElementById("spotify-direct-link");

    if (titleEl) titleEl.textContent = track.title;
    if (artistEl) artistEl.textContent = track.artist;
    if (albumEl) albumEl.textContent = track.album || "";
    if (artEl) {
      artEl.src = track.albumArt || "hamburger.png";
      artEl.alt = `${track.title} - ${track.artist}`;
    }
    if (linkEl) {
      linkEl.href = track.spotifyUrl || "https://open.spotify.com";
      linkEl.style.display = "inline-flex";
    }

    this.startProgressTracker();
  }

  renderIdle() {
    const root = document.getElementById("spotify-player-root");
    if (!root) return;

    root.classList.remove("is-live");
    root.classList.add("is-offline");

    const liveBadge = document.getElementById("spotify-status-badge");
    if (liveBadge) {
      liveBadge.innerHTML = `<span class="idle-indicator"></span><span>IDLE / DREAMING</span>`;
      liveBadge.className = "jukebox-badge idle";
    }

    const titleEl = document.getElementById("spotify-song-title");
    const artistEl = document.getElementById("spotify-song-artist");
    const albumEl = document.getElementById("spotify-song-album");
    const artEl = document.getElementById("spotify-album-art");
    const linkEl = document.getElementById("spotify-direct-link");
    const progressEl = document.getElementById("spotify-progress-bar");
    const timeCur = document.getElementById("spotify-time-current");
    const timeTotal = document.getElementById("spotify-time-total");

    const fallback = this.config.demoTrack || {
      song: "Fuzzy Sleeping Mix 💤",
      artist: "BED / EepyFuzz",
      album: "I'll probably be back soon!",
      albumArt: "hamburger.png"
    };

    if (titleEl) titleEl.textContent = fallback.song;
    if (artistEl) artistEl.textContent = fallback.artist;
    if (albumEl) albumEl.textContent = fallback.album;
    if (artEl) artEl.src = fallback.albumArt || "hamburger.png";
    if (linkEl) linkEl.style.display = "none";
    if (progressEl) progressEl.style.width = "42%";
    if (timeCur) timeCur.textContent = "01:14";
    if (timeTotal) timeTotal.textContent = "03:30";

    if (this.progressTimer) clearInterval(this.progressTimer);
  }

  renderFallback() {
    this.renderIdle();
  }

  startProgressTracker() {
    if (this.progressTimer) clearInterval(this.progressTimer);

    const update = () => {
      if (!this.currentTrack || !this.currentTrack.startTime || !this.currentTrack.endTime) return;
      const now = Date.now();
      const elapsed = Math.max(0, now - this.currentTrack.startTime);
      const total = Math.max(1, this.currentTrack.endTime - this.currentTrack.startTime);
      const percent = Math.min(100, (elapsed / total) * 100);

      const progressEl = document.getElementById("spotify-progress-bar");
      const timeCur = document.getElementById("spotify-time-current");
      const timeTotal = document.getElementById("spotify-time-total");

      if (progressEl) progressEl.style.width = `${percent}%`;
      if (timeCur) timeCur.textContent = this.formatTime(elapsed);
      if (timeTotal) timeTotal.textContent = this.formatTime(total);
    };

    update();
    this.progressTimer = setInterval(update, 1000);
  }

  formatTime(ms) {
    const totalSec = Math.floor(ms / 1000);
    const min = Math.floor(totalSec / 60);
    const sec = totalSec % 60;
    return `${min}:${sec.toString().padStart(2, "0")}`;
  }
}

const Spotify = new SpotifyJukebox();
if (typeof window !== "undefined") {
  window.Spotify = Spotify;
}
