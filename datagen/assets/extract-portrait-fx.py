"""
EXTRACTION DE L'EFFET ANIMÉ DU PORTRAIT — la couche que `Portrait` ne pose pas.

Le portrait du jeu (`CharacterThumbnailList`, cf. `src/components/character/Portrait.tsx`)
porte un nœud que la transcription statique ignore : `FX_Holder`, soit
`CUICharacterThumbnail.m_EffectHolder`. `SetEffect` (RVA 0x27F74A4) y détruit les
enfants existants, demande à `CTempletManager.GetCharacterCardEffectByID(id)` un NOM
d'effet, puis `CResourceManager.LoadAsset<GameObject>` + `Instantiate` sous le holder.
Rien d'autre : pas de paramètre, pas de variante. Le nom vient de
`CharacterExtraTemplet.ThumbnailEffect` — une minorité de persos en ont un (26 au
patch du 12/08/2026, et ça grandit : les compter ici pourrirait).

Les prefabs correspondants vivent dans le bundle `prefabs/character/ui_effect`, en
deux familles de noms : les NOMMÉS, partagés ou partageables (`_Demi`, `_Dungeon`,
`_Seasonal`, `_Resonance`, et `_Synchro` que pose `SetSynchroEffect`), et les
NUMÉROTÉS, sur mesure pour un perso (`_2000086`…). Le bundle grandit avec le jeu —
onze prefabs au patch du 08/09/2026.

CE QU'ILS CONTIENNENT, ET CE QUI SURPREND. Aucun `AnimationClip`, aucun `Animator` :
que des `ParticleSystem`, en deux familles.

  1. LES CALQUES DE CADRE (`inner`, `out`, `web`, `inner_2`) n'émettent QU'UNE
     particule, en `m_RenderMode = Mesh` sur une maille dédiée. Leur `looping` est
     FAUX et leur durée de vie vaut `lengthInSec` : on croirait un one-shot de 1,5 s.
     C'est `ringBufferMode = 2` (LoopUntilReplaced) qui tranche — la particule ne
     meurt jamais, son âge reboucle. Le mouvement ne vient donc PAS du système : il
     vient du shader, qui fait défiler les UV sur `_Time`.

  2. LES ÉMETTEURS DÉCORATIFS (`star`, `atlas`, `bubble`) sont, eux, de vraies
     particules — 2 à 10 par seconde, forme BoxShell, courbes de taille et de couleur
     sur la vie, feuille UV. `_Demi` n'en a aucun : c'est pourquoi il vient en premier.

LE SHADER EST UNIQUE pour tous les matériaux : `MASTA/S_Assemble_Particle_UI`
(bundle `shader/common`). Son GLSL ES 3.0 compilé est lisible dans le bundle, et la
transcription web le rejoue à l'identique — cf. `src/components/character/portrait-fx-gl.ts`,
qui porte la formule ligne à ligne. Ce script-ci n'extrait donc QUE ses ENTRÉES :
textures, mailles, et les paramètres de chaque matériau.

SORTIES
  - `datagen/assets/portrait-fx.json` — la table (émetteurs, matériaux, mailles).
  - les textures en PNG dans le pool d'images du jeu
    (`.gamedata/extracted/images/…/ui_effect/`), d'où `manifest.ts` les demande.

POURQUOI SANS PERTE, DE BOUT EN BOUT. Le PNG n'est que le format du pool ; sur le
bucket, `manifest.ts` demande ces textures en `.webp` SANS PERTE (`lossless`, que
`stage.ts` honore), et ce n'est pas un détail : le shader multiplie trois
échantillons puis amplifie par `_MainStrength`, qui vaut 70 sur
`M_FX_UI_Char_out_Demi`. Une erreur de quantification de 1/255 par texture ressort
à ~0,27 à l'écran — soit du banding franc sur un dégradé.

QUELS EFFETS. Aucune liste à tenir : sans argument, le script sort les effets que la
table du jeu NOMME et dont le prefab existe dans le bundle (cf. `table_effects`). Un
effet qui arrive avec un patch est donc extrait d'office ; c'est le moteur qui décide
ensuite s'il sait le poser en entier (`effectVerdict`, `portrait-fx-sim.ts`), et le
refresh qui le dit (`portrait-fx-report.ts`). Un effet nommé sans prefab, ou dont la
lecture lève, n'arrête rien : il est écarté, nommé dans `notExtracted`, et son
porteur garde un portrait statique.

Usage :
    python extract-portrait-fx.py              # les effets que la table du jeu nomme
    python extract-portrait-fx.py Demi Synchro # ceux-là seulement, par suffixe de nom (travail à la main)
    python extract-portrait-fx.py --all        # tout le bundle (idem)
    python extract-portrait-fx.py --max-size 1024  # autre plafond de texture (0 = aucun)
"""

from __future__ import annotations

import json
import os
import sys
from pathlib import Path
from typing import Any

import UnityPy
from PIL import Image
from UnityPy.helpers.MeshHelper import MeshHandler

ROOT = Path(__file__).resolve().parents[2]
# Racine de l'aire de travail — `GAMEDATA_ROOT` (cf. datagen/lib/paths.ts),
# `.gamedata` sinon. Relative → depuis la racine du repo.
GAMEDATA = ROOT / os.environ.get('GAMEDATA_ROOT', '.gamedata')
BUNDLES_DIR = GAMEDATA / 'files' / 'bundles'
MANIFEST = BUNDLES_DIR / 'manifest.dat'
EXTRA_TABLE = GAMEDATA / 'parsed' / 'CharacterExtraTemplet.json'
OUT_JSON = ROOT / 'datagen' / 'assets' / 'portrait-fx.json'
# `globalgamemanagers` tiré du jeu INSTALLÉ par `pnpm datagen:dump` (adb, même
# geste que la paire metadata/so). Source à jour et reproductible du colorSpace,
# là où l'APK déposée à la main ne vivait que sur une machine.
GGM = GAMEDATA / 'apk' / 'globalgamemanagers'
GGM_ENTRY_IN_APK = 'assets/bin/Data/globalgamemanagers'
# Le pool que `buildImageIndex` (assets/source.ts) balaye. On reproduit le
# rangement par container d'AssetStudio (`-g containerFull`) : l'index n'indexe
# que le basename, mais le chemin dit d'où vient le fichier.
OUT_TEX = (
    GAMEDATA
    / 'extracted'
    / 'images'
    / 'assets'
    / 'editor'
    / 'resources'
    / 'prefabs'
    / 'character'
    / 'ui_effect'
)

