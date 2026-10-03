import { describe, expect, it } from 'vitest';
import { fxNameOf, fxOf, PORTRAIT_FX } from './portrait-fx';
import { layerVerdict } from './portrait-fx-sim';

/**
 * LE CONTRAT ENTRE LA TABLE ET LE MOTEUR.
 *
 * `portrait-fx.json` est régénéré par `refresh` à chaque patch du jeu et committé
 * tel quel. Le moteur, lui, ne rend que ce qu'il a transcrit et REFUSE le reste
 * en `console.error` — la carte reste alors un portrait parfaitement normal, donc
 * personne ne le voit. Ce test est l'endroit où ça se voit : il passe la table
 * committée par la décision même du montage (`layerVerdict`) et casse sur tout
 * refus qui n'est pas NOMMÉ ci-dessous.
 *
 * Quand il casse après un patch, deux issues, et c'est une décision à prendre,
 * pas un test à faire taire : porter ce que le jeu demande (ajouter le suffixe à
 * `DEFAULT_EFFECTS` dans `extract-portrait-fx.py`, transcrire la branche de
 * shader ou le module), ou inscrire le refus dans la liste avec sa raison.
 * Une entrée qui n'est PLUS refusée casse aussi : les listes disent l'état du
 * jour, pas un historique.
 */

/**
 * Les effets que le jeu NOMME (`byCharacter`) sans que leur prefab soit extrait :
 * `fxOf` rend `undefined`, le perso garde un portrait statique.
 *
 * Vide au 2026-10-04 : les dix effets des 28 lignes sont extraits et servis.
 */
const NOT_EXTRACTED: string[] = [];

/**
 * Ce que le moteur ne pose PAS aujourd'hui, nommément : une ligne
 * `effet/émetteur — motif` par émetteur, le motif tel que `layerVerdict` le rend
 * (le message de la console pour un refus, `passé : <motif>` pour un émetteur que
 * le montage tait). Un nœud inactif n'y figure pas : le jeu ne le dessine pas
 * non plus.
 *
 * Vide au 2026-10-04 : les 37 émetteurs des dix effets sont tous posés.
 */
const NOT_RENDERED: string[] = [];

const { byCharacter, effects, materials, meshes, textures } = PORTRAIT_FX;
const EFFECTS = Object.entries(effects);

describe('portrait-fx.json — le contrat avec le moteur', () => {
  it('est en espace linéaire, le seul que le moteur transcrit', () => {
    expect(PORTRAIT_FX.colorSpace).toBe('linear');
  });

  it('porte des effets et des personnages (une extraction vide ne passe pas pour saine)', () => {
    expect(EFFECTS.length).toBeGreaterThan(0);
    expect(Object.keys(byCharacter).length).toBeGreaterThan(0);
  });

  it('tout effet nommé par le jeu a son prefab extrait, sauf ceux de NOT_EXTRACTED', () => {
    const missing = [...new Set(Object.values(byCharacter))].filter((name) => !effects[name]);
    expect(missing.sort()).toEqual([...NOT_EXTRACTED].sort());
  });

  it('`fxOf` rend l’effet de chaque personnage servi', () => {
    for (const [id, name] of Object.entries(byCharacter)) {
      expect(fxNameOf(id)).toBe(name);
      if (!NOT_EXTRACTED.includes(name)) expect(fxOf(id), id).toBe(effects[name]);
    }
    expect(fxNameOf('0')).toBeUndefined();
    expect(fxOf('0')).toBeUndefined();
  });

  it('tout émetteur actif est posé par le montage, sauf ceux de NOT_RENDERED', () => {
    const notRendered: string[] = [];
    for (const [effect, { emitters }] of EFFECTS) {
      for (const e of emitters) {
        const verdict = layerVerdict(e);
        if (verdict.kind === 'refused') notRendered.push(`${effect}/${e.name} — ${verdict.reason}`);
        else if (verdict.kind === 'skipped' && verdict.why !== 'inactive')
          notRendered.push(`${effect}/${e.name} — passé : ${verdict.why}`);
      }
    }
    expect(notRendered.sort()).toEqual([...NOT_RENDERED].sort());
  });

  it('chaque effet garde au moins un calque rendable', () => {
    // Sans quoi le montage rend « aucun calque rendable » et la carte reste statique.
    const empty = EFFECTS.filter(
      ([, { emitters }]) =>
        !emitters.some((e) => ['mesh', 'quad', 'billboard'].includes(layerVerdict(e).kind)),
    ).map(([name]) => name);
    expect(empty).toEqual([]);
  });

  it('toute texture citée par un matériau a sa fiche', () => {
    // Le montage demande au bucket chaque texture d'un calque posé et lit sa
    // fiche (wrap, filtre, mips, sRGB) : sans fiche, elle monterait aux défauts.
    const orphans = Object.values(materials).flatMap((m) =>
      Object.entries(m.textures)
        .filter(([, slot]) => !textures[slot.tex])
        .map(([slot, { tex }]) => `${m.name}.${slot} → ${tex}`),
    );
    expect(orphans).toEqual([]);
  });

  it('toute maille tient dans un tampon d’indices 16 bits, sans indice orphelin', () => {
    // Le montage range les triangles dans un `Uint16Array` : au-delà de 65 535,
    // l'indice reboucle en silence et la maille se dessine de travers.
    for (const mesh of Object.values(meshes)) {
      expect(mesh.v.length, mesh.name).toBeLessThanOrEqual(65536);
      expect(mesh.uv.length, mesh.name).toBe(mesh.v.length);
      expect(mesh.i.length % 3, mesh.name).toBe(0);
      expect(
        mesh.i.every((i) => Number.isInteger(i) && i >= 0 && i < mesh.v.length),
        mesh.name,
      ).toBe(true);
    }
  });
});
