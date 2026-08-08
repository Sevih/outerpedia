"""
Chasses des polices du PORTRAIT, lues dans les fichiers de police eux-mêmes.

Le portrait du jeu (`src/components/character/Portrait`) reproduit le `m_BestFit`
d'Unity : il réduit le corps du texte jusqu'à ce qu'il tienne dans sa boîte. Le
faire côté serveur demande la largeur du texte, qu'aucun DOM ne peut mesurer —
d'où ce script, qui sort la chasse de chaque glyphe.

Deux polices, désignées par le `m_Font` des `Text` du prefab (path_id résolus
dans le bundle `font2`) :

    name  `Text_Name`, `LvText` et le nombre du niveau
    demi  `Text_Demi`, le titre

L'ÉTIQUETTE UNITY MENT, et ce script est ce qui l'a montré. Les deux assets du
bundle s'appellent `NotoSans_Bold` et `NotoSans_Regular` ; leurs tables `name`
disent **SUIT ExtraBold** (usWeightClass 800) et **SUIT Bold** (700), une famille
coréenne de Sunn, sous licence libre. Ce ne sont donc ni des Noto, ni les
graisses annoncées. Les fichiers de `src/fonts/` portent le vrai nom — le lien
avec l'asset se lit ici, pas dans un nom de fichier faux.

Il lit `src/fonts/*.woff2`, PAS `.gamedata` : ce sont les fichiers que le
navigateur télécharge réellement, donc les seuls dont les chasses décrivent le
rendu. Ils sont committés, ce script n'a donc pas besoin de la machine de
datamine — seulement de fontTools.

Format de sortie (JSON) :
{
  "<rôle>": {
    "file":       "src/fonts/….woff2",
    "asset":      nom de l'asset Unity — trompeur, gardé pour la traçabilité,
    "family":     nom RÉEL de la police, lu dans sa table `name`,
    "weight":     usWeightClass, à déclarer tel quel dans la @font-face,
    "unitsPerEm": 1000,
    "kerning":    true|false,      # informatif : cf. la note ci-dessous
    "hangul":     chasse UNIQUE des 11 172 syllabes hangûl,
    "latin":      chasse moyenne des 52 lettres — le repli d'un glyphe non tabulé,
    "advance":    { "<caractère>": chasse, … }   # tout ce que la police couvre
  },                                             # hors syllabes hangûl
  …
}

Les chasses sont en EM (advance ÷ unitsPerEm), donc directement multipliables
par le corps du texte.

NOTE SUR LE CRÉNAGE. Les deux polices ont un `GPOS` avec la feature `kern`, que
le navigateur applique par défaut mais que le jeu N'APPLIQUE PAS : le `Text`
historique d'Unity empile les chasses sans moteur de composition (c'est
TextMeshPro qui a introduit le crénage). Le composant pose donc
`font-kerning: none`, ce qui est à la fois fidèle au jeu et ce qui rend la somme
de ces chasses exacte. Le drapeau est sorti ici pour que ce raisonnement reste
vérifiable si une police change.
"""

from __future__ import annotations

import json
import sys
from pathlib import Path

from fontTools.ttLib import TTFont

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / 'datagen' / 'assets' / 'portrait-font-metrics.json'

# rôle -> (fichier, asset Unity dont il provient)
FONTS = {
    'name': ('src/fonts/SUIT-ExtraBold.woff2', 'NotoSans_Bold'),
    'demi': ('src/fonts/SUIT-Bold.woff2', 'NotoSans_Regular'),
}

HANGUL_SYLLABLES = range(0xAC00, 0xD7A4)
LATIN_LETTERS = [*range(0x41, 0x5B), *range(0x61, 0x7B)]


def measure(rel: str, asset: str) -> dict:
    path = ROOT / rel
    if not path.exists():
        raise FileNotFoundError(f'Police introuvable : {path}')
    font = TTFont(str(path))
    upm = font['head'].unitsPerEm
    hmtx = font['hmtx']
    cmap = font.getBestCmap()

    def em(cp: int) -> float | None:
        glyph = cmap.get(cp)
        return None if glyph is None else hmtx[glyph][0] / upm

    # Le hangûl doit être à chasse UNIQUE : c'est ce qui permet de le résumer à
    # une constante au lieu de tabuler 11 172 entrées. Si une police venait à ne
    # plus l'être, mieux vaut casser ici que rendre un texte qui déborde.
    hangul = {em(cp) for cp in HANGUL_SYLLABLES if em(cp) is not None}
    if len(hangul) != 1:
        raise SystemExit(f'{rel} : chasses hangûl non uniformes ({sorted(hangul)[:6]}…)')

    # Tout ce que la police couvre HORS syllabes hangûl — 263 glyphes, assez peu
    # pour être sorti en entier plutôt que d'être choisi à la main (un jeu de
    # caractères « utiles » finit toujours par oublier celui qui arrive).
    advance = {
        chr(cp): round(em(cp), 4)
        for cp in sorted(cmap)
        if cp not in HANGUL_SYLLABLES and cp >= 0x20
    }
    latin = sum(em(cp) for cp in LATIN_LETTERS) / len(LATIN_LETTERS)

    kern = 'GPOS' in font and any(
        rec.FeatureTag == 'kern' for rec in font['GPOS'].table.FeatureList.FeatureRecord
    )
    return {
        'file': rel,
        'asset': asset,
        'family': str(font['name'].getDebugName(1)),
        'weight': font['OS/2'].usWeightClass,
        'unitsPerEm': upm,
        'kerning': kern,
        'hangul': round(hangul.pop(), 4),
        'latin': round(latin, 4),
        'advance': advance,
    }


def main() -> None:
    out = {role: measure(rel, asset) for role, (rel, asset) in FONTS.items()}
    # Même convention d'écriture que `extract-face-layout.py` : LF explicite (le
    # dépôt est en LF, `write_text` traduirait en CRLF sous Windows) et saut de
    # ligne final, que git attend et que `json.dumps` n'ajoute pas.
    OUT.write_text(json.dumps(out, indent=2, ensure_ascii=False) + '\n', encoding='utf-8', newline='\n')
    for role, m in out.items():
        print(
            f'{role:5} {m["asset"]:18} → {m["family"]:18} ({m["weight"]})  '
            f'{len(m["advance"])} chasses, hangûl {m["hangul"]}'
        )
    print(f'→ {OUT.relative_to(ROOT)}')


if __name__ == '__main__':
    try:
        main()
    except FileNotFoundError as e:
        sys.exit(str(e))
