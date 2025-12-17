from bs4 import BeautifulSoup
import re

def extract_data(html, config):
    soup = BeautifulSoup(html, "html.parser")
    items = soup.select(config['selectors']['item'])
    extracted = []

    for item in items:
        data = {}

        for field, selector in config['selectors']['fields'].items():
            try:
                if field == 'image':
                    img = next((img for img in item.select('img[data-testid^="property-img-"]')
                                if 'svg' not in img.get('src', '')), None)
                    if img:
                        src = img['src'].replace('max_476x317', 'max_1024x768')
                        data['image'] = src
                    else:
                        data['image'] = None

                elif field == 'images':
                    imgs = item.select('img[data-testid^="property-img-"]')
                    data['images'] = list({
                        img['src'].replace('max_476x317', 'max_1024x768')
                        for img in imgs if 'svg' not in img.get('src', '')
                    })

                elif field == 'link':
                    link = (item.select_one('a.propertyCard-anchor') or 
                            item.select_one('a[data-testid="property-details"]') or
                            item.select_one('a[href^="/properties/"]'))
                    href = link['href'] if link and link.has_attr('href') else None
                    data['link'] = f"https://www.rightmove.co.uk{href}" if href and not href.startswith('http') else href

                elif "::attr(" in selector:
                    css_part, attr = selector.split("::attr(")
                    attr = attr.rstrip(')')
                    element = item.select_one(css_part.strip())
                    data[field] = element[attr] if element and attr in element.attrs else None

                else:
                    element = item.select_one(selector)
                    data[field] = element.get_text(strip=True) if element else None

            except Exception as e:
                print(f"[⚠️] Failed to extract {field}: {e}")
                data[field] = None

        # 🔎 Parse fallback metadata (bedrooms, bathrooms, tenure, sq ft)
        features = [li.get_text(strip=True) for li in item.select('ul[data-testid="property-features"] li')]

        for feat in features:
            ft_lower = feat.lower()
            if 'bedroom' in ft_lower and not data.get('bedrooms'):
                match = re.search(r'\d+', feat)
                data['bedrooms'] = match.group(0) if match else feat

            elif 'bathroom' in ft_lower and not data.get('bathrooms'):
                match = re.search(r'\d+', feat)
                data['bathrooms'] = match.group(0) if match else feat

            elif 'tenure' in ft_lower and not data.get('tenure'):
                data['tenure'] = feat.split(":")[-1].strip().capitalize()

            elif 'sq ft' in ft_lower and not data.get('square_footage'):
                data['square_footage'] = feat

        extracted.append(data)

    return extracted
