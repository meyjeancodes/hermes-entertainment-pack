"""Entertainment Pack plugin backend API routes.

Mounted at /api/plugins/hermes-entertainment-pack/ by the dashboard plugin system.
"""

from __future__ import annotations

import sys
import os
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

router = APIRouter()


@router.get("/health")
async def health():
    return {"status": "ok", "plugin": "hermes-entertainment-pack", "version": "1.0.0"}


# ── Spotify passthrough endpoints ─────────────────────────────────────────────

def _spotify_client():
    """Import and return a SpotifyClient, adding hermes-agent to sys.path if needed."""
    hermes_agent = os.path.expanduser("~/.hermes/hermes-agent")
    if hermes_agent not in sys.path:
        sys.path.insert(0, hermes_agent)
    from plugins.spotify.client import SpotifyClient, SpotifyAuthRequiredError, SpotifyAPIError
    return SpotifyClient(), SpotifyAuthRequiredError, SpotifyAPIError


@router.get("/spotify/now-playing")
async def spotify_now_playing():
    try:
        client, SpotifyAuthRequiredError, SpotifyAPIError = _spotify_client()
    except Exception as exc:
        raise HTTPException(status_code=503, detail={"message": str(exc)})

    try:
        data = client.get_currently_playing()
    except SpotifyAuthRequiredError:
        raise HTTPException(status_code=401, detail={"error": "auth_required", "message": "Run hermes auth spotify to connect."})
    except SpotifyAPIError as exc:
        raise HTTPException(status_code=502, detail={"message": str(exc)})
    except Exception as exc:
        raise HTTPException(status_code=500, detail={"message": str(exc)})

    # Normalise Spotify's now-playing response into the shape the frontend expects
    if not data or data.get("empty"):
        return {"playing": False, "track": None, "progress_ms": 0, "device": None}

    item = data.get("item") or {}
    artists = [a.get("name", "") for a in item.get("artists", [])]
    images = item.get("album", {}).get("images", [])
    image_url = images[0].get("url") if images else None
    device = (data.get("device") or {}).get("name")

    return {
        "playing": data.get("is_playing", False),
        "track": {
            "name": item.get("name", ""),
            "artists": artists,
            "album": item.get("album", {}).get("name", ""),
            "image": image_url,
            "url": item.get("external_urls", {}).get("spotify", ""),
            "duration_ms": item.get("duration_ms", 0),
        },
        "progress_ms": data.get("progress_ms", 0),
        "device": device,
        "shuffle_state": data.get("shuffle_state"),
        "repeat_state": data.get("repeat_state"),
    }


@router.post("/spotify/play")
async def spotify_play():
    try:
        client, SpotifyAuthRequiredError, SpotifyAPIError = _spotify_client()
    except Exception as exc:
        raise HTTPException(status_code=503, detail={"message": str(exc)})
    try:
        return client.start_playback()
    except SpotifyAuthRequiredError:
        raise HTTPException(status_code=401, detail={"error": "auth_required"})
    except SpotifyAPIError as exc:
        raise HTTPException(status_code=502, detail={"message": str(exc)})


@router.post("/spotify/pause")
async def spotify_pause():
    try:
        client, SpotifyAuthRequiredError, SpotifyAPIError = _spotify_client()
    except Exception as exc:
        raise HTTPException(status_code=503, detail={"message": str(exc)})
    try:
        return client.pause_playback()
    except SpotifyAuthRequiredError:
        raise HTTPException(status_code=401, detail={"error": "auth_required"})
    except SpotifyAPIError as exc:
        raise HTTPException(status_code=502, detail={"message": str(exc)})


@router.post("/spotify/next")
async def spotify_next():
    try:
        client, SpotifyAuthRequiredError, SpotifyAPIError = _spotify_client()
    except Exception as exc:
        raise HTTPException(status_code=503, detail={"message": str(exc)})
    try:
        return client.skip_next()
    except SpotifyAuthRequiredError:
        raise HTTPException(status_code=401, detail={"error": "auth_required"})
    except SpotifyAPIError as exc:
        raise HTTPException(status_code=502, detail={"message": str(exc)})


@router.post("/spotify/previous")
async def spotify_previous():
    try:
        client, SpotifyAuthRequiredError, SpotifyAPIError = _spotify_client()
    except Exception as exc:
        raise HTTPException(status_code=503, detail={"message": str(exc)})
    try:
        return client.skip_previous()
    except SpotifyAuthRequiredError:
        raise HTTPException(status_code=401, detail={"error": "auth_required"})
    except SpotifyAPIError as exc:
        raise HTTPException(status_code=502, detail={"message": str(exc)})


class ShufflePayload(BaseModel):
    state: bool


@router.post("/spotify/shuffle")
async def spotify_shuffle(payload: ShufflePayload):
    try:
        client, SpotifyAuthRequiredError, SpotifyAPIError = _spotify_client()
    except Exception as exc:
        raise HTTPException(status_code=503, detail={"message": str(exc)})
    try:
        return client.set_shuffle(state=payload.state)
    except SpotifyAuthRequiredError:
        raise HTTPException(status_code=401, detail={"error": "auth_required"})
    except SpotifyAPIError as exc:
        raise HTTPException(status_code=502, detail={"message": str(exc)})


