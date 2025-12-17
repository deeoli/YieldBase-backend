"""Match ONLY images that actually exist in media_cache to properties."""
import json
from pathlib import Path
from collections import defaultdict

def match_existing_images_only():
    """Match properties to cached images, but ONLY use images that actually exist."""
    # Load the JSON file - prefer the one with 50 properties if it exists
    exports_dir = Path("data/exports")
    json_files = sorted(exports_dir.glob("rightmove_*.json"))
    # Filter out matched files to get original
    original_files = [f for f in json_files if 'matched' not in f.name]
    
    # Prefer the 20250622 file (50 properties) if it exists, otherwise use latest
    target_file = None
    for f in original_files:
        if '20250622' in f.name:
            target_file = f
            break
    
    if not target_file:
        target_file = original_files[-1] if original_files else None
    
    if not target_file:
        print("❌ No original JSON export files found!")
        return
    
    latest_json = target_file
    print(f"📂 Loading: {latest_json}")
    
    with open(latest_json, "r", encoding="utf-8") as f:
        properties = json.load(f)
    
    print(f"📊 Found {len(properties)} properties in JSON")
    
    # Get all cached image files that ACTUALLY exist
    media_cache_dir = Path("media_cache")
    if not media_cache_dir.exists():
        print("❌ media_cache directory not found!")
        return
    
    cached_files = list(media_cache_dir.glob("*.jpeg")) + list(media_cache_dir.glob("*.png")) + list(media_cache_dir.glob("*.jpg"))
    print(f"📸 Found {len(cached_files)} cached images")
    
    # Create a set of actual filenames for fast lookup
    actual_files = {f.name for f in cached_files}
    
    # Group cached images by identifier (first two parts of filename)
    image_groups = defaultdict(list)
    
    for img_file in cached_files:
        filename = img_file.name
        parts = filename.split('_')
        if len(parts) >= 2:
            identifier = f"{parts[0]}_{parts[1]}"
            image_groups[identifier].append(filename)
    
    print(f"📊 Grouped into {len(image_groups)} image groups")
    
    # Match properties to cached images
    matched_count = 0
    
    for prop in properties:
        matched = False
        matched_images = []
        
        # Try to match by extracting identifier from existing image_path
        if prop.get("image_path"):
            path_parts = Path(prop["image_path"]).name.split('_')
            if len(path_parts) >= 2:
                identifier = f"{path_parts[0]}_{path_parts[1]}"
                if identifier in image_groups:
                    # Only use images that actually exist
                    for img in sorted(image_groups[identifier]):
                        if img in actual_files:
                            matched_images.append(img)
                    
                    if matched_images:
                        prop["image_path"] = f"media_cache\\{matched_images[0]}"
                        prop["image_paths"] = [f"media_cache\\{img}" for img in matched_images]
                        matched_count += 1
                        matched = True
                        print(f"✅ Matched {len(matched_images)} existing images to: {prop.get('title', 'Unknown')[:50]}")
        
        # If not matched, try to match by image_paths
        if not matched and prop.get("image_paths"):
            for img_path in prop["image_paths"]:
                filename = Path(img_path).name
                if filename in actual_files:
                    matched_images.append(filename)
            
            if matched_images:
                prop["image_path"] = f"media_cache\\{matched_images[0]}"
                prop["image_paths"] = [f"media_cache\\{img}" for img in matched_images]
                matched_count += 1
                matched = True
                print(f"✅ Matched {len(matched_images)} existing images from paths to: {prop.get('title', 'Unknown')[:50]}")
    
    print(f"\n✅ Matched {matched_count} properties with existing cached images")
    print(f"⚠️  {len(properties) - matched_count} properties without matched images")
    
    # Assign remaining image groups to unmatched properties (only if images exist)
    unmatched_props = [p for p in properties if not p.get("image_path") or not Path(p.get("image_path", "")).name in actual_files]
    available_groups = [(k, [img for img in v if img in actual_files]) for k, v in image_groups.items() if any(img in actual_files for img in v)]
    available_groups = [(k, v) for k, v in available_groups if v]  # Remove empty groups
    
    print(f"\n🔄 Assigning {len(available_groups)} remaining image groups to unmatched properties...")
    assigned_count = 0
    for i, prop in enumerate(unmatched_props):
        if i < len(available_groups):
            identifier, matched_images = available_groups[i]
            if matched_images:
                sorted_images = sorted(matched_images)
                prop["image_path"] = f"media_cache\\{sorted_images[0]}"
                prop["image_paths"] = [f"media_cache\\{img}" for img in sorted_images]
                matched_count += 1
                assigned_count += 1
                print(f"✅ Assigned {len(sorted_images)} existing images to: {prop.get('title', 'Unknown')[:50]}")
    
    # Save updated JSON
    timestamp = latest_json.stem.split('_', 1)[1] if '_' in latest_json.stem else 'updated'
    output_file = exports_dir / f"rightmove_matched_verified_{timestamp}.json"
    with open(output_file, "w", encoding="utf-8") as f:
        json.dump(properties, f, indent=2, ensure_ascii=False)
    
    print(f"\n💾 Saved verified matched data to: {output_file}")
    print(f"📊 Final stats: {matched_count} properties with images, {len(properties) - matched_count} without")
    return output_file

if __name__ == "__main__":
    match_existing_images_only()