FX_BUNDLE = 'prefabs/character/ui_effect'
PAGE_BUNDLE = 'prefabs/ui/cuicharactermainpage'
EFFECT_PREFIX = 'FX_UI_Character_List_'

#: PLAFOND du plus grand côté d'une texture, en texels (`--max-size`, 0 = aucun).
#:
#: Chaque carte animée monte SA copie de toutes ses textures, non compressées
#: (un contexte WebGL ne partage rien) : c'est la taille du fichier qui fait le
#: poids GPU, pas ce qu'on en voit. `T_FX_Crystal_001_A` (2048²) coûtait 16 Mo
#: par carte `_Demi` pour un nuage étiré une fois sur une vignette.
#:
#: POURQUOI 512. Une carte du site fait au plus 152 px CSS de large (`w-38` de
#: `CharacterCard`) et le moteur plafonne le dpr à 2 : 304 × 581 pixels
#: d'appareil. Une texture de 512 étalée sur la carte y garde donc au moins un
#: texel par pixel en largeur (0,9 en hauteur, 1,8 pour celles que leur `_ST`
#: tuile deux fois) — rien à gagner au-dessus. Mesuré sur la page de contrôle
#: (`/dev/AnimatedPortrait#plafond`, Firefox, dpr 2, image figée) : les trois
#: nuages plafonnés rendent la même image à 3/255 près ; seule la planche
#: `T_FX_Atlas_01` bouge, sur les rayons des glints, sans que ça se voie à cette
#: taille. À 256 en revanche `_Resonance` change franchement et l'écart sur
#: les glints double : 512 est le dernier cran gratuit.
DEFAULT_MAX_SIZE = 512


def bundle_path(name: str) -> Path:
    """Résout le fichier d'un bundle par son nom (le hash tourne à chaque patch)."""
    with MANIFEST.open('r', encoding='utf-8') as f:
        manifest = json.load(f)
    for b in manifest['bundleInfos']:
        if b.get('name') == name:
            p = BUNDLES_DIR / b['filename']
            if not p.exists():
                raise FileNotFoundError(f'bundle « {name} » absent du disque : {p}')
            return p
    raise RuntimeError(f'aucun bundle nommé « {name} » dans le manifeste')


def bundle_deps(name: str) -> list[str]:
    with MANIFEST.open('r', encoding='utf-8') as f:
        manifest = json.load(f)
    for b in manifest['bundleInfos']:
        if b.get('name') == name:
            return list(b.get('dependencies') or [])
    return []


def r(x: Any, n: int = 6) -> Any:
    """Arrondi d'affichage — le JSON est relu à l'œil, pas seulement par le code."""
    if isinstance(x, float):
        v = round(x, n)
        return int(v) if v == int(v) else v
    return x


def vec(d: dict, *keys: str) -> list:
    return [r(d[k]) for k in keys]


class Bundle:
    """Un bundle chargé, indexé par path_id — la brique de toutes les résolutions."""

    def __init__(self, name: str):
        self.name = name
        self.env = UnityPy.load(str(bundle_path(name)))
        self.objs = list(self.env.objects)
        self.by_pid = {o.path_id: o for o in self.objs}

    def read(self, pid: int):
        o = self.by_pid.get(pid)
        return o.read_typetree() if o else None

    def type_of(self, pid: int) -> str:
        o = self.by_pid.get(pid)
        return o.type.name if o else '?'

    def component(self, go: dict, type_name: str):
        """Le composant `type_name` d'un GameObject, lu (ou None)."""
        for c in go.get('m_Component', []):
            pid = c['component']['m_PathID']
            if self.type_of(pid) == type_name:
                return self.read(pid)
        return None

    def gameobjects(self, name: str) -> list[dict]:
        out = []
        for o in self.objs:
            if o.type.name != 'GameObject':
                continue
            tt = o.read_typetree()
            if tt.get('m_Name') == name:
                out.append(tt)
        return out


# --- le holder, lu dans le prefab du portrait -----------------------------------


def read_holder() -> dict:
    """Le rect de `FX_Holder` — l'origine de tout l'effet, en unités du cadre.

    Ancres et pivot au centre : le rect se résout donc au centre de `CharacterInfo`,
    lui-même plein cadre. On publie la position en coordonnées CSS (origine coin
    HAUT-gauche du cadre de 180×344, Y vers le BAS), comme `portrait-layout`.
    """
    page = Bundle(PAGE_BUNDLE)
    holders = page.gameobjects('FX_Holder')
    if len(holders) != 1:
        raise RuntimeError(f'FX_Holder : {len(holders)} nœuds trouvés, 1 attendu')
    rt = page.component(holders[0], 'RectTransform')
    ap, sd = rt['m_AnchoredPosition'], rt['m_SizeDelta']
    for k, expect in (('m_AnchorMin', 0.5), ('m_AnchorMax', 0.5), ('m_Pivot', 0.5)):
        if (rt[k]['x'], rt[k]['y']) != (expect, expect):
            raise RuntimeError(f'FX_Holder : {k} inattendu {rt[k]} — la résolution ci-dessus tombe')
    return {
        'x': r(90 + ap['x']),
        'y': r(172 - ap['y']),
        'w': r(sd['x']),
        'h': r(sd['y']),
    }


def previous_table() -> dict:
    """Le JSON committé — ce que le dernier passage a publié —, ou `{}` s'il n'y en a pas."""
    if not OUT_JSON.exists():
        return {}
    try:
        return json.loads(OUT_JSON.read_text(encoding='utf-8'))
    except (OSError, ValueError):
        return {}


