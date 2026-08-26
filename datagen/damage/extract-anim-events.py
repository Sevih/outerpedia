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
dans l'ordre (« Skill2,Skill2_2 » = deux clips successifs), et le controller
compilé (`AC_<charId>`) résout trigger → état → clip : les conditions des
transitions portent le hash du paramètre, `m_TOS` les décode, l'état pointe
ses clips par index dans `m_AnimationClips`.

Sortie (JSON committé, lu par datagen/damage/clips.ts) :
{
  "<charId>": {                      # <charId> tiré du nom AC_<charId>
    "clips":    { "<clipName>": ["<data>", ...] },   # data BRUT, ordre du temps
    "triggers": { "<trigger>": ["<clipName>", ...] } # clips de l'état destination
  }
}
Le champ `data` d'un EventAttackStart vaut `<templetId>,<param>` (le param —
34.142, 45, 200… — n'est pas un facteur : les sommes tombent juste sans lui ;
non élucidé, conservé brut). Les events `Skip_Finish_<Élément> ,0` sont les
templets génériques des états SKIP — conservés aussi. Un trigger listé sur
PLUSIEURS transitions vers des états différents garde tous les clips (le
générateur tranche ou marque l'ambiguïté).

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

import UnityPy

ROOT = Path(__file__).resolve().parents[2]
# Racine de l'aire de travail — `GAMEDATA_ROOT` (cf. datagen/lib/paths.ts),
# `.gamedata` sinon. Relative → depuis la racine du repo.
GAMEDATA = ROOT / os.environ.get('GAMEDATA_ROOT', '.gamedata')
MANIFEST = GAMEDATA / 'files' / 'bundles' / 'manifest.dat'
BUNDLES_DIR = GAMEDATA / 'files' / 'bundles'
OUT = ROOT / 'datagen' / 'damage' / 'anim-events.json'

PC_PREFIX = 'character/pc/'
AC_NAME = re.compile(r'^AC_(\d+)$')  # controller de COMBAT (pas _Intro/_Lobby)


def clip_events(tree: dict) -> list[str]:
    events = [e for e in (tree.get('m_Events') or []) if e.get('functionName') == 'EventAttackStart']
    events.sort(key=lambda e: e['time'])
    return [e.get('data', '') for e in events]


def controller_triggers(tree: dict, clip_name_by_pid: dict[int, str]) -> dict[str, list[str]]:
    """trigger -> clips de l'état destination, depuis le controller COMPILÉ."""
    tos = {t[0]: t[1] for t in tree.get('m_TOS', [])}
    clip_by_index = [clip_name_by_pid.get(p.get('m_PathID'), '') for p in tree.get('m_AnimationClips', [])]
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

        def record(transition: dict) -> None:
            t = transition.get('data', transition)
            clips = clips_of_state(t.get('m_DestinationState', -1))
            if not clips:
                return
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


def extract() -> dict[str, dict]:
    manifest = json.loads(MANIFEST.read_text(encoding='utf-8'))
    infos = [b for b in manifest['bundleInfos'] if b.get('name', '').startswith(PC_PREFIX)]
    out: dict[str, dict] = {}
    for idx, info in enumerate(infos):
        path = BUNDLES_DIR / info['filename']
        if not path.exists():
            raise FileNotFoundError(f'Bundle {info["name"]} absent du disque : {path}')
        env = UnityPy.load(str(path))
        clip_name_by_pid: dict[int, str] = {}
        clip_trees: list[dict] = []
        controllers: list[dict] = []
        for obj in env.objects:
            if obj.type.name == 'AnimationClip':
                tree = obj.read_typetree()
                clip_name_by_pid[obj.path_id] = tree.get('m_Name', '')
                clip_trees.append(tree)
            elif obj.type.name == 'AnimatorController':
                controllers.append(obj.read_typetree())
        clips = {
            t['m_Name']: ev for t in clip_trees if (ev := clip_events(t)) and t.get('m_Name')
        }
        # Un bundle peut héberger PLUSIEURS personnages (variantes 27xxxxx dans
        # le bundle de base) : une entrée par controller de combat AC_<id>.
        for ctrl in controllers:
            m = AC_NAME.match(ctrl.get('m_Name', ''))
            if not m:
                continue
            char_id = m.group(1)
            triggers = controller_triggers(ctrl, clip_name_by_pid)
            entry = out.setdefault(char_id, {'clips': {}, 'triggers': {}})
            referenced = {c for cl in triggers.values() for c in cl}
            entry['clips'].update(
                {name: ev for name, ev in clips.items() if name in referenced}
            )
            for trig, cl in triggers.items():
                merged = set(entry['triggers'].get(trig, [])) | set(cl)
                entry['triggers'][trig] = sorted(merged)
        print(f'{idx + 1}/{len(infos)} {info["name"]}: {len(clips)} clips a events', flush=True)
    for entry in out.values():
        entry['clips'] = dict(sorted(entry['clips'].items()))
        entry['triggers'] = dict(sorted(entry['triggers'].items()))
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
