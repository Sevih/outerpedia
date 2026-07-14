import { describe, expect, it } from 'vitest';
import {
  guideUpdatedDate,
  listGuides,
  listGuidesByCategory,
  readGuideFile,
  readGuideVersionFile,
} from '@/lib/data/guides';
import { GUIDE_TIER_KEYS, categoryRequires } from '@/lib/data/guide-categories';
import { bossWaveMonsters, encountersOfGroup, encountersOfIds } from '@/lib/data/encounters';
import { findCharacterByName } from '@/lib/data/characters';
import { checkText } from '@/lib/parse-text';

describe('guideUpdatedDate — résolution de la date de mise à jour', () => {
  it('privilégie le `updated` explicite du meta', () => {
    expect(
      guideUpdatedDate({
        updated: '2026-03-24',
        versions: [{ key: '2026-03' }, { key: '2025-10' }],
      }),
    ).toBe('2026-03-24');
  });

  it('dérive du dossier de version le plus récent quand `updated` est absent', () => {
    expect(
      guideUpdatedDate({ updated: undefined, versions: [{ key: '2026-03' }, { key: '2025-10' }] }),
    ).toBe('2026-03-01');
  });

  it('rend une chaîne vide pour un guide plat sans date (cas exclu par le scan)', () => {
    expect(guideUpdatedDate({ updated: undefined, versions: [] })).toBe('');
  });

  it('tous les guides réels résolvent une date ISO (le scan garantit la résolvabilité)', () => {
    for (const g of listGuides()) {
      expect(guideUpdatedDate(g), `${g.category}/${g.slug}`).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }
  });
});

describe('champs exigés par la vue d’une catégorie (`requires`)', () => {
  it('chaque guide porte les champs que sa catégorie exige', () => {
    for (const g of listGuides()) {
      for (const field of categoryRequires(g.category)) {
        expect(g[field], `${g.category}/${g.slug} : « ${field} » manquant`).toBeDefined();
      }
    }
  });

  /**
   * Le trou de la V2 : sa map `TIER_BY_SLUG` vivait dans le composant et un
   * guide absent était filtré SANS BRUIT. Ici la vue regroupe par palier
   * déclaré — ce test vérifie qu'aucun guide ne peut tomber hors des paniers.
   */
  it('aucun guide de general-guides ne tombe hors des paliers déclarés', () => {
    const guides = listGuidesByCategory('general-guides');
    const bucketed = GUIDE_TIER_KEYS.flatMap((tier) => guides.filter((g) => g.tier === tier));
    expect(bucketed).toHaveLength(guides.length);
  });
});

describe('special-request — les guides désignent des combats réels, entièrement couverts', () => {
  const guides = listGuidesByCategory('special-request');

  it('les dix échelles portées, chacune sur un combat de treize stages', () => {
    expect(guides).toHaveLength(10);
    for (const g of guides) {
      expect(encountersOfGroup(g.group!), `${g.slug} : ${g.group}`).toHaveLength(13);
    }
  });

  /**
   * Les équipes valent par PLAGE de stages (`teams.json`). Une plage mal bornée
   * ne casse rien à l'écran : le stage orphelin n'affiche simplement pas
   * d'équipe, et personne ne le voit. C'est exactement le genre de trou
   * silencieux qu'on attrape ici — chaque stage doit être couvert par
   * exactement UNE plage.
   */
  it('les plages d’équipes couvrent chaque stage, sans trou ni chevauchement', () => {
    for (const g of guides) {
      const teams = readGuideFile<{ buckets: Array<{ stages: [number, number] }> }>(
        g,
        'teams.json',
      );
      expect(teams, `${g.slug} : teams.json`).toBeDefined();
      const count = encountersOfGroup(g.group!).length;
      for (let order = 1; order <= count; order++) {
        const covering = teams!.buckets.filter((b) => order >= b.stages[0] && order <= b.stages[1]);
        expect(covering, `${g.slug} : stage ${order}`).toHaveLength(1);
      }
    }
  });

  it('le boss du meta (og:image) est bien le boss PRINCIPAL du stage le plus haut', () => {
    for (const g of guides) {
      const ladder = encountersOfGroup(g.group!);
      const top = ladder[ladder.length - 1];
      const main = top.monsters.find((m) => m.role === 'boss' && m.hpLines);
      expect(g.bossId, g.slug).toBe(main?.id);
    }
  });
});

