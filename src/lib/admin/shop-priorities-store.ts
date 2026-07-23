/**
 * Édition des PRIORITÉS DE SHOP (guide shop-purchase-priorities) — ADMIN local.
 *
 * Deux surfaces, deux stockages (cf. le guide) :
 *   - 8 shops DÉRIVÉS du jeu : seuls priorité S/A/B/C + notes sont curés, dans
 *     l'overlay `data/curated/shop-priorities.json`, keyé par le slug STABLE
 *     `shop/<goods>/<période>` (insensible au prix/rotation). Le factuel
 *     (nom/coût/limite) vient de `ProductTemplet` — jamais curé.
 *   - shops ÉDITORIAUX (Event, Resource, Supply, Rico) + notes de shop : tout
 *     est éditorial, dans `shop-editorial.json` à côté du guide.
 *
 * À la sauvegarde des dérivés, on RÉGÉNÈRE `data/generated/shop-priorities.json`
 * (via le générateur, comme l'intégration monstre lance `buildMonsters`) pour
 * que l'aperçu du guide soit à jour sans passer par `pnpm datagen:build`.
 */
import { resolve } from 'node:path';
import { readFileSync } from 'node:fs';
import { writeJson } from '@datagen/lib/json';
import { buildShopPriorities } from '@datagen/generators/shop-priorities';
import type { LocalizedText, ShopSection } from '@contracts';
import type {
  EditorialItem,
  ShopEditorial,
  TextShop,
} from '@/app/[lang]/guides/_contents/general-guides/shop-purchase-priorities/editorial';

export type { EditorialItem, ShopEditorial, TextShop };

type Priority = 'S' | 'A' | 'B' | 'C';

const CURATED_PATH = resolve(process.cwd(), 'data/curated/shop-priorities.json');
const GENERATED_PATH = resolve(process.cwd(), 'data/generated/shop-priorities.json');
const EDITORIAL_PATH = resolve(
  process.cwd(),
  'src/app/[lang]/guides/_contents/general-guides/shop-purchase-priorities/shop-editorial.json',
);

const hasText = (t?: LocalizedText): boolean =>
  t ? Object.values(t).some((v) => v?.trim()) : false;

/* --- Overlay curé des shops dérivés --- */

/** Un produit dérivé, factuel en lecture seule + l'éditorial (priorité/notes). */
export interface DerivedRow {
  /** Slug stable (clé de l'overlay). */
  key: string;
  name: LocalizedText;
  icon: string;
  iconKind: 'item' | 'equipment';
  grade: string;
  gives: number;
  cost: number;
  limit: { count: number; period: string };
  priority?: Priority;
  notes?: LocalizedText;
}

export interface DerivedShop {
  key: string;
  currency: { name: LocalizedText; icon: string };
  rows: DerivedRow[];
}

/** Éditorial curé d'un slug (ce que l'admin peut modifier sur un dérivé). */
export interface OverlayEntry {
  priority?: Priority;
  notes?: LocalizedText;
}

export interface ShopPrioritiesEditData {
  /** Shops dérivés du jeu (factuel figé + priorité/notes éditables). */
  derived: DerivedShop[];
  /** Contenu éditorial pur (tables, textes, notes). */
  editorial: ShopEditorial;
}

/** Payload de sauvegarde envoyé par l'éditeur. */
export interface ShopPrioritiesSaveData {
  /** Overlay des dérivés : slug → priorité/notes (entrée vide = clé supprimée). */
  overlay: Record<string, OverlayEntry>;
  editorial: ShopEditorial;
}

function readCurated(): Record<string, OverlayEntry & { _doc?: string }> {
  try {
    return JSON.parse(readFileSync(CURATED_PATH, 'utf8').replace(/^﻿/, ''));
  } catch {
    return {};
  }
}

function readEditorial(): ShopEditorial {
  const raw = JSON.parse(readFileSync(EDITORIAL_PATH, 'utf8').replace(/^﻿/, ''));
  return {
    shopNotes: raw.shopNotes ?? {},
    textShops: raw.textShops ?? {},
    eventItems: raw.eventItems ?? [],
    resourceItems: raw.resourceItems ?? [],
  };
}

