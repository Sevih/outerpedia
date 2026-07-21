/**
 * Restriction du diff MONSTRE aux monstres UTILISÉS PAR LE SITE.
 *
 * L'extraction couvre tout le jeu ; une grosse part des monstres ne sert aucune
 * page (modes non servis, contenu retiré…). Leurs écarts sont du BRUIT : ils
 * gonflaient le badge « à traiter » du menu admin sans rien d'actionnable.
 * Même périmètre que le filtre « Used by the site » de la sidebar extractor
 * (`siteMonsterIds` : réfs content-schedule/singularity/towers + spawns de leurs
 * donjons + adds rattachés).
 *
 * Défensif : si l'ensemble « site » n'est pas calculable (extraction absente),
 * on rend le diff INTACT plutôt que de masquer du travail réel.
 */
import { siteMonsterIds } from '@/lib/admin/monster-store';
import { reviewBuckets, reviewTarget, type TargetReview } from '@/lib/admin/review-store';

type Diff = TargetReview['diff'];

export function siteMonsterDiff(diff: Diff): Diff {
  try {
    const site = siteMonsterIds();
    return {
      ...diff,
      added: diff.added.filter((id) => site.has(id)),
      removed: diff.removed.filter((id) => site.has(id)),
      changed: diff.changed.filter((c) => site.has(c.key)),
    };
  } catch {
    return diff;
  }
}

/** Diff d'une cible, restreint au site quand c'est pertinent (monstres). */
export function actionableDiff(targetId: string, diff: Diff): Diff {
  return targetId === 'monster' ? siteMonsterDiff(diff) : diff;
}

/**
 * Compteurs monstres du PÉRIMÈTRE SITE — mêmes chiffres que le badge du menu et
 * l'accueil. Sert d'en-tête AUTORITAIRE à la sidebar extractor : sinon elle
 * dériverait ses stats de TOUTES ses lignes (le toggle « Used by the site »
 * filtre la liste affichée, pas les compteurs) et contredirait le badge.
 */
export function siteMonsterCounts(): { new: number; diff: number } {
  try {
    const b = reviewBuckets(siteMonsterDiff(reviewTarget('monster').diff));
    return { new: b.new, diff: b.diff };
  } catch {
    return { new: 0, diff: 0 };
  }
}
