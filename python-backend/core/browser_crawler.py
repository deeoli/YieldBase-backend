from playwright.sync_api import sync_playwright
import os
import time
import random
from pathlib import Path
from core.extractor import extract_data
from core.detail_scraper import scrape_detail_page

class BrowserCrawler:
    def __init__(self, base_url, config):
        self.base_url = base_url
        self.config = config

    def crawl(self, pages=1, limit=None):
        all_listings = []

        with sync_playwright() as p:
            user_agent = (
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                "AppleWebKit/537.36 (KHTML, like Gecko) "
                "Chrome/124.0.0.0 Safari/537.36"
            )
            browser = p.chromium.launch(headless=True)
            page = browser.new_page(user_agent=user_agent)

            for page_num in range(pages):
                page_url = (
                    f"{self.base_url}&index={page_num * 24}"
                    if page_num > 0 else
                    self.base_url
                )
                print(f"\n🌐 [INFO] Crawling page {page_num + 1}: {page_url}")
                page.goto(page_url, timeout=60000)

                try:
                    page.wait_for_selector(
                        self.config['selectors']['item'],
                        timeout=15000,
                        state="visible"
                    )
                except Exception as e:
                    print(f"[⚠️ WARN] Selector not found on page {page_num + 1}: {e}")

                html = page.content()
                listings = extract_data(html, self.config)

                # Apply per-seed limit BEFORE enrichment
                if limit is not None:
                    try:
                        limit = int(limit)
                        if limit > 0:
                            listings = listings[:limit]
                    except (ValueError, TypeError):
                        pass

                for i, listing in enumerate(listings):
                    print(f"\n🔍 [DETAIL] Enriching listing {i+1}/{len(listings)}")

                    # Detail page enrich
                    detail_url = listing.get("link")
                    if detail_url:
                        details = scrape_detail_page(detail_url)
                        listing.update(details)

                        # Be polite with a delay
                        time.sleep(random.uniform(5.0, 9.5))

                    # ✅ Featured thumbnail
                    thumb_url = listing.get("image", "").replace("max_1024x768", "max_476x317")
                    if thumb_url:
                        path = self._download_thumbnail(page, thumb_url)
                        if path:
                            listing["image"] = Path(path).name  # Just filename, no directory
                            listing["image_path"] = path  # Keep full path for backwards compatibility

                    # ✅ Gallery thumbnails
                    thumb_paths = []
                    thumb_filenames = []
                    for url in listing.get("images", []):
                        if not url:
                            continue
                        t_url = url.replace("max_1024x768", "max_476x317")
                        path = self._download_thumbnail(page, t_url)
                        if path:
                            thumb_paths.append(path)  # Full path
                            thumb_filenames.append(Path(path).name)  # Just filename
                    listing["images"] = thumb_filenames  # Just filenames for frontend
                    listing["image_paths"] = thumb_paths  # Keep full paths for backwards compatibility

                print(f"\n✅ [INFO] Extracted {len(listings)} listings from page {page_num + 1}")
                all_listings.extend(listings)

                # Delay between pages
                time.sleep(random.uniform(7.0, 12.0))

            browser.close()

        return all_listings

    def _download_thumbnail(self, page, url):
        referer = url.split("/dir/")[0]
        path = self._save_path_for(url)

        # ✅ Skip if already downloaded
        if os.path.exists(path):
            print(f"[⚡] Skipped cached image: {path}")
            return path

        try:
            resp = page.request.get(url, headers={"Referer": referer})
            if resp.ok:
                os.makedirs(os.path.dirname(path), exist_ok=True)
                with open(path, "wb") as f:
                    f.write(resp.body())
                print(f"[✅] Downloaded thumbnail → {path}")
                return path
            else:
                print(f"[❌] Thumbnail download failed ({resp.status}) for: {url}")
        except Exception as e:
            print(f"[❌] Exception downloading thumbnail: {url} | {e}")
        return None

    def _save_path_for(self, url):
        filename = url.split("/")[-1].split("?")[0]
        return os.path.join("media_cache", filename)
