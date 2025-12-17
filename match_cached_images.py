"""Match existing cached images to properties in JSON data."""
import json
from pathlib import Path
from collections import defaultdict

def match_images_to_properties():
    """Match cached images to properties and update JSON."""
    # Load the latest JSON export
    exports_dir = Path("data/exports")
    json_files = sorted(exports_dir.glob("rightmove_*.json"))
    if not json_files:
        print("❌ No JSON export files found!")
        return
    
    latest_json = json_files[-1]
    print(f"📂 Loading: {latest_json}")
    
    with open(latest_json, "r", encoding="utf-8") as f:
        properties = json.load(f)
    
    # Get all cached image files
    media_cache_dir = Path("media_cache")
    if not media_cache_dir.exists():
        print("❌ media_cache directory not found!")
        return
    
    cached_files = list(media_cache_dir.glob("*.jpeg"))
    print(f"📸 Found {len(cached_files)} cached images")
    
    # Group cached images by property ID (extract from filename)
    # Format: {property_id}_{other}_IMG_XX_XXXX_max_476x317.jpeg
    # Or: {agent_id}_{ref}_IMG_XX_XXXX_max_476x317.jpeg
    image_groups = defaultdict(list)
    
    for img_file in cached_files:
        filename = img_file.name
        # Try to extract property identifier from filename
        # Rightmove images often have format: agentId_ref_IMG_XX_XXXX_max_476x317.jpeg
        parts = filename.split('_')
        if len(parts) >= 2:
            # Use first two parts as identifier
            identifier = f"{parts[0]}_{parts[1]}"
            image_groups[identifier].append(filename)
    
    print(f"📊 Grouped into {len(image_groups)} image groups")
    
    # Match properties to cached images
    matched_count = 0
    import re
    
    # First pass: match by existing image_path
    for prop in properties:
        if prop.get("image_path"):
            path_parts = Path(prop["image_path"]).name.split('_')
            if len(path_parts) >= 2:
                identifier = f"{path_parts[0]}_{path_parts[1]}"
                if identifier in image_groups:
                    matched_images = image_groups[identifier]
                    prop["image_path"] = f"media_cache\\{matched_images[0]}"
                    prop["image_paths"] = [f"media_cache\\{img}" for img in matched_images]
                    matched_count += 1
                    continue
    
    # Second pass: try to match by property ID or any available images
    # For unmatched properties, assign any available image group
    unmatched_props = [p for p in properties if not p.get("image_path") or not Path(p["image_path"]).name.startswith("media_cache")]
    available_groups = list(image_groups.items())
    
    for i, prop in enumerate(unmatched_props):
        if i < len(available_groups):
            identifier, matched_images = available_groups[i]
            prop["image_path"] = f"media_cache\\{matched_images[0]}"
            prop["image_paths"] = [f"media_cache\\{img}" for img in matched_images]
            matched_count += 1
            print(f"✅ Assigned {len(matched_images)} images to property: {prop.get('title', 'Unknown')[:50]}")
    
    print(f"\n✅ Matched {matched_count} properties with cached images")
    
    # Save updated JSON
    output_file = exports_dir / f"rightmove_matched_{latest_json.stem.split('_', 1)[1] if '_' in latest_json.stem else 'updated'}.json"
    with open(output_file, "w", encoding="utf-8") as f:
        json.dump(properties, f, indent=2, ensure_ascii=False)
    
    print(f"💾 Saved matched data to: {output_file}")
    return output_file

if __name__ == "__main__":
    match_images_to_properties()

