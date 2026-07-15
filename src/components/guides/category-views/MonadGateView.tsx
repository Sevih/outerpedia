import { getT, type TFunction } from '@/i18n';
import type { Lang } from '@/lib/i18n/config';
import { lRec } from '@/lib/i18n/localize';
import { localePath } from '@/lib/navigation';
import type { Guide } from '@/lib/data/guides';
import { EmptyCategory } from './EmptyCategory';
import { MonadEndless, Tile, type EndlessDepth, type RouteTile } from './MonadGateGallery';
import type { CategoryViewProps } from './types';

/**
 * Vue MONAD GATE (visuel V2) : deux sections — les profondeurs STORY (1-5) en
 * cartes fixes, puis les profondeurs ENDLESS (6-10) derrière un sélecteur.
 *
 * Chaque guide DÉCLARE sa `depth` et sa `route` (requis au scan) et, si sa page
 * expose plusieurs layouts de map, son nombre de `variants`. La vue en tire la
 * section, le sélecteur, la fusion des routes d'une profondeur et l'ordre — là
 * où la V2 lisait la profondeur dans le SLUG (`depth6-route2`) et listait en dur
 * les profondeurs endless et celles à variantes (`VARIANT_DEPTHS = [10]`).
 */

/**
 * Frontière STORY / ENDLESS : le mode se joue en histoire jusqu'à la profondeur
 * 5 (True Ending), puis en boucle au-delà. Constante de STRUCTURE du jeu, pas un
 * réglage — une profondeur ajoutée tombe du bon côté sans rien toucher.
 */
const STORY_MAX_DEPTH = 5;

export default async function MonadGateView({ lang, guides }: CategoryViewProps) {
  const t = await getT(lang);
  if (guides.length === 0) return <EmptyCategory lang={lang} />;

  // `requires: ['depth','route']` au scan — le garde reste pour un appel hors catégorie.
  const rows = guides
    .map((guide) => {
      if (guide.depth === undefined || guide.route === undefined) {
        throw new Error(
          `MonadGateView : « ${guide.category}/${guide.slug} » sans depth/route dans son meta.`,
        );
      }
      return { guide, depth: guide.depth, route: guide.route, variants: guide.variants ?? 1 };
    })
    .sort((a, b) => a.depth - b.depth || a.route - b.route);

  // Profondeurs → leurs routes (ordre déjà croissant, `Map` préserve l'insertion).
  const byDepth = new Map<number, Row[]>();
  for (const r of rows) (byDepth.get(r.depth) ?? byDepth.set(r.depth, []).get(r.depth)!).push(r);

  const story: RouteTile[] = [];
  const endless: EndlessDepth[] = [];
  for (const [depth, items] of byDepth) {
    if (depth <= STORY_MAX_DEPTH) {
      // Une profondeur Story = une tuile ; ses routes multiples y deviennent des
      // segments (Depth 4 : deux parts).
      story.push(depthTile(depth, items, lang, t));
    } else {
      // Endless : une tuile PAR route (chacune peut avoir ses variantes).
      endless.push({
        depth,
        label: t('guides.monad_gate.depth', { n: depth }),
        tiles: items.map((r) => routeTile(depth, r, lang, t)),
      });
    }
  }

  return (
    <div className="space-y-8">
      {story.length > 0 && (
        <section>
          <h2 className="mb-4">{t('guides.monad_gate.depth', { n: `1-${STORY_MAX_DEPTH}` })}</h2>
          <div className="flex flex-wrap justify-center gap-3">
            {story.map((tile) => (
              <Tile key={tile.key} tile={tile} />
            ))}
          </div>
        </section>
      )}

      {endless.length > 0 && (
        <MonadEndless
          title={t('guides.monad_gate.depth', {
            n: `${STORY_MAX_DEPTH + 1}-${endless[endless.length - 1].depth}`,
          })}
          depths={endless}
        />
      )}
    </div>
  );
}

type Row = { guide: Guide; depth: number; route: number; variants: number };

const routeUrl = (g: Guide, lang: Lang) => localePath(lang, `/guides/${g.category}/${g.slug}`);

/** Tuile d'une profondeur Story : une carte, une part par route s'il y en a plusieurs. */
function depthTile(depth: number, items: Row[], lang: Lang, t: TFunction): RouteTile {
  const depthLabel = t('guides.monad_gate.depth', { n: depth });
  if (items.length >= 2) {
    return {
      key: `d${depth}`,
      depthLabel,
      icon: items[0].guide.icon,
      segments: items.map((r) => ({
        label: lRec(r.guide.title, lang),
        href: routeUrl(r.guide, lang),
      })),
    };
  }
  return routeTile(depth, items[0], lang, t);
}

/** Tuile d'une route unique : carte simple, ou segments si elle a des variantes de map. */
function routeTile(depth: number, r: Row, lang: Lang, t: TFunction): RouteTile {
  const depthLabel = t('guides.monad_gate.depth', { n: depth });
  const name = lRec(r.guide.title, lang);
  const base = routeUrl(r.guide, lang);
  if (r.variants > 1) {
    return {
      key: r.guide.slug,
      depthLabel,
      name,
      icon: r.guide.icon,
      segments: Array.from({ length: r.variants }, (_, i) => ({
        // Étiquette A, B, C… — le layout de map que la page ouvrira via `?v`.
        label: t('guides.monad_gate.variant', { v: String.fromCharCode(65 + i) }),
        href: `${base}?v=${i}`,
      })),
    };
  }
  return { key: r.guide.slug, depthLabel, name, icon: r.guide.icon, href: base };
}
