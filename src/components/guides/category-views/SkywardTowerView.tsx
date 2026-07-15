import Link from 'next/link';
import { getT } from '@/i18n';
import type { Lang } from '@/lib/i18n/config';
import { lRec } from '@/lib/i18n/localize';
import { localePath } from '@/lib/navigation';
import { ELEMENT_ORDER, ELEMENT_RING, img } from '@/lib/images';
import type { Guide } from '@/lib/data/guides';
import { getTower, TOWER_DIFFICULTY_MODES, TOWER_ELEMENT_MODE } from '@/lib/data/towers';
import { EmptyCategory } from './EmptyCategory';
import type { CategoryViewProps } from './types';

/**
 * Vue SKYWARD TOWER (visuel V2) : deux sections empilées — les tours de
 * DIFFICULTÉ (bannières larges) puis les tours ÉLÉMENTAIRES (cartes hautes,
 * accent à l'élément).
 *
 * Chaque guide DÉSIGNE sa tour par `meta.tower` (clé de towers.json, requis au
 * scan) : la vue lit là son `mode` (→ quelle section) et son `element` (→ icône,
 * anneau, ordre). La V2 dérivait tout du SLUG du guide (`fire-tower`,
 * `normal-tower`) avec deux listes d'ordre écrites en dur dans le composant —
 * un slug hors nomenclature y disparaissait sans un bruit.
 */
export default async function SkywardTowerView({ lang, guides }: CategoryViewProps) {
  const t = await getT(lang);
  if (guides.length === 0) return <EmptyCategory lang={lang} />;

  const placed = guides.map((guide) => {
    // `requires: ['tower']` au scan — le garde reste pour un appel hors catégorie.
    if (!guide.tower) {
      throw new Error(
        `SkywardTowerView : « ${guide.category}/${guide.slug} » sans tower dans son meta.`,
      );
    }
    const tower = getTower(guide.tower);
    if (!tower) {
      throw new Error(
        `SkywardTowerView : tour « ${guide.tower} » (${guide.slug}) absente de ` +
          `data/generated/towers.json.`,
      );
    }
    return { guide, tower };
  });

  // Section DIFFICULTÉ, dans l'ordre du jeu (Normal < Hard < Very Hard).
  const difficulty = placed
    .filter((p) => (TOWER_DIFFICULTY_MODES as readonly string[]).includes(p.tower.mode))
    .sort(
      (a, b) =>
        TOWER_DIFFICULTY_MODES.indexOf(a.tower.mode as (typeof TOWER_DIFFICULTY_MODES)[number]) -
        TOWER_DIFFICULTY_MODES.indexOf(b.tower.mode as (typeof TOWER_DIFFICULTY_MODES)[number]),
    );

  // Section ÉLÉMENTAIRE, dans l'ordre canonique des éléments (Fire…Dark).
  const elemental = placed
    .filter((p) => p.tower.mode === TOWER_ELEMENT_MODE && p.tower.element)
    .sort(
      (a, b) =>
        ELEMENT_ORDER.indexOf(a.tower.element as (typeof ELEMENT_ORDER)[number]) -
        ELEMENT_ORDER.indexOf(b.tower.element as (typeof ELEMENT_ORDER)[number]),
    );

  return (
    <div className="space-y-8">
      {difficulty.length > 0 && (
        <section>
          <h2 className="mb-4">{t('guides.skyward_tower.difficulty')}</h2>
          <div className="flex flex-wrap justify-center gap-4">
            {difficulty.map(({ guide }) => (
              <DifficultyCard key={guide.slug} guide={guide} lang={lang} />
            ))}
          </div>
        </section>
      )}

      {elemental.length > 0 && (
        <section>
          <h2 className="mb-4">{t('guides.skyward_tower.elemental')}</h2>
          <div className="flex flex-wrap justify-center gap-3">
            {elemental.map(({ guide, tower }) => (
              <ElementalCard key={guide.slug} guide={guide} lang={lang} element={tower.element!} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

/** Tour de difficulté : bannière large, nom en tête, description en pied. */
function DifficultyCard({ guide, lang }: { guide: Guide; lang: Lang }) {
  const name = lRec(guide.title, lang);
  return (
    <Link
      href={localePath(lang, `/guides/${guide.category}/${guide.slug}`)}
      className="group ring-line-subtle relative h-32 w-full overflow-hidden rounded-lg ring-1 transition-all hover:ring-yellow-400/50 sm:w-75"
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- asset R2/staging */}
      <img
        src={img.guideIcon(guide.icon)}
        alt={name}
        loading="lazy"
        className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
      />
      <div className="from-surface-sunken/80 via-surface-sunken/20 absolute inset-0 bg-linear-to-t to-transparent" />
      <div className="absolute inset-0 flex flex-col justify-between p-3">
        <p className="text-content-strong text-lg font-bold drop-shadow-lg">{name}</p>
        <p className="text-content-muted line-clamp-3 text-[10px] drop-shadow-lg sm:text-xs">
          {lRec(guide.description, lang)}
        </p>
      </div>
    </Link>
  );
}

/** Tour élémentaire : carte haute, icône + nom d'élément en tête, accent coloré. */
function ElementalCard({ guide, lang, element }: { guide: Guide; lang: Lang; element: string }) {
  const name = lRec(guide.title, lang);
  const ring = ELEMENT_RING[element] ?? 'hover:ring-yellow-400/50';
  return (
    <Link
      href={localePath(lang, `/guides/${guide.category}/${guide.slug}`)}
      className={`group ring-line-subtle relative h-40 w-[calc((100%-1.5rem)/3)] overflow-hidden rounded-lg ring-1 transition-all sm:h-72 sm:w-36 ${ring}`}
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- asset R2/staging */}
      <img
        src={img.guideIcon(guide.icon)}
        alt={name}
        loading="lazy"
        className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
      />
      <div className="from-surface-sunken/60 absolute inset-0 bg-linear-to-b to-transparent" />
      <div className="from-surface-sunken/80 via-surface-sunken/20 absolute inset-0 bg-linear-to-t to-transparent" />
      <div className="absolute inset-x-0 top-0 flex items-center gap-1 p-2">
        {/* eslint-disable-next-line @next/next/no-img-element -- asset R2/staging */}
        <img src={img.element(element)} alt="" loading="lazy" className="h-4 w-4 drop-shadow-lg" />
        <p className="text-content line-clamp-1 text-xs font-medium drop-shadow-lg">{name}</p>
      </div>
      <div className="absolute inset-x-0 bottom-0 p-2">
        <p className="text-content-muted text-[10px] drop-shadow-lg sm:text-xs">
          {lRec(guide.description, lang)}
        </p>
      </div>
    </Link>
  );
}
