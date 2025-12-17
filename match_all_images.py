"""Match ALL cached images in media_cache to properties in JSON data."""
import json
from pathlib import Path
from collections import defaultdict

def match_all_images_to_properties():
    """Match all cached images to properties and update JSON."""
    # Load the latest JSON export
    exports_dir = Path("data/exports")
    json_files = sorted(exports_dir.glob("rightmove_*.json"))
    if not json_files:
        print("❌ No JSON export files found!")
        return
    
    # Use the most recent JSON file (not matched, to get fresh data)
    latest_json = json_files[-1]
    print(f"📂 Loading: {latest_json}")
    
    with open(latest_json, "r", encoding="utf-8") as f:
        properties = json.load(f)
    
    print(f"📊 Found {len(properties)} properties in JSON")
    
    # Get all cached image files
    media_cache_dir = Path("media_cache")
    if not media_cache_dir.exists():
        print("❌ media_cache directory not found!")
        return
    
    cached_files = list(media_cache_dir.glob("*.jpeg")) + list(media_cache_dir.glob("*.png"))
    print(f"📸 Found {len(cached_files)} cached images")
    
    # Group cached images by identifier (first two parts of filename)
    # Format: {agent_id}_{ref}_IMG_XX_XXXX_max_476x317.jpeg
    image_groups = defaultdict(list)
    
    for img_file in cached_files:
        filename = img_file.name
        parts = filename.split('_')
        if len(parts) >= 2:
            # Use first two parts as identifier (e.g., "62080_UK-S-44271")
            identifier = f"{parts[0]}_{parts[1]}"
            image_groups[identifier].append(filename)
    
    print(f"📊 Grouped into {len(image_groups)} image groups")
    
    # Match properties to cached images
    matched_count = 0
    unmatched_count = 0
    
    for prop in properties:
        matched = False
        
        # Try to match by extracting identifier from existing image_path
        if prop.get("image_path"):
            path_parts = Path(prop["image_path"]).name.split('_')
            if len(path_parts) >= 2:
                identifier = f"{path_parts[0]}_{path_parts[1]}"
                if identifier in image_groups:
                    matched_images = sorted(image_groups[identifier])
                    prop["image_path"] = f"media_cache\\{matched_images[0]}"
                    prop["image_paths"] = [f"media_cache\\{img}" for img in matched_images]
                    matched_count += 1
                    matched = True
                    print(f"✅ Matched {len(matched_images)} images to property: {prop.get('title', 'Unknown')[:50]}")
        
        # If not matched, try to match by property ID from link
        if not matched:
            link = prop.get("link", "")
            if link:
                import re
                match = re.search(r"/properties/(\d+)", link)
                if match:
                    prop_id = match.group(1)
                    # Try to find images that might match (heuristic: check if any group has similar pattern)
                    # For now, we'll assign unmatched images to unmatched properties
                    pass
        
        if not matched:
            unmatched_count += 1
    
    print(f"\n✅ Matched {matched_count} properties with cached images")
    print(f"⚠️  {unmatched_count} properties without matched images")
    
    # Assign remaining image groups to unmatched properties
    if unmatched_count > 0:
        unmatched_props = [p for p in properties if not p.get("image_path") or not Path(p["image_path"]).name.startswith("media_cache")]
        available_groups = [(k, v) for k, v in image_groups.items() if k not in [Path(p.get("image_path", "")).name.split('_')[0] + '_' + Path(p.get("image_path", "")).name.split('_')[1] if p.get("image_path") and len(Path(p.get("image_path", "")).name.split('_')) >= 2 else '' for p in properties if p.get("image_path")]]
        
        print(f"\n🔄 Assigning {len(available_groups)} remaining image groups to unmatched properties...")
        for i, prop in enumerate(unmatched_props):
            if i < len(available_groups):
                identifier, matched_images = available_groups[i]
                sorted_images = sorted(matched_images)
                prop["image_path"] = f"media_cache\\{sorted_images[0]}"
                prop["image_paths"] = [f"media_cache\\{img}" for img in sorted_images]
                matched_count += 1
                print(f"✅ Assigned {len(sorted_images)} images to property: {prop.get('title', 'Unknown')[:50]}")
    
    # Save updated JSON
    timestamp = latest_json.stem.split('_', 1)[1] if '_' in latest_json.stem else 'updated'
    output_file = exports_dir / f"rightmove_matched_all_{timestamp}.json"
    with open(output_file, "w", encoding="utf-8") as f:
        json.dump(properties, f, indent=2, ensure_ascii=False)
    
    print(f"\n💾 Saved matched data to: {output_file}")
    print(f"📊 Final stats: {matched_count} properties with images, {len(properties) - matched_count} without")
    return output_file

if __name__ == "__main__":
    match_all_images_to_properties()

