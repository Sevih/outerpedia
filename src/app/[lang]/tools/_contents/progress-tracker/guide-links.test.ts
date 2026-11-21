/**
 * Liens du suivi vers le guide du boss en cours et fiches de boss — sur la
 * VRAIE donnée (calendrier du jeu, guides publiés) : la jointure saison →
 * guide (World Boss, Joint Challenge, guild raid), les guides fixes, les fiches
 * tirées de la donnée du mode et les tables de Singularity.
 */
import { describe, expect, it } from 'vitest';
import { getT, type TranslationKey } from '@/i18n';
import { img } from '@/lib/images';
import { getMonster } from '@/lib/data/monsters';
import { getEncounter } from '@/lib/data/encounters';
import { seasonFightsAt, seasonsForBoss } from '@/lib/data/content-schedule';
import {
  getGuide,
  groupBossMonster,
  listGuidesByCategory,
  readGuideVersionFile,
} from '@/lib/data/guides';
import { singularityExBuffs, singularityGroups } from '@/lib/data/singularity';
import {
  fixedGuideLinks,
  guildRaidGuideLinks,
  seasonBossCards,
  seasonGuideLinks,
  singularityBossCards,
  singularityExBuffLabels,
  singularityGuideLinks,
} from './guide-links';

/**
 * Saison 49 du guild raid (« Automaton », 20/11 → 27/11/2026), retrouvée par la
 * donnée : le combat `main` de la dernière version du guide Planetary Control
 * Unit → son boss → ses saisons de guild raid → l'id 49.
 */
const pcu = getGuide('guild-raid', 'planetary-control-unit')!;
const pcuMain = readGuideVersionFile<{ main: string }>(
  pcu,
  pcu.versions[0].key,
  'config.json',
)!.main;
const gr49 = seasonsForBoss(groupBossMonster(pcuMain)!.id).find(
  (s) => s.mode === 'guild-raid' && s.id === '49',
)!;
const gr49Window = { start: gr49.start, end: gr49.battleEnd };

describe('seasonGuideLinks', () => {
  it('World Boss 26 (fenêtre du 20/10) → Drakhan', () => {
    const [w] = seasonGuideLinks(
      'world-boss',
      [{ start: '2026-10-20T00:00:00Z', end: '2026-10-27T00:00:00Z' }],
      listGuidesByCategory('world-boss'),
      'en',
    );
    expect(w.guide?.href).toBe('/guides/world-boss/drakhan');
    expect(w.guide?.name).toBeTruthy();
  });

  it('Joint Challenge 31 (fenêtre du 06/10) → Annihilator', () => {
    const [w] = seasonGuideLinks(
      'joint-challenge',
      [{ start: '2026-10-06T00:00:00Z', end: '2026-10-13T00:00:00Z' }],
      listGuidesByCategory('joint-challenge'),
      'en',
    );
    expect(w.guide?.href).toBe('/guides/joint-challenge/annihilator');
  });

  it("une fenêtre sans guide n'a pas de champ `guide`", () => {
    const windows = [{ start: '2099-01-01T00:00:00Z', end: '2099-01-08T00:00:00Z' }];
    const [w] = seasonGuideLinks('world-boss', windows, listGuidesByCategory('world-boss'), 'en');
    expect(w).toEqual(windows[0]);
    expect('guide' in w).toBe(false);
  });

  it("le mode compte : la fenêtre d'un World Boss ne prend pas un guide de Joint Challenge", () => {
    const [w] = seasonGuideLinks(
      'joint-challenge',
      [{ start: '2026-10-20T00:00:00Z', end: '2026-10-27T00:00:00Z' }],
      listGuidesByCategory('joint-challenge'),
      'en',
    );
    expect(w.guide).toBeUndefined();
  });
});

describe('singularityGuideLinks', () => {
  const table = singularityGuideLinks(listGuidesByCategory('dimensional-singularity'), 'fr');

  it('chacun des boss de la rotation a son guide', () => {
    const bosses = new Set(singularityGroups().flatMap((g) => g.bosses.map((b) => b.monsters[0])));
    expect(bosses.size).toBe(15);
    expect([...bosses].filter((id) => !table[id])).toEqual([]);
  });

  it('href de guide, nom du boss dans la langue', () => {
    for (const link of Object.values(table)) {
      expect(link.href).toMatch(/^\/guides\/dimensional-singularity\/[a-z0-9-]+$/);
      expect(link.name).toBeTruthy();
    }
  });
});

describe('guildRaidGuideLinks', () => {
  it('saison 49 → planetary-control-unit, onglet de phase 2', () => {
    expect(gr49).toBeDefined();
    const [w] = guildRaidGuideLinks([gr49Window], listGuidesByCategory('guild-raid'), 'en');
    expect(w.guide?.href).toBe('/guides/guild-raid/planetary-control-unit#phase=p2');
    // Pas de `bossId` : le libellé reprend le titre du guide.
    expect(w.guide?.name).toBe(pcu.title.en);
  });

  it("une fenêtre sans saison n'a pas de champ `guide`", () => {
    const windows = [{ start: '2099-01-01T00:00:00Z', end: '2099-01-08T00:00:00Z' }];
    const [w] = guildRaidGuideLinks(windows, listGuidesByCategory('guild-raid'), 'en');
    expect('guide' in w).toBe(false);
  });
});

