/**
 * LES MODES DE JEU, tels que le damage calc du site les liste — pour le picker
 * de Monstres de quick, qui filtre par mode « comme le damage calc ».
 *
 * Le damage calc compose sa liste en trois endroits de
 * `src/app/[lang]/tools/_contents/damage-calculator/` — `index.tsx` (le
 * parcours des donjons et le libellé de chaque cible), `DamageCalculatorBrowser`
 * (les libellés distincts, dans l'ordre de première apparition) et
 * `TargetPicker` (les quatre modes story repliés en deux familles, en tête). Il
 * garde cette logique ; ce module la REDIT d'un bloc, sur la donnée seule. Les
 * deux doivent rester alignés : qui touche à l'un relit l'autre.
 *
 * Ce qui s'y lit :
 *   - le parcours : `encounters.json` par id de donjon, les donjons PEUPLÉS,
 *     hors `EXCLUDED_MODES` et hors `retired` ;
 *   - les familles : `normal` / `normal_hard` → « Story », `origin` /
 *     `origin_hard` → « Origin Story » (`storyFamilyOf`), toujours en tête et
 *     dans cet ordre ; `raid_1` / `raid_2` → « Special Request », à sa place ;
 *   - la fusion : les slugs qui portent le même libellé font UN groupe
 *     (`tower`, `tower_hard`, `tower_very_hard` → « Skyward Tower ») ;
 *   - les libellés : ceux du jeu (glossaires `modeFamilies` et `modes`).
 *
 * Un écart assumé : le damage calc ne liste que les modes dont un donjon porte
 * une cible (un BOSS, hors histoire) ; ici un donjon peuplé suffit — le picker
 * range des monstres, pas des cibles.
 */
import type { DungeonRef, Glossaries } from '@contracts';
import { toSlug } from '@datagen/lib/slug';
import { storyFamilyOf } from '@/lib/data/encounters';
import { getGlossaries } from '@/lib/data/glossaries';
import type { Lang } from '@/lib/i18n/config';
import { lRec } from '@/lib/i18n/localize';

/** Un groupe de modes : une entrée de la liste du damage calc. */
export interface GameModeGroup {
  /** Stable, jamais localisée : `story`, `origin`, sinon le libellé ANGLAIS en slug (`skyward-tower`). */
  key: string;
  /** Le titre du jeu, dans la langue demandée. */
  label: string;
  /** Les slugs de mode qu'il replie, dans l'ordre de leur première apparition. */
  slugs: string[];
}

/** Ce qu'on lit d'un donjon. */
type ModeDungeon = Pick<DungeonRef, 'mode' | 'monsters' | 'retired'>;

/** Les modes que le damage calc écarte (son `EXCLUDED_MODES` : les skirmish du Monad Gate). */
const EXCLUDED_MODES = new Set(['monad_battle_1']);

/** Les slugs que le jeu range sous un titre de menu commun, hors histoire. */
const FAMILY_OF: Record<string, string> = { raid_1: 'special_request', raid_2: 'special_request' };

/** Les deux familles story, dans l'ordre où le damage calc les pose en tête. */
const STORY_KEYS = ['story', 'origin'];

/**
 * Les groupes de modes d'`encounters`, dans l'ordre du damage calc. `gloss` :
 * les glossaires où lire les titres — ceux du site d'office.
 */
export function gameModeGroups(
  encounters: Record<string, ModeDungeon>,
  lang: Lang,
  gloss: Pick<Glossaries, 'modes' | 'modeFamilies'> = getGlossaries(),
): GameModeGroup[] {
  /** Le titre d'un mode, et sa clé : sa famille s'il en a une, sinon lui-même. */
  const titleOf = (mode: string): { key: string; label: string } => {
    const story = storyFamilyOf(mode)?.family;
    const family = story ?? FAMILY_OF[mode];
    const rec = (family && gloss.modeFamilies?.[family]) || gloss.modes?.[mode];
    const en = rec?.en || family || mode;
    return { key: story ?? toSlug(en), label: (rec && lRec(rec, lang)) || en };
  };

  const groups = new Map<string, GameModeGroup>();
  for (const d of Object.values(encounters)) {
    if (!d.monsters?.length || EXCLUDED_MODES.has(d.mode) || d.retired) continue;
    const { key, label } = titleOf(d.mode);
    const group = groups.get(key);
    if (!group) groups.set(key, { key, label, slugs: [d.mode] });
    else if (!group.slugs.includes(d.mode)) group.slugs.push(d.mode);
  }
  const story = STORY_KEYS.flatMap((key) => groups.get(key) ?? []);
  return [...story, ...[...groups.values()].filter((g) => !STORY_KEYS.includes(g.key))];
}

/** Les clés des groupes où tombent des slugs de mode, dans l'ordre des groupes. */
export function modeKeysOf(groups: readonly GameModeGroup[], slugs: readonly string[]): string[] {
  return groups.filter((g) => g.slugs.some((s) => slugs.includes(s))).map((g) => g.key);
}
