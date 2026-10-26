// ==========================================
//  🐾 fuzzy's site config & links :3
// ==========================================

const CONFIG = {
  siteName: "pawfreak",
  handle: "@fuzzybark",
  mascotName: "Hamburger",
  mascotImage: "hamburger.png",
  version: "2.0.4-fuzzy",

  // spotify lanyard hookup (discord user id)
  spotify: {
    discordId: "424326894083637258",
    lastFmUser: "",
    pollIntervalMs: 5000,
    demoTrack: {
      song: "Fuzzy Sleeping Mix 💤",
      artist: "BED / EepyFuzz",
      album: "I'll probably be back soon!",
      albumArt: "hamburger.png",
      durationMs: 212000,
      spotifyUrl: "https://open.spotify.com"
    }
  },

  // visitor counter (countapi)
  counter: {
    key: "pawfreak-com-counter",
    apiBase: "https://countapi.mileshilliard.com/api/v1",
    fallbackInitialCount: 0
  },

  // my links & socials
  socials: [
    {
      id: "discord",
      label: "Discord",
      value: "@axyen",
      icon: "💬",
      url: "https://discord.com/users/424326894083637258",
      action: "link",
      color: "#8b5cf6"
    },
    {
      id: "telegram",
      label: "Telegram",
      value: "@fuzzybark",
      icon: "✈️",
      url: "https://t.me/fuzzybark",
      action: "link",
      color: "#229ED9"
    },
    {
      id: "github",
      label: "GitHub",
      value: "/fuzzybark",
      icon: "🐙",
      url: "https://github.com/fuzzybark",
      action: "link",
      color: "#facc15"
    },
    {
      id: "steam",
      label: "Steam",
      value: "/fuzzybark",
      icon: "🎮",
      url: "https://steamcommunity.com/id/fuzzybark/",
      action: "link",
      color: "#c084fc"
    },
    {
      id: "steam-wishlist",
      label: "Steam Wishlist",
      value: "games4fuzzy",
      icon: "🎁",
      url: "https://store.steampowered.com/wishlist/id/fuzzybark/?sort=topsellers&categoryids=385798&st=2106422598210869289",
      action: "link",
      color: "#f472b6"
    },
    {
      id: "email",
      label: "E-Mail",
      value: "fuzworks@pawfreak.com",
      icon: "✉️",
      url: "mailto:fuzworks@pawfreak.com",
      action: "link",
      color: "#e879f9"
    }
  ],

  // cute speech bubbles when clicking Hamburger
  mascotQuotes: [
    "*bork!* welcome to pawfreak.com!",
    "did someone say hamburger?! 🍔",
    "*happy tail wagging intensifies*",
    "warning: petting may cause soft cuddles.",
    "running on 99% kibble and 1% caffeine.",
    "psst... try typing 'pet' or 'dogsay' in the terminal!",
    "you clicked me! that tickles!",
    "stay weird, stay dawg!"
  ],

  // random quotes for terminal 'quote' / 'fortune'
  quotes: [
    "The web was better when everyone had their own weird corner of it.",
    "Never trust a dog that doesn't like hamburgers.",
    "404: Brain not found. Please insert coffee and reboot.",
    "Real hackers don't use templates. They build CRT-tinted shrines.",
    "There is no cloud, it's just someone else's computer running a floppy disk.",
    "In a world of minimalist clean sites, choose to be loud, purple, and yellow."
  ]
};

if (typeof window !== "undefined") {
  window.CONFIG = CONFIG;
}
