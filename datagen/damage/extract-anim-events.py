"""Extrait, pour chaque personnage jouable : les EventAttackStart des clips
d'animation ET le mapping trigger -> clips de son AnimatorController.

Pourquoi : le facteur total d'un skill (§ 8.1 de docs/specs/damage-formula.md)
n'est PAS la somme des tables de hits — le binaire scanne les AnimationEvents
du clip d'attaque courant (`SkillRecord.ReceiveMaxDamage == 0` → scan du clip,
un `ReceiveMaxDamage` PAR CLIP). Les tables ignorent le découpage en clips,
les rejeux d'un même templet dans un clip (S1 de Caren : hit 300 ‰ joué deux
fois) et les skills joués en plusieurs clips (S2 de Francesca : 700 ‰ + 300 ‰).

La liaison skill → clips est elle aussi de la DONNÉE, pas une convention :
`CharacterSkillTemplet.TriggerName` liste les triggers d'animator du skill
(« Skill2,Skill2_2 » = deux VARIANTES choisies par index au lancer, pas deux
clips successifs : docs/specs/damage-clips-joues.md § 1.1), et le controller
compilé (`AC_<charId>`) résout trigger → état → clip : les conditions des
transitions portent le hash du paramètre, `m_TOS` les décode, l'état pointe
ses clips par index dans `m_AnimationClips`.

Clips hors bundle : un fusionné (`character/pc/2700005`…) ne porte que ses
controllers ; ses clips vivent dans le bundle de base, déclaré dans les
`dependencies` du manifeste, et le controller les pointe par `m_FileID ≥ 1`.
Les dépendances `character/` sont chargées avec le bundle et chaque PPtr
est résolu par son fichier sérialisé ; un clip irrésolu d'un `AC_<id>` lève
(avant le 19/10/2026, ces triggers étaient écartés en silence).

États d'approche : un trigger qui mène à un état sans clip à EventAttackStart
(`Skill_2_App`, clip `*_Battle_Approach`) suit ses transitions SANS condition,
au plus 2 sauts, jusqu'au premier état qui en a un ; plusieurs candidats au
même saut → rien n'est retenu.

Sortie (JSON committé, lu par datagen/damage/clips.ts) :
{
  "<charId>": {                      # <charId> tiré du nom AC_<charId>
    "clips":    { "<clipName>": ["<data>", ...] },   # data BRUT, ordre du temps
    "triggers": { "<trigger>": ["<clipName>", ...] },# clips de l'état destination
    "additive": { "<clipName>": [{"time": 1.234, "after": 2}, ...] }
  }
}
Le champ `data` d'un EventAttackStart vaut `<templetId>,<param>` (le param —
34.142, 45, 200… — n'est pas un facteur : c'est la rotation du hit, lue en
`fHitRotation` par `CCharacter.EventAttackStart`, spec § 1.3 ; conservé brut).
Les events `Skip_Finish_<Élément> ,0` sont les templets génériques des états
SKIP — conservés aussi. Un trigger listé sur PLUSIEURS transitions vers des
états différents garde tous les clips (le générateur tranche ou marque
l'ambiguïté).
`additive` (absent si aucun) : les `EventAdditiveAttack` des clips du
controller (spec § 1.2 — l'event qui enchaîne le trigger d'index 1 sous
`BT_ADDITIVE_ATTACK_ON_EVENT`) ; `time` en secondes (3 décimales), `after` =
nombre d'EventAttackStart du clip STRICTEMENT avant cet instant.

Même famille que les scripts UnityPy de datagen/assets (exception assumée du
« tout-TS », cf. datagen/README.md) : local, jamais dans le build/CI, borné à
un JSON committé. Machine de datamine uniquement (.gamedata peuplé).

Usage : python datagen/damage/extract-anim-events.py
"""

from __future__ import annotations

import json
import os
import re
import sys
from pathlib import Path
from typing import Callable

import UnityPy

ROOT = Path(__file__).resolve().parents[2]
# Racine de l'aire de travail — `GAMEDATA_ROOT` (cf. datagen/lib/paths.ts),
# `.gamedata` sinon. Relative → depuis la racine du repo.
GAMEDATA = ROOT / os.environ.get('GAMEDATA_ROOT', '.gamedata')
MANIFEST = GAMEDATA / 'files' / 'bundles' / 'manifest.dat'
BUNDLES_DIR = GAMEDATA / 'files' / 'bundles'
OUT = ROOT / 'datagen' / 'damage' / 'anim-events.json'

PC_PREFIX = 'character/pc/'
DEP_PREFIX = 'character/'  # dépendances qui peuvent porter des clips
AC_NAME = re.compile(r'^AC_(\d+)$')  # controller de COMBAT (pas _Intro/_Lobby)


