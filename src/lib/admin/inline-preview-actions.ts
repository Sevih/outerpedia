'use server';

/**
 * Server action de l'APERÇU inline (admin) : résout le texte éditorial avec les
 * VRAIS résolveurs de `parseText` (mêmes icônes/couleurs/liens que le site) et
 * renvoie des DESCRIPTEURS de segments (données pures, sérialisables) que le
 * composant client rend avec les vrais composants inline. On plie la VALIDATION
 * (`checkText`) dans le même aller-retour.
 *
 * Pourquoi la résolution est ici (serveur) : les résolveurs d'effets/équipement
 * lisent la couche curée sur disque via `node:fs` (exprès — pour refléter tes
 * éditions sans rebuild). Ils ne peuvent pas tourner dans le navigateur.
 *
 * Pourquoi des DONNÉES et pas du JSX : renvoyer un arbre React (composants
 * clients) depuis une action casse le manifeste RSC de Turbopack. Des
 * descripteurs plats traversent l'action sans souci ; le client fait le rendu.
 *
 * Garde `IS_DEV` : outil local. La future version publique (comptes) remplacera
 * ce garde par une auth — voir la note de contribution publique.
 */
import { resolveInlineSegments, checkText, type InlineSegment, type TagCheck } from '@/lib/parse-text'; // prettier-ignore
import { getGuide } from '@/lib/data/guides';
import { GUIDE_CATEGORY_SLUGS } from '@/lib/data/guide-categories';
import { getT } from '@/i18n';
import { normalizeLang } from '@/lib/i18n/config';
import { IS_DEV } from '@/lib/admin/guard';

/** Existence d'une cible interne `/guides/…` (même règle que la gate CI). */
function guideHrefExists(href: string): boolean {
  const m = /^\/guides(?:\/([^/]+)(?:\/([^/]+))?)?\/?$/.exec(href.trim());
  if (!m) return false;
  const [, cat, slug] = m;
  if (!cat) return true; // landing racine
  if (!(GUIDE_CATEGORY_SLUGS as readonly string[]).includes(cat)) return false;
  if (!slug) return true; // landing de catégorie
  return Boolean(getGuide(cat, slug));
}

/**
 * Résout + valide un texte éditorial pour la langue donnée. `segments` porte le
 * rendu fidèle (données) ; `checks` la raison précise de chaque tag mort.
 */
export async function renderInlinePreview(
  text: string,
  lang: string,
): Promise<{ segments: InlineSegment[]; checks: TagCheck[] }> {
  if (!IS_DEV) return { segments: [], checks: [] };
  const l = normalizeLang(lang);
  const t = await getT(l);
  const segments = text.trim() ? resolveInlineSegments(text, { lang: l, t }) : [];
  const checks = checkText(text ?? '', { guideHrefExists });
  return { segments, checks };
}

/** Résout un LOT de textes en segments (aperçu des lignes d'un éditeur). */
export async function renderInlineBatch(texts: string[], lang: string): Promise<InlineSegment[][]> {
  if (!IS_DEV) return texts.map(() => []);
  const l = normalizeLang(lang);
  const t = await getT(l);
  return texts.map((text) => (text.trim() ? resolveInlineSegments(text, { lang: l, t }) : []));
}
