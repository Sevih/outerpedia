/**
 * Progress tracker — liens vers le guide du boss en cours et FICHE de ce boss,
 * résolus côté SERVEUR en DONNÉES STABLES : un guide et une fiche par fenêtre
 * saisonnière (World Boss, Joint Challenge, guild raid), une table guide /
 * fiche par boss de Singularity, une table d'EX Buff par buff, et une table de
 * guides FIXES par tâche (tour Very Hard, poursuites). Rien de « en cours »
 * n'est calculé ici : la page est en ISR 24 h et la Singularity tourne chaque
 * jour à minuit UTC — c'est le client qui choisit avec SON horloge
 * (`taskGuideLink` et `taskBossCard` de `tracker.ts`). Guides et calendrier
 * sont de la donnée du build : les tables ne changent qu'avec un déploiement.
 *
 * Le guild raid n'a pas de `bossId` : son guide se joint par les combats
 * (`group`) de sa version la plus récente, et sa fiche est le boss PRINCIPAL
 * de la saison (correction de Sevih du 21/11/2026 : pas de bascule par phase).
 */
import type { TFunction, TranslationKey } from '@/i18n';
import type { Lang } from '@/lib/i18n/config';
import { lRec } from '@/lib/i18n/localize';
import { localePath } from '@/lib/navigation';
import { img } from '@/lib/images';
import { getMonster, monsterDisplayNames, monsterIconSrc } from '@/lib/data/monsters';
import { encountersOfGroup, getEncounter } from '@/lib/data/encounters';
import {
  seasonFightsAt,
  seasonsForBoss,
  type ContentMode,
  type SeasonWindow,
} from '@/lib/data/content-schedule';
import {
  groupBossMonster,
  listGuidesByCategory,
  readGuideVersionFile,
  type Guide,
} from '@/lib/data/guides';
import type { GuideCategorySlug } from '@/lib/data/guide-categories';
import {
  singularityExBuffs,
  singularityExBuffTarget,
  singularityGroups,
  type SingularityBoss,
} from '@/lib/data/singularity';
import type { Monster } from '@contracts';
import type { TrackerBossCard, TrackerExBuff, TrackerGuideLink } from './contracts';
import type { SeasonWindows } from './tracker';

type TrackerWindow = NonNullable<SeasonWindows[string]>[number];

/** Href localisé du guide, nom du boss dans la langue (repli : titre du guide). */
function guideLink(guide: Guide, lang: Lang): TrackerGuideLink {
  const monster = guide.bossId ? getMonster(guide.bossId) : undefined;
  return {
    href: localePath(lang, `/guides/${guide.category}/${guide.slug}`),
    name: lRec(monster?.name, lang) || lRec(guide.title, lang),
  };
}

/**
 * Chaque fenêtre jouable gagne le guide de SA saison : la saison du mode qui
 * ouvre au même `start`, et le guide (visible, `listGuidesByCategory`) dont le
 * monstre y est combattu — même jointure que la page des guides
 * (`seasonsForBoss`, suffixe d'épinglage retiré). Pas de guide → pas de champ.
 */
export function seasonGuideLinks(
  mode: 'world-boss' | 'joint-challenge',
  windows: SeasonWindow[],
  guides: Guide[],
  lang: Lang,
): TrackerWindow[] {
  return windows.map((w) => {
    const guide = guides.find(
      (g) =>
        g.bossId && seasonsForBoss(g.bossId).some((s) => s.mode === mode && s.start === w.start),
    );
    return guide ? { ...w, guide: guideLink(guide, lang) } : w;
  });
}

/** Les combats (`group`) que désigne la version la plus récente d'un guide de guild raid. */
function guildRaidGroups(guide: Guide): string[] {
  const newest = guide.versions[0];
  if (!newest) return [];
  const cfg = readGuideVersionFile<{ subA?: string; subB?: string; main?: string }>(
    guide,
    newest.key,
    'config.json',
  );
  return [cfg?.subA, cfg?.subB, cfg?.main].filter((g): g is string => Boolean(g));
}

/**
 * Guild raid : chaque fenêtre gagne le guide dont la version la plus récente
 * combat dans SA saison — groupes `subA`/`subB`/`main` du `config.json` →
 * `encountersOfGroup` → ids de donjon, comparés aux `bosses[].dungeons` de la
 * saison qui ouvre au même `start`. Le lien ouvre l'onglet de phase 2 du guide
 * (`#phase=p2`, cf. `GuildRaidGuide` et `url-hash.ts`) : c'est le boss
 * principal que montre la fiche. Pas de guide → pas de champ.
 */
export function guildRaidGuideLinks(
  windows: TrackerWindow[],
  guides: Guide[],
  lang: Lang,
): TrackerWindow[] {
  return windows.map((w) => {
    const dungeons = new Set(
      (seasonFightsAt('guild-raid', w.start)?.fights ?? []).flatMap((f) => f.dungeons),
    );
    const guide = guides.find((g) =>
      guildRaidGroups(g).some((group) => encountersOfGroup(group).some((e) => dungeons.has(e.id))),
    );
    if (!guide) return w;
    const link = guideLink(guide, lang);
    return { ...w, guide: { ...link, href: `${link.href}#phase=p2` } };
  });
}

/** Fiche d'un monstre : portrait (règle des vues de guides par défaut), élément, classe. */
function bossCard(
  monster: Monster,
  lang: Lang,
  t: TFunction,
  portrait = monsterIconSrc(monster),
  name = lRec(monster.name, lang),
): TrackerBossCard {
  return {
    portrait,
    name,
    element: {
      icon: img.element(monster.element),
      name: t(`sys.element.${monster.element}` as TranslationKey),
    },
    klass: {
      icon: img.klass(monster.class),
      name: t(`sys.class.${monster.class}` as TranslationKey),
    },
  };
}

