/**
 * Store des ÉVÉNEMENTS communautaires (couche curée éditable, ADMIN local).
 *
 * Écrit `data/curated/events.json` au format canonique (`writeJson`) ; la route
 * de sauvegarde publie ensuite la copie runtime sur R2 — un événement paraît en
 * prod sans redéploiement (cf. `runtime-publish`). Aucun regen V2 : la V2
 * stockait ses événements en COMPOSANTS, il n'y a rien à réimporter (les deux
 * seuls existants ont été transplantés à la main dans le nouveau modèle).
 *
 * `validateEvents` est le cœur PUR (testé) : il décrit ce qui rend un événement
 * publiable. Tout le reste (rendu, admin) suppose ces invariants tenus.
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { writeJson } from '@datagen/lib/json';
import {
  EVENT_TYPES,
  EVENT_VIDEO_PLATFORMS,
  type EventBlock,
  type EventEntry,
} from '@/lib/data/events';

const EVENTS_PATH = resolve(process.cwd(), 'data/curated/events.json');

/** Slug d'URL : minuscules, chiffres, tirets et souligné de tête (`_no-peaking`). */
const SLUG_RE = /^_?[a-z0-9]+(?:-[a-z0-9]+)*$/;
const HTTP_RE = /^https?:\/\/\S+$/;

export function loadEventsForAdmin(): EventEntry[] {
  try {
    const data = JSON.parse(readFileSync(EVENTS_PATH, 'utf8')) as unknown;
    return Array.isArray(data) ? (data as EventEntry[]) : [];
  } catch {
    return [];
  }
}

const isIso = (s: string | undefined): boolean => !!s && !Number.isNaN(Date.parse(s));
const hasEn = (m: { en?: string } | undefined): boolean => !!m?.en?.trim();

/** Écarts BLOQUANTS d'un bloc (préfixés de sa position pour l'éditeur). */
function validateBlock(block: EventBlock, at: string, errors: string[]): void {
  switch (block.kind) {
    case 'prose':
    case 'callout':
      if (!hasEn(block.text)) errors.push(`${at} : texte EN requis.`);
      break;
    case 'list':
      if (!block.items?.length) errors.push(`${at} : au moins une puce.`);
      block.items?.forEach((item, i) => {
        if (!hasEn(item)) errors.push(`${at}, puce ${i + 1} : texte EN requis.`);
      });
      break;
    case 'sections':
      if (!block.items?.length) errors.push(`${at} : au moins une sous-section.`);
      block.items?.forEach((s, i) => {
        if (!hasEn(s.title)) errors.push(`${at}, sous-section ${i + 1} : titre EN requis.`);
        if (!hasEn(s.text)) errors.push(`${at}, sous-section ${i + 1} : texte EN requis.`);
      });
      break;
    case 'timeline':
      // Rien à valider ici : le bloc rend `meta.phases`, validées à part. Sans
      // jalon il ne rend rien — c'est un avertissement, pas une faute.
      break;
    case 'cta':
      if (!hasEn(block.label)) errors.push(`${at} : libellé EN requis.`);
      if (!HTTP_RE.test(block.href ?? '')) errors.push(`${at} : URL http(s) requise.`);
      break;
    case 'videos':
      if (!block.entries?.length) errors.push(`${at} : au moins une vidéo.`);
      block.entries?.forEach((v, i) => {
        const vat = `${at}, vidéo ${i + 1}`;
        if (!v.id?.trim()) errors.push(`${vat} : identifiant requis.`);
        if (!v.title?.trim()) errors.push(`${vat} : titre requis.`);
        if (!EVENT_VIDEO_PLATFORMS.includes(v.platform))
          errors.push(`${vat} : plateforme invalide (« ${v.platform} »).`);
      });
      break;
    case 'image':
      if (!block.src?.startsWith('/'))
        errors.push(`${at} : chemin R2 requis (commence par « / »).`);
      break;
    default:
      errors.push(`${at} : type de bloc inconnu (« ${(block as { kind: string }).kind} »).`);
  }
}

/**
 * Valide la liste complète. Renvoie les écarts BLOQUANTS (vide = publiable).
 * Règle de base commune aux éditeurs V3 : l'ANGLAIS est requis (les autres
 * langues sont un repli), les dates sont ISO, les slugs uniques.
 */
export function validateEvents(list: EventEntry[]): string[] {
  const errors: string[] = [];
  const seen = new Set<string>();

  list.forEach((e, i) => {
    const at = `Événement ${i + 1} (${e.slug || '?'})`;
    if (!SLUG_RE.test(e.slug ?? '')) errors.push(`${at} : slug invalide (a-z, 0-9, tirets).`);
    else if (seen.has(e.slug)) errors.push(`${at} : slug en double.`);
    else seen.add(e.slug);

    if (!EVENT_TYPES.includes(e.type)) errors.push(`${at} : type invalide (« ${e.type} »).`);
    if (!hasEn(e.title)) errors.push(`${at} : titre EN requis.`);
    if (!isIso(e.start)) errors.push(`${at} : date de début invalide (ISO attendue).`);
    if (!isIso(e.end)) errors.push(`${at} : date de fin invalide (ISO attendue).`);
    if (isIso(e.start) && isIso(e.end) && Date.parse(e.end) < Date.parse(e.start))
      errors.push(`${at} : la fin précède le début.`);
    if (e.cover && !e.cover.startsWith('/'))
      errors.push(`${at} : bannière — chemin R2 attendu (commence par « / »).`);

    (e.phases ?? []).forEach((p, pi) => {
      const pat = `${at}, jalon ${pi + 1}`;
      if (!isIso(p.until)) errors.push(`${pat} : date invalide (ISO attendue).`);
      if (!hasEn(p.label)) errors.push(`${pat} : libellé EN requis.`);
    });

    if (!e.blocks?.length) errors.push(`${at} : au moins un bloc de contenu.`);
    e.blocks?.forEach((b, bi) => validateBlock(b, `${at}, bloc ${bi + 1} (${b.kind})`, errors));
  });

  return errors;
}

/** Valide puis écrit. Renvoie les écarts bloquants (vide = OK, écrit). */
export async function saveEvents(list: EventEntry[]): Promise<string[]> {
  const errors = validateEvents(list);
  if (errors.length) return errors;
  await writeJson(EVENTS_PATH, list);
  return [];
}
