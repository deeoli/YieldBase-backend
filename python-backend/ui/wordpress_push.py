import re
import json
import requests
from requests.exceptions import RequestException
from ui.image_helper import upload_image

WP_URL = "http://localhost/propertyapp/wp-json/wp/v2/ukproperty"
JWT_TOKEN = (
    "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9."
    "eyJpc3MiOiJodHRwOi8vbG9jYWxob3N0L3Byb3BlcnR5YXBwIiwiaWF0IjoxNzUwMzM0MjMz"
    "LCJuYmYiOjE3NTAzMzQyMzMsImV4cCI6MTc1MDkzOTAzMywiZGF0YSI6eyJ1c2VyIjp7Imlk"
    "IjoiMSJ9fX0.db2rUEubbmRXnQg2ecr0F9_CZgZk6j89bzB2-Qdrb2I"
)

def push_to_wordpress(listing):
    try:
        # 👇 Print everything we scraped for this property
        print("\n--- LISTING DATA ---")
        print(json.dumps(listing, indent=2, ensure_ascii=False))
        print("--- END LISTING DATA ---\n")

        headers = {
            "Authorization": f"Bearer {JWT_TOKEN}",
            "Content-Type": "application/json",
        }

        # Clean up price
        raw_price = listing.get("price", "0")
        clean_price = int(re.sub(r"\D", "", str(raw_price)) or "0")

        # Handle yield robustly
        yield_value = listing.get("yield")
        try:
            clean_yield = float(yield_value) if yield_value not in (None, "", "None") else None
        except Exception:
            clean_yield = None

        # Build payload for your actual ACF fields
        acf_payload = {
        "property_type": listing.get("property_type"),
        "bedrooms": listing.get("bedrooms"),
        "bathrooms": listing.get("bathrooms"),
        "size": listing.get("size"),
        "tenure": listing.get("tenure"),
        "key_features": listing.get("key_features"),
        "description": listing.get("description"),
        "floorplan": listing.get("floorplan"),
        "brochure_pdf": listing.get("brochure_pdf"),
        "council_tax": listing.get("council_tax"),
        "parking": listing.get("parking"),
        "garden": listing.get("garden"),
        "accessibility": listing.get("accessibility"),
        "postcode": listing.get("postcode"),
        }


        if clean_yield is not None:
            acf_payload["yield"] = clean_yield

        payload = {
            "title": listing["title"].strip(),
            "content": listing.get("description", "").strip(),
            "status": "publish",
            "acf": acf_payload,
        }

        # Determine input for featured image: local path first, then URL
        featured_input = listing.get("image_path") or listing.get("image")
        referer = listing.get("link") or listing.get("source_url") or "https://www.rightmove.co.uk/"

        # Upload featured image
        if featured_input:
            featured_media_id = upload_image(featured_input, referer)
            if featured_media_id:
                payload["featured_media"] = featured_media_id
            else:
                print(f"[❌] Featured image failed for {listing['title']}: {featured_input}")

        # Prepare gallery inputs: local paths first, then URL list
        gallery_inputs = listing.get("image_paths") or listing.get("images", [])
        gallery_ids = []

        for img_input in gallery_inputs:
            if img_input == featured_input:
                continue
            img_id = upload_image(img_input, referer)
            if img_id:
                gallery_ids.append(img_id)
            else:
                print(f"[❌] Gallery image failed: {img_input}")

        if gallery_ids:
            payload["acf"]["gallery"] = gallery_ids

        # POST to WordPress
        resp = requests.post(WP_URL, headers=headers, json=payload, timeout=10)
        if resp.status_code == 201:
            print(f"[✅] Posted: {payload['title']} with {len(gallery_ids)} extra images")
            return True
        else:
            print(f"[❌] Post failed ({payload['title']}): {resp.status_code} | {resp.text}")
            return False

    except RequestException as e:
        print(f"[❌] Exception posting {listing.get('title')}: {e}")
        return False
