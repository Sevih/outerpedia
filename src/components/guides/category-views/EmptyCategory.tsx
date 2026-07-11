import { getT } from '@/i18n';
import type { Lang } from '@/lib/i18n/config';

/**
 * État vide d'une catégorie. Rendu par les vues qui n'ont RIEN à montrer sans
 * guides — pas par la page : une vue peut avoir du contenu propre (la rotation
 * de Singularity vaut d'être affichée même sans un seul guide porté).
 */
export async function EmptyCategory({ lang }: { lang: Lang }) {
  const t = await getT(lang);
  return <p className="text-content-muted text-sm">{t('page.guides.empty_category')}</p>;
}
