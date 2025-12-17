import subprocess
import time
import logging
import os

# Setup logging
logfile = "cron_log.txt"
logging.basicConfig(
    filename=logfile,
    level=logging.INFO,
    format='[%(asctime)s] %(levelname)s - %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S'
)

def run_all():
    logging.info("🚀 Starting scheduled scraper job...")
    try:
        result = subprocess.run(["python", "daily_scraper.py"], check=True)
        logging.info("✅ Scraper run completed successfully.")
    except subprocess.CalledProcessError as e:
        logging.error(f"❌ Scraper run failed: {e}")
    except Exception as e:
        logging.error(f"❗ Unexpected error: {e}")

if __name__ == "__main__":
    while True:
        run_all()
        logging.info("🕒 Sleeping for 24 hours (86400s)")
        time.sleep(86400)
