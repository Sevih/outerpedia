import { describe, expect, it } from 'vitest';
import { getRecoStatPriorities } from '@/lib/data/reco-api';
import { loadGearReco } from '@/lib/data/gear-reco';
import { GET } from '@/app/api/reco/[id]/route';
import charactersData from '@data/generated/characters.json';
import weaponsData from '@data/generated/equipment/weapon.json';
import accessoryData from '@data/generated/equipment/accessory.json';

const CHARACTERS = charactersData as unknown as Record<string, unknown>;
const EQUIPMENT = { ...weaponsData, ...accessoryData } as unknown as Record<string, unknown>;

/**
 * `reco-api.ts` — CONTRAT PUBLIC de `GET /api/reco/:id`, consommé par l'app
 * desktop Gear Solver (repo séparé, qu'on ne peut pas casser au vert).
 *
 * L'endpoint avait déjà disparu une fois, à la reconstruction V3 : ces tests
 * sont là pour que ça ne repasse pas inaperçu. Ils verrouillent les deux
 * traductions qui échouent SILENCIEUSEMENT si elles régressent — un mauvais
 * palier d'objet ou une clé de stat hors vocabulaire ne lèvent aucune erreur
 * ici, ils font juste sauter des filtres à l'autre bout.
 */

/** Le vocabulaire moteur du solveur : tout le reste part en « unknown stat ». */
const ENGINE_STATS = new Set([
  'atk',
  'atkPct',
  'def',
  'defPct',
  'hp',
  'hpPct',
  'spd',
  'critRate',
  'critDmg',
  'critDmgReduce',
  'pen',
  'dmgUp',
  'dmgReduce',
  'eff',
  'effRes',
]);

describe('getRecoStatPriorities — forme du contrat', () => {
  it('renvoie null pour un perso sans reco (→ 404 métier, pas une erreur)', () => {
    expect(getRecoStatPriorities('9999999')).toBeNull();
  });

  it('structure complète sur un perso réel (Sofia)', () => {
    const reco = getRecoStatPriorities('2000006');
    expect(reco).not.toBeNull();
    expect(reco!.id).toBe('2000006');

    const speed = reco!.builds.Speed;
    expect(speed).toBeDefined();

    // Weapon/Amulet : OR-list d'alternatives, chacune avec sa OR-list de mains.
    expect(speed.Weapon).toEqual([
      expect.objectContaining({ name: 'Surefire Greatsword', mainStat: ['atkPct'] }),
    ]);
    expect(speed.Amulet).toEqual([
      expect.objectContaining({ name: "Death's Hold", mainStat: ['pen', 'critDmg'] }),
      expect.objectContaining({ name: 'Clock Up', mainStat: ['spd'] }),
    ]);

    // Talisman : même forme que Weapon/Amulet, mais sans main stat curée. Ici
    // le preset `$CPdps` s'aplatit en ses trois talismans (OR-list).
    expect(speed.Talisman).toEqual([
      { name: "Sage's Charm", itemId: 10204, effectIcon: expect.any(String), mainStat: [] },
      { name: "Rogue's Charm", itemId: 10203, effectIcon: expect.any(String), mainStat: [] },
      { name: "Executioner's Charm", itemId: 10201, effectIcon: expect.any(String), mainStat: [] },
    ]);

    // Set : OR-list de combos, chaque combo étant une ET-list de conditions.
    expect(speed.Set).toEqual([[{ name: 'Speed', setId: '13', count: 4 }]]);

    // SubstatPrio : tiers ORDONNÉS (preset `$dps` résolu).
    expect(speed.SubstatPrio).toEqual([['atk'], ['critRate'], ['critDmg'], ['spd'], ['dmgUp']]);
  });
});

describe('GET /api/reco/:id — codes de statut', () => {
  const call = (id: string) =>
    GET(new Request(`https://outerpedia.com/api/reco/${id}`), { params: Promise.resolve({ id }) });

  it('200 + JSON du contrat sur un perso qui a des recos', async () => {
    const res = await call('2000006');
    expect(res.status).toBe(200);
    expect(res.headers.get('content-type')).toMatch(/application\/json/);
    expect(res.headers.get('cache-control')).toBe('public, max-age=3600, s-maxage=3600');
    await expect(res.json()).resolves.toMatchObject({ id: '2000006' });
  });

  /**
   * Le 404 est un SIGNAL MÉTIER (« ce perso n'a pas de preset »), que l'app
   * distingue d'une panne réseau : il doit rester du JSON. C'est exactement ce
   * qui manquait tant que la route était absente — Next servait sa page HTML.
   */
  it('404 JSON, pas une page HTML, sur un perso sans reco', async () => {
    const res = await call('9999999');
    expect(res.status).toBe(404);
    expect(res.headers.get('content-type')).toMatch(/application\/json/);
    await expect(res.json()).resolves.toEqual({ error: 'not_found' });
  });

  it('400 sur un id non numérique', async () => {
    const res = await call('abc');
    expect(res.status).toBe(400);
    await expect(res.json()).resolves.toEqual({ error: 'bad_id' });
  });
});

