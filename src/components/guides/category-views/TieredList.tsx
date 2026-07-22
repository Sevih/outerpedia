import Link from 'next/link';
import { getT } from '@/i18n';
import { lRec } from '@/lib/i18n/localize';
import { localePath } from '@/lib/navigation';
import { img } from '@/lib/images';
import { GUIDE_TIERS, GUIDE_TIER_KEYS } from '@/lib/data/guide-categories';
import { formatGuideDate, guideUpdatedDate, type Guide } from '@/lib/data/guides';
import type { Lang } from '@/lib/i18n/config';
import { EmptyCategory } from './EmptyCategory';
import type { CategoryViewProps } from './types';

/**
 * Vue PALIERS (`general-guides`) : parcours pédagogique, un bloc par palier.
 *
 * Le palier vient du meta (`tier`), pas d'une map slug→palier tenue à la main
 * dans le composant comme en V2 : là-bas, un guide oublié dans la map était
 * simplement filtré et disparaissait de la page sans erreur. Ici `tier` est
 * exigé au scan (cf. `requires` de la catégorie) — aucun guide ne peut se
 * perdre, et l'ordre de lecture est déclaré en donnée.
 */
export default async function TieredList({ lang, guides }: CategoryViewProps) {
  const t = await getT(lang);
  if (guides.length === 0) return <EmptyCategory lang={lang} />;
  const tiers = GUIDE_TIER_KEYS.map((key) => ({
    key,
    label: lRec(GUIDE_TIERS[key].label, lang),
    items: guides.filter((g) => g.tier === key),
  })).filter((tier) => tier.items.length > 0);

  return (
    <div className="flex flex-col gap-10">
      {tiers.map((tier) => (
        <section key={tier.key} className="flex flex-col gap-5">
          <header className="border-line-subtle relative border-b pb-3">
            <span
              className="bg-accent absolute -bottom-px left-0 h-0.5 w-12 rounded-full"
              aria-hidden
            />
            <span className="text-accent font-mono text-[11px] font-semibold tracking-[0.18em] uppercase">
              {tier.label}
            </span>
          </header>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {tier.items.map((guide) => (
              <LessonCard
                key={guide.slug}
                guide={guide}
                lang={lang}
                by={t('page.guide.by', { author: guide.author })}
                date={formatGuideDate(guideUpdatedDate(guide), lang)}
              />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

/** Carte « leçon » : icône encadrée, titre, description, méta en pied. */
function LessonCard({
  guide,
  lang,
  by,
  date,
}: {
  guide: Guide;
  lang: Lang;
  by: string;
  date: string;
}) {
  return (
    <Link
      href={localePath(lang, `/guides/${guide.category}/${guide.slug}`)}
      className="border-line-subtle bg-surface-raised hover:border-accent/50 group flex items-start gap-3 rounded-xl border p-4 transition-[transform,border-color] duration-150 hover:-translate-y-px"
    >
      <div className="border-line-subtle bg-surface flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border">
        <img
          src={img.guideIcon(guide.icon)}
          alt=""
          aria-hidden
          className="h-9 w-9 object-contain"
          loading="lazy"
          width={36}
          height={36}
        />
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        <h3 className="text-content-strong group-hover:text-accent text-sm font-semibold tracking-tight transition-colors">
          {lRec(guide.title, lang)}
        </h3>
        <p className="text-content-muted text-xs">{lRec(guide.description, lang)}</p>
        <div className="text-content-muted mt-auto flex items-center justify-between gap-3 pt-2 font-mono text-[9.5px] tracking-[0.12em] uppercase">
          <span>{by}</span>
          <span>{date}</span>
        </div>
      </div>
    </Link>
  );
}