describe('irregular-extermination — les guides désignent des combats réels', () => {
  const guides = listGuidesByCategory('irregular-extermination');

  it('les quatre poursuites portées, chacune sur un combat de trois difficultés', () => {
    expect(guides).toHaveLength(4);
    for (const g of guides) {
      expect(encountersOfGroup(g.group!), `${g.slug} : ${g.group}`).toHaveLength(3);
    }
  });

  it('le boss du meta (portrait de la vue, og:image) est celui du Very Hard', () => {
    for (const g of guides) {
      const ladder = encountersOfGroup(g.group!);
      const top = ladder[ladder.length - 1];
      expect(g.bossId, g.slug).toBe(top.monsters[0].id);
    }
  });

  it("l'ordre de la catégorie est celui du jeu (order = GroupID de la poursuite)", () => {
    for (const g of guides) {
      expect(g.group, g.slug).toBe(`irregular_chase:${g.order}`);
    }
  });
});

/**
 * ADVENTURE LICENSE — 26 combats DÉSIGNÉS, chacun seul dans son groupe : ici
 * l'échelle n'est pas faite de donjons frères (poursuite, guild raid) mais des
 * RANGS d'un donjon unique (les stages 1-15 de la V2, rendus par la glissière de
 * la carte de boss). Le groupe reste le pointeur du guide vers son combat.
 *
 * Le contrôle qui compte vraiment ici est celui de l'ICÔNE : la vue range une
 * carte dans l'onglet Weekly ou Promotion selon que son icône finit par `_Lock`,
 * et elle en dérive la face révélée (`_Open`). Une icône incohérente avec le mode
 * du donjon ne casserait rien — elle rangerait juste la carte dans le mauvais
 * onglet, en silence. C'est exactement le trou que la V2 avait (elle lisait le
 * préfixe du slug) et qu'on refuse de rouvrir.
 */
describe('adventure-license — les guides désignent des combats réels', () => {
  const guides = listGuidesByCategory('adventure-license');

  it('les 26 licences portées, chacune sur un combat solitaire et peuplé', () => {
    expect(guides).toHaveLength(26);
    for (const g of guides) {
      const encounters = encountersOfGroup(g.group!);
      expect(encounters, `${g.slug} : ${g.group}`).toHaveLength(1);
      expect(encounters[0].monsters.length, g.slug).toBeGreaterThan(0);
    }
  });

  it('le boss du meta (og:image) est bien le boss du donjon', () => {
    for (const g of guides) {
      const [encounter] = encountersOfGroup(g.group!);
      const boss = encounter.monsters.find((m) => m.role === 'boss');
      expect(g.bossId, g.slug).toBe(boss?.id);
    }
  });

  it("l'icône verrouillée (`_Lock`) désigne exactement les Promotion Challenge", () => {
    for (const g of guides) {
      const [encounter] = encountersOfGroup(g.group!);
      expect(g.icon.endsWith('_Lock'), `${g.slug} : ${g.icon} / ${encounter.ref.mode}`).toBe(
        encounter.ref.mode === 'adventure_challenge',
      );
    }
  });
});

/**
 * ADVENTURE — les stages d'histoire. Le mode n'a AUCUN `group` dans la donnée :
 * chaque guide déclare ses donjons (`meta.dungeons`), et c'est le seul endroit
 * où le Normal et le Hard d'un stage sont reliés. Un id faux ne se verrait nulle
 * part ailleurs qu'au build de prod — d'où ces contrôles.
 */
