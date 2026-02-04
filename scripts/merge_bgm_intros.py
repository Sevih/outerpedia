"""
Script to merge BGM files with their intro counterparts and convert to MP3.
For each pair of files (e.g., Battle_01.wav + Battle_01_Intro.wav),
creates a merged MP3 file with the intro first.
"""

import subprocess
import json
from pathlib import Path

# Configuration
AUDIO_DIR = Path(__file__).parent.parent / "public" / "audio" / "AudioClip"
OUTPUT_DIR = Path(__file__).parent.parent / "public" / "audio" / "bgm"
MAPPING_INPUT = Path(__file__).parent.parent / "src" / "data" / "bgm_mapping.json"
MAPPING_OUTPUT = Path(__file__).parent.parent / "src" / "data" / "bgm_mapping.json"
BITRATE = "192k"  # 192kbps - good quality for BGM
FFMPEG = Path.home() / "AppData/Local/Microsoft/WinGet/Packages/Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe/ffmpeg-8.0.1-full_build/bin/ffmpeg.exe"
FFPROBE = Path.home() / "AppData/Local/Microsoft/WinGet/Packages/Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe/ffmpeg-8.0.1-full_build/bin/ffprobe.exe"


def get_duration(file_path: Path) -> float | None:
    """
    Get duration of an audio file in seconds using ffprobe.
    """
    try:
        cmd = [
            str(FFPROBE), "-v", "error",
            "-show_entries", "format=duration",
            "-of", "default=noprint_wrappers=1:nokey=1",
            str(file_path)
        ]
        result = subprocess.run(cmd, capture_output=True, text=True)
        if result.returncode == 0:
            return round(float(result.stdout.strip()), 1)
    except Exception:
        pass
    return None


def load_mapping(mapping_path: Path) -> dict[str, dict]:
    """
    Load existing bgm_mapping.json and return a dict of file -> full entry.
    """
    if not mapping_path.exists():
        return {}

    with open(mapping_path, 'r', encoding='utf-8') as f:
        data = json.load(f)

    # Build lookup: file (lowercase) -> full entry
    lookup = {}
    for entry in data:
        file_key = entry["file"].lower()
        lookup[file_key] = entry
    return lookup


def generate_mapping(
    pairs: list[tuple[str, str, str]],
    standalone: list[str],
    old_mapping: dict[str, dict],
    output_dir: Path
) -> list[dict]:
    """
    Generate new mapping without intro duplicates.
    For pairs, use the main file's entry (preserving all localized names).
    Adds size (MB) and duration (seconds) for each file.
    """
    new_mapping = []

    # Add merged pairs (use main file entry, not intro)
    for base_name, main_file, intro_file in pairs:
        main_key = Path(main_file).stem.lower()
        old_entry = old_mapping.get(main_key, {})

        new_entry = {"file": base_name}

        # Copy name and localized names
        name = old_entry.get("name", base_name)
        # Remove "(Intro)" suffix if present since we merged them
        if name.endswith(" (Intro)"):
            name = name[:-8]
        new_entry["name"] = name

        # Preserve localized names
        for lang_key in ["name_jp", "name_kr", "name_zh"]:
            if lang_key in old_entry:
                new_entry[lang_key] = old_entry[lang_key]

        # Add size and duration
        mp3_path = output_dir / f"{base_name}.mp3"
        if mp3_path.exists():
            new_entry["size"] = round(mp3_path.stat().st_size / (1024 * 1024), 2)
            duration = get_duration(mp3_path)
            if duration:
                new_entry["duration"] = duration

        new_mapping.append(new_entry)

    # Add standalone files
    for filename in standalone:
        stem = Path(filename).stem
        stem_lower = stem.lower()
        old_entry = old_mapping.get(stem_lower, {})

        new_entry = {"file": stem}
        new_entry["name"] = old_entry.get("name", stem)

        # Preserve localized names
        for lang_key in ["name_jp", "name_kr", "name_zh"]:
            if lang_key in old_entry:
                new_entry[lang_key] = old_entry[lang_key]

        # Add size and duration
        mp3_path = output_dir / f"{stem}.mp3"
        if mp3_path.exists():
            new_entry["size"] = round(mp3_path.stat().st_size / (1024 * 1024), 2)
            duration = get_duration(mp3_path)
            if duration:
                new_entry["duration"] = duration

        new_mapping.append(new_entry)

    return sorted(new_mapping, key=lambda x: x["file"].lower())


def find_pairs(audio_dir: Path) -> list[tuple[str, str, str]]:
    """
    Find pairs of main files and their intro counterparts.
    Returns list of tuples: (base_name, main_file, intro_file)
    """
    files = {f.stem.lower(): f.name for f in audio_dir.glob("*.wav")}
    pairs = []
    processed = set()

    for stem_lower, filename in files.items():
        if stem_lower in processed:
            continue

        # Skip if this is an intro file
        if stem_lower.endswith("_intro"):
            continue

        # Look for matching intro file (case insensitive)
        intro_lower = f"{stem_lower}_intro"
        if intro_lower in files:
            main_file = filename
            intro_file = files[intro_lower]
            base_name = Path(main_file).stem
            pairs.append((base_name, main_file, intro_file))
            processed.add(stem_lower)
            processed.add(intro_lower)

    return sorted(pairs, key=lambda x: x[0])


