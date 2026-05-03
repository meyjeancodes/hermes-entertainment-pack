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
        result = [
            {"id": c["id"], "name": c["name"], "type": c["type"]}
            for c in channels if c["type"] in (0, 5)
        ]
        result.sort(key=lambda c: c["name"])
        return result
    except urllib.error.HTTPError as exc:
        raise HTTPException(status_code=exc.code, detail={"error": f"Discord API error {exc.code}"})
    except Exception as exc:
        raise HTTPException(status_code=502, detail={"error": str(exc)})


@router.get("/discord/messages")
async def discord_messages(channel_id: str, limit: int = 50):
    token = _discord_bot_token()
    if not token:
        raise HTTPException(status_code=401, detail={"error": "DISCORD_BOT_TOKEN not configured."})
    try:
        msgs = _discord_api("GET", f"/channels/{channel_id}/messages", token, params={"limit": str(min(limit, 100))})
        result = []
        for m in (msgs or []):
            a = m.get("author", {})
            result.append({
                "id": m["id"],
                "content": m.get("content", ""),
                "author": {
                    "username": a.get("username", ""),
                    "discriminator": a.get("discriminator", "0"),
                    "avatar": a.get("avatar"),
                    "bot": a.get("bot", False),
                },
                "timestamp": m.get("timestamp", ""),
                "channel_id": channel_id,
            })
        return result
    except urllib.error.HTTPError as exc:
        raise HTTPException(status_code=exc.code, detail={"error": f"Discord API error {exc.code}"})
    except Exception as exc:
        raise HTTPException(status_code=502, detail={"error": str(exc)})


class DiscordSendPayload(BaseModel):
    channel_id: str
    content: str


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
