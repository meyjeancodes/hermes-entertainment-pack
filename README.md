# Hermes Entertainment Pack

A retro-futuristic entertainment plugin for the Hermes Dashboard. Built for the Hermes Hackathon.

---

## What's Inside

Four tabs, one plugin:

**TV & Games** — A full retro CRT television with 10 channels, plus a Nous Boy handheld gaming console running browser-native games.

**Discord** — Live Discord feed embedded in the dashboard. Browse channels, read history, and send messages directly.

**Gallery** — A curated art collection with masonry grid and list view. Scroll-reveal animations, lightbox previews.

**Mixtape** — A music portal with Spotify embed widget and visual sleeve artwork.

---

## TV Channels

| # | Name | Description |
|---|------|-------------|
| 1 | Static | Analog noise generator |
| 2 | Nous Network | Proprietary Nous Research video loop |
| 3 | Music Scene | YouTube music video |
| 4 | Weather Retro | Vintage weather broadcast |
| 5 | Nature | Ambient nature stream (autoplay) |
| 6 | Aethereon | Ambient visual stream (autoplay) |
| 7 | Bedrock | Ambient stream (autoplay) |
| 8 | Local 58 | Creepypasta video series (autoplay) |
| 9 | Bloom Terminal | Bloomberg-style live trading visualizer |
| 10 | Spotify Visual | Embedded Spotify album player |

Channel controls: power button, channel pills, volume knob, prev/next arrows. Full CRT effect with scanlines, vignette, and power-on sweep animation.

---

## Nous Boy

A Game Boy-style handheld console built into the dashboard. Runs four browser-native games:

- **Pong** — Classic paddle game, player vs CPU, first to 7 wins
- **Tetris** — Full Tetris with level progression and next-piece preview
- **Space Raid** — Retro space shooter
- **Flappy Bird** — External

Controls: D-pad arrows, A (Z key), B (X key), Start (Enter), Select (Shift). Physical keyboard passthrough works while the console is powered on — no need to click inside the game.

---

## Bloom Terminal (Channel 9)

A canvas-rendered Bloomberg Terminal clone with:
- Real-time candlestick chart with moving average line
- Right-panel watchlist showing all 11 tickers simultaneously
- Scrolling news headline ticker at the bottom
- Color-coded price movers (green/red)

---

## Install

```bash
git clone https://github.com/meyjeancodes/hermes-entertainment-pack.git \
  ~/.hermes/plugins/entertainment
```

That's it. The built bundle is committed — no build step needed. Restart `hermes dashboard` if it's already running and the Entertainment tab will appear.

The plugin lives in `~/.hermes/plugins/` which `hermes update` never touches, so it survives agent updates automatically.

### Build from source (optional)

Only needed if you modify the source:

```bash
cd ~/.hermes/plugins/entertainment/dashboard
npm install
npm run build
```

### Discord

Create a Discord bot with `Read Message History` and `Send Messages` intents, then add it to `~/.hermes/.env`:

```bash
DISCORD_BOT_TOKEN=your_token_here
```

Restart Hermes Agent after setting the token.

### Spotify

```bash
hermes auth spotify
```

Completes OAuth PKCE flow. Tokens are stored at `~/.hermes/auth.json` and auto-refresh.

---

## Project Structure

```
hermes-entertainment-pack/
├── dashboard/
│   ├── src/
│   │   ├── index.tsx               # Plugin entry — tab shell, registers plugin
│   │   ├── pages/
│   │   │   ├── EntertainmentPage.tsx   # TV + Nous Boy
│   │   │   ├── DiscordPage.tsx         # Discord widget
│   │   │   ├── GalleryPage.tsx         # Gallery wrapper
│   │   │   └── MusicPortalPage.tsx     # Mixtape / Spotify
│   │   └── components/
│   │       ├── GalleryFullPage.tsx     # Masonry grid + lightbox
│   │       ├── DiscordWidget.tsx       # Discord feed
│   │       └── SpotifyNowPlaying.tsx   # Now playing bar
│   └── dist/                       # Pre-built bundle (committed)
└── games/
    ├── pong.html
    ├── tetris.html
    ├── space.html
    └── snake.html
```

---

## Adding Channels

Edit the `CHANNELS` array in `src/pages/EntertainmentPage.tsx`:

```ts
{ id: "ch11", name: "My Channel", type: "iframe", src: "https://example.com/embed", autoplay: false }
```

Supported types: `"iframe"`, `"video"`, `"noise"`, `"canvas"`.

---

## Tech Stack

- React + TypeScript + Vite (IIFE lib build)
- Tailwind CSS
- Hermes Agent backend (FastAPI, port 9119)
- Canvas API for Bloom Terminal and game rendering

---

## License

MIT — built for the Hermes Hackathon by BlackCat Robotics.