describe('itemId — palier canonique', () => {
  /**
   * Le curé référence le membre BAS de famille (id 4, 1★) parce que c'est la
   * famille qu'affiche le wiki. L'app résout l'effet via l'inventaire du
   * joueur, où l'objet possédé est le 6★ (754) — c'est ce que la V2 émettait.
   * Émettre 4 ne lèverait aucune erreur : ça ferait juste sauter le filtre
   * d'effet de CHAQUE arme et amulette, avec un warning côté app.
   */
  it('remonte le membre bas de famille au palier max (Surefire Greatsword 4 → 754)', () => {
    const weapon = getRecoStatPriorities('2000006')!.builds.Speed.Weapon![0];
    expect(loadGearReco()['2000006'][0].weapons![0].id).toBe('4'); // le curé dit bien 4
    expect(weapon.itemId).toBe(754); // …et le contrat émet 754
    expect(weapon.effectIcon).toBe('TI_Icon_UO_Weapon_11');
  });

  it('laisse intactes les variantes par classe, déjà au palier max', () => {
    // Briareos/Gorgon : 5 objets distincts d'une même famille, un passif chacun.
    // Les rabattre sur le `topId` de la famille les confondrait toutes en une.
    const variants = ['781', '782', '783', '784', '785'];
    const seen = new Set<number>();
    for (const [charId, builds] of Object.entries(loadGearReco())) {
      for (const build of builds) {
        for (const w of build.weapons ?? []) {
          if (!variants.includes(w.id)) continue;
          const out = getRecoStatPriorities(charId)!.builds[build.name].Weapon!.find(
            (x) => x.itemId === Number(w.id),
          );
          expect(out, `${charId}/${build.name} : variante ${w.id} rabattue`).toBeDefined();
          // Le nom est suffixé par classe, sinon les 5 sont indistinguables.
          expect(out!.name).toMatch(/^Briareos's Recklessness \[/);
          seen.add(Number(w.id));
        }
      }
    }
    expect(seen.size).toBeGreaterThan(1);
  });
});

describe('variantes par classe — la bonne, ou rien', () => {
  /**
   * Signalé par le mainteneur du Gear Solver, et c'est le pire mode de panne
   * du contrat : les 5 variantes d'une famille Briareos/Gorgon portent des
   * `setId` DIFFÉRENTS, et c'est sa clé de filtre d'effet. Recommander la
   * variante d'une autre classe que celle du perso pose donc une contrainte
   * qu'aucune pièce de son inventaire ne peut satisfaire → zéro build trouvé,
   * et son app n'a AUCUN moyen de s'en apercevoir : elle n'a pas de warning à
   * lever, l'id est valide. Pire que l'ancien `itemId: null`, qui prévenait.
   *
   * Ça ne peut donc pas rester une propriété qu'on vérifie à la main.
   */
  it('la variante recommandée est toujours de la classe du personnage', () => {
    const mismatches: string[] = [];
    let checked = 0;
    for (const charId of Object.keys(loadGearReco())) {
      const charClass = (CHARACTERS[charId] as { class?: string } | undefined)?.class;
      if (!charClass) continue;
      const reco = getRecoStatPriorities(charId)!;
      for (const [buildName, build] of Object.entries(reco.builds)) {
        for (const piece of [...(build.Weapon ?? []), ...(build.Amulet ?? [])]) {
          // Seules les variantes par classe portent un suffixe « [Classe] ».
          const suffix = /\[([^\]]+)\]$/.exec(piece.name);
          if (!suffix) continue;
          checked++;
          const limit = (
            (piece.itemId != null ? EQUIPMENT[String(piece.itemId)] : undefined) as
              { classLimit?: string | null } | undefined
          )?.classLimit;
          if (limit && limit !== charClass) {
            mismatches.push(
              `${charId}/${buildName} : "${piece.name}" (${limit}) sur un perso ${charClass}`,
            );
          }
        }
      }
    }
    expect(mismatches).toEqual([]);
    // Sans ça, le test passerait À VIDE le jour où le suffixe de classe change
    // de forme — en ne vérifiant plus rien, mais toujours au vert.
    expect(checked, 'aucune variante par classe inspectée').toBeGreaterThan(10);
  });
});

describe('invariants sur les 90 personnages curés', () => {
  const all = Object.keys(loadGearReco()).map((id) => getRecoStatPriorities(id)!);

  it('tous les persos curés répondent', () => {
    expect(all.length).toBe(Object.keys(loadGearReco()).length);
    expect(all.every(Boolean)).toBe(true);
  });

  it('toute clé de stat émise appartient au vocabulaire moteur', () => {
    const offenders = new Set<string>();
    for (const reco of all) {
      for (const build of Object.values(reco.builds)) {
        for (const piece of [...(build.Weapon ?? []), ...(build.Amulet ?? [])]) {
          for (const s of piece.mainStat) if (!ENGINE_STATS.has(s)) offenders.add(s);
        }
        for (const tier of build.SubstatPrio ?? []) {
          for (const s of tier) if (!ENGINE_STATS.has(s)) offenders.add(s);
        }
      }
    }
    expect([...offenders]).toEqual([]);
  });

  it('aucun itemId ni setId non résolu (chacun ferait sauter un filtre côté app)', () => {
    const unresolved: string[] = [];
    for (const reco of all) {
      for (const [name, build] of Object.entries(reco.builds)) {
        const pieces = [
          ...(build.Weapon ?? []),
          ...(build.Amulet ?? []),
          ...(build.Talisman ?? []),
        ];
        for (const piece of pieces) {
          if (piece.itemId === null) unresolved.push(`${reco.id}/${name} item "${piece.name}"`);
        }
        for (const combo of build.Set ?? []) {
          for (const cond of combo) {
            if (cond.setId === null) unresolved.push(`${reco.id}/${name} set "${cond.name}"`);
          }
        }
      }
    }
    expect(unresolved).toEqual([]);
  });

  it('les tiers de SubstatPrio sont non vides et ordonnés', () => {
    for (const reco of all) {
      for (const [name, build] of Object.entries(reco.builds)) {
        for (const tier of build.SubstatPrio ?? []) {
          expect(tier.length, `${reco.id}/${name} : tier vide`).toBeGreaterThan(0);
        }
      }
    }
  });
});
