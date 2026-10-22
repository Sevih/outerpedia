/**
 * Progress tracker — liens vers le guide du boss en cours, résolus côté
 * SERVEUR en DONNÉES STABLES : un guide par fenêtre saisonnière (World Boss,
 * Joint Challenge) et une table guide par boss de Singularity. Rien de « en
 * cours » n'est calculé ici : la page est en ISR 24 h et la Singularity tourne
 * chaque jour à minuit UTC — c'est le client qui choisit le lien avec SON
 * horloge (`taskGuideLink` de `tracker.ts`). Guides et calendrier sont de la
 * donnée du build : la table ne change qu'avec un déploiement.
 *
 * Le guild raid n'en a pas : son boss se dérive autrement (pas de `bossId`)
 * et change par phase.
 */
import type { Lang } from '@/lib/i18n/config';
import { lRec } from '@/lib/i18n/localize';
import { localePath } from '@/lib/navigation';
import { getMonster } from '@/lib/data/monsters';
import { seasonsForBoss, type SeasonWindow } from '@/lib/data/content-schedule';
import type { Guide } from '@/lib/data/guides';
import type { TrackerGuideLink } from './contracts';
import type { SeasonWindows } from './tracker';

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
): NonNullable<SeasonWindows[string]> {
  return windows.map((w) => {
    const guide = guides.find(
      (g) =>
        g.bossId && seasonsForBoss(g.bossId).some((s) => s.mode === mode && s.start === w.start),
    );
    return guide ? { ...w, guide: guideLink(guide, lang) } : w;
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