describe('adventure — les guides désignent des donjons réels', () => {
  const guides = listGuidesByCategory('adventure');

  it('les vingt stages portés, chacun sur des donjons peuplés', () => {
    expect(guides).toHaveLength(20);
    for (const g of guides) {
      const encounters = encountersOfIds(g.dungeons!);
      expect(encounters.length, g.slug).toBeGreaterThan(0);
      for (const e of encounters) expect(e.monsters.length, `${g.slug}/${e.id}`).toBeGreaterThan(0);
    }
  });

  it('les donjons vont du plus facile au plus dur (Story Normal puis Story Hard)', () => {
    for (const g of guides) {
      const modes = encountersOfIds(g.dungeons!).map((e) => e.ref.mode);
      expect(modes, g.slug).toEqual([...modes].sort()); // 'normal' < 'normal_hard'
    }
  });

  it('le boss du meta (og:image) est bien celui de la vague du boss, au mode le plus dur', () => {
    for (const g of guides) {
      const encounters = encountersOfIds(g.dungeons!);
      const hardest = encounters[encounters.length - 1];
      expect(bossWaveMonsters(hardest)[0].id, g.slug).toBe(g.bossId);
    }
  });

  /**
   * `order` n'est pas qu'un tri en adventure : c'est la SEULE source de la saison
   * et de l'épisode affichés (cf. `GuideMeta.order`) — `encounters.season` découpe
   * l'histoire autrement. Un `order` qui ne colle pas au slug déplacerait donc la
   * carte dans une autre saison, sans rien casser d'autre.
   */
  it('order = saison × 100 + épisode, cohérent avec le slug (contrat de la vue)', () => {
    for (const g of guides) {
      const [, season, episode] = /^S(\d+)-(\d+)-\d+$/.exec(g.slug) ?? [];
      expect(season, `${g.slug} : slug de stage attendu`).toBeDefined();
      expect(g.order, g.slug).toBe(Number(season) * 100 + Number(episode));
    }
  });

  it('chaque guide porte son content.json (le rendu en dépend)', () => {
    for (const g of guides) {
      expect(readGuideFile(g, 'content.json'), `${g.slug} : content.json manquant`).toBeDefined();
    }
  });
});

/** Fichiers de contenu d'un guide (à la racine ou dans une version). */
const CONTENT_FILES = [
  'strings.json',
  'tips.json',
  'recommended.json',
  'teams.json',
  'content.json',
] as const;

/** Toutes les chaînes d'un JSON de contenu, récursivement. */
function strings(v: unknown): string[] {
  if (typeof v === 'string') return [v];
  if (Array.isArray(v)) return v.flatMap(strings);
  if (v && typeof v === 'object') return Object.values(v).flatMap(strings);
  return [];
}

/**
 * Tous les NOMS DE PERSONNAGES d'un JSON de contenu, quelle que soit sa forme.
 *
 * Les modes rangent leurs personnages différemment (`recommended[].characters`,
 * `teams[].slots`, les `buckets` du Special Request, les `sections` du World
 * Boss, les `groups` d'un `content.json`), et une liste de formes finirait par
 * en oublier une — c'est ce qui laissait le Special Request SANS contrôle de
 * noms. On cherche donc les deux CLÉS qui portent des personnages, partout où
 * elles sont : le contrat est la clé, pas la profondeur.
 */
function characterNames(v: unknown): string[] {
  if (Array.isArray(v)) return v.flatMap(characterNames);
  if (!v || typeof v !== 'object') return [];
  const o = v as Record<string, unknown>;
  const here: string[] = [];
  if (Array.isArray(o.characters)) here.push(...o.characters.filter((c) => typeof c === 'string'));
  if (Array.isArray(o.slots)) here.push(...(o.slots as string[][]).flat());
  return [...here, ...Object.values(o).flatMap(characterNames)];
}

/**
 * Le rendu des guides est STRICT : un nom de perso ou un tag `{X/…}` inconnu
 * JETTE au SSG. Mais la gate de dev ne fait pas de build — sans ce contrôle,
 * l'erreur d'un portage n'apparaît qu'au build de prod.
 *
 * Il vaut pour TOUT guide plat, quelle que soit sa catégorie : c'était écrit une
 * fois par catégorie portée (et donc absent des suivantes — le Special Request
 * n'avait aucun contrôle de noms). Le contenu versionné a le sien, plus bas.
 */
