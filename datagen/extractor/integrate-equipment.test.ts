/**
 * Tests du cœur d'INTÉGRATION ÉQUIPEMENT (`integrate-equipment.ts`) — écriture
 * ciblée d'une entité de gear dans le committé, déclenchée par l'admin. Mêmes
 * invariants que `integrate.test.ts` :
 *   - l'entité (toutes les lignes de la famille) + SES records partagés (pools,
 *     passifs, paliers de casse) + son entrée de famille atterrissent dans les
 *     bons fichiers ;
 *   - le RESTE de chaque fichier est préservé (les autres familles, pools…) ;
 *   - seuls les records RÉFÉRENCÉS entrent (pas de pool/passif voisin) ;
 *   - ré-intégrer est idempotent (octet à octet) ;
 *   - un fichier présent mais CASSÉ lève et ne laisse AUCUN fichier modifié ;
 *   - un set emporte ses pièces d'armure et ce qu'elles référencent.
 *
 * On teste `integrateEquipmentData` sur un dossier temporaire injecté — le
 * wrapper public n'y branche que l'extraction fraîche (`buildEquipment`, qui
 * exige `.gamedata`) et le staging d'images.
 */
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { writeJson } from '../lib/json';
import { integrateEquipmentData } from './integrate-equipment';
import type { EquipmentData } from '../generators/equipment';

let dir: string;

beforeEach(() => {
  dir = mkdtempSync(join(tmpdir(), 'integ-equip-'));
  mkdirSync(join(dir, 'equipment'), { recursive: true });
});

afterEach(() => {
  rmSync(dir, { recursive: true, force: true });
});

const read = (rel: string): Record<string, unknown> =>
  JSON.parse(readFileSync(join(dir, rel), 'utf8')) as Record<string, unknown>;
const bytes = (rel: string): string => readFileSync(join(dir, rel), 'utf8');
/** Octets de tout le dossier `equipment/` (nom → contenu). */
const snapshot = (): Record<string, string> =>
  Object.fromEntries(
    readdirSync(join(dir, 'equipment'))
      .sort()
      .map((f) => [f, bytes(`equipment/${f}`)]),
  );

/** Extraction fraîche minimale : une famille d'armes, un EE, un set + records partagés. */
const fresh = {
  weapon: {
    '10': { icon: 'w_ico', main: ['pA'], sub: 'pB', passives: [{ id: 'psv1' }], breakLimit: 'bl1' },
    '11': { icon: 'w_ico', main: ['pA'], sub: 'pB', passives: [{ id: 'psv1' }], breakLimit: 'bl1' },
    '99': { icon: 'other', main: ['pZ'], passives: [{ id: 'psvZ' }] }, // AUTRE famille : ne doit pas entrer
  },
  accessory: {},
  // Pièces du set 700 (une par emplacement, deux en casque) et une du set 800.
  helmet: {
    h1: { icon: 'h_ico', main: ['pH'], sub: 'pB', breakLimit: 'blA', set: '700' },
    h2: { icon: 'h_ico2', main: ['pH'], sub: 'pB', breakLimit: 'blA', set: '700' },
    h9: { icon: 'h_other', main: ['pZ'], breakLimit: 'blOther', set: '800' },
  },
  armor: { a1: { icon: 'a_ico', main: ['pAr'], breakLimit: 'blA', set: '700' } },
  gloves: { g1: { icon: 'g_ico', main: ['pG'], breakLimit: 'blA', set: '700' } },
  shoes: { s1: { icon: 'sh_ico', main: ['pS'], breakLimit: 'blA', set: '700' } },
  talisman: {},
  ee: { '500': { icon: 'ee_ico', options: ['pC'], passives: [{ id: 'psv2' }] } },
  families: {
    weapon: [
      { id: '10', topId: '11', ids: ['10', '11'], stars: [5, 6], classLimits: [], wiki: true },
    ],
    accessory: [],
    talisman: [],
  },
  pools: {
    pA: { v: 1 },
    pB: { v: 2 },
    pC: { v: 3 },
    pZ: { v: 9 },
    pUnused: { v: 0 },
    pH: { v: 4 },
    pAr: { v: 5 },
    pG: { v: 6 },
    pS: { v: 7 },
  },
  passives: { psv1: { icon: 'p1' }, psv2: { icon: 'p2' }, psvZ: { icon: 'pz' } },
  breakLimits: { bl1: { f: 1 }, blA: { f: 2 }, blOther: { f: 9 } },
  sets: {
    '700': { name: { en: 'Aria' }, icon: 's_ico', tiers: [] },
    '800': { name: { en: 'Other' }, icon: 's_other', tiers: [] },
  },
  grades: {},
  classes: {},
  statNames: {},
  statDescs: {},
} as unknown as EquipmentData;

