/**
 * ÉCHELLE DES RANGS de Dimensional Singularity — la section « Ranks » de sa
 * page de catégorie.
 *
 * RIEN n'est écrit à la main : les rangs, leurs seuils de dégâts, le niveau du
 * boss et ses passifs viennent de `encounters.json` (`DungeonRef.ranks`, tirés
 * de `SingularityGradeTemplet`), les libellés des passifs de la même règle que
 * les pages de boss (`rankOptionLabel`), la récompense d'atteinte de
 * `reward-tables.json`, le buff EX de `singularity.json`. Un patch qui ajoute
 * des rangs (EX…EX+++ au 20/11/2026) ou retouche un seuil change la page
 * sans qu'on y touche.
 *
 * L'échelle est la MÊME pour tous les boss et tous les thèmes (vérifié par
 * test sur la donnée committée) : on la lit sur le premier donjon de la
 * rotation qui en porte une.
 */
import type { DungeonRank } from '@contracts';
import type { Lang } from '@/lib/i18n/config';
import { getGlossaries } from '@/lib/data/glossaries';
import { getEncounter } from '@/lib/data/encounters';
import { rankOptionLabel, type RankOptionLabels } from '@/lib/data/boss-view';
import { resolveRewardTable, type ResolvedReward } from '@/lib/data/rewards';
import {
  singularityExBuffs,
  singularityGroups,
  type SingularityExBuff,
} from '@/lib/data/singularity';

/** Une ligne de l'échelle : un rang. */
export interface SingularityRankRow {
  /** `RankName` du jeu (« E », « SSS++ », « EX+++ ») — aussi la clé du badge. */
  name: string;
  /** Dégâts d'un run à partir desquels le rang est atteint (`MinDamage`). */
  minDamage: number;
  /** Niveau du boss à ce rang. */
  level?: number;
  /**
   * Passifs du boss qui APPARAISSENT ou CHANGENT à ce rang (libellés absents
   * du rang précédent), dédupliqués — vide quand le rang ne change rien.
   */
  changes: string[];
  /** Le buff EX s'active à ce rang. */
  exBuff?: boolean;
  /** Récompense d'atteinte (réf `reward-tables.json`), si la donnée la porte. */
  reward?: string;
}

/** L'échelle entière, prête à rendre. */
export interface SingularityRankLadder {
  rows: SingularityRankRow[];
  /**
   * Bonus de dégâts du buff EX, en % (+200), quand tous les créneaux le
   * partagent — sinon absent, et la ligne n'annonce pas de chiffre.
   */
  exBuffPercent?: number;
}

/** L'échelle résolue pour une langue : la récompense de chaque rang en lignes affichables. */
export interface SingularityRankLadderView extends SingularityRankLadder {
  rows: (SingularityRankRow & { rewards?: ResolvedReward[] })[];
}

/**
 * Construit l'échelle depuis les rangs d'un donjon. PURE : `label` libelle une
 * option de palier (`undefined` = option tue), `exBuffs` est le glossaire des
 * buffs EX.
 */
export function buildRankLadder(
  ranks: readonly DungeonRank[],
  label: (optionId: string) => string | undefined,
  exBuffs: readonly SingularityExBuff[],
): SingularityRankLadder {
  const exRanks = new Set(exBuffs.map((b) => b.rank));
  const values = new Set(exBuffs.map((b) => b.value));
  const [only] = values;
  const exBuffPercent = values.size === 1 && only ? only / 10 : undefined;

  let previous = new Set<string>();
  const rows: SingularityRankRow[] = [];
  for (const r of ranks) {
    if (!r.name) continue;
    const labels = new Set((r.options ?? []).map(label).filter((l): l is string => Boolean(l)));
    rows.push({
      name: r.name,
      minDamage: r.damage?.min ?? 0,
      ...(r.level ? { level: r.level } : {}),
      changes: [...labels].filter((l) => !previous.has(l)),
      ...(exRanks.has(r.name) ? { exBuff: true } : {}),
      ...(r.reward ? { reward: r.reward } : {}),
    });
    previous = labels;
  }
  return { rows, ...(exBuffPercent ? { exBuffPercent } : {}) };
}

/** Rangs de l'échelle : ceux du premier donjon de la rotation qui en porte. */
function singularityRanks(): DungeonRank[] {
  for (const g of singularityGroups())
    for (const b of g.bosses) {
      const ranks = getEncounter(b.dungeon)?.ranks;
      if (ranks?.length) return ranks;
    }
  return [];
}

/**
 * L'échelle de Dimensional Singularity dans une langue. Les récompenses se
 * résolvent STRICTEMENT (`resolveRewardTable` jette sur une table absente) :
 * un rang qui cite une récompense irrésoluble casse le rendu et les tests,
 * plutôt que d'afficher une case vide.
 */
export function singularityRankLadder(
  lang: Lang,
  labels: RankOptionLabels,
): SingularityRankLadderView {
  const g = getGlossaries();
  const ladder = buildRankLadder(
    singularityRanks(),
    (id) => {
      const o = g.rankOptions?.[id];
      return o ? rankOptionLabel(o, g.statScales, lang, labels) : undefined;
    },
    Object.values(singularityExBuffs()),
  );
  return {
    ...ladder,
    rows: ladder.rows.map((r) =>
      r.reward ? { ...r, rewards: resolveRewardTable(r.reward, lang) } : r,
    ),
  };
}