def previous_color_space() -> str:
    """`colorSpace` déjà résolu dans le JSON committé, ou `unknown` s'il n'y en a pas."""
    return previous_table().get('colorSpace', 'unknown')


def color_space_of(path: Path) -> str | None:
    """Lit `m_ActiveColorSpace` des PlayerSettings d'un `globalgamemanagers`."""
    env = UnityPy.load(str(path))
    for o in env.objects:
        if o.type.name != 'PlayerSettings':
            continue
        # UnityEngine.ColorSpace : Gamma = 0, Linear = 1.
        return 'linear' if o.read_typetree().get('m_ActiveColorSpace') == 1 else 'gamma'
    return None


def read_color_space() -> str:
    """`ColorSpace` du projet, lu dans les PlayerSettings du build.

    C'EST LA VALEUR QUI DÉCIDE DE TOUT L'ÉTALONNAGE, et elle ne se lit nulle part
    ailleurs : ni les prefabs, ni les matériaux, ni les bundles ne la portent.
    En `linear`, le GPU linéarise les textures marquées sRGB à l'échantillonnage
    et le mélange additif se fait en lumière linéaire ; en `gamma`, rien n'est
    converti. L'écart n'est pas cosmétique — `_MainStrength` vaut 70 sur le
    liseré, et supposer `gamma` blanchit la carte entière.

    TROIS SOURCES, dans l'ordre :
      1. `globalgamemanagers` tiré du jeu installé par `datagen:dump` — la voie
         reproductible, sur n'importe quelle machine ayant l'émulateur ;
      2. une APK déposée à la main (l'ancienne voie, gardée en repli) ;
      3. à défaut, la valeur DÉJÀ RÉSOLUE dans le JSON committé, qu'on PRÉSERVE
         au lieu de la dégrader. Une machine sans dump ni APK écrasait sinon
         `linear` par `unknown`, et le rendu REFUSE tout ce qui n'est pas
         `linear` (`portrait-fx-gl.ts`) : l'effet disparaissait du site en un
         commit. `unknown` ne subsiste qu'au tout premier passage, quand il n'y a
         rien à préserver — et là c'est bien au rendu de refuser, se tromper
         d'espace ne se voyant pas « un peu ».
    """
    if GGM.exists():
        found = color_space_of(GGM)
        if found:
            return found
        print("  ! globalgamemanagers sans PlayerSettings — on tente l'APK")

    apks = sorted((GAMEDATA / 'apk').glob('*/com.smilegate.*.apk'))
    if not apks:
        kept = previous_color_space()
        print(f'  ! ni globalgamemanagers ni APK — colorSpace conservé : {kept}')
        print('    (`pnpm datagen:dump` avec LDPlayer lancé le résout pour de bon)')
        return kept

    import zipfile

    with zipfile.ZipFile(apks[0]) as z:
        blob = z.read(GGM_ENTRY_IN_APK)
    GGM.parent.mkdir(parents=True, exist_ok=True)
    GGM.write_bytes(blob)
    found = color_space_of(GGM)
    if found:
        return found
    # APK présente mais illisible : préserver vaut mieux que dégrader.
    return previous_color_space()


# --- matériaux, textures, mailles -----------------------------------------------


def texture_index(deps: list[str]) -> dict[int, tuple[str, str]]:
    """path_id → (bundle, nom) pour les textures des bundles DÉPENDANTS.

    Les matériaux référencent leurs textures par `m_FileID` non nul dès qu'elles
    vivent ailleurs (bruits communs, dégradés partagés, une texture de scène).
    Sans cet index, `_NoiseTex` et `_MainTex` de la moitié des matériaux restent
    des nombres.
    """
    index: dict[int, tuple[str, str]] = {}
    for dep in deps:
        try:
            b = Bundle(dep)
        except (FileNotFoundError, RuntimeError):
            continue
        for o in b.objs:
            if o.type.name in ('Texture2D', 'Sprite'):
                index[o.path_id] = (dep, o.read_typetree().get('m_Name'))
    return index


def read_mesh(fx: Bundle, pid: int) -> dict:
    """Sommets / UV / triangles d'une maille de particule, dépliés par `MeshHandler`.

    Les mailles du bundle sont en flux compressé (`m_VertexData`), que le typetree
    ne donne pas déplié. SURTOUT PAS l'export OBJ d'UnityPy pour ça : il NÉGATE X
    (conversion main gauche → main droite du format), ce qui a envoyé le biseau du
    coin haut-DROIT des calques au coin gauche et mis tous les défilements
    horizontaux en miroir — les UV, eux, sortaient fidèles, donc rien ne criait.
    `MeshHandler` rend les flux TELS QUELS. On ne garde que position XY et UV0 :
    ces mailles sont plates (Z ~ 1e-7) et le rendu est 2D.
    """
    mesh = fx.by_pid[pid].read()
    h = MeshHandler(mesh)
    h.process()
    verts = [[r(float(v[0])), r(float(v[1]))] for v in h.m_Vertices]
    uvs = [[r(float(uv[0])), r(float(uv[1]))] for uv in h.m_UV0]
    tris = [int(i) for i in h.m_IndexBuffer]
    if len(verts) != len(uvs):
        raise RuntimeError(f'{mesh.m_Name} : {len(verts)} sommets pour {len(uvs)} UV')
    return {'name': mesh.m_Name, 'v': verts, 'uv': uvs, 'i': tris}


