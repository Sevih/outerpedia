/**
 * LE FORMAT ÉDITABLE DES GUILD RAIDS (lot F33) — `guild-raid-draft.ts`.
 *
 * Trois choses, sur le CORPUS RÉEL puis sur des cas construits :
 *   - le prédicat « version au gabarit » range les versions du dépôt : la plus
 *     récente de chacun des cinq raids est au gabarit, une version qui porte
 *     un `turnOrder` ou n'a plus ses combats est à l'ancien format ;
 *   - l'ALLER-RETOUR d'une version au gabarit est SANS DIFF, à l'octet près :
 *     lecture, brouillon, réécriture canonique (`formatJson`, le sérialiseur du
 *     store), comparaison au fichier du disque — c'est ce qui garantit qu'un
 *     enregistrement de quick ne reformate pas ce qu'il ne change pas ;
 *   - les REFUS d'un brouillon venu de la page (`cleanRaidVersion`).
 */
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { formatJson } from '@datagen/lib/json';
import { listGuides, readGuideVersionFile, type Guide } from '@/lib/data/guides';
import { checkText } from '@/lib/parse-text';
import { findCharacterByName } from '@/lib/data/characters';
import { raidGeasChoices } from './guild-raid-geas';
import {
  RAID_FILES,
  cleanRaidVersion,
  fromRaidDraft,
  isRaidLegacy,
  raidTemplateIssues,
  raidVideos,
  readRaidVersion,
  toRaidDraft,
  type RaidCheckContext,
  type RaidRawFiles,
  type RaidTemplateDraft,
} from './guild-raid-draft';

const RAIDS = listGuides().filter((g) => g.category === 'guild-raid');
const CONTENTS = resolve(process.cwd(), 'src/app/[lang]/guides/_contents/guild-raid');

const filesOf = (g: Guide, key: string): RaidRawFiles => ({
  config: readGuideVersionFile<unknown>(g, key, 'config.json'),
  subA: readGuideVersionFile<unknown>(g, key, 'subA.json'),
  subB: readGuideVersionFile<unknown>(g, key, 'subB.json'),
  main: readGuideVersionFile<unknown>(g, key, 'main.json'),
});

/** `<slug>/<clé>` de chaque version, rangées par le prédicat. */
const sorted = (): { template: string[]; legacy: string[] } => {
  const out = { template: [] as string[], legacy: [] as string[] };
  for (const g of RAIDS)
    for (const v of g.versions)
      out[raidTemplateIssues(filesOf(g, v.key)).length ? 'legacy' : 'template'].push(
        `${g.slug}/${v.key}`,
      );
  return out;
};

