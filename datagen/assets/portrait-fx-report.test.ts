/**
 * Tests du rapport des effets de portrait — ce que `refresh` dit d'un patch.
 *
 * Tout part de la table COMMITTÉE (`portrait-fx.json`) et d'une copie où un
 * effet « arrive » : un perso de plus, un prefab de plus, calqué sur un effet
 * servi du jour (choisi par sa forme, pas par son nom). Aucun fichier n'est
 * écrit : `fxReport`, `nextSnapshot` et `fingerprint` sont purs.
 */
import { describe, expect, it } from 'vitest';
import { PORTRAIT_FX, type FxTable } from '../../src/components/character/portrait-fx';
import { effectVerdict } from '../../src/components/character/portrait-fx-sim';
import { fingerprint, fxReport, nextSnapshot, type Snapshot } from './portrait-fx-report';

const ARRIVING = 'FX_UI_Character_List_Arrivant';
const CARRIER = '9999901';
const [MODEL_NAME, MODEL] = Object.entries(PORTRAIT_FX.effects).find(
  ([name, fx]) =>
    effectVerdict(name).kind === 'served' && fx.emitters.filter((e) => e.active).length >= 2,
)!;
/** Le relevé du jour : ce que le pas écrirait de la table committée. */
const TODAY: Snapshot = nextSnapshot(PORTRAIT_FX, {});

function arrival(change?: (table: FxTable) => void): FxTable {
  const table = structuredClone(PORTRAIT_FX);
  table.effects[ARRIVING] = structuredClone(MODEL);
  table.byCharacter[CARRIER] = ARRIVING;
  change?.(table);
  return table;
}

/** Donne au premier calque actif de `effect` un matériau qui demande `_POLAR_UV_ON`. */
function refuseOneLayer(table: FxTable, effect = ARRIVING): string {
  const layer = table.effects[effect].emitters.find((e) => e.active)!;
  const mat = structuredClone(table.materials[layer.material!]);
  mat.name = `${mat.name}_Polar`;
  mat.keywords = [...mat.keywords, '_POLAR_UV_ON'];
  table.materials[mat.name] = mat;
  layer.material = mat.name;
  return `${effect}/${layer.name} — ${mat.name} : branche(s) de shader non transcrite(s) — _POLAR_UV_ON`;
}

/**
 * Ce que le rapport redit de la table committée ELLE-MÊME : ses effets en
 * attente ou pas extraits (aucun le jour où ces tests sont écrits). Les tests
 * regardent ce qu'une arrivée y AJOUTE, sans rien supposer de l'ordre des
 * lignes — un effet en attente dans la table du jour ne doit en casser aucun
 * (vécu en jouant ces tests sur une table où `_Synchro` arrivait refusé).
 */
const STANDING = fxReport({ fresh: PORTRAIT_FX, committed: PORTRAIT_FX, snapshot: TODAY });
const report = (fresh: FxTable, snapshot: Snapshot = TODAY) =>
  fxReport({ fresh, committed: PORTRAIT_FX, snapshot }).filter((l) => !STANDING.includes(l));