def read_material(fx: Bundle, pid: int, tex_index: dict, wanted_tex: dict) -> dict:
    """Un matériau : ses textures (nommées), ses flottants, ses vitesses.

    `m_ValidKeywords` est publié TEL QUEL : c'est lui qui décide de la variante du
    shader, donc des branches que le portage doit prendre. Les flottants `_XXX_ON`
    portent la même information en double dans le prefab — on garde les deux, et
    `portrait-fx-gl` lit les mots-clés.
    """
    mt = fx.read(pid)
    props = mt['m_SavedProperties']
    textures: dict[str, dict] = {}
    for key, env in props['m_TexEnvs']:
        tpid = env['m_Texture']['m_PathID']
        if not tpid:
            continue
        if tpid in fx.by_pid:
            name = fx.read(tpid).get('m_Name')
            src = FX_BUNDLE
        elif tpid in tex_index:
            src, name = tex_index[tpid]
        else:
            raise RuntimeError(f'{mt["m_Name"]}.{key} : texture {tpid} irrésolue')
        wanted_tex[name] = (src, tpid)
        textures[key] = {
            'tex': name,
            # `_ST` du shader : xy = échelle (tuilage), zw = décalage.
            'st': [r(env['m_Scale']['x']), r(env['m_Scale']['y']),
                   r(env['m_Offset']['x']), r(env['m_Offset']['y'])],
        }
    return {
        'name': mt['m_Name'],
        'keywords': sorted(mt.get('m_ValidKeywords') or []),
        'renderQueue': mt.get('m_CustomRenderQueue'),
        'textures': textures,
        'floats': {k: r(v) for k, v in props['m_Floats']},
        'vectors': {k: [r(v['r']), r(v['g']), r(v['b']), r(v['a'])] for k, v in props['m_Colors']},
    }


def halvings(w: int, h: int, max_size: int) -> int:
    """Combien de fois diviser par deux pour que le plus grand côté tienne sous le plafond."""
    n = 0
    while max_size and max(w, h) >> n > max_size:
        n += 1
    return n


def _srgb_to_linear(c: float) -> float:
    return c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4


def _linear_to_srgb(c: float) -> float:
    return c * 12.92 if c <= 0.0031308 else 1.055 * c ** (1 / 2.4) - 0.055


# sRGB 8 bits → lumière linéaire sur 16 bits, et retour : la moyenne se fait
# entre les deux, en flottant.
_DECODE = [_srgb_to_linear(i / 255) * 65535 for i in range(256)]
_ENCODE = [round(_linear_to_srgb(i / 65535) * 255) for i in range(65536)]


def shrink(image: Image.Image, levels: int, srgb: bool) -> Image.Image:
    """Le niveau de mip `levels` de l'image : moyenne de blocs de 2^levels texels.

    C'est ce que le GPU lirait si la texture avait une chaîne de mips, et c'est ce
    que la page de contrôle simule (`texCap` de `portrait-fx-gl`) : le fichier
    réduit doit rendre la MÊME image que la carte qu'on a validée à l'écran.

    Une texture marquée sRGB se moyenne en LUMIÈRE LINÉAIRE, comme le GPU qui la
    linéarise avant de filtrer : moyenner les valeurs encodées assombrit — et
    `_MainStrength` multiplie l'écart. L'alpha et les textures de données sont des
    nombres, pas des couleurs : moyenne directe. Canal par canal, sans
    prémultiplier : le shader lit `rgb` et `a` séparément, et le filtrage
    bilinéaire du jeu ne prémultiplie pas non plus.
    """
    factor = 1 << levels
    bands = []
    for band, channel in zip(image.getbands(), image.split()):
        if srgb and band != 'A':
            linear = channel.point(_DECODE, 'F').reduce(factor)
            # +0,5 : `convert('I')` tronque.
            channel = linear.point(lambda v: v + 0.5).convert('I').point(_ENCODE, 'L')
        else:
            channel = channel.reduce(factor)
        bands.append(channel)
    return Image.merge(image.mode, bands)


def read_texture(fx: Bundle, name: str, src: str, pid: int, cache: dict, max_size: int) -> dict:
    """Écrit le PNG dans le pool d'images et renvoie sa fiche (taille, wrap, filtre).

    Le mode de répétition compte autant que les pixels : tout le mouvement de ces
    calques est un défilement d'UV hors de [0,1]. Un `wrap` mal repris fige l'effet.

    Au-dessus de `max_size`, c'est un niveau de mip du jeu qu'on écrit (cf.
    `DEFAULT_MAX_SIZE`, `shrink`) : la fiche porte alors la taille du FICHIER —
    celle que le site monte — et `gameSize` garde celle du jeu.
    """
    b = fx if pid in fx.by_pid else cache.setdefault(src, Bundle(src))
    tex = b.by_pid[pid].read()
    tt = b.read(pid)
    image = tex.image
    levels = halvings(tex.m_Width, tex.m_Height, max_size)
    if levels:
        image = shrink(image, levels, srgb=tt.get('m_ColorSpace') == 1)
    OUT_TEX.mkdir(parents=True, exist_ok=True)
    dest = OUT_TEX / f'{name}.png'
    image.save(dest)
    st = tt.get('m_TextureSettings', {})
    return {
        'w': image.width,
        'h': image.height,
        **({'gameSize': [tex.m_Width, tex.m_Height]} if levels else {}),
        # 0 = Repeat, 1 = Clamp, 2 = Mirror (UnityEngine.TextureWrapMode).
        'wrapU': st.get('m_WrapU'),
        'wrapV': st.get('m_WrapV'),
        # 0 = Point, 1 = Bilinear, 2 = Trilinear.
        'filter': st.get('m_FilterMode'),
        # 1 = AUCUN mip. Cinq des huit textures de `_Demi` sont dans ce cas, et ça
        # se voit : minifier un bruit de 512 à travers une chaîne de mips que le
        # jeu n'a pas le lisse jusqu'à le faire disparaître. Une texture réduite
        # EST le niveau `levels` du jeu : sa chaîne raccourcit d'autant.
        'mips': max(1, tt.get('m_MipCount', 1) - levels),
        # 1 = sRGB. Le projet tourne en Linear color space (`m_ActiveColorSpace = 1`
        # de `globalgamemanagers`) : le GPU linéarise donc ces textures À
        # L'ÉCHANTILLONNAGE, et tout le shader travaille en lumière linéaire.
        # C'est ce qui rend `_MainStrength = 70` sensé plutôt qu'absurde.
        'srgb': tt.get('m_ColorSpace'),
        'bundle': src,
    }


