import json
import re
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
MEDIA_CACHE_DIR = BASE_DIR / "media_cache"


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
	

_UK_POSTCODE_RE = re.compile(r"\b([A-Z]{1,2}\d[A-Z\d]?\s?\d[A-Z]{2})\b", re.IGNORECASE)
_UK_OUTWARD_RE = re.compile(r"\b([A-Z]{1,2}\d[A-Z\d]?)\b", re.IGNORECASE)


def _extract_postcode(text: str) -> Optional[str]:
	if not text:
		return None
	m = _UK_POSTCODE_RE.search(text.upper())
	if not m:
		# Try outward-only (district) near the end of the string
		upper = text.upper()
		last_match = None
		for mo in _UK_OUTWARD_RE.finditer(upper):
			last_match = mo
		if last_match:
			candidate = last_match.group(1).upper()
			# Heuristic: accept if it's near the end or is the last token
			pos = last_match.start()
			last_tokens = [t.strip() for t in re.split(r"[,\s]+", upper) if t.strip()]
			if pos >= len(upper) - 10 or (last_tokens and candidate == last_tokens[-1]):
				return candidate
		return None
	code = m.group(1).upper().replace(" ", "")
	# Insert a single space before the last 3 characters when possible
	if len(code) > 3:
		return f"{code[:-3]} {code[-3:]}"
	return code


def _infer_city_and_postcode(p: dict) -> tuple[Optional[str], Optional[str]]:
	city: Optional[str] = None
	postcode: Optional[str] = None

	address = p.get("address") or ""
	title = p.get("title") or ""

	# Try regex postcode first from address, then title
	postcode = _extract_postcode(str(address)) or _extract_postcode(str(title))

	# Heuristic: split by comma and try to infer city from tokens
	def _token_city(s: str) -> Optional[str]:
		if not s:
			return None
		parts = [t.strip() for t in str(s).split(",") if t and t.strip()]
		if not parts:
			return None
		# Often ... , CITY , POSTCODE
		if len(parts) >= 2:
			# Prefer second last token as potential city
			return parts[-2]
		# Fallback to last token if only one
		return parts[-1]

	city = _token_city(address) or _token_city(title)

	return city if city else None, postcode if postcode else None


def _looks_like_postcode(s: str) -> bool:
	if not s:
		return False
	up = str(s).strip().upper()
	if up in {"UK", "GB"}:
		return False
	# Accept full or outward-only when the whole token matches
	return bool(_UK_POSTCODE_RE.fullmatch(up) or _UK_OUTWARD_RE.fullmatch(up))