class RepeatPayload(BaseModel):
    state: str


@router.post("/spotify/repeat")
async def spotify_repeat(payload: RepeatPayload):
    valid = {"off", "context", "track"}
    if payload.state not in valid:
        raise HTTPException(status_code=400, detail={"message": f"state must be one of: {valid}"})
    try:
        client, SpotifyAuthRequiredError, SpotifyAPIError = _spotify_client()
    except Exception as exc:
        raise HTTPException(status_code=503, detail={"message": str(exc)})
    try:
        return client.set_repeat(state=payload.state)
    except SpotifyAuthRequiredError:
        raise HTTPException(status_code=401, detail={"error": "auth_required"})
    except SpotifyAPIError as exc:
        raise HTTPException(status_code=502, detail={"message": str(exc)})


class VolumePayload(BaseModel):
    volume: int


@router.post("/spotify/volume")
async def spotify_volume(payload: VolumePayload):
    try:
        client, SpotifyAuthRequiredError, SpotifyAPIError = _spotify_client()
    except Exception as exc:
        raise HTTPException(status_code=503, detail={"message": str(exc)})
    try:
        return client.set_volume(volume_percent=max(0, min(100, payload.volume)))
    except SpotifyAuthRequiredError:
        raise HTTPException(status_code=401, detail={"error": "auth_required"})
    except SpotifyAPIError as exc:
        raise HTTPException(status_code=502, detail={"message": str(exc)})


@router.get("/spotify/recently-played")
async def spotify_recently_played(limit: int = 8):
    try:
        client, SpotifyAuthRequiredError, SpotifyAPIError = _spotify_client()
    except Exception as exc:
        raise HTTPException(status_code=503, detail={"message": str(exc)})
    try:
        data = client.get_recently_played(limit=limit)
    except SpotifyAuthRequiredError:
        raise HTTPException(status_code=401, detail={"error": "auth_required"})
    except SpotifyAPIError as exc:
        raise HTTPException(status_code=502, detail={"message": str(exc)})
    except Exception as exc:
        raise HTTPException(status_code=500, detail={"message": str(exc)})
    items = (data or {}).get("items", [])
    seen: set = set()
    result = []
    for item in items:
        track = item.get("track") or {}
        name = track.get("name", "")
        if not name or name in seen:
            continue
        seen.add(name)
        artists = [a.get("name", "") for a in track.get("artists", [])]
        result.append({
            "name": name,
            "artists": artists,
            "album": (track.get("album") or {}).get("name", ""),
            "duration_ms": track.get("duration_ms", 0),
            "played_at": item.get("played_at", ""),
        })
    return result


# ── Discord passthrough endpoints ─────────────────────────────────────────────

import json as _json
import urllib.request
import urllib.error
import urllib.parse
from typing import Optional as _Opt

_DISCORD_API_BASE = "https://discord.com/api/v10"


def _discord_bot_token() -> _Opt[str]:
    return os.getenv("DISCORD_BOT_TOKEN", "").strip() or None


def _discord_api(method: str, path: str, token: str, params: _Opt[dict] = None, body: _Opt[dict] = None):
    url = f"{_DISCORD_API_BASE}{path}"
    if params:
        url += "?" + urllib.parse.urlencode({k: v for k, v in params.items() if v is not None})
    data = _json.dumps(body).encode() if body is not None else None
    req = urllib.request.Request(
        url, data=data, method=method,
        headers={
            "Authorization": f"Bot {token}",
            "Content-Type": "application/json",
            "User-Agent": "Hermes-Entertainment/1.0",
        },
    )
    with urllib.request.urlopen(req, timeout=15) as resp:
        if resp.status == 204:
            return None
        return _json.loads(resp.read().decode("utf-8"))


@router.get("/discord/guilds")
async def discord_guilds():
    token = _discord_bot_token()
    if not token:
        raise HTTPException(status_code=401, detail={"error": "DISCORD_BOT_TOKEN not configured. Add it to ~/.hermes/.env and restart."})
    try:
        guilds = _discord_api("GET", "/users/@me/guilds", token)
        return [{"id": g["id"], "name": g["name"], "icon": g.get("icon")} for g in guilds]
    except urllib.error.HTTPError as exc:
        raise HTTPException(status_code=exc.code, detail={"error": f"Discord API error {exc.code}"})
    except Exception as exc:
        raise HTTPException(status_code=502, detail={"error": str(exc)})


