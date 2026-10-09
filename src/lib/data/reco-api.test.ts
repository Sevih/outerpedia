import { describe, expect, it } from 'vitest';
import { getRecoStatPriorities } from '@/lib/data/reco-api';
import { loadGearReco } from '@/lib/data/gear-reco';
import { GET } from '@/app/api/reco/[id]/route';
import charactersData from '@data/generated/characters.json';
import weaponsData from '@data/generated/equipment/weapon.json';
import accessoryData from '@data/generated/equipment/accessory.json';
import familiesData from '@data/generated/equipment/families.json';

const CHARACTERS = charactersData as unknown as Record<string, unknown>;
const EQUIPMENT = { ...weaponsData, ...accessoryData } as unknown as Record<string, unknown>;
const WEAPON_FAMILIES = (
  familiesData as unknown as { weapon: { topId: string; ids: string[]; classLimits: string[] }[] }
).weapon;

/**
 * `reco-api.ts` — CONTRAT PUBLIC de `GET /api/reco/:id`, consommé par l'app
 * desktop Gear Solver (repo séparé, qu'on ne peut pas casser au vert).
 *
 * L'endpoint avait déjà disparu une fois, à la reconstruction : ces tests
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
    // Le perso est réel, ses recos sont celles de `data/curated/gear-reco.json`
    // (« Surefire Greatsword », « Death's Hold »/« Clock Up », `$CPdps`, set
    // Speed ×4 au 2026-07). Elles changent à chaque retouche éditoriale : le test
    // vérifie la FORME émise et sa fidélité au curé, pas le choix du jour.
    const reco = getRecoStatPriorities('2000006');
    expect(reco).not.toBeNull();
    expect(reco!.id).toBe('2000006');
    const curated = loadGearReco()['2000006'];
    expect(Object.keys(reco!.builds).sort()).toEqual(curated.map((b) => b.name).sort());

    for (const src of curated) {
      const build = reco!.builds[src.name];
      expect(build, src.name).toBeDefined();

      // Weapon/Amulet : OR-list d'alternatives, une par entrée curée, chacune
      // avec sa OR-list de mains (« PEN%/CHD » → deux clés moteur).
      for (const [out, list] of [
        [build.Weapon ?? [], src.weapons ?? []],
        [build.Amulet ?? [], src.amulets ?? []],
      ] as const) {
        expect(out, src.name).toHaveLength(list.length);
        out.forEach((piece, i) => {
          expect(piece.name, src.name).toBeTruthy();
          expect(typeof piece.itemId, `${src.name} : ${piece.name}`).toBe('number');
          const curatedMain = list[i].mainStat;
          if (curatedMain)
            expect(piece.mainStat, `${src.name} : ${piece.name}`).toHaveLength(
              curatedMain.split('/').length,
            );
        });
      }

      // Talisman : même forme que Weapon/Amulet, mais sans main stat curée (un
      // preset comme `$CPdps` s'aplatit en ses talismans, en OR-list).
      for (const t of build.Talisman ?? []) {
        expect(t).toEqual({
          name: expect.any(String),
          itemId: expect.any(Number),
          effectIcon: expect.any(String),
          mainStat: [],
        });
      }

      // Set : OR-list de combos, chaque combo étant une ET-list de conditions.
      expect(build.Set?.length, src.name).toBeGreaterThan(0);
      for (const combo of build.Set ?? [])
        for (const cond of combo) {
          expect(cond.name).toBeTruthy();
          expect(typeof cond.setId).toBe('string');
          expect([2, 4]).toContain(cond.count);
        }

      // SubstatPrio : tiers ORDONNÉS (preset résolu), non vides.
      expect(build.SubstatPrio?.length, src.name).toBeGreaterThan(0);
      for (const tier of build.SubstatPrio ?? []) expect(tier.length).toBeGreaterThan(0);
    }
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
   * joueur, où l'objet possédé est le 6★ (754) — c'est ce qui était émis.
   * Émettre 4 ne lèverait aucune erreur : ça ferait juste sauter le filtre
   * d'effet de CHAQUE arme et amulette, avec un warning côté app.
   */
  it('remonte le membre bas de famille au palier max (Surefire Greatsword 4 → 754)', () => {
    // Le cas d'origine (Sofia, Surefire Greatsword curé 4, émis 754) dépend du
    // curé du jour : la règle est vérifiée sur TOUTE arme curée qui n'est pas
    // le haut de sa famille (familles mono-classe ; les variantes par classe
    // sont le cas suivant).
    let checked = 0;
    for (const [charId, builds] of Object.entries(loadGearReco())) {
      for (const build of builds) {
        const emitted = getRecoStatPriorities(charId)!.builds[build.name].Weapon ?? [];
        (build.weapons ?? []).forEach((w, i) => {
          const family = WEAPON_FAMILIES.find((f) => f.ids.includes(w.id));
          if (!family || family.classLimits.length > 1 || family.topId === w.id) return;
          checked++;
          expect(emitted[i]?.itemId, `${charId}/${build.name} : ${w.id}`).toBe(
            Number(family.topId),
          );
          expect(emitted[i]?.effectIcon, `${charId}/${build.name} : ${w.id}`).toBeTruthy();
        });
      }
    }
    expect(checked, 'aucun membre bas de famille dans le curé').toBeGreaterThan(0);
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
