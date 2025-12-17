from dotenv import load_dotenv
load_dotenv()

import os
import json
import re
from pathlib import Path
from typing import Any, Dict, List, Optional

import openai
from fastapi import FastAPI, HTTPException, Query, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, FileResponse


app = FastAPI()

client = openai.OpenAI(
    api_key=os.getenv("OPENROUTER_API_KEY"),
    base_url="https://openrouter.ai/api/v1"
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# -------- Helper functions to expose scraped listings --------

DATA_EXPORT_DIR = Path(__file__).resolve().parent.parent / "data" / "exports"
MEDIA_CACHE_DIR = Path(__file__).resolve().parent.parent / "media_cache"


def _get_latest_export_file() -> Optional[Path]:
    """Return the most recent JSON export file, or None if none exist."""
    if not DATA_EXPORT_DIR.exists():
        return None
    # Prefer matched files (including verified), then regular exports
    matched_files = sorted(DATA_EXPORT_DIR.glob("rightmove_matched*.json"))
    if matched_files:
        # Prefer verified files
        verified_files = [f for f in matched_files if 'verified' in f.name]
        if verified_files:
            # Among verified files, prefer the one with more properties (50 vs 25)
            def get_property_count(f: Path) -> int:
                try:
                    with f.open("r", encoding="utf-8") as file:
                        return len(json.load(file))
                except:
                    return 0
            
            verified_files.sort(key=lambda f: (get_property_count(f), f.stat().st_mtime), reverse=True)
            return verified_files[0]
        return matched_files[-1]  # Get the most recent matched file
    files = sorted(DATA_EXPORT_DIR.glob("rightmove_*.json"))
    return files[-1] if files else None


def _parse_price(raw_price: Optional[str]) -> Optional[float]:
    """Extract a numeric price from a messy Rightmove price string."""
    if not raw_price:
        return None
    # Keep digits and separators, e.g. £700,000Guide Price -> 700000
    digits = re.findall(r"\d+", raw_price.replace(",", ""))
    if not digits:
        return None
    try:
        return float("".join(digits))
    except ValueError:
        return None


def _extract_id_from_link(link: Optional[str]) -> Optional[str]:
    """
    Use the Rightmove property ID in the URL as a stable ID, e.g.
    https://www.rightmove.co.uk/properties/163498040#/?channel=... -> 163498040
    """
    if not link:
        return None
    match = re.search(r"/properties/(\d+)", link)
    if match:
        return match.group(1)
    return None


def _infer_city_from_address(address: Optional[str]) -> Optional[str]:
    """Very simple heuristic: take the last comma-separated segment as the city."""
    if not address:
        return None
    parts = [p.strip() for p in address.split(",") if p.strip()]
    return parts[-1] if parts else None


def _load_properties() -> List[Dict[str, Any]]:
    """Load and lightly normalise the latest scraped listings from JSON."""
    latest_file = _get_latest_export_file()
    if not latest_file:
        return []

    with latest_file.open("r", encoding="utf-8") as f:
        raw_data = json.load(f)

    properties: List[Dict[str, Any]] = []
    for idx, item in enumerate(raw_data):
        prop: Dict[str, Any] = dict(item)

        # Stable ID
        prop_id = prop.get("id") or _extract_id_from_link(prop.get("link")) or str(idx)
        prop["id"] = str(prop_id)

        # Price as numeric (frontend expects numeric price)
        price_num = _parse_price(prop.get("price"))
        if price_num is not None:
            prop["price"] = price_num

        # Bedrooms / bathrooms
        if "beds" not in prop and prop.get("bedrooms") is not None:
            try:
                prop["beds"] = int(prop["bedrooms"])
            except (TypeError, ValueError):
                pass
        if "baths" not in prop and prop.get("bathrooms") is not None:
            try:
                prop["baths"] = int(prop["bathrooms"])
            except (TypeError, ValueError):
                pass

        # City
        if not prop.get("city"):
            inferred_city = _infer_city_from_address(prop.get("address"))
            if inferred_city:
                prop["city"] = inferred_city

        # Image fields - prioritize cached local images, then fallback to URLs
        # Only use cached images if the file actually exists
        cached_images = []
        
        # Helper function to find cached images (exact match or by prefix)
        def find_cached_image(filename: str):
            """Try to find the exact file, or similar files if exact match doesn't exist."""
            image_path = MEDIA_CACHE_DIR / filename
            if image_path.exists() and image_path.is_file():
                return f"/images/{filename}"
            
            # Try to find similar files by prefix
            parts = filename.split('_')
            if len(parts) >= 2:
                # Try first two parts (e.g., "25602_KNH230176")
                prefix = f"{parts[0]}_{parts[1]}"
                similar_files = sorted(MEDIA_CACHE_DIR.glob(f"{prefix}_*.jpeg"))
                if similar_files:
                    return f"/images/{similar_files[0].name}"
                
                # Try just first part (e.g., "25602")
                prefix = parts[0]
                similar_files = sorted(MEDIA_CACHE_DIR.glob(f"{prefix}_*.jpeg"))
                if similar_files:
                    return f"/images/{similar_files[0].name}"
            
            # Last resort: try to find any file with similar pattern
            # Look for files starting with the first number
            if parts and parts[0].isdigit():
                prefix = parts[0]
                similar_files = sorted(MEDIA_CACHE_DIR.glob(f"{prefix}_*.jpeg"))
                if similar_files:
                    return f"/images/{similar_files[0].name}"
            
            return None
        
        if prop.get("image_path"):
            filename = Path(prop["image_path"]).name
            cached_url = find_cached_image(filename)
            if cached_url:
                cached_images.append(cached_url)
        
        if prop.get("image_paths"):
            for img_path in prop["image_paths"]:
                filename = Path(img_path).name
                cached_url = find_cached_image(filename)
                if cached_url and cached_url not in cached_images:
                    cached_images.append(cached_url)
        
        # Use cached images if available
        if cached_images:
            prop["image"] = cached_images[0]
            prop["images"] = cached_images
        else:
            # No cached images available - don't use expired Rightmove URLs
            # Set to None/empty so frontend uses fallback images
            prop["image"] = None
            prop["images"] = []
            
            # Log for debugging
            print(f"[WARN] No cached images found for property {prop.get('id', 'unknown')}, using fallback")

        # Source URL field expected by frontend
        if not prop.get("sourceUrl"):
            prop["sourceUrl"] = prop.get("external_url") or prop.get("link")

        properties.append(prop)

    return properties


def _filter_properties(
    properties: List[Dict[str, Any]],
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    city: Optional[str] = None,
    beds: Optional[int] = None,
    min_yield: Optional[float] = None,
) -> List[Dict[str, Any]]:
    filtered = properties

    if min_price is not None:
        filtered = [p for p in filtered if isinstance(p.get("price"), (int, float)) and p["price"] >= min_price]
    if max_price is not None:
        filtered = [p for p in filtered if isinstance(p.get("price"), (int, float)) and p["price"] <= max_price]
    if city:
        city_lower = city.lower()
        filtered = [
            p for p in filtered
            if isinstance(p.get("city"), str) and city_lower in p["city"].lower()
        ]
    if beds is not None:
        filtered = [
            p for p in filtered
            if isinstance(p.get("beds"), (int, float)) and p["beds"] >= beds
        ]
    if min_yield is not None:
        filtered = [
            p for p in filtered
            if isinstance(p.get("yield"), (int, float)) and p["yield"] >= min_yield
        ]

    return filtered


@app.get("/api/properties")
async def list_properties(
    minPrice: Optional[float] = Query(default=None),
    maxPrice: Optional[float] = Query(default=None),
    city: Optional[str] = Query(default=None),
    beds: Optional[int] = Query(default=None),
    yield_: Optional[float] = Query(default=None, alias="yield"),
    page: Optional[int] = Query(default=None),
):
    """
    List scraped properties, roughly matching the filters expected by the Next.js app.
    """
    properties = _load_properties()
    if not properties:
        raise HTTPException(status_code=404, detail="No scraped properties available")

    filtered = _filter_properties(
        properties,
        min_price=minPrice,
        max_price=maxPrice,
        city=city,
        beds=beds,
        min_yield=yield_,
    )

    # Simple pagination stub (optional)
    if page is not None and page > 0:
        page_size = 50
        start = (page - 1) * page_size
        end = start + page_size
        filtered = filtered[start:end]

    return JSONResponse(filtered)


@app.get("/api/properties/{property_id}")
async def get_property(property_id: str):
    """Fetch a single scraped property by ID."""
    properties = _load_properties()
    if not properties:
        raise HTTPException(status_code=404, detail="No scraped properties available")

    for prop in properties:
        if str(prop.get("id")) == str(property_id):
            return JSONResponse(prop)

    raise HTTPException(status_code=404, detail="Property not found")


@app.get("/api/images/{filename}")
async def get_image(filename: str):
    """Serve cached property images from media_cache folder."""
    image_path = MEDIA_CACHE_DIR / filename
    
    if not image_path.exists() or not image_path.is_file():
        raise HTTPException(status_code=404, detail=f"Image not found: {filename}")
    
    # Determine content type
    content_type = "image/jpeg"
    if filename.lower().endswith(".png"):
        content_type = "image/png"
    elif filename.lower().endswith(".webp"):
        content_type = "image/webp"
    
    return FileResponse(
        image_path,
        media_type=content_type,
        headers={"Cache-Control": "public, max-age=31536000"}  # Cache for 1 year
    )


@app.post("/api/ai-yield")
async def ai_yield(request: Request):
    data = await request.json()
    location = data.get("location")
    property_type = data.get("property_type")
    bedrooms = data.get("bedrooms")
    strategy = data.get("strategy")
    purchase_price = data.get("purchase_price")

    prompt = (
        f"You are an expert UK property investment AI. "
        f"Based on UK market data from 2020–2025, local yields, rental trends, "
        f"and BTL returns, estimate a realistic NET yield for a {bedrooms}-bed {property_type} in {location} using the '{strategy}' strategy. "
        f"Purchase price: £{purchase_price}. "
        f"Return a valid JSON: predicted_yield (number), summary (sentence), trend_note (sentence), ai_confidence (Low/Medium/High). "
        f"Respond with JSON only. Do not say anything else."
    )

    try:
        response = client.chat.completions.create(
            model="anthropic/claude-3-sonnet",  # Or another model OpenRouter supports
            messages=[{"role": "user", "content": prompt}],
            max_tokens=256,
            temperature=0.3,
        )
        reply = response.choices[0].message.content
        print("AI raw reply:", reply)
        match = re.search(r"({.*?})", reply, re.DOTALL)
        json_str = match.group(1) if match else reply
        result = json.loads(json_str)
        return JSONResponse(result)
    except Exception as e:
        return JSONResponse({"error": str(e)}, status_code=500)


# import asyncio
# import os
# import json
# from dotenv import load_dotenv
# import httpx
# from fastapi import FastAPI, Request
# from fastapi.responses import JSONResponse

# load_dotenv()

# OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")
# OPENROUTER_API_BASE = "https://openrouter.ai/api/v1"
# HEADERS = {
#     "Authorization": f"Bearer {OPENROUTER_API_KEY}",
#     "HTTP-Referer": "http://localhost",
#     "X-Title": "uk-property-ai"
# }

# MODELS = [
#     "openai/gpt-4.1",
#     "openai/gpt-4.1-2025-04-14",
#     "anthropic/claude-3-opus",
#     "anthropic/claude-3.7-sonnet",
#     "meta-llama/llama-3.3-70b-instruct",
#     "mistralai/mistral-large-2411",
#     "google/gemini-2.0-flash-001"
# ]

# app = FastAPI()

# PROMPT_TEMPLATE = (
#     "You are an expert UK property investment AI. Based on UK market data from 2020–2025, local yields, "
#     "rental trends, and BTL returns, estimate a realistic NET yield for a {bedrooms}-bed {property_type} in {location} "
#     "using the '{strategy}' strategy. Purchase price: £{purchase_price}. "
#     "Return a valid JSON: predicted_yield (number), summary (sentence), trend_note (sentence), ai_confidence (Low/Medium/High). "
#     "Respond with JSON only. Do not say anything else."
# )

# async def query_model(model, prompt):
#     payload = {
#         "model": model,
#         "messages": [{"role": "user", "content": prompt}],
#         "max_tokens": 256,
#         "temperature": 0.3
#     }
#     async with httpx.AsyncClient(timeout=60.0) as client:
#         try:
#             resp = await client.post(
#                 f"{OPENROUTER_API_BASE}/chat/completions",
#                 headers=HEADERS,
#                 json=payload
#             )
#             print(f"\n--- {model} RAW RESPONSE ---\n", resp.status_code, resp.text)  # 👈 DEBUG print
#             data = resp.json()
#             content = data["choices"][0]["message"]["content"]
#             # Try to extract only the JSON object
#             import re
#             match = re.search(r'({.*?})', content, re.DOTALL)
#             obj = json.loads(match.group(1)) if match else {"error": "AI did not return valid JSON"}
#             obj["model"] = model
#             return obj
#         except Exception as e:
#             return {"error": str(e), "model": model}

# @app.post("/api/ai-yield")
# async def ai_yield(request: Request):
#     data = await request.json()
#     prompt = PROMPT_TEMPLATE.format(
#         location=data.get("location"),
#         property_type=data.get("property_type"),
#         bedrooms=data.get("bedrooms"),
#         strategy=data.get("strategy"),
#         purchase_price=data.get("purchase_price")
#     )

#     # Run all models in parallel
#     results = await asyncio.gather(*(query_model(model, prompt) for model in MODELS))

#     # Aggregate predictions
#     predicted_yields = [r.get("predicted_yield") for r in results if isinstance(r.get("predicted_yield"), (int, float))]
#     avg_yield = round(sum(predicted_yields)/len(predicted_yields), 2) if predicted_yields else None

#     response = {
#         "average_predicted_yield": avg_yield,
#         "per_model": results
#     }
#     return JSONResponse(response)
