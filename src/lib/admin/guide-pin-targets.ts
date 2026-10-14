/**
 * Ce qu'une version de guide VERSIONNÉ peut épingler : les monstres de SON
 * combat, chacun avec les archives qui existent pour lui. Lu par la section
 * « Guides » de quick (lot F18) — les pins d'une version s'y lisent et s'y
 * dépinglent, ils ne s'y créent pas (le versionnage des monstres est dans la
 * section Extraction, sur la fiche du monstre).
 *
 * Le combat est pris sur la première version qui en déclare un : il appartient
 * au guide, pas à la version (vérifié sur les 16 guides versionnés — aucun n'en
 * change), et une version « legacy » sans combat n'a donc rien à épingler mais
 * ne prive pas les autres.
 */
import { getT } from '@/i18n';
import type { GuideDraft } from '@/lib/admin/guide-draft';
import { encounterLabel, encountersOfGroup } from '@/lib/data/encounters';
import {
  getMonster,
  monsterArchives,
  monsterDisplayNames,
  monsterIconSrc,
  type MonsterArchiveChoice,
} from '@/lib/data/monsters';

/** Un monstre du combat, avec les états figés qu'on peut lui choisir. */
export interface PinTarget {
  id: string;
  name: string;
  /** Difficultés où il apparaît — deux boss homonymes ne se distinguent qu'ainsi. */
  where: string[];
  icon?: string;
  archives: MonsterArchiveChoice[];
}

/** `2026-08-11T16:58:19+02:00` → `Aug 11, 2026`. */
const day = (iso: string): string =>
  new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

/**
 * Ce qu'une archive dit d'elle-même, en une ligne. La note humaine PRIME :
 * « avant la refonte 1.11 » dit ce qu'un numéro ne dira jamais. C'est la même
 * règle qu'au rendu public (cf. BossPanel).
 */
export function archiveLabel(a: MonsterArchiveChoice): string {
  if (a.label) return `v${a.version} · ${a.label}`;
  return a.gameVersion
    ? `v${a.version} · game ${a.gameVersion} · ${day(a.committedAt)}`
    : `v${a.version} · ${day(a.committedAt)}`;
}

/**
 * Les monstres d'un COMBAT (`group`), chacun avec ses archives. Par ID, pas par
 * rencontre : un même monstre peut tenir plusieurs difficultés (world boss), et
 * il ne se fige qu'une fois — la liste `pinned` est indexée par monstre. On
 * garde les difficultés pour le NOMMER à l'écran.
 *
 * Un monstre SANS archive reste listé : c'est ce qui dit « celui-là n'a jamais
 * été versionné », alors que son absence se lirait comme un oubli du scan.
 */
export async function pinTargetsOfGroup(group: string): Promise<PinTarget[]> {
  const t = await getT('en');
  const byId = new Map<string, string[]>();
  for (const enc of encountersOfGroup(group)) {
    const label = encounterLabel(enc.ref, 'en', t);
    for (const m of enc.monsters) byId.set(m.id, [...(byId.get(m.id) ?? []), label]);
  }
  const names = monsterDisplayNames([...byId.keys()], 'en');
  return [...byId].map(([id, where]) => {
    const monster = getMonster(id);
    return {
      id,
      name: names.get(id) ?? id,
      where,
      ...(monster ? { icon: monsterIconSrc(monster) } : {}),
      archives: monsterArchives(id),
    };
  });
}

/** Les cibles de pin d'un brouillon : celles du combat de sa première version qui en a un. */
export async function buildPinTargets(draft: Pick<GuideDraft, 'versions'>): Promise<PinTarget[]> {
  const group = draft.versions.find((v) => v.group)?.group;
  return group ? pinTargetsOfGroup(group) : [];
}
