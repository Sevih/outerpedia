import { getT } from '@/i18n';
import { formatGuideDate, guideUpdatedDate } from '@/lib/data/guides';
import { GuideCard } from '@/components/guides/GuideCard';
import type { CategoryViewProps } from './types';

/**
 * Vue par DÉFAUT : grille de cartes. Toute catégorie sans vue dédiée l'obtient
 * automatiquement — une catégorie n'est jamais vide « par oubli d'enregistrement »
 * (en V2, une vue non enregistrée dans le registre donnait une page nue).
 */
export default async function DefaultGrid({ lang, guides }: CategoryViewProps) {
  const t = await getT(lang);
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {guides.map((g) => (
        <GuideCard
          key={g.slug}
          guide={g}
          lang={lang}
          updatedText={`${t('page.guide.updated', {
            date: formatGuideDate(guideUpdatedDate(g), lang),
          })} · ${g.author}`}
        />
      ))}
    </div>
  );
}
