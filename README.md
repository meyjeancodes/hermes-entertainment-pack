# Hermes Dashboard Entertainment Pack

[![Hackathon](https://img.shields.io/badge/Hermes-Hackathon-2026-blue)](https://github.com/nousresearch/hermes-agent)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

> TV widgets, retro channels, Discord widgets, gallery, and music — restored from the recovered 2026 git reflog commits.

## 📦 What's Inside

| Page | Description |
|------|-------------|
| **Entertainment (TV)** | Widescreen CRT TV with 10 channels (YouTube, static programs, ASCII wave, weather radar, Core breathwork, Neo newswire, Chaos matrix). Autoplay enabled on channels 5–8. |
| **Game Guide** | **Nous Boy** — integrated Game Boy emulator via the Pokemon Agent. Load your own ROMs and run the agent from the dashboard. Large status screen with live log output. |
| **Discord** | Full Discord widget showing guilds, channels, and recent messages. Send messages directly from the dashboard. |
| **Gallery** | Full-page image carousel. Click any photo to view full-size in a modal (close with X or backdrop click). Curator's note removed. |
| **Mixtape** | Music portal with CD spinner and Spotify visualizer bridge. |
| **Spotify** | Full Spotify player with playback controls, volume, shuffle, repeat, and now-playing display. Requires `hermes auth spotify`. |

All themed in the official Hermes Dashboard style.

---

## 🚀 Installation

### Method 1 — Clone as plugin (recommended)
```bash
cd ~/.hermes/hermes-agent/plugins
git clone <your-repo-url> hermes-entertainment-pack
cd hermes-entertainment-pack/dashboard
npm install
npm run build
hermes dashboard
```

The plugin auto-registers. The **Entertainment** tab appears in the sidebar.

### Method 2 — Manual copy
```bash
cp -r plugins/hermes-entertainment-pack ~/.hermes/hermes-agent/plugins/
hermes dashboard
```

---

## ⚙️ Configuration

### Discord Setup

1. Create a Discord bot at https://discord.com/developers/applications
2. Enable **Message Content Intent** and **Server Members Intent**
3. Copy bot token → add to `~/.hermes/.env`:
   ```bash
   DISCORD_BOT_TOKEN=YOUR_TOKEN
   ```
4. Invite bot to your server with `applications.commands` and `bot` scopes, plus permissions:
   - Read Messages/View Channels
   - Send Messages
   - Read Message History

5. Restart Hermes Agent. The Discord page shows live feeds.

---

### Spotify Setup

**Step 1 — OAuth**
```bash
hermes auth spotify
```
Log in and authorize. Token saved to `~/.hermes/credentials/spotify.json`.

**Step 2 — Backend routes**
The entertainment pack now calls dedicated endpoints in `web_server.py`:
- `GET /api/spotify/now-playing`
- `POST /api/spotify/{play,pause,next,previous,shuffle,repeat,volume}`

**Step 3 — Use the player**
Open Dashboard → Entertainment → Spotify. Click "Connect Spotify" if not authenticated.

**Troubleshooting**
- `401` → Run `hermes auth spotify` again
- `503` → Ensure Spotify plugin exists at `~/.hermes/hermes-agent/plugins/spotify/`
- No device → Open Spotify on a device and start playback once

---

## 📺 Adding Personal Videos (TV Channels)

### Step 1 — Place video in `public/`
```bash
cp ~/Downloads/my_video.mp4 ~/.hermes/hermes-agent/plugins/hermes-entertainment-pack/dashboard/public/
```

### Step 2 — Add channel entry in `EntertainmentPage.tsx`
```ts
{
  id: "ch11",
  name: "My Channel",
  type: "video",
  src: "/my_video.mp4",
  color: "#1a1a2e",
},
```
For YouTube:
```ts
{
  id: "ch12",
  name: "My YouTube",
  type: "iframe",
  src: "https://www.youtube.com/embed/VIDEO_ID?autoplay=1&mute=1&controls=0&loop=1&playlist=VIDEO_ID",
  color: "#0a0a1a",
},
```

### Channel Rules
- Use `/embed/` for YouTube, add `&playlist=ID` when `loop=1`
- Local videos must be inside `public/` and referenced as `"/file.mp4"`
- `autoplay` works only after user gesture (Power ON click); mute to ensure
- Unique `id` (format `chN`)

---

## 🎮 Adding ROMs — Nous Boy (Game Guide)

1. Obtain a legal Game Boy ROM (`.gb`, `.gbc`, `.gba`) from a cartridge you own
2. Copy to a persistent location:
   ```bash
   mkdir -p ~/.hermes/pokemon-agent/roms
   cp ~/Downloads/pokemon_red.gb ~/.hermes/pokemon-agent/roms/
   ```
3. In the Dashboard → Entertainment → Game Guide, enter path in **ROM Path**:
   ```
   /Users/yourname/.hermes/pokemon-agent/roms/pokemon_red.gb
   ```
4. Click **Start**. PID and port appear; click **Open Dashboard** to launch the emulator in a new tab.

*Note: File upload UI is placeholder; path input is required for now.*

---

## 🛠️ Development

```bash
cd dashboard
npm install      # first time only
npm run dev      # Vite dev server (hot reload)
npm run build    # builds dist/index.js (IIFE bundle)
```

Restart `hermes dashboard` after building.

### Project Structure
```
hermes-dashboard-entertainment-pack/
├── dashboard/
│   ├── src/
│   │   ├── pages/              # 5 page components
│   │   ├── components/         # Widgets (DiscordWidget, GalleryFullPage, SpotifyFullPage, CDSpinner, PokemonAgentWidget)
│   │   ├── hooks/              # useSpotifyPlayer
│   │   └── ui/                 # shadcn-compatible components
│   ├── public/
│   ├── dist/                   # built plugin
│   ├── manifest.json
│   ├── plugin_api.py
│   └── vite.config.ts
├── README.md
└── LICENSE
```

---

## 📡 API Reference

The plugin consumes endpoints from the main Hermes Agent:

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/discord/guilds` | GET | List guilds |
| `/api/discord/channels` | GET | List channels (`?guild_id=`) |
| `/api/discord/messages` | GET | Messages (`?channel_id=&limit=`) |
| `/api/discord/send` | POST | Send message |
| `/api/spotify/now-playing` | GET | Playback state + track info |
| `/api/spotify/play` | POST | Start/resume playback |
| `/api/spotify/pause` | POST | Pause |
| `/api/spotify/next` | POST | Next track |
| `/api/spotify/previous` | POST | Previous track |
| `/api/spotify/shuffle` | POST | Toggle shuffle |
| `/api/spotify/repeat` | POST | Cycle repeat mode |
| `/api/spotify/volume` | POST | Set volume (0–100) |
| `/api/pokemon/status` | GET | Agent status |
| `/api/pokemon/start` | POST | Start with ROM path |
| `/api/pokemon/stop` | POST | Stop agent |

All require `X-Hermes-Session-Token` header (injected by dashboard).

---

## 🐛 Troubleshooting

| Symptom | Likely Cause | Fix |
|---------|-------------|-----|
| Discord widget empty | `DISCORD_BOT_TOKEN` not set or bot offline | Set token in `.env` and restart |
| Spotify shows "Connect Spotify" | Not authenticated | Run `hermes auth spotify` |
| TV channel shows black | Video file not in `public/` or incorrect `src` | Verify file path and rebuild |
| Nous Boy fails to start | ROM path invalid or emulator not installed | Provide valid `.gb/.gbc/.gba` file path |
| Build fails with TS errors | Missing dependencies | Run `npm install` in `dashboard/` |

---

## 📸 Screenshots

> Add screenshots to `docs/screenshots/` and update links.

- **TV View** — retro CRT with scanlines and channel OSD
- **Nous Boy** — emulator console with log panel and controls
- **Discord** — guild/channel selector with message stream
- **Gallery** — hero card grid with fullscreen modal
- **Spotify** — album art with playback controls

---

## 🗺️ Roadmap

- [ ] Drag-and-drop ROM upload for Nous Boy
- [ ] Channel manager UI (add/remove videos without code)
- [ ] Persist TV channel order to localStorage
- [ ] Discord DM support
- [ ] Spotify playlist browser
- [ ] Save-state manager for retro games

---

## 🙏 Credits

Recovered by Hermes (NousResearch/hermes-agent) — Hermes Hackathon 2026.

Original recovered from git reflog (commits `27103ede` → `1cca3af2`). Standalone derivative work.

## License

MIT
