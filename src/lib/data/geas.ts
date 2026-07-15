/**
 * LES GEAS DU GUILD RAID — dérivés de la donnée, jamais recopiés.
 *
 * Un geas est un modificateur global du guild raid : une aide (`positive`) ou un
 * handicap, contre un ajustement de score (`points`). La V2 maintenait à la main
 * et le POOL (107 entrées) et les tables de déblocage de chaque saison. En V3 les
 * deux sortent des tables du jeu :
 *   - le pool vit dans `glossaries.geas` (clé → {desc, icon, positive, grade…}) ;
 *   - la table de déblocage d'un SOUS-BOSS se lit sur son COMBAT : chaque stage
 *     (`stage_N`) porte `geasRewards = [id, id]`, les geas gagnés au palier N.
 *
 * On ne recopie donc rien : un guide désigne le `group` d'un sous-boss, tout le
 * reste en découle. Le classement bonus/malus se lit sur `positive`, jamais sur
 * l'ordre de la liste `geasRewards`.
 */
import glossariesData from '@data/generated/glossaries.json';
import type { Glossaries, GuildRaidGeas } from '@contracts';
import { encountersOfGroup } from '@/lib/data/encounters';

const POOL: Record<string, GuildRaidGeas> = (glossariesData as unknown as Glossaries).geas ?? {};

/** Un geas résolu depuis le pool (id conservé pour les clés React). */
export interface GeasRef {
  id: string;
  geas: GuildRaidGeas;
}

/** Un geas du pool par son id (undefined = id absent du pool). */
export function getGeas(id: string): GeasRef | undefined {
  const geas = POOL[id];
  return geas ? { id, geas } : undefined;
}

/** Résout une liste d'ids en geas du pool (les ids inconnus sont ignorés). */
export function resolveGeas(ids: readonly string[]): GeasRef[] {
  return ids.map(getGeas).filter((g): g is GeasRef => Boolean(g));
}

/**
 * Un geas est un BONUS ou un MALUS selon le SIGNE de son ajustement de score
 * (`points`) — la seule lecture qui compte pour le joueur, pas le flag `positive`
 * (un geas favorable au combat mais qui RÉDUIT le score est un malus de score) :
 *   points > 0 → bonus (score en plus)
 *   points < 0 → malus (score en moins, affiché en rouge)
 */
export function isBonusGeas(geas: GuildRaidGeas): boolean {
  return geas.points >= 0;
}

/** Une paire de geas débloquée à un palier de kills d'un sous-boss. */
export interface GeasUnlock {
  /** Palier (numéro de stage = nombre de kills). */
  kill: number;
  bonus?: GeasRef;
  malus?: GeasRef;
}

/**
 * La table de déblocage des geas d'un SOUS-BOSS, dérivée de son combat.
 *
 * Un combat inconnu (ancienne saison purgée des données) rend une table VIDE —
 * l'appelant décide alors de ne rien afficher, plutôt que de casser : contrairement
 * aux monstres, l'absence de geas n'est pas une erreur de contenu mais l'état
 * normal d'une version archivée (cf. « courante en full, anciennes en léger »).
 */
export function geasUnlockTable(group: string): GeasUnlock[] {
  return encountersOfGroup(group)
    .map((e) => {
      const key = e.ref.difficulty?.key ?? '';
      const m = /^stage_(\d+)$/.exec(key);
      const kill = m ? Number(m[1]) : (e.ref.difficulty?.order ?? 0);
      const refs = resolveGeas(e.ref.geasRewards ?? []);
      return {
        kill,
        bonus: refs.find((r) => isBonusGeas(r.geas)),
        malus: refs.find((r) => !isBonusGeas(r.geas)),
      };
    })
    .filter((u) => u.bonus || u.malus)
    .sort((a, b) => a.kill - b.kill);
}