# --- émetteurs -------------------------------------------------------------------


def gradient(g: dict) -> dict:
    """Un `Gradient` Unity → clés RGB et clés ALPHA séparées, temps en [0,1].

    Unity range les temps en entiers 16 bits ; les deux rampes sont indépendantes
    (`m_NumColorKeys` / `m_NumAlphaKeys`) et il faut les garder telles quelles :
    les fusionner inventerait des points de contrôle.

    `m_Mode` fait partie de la donnée : 0 = Blend (interpolation), 1 = Fixed —
    chaque clé règne jusqu'à son temps, SANS fondu. Le `star` de `_2000086` tire
    sa couleur d'un dégradé Fixed à quatre teintes : le lisser inventerait des
    mélanges que le jeu n'affiche jamais.
    """
    return {
        'mode': g.get('m_Mode', 0),
        'rgb': [
            {'t': r(g[f'ctime{i}'] / 65535), 'c': [r(g[f'key{i}'][k]) for k in 'rgb']}
            for i in range(g.get('m_NumColorKeys', 0))
        ],
        'a': [
            {'t': r(g[f'atime{i}'] / 65535), 'a': r(g[f'key{i}']['a'])}
            for i in range(g.get('m_NumAlphaKeys', 0))
        ],
    }


def min_max_gradient(m: dict) -> dict:
    """`MinMaxGradient` : 0 = couleur, 1 = dégradé, 2 = deux couleurs, 3 = deux
    dégradés, 4 = COULEUR ALÉATOIRE — un tirage unique à la naissance dans
    `maxGradient` (c'est le seul que l'inspecteur montre dans ce mode).

    Un mode inconnu CASSE l'extraction : publier `{'mode': n}` nu ferait rendre
    du blanc en silence — vécu avec le 4, dont le repli blanchissait les
    étincelles multicolores du `star` de `_2000086`.
    """
    mode = m['minMaxState']
    if mode not in (0, 1, 2, 3, 4):
        raise RuntimeError(f'MinMaxGradient : mode {mode} inconnu — à transcrire avant de publier')
    out: dict[str, Any] = {'mode': mode}
    if mode in (0, 2):
        out['max'] = [r(m['maxColor'][k]) for k in 'rgba']
    if mode == 2:
        out['min'] = [r(m['minColor'][k]) for k in 'rgba']
    if mode in (1, 3, 4):
        out['maxGradient'] = gradient(m['maxGradient'])
    if mode == 3:
        out['minGradient'] = gradient(m['minGradient'])
    return out


#: Les modules d'un `ParticleSystem` que la fiche SAIT porter : les sept publiés
#: bruts (cf. la boucle de `read_emitter`), plus les trois qu'elle aplatit en
#: champs (`InitialModule`, `EmissionModule`, `ColorModule`). Tout autre module
#: ACTIF (forces, collisions, traînées, sous-émetteurs…) changerait le rendu sans
#: qu'aucune clé ne le dise : il écarte l'effet.
KNOWN_MODULES = frozenset({
    'InitialModule', 'EmissionModule', 'ColorModule',
    'ShapeModule', 'SizeModule', 'RotationModule', 'UVModule', 'NoiseModule',
    'VelocityModule', 'ClampVelocityModule',
})


def mm_active(c: dict) -> bool:
    """Un `MinMaxCurve` qui peut rendre AUTRE CHOSE que zéro — une courbe compte pour actif."""
    state = c['minMaxState']
    if state == 0:
        return c['scalar'] != 0
    if state == 3:
        return c['scalar'] != 0 or c['minScalar'] != 0
    return True


def check_flattened(node: str, ps: dict) -> None:
    """CE QUE LA FICHE APLATIT doit l'être SANS PERTE — sinon on lève.

    `rateOverTime`, `gravityModifier` et le compte des rafales ne sont publiés que
    par leur scalaire, `startRotation` que sur l'axe Z, et les modules hors de
    `KNOWN_MODULES` pas du tout : tant que le jeu n'y met que des constantes, la
    fiche dit vrai. Le jour où un prefab y met une courbe, un tirage, un axe ou un
    module de plus, publier le scalaire ferait rendre l'effet DE TRAVERS sans
    qu'aucun garde du moteur (`layerVerdict`) puisse le voir, la table ne portant
    pas l'information. D'où la levée : l'effet est écarté avec son motif
    (`notExtracted`), et la carte reste un portrait statique — même politique que
    `min_max_gradient`. (P7 de l'audit.)
    """
    init = ps['InitialModule']
    em = ps['EmissionModule']
    faults: list[str] = []
    if em['rateOverTime']['minMaxState'] != 0:
        faults.append(f"rateOverTime en courbe ou tiré (état {em['rateOverTime']['minMaxState']})")
    if mm_active(em.get('rateOverDistance', {'minMaxState': 0, 'scalar': 0})):
        faults.append('rateOverDistance actif')
    for i, b in enumerate(em.get('m_Bursts', [])):
        if b['countCurve']['minMaxState'] != 0:
            faults.append(f"rafale {i} : compte en courbe ou tiré (état {b['countCurve']['minMaxState']})")
        if b.get('probability', 1.0) < 1:
            faults.append(f"rafale {i} : probabilité {b['probability']}")
    if init['gravityModifier']['minMaxState'] != 0:
        faults.append(f"gravityModifier en courbe ou tiré (état {init['gravityModifier']['minMaxState']})")
    if init.get('rotation3D'):
        axes = [k for k in ('startRotationX', 'startRotationY') if mm_active(init[k])]
        if axes:
            faults.append(f"rotation3D : {', '.join(axes)} actif(s), la fiche ne porte que Z")
    if init.get('randomizeRotationDirection'):
        faults.append(f"randomizeRotationDirection {init['randomizeRotationDirection']}")
    for key, mod in ps.items():
        if key.endswith('Module') and isinstance(mod, dict) and mod.get('enabled') \
                and key not in KNOWN_MODULES:
            faults.append(f'module {key} actif, non publié')
    if faults:
        raise RuntimeError(f"{node} : {' ; '.join(faults)}")