describe('fixedGuideLinks', () => {
  const table = fixedGuideLinks('en');
  const expected: Record<string, string> = {
    'skyward-tower-vhard-20': '/guides/skyward-tower/very-hard-tower',
    'irregular-queen': '/guides/irregular-extermination/pursuit-queen',
    'irregular-wyvre': '/guides/irregular-extermination/pursuit-mutated-wyvre',
    'irregular-iron-stretcher': '/guides/irregular-extermination/pursuit-iron-stretcher',
    'irregular-blockbuster': '/guides/irregular-extermination/pursuit-blockbuster',
  };

  it('les cinq tâches, et elles seules, résolvent un guide visible', () => {
    expect(Object.keys(table).sort()).toEqual(Object.keys(expected).sort());
    for (const [taskId, href] of Object.entries(expected)) {
      expect(table[taskId].href).toBe(href);
      const [, , category, slug] = href.split('/');
      expect(getGuide(category, slug)?.hidden).not.toBe(true);
    }
  });

  it('libellé : nom du boss si `bossId` (poursuites), sinon titre du guide (tour)', () => {
    const queen = getGuide('irregular-extermination', 'pursuit-queen')!;
    expect(table['irregular-queen'].name).toBe(getMonster(queen.bossId!)!.name.en);
    expect(table['skyward-tower-vhard-20'].name).toBe(
      getGuide('skyward-tower', 'very-hard-tower')!.title.en,
    );
  });
});

describe('seasonBossCards (donnée du mode, pas du guide)', () => {
  it('guild raid : la fiche est le boss PRINCIPAL (groupe MAIN), jamais un sous-boss', async () => {
    const t = await getT('en');
    const [w] = seasonBossCards('guild-raid', [gr49Window], 'en', t);
    const groups = seasonFightsAt('guild-raid', gr49.start)!.fights.map(
      (f) => getEncounter(f.dungeons[0])!.group!,
    );
    const main = groups.find((g) => g.endsWith('_MAIN'))!;
    const subs = groups.filter((g) => g !== main);
    expect(subs).toHaveLength(2);
    const boss = groupBossMonster(main)!;
    expect(w.boss?.name).toBe(boss.name.en);
    expect(w.boss?.element).toEqual({ icon: img.element(boss.element), name: expect.any(String) });
    expect(w.boss?.klass.icon).toBe(img.klass(boss.class));
    for (const sub of subs) expect(w.boss?.name).not.toBe(groupBossMonster(sub)!.name.en);
  });

  it('Joint Challenge : le monstre du dernier palier, celui que porte le guide', async () => {
    const t = await getT('fr');
    const koh = getGuide('joint-challenge', 'koh-meteos')!;
    const season = seasonsForBoss(koh.bossId!).find((s) => s.mode === 'joint-challenge')!;
    const [w] = seasonBossCards(
      'joint-challenge',
      [{ start: season.start, end: season.end }],
      'fr',
      t,
    );
    const monster = getMonster(koh.bossId!)!;
    expect(w.boss?.name).toBe(monster.name.fr);
    expect(w.boss?.element.name).toBe(t(`sys.element.${monster.element}` as TranslationKey));
  });

  it('World Boss : le boss de la ligne de saison', async () => {
    const t = await getT('en');
    const drakhan = getGuide('world-boss', 'drakhan')!;
    const season = seasonsForBoss(drakhan.bossId!).find((s) => s.mode === 'world-boss')!;
    const [w] = seasonBossCards(
      'world-boss',
      [{ start: season.start, end: season.battleEnd }],
      'en',
      t,
    );
    expect(w.boss?.name).toBe(
      getMonster(seasonFightsAt('world-boss', season.start)!.boss!)!.name.en,
    );
  });

  it("une fenêtre sans saison n'a pas de fiche", async () => {
    const t = await getT('en');
    const windows = [{ start: '2099-01-01T00:00:00Z', end: '2099-01-08T00:00:00Z' }];
    for (const mode of ['world-boss', 'joint-challenge', 'guild-raid'] as const)
      expect('boss' in seasonBossCards(mode, windows, 'en', t)[0]).toBe(false);
  });
});

describe('tables de Singularity : fiches et EX Buff', () => {
  it('chaque boss de la rotation a sa fiche (portrait `thumbnail` d’abord)', async () => {
    const t = await getT('en');
    const cards = singularityBossCards('en', t);
    for (const group of singularityGroups())
      for (const boss of group.bosses) {
        const card = cards[boss.monsters[0]];
        expect(card).toBeDefined();
        if (boss.thumbnail) expect(card.portrait).toBe(img.singularity(boss.thumbnail));
      }
  });

  it('chaque EX Buff porté par un créneau est résolu (cible et `desc` dans la langue)', async () => {
    const t = await getT('fr');
    const labels = singularityExBuffLabels('fr', t);
    const ids = new Set(singularityGroups().flatMap((g) => g.bosses.map((b) => b.exBuff)));
    for (const id of ids) {
      if (!id) continue;
      expect(labels[id].label.startsWith(t('guides.singularity.ex_buff.label'))).toBe(true);
      expect(labels[id].desc).toBe(singularityExBuffs()[id].desc.fr);
      expect(labels[id].icon).toBeTruthy();
    }
  });
});
