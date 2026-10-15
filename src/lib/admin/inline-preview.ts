/**
 * Cœur de l'APERÇU inline : résout le texte éditorial avec les VRAIS résolveurs
 * de `parseText` (mêmes icônes/couleurs/liens que le site) et renvoie des
 * DESCRIPTEURS de segments (données pures, sérialisables) que le client rend
 * avec les vrais composants inline. La VALIDATION (`checkText`) est pliée dans
 * le même aller-retour.
 *
 * Pourquoi la résolution est côté serveur : les résolveurs d'effets/équipement
 * lisent la couche curée sur disque via `node:fs` (exprès — pour refléter les
 * éditions sans rebuild). Ils ne peuvent pas tourner dans le navigateur.
 *
 * Deux appelants : les server actions publiques de `/contribute/*`
 * (`inline-preview-actions`, qui bornent la taille et le débit des appels) et
 * quick, outil local qui appelle ce module directement, sans borne (un guide
 * entier passe en un appel).
 */
import { resolveInlineSegments, checkText, type InlineSegment, type TagCheck } from '@/lib/parse-text'; // prettier-ignore
import { getGuide } from '@/lib/data/guides';
import { GUIDE_CATEGORY_SLUGS } from '@/lib/data/guide-categories';
import { getT } from '@/i18n';
import { normalizeLang } from '@/lib/i18n/config';

/**
 * Bornes d'un appel des actions publiques : au plus 20 textes, de 4 000
 * caractères chacun. L'usage réel en est loin (au 15/10 : 7 textes au plus
 * par appel, 991 caractères pour le plus long texte, une review premium).
 */
export const PREVIEW_MAX_TEXTS = 20;
export const PREVIEW_MAX_CHARS = 4000;

/** Raison du refus d'un lot de textes hors bornes ou mal formé ; `null` s'il passe. */
export function previewBoundsError(texts: unknown): string | null {
  if (!Array.isArray(texts) || texts.some((t) => typeof t !== 'string'))
    return 'texts must be a list of strings';
  if (texts.length > PREVIEW_MAX_TEXTS) return `at most ${PREVIEW_MAX_TEXTS} texts per call`;
  if ((texts as string[]).some((t) => t.length > PREVIEW_MAX_CHARS))
    return `each text must be at most ${PREVIEW_MAX_CHARS} characters`;
  return null;
}

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
export async function resolveInlinePreview(
  text: string,
  lang: string,
): Promise<{ segments: InlineSegment[]; checks: TagCheck[] }> {
  const l = normalizeLang(lang);
  const t = await getT(l);
  const segments = text.trim() ? resolveInlineSegments(text, { lang: l, t }) : [];
  const checks = checkText(text ?? '', { guideHrefExists });
  return { segments, checks };
}

/** Résout un LOT de textes en segments (aperçu des lignes d'un éditeur). */
export async function resolveInlineBatch(
  texts: string[],
  lang: string,
): Promise<InlineSegment[][]> {
  const l = normalizeLang(lang);
  const t = await getT(l);
  return texts.map((text) => (text.trim() ? resolveInlineSegments(text, { lang: l, t }) : []));
}
