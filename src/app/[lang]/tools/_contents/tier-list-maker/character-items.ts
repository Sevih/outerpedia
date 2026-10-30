import type { Lang } from '@/lib/i18n/config';
import { lRec } from '@/lib/i18n/localize';
import { characterNamePrefix, getAllCharacters } from '@/lib/data/characters';
import { loadShortNames } from '@/lib/data/short-names';
import { characterTags, loadCuratedCharacters } from '@/lib/data/curated';
import { img } from '@/lib/images';
import type { TierItem } from './contracts';

/**
 * Pool PERSONNAGES du Tier List Maker (extrait d'`index.tsx` pour être testé) :
 * chaque personnage de base, trié par nom localisé, suivi de ses costumes puis
 * de sa forme Core Fusion s'il en a une — un héros à part entière, classé
 * séparément de sa forme de base (`isFusion`, cf. `buildCanon` pour la
 * stabilité des liens de partage).
 */
export function buildCharacterItems(lang: Lang): TierItem[] {
  const shorts = loadShortNames();
  // Tags CURÉS COMPRIS et triés canoniquement : `Character.tags` seul n'a pas
  // `free` (tag humain, couche curée) — les pills « Free » ne matchaient donc
  // jamais rien. Le curé se charge une fois, pas une lecture par perso.
  const curated = loadCuratedCharacters();
  const all = getAllCharacters();
  const fusionsByOrigin = new Map<string, typeof all>();
  for (const c of all) {
    if (!c.originalCharacter) continue;
    const list = fusionsByOrigin.get(c.originalCharacter) ?? [];
    list.push(c);
    fusionsByOrigin.set(c.originalCharacter, list);
  }
  const bases = all
    .filter((c) => !c.originalCharacter)
    .map((c) => ({ c, label: lRec(c.name, lang) }))
    .sort((a, b) => a.label.localeCompare(b.label));

  // Personnages, chacun suivi de ses costumes — les 99 modèles de costume ont
  // leurs sprites FI_/CT_ sur R2 (collecte `appearances`).
  const characters: TierItem[] = [];
  for (const { c, label } of bases) {
    const short = shorts[c.id]?.[lang];
    characters.push({
      key: `c${c.id}`,
      label,
      short,
      img: img.face(c.id),
      cardId: c.id,
      // Le portrait écrit le titre et le nom dans DEUX champs séparés : `label`
      // reste le nom nu, le titre voyage à côté (cf. `characterDisplayName`).
      prefix: characterNamePrefix(c, lang) ?? undefined,
      element: c.element,
      cls: c.class,
      rarity: c.rarity,
      tags: characterTags(c, curated),
    });
    for (const cos of c.costumes ?? []) {
      if (!cos.model || cos.model === '0' || cos.model === c.id) continue;
      characters.push({
        key: `c${cos.model}`,
        label: lRec(cos.name, lang),
        short: shorts[cos.model]?.[lang],
        img: img.face(cos.model),
        cardId: cos.model,
        // un costume garde l'élément/classe/rareté du personnage
        element: c.element,
        cls: c.class,
        rarity: c.rarity,
        tags: characterTags(c, curated),
        isSkin: true,
        baseLabel: label,
        baseShort: short,
      });
    }
    // Forme Core Fusion : ses propres élément, classe et tags ; la rareté
    // AFFICHÉE (`rarity`, 3) comme la fiche et `CharacterCard`, pas l'étoile de
    // progression de l'origine. Pas de costume.
    for (const f of fusionsByOrigin.get(c.id) ?? []) {
      characters.push({
        key: `c${f.id}`,
        label: lRec(f.name, lang),
        short: shorts[f.id]?.[lang],
        img: img.face(f.id),
        cardId: f.id,
        prefix: characterNamePrefix(f, lang) ?? undefined,
        element: f.element,
        cls: f.class,
        rarity: f.rarity,
        tags: characterTags(f, curated),
        isFusion: true,
      });
    }
  }
  return characters;
}
