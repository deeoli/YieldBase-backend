import requests
import time
from fake_useragent import UserAgent
from core.extractor import extract_data

class Crawler:
    def __init__(self, base_url, config):
        self.base_url = base_url
        self.config = config
        self.ua = UserAgent()

    def crawl(self, pages=1):
        all_listings = []
        for page in range(pages):
            page_url = f"{self.base_url}&index={page * 20}" if page > 0 else self.base_url
            headers = {"User-Agent": self.ua.random}

            print(f"[INFO] Crawling page {page + 1}: {page_url}")
            response = requests.get(page_url, headers=headers)

            if response.status_code == 200:
                html = response.text
                data = extract_data(html, self.config)
                print(f"[INFO] ✅ Extracted {len(data)} items from page {page + 1}")
                all_listings.extend(data)
                time.sleep(2)  # small delay
            else:
                print(f"[ERROR] Failed to load {page_url} — status code {response.status_code}")

        return all_listings
