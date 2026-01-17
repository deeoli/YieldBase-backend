import os
import sys
import glob
from typing import List

# Ensure we can import the FastAPI app without installing the package
REPO_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if REPO_ROOT not in sys.path:
    sys.path.insert(0, REPO_ROOT)

from fastapi.testclient import TestClient  # type: ignore

# Import the FastAPI app
from app.main import app  # type: ignore

client = TestClient(app)


def test_health_ok():
    r = client.get("/api/health")
    assert r.status_code == 200
    assert r.json() == {"status": "ok"}


def test_properties_list_and_required_fields():
    r = client.get("/api/properties")
    assert r.status_code == 200
    data = r.json()
    assert isinstance(data, list)

    if not data:
        # No properties available is acceptable for baseline; nothing else to assert
        return

    required = ["id", "title", "price", "currency", "address", "city", "postcode", "beds", "image", "sourceUrl"]
    sample: List[dict] = data[: min(5, len(data))]

    for p in sample:
        # keys exist
        for k in required:
            assert k in p
        # basic type/shape checks
        assert isinstance(p["title"], str) and p["title"].strip() != ""
        assert isinstance(p["address"], str) and p["address"].strip() != ""
        assert isinstance(p["city"], str) and p["city"].strip() != ""
        assert isinstance(p["postcode"], str) and p["postcode"].strip() != ""
        # numeric checks
        assert isinstance(p["price"], (int, float)) and float(p["price"]) >= 0
        assert isinstance(p["beds"], (int, float)) and float(p["beds"]) >= 0

        # detail endpoint should work for each id
        pid = p["id"]
        dr = client.get(f"/api/properties/{pid}")
        assert dr.status_code in (200, 404)  # if data changed between calls, allow 404
        if dr.status_code == 200:
            dj = dr.json()
            for k in required:
                assert k in dj


def test_cached_images_endpoint_serves_file_if_present():
    media_dir = os.path.join(REPO_ROOT, "media_cache")
    if not os.path.isdir(media_dir):
        # Skip if media cache not present
        import pytest  # type: ignore
        pytest.skip("media_cache folder not present")

    files = []
    files.extend(glob.glob(os.path.join(media_dir, "*.jpeg")))
    files.extend(glob.glob(os.path.join(media_dir, "*.jpg")))

    if not files:
        import pytest  # type: ignore
        pytest.skip("No cached images found in media_cache")

    fn = os.path.basename(files[0])
    r = client.get(f"/api/images/{fn}")
    assert r.status_code == 200
    ct = r.headers.get("content-type", "")
    assert ct.startswith("image/")

