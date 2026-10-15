'use server';

/**
 * Server actions de l'APERÇU inline, appelées par les outils publics de
 * contribution (`/contribute/*`) : la résolution vit dans `inline-preview` (voir
 * pourquoi elle est côté serveur et rend des données) ; ici, l'entrée publique.
 *
 * Pourquoi des DONNÉES et pas du JSX : renvoyer un arbre React (composants
 * clients) depuis une action casse le manifeste RSC de Turbopack. Des
 * descripteurs plats traversent l'action sans souci ; le client fait le rendu.
 *
 * PAS de garde `IS_DEV` : aperçu READ-ONLY de données de jeu PUBLIQUES (aucun
 * secret, aucune écriture) — les outils publics de contribution en ont besoin
 * en prod. L'écriture et `autoTranslate` (clés API) restent, elles, dev-only.
 *
 * Chaque appel est borné (`previewBoundsError` : nombre de textes, taille de
 * chacun) et compté par IP. Hors bornes ou au-delà du débit, l'action lève une
 * erreur : refus net, jamais un texte coupé en silence. Les composants gardent
 * alors l'aperçu précédent.
 */
import { headers } from 'next/headers';
import type { InlineSegment, TagCheck } from '@/lib/parse-text';
import { clientIp, createRateLimiter } from '@/lib/rate-limit';
import { previewBoundsError, resolveInlineBatch, resolveInlinePreview } from './inline-preview';

// 240 appels par minute et par IP (4 par seconde), pour les deux actions :
// l'aperçu suit la frappe (un appel par pause de 250 à 300 ms), et l'éditeur
// des pros/cons en lance jusqu'à trois par pause (le champ édité et les deux
// colonnes). Une saisie soutenue reste en dessous.
const rateLimited = createRateLimiter({ max: 240 });

async function admit(texts: unknown): Promise<void> {
  if (rateLimited(clientIp({ headers: await headers() }))) throw new Error('rate_limited');
  const refused = previewBoundsError(texts);
  if (refused) throw new Error(refused);
}

/**
 * Résout + valide un texte éditorial pour la langue donnée. `segments` porte le
 * rendu fidèle (données) ; `checks` la raison précise de chaque tag mort.
 */
export async function renderInlinePreview(
  text: string,
  lang: string,
): Promise<{ segments: InlineSegment[]; checks: TagCheck[] }> {
  await admit([text]);
  return resolveInlinePreview(text, lang);
}

/** Résout un LOT de textes en segments (aperçu des lignes d'un éditeur). */
export async function renderInlineBatch(texts: string[], lang: string): Promise<InlineSegment[][]> {
  await admit(texts);
  return resolveInlineBatch(texts, lang);
}
