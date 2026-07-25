"""Local dev only: serve the static site and the /api app on one origin.

Mirrors production (Nginx serves the site and proxies /api/ to this app), so the
site's relative `/api/waitlist` call works when testing in a browser. Not used
in production. Run: uv run uvicorn devserver:app --port 8787
"""

from pathlib import Path

from fastapi.staticfiles import StaticFiles

from app import app

SITE_DIR = Path(__file__).resolve().parent.parent
app.mount("/", StaticFiles(directory=SITE_DIR, html=True), name="site")
