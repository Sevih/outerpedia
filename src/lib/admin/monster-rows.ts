/**
 * Lignes de la sidebar MONSTRES (même UX que les persos). Statuts calculés
 * committé ↔ extraction fraîche ; icône = vignette `MT_*` servie par la route
 * sprite admin (les monstres ne sont pas dans le staging d'assets).
 */
import { reviewTarget } from '@/lib/admin/review-store';
import { freshEncounters, freshMonsters, type Monster } from '@/lib/admin/monster-store';
import { monsterIconSrc, monsterSlotSrc } from '@/lib/admin/monster-icon';
import type { ExtractorRow } from '@/components/admin/ExtractorSidebar';

export function buildMonsterRows(): ExtractorRow[] {
  const fresh = freshMonsters();
  const enc = freshEncounters();
  const review = reviewTarget('monster');
  const added = new Set(review.diff.added);
  const diffCounts = new Map(review.diff.changed.map((c) => [c.key, c.fields.length]));

  // Mode(s) de rencontre dans le meta : c'est CE qui distingue les boss
  // homonymes (mêmes nom/élément, stages différents) dès la liste.
  const modesOf = (m: Monster): string => {
    const labels = new Set<string>();
    for (const s of m.spawns ?? []) {
      const mode = enc.dungeons[s.dungeon]?.mode;
      if (mode) labels.add(enc.modes[mode]?.en ?? mode);
      if (labels.size === 2) break;
    }
    return [...labels].join(', ');
  };

  return Object.values(fresh).map((m) => ({
    id: m.id,
    name: m.name.en || '(sans nom)',
    meta: [`${m.type} · ${m.element}`, modesOf(m)].filter(Boolean).join(' · '),
    icon: monsterIconSrc(m.icon),
    iconFrame: monsterSlotSrc(m.type),
    stars: m.rarity,
    status: added.has(m.id) ? 'new' : diffCounts.has(m.id) ? 'diff' : 'ok',
    count: diffCounts.get(m.id) ?? 0,
  }));
}
