"""
EXTRACTION DE L'EFFET ANIMÉ DU PORTRAIT — la couche que `Portrait` ne pose pas.

Le portrait du jeu (`CharacterThumbnailList`, cf. `src/components/character/Portrait.tsx`)
porte un nœud que la transcription statique ignore : `FX_Holder`, soit
`CUICharacterThumbnail.m_EffectHolder`. `SetEffect` (RVA 0x27F74A4) y détruit les
enfants existants, demande à `CTempletManager.GetCharacterCardEffectByID(id)` un NOM
d'effet, puis `CResourceManager.LoadAsset<GameObject>` + `Instantiate` sous le holder.
Rien d'autre : pas de paramètre, pas de variante. Le nom vient de
`CharacterExtraTemplet.ThumbnailEffect` — 25 persos sur 124 en ont un.

Les prefabs correspondants vivent dans le bundle `prefabs/character/ui_effect` : dix,
dont quatre partagés (`_Demi`, `_Dungeon`, `_Seasonal`, `_Synchro` que pose
`SetSynchroEffect`) et six sur mesure.

CE QU'ILS CONTIENNENT, ET CE QUI SURPREND. Aucun `AnimationClip`, aucun `Animator` :
47 `ParticleSystem`, en deux familles.

  1. LES CALQUES DE CADRE (`inner`, `out`, `web`, `inner_2`) n'émettent QU'UNE
     particule, en `m_RenderMode = Mesh` sur une maille dédiée. Leur `looping` est
     FAUX et leur durée de vie vaut `lengthInSec` : on croirait un one-shot de 1,5 s.
     C'est `ringBufferMode = 2` (LoopUntilReplaced) qui tranche — la particule ne
     meurt jamais, son âge reboucle. Le mouvement ne vient donc PAS du système : il
     vient du shader, qui fait défiler les UV sur `_Time`.

  2. LES ÉMETTEURS DÉCORATIFS (`star`, `atlas`, `bubble`) sont, eux, de vraies
     particules — 2 à 10 par seconde, forme BoxShell, courbes de taille et de couleur
     sur la vie, feuille UV. `_Demi` n'en a aucun : c'est pourquoi il vient en premier.

LE SHADER EST UNIQUE pour les 22 matériaux : `MASTA/S_Assemble_Particle_UI`
(bundle `shader/common`). Son GLSL ES 3.0 compilé est lisible dans le bundle, et la
transcription web le rejoue à l'identique — cf. `src/components/character/portrait-fx-gl.ts`,
qui porte la formule ligne à ligne. Ce script-ci n'extrait donc QUE ses ENTRÉES :
textures, mailles, et les paramètres de chaque matériau.

SORTIES
  - `datagen/assets/portrait-fx.json` — la table (émetteurs, matériaux, mailles).
  - les textures en PNG dans le pool d'images du jeu
    (`.gamedata/extracted/images/…/ui_effect/`), d'où `manifest.ts` les demande.

POURQUOI DU PNG ET PAS DU WEBP. C'est la seule famille d'assets du site qui reste en
PNG jusqu'au bucket, et ce n'est pas un oubli : le shader multiplie trois échantillons
puis amplifie par `_MainStrength`, qui vaut 70 sur `M_FX_UI_Char_out_Demi`. Une erreur
de quantification de 1/255 par texture ressort à ~0,27 à l'écran — soit du banding
franc sur un dégradé. La clé du manifest porte donc `.png`, ce qui suffit à
`stage.ts` pour rester sans perte.

Usage :
    python extract-portrait-fx.py              # les effets par défaut (cf. DEFAULT_EFFECTS)
    python extract-portrait-fx.py Demi Synchro # d'autres, par suffixe de nom
    python extract-portrait-fx.py --all        # les dix
"""

from __future__ import annotations

import json
import sys
from pathlib import Path
from typing import Any

import UnityPy
from UnityPy.helpers.MeshHelper import MeshHandler

