import time
import subprocess

def run_all():
    print("📅 Running daily UK property scrape (main engine)...")
    subprocess.run(["python", "dailyscraper.py"])
    print("✅ Completed")

if __name__ == "__main__":
    while True:
        run_all()
        time.sleep(86400)  # Run once daily