def read_emitter(fx: Bundle, go: dict, rt: dict, mats: dict, meshes: dict,
                 tex_index: dict, wanted_tex: dict) -> dict | None:
    """Un nœud de l'effet, avec ce que son `ParticleSystem` a d'ACTIF.

    Renvoie None pour un nœud qui n'émet rien (le nœud RACINE des prefabs a son
    `EmissionModule` coupé : il ne sert que de porteur au `UIParticle`).

    Lève (`RuntimeError`) sur ce que la fiche APLATIRAIT en silence — cf.
    `check_flattened` : l'effet est alors écarté seul par `extract`, jamais publié
    avec un scalaire qui mentirait.
    """
    ps = fx.component(go, 'ParticleSystem')
    psr = fx.component(go, 'ParticleSystemRenderer')
    if not ps or not ps['EmissionModule']['enabled']:
        return None
    check_flattened(go['m_Name'], ps)

    init = ps['InitialModule']
    em = ps['EmissionModule']
    bursts = [
        {
            'time': r(b['time']),
            'count': r(b['countCurve']['scalar']),
            'cycles': b['cycleCount'],
            'interval': r(b['repeatInterval']),
        }
        for b in em.get('m_Bursts', [])
    ]

    mesh_pid = (psr.get('m_Mesh') or {}).get('m_PathID')
    if mesh_pid and mesh_pid not in meshes:
        meshes[mesh_pid] = read_mesh(fx, mesh_pid)
    mat_pid = next(
        (m['m_PathID'] for m in psr.get('m_Materials', []) if m.get('m_PathID')), None
    )
    if mat_pid and mat_pid not in mats:
        mats[mat_pid] = read_material(fx, mat_pid, tex_index, wanted_tex)

    out: dict[str, Any] = {
        'name': go['m_Name'],
        'active': bool(go.get('m_IsActive')),
        # Position en unités du cadre, Y vers le BAS (convention CSS de
        # `portrait-layout`) ; l'échelle locale reste dans le sens d'Unity.
        'pos': [r(rt['m_AnchoredPosition']['x']), r(-rt['m_AnchoredPosition']['y'])],
        'scale': vec(rt['m_LocalScale'], 'x', 'y', 'z'),
        # La ROTATION du nœud, en quaternion Unity TEL QUEL. Les calques de cadre
        # sont à l'identité ; les émetteurs de particules (`atlas`, `star`) sont
        # tournés de −90° sur X pour que le +Z d'émission du Box pointe vers le
        # HAUT de la carte. Sans elle, la zone de naissance et la direction de
        # montée sont fausses.
        'rotation': [r(rt['m_LocalRotation'][k]) for k in 'xyzw'],
        'lengthInSec': r(ps['lengthInSec']),
        'simulationSpeed': r(ps['simulationSpeed']),
        'looping': bool(ps['looping']),
        'prewarm': bool(ps['prewarm']),
        # La GRAINE de l'aléa. `autoRandomSeed` vrai = une graine tirée à chaque
        # lecture, et `randomSeed` ne compte pas. Faux = le système rejoue
        # `randomSeed` — et deux émetteurs qui portent la MÊME tirent la même
        # suite : le `star` et le `star (1)` de `_2000093`, jumeaux à la taille
        # et au matériau près, font alors naître chaque étoile SOUS son halo.
        # VARIE PAR ÉMETTEUR (faux sur huit `star` au patch du 08/09/2026) : le
        # taire laissait le moteur tirer les deux à part.
        'autoRandomSeed': bool(ps['autoRandomSeed']),
        'randomSeed': ps['randomSeed'],
        # 0 = désactivé, 1 = pause en fin de vie, 2 = LA VIE REBOUCLE. C'est ce 2
        # qui fait des calques de cadre un effet permanent malgré `looping = false`.
        'ringBufferMode': ps['ringBufferMode'],
        'ringBufferLoopRange': vec(ps['ringBufferLoopRange'], 'x', 'y'),
        'startLifetime': r(init['startLifetime']['scalar']),
        'startLifetimeMin': r(init['startLifetime']['minScalar']),
        'startLifetimeMode': init['startLifetime']['minMaxState'],
        'startSize': r(init['startSize']['scalar']),
        'startSizeMin': r(init['startSize']['minScalar']),
        'startSizeMode': init['startSize']['minMaxState'],
        # `size3D` : la hauteur du billboard tire sa PROPRE plage (les glints de
        # `star` font le double de leur largeur). Faux = quad carré, Y ignoré.
        'size3D': bool(init['size3D']),
        'startSizeY': r(init['startSizeY']['scalar']),
        'startSizeYMin': r(init['startSizeY']['minScalar']),
        'startSizeYMode': init['startSizeY']['minMaxState'],
        # Rotation INITIALE du quad (radians, axe Z seul — `rotation3D` est faux
        # partout ici). `atlas` tire ±2π ; `star` reste droit.
        'startRotation': r(init['startRotation']['scalar']),
        'startRotationMin': r(init['startRotation']['minScalar']),
        'startRotationMode': init['startRotation']['minMaxState'],
        # ×Physics.gravity, en unités MONDE : un système local sous une échelle
        # de 50 la divise d'autant — un murmure ici, mais relevé, pas décidé.
        'gravityModifier': r(init['gravityModifier']['scalar']),
        # 0 = Hierarchy : l'échelle du transform s'applique aux positions, aux
        # tailles ET aux vitesses.
        'scalingMode': ps['scalingMode'],
        'startSpeed': r(init['startSpeed']['scalar']),
        'startSpeedMin': r(init['startSpeed']['minScalar']),
        'startSpeedMode': init['startSpeed']['minMaxState'],
        'startColor': min_max_gradient(init['startColor']),
        'maxParticles': init['maxNumParticles'],
        'emission': {'rateOverTime': r(em['rateOverTime']['scalar']), 'bursts': bursts},
        'renderMode': psr['m_RenderMode'],
        'sortingFudge': r(psr.get('m_SortingFudge')),
        'sortingOrder': psr.get('m_SortingOrder'),
        # Décide si Unity linéarise la couleur de particule avant le shader.
        # VARIE PAR ÉMETTEUR : vrai pour les deux calques de `_Demi`, faux pour
        # la plupart des autres prefabs — un `toLinear` systématique au rendu
        # mentirait dès le deuxième effet servi.
        'applyActiveColorSpace': bool(psr.get('m_ApplyActiveColorSpace')),
        'mesh': meshes[mesh_pid]['name'] if mesh_pid else None,
        'material': mats[mat_pid]['name'] if mat_pid else None,
    }
    if ps['ColorModule']['enabled']:
        out['colorOverLifetime'] = min_max_gradient(ps['ColorModule']['gradient'])
    # Les modules des ÉMETTEURS DÉCORATIFS. Publiés bruts : le premier palier
    # (`_Demi`) n'en a aucun, mais les taire ferait croire qu'ils n'existent pas.
    for key, label in (
        ('ShapeModule', 'shape'),
        ('SizeModule', 'sizeOverLifetime'),
        ('RotationModule', 'rotationOverLifetime'),
        ('UVModule', 'textureSheet'),
        ('NoiseModule', 'noise'),
        ('VelocityModule', 'velocityOverLifetime'),
        # Limit Velocity over Lifetime — le FREIN des particules : plafond de
        # vitesse par particule, amorti, traînée. C'est lui qui transforme le
        # coup de fouet initial (1-10 u/s) en dérive plane.
        ('ClampVelocityModule', 'limitVelocity'),
    ):
        mod = ps.get(key, {})
        if mod.get('enabled'):
            out[label] = json.loads(json.dumps(mod, default=str))
    return out


