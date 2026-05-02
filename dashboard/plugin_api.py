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


@router.post("/spotify/shuffle")
async def spotify_shuffle():
    try:
        client, SpotifyAuthRequiredError, SpotifyAPIError = _spotify_client()
    except Exception as exc:
        raise HTTPException(status_code=503, detail={"message": str(exc)})
    try:
        state = client.get_playback_state()
        current = state.get("shuffle_state", False) if state else False
        return client.set_shuffle(state=not current)
    except SpotifyAuthRequiredError:
        raise HTTPException(status_code=401, detail={"error": "auth_required"})
    except SpotifyAPIError as exc:
        raise HTTPException(status_code=502, detail={"message": str(exc)})


@router.post("/spotify/repeat")
async def spotify_repeat():
    try:
        client, SpotifyAuthRequiredError, SpotifyAPIError = _spotify_client()
    except Exception as exc:
        raise HTTPException(status_code=503, detail={"message": str(exc)})
    try:
        state = client.get_playback_state()
        current = (state or {}).get("repeat_state", "off")
        next_state = {"off": "context", "context": "track", "track": "off"}.get(current, "off")
        return client.set_repeat(state=next_state)
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
