import time
import random
import re
import requests
from bs4 import BeautifulSoup

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/124.0.0.0 Safari/537.36"
    ),
    "Accept-Language": "en-GB,en;q=0.9",
    "Accept-Encoding": "gzip, deflate",
    "Connection": "keep-alive"
}

def scrape_detail_page(url, retries=5):
    attempt = 0

    while attempt < retries:
        try:
            if attempt > 0:
                wait = min(60, (2 ** attempt) + random.uniform(1.0, 4.0))
                print(f"[WAIT] 429 Too Many Requests. Retrying in {wait:.1f}s...")
                time.sleep(wait)

            print(f"🔍 [DETAIL] Requesting detail page (attempt {attempt + 1})")
            resp = requests.get(url, headers=HEADERS, timeout=15)

            if resp.status_code == 429:
                attempt += 1
                continue

            resp.raise_for_status()
            soup = BeautifulSoup(resp.text, "html.parser")
            data = {}

            # --- Core property meta (Type, Beds, Baths, Size, Tenure) ---
            for container in soup.find_all("div", class_="_3gIoc-NFXILAOZEaEjJi1n"):
                dt = container.find("dt")
                dd = container.find("dd")
                if not dt or not dd:
                    continue
                label = dt.get_text(strip=True).lower()
                value = dd.get_text(strip=True)
                if "property type" in label:
                    data["property_type"] = value
                elif "bedrooms" in label:
                    data["bedrooms"] = value
                elif "bathrooms" in label:
                    data["bathrooms"] = value
                elif "size" in label:
                    data["size"] = value
                elif "tenure" in label:
                    data["tenure"] = value

            # --- Key Features ---
            features_heading = soup.find("h2", string=lambda t: t and "key features" in t.lower())
            if features_heading:
                ul = features_heading.find_next("ul")
                if ul:
                    data["key_features"] = [li.get_text(strip=True) for li in ul.find_all("li")]

            # --- Description ---
            desc_heading = soup.find("h2", string=lambda t: t and "description" in t.lower())
            if desc_heading:
                desc_div = desc_heading.find_next("div")
                if desc_div:
                    data["description"] = desc_div.get_text(separator="\n", strip=True)

            # --- Brochure PDF ---
            pdf_link = soup.find("a", href=lambda h: h and ".pdf" in h)
            if pdf_link:
                data["brochure_pdf"] = pdf_link["href"]

            # --- Council Tax, Parking, Garden, Accessibility ---
            dt_blocks = soup.find_all("dt", class_="_17A0LehXZKxGHbPeiLQ1BI")
            for dt in dt_blocks:
                label = dt.get_text(strip=True).lower()
                dd = dt.find_next("dd")
                if not dd:
                    continue
                value = dd.get_text(strip=True)
                if "council tax" in label:
                    data["council_tax"] = value
                elif "parking" in label:
                    data["parking"] = value
                elif "garden" in label:
                    data["garden"] = value
                elif "accessibility" in label:
                    data["accessibility"] = value

            # --- Floorplan image ---
            for a in soup.find_all("a", href=True):
                if "floorplan" in a["href"]:
                    img = a.find("img")
                    if img and img.get("src"):
                        data["floorplan"] = img["src"]
                        break

            # --- Postcode (from address or meta) ---
            address = None
            addr_tag = soup.find("address")
            if addr_tag:
                address = addr_tag.get_text(strip=True)
            else:
                meta_desc = soup.find("meta", attrs={"name": "description"})
                if meta_desc:
                    address = meta_desc.get("content", "")
            if address:
                postcode_match = re.search(r'([A-Z]{1,2}\d{1,2}[A-Z]?\s?\d[A-Z]{2})', address)
                if postcode_match:
                    data["postcode"] = postcode_match.group(1)

            return data

        except Exception as e:
            print(f"[❌] Failed to scrape detail page {url}: {e}")
            return {}

    print(f"[❌] Gave up scraping {url} after {retries} retries due to repeated 429s.")
    return {}