/** Vue fusionnée pour l'éditeur : dérivés (frais) + éditorial (fichier). */
export function loadShopPriorities(): ShopPrioritiesEditData {
  const built = buildShopPriorities();
  const derived: DerivedShop[] = built.shops.map((s: ShopSection) => ({
    key: s.key,
    currency: { name: s.currency.name, icon: s.currency.icon },
    rows: s.entries.map((e) => ({
      key: e.key,
      name: e.name,
      icon: e.icon,
      iconKind: e.iconKind,
      grade: e.grade,
      gives: e.gives,
      cost: e.cost,
      limit: e.limit,
      ...(e.priority ? { priority: e.priority } : {}),
      ...(e.notes ? { notes: e.notes } : {}),
    })),
  }));
  return { derived, editorial: readEditorial() };
}

/* --- Sauvegarde --- */

/** Valide un item éditorial (au moins un nom, priorité connue si présente). */
function validateEditorialItem(it: EditorialItem, at: string, errors: string[]): void {
  if (!it.name?.trim() && !hasText(it.label))
    errors.push(`${at}: an item name (or label) is required.`);
  if (it.priority && !['S', 'A', 'B', 'C'].includes(it.priority))
    errors.push(`${at}: unknown priority “${it.priority}”.`);
}

function validateEditorial(ed: ShopEditorial, errors: string[]): void {
  ed.eventItems.forEach((it, i) => validateEditorialItem(it, `Event item ${i + 1}`, errors));
  ed.resourceItems.forEach((it, i) => validateEditorialItem(it, `Resource item ${i + 1}`, errors));
  for (const [key, shop] of Object.entries(ed.textShops)) {
    (shop as TextShop).paragraphs.forEach((p, i) => {
      if (!p.en?.trim())
        errors.push(`Text shop “${key}”, paragraph ${i + 1}: EN text is required.`);
    });
  }
}

/**
 * Écrit l'overlay curé (priorité/notes par slug), régénère le dérivé, et écrit
 * l'éditorial. Renvoie les écarts bloquants (vide = OK).
 *
 * Overlay : MERGE sur l'existant — une clé non montrée par l'éditeur (produit
 * hors rotation courante) est PRÉSERVÉE (le slug stable la rattrapera au retour
 * du produit). Une entrée sans priorité ni note = clé supprimée.
 */
export async function saveShopPriorities(data: ShopPrioritiesSaveData): Promise<string[]> {
  const errors: string[] = [];
  validateEditorial(data.editorial, errors);
  if (errors.length) return errors;

  // Overlay : repart de l'existant (préserve `_doc` + les slugs hors rotation).
  const existing = readCurated();
  const doc = existing._doc;
  const next: Record<string, OverlayEntry> = {};
  for (const [k, v] of Object.entries(existing)) {
    if (k === '_doc') continue;
    next[k] = v;
  }
  for (const [slug, entry] of Object.entries(data.overlay)) {
    const clean: OverlayEntry = {};
    if (entry.priority) clean.priority = entry.priority;
    if (hasText(entry.notes)) clean.notes = entry.notes;
    if (Object.keys(clean).length) next[slug] = clean;
    else delete next[slug];
  }
  const sorted: Record<string, unknown> = {};
  if (doc) sorted._doc = doc;
  for (const k of Object.keys(next).sort((a, b) =>
    a.localeCompare(b, undefined, { numeric: true }),
  ))
    sorted[k] = next[k];
  await writeJson(CURATED_PATH, sorted);

  // Régénère le dérivé (l'overlay vient d'être écrit → priorités à jour).
  await writeJson(GENERATED_PATH, buildShopPriorities());

  // Éditorial (contenu pur).
  await writeJson(EDITORIAL_PATH, {
    _doc: (readEditorialDoc() ?? '').trim() || undefined,
    shopNotes: data.editorial.shopNotes,
    textShops: data.editorial.textShops,
    eventItems: data.editorial.eventItems,
    resourceItems: data.editorial.resourceItems,
  });
  return [];
}

/** `_doc` de l'éditorial, préservé à la réécriture. */
function readEditorialDoc(): string | undefined {
  try {
    return JSON.parse(readFileSync(EDITORIAL_PATH, 'utf8').replace(/^﻿/, ''))._doc;
  } catch {
    return undefined;
  }
}
