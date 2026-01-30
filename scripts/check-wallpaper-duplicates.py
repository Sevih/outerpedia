#!/usr/bin/env python3
"""
Check for duplicate images in wallpapers folders using perceptual hashing.
Can automatically remove duplicates with user confirmation.
"""

import os
import sys
from pathlib import Path
from collections import defaultdict

try:
    from PIL import Image
    import imagehash
except ImportError:
    print("Warning: imagehash not installed. Skipping duplicate check.")
    print("Install with: pip install pillow imagehash")
    sys.exit(0)

# Path to wallpapers
SCRIPT_DIR = Path(__file__).parent
BASE_DIR = SCRIPT_DIR.parent / "public" / "images" / "download"
CATEGORIES = ["Art", "Banner", "Full", "HeroFullArt"]

# Priority rules for choosing which file to keep
# Higher score = more likely to be kept
def get_priority_score(filename: str) -> int:
    """Score a filename - higher score means better to keep."""
    score = 0

    # Prefer T_ScenarioCG_ (cutscene graphics with event codes)
    if "T_ScenarioCG_" in filename:
        score += 100
    # Then T_ScenarioBG_ (backgrounds with event codes)
    elif "T_ScenarioBG_" in filename:
        score += 80
    # Generic event names are lower priority
    elif "T_Event_BG_" in filename:
        score += 20
    elif "T_Event_CG" in filename:
        score += 10

    # Prefer files with event codes (E2407, E2504, etc.)
    if "_E2" in filename:
        score += 50

    # For HeroFullArt, prefer lower IDs (original over duplicates)
    if filename.startswith("IMG_"):
        try:
            num = int(filename.replace("IMG_", "").replace(".png", ""))
            score -= num // 1000  # Lower ID = higher priority
        except:
            pass

    return score

def find_duplicates():
    """Find duplicate images using perceptual hash."""
    hash_to_files = defaultdict(list)

    for category in CATEGORIES:
        folder = BASE_DIR / category
        if not folder.exists():
            continue

        for img_path in folder.glob("*.png"):
            try:
                with Image.open(img_path) as img:
                    phash = str(imagehash.phash(img, hash_size=16))
                    hash_to_files[phash].append({
                        "path": img_path,
                        "rel": f"{category}/{img_path.name}",
                        "name": img_path.name,
                        "score": get_priority_score(img_path.name)
                    })
            except Exception as e:
                print(f"Warning: Could not process {img_path.name}: {e}")

    return {h: files for h, files in hash_to_files.items() if len(files) > 1}

def delete_duplicates(duplicates: dict) -> int:
    """Delete duplicate files, keeping the one with highest priority score."""
    deleted_count = 0

    for phash, files in duplicates.items():
        # Sort by score descending - first one is kept
        sorted_files = sorted(files, key=lambda x: x["score"], reverse=True)
        keep = sorted_files[0]
        to_delete = sorted_files[1:]

        print(f"  Keeping: {keep['rel']}")
        for f in to_delete:
            # Delete PNG and WebP
            png_path = f["path"]
            webp_path = png_path.with_suffix(".webp")

            if png_path.exists():
                png_path.unlink()
                print(f"  Deleted: {f['rel']}")
                deleted_count += 1

            if webp_path.exists():
                webp_path.unlink()
                deleted_count += 1
        print()

    return deleted_count

def main():
    print("Checking for duplicate wallpapers...")
    duplicates = find_duplicates()

    if not duplicates:
        print("No duplicates found.")
        return 0

    print(f"\n{'='*60}")
    print(f"Found {len(duplicates)} groups of duplicate images")
    print(f"{'='*60}\n")

    for i, (phash, files) in enumerate(duplicates.items(), 1):
        sorted_files = sorted(files, key=lambda x: x["score"], reverse=True)
        print(f"Group {i}:")
        print(f"  [KEEP]   {sorted_files[0]['rel']} (score: {sorted_files[0]['score']})")
        for f in sorted_files[1:]:
            print(f"  [DELETE] {f['rel']} (score: {f['score']})")
        print()

    # Ask for confirmation
    total_to_delete = sum(len(files) - 1 for files in duplicates.values())
    print(f"This will delete {total_to_delete} PNG files (+ their WebP versions).")

    try:
        response = input("Delete duplicates? [y/N] ").strip().lower()
    except EOFError:
        # Non-interactive mode (piped input)
        print("Non-interactive mode: skipping deletion.")
        return 1

    if response == 'y':
        print("\nDeleting duplicates...")
        deleted = delete_duplicates(duplicates)
        print(f"Deleted {deleted} files.")
        return 0
    else:
        print("Aborted. Please remove duplicates manually.")
        return 1

if __name__ == "__main__":
    sys.exit(main())
