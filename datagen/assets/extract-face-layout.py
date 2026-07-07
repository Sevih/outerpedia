"""
Extract per-character face-icon layout from the FaceIcon prefab bundle.

Each FI_xxxxxxx.prefab is a Unity prefab containing multiple variant frames
(Thumbnail / Lobby / Equip / Piece / BreakPiece / MainThumbnail / Chain /
Recruit / PVPRealtimeSmall / PVPRealtimeLarge). Each variant frame holds a
single child GameObject named "Character" whose RectTransform defines the
position+size of the portrait inside the frame mask.

Output format (JSON):
{
  "<character_id>": {
    "<variant_name>": {
      "frame":     { "w": int, "h": int },
      "character": { "x": float, "y": float, "w": float, "h": float, "scale": [sx, sy] }
    },
    ...
  },
  ...
}

Coordinates use Unity convention: anchored position is relative to the frame
center, and +Y is up. To translate to CSS, flip Y (CSS_y = -unity_y).
"""

from __future__ import annotations

import json
import sys
from pathlib import Path
from typing import Iterable

import UnityPy

ROOT = Path(__file__).resolve().parents[2]
MANIFEST = ROOT / '.gamedata' / 'files' / 'bundles' / 'manifest.dat'
BUNDLES_DIR = ROOT / '.gamedata' / 'files' / 'bundles'
OUT = ROOT / 'datagen' / 'assets' / 'face-icon-layout.json'

FACEICON_BUNDLE_NAME = 'prefabs/ui/faceicon'


def find_faceicon_bundle() -> Path:
    """Resolve the current FaceIcon bundle filename via the manifest.

    The hash-style filename rotates with each game version, so we read the
    bundle name -> filename mapping rather than hard-coding a hash.
    """
    if not MANIFEST.exists():
        raise FileNotFoundError(f'Bundle manifest not found: {MANIFEST}')
    with MANIFEST.open('r', encoding='utf-8') as f:
        manifest = json.load(f)
    for b in manifest['bundleInfos']:
        if b.get('name') == FACEICON_BUNDLE_NAME:
            path = BUNDLES_DIR / b['filename']
            if not path.exists():
                raise FileNotFoundError(f'FaceIcon bundle missing on disk: {path}')
            return path
    raise RuntimeError(f'No bundle named {FACEICON_BUNDLE_NAME!r} in manifest')


def extract_layout(char_ids: Iterable[str] | None = None) -> dict[str, dict]:
    """Extract the prefab layout for the given char ids (or all if None).

    Returns the same structure that ends up in face-icon-layout.json.
    """
    bundle_path = find_faceicon_bundle()
    env = UnityPy.load(str(bundle_path))
    by_pid = {obj.path_id: obj for obj in env.objects}

    def read(pid):
        o = by_pid.get(pid)
        return o.read_typetree() if o else None

    def type_of(pid):
        o = by_pid.get(pid)
        return o.type.name if o else None

    wanted = set(char_ids) if char_ids is not None else None

    fi_roots: dict[str, int] = {}
    for obj in env.objects:
        if obj.type.name != 'AssetBundle':
            continue
        ab = obj.read_typetree()
        for path, info in ab['m_Container']:
            name = path.rsplit('/', 1)[-1]
            if not (name.startswith('fi_') and name.endswith('.prefab')):
                continue
            cid = name[3:-7]
            if not cid.isdigit():
                continue
            if wanted is not None and cid not in wanted:
                continue
            fi_roots[cid] = info['asset']['m_PathID']
        break

    def rect_of(go_pid):
        go = read(go_pid)
        if not go:
            return None
        for c in go.get('m_Component', []):
            cpid = c['component']['m_PathID']
            if type_of(cpid) == 'RectTransform':
                return read(cpid)
        return None

    out: dict[str, dict] = {}
    for cid, root_pid in sorted(fi_roots.items()):
        root_rt = rect_of(root_pid)
        if not root_rt:
            continue

        variants: dict[str, dict] = {}
        for ch in root_rt.get('m_Children', []):
            v_rt = read(ch['m_PathID'])
            v_go = read(v_rt['m_GameObject']['m_PathID'])
            v_name = v_go.get('m_Name')
            v_size = v_rt.get('m_SizeDelta')

            char_data = None
            for sub in v_rt.get('m_Children', []):
                sub_rt = read(sub['m_PathID'])
                sub_go = read(sub_rt['m_GameObject']['m_PathID'])
                if sub_go.get('m_Name') != 'Character':
                    continue
                pos = sub_rt.get('m_AnchoredPosition')
                size = sub_rt.get('m_SizeDelta')
                scale = sub_rt.get('m_LocalScale')
                char_data = {
                    'x': round(pos['x'], 3),
                    'y': round(pos['y'], 3),
                    'w': round(size['x'], 3),
                    'h': round(size['y'], 3),
                    'scale': [round(scale['x'], 3), round(scale['y'], 3)],
                }
                break

            if char_data is None:
                continue

            variants[v_name] = {
                'frame': {'w': round(v_size['x'], 3), 'h': round(v_size['y'], 3)},
                'character': char_data,
            }

        if variants:
            out[cid] = variants

    return out


def load_cached() -> dict[str, dict]:
    if not OUT.exists():
        return {}
    return json.loads(OUT.read_text(encoding='utf-8'))


def save_cached(layout: dict[str, dict]) -> None:
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps(layout, indent=2), encoding='utf-8')


def ensure_chars(char_ids: Iterable[str]) -> dict[str, dict]:
    """Make sure every requested char id is present in the cache.

    Missing ids trigger a bundle scan; the cache is updated and persisted.
    Returns the (possibly updated) full cache.
    """
    cache = load_cached()
    missing = [cid for cid in char_ids if cid not in cache]
    if not missing:
        return cache
    print(f'Layout cache misses {len(missing)} character(s): {missing} — re-scanning bundle')
    fresh = extract_layout(missing)
    cache.update(fresh)
    save_cached(cache)
    return cache


def main() -> None:
    """CLI entry point.

    Usage:
        python extract_face_icons.py                  # rebuild the entire cache
        python extract_face_icons.py 2000001 2000099  # refresh just these ids
    """
    args = sys.argv[1:]
    if args:
        cache = ensure_chars(args)
        print(f'Refreshed {len(args)} char(s); cache holds {len(cache)} total.')
    else:
        layout = extract_layout()
        save_cached(layout)
        print(f'Wrote {len(layout)} characters to {OUT.relative_to(ROOT)}')


if __name__ == '__main__':
    if not MANIFEST.exists():
        sys.exit(f'Bundle manifest not found: {MANIFEST}')
    main()
