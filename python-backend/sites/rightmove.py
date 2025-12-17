import requests
from bs4 import BeautifulSoup
from core.writer import write_to_json

def run():
    url = "https://www.rightmove.co.uk/property-for-sale/find.html?locationIdentifier=REGION%5E93917&maxPrice=100000&minBedrooms=2&maxBedrooms=3"
    headers = {
        "User-Agent": "Mozilla/5.0"
    }
    r = requests.get(url, headers=headers)
    soup = BeautifulSoup(r.text, 'html.parser')
    listings = []
    for card in soup.select(".propertyCard"):
        try:
            title = card.select_one(".propertyCard-title").text.strip()
            price = card.select_one(".propertyCard-priceValue").text.strip().replace("£", "").replace(",", "")
            url = card.select_one("a")["href"]
            listings.append({
                "title": title,
                "price": int(price),
                "source_url": f"https://rightmove.co.uk{url}",
                "platform": "rightmove"
            })
        except:
            continue
    write_to_json(listings, "rightmove.json")
