# Hermes Entertainment Pack

A retro-futuristic entertainment dashboard featuring TV, music, gaming, and social integrations.

## Features

### 📺 Retro TV
- 10 broadcast channels with unique identities
- Channels 5–8 autoplay with sound when selected
- Smooth CRT effects (scanlines, vignette, power-on sweep)
- Hidden YouTube play button overlay for clean look
- Full-width design with snug sidewall fit
- NOUS branding badge positioned below control panel

**Channels:**
1. **STATIC** – Analog noise
2. **NOUS NETWORK** – Proprietary video loop
3. **MUSIC SCENE** – YouTube music video
4. **WEATHER RETRO** – Vintage weather
5. **NATURE** – Autoplay
6. **AETHEReon** – Autoplay
7. **BEDROCK** – Autoplay
8. **LOCAL 58** – Autoplay
9. **MARKET TAPE** – Trading visualizer
10. **SPOTIFY VISUAL** – Album art carousel

Controls: Power ON/OFF, volume knob, channel pills.

---

### 🎮 Game Guide
Integrated **Pokemon Agent** controller and interactive **Nous Boy** emulator widget.

- Select a ROM from the library (Pokemon Red, Blue, Tetris, Link’s Awakening)
- **PokemonPage** provides full agent control with live log and dashboard view
- **Nous Boy** visual widget displays a Game Boy-compatible emulator with power, battery, ROM upload, and controls

**Controls on Nous Boy:**
- D-Pad: Arrow keys
- A: Z / B: X
- Start: Enter / Select: Shift
- Power button, battery indicator, cartridge slot aesthetic

---

### 🖼️ Gallery
Full-screen lightbox for image viewing:
- Click any hero or card image to open modal
- Backdrop blur with close button
- Curator’s note removed per Task 2

---

### 💬 Discord (functional)
Live Discord feed directly in the dashboard.
- Guild → channel selector
- Real-time message history
- Send messages (requires `DISCORD_BOT_TOKEN`)
- Looks and feels like Discord

**Setup:** Add your bot token to `~/.hermes/.env`:
```bash
DISCORD_BOT_TOKEN=your_discord_bot_token_here
```

---

### 🎵 Spotify (reconnected)
Now playing widget with full playback control.
- Shows current track, album art, playback state
- Play, pause, next, previous, shuffle, repeat, volume
- Uses OAuth PKCE stored in `~/.hermes/auth.json`

**First-time auth:**
```bash
hermes auth spotify
```
Token auto-refreshes; frontend prompts if auth required.

---

## Tech Stack

- Frontend: React + TypeScript + Vite
- UI: Tailwind CSS + shadcn/ui components
- Backend: FastAPI (Hermes Agent on port 9119)
- Auth: Session token (`window.__HERMES_SESSION_TOKEN__`) for Discord; Spotify OAuth PKCE

## Installation

### Dashboard (frontend)

```bash
cd dashboard
npm install
npm run dev   # or npm run build for production
```

### Backend (Hermes Agent)

The Hermes Agent must be running with entertainment plugins enabled:

```bash
cd ~/.hermes/hermes-agent
hermes dashboard
```

The backend serves:
- `/api/spotify/*` — Spotify controller
- `/api/discord/*` — Discord widget API
- `/api/pokemon/*` — Pokemon agent lifecycle

## Configuration

### Spotify
1. Register a Spotify Developer app with redirect URI `http://127.0.0.1:43827/spotify/callback`
2. Run `hermes auth spotify` to complete OAuth PKCE flow
3. Tokens saved to `~/.hermes/auth.json` and auto-refreshed

### Discord
1. Create a Discord Bot, enable `Read Message History`, `Send Messages` intents
2. Set `DISCORD_BOT_TOKEN` in `~/.hermes/.env`
3. Restart Hermes Agent

### ROM Management
Place legally-owned Game Boy ROMs in a directory and reference them in the PokemonPage UI or via API:
- Default paths: `~/Desktop/pokemon-agent/roms/*.gb`
- Or set `rom_path` via `/api/pokemon/start` payload

## Project Structure

```
dashboard/
├── src/
│   ├── pages/
│   │   ├── EntertainmentPage.tsx   # main hub (TV, Game Guide)
│   │   └── PokemonPage.tsx         # Pokemon agent controls
│   ├── components/
│   │   ├── GameBoyWidget.tsx       # Nous Boy emulator widget
│   │   ├── DiscordWidget.tsx       # Discord feed
│   │   ├── SpotifyNowPlaying.tsx   # Spotify controller
│   │   ├── GalleryFullPage.tsx     # Gallery with lightbox
│   │   └── ...
│   └── hooks/
│       └── useSpotifyPlayer.ts     # Spotify state hook
├── dist/                           # built assets (index.js)
└── ...
```

## Adding TV Channels

Edit `src/pages/EntertainmentPage.tsx` → `CHANNELS` array:

```ts
const CHANNELS: Channel[] = [
  { id: "ch11", name: "My Channel", type: "iframe", src: "https://example.com/embed", autoplay: false },
];
```

Set `autoplay: true` on channels you want to start automatically.

## Styling notes

- TV overall padding: `px-2 md:px-3 lg:px-4` (snug walls)
- Nous badge: absolute `top-6 left-1/2` centered below control panel
- YouTube red play button hidden via `.ytp-large-play-button { display: none !important; }`
- Game Boy body: `w-[400px] h-[600px]` with screen bezel `h-[200px]`

## Known Limitations

- ROM file upload is client-side only; for production, implement server-side ROM storage
- Discord requires a bot with proper gateway intents; DM support not yet implemented
- Spotify playback requires an active Premium account for API control

## License

Internal to Nous Research / BlackCat Robotics. Not for public distribution.

---

*Built with Hermes Agent — the autonomous infra that never sleeps.*
