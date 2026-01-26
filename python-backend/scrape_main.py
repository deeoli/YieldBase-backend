import yaml
from core.browser_crawler import BrowserCrawler
from core.writer import write_to_json

# Normalization helpers (stdlib only)
import re
import hashlib
import argparse
from pathlib import Path


def apply_config_vars(url_template, config_vars):
    """Replace {placeholders} in URL with config values. Safe: doesn't crash."""
    if not config_vars:
        return url_template
    try:
        return url_template.format(**config_vars)
    except KeyError:
        return url_template


def dedupe_by_id(listings):
    """Remove duplicates by ID."""
    seen = set()
    deduped = []
    for item in listings:
        item_id = item.get("id")
        if item_id and item_id not in seen:
            seen.add(item_id)
            deduped.append(item)
    return deduped


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--pages", type=int, default=2)
    parser.add_argument("--limit", type=int, default=0)
    args = parser.parse_args()

    # 🔧 Load config
    with open("config/rightmove.yaml", "r") as f:
        config = yaml.safe_load(f)

    # Get seed URLs and config vars
    seed_urls = config.get("seed_urls") or []
    config_vars = config.get("config", {})
    
    if not seed_urls:
        # Fallback to legacy start_url
        base_url = config.get("start_url")
        if not base_url:
            raise ValueError("No seed_urls or start_url in config")
        seed_urls = [{"url": base_url, "tags": []}]

    print(f"YieldBase Scraper: {len(seed_urls)} seeds, {args.pages} pages each")
    print(f"Config vars: {config_vars}")
    print("-" * 70)

    all_listings = []

    # 🕷️ Crawl each seed URL
    for idx, seed_entry in enumerate(seed_urls, 1):
        url_template = seed_entry.get("url")
        tags = seed_entry.get("tags", [])
        
        if not url_template:
            continue
        
        # Apply config substitution
        url = apply_config_vars(url_template, config_vars)
        
        print(f"\n[SEED {idx}/{len(seed_urls)}] {tags[0] if tags else 'unknown'}")
        print(f"URL: {url[:75]}...")
        
        try:
            crawler = BrowserCrawler(base_url=url, config=config)
            listings = crawler.crawl(pages=args.pages)
            
            # Add tags
            for listing in listings:
                listing["tags"] = tags
            
            all_listings.extend(listings)
            print(f"✓ Collected {len(listings)} properties")
            
        except Exception as e:
            print(f"✗ ERROR: {e}")
            continue

    # Optional limit for quick test runs
    if args.limit > 0:
        all_listings = all_listings[:args.limit]

    print(f"\n{'='*70}")
    print(f"Total: {len(all_listings)} properties")

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

    listings = [normalize_listing(l) for l in all_listings]
    
    # Dedupe
    deduped = dedupe_by_id(listings)
    dups = len(listings) - len(deduped)
    if dups > 0:
        print(f"Removed {dups} duplicates")
    print(f"Final: {len(deduped)} unique properties")

    # 💾 Write export
    write_to_json(deduped, filename_prefix="rightmove")

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
