/**
 * LES GEAS QU'UNE ÉQUIPE DE GUILD RAID PEUT ACTIVER, pour la section « Guides »
 * de quick (lot F33) : ceux que les sous-boss débloquent, dérivés du combat
 * (`geasUnlockTable`) — jamais une liste recopiée. Un combat sans table (une
 * saison purgée de la donnée) rend une liste vide.
 */
import { geasUnlockTable, isBonusGeas, type GeasRef } from '@/lib/data/geas';
import { img } from '@/lib/images';

/** Un geas déblocable, tel que la page le montre : icône, texte, points. */
export interface RaidGeasChoice {
  id: string;
  /** Le palier de kills du sous-boss qui le débloque. */
  kill: number;
  /** Sa description anglaise (le texte du jeu). */
  text: string;
  icon?: string;
  /** Le cadre de son grade. */
  frame: string;
  /** Ajustement de score, en pour-mille (−700 = −70 %). */
  points: number;
  /** Bonus de SCORE (signe des points, `isBonusGeas`) : le rangement du rendu. */
  bonus: boolean;
  /** Aide au combat (`positive`) : la liste du fichier (`bonus`), sinon `malus`. */
  positive: boolean;
}

const choice = (ref: GeasRef, kill: number): RaidGeasChoice => ({
  id: ref.id,
  kill,
  text: (ref.geas.desc.en ?? '').replace(/\\n|\n/g, ' '),
  ...(ref.geas.icon ? { icon: img.geas(ref.geas.icon) } : {}),
  frame: img.geasFrame(ref.geas.grade),
  points: ref.geas.points,
  bonus: isBonusGeas(ref.geas),
  positive: Boolean(ref.geas.positive),
});

/** Les geas déblocables d'un sous-boss, par palier croissant. */
export function raidGeasChoices(group: string): RaidGeasChoice[] {
  return geasUnlockTable(group).flatMap((u) => [
    ...(u.bonus ? [choice(u.bonus, u.kill)] : []),
    ...(u.malus ? [choice(u.malus, u.kill)] : []),
  ]);
}
