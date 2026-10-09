/**
 * Le kit d'un monstre tel que son éditeur de câblage le montre, et les monstres
 * que les guides désignent.
 *
 * Ancré sur les données COMMITTÉES (`data/generated/monsters.json`,
 * `monster-skills.json`, `encounters.json`) et sur les guides du dépôt : la
 * suite tourne sans les tables du jeu. Les ids sont DÉRIVÉS de ces données,
 * jamais écrits en dur — un id figé casserait à la première ré-extraction — et
 * la curation est FACTICE : le fichier curé bouge à chaque enregistrement.
 */
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { DungeonRef, Skill } from '@contracts';
import { committedMonsterSkills, committedMonsters } from '@/lib/admin/monster-store';
import { encountersOfGroup, getEncounter } from '@/lib/data/encounters';
import { listGuides, readGuideVersionFile } from '@/lib/data/guides';
import { monsterSkillViews } from '@/lib/skill-view';
import { kitEffectCatalog } from './character-kit';
import {
  guideMonsterIds,
  monsterKitCards,
  monsterKitCatalog,
  monsterPlaces,
  pickMonsterKit,
  type MonsterKitSections,
} from './monster-kit';

const MONSTERS = committedMonsters();
const SKILLS = committedMonsterSkills();
const guides = listGuides();
const none: MonsterKitSections = { chipOwner: {}, chipHide: {}, chipAdd: {} };

/**
 * Le boss d'un guide dont le kit pose des chips sur deux cartes au moins : de
 * quoi en déplacer une d'une carte à l'autre.
 */
const boss = guides
  .map((g) => (g.bossId ? MONSTERS[g.bossId.split('@')[0]] : undefined))
  .find((m) => {
    if (!m) return false;
    const { cards } = monsterKitCards(m, SKILLS, none);
    return cards.filter((c) => c.chips.length).length >= 2;
  })!;
const kitSkills = boss.skills.map((id) => SKILLS[id]).filter((s): s is Skill => Boolean(s));

