/**
 * Staging RESTREINT aux monstres et équipements validés modifiés
 * (`stage-entities.ts`) : les demandes de quelques entités seulement, et
 * seulement celles que le manifest global fait aussi. Manifest, passifs, index
 * et dépôt injectés : ni `.gamedata`, ni `data/generated`, ni écriture dans
 * `.assets-staging/`.
 */
import { describe, expect, it } from 'vitest';
import { equipmentAssetRequests, monsterAssetRequests, type AssetRequest } from './manifest';
import { stageEntityAssets, stagesEntityAssets } from './stage-entities';

/** Dépôt factice : capture les demandes, ne produit rien. */
function fakeStage(manifest: AssetRequest[], passives: Record<string, { icon?: string }> = {}) {
  const calls: AssetRequest[][] = [];
  const stage = async (requests: AssetRequest[]) => {
    calls.push(requests);
    return { staged: requests.length, restaged: 0, present: 0, missing: [] };
  };
  return {
    calls,
    deps: {
      manifest: () => manifest,
      passives: () => passives,
      index: () => new Map<string, string>(),
      stage,
    },
  };
}

const EMPTY = { staged: 0, restaged: 0, present: 0, missing: [] };

describe('stagesEntityAssets', () => {
  it('reconnaît les fichiers de monstres et d’équipement, pas les autres', () => {
    expect(stagesEntityAssets('monsters.json')).toBe(true);
    expect(stagesEntityAssets('equipment/weapon.json')).toBe(true);
    expect(stagesEntityAssets('equipment/sets.json')).toBe(true);
    expect(stagesEntityAssets('equipment/passives.json')).toBe(false);
    expect(stagesEntityAssets('characters.json')).toBe(false);
    expect(stagesEntityAssets('glossaries.json')).toBe(false);
    expect(stagesEntityAssets('items.json')).toBe(false);
  });
});

describe('stageEntityAssets — monstres', () => {
  const monsters = {
    boss: { id: 'boss', icon: '4013071' },
    add: { id: 'add', icon: '4013072' },
    twin: { id: 'twin', icon: '4013071' },
    unused: { id: 'unused', icon: '4999999' },
    hero: { id: 'hero', icon: '2000002' },
  };
  // Le manifest global : `boss` est un boss de guide (webp + PNG), `add` n'a
  // que sa vignette, `unused` ne sert aucune page ; plus un calque partagé.
  const manifest: AssetRequest[] = [
    ...monsterAssetRequests(monsters.boss, { domain: 'guides', png: true }),
    ...monsterAssetRequests(monsters.add),
    {
      kind: 'image',
      key: 'images/ui/boss/MT_Slot_Rare.webp',
      candidates: ['MT_Slot_Rare'],
      domain: 'ui',
    },
  ];

  it('stage les SEULS ids demandés, PNG compris quand le manifest le demande', async () => {
    const { calls, deps } = fakeStage(manifest);
    const result = await stageEntityAssets('monsters.json', ['boss'], monsters, deps);
    expect(calls).toHaveLength(1);
    // La demande DU MANIFEST (son domaine), rien de `add` ni des calques partagés.
    expect(calls[0]).toEqual(manifest.slice(0, 2));
    expect(result.staged).toBe(2);
  });

  it('pas de PNG pour un monstre dont le manifest ne demande que le webp', async () => {
    const { calls, deps } = fakeStage(manifest);
    await stageEntityAssets('monsters.json', ['add'], monsters, deps);
    expect(calls[0].map((r) => r.key)).toEqual(['images/ui/boss/MT_4013072.webp']);
  });

  it('déduplique par clé deux monstres qui partagent une vignette', async () => {
    const { calls, deps } = fakeStage(manifest);
    await stageEntityAssets('monsters.json', ['boss', 'twin'], monsters, deps);
    expect(calls[0].map((r) => r.key)).toEqual([
      'images/ui/boss/MT_4013071.webp',
      'images/ui/boss/MT_4013071.png',
    ]);
  });

  it('ne stage rien : id inconnu, monstre hors manifest, icône de perso, aucun id', async () => {
    const { calls, deps } = fakeStage(manifest);
    expect(await stageEntityAssets('monsters.json', ['ghost'], monsters, deps)).toEqual(EMPTY);
    expect(await stageEntityAssets('monsters.json', ['unused'], monsters, deps)).toEqual(EMPTY);
    expect(await stageEntityAssets('monsters.json', ['hero'], monsters, deps)).toEqual(EMPTY);
    expect(await stageEntityAssets('monsters.json', [], monsters, deps)).toEqual(EMPTY);
    expect(calls).toHaveLength(0);
  });

  it('un fichier que le module ne connaît pas ne stage rien', async () => {
    const { calls, deps } = fakeStage(manifest);
    expect(await stageEntityAssets('items.json', ['boss'], monsters, deps)).toEqual(EMPTY);
    expect(calls).toHaveLength(0);
  });
});

describe('stageEntityAssets — équipement', () => {
  const passives = { p1: { icon: 'TI_Icon_UO_Weapon_03' }, p2: { icon: 'TI_Icon_UO_Weapon_09' } };
  const weapons = {
    top: { icon: 'TI_Equipment_Weapon_06', passives: [{ id: 'p1' }] },
    low: { icon: 'TI_Equipment_Weapon_01', passives: [] },
    other: { icon: 'TI_Equipment_Weapon_05', passives: [{ id: 'p2' }] },
  };
  // `top` a une page détail (PNG og + passif) ; `low` n'a que sa tuile.
  const manifest: AssetRequest[] = [
    ...equipmentAssetRequests(weapons.top, { og: true, passives }),
    ...equipmentAssetRequests(weapons.low),
    ...equipmentAssetRequests(weapons.other, { og: true, passives }),
  ];

  it('la tuile (webp, PNG og) et l’icône des passifs DE l’objet, rien des autres', async () => {
    const { calls, deps } = fakeStage(manifest, passives);
    await stageEntityAssets('equipment/weapon.json', ['top'], weapons, deps);
    expect(calls[0].map((r) => r.key)).toEqual([
      'images/equipment/TI_Equipment_Weapon_06.webp',
      'images/equipment/TI_Equipment_Weapon_06.png',
      'images/equipment/TI_Icon_UO_Weapon_03.webp',
    ]);
  });

  it('un objet sans page détail : sa tuile webp seule', async () => {
    const { calls, deps } = fakeStage(manifest, passives);
    await stageEntityAssets('equipment/weapon.json', ['low'], weapons, deps);
    expect(calls[0].map((r) => r.key)).toEqual(['images/equipment/TI_Equipment_Weapon_01.webp']);
  });

  it('un set : son icône, sans catalogue de passifs à lui', async () => {
    const sets = { '1': { icon: 'TI_Icon_Set_Enchant_01' } };
    const { calls, deps } = fakeStage(equipmentAssetRequests(sets['1']));
    await stageEntityAssets('equipment/sets.json', ['1', 'ghost'], sets, deps);
    expect(calls[0].map((r) => r.key)).toEqual(['images/equipment/TI_Icon_Set_Enchant_01.webp']);
  });
});
