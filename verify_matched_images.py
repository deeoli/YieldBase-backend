"""Verify that all matched images in JSON actually exist in media_cache."""
import json
from pathlib import Path

def verify_matched_images():
    """Check if all image_paths in JSON actually exist."""
    # Check the latest verified matched file (prefer 20250622 if exists)
    exports_dir = Path("data/exports")
    matched_files = sorted(exports_dir.glob("rightmove_matched_verified*.json"))
    if not matched_files:
        print("❌ No verified matched file found!")
        return
    
    # Prefer the 20250622 file (50 properties)
    target_file = None
    for f in matched_files:
        if '20250622' in f.name:
            target_file = f
            break
    
    if not target_file:
        target_file = matched_files[-1]
    
    matched_file = target_file
    print(f"📂 Checking: {matched_file.name}")
    if not matched_file.exists():
        print("❌ Matched file not found!")
        return
    
    with open(matched_file, "r", encoding="utf-8") as f:
        properties = json.load(f)
    
    media_cache_dir = Path("media_cache")
    missing_count = 0
    found_count = 0
    
    for prop in properties:
        if prop.get("image_path"):
            filename = Path(prop["image_path"]).name
            if (media_cache_dir / filename).exists():
                found_count += 1
            else:
                missing_count += 1
                print(f"❌ Missing: {filename} (Property: {prop.get('title', 'Unknown')[:50]})")
        
        if prop.get("image_paths"):
            for img_path in prop["image_paths"]:
                filename = Path(img_path).name
                if not (media_cache_dir / filename).exists():
                    print(f"❌ Missing from paths: {filename}")
    
    print(f"\n✅ Found: {found_count}")
    print(f"❌ Missing: {missing_count}")
    print(f"📊 Total properties: {len(properties)}")

if __name__ == "__main__":
    verify_matched_images()

