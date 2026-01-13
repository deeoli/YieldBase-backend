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
                    def pick_img_url(tag):
                        # Prefer lazy-loaded attrs, then src, then srcset
                        url = (
                            tag.get('data-src')
                            or tag.get('data-lazy')
                            or tag.get('data-original')
                            or tag.get('src')
                        )
                        if not url:
                            srcset = tag.get('srcset') or tag.get('data-srcset')
                            if srcset:
                                url = srcset.split(',')[0].strip().split(' ')[0]
                        return url

                    imgs = item.select('img[data-testid^="property-img-"]')
                    urls = []
                    for img in imgs:
                        u = pick_img_url(img)
                        if not u:
                            continue
                        if 'svg' in u:
                            continue
                        if u.startswith('data:'):
                            continue
                        urls.append(u.replace('max_476x317', 'max_1024x768'))

                    # Dedupe while preserving order
                    seen = set()
                    urls = [u for u in urls if not (u in seen or seen.add(u))]

                    data['image'] = urls[0] if urls else None

                elif field == 'images':
                    def pick_img_url(tag):
                        url = (
                            tag.get('data-src')
                            or tag.get('data-lazy')
                            or tag.get('data-original')
                            or tag.get('src')
                        )
                        if not url:
                            srcset = tag.get('srcset') or tag.get('data-srcset')
                            if srcset:
                                url = srcset.split(',')[0].strip().split(' ')[0]
                        return url

                    imgs = item.select('img[data-testid^="property-img-"]')
                    urls = []
                    for img in imgs:
                        u = pick_img_url(img)
                        if not u:
                            continue
                        if 'svg' in u:
                            continue
                        if u.startswith('data:'):
                            continue
                        urls.append(u.replace('max_476x317', 'max_1024x768'))

                    seen = set()
                    urls = [u for u in urls if not (u in seen or seen.add(u))]

                    # Keep it small to avoid junk
                    data['images'] = urls[:8]

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