# --- qui porte quel effet ---------------------------------------------------------


def by_character() -> dict[str, str] | None:
    """`CharacterID → ThumbnailEffect`, la table du jeu, ENTIÈRE.

    On publie TOUTES les lignes, servies ou non : la table dit
    ce que le JEU fait, et une liste tronquée laisserait croire qu'un perso non
    servi n'a pas d'effet. C'est au rendu de savoir ce qu'il sait poser.

    Séjour PROVISOIRE. La bonne place, le jour où l'effet quitte la page de
    contrôle pour la grille publique, est un champ de `characters.json` — le
    datagen lit déjà cette table pour `showNickName` (cf. `specs/character.ts`).
    Le mettre ici évite d'ouvrir un contrat de données pour une page /dev.

    Rend None quand la table parsée MANQUE, ou ne nomme aucun effet (un parse
    raté y ressemble, un jeu qui retire toutes ses parures non) : ce n'est pas
    « personne n'a d'effet », c'est « on ne sait pas », et l'appelant garde alors
    ce que le JSON committé disait — même traitement que le `colorSpace`.
    """
    if not EXTRA_TABLE.exists():
        return None
    table = json.loads(EXTRA_TABLE.read_text(encoding='utf-8'))
    return {
        row['CharacterID']: row['ThumbnailEffect']
        for row in table['rows']
        if row.get('ThumbnailEffect')
    } or None


def prefabs_in(fx: Bundle) -> list[str]:
    """Les prefabs d'effet du bundle : ses GameObjects RACINES au nom d'effet."""
    return sorted(
        go['m_Name']
        for go in (o.read_typetree() for o in fx.objs if o.type.name == 'GameObject')
        if go.get('m_Name', '').startswith(EFFECT_PREFIX)
        and fx.component(go, 'RectTransform')
        and not fx.component(go, 'RectTransform')['m_Father']['m_PathID']
    )


def table_effects(carriers: dict[str, str], previous: dict) -> list[str]:
    """Les effets que la table NOMME, dans l'ordre où le JSON les publie.

    Ceux du JSON committé d'abord, à LEUR place, puis les nouveaux dans l'ordre de
    la table du jeu : un effet qui arrive s'ajoute en queue (effets, matériaux,
    mailles) au lieu de rebattre tout le fichier — le diff d'un patch ne montre
    que ce que le patch apporte.
    """
    named = list(dict.fromkeys(carriers.values()))
    kept = [name for name in previous.get('effects', {}) if name in named]
    return kept + [name for name in named if name not in kept]


# --- assemblage ------------------------------------------------------------------


