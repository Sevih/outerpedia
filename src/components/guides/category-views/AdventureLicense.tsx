import { getT } from '@/i18n';
import { lRec } from '@/lib/i18n/localize';
import { localePath } from '@/lib/navigation';
import { img } from '@/lib/images';
import { EmptyCategory } from './EmptyCategory';
import { LicenseTabs, type LicenseCard } from './LicenseTabs';
import type { CategoryViewProps } from './types';

/**
 * Vue ADVENTURE LICENSE (visuel V2) : galerie de cartes de licence hautes
 * (l'icône du guide EST la carte du jeu, 150×260), en deux onglets — Weekly et
 * Promotion. Les cartes de promotion sont des SPOILERS : face verrouillée
 * (`*_Lock`), un clic la retourne sur la face révélée (`*_Open`) qui mène au
 * guide.
 *
 * Le partage Weekly/Promotion se lit sur l'ICÔNE (`*_Lock` = promotion) : le
 * même signal qui fournit la paire de faces — pas une table de slugs comme en
 * V2 (`promote-*` en dur dans le composant). Tri par `meta.order` quand il
 * existe, sinon alphabétique (titre EN) comme en V2 — contenu permanent, sans
 * calendrier qui l'ordonnerait.
 */
export default async function AdventureLicense({ lang, guides }: CategoryViewProps) {
  const t = await getT(lang);
  if (guides.length === 0) return <EmptyCategory lang={lang} />;

  const weekly: LicenseCard[] = [];
  const promotion: LicenseCard[] = [];
  for (const g of [...guides].sort(
    (a, b) =>
      (a.order ?? Number.MAX_SAFE_INTEGER) - (b.order ?? Number.MAX_SAFE_INTEGER) ||
      a.title.en.localeCompare(b.title.en),
  )) {
    const card: LicenseCard = {
      slug: g.slug,
      href: localePath(lang, `/guides/${g.category}/${g.slug}`),
      name: lRec(g.title, lang),
      src: img.guideIcon(g.icon),
    };
    if (g.icon.endsWith('_Lock')) {
      promotion.push({ ...card, openSrc: img.guideIcon(g.icon.replace(/_Lock$/, '_Open')) });
    } else {
      weekly.push(card);
    }
  }

  return (
    <LicenseTabs
      weekly={weekly}
      promotion={promotion}
      labels={{
        weekly: t('guides.adventure_license.weekly'),
        promotion: t('guides.adventure_license.promotion'),
        reveal: t('guides.adventure_license.reveal'),
      }}
    />
  );
}
