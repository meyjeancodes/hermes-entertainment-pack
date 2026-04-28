"""Entertainment Pack plugin backend API routes.

Mounted at /api/plugins/hermes-entertainment-pack/ by the dashboard plugin system.
No custom endpoints needed — Discord/Spotify integrations call external APIs directly.
"""

from fastapi import APIRouter

router = APIRouter()


@router.get("/health")
async def health():
    return {"status": "ok", "plugin": "hermes-entertainment-pack", "version": "1.0.0"}
