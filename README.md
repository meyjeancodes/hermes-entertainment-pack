# Hermes Dashboard Entertainment Pack

[![Hackathon](https://img.shields.io/badge/Hermes-Hackathon-2026-blue)]()
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)]()

> TV widgets, retro channels, Discord widgets, gallery, and music — restored from the recovered 2026 git reflog commits.

## Contents

- **Entertainment** — TV widescreen with 10 channels (YouTube, static programs, ASCII wave, weather radar, Core breathwork, Neo newswire, Chaos matrix) + GB ROM games via JS emulator
- **Discord** — Widget with guild/channel selector + message display
- **Gallery** — Full-page image carousel
- **Mixtape** — Centered cover art + Spotify full player
- **Spotify** — Dedicated Spotify integrated player

All themed in Renaissance Beyoncé palette (chrome + burgundy) matching the official Hermes Dashboard dark style.

## Installation

**Method 1 — Manual copy**
```bash
# From your Hermes Agent install
cp -r plugins/hermes-entertainment-pack ~/.hermes/hermes-agent/plugins/
# Then restart the dashboard
hermes dashboard
```

**Method 2 — Git submodule / clone**
```bash
cd ~/.hermes/hermes-agent/plugins
git clone <your-repo-url> hermes-entertainment-pack
hermes dashboard
```

The plugin auto-registers on dashboard load. The new **Entertainment** tab appears in the sidebar (between Dashboard and Skills).

## Routes

| Route | Description |
|-------|-------------|
| `/entertainment` | TV & games hub (main plugin page) |
| `/discord` | Discord widget (standalone page also) |
| `/gallery` | Image gallery |
| `/mixtape` | Music portal with Spotify |
| `/spotify` | Full Spotify player |

The plugin uses client-side tab routing within the main `/entertainment` page; the individual routes mirror the tab content.

## What Was Recovered

- Lost commits recovered via `git reflog` on April 28, 2026.
- Original feature set spanning 1690+ lines in `EntertainmentPage.tsx` plus DiscordWidget, CDSpinner, GalleryFullPage, SpotifyNowPlaying, SpotifyFullPage components.
- TV bug fixes: larger screen, channel buttons spread left-to-right, and power-on default OFF (no auto-play with sound).

## Build & Dev

```bash
cd hermes-dashboard-entertainment-pack/dashboard
npm install
npm run dev   # local Vite dev server watching for changes
npm run build # outputs dist/index.js (IIFE bundle)
```

After building, restart `hermes dashboard` to reload the plugin.

## Project Structure

```
hermes-dashboard-entertainment-pack/
├── dashboard/
│   ├── src/
│   │   ├── pages/           # 5 page components
│   │   ├── components/      # DiscordWidget, GalleryFullPage, etc.
│   │   ├── ui/              # shadcn-compatible shims (Button, Badge, Select)
│   │   └── utils.ts         # cn() helper
│   ├── public/              # static assets (mixtape.jpeg)
│   ├── dist/                # built plugin (index.js) — generated
│   ├── manifest.json        # plugin metadata
│   ├── plugin_api.py        # backend API routes stub (health check)
│   ├── package.json         # dashboard build deps
│   └── vite.config.ts       # IIFE build configuration
├── README.md
└── LICENSE
```

## Credits

Recovered & packaged by Hermes (NousResearch/hermes-agent) for the **Hermes Hackathon — Sunday Prize Pool** 2026.

Original implementation by the recovery-from-reflog effort (commit range `27103ede` → `1cca3af2`) embedded within NousResearch/hermes-agent main branch. This package is standalone derivative work.

## License

MIT — free to use, modify, distribute.
