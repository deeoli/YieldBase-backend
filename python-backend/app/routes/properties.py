import json
from typing import List, Optional
from fastapi import APIRouter, HTTPException, Query
from fastapi.responses import FileResponse
from pydantic import BaseModel
from pathlib import Path

router = APIRouter(tags=["properties"])

# Paths (Path-based)
BASE_DIR = Path(__file__).resolve().parents[2]
DATA_DIR = BASE_DIR / "data"
EXPORTS_DIR = DATA_DIR / "exports"
FALLBACK_FILE = DATA_DIR / "properties.json"


class Property(BaseModel):
	id: str
	title: str
	price: float
	currency: str
	address: str
	city: str
	postcode: str
	beds: int
	image: str
	sourceUrl: str
	baths: Optional[int] = None
	tenure: Optional[str] = None
	yield_: Optional[float] = None  # internal name (maps from 'yield' key)
	description: Optional[str] = None
	images: Optional[List[str]] = None
	floorArea: Optional[float] = None
	features: Optional[List[str]] = None
	estimatedMonthlyRent: Optional[float] = None
	estimatedAnnualRent: Optional[float] = None
	isHighYield: Optional[bool] = None

	def model_dump_public(self) -> dict:
		"""Dump with 'yield' key instead of yield_."""
		data = self.model_dump()
		if "yield_" in data:
			data["yield"] = data.pop("yield_")
		return data


def _get_latest_export_file() -> Optional[Path]:
	if not EXPORTS_DIR.exists():
		return None
	exports = sorted(EXPORTS_DIR.glob("*.json"), key=lambda p: p.stat().st_mtime, reverse=True)
	return exports[0] if exports else None


def _load_properties() -> List[dict]:
	# Try newest export first
	try_file: Optional[Path] = _get_latest_export_file()

	# If no exports, try fallback file
	if try_file is None:
		try_file = FALLBACK_FILE if FALLBACK_FILE.exists() else None

	# If nothing available
	if try_file is None:
		return []

	# Attempt to read chosen file; on error, fall back to fallback file
	def _read_json(path: Path) -> Optional[List[dict]]:
		try:
			with path.open("r", encoding="utf-8") as f:
				data = json.load(f)
			# Ensure list return
			return data if isinstance(data, list) else []
		except (FileNotFoundError, json.JSONDecodeError):
			return None

	primary = _read_json(try_file)
	if primary is not None:
		return primary

	# Fallback attempt (if primary was an export)
	if try_file != FALLBACK_FILE and FALLBACK_FILE.exists():
		fallback = _read_json(FALLBACK_FILE)
		if fallback is not None:
			return fallback

	return []


@router.get("/properties")
def list_properties(
	minPrice: Optional[float] = None,
	maxPrice: Optional[float] = None,
	city: Optional[str] = None,
	beds: Optional[int] = None,
	yield_param: Optional[float] = Query(None, alias="yield"),
	page: Optional[int] = None,
):
	items = _load_properties()

	def matches(p: dict) -> bool:
		# price filters
		if minPrice is not None and float(p.get("price", 0)) < float(minPrice):
			return False
		if maxPrice is not None and float(p.get("price", 0)) > float(maxPrice):
			return False
		# city filter
		if city:
			if not str(p.get("city", "")).lower().__contains__(city.lower()):
				return False
		# beds filter
		if beds is not None and int(p.get("beds", 0)) < int(beds):
			return False
		# yield filter
		if yield_param is not None:
			prop_yield = p.get("yield")
			try:
				if prop_yield is None or float(prop_yield) < float(yield_param):
					return False
			except Exception:
				return False
		return True

	filtered = [p for p in items if matches(p)]

	# No server-side pagination required by frontend; it paginates client-side.
	# We accept 'page' for compatibility but do not apply slicing here.
	# Return array (frontend supports array or {properties: []}).
	return filtered


@router.get("/properties/{property_id}")
def get_property(property_id: str):
	items = _load_properties()
	for p in items:
		if str(p.get("id")) == str(property_id):
			return p
	raise HTTPException(status_code=404, detail="Property not found")


@router.get("/images/{filename}")
def get_image(filename: str):
	safe = Path(filename).name
	if safe != filename:
		raise HTTPException(status_code=400, detail="Invalid filename")

	backend_root = Path(__file__).resolve().parents[2]  # python-backend/
	p1 = backend_root / "media_cache" / safe
	p2 = backend_root.parent / "media_cache" / safe

	if p1.exists():
		return FileResponse(str(p1))
	if p2.exists():
		return FileResponse(str(p2))
	raise HTTPException(status_code=404, detail="Not Found")


@router.get("/debug/source")
def debug_source():
    latest = _get_latest_export_file()
    chosen = latest if latest is not None else (FALLBACK_FILE if FALLBACK_FILE.exists() else None)
    return {
        "base_dir": str(BASE_DIR),
        "exports_dir": str(EXPORTS_DIR),
        "fallback_file": str(FALLBACK_FILE),
        "latest_export": str(latest) if latest else None,
        "chosen_file": str(chosen) if chosen else None,
        "exports_found": [p.name for p in sorted(EXPORTS_DIR.glob("*.json"))] if EXPORTS_DIR.exists() else [],
    }

