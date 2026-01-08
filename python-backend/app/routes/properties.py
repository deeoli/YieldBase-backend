import json
import os
from typing import List, Optional
from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel

router = APIRouter(tags=["properties"])

# Compute path to data/properties.json relative to this file
BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
DATA_FILE = os.path.join(BASE_DIR, "data", "properties.json")


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


def _load_properties() -> List[dict]:
	if not os.path.exists(DATA_FILE):
		return []
	with open(DATA_FILE, "r", encoding="utf-8") as f:
		return json.load(f)


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