def find_standalone(audio_dir: Path, pairs: list[tuple[str, str, str]]) -> list[str]:
    """
    Find WAV files that don't have an intro counterpart.
    """
    paired_files = set()
    for base_name, main_file, intro_file in pairs:
        paired_files.add(main_file.lower())
        paired_files.add(intro_file.lower())

    standalone = []
    for f in audio_dir.glob("*.wav"):
        if f.name.lower() not in paired_files:
            standalone.append(f.name)

    return sorted(standalone)


def merge_and_convert(intro_path: Path, main_path: Path, output_path: Path) -> bool:
    """
    Merge two WAV files and convert to MP3 using ffmpeg.
    """
    try:
        # Create a temporary file list for ffmpeg concat
        list_file = output_path.parent / "_concat_list.txt"
        with open(list_file, 'w', encoding='utf-8') as f:
            f.write(f"file '{intro_path.as_posix()}'\n")
            f.write(f"file '{main_path.as_posix()}'\n")

        # Use ffmpeg to concat and convert to MP3
        cmd = [
            str(FFMPEG), "-y", "-f", "concat", "-safe", "0",
            "-i", str(list_file),
            "-b:a", BITRATE,
            "-map_metadata", "-1",  # Remove metadata
            str(output_path)
        ]

        result = subprocess.run(cmd, capture_output=True, text=True)
        list_file.unlink()  # Clean up temp file

        if result.returncode != 0:
            print(f"  Error: {result.stderr[:200]}")
            return False

        return True

    except Exception as e:
        print(f"  Error: {e}")
        return False


def convert_single(input_path: Path, output_path: Path) -> bool:
    """
    Convert a single WAV file to MP3.
    """
    try:
        cmd = [
            str(FFMPEG), "-y", "-i", str(input_path),
            "-b:a", BITRATE,
            "-map_metadata", "-1",
            str(output_path)
        ]

        result = subprocess.run(cmd, capture_output=True, text=True)

        if result.returncode != 0:
            print(f"  Error: {result.stderr[:200]}")
            return False

        return True

    except Exception as e:
        print(f"  Error: {e}")
        return False


def main():
    print(f"Audio directory: {AUDIO_DIR}")
    print(f"Output directory: {OUTPUT_DIR}")
    print(f"Bitrate: {BITRATE}")
    print(f"FFmpeg: {FFMPEG}")
    print()

    if not FFMPEG.exists():
        print(f"Error: FFmpeg not found at {FFMPEG}")
        print("Install with: winget install ffmpeg")
        return

    if not AUDIO_DIR.exists():
        print(f"Error: Audio directory not found: {AUDIO_DIR}")
        return

    # Create output directory
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    # Find pairs and standalone files
    pairs = find_pairs(AUDIO_DIR)
    standalone = find_standalone(AUDIO_DIR, pairs)

    print(f"Found {len(pairs)} pairs to merge")
    print(f"Found {len(standalone)} standalone files")
    print()

    # Process pairs
    print("=== Merging pairs ===")
    success_count = 0
    for base_name, main_file, intro_file in pairs:
        print(f"Merging: {intro_file} + {main_file}")

        intro_path = AUDIO_DIR / intro_file
        main_path = AUDIO_DIR / main_file
        output_path = OUTPUT_DIR / f"{base_name}.mp3"

        if merge_and_convert(intro_path, main_path, output_path):
            size_mb = output_path.stat().st_size / (1024 * 1024)
            print(f"  -> {output_path.name} ({size_mb:.1f} MB)")
            success_count += 1
        else:
            print(f"  -> Failed!")

    print(f"\nMerged {success_count}/{len(pairs)} pairs")

    # Process standalone files
    print("\n=== Converting standalone files ===")
    standalone_count = 0
    for filename in standalone:
        print(f"Converting: {filename}")

        input_path = AUDIO_DIR / filename
        output_name = Path(filename).stem + ".mp3"
        output_path = OUTPUT_DIR / output_name

        if convert_single(input_path, output_path):
            size_mb = output_path.stat().st_size / (1024 * 1024)
            print(f"  -> {output_path.name} ({size_mb:.1f} MB)")
            standalone_count += 1
        else:
            print(f"  -> Failed!")

    print(f"\nConverted {standalone_count}/{len(standalone)} standalone files")

    # Generate updated mapping
    print("\n=== Updating bgm_mapping.json ===")
    old_mapping = load_mapping(MAPPING_INPUT)
    new_mapping = generate_mapping(pairs, standalone, old_mapping, OUTPUT_DIR)

    with open(MAPPING_OUTPUT, 'w', encoding='utf-8') as f:
        json.dump(new_mapping, f, indent=2, ensure_ascii=False)

    print(f"Updated mapping: {len(new_mapping)} entries")
    print(f"Saved to: {MAPPING_OUTPUT}")

    # Summary
    total_size = sum(f.stat().st_size for f in OUTPUT_DIR.glob("*.mp3"))
    print(f"\n=== Summary ===")
    print(f"Total MP3 files: {success_count + standalone_count}")
    print(f"Total size: {total_size / (1024 * 1024):.1f} MB")
    print(f"Output: {OUTPUT_DIR}")


if __name__ == "__main__":
    main()