describe('raidTemplateIssues — le prédicat « version au gabarit », sur le dépôt', () => {
  it('les cinq raids sont là, chacun avec ses versions', () => {
    expect(RAIDS.map((g) => g.slug).sort()).toEqual([
      'dignity-of-the-golden-kingdom',
      'frost-legion',
      'madman-laboratory',
      'planetary-control-unit',
      'prevent-world-alteration',
    ]);
  });

  it('la version la plus récente de chaque raid est au gabarit', () => {
    for (const g of RAIDS)
      expect(raidTemplateIssues(filesOf(g, g.versions[0].key)), `${g.slug}`).toEqual([]);
  });

  it('range les quatorze versions : au gabarit, ou à l’ancien format', () => {
    expect(sorted()).toEqual({
      template: [
        'dignity-of-the-golden-kingdom/2026-08',
        'dignity-of-the-golden-kingdom/2026-01',
        'frost-legion/2026-09',
        'frost-legion/2025-11',
        'madman-laboratory/2026-04',
        'planetary-control-unit/2026-11',
        'prevent-world-alteration/2026-06',
      ],
      legacy: [
        'dignity-of-the-golden-kingdom/2025-07',
        'frost-legion/2025-05',
        'madman-laboratory/2025-10',
        'planetary-control-unit/2026-02',
        'planetary-control-unit/2025-08',
        'prevent-world-alteration/2025-12',
        'prevent-world-alteration/2025-06',
      ],
    });
  });

  it('dit POURQUOI une version est à l’ancien format : un turnOrder, ou plus de combat', () => {
    const pcu = RAIDS.find((g) => g.slug === 'planetary-control-unit')!;
    expect(raidTemplateIssues(filesOf(pcu, '2026-02')).join(' | ')).toMatch(/bloc turnOrder/);
    expect(raidTemplateIssues(filesOf(pcu, '2025-08'))).toEqual([
      'config.json : sans combat « subA » (saison archivée)',
      'config.json : sans combat « subB » (saison archivée)',
      'config.json : sans combat « main » (saison archivée)',
    ]);
  });

  it('refuse tout champ et tout bloc hors du gabarit', () => {
    const base: RaidRawFiles = { config: { subA: 'a', subB: 'b', main: 'm' } };
    const team = { title: { en: 'T' }, slots: [['X']] };
    const main = (extra: Record<string, unknown>) => ({
      ...base,
      main: { teams: [{ ...team, ...extra }] },
    });
    expect(raidTemplateIssues(base)).toEqual([]);
    expect(raidTemplateIssues(main({}))).toEqual([]);
    expect(
      raidTemplateIssues(main({ notes: [{ p: { en: 'a' } }, { ul: [{ en: 'b' }] }] })),
    ).toEqual([]);
    expect(raidTemplateIssues(main({ notes: [{ turnOrder: [] }] }))).toEqual([
      'main.json équipe 1 note 1 : bloc turnOrder',
    ]);
    expect(raidTemplateIssues(main({ notes: [{ ol: [] }] }))[0]).toMatch(/ni « p » ni « ul »/);
    expect(raidTemplateIssues(main({ turnOrder: [] }))).toEqual([
      'main.json équipe 1 : champ « turnOrder »',
    ]);
    expect(
      raidTemplateIssues(
        main({ requirements: { entries: [{ character: 'X', stats: { luck: '1' } }] } }),
      ),
    ).toEqual(['main.json équipe 1 build 1 stats : « luck » inattendu']);
    expect(
      raidTemplateIssues(
        main({ requirements: { entries: [{ character: 'X', equipment: { ring: ['a'] } }] } }),
      ),
    ).toEqual(['main.json équipe 1 build 1 equipment : « ring » inattendu']);
    expect(
      raidTemplateIssues({ ...base, config: { subA: 'a', subB: 'b', main: 'm', videos: [] } }),
    ).toEqual(['config.json : champ « videos »']);
    expect(raidTemplateIssues({ ...base, subA: { tips: [] } })).toEqual([
      'subA.json : champ « tips »',
    ]);
    expect(raidTemplateIssues({})).toEqual(['config.json : absent']);
  });
});