describe('contenu des guides — tout perso et tout tag inline résolvent', () => {
  const flat = listGuides().filter((g) => g.versions.length === 0);

  it('il existe des guides plats (le filtre ne masque pas un scan vide)', () => {
    expect(flat.length).toBeGreaterThan(0);
  });

  it('tous les personnages cités existent', () => {
    for (const g of flat) {
      for (const file of CONTENT_FILES) {
        for (const name of characterNames(readGuideFile(g, file))) {
          expect(
            findCharacterByName(name),
            `${g.category}/${g.slug}/${file} : « ${name} » introuvable`,
          ).toBeDefined();
        }
      }
    }
  });

  it('tous les tags inline résolvent (effets, persos, équipement)', () => {
    for (const g of flat) {
      for (const file of CONTENT_FILES) {
        const data = readGuideFile<unknown>(g, file);
        if (!data) continue;
        for (const s of strings(data)) {
          for (const check of checkText(s)) {
            expect(
              check.ok,
              `${g.category}/${g.slug}/${file} : tag {${check.type}/${check.value}} — ${check.reason ?? ''}`,
            ).toBe(true);
          }
        }
      }
    }
  });
});

/**
 * Guides VERSIONNÉS (joint challenge, world boss…) : leur contenu vit dans
 * `versions/<clé>/`, que les contrôles ci-dessus — écrits pour les guides plats
 * — ne lisaient pas. Or c'est là que le contenu ARRIVE : porter une saison de la
 * V2, c'est déposer quatre JSON dont le rendu STRICT jette au SSG si un nom de
 * perso ou un tag est faux. Sans ce garde-fou, l'erreur n'apparaissait qu'au
 * build de prod.
 */
describe('guides versionnés — le contenu de CHAQUE version résout', () => {
  const versioned = listGuides().filter((g) => g.versions.length > 0);

  it('il existe des guides versionnés (le filtre ne masque pas un scan vide)', () => {
    expect(versioned.length).toBeGreaterThan(0);
  });

  it('tous les personnages cités existent (recommended + teams de chaque version)', () => {
    // Les deux fichiers ont une forme COURTE (une section implicite) et une forme
    // à `sections` (world boss : par phase / par archétype) — cf. VersionedBossGuide.
    type Reco = Array<{ characters: string[] }> | { sections: Array<{ groups: RecoGroup[] }> };
    type RecoGroup = { characters: string[] };
    type Teams = { slots?: string[][]; sections?: Array<{ slots: string[][] }> };

    for (const g of versioned) {
      for (const v of g.versions) {
        const reco = readGuideVersionFile<Reco>(g, v.key, 'recommended.json');
        const groups: RecoGroup[] = !reco
          ? []
          : Array.isArray(reco)
            ? reco
            : reco.sections.flatMap((s) => s.groups);
        const teams = readGuideVersionFile<Teams>(g, v.key, 'teams.json');
        const slots: string[][] = [
          ...(teams?.slots ?? []),
          ...(teams?.sections ?? []).flatMap((s) => s.slots),
        ];
        const names = [...groups.flatMap((r) => r.characters), ...slots.flat()];
        for (const name of names) {
          expect(
            findCharacterByName(name),
            `${g.slug}/${v.key} : « ${name} » introuvable`,
          ).toBeDefined();
        }
      }
    }
  });

  it('tous les tags inline résolvent, version par version', () => {
    for (const g of versioned) {
      for (const v of g.versions) {
        for (const file of CONTENT_FILES) {
          const data = readGuideVersionFile<unknown>(g, v.key, file);
          if (!data) continue;
          for (const s of strings(data)) {
            for (const check of checkText(s)) {
              expect(
                check.ok,
                `${g.slug}/${v.key}/${file} : tag {${check.type}/${check.value}} — ${check.reason ?? ''}`,
              ).toBe(true);
            }
          }
        }
      }
    }
  });
});
