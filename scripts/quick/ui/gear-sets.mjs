/**
 * quick/ui/gear-sets — les combos de sets d'un build, composés depuis UN set
 * principal et des sets secondaires (le picker de sets de l'onglet « Gear
 * reco »), et l'inverse, pour rouvrir le picker sur ce que le build porte.
 *
 * UN FICHIER, DEUX LECTEURS, comme `comics-group.mjs` : l'onglet le charge tel
 * quel (`/ui/gear-sets.mjs`) et `actions.test.ts` l'importe — une copie dans la
 * page ne serait pas testée. D'où le `.mjs`, du JavaScript nu typé par JSDoc
 * (`checkJs` de `scripts/tsconfig.json`).
 *
 * PUR : des ids de sets en entrée, des pièces `{ set, count }` en sortie — la
 * forme d'un combo de `gear-reco.json` et d'un preset de `gear-presets.json`.
 * Quel `$slug` le store écrira (`collapseBuild`) n'est pas son affaire.
 */

/** @typedef {{ set: string, count: number }} SetPiece */

/**
 * Les combos d'un mix. Le principal seul : UN combo, ses 4 pièces. Avec N
 * secondaires : N combos, 2 pièces du principal et 2 du secondaire, dans
 * l'ordre où ils ont été choisis. Un secondaire cité deux fois ne compte
 * qu'une fois.
 *
 * Refusé (`error`, et aucun combo) : pas de principal, ou le principal parmi
 * les secondaires — 2 + 2 du même set, c'est le 4 pièces, qui ne se demande
 * pas ainsi.
 *
 * @param {string} main
 * @param {readonly string[]} secondaries
 * @returns {{ combos: SetPiece[][], error: string }}
 */
export function composeSetCombos(main, secondaries) {
  if (!main) return { combos: [], error: 'pas de set principal' };
  if (secondaries.includes(main))
    return { combos: [], error: 'un set secondaire ne peut pas être le set principal' };
  const others = [...new Set(secondaries.filter(Boolean))];
  return {
    combos: others.length
      ? others.map((set) => [
          { set: main, count: 2 },
          { set, count: 2 },
        ])
      : [[{ set: main, count: 4 }]],
    error: '',
  };
}

/**
 * L'inverse : le principal et les secondaires que disent des combos, quand ils
 * forment un mix — un seul combo de 4 pièces, ou des combos 2 + 2 qui partagent
 * tous un set (le premier cité, si deux le font). Toute autre forme (trois
 * sets dans un combo, des combos sans set commun, un combo vide) ne se lit pas
 * comme un mix : principal vide, aucun secondaire.
 *
 * @param {readonly (readonly SetPiece[])[]} combos
 * @returns {{ main: string, secondaries: string[] }}
 */
export function splitSetCombos(combos) {
  const none = { main: '', secondaries: [] };
  if (!combos.length) return none;
  if (combos.length === 1 && combos[0].length === 1)
    return combos[0][0].count === 4 && combos[0][0].set
      ? { main: combos[0][0].set, secondaries: [] }
      : none;
  const pairs = combos.every(
    (c) => c.length === 2 && c.every((p) => p.set && p.count === 2) && c[0].set !== c[1].set,
  );
  if (!pairs) return none;
  const main = combos[0]
    .map((p) => p.set)
    .find((set) => combos.every((c) => c.some((p) => p.set === set)));
  if (!main) return none;
  const secondaries = combos.map((c) => (c[0].set === main ? c[1].set : c[0].set));
  return new Set(secondaries).size === secondaries.length ? { main, secondaries } : none;
}