describe('toRaidDraft / fromRaidDraft — aller-retour SANS DIFF, à l’octet près', () => {
  it('les versions courantes des cinq raids se réécrivent à l’identique', async () => {
    const seen: string[] = [];
    for (const g of RAIDS) {
      const key = g.versions[0].key;
      const draft = readRaidVersion(filesOf(g, key));
      expect(isRaidLegacy(draft), `${g.slug}/${key}`).toBe(false);
      const pinned = (filesOf(g, key).config as { pinned?: string[] }).pinned;
      const payload = fromRaidDraft(draft as RaidTemplateDraft, pinned);
      for (const file of RAID_FILES) {
        const path = resolve(CONTENTS, g.slug, 'versions', key, file);
        expect(existsSync(path), `${g.slug}/${key}/${file}`).toBe(true);
        expect(await formatJson(payload[file]), `${g.slug}/${key}/${file}`).toBe(
          readFileSync(path, 'utf8'),
        );
        seen.push(file);
      }
    }
    expect(seen).toHaveLength(20);
  });

  it('TOUTE version au gabarit du dépôt, ancienne comprise, se réécrit à l’identique', async () => {
    for (const at of sorted().template) {
      const [slug, key] = at.split('/');
      const g = RAIDS.find((x) => x.slug === slug)!;
      const payload = fromRaidDraft(toRaidDraft(filesOf(g, key)));
      for (const file of RAID_FILES)
        expect(await formatJson(payload[file]), `${at}/${file}`).toBe(
          readFileSync(resolve(CONTENTS, slug, 'versions', key, file), 'utf8'),
        );
    }
  });

  it('une version à l’ancien format ne devient pas un brouillon : ses écarts, ses fichiers', () => {
    const files: RaidRawFiles = { config: {}, main: { teams: [] } };
    const read = readRaidVersion(files);
    expect(isRaidLegacy(read)).toBe(true);
    expect(read).toMatchObject({ files });
    expect(raidVideos(read)).toEqual([]);
  });

  it('l’écriture laisse tomber ce qui est vide, et garde l’ordre des clés du gabarit', () => {
    const video = { platform: 'youtube' as const, id: 'abc', title: 'T', author: 'A' };
    const draft: RaidTemplateDraft = {
      subA: 'a',
      subB: 'b',
      main: 'm',
      bossA: { notes: [{ en: ' ' }], recommended: [{ characters: [] }], slots: [[]] },
      bossB: {
        notes: [{ en: 'note' }],
        recommended: [{ characters: [' X '], reason: { en: 'why' } }],
        slots: [['X'], []],
        teamNote: { en: 'n' },
        video,
      },
      teams: [
        {
          title: { en: 'Team' },
          element: 'fire',
          icon: 'IG_Buff_Dot_Burn',
          slots: [['X', ' ']],
          geas: { bonus: ['1'], malus: [] },
          builds: [
            { character: ' ' },
            {
              character: 'X',
              stats: { trans: '6', spd: ' ', eff: '120' },
              prio: [' {S/ATK} ', ''],
              equipment: { set: ['{AS/Revenge}'], weapon: [' '] },
              notes: [{ en: '' }],
            },
          ],
          buildsNote: { en: 'foot' },
          notes: [{ p: { en: '' } }, { ul: [{ en: 'a' }, { en: ' ' }] }, { p: { en: 'p' } }],
          video,
        },
      ],
    };
    const out = fromRaidDraft(draft, ['2@1', '1@1']);
    expect(out['config.json']).toEqual({ subA: 'a', subB: 'b', main: 'm', pinned: ['1@1', '2@1'] });
    expect(out['subA.json']).toBeNull();
    expect(JSON.stringify(out['subB.json'])).toBe(
      JSON.stringify({
        notes: [{ en: 'note' }],
        recommended: [{ characters: ['X'], reason: { en: 'why' } }],
        team: { slots: [['X']], note: { en: 'n' } },
        video,
      }),
    );
    expect(JSON.stringify(out['main.json'])).toBe(
      JSON.stringify({
        teams: [
          {
            title: { en: 'Team' },
            element: 'fire',
            slots: [['X']],
            geasActive: { bonus: ['1'], malus: [] },
            requirements: {
              entries: [
                {
                  character: 'X',
                  stats: { trans: '6', eff: '120' },
                  prio: [' {S/ATK} '],
                  equipment: { set: ['{AS/Revenge}'] },
                },
              ],
              note: { en: 'foot' },
            },
            notes: [{ ul: [{ en: 'a' }] }, { p: { en: 'p' } }],
            video,
          },
        ],
      }),
    );
    expect(raidVideos(draft)).toEqual([video, video]);
    expect(fromRaidDraft({ ...draft, teams: [] })['main.json']).toBeNull();
  });
});

describe('raidGeasChoices — le pool déblocable, dérivé du combat', () => {
  it('chaque version au gabarit a ses vingt geas (dix paliers par sous-boss), icône et points', () => {
    for (const at of sorted().template) {
      const [slug, key] = at.split('/');
      const draft = toRaidDraft(
        filesOf(
          RAIDS.find((x) => x.slug === slug)!,
          key,
        ),
      );
      const pool = [draft.subA, draft.subB].flatMap((group) => raidGeasChoices(group ?? ''));
      expect(new Set(pool.map((c) => c.id)).size, at).toBe(20);
      for (const c of pool) {
        expect(c.text, `${at} ${c.id}`).not.toBe('');
        expect(c.frame).toMatch(/GD_Slot_Bg_0\d\.webp$/);
        // Le rangement du rendu : le signe des points, pas la nature du geas.
        expect(c.bonus).toBe(c.points >= 0);
      }
    }
    expect(raidGeasChoices('guild_raid:NOPE')).toEqual([]);
  });
});

