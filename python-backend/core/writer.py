import json
from datetime import datetime
from pathlib import Path

def write_to_json(data, filename_prefix="rightmove"):
    output_dir = Path("data/exports")
    output_dir.mkdir(parents=True, exist_ok=True)
    
    timestamp = datetime.now().strftime("%Y%m%d_%H%M")
    filepath = output_dir / f"{filename_prefix}_{timestamp}.json"

    with open(filepath, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

    print(f"[💾] Exported {len(data)} listings → {filepath}")
    return str(filepath)
