## YieldBase
(📘 For a full system walkthrough and architecture details, see YIELDBASE_HOW_IT_WORKS.md.
)
YieldBase is a property investment discovery tool. It aggregates listings, normalizes data, and presents yield-focused insights so investors can quickly evaluate opportunities.

- Live (local dev): Next.js 14 frontend + FastAPI backend (JSON-backed), with cached images served from the backend.
- Planned (not yet): scraper-to-exports automation, optional DB (SQLite/Postgres), production deployment hardening.

## Architecture Overview

High-level flow:
- Scraper (out of band) → JSON exports in `python-backend/data/exports/` (and seed data in `python-backend/data/properties.json`)
- FastAPI normalizes/serves property data and cached images under `/api/*`
- Next.js consumes the backend via proxied `/api/*` routes

Cached image serving:
- Scraper writes images to `python-backend/media_cache`
- Backend serves them via `GET /api/images/{filename}`
- Frontend prefers cached images first, then Rightmove URLs, then a deterministic fallback

## Local Development Setup

Prerequisites:
- Node.js 18+ and npm
- Python 3.10+ and pip
- Git

Backend (FastAPI):
- From repo root:
  - `cd python-backend`
  - Create venv:
    - Unix/macOS: `python -m venv .venv && source .venv/bin/activate`
    - Windows (PowerShell/CMD): `python -m venv .venv && .venv\Scripts\activate`
  - Install deps: `pip install -r requirements.txt`
  - Run dev server: `uvicorn app.main:app --reload --port 8001`
  - Backend base: `http://localhost:8001` (API prefix `/api`)

Frontend (Next.js 14):
- From repo root:
  - `cd frontend`
  - Create `.env.local` if missing:
    - `NEXT_PUBLIC_DATA_SOURCE=scraper`
    - `NEXT_PUBLIC_SCRAPER_API_BASE_URL=http://localhost:8001/api`
    - `NEXT_PUBLIC_EXTERNAL_API_BASE_URL=`
  - Install deps: `npm install`
  - Run dev server: `npm run dev`
  - Frontend: `http://localhost:3000` (Next may auto-switch to `3001` if 3000 is in use)

Expected local URLs:
- API health: `http://localhost:8001/api/health`
- Properties list: `http://localhost:8001/api/properties`
- Property detail: `http://localhost:8001/api/properties/{id}`
- Cached images: `http://localhost:8001/api/images/{filename}`
- Frontend home: `http://localhost:3000/`
- Frontend listings: `http://localhost:3000/properties`
- Frontend yield calculator: `http://localhost:3000/yield-calculator`

Note on proxying:
- `frontend/next.config.js` rewrites `/api/*` to the backend URL from `NEXT_PUBLIC_SCRAPER_API_BASE_URL`, so the frontend can call `/api/...` without hardcoding backend hosts.

## API Endpoints (Current)

- GET `/api/health`
  - 200 → `{"status": "ok"}`
- GET `/api/properties`
  - 200 → JSON array of normalized properties
  - Supports filter query params (if provided): `minPrice`, `maxPrice`, `city`, `beds`, `yield`, `page`
- GET `/api/properties/{id}`
  - 200 → a single normalized property
  - 404 → not found
- GET `/api/images/{filename}`
  - 200 → serves cached image bytes from `python-backend/media_cache`

Required property keys:
- `id`, `title`, `price`, `currency`, `address`, `city`, `postcode`, `beds`, `image`, `sourceUrl`

Optional keys:
- `baths`, `tenure`, `yield`, `description`, `images`, `floorArea`, `features`, `estimatedMonthlyRent`, `estimatedAnnualRent`, `isHighYield`, `rentIsEstimated`, `yieldIsEstimated`

## Testing

Backend (pytest):
- `cd python-backend`
- `python -m pytest -q`

Frontend (vitest):
- `cd frontend`
- `npm test`

Scope:
- Backend tests exercise health, properties list/detail integrity, cached image serving (skipped if no cached images found).
- Frontend tests validate image candidate building (prefer `/api/images` first, no `/api/api` double prefix, fallback order).

## Manual Smoke Tests (Pre-Deploy)

Run these after a fresh start (start backend first, then frontend):

- [ ] Backend health: `GET /api/health` returns 200 and `{"status":"ok"}`
- [ ] Properties list: `GET /api/properties` returns 200 and a JSON array
- [ ] Property detail: `GET /api/properties/{id}` (use an id from the list) returns 200
- [ ] Cached image: pick a real filename in `python-backend/media_cache`, `GET /api/images/{filename}` returns 200 with `Content-Type: image/*`
- [ ] Frontend `/properties` loads; cards render without broken main images (fallbacks acceptable for some)
- [ ] Property detail page loads; hero image attempts `/api/images/...` first when available
- [ ] Yield calculator renders at `/yield-calculator` and computes values for provided inputs
- [ ] “Enquire” button on a card does not crash the UI (no red error overlay)

## Deployment Notes

- Order of services:
  - Start FastAPI before Next.js; frontend rewrites depend on a reachable backend.
- Required directories:
  - `python-backend/media_cache` must exist and be readable by the backend process.
  - `python-backend/data` (and optionally `data/exports`) should exist for JSON data.
- Environment variables (frontend):
  - `NEXT_PUBLIC_DATA_SOURCE` (e.g. `scraper`)
  - `NEXT_PUBLIC_SCRAPER_API_BASE_URL` (e.g. `https://api.example.com/api`)
  - `NEXT_PUBLIC_EXTERNAL_API_BASE_URL` (optional)
- CORS:
  - FastAPI must allow the frontend origin (in dev, `http://localhost:3000`).
- Post-deploy smoke:
  - Re-run the Manual Smoke Tests against the deployed URLs.
- Example run commands (reference only, not executed here):
  - Backend: `uvicorn app.main:app --host 0.0.0.0 --port 8001`
  - Frontend: `npm run build && npm run start` in `frontend/`