ROOT = Path(__file__).resolve().parents[2]
BUNDLES_DIR = ROOT / '.gamedata' / 'files' / 'bundles'
MANIFEST = BUNDLES_DIR / 'manifest.dat'
EXTRA_TABLE = ROOT / '.gamedata' / 'parsed' / 'CharacterExtraTemplet.json'
OUT_JSON = ROOT / 'datagen' / 'assets' / 'portrait-fx.json'
# Le pool que `buildImageIndex` (assets/source.ts) balaye. On reproduit le
# rangement par container d'AssetStudio (`-g containerFull`) : l'index n'indexe
# que le basename, mais le chemin dit d'où vient le fichier.
OUT_TEX = (
    ROOT
    / '.gamedata'
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

#: Les effets rendus par le site. Élargir cette liste est le SEUL geste à faire
#: pour en servir un de plus — le reste du script est data-driven.
DEFAULT_EFFECTS = ['Demi', 'Dungeon', 'Seasonal']


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


def read_color_space() -> str:
    """`ColorSpace` du projet, lu dans `globalgamemanagers` de l'APK.

    C'EST LA VALEUR QUI DÉCIDE DE TOUT L'ÉTALONNAGE, et elle ne se lit nulle part
    ailleurs : ni les prefabs, ni les matériaux, ni les bundles ne la portent.
    En `linear`, le GPU linéarise les textures marquées sRGB à l'échantillonnage
    et le mélange additif se fait en lumière linéaire ; en `gamma`, rien n'est
    converti. L'écart n'est pas cosmétique — `_MainStrength` vaut 70 sur le
    liseré, et supposer `gamma` blanchit la carte entière.

    Absente (APK non tiré) : on rend `unknown` plutôt qu'un défaut arbitraire, et
    c'est au rendu de refuser — se tromper d'espace ne se voit pas « un peu ».
    """
    apks = sorted((ROOT / '.gamedata' / 'apk').glob('*/com.smilegate.*.apk'))
    if not apks:
        print('  ! APK introuvable — colorSpace non résolu')
        return 'unknown'
    import zipfile

    with zipfile.ZipFile(apks[0]) as z:
        blob = z.read('assets/bin/Data/globalgamemanagers')
    tmp = ROOT / '.gamedata' / 'apk' / 'globalgamemanagers'
    tmp.write_bytes(blob)
    env = UnityPy.load(str(tmp))
    for o in env.objects:
        if o.type.name != 'PlayerSettings':
            continue
        # UnityEngine.ColorSpace : Gamma = 0, Linear = 1.
        return 'linear' if o.read_typetree().get('m_ActiveColorSpace') == 1 else 'gamma'
    return 'unknown'


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


def read_texture(fx: Bundle, name: str, src: str, pid: int, cache: dict) -> dict:
    """Écrit le PNG dans le pool d'images et renvoie sa fiche (taille, wrap, filtre).

    Le mode de répétition compte autant que les pixels : tout le mouvement de ces
    calques est un défilement d'UV hors de [0,1]. Un `wrap` mal repris fige l'effet.
    """
    b = fx if pid in fx.by_pid else cache.setdefault(src, Bundle(src))
    tex = b.by_pid[pid].read()
    OUT_TEX.mkdir(parents=True, exist_ok=True)
    dest = OUT_TEX / f'{name}.png'
    tex.image.save(dest)
    tt = b.read(pid)
    st = tt.get('m_TextureSettings', {})
    return {
        'w': tex.m_Width,
        'h': tex.m_Height,
        # 0 = Repeat, 1 = Clamp, 2 = Mirror (UnityEngine.TextureWrapMode).
        'wrapU': st.get('m_WrapU'),
        'wrapV': st.get('m_WrapV'),
        # 0 = Point, 1 = Bilinear, 2 = Trilinear.
        'filter': st.get('m_FilterMode'),
        # 1 = AUCUN mip. Cinq des huit textures de `_Demi` sont dans ce cas, et ça
        # se voit : minifier un bruit de 512 à travers une chaîne de mips que le
        # jeu n'a pas le lisse jusqu'à le faire disparaître.
        'mips': tt.get('m_MipCount'),
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
    """
    return {
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
    """`MinMaxGradient` : 0 = couleur, 1 = dégradé, 2 = deux couleurs, 3 = deux dégradés."""
    mode = m['minMaxState']
    out: dict[str, Any] = {'mode': mode}
    if mode in (0, 2):
        out['max'] = [r(m['maxColor'][k]) for k in 'rgba']
    if mode == 2:
        out['min'] = [r(m['minColor'][k]) for k in 'rgba']
    if mode in (1, 3):
        out['maxGradient'] = gradient(m['maxGradient'])
    if mode == 3:
        out['minGradient'] = gradient(m['minGradient'])
    return out


def read_emitter(fx: Bundle, go: dict, rt: dict, mats: dict, meshes: dict,
                 tex_index: dict, wanted_tex: dict) -> dict | None:
    """Un nœud de l'effet, avec ce que son `ParticleSystem` a d'ACTIF.

    Renvoie None pour un nœud qui n'émet rien (le nœud RACINE des dix prefabs a son
    `EmissionModule` coupé : il ne sert que de porteur au `UIParticle`).
    """
    ps = fx.component(go, 'ParticleSystem')
    psr = fx.component(go, 'ParticleSystemRenderer')
    if not ps or not ps['EmissionModule']['enabled']:
        return None

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


def by_character() -> dict[str, str]:
    """`CharacterID → ThumbnailEffect`, la table du jeu, ENTIÈRE.

    On publie les 25 lignes même quand on n'en rend qu'une poignée : la table dit
    ce que le JEU fait, et une liste tronquée laisserait croire qu'un perso non
    servi n'a pas d'effet. C'est au rendu de savoir ce qu'il sait poser.

    Séjour PROVISOIRE. La bonne place, le jour où l'effet quitte la page de
    contrôle pour la grille publique, est un champ de `characters.json` — le
    datagen lit déjà cette table pour `showNickName` (cf. `specs/character.ts`).
    Le mettre ici évite d'ouvrir un contrat de données pour une page /dev.
    """
    if not EXTRA_TABLE.exists():
        return {}
    table = json.loads(EXTRA_TABLE.read_text(encoding='utf-8'))
    return {
        row['CharacterID']: row['ThumbnailEffect']
        for row in table['rows']
        if row.get('ThumbnailEffect')
    }


# --- assemblage ------------------------------------------------------------------


def extract(effects: list[str]) -> dict:
    fx = Bundle(FX_BUNDLE)
    tex_index = texture_index(bundle_deps(FX_BUNDLE))

    mats: dict[int, dict] = {}
    meshes: dict[int, dict] = {}
    wanted_tex: dict[str, tuple[str, int]] = {}
    out_effects: dict[str, Any] = {}

    for suffix in effects:
        name = f'{EFFECT_PREFIX}{suffix}'
        gos = fx.gameobjects(name)
        if not gos:
            raise RuntimeError(f'effet « {name} » absent du bundle {FX_BUNDLE}')
        go = gos[0]
        root_rt = fx.component(go, 'RectTransform')

        emitters = []
        for child in root_rt.get('m_Children', []):
            crt = fx.read(child['m_PathID'])
            cgo = fx.read(crt['m_GameObject']['m_PathID'])
            e = read_emitter(fx, cgo, crt, mats, meshes, tex_index, wanted_tex)
            if e:
                emitters.append(e)

        out_effects[name] = {
            # Le nœud racine ne dessine rien (émission coupée) ; seule sa POSITION
            # compte, et son `m_LocalScale` nul est de l'état d'éditeur : c'est
            # `UIParticle` qui pose l'échelle au runtime, et son `m_Scale3D` vaut 1.
            'origin': [r(root_rt['m_AnchoredPosition']['x']), r(-root_rt['m_AnchoredPosition']['y'])],
            'emitters': emitters,
        }

    tex_cache: dict[str, Bundle] = {}
    textures = {
        n: read_texture(fx, n, src, pid, tex_cache) for n, (src, pid) in sorted(wanted_tex.items())
    }

    return {
        'frame': {'w': 180, 'h': 344},
        'colorSpace': read_color_space(),
        'holder': read_holder(),
        'byCharacter': by_character(),
        'effects': out_effects,
        'materials': {m['name']: m for m in mats.values()},
        'meshes': {m['name']: m for m in meshes.values()},
        'textures': textures,
    }


def main() -> None:
    args = sys.argv[1:]
    if args == ['--all']:
        fx = Bundle(FX_BUNDLE)
        effects = sorted(
            go['m_Name'][len(EFFECT_PREFIX):]
            for go in (o.read_typetree() for o in fx.objs if o.type.name == 'GameObject')
            if go.get('m_Name', '').startswith(EFFECT_PREFIX)
            and fx.component(go, 'RectTransform')
            and not fx.component(go, 'RectTransform')['m_Father']['m_PathID']
        )
    else:
        effects = args or DEFAULT_EFFECTS

    data = extract(effects)
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
    for n in data['textures']:
        print(f'  {n}.png')


if __name__ == '__main__':
    if not MANIFEST.exists():
        sys.exit(f'Manifeste de bundles introuvable : {MANIFEST}')
    main()