describe('cleanRaidVersion — les refus d’un brouillon venu de la page', () => {
  const ctx: RaidCheckContext = {
    text: (raw) => {
      if (raw === undefined || raw === null) return {};
      const t = raw as Record<string, string>;
      const out = Object.fromEntries(Object.entries(t).filter(([, s]) => s.trim()));
      if (!Object.keys(out).length) return {};
      const bad = Object.values(out).flatMap((s) => checkText(s).filter((c) => !c.ok));
      return {
        text: out as { en: string },
        ...(bad.length ? { issue: `tag inconnu ${bad[0].tag}` } : {}),
      };
    },
    token: (s) =>
      checkText(s)
        .filter((c) => !c.ok)
        .map((c) => `tag inconnu ${c.tag}`),
    names: new Set(['Ember', 'Kuro', 'Liselotte', 'Dianne', 'Anarky']),
    groups: new Set(['g:A', 'g:B', 'g:M']),
    geas: (group) => ({ 'g:A': ['1', '2'], 'g:B': ['3'] })[group] ?? [],
    platform: (p) => p === 'youtube',
  };
  const boss = () => ({ notes: [], recommended: [], slots: [] });
  const team = (extra: Record<string, unknown> = {}) => ({
    title: { en: 'Ember' },
    element: 'fire',
    slots: [['Ember'], ['Kuro', 'Liselotte']],
    geas: { bonus: ['1'], malus: ['3'] },
    builds: [],
    notes: [],
    ...extra,
  });
  const raid = (extra: Record<string, unknown> = {}) => ({
    subA: 'g:A',
    subB: 'g:B',
    main: 'g:M',
    bossA: boss(),
    bossB: boss(),
    teams: [team()],
    ...extra,
  });
  const reasons = (raw: unknown) => cleanRaidVersion(raw, ctx).issues;

  it('un brouillon propre passe, rebâti sur les clés du gabarit', () => {
    const out = cleanRaidVersion(raid({ junk: 1, teams: [team({ junk: 2 })] }), ctx);
    expect(out.issues).toEqual([]);
    expect(out.raid).toEqual({
      subA: 'g:A',
      subB: 'g:B',
      main: 'g:M',
      bossA: boss(),
      bossB: boss(),
      teams: [
        {
          title: { en: 'Ember' },
          element: 'fire',
          slots: [['Ember'], ['Kuro', 'Liselotte']],
          geas: { bonus: ['1'], malus: ['3'] },
          builds: [],
          notes: [],
        },
      ],
    });
  });

  it('un tag inconnu — dans un texte, et dans un token d’équipement, de stat, de priorité', () => {
    expect(reasons(raid({ teams: [team({ notes: [{ p: { en: 'Use {P/Nobody}' } }] })] }))).toEqual([
      { tab: 'phase2', index: 0, field: 'note.0', reason: 'tag inconnu {P/Nobody}' },
    ]);
    const build = (more: Record<string, unknown>) =>
      reasons(raid({ teams: [team({ builds: [{ character: 'Ember', ...more }] })] }));
    expect(build({ equipment: { weapon: ['{I-W/No Such Blade}'] } })).toEqual([
      {
        tab: 'phase2',
        index: 0,
        field: 'build.0',
        reason: 'weapon : tag inconnu {I-W/No Such Blade}',
      },
    ]);
    expect(build({ prio: ['{S/NOPE}'] })[0]).toMatchObject({
      field: 'build.0',
      reason: 'prio : tag inconnu {S/NOPE}',
    });
    expect(build({ stats: { spd: '{S/NOPE}' } })[0]).toMatchObject({
      reason: 'spd : tag inconnu {S/NOPE}',
    });
    expect(
      build({ equipment: { weapon: ['T4 {I-W/Token of the Supreme Witch}'] }, prio: ['{S/ATK}'] }),
    ).toEqual([]);
    expect(reasons(raid({ bossA: { ...boss(), notes: [{ en: '{B/NOPE}' }] } }))).toEqual([
      { tab: 'phase1', index: 0, field: 'notes', reason: 'tag inconnu {B/NOPE}' },
    ]);
  });

  it('un perso inconnu — un poste, un perso recommandé, un build', () => {
    expect(reasons(raid({ teams: [team({ slots: [['Nobody']] })] }))).toEqual([
      { tab: 'phase2', index: 0, field: 'slots', reason: 'hors du roster : « Nobody »' },
    ]);
    expect(
      reasons(raid({ bossB: { ...boss(), recommended: [{ characters: ['Nobody'] }] } })),
    ).toEqual([
      { tab: 'phase1', index: 1, field: 'recommended', reason: 'hors du roster : « Nobody »' },
    ]);
    expect(reasons(raid({ teams: [team({ builds: [{ character: 'Nobody' }] })] }))).toEqual([
      { tab: 'phase2', index: 0, field: 'build.0', reason: 'hors du roster : « Nobody »' },
    ]);
  });

  it('un geas hors du pool déblocable des deux sous-boss de la version', () => {
    expect(reasons(raid({ teams: [team({ geas: { bonus: ['1', '9'], malus: ['3'] } })] }))).toEqual(
      [
        {
          tab: 'phase2',
          index: 0,
          field: 'geas',
          reason: 'geas 9 hors du pool déblocable des sous-boss de la version',
        },
      ],
    );
    // Sans sous-boss, pas de pool : tout geas est hors pool.
    expect(reasons(raid({ subA: '', subB: '' })).map((r) => r.reason)).toEqual([
      'geas 1 hors du pool déblocable des sous-boss de la version',
      'geas 3 hors du pool déblocable des sous-boss de la version',
    ]);
  });

  it('un poste vide, plus de quatre postes — en phase 2 comme en phase 1', () => {
    expect(reasons(raid({ teams: [team({ slots: [['Ember'], []] })] }))).toEqual([
      { tab: 'phase2', index: 0, field: 'slots', reason: 'poste 2 vide' },
    ]);
    const five = [['Ember'], ['Kuro'], ['Liselotte'], ['Dianne'], ['Anarky']];
    expect(reasons(raid({ teams: [team({ slots: five })] }))).toEqual([
      { tab: 'phase2', index: 0, field: 'slots', reason: 'plus de 4 postes' },
    ]);
    expect(reasons(raid({ bossA: { ...boss(), slots: [[' ']] } }))).toEqual([
      { tab: 'phase1', index: 0, field: 'slots', reason: 'poste 1 vide' },
    ]);
    expect(reasons(raid({ bossB: { ...boss(), slots: five } }))).toEqual([
      { tab: 'phase1', index: 1, field: 'slots', reason: 'plus de 4 postes' },
    ]);
  });

  it('une équipe sans titre', () => {
    for (const title of [undefined, { en: ' ' }, { fr: 'Braise' }])
      expect(reasons(raid({ teams: [team(), team({ title })] }))).toEqual([
        { tab: 'phase2', index: 1, field: 'title', reason: 'équipe sans titre' },
      ]);
  });

  it('un turnOrder qui réapparaîtrait', () => {
    expect(
      reasons(
        raid({
          teams: [
            team({
              notes: [{ p: { en: 'ok' } }, { turnOrder: [{ character: 'Ember', speed: 1 }] }],
            }),
          ],
        }),
      ),
    ).toEqual([
      {
        tab: 'phase2',
        index: 0,
        field: 'note.1',
        reason: 'bloc turnOrder : l’ordre de jeu se lit dans les builds',
      },
    ]);
  });

  it('un combat inconnu, un badge inconnu, une stat inconnue, une vidéo sans plateforme', () => {
    expect(reasons(raid({ main: 'g:Z' }))).toEqual([
      { tab: 'battle', field: 'main', reason: 'combat inconnu : « g:Z »' },
    ]);
    expect(reasons(raid({ teams: [team({ element: 'wind' })] }))[0]).toMatchObject({
      field: 'badge',
      reason: 'élément inconnu : « wind »',
    });
    expect(reasons(raid({ teams: [team({ element: undefined, icon: '../x' })] }))[0]).toMatchObject(
      {
        field: 'badge',
      },
    );
    expect(
      reasons(
        raid({ teams: [team({ builds: [{ character: 'Ember', stats: { luck: '1' } }] })] }),
      )[0],
    ).toMatchObject({ field: 'build.0', reason: 'stat inconnue : « luck »' });
    expect(
      reasons(raid({ teams: [team({ video: { platform: 'vimeo', id: 'x', title: '' } })] }))[0],
    ).toMatchObject({ field: 'video' });
    expect(cleanRaidVersion('nope', ctx)).toEqual({
      raid: null,
      issues: [{ tab: 'phase2', reason: 'guild raid : forme inattendue' }],
    });
  });

  it('sur le dépôt : les versions courantes passent le contrôle', () => {
    const real: RaidCheckContext = {
      ...ctx,
      names: { has: (n: string) => Boolean(findCharacterByName(n)) } as ReadonlySet<string>,
      groups: { has: () => true } as unknown as ReadonlySet<string>,
      geas: (group) => raidGeasChoices(group).map((c) => c.id),
    };
    const stray: string[] = [];
    for (const g of RAIDS) {
      const key = g.versions[0].key;
      const draft = toRaidDraft(filesOf(g, key));
      const out = cleanRaidVersion(JSON.parse(JSON.stringify(draft)), real);
      // Le contrôle ne déforme rien : ce qu'il rebâtit s'écrit comme le disque.
      expect(JSON.stringify(fromRaidDraft(out.raid!)), g.slug).toBe(
        JSON.stringify(fromRaidDraft(draft)),
      );
      for (const issue of out.issues)
        stray.push(`${g.slug} équipe ${(issue.index ?? 0) + 1} : ${issue.reason}`);
    }
    // Le constat du lot F33 (geas 30 de Dignity 2026-08, hors pool) est corrigé
    // depuis le 20/11 (30 → 67, même palier) : plus aucun écart.
    expect(stray).toEqual([]);
  });
});
