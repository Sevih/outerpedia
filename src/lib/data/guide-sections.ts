/**
 * TITRES DE SECTION d'un guide de boss — GÉNÉRÉS depuis la donnée, jamais
 * recopiés.
 *
 * En V2, chaque guide portait ses propres `LangMap` de titres d'équipe, en dur
 * dans son TSX. Résultat mécanique : la dérive. « Mero team strategy » dans
 * trois guides, « Mero strategy » dans deux autres ; le japonais de
 * `GDAHLIA_TITLE` divergeait d'un fichier à l'autre. Treize copies d'une même
 * chose finissent toujours par ne plus être la même chose.
 *
 * Ici, une section déclare CE QUI LA CARACTÉRISE — un personnage, un élément, un
 * effet — et le titre se fabrique : le nom vient du catalogue (donc correct en
 * JP/KR/ZH, ce que la V2 ne garantissait pas), seul le gabarit est une clé i18n.
 * Une référence introuvable JETTE : c'est une erreur de contenu, elle doit
 * casser le build comme les tags de `parse-text`.
 */
import type { LocalizedText } from '@contracts';
import type { Lang } from '@/lib/i18n/config';
import type { TFunction, TranslationKey } from '@/i18n';
import { lRec } from '@/lib/i18n/localize';
import glossariesData from '@data/generated/glossaries.json';
import type { Glossaries } from '@contracts';
import { characterDisplayName, findCharacterByName } from '@/lib/data/characters';
import { resolveEffectKey } from '@/lib/data/effects';

const G = glossariesData as unknown as Glossaries;

/** Titres génériques déjà traduits (`guides.tips.*`). */
const PRESETS = [
  'tactical',
  'strategy',
  'general',
  'important',
  'mechanics',
  'phase1',
  'phase2',
  'transition',
] as const;
export type SectionPreset = (typeof PRESETS)[number];

/**
 * Ce qui caractérise une section. EXACTEMENT une forme — un objet qui en cumule
 * deux (ou aucune) est une erreur de contenu.
 */
export type SectionTitle =
  | { preset: SectionPreset }
  /** Nom d'affichage EN du perso (même convention que `characters` / `slots`). */
  | { character: string }
  /** Slug d'élément (`fire`, `water`…). */
  | { element: string }
  /** Clé éditoriale d'effet (`BT_DOT_BURN`, `FREEZE`…). */
  | { effect: string; side?: 'buff' | 'debuff' }
  /** Échappatoire explicite, pour ce qui ne rentre dans aucun modèle. */
  | { title: LocalizedText & { en: string } };

/** Le sujet d'une section, localisé (nom de perso, d'élément, d'effet). */
function subject(spec: SectionTitle, lang: Lang, at: string): string {
  if ('character' in spec) {
    const c = findCharacterByName(spec.character);
    if (!c) throw new Error(`${at} : personnage « ${spec.character} » introuvable`);
    return characterDisplayName(c, lang);
  }
  if ('element' in spec) {
    const e = G.elements?.[spec.element];
    if (!e) throw new Error(`${at} : élément « ${spec.element} » inconnu`);
    return lRec(e, lang);
  }
  if ('effect' in spec) {
    // `resolveEffectKey` cherche déjà le côté demandé PUIS l'opposé PUIS le curé
    // (cf. effects.ts) — un second appel côté inversé serait donc inopérant.
    const e = resolveEffectKey(spec.side ?? 'debuff', spec.effect);
    if (!e) throw new Error(`${at} : effet « ${spec.effect} » introuvable dans le glossaire`);
    return lRec(e.name, lang);
  }
  throw new Error(`${at} : forme de titre non reconnue`);
}

/**
 * Titre d'une section. `kind` choisit le gabarit : une section de conseils dit
 * « stratégie {sujet} », un bloc d'équipe dit « équipe {sujet} ».
 */
export function resolveSectionTitle(
  spec: SectionTitle,
  kind: 'tips' | 'team',
  lang: Lang,
  t: TFunction,
  at: string,
): string {
  if ('title' in spec) return lRec(spec.title, lang);
  if ('preset' in spec) {
    if (!PRESETS.includes(spec.preset)) {
      throw new Error(`${at} : préréglage « ${spec.preset} » inconnu (${PRESETS.join(', ')})`);
    }
    return t(`guides.tips.${spec.preset}` as TranslationKey);
  }
  const name = subject(spec, lang, at);
  return t(kind === 'tips' ? 'guides.tips.for' : 'guides.team.for', { name });
}