def attack_events(tree: dict) -> list[dict]:
    events = [e for e in (tree.get('m_Events') or []) if e.get('functionName') == 'EventAttackStart']
    events.sort(key=lambda e: e['time'])
    return events


def clip_events(tree: dict) -> list[str]:
    return [e.get('data', '') for e in attack_events(tree)]


def clip_additive(tree: dict) -> list[dict]:
    """EventAdditiveAttack du clip : instant et nombre d'EventAttackStart avant lui."""
    starts = [e['time'] for e in attack_events(tree)]
    adds = sorted(
        e['time'] for e in (tree.get('m_Events') or []) if e.get('functionName') == 'EventAdditiveAttack'
    )
    return [{'time': round(t, 3), 'after': sum(1 for s in starts if s < t)} for t in adds]


def controller_triggers(
    tree: dict, clip_by_index: list[str], has_events: Callable[[str], bool]
) -> dict[str, list[str]]:
    """trigger -> clips de l'état destination, depuis le controller COMPILÉ."""
    tos = {t[0]: t[1] for t in tree.get('m_TOS', [])}
    out: dict[str, set[str]] = {}
    for sm_w in tree.get('m_Controller', {}).get('m_StateMachineArray', []):
        sm = sm_w.get('data', sm_w)
        states = [s.get('data', s) for s in sm.get('m_StateConstantArray', [])]

        def clips_of_state(i: int) -> list[str]:
            if not (0 <= i < len(states)):
                return []  # sélecteurs (≥ 30000) : entrées de sous-machines, pas des états de skill
            found: list[str] = []
            for bt in states[i].get('m_BlendTreeConstantArray', []):
                for node in bt.get('data', bt).get('m_NodeArray', []):
                    cid = node.get('data', node).get('m_ClipID')
                    if cid is not None and 0 <= cid < len(clip_by_index) and clip_by_index[cid]:
                        found.append(clip_by_index[cid])
            return found

        def unconditional_next(i: int) -> list[int]:
            """États réels atteints par les transitions SANS condition de l'état i."""
            nxt: list[int] = []
            for tr in states[i].get('m_TransitionConstantArray', []):
                t = tr.get('data', tr)
                dest = t.get('m_DestinationState', -1)
                if not t.get('m_ConditionConstantArray') and 0 <= dest < len(states) and dest not in nxt:
                    nxt.append(dest)
            return nxt

        def approach_clips(i: int) -> list[str]:
            """État sans clip à events (approche) : clips du premier état à events
            atteint sans condition, au plus 2 sauts ; vide si ambigu ou introuvable."""
            frontier, seen = [i], {i}
            for _ in range(2):
                frontier = [n for s in frontier for n in unconditional_next(s) if n not in seen]
                seen.update(frontier)
                hits = [n for n in dict.fromkeys(frontier) if any(map(has_events, clips_of_state(n)))]
                if len(hits) == 1:
                    return clips_of_state(hits[0])
                if hits:
                    return []
            return []

        def record(transition: dict) -> None:
            t = transition.get('data', transition)
            dest = t.get('m_DestinationState', -1)
            clips = clips_of_state(dest)
            if not clips:
                return
            if not any(map(has_events, clips)):
                clips = clips + approach_clips(dest)
            for c in t.get('m_ConditionConstantArray', []):
                cd = c.get('data', c)
                param = tos.get(cd.get('m_EventID'))
                if not param:
                    continue
                out.setdefault(param, set()).update(clips)

        for t in sm.get('m_AnyStateTransitionConstantArray', []):
            record(t)
        for s in states:
            for t in s.get('m_TransitionConstantArray', []):
                record(t)
    return {k: sorted(v) for k, v in sorted(out.items())}


def external_key(assets_file, file_id: int) -> str:
    """Nom (minuscule) du fichier sérialisé visé par un PPtr — même nettoyage
    que `UnityPy.classes.PPtr.deref` : 0 = le fichier lui-même, sinon
    `externals[m_FileID - 1]`."""
    if file_id == 0:
        return assets_file.name.lower()
    if not (0 < file_id <= len(assets_file.externals)):
        return ''
    path = assets_file.externals[file_id - 1].path
    path = path.removeprefix('archive:/').removeprefix('assets/')
    return path.rsplit('/')[-1].lower()


