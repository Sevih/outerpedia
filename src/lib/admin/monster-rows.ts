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
  // NB : les modes sans intérêt d'extraction (event, remains, sidestory…)
  // sont ignorés PAR LE GÉNÉRATEUR (mode-titles.json `ignore`) — leurs
  // donjons/spawns n'existent plus dans encounters.
  const modesOf = (m: Monster): string[] => {
    const modes = new Set<string>();
    for (const s of m.spawns ?? []) {
      const mode = enc.dungeons[s.dungeon]?.mode;
      if (mode) modes.add(mode);
    }
    return [...modes];
  };
  // Stage/zone d'une rencontre : story → saison/épisode/zone/stage ; world
  // boss → LIGUE SEULE (les 4 donjons d'un groupe partagent le nom, et en
  // queue de ligne la difficulté sortait de l'écran) ; sinon le nom du
  // donjon (JC/poursuite/guild raid y portent leur difficulté).
  const zoneLabel = (dungeon: string): string | undefined => {
    const d = enc.dungeons[dungeon];
    if (!d?.name.en) return undefined;
    if (d.season || d.episode) {
      const se = [d.season ? `S${d.season}` : '', d.episode ? `Ep${d.episode}` : '']
        .filter(Boolean)
        .join(' ');
      return [se, d.area?.en, d.name.en].filter(Boolean).join(' · ');
    }
    if (d.mode === 'world_boss' && d.difficulty?.name?.en) return d.difficulty.name.en;
    return d.name.en;
  };
  const zonesOf = (m: Monster): string[] => {
    const zones = new Set<string>();
    for (const s of m.spawns ?? []) {
      const z = zoneLabel(s.dungeon);
      if (z) zones.add(z);
    }
    return [...zones];
  };

  const seenModes = new Set<string>();
  const rows: ExtractorRow[] = Object.values(fresh).flatMap((m) => {
    // Un monstre sans AUCUNE rencontre restante (ni spawn, ni add rattaché)
    // n'a rien à faire dans la liste — les modes ignorés tombent ici.
    if (!m.spawns?.length && !m.summonedBy?.length && !m.linkedTo?.length) return [];
    const modes = modesOf(m);
    for (const mode of modes) seenModes.add(mode);
    return [
      {
        id: m.id,
        name: m.name.en || '(sans nom)',
        // Le(s) mode(s) dans le meta : c'est CE qui distingue les boss
        // homonymes. Type = badge BOSS sur le portrait, élément/classe =
        // overlays — pas de doublon texte. Ligne 3 (sub) : stage/zone.
        meta: modes.slice(0, 2).map(modeLabel).join(', '),
        sub: zonesOf(m).slice(0, 2).join(', '),
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
