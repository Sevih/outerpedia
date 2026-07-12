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
import { reviewTarget } from '@/lib/admin/review-store';
import {
  freshEncounters,
  freshMonsters,
  siteMonsterIds,
  type Monster,
} from '@/lib/admin/monster-store';
import { monsterBossBadgeSrc, monsterIconSrc, monsterSlotSrc } from '@/lib/admin/monster-icon';
import { img } from '@/lib/images';
import type { ExtractorRow } from '@/components/admin/ExtractorSidebar';

export interface MonsterRowsResult {
  rows: ExtractorRow[];
  /** Modes de jeu présents dans les spawns (slug + libellé EN), triés. */
  modeOptions: Array<{ value: string; label: string }>;
}

export function buildMonsterRows(): MonsterRowsResult {
  const fresh = freshMonsters();
  const enc = freshEncounters();
  const site = siteMonsterIds();
  const review = reviewTarget('monster');
  const added = new Set(review.diff.added);
  const diffCounts = new Map(review.diff.changed.map((c) => [c.key, c.fields.length]));

  const modeLabel = (mode: string): string => enc.modes[mode]?.en ?? mode;
  const modesOf = (m: Monster): string[] => {
    const modes = new Set<string>();
    for (const s of m.spawns ?? []) {
      const mode = enc.dungeons[s.dungeon]?.mode;
      if (mode) modes.add(mode);
    }
    return [...modes];
  };

  const seenModes = new Set<string>();
  const rows: ExtractorRow[] = Object.values(fresh).map((m) => {
    const modes = modesOf(m);
    for (const mode of modes) seenModes.add(mode);
    return {
      id: m.id,
      name: m.name.en || '(sans nom)',
      // Le(s) mode(s) dans le meta : c'est CE qui distingue les boss homonymes.
      meta: [`${m.type} · ${m.element}`, modes.slice(0, 2).map(modeLabel).join(', ')]
        .filter(Boolean)
        .join(' · '),
      icon: monsterIconSrc(m.icon),
      iconFrame: monsterSlotSrc(m.type),
      iconInset: true,
      elementIcon: img.element(m.element),
      classIcon: img.klass(m.class),
      badgeIcon: monsterBossBadgeSrc(m.type),
      stars: m.rarity,
      status: added.has(m.id) ? 'new' : diffCounts.has(m.id) ? 'diff' : 'ok',
      count: diffCounts.get(m.id) ?? 0,
      flags: site.has(m.id) ? ['site'] : [],
      tags: modes,
    };
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
