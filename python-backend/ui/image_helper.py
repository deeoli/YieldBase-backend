import os
import requests
from requests.auth import HTTPBasicAuth
import mimetypes

USERNAME = "admin"
APP_PASSWORD = "TMZR rc3u L39R klKG yICZ EAHK"
BASE_URL = "http://localhost/propertyapp"

def upload_image(image_url_or_path, referer=None):
    is_local_file = os.path.isfile(image_url_or_path)

    try:
        if is_local_file:
            filename = os.path.basename(image_url_or_path)
            mime_type = mimetypes.guess_type(filename)[0] or "image/jpeg"
            with open(image_url_or_path, "rb") as f:
                image_data = f.read()

        else:
            headers = {
                "User-Agent": (
                    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                    "AppleWebKit/537.36 (KHTML, like Gecko) "
                    "Chrome/124.0.0.0 Safari/537.36"
                ),
                "Accept": "image/webp,image/apng,image/*,*/*;q=0.8",
                "Referer": referer or image_url_or_path.split('/dir/')[0]
            }
            response = requests.get(image_url_or_path, headers=headers, timeout=12)
            response.raise_for_status()
            image_data = response.content
            filename = os.path.basename(image_url_or_path.split("?")[0])
            mime_type = mimetypes.guess_type(filename)[0] or "image/jpeg"

    except Exception as e:
        print(f"❌ Failed to load image: {image_url_or_path} | {e}")
        return None

    try:
        response = requests.post(
            f"{BASE_URL}/wp-json/wp/v2/media",
            auth=HTTPBasicAuth(USERNAME, APP_PASSWORD),
            headers={
                "Content-Disposition": f"attachment; filename={filename}",
                "Content-Type": mime_type
            },
            data=image_data
        )
        response.raise_for_status()
        media_id = response.json().get("id")
        if media_id:
            print(f"[✅] Uploaded image: {filename} → media_id={media_id}")
        return media_id

    except Exception as e:
        print(f"❌ Upload failed for {filename} | {e}")
        return None
