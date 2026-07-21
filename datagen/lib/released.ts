/**
 * PERSOS PAS ENCORE INTÉGRÉS — règle commune aux assets NOMMÉS PAR ID DE PERSO
 * (`T_CutIn_<id>`, `T_Demi_<id>`, `IMG_<id>[_NN]`).
 *
 * L'extraction voit tout ce que le jeu embarque, y compris des persos que le
 * wiki n'a pas validés : doublons de développement, lambdas, contenu d'un patch
 * à venir. Leurs illustrations partaient jusqu'ici sur R2 et s'affichaient dans
 * `/wallpapers` — du contenu non annoncé, publié par accident.
 *
 * DEUX PIÈGES que la règle doit éviter, tous deux vérifiés avec Sevih (21/07) :
 *
 *   1. LES SKINS. Un costume a son PROPRE id (`2010001` = le skin de K) qui
 *      n'est PAS une clé de `characters.json` — il vit dans `appearances` /
 *      `costumes[].model` du perso de base. Filtrer sur les seules clés
 *      supprimait 100 cutins de persos parfaitement sortis.
 *   2. LES PNJ. `IMG_3000032` est un art de PNJ, délibérément servi par
 *      `/wallpapers` — il n'est dans aucun perso et ne le sera jamais. D'où le
 *      test d'ESPACE DE NOMS : on n'écarte un id que s'il partage son premier
 *      chiffre avec des persos intégrés (les jouables sont en `2…`, les PNJ en
 *      `3…`). Un espace de noms inconnu passe : mieux vaut publier une image de
 *      trop que d'en faire disparaître une légitime.
 *
 * FILTRE, jamais suppression : le jour où le perso est intégré, ses visuels
 * reviennent seuls, sans ré-extraire quoi que ce soit.
 */
import { existsSync, readFileSync, statSync } from 'node:fs';
import { resolve } from 'node:path';

const CHARACTERS = resolve('data/generated/characters.json');

/** Assets dont le nom porte un id de perso (le reste n'est pas concerné). */
const CHARACTER_ASSET_RE = /^(?:T_CutIn_|T_Demi_|IMG_)(\d+)/i;

interface CharacterLike {
  appearances?: string[];
  costumes?: { model?: string; fusionModel?: string }[];
}

interface Integrated {
  /** Tous les ids VISUELS validés : base + apparences + modèles de costume. */
  ids: Set<string>;
  /** Premiers chiffres vus (espaces de noms des persos jouables). */
  namespaces: Set<string>;
}

// Mémoïsé sur la mtime du validé : le process admin vit longtemps et réécrit
// `characters.json` à chaque intégration — un cache figé raterait la sortie du
// jour (même modèle que `curatedKeyCache`).
let cache: { stamp: string; data: Integrated } | undefined;

function integrated(): Integrated {
  const stamp = existsSync(CHARACTERS) ? String(statSync(CHARACTERS).mtimeMs) : 'absent';
  if (cache?.stamp === stamp) return cache.data;

  const ids = new Set<string>();
  try {
    const chars = JSON.parse(readFileSync(CHARACTERS, 'utf8')) as Record<string, CharacterLike>;
    for (const [id, c] of Object.entries(chars)) {
      ids.add(id);
      for (const a of c.appearances ?? []) ids.add(String(a));
      for (const k of c.costumes ?? []) {
        if (k.model) ids.add(String(k.model));
        // `fusionModel: '0'` = pas de variante fusion (sentinelle du jeu).
        if (k.fusionModel && k.fusionModel !== '0') ids.add(String(k.fusionModel));
      }
    }
  } catch {
    /* validé absent ou illisible → `ids` vide, donc aucun filtrage (cf. plus bas) */
  }
  const data: Integrated = { ids, namespaces: new Set([...ids].map((i) => i[0])) };
  cache = { stamp, data };
  return data;
}

/**
 * Cet asset appartient-il à un perso que le wiki n'a PAS intégré ? `false` pour
 * tout ce qui n'est pas nommé par un id de perso, pour les PNJ, et pour les
 * skins/costumes d'un perso sorti.
 *
 * Sans `characters.json` sous la main (CI, dépôt frais), rend toujours `false` :
 * on ne filtre QUE sur une preuve d'intégration, jamais sur une absence de
 * donnée — sinon un checkout sans validé viderait la galerie.
 */
export function isUnreleasedCharacterAsset(stem: string): boolean {
  const m = CHARACTER_ASSET_RE.exec(stem);
  if (!m) return false;
  const { ids, namespaces } = integrated();
  if (ids.size === 0) return false;
  const id = m[1];
  return !ids.has(id) && namespaces.has(id[0]);
}
