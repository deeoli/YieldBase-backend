import yaml
from core.browser_crawler import BrowserCrawler
from core.writer import write_to_json

# Normalization helpers (stdlib only)
import re
import hashlib
import argparse
from pathlib import Path


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--pages", type=int, default=2)
    parser.add_argument("--limit", type=int, default=0)
    args = parser.parse_args()

    # 🔧 Load config
    with open("config/rightmove.yaml", "r") as f:
        config = yaml.safe_load(f)

    start_url = config["start_url"]
    crawler = BrowserCrawler(base_url=start_url, config=config)

    # 🕷️ Crawl listings
    listings = crawler.crawl(pages=args.pages)

    # Optional limit for quick test runs
    if args.limit > 0:
        listings = listings[:args.limit]

    # 🔄 Normalize listings for stable backend/frontend schema
    def normalize_listing(x: dict) -> dict:
        y = dict(x)

        # sourceUrl
        source_url = y.get("external_url") or y.get("link")
        y["sourceUrl"] = source_url if source_url else None

        # id (stable)
        if source_url:
            y["id"] = hashlib.sha1(str(source_url).encode("utf-8")).hexdigest()[:12]
        else:
            title = str(y.get("title", ""))
            address = str(y.get("address", ""))
            y["id"] = hashlib.sha1(f"{title}|{address}".encode("utf-8")).hexdigest()[:12]

        # price → int
        raw = str(y.get("price", "")).replace("Â", "")
        digits = re.findall(r"\d+", raw)
        y["price"] = int("".join(digits)) if digits else 0

        # beds / baths mapping
        if "bedrooms" in y:
            try:
                y["beds"] = int(y.get("bedrooms") or 0)
            except Exception:
                y["beds"] = 0

        if "bathrooms" in y:
            try:
                y["baths"] = int(y.get("bathrooms") or 0)
            except Exception:
                y["baths"] = 0

        return y

    listings = [normalize_listing(l) for l in listings]

    # 💾 Write export
    write_to_json(listings, filename_prefix="rightmove")

    # 🧹 Keep only the most recent 10 export files (fail silently)
    try:
        exports_dir = Path("data/exports")
        if exports_dir.exists():
            files = sorted(
                exports_dir.glob("*.json"),
                key=lambda p: p.stat().st_mtime,
                reverse=True,
            )
            for old_file in files[10:]:
                try:
                    old_file.unlink(missing_ok=True)
                except Exception:
                    pass
    except Exception:
        pass

    print("[i] WordPress push skipped (disabled in Phase 3)")


if __name__ == "__main__":
    main()
