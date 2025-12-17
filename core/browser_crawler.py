from playwright.sync_api import sync_playwright
import os
import time
import random
from core.extractor import extract_data
from core.detail_scraper import scrape_detail_page

class BrowserCrawler:
    def __init__(self, base_url, config):
        self.base_url = base_url
        self.config = config

    def crawl(self, pages=1):
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
                try:
                    page.goto(page_url, timeout=120000, wait_until="networkidle")  # Increased timeout, wait for network
                except Exception as e:
                    print(f"[⚠️ WARN] Failed to load page {page_num + 1}: {e}")
                    print(f"[INFO] Retrying with longer timeout...")
                    try:
                        page.goto(page_url, timeout=180000, wait_until="domcontentloaded")  # Fallback: just wait for DOM
                    except Exception as e2:
                        print(f"[❌ ERROR] Could not load page {page_num + 1} after retry: {e2}")
                        continue

                try:
                    # Wait a bit for page to fully load
                    time.sleep(2)
                    page.wait_for_selector(
                        self.config['selectors']['item'],
                        timeout=30000,  # Increased timeout
                        state="visible"
                    )
                except Exception as e:
                    print(f"[⚠️ WARN] Selector not found on page {page_num + 1}: {e}")
                    # Try to continue anyway - maybe page loaded but selector changed

                html = page.content()
                listings = extract_data(html, self.config)

                for i, listing in enumerate(listings):
                    print(f"\n🔍 [DETAIL] Enriching listing {i+1}/{len(listings)}")

                    # Detail page enrich
                    detail_url = listing.get("link")
                    if detail_url:
                        details = scrape_detail_page(detail_url)
                        listing.update(details)

                        # Be polite with a delay (reduced for faster scraping)
                        time.sleep(random.uniform(2.0, 4.0))

                    # ✅ Featured thumbnail
                    thumb_url = listing.get("image", "").replace("max_1024x768", "max_476x317")
                    if thumb_url:
                        path = self._download_thumbnail(page, thumb_url)
                        if path:
                            listing["image_path"] = path

                    # ✅ Gallery thumbnails
                    thumb_paths = []
                    for url in listing.get("images", []):
                        if not url:
                            continue
                        t_url = url.replace("max_1024x768", "max_476x317")
                        path = self._download_thumbnail(page, t_url)
                        if path:
                            thumb_paths.append(path)
                    listing["image_paths"] = thumb_paths

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
