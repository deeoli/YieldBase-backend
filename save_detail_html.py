import requests

url = "https://www.rightmove.co.uk/properties/163496033#/?channel=RES_BUY"  # Replace with any property link you want
headers = {
    "User-Agent": "Mozilla/5.0",
    "Referer": "https://www.rightmove.co.uk/",
}
r = requests.get(url, headers=headers)
with open("sample_detail.html", "w", encoding="utf-8") as f:
    f.write(r.text)
print("Done! Saved sample_detail.html")
