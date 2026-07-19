/**
 * Édition des GUIDES GÉNÉRAUX à contenu BESPOKE — réservée à l'ADMIN local
 * (dev-only). Contrairement à la famille de boss (modèle unifié piloté par
 * `CatSpec`), chaque guide général a sa propre forme : ici un REGISTRE des
 * fragments éditables (slug → parties), chacun lu/écrit dans son JSON local,
 * que le guide importe statiquement au rendu.
 *
 * Premier fragment branché : `free-heroes-start-banner` → les SOURCES de héros
 * gratuits (onglet « Free Heroes »). D'autres suivront (un fragment = un JSON).
 */
import { resolve } from 'node:path';
import { readFileSync } from 'node:fs';
import { writeJson } from '@datagen/lib/json';
import type { LocalizedText } from '@contracts';
import { findCharacterByName } from '@/lib/data/characters';

const CONTENTS_DIR = resolve(process.cwd(), 'src/app/[lang]/guides/_contents');
const GENERAL_DIR = resolve(CONTENTS_DIR, 'general-guides');

/* --- Modèle « sources de héros gratuits » (miroir de free-heroes-sources.json) --- */

export interface FreeHeroEntryData {
  names: string[];
  pickType: 'one' | 'all';
  reason: LocalizedText;
}
export interface FreeHeroSourceData {
  source: LocalizedText;
  entries: FreeHeroEntryData[];
}
export interface FreeHeroesData {
  sources: FreeHeroSourceData[];
}

/** Slugs de general-guides dont un fragment est éditable ici (+ libellé de liste). */
export const EDITABLE_GENERAL_GUIDES: Record<string, string> = {
  'free-heroes-start-banner': 'Free Heroes & Starter Banners',
};

export function isEditableGeneralGuide(slug: string): boolean {
  return slug in EDITABLE_GENERAL_GUIDES;
}

const freeHeroesPath = () =>
  resolve(GENERAL_DIR, 'free-heroes-start-banner', 'free-heroes-sources.json');

/** Lit les sources de héros gratuits dans leur JSON local. */
export function loadFreeHeroes(): FreeHeroesData {
  const raw = JSON.parse(readFileSync(freeHeroesPath(), 'utf8')) as FreeHeroesData;
  return { sources: raw.sources ?? [] };
}

/**
 * Valide puis écrit les sources de héros gratuits. Renvoie les écarts bloquants
 * (vide = OK) : chaque source doit avoir un libellé EN et au moins une entrée ;
 * chaque entrée au moins un héros ; chaque nom de héros doit RÉSOUDRE (même
 * garde que le build, mais sans casser — on remonte l'erreur à l'éditeur).
 */
export async function saveFreeHeroes(data: FreeHeroesData): Promise<string[]> {
  const errors: string[] = [];
  const sources = data.sources ?? [];

  sources.forEach((s, si) => {
    const at = `Source ${si + 1}`;
    if (!s.source?.en?.trim()) errors.push(`${at} : le libellé EN est requis.`);
    if (!s.entries?.length) errors.push(`${at} : au moins une entrée est requise.`);
    s.entries?.forEach((e, ei) => {
      const eat = `${at}, entrée ${ei + 1}`;
      if (!e.names?.length) errors.push(`${eat} : au moins un héros est requis.`);
      e.names?.forEach((n) => {
        if (!findCharacterByName(n)) errors.push(`${eat} : héros inconnu « ${n} ».`);
      });
      if (e.pickType !== 'one' && e.pickType !== 'all')
        errors.push(`${eat} : type de choix invalide.`);
    });
  });
  if (errors.length) return errors;

  await writeJson(freeHeroesPath(), { sources });
  return [];
}
