from bs4 import BeautifulSoup
import json

def scrape_local_html(html):
    soup = BeautifulSoup(html, "html.parser")
    data = {}

    # 1. ✅ Floorplan image
    for a in soup.find_all("a", href=True):
        if "floorplan" in a["href"]:
            img = a.find("img")
            if img and img.get("src"):
                data["floorplan"] = img["src"]
                break

    # 2. ✅ Key Features
    features = []
    key_header = soup.find("h2", string=lambda s: s and "key features" in s.lower())
    if key_header:
        ul = key_header.find_next("ul")
        if ul:
            features = [li.get_text(strip=True) for li in ul.find_all("li")]
    if features:
        data["key_features"] = features

    # 3. ✅ Meta (Property type, bedrooms, etc.)
    meta = {}
    for block in soup.find_all("div", class_="_3gIoc-NFXILAOZEaEjJi1n"):
        label_el = block.find("span")
        value_el = block.find("dd")
        if label_el and value_el:
            label = label_el.get_text(strip=True).lower()
            value = value_el.get_text(strip=True)
            if "property type" in label:
                meta["property_type"] = value
            elif "bedroom" in label:
                meta["bedrooms"] = value
            elif "bathroom" in label:
                meta["bathrooms"] = value
            elif "size" in label:
                meta["area"] = value
            elif "tenure" in label:
                meta["tenure"] = value
    if meta:
        data.update(meta)

    # 4. ✅ Description
    desc_block = soup.find("h2", string=lambda s: s and "description" in s.lower())
    if desc_block:
        desc_div = desc_block.find_next("div")
        if desc_div:
            data["description"] = desc_div.get_text(separator="\n", strip=True)

    # 5. ✅ Brochure PDF
    pdf = None
    for a in soup.find_all("a", href=True):
        if a["href"].endswith(".pdf"):
            pdf = a["href"]
            break
    if pdf:
        data["brochure_pdf"] = pdf

    # 6. ✅ Extras (Council tax, parking, garden, accessibility)
    extras = {}
    dl_block = soup.find("dl", class_="_1H0UoH91Rh0KKGH7JRGxEd")
    if dl_block:
        dt_tags = dl_block.find_all("dt")
        dd_tags = dl_block.find_all("dd")
        for dt, dd in zip(dt_tags, dd_tags):
            label = dt.get_text(" ", strip=True).split("\n")[0].strip(":").lower()
            value = dd.get_text(strip=True)
            if label and value:
                extras[label] = value
    if extras:
        data["extras"] = extras

    return data


if __name__ == "__main__":
    with open("sample-html.txt", "r", encoding="utf-8") as f:
        html = f.read()

    details = scrape_local_html(html)
    print("\n🎯 Detail page extracted fields:")
    print(json.dumps(details, indent=2, ensure_ascii=False))