def extract() -> dict[str, dict]:
    manifest = json.loads(MANIFEST.read_text(encoding='utf-8'))
    by_name = {b.get('name', ''): b for b in manifest['bundleInfos']}
    infos = [b for name, b in by_name.items() if name.startswith(PC_PREFIX)]
    out: dict[str, dict] = {}
    # Un bundle du manifeste que le client n'a pas encore livré (perso annoncé,
    # pas encore sorti : Demiurge Lambda 2000124 le jour du patch du 06/10/2026)
    # n'arrête pas l'extraction — comme pour les images (bundle-manifest.ts).
    # Le perso n'a alors pas d'événements : il n'est pas intégré non plus.
    unshipped: list[str] = []
    for idx, info in enumerate(infos):
        path = BUNDLES_DIR / info['filename']
        if not path.exists():
            unshipped.append(info['name'])
            continue
        # Dépendances `character/` chargées dans le même Environment : les
        # clips d'un fusionné vivent dans le bundle de base (cf. l'en-tête), et
        # AC_2000052 pointe `4004002_Battle_Run` dans `character/monster/4004002`.
        deps = [
            BUNDLES_DIR / by_name[d]['filename']
            for d in info.get('dependencies') or []
            if d.startswith(DEP_PREFIX) and d in by_name
        ]
        env = UnityPy.load(str(path), *(str(d) for d in deps if d.exists()))
        main = next(f for k, f in env.files.items() if Path(k).name == info['filename'])
        clip_objs: dict[tuple[str, int], object] = {}
        controllers: list[object] = []
        for obj in env.objects:
            if obj.type.name == 'AnimationClip':
                clip_objs[(obj.assets_file.name.lower(), obj.path_id)] = obj
            elif obj.type.name == 'AnimatorController' and obj.assets_file.parent is main:
                controllers.append(obj)
        clip_trees: dict[tuple[str, int], dict] = {}

        def clip_tree(key: tuple[str, int]) -> dict:
            if key not in clip_trees:
                clip_trees[key] = clip_objs[key].read_typetree()
            return clip_trees[key]

        n_clips = 0
        # Un bundle peut héberger PLUSIEURS personnages (variantes 27xxxxx dans
        # le bundle de base) : une entrée par controller de combat AC_<id>.
        for obj in controllers:
            ctrl = obj.read_typetree()
            m = AC_NAME.match(ctrl.get('m_Name', ''))
            if not m:
                continue
            char_id = m.group(1)
            keys = [
                (external_key(obj.assets_file, p.get('m_FileID', 0)), p.get('m_PathID'))
                for p in ctrl.get('m_AnimationClips', [])
            ]
            missing = [k for k in keys if k not in clip_objs]
            if missing:
                raise RuntimeError(
                    f'{ctrl["m_Name"]} ({info["name"]}) : {len(missing)}/{len(keys)} clip(s) '
                    f'irrésolu(s) — dépendance absente du manifeste ou non livrée ?'
                )
            trees = [clip_tree(k) for k in keys]
            names = [t.get('m_Name', '') for t in trees]
            events = {t['m_Name']: ev for t in trees if t.get('m_Name') and (ev := clip_events(t))}
            additive = {t['m_Name']: ad for t in trees if t.get('m_Name') and (ad := clip_additive(t))}
            triggers = controller_triggers(ctrl, names, lambda n: n in events)
            entry = out.setdefault(char_id, {'clips': {}, 'triggers': {}})
            referenced = {c for cl in triggers.values() for c in cl}
            entry['clips'].update({name: ev for name, ev in events.items() if name in referenced})
            kept = {name: ad for name, ad in additive.items() if name in referenced}
            if kept:
                entry.setdefault('additive', {}).update(kept)
            for trig, cl in triggers.items():
                merged = set(entry['triggers'].get(trig, [])) | set(cl)
                entry['triggers'][trig] = sorted(merged)
            n_clips += len(events)
        print(f'{idx + 1}/{len(infos)} {info["name"]}: {n_clips} clips a events', flush=True)
    for entry in out.values():
        entry['clips'] = dict(sorted(entry['clips'].items()))
        entry['triggers'] = dict(sorted(entry['triggers'].items()))
        if 'additive' in entry:
            entry['additive'] = dict(sorted(entry['additive'].items()))
    if unshipped:
        print(
            f'⚠ {len(unshipped)} bundle(s) du manifeste non livré(s) par ce client, '
            f'sans événements : {", ".join(unshipped)}',
            file=sys.stderr,
            flush=True,
        )
    return dict(sorted(out.items()))


def save(data: dict[str, dict]) -> None:
    # Format stable (LF + saut de ligne final) — même précaution que les autres
    # extracteurs UnityPy : un diff ne doit apparaître que si la donnée bouge.
    OUT.write_text(json.dumps(data, indent=1) + '\n', encoding='utf-8', newline='\n')


def main() -> None:
    if not MANIFEST.exists():
        sys.exit(f'Bundle manifest introuvable : {MANIFEST} (machine de datamine uniquement)')
    data = extract()
    save(data)
    n_clips = sum(len(v['clips']) for v in data.values())
    n_trig = sum(len(v['triggers']) for v in data.values())
    print(f'OK — {len(data)} personnages, {n_clips} clips a events, {n_trig} triggers → {OUT}')


if __name__ == '__main__':
    main()
