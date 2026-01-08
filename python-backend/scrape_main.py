import yaml
from core.browser_crawler import BrowserCrawler
from core.writer import write_to_json
from ui.wordpress_push import push_to_wordpress

def main():
    # 🔧 Load config
    with open("config/rightmove.yaml", "r") as f:
        config = yaml.safe_load(f)

    start_url = config["start_url"]
    crawler = BrowserCrawler(base_url=start_url, config=config)

    # 🕷️ Crawl listings
    listings = crawler.crawl(pages=2)

    # 💾 Optionally write to file
    # 💾 Optionally write to file
    write_to_json(listings, filename_prefix="rightmove")

    # 🚀 Push each listing to WordPress
    for i, listing in enumerate(listings, 1):
        print(f"\n📦 Posting #{i}: {listing.get('title')}")
        success = push_to_wordpress(listing)
        if success:
            print("[✅] Posted successfully!\n")
        else:
            print("[❌] Failed to post.\n")

if __name__ == "__main__":
    main()
