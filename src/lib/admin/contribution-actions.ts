'use server';

/**
 * IMPORT DE CONTRIBUTION (admin, dev-only) — point d'entrée GÉNÉRIQUE.
 *
 * On reçoit un JSON auto-descriptif (cf. `Contribution`) : le `kind` dit à quel
 * guide l'intégrer, `mode` s'il s'agit d'une édition ou d'un ajout. Ici on route
 * par `kind` vers le bon store, on fusionne, on AUTO-TRADUIT ce qui manque
 * (EN → langues vides) puis on ÉCRIT. Un seul tool pour tous les guides : brancher
 * un nouveau `kind` = ajouter un cas au `switch`.
 *
 * Tout se passe côté serveur (traduction = clés API, écriture = fs), d'où la
 * garde `IS_DEV`. Le retour est un résumé texte (jamais de JSX).
 */
import type { CharacterCurated } from '@contracts';
import { IS_DEV } from '@/lib/admin/guard';
import { autoTranslate } from '@/lib/admin/translate-actions';
import { applyTranslation } from '@/lib/admin/translate-fill';
import {
  loadPremiumLimited,
  normalizeReview,
  savePremiumLimited,
  type ReviewEntryData,
} from '@/lib/admin/general-guide-store';
import { getCharacter } from '@/lib/data/characters';
import { getCharacterCurated } from '@/lib/data/curated';
import { upsertCharacterCurated } from '@/lib/admin/curated-store';
import {
  parseContribution,
  CONTRIBUTION_LABELS,
  type Contribution,
  type EditorialContributionPayload,
  type ReviewContributionPayload,
} from '@/lib/contribute/contribution';

export type ImportResult = { ok: true; summary: string } | { ok: false; errors: string[] };

const TARGET_LANGS = ['jp', 'kr', 'zh', 'fr'] as const;

/**
 * Regénère sur place les langues d'une review depuis son EN. Renvoie le nb de
 * traductions CHANGÉES. L'EN de la contribution fait foi : une review éditée
 * arrive avec ses anciennes traductions, qu'il faut donc refaire (cf.
 * `applyTranslation`).
 */
async function retranslateReview(entry: ReviewEntryData): Promise<number> {
  const en = entry.review.en?.trim();
  if (!en) return 0;
  const { results } = await autoTranslate([en], [...TARGET_LANGS]);
  return applyTranslation(entry.review, results[0] ?? {}, TARGET_LANGS);
}

/** Handler `premium-limited-review` : fusion par nom dans le bucket + trad + save. */
async function importReview(c: Contribution): Promise<ImportResult> {
  const payload = c.payload as ReviewContributionPayload;
  if (!payload?.entry) return { ok: false, errors: ['contribution has no review entry.'] };
  const bucket = payload.bucket === 'limited' ? 'limited' : 'premium';
  const entry = normalizeReview(payload.entry);
  if (!entry.name.trim()) return { ok: false, errors: ['review has no hero name.'] };

  const filled = await retranslateReview(entry);

  const data = loadPremiumLimited();
  const list = data.reviews[bucket];
  const idx = list.findIndex((r) => r.name.trim().toLowerCase() === entry.name.toLowerCase());
  const replaced = idx >= 0;
  data.reviews[bucket] = replaced ? list.map((x, j) => (j === idx ? entry : x)) : [...list, entry];

  const errors = await savePremiumLimited(data);
  if (errors.length) return { ok: false, errors };

  const trad = filled ? `, ${filled} translation(s) regenerated` : '';
  const label = CONTRIBUTION_LABELS[c.kind];
  return { ok: true, summary: `${label} › ${bucket} › ${entry.name}: ${replaced ? 'edited' : 'added'}${trad}.` }; // prettier-ignore
}

/* --- Handler `character-pros-cons-synergy` --- */

type LText = Partial<Record<'en' | 'jp' | 'kr' | 'zh' | 'fr', string>>;
const hasText = (t: LText): boolean => Object.values(t).some((v) => v?.trim());

/** Regénère les langues de tous les textes éditoriaux depuis leur EN (un batch). */
async function retranslateEditorial(payload: EditorialContributionPayload): Promise<number> {
  const recs: LText[] = [];
  const collect = (t?: LText) => {
    if (t?.en?.trim()) recs.push(t);
  };
  payload.prosCons?.pros?.forEach(collect);
  payload.prosCons?.cons?.forEach(collect);
  payload.synergies?.forEach((g) => collect(g.reason));
  if (!recs.length) return 0;

  const { results } = await autoTranslate(
    recs.map((r) => r.en!),
    [...TARGET_LANGS],
  );
  let filled = 0;
  recs.forEach((rec, k) => {
    filled += applyTranslation(rec, results[k] ?? {}, TARGET_LANGS);
  });
  return filled;
}

/** Merge la slice éditoriale ÉDITÉE (pros/cons OU synergies) dans le curé d'un perso. */
async function importEditorial(c: Contribution): Promise<ImportResult> {
  const payload = c.payload as EditorialContributionPayload;
  const id = payload?.id?.trim();
  if (!id) return { ok: false, errors: ['contribution has no character id.'] };
  const char = getCharacter(id);
  if (!char) return { ok: false, errors: [`unknown character id “${id}”.`] };

  const filled = await retranslateEditorial(payload);

  // Merge par PRÉSENCE : chaque outil n'édite qu'une slice. Une slice absente du
  // payload est LAISSÉE INTACTE (jamais effacée) ; le reste du curé est préservé.
  const merged: CharacterCurated = { ...getCharacterCurated(id) };
  const parts: string[] = [];
  if (payload.prosCons !== undefined) {
    const pros = (payload.prosCons.pros ?? []).filter(hasText);
    const cons = (payload.prosCons.cons ?? []).filter(hasText);
    if (pros.length || cons.length) merged.prosCons = { pros, cons };
    else delete merged.prosCons;
    parts.push(`${pros.length} pro(s), ${cons.length} con(s)`);
  }
  if (payload.synergies !== undefined) {
    const synergies = payload.synergies.filter((g) => g.heroes?.length);
    if (synergies.length) merged.synergies = synergies;
    else delete merged.synergies;
    parts.push(`${synergies.length} synergy group(s)`);
  }
  if (!parts.length) return { ok: false, errors: ['contribution has no editorial content.'] };

  const errors = await upsertCharacterCurated(id, merged);
  if (errors.length) return { ok: false, errors };

  const trad = filled ? `, ${filled} translation(s) regenerated` : '';
  return { ok: true, summary: `${CONTRIBUTION_LABELS[c.kind]} › ${char.name.en}: ${parts.join(', ')}${trad}.` }; // prettier-ignore
}

/** Point d'entrée : parse l'enveloppe, route par `kind`, intègre et enregistre. */
export async function importContribution(raw: unknown): Promise<ImportResult> {
  if (!IS_DEV) return { ok: false, errors: ['forbidden (dev-only tool).'] };
  let c: Contribution;
  try {
    c = parseContribution(raw);
  } catch (e) {
    return { ok: false, errors: [`Invalid contribution: ${(e as Error).message}`] };
  }

  switch (c.kind) {
    case 'premium-limited-review':
      return importReview(c);
    case 'character-pros-cons':
    case 'character-synergy':
      return importEditorial(c);
    default:
      return { ok: false, errors: [`No handler for kind “${c.kind}”.`] };
  }
}