/** État committé de départ : une autre arme + records déjà validés. */
async function seed(): Promise<void> {
  await writeJson(join(dir, 'equipment/weapon.json'), { '1': { icon: 'old' } });
  await writeJson(join(dir, 'equipment/families.json'), {
    weapon: [{ id: '1', topId: '1', ids: ['1'], stars: [6], classLimits: [], wiki: true }],
    accessory: [],
    talisman: [],
  });
  await writeJson(join(dir, 'equipment/pools.json'), { pExisting: { v: -1 } });
  await writeJson(join(dir, 'equipment/passives.json'), { pExisting: { icon: 'e' } });
  await writeJson(join(dir, 'equipment/breakLimits.json'), { blExisting: { f: -1 } });
}

describe('integrateEquipmentData — famille (arme)', () => {
  it('écrit toutes les lignes de la famille + refs partagées, en préservant le reste', async () => {
    await seed();
    const { files, icons } = await integrateEquipmentData(dir, fresh, 'weapon', '10');

    expect(files).toEqual([
      'equipment/weapon.json',
      'equipment/families.json',
      'equipment/pools.json',
      'equipment/passives.json',
      'equipment/breakLimits.json',
    ]);

    // Slot : ancienne arme intacte, les 2 membres appendus, l'autre famille exclue.
    const weapon = read('equipment/weapon.json');
    expect(Object.keys(weapon)).toEqual(['1', '10', '11']);
    expect(weapon['1']).toEqual({ icon: 'old' });
    expect(weapon['99']).toBeUndefined();

    // Famille : entrée existante préservée, la neuve appendue.
    const fams = read('equipment/families.json') as Record<string, { id: string }[]>;
    expect(fams.weapon.map((f) => f.id)).toEqual(['1', '10']);

    // Pools : seuls pA/pB référencés entrent (pas pC/pZ/pUnused), pExisting préservé.
    expect(Object.keys(read('equipment/pools.json')).sort()).toEqual(['pA', 'pB', 'pExisting']);
    // Passifs : seul psv1 (pas psv2/psvZ), pExisting préservé.
    expect(Object.keys(read('equipment/passives.json')).sort()).toEqual(['pExisting', 'psv1']);
    // Paliers de casse : seul bl1, blExisting préservé.
    expect(Object.keys(read('equipment/breakLimits.json')).sort()).toEqual(['bl1', 'blExisting']);

    // Icônes à stager : celle des items + celle du passif référencé.
    expect(icons.sort()).toEqual(['p1', 'w_ico']);
  });

  it('est idempotent : ré-intégrer produit les mêmes octets', async () => {
    await seed();
    const targets = [
      'equipment/weapon.json',
      'equipment/families.json',
      'equipment/pools.json',
      'equipment/passives.json',
      'equipment/breakLimits.json',
    ];
    await integrateEquipmentData(dir, fresh, 'weapon', '10');
    const snap = targets.map(bytes);
    await integrateEquipmentData(dir, fresh, 'weapon', '10');
    expect(targets.map(bytes)).toEqual(snap);
  });

  it('remplace en place une famille déjà intégrée (pas de doublon)', async () => {
    await seed();
    await integrateEquipmentData(dir, fresh, 'weapon', '10');
    await integrateEquipmentData(dir, fresh, 'weapon', '10');
    const fams = read('equipment/families.json') as Record<string, { id: string }[]>;
    expect(fams.weapon.map((f) => f.id)).toEqual(['1', '10']); // toujours 2, pas 3
  });

  it('lève si la famille est absente de l’extraction fraîche', async () => {
    await seed();
    await expect(integrateEquipmentData(dir, fresh, 'weapon', 'nope')).rejects.toThrow();
  });
});