describe('monsterKitCards — les cartes et les chips d’un kit, sur le committé', () => {
  const { cards, chips } = monsterKitCards(boss, SKILLS, none);
  /** Deux cartes qui portent des chips : celle d'où part une chip, et sa cible. */
  const [from, to] = cards.filter((c) => c.chips.length);
  const moved = from.chips[0];

  it('une carte par skill du monstre, dans son ordre : id, nom, type, sprite brut, description résolue', () => {
    expect(cards.map((c) => c.id)).toEqual(kitSkills.map((s) => s.id));
    for (const [i, card] of cards.entries()) {
      expect(card.name).toBe(kitSkills[i].name.en);
      expect(card.type).toBe(kitSkills[i].type);
      // Le sprite tel que le jeu le nomme : chaque appelant en fait son adresse.
      expect(card.icon).toBe(kitSkills[i].icon);
      expect(card.desc ?? '').not.toMatch(/\[Buff_[CVT]_/);
    }
    expect(cards.some((c) => c.desc)).toBe(true);
  });

  it('un skill absent du catalogue n’a pas de carte', () => {
    const without = { ...SKILLS, [kitSkills[0].id]: undefined };
    expect(monsterKitCards(boss, without, none).cards.map((c) => c.id)).toEqual(
      kitSkills.slice(1).map((s) => s.id),
    );
  });

  it('les chips : une par buff, nommée, à la place que les règles seules lui donnent', () => {
    expect(chips.length).toBeGreaterThan(1);
    expect(new Set(chips.map((c) => c.buff)).size).toBe(chips.length);
    // La place par défaut : les cartes où le rendu, curation vide, montre le buff.
    const shown = new Map<string, string[]>();
    for (const v of monsterSkillViews(kitSkills, {}))
      for (const e of v.effects ?? [])
        if (e.buff) shown.set(e.buff, [...(shown.get(e.buff) ?? []), v.skill.id]);
    for (const chip of chips) {
      expect(chip.name).toBeTruthy();
      expect(typeof chip.isDebuff).toBe('boolean');
      expect(kitSkills.find((s) => s.id === chip.carrier)?.effects?.map((e) => e.buff)).toContain(
        chip.buff,
      );
      expect(chip.defaultCards).toEqual([...new Set(shown.get(chip.buff) ?? [chip.carrier])]);
      expect(chip.owner).toBeNull();
      expect(chip.hiddenOn).toEqual([]);
    }
    // Sans curation, une carte montre les chips dont elle est une place par défaut.
    for (const card of cards) {
      expect(card.chips).toEqual(
        chips.filter((c) => c.defaultCards.includes(card.id)).map((c) => c.buff),
      );
      expect(card.hidden).toEqual([]);
      expect(card.added).toEqual([]);
    }
  });

  it('`chipOwner` : la chip passe sur la carte du kit que le curé lui pose — un candidat d’un autre kit ne compte pas', () => {
    const kit = monsterKitCards(boss, SKILLS, {
      ...none,
      chipOwner: { [moved]: ['skill-d-un-jumeau', to.id] },
    });
    expect(kit.chips.find((c) => c.buff === moved)?.owner).toBe(to.id);
    expect(kit.cards.find((c) => c.id === to.id)?.chips).toContain(moved);
    expect(kit.cards.find((c) => c.id === from.id)?.chips).not.toContain(moved);
    // Sa place par défaut, elle, reste dite : « par défaut » y revient.
    expect(kit.chips.find((c) => c.buff === moved)?.defaultCards).toContain(from.id);

    const twin = monsterKitCards(boss, SKILLS, {
      ...none,
      chipOwner: { [moved]: 'skill-d-un-jumeau' },
    });
    expect(twin.chips.find((c) => c.buff === moved)?.owner).toBeNull();
    expect(twin.cards.find((c) => c.id === from.id)?.chips).toContain(moved);
  });

  it('`chipHide` : la chip est masquée sur sa carte — une ref héritée qui n’est pas une chip n’y paraît pas', () => {
    const kit = monsterKitCards(boss, SKILLS, {
      ...none,
      chipHide: { [from.id]: [moved, 'ref-heritee'] },
    });
    expect(kit.chips.find((c) => c.buff === moved)?.hiddenOn).toEqual([from.id]);
    const card = kit.cards.find((c) => c.id === from.id)!;
    expect(card.hidden).toEqual([moved]);
    expect(card.chips).toEqual(from.chips.filter((b) => b !== moved));
  });

  it('`chipAdd` : les refs ajoutées à une carte, telles que le fichier les porte', () => {
    const kit = monsterKitCards(boss, SKILLS, { ...none, chipAdd: { [to.id]: ['48', '404'] } });
    expect(kit.cards.find((c) => c.id === to.id)?.added).toEqual(['48', '404']);
    expect(kit.cards.find((c) => c.id === from.id)?.added).toEqual([]);
  });

  it('pickMonsterKit : les trois sections restreintes au kit, le porteur parmi SES skills', () => {
    expect(
      pickMonsterKit(
        {
          chipOwner: { a: 'k2', b: ['zz', 'k1'], c: 'zz', d: ['zz', 'yy'] },
          chipHide: { k1: ['a'], zz: ['a'] },
          chipAdd: { k2: ['48'], yy: ['48'] },
        },
        ['k1', 'k2'],
      ),
    ).toEqual({
      chipOwner: { a: 'k2', b: 'k1' },
      chipHide: { k1: ['a'] },
      chipAdd: { k2: ['48'] },
    });
  });

  it('monsterKitCatalog : le catalogue du glossaire des persos, le même', () => {
    expect(monsterKitCatalog()).toEqual(kitEffectCatalog());
    expect(Object.keys(monsterKitCatalog()).length).toBeGreaterThan(50);
  });
});

describe('monsterPlaces — où l’on affronte un monstre', () => {
  const dungeon = (over: Partial<DungeonRef>): DungeonRef =>
    ({ mode: 'special_request', name: { en: 'Stage' }, ...over }) as DungeonRef;
  const dungeons: Record<string, DungeonRef> = {
    story: dungeon({
      mode: 'origin',
      name: { en: 'The Clock Tower' },
      area: { en: 'Pandemonium' },
      season: 3,
      episode: 8,
    } as Partial<DungeonRef>),
    wb: dungeon({
      mode: 'world_boss',
      name: { en: 'World Boss' },
      difficulty: { name: { en: 'Extreme League' } },
    } as Partial<DungeonRef>),
    sr: dungeon({ name: { en: 'Identification — Stage 13' } } as Partial<DungeonRef>),
    sr2: dungeon({ name: { en: 'Identification — Stage 13' } } as Partial<DungeonRef>),
  };
  const spawns = (...ids: string[]) =>
    ({ spawns: ids.map((d) => ({ dungeon: d })) }) as Parameters<typeof monsterPlaces>[0];

  it('les modes de ses spawns, et leurs stages : l’histoire par saison · épisode · zone, le world boss par sa ligue', () => {
    expect(monsterPlaces(spawns('story', 'wb', 'sr'), dungeons)).toEqual({
      modes: ['origin', 'world_boss', 'special_request'],
      zones: [
        'S3 Ep8 · Pandemonium · The Clock Tower',
        'Extreme League',
        'Identification — Stage 13',
      ],
    });
  });

  it('sans doublon, et un donjon inconnu ne compte pas ; un add sans spawn n’a ni mode ni zone', () => {
    expect(monsterPlaces(spawns('sr', 'sr2', 'nope'), dungeons)).toEqual({
      modes: ['special_request'],
      zones: ['Identification — Stage 13'],
    });
    expect(monsterPlaces({}, dungeons)).toEqual({ modes: [], zones: [] });
  });
});

describe('guideMonsterIds — les monstres que les guides désignent', () => {
  afterEach(() => {
    vi.doUnmock('@/lib/data/guides');
    vi.resetModules();
  });

  const ids = guideMonsterIds(MONSTERS);
  const refOf = (g: (typeof guides)[number]) => ({
    category: g.category,
    slug: g.slug,
    title: g.title.en,
  });

  it('`meta.bossId` et `meta.monsters` : le monstre nommé porte son guide — catégorie, slug, titre anglais', () => {
    const named = guides.find((g) => g.bossId && !g.bossId.includes('@'))!;
    expect(ids.get(named.bossId!)).toContainEqual(refOf(named));
    const listed = guides.find((g) => g.monsters?.length);
    for (const id of listed?.monsters ?? [])
      expect(ids.get(id.split('@')[0])).toContainEqual(refOf(listed!));
  });

  it('`meta.group` et `meta.dungeons` : tous les monstres du combat, toutes difficultés', () => {
    const grouped = guides.find((g) => g.group && encountersOfGroup(g.group).length)!;
    const fought = encountersOfGroup(grouped.group!).flatMap((e) => e.monsters.map((m) => m.id));
    expect(fought.length).toBeGreaterThan(0);
    for (const id of fought) expect(ids.get(id)).toContainEqual(refOf(grouped));

    const staged = guides.find((g) => g.dungeons?.length)!;
    const met = staged.dungeons!.flatMap((d) => (getEncounter(d)?.monsters ?? []).map((m) => m.id));
    expect(met.length).toBeGreaterThan(0);
    for (const id of met) expect(ids.get(id)).toContainEqual(refOf(staged));
  });

  it('le `config.json` d’une version : son combat (`group`, `main`, `subA`, `subB`)', () => {
    const versioned = guides
      .flatMap((g) =>
        g.versions.map((v) => ({
          g,
          cfg: readGuideVersionFile<Record<string, unknown>>(g, v.key, 'config.json') ?? {},
        })),
      )
      .filter(({ cfg }) =>
        ['group', 'main', 'subA', 'subB'].some((k) => typeof cfg[k] === 'string'),
      );
    expect(versioned.length).toBeGreaterThan(0);
    for (const key of ['group', 'main', 'subA', 'subB']) {
      const hit = versioned.find(({ cfg }) => typeof cfg[key] === 'string');
      if (!hit) continue;
      for (const e of encountersOfGroup(hit.cfg[key] as string))
        for (const m of e.monsters) expect(ids.get(m.id)).toContainEqual(refOf(hit.g));
    }
  });

  it('les adds : un monstre jamais spawné, invoqué ou lié, prend les guides de son ancre', () => {
    const add = Object.values(MONSTERS).find(
      (m) =>
        !m.spawns?.length &&
        [...(m.summonedBy ?? []), ...(m.linkedTo ?? [])].some(
          (a) => MONSTERS[a]?.spawns?.length && ids.has(a),
        ),
    )!;
    const anchor = [...(add.summonedBy ?? []), ...(add.linkedTo ?? [])].find(
      (a) => MONSTERS[a]?.spawns?.length && ids.has(a),
    )!;
    for (const ref of ids.get(anchor)!) expect(ids.get(add.id)).toContainEqual(ref);
  });

  it('quelques centaines de monstres, pas les milliers du jeu — et un guide n’y est qu’une fois par monstre', () => {
    expect(ids.size).toBeGreaterThan(300);
    expect(ids.size).toBeLessThan(Object.keys(MONSTERS).length / 4);
    for (const refs of ids.values())
      expect(new Set(refs.map((r) => `${r.category}/${r.slug}`)).size).toBe(refs.length);
  });

  it('un `bossId@n` — une archive épinglée — vaut son id', async () => {
    const guide = { ...guides.find((g) => g.bossId)!, bossId: `${boss.id}@2`, versions: [] };
    delete guide.group;
    delete guide.dungeons;
    delete guide.monsters;
    vi.resetModules();
    vi.doMock('@/lib/data/guides', () => ({
      listGuides: () => [guide],
      readGuideVersionFile: () => undefined,
    }));
    const fresh = await import('./monster-kit');
    expect([...fresh.guideMonsterIds({ [boss.id]: boss }).keys()]).toEqual([boss.id]);
  });
});
