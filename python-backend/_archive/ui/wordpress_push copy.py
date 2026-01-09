# import re
# import requests
# from requests.exceptions import RequestException
# from ui.image_helper import upload_image
# import json

# # ✅ Correct endpoint
# WP_URL = "http://localhost/propertyapp/wp-json/wp/v2/ukproperty"
# JWT_TOKEN = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJodHRwOi8vbG9jYWxob3N0L3Byb3BlcnR5YXBwIiwiaWF0IjoxNzUwMzM0MjMzLCJuYmYiOjE3NTAzMzQyMzMsImV4cCI6MTc1MDkzOTAzMywiZGF0YSI6eyJ1c2VyIjp7ImlkIjoiMSJ9fX0.db2rUEubbmRXnQg2ecr0F9_CZgZk6j89bzB2-Qdrb2I".strip()

# def push_to_wordpress(listing):
#     try:
#         headers = {
#             "Authorization": f"Bearer {JWT_TOKEN}",
#             "Content-Type": "application/json"
#         }

#         clean_price = int(re.sub(r"\D", "", listing.get("price", "0")))

#         payload = {
#             "title": listing["title"].strip(),
#             "content": listing.get("description", "").strip(),
#             "status": "publish",
#             "acf": {
#                 "price": clean_price,
#                 "address": listing.get("address", "").strip(),
#                 "yield": float(listing.get("yield", 0)),
#                 "external_url": listing.get("link", "").strip(),
#                 "images": json.dumps(listing.get("images", []))  # ← Store as JSON string
#             }
#         }

#         # ✅ Upload and attach featured image
#         featured_media_id = None
#         if listing.get("image"):
#             featured_media_id = upload_image(listing["image"])
#             if featured_media_id:
#                 payload["featured_media"] = featured_media_id

#         # ✅ Upload and attach additional gallery images
#         gallery_ids = []
#         for img_url in listing.get("images", []):
#             if img_url != listing.get("image"):  # avoid duplication
#                 img_id = upload_image(img_url)
#                 if img_id:
#                     gallery_ids.append(img_id)

#         # ✅ Add image IDs to a gallery ACF field (assumes ACF field named "gallery")
#         if gallery_ids:
#             payload["acf"]["gallery"] = gallery_ids

#         # ✅ Send POST
#         resp = requests.post(WP_URL, headers=headers, json=payload, timeout=10)

#         if resp.status_code == 201:
#             print(f"[✅] Posted: {payload['title']} with {len(gallery_ids)} extra images")
#             return True
#         else:
#             print(f"[❌] Post failed ({payload['title']}): {resp.status_code} | {resp.text}")
#             return False

#     except RequestException as e:
#         print(f"[❌] Exception posting {listing.get('title')}: {e}")
#         return False
