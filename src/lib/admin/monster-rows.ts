/**
 * Lignes de la sidebar MONSTRES (même UX que les persos). Statuts calculés
 * committé ↔ extraction fraîche ; icône = vignette `MT_*` servie par la route
 * sprite admin (les monstres ne sont pas dans le staging d'assets).
 *
 * Filtres spécifiques au domaine :
 *   - flag `site` (case cochée par défaut) : monstres UTILISÉS PAR LE SITE
 *     (réfs de content-schedule/singularity/towers + spawns dans leurs donjons
 *     + adds rattachés — cf. `siteMonsterIds`) ;
 *   - tags = slugs des MODES DE JEU où le monstre spawne (select).
 */
import { reviewEntities, reviewTarget, type TargetReview } from '@/lib/admin/review-store';
import { freshEncounters, freshMonsters, siteMonsterIds } from '@/lib/admin/monster-store';
import { monsterBossBadgeSrc, monsterIconSrc, monsterSlotSrc } from '@/lib/admin/monster-icon';
import { monsterPlaces } from '@/lib/admin/monster-kit';
import { img } from '@/lib/images';
import type { ExtractorRow } from '@/components/admin/ExtractorSidebar';

export interface MonsterRowsResult {
  rows: ExtractorRow[];
  /** Modes de jeu présents dans les spawns (slug + libellé EN), triés. */
  modeOptions: Array<{ value: string; label: string }>;
}

/**
 * Statut de revue par monstre, comme `character-rows.ts` : `new` (extrait, pas
 * encore validé), `diff` (vrai écart, à enregistrer depuis sa fiche) ou `minor`
 * (retouche mineure ou typo seule — « Apply minor changes » de la page index
 * suffit). Un monstre absent de la table est à jour (`ok`) ; un disparu n'a
 * pas de ligne.
 */
export function monsterRowStatuses(
  diff: TargetReview['diff'],
): Map<string, 'new' | 'diff' | 'minor'> {
  const statuses = new Map<string, 'new' | 'diff' | 'minor'>();
  for (const e of reviewEntities(diff)) {
    if (e.status === 'removed') continue;
    statuses.set(e.key, e.status === 'typo' ? 'minor' : e.status);
  }
  return statuses;
}

export function buildMonsterRows(): MonsterRowsResult {
  const fresh = freshMonsters();
  const enc = freshEncounters();
  const site = siteMonsterIds();
  const review = reviewTarget('monster');
  const statusOf = monsterRowStatuses(review.diff);
  const diffCounts = new Map(review.diff.changed.map((c) => [c.key, c.fields.length]));

  const modeLabel = (mode: string): string => enc.modes[mode]?.en ?? mode;

  const seenModes = new Set<string>();
  const rows: ExtractorRow[] = Object.values(fresh).flatMap((m) => {
    // Un monstre sans AUCUNE rencontre restante (ni spawn, ni add rattaché)
    // n'a rien à faire dans la liste — les modes ignorés tombent ici.
    if (!m.spawns?.length && !m.summonedBy?.length && !m.linkedTo?.length) return [];
    // Modes et stages / zones des spawns : le libellé partagé avec quick.
    // NB : les modes sans intérêt d'extraction (event, remains, sidestory…)
    // sont ignorés PAR LE GÉNÉRATEUR (mode-titles.json `ignore`) — leurs
    // donjons/spawns n'existent plus dans encounters.
    const { modes, zones } = monsterPlaces(m, enc.dungeons);
    for (const mode of modes) seenModes.add(mode);
    return [
      {
        id: m.id,
        name: m.name.en || '(sans nom)',
        // Le(s) mode(s) dans le meta : c'est CE qui distingue les boss
        // homonymes. Type = badge BOSS sur le portrait, élément/classe =
        // overlays — pas de doublon texte. Ligne 3 (sub) : stage/zone.
        meta: modes.slice(0, 2).map(modeLabel).join(', '),
        sub: zones.slice(0, 2).join(', '),
        icon: monsterIconSrc(m.icon),
        iconFrame: monsterSlotSrc(m.type),
        iconInset: true,
        elementIcon: img.element(m.element),
        classIcon: img.klass(m.class),
        badgeIcon: monsterBossBadgeSrc(m.type),
        stars: m.rarity,
        status: statusOf.get(m.id) ?? 'ok',
        count: diffCounts.get(m.id) ?? 0,
        flags: site.has(m.id) ? ['site'] : [],
        tags: modes,
      } satisfies ExtractorRow,
    ];
  });

  // Labels dupliqués (guild_raid_main/sub → « Guild Raid ») : suffixe le slug.
  const labelCounts = new Map<string, number>();
  for (const mode of seenModes) {
    const l = modeLabel(mode);
    labelCounts.set(l, (labelCounts.get(l) ?? 0) + 1);
  }
  const modeOptions = [...seenModes]
    .map((value) => {
      const l = modeLabel(value);
      return { value, label: (labelCounts.get(l) ?? 0) > 1 ? `${l} (${value})` : l };
    })
    .sort((a, b) => a.label.localeCompare(b.label));

  return { rows, modeOptions };
}
