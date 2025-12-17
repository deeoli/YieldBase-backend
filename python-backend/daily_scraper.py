# daily_scraper.py

from core.browser_crawler import BrowserCrawler
from core.writer import write_to_json
from ui.wordpress_push import push_to_wordpress
import yaml
import datetime
import logging
import os

# Setup logging
logfile = "scraper_log.txt"
logging.basicConfig(
    filename=logfile,
    level=logging.INFO,
    format='[%(asctime)s] %(levelname)s - %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S'
)

def run_scraper(config_path, source_name="Rightmove"):
    if not os.path.exists(config_path):
        logging.warning(f"Config file not found: {config_path}")
        return

    with open(config_path, "r") as f:
        config = yaml.safe_load(f)

    base_url = config.get("start_url")
    crawler = BrowserCrawler(base_url=base_url, config=config)
    listings = crawler.crawl(pages=2)

    logging.info(f"🔎 {source_name}: Found {len(listings)} listings")

    # 🧮 Summary Tracker
    summary = {
        "scraped": len(listings),
        "uploaded": 0,
        "failed": 0,
        "fail_reasons": []
    }

    if listings:
        write_to_json(listings)
        for listing in listings:
            title = listing.get("title", "Untitled")

            # 🚫 Skip if critical info missing
            if not listing.get("price") or not listing.get("title"):
                summary["failed"] += 1
                reason = f"Missing price or title for '{title}'"
                summary["fail_reasons"].append(reason)
                logging.warning(reason)
                continue

            try:
                if push_to_wordpress(listing):
                    summary["uploaded"] += 1
                    logging.info(f"[✅] {source_name} property posted: {title}")
                else:
                    summary["failed"] += 1
                    reason = f"Upload failed for '{title}'"
                    summary["fail_reasons"].append(reason)
                    logging.error(reason)
            except Exception as e:
                summary["failed"] += 1
                reason = f"Exception for '{title}': {str(e)}"
                summary["fail_reasons"].append(reason)
                logging.exception(reason)

    # 📊 Print summary
    print("\n📊 Scraper Summary")
    print(f"🏡 Total scraped: {summary['scraped']}")
    print(f"✅ Uploaded: {summary['uploaded']}")
    print(f"❌ Failed: {summary['failed']}")
    for reason in summary["fail_reasons"]:
        print("   -", reason)

    logging.info(f"📊 {source_name} Summary - Scraped: {summary['scraped']}, Uploaded: {summary['uploaded']}, Failed: {summary['failed']}")

if __name__ == "__main__":
    logging.info("🚀 Starting Daily Scraper Run")
    run_scraper("config/rightmove.yaml", "Rightmove")

    # Placeholder: enable once zoopla.yaml + zoopla.py are complete
    # run_scraper("config/zoopla.yaml", "Zoopla")

    logging.info("🏁 Daily Scraper Finished")
