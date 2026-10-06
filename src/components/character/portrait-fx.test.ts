import { describe, expect, it } from 'vitest';
import { fingerprint } from '@datagen/assets/portrait-fx-report';
import SNAPSHOT from '@datagen/assets/portrait-fx-served.json';
import { fxNameOf, PORTRAIT_FX, type FxTable } from './portrait-fx';
import { effectVerdict, fxOf, NOT_RENDERED, notRendered } from './portrait-fx-sim';

/**
 * LE CONTRAT ENTRE LA TABLE ET LE MOTEUR.
 *
 * `portrait-fx.json` est régénéré par `refresh` à chaque patch du jeu et committé
 * tel quel : l'extraction sort tout effet que le jeu nomme, sans liste à tenir.
 * Le moteur, lui, ne sert un effet que s'il sait le poser EN ENTIER
 * (`effectVerdict`) ; sinon le perso garde son portrait statique.
 *
 * UN EFFET QUI ARRIVE NE CASSE DONC RIEN ICI, qu'il soit rendable ou non : ce
 * n'est pas une panne, et un patch ne doit pas attendre une parure. Ça se lit
 * ailleurs — le rapport du refresh (`datagen/assets/portrait-fx-report.ts`) et la
 * page `/dev/AnimatedPortrait`.
 *
 * Ce test casse sur ce qui EST une panne : une table vide ou dans le mauvais
 * espace colorimétrique, une texture ou une maille incohérente, un refus accepté
 * qui n'en est plus un, et un effet que le moteur a cessé de servir alors que sa
 * fiche n'a pas bougé (le relevé `portrait-fx-served.json`, écrit par le rapport
 * du refresh — jamais à la main).
 */

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

  it('`fxOf` rend l’effet d’un personnage s’il est SERVI, et rien sinon', () => {
    for (const [id, name] of Object.entries(byCharacter)) {
      expect(fxNameOf(id)).toBe(name);
      const served = effectVerdict(name).kind === 'served';
      expect(fxOf(id), id).toBe(served ? effects[name] : undefined);
    }
    expect(fxNameOf('0')).toBeUndefined();
    expect(fxOf('0')).toBeUndefined();
  });

  it('tout refus ACCEPTÉ (NOT_RENDERED) est encore un refus', () => {
    // La liste dit l'état du jour : une ligne que le moteur pose désormais, ou
    // dont l'effet a quitté la table, se retire.
    const refused = EFFECTS.flatMap(([name]) => notRendered(name));
    expect(NOT_RENDERED.filter((line) => !refused.includes(line))).toEqual([]);
  });

  it('un effet servi au dernier relevé, fiche inchangée, est toujours servi', () => {
    // Le relevé porte l'empreinte de la fiche de chaque effet servi. Empreinte
    // identique et effet plus servi : c'est le MOTEUR qui a changé (un mot-clé
    // retiré, une garde resserrée), pas le jeu — une fiche que le patch a
    // touchée, elle, n'est pas jugée ici. Voulu ? `--accept`, cf. le rapport.
    expect(Object.keys(SNAPSHOT).length).toBeGreaterThan(0);
    const lost = Object.entries(SNAPSHOT as Record<string, string>)
      .filter(([name, print]) => fingerprint(PORTRAIT_FX, name) === print)
      .map(([name]) => ({ name, verdict: effectVerdict(name) }))
      .filter(({ verdict }) => verdict.kind !== 'served');
    expect(lost).toEqual([]);
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

/**
 * L'ARRIVÉE D'UN EFFET, jouée sur une copie de la table : un perso de plus
 * (`CARRIER`) qui nomme `ARRIVING`, calqué sur un effet servi du jour — choisi
 * par sa forme, pas par son nom, pour qu'un prefab renommé ne casse rien ici.
 */
const ARRIVING = 'FX_UI_Character_List_Arrivant';
const CARRIER = '9999901';
const MODEL = EFFECTS.find(
  ([name, fx]) =>
    effectVerdict(name).kind === 'served' && fx.emitters.filter((e) => e.active).length >= 2,
)![1];

function arrival(change?: (table: FxTable) => void): FxTable {
  const table = structuredClone(PORTRAIT_FX);
  table.effects[ARRIVING] = structuredClone(MODEL);
  table.byCharacter[CARRIER] = ARRIVING;
  change?.(table);
  return table;
}

/** Donne au premier calque actif de l'effet un matériau qui demande `_POLAR_UV_ON`. */
function refuseOneLayer(table: FxTable): string {
  const layer = table.effects[ARRIVING].emitters.find((e) => e.active)!;
  const mat = structuredClone(table.materials[layer.material!]);
  mat.name = `${mat.name}_Polar`;
  mat.keywords = [...mat.keywords, '_POLAR_UV_ON'];
  table.materials[mat.name] = mat;
  layer.material = mat.name;
  return `${ARRIVING}/${layer.name} — ${mat.name} : branche(s) de shader non transcrite(s) — _POLAR_UV_ON`;
}

describe('effectVerdict — servi entier, ou pas servi', () => {
  it('un effet qui arrive entièrement rendable est servi, sans rien inscrire', () => {
    const table = arrival();
    expect(effectVerdict(ARRIVING, table)).toEqual({ kind: 'served' });
    // …et il ne change le sort d'aucun autre.
    for (const [name] of EFFECTS)
      expect(effectVerdict(name, table).kind, name).toBe(effectVerdict(name).kind);
  });

  it('un seul calque refusé met TOUT l’effet en attente, avec le motif du moteur', () => {
    let reason = '';
    const table = arrival((t) => (reason = refuseOneLayer(t)));
    // Les autres calques restent rendables : c'est bien « pas à moitié ».
    expect(table.effects[ARRIVING].emitters.filter((e) => e.active).length).toBeGreaterThan(1);
    expect(effectVerdict(ARRIVING, table)).toEqual({ kind: 'held', reasons: [reason] });
    for (const [name] of EFFECTS)
      expect(effectVerdict(name, table).kind, name).toBe(effectVerdict(name).kind);
  });

  it('un refus ACCEPTÉ sert l’effet sans ce calque', () => {
    let reason = '';
    const table = arrival((t) => (reason = refuseOneLayer(t)));
    expect(effectVerdict(ARRIVING, table, [reason])).toEqual({ kind: 'served' });
    // Accepter le refus d'un AUTRE calque ne lève rien.
    expect(effectVerdict(ARRIVING, table, [`${ARRIVING}/autre — motif`]).kind).toBe('held');
  });

  it('un calque de cadre à feuille UV — le cas `_Synchro` — met l’effet en attente', () => {
    // Une planche 5×5 à tuile tirée par particule, sur une MAILLE : le montage
    // n'a ni tirage ni tuile pour un calque de cadre, il la rendrait entière.
    let layer = '';
    const table = arrival((t) => {
      const e = t.effects[ARRIVING].emitters.find((x) => x.active && x.renderMode === 4)!;
      layer = e.name;
      e.textureSheet = {
        mode: 0,
        timeMode: 0,
        tilesX: 5,
        tilesY: 5,
        frameOverTime: { minMaxState: 3, scalar: 0, minScalar: 0.9999 },
        startFrame: { minMaxState: 0, scalar: 0, minScalar: 0 },
        animationType: 0,
        rowMode: 1,
      };
    });
    expect(effectVerdict(ARRIVING, table)).toEqual({
      kind: 'held',
      reasons: [
        `${ARRIVING}/${layer} — ${layer} : calque de cadre non transcrit — feuille UV 5×5 sur un calque de cadre`,
      ],
    });
  });

  it('un trou de l’extraction (matériau absent de la table) met aussi en attente', () => {
    const table = arrival((t) => {
      t.effects[ARRIVING].emitters.find((e) => e.active)!.material = 'M_Absent';
    });
    const layer = table.effects[ARRIVING].emitters.find((e) => e.active)!.name;
    expect(effectVerdict(ARRIVING, table)).toEqual({
      kind: 'held',
      reasons: [`${ARRIVING}/${layer} — passé : unknown-material`],
    });
  });

  it('un effet sans aucun calque rendable est en attente, pas servi à vide', () => {
    const table = arrival((t) => {
      for (const e of t.effects[ARRIVING].emitters) e.active = false;
    });
    expect(effectVerdict(ARRIVING, table)).toEqual({
      kind: 'held',
      reasons: [`${ARRIVING} — aucun calque rendable`],
    });
  });

  it('un effet nommé sans prefab extrait n’est pas servi, et dit pourquoi', () => {
    const table = arrival((t) => {
      delete t.effects[ARRIVING];
    });
    expect(effectVerdict(ARRIVING, table)).toEqual({
      kind: 'not-extracted',
      reason: 'absent de portrait-fx.json',
    });
    table.notExtracted = { [ARRIVING]: 'sans prefab dans le bundle prefabs/character/ui_effect' };
    expect(effectVerdict(ARRIVING, table)).toEqual({
      kind: 'not-extracted',
      reason: 'sans prefab dans le bundle prefabs/character/ui_effect',
    });
  });

  it('le verdict de la table du site est calculé UNE fois par effet', () => {
    const [name] = EFFECTS[0];
    expect(effectVerdict(name)).toBe(effectVerdict(name));
    expect(effectVerdict('FX_Inconnu')).toBe(effectVerdict('FX_Inconnu'));
  });
});