describe('fxReport — ce que le refresh dit des effets de portrait', () => {
  it('rien de nouveau → rien d’annoncé, seulement ce qui reste en attente', () => {
    expect(report(PORTRAIT_FX)).toEqual([]);
    expect(STANDING.filter((l) => l.startsWith('+'))).toEqual([]);
  });

  it('un effet nouveau et rendable est annoncé « servi tel quel », avec ses porteurs', () => {
    expect(report(arrival())).toEqual([
      `+ ${ARRIVING} (porteur(s) ${CARRIER}) — NOUVEAU, servi tel quel`,
    ]);
  });

  it('un perso de plus sur un effet déjà servi est annoncé aussi', () => {
    const fresh = structuredClone(PORTRAIT_FX);
    fresh.byCharacter[CARRIER] = MODEL_NAME;
    expect(report(fresh)).toEqual([
      `+ ${MODEL_NAME} — nouveau(x) porteur(s) ${CARRIER}, servi tel quel`,
    ]);
  });

  it('un effet nouveau dont un calque est refusé est annoncé en attente, motif du moteur compris', () => {
    let reason = '';
    const fresh = arrival((t) => (reason = refuseOneLayer(t)));
    expect(report(fresh)).toEqual([
      `+ ${ARRIVING} (porteur(s) ${CARRIER}) — NOUVEAU, en attente : ${reason}`,
    ]);
  });

  it('un effet nommé sans prefab est signalé, avec le motif de l’extraction', () => {
    const fresh = arrival((t) => {
      delete t.effects[ARRIVING];
      t.notExtracted = {
        ...t.notExtracted,
        [ARRIVING]: 'sans prefab dans le bundle prefabs/character/ui_effect',
      };
    });
    expect(report(fresh)).toEqual([
      `+ ${ARRIVING} (porteur(s) ${CARRIER}) — NOUVEAU, pas extrait : sans prefab dans le bundle prefabs/character/ui_effect`,
    ]);
  });

  it('un effet en attente est REDIT tant qu’il le reste, même s’il n’est plus nouveau', () => {
    let reason = '';
    const fresh = arrival((t) => (reason = refuseOneLayer(t)));
    // Le patch est committé : la table du dernier commit porte déjà l'effet.
    const lines = fxReport({ fresh, committed: fresh, snapshot: nextSnapshot(fresh, {}) });
    expect(lines.filter((l) => !STANDING.includes(l))).toEqual([
      `! ${ARRIVING} (porteur(s) ${CARRIER}) — en attente : ${reason}`,
    ]);
  });

  it('un effet servi dont le patch change la fiche est dit « servi jusqu’ici »', () => {
    const fresh = structuredClone(PORTRAIT_FX);
    const reason = refuseOneLayer(fresh, MODEL_NAME);
    const who = Object.entries(fresh.byCharacter)
      .filter(([, name]) => name === MODEL_NAME)
      .map(([id]) => id)
      .join(', ');
    expect(report(fresh)).toEqual([
      `! ${MODEL_NAME} (porteur(s) ${who}) — servi jusqu’ici, sa fiche a changé, en attente : ${reason}`,
    ]);
  });

  it('un effet servi que l’extraction ne sort plus est dit « servi jusqu’ici », motif compris', () => {
    const fresh = structuredClone(PORTRAIT_FX);
    delete fresh.effects[MODEL_NAME];
    fresh.notExtracted = {
      ...fresh.notExtracted,
      [MODEL_NAME]: 'extraction refusée — mode inconnu',
    };
    const [line] = report(fresh);
    expect(line).toContain(`! ${MODEL_NAME} (porteur(s) `);
    expect(line).toContain('— servi jusqu’ici, pas extrait : extraction refusée — mode inconnu');
    // …et il sort du relevé : sa fiche n'est plus là pour être jugée.
    expect(nextSnapshot(fresh, TODAY)[MODEL_NAME]).toBeUndefined();
  });

  it('fiche inchangée et plus servi : le rapport désigne le MOTEUR', () => {
    // Le relevé porte l'empreinte d'une fiche que le moteur refuse aujourd'hui —
    // ce qu'on verrait après avoir retiré un mot-clé des branches transcrites.
    const fresh = arrival((t) => void refuseOneLayer(t));
    const snapshot = { ...TODAY, [ARRIVING]: fingerprint(fresh, ARRIVING)! };
    const line = fxReport({ fresh, committed: fresh, snapshot }).find((l) => l.includes(ARRIVING));
    expect(line).toContain('servi au dernier relevé ET fiche inchangée');
    expect(line).toContain('en attente : ');
  });

  it('sans table committée (git muet), le dit et ne crie pas au nouveau', () => {
    expect(fxReport({ fresh: PORTRAIT_FX, committed: null, snapshot: TODAY })).toEqual([
      '? table committée illisible (git) — nouveautés non comparées',
      ...STANDING,
    ]);
  });
});

describe('fingerprint — l’empreinte de la fiche d’un effet', () => {
  it('null pour un effet absent de la table', () => {
    expect(fingerprint(PORTRAIT_FX, 'FX_Inconnu')).toBeNull();
  });

  it('bouge quand un matériau CITÉ bouge, pas quand un autre effet bouge', () => {
    const before = fingerprint(PORTRAIT_FX, MODEL_NAME);
    const touched = structuredClone(PORTRAIT_FX);
    refuseOneLayer(touched, MODEL_NAME);
    expect(fingerprint(touched, MODEL_NAME)).not.toBe(before);
    // Un effet de plus, bâti sur les mêmes matériaux, ne touche pas la fiche du modèle.
    expect(fingerprint(arrival(), MODEL_NAME)).toBe(before);
  });
});

describe('nextSnapshot — le relevé des effets servis', () => {
  it('relève tout effet servi, et lui seul', () => {
    let held = '';
    const fresh = arrival((t) => {
      t.effects[`${ARRIVING}_2`] = structuredClone(MODEL);
      held = refuseOneLayer(t);
    });
    expect(held).not.toBe('');
    const next = nextSnapshot(fresh, TODAY);
    expect(next[`${ARRIVING}_2`]).toBe(fingerprint(fresh, `${ARRIVING}_2`));
    expect(next[ARRIVING]).toBeUndefined();
    expect(Object.keys(next).sort()).toEqual([...Object.keys(TODAY), `${ARRIVING}_2`].sort());
  });

  it('un effet dont le patch a changé la fiche SORT du relevé — le test de contrat ne le juge plus', () => {
    const fresh = structuredClone(PORTRAIT_FX);
    refuseOneLayer(fresh, MODEL_NAME);
    expect(nextSnapshot(fresh, TODAY)[MODEL_NAME]).toBeUndefined();
  });

  it('un effet que le MOTEUR ne sert plus à fiche inchangée y RESTE — le test continue de casser', () => {
    const fresh = arrival((t) => void refuseOneLayer(t));
    const print = fingerprint(fresh, ARRIVING)!;
    expect(nextSnapshot(fresh, { ...TODAY, [ARRIVING]: print })[ARRIVING]).toBe(print);
    // `--accept` repart d'un relevé vide : l'effet en sort.
    expect(nextSnapshot(fresh, {})[ARRIVING]).toBeUndefined();
  });

  it('le relevé committé est celui de la table committée', () => {
    // Pas une exigence de fraîcheur (un effet qui arrive hors refresh ne casse
    // rien) : seulement qu'aucune empreinte committée ne contredise la table.
    expect(nextSnapshot(PORTRAIT_FX, {})).toEqual(TODAY);
  });
});