describe('integrateEquipmentData — entité simple (EE, set)', () => {
  it('EE : merge la ligne + pools/passifs, sans toucher familles ni breakLimits', async () => {
    await writeJson(join(dir, 'equipment/ee.json'), { '400': { icon: 'oldEE' } });
    const { files } = await integrateEquipmentData(dir, fresh, 'ee', '500');
    expect(files).toEqual(['equipment/ee.json', 'equipment/pools.json', 'equipment/passives.json']);
    expect(Object.keys(read('equipment/ee.json'))).toEqual(['400', '500']);
    expect(Object.keys(read('equipment/pools.json'))).toEqual(['pC']);
    expect(Object.keys(read('equipment/passives.json'))).toEqual(['psv2']);
  });

  it('Set : son entrée de sets.json, ses pièces des quatre emplacements, leurs pools et paliers, leurs icônes', async () => {
    await writeJson(join(dir, 'equipment/sets.json'), { '600': { name: { en: 'Old' } } });
    await writeJson(join(dir, 'equipment/helmet.json'), { h0: { icon: 'old', set: '600' } });
    await writeJson(join(dir, 'equipment/pools.json'), { pExisting: { v: -1 } });
    const { files, icons } = await integrateEquipmentData(dir, fresh, 'set', '700');
    expect(files).toEqual([
      'equipment/sets.json',
      'equipment/helmet.json',
      'equipment/armor.json',
      'equipment/gloves.json',
      'equipment/shoes.json',
      'equipment/pools.json',
      'equipment/breakLimits.json',
    ]);
    expect(Object.keys(read('equipment/sets.json'))).toEqual(['600', '700']);
    // Toutes les pièces du set, en fin ; aucune de l'autre set (h9).
    expect(Object.keys(read('equipment/helmet.json'))).toEqual(['h0', 'h1', 'h2']);
    expect(Object.keys(read('equipment/armor.json'))).toEqual(['a1']);
    expect(Object.keys(read('equipment/gloves.json'))).toEqual(['g1']);
    expect(Object.keys(read('equipment/shoes.json'))).toEqual(['s1']);
    // Records des pièces seulement (pas pZ ni blOther, ceux de h9).
    expect(Object.keys(read('equipment/pools.json')).sort()).toEqual([
      'pAr',
      'pB',
      'pExisting',
      'pG',
      'pH',
      'pS',
    ]);
    expect(Object.keys(read('equipment/breakLimits.json'))).toEqual(['blA']);
    expect(existsSync(join(dir, 'equipment/passives.json'))).toBe(false);
    expect(icons.sort()).toEqual(['a_ico', 'g_ico', 'h_ico', 'h_ico2', 's_ico', 'sh_ico']);
  });

  it('Set : ré-intégrer produit les mêmes octets', async () => {
    await writeJson(join(dir, 'equipment/sets.json'), { '600': { name: { en: 'Old' } } });
    await integrateEquipmentData(dir, fresh, 'set', '700');
    const snap = snapshot();
    await integrateEquipmentData(dir, fresh, 'set', '700');
    expect(snapshot()).toEqual(snap);
  });
});

describe('integrateEquipmentData — fichier présent mais cassé', () => {
  const CONFLICT = '<<<<<<< HEAD\n{ "1": { "icon": "old" } }\n=======\n{}\n>>>>>>> theirs\n';

  it('weapon.json au marqueur de conflit : lève en le nommant, AUCUN fichier ne change', async () => {
    await seed();
    writeFileSync(join(dir, 'equipment/weapon.json'), CONFLICT);
    const before = snapshot();
    await expect(integrateEquipmentData(dir, fresh, 'weapon', '10')).rejects.toThrow(
      // Séparateur `[\\/]` : le message porte le chemin natif (`\` sous Windows).
      /equipment[\\/]weapon\.json : JSON invalide/,
    );
    expect(snapshot()).toEqual(before);
  });

  it('pools.json cassé : lève, le slot et families.json restent intacts', async () => {
    await seed();
    writeFileSync(join(dir, 'equipment/pools.json'), '{ "pExisting": { "v": -1 ');
    const before = snapshot();
    await expect(integrateEquipmentData(dir, fresh, 'weapon', '10')).rejects.toThrow(
      /equipment[\\/]pools\.json : JSON invalide/,
    );
    expect(snapshot()).toEqual(before);
  });

  it('fichiers absents (1re intégration) : créés', async () => {
    const { files } = await integrateEquipmentData(dir, fresh, 'weapon', '10');
    for (const f of files) expect(existsSync(join(dir, f))).toBe(true);
    expect(Object.keys(read('equipment/weapon.json'))).toEqual(['10', '11']);
    expect((read('equipment/families.json').weapon as { id: string }[]).map((f) => f.id)).toEqual([
      '10',
    ]);
  });
});
