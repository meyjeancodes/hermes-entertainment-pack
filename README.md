# Hermes Entertainment Pack

A retro-futuristic entertainment plugin for the [Hermes Dashboard](https://github.com/NousResearch/hermes-agent). Built for the Hermes Hackathon.

Four tabs. One plugin. Zero build step required.

---

## Features

### TV
A full CRT television with 10 channels, glass housing, and authentic scanline/vignette effects.

| Ch | Name | Type |
|----|------|------|
| 1 | Static | Analog noise generator |
| 2 | Nous Network | Nous Research video loop |
| 3 | Music Scene | YouTube music stream |
| 4 | Weather Retro | Vintage weather broadcast |
| 5 | Nature | Ambient nature stream |
| 6 | Aethereon | Ambient visual stream |
| 7 | NASA Live | NASA live feed |
| 8 | Local 58 | Creepypasta video series |
| 9 | Bloom Terminal | Bloomberg-style live trading visualizer |
| 10 | Vapor FM | Lofi / vaporwave radio embed |

Controls: power button, channel pills, volume slider, prev/next. Keyboard passthrough forwards arrow keys and volume into the active channel.

---

### Nous Boy
A Game Boy DMG-style handheld console built into the dashboard. Three browser-native games included — no emulator, no ROM files.

| Game | Controls |
|------|----------|
| **Pong** | ↑ ↓ move paddle · `Z` or `Space` to serve |
| **Tetris** | ← → move · ↑ or `X` rotate · `Z` hard drop |
| **Space Raid** | ← → ↑ ↓ move ship · `Z` or `Space` shoot |
| **Flappy Bird** | `Space` or click to flap (opens flappybird.io) |

The physical D-pad, A, and B buttons on the console are clickable. Keyboard input is forwarded automatically while the console is powered on — no need to click inside the game window.

---

### Gallery
A retro newspaper / art gallery aesthetic with scroll-reveal animations, a CSS grid layout, and a full-screen lightbox viewer. Ships with a curated collection of AI-generated art.

- Grid and list view toggle
- Click any image to open a centered lightbox
- Smooth fade-in-up scroll reveals
- Hero image + curator's note footer

---

### Mixtape
A music portal wired directly to your Spotify account via Hermes auth.

- Album art, track name, artist
- Play / pause / skip / previous
- Shuffle and repeat toggle
- Volume slider
- Auto-polls every 8 seconds to stay in sync

---

### Discord
A live Discord feed embedded in the dashboard, powered by your Hermes bot token.

- Browse all servers the bot is a member of
- Switch between text channels
- Read message history (last 50 messages)
- Send messages directly from the dashboard
- Auto-detects bot token from `DISCORD_BOT_TOKEN` env var

---

## Install

```bash
git clone https://github.com/meyjeancodes/hermes-entertainment-pack.git \
  ~/.hermes/plugins/entertainment
```

The pre-built bundle is committed — **no build step needed.** Restart `hermes dashboard` and the Entertainment tab appears automatically.

> The plugin lives in `~/.hermes/plugins/` which `hermes update` never modifies, so it survives agent updates.

---

## Setup

### Spotify

```bash
hermes auth spotify
```

Completes the OAuth PKCE flow. Tokens are stored at `~/.hermes/auth.json` and auto-refresh. After connecting, open the **Mixtape** tab and hit **Retry** if the widget hasn't loaded yet.

### Discord

1. Create a bot at [discord.com/developers/applications](https://discord.com/developers/applications)
2. Enable **Read Message History** and **Send Messages** intents
3. Invite the bot to your server
4. Add the token to `~/.hermes/.env`:

```env
DISCORD_BOT_TOKEN=your_token_here
```

5. Restart Hermes Agent — the Discord tab will connect automatically.

---

## Build from Source

Only needed if you modify the source:

```bash
cd ~/.hermes/plugins/entertainment/dashboard
npm install
npm run build
```

Output goes to `dashboard/dist/`. The `postbuild` script renames `index.iife.js` → `index.js` automatically.

---

## Project Structure

```
hermes-entertainment-pack/
├── dashboard/
│   ├── src/
│   │   ├── index.tsx                   # Plugin entry — registers tabs
│   │   ├── pages/
│   │   │   ├── EntertainmentPage.tsx   # TV + Nous Boy
│   │   │   ├── DiscordPage.tsx         # Discord widget
│   │   │   ├── GalleryPage.tsx         # Gallery wrapper
│   │   │   └── MusicPortalPage.tsx     # Mixtape / Spotify
│   │   ├── components/
│   │   │   ├── GalleryFullPage.tsx     # Grid + lightbox
│   │   │   ├── DiscordWidget.tsx       # Discord feed + compose
│   │   │   └── SpotifyNowPlaying.tsx   # Now playing controls
│   │   └── hooks/
│   │       └── useSpotifyPlayer.ts     # Spotify polling + controls
│   ├── plugin_api.py                   # FastAPI routes (Spotify + Discord)
│   ├── games/
│   │   ├── pong.html
│   │   ├── tetris.html
│   │   └── space.html
│   ├── gallery/                        # Bundled art assets
│   └── dist/                           # Pre-built bundle (committed)
└── manifest.json                       # Plugin registration metadata
```

---

## Extending

### Add a TV Channel

Edit the `CHANNELS` array in `src/pages/EntertainmentPage.tsx`:

```ts
{ id: "ch11", name: "My Channel", type: "iframe", src: "https://example.com/embed" }
```

Supported types: `"iframe"`, `"video"`, `"noise"`, `"canvas"`.


---

## Tech Stack

- **React 18** + TypeScript + Vite (IIFE lib build)
- **Tailwind CSS** with inline styles for Hermes card compatibility
- **Hermes Agent** backend — FastAPI at port 9119
- **Canvas API** for Bloom Terminal and game rendering
- **Spotify Web API** via Hermes OAuth (PKCE)
- **Discord REST API v10** via bot token

---

## License

MIT — built for the Hermes Hackathon by BlackCat Robotics.