/**
 * Le boss de la saison qui ouvre à `start`, lu dans la DONNÉE DU MODE (pas dans
 * le guide) : WB → le boss canonique de la ligne (`boss`) ; JC → le monstre du
 * dernier palier (Very Hard), celui que portent ses guides ; GR → le boss du
 * combat PRINCIPAL (groupe `_MAIN`), au palier le plus haut comme sur la page
 * du guide (`groupBossMonster`).
 */
function seasonBossMonster(mode: ContentMode, start: string): Monster | undefined {
  const season = seasonFightsAt(mode, start);
  if (!season) return undefined;
  if (mode === 'world-boss') return season.boss ? getMonster(season.boss) : undefined;
  if (mode === 'joint-challenge') {
    const id = season.fights[0]?.monsters.at(-1);
    return id ? getMonster(id) : undefined;
  }
  const main = season.fights
    .map((f) => getEncounter(f.dungeons[0] ?? '')?.group)
    .find((group) => group?.endsWith('_MAIN'));
  return main ? groupBossMonster(main) : undefined;
}

/** Chaque fenêtre gagne la fiche du boss de sa saison ; boss inconnu → pas de champ. */
export function seasonBossCards(
  mode: ContentMode,
  windows: TrackerWindow[],
  lang: Lang,
  t: TFunction,
): TrackerWindow[] {
  return windows.map((w) => {
    const monster = seasonBossMonster(mode, w.start);
    return monster ? { ...w, boss: bossCard(monster, lang, t) } : w;
  });
}

/** Guide par boss de Singularity (clé = id du monstre `600000xx`). */
export function singularityGuideLinks(
  guides: Guide[],
  lang: Lang,
): Record<string, TrackerGuideLink> {
  const out: Record<string, TrackerGuideLink> = {};
  for (const g of guides) if (g.bossId) out[g.bossId.split('@')[0]] = guideLink(g, lang);
  return out;
}

/**
 * Fiche par boss de Singularity (clé = id du monstre) : portrait comme la vue
 * `SingularityRotation` (`boss.thumbnail` d'abord), nom désambiguïsé sur toute
 * la rotation (« Urd (Light) »).
 */
export function singularityBossCards(lang: Lang, t: TFunction): Record<string, TrackerBossCard> {
  const library = new Map<string, SingularityBoss>();
  for (const group of singularityGroups())
    for (const boss of group.bosses) {
      const id = boss.monsters[0];
      if (id && !library.has(id)) library.set(id, boss);
    }
  const names = monsterDisplayNames([...library.keys()], lang);
  const out: Record<string, TrackerBossCard> = {};
  for (const [id, boss] of library) {
    const monster = getMonster(id);
    if (!monster) continue;
    const portrait = boss.thumbnail
      ? img.singularity(boss.thumbnail)
      : img.boss(`MT_${monster.icon}`);
    out[id] = bossCard(monster, lang, t, portrait, names.get(id));
  }
  return out;
}

/**
 * EX Buff par id de buff, cible résolue (icône, « EX Buff · <cible> », `desc` du
 * jeu) — mêmes clés que `ExBuffBadge`. Le buff dépend du CRÉNEAU : le client lit
 * l'id dans le créneau du jour (`SingularityBoss.exBuff`) et prend l'entrée ici.
 */
export function singularityExBuffLabels(lang: Lang, t: TFunction): Record<string, TrackerExBuff> {
  const label = t('guides.singularity.ex_buff.label');
  const out: Record<string, TrackerExBuff> = {};
  for (const [id, buff] of Object.entries(singularityExBuffs())) {
    const target = singularityExBuffTarget(buff);
    const desc = lRec(buff.desc, lang) || buff.desc.en || '';
    out[id] = target
      ? {
          icon: target.kind === 'element' ? img.element(target.id) : img.klass(target.id),
          label: `${label} · ${t(`sys.${target.kind}.${target.id}` as TranslationKey)}`,
          desc,
        }
      : { label, desc };
  }
  return out;
}

/**
 * Guides FIXES : la tâche désigne toujours le même contenu. Résolus par
 * `listGuidesByCategory` — un guide masqué ou absent ne donne pas de lien.
 */
const FIXED_GUIDES: Record<string, { category: GuideCategorySlug; slug: string }> = {
  'skyward-tower-vhard-20': { category: 'skyward-tower', slug: 'very-hard-tower' },
  'irregular-queen': { category: 'irregular-extermination', slug: 'pursuit-queen' },
  'irregular-wyvre': { category: 'irregular-extermination', slug: 'pursuit-mutated-wyvre' },
  'irregular-iron-stretcher': {
    category: 'irregular-extermination',
    slug: 'pursuit-iron-stretcher',
  },
  'irregular-blockbuster': { category: 'irregular-extermination', slug: 'pursuit-blockbuster' },
};

/** Guide fixe par id de tâche (cf. `FIXED_GUIDES`). */
export function fixedGuideLinks(lang: Lang): Record<string, TrackerGuideLink> {
  const out: Record<string, TrackerGuideLink> = {};
  for (const [taskId, { category, slug }] of Object.entries(FIXED_GUIDES)) {
    const guide = listGuidesByCategory(category).find((g) => g.slug === slug);
    if (guide) out[taskId] = guideLink(guide, lang);
  }
  return out;
}