def extract(fx: Bundle, effects: list[str], carriers: dict[str, str],
            max_size: int = DEFAULT_MAX_SIZE) -> dict:
    """La table, pour les prefabs `effects` (noms PLEINS) et les porteurs `carriers`.

    UN EFFET QUI NE SE LIT PAS N'ARRÊTE PAS LES AUTRES. Prefab absent du bundle,
    mode de dégradé inconnu, texture irrésolue, réglage que la fiche aplatirait
    (`check_flattened`), petit-enfant : l'effet est écarté EN ENTIER (ce
    qu'il avait déjà versé dans les matériaux, mailles et textures est retiré) et
    son motif publié dans `notExtracted`. Depuis que les effets ne sont plus
    choisis à la main, lever ici ferait échouer le refresh d'un patch pour une
    parure — alors que la carte, elle, sait très bien rester statique.
    """
    tex_index = texture_index(bundle_deps(FX_BUNDLE))

    mats: dict[int, dict] = {}
    meshes: dict[int, dict] = {}
    wanted_tex: dict[str, tuple[str, int]] = {}
    out_effects: dict[str, Any] = {}
    not_extracted: dict[str, str] = {}

    for name in effects:
        gos = fx.gameobjects(name)
        if not gos:
            not_extracted[name] = f'sans prefab dans le bundle {FX_BUNDLE}'
            continue
        go = gos[0]
        root_rt = fx.component(go, 'RectTransform')

        before = [set(mats), set(meshes), set(wanted_tex)]
        emitters = []
        try:
            for child in root_rt.get('m_Children', []):
                crt = fx.read(child['m_PathID'])
                cgo = fx.read(crt['m_GameObject']['m_PathID'])
                # Seuls les enfants DIRECTS sont lus : un petit-enfant serait un
                # émetteur de plus que la fiche tairait — l'effet est écarté.
                if crt.get('m_Children'):
                    raise RuntimeError(
                        f"{cgo['m_Name']} : {len(crt['m_Children'])} petit(s)-enfant(s) du "
                        'prefab, que la lecture ne descend pas'
                    )
                e = read_emitter(fx, cgo, crt, mats, meshes, tex_index, wanted_tex)
                if e:
                    emitters.append(e)
        except RuntimeError as err:
            for pool, kept in zip((mats, meshes, wanted_tex), before):
                for key in set(pool) - kept:
                    del pool[key]
            not_extracted[name] = f'extraction refusée — {err}'
            continue

        out_effects[name] = {
            # Le nœud racine ne dessine rien (émission coupée) ; seule sa POSITION
            # compte, et son `m_LocalScale` nul est de l'état d'éditeur : c'est
            # `UIParticle` qui pose l'échelle au runtime, et son `m_Scale3D` vaut 1.
            'origin': [r(root_rt['m_AnchoredPosition']['x']), r(-root_rt['m_AnchoredPosition']['y'])],
            'emitters': emitters,
        }

    tex_cache: dict[str, Bundle] = {}
    textures = {
        n: read_texture(fx, n, src, pid, tex_cache, max_size)
        for n, (src, pid) in sorted(wanted_tex.items())
    }

    return {
        'frame': {'w': 180, 'h': 344},
        'colorSpace': read_color_space(),
        'holder': read_holder(),
        'byCharacter': carriers,
        'effects': out_effects,
        'materials': {m['name']: m for m in mats.values()},
        'meshes': {m['name']: m for m in meshes.values()},
        'textures': textures,
        # `effet → motif` pour ceux qu'on a voulu sortir sans y parvenir. La clé
        # n'existe que s'il y en a : c'est l'exception, pas un champ de la table.
        **({'notExtracted': not_extracted} if not_extracted else {}),
    }


def unextracted(data: dict) -> dict[str, list[str]]:
    """`nom d'effet → CharacterID` pour les effets de `byCharacter` absents d'`effects`."""
    out: dict[str, list[str]] = {}
    for cid, name in data['byCharacter'].items():
        if name not in data['effects']:
            out.setdefault(name, []).append(cid)
    return out


def main() -> None:
    args = sys.argv[1:]
    max_size = DEFAULT_MAX_SIZE
    if '--max-size' in args:
        i = args.index('--max-size')
        if i + 1 >= len(args) or not args[i + 1].isdigit():
            sys.exit('--max-size attend un nombre de texels (0 = aucun plafond)')
        max_size = int(args[i + 1])
        del args[i:i + 2]

    fx = Bundle(FX_BUNDLE)
    previous = previous_table()
    carriers = by_character()
    if carriers is None:
        # P8 de l'audit : sans la table parsée, on réécrivait `byCharacter` à
        # vide et plus aucun perso n'avait d'effet. On garde ce qui est committé.
        carriers = previous.get('byCharacter') or {}
        print(f'  ! {EXTRA_TABLE.name} absente ou sans effet — porteurs et liste '
              f"d'effets conservés du JSON committé ({len(carriers)} ligne(s))")
        named = list(previous.get('effects', {}))
    else:
        named = table_effects(carriers, previous)

    if args == ['--all']:
        effects = prefabs_in(fx)
    elif args:
        effects = [f'{EFFECT_PREFIX}{suffix}' for suffix in args]
    else:
        effects = named
        # Rien à sortir alors que personne n'a restreint la passe : la table et le
        # JSON committé manquent tous deux, ou le bundle n'a plus aucun des
        # prefabs nommés. Écrire quand même publierait une table vide.
        if not any(fx.gameobjects(name) for name in effects):
            sys.exit(f'Aucun effet à extraire ({len(effects)} nommé(s), aucun dans '
                     f'{FX_BUNDLE}) — {OUT_JSON.name} laissé tel quel')

    data = extract(fx, effects, carriers, max_size)
    OUT_JSON.parent.mkdir(parents=True, exist_ok=True)
    # Même discipline d'écriture que `extract-face-layout.py` : LF et saut final,
    # sinon un diff de plusieurs milliers de lignes réapparaît à chaque patch sans
    # qu'une valeur ait bougé.
    OUT_JSON.write_text(json.dumps(data, indent=2, ensure_ascii=False) + '\n',
                        encoding='utf-8', newline='\n')
    print(
        f'{len(data["effects"])} effet(s) · {len(data["materials"])} matériaux · '
        f'{len(data["meshes"])} mailles · {len(data["textures"])} textures → {OUT_JSON.name}'
    )
    for n, t in data['textures'].items():
        game = t.get('gameSize')
        print(f'  {n}.png' + (f'  {game[0]}×{game[1]} → {t["w"]}×{t["h"]}' if game else ''))
    for name in data['effects']:
        if name not in previous.get('effects', {}):
            print(f'  + {name} : nouvel effet extrait')
    # Un effet que la table NOMME (`byCharacter`, relevé entier) sans que cette
    # passe l'ait sorti : la carte de ses porteurs reste un portrait statique, et
    # rien ne le dit à l'écran. C'est dit ici, et redit avec le verdict du moteur
    # par `portrait-fx-report.ts`, le pas suivant du refresh.
    refused = data.get('notExtracted', {})
    missing = unextracted(data)
    for name, ids in sorted(missing.items()):
        why = refused.get(name, 'hors de cette passe (effets nommés en argument)')
        print(f'  ! {name} : nommé par le jeu ({", ".join(ids)}) mais pas extrait — {why}')
    for name, why in sorted(refused.items()):
        if name not in missing:
            print(f'  ! {name} : demandé mais pas extrait — {why}')


if __name__ == '__main__':
    if not MANIFEST.exists():
        sys.exit(f'Manifeste de bundles introuvable : {MANIFEST}')
    main()