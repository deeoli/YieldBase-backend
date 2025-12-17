"""Simple scraper that only saves to JSON, no WordPress push."""
import yaml
from core.browser_crawler import BrowserCrawler
from core.writer import write_to_json

def main():
    # 🔧 Load config
    with open("config/rightmove.yaml", "r") as f:
        config = yaml.safe_load(f)

    start_url = config["start_url"]
    crawler = BrowserCrawler(base_url=start_url, config=config)

    # 🕷️ Crawl listings (start with 1 page to test)
    print("🕷️ Starting scraper...")
    print("⚠️  Note: This may take a few minutes. Rightmove may block automated access.")
    listings = crawler.crawl(pages=1)  # Start with 1 page for testing
    
    print(f"✅ Found {len(listings)} listings")

    # 💾 Write to file
    if listings:
        filepath = write_to_json(listings, filename_prefix="rightmove")
        print(f"💾 Saved to: {filepath}")
        print(f"📸 Sample image URLs from first property:")
        if listings[0].get('images'):
            for i, img in enumerate(listings[0]['images'][:3], 1):
                print(f"   {i}. {img}")
        elif listings[0].get('image'):
            print(f"   1. {listings[0]['image']}")
    else:
        print("⚠️ No listings found!")

if __name__ == "__main__":
    main()