def _normalize_property(p: dict) -> dict:
	"""
	Ensure required keys exist and fill sensible defaults/inferences without
	overwriting non-empty existing values.
	"""
	out = dict(p) if isinstance(p, dict) else {}

	# Helper: bad placeholders
	def _is_bad(val: Optional[str]) -> bool:
		if val is None:
			return True
		s = str(val).strip().lower()
		return s == "" or s in {"ask agent", "tbc", "n/a", "na", "-", "unknown"}

	# Required keys scaffold
	required_defaults = {
		"id": "",
		"title": "",
		"price": 0,
		"currency": "GBP",
		"address": "",
		"city": "",
		"postcode": "",
		"beds": 0,
		"image": "",
		"sourceUrl": "",
	}
	for k, v in required_defaults.items():
		if k not in out:
			out[k] = v

	# currency
	curr = str(out.get("currency") or "").strip().upper()
	out["currency"] = curr if curr else "GBP"

	# sourceUrl
	if not out.get("sourceUrl"):
		src = out.get("sourceUrl") or out.get("link") or ""
		out["sourceUrl"] = src

	# beds
	if not out.get("beds"):
		beds = out.get("bedrooms")
		try:
			out["beds"] = int(beds) if beds is not None and str(beds).strip() != "" else out.get("beds", 0)
		except Exception:
			out["beds"] = out.get("beds", 0)

	# price numeric coercion (keep minimal and safe)
	try:
		out["price"] = float(out.get("price") or 0)
	except Exception:
		out["price"] = 0

	# city/postcode inference without overwriting non-empty
	city_cur = (out.get("city") or "").strip()
	postcode_cur = (out.get("postcode") or "").strip()
	if _is_bad(city_cur) or _is_bad(postcode_cur):
		inf_city, inf_postcode = _infer_city_and_postcode(out)
		if _is_bad(city_cur) and inf_city:
			out["city"] = inf_city
		if _is_bad(postcode_cur) and inf_postcode:
			out["postcode"] = inf_postcode

	# If city is a postcode (e.g., "SW7") and postcode is bad/Unknown, promote city to postcode
	pc_cur = (out.get("postcode") or "").strip()
	city_val = (out.get("city") or "").strip()
	if _looks_like_postcode(city_val) and (_is_bad(pc_cur) or pc_cur.lower() == "unknown"):
		out["postcode"] = city_val.upper()
		# Try to infer a real city again; do not accept postcode-shaped values
		inf_city, inf_postcode = _infer_city_and_postcode(out)
		if inf_city and not _looks_like_postcode(inf_city):
			out["city"] = inf_city
		else:
			txt = f"{out.get('address','')} {out.get('title','')}".lower()
			out["city"] = "London" if "london" in txt else "Unknown"

	# If still missing/unusable, default to "Unknown" for required string fields
	for key in ("title", "address", "city", "postcode", "currency", "sourceUrl"):
		if _is_bad(out.get(key)):
			# currency already defaulted above, but keep consistent
			out[key] = "GBP" if key == "currency" else "Unknown"

	# Prefer cached image if available
	image_val = out.get("image") or ""
	image_path = out.get("image_path")
	if not image_val and isinstance(image_path, str) and image_path.strip():
		fname = Path(image_path).name
		if fname and "\\" not in fname and "media_cache" not in fname:
			image_val = f"/api/images/{fname}"
	out["image"] = image_val or ""

	# Derived metrics
	# 1) estimatedAnnualRent
	def _to_float(x) -> float:
		try:
			return float(x)
		except Exception:
			return 0.0

	ann = _to_float(out.get("estimatedAnnualRent"))
	if ann <= 0:
		monthly = _to_float(out.get("estimatedMonthlyRent"))
		if monthly > 0:
			out["estimatedAnnualRent"] = round(monthly * 12.0, 2)
	else:
		# keep existing positive value
		out["estimatedAnnualRent"] = round(ann, 2)

	# 2) yield (gross %)
	# Do not overwrite an existing valid yield
	existing_yield = out.get("yield")
	def _valid_num(v) -> bool:
		try:
			return float(v) > 0
		except Exception:
			return False

	if not _valid_num(existing_yield):
		price_v = _to_float(out.get("price"))
		ann_v = _to_float(out.get("estimatedAnnualRent"))
		if price_v > 0 and ann_v > 0:
			out["yield"] = round((ann_v / price_v) * 100.0, 2)

	# 3) isHighYield
	if not isinstance(out.get("isHighYield"), bool):
		yv = _to_float(out.get("yield"))
		if yv > 0:
			out["isHighYield"] = True if yv >= 8.0 else False

	return out


@router.get("/images/{filename}")
def get_cached_image(filename: str):
        # block path traversal
        if not filename or ".." in filename or "/" in filename or "\\" in filename:
                raise HTTPException(status_code=400, detail="Invalid filename")

        file_path = MEDIA_CACHE_DIR / filename
        if not file_path.exists() or not file_path.is_file():
                raise HTTPException(status_code=404, detail="Not Found")

        return FileResponse(str(file_path), media_type="image/jpeg")


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
	# Normalize payloads first
	items = [_normalize_property(p) for p in items]

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
			return _normalize_property(p)
	raise HTTPException(status_code=404, detail="Property not found")


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