@router.get("/discord/channels")
async def discord_channels(guild_id: str):
    token = _discord_bot_token()
    if not token:
        raise HTTPException(status_code=401, detail={"error": "DISCORD_BOT_TOKEN not configured."})
    try:
        channels = _discord_api("GET", f"/guilds/{guild_id}/channels", token)
        # Include categories (4) and text/announcement channels (0, 5)
        result = [
            {
                "id": c["id"],
                "name": c["name"],
                "type": c["type"],
                "position": c.get("position", 0),
                "parent_id": c.get("parent_id"),
            }
            for c in channels if c["type"] in (0, 4, 5)
        ]
        result.sort(key=lambda c: (c.get("position") or 0))
        return result
    except urllib.error.HTTPError as exc:
        raise HTTPException(status_code=exc.code, detail={"error": f"Discord API error {exc.code}"})
    except Exception as exc:
        raise HTTPException(status_code=502, detail={"error": str(exc)})


@router.get("/discord/messages")
async def discord_messages(channel_id: str, limit: int = 50, after: _Opt[str] = None):
    token = _discord_bot_token()
    if not token:
        raise HTTPException(status_code=401, detail={"error": "DISCORD_BOT_TOKEN not configured."})
    try:
        params: dict = {"limit": str(min(limit, 100))}
        if after:
            params["after"] = after
        msgs = _discord_api("GET", f"/channels/{channel_id}/messages", token, params=params)
        result = []
        for m in (msgs or []):
            a = m.get("author", {})
            attachments = [
                {
                    "id": att.get("id"),
                    "url": att.get("url"),
                    "filename": att.get("filename"),
                    "content_type": att.get("content_type", ""),
                    "width": att.get("width"),
                    "height": att.get("height"),
                    "size": att.get("size"),
                }
                for att in m.get("attachments", [])
            ]
            embeds = [
                {
                    "type": e.get("type"),
                    "title": e.get("title"),
                    "description": e.get("description"),
                    "url": e.get("url"),
                    "color": e.get("color"),
                    "image": e.get("image", {}).get("url") if e.get("image") else None,
                    "thumbnail": e.get("thumbnail", {}).get("url") if e.get("thumbnail") else None,
                    "author_name": e.get("author", {}).get("name") if e.get("author") else None,
                    "footer_text": e.get("footer", {}).get("text") if e.get("footer") else None,
                }
                for e in m.get("embeds", [])
            ]
            result.append({
                "id": m["id"],
                "content": m.get("content", ""),
                "author": {
                    "id": a.get("id", ""),
                    "username": a.get("username", ""),
                    "discriminator": a.get("discriminator", "0"),
                    "avatar": a.get("avatar"),
                    "bot": a.get("bot", False),
                },
                "timestamp": m.get("timestamp", ""),
                "edited_timestamp": m.get("edited_timestamp"),
                "channel_id": channel_id,
                "attachments": attachments,
                "embeds": embeds,
                "mention_everyone": m.get("mention_everyone", False),
                "reactions": [
                    {"emoji": r.get("emoji", {}).get("name", ""), "count": r.get("count", 0)}
                    for r in m.get("reactions", [])
                ],
            })
        return result
    except urllib.error.HTTPError as exc:
        raise HTTPException(status_code=exc.code, detail={"error": f"Discord API error {exc.code}"})
    except Exception as exc:
        raise HTTPException(status_code=502, detail={"error": str(exc)})


class DiscordSendPayload(BaseModel):
    channel_id: str
    content: str


# ── Teletext news (BBC RSS) ────────────────────────────────────────────────────

import xml.etree.ElementTree as _ET
import html as _html

_TELETEXT_FEEDS = {
    "top":      "https://feeds.bbci.co.uk/news/rss.xml",
    "world":    "https://feeds.bbci.co.uk/news/world/rss.xml",
    "business": "https://feeds.bbci.co.uk/news/business/rss.xml",
    "tech":     "https://feeds.bbci.co.uk/news/technology/rss.xml",
    "sports":   "https://feeds.bbci.co.uk/sport/rss.xml",
}


@router.get("/teletext/news")
async def teletext_news(category: str = "top"):
    url = _TELETEXT_FEEDS.get(category, _TELETEXT_FEEDS["top"])
    try:
        req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0 (compatible)"})
        with urllib.request.urlopen(req, timeout=8) as resp:
            raw = resp.read().decode("utf-8", errors="replace")
        root = _ET.fromstring(raw)
        headlines = [
            _html.unescape(t.text.strip())
            for item in root.findall(".//item")[:10]
            if (t := item.find("title")) is not None and t.text
        ]
        return {"headlines": headlines}
    except Exception as exc:
        return {"headlines": [], "error": str(exc)}


@router.post("/discord/send")
async def discord_send(payload: DiscordSendPayload):
    token = _discord_bot_token()
    if not token:
        raise HTTPException(status_code=401, detail={"error": "DISCORD_BOT_TOKEN not configured."})
    if not payload.content.strip():
        raise HTTPException(status_code=400, detail={"error": "Message content cannot be empty."})
    try:
        msg = _discord_api("POST", f"/channels/{payload.channel_id}/messages", token,
                           body={"content": payload.content[:2000]})
        return {"success": True, "id": msg["id"] if msg else None}
    except urllib.error.HTTPError as exc:
        raise HTTPException(status_code=exc.code, detail={"error": f"Discord API error {exc.code}"})
    except Exception as exc:
        raise HTTPException(status_code=502, detail={"error": str(exc)})
