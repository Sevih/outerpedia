"""Extract the LOGICAL rect of atlas sprites that Unity stores trimmed.

Unity's sprite packer crops fully-transparent borders before packing. Three
fields describe the result:

    m_Rect                  the sprite's LOGICAL size — what a prefab lays out
    m_RD.textureRect        what is actually stored in the atlas (cropped)
    m_RD.textureRectOffset  where that crop sits inside the logical rect,
                            measured from the BOTTOM-LEFT (Unity's origin)

AssetStudio exports only the cropped pixels. Anything that then draws that file
at the logical size stretches it AND shifts it — and the crop is rarely
symmetric (MT_4031033 loses 30px on the left and 0 on the right). Staging pads
the file back to its logical rect using this table, so every consumer gets an
asset whose size means what the prefab says it means.

Output (JSON), only for sprites that are actually cropped:

{
  "<atlas>/<sprite>": { "w": int, "h": int, "left": int, "bottom": int },
  ...
}

SCOPE — the atlases below, not all of them. The defect is game-wide (83% of
at_dungeonruntime, 97% of at_thumbnailcostumeruntime), but padding an atlas
re-cuts every icon the site already serves from it, so each one is a deliberate
step. These two are the ones the monster/character thumbnails lay out by.

Note the key is prefixed by ATLAS: 32 sprite names exist in more than one atlas
with DIFFERENT geometry (CM_Element_Water is 42x42 in `common` and 46x46 in
`re_common`). A flat name table would silently pad the wrong one.
"""

from __future__ import annotations

import json
import os
from pathlib import Path

import UnityPy

ROOT = Path(__file__).resolve().parents[2]
# Racine de l'aire de travail — `GAMEDATA_ROOT` (cf. datagen/lib/paths.ts),
# `.gamedata` sinon. Relative → depuis la racine du repo.
GAMEDATA = ROOT / os.environ.get('GAMEDATA_ROOT', '.gamedata')
MANIFEST = GAMEDATA / 'files' / 'bundles' / 'manifest.dat'
BUNDLES_DIR = GAMEDATA / 'files' / 'bundles'
OUT = ROOT / 'datagen' / 'assets' / 'sprite-rect.json'

ATLASES = [
    'at_thumbnailmonsterruntime',
    'at_thumbnailcharacterruntime',
]


def bundle_path(name: str) -> Path:
    """Resolve a bundle's hashed filename via the manifest (it rotates per version)."""
    manifest = json.loads(MANIFEST.read_text(encoding='utf-8'))
    for b in manifest['bundleInfos']:
        if b.get('name') == name:
            path = BUNDLES_DIR / b['filename']
            if not path.exists():
                raise FileNotFoundError(f'Bundle missing on disk: {path}')
            return path
    raise RuntimeError(f'No bundle named {name!r} in manifest')


def extract() -> dict[str, dict]:
    out: dict[str, dict] = {}
    for atlas in ATLASES:
        env = UnityPy.load(str(bundle_path(f'spriteatlas/{atlas}')))
        cropped = 0
        total = 0
        for obj in env.objects:
            if obj.type.name != 'Sprite':
                continue
            t = obj.read_typetree()
            total += 1
            w, h = round(t['m_Rect']['width']), round(t['m_Rect']['height'])
            rd = t['m_RD']
            tw, th = round(rd['textureRect']['width']), round(rd['textureRect']['height'])
            if (tw, th) == (w, h):
                continue
            cropped += 1
            out[f'{atlas}/{t["m_Name"]}'] = {
                'w': w,
                'h': h,
                'left': round(rd['textureRectOffset']['x']),
                'bottom': round(rd['textureRectOffset']['y']),
            }
        print(f'  {atlas}: {cropped}/{total} sprites rognés')
    return out


def save(table: dict[str, dict]) -> None:
    """Format STABLE d'une extraction à l'autre — mêmes précautions que
    `extract-face-layout.py` : LF explicite (le dépôt est en LF, `write_text`
    traduirait en CRLF sous Windows) et saut de ligne final, que git attend."""
    OUT.parent.mkdir(parents=True, exist_ok=True)
    ordered = {k: table[k] for k in sorted(table)}
    OUT.write_text(json.dumps(ordered, indent=2) + '\n', encoding='utf-8', newline='\n')


def main() -> None:
    # ÉCRASEMENT, pas fusion (contrairement au face-layout) : la table décrit la
    # géométrie de l'atlas COURANT. Une entrée qui disparaît est un sprite retiré
    # du jeu — la garder ferait padder un fichier qui n'existe plus.
    table = extract()
    save(table)
    print(f'sprite-rect.json : {len(table)} sprites rognés sur {len(ATLASES)} atlas.')


if __name__ == '__main__':
    if not MANIFEST.exists():
        raise SystemExit(f'Bundle manifest not found: {MANIFEST}')
    main()
