/**
 * Contrat de `planRankChanges` — l'onglet « Rangs » de `pnpm quick`.
 *
 * L'enregistrement COMMITTE sur `main`, que « Pousser » envoie : ce qui se
 * perdrait ici partirait en prod avec le commit. Deux pertes possibles,
 * invisibles à l'écran de l'onglet :
 *   - les champs que l'onglet ne montre pas (`tags`, `skillPriority`, `videos`,
 *     `prosCons`, `synergies`, les chips des EE), écrasés par une entrée
 *     reconstruite au lieu d'être reprise ;
 *   - le réglage d'un autre, posé sur le disque depuis le chargement de la page.
 *
 * La fonction est pure : aucun disque ici, l'état est passé en argument.
 *
 * Et contrat de la « Fiche perso » — `characterRoster`, `characterSheetState` et
 * `saveCharacterSheet` : les rangs y passent par le même plan, puis les champs
 * hors rangs (priorité de skills, tags, pros / cons et synergies, leurs tags
 * inline contrôlés par la résolution du site), puis les chips de skills (`kit` :
 * cartes, curation et catalogue FACTICES, `applyCharacterKitCuration` factice).
 * L'EE (`ee` : l'item et le catalogue FACTICES, `upsertEeCurated` factice) : ses
 * rangs et ses chips partent en UNE écriture, sur l'entrée que la page avait lue.
 * Le disque est FACTICE, les stores et git INJECTÉS ; seul le roster est réel
 * (Aer, `2000055`). Et `previewInline`, l'aperçu de ces textes, par un
 * `renderInlineBatch` factice.
 *
 * Et contrat de `saveGearReco` — l'onglet « Gear reco ». Lui écrit et committe :
 * ses deux écritures (le store, git) sont INJECTÉES, aucun test n'écrit dans
 * `data/curated/` ni ne lance git. Le fichier des recos est LU (roster, listes
 * des sélecteurs, presets, builds réels), jamais à des coordonnées figées — il
 * bouge à chaque enregistrement de l'onglet.
 *
 * Et contrat de `translateNotes` — « Traduire » du même onglet : le traducteur
 * est INJECTÉ, aucun test n'appelle DeepL ni Anthropic.
 *
 * Et contrat de `composeSetCombos` (`ui/gear-sets.mjs`, que la page charge
 * aussi) — le picker de sets du même onglet : un set principal et des
 * secondaires deviennent les combos du build.
 *
 * Et contrat de `itemTile` (`ui/gear-view.mjs`, idem) — la tuile d'item du même
 * onglet : le cadre de rareté, les étoiles, l'icône d'effet et celle de classe.
 *
 * Et contrat de l'APERÇU du même onglet : les refus de `previewGearBuilds` et
 * `previewHtml` (`ui/gear-view.mjs`), qui fait d'un build résolu ce que la fiche
 * perso montrera. La résolution elle-même est dans `gear-preview.test.ts` : elle
 * exige la garde `IS_DEV` de l'admin, FORCÉE fausse ici (le `NODE_ENV` ambiant
 * ne compte pas : `pnpm commit` lancé depuis l'admin hérite de `development`,
 * que vitest garde).
 *
 * Et contrat de l'onglet « Noms » — `namesState` (le roster et le verdict
 * « déborde » du site), `fitNames` (le même, à la saisie) et `saveNames`. Les
 * deux lectures (noms courts, alias) et les trois écritures (les deux stores,
 * git) sont INJECTÉES : le verdict se joue sur un disque FACTICE — celui du
 * jour n'a aucun perso « à traiter », et il bouge —, et aucun test n'écrit dans
 * `data/curated/`. Seul le roster est réel (les noms complets de `2000085`).
 *
 * Et contrat de l'onglet « Monstres » — `monstersRoster`, `monsterSheetState` et
 * `saveMonsterKit`. Le kit est RÉEL (un boss de `data/generated/`, son id
 * dérivé : la suite tourne sans `.gamedata`), tout le reste est INJECTÉ : le
 * curé des chips, le catalogue, les monstres des guides et ceux du site, les
 * donjons, et les deux écritures (`applyKitCuration`, git).
 *
 * Et contrat de l'onglet « Bannières » — `diffBanners` (ce que la table du jeu
 * sait de plus que `banner.json`, pur), `bannersState` et `saveBannerList`. La
 * table du jeu n'est JAMAIS lue ici (la suite tourne sans `.gamedata`) : ses
 * lignes, le fichier curé et le jour sont INJECTÉS, comme les trois écritures
 * (le store, R2, git). Seul le roster est réel.
 *
 * Et contrat de l'onglet « Journal du site » — `changelogState`,
 * `fillChangelogTemplate` (un gabarit rempli pour la page), `saveChangelogList`
 * et `previewChangelogEntry` (ce que la page `/changelog` montrerait). Le fichier
 * du journal est LU (jamais écrit : le store et git sont INJECTÉS), le roster
 * est réel, et l'aperçu ne dépend pas de la garde `IS_DEV`.
 *
 * Et contrat du « Tableau de bord » — `dashboardState`, l'accueil de quick.
 * Il ne fait que LIRE, et toutes ses lectures sont INJECTÉES : l'inbox de
 * l'admin (son moteur de revue n'est jamais lancé ici), git (un `--porcelain`
 * factice), la version du jeu et celle du client, les dates des fichiers de la
 * proposition, les bannières, les codes promo (R2 n'est pas appelé), le jour.
 *
 * Et contrat de l'onglet « Tables du jeu » — `tableUsage` (qui lit quelle table,
 * pur, sur des sources FACTICES), `gameTablesState` (le catalogue et l'usage,
 * lectures injectées), `queryGameTable` et `gameTableSchema` (le store de
 * l'admin, factice). Ni `.gamedata/parsed/` ni les sources du dépôt ne sont lus.
 *
 * Et contrat de l'onglet « Effets » — `effectsState` (le catalogue rangé comme
 * l'admin), `effectsSearch` et `effectNewId` (la règle de l'admin, jouée au
 * serveur) et `saveEffects`. Le glossaire et le curé sont FACTICES (ceux du
 * jour bougent à chaque patch et à chaque curation), le store et git INJECTÉS :
 * aucun test n'écrit `data/curated/effects.json`.
 *
 * Et contrat de l'onglet « Items » — `itemsState` (le catalogue servi sous
 * l'overlay du curé), `itemsSearch` (la règle d'Effets, sur l'id et le nom
 * anglais), `resolveText` et `saveItems`. Le catalogue et le curé sont FACTICES,
 * le store, le rebake et git INJECTÉS : aucun test n'écrit
 * `data/curated/items.json` ni `data/generated/items.json` — le second est LU
 * une fois, pour prouver que la route lit le disque.
 *
 * Et contrat de `addComics` — l'onglet « 4-comics » : plusieurs BD et plusieurs
 * langues, UN envoi, UN commit. Même règle : le pool est un répertoire
 * temporaire, la chaîne (webp, R2, repli) et git sont factices.
 *
 * Et contrat de git lui-même — `commitPaths` (un enregistrement committe ses
 * chemins et eux seuls, et ne pousse jamais), `pushMain` (le bouton
 * « Pousser ») et `gitState` (son compte)
 * — joué pour de bon, mais sur un DÉPÔT JETABLE : un dossier temporaire, son
 * amont `bare` à côté. Le dépôt du projet n'est ni lu ni touché.
 */
import { spawnSync } from 'node:child_process';
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
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type {
  CatalogEntry,
  CharacterCurated,
  DungeonRef,
  Effect,
  EffectCurated,
  GearBuild,
  LangDict,
  LocalizedText,
  Monster,
} from '@contracts';
import type { EffectOption, KitEditorCard } from '@/components/admin/CharacterKitEditor';
import { HUMAN_TAGS } from '@/components/tierlist/tiers';
import type { CharacterKitPatch } from '@/lib/admin/character-skill-curated-store';
import { collapseBuild, expandBuild } from '@/lib/admin/gear-preset-resolve';
import type { ItemCurated } from '@/lib/admin/item-curated-store';
import {
  monsterKitCards,
  pickMonsterKit,
  type GuideRef,
  type MonsterKitSections,
} from '@/lib/admin/monster-kit';
import type { KitCurationPatch } from '@/lib/admin/monster-skill-curated-store';
import { committedMonsterSkills, committedMonsters } from '@/lib/admin/monster-store';
import { loadChangelog } from '@/lib/admin/changelog-store';
import { buildInlineRefs } from '@/lib/admin/inline-refs';
import type { ChangelogEntry } from '@/lib/data/changelog';
import { characterDisplayName, getCharacterListItems, slugForId } from '@/lib/data/characters';
import type { EffectSources } from '@/lib/data/effects';
import { getEEViews } from '@/lib/data/equipment';
import { img } from '@/lib/images';
import en from '@/i18n/locales/en';
import fr from '@/i18n/locales/fr';
import { loadGearPresets, loadGearReco } from '@/lib/data/gear-reco';
import type { InboxItem } from '@/lib/admin/admin-inbox';
import { collectTagOccurrences } from '@/lib/admin/tag-control';
import type { TablePage, TableSchema } from '@/lib/admin/gamedata-store';
import { validateBanners, type Banner, type PromoCode } from '@/lib/data/promo-rules';
import { LANGS } from '@/lib/i18n/config';
import type { RecruitWindow } from '@datagen/generators/recruit';
import { emptyDict } from '@datagen/lib/lang';
import {
  ADMIN_BASE_DEFAULT,
  ADMIN_TO_QUICK,
  BANNER_LOOKBACK_DAYS,
  CHARACTER_SHEET_DEPS,
  COUPON_EXPIRY_DAYS,
  DASHBOARD_DISK,
  ITEMS_DISK,
  NO_GAME_DATA,
  NO_ITEM_BAKE,
  NO_TRANSLATE_KEY,
  addComics,
  bannersState,
  changelogState,
  characterRoster,
  characterSheetState,
  checkGearBuilds,
  comicLangOf,
  commitPaths,
  dashboardState,
  effectNewId,
  effectsSearch,
  effectsState,
  diffBanners,
  fillChangelogTemplate,
  fitNames,
  gameTableSchema,
  gameTablesState,
  gearRecoState,
  gitState,
  groupComics,
  itemsSearch,
  itemsState,
  monsterSheetState,
  monstersRoster,
  namesState,
  planRankChanges,
  previewChangelogEntry,
  previewGearBuilds,
  previewInline,
  pushMain,
  queryGameTable,
  resolveText,
  saveBannerList,
  saveChangelogList,
  saveCharacterSheet,
  saveGearReco,
  saveEffects,
  saveItems,
  saveMonsterKit,
  saveNames,
  tableUsage,
  tagSourceSheet,
  translateNotes,
  type BannersDeps,
  type BannersDisk,
  type ChangelogDeps,
  type ChangelogDisk,
  type CharacterSheetChanges,
  type CharacterSheetDeps,
  type ComicsDeps,
  type ComicUpload,
  type DashboardDisk,
  type EffectChange,
  type EffectsDeps,
  type EffectsDisk,
  type GameTableDeps,
  type GameTablesDisk,
  type GearCatalog,
  type GearRecoDeps,
  type ItemChange,
  type ItemsDeps,
  type ItemsDisk,
  type MonstersDeps,
  type NameChange,
  type NamesDeps,
  type NamesDisk,
  type Outcome,
  type RankChange,
  type RankDisk,
  type SheetEeItem,
  type TranslateDeps,
  type UsageSource,
} from './actions';
import { composeSetCombos, splitSetCombos } from './ui/gear-sets.mjs';
import {
  gameText,
  gradeColor,
  groupCombos,
  itemName,
  itemTile,
  noteHtml,
  previewHtml,
  setGrid,
  setRow,
  shownPieces,
  substatBarHtml,
} from './ui/gear-view.mjs';

/** La garde de l'admin, fausse quel que soit `NODE_ENV` (voir l'en-tête). */
vi.mock('@/lib/admin/guard', () => ({ IS_DEV: false }));

const DIANNE: CharacterCurated = {
  rank: 'S',
  rankPvp: 'A',
  role: 'dps',
  tags: ['free'],
  skillPriority: { first: 3, second: 1, ultimate: 2 },
  rankByTranscend: { '3': 'A', '4': 'A', '6': 'S', '9': 'S' },
  roleByTranscend: { '9': 'dps' },
  videos: [{ platform: 'youtube', id: 'zvgoCGKtIfo', title: 't', author: 'a' }],
  prosCons: { pros: [{ en: 'strong' }], cons: [] },
  synergies: [{ heroes: ['2000001'] }],
};

const disk = (over: Partial<RankDisk> = {}): RankDisk => ({
  curated: { dianne: DIANNE, bare: { rank: 'B', role: 'support' } },
  ee: {
    dianne: { rank: 'A', rank10: 'S', chipHide: ['x'], chipAdd: ['y'], source: { label: 'z' } },
  },
  roster: new Set(['dianne', 'bare', 'fresh', 'no-ee']),
  eeOwners: new Set(['dianne', 'bare', 'fresh']),
  ...over,
});

const change = (
  id: string,
  field: RankChange['field'],
  from: string,
  to: string,
  step?: string,
): RankChange => ({ id, field, from, to, ...(step ? { step } : {}) });

describe('planRankChanges — champs simples', () => {
  it('ne change que le champ réglé et PRÉSERVE tout le reste de l’entrée', () => {
    const plan = planRankChanges(disk(), [change('dianne', 'rank', 'S', 'A')]);

    expect(plan.refused).toEqual([]);
    expect(plan.characters).toEqual({ dianne: { ...DIANNE, rank: 'A' } });
    // Rien côté EE, rien pour les persos non modifiés.
    expect(plan.ee).toEqual({});
  });

  it('cumule plusieurs cellules du même perso dans une seule entrée', () => {
    const plan = planRankChanges(disk(), [
      change('dianne', 'rank', 'S', 'B'),
      change('dianne', 'rankPvp', 'A', 'S'),
      change('dianne', 'role', 'dps', 'sustain'),
    ]);

    expect(plan.characters.dianne).toEqual({
      ...DIANNE,
      rank: 'B',
      rankPvp: 'S',
      role: 'sustain',
    });
    expect(plan.applied).toHaveLength(3);
  });

  it('un rang VIDÉ retire le champ', () => {
    const plan = planRankChanges(disk(), [change('dianne', 'rankPvp', 'A', '')]);

    expect(plan.characters.dianne).not.toHaveProperty('rankPvp');
    expect(plan.characters.dianne.rank).toBe('S');
  });

  it('un champ AJOUTÉ prend sa place dans l’entrée, pas la queue', () => {
    const plan = planRankChanges(disk(), [change('bare', 'rankPvp', '', 'C')]);

    expect(Object.keys(plan.characters.bare)).toEqual(['rank', 'rankPvp', 'role']);
  });

  it('crée l’entrée d’un perso qui n’en avait pas', () => {
    const plan = planRankChanges(disk(), [change('fresh', 'rank', '', 'C')]);

    expect(plan.characters).toEqual({ fresh: { rank: 'C' } });
  });

  it('une entrée vidée de son dernier champ sort VIDE (le store supprime la clé)', () => {
    const plan = planRankChanges(disk(), [
      change('bare', 'rank', 'B', ''),
      change('bare', 'role', 'support', ''),
    ]);

    expect(plan.characters.bare).toEqual({});
  });
});

describe('planRankChanges — refus', () => {
  it('REFUSE la cellule dont le disque ne porte plus la valeur chargée', () => {
    const plan = planRankChanges(disk(), [
      change('dianne', 'rank', 'A', 'B'),
      change('dianne', 'role', 'dps', 'support'),
    ]);

    // La cellule en conflit est écartée et le dit ; sa voisine passe.
    expect(plan.refused).toHaveLength(1);
    expect(plan.refused[0].change.field).toBe('rank');
    expect(plan.refused[0].reason).toContain('« S »');
    expect(plan.characters.dianne).toEqual({ ...DIANNE, role: 'support' });
  });

  it('ne refuse ni n’écrit quand le disque porte DÉJÀ la valeur voulue', () => {
    const plan = planRankChanges(disk(), [change('dianne', 'rank', 'B', 'S')]);

    expect(plan).toEqual({ characters: {}, ee: {}, applied: [], refused: [] });
  });

  it('refuse une valeur hors liste, un perso et une colonne inconnus', () => {
    const plan = planRankChanges(disk(), [
      change('dianne', 'rank', 'S', 'SS'),
      change('dianne', 'eeRank', 'A', 'E'),
      change('dianne', 'role', 'dps', 'tank'),
      change('ghost', 'rank', '', 'S'),
      change('dianne', 'tags' as RankChange['field'], '', 'S'),
    ]);

    expect(plan.refused).toHaveLength(5);
    expect(plan.characters).toEqual({});
    expect(plan.ee).toEqual({});
  });
});

describe('planRankChanges — EE', () => {
  it('reprend les chips du disque dans le patch (le store les effacerait sinon)', () => {
    const plan = planRankChanges(disk(), [change('dianne', 'eeRank', 'A', 'B')]);

    expect(plan.ee).toEqual({
      dianne: { rank: 'B', rank10: 'S', chipHide: ['x'], chipAdd: ['y'] },
    });
    expect(plan.characters).toEqual({});
  });

  it('vide un rang d’EE sans toucher à l’autre', () => {
    const plan = planRankChanges(disk(), [change('dianne', 'eeRank10', 'S', '')]);

    expect(plan.ee.dianne).toMatchObject({ rank: 'A', rank10: '' });
  });

  it('crée l’entrée d’un EE encore jamais noté', () => {
    const plan = planRankChanges(disk(), [
      change('fresh', 'eeRank', '', 'C'),
      change('fresh', 'eeRank10', '', 'B'),
    ]);

    expect(plan.ee.fresh).toMatchObject({ rank: 'C', rank10: 'B' });
  });

  it('REFUSE un rang d’EE pour un perso qui n’a pas d’EE', () => {
    const plan = planRankChanges(disk(), [change('no-ee', 'eeRank', '', 'S')]);

    expect(plan.ee).toEqual({});
    expect(plan.refused[0].reason).toContain('EE');
  });
});

describe('planRankChanges — tables par transcendance', () => {
  it('AJOUTE un palier à une table existante', () => {
    const plan = planRankChanges(disk(), [change('dianne', 'roleByTranscend', '', 'support', '3')]);

    expect(plan.characters.dianne.roleByTranscend).toEqual({ '3': 'support', '9': 'dps' });
    // L'autre table n'a pas bougé.
    expect(plan.characters.dianne.rankByTranscend).toEqual(DIANNE.rankByTranscend);
  });

  it('CHANGE un palier', () => {
    const plan = planRankChanges(disk(), [change('dianne', 'rankByTranscend', 'S', 'A', '6')]);

    expect(plan.characters.dianne.rankByTranscend).toEqual({
      '3': 'A',
      '4': 'A',
      '6': 'A',
      '9': 'S',
    });
  });

  it('VIDE un palier : la clé part, l’escalier hérite du palier du dessous', () => {
    const plan = planRankChanges(disk(), [change('dianne', 'rankByTranscend', 'A', '', '4')]);

    expect(plan.characters.dianne.rankByTranscend).toEqual({ '3': 'A', '6': 'S', '9': 'S' });
  });

  it('la DERNIÈRE entrée retirée supprime le champ', () => {
    const plan = planRankChanges(disk(), [change('dianne', 'roleByTranscend', 'dps', '', '9')]);

    expect(plan.characters.dianne).not.toHaveProperty('roleByTranscend');
    expect(plan.characters.dianne.rankByTranscend).toEqual(DIANNE.rankByTranscend);
  });

  it('crée la table à sa place quand le perso n’en avait pas', () => {
    const plan = planRankChanges(disk(), [change('bare', 'rankByTranscend', '', 'C', '3')]);

    expect(plan.characters.bare).toEqual({
      rank: 'B',
      role: 'support',
      rankByTranscend: { '3': 'C' },
    });
  });

  it('CONSERVE une clé héritée hors des paliers pleins', () => {
    const legacy = { ...DIANNE, rankByTranscend: { '5': 'B', '9': 'S' } };
    const plan = planRankChanges(disk({ curated: { dianne: legacy } }), [
      change('dianne', 'rankByTranscend', 'S', 'A', '9'),
      change('dianne', 'rankByTranscend', '', 'C', '3'),
    ]);

    expect(plan.characters.dianne.rankByTranscend).toEqual({ '3': 'C', '5': 'B', '9': 'A' });
  });

  it('REFUSE un palier qui ne se cure pas, même s’il existe sur le disque', () => {
    const legacy = { ...DIANNE, rankByTranscend: { '5': 'B' } };
    const plan = planRankChanges(disk({ curated: { dianne: legacy } }), [
      change('dianne', 'rankByTranscend', 'B', 'A', '5'),
      change('dianne', 'rankByTranscend', '', 'A'),
    ]);

    expect(plan.refused).toHaveLength(2);
    expect(plan.characters).toEqual({});
  });

  it('un palier en CONFLIT est refusé seul, ses voisins passent', () => {
    const plan = planRankChanges(disk(), [
      change('dianne', 'rankByTranscend', 'B', 'C', '3'),
      change('dianne', 'rankByTranscend', 'A', 'B', '4'),
    ]);

    expect(plan.refused.map((r) => r.change.step)).toEqual(['3']);
    expect(plan.characters.dianne.rankByTranscend).toEqual({
      '3': 'A',
      '4': 'B',
      '6': 'S',
      '9': 'S',
    });
  });

  it('ne modifie pas l’état du disque qu’on lui passe', () => {
    const d = disk();
    const before = structuredClone({ curated: d.curated, ee: d.ee });
    planRankChanges(d, [
      change('dianne', 'rank', 'S', 'A'),
      change('dianne', 'rankByTranscend', 'A', '', '3'),
      change('dianne', 'eeRank', 'A', 'B'),
    ]);

    expect({ curated: d.curated, ee: d.ee }).toEqual(before);
  });
});

// ----------------------------------------------------------- fiche perso -----

/** Le kit d'un perso, factice : trois cartes (un skill, la chaîne, le duo) et leurs chips. */
const KIT_CARDS: KitEditorCard[] = [
  {
    id: '5502',
    name: 'To the Beach?',
    type: 'second',
    desc: 'Removes <color=#28d9ed>all</color> buffs.',
    iconSrc: '/images/characters/skills/Skill_Second_2000055.webp',
    chips: [
      { ref: 'SYS_BUFF_REMOVE_BUFF', name: 'Buff Removal', icon: 'IG_Buff_Remove', isDebuff: true },
      { ref: '11', name: 'Increased Crit Hit Chance', isDebuff: false },
    ],
  },
  {
    id: '5504',
    name: 'Chain Passive',
    type: 'chain_passive',
    chips: [{ ref: '7', name: 'Increased Attack', isDebuff: false }],
  },
  { id: '5504::dual', name: 'Dual', type: 'dual', chips: [] },
];
const KIT_CATALOG: Record<string, EffectOption> = {
  '1': { id: '1', name: 'Burned', icon: 'IG_Buff_Dot_Burn', isDebuff: true },
  '7': { id: '7', name: 'Increased Attack', isDebuff: false },
};
/** L'EE d'un perso, factice : une chip AUTO, ses deux passifs. */
const EE_ITEM: SheetEeItem = {
  itemId: '2000055',
  name: 'Super Board',
  icon: 'TI_Equipment_EX_2000055',
  star: 6,
  grade: 'unique',
  chips: [
    {
      ref: 'SYS_BUFF_ACTION_GAUGE_UP',
      name: 'Priority Increase',
      icon: 'IG_Buff_Action_Gauge_Up',
      isDebuff: false,
      desc: 'Increases the target’s Priority.',
    },
  ],
  passives: [
    { level: 1, name: 'Aer’s Exclusive Equipment', texts: ['Penetration +20%'] },
    { level: 10, name: 'Aer’s Exclusive Equipment', texts: ['Penetration +40%'] },
  ],
};
/** Le catalogue de « ＋ effet » de l'EE : celui de Skills, descriptions comprises. */
const EE_CATALOG: Record<string, EffectOption> = {
  '1': { ...KIT_CATALOG['1'], desc: 'Takes damage every turn.' },
  '7': KIT_CATALOG['7'],
};

describe('characterRoster, characterSheetState — la fiche lue, disque injecté', () => {
  const AER = '2000055';
  const aer = getCharacterListItems().find((c) => c.id === AER)!;
  const sheetDisk = (
    curated: Record<string, CharacterCurated> = { [AER]: DIANNE },
    kit: Partial<Pick<CharacterSheetDeps, 'disk' | 'kitCards' | 'kitSections' | 'eeItem'>> = {},
  ) => ({
    disk: () => disk({ curated, roster: new Set([AER]), eeOwners: new Set([AER]) }),
    kitCards: async () => KIT_CARDS,
    kitSections: () => ({ chipHide: {}, chipAdd: {} }),
    kitCatalog: () => KIT_CATALOG,
    eeItem: (): SheetEeItem | null => EE_ITEM,
    eeCatalog: () => EE_CATALOG,
    ...kit,
  });

  it('le roster : tout le monde, par nom, avec de quoi dessiner une tuile et l’en-tête', () => {
    const { roster } = characterRoster();
    expect(roster).toHaveLength(getCharacterListItems().length);
    expect(roster.map((c) => c.name)).toEqual(
      [...roster.map((c) => c.name)].sort((a, b) => a.localeCompare(b)),
    );
    expect(roster.find((c) => c.id === AER)).toEqual({
      id: AER,
      name: characterDisplayName(aer),
      element: aer.element,
      class: aer.class,
      subClass: aer.subClass ?? '',
      rarity: aer.rarity,
    });
  });

  it('l’état : la ligne du roster, sa chaîne, ses tags dérivés, et le curé du disque ENTIER', async () => {
    const state = await characterSheetState(AER, sheetDisk());
    if ('error' in state) throw new Error(state.error);
    expect(state.char).toEqual({
      id: AER,
      name: characterDisplayName(aer),
      element: aer.element,
      class: aer.class,
      subClass: aer.subClass ?? '',
      rarity: aer.rarity,
      chain: aer.chainType ?? '',
      tags: aer.tags ?? [],
    });
    // Entier : les sous-onglets suivants y liront `prosCons` et `synergies`.
    expect(state.curated).toEqual(DIANNE);
    expect(state.videos).toEqual(DIANNE.videos);
  });

  it('les rangs tels que Rangs les sert, avec l’échelle, les rôles et les paliers', async () => {
    const state = await characterSheetState(AER, sheetDisk());
    if ('error' in state) throw new Error(state.error);
    expect(state.ranks).toEqual({
      rank: 'S',
      rankPvp: 'A',
      role: 'dps',
      rankByTranscend: DIANNE.rankByTranscend,
      roleByTranscend: DIANNE.roleByTranscend,
    });
    expect(state.tiers).toEqual(['S', 'A', 'B', 'C', 'D', 'E']);
    expect(state.roles).toEqual(['dps', 'support', 'sustain']);
    expect(state.steps).toEqual([
      { key: '3', label: '3★' },
      { key: '4', label: '4★' },
      { key: '6', label: '5★' },
      { key: '9', label: '6★' },
    ]);
  });

  it('sert les tags humains que la fiche coche : la liste de l’éditeur de l’admin', async () => {
    const state = await characterSheetState(AER, sheetDisk());
    if ('error' in state) throw new Error(state.error);
    expect(state.humanTags).toBe(HUMAN_TAGS);
    expect(HUMAN_TAGS).toEqual(['free']);
  });

  it('`refs` : ce que les tags inline peuvent viser, et les langues dans l’ordre de l’onglet', async () => {
    const state = await characterSheetState(AER, sheetDisk());
    if ('error' in state) throw new Error(state.error);
    // Les listes de l'éditeur assisté de l'admin, telles quelles.
    expect(state.refs).toEqual(buildInlineRefs());
    expect(state.refs.character).toContainEqual({
      value: characterDisplayName(aer),
      label: characterDisplayName(aer),
    });
    expect(state.refs.element.map((e) => e.value)).toContain('Earth');
    expect(state.refs.stat.map((e) => e.value)).toContain('RES');
    // Une liste de SAISIE, pas un contrôle : à apparence égale elle ne garde
    // qu'une clé d'effet, et `{B/BT_ADDITIVE_TURN}`, que le site résout, n'y
    // est pas — l'enregistrement contrôle par `checkText`, pas par elle.
    expect(state.refs.effectBuff.length).toBeGreaterThan(0);
    expect(state.refs.effectBuff.map((e) => e.value)).not.toContain('BT_ADDITIVE_TURN');
    // L'anglais se saisit ; les autres langues du site suivent, toutes.
    expect(state.langs.default).toBe('en');
    expect(state.langs.shown).toEqual(['en', 'fr', 'es', 'jp', 'kr', 'zh']);
    expect([...state.langs.shown].sort()).toEqual([...LANGS].sort());
  });

  it('un perso sans entrée curée : tout vide, rien d’absent', async () => {
    const state = await characterSheetState(AER, sheetDisk({}));
    if ('error' in state) throw new Error(state.error);
    expect(state.curated).toEqual({});
    expect(state.ranks).toEqual({
      rank: '',
      rankPvp: '',
      role: '',
      rankByTranscend: {},
      roleByTranscend: {},
    });
    expect(state.videos).toEqual([]);
  });

  it('`kit` : les cartes de skills, la curation du disque sur CES cartes, le catalogue des effets', async () => {
    const state = await characterSheetState(
      AER,
      sheetDisk(undefined, {
        // Le fichier est global : il porte aussi les cartes d'autres persos.
        kitSections: () => ({
          chipHide: { '5502': ['SYS_BUFF_REMOVE_BUFF'], '12102': ['1037'] },
          chipAdd: { '5504::dual': ['7'], '999': ['1'] },
        }),
      }),
    );
    if ('error' in state) throw new Error(state.error);
    expect(state.kit).toEqual({
      cards: KIT_CARDS,
      chipHide: { '5502': ['SYS_BUFF_REMOVE_BUFF'] },
      chipAdd: { '5504::dual': ['7'] },
      catalog: KIT_CATALOG,
      sprite: 'images/ui/effect',
    });
  });

  it('des cartes illisibles (pas de tables du jeu) : `kit.error`, et le reste de la fiche quand même', async () => {
    const state = await characterSheetState(
      AER,
      sheetDisk(undefined, {
        kitCards: async () => {
          throw new Error('tables du jeu absentes');
        },
        kitSections: () => ({ chipHide: { '5502': ['x'] }, chipAdd: {} }),
      }),
    );
    if ('error' in state) throw new Error(state.error);
    expect(state.kit).toEqual({
      cards: [],
      chipHide: {},
      chipAdd: {},
      catalog: KIT_CATALOG,
      sprite: 'images/ui/effect',
      error: 'tables du jeu absentes',
    });
    expect(state.curated).toEqual(DIANNE);
  });

  it('`ee` : l’item du jeu, ce que le disque en cure — vides compris —, le catalogue ; l’échelle à part', async () => {
    const eeDisk = (ee: RankDisk['ee']) => () =>
      disk({ curated: { [AER]: DIANNE }, ee, roster: new Set([AER]), eeOwners: new Set([AER]) });
    const state = await characterSheetState(
      AER,
      sheetDisk(undefined, {
        disk: eeDisk({
          [AER]: { rank: 'A', rank10: 'S', chipHide: ['x'], source: { label: 'z' } },
        }),
      }),
    );
    if ('error' in state) throw new Error(state.error);
    expect(state.ee).toEqual({
      ...EE_ITEM,
      rank: 'A',
      rank10: 'S',
      chipHide: ['x'],
      chipAdd: [],
      catalog: EE_CATALOG,
    });
    expect(state.eeTiers).toEqual(['S', 'A', 'B', 'C', 'D']);

    // Un EE sans entrée curée (Lambda aujourd'hui) : la fiche vide, rien d'absent.
    const bare = await characterSheetState(AER, sheetDisk(undefined, { disk: eeDisk({}) }));
    if ('error' in bare) throw new Error(bare.error);
    expect(bare.ee).toMatchObject({ rank: '', rank10: '', chipHide: [], chipAdd: [] });
  });

  it('un perso sans EE : `ee` est `null`, le reste de la fiche se lit', async () => {
    const state = await characterSheetState(AER, sheetDisk(undefined, { eeItem: () => null }));
    if ('error' in state) throw new Error(state.error);
    expect(state.ee).toBeNull();
    expect(state.curated).toEqual(DIANNE);
  });

  it('l’EE tel que la route le lit : sa tuile, ses passifs, et le second porteur d’un `20…`', () => {
    const { eeItem, eeCatalog, kitCatalog } = CHARACTER_SHEET_DEPS;
    const snow = eeItem('2000003')!;
    expect(snow).toMatchObject({
      itemId: '2000003',
      icon: 'TI_Equipment_EX_2000003',
      star: 6,
      grade: 'unique',
      // Le pendant core-fusion, que le site montre comme second porteur.
      companion: { id: '2700003', name: 'Core Fusion Snow' },
    });
    expect(snow.name).toBe(getEEViews().find((v) => v.characterId === '2000003')?.name.en);
    expect(snow.passives.map((p) => p.level)).toEqual([1, 10]);
    expect(snow.passives.every((p) => p.name && p.texts.length)).toBe(true);
    expect(snow.chips.map((c) => c.ref)).toContain('SYS_BUFF_ACTION_GAUGE_UP');
    // Le core-fusion a son PROPRE EE, sans second porteur ; Aer n'a pas de pendant.
    expect(eeItem('2700003')).toMatchObject({ itemId: '2700003' });
    expect(eeItem('2700003')).not.toHaveProperty('companion');
    expect(eeItem(AER)).not.toHaveProperty('companion');
    expect(eeItem('nope')).toBeNull();

    // Le catalogue : celui de Skills, chaque effet décrit par le jeu avec sa description.
    const [plain, described] = [kitCatalog(), eeCatalog()];
    expect(Object.keys(described)).toEqual(Object.keys(plain));
    expect(Object.values(described).some((o) => o.desc)).toBe(true);
    expect(Object.values(plain).some((o) => o.desc)).toBe(false);
    const withDesc = Object.values(described).find((o) => o.desc)!;
    expect(withDesc).toEqual({ ...plain[withDesc.id], desc: withDesc.desc });
  });

  it('un id hors du roster : une erreur, pas une fiche vide', async () => {
    expect(await characterSheetState('nope', sheetDisk())).toEqual({
      error: 'perso inconnu : nope',
    });
  });
});

describe('previewInline — l’aperçu des textes de la fiche, par un `renderInlineBatch` factice', () => {
  it('rend les segments du moteur, alignés sur les textes, dans la langue demandée', async () => {
    const calls: [string[], string][] = [];
    const out = await previewInline(['a {B/X}', ''], 'fr', async (texts, lang) => {
      calls.push([texts, lang]);
      return texts.map((text) => (text ? [{ t: 'text', s: text }] : []));
    });
    expect(out).toEqual({ segments: [[{ t: 'text', s: 'a {B/X}' }], []] });
    expect(calls).toEqual([[['a {B/X}', ''], 'fr']]);
  });

  it('sans langue : l’anglais ; une forme fausse ou un moteur qui lève : rendus, jamais levés', async () => {
    const langs: string[] = [];
    await previewInline([], undefined, async (_, lang) => (langs.push(lang), []));
    expect(langs).toEqual(['en']);

    const never = vi.fn(async () => []);
    expect(await previewInline('texte', 'en', never)).toEqual({
      error: 'texts : une liste de textes attendue',
    });
    expect(await previewInline(['a', 1], 'en', never)).toEqual({
      error: 'texts : une liste de textes attendue',
    });
    expect(never).not.toHaveBeenCalled();
    expect(
      await previewInline(['a'], 'en', async () => {
        throw new Error('glossaire illisible');
      }),
    ).toEqual({ error: 'glossaire illisible' });
  });

  it('par le vrai moteur : un tag résolu, et un tag inconnu en segment `unknown`', async () => {
    const out = await previewInline(['vs {E/Earth} and {B/Foo}'], 'en');
    if ('error' in out) throw new Error(out.error);
    expect(out.segments[0].map((seg) => seg.t)).toEqual(['text', 'icon', 'text', 'unknown']);
    expect(out.segments[0][3]).toEqual({ t: 'unknown', s: '{B/Foo}' });
  });
});

describe('saveCharacterSheet — disque, stores et git injectés', () => {
  const AER = '2000055';
  const name = characterDisplayName(getCharacterListItems().find((c) => c.id === AER)!);
  /** L'entrée du disque : les clés dans l'ordre d'un vrai fichier, vidéos en tête. */
  const ENTRY: CharacterCurated = {
    videos: [{ platform: 'youtube', id: 'zvgoCGKtIfo', title: 't', author: 'a' }],
    prosCons: { pros: [{ en: 'strong' }], cons: [] },
    rank: 'A',
    rankPvp: 'C',
    role: 'dps',
    tags: ['free'],
    skillPriority: { first: 3, second: 2, ultimate: 1 },
    rankByTranscend: { '6': 'S' },
  };

  /** Le disque et les quatre écritures, factices : elles notent leurs appels. */
  function deps(
    over: {
      entry?: CharacterCurated;
      errors?: (curated: CharacterCurated) => string[];
      git?: Outcome;
      /** Les autres persos du roster : les héros qu'une synergie peut citer. */
      others?: string[];
      /** Le curé des chips de skills, tel que le disque le porte. */
      kit?: Partial<Record<'chipHide' | 'chipAdd', Record<string, string[]>>>;
      kitErrors?: (patch: CharacterKitPatch) => string[];
      kitCards?: CharacterSheetDeps['kitCards'];
      /** Un perso sans EE, et les refus du store des EE. */
      noEe?: boolean;
      eeErrors?: string[];
    } = {},
  ) {
    const calls = {
      character: [] as [string, CharacterCurated][],
      ee: [] as [string, unknown][],
      kit: [] as CharacterKitPatch[],
      git: [] as [string[], string][],
    };
    const fake: CharacterSheetDeps = {
      disk: () =>
        disk({
          curated: { [AER]: over.entry ?? ENTRY },
          ee: { [AER]: { rank: 'A', rank10: 'S', chipHide: ['x'] } },
          roster: new Set([AER, ...(over.others ?? [])]),
          eeOwners: new Set([AER]),
        }),
      kitCards: over.kitCards ?? (async () => KIT_CARDS),
      kitSections: () => ({ chipHide: {}, chipAdd: {}, ...over.kit }),
      kitCatalog: () => KIT_CATALOG,
      eeItem: () => (over.noEe ? null : EE_ITEM),
      eeCatalog: () => EE_CATALOG,
      upsertCharacter: async (id, curated) => {
        calls.character.push([id, curated]);
        return over.errors?.(curated) ?? [];
      },
      upsertEe: async (id, patch) => {
        calls.ee.push([id, patch]);
        return over.eeErrors ?? [];
      },
      applyKit: async (patch) => {
        calls.kit.push(patch);
        return over.kitErrors?.(patch) ?? [];
      },
      commitPaths: (paths, message) => {
        calls.git.push([paths, message]);
        return over.git ?? { ok: true, log: ['git : fait'] };
      },
    };
    return { calls, fake };
  }
  const cell = (field: RankChange['field'], from: string, to: string, step?: string): RankChange =>
    change(AER, field, from, to, step);
  const save = (changes: CharacterSheetChanges, fake: CharacterSheetDeps) =>
    saveCharacterSheet(AER, { was: ENTRY, ...changes }, fake);

  it('des rangs seuls : le plan de Rangs, une écriture, UN commit au nom du perso', async () => {
    const { calls, fake } = deps();
    const out = await save(
      { ranks: [cell('rank', 'A', 'S'), cell('rankByTranscend', '', 'A', '4')] },
      fake,
    );

    expect(out).toEqual({
      ok: true,
      log: ['PvE : A → S', 'PvE à 4★ : vide → A', 'git : fait'],
      written: true,
      stale: false,
      refused: [],
    });
    // L'entrée EXISTANTE est reprise : vidéos, pros / cons, tags, priorités intacts.
    expect(calls.character).toEqual([
      [AER, { ...ENTRY, rank: 'S', rankByTranscend: { '4': 'A', '6': 'S' } }],
    ]);
    expect(Object.keys(calls.character[0][1])).toEqual(Object.keys(ENTRY));
    expect(calls.ee).toEqual([]);
    expect(calls.git).toEqual([[['data/curated/characters.json'], `chore(characters): ${name}`]]);
  });

  it('une cellule que le disque ne porte plus comme la page : refusée, située, le reste part', async () => {
    const { calls, fake } = deps();
    const out = await save(
      { ranks: [cell('rank', 'B', 'S'), cell('role', 'dps', 'support')] },
      fake,
    );

    expect(out.ok).toBe(false);
    expect(out.written).toBe(true);
    expect(out.stale).toBe(false);
    expect(out.refused).toEqual([
      { field: 'rank', step: undefined, reason: 'la page avait « B », le disque porte « A »' },
    ]);
    expect(out.log).toEqual([
      `REFUSÉ — ${name} · PvE : la page avait « B », le disque porte « A ».`,
      'rôle : dps → support',
      'git : fait',
    ]);
    expect(calls.character).toEqual([[AER, { ...ENTRY, role: 'support' }]]);
    expect(calls.git).toHaveLength(1);
  });

  it('priorité de skills et tags : par le store, sur l’entrée du disque, à leur place', async () => {
    const { calls, fake } = deps({ entry: { rank: 'A', videos: ENTRY.videos } });
    const out = await saveCharacterSheet(
      AER,
      {
        curated: { skillPriority: { first: 2, ultimate: 3 }, tags: ['free'] },
        was: { rank: 'A', videos: ENTRY.videos },
      },
      fake,
    );

    expect(out).toMatchObject({ ok: true, written: true, refused: [] });
    expect(out.log).toEqual(['priorité de skills : 2 · — · 3', 'tags : free', 'git : fait']);
    expect(calls.character).toEqual([
      [
        AER,
        {
          rank: 'A',
          tags: ['free'],
          skillPriority: { first: 2, ultimate: 3 },
          videos: ENTRY.videos,
        },
      ],
    ]);
    // Un champ nouveau prend sa place dans l'entrée, pas la queue après les vidéos.
    expect(Object.keys(calls.character[0][1])).toEqual(['rank', 'tags', 'skillPriority', 'videos']);
  });

  it('une priorité vidée et un tag décoché retirent leur clé', async () => {
    const { calls, fake } = deps();
    const out = await save({ curated: { skillPriority: {}, tags: [] } }, fake);

    expect(out.log).toEqual(['priorité de skills retirée', 'tags retirés', 'git : fait']);
    const written = calls.character[0][1];
    expect(written).not.toHaveProperty('skillPriority');
    expect(written).not.toHaveProperty('tags');
    expect(written.videos).toEqual(ENTRY.videos);
  });

  it('rangs PUIS champs hors rangs : la seconde écriture repart de la première, UN commit', async () => {
    const { calls, fake } = deps();
    const out = await save(
      {
        ranks: [cell('rankPvp', 'C', 'B')],
        curated: { skillPriority: { first: 1, second: 2, ultimate: 3 } },
      },
      fake,
    );

    expect(out).toMatchObject({ ok: true, written: true, refused: [] });
    expect(calls.character).toEqual([
      [AER, { ...ENTRY, rankPvp: 'B' }],
      [AER, { ...ENTRY, rankPvp: 'B', skillPriority: { first: 1, second: 2, ultimate: 3 } }],
    ]);
    expect(calls.git).toEqual([[['data/curated/characters.json'], `chore(characters): ${name}`]]);
    expect(out.log).toEqual(['PvP : C → B', 'priorité de skills : 1 · 2 · 3', 'git : fait']);
  });

  it('`stale` : le disque a changé sous un champ de la fiche — refus SANS écriture, rangs compris', async () => {
    const { calls, fake } = deps();
    const out = await saveCharacterSheet(
      AER,
      {
        ranks: [cell('rank', 'A', 'S')],
        curated: { skillPriority: { first: 1 } },
        // La page avait chargé d'autres priorités que celles du disque.
        was: { ...ENTRY, skillPriority: { first: 1, second: 2, ultimate: 3 } },
      },
      fake,
    );

    expect(out).toEqual({
      ok: false,
      log: [
        `REFUSÉ — ${name} · priorité de skills : le disque a changé depuis le chargement.`,
        'Rien à enregistrer.',
      ],
      written: false,
      stale: true,
      refused: [{ field: 'skillPriority', reason: 'le disque a changé depuis le chargement' }],
    });
    expect(calls).toEqual({ character: [], ee: [], kit: [], git: [] });
  });

  it('le disque a bougé AILLEURS (une vidéo ajoutée) : la fiche n’est pas `stale` pour autant', async () => {
    const { calls, fake } = deps();
    const out = await saveCharacterSheet(
      AER,
      { curated: { tags: [] }, was: { ...ENTRY, videos: [] } },
      fake,
    );
    expect(out).toMatchObject({ ok: true, stale: false, written: true });
    // La vidéo du disque est reprise : c'est lui qui est réécrit, pas `was`.
    expect(calls.character[0][1].videos).toEqual(ENTRY.videos);
  });

  it('un tag qui n’est pas humain, une priorité qui n’est pas un entier : refusés, situés', async () => {
    const { calls, fake } = deps();
    const out = await save(
      {
        ranks: [cell('rank', 'A', 'B')],
        curated: {
          tags: ['premium'],
          skillPriority: { first: 1.5 },
        },
      },
      fake,
    );

    expect(out.ok).toBe(false);
    expect(out.refused).toEqual([
      { field: 'skillPriority', reason: "« 1.5 » n'est pas un entier" },
      { field: 'tags', reason: "« premium » n'est pas un tag humain" },
    ]);
    // Le rang, lui, est parti.
    expect(calls.character).toEqual([[AER, { ...ENTRY, rank: 'B' }]]);
    expect(calls.git).toHaveLength(1);
  });

  it('un tag hérité du disque qui n’est pas humain reste, la fiche ne le montre pas', async () => {
    const entry = { ...ENTRY, tags: ['legacy', 'free'] };
    const { calls, fake } = deps({ entry });
    await saveCharacterSheet(AER, { curated: { tags: [] }, was: entry }, fake);
    expect(calls.character[0][1].tags).toEqual(['legacy']);
  });

  it('un refus de schéma du store : rendu tel quel, les champs marqués, rien de committé', async () => {
    const { calls, fake } = deps({ errors: () => ['curated[2000055].tags — attendu un tableau'] });
    const out = await save({ curated: { tags: [] } }, fake);

    expect(out).toMatchObject({ ok: false, written: false, stale: false });
    expect(out.refused).toEqual([
      { field: 'tags', reason: 'curated[2000055].tags — attendu un tableau' },
    ]);
    expect(out.log).toEqual([
      `REFUSÉ — ${name} : curated[2000055].tags — attendu un tableau`,
      'Rien à enregistrer.',
    ]);
    expect(calls.git).toEqual([]);
  });

  it('un rang d’EE dans le lot : le store des EE, et son fichier dans le même commit', async () => {
    const { calls, fake } = deps();
    const out = await save({ ranks: [cell('eeRank', 'A', 'B'), cell('rank', 'A', 'S')] }, fake);

    expect(out.ok).toBe(true);
    expect(calls.ee).toEqual([
      [AER, { rank: 'B', rank10: 'S', chipHide: ['x'], chipAdd: undefined }],
    ]);
    expect(calls.git).toEqual([
      [
        ['data/curated/characters.json', 'data/curated/equipment.json'],
        `chore(characters): ${name}`,
      ],
    ]);
  });

  it('une cellule d’un autre perso n’est pas de la fiche', async () => {
    const { calls, fake } = deps();
    const out = await save({ ranks: [change('dianne', 'rank', 'S', 'A')] }, fake);
    expect(out).toMatchObject({ ok: false, written: false });
    expect(out.refused).toEqual([
      { field: 'rank', step: undefined, reason: 'cette cellule n’est pas de ce perso' },
    ]);
    expect(calls).toEqual({ character: [], ee: [], kit: [], git: [] });
  });

  it('le disque porte déjà tout : ni écriture, ni commit, ni refus', async () => {
    const { calls, fake } = deps();
    const out = await save(
      {
        ranks: [cell('rank', 'B', 'A')],
        curated: { tags: ['free'], skillPriority: ENTRY.skillPriority },
      },
      fake,
    );
    expect(out).toEqual({
      ok: true,
      log: ['Rien à enregistrer : le disque porte déjà ces valeurs.'],
      written: false,
      stale: false,
      refused: [],
    });
    expect(calls).toEqual({ character: [], ee: [], kit: [], git: [] });
  });

  it('sans changement, ou pour un perso hors du roster : refusé avant toute lecture', async () => {
    const { calls, fake } = deps();
    expect(await saveCharacterSheet(AER, { was: ENTRY }, fake)).toMatchObject({
      ok: false,
      log: ['Aucune modification à enregistrer.'],
    });
    expect(await saveCharacterSheet(AER, undefined, fake)).toMatchObject({ ok: false });
    expect(
      await saveCharacterSheet('nope', { ranks: [change('nope', 'rank', '', 'S')] }, fake),
    ).toMatchObject({ ok: false, log: ['perso inconnu : nope.'], written: false });
    expect(calls).toEqual({ character: [], ee: [], kit: [], git: [] });
  });

  it('un commit qui échoue : la fiche est écrite, le geste est en échec', async () => {
    const { fake } = deps({ git: { ok: false, log: ['git commit a échoué : x'] } });
    const out = await save({ ranks: [cell('rank', 'A', 'S')] }, fake);
    expect(out).toMatchObject({ ok: false, written: true });
    expect(out.log.at(-1)).toBe('git commit a échoué : x');
  });

  // ------------------------------------------- pros / cons et synergies
  const PRO = { en: 'Gains an {B/BT_ADDITIVE_TURN}', fr: 'Gagne un {B/BT_ADDITIVE_TURN}' };
  const CON = { en: 'Weak against {E/Earth}' };
  const ALLY = '2000096';

  it('pros et cons : contrôlés, écrits à leur place dans l’entrée, une ligne vide retirée', async () => {
    const { calls, fake } = deps();
    const out = await save(
      { curated: { prosCons: { pros: [PRO, { en: '  ', fr: '' }], cons: [CON] } } },
      fake,
    );

    expect(out).toEqual({
      ok: true,
      log: ['pros / cons : 1 pro, 1 con', 'git : fait'],
      written: true,
      stale: false,
      refused: [],
    });
    expect(calls.character).toEqual([[AER, { ...ENTRY, prosCons: { pros: [PRO], cons: [CON] } }]]);
    expect(Object.keys(calls.character[0][1])).toEqual(Object.keys(ENTRY));
    expect(calls.git).toEqual([[['data/curated/characters.json'], `chore(characters): ${name}`]]);
  });

  it('un tag inconnu : refus SITUÉ à la ligne, rien n’est écrit ni committé', async () => {
    const { calls, fake } = deps();
    const out = await save(
      {
        curated: {
          prosCons: {
            pros: [PRO, CON, { en: 'Grants {B/Foo}' }],
            cons: [{ en: 'ok', fr: 'voir {P/Personne}' }],
          },
        },
      },
      fake,
    );

    expect(out).toEqual({
      ok: false,
      log: [
        `REFUSÉ — ${name} · pros[2] : tag inconnu {B/Foo} (effet inconnu).`,
        `REFUSÉ — ${name} · cons[0] : fr : tag inconnu {P/Personne} (perso inconnu).`,
        'Rien à enregistrer.',
      ],
      written: false,
      stale: false,
      refused: [
        {
          field: 'prosCons',
          list: 'pros',
          index: 2,
          reason: 'tag inconnu {B/Foo} (effet inconnu)',
        },
        {
          field: 'prosCons',
          list: 'cons',
          index: 0,
          reason: 'fr : tag inconnu {P/Personne} (perso inconnu)',
        },
      ],
    });
    expect(calls).toEqual({ character: [], ee: [], kit: [], git: [] });
  });

  it('une ligne sans anglais, ou écrite partout avec d’autres balises : refusée comme une note de Gear reco', async () => {
    const { calls, fake } = deps();
    const everywhere = Object.fromEntries(LANGS.map((l) => [l, 'no tag']));
    const out = await save(
      {
        curated: {
          prosCons: {
            pros: [{ fr: 'sans anglais' }, { ...everywhere, en: 'vs {E/Earth}' }],
          },
        },
      },
      fake,
    );

    expect(out.refused.map((r) => [r.list, r.index])).toEqual([
      ['pros', 0],
      ['pros', 1],
    ]);
    expect(out.refused[0].reason).toBe('pas de texte « en », la langue de repli');
    expect(out.refused[1].reason).toContain('fr : balises « aucune », « en » porte « {E/Earth} »');
    expect(calls).toEqual({ character: [], ee: [], kit: [], git: [] });
  });

  it('une langue inconnue, une forme fausse : refusées, situées', async () => {
    const { calls, fake } = deps();
    const out = await saveCharacterSheet(
      AER,
      {
        curated: {
          prosCons: { pros: [{ en: 'a', de: 'b' }, 'texte'] },
          synergies: 'x',
        } as unknown as CharacterSheetChanges['curated'],
        was: ENTRY,
      },
      fake,
    );
    expect(out.refused).toEqual([
      { field: 'prosCons', list: 'pros', index: 0, reason: 'langue inconnue « de »' },
      { field: 'prosCons', list: 'pros', index: 1, reason: 'forme inattendue' },
      { field: 'synergies', reason: 'forme inattendue' },
    ]);
    expect(calls).toEqual({ character: [], ee: [], kit: [], git: [] });
  });

  it('synergies : des héros du roster, une raison contrôlée ; sans texte, la raison n’est pas écrite', async () => {
    const { calls, fake } = deps({ others: [ALLY, '2000014'] });
    const out = await save(
      {
        curated: {
          synergies: [
            { heroes: [ALLY, '2000014'], reason: { en: 'More {B/BT_ADDITIVE_TURN}' } },
            { heroes: [ALLY], reason: { en: ' ' } },
          ],
        },
      },
      fake,
    );

    expect(out).toMatchObject({ ok: true, written: true, refused: [] });
    expect(out.log).toEqual(['synergies : 2 groupes', 'git : fait']);
    const written = calls.character[0][1];
    expect(written.synergies).toEqual([
      { heroes: [ALLY, '2000014'], reason: { en: 'More {B/BT_ADDITIVE_TURN}' } },
      { heroes: [ALLY] },
    ]);
    // Un champ nouveau se range en queue d'entrée, après les vidéos : sa place dans le fichier.
    expect(Object.keys(written).at(-1)).toBe('synergies');
    expect(Object.keys(written).slice(0, -1)).toEqual(Object.keys(ENTRY));
  });

  it('un héros hors du roster, un groupe sans héros, une raison au tag inconnu : refusés, situés, rien d’écrit', async () => {
    const { calls, fake } = deps({ others: [ALLY] });
    const out = await save(
      {
        curated: {
          synergies: [
            { heroes: [ALLY] },
            { heroes: [ALLY, 'nope'] },
            { heroes: [], reason: { en: 'alone' } },
            { heroes: [ALLY], reason: { en: 'with {D/Foo}' } },
          ],
        },
      },
      fake,
    );

    expect(out.ok).toBe(false);
    expect(out.written).toBe(false);
    expect(out.refused).toEqual([
      { field: 'synergies', list: 'synergies', index: 1, reason: 'hors du roster : « nope »' },
      { field: 'synergies', list: 'synergies', index: 2, reason: 'groupe sans héros' },
      {
        field: 'synergies',
        list: 'synergies',
        index: 3,
        reason: 'tag inconnu {D/Foo} (effet inconnu)',
      },
    ]);
    expect(out.log[0]).toBe(`REFUSÉ — ${name} · synergies[1] : hors du roster : « nope ».`);
    expect(calls).toEqual({ character: [], ee: [], kit: [], git: [] });
  });

  it('pros + rangs : deux écritures, la seconde sur la première, UN commit', async () => {
    const { calls, fake } = deps({ others: [ALLY] });
    const out = await save(
      {
        ranks: [cell('rank', 'A', 'S')],
        curated: { prosCons: { pros: [PRO], cons: [] }, synergies: [{ heroes: [ALLY] }] },
      },
      fake,
    );

    expect(out).toMatchObject({ ok: true, written: true, refused: [] });
    expect(out.log).toEqual([
      'PvE : A → S',
      'pros / cons : 1 pro, 0 con',
      'synergies : 1 groupe',
      'git : fait',
    ]);
    expect(calls.character).toHaveLength(2);
    expect(calls.character[0]).toEqual([AER, { ...ENTRY, rank: 'S' }]);
    expect(calls.character[1][1]).toEqual({
      ...ENTRY,
      rank: 'S',
      prosCons: { pros: [PRO], cons: [] },
      synergies: [{ heroes: [ALLY] }],
    });
    expect(calls.git).toEqual([[['data/curated/characters.json'], `chore(characters): ${name}`]]);
  });

  it('des pros refusés n’arrêtent pas un rang : il part, eux gardent leur refus', async () => {
    const { calls, fake } = deps();
    const out = await save(
      {
        ranks: [cell('rank', 'A', 'S')],
        curated: { prosCons: { pros: [{ en: '{B/Foo}' }] } },
      },
      fake,
    );
    expect(out).toMatchObject({ ok: false, written: true });
    expect(out.refused.map((r) => [r.field, r.list, r.index])).toEqual([['prosCons', 'pros', 0]]);
    expect(calls.character).toEqual([[AER, { ...ENTRY, rank: 'S' }]]);
    expect(calls.git).toHaveLength(1);
  });

  it('listes vidées : la clé s’en va ; listes que le disque porte déjà : rien', async () => {
    const entry = { ...ENTRY, synergies: [{ heroes: [ALLY] }] };
    const emptied = deps({ entry, others: [ALLY] });
    const out = await saveCharacterSheet(
      AER,
      { curated: { prosCons: { pros: [], cons: [] }, synergies: [] }, was: entry },
      emptied.fake,
    );
    expect(out.log).toEqual(['pros / cons retirés', 'synergies retirées', 'git : fait']);
    expect(emptied.calls.character[0][1]).not.toHaveProperty('prosCons');
    expect(emptied.calls.character[0][1]).not.toHaveProperty('synergies');

    const same = deps({ entry, others: [ALLY] });
    expect(
      await saveCharacterSheet(
        AER,
        // `cons` absent du disque comme de l'envoi, ou vide : la même liste.
        {
          curated: { prosCons: { pros: [{ en: 'strong' }] }, synergies: entry.synergies },
          was: entry,
        },
        same.fake,
      ),
    ).toMatchObject({
      ok: true,
      written: false,
      log: ['Rien à enregistrer : le disque porte déjà ces valeurs.'],
    });
    expect(same.calls).toEqual({ character: [], ee: [], kit: [], git: [] });
  });

  it('`stale` : le disque a changé sous les pros ou les synergies — refus sans écriture', async () => {
    const { calls, fake } = deps();
    const out = await saveCharacterSheet(
      AER,
      {
        curated: { prosCons: { pros: [PRO] }, synergies: [] },
        // La page avait chargé d'autres pros ; les synergies, elles, n'ont pas bougé.
        was: { ...ENTRY, prosCons: { pros: [{ en: 'older' }], cons: [] } },
      },
      fake,
    );
    expect(out).toMatchObject({ ok: false, written: false, stale: true });
    expect(out.refused).toEqual([
      { field: 'prosCons', reason: 'le disque a changé depuis le chargement' },
    ]);
    expect(out.log[0]).toBe(
      `REFUSÉ — ${name} · pros / cons : le disque a changé depuis le chargement.`,
    );
    expect(calls).toEqual({ character: [], ee: [], kit: [], git: [] });
  });

  // ------------------------------------------------- les chips de skills (`kit`)
  const KIT_FILE = 'data/curated/character-skills.json';
  const CARD_IDS = ['5502', '5504', '5504::dual'];
  const kit = (
    chipHide: Record<string, string[]> = {},
    chipAdd: Record<string, string[]> = {},
  ): CharacterKitPatch => ({ cardIds: CARD_IDS, chipHide, chipAdd });

  it('un `kit` seul : `applyCharacterKitCuration`, puis UN commit qui porte character-skills.json', async () => {
    const { calls, fake } = deps();
    const out = await save(
      {
        kit: kit({ '5502': [' SYS_BUFF_REMOVE_BUFF ', 'SYS_BUFF_REMOVE_BUFF'] }, { '5504': ['1'] }),
      },
      fake,
    );

    expect(out).toEqual({
      ok: true,
      log: [
        'chips de « To the Beach? » : 1 masquée, 0 ajoutée',
        'chips de « Chain Passive » : 0 masquée, 1 ajoutée',
        'git : fait',
      ],
      written: true,
      stale: false,
      refused: [],
    });
    // Les cartes sont celles que le SERVEUR calcule ; les listes, nettoyées.
    expect(calls.kit).toEqual([
      {
        cardIds: CARD_IDS,
        chipHide: { '5502': ['SYS_BUFF_REMOVE_BUFF'] },
        chipAdd: { '5504': ['1'] },
      },
    ]);
    expect(calls.character).toEqual([]);
    expect(calls.git).toEqual([[[KIT_FILE], `chore(characters): ${name}`]]);
  });

  it('un rang ET des chips : deux fichiers, toujours UN commit', async () => {
    const { calls, fake } = deps();
    const out = await save({ ranks: [cell('rank', 'A', 'S')], kit: kit({ '5504': ['7'] }) }, fake);
    expect(out).toMatchObject({ ok: true, written: true, refused: [] });
    expect(calls.git).toEqual([
      [['data/curated/characters.json', KIT_FILE], `chore(characters): ${name}`],
    ]);
  });

  it('des chips que le disque porte déjà : le store n’est pas appelé, le fichier n’est pas du commit', async () => {
    const onDisk = { kit: { chipHide: { '5502': ['11'] }, chipAdd: { '5504': ['1'] } } };
    const withRank = deps(onDisk);
    const sent = kit({ '5502': ['11'], '5504': [] }, { '5504': ['1'], '5502': [] });
    await save({ ranks: [cell('rank', 'A', 'S')], kit: sent }, withRank.fake);
    expect(withRank.calls.kit).toEqual([]);
    expect(withRank.calls.git).toEqual([
      [['data/curated/characters.json'], `chore(characters): ${name}`],
    ]);

    const alone = deps(onDisk);
    expect(await save({ kit: sent }, alone.fake)).toMatchObject({
      ok: true,
      written: false,
      log: ['Rien à enregistrer : le disque porte déjà ces valeurs.'],
    });
    expect(alone.calls).toEqual({ character: [], ee: [], kit: [], git: [] });
  });

  it('une liste vidée part vide : le store retire la clé ; seules les listes qui bougent partent', async () => {
    const { calls, fake } = deps({
      kit: { chipHide: { '5502': ['11'], '5504': ['7'] }, chipAdd: { '5502': ['1'] } },
    });
    const out = await save({ kit: kit({ '5502': [], '5504': ['7'] }, { '5502': ['1'] }) }, fake);
    expect(calls.kit).toEqual([{ cardIds: CARD_IDS, chipHide: { '5502': [] }, chipAdd: {} }]);
    // La ligne du journal : ce que la carte porte après l'écriture.
    expect(out.log[0]).toBe('chips de « To the Beach? » : 0 masquée, 1 ajoutée');
  });

  it('un écart est un refus SITUÉ à sa carte, qui n’est pas écrite ; les autres le sont', async () => {
    const { calls, fake } = deps({ kit: { chipHide: { '5504': ['legacy'] } } });
    const out = await save(
      {
        kit: kit(
          // Une ref qui n'est pas une chip de la carte ; une ref héritée du disque reste.
          { '5502': ['nope'], '5504': ['legacy', '7'], '999': ['x'] },
          // Un effet hors du catalogue ; la même carte que le masquage valide.
          { '5504::dual': ['404'], '5502': ['1'] },
        ),
      },
      fake,
    );

    expect(out).toMatchObject({ ok: false, written: true, stale: false });
    expect(out.refused).toEqual([
      // Dans l'ordre des clés reçues : JS range d'abord celles qui sont des entiers.
      { field: 'kit', card: '999', reason: 'pas une carte de ce perso' },
      { field: 'kit', card: '5502', reason: '« nope » : pas une chip de cette carte' },
      { field: 'kit', card: '5504::dual', reason: '« 404 » : effet inconnu du glossaire' },
    ]);
    expect(out.log).toEqual([
      `REFUSÉ — ${name} · chips de « 999 » : pas une carte de ce perso.`,
      `REFUSÉ — ${name} · chips de « To the Beach? » : « nope » : pas une chip de cette carte.`,
      `REFUSÉ — ${name} · chips de « Dual » : « 404 » : effet inconnu du glossaire.`,
      'chips de « Chain Passive » : 2 masquées, 0 ajoutée',
      'git : fait',
    ]);
    // La carte en écart n'est écrite pour AUCUNE de ses deux listes.
    expect(calls.kit).toEqual([
      { cardIds: CARD_IDS, chipHide: { '5504': ['legacy', '7'] }, chipAdd: {} },
    ]);
    expect(calls.git).toEqual([[[KIT_FILE], `chore(characters): ${name}`]]);
  });

  it('un refus du store est situé à la carte qu’il nomme ; rien n’est committé', async () => {
    const { calls, fake } = deps({
      kitErrors: () => ['chipAdd[5504::dual] : string list expected', 'cardIds missing'],
    });
    const out = await save({ kit: kit({}, { '5504::dual': ['7'] }) }, fake);
    expect(out).toMatchObject({ ok: false, written: false });
    expect(out.refused).toEqual([
      { field: 'kit', card: '5504::dual', reason: 'string list expected' },
      { field: 'kit', reason: 'cardIds missing' },
    ]);
    expect(out.log).toEqual([
      `REFUSÉ — ${name} · chips de « Dual » : string list expected.`,
      `REFUSÉ — ${name} · chips : cardIds missing.`,
      'Rien à enregistrer.',
    ]);
    expect(calls.git).toEqual([]);
  });

  it('une forme fausse, ou des cartes illisibles : un refus du champ, le reste part', async () => {
    const shape = deps();
    for (const bad of [[], 'x', { chipHide: [] }] as unknown[]) {
      const out = await save({ kit: bad as CharacterKitPatch }, shape.fake);
      expect(out.refused.map((r) => [r.field, r.card])).toEqual([['kit', undefined]]);
    }
    expect(shape.calls).toEqual({ character: [], ee: [], kit: [], git: [] });
    expect(
      (await save({ kit: { cardIds: [], chipAdd: { '5502': [1] } } as never }, shape.fake)).refused,
    ).toEqual([{ field: 'kit', card: '5502', reason: 'chipAdd : une liste de refs attendue' }]);

    const blind = deps({
      kitCards: async () => {
        throw new Error('tables du jeu absentes');
      },
    });
    const out = await save(
      { ranks: [cell('rank', 'A', 'S')], kit: kit({ '5502': ['11'] }) },
      blind.fake,
    );
    expect(out).toMatchObject({ ok: false, written: true });
    expect(out.refused).toEqual([
      { field: 'kit', reason: 'kit illisible (tables du jeu absentes)' },
    ]);
    expect(blind.calls.kit).toEqual([]);
    expect(blind.calls.git).toEqual([
      [['data/curated/characters.json'], `chore(characters): ${name}`],
    ]);
  });

  it('`stale` sur un champ de la fiche : les chips ne partent pas non plus', async () => {
    const { calls, fake } = deps();
    const out = await saveCharacterSheet(
      AER,
      { curated: { tags: [] }, was: { ...ENTRY, tags: [] }, kit: kit({ '5502': ['11'] }) },
      fake,
    );
    expect(out).toMatchObject({ ok: false, written: false, stale: true });
    expect(calls).toEqual({ character: [], ee: [], kit: [], git: [] });
  });

  // ------------------------------------------------------ les chips de l'EE (`ee`)
  const EE_FILE = 'data/curated/equipment.json';
  /** L'entrée curée de l'EE que la page avait chargée : celle du disque factice. */
  const EE_WAS = { rank: 'A', rank10: 'S', chipHide: ['x'], chipAdd: [] as string[] };
  const eeChips = (
    chipHide: string[],
    chipAdd: string[] = [],
    was = EE_WAS,
  ): NonNullable<CharacterSheetChanges['ee']> => ({ chipHide, chipAdd, was });
  const AUTO = 'SYS_BUFF_ACTION_GAUGE_UP';

  it('un rang d’EE ET ses chips : UN `upsertEe`, les quatre champs fusionnés, UN commit', async () => {
    const { calls, fake } = deps();
    const out = await save(
      {
        ranks: [cell('eeRank10', 'S', 'A')],
        // Nettoyées et dédoublonnées ; `x`, héritée du disque sans être une chip, reste.
        ee: eeChips(['x', ` ${AUTO} `, AUTO], ['7', '7']),
      },
      fake,
    );

    expect(out).toEqual({
      ok: true,
      log: ['EE +10 : S → A', "chips de l'EE : 2 masquées, 1 ajoutée", 'git : fait'],
      written: true,
      stale: false,
      refused: [],
    });
    // Deux écritures bâties sur le disque d'avant s'écraseraient : il n'y en a qu'une.
    expect(calls.ee).toEqual([
      [AER, { rank: 'A', rank10: 'A', chipHide: ['x', AUTO], chipAdd: ['7'] }],
    ]);
    expect(calls.character).toEqual([]);
    expect(calls.git).toEqual([[[EE_FILE], `chore(characters): ${name}`]]);
  });

  it('des chips seules : les rangs du disque repartent avec elles ; une liste vidée part vide', async () => {
    const { calls, fake } = deps();
    const out = await save({ ee: eeChips([], ['1']) }, fake);
    expect(out).toMatchObject({ ok: true, written: true, refused: [] });
    expect(out.log).toEqual(["chips de l'EE : 0 masquée, 1 ajoutée", 'git : fait']);
    expect(calls.ee).toEqual([[AER, { rank: 'A', rank10: 'S', chipHide: [], chipAdd: ['1'] }]]);
  });

  it('une chip hors des AUTO, un effet hors du catalogue : un refus SITUÉ, les chips ne partent pas — le rang, si', async () => {
    const { calls, fake } = deps();
    const out = await save(
      { ranks: [cell('eeRank', 'A', 'B')], ee: eeChips(['x', 'nope'], ['404', '7']) },
      fake,
    );
    expect(out).toMatchObject({ ok: false, written: true, stale: false });
    expect(out.refused).toEqual([
      {
        field: 'ee',
        reason: '« nope » : pas une chip de cet EE ; « 404 » : effet inconnu du glossaire',
      },
    ]);
    expect(out.log).toEqual([
      `REFUSÉ — ${name} · chips de l'EE : « nope » : pas une chip de cet EE ; « 404 » : effet inconnu du glossaire.`,
      'EE base : A → B',
      'git : fait',
    ]);
    // Le rang part sur les chips du DISQUE, pas sur celles de la page.
    expect(calls.ee).toEqual([
      [AER, { rank: 'B', rank10: 'S', chipHide: ['x'], chipAdd: undefined }],
    ]);

    const alone = deps();
    expect(await save({ ee: eeChips(['x'], ['404']) }, alone.fake)).toMatchObject({
      ok: false,
      written: false,
      refused: [{ field: 'ee', reason: '« 404 » : effet inconnu du glossaire' }],
    });
    expect(alone.calls).toEqual({ character: [], ee: [], kit: [], git: [] });
  });

  it('`stale` : l’entrée curée de l’EE a changé depuis le chargement — refus SANS écriture, rangs compris', async () => {
    const { calls, fake } = deps();
    const out = await save(
      {
        ranks: [cell('rank', 'A', 'S'), cell('eeRank', 'A', 'B')],
        // La page avait chargé un autre rang +10 : l'onglet Rangs a écrit entre-temps.
        ee: eeChips(['x', AUTO], [], { ...EE_WAS, rank10: 'A' }),
      },
      fake,
    );
    expect(out).toMatchObject({ ok: false, written: false, stale: true });
    expect(out.refused).toEqual([
      { field: 'ee', reason: 'le disque a changé depuis le chargement' },
    ]);
    expect(out.log).toEqual([
      `REFUSÉ — EE de ${name} : le disque a changé depuis le chargement.`,
      'Rien à enregistrer.',
    ]);
    expect(calls).toEqual({ character: [], ee: [], kit: [], git: [] });
    // Des chips que la page n'avait pas : périmé aussi.
    const chips = deps();
    expect(
      await save({ ee: eeChips([AUTO], [], { ...EE_WAS, chipHide: [] }) }, chips.fake),
    ).toMatchObject({ stale: true, written: false });
    expect(chips.calls.ee).toEqual([]);
  });

  it('des chips que le disque porte déjà : le store n’est pas appelé, equipment.json n’est pas du commit', async () => {
    const withRank = deps();
    await save({ ranks: [cell('rank', 'A', 'S')], ee: eeChips(['x']) }, withRank.fake);
    expect(withRank.calls.ee).toEqual([]);
    expect(withRank.calls.git).toEqual([
      [['data/curated/characters.json'], `chore(characters): ${name}`],
    ]);

    const alone = deps();
    expect(await save({ ee: eeChips(['x']) }, alone.fake)).toMatchObject({
      ok: true,
      written: false,
      log: ['Rien à enregistrer : le disque porte déjà ces valeurs.'],
    });
    expect(alone.calls).toEqual({ character: [], ee: [], kit: [], git: [] });
  });

  it('un rang, des chips d’EE et des chips de skill : trois fichiers, toujours UN commit', async () => {
    const { calls, fake } = deps();
    const out = await save(
      { ranks: [cell('rank', 'A', 'S')], ee: eeChips(['x'], ['7']), kit: kit({ '5504': ['7'] }) },
      fake,
    );
    expect(out).toMatchObject({ ok: true, written: true, refused: [] });
    expect(calls.git).toEqual([
      [['data/curated/characters.json', EE_FILE, KIT_FILE], `chore(characters): ${name}`],
    ]);
  });

  it('un perso sans EE, une forme fausse : un refus du champ, rien n’est écrit', async () => {
    const none = deps({ noEe: true });
    expect((await save({ ee: eeChips(['x'], ['7']) }, none.fake)).refused).toEqual([
      { field: 'ee', reason: "ce perso n'a pas d'EE" },
    ]);
    expect(none.calls.ee).toEqual([]);

    const shape = deps();
    for (const bad of [
      { chipHide: 'x', was: EE_WAS },
      { chipAdd: [1], was: EE_WAS },
    ] as unknown[]) {
      const out = await save({ ee: bad as never }, shape.fake);
      expect(out.refused.map((r) => [r.field, r.reason])).toEqual([
        ['ee', expect.stringContaining('une liste de refs attendue')],
      ]);
    }
    expect(shape.calls).toEqual({ character: [], ee: [], kit: [], git: [] });
  });

  it('un refus du store des EE : le rang et les chips sont refusés, rien n’est committé', async () => {
    const { calls, fake } = deps({ eeErrors: ['ee[2000055].rank — attendu une chaîne'] });
    const out = await save({ ranks: [cell('eeRank', 'A', 'B')], ee: eeChips(['x'], ['7']) }, fake);
    expect(out).toMatchObject({ ok: false, written: false });
    expect(out.refused).toEqual([
      { field: 'ee', reason: 'ee[2000055].rank — attendu une chaîne' },
      { field: 'eeRank', step: undefined, reason: 'refusé par le store' },
    ]);
    expect(out.log).toEqual([
      `REFUSÉ — EE de ${name} : ee[2000055].rank — attendu une chaîne`,
      'Rien à enregistrer.',
    ]);
    expect(calls.ee).toHaveLength(1);
    expect(calls.git).toEqual([]);
  });
});

// ------------------------------------------------------------- gear reco -----

const CATALOG: GearCatalog = {
  weapons: new Set(['w1', 'w2']),
  amulets: new Set(['a1']),
  talismans: new Set(['t1', 't2']),
  sets: new Set(['s1', 's2']),
  presets: {
    talismans: { duo: ['t1', 't2'] },
    sets: { four: [{ set: 's1', count: 4 }] },
    substats: { dps: 'ATK>CHC>SPD' },
  },
};

const BUILD: GearBuild = {
  name: 'Speed',
  weapons: [{ id: 'w1', mainStat: 'ATK%' }],
  amulets: [{ id: 'a1', mainStat: 'PEN%/CHD' }],
  talismans: ['$duo'],
  sets: [
    { preset: 'four' },
    {
      pieces: [
        { set: 's1', count: 2 },
        { set: 's2', count: 2 },
      ],
    },
  ],
  substats: '$dps',
  note: { en: 'Plain note.', fr: 'Note simple.', es: 'Nota simple.' },
};

describe('checkGearBuilds — références', () => {
  it('laisse passer un build dont tout existe, presets et pièces', () => {
    expect(checkGearBuilds([BUILD, { name: 'Nu' }], CATALOG)).toEqual([]);
  });

  it('situe chaque référence fautive : build, slot, rang', () => {
    const issues = checkGearBuilds(
      [
        BUILD,
        {
          name: ' ',
          weapons: [{ id: 'w1' }, { id: '' }, { id: 'ghost' }],
          talismans: ['t1', '', '$nope'],
          sets: [{ preset: 'nope' }, { pieces: [] }, { pieces: [{ set: '', count: 2 }] }],
          substats: '$nope',
        },
      ],
      CATALOG,
    );

    expect(issues.map(({ build, slot, index }) => [build, slot, index])).toEqual([
      [1, 'name', undefined],
      [1, 'weapons', 1],
      [1, 'weapons', 2],
      [1, 'talismans', 1],
      [1, 'talismans', 2],
      [1, 'sets', 0],
      [1, 'sets', 1],
      [1, 'sets', 2],
      [1, 'substats', undefined],
    ]);
  });

  it('ne refuse PAS une stat principale hors du pool (le fichier en porte)', () => {
    const odd = { ...BUILD, weapons: [{ id: 'w1', mainStat: 'WHATEVER' }] };
    expect(checkGearBuilds([odd], CATALOG)).toEqual([]);
  });
});

describe('checkGearBuilds — notes', () => {
  const noted = (note: GearBuild['note']): GearBuild[] => [{ ...BUILD, note }];

  it('refuse un tag sans correspondance, dans la langue qui le porte', () => {
    const issues = checkGearBuilds(
      noted({ en: 'Use {I-T/No Such Charm}.', fr: 'Sans balise.' }),
      CATALOG,
    );

    expect(issues).toHaveLength(1);
    expect(issues[0]).toMatchObject({ build: 0, slot: 'note' });
    expect(issues[0].message).toContain('en : {I-T/No Such Charm}');
  });

  it('refuse un type de tag que le rendu ne connaît pas', () => {
    expect(checkGearBuilds(noted({ en: 'Bad {ZZ/x}.' }), CATALOG)).toHaveLength(1);
  });

  it('refuse une note sans anglais, la langue de repli', () => {
    const issues = checkGearBuilds(noted({ fr: 'Seulement en français.' }), CATALOG);
    expect(issues.map((i) => i.slot)).toEqual(['note']);
  });

  it('exige les MÊMES balises partout quand la note est écrite dans toutes les langues', () => {
    const all = {
      en: '{E/fire} team',
      fr: '{E/fire}',
      es: '{E/fire}',
      jp: '{E/fire}',
      kr: '{E/fire}',
    };

    expect(checkGearBuilds(noted({ ...all, zh: '{E/fire}' }), CATALOG)).toEqual([]);
    const issues = checkGearBuilds(noted({ ...all, zh: 'fire' }), CATALOG);
    expect(issues).toHaveLength(1);
    expect(issues[0].message).toContain('zh');
    // Une note partielle n'est pas un bloc pour le test de parité : pas contrôlée.
    expect(checkGearBuilds(noted({ en: '{E/fire}', fr: 'feu' }), CATALOG)).toEqual([]);
  });
});

describe('recos du fichier — lues, jamais écrites', () => {
  const reco = loadGearReco();
  const presets = loadGearPresets();
  const state = gearRecoState();
  const ids = (list: { id: string }[]): Set<string> => new Set(list.map((o) => o.id));
  const catalog: GearCatalog = {
    weapons: ids(state.options.weapons),
    amulets: ids(state.options.amulets),
    talismans: ids(state.options.talismans),
    sets: ids(state.options.sets),
    presets,
  };

  it('le contrôle ne refuse AUCUN build existant (sinon son perso ne s’enregistre plus)', () => {
    const refused = Object.entries(reco).flatMap(([id, builds]) =>
      checkGearBuilds(builds, catalog).map((i) => `${id}[${i.build}] ${i.slot} — ${i.message}`),
    );
    expect(refused).toEqual([]);
  });

  it('déplier puis replier trois builds réels ne perd rien', () => {
    const all = Object.values(reco).flat();
    // Trois formes : tout en presets, plusieurs combos de sets, une note.
    const sample = [
      all.find((b) => b.talismans?.[0]?.startsWith('$') && b.substats?.startsWith('$')),
      all.find((b) => (b.sets?.length ?? 0) > 1),
      all.find((b) => b.note),
      ...all,
    ]
      .filter((b): b is GearBuild => Boolean(b))
      .filter((b, i, list) => list.indexOf(b) === i)
      .slice(0, 3);
    expect(sample).toHaveLength(3);

    for (const disk of sample) {
      const pieces = expandBuild(disk, presets);
      // Déplié : plus aucun `$slug`, que des pièces.
      expect(JSON.stringify([pieces.talismans, pieces.sets, pieces.substats])).not.toContain('$');
      expect(pieces.sets?.every((c) => !c.preset)).toBe(true);

      const back = collapseBuild(pieces, presets);
      // Replié : les MÊMES pièces une fois redépliées (deux presets de même
      // contenu se valent, d'où la comparaison en pièces et non en slugs)…
      expect(expandBuild(back, presets)).toEqual(pieces);
      // …sous forme de presets partout où le disque en citait…
      if (disk.talismans?.[0]?.startsWith('$')) expect(back.talismans?.[0]).toMatch(/^\$/);
      expect(back.sets?.map((c) => Boolean(c.preset))).toEqual(
        disk.sets?.map((c) => Boolean(c.preset)),
      );
      if (disk.substats?.startsWith('$')) expect(back.substats).toBe(disk.substats);
      // …et le reste intact.
      expect([back.name, back.weapons, back.amulets, back.note]).toEqual([
        disk.name,
        disk.weapons,
        disk.amulets,
        disk.note,
      ]);
    }
  });

  it('l’état d’un perso porte ses builds deux fois : en pièces et tels que le disque', () => {
    const id = Object.keys(reco)[0];
    const one = gearRecoState(id);

    expect(one.disk).toEqual(reco[id]);
    expect(one.builds).toEqual(reco[id].map((b) => expandBuild(b, presets)));
    expect(gearRecoState()).not.toHaveProperty('builds');
  });

  it('les listes portent leur icône : c’est l’image des tuiles des pickers', () => {
    for (const slot of ['weapons', 'amulets', 'talismans', 'sets'] as const) {
      expect(state.options[slot].length, slot).toBeGreaterThan(0);
      expect(
        state.options[slot].filter((o) => !o.icon).map((o) => o.label),
        slot,
      ).toEqual([]);
    }
  });

  it('une pièce porte ce que sa tuile montre : grade, étoiles, icône d’effet', () => {
    const { weapons, amulets, talismans } = state.options;
    for (const o of [...weapons, ...amulets, ...talismans]) {
      expect(['normal', 'magic', 'rare', 'unique'], o.label).toContain(o.grade);
      expect(o.star, o.label).toBeGreaterThan(0);
    }

    // Une arme unique 6★ à passif : l'icône d'effet de son premier palier.
    const sword = weapons.find((o) => o.label === 'Surefire Greatsword');
    expect(sword).toMatchObject({ grade: 'unique', star: 6, classLimits: ['striker'] });
    expect(sword?.overlayIcon).toMatch(/^TI_Icon_UO_Weapon_/);
    expect(sword?.mode).toBeUndefined();
    // Sans passif : pas d'icône d'effet.
    const steel = weapons.find((o) => o.label === 'Steel Sword');
    expect(steel).toMatchObject({ grade: 'rare', star: 6 });
    expect(steel?.overlayIcon).toBeUndefined();
    // Une variante de classe porte SON passif, sous son id à elle.
    const briareos = weapons.filter((o) => /^Briareos's Recklessness \[/.test(o.label));
    expect(briareos).toHaveLength(5);
    expect(new Set(briareos.map((o) => o.id)).size).toBe(5);
    for (const o of briareos) {
      expect(o.classLimits, o.label).toHaveLength(1);
      expect(o.overlayIcon, o.label).toBeTruthy();
    }
  });

  it('un talisman dit son type de points', () => {
    const { talismans } = state.options;
    expect(talismans.filter((o) => o.mode !== 'AP' && o.mode !== 'CP')).toEqual([]);
    const ap = talismans.find((o) => o.mode === 'AP');
    expect(ap).toMatchObject({ grade: 'unique', star: 6 });
    expect(ap?.overlayIcon).toMatch(/^TI_Icon_UO_Talisman_/);
    expect(talismans.some((o) => o.mode === 'CP')).toBe(true);
  });

  it('un set porte son icône, ses quatre pièces et ses bonus — Revenge et Patience sans 2 pièces', () => {
    const { sets } = state.options;
    for (const o of sets) {
      expect(o.setIcon, o.label).toMatch(/^TI_Icon_Set_/);
      expect(o.setIcon, o.label).toBe(o.icon);
      expect(o.pieceIcons, o.label).toHaveLength(4);
      // helmet, armor, gloves, shoes : l'ordre des tuiles d'un combo.
      for (const [i, part] of ['Helmet', 'Armor', 'Gloves', 'Shoes'].entries())
        expect(o.pieceIcons?.[i], o.label).toContain(part);
      expect(o.has2P, o.label).toBe(Boolean(o.p2));
    }

    // Le bonus 2 pièces de Speed n'existe qu'au dernier palier : c'est lui qui est servi.
    const speed = sets.find((o) => o.label === 'Speed Set');
    expect(speed).toMatchObject({ has2P: true });
    expect(speed?.p2).toMatch(/^Speed \+\d+%$/);
    expect(speed?.p4).toMatch(/^Speed \+\d+%$/);

    const alone = sets.filter((o) => !o.has2P).map((o) => o.label);
    expect(alone).toEqual(['Patience Set', 'Revenge Set']);
    for (const o of sets.filter((x) => !x.has2P)) {
      expect(o.p2, o.label).toBeUndefined();
      expect(o.p4, o.label).toContain('proportional to missing Health');
    }
  });

  it('l’état porte les icônes de stat : les puces de l’aperçu', () => {
    expect(state.statIcons['ATK%']).toBe(state.statIcons.ATK);
    for (const sprite of Object.values(state.statIcons)) expect(sprite).toMatch(/^CM_Stat_Icon_/);
  });
});

describe('previewGearBuilds — les refus de l’aperçu', () => {
  it('une forme fausse est RENDUE, jamais levée : la route en fait un 400', async () => {
    for (const bad of [undefined, null, 'x', {}, [{}], [null], [{ name: 'x', weapons: 'y' }]]) {
      const out = await previewGearBuilds(bad, 'en');
      expect(out, JSON.stringify(bad)).toEqual({ error: expect.any(String) });
    }
    expect(await previewGearBuilds([{ weapons: [] }], 'en')).toEqual({
      error: expect.stringMatching(/^build 1 · nom : /),
    });
    expect(await previewGearBuilds([{ name: 'x' }, { name: 'y', sets: 3 }], 'en')).toEqual({
      error: expect.stringMatching(/^build 2 · sets : /),
    });
  });

  it('coupé par la garde IS_DEV (forcée fausse ici) : une erreur, pas zéro build en silence', async () => {
    expect(await previewGearBuilds([{ name: 'x' }], 'en')).toEqual({
      error: expect.stringContaining('IS_DEV'),
    });
  });
});

describe('itemTile — la tuile d’item de gear-view', () => {
  const env = {
    imgBase: 'https://img.test',
    esc: (v: unknown) =>
      String(v).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;'),
  };
  const count = (html: string, needle: string) => html.split(needle).length - 1;

  it('unique 6★ à effet, d’une seule classe : son cadre, six étoiles, les deux overlays', () => {
    const html = itemTile(
      env,
      {
        icon: 'TI_Equipment_Weapon_06',
        grade: 'unique',
        star: 6,
        overlayIcon: 'TI_Icon_UO_Weapon_11',
        classLimits: ['striker'],
      },
      64,
    );
    expect(html).toContain('style="width:64px;height:64px"');
    expect(html).toContain('src="https://img.test/images/ui/bg/TI_Slot_Unique.webp"');
    expect(html).toContain('src="https://img.test/images/equipment/TI_Equipment_Weapon_06.webp"');
    expect(count(html, 'images/ui/star/CM_icon_star_y.webp')).toBe(6);
    // 18 % de 64 px, arrondi ; chevauchement de 30 %, sauf la première.
    expect(count(html, 'width="12" height="12"')).toBe(6);
    expect(count(html, 'margin-left:-3.6px')).toBe(5);
    expect(html).toContain(
      'class="gv-fx" src="https://img.test/images/equipment/TI_Icon_UO_Weapon_11.webp"',
    );
    expect(html).toContain(
      'class="gv-cls" src="https://img.test/images/ui/class/IG_Turn_Class_Striker.webp"',
    );
    expect(count(html, '<img')).toBe(10);
  });

  it('normale sans passif : ni overlay, ni étoile en trop', () => {
    const html = itemTile(env, { icon: 'TI_Equipment_Weapon_01', grade: 'normal', star: 1 }, 44);
    expect(html).toContain('images/ui/bg/TI_Slot_Normal.webp');
    expect(count(html, 'CM_icon_star_y')).toBe(1);
    // 18 % de 44 px : 8 px, le plancher.
    expect(html).toContain('width="8" height="8"');
    expect(html).not.toContain('margin-left');
    expect(html).not.toContain('gv-fx');
    expect(html).not.toContain('gv-cls');
    expect(count(html, '<img')).toBe(3);
  });

  it('`dir` : le sprite d’un item du catalogue est sous `images/items`, pas `equipment`', () => {
    const html = itemTile(env, { icon: 'TI_GEM_ATK_1', grade: 'rare', star: 2, dir: 'items' }, 32);
    expect(html).toContain('class="gv-icon" src="https://img.test/images/items/TI_GEM_ATK_1.webp"');
    expect(html).not.toContain('images/equipment/');
    expect(html).toContain('images/ui/bg/TI_Slot_Rare.webp');
    expect(count(html, 'CM_icon_star_y')).toBe(2);
  });

  it('pas d’icône de classe sur une pièce libre ou ouverte à plusieurs classes', () => {
    const tile = (classLimits: string[]) =>
      itemTile(env, { icon: 'x', grade: 'rare', star: 6, classLimits }, 64);
    expect(tile([])).not.toContain('gv-cls');
    expect(tile(['striker', 'mage'])).not.toContain('gv-cls');
    expect(tile(['healer'])).toContain('IG_Turn_Class_Healer.webp');
    expect(tile([])).toContain('TI_Slot_Rare.webp');
  });

  it('une pièce inconnue : sa place vide, à la taille ; un grade inconnu : le cadre normal', () => {
    for (const none of [undefined, {}, { grade: 'unique', star: 6 }]) {
      const html = itemTile(env, none, 44);
      expect(html).toContain('class="gv-tile none" style="width:44px;height:44px"');
      expect(html).not.toContain('<img');
    }
    expect(itemTile(env, { icon: 'x', grade: 'mythic' }, 44)).toContain('TI_Slot_Normal.webp');
    expect(itemTile(env, { icon: 'x', grade: 'unique' }, 44)).not.toContain('gv-stars');
  });

  it('échappe ce qu’il pose dans le HTML', () => {
    const html = itemTile({ ...env, imgBase: 'https://a"b' }, { icon: '"><i>' }, 44);
    expect(html).not.toContain('"><i>');
    expect(html).toContain('https://a&quot;b/images/equipment/&quot;>&lt;i>.webp');
    expect(itemName(env, '<b>Sword</b>', 'unique')).toBe(
      '<span class="gv-name" style="color:var(--item-legendary)">&lt;b>Sword&lt;/b></span>',
    );
  });

  it('le nom prend le jeton de son grade (`GRADE_TEXT` du site)', () => {
    expect(['normal', 'magic', 'rare', 'unique', 'mythic', undefined].map(gradeColor)).toEqual([
      'var(--item-normal)',
      'var(--item-superior)',
      'var(--item-epic)',
      'var(--item-legendary)',
      '',
      '',
    ]);
    expect(itemName(env, 'Sword', undefined, 'g-n')).toBe('<span class="g-n">Sword</span>');
  });

  it('un set : quatre pièces en cadre unique, l’icône du set sur chacune', () => {
    const set = {
      setIcon: 'TI_Icon_Set_Enchant_15',
      pieceIcons: ['Helmet_06', 'Armor_06', 'Gloves_06', 'Shoes_06'],
    };
    const grid = setGrid(env, set);
    expect(grid.startsWith('<span class="gv-set">')).toBe(true);
    expect(count(grid, 'TI_Slot_Unique.webp')).toBe(4);
    expect(
      count(
        grid,
        'class="gv-fx" src="https://img.test/images/equipment/TI_Icon_Set_Enchant_15.webp"',
      ),
    ).toBe(4);
    expect(count(grid, 'width:34px;height:34px')).toBe(4);
    expect(grid).not.toContain('gv-stars');
    const order = set.pieceIcons.map((icon) => grid.indexOf(`equipment/${icon}.webp`));
    expect(order).toEqual([...order].sort((a, b) => a - b));
    expect(order.every((at) => at > 0)).toBe(true);

    // Dans un combo : helmet + armor pour le premier set, gloves + shoes ensuite ;
    // joué à 4, les quatre.
    expect([shownPieces(4, 0), shownPieces(2, 0), shownPieces(2, 1), shownPieces(2, 2)]).toEqual([
      [0, 1, 2, 3],
      [0, 1],
      [2, 3],
      [2, 3],
    ]);
    const head = setRow(env, set, { count: 2, idx: 0 });
    expect(count(head, 'width:32px;height:32px')).toBe(2);
    expect(head).toContain('Helmet_06');
    expect(head).toContain('Armor_06');
    expect(head).not.toContain('Gloves_06');
    const tail = setRow(env, set, { count: 2, idx: 1 });
    expect(tail).toContain('Gloves_06');
    expect(tail).toContain('Shoes_06');
    expect(tail).not.toContain('Helmet_06');
    expect(count(setRow(env, set, { count: 4, idx: 0 }), 'TI_Slot_Unique.webp')).toBe(4);
    // Un set que les listes ne connaissent pas : une place vide.
    expect(setRow(env, undefined, { count: 2, idx: 0 })).toBe(
      `<span class="gv-row">${itemTile(env, undefined, 32)}</span>`,
    );
  });
});

describe('previewHtml — l’aperçu d’un build de gear-view', () => {
  const env = {
    imgBase: 'https://img.test',
    esc: (v: unknown) =>
      String(v).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;'),
  };
  const count = (html: string, needle: string) => html.split(needle).length - 1;
  const labels = {
    weapon: 'Weapon',
    amulet: 'Accessory',
    talisman: 'Talisman',
    set: 'Armor Set',
    substatPrio: 'Substat Priority',
    note: 'Notes',
    piece2: '2 pieces',
    piece4: '4 pieces',
  };
  const statIcons = { 'ATK%': 'CM_Stat_Icon_ATK', CHD: 'CM_Stat_Icon_CRITICAL_DMG' };
  const empty = {
    weapons: [],
    amulets: [],
    talismans: [],
    sets: [],
    setEffects: [],
    noteSegments: [],
  };
  const set = (id: string, name: string, n: number) => ({
    id,
    name,
    icon: `Enchant_${id}`,
    pieceIcons: ['Helmet', 'Armor', 'Gloves', 'Shoes'],
    count: n,
  });

  it('une balise morte (`unknown`) sort dans un élément rouge, son texte échappé', () => {
    expect(noteHtml(env, [{ t: 'unknown', s: '{B/<nope>}' }])).toBe(
      '<span class="pv-unknown">{B/&lt;nope>}</span>',
    );
    // Un type de segment que le module ne connaît pas : rouge aussi, jamais muet.
    expect(noteHtml(env, [{ t: 'later' }])).toBe('<span class="pv-unknown">{later}</span>');
  });

  it('le texte tel quel, un `br` en `<br>`', () => {
    expect(noteHtml(env, [{ t: 'text', s: 'a <b> & c' }, { t: 'br' }, { t: 'text', s: 'd' }])).toBe(
      'a &lt;b> &amp; c<br>d',
    );
    expect(noteHtml(env, [])).toBe('');
  });

  it('un `item` : son cadre, son icône et son nom dans la classe du grade ; la desc en `title`', () => {
    // Tel que le site le rend : avec le lien que l'aperçu ne pose pas.
    const segment = {
      t: 'item',
      name: 'Surefire Greatsword',
      iconSrc: '/images/equipment/TI_Equipment_Weapon_06.webp',
      grade: 'unique',
      color: 'text-item-legendary',
      href: '/equipment/surefire-greatsword',
      desc: 'Deals <color=#28d9ed>2%</color> more\\nto "one" target',
    };
    const html = noteHtml(env, [segment]);
    expect(html.startsWith('<span class="pv-seg text-item-legendary" title="')).toBe(true);
    expect(html).toContain('title="Deals 2% more\nto &quot;one&quot; target"');
    expect(html).toContain('src="https://img.test/images/ui/bg/TI_Slot_Unique.webp"');
    // Une adresse relative du site passe sous `imgBase`.
    expect(html).toContain('src="https://img.test/images/equipment/TI_Equipment_Weapon_06.webp"');
    expect(html).toContain('<span class="pv-u">Surefire Greatsword</span>');
    // Rien de cliquable dans l'aperçu.
    expect(html).not.toContain('href');
    expect(html).not.toContain('<a');
  });

  it('`icon`, `effect`, `stat` : icône + libellé dans la couleur du site', () => {
    const fire = noteHtml(env, [
      { t: 'icon', label: 'Fire', color: 'text-fire', icon: 'https://cdn.test/f.webp' },
    ]);
    expect(fire).toBe(
      '<span class="pv-seg text-fire"><img class="pv-ico" src="https://cdn.test/f.webp" alt="" width="18" height="18" />Fire</span>',
    );
    // Sans icône (un perso, un lien) : le libellé, souligné comme sur le site.
    expect(noteHtml(env, [{ t: 'icon', label: 'Aer', color: 'text-buff', underline: true }])).toBe(
      '<span class="pv-seg text-buff"><span class="pv-u">Aer</span></span>',
    );

    const stun = noteHtml(env, [
      { t: 'effect', label: 'Stunned', color: 'text-debuff', icon: 'IG_Stun', isDebuff: true },
    ]);
    expect(stun).toContain('<span class="pv-seg text-debuff">');
    expect(stun).toContain(
      '<span class="pv-fx debuff"><img src="https://img.test/images/ui/effect/IG_Stun.webp" alt="" /></span>',
    );
    expect(
      noteHtml(env, [{ t: 'effect', label: 'Up', color: 'text-buff', icon: 'x', isDebuff: false }]),
    ).toContain('class="pv-fx buff"');

    const atk = noteHtml(env, [
      { t: 'stat', name: 'Attack', iconSrc: '/images/ui/stat/CM_Stat_Icon_ATK.webp' },
    ]);
    expect(atk).toContain('<span class="pv-seg text-stat">');
    expect(atk).toContain('src="https://img.test/images/ui/stat/CM_Stat_Icon_ATK.webp"');

    // Une classe de couleur qui n'en est pas une n'entre pas dans le HTML.
    expect(noteHtml(env, [{ t: 'icon', label: 'x', color: 'a" onclick="b' }])).toBe(
      '<span class="pv-seg">x</span>',
    );
  });

  it('un texte du jeu : `<color=#…>` en span coloré, `\\n` littéraux en sauts de ligne', () => {
    expect(gameText(env, 'a <color=#ff0000>x</color> b')).toBe(
      'a <span style="color:#ff0000">x</span> b',
    );
    expect(gameText(env, 'a\\nb\n<Color=#28d9ed>c\\nd</Color> <e>')).toBe(
      'a<br>b<br><span style="color:#28d9ed">c<br>d</span> &lt;e>',
    );
    // Une couleur qui n'est pas un `#hex` reste du texte.
    expect(gameText(env, '<color=red>x</color>')).toBe('&lt;color=red>x&lt;/color>');
  });

  it('une pièce : sa tuile de 44 px, son nom au grade, ses stats en puces', () => {
    const html = previewHtml(
      env,
      {
        ...empty,
        weapons: [
          {
            id: '4',
            name: 'Surefire Greatsword',
            icon: 'TI_Equipment_Weapon_06',
            grade: 'unique',
            star: 6,
            overlayIcon: 'TI_Icon_UO_Weapon_11',
            classType: 'striker',
            mainStat: 'ATK%/CHD/WG',
          },
        ],
      },
      labels,
      statIcons,
    );
    expect(html.startsWith('<div class="pv-row"><span class="pv-lbl">Weapon</span>')).toBe(true);
    expect(html).toContain('class="gv-tile" style="width:44px;height:44px"');
    expect(html).toContain('images/ui/bg/TI_Slot_Unique.webp');
    expect(html).toContain('images/ui/class/IG_Turn_Class_Striker.webp');
    expect(count(html, 'CM_icon_star_y')).toBe(6);
    expect(html).toContain(
      '<span class="pv-name" style="color:var(--item-legendary)">Surefire Greatsword</span>',
    );
    expect(count(html, 'class="pv-chip"')).toBe(3);
    expect(html).toContain(
      '<img src="https://img.test/images/ui/stat/CM_Stat_Icon_ATK.webp" alt="" width="14" height="14" />ATK%',
    );
    // Une stat sans icône (la WG) : son abréviation seule.
    expect(html).toContain('<span class="pv-chip">WG</span>');
    // Que la rangée des armes : rien d'autre n'a de contenu.
    expect(count(html, 'class="pv-row')).toBe(1);
  });

  it('une pièce `unresolved` : son id en rouge, sans tuile', () => {
    const html = previewHtml(
      env,
      {
        ...empty,
        amulets: [{ id: 'nope', name: 'nope', mainStat: 'PEN%', unresolved: true }],
        talismans: [{ id: '$zz', name: '', unresolved: true }],
      },
      labels,
      statIcons,
    );
    expect(html).toContain('<span class="pv-lbl">Accessory</span>');
    expect(html).toContain('<p class="pv-bad">nope</p>');
    expect(html).toContain('<p class="pv-bad">$zz</p>');
    expect(html).not.toContain('gv-tile');
    expect(html).not.toContain('pv-chip');
  });

  it('les combos en lignes, comme la fiche : un set partagé regroupe ses seconds', () => {
    const [pen, spd, atk, crit] = [
      set('p', 'Penetration Set', 2),
      set('s', 'Speed Set', 2),
      set('a', 'Attack Set', 2),
      set('c', 'Critical Strike Set', 4),
    ];
    // Le set le plus partagé passe en tête, même cité second ; un 4 pièces fait sa ligne.
    const lines = groupCombos([[spd, pen], [pen, atk], [crit], []]);
    expect(lines.map((l) => [l.head.id, l.tails.map((t) => t.id)])).toEqual([
      ['p', ['s', 'a']],
      ['c', []],
    ]);

    const html = previewHtml(
      env,
      {
        ...empty,
        sets: [[spd, pen], [pen, atk], [crit]],
        setEffects: [
          { id: 'p', name: 'Penetration Set', maxCount: 2, effect2: 'Pen +11%', effect4: 'no' },
          {
            id: 'c',
            name: 'Critical Strike Set',
            maxCount: 4,
            effect2: 'Crit +<color=#ff0000>x</color>',
            effect4: 'Crit DMG\\n+33%',
          },
        ],
      },
      labels,
      statIcons,
    );
    expect(html).toContain('<div class="pv-row pv-sets"><span class="pv-lbl">Armor Set</span>');
    expect(count(html, 'class="pv-combo"')).toBe(2);
    // Ligne 1 : helmet + armor du premier set, gloves + shoes UNE fois, sans
    // l'icône d'un set en overlay (deux seconds), leurs noms avec la leur.
    const [, first, second] = html.split('class="pv-combo"');
    expect(count(first, 'width:32px;height:32px')).toBe(4);
    expect(count(first, 'equipment/Enchant_p.webp')).toBe(2);
    expect(first).not.toContain('equipment/Enchant_s.webp');
    expect(first).toContain('images/ui/effect/Enchant_s.webp');
    expect(first).toContain('images/ui/effect/Enchant_a.webp');
    expect(first).not.toContain('4 pieces');
    // Ligne 2 : les quatre pièces, « · 4 pieces ».
    expect(count(second.split('pv-legend')[0], 'width:32px;height:32px')).toBe(4);
    expect(second).toContain('<span class="pv-dim">· 4 pieces</span>');
    // La légende : le 4 pièces seulement pour le set joué à 4 ; un bonus coloré.
    expect(html).toContain('<span class="pv-count text-buff">2 pieces</span> Pen +11%');
    expect(html).not.toContain('>no<');
    expect(html).toContain('Crit +<span style="color:#ff0000">x</span>');
    expect(html).toContain('<span class="pv-count text-buff">4 pieces</span> Crit DMG<br>+33%');
  });

  it('un build tout en 2 pièces : la légende sans le préfixe « 2 pieces »', () => {
    const html = previewHtml(
      env,
      {
        ...empty,
        sets: [[set('p', 'Penetration Set', 2), set('s', 'Speed Set', 2)]],
        setEffects: [{ id: 'p', name: 'Penetration Set', maxCount: 2, effect2: 'Pen +11%' }],
      },
      labels,
      statIcons,
    );
    expect(html).toContain('<p>Pen +11%</p>');
    expect(html).not.toContain('pv-count');
    // Un seul second set : ses tuiles gardent son icône, son nom n'en a pas.
    expect(count(html, 'equipment/Enchant_s.webp')).toBe(2);
    expect(html).not.toContain('images/ui/effect/');
  });

  // Ce qu'une barre montre : chaque stat, dans l'ordre, et ses segments pleins.
  const filled = (prio: string) =>
    substatBarHtml(env, prio, statIcons)
      .split('class="pv-bar-line"')
      .slice(1)
      .map((line) => [
        /<span class="pv-bar-stat">(?:<img[^>]*>)?([^<]*)<\/span>/.exec(line)?.[1],
        count(line, 'class="pv-bar-seg on"'),
      ]);

  it('la barre des substats : un segment de moins à chaque rang, `=` au même rang', () => {
    expect(filled('ATK>CHC=CHD>SPD')).toEqual([
      ['ATK', 6],
      ['CHC', 5],
      ['CHD', 5],
      ['SPD', 4],
    ]);
    // Les espaces autour des séparateurs ne comptent pas.
    expect(filled(' ATK > CHC = CHD ')).toEqual([
      ['ATK', 6],
      ['CHC', 5],
      ['CHD', 5],
    ]);
  });

  it('la barre des substats : un `>>` descend d’un rang de plus', () => {
    expect(filled('SPD>>HP')).toEqual([
      ['SPD', 6],
      ['HP', 4],
    ]);
  });

  it('la barre des substats : passé six rangs, il reste un segment plein', () => {
    expect(filled('A>B>C>D>E>F>G')).toEqual([
      ['A', 6],
      ['B', 5],
      ['C', 4],
      ['D', 3],
      ['E', 2],
      ['F', 1],
      ['G', 1],
    ]);
  });

  it('la barre des substats : par stat, son icône et son nom, puis six segments', () => {
    const html = substatBarHtml(env, 'ATK%>CHD=A&B', statIcons);
    const [on, off] = ['<span class="pv-bar-seg on"></span>', '<span class="pv-bar-seg"></span>'];
    expect(html).toBe(
      '<div class="pv-bar">' +
        '<div class="pv-bar-line"><span class="pv-bar-stat">' +
        '<img src="https://img.test/images/ui/stat/CM_Stat_Icon_ATK.webp" alt="" width="14" height="14" />ATK%</span>' +
        `<div class="pv-bar-segs">${on.repeat(6)}</div></div>` +
        '<div class="pv-bar-line"><span class="pv-bar-stat">' +
        '<img src="https://img.test/images/ui/stat/CM_Stat_Icon_CRITICAL_DMG.webp" alt="" width="14" height="14" />CHD</span>' +
        `<div class="pv-bar-segs">${on.repeat(5)}${off}</div></div>` +
        // Une stat sans icône : son nom seul, échappé.
        `<div class="pv-bar-line"><span class="pv-bar-stat">A&amp;B</span><div class="pv-bar-segs">${on.repeat(5)}${off}</div></div>` +
        '</div>',
    );
    expect(count(html, 'class="pv-bar-seg on"')).toBe(16);
    expect(count(html, '<span class="pv-bar-seg')).toBe(18);
  });

  it('les substats en barre, la note en segments ; un build vide ne rend rien', () => {
    const html = previewHtml(
      env,
      { ...empty, substats: 'ATK>CHC', noteSegments: [{ t: 'unknown', s: '{B/nope}' }] },
      labels,
      statIcons,
    );
    expect(html).toBe(
      `<div class="pv-row"><span class="pv-lbl">Substat Priority</span><div class="pv-cell">${substatBarHtml(env, 'ATK>CHC', statIcons)}</div></div>` +
        '<div class="pv-row"><span class="pv-lbl">Notes</span><div class="pv-cell"><p class="pv-note"><span class="pv-unknown">{B/nope}</span></p></div></div>',
    );
    // La barre, plus la chaîne : deux lignes, onze segments pleins.
    expect(html).not.toContain('pv-sub');
    expect(count(html, 'class="pv-bar-line"')).toBe(2);
    expect(count(html, 'class="pv-bar-seg on"')).toBe(11);
    expect(previewHtml(env, empty, labels, statIcons)).toBe('');
  });
});

describe('composeSetCombos — le mix du picker de sets', () => {
  it('principal seul : un combo, ses 4 pièces', () => {
    expect(composeSetCombos('speed', [])).toEqual({
      combos: [[{ set: 'speed', count: 4 }]],
      error: '',
    });
  });

  it('principal et deux secondaires : deux combos 2 + 2, dans l’ordre des secondaires', () => {
    expect(composeSetCombos('speed', ['pen', 'atk'])).toEqual({
      combos: [
        [
          { set: 'speed', count: 2 },
          { set: 'pen', count: 2 },
        ],
        [
          { set: 'speed', count: 2 },
          { set: 'atk', count: 2 },
        ],
      ],
      error: '',
    });
    // Un secondaire cité deux fois ne fait pas deux combos.
    expect(composeSetCombos('speed', ['pen', 'pen']).combos).toHaveLength(1);
  });

  it('refuse un secondaire qui est le principal, et un mix sans principal', () => {
    const twice = composeSetCombos('speed', ['pen', 'speed']);
    expect(twice.combos).toEqual([]);
    expect(twice.error).toContain('principal');
    expect(composeSetCombos('', ['pen'])).toEqual({ combos: [], error: 'pas de set principal' });
  });

  it('se relit : les combos composés redonnent le principal et les secondaires', () => {
    for (const [main, secondaries] of [
      ['speed', []],
      ['speed', ['pen']],
      ['speed', ['pen', 'atk', 'crit']],
    ] as const)
      expect(splitSetCombos(composeSetCombos(main, secondaries).combos)).toEqual({
        main,
        secondaries: [...secondaries],
      });
  });

  it('ne lit pas comme un mix ce qui n’en est pas un', () => {
    const none = { main: '', secondaries: [] };
    const two = (a: string, b: string) => [
      { set: a, count: 2 },
      { set: b, count: 2 },
    ];
    expect(splitSetCombos([])).toEqual(none);
    expect(splitSetCombos([[]])).toEqual(none);
    expect(splitSetCombos([[{ set: 'speed', count: 2 }]])).toEqual(none);
    // Deux combos sans set commun, puis un 4 pièces à côté d'un 2 + 2.
    expect(splitSetCombos([two('speed', 'pen'), two('atk', 'crit')])).toEqual(none);
    expect(splitSetCombos([[{ set: 'speed', count: 4 }], two('speed', 'pen')])).toEqual(none);
    // Le set commun n'est pas forcément cité en premier.
    expect(splitSetCombos([two('pen', 'speed'), two('speed', 'atk')])).toEqual({
      main: 'speed',
      secondaries: ['pen', 'atk'],
    });
  });

  it('un preset de sets du fichier, relu puis recomposé, est replié sous un preset', () => {
    const presets = loadGearPresets();
    const key = (pieces: { set: string; count: number }[]) =>
      pieces
        .map((p) => `${p.set}:${p.count}`)
        .sort()
        .join('|');
    const mixes = Object.entries(presets.sets)
      .map(([slug, pieces]) => ({ slug, pieces, ...splitSetCombos([pieces]) }))
      .filter((m) => m.main);
    expect(mixes.length).toBeGreaterThan(0);

    for (const { slug, pieces, main, secondaries } of mixes) {
      const { combos } = composeSetCombos(main, secondaries);
      expect(combos.map(key), slug).toEqual([key(pieces)]);
      // Le store le range sous un preset de même contenu (pas forcément ce slug :
      // deux presets peuvent se valoir).
      const back = collapseBuild({ name: slug, sets: [{ pieces: combos[0] }] }, presets);
      expect(key(presets.sets[back.sets?.[0].preset ?? ''] ?? []), slug).toBe(key(pieces));
    }
  });
});

describe('saveGearReco — écritures injectées', () => {
  const state = gearRecoState();
  const who = characterRoster().roster[0];
  // Un build valide tiré des listes réelles, pas d'un build du fichier.
  const valid: GearBuild = {
    name: 'Test',
    weapons: [{ id: state.options.weapons[0].id }],
    talismans: [`$${Object.keys(state.presets.talismans)[0]}`],
    sets: [{ preset: Object.keys(state.presets.sets)[0] }],
    substats: 'ATK>SPD',
    note: { en: 'Plain note.' },
  };

  /** Les deux écritures, factices : elles notent leurs appels et rien d'autre. */
  function deps(over: { errors?: string[]; git?: Outcome } = {}) {
    const calls = {
      upsert: [] as [string, GearBuild[]][],
      git: [] as [string[], string][],
    };
    const fake: GearRecoDeps = {
      upsert: async (id, builds) => {
        calls.upsert.push([id, builds]);
        return over.errors ?? [];
      },
      commitPaths: (paths, message) => {
        calls.git.push([paths, message]);
        return over.git ?? { ok: true, log: ['git : fait'] };
      },
    };
    return { calls, fake };
  }

  it('succès : UN commit, le seul fichier des recos, le message au nom du perso', async () => {
    const { calls, fake } = deps();
    const out = await saveGearReco(who.id, [valid], fake);

    expect(out).toMatchObject({ ok: true, issues: [], written: true });
    expect(calls.upsert).toEqual([[who.id, [valid]]]);
    expect(calls.git).toEqual([[['data/curated/gear-reco.json'], `chore(gear-reco): ${who.name}`]]);
    expect(out.log.at(-1)).toBe('git : fait');
  });

  it('erreurs de validation du store : AUCUN commit, et l’erreur est située', async () => {
    const { calls, fake } = deps({
      errors: [`gearReco[${who.id}][0].weapons[0].id — attendu string, reçu number`],
    });
    const out = await saveGearReco(who.id, [valid], fake);

    expect(out.ok).toBe(false);
    expect(out.written).toBe(false);
    expect(calls.git).toEqual([]);
    expect(out.issues).toEqual([
      { build: 0, slot: 'weapons', index: 0, message: 'attendu string, reçu number' },
    ]);
    expect(out.log).toEqual(['REFUSÉ — build 1 « Test » · armes 1 : attendu string, reçu number']);
  });

  it('forme invalide : refusée avant le store', async () => {
    const { calls, fake } = deps();
    const out = await saveGearReco(who.id, [{ name: 3 } as unknown as GearBuild], fake);

    expect(out.ok).toBe(false);
    expect(out.issues).toMatchObject([{ build: 0, slot: 'name' }]);
    expect(calls).toEqual({ upsert: [], git: [] });
  });

  it('tag inconnu dans une note : refus AVANT écriture', async () => {
    const { calls, fake } = deps();
    const out = await saveGearReco(
      who.id,
      [valid, { ...valid, name: 'PvP', note: { en: 'Use {I-T/No Such Charm}.' } }],
      fake,
    );

    expect(out.ok).toBe(false);
    expect(calls).toEqual({ upsert: [], git: [] });
    expect(out.issues).toMatchObject([{ build: 1, slot: 'note' }]);
    expect(out.log[0]).toContain('build 2 « PvP » · note');
    expect(out.log[0]).toContain('{I-T/No Such Charm}');
  });

  it('pièce inconnue : refus avant écriture', async () => {
    const { calls, fake } = deps();
    const out = await saveGearReco(who.id, [{ ...valid, weapons: [{ id: '' }] }], fake);

    expect(out.ok).toBe(false);
    expect(calls).toEqual({ upsert: [], git: [] });
  });

  it('perso inconnu : rien n’est écrit', async () => {
    const { calls, fake } = deps();
    const out = await saveGearReco('ghost', [valid], fake);

    expect(out.ok).toBe(false);
    expect(calls).toEqual({ upsert: [], git: [] });
  });

  it('liste vide : le store reçoit `[]` (il retire la clé), puis le commit', async () => {
    const { calls, fake } = deps();
    const out = await saveGearReco(who.id, [], fake);

    expect(out.ok).toBe(true);
    expect(calls.upsert).toEqual([[who.id, []]]);
    expect(calls.git).toHaveLength(1);
    expect(out.log[0]).toBe(`gear-reco : ${who.name} retiré du fichier.`);
  });

  it('commit refusé : `written` dit que le disque porte déjà les builds', async () => {
    const { fake } = deps({ git: { ok: false, log: ['git commit a échoué'] } });
    const out = await saveGearReco(who.id, [valid], fake);

    expect(out).toMatchObject({ ok: false, written: true, issues: [] });
    expect(out.log.at(-1)).toBe('git commit a échoué');
  });
});

describe('translateNotes — traducteur injecté', () => {
  /** Un faux moteur : chaque texte rendu tel quel derrière le code de sa langue. */
  function deps(over: Partial<TranslateDeps> = {}) {
    const calls: [string[], string[]][] = [];
    const fake: TranslateDeps = {
      autoTranslate: async (texts, targets) => {
        calls.push([texts, targets]);
        return {
          results: texts.map((text) =>
            Object.fromEntries(targets.map((lang) => [lang, `${lang}: ${text}`])),
          ),
          provider: 'deepl',
        };
      },
      hasKey: () => true,
      ...over,
    };
    return { calls, fake };
  }

  it('rend les cinq autres langues du site et relaie le moteur', async () => {
    const { calls, fake } = deps();
    const out = await translateNotes(['Plain note.'], fake);

    expect(calls).toEqual([[['Plain note.'], ['jp', 'kr', 'zh', 'fr', 'es']]]);
    expect(out).toEqual({
      results: [
        {
          jp: 'jp: Plain note.',
          kr: 'kr: Plain note.',
          zh: 'zh: Plain note.',
          fr: 'fr: Plain note.',
          es: 'es: Plain note.',
        },
      ],
      provider: 'deepl',
    });
  });

  it('relaie Haiku quand c’est lui qui a servi', async () => {
    const { fake } = deps({
      autoTranslate: async (texts) => ({ results: texts.map(() => ({})), provider: 'haiku' }),
    });
    expect(await translateNotes(['Plain note.'], fake)).toMatchObject({ provider: 'haiku' });
  });

  it('n’envoie pas les textes vides, et garde les résultats alignés sur l’envoi', async () => {
    const { calls, fake } = deps();
    const out = await translateNotes(['First.', '', '  \n', 'Last.'], fake);

    expect(calls).toHaveLength(1);
    expect(calls[0][0]).toEqual(['First.', 'Last.']);
    expect(out).toMatchObject({
      results: [{ fr: 'fr: First.' }, {}, {}, { fr: 'fr: Last.' }],
    });
  });

  it('rien que du vide : aucun appel', async () => {
    const { calls, fake } = deps();
    expect(await translateNotes(['', ' '], fake)).toEqual({ results: [{}, {}], provider: 'none' });
    expect(calls).toEqual([]);
  });

  it('pas de clé : l’erreur est rendue SANS appeler le moteur', async () => {
    const { calls, fake } = deps({ hasKey: () => false });
    const out = await translateNotes(['Plain note.'], fake);

    expect(out).toEqual({ error: NO_TRANSLATE_KEY });
    expect(NO_TRANSLATE_KEY).toContain('DEEPL_API_KEY');
    expect(NO_TRANSLATE_KEY).toContain('ANTHROPIC_API_KEY');
    expect(calls).toEqual([]);
  });

  it('ne touche pas aux tags inline : ce que le moteur garde revient intact', async () => {
    const { calls, fake } = deps();
    const out = await translateNotes(['Use {I-T/ATK} here.'], fake);

    expect(calls[0][0]).toEqual(['Use {I-T/ATK} here.']);
    expect(out).toMatchObject({ results: [{ fr: 'fr: Use {I-T/ATK} here.' }] });
  });

  it('un moteur qui ne traduit rien (garde IS_DEV) est une erreur, pas un silence', async () => {
    const { fake } = deps({
      autoTranslate: async (texts) => ({ results: texts.map(() => ({})), provider: 'none' }),
    });
    const out = await translateNotes(['Plain note.'], fake);

    expect(out).toHaveProperty('error');
    expect(out).not.toHaveProperty('results');
  });

  it('un refus du moteur est rendu, pas levé', async () => {
    const { fake } = deps({
      autoTranslate: async () => {
        throw new Error('DeepL 403 : forbidden');
      },
    });
    expect(await translateNotes(['Plain note.'], fake)).toEqual({ error: 'DeepL 403 : forbidden' });
  });
});

// ---------------------------------------------------------------- comics -----

const page = (name: string): ComicUpload => ({
  name,
  data: Buffer.from(name).toString('base64'),
});

/** Pool Party Regina : un nom complet qui déborde en 80 px dans cinq langues. */
const REGINA = '2000085';

/** Le disque de l'onglet « Noms », factice : ce que rendraient les deux curés. */
const namesDisk = (
  short: Record<string, LocalizedText> = {},
  aliases: Record<string, string[]> = {},
): NamesDisk => ({ loadShortNames: () => short, loadSearchAliases: () => aliases });

describe('namesState — le roster et le verdict « déborde » du site', () => {
  const regina = (disk: NamesDisk) => {
    const row = namesState(disk).rows.find((r) => r.id === REGINA);
    if (!row) throw new Error(`${REGINA} absent du roster`);
    return row;
  };

  it('rend tout le roster, les six langues et la largeur du libellé', () => {
    const state = namesState(namesDisk());
    expect(state.rows.map((r) => r.id).sort()).toEqual(
      getCharacterListItems()
        .map((c) => c.id)
        .sort(),
    );
    expect(state.langs).toEqual(LANGS);
    expect(state.width).toBe(80);
    expect(Object.keys(regina(namesDisk()).full)).toEqual(LANGS);
  });

  it('SANS nom court : le nom complet déborde, le perso est « à traiter »', () => {
    const row = regina(namesDisk());
    expect(row.fits.full.en).toBe(false);
    // `null`, pas `false` : il n'y a pas de nom court à juger.
    expect(row.fits.short).toEqual(Object.fromEntries(LANGS.map((l) => [l, null])));
    expect(row.short).toEqual({});
    expect(row.todo).toBe(true);
  });

  it('AVEC « S.Regina » : il ne l’est plus, et `fr` sans valeur replie sur `en`', () => {
    const row = regina(namesDisk({ [REGINA]: { en: 'S.Regina' } }));
    expect(row.short).toEqual({ en: 'S.Regina' });
    expect(row.fits.full.fr).toBe(false);
    expect(row.fits.short).toEqual(Object.fromEntries(LANGS.map((l) => [l, true])));
    expect(row.todo).toBe(false);
  });

  it('un nom court anglais trop long déborde partout où la langue n’a pas le sien', () => {
    const row = regina(
      namesDisk({ [REGINA]: { en: 'Poolside Trickster Regina', jp: 'レジーナ' } }),
    );
    expect(row.fits.short.en).toBe(false);
    expect(row.fits.short.fr).toBe(false);
    expect(row.fits.short.jp).toBe(true);
    // Le nom complet déborde en anglais et son nom court aussi : toujours à traiter.
    expect(row.todo).toBe(true);
  });

  it('`base` est ce qui se cherche déjà, SANS les alias', () => {
    const row = regina(namesDisk({}, { [REGINA]: ['Sregina', 'pool regina'] }));
    expect(row.aliases).toEqual(['Sregina', 'pool regina']);
    expect(row.base).toContain('regina');
    expect(row.base).toContain(REGINA);
    expect(row.base).not.toContain('sregina');
    expect(row.base).toEqual(regina(namesDisk()).base);
  });
});

describe('fitNames — le verdict d’une saisie', () => {
  it('rend un booléen par texte, dans l’ordre', () => {
    const full = namesState(namesDisk()).rows.find((r) => r.id === REGINA)?.full.en;
    expect(fitNames(['S.Regina', full, '', 'レジーナ'])).toEqual({
      fits: [true, false, true, true],
    });
  });

  it('ne lève pas sur autre chose qu’une liste de chaînes', () => {
    expect(fitNames(undefined)).toEqual({ fits: [] });
    expect(fitNames('S.Regina')).toEqual({ fits: [] });
    expect(fitNames([3, null])).toEqual({ fits: [true, true] });
  });
});

describe('saveNames — lectures et écritures injectées', () => {
  // Deux persos réels du roster : le journal et le commit portent leur nom.
  const [one, two] = namesState(namesDisk()).rows;

  /** Le disque et les trois écritures, factices : elles notent leurs appels. */
  function deps(
    over: {
      short?: Record<string, LocalizedText>;
      aliases?: Record<string, string[]>;
      git?: Outcome;
    } = {},
  ) {
    const calls = {
      short: [] as [string, LocalizedText][],
      aliases: [] as [string, string[]][],
      git: [] as [string[], string][],
    };
    const fake: NamesDeps = {
      ...namesDisk(over.short, over.aliases),
      upsertShortName: async (id, name) => {
        calls.short.push([id, name]);
        return [];
      },
      upsertSearchAliases: async (id, aliases) => {
        calls.aliases.push([id, aliases]);
        return [];
      },
      commitPaths: (paths, message) => {
        calls.git.push([paths, message]);
        return over.git ?? { ok: true, log: ['git : fait'] };
      },
    };
    return { calls, fake };
  }

  const change = (id: string, over: Partial<Omit<NameChange, 'id'>> = {}): NameChange => ({
    id,
    short: {},
    aliases: [],
    was: { short: {}, aliases: [] },
    ...over,
  });

  it('un perso, nom court ET alias : UN commit, les deux fichiers, le message à son nom', async () => {
    const { calls, fake } = deps();
    const out = await saveNames(
      [change(one.id, { short: { en: 'Short' }, aliases: ['alt', 'other'] })],
      fake,
    );

    expect(out).toMatchObject({ ok: true, refused: [], saved: [one.id] });
    expect(calls.short).toEqual([[one.id, { en: 'Short' }]]);
    expect(calls.aliases).toEqual([[one.id, ['alt', 'other']]]);
    expect(calls.git).toEqual([
      [
        ['data/curated/short-names.json', 'data/curated/search-aliases.json'],
        `chore(names): ${one.name}`,
      ],
    ]);
    expect(out.log).toEqual([
      `${one.name} : nom court en « Short » ; alias alt, other.`,
      'git : fait',
    ]);
  });

  it('un seul des deux a changé : son store seul, son fichier seul', async () => {
    const disk = { short: { [one.id]: { en: 'Short' } }, aliases: { [one.id]: ['alt'] } };
    const was = { short: { en: 'Short' }, aliases: ['alt'] };

    const short = deps(disk);
    await saveNames(
      [change(one.id, { short: { en: 'Shorter' }, aliases: ['alt'], was })],
      short.fake,
    );
    expect(short.calls.short).toEqual([[one.id, { en: 'Shorter' }]]);
    expect(short.calls.aliases).toEqual([]);
    expect(short.calls.git).toEqual([
      [['data/curated/short-names.json'], `chore(names): ${one.name}`],
    ]);

    const aliases = deps(disk);
    await saveNames(
      [change(one.id, { short: { en: 'Short' }, aliases: ['alt', 'new'], was })],
      aliases.fake,
    );
    expect(aliases.calls.short).toEqual([]);
    expect(aliases.calls.aliases).toEqual([[one.id, ['alt', 'new']]]);
    expect(aliases.calls.git).toEqual([
      [['data/curated/search-aliases.json'], `chore(names): ${one.name}`],
    ]);
  });

  it('deux persos : UN commit, « 2 persos »', async () => {
    const { calls, fake } = deps();
    const out = await saveNames(
      [change(one.id, { short: { en: 'A' } }), change(two.id, { aliases: ['b'] })],
      fake,
    );

    expect(out).toMatchObject({ ok: true, saved: [one.id, two.id] });
    expect(calls.git).toEqual([
      [
        ['data/curated/short-names.json', 'data/curated/search-aliases.json'],
        'chore(names): 2 persos',
      ],
    ]);
  });

  it('disque changé depuis le chargement : refus situé, sans écrire, les autres passent', async () => {
    // Le nom court de `one` a été posé d'ailleurs : la page le croyait vide.
    const { calls, fake } = deps({ short: { [one.id]: { en: 'Elsewhere' } } });
    const out = await saveNames(
      [change(one.id, { short: { en: 'Mine' } }), change(two.id, { short: { en: 'B' } })],
      fake,
    );

    expect(out.ok).toBe(false);
    expect(out.refused).toEqual([one.id]);
    expect(out.saved).toEqual([two.id]);
    expect(out.log[0]).toBe(`REFUSÉ — ${one.name} : le disque a changé depuis le chargement.`);
    expect(calls.short).toEqual([[two.id, { en: 'B' }]]);
    // Le reste du lot est committé, au nom du seul perso écrit.
    expect(calls.git).toEqual([[['data/curated/short-names.json'], `chore(names): ${two.name}`]]);
  });

  it('des alias changés d’ailleurs refusent aussi un perso dont seul le nom court bouge', async () => {
    const { calls, fake } = deps({ aliases: { [one.id]: ['elsewhere'] } });
    const out = await saveNames([change(one.id, { short: { en: 'Mine' } })], fake);

    expect(out).toMatchObject({ ok: false, refused: [one.id], saved: [] });
    expect(out.log.at(-1)).toBe('Rien à enregistrer.');
    expect(calls).toEqual({ short: [], aliases: [], git: [] });
  });

  it('liste d’alias vide : le store reçoit `[]` (il retire la clé)', async () => {
    const { calls, fake } = deps({ aliases: { [one.id]: ['alt'] } });
    const out = await saveNames(
      [change(one.id, { aliases: [], was: { short: {}, aliases: ['alt'] } })],
      fake,
    );

    expect(out.ok).toBe(true);
    expect(calls.aliases).toEqual([[one.id, []]]);
    expect(out.log[0]).toBe(`${one.name} : alias retirés.`);
  });

  it('nom court vidé : le store reçoit `{}` (il retire la clé)', async () => {
    const { calls, fake } = deps({ short: { [one.id]: { en: 'Short' } } });
    const out = await saveNames(
      [change(one.id, { short: {}, was: { short: { en: 'Short' }, aliases: [] } })],
      fake,
    );

    expect(out.ok).toBe(true);
    expect(calls.short).toEqual([[one.id, {}]]);
    expect(out.log[0]).toBe(`${one.name} : nom court retiré.`);
  });

  it('rien ne change : ni écriture ni commit', async () => {
    const { calls, fake } = deps({ short: { [one.id]: { en: 'Short' } } });
    const out = await saveNames(
      [change(one.id, { short: { en: 'Short' }, was: { short: { en: 'Short' }, aliases: [] } })],
      fake,
    );

    expect(out).toEqual({
      ok: true,
      log: ['Rien à enregistrer : le disque porte déjà ces valeurs.'],
      refused: [],
      saved: [],
    });
    expect(calls).toEqual({ short: [], aliases: [], git: [] });
  });

  it('perso inconnu, lot vide : rien n’est écrit', async () => {
    const ghost = deps();
    const out = await saveNames([change('ghost', { short: { en: 'Boo' } })], ghost.fake);
    expect(out).toMatchObject({ ok: false, refused: ['ghost'], saved: [] });
    expect(ghost.calls).toEqual({ short: [], aliases: [], git: [] });

    const empty = deps();
    expect((await saveNames([], empty.fake)).ok).toBe(false);
    expect(empty.calls).toEqual({ short: [], aliases: [], git: [] });
  });

  it('commit refusé : le perso est écrit, l’échec est dit', async () => {
    const { fake } = deps({ git: { ok: false, log: ['git commit a échoué'] } });
    const out = await saveNames([change(one.id, { short: { en: 'A' } })], fake);

    expect(out).toMatchObject({ ok: false, refused: [], saved: [one.id] });
    expect(out.log.at(-1)).toBe('git commit a échoué');
  });
});

describe('diffBanners — ce que la table du jeu sait de plus que banner.json', () => {
  const TODAY = '2026-10-08';
  const banner = (id: string, start: string, end: string, name = id): Banner => ({
    id,
    name,
    start,
    end,
  });
  const win = (
    characterId: string,
    start: string,
    end: string,
    type = 'pickup',
  ): RecruitWindow => ({ characterId, type, start, end });

  it('`missing` : une fenêtre du jeu dont (perso, début) n’est dans aucune bannière', () => {
    const game = [win('1', '2026-09-22', '2026-10-20'), win('2', '2026-10-20', '2026-11-17')];
    expect(diffBanners([banner('1', '2026-09-22', '2026-10-20')], game, TODAY)).toEqual({
      missing: [win('2', '2026-10-20', '2026-11-17')],
      drift: [],
    });
  });

  it('pas `missing` quand (perso, début) existe — même perso, autre début : un rerun, proposé', () => {
    const curated = [banner('1', '2026-09-22', '2026-10-20')];
    expect(diffBanners(curated, [win('1', '2026-09-22', '2026-10-20')], TODAY).missing).toEqual([]);
    expect(
      diffBanners(curated, [win('1', '2026-10-01', '2026-10-29')], TODAY).missing.map(
        (w) => w.start,
      ),
    ).toEqual(['2026-10-01']);
  });

  it('`drift` : même (perso, début), fins différentes — le nom est celui du fichier', () => {
    const curated = [
      banner('2000122', '2026-09-08', '2026-10-05', 'Titia'),
      banner('2000118', '2026-07-28', '2026-09-07', 'Lambda'),
      banner('2700019', '2026-09-22', '2026-10-20', 'Resonance Rin'),
    ];
    const game = [
      win('2000118', '2026-07-28', '2026-09-08'),
      win('2000122', '2026-09-08', '2026-10-06'),
      win('2700019', '2026-09-22', '2026-10-20'),
    ];
    expect(diffBanners(curated, game, TODAY)).toEqual({
      missing: [],
      drift: [
        {
          id: '2000122',
          name: 'Titia',
          start: '2026-09-08',
          curated: '2026-10-05',
          game: '2026-10-06',
          type: 'pickup',
        },
        {
          id: '2000118',
          name: 'Lambda',
          start: '2026-07-28',
          curated: '2026-09-07',
          game: '2026-09-08',
          type: 'pickup',
        },
      ],
    });
  });

  it('une bannière curée absente de la table n’est pas un écart : les tables purgent', () => {
    expect(diffBanners([banner('9', '2024-01-02', '2024-01-30')], [], TODAY)).toEqual({
      missing: [],
      drift: [],
    });
  });

  it(`le seuil : finie depuis plus de ${BANNER_LOOKBACK_DAYS} jours, une fenêtre n’est plus proposée`, () => {
    expect(BANNER_LOOKBACK_DAYS).toBe(60);
    // 2026-10-08 − 60 jours = 2026-08-09.
    const game = [
      win('old', '2026-07-12', '2026-08-08'),
      win('edge', '2026-07-13', '2026-08-09'),
      win('live', '2026-09-22', '2026-10-20'),
      win('soon', '2026-10-20', '2026-11-17'),
    ];
    // Récentes d'abord, comme la liste curée.
    expect(diffBanners([], game, TODAY).missing.map((w) => w.characterId)).toEqual([
      'soon',
      'live',
      'edge',
    ]);
    // Le seuil ne vaut que pour l'insertion : une dérive ancienne reste dite.
    expect(
      diffBanners([banner('old', '2026-07-12', '2026-08-07')], game, TODAY).drift.map((d) => d.id),
    ).toEqual(['old']);
  });

  it('une fenêtre sans dates lisibles ne se compare pas : ni proposée, ni une dérive', () => {
    const game = [
      // DEMIURGE : ni début ni fin. SEASONAL_SELECTION : pas de fin.
      win('1', '0', '0', 'demiurge'),
      win('2', '2026-02-24', '0', 'seasonal_selection'),
      win('3', '2026-09-30', '0', 'seasonal_selection'),
    ];
    expect(diffBanners([banner('2', '2026-02-24', '2026-03-26')], game, TODAY)).toEqual({
      missing: [],
      drift: [],
    });
  });

  it('deux groupes pour le même (perso, début) : une proposition, la fin la plus tardive', () => {
    const game = [win('1', '2026-09-22', '2026-10-06'), win('1', '2026-09-22', '2026-10-20')];
    expect(diffBanners([], game, TODAY).missing).toEqual([win('1', '2026-09-22', '2026-10-20')]);
    // Une fin qui est celle d'UN des deux groupes n'est pas une dérive.
    expect(diffBanners([banner('1', '2026-09-22', '2026-10-06')], game, TODAY).drift).toEqual([]);
    expect(
      diffBanners([banner('1', '2026-09-22', '2026-10-01')], game, TODAY).drift.map((d) => d.game),
    ).toEqual(['2026-10-20']);
  });
});

describe('bannersState — le fichier curé, le roster, la table du jeu injectée', () => {
  // Deux persos réels : le roster du site dit qui est « connu ».
  const [one, two] = getCharacterListItems();
  const CURATED: Banner[] = [
    { id: one.id, name: 'Curated name', start: '2026-09-08', end: '2026-10-05' },
  ];
  const group = (PickupID: string, StartDate: string, EndDate: string, RecruitType = 'PICKUP') => ({
    ID: `${RecruitType}-${PickupID}`,
    RecruitType,
    PickupID,
    StartDate,
    EndDate,
  });
  const disk = (recruitGroups: BannersDisk['recruitGroups']): BannersDisk => ({
    loadBanners: () => CURATED,
    recruitGroups,
    today: () => '2026-10-08',
  });

  it('rend le fichier tel quel, le jour, le roster par nom, et le diff contre la table', () => {
    const state = bannersState(
      disk(() => [
        group(one.id, '2026-09-08  00:00:00', '2026-10-06  00:00:00'),
        group(two.id, '2026-10-20  00:00:00', '2026-11-17  00:00:00', 'SEASONAL'),
        group('2999999', '2026-10-20  00:00:00', '2026-11-17  00:00:00'),
        { ID: '1', RecruitType: 'CUSTOM', StartDate: '2023-05-23', EndDate: '0' },
      ]),
    );
    expect(state.banners).toBe(CURATED);
    expect(state.today).toBe('2026-10-08');
    expect(state.roster).toHaveLength(getCharacterListItems().length);
    expect(state.roster.map((c) => c.name)).toEqual(
      state.roster.map((c) => c.name).sort((a, b) => a.localeCompare(b)),
    );
    expect(Object.keys(state.roster[0])).toEqual(['id', 'name']);
    expect(state).not.toHaveProperty('gameError');

    // Trois fenêtres (le CUSTOM n'a pas de vedette), l'inconnu du roster marqué.
    expect(state.game?.map((w) => [w.characterId, w.type, w.unknown ?? false])).toEqual([
      [one.id, 'pickup', false],
      [two.id, 'seasonal', false],
      ['2999999', 'pickup', true],
    ]);
    expect(state.missing.map((w) => w.characterId)).toEqual([two.id, '2999999']);
    expect(state.drift).toEqual([
      {
        id: one.id,
        name: 'Curated name',
        start: '2026-09-08',
        curated: '2026-10-05',
        game: '2026-10-06',
        type: 'pickup',
      },
    ]);
  });

  it('`game: null` et `gameError` quand la table manque — jamais une erreur', () => {
    const state = bannersState(disk(() => null));
    expect(state.game).toBeNull();
    expect(state.gameError).toBe(NO_GAME_DATA);
    expect(state.gameError).toBe('Pas de données du jeu : lancer un patch (pull) d’abord.');
    expect(state.missing).toEqual([]);
    expect(state.drift).toEqual([]);
    // La liste curée s'édite quand même.
    expect(state.banners).toBe(CURATED);
    expect(state.roster.length).toBeGreaterThan(0);
  });

  it('une table illisible est dite, pas levée', () => {
    const state = bannersState(
      disk(() => {
        throw new Error('Unexpected end of JSON input');
      }),
    );
    expect(state.game).toBeNull();
    expect(state.gameError).toBe('RecruitGroupTemplet illisible : Unexpected end of JSON input');
  });
});

describe('dashboardState — l’accueil de quick, toutes lectures injectées', () => {
  afterEach(() => vi.unstubAllEnvs());

  const TODAY = '2026-10-08';
  /** Un poste sans rien à signaler : chaque test n'y change que sa lecture. */
  const disk = (over: Partial<DashboardDisk> = {}): DashboardDisk => ({
    inbox: () => [],
    adminBase: () => 'https://outerpedia.local',
    quickTabs: {},
    deadTagSources: () => [],
    gitState: () => ({ branch: 'main', ahead: 0, behind: 0 }),
    lastCommit: () => 'f1b28e5\tfeat(quick): tableau de bord\til y a 3 heures',
    porcelain: () => '',
    siteVersion: () => '1.11.404',
    clientVersion: () => '1.11.404',
    mtime: () => null,
    sameBytes: () => true,
    readJson: () => null,
    banners: () => ({ banners: [], missing: [], drift: [] }),
    coupons: async () => ({ list: [] }),
    today: () => TODAY,
    ...over,
  });

  const item = (over: Partial<InboxItem> = {}): InboxItem => ({
    key: 'extract:character',
    label: 'Character',
    detail: '1 new',
    href: '/admin/extractor/characters',
    tone: 'warn',
    rank: 2,
    count: 1,
    ...over,
  });

  it('un poste sans rien à signaler : cinq blocs servis, aucune erreur, le jour UTC', async () => {
    expect(await dashboardState(disk())).toEqual({
      today: TODAY,
      inbox: [],
      git: {
        branch: 'main',
        ahead: 0,
        behind: 0,
        last: { hash: 'f1b28e5', subject: 'feat(quick): tableau de bord', when: 'il y a 3 heures' },
        dirty: 0,
      },
      game: { site: '1.11.404', version: '1.11.404', client: 'same', proposal: false },
      banners: { active: [], upcoming: [], missing: 0, drift: 0 },
      coupons: { total: 0, active: 0, within: COUPON_EXPIRY_DAYS, expiring: [] },
      errors: {},
    });
  });

  it('inbox : la liste de l’admin telle quelle, dans son ordre, chaque `href` en adresse complète', async () => {
    const tags = item({
      key: 'tags',
      label: 'Dead inline tags',
      detail: '2 tag(s) resolve to nothing',
      href: '/admin/tags',
      tone: 'danger',
      rank: 0,
      count: 2,
    });
    const { inbox } = await dashboardState(
      // Une base écrite avec sa barre finale ne la double pas.
      disk({ inbox: () => [tags, item()], adminBase: () => 'http://localhost:3000/' }),
    );
    expect(inbox).toEqual([
      { ...tags, href: 'http://localhost:3000/admin/tags', inQuick: false, tab: null },
      {
        ...item(),
        href: 'http://localhost:3000/admin/extractor/characters',
        inQuick: false,
        tab: null,
      },
    ]);
  });

  it('inbox : `inQuick` et son onglet quand quick a déjà la page', async () => {
    const { inbox } = await dashboardState(
      disk({
        inbox: async () => [item(), item({ key: 'tags', href: '/admin/tags' })],
        quickTabs: { '/admin/tags': 'tags' },
      }),
    );
    expect(inbox?.map((i) => [i.key, i.inQuick, i.tab])).toEqual([
      ['extract:character', false, null],
      ['tags', true, 'tags'],
    ]);
    // La table du jour : l'éditeur des effets, celui des persos (la « Fiche
    // perso », Gear reco compris), celui des EE et les outils Pro / Con et
    // Synergy, trois de ses sous-onglets, celui des monstres et celui des
    // items. Les lots suivants la rempliront.
    expect(ADMIN_TO_QUICK).toEqual({
      '/admin/editor/characters': 'character',
      '/admin/editor/ee': 'character',
      '/admin/editor/effects': 'effects',
      '/admin/editor/items': 'items',
      '/admin/editor/monsters': 'monsters',
      '/admin/tools/pros-cons': 'character',
      '/admin/tools/synergies': 'character',
    });
    expect(DASHBOARD_DISK.quickTabs).toBe(ADMIN_TO_QUICK);
  });

  it('inbox : les tags morts d’UN perso renvoient à sa fiche dans quick, les autres à l’admin', async () => {
    const tags = item({ key: 'tags', href: '/admin/tags', tone: 'danger', rank: 0 });
    const sheetOf = async (sources: string[]) => {
      const { inbox } = await dashboardState(
        disk({ inbox: () => [tags, item()], deadTagSources: () => sources }),
      );
      return inbox?.map((i) => i.sheet);
    };
    const PROS = 'curated pros-cons · Valentine (2000012).pros[1].en';
    // Un perso, plusieurs textes : sa fiche, au sous-onglet du premier — et
    // l'item d'à côté n'y gagne rien.
    expect(await sheetOf([PROS, 'synergies · Valentine (2000012)[0]'])).toEqual([
      'character/2000012/pros-cons',
      undefined,
    ]);
    expect(await sheetOf(['gear-reco.json.2000008[0].note.en'])).toEqual([
      'character/2000008/gear',
      undefined,
    ]);
    // Deux persos, un guide, un preset : la page de l'admin, qui les liste tous.
    for (const sources of [
      [PROS, 'synergies · Marian (2000014)[0]'],
      [PROS, 'guides · adventure/S1-9-5 · content.json.tips[0].en'],
      ['gear-presets.json.substats.dps'],
      [],
    ])
      expect(await sheetOf(sources)).toEqual([undefined, undefined]);
    // L'adresse de l'admin reste dans l'item : `sheet` s'y ajoute.
    const { inbox } = await dashboardState(
      disk({ inbox: () => [tags], deadTagSources: () => [PROS] }),
    );
    expect(inbox).toEqual([
      {
        ...tags,
        href: 'https://outerpedia.local/admin/tags',
        inQuick: false,
        tab: null,
        sheet: 'character/2000012/pros-cons',
      },
    ]);
  });

  it('inbox : sans tag mort annoncé, les provenances ne sont pas lues', async () => {
    const deadTagSources = vi.fn(() => []);
    await dashboardState(disk({ inbox: () => [item()], deadTagSources }));
    expect(deadTagSources).not.toHaveBeenCalled();
  });

  it('`tagSourceSheet` lit les provenances RÉELLES de `collectTagOccurrences`', () => {
    // Le format de `source` est celui de `tag-control.ts` : s'il change, c'est
    // ici que ça se voit. Chaque texte d'un perso mène à un perso du roster.
    const ids = new Set(getCharacterListItems().map((c) => c.id));
    const seen = new Set<string>();
    for (const { source } of collectTagOccurrences()) {
      const where = tagSourceSheet(source);
      const kind = /^(curated pros-cons|synergies|gear-reco\.json)/.exec(source)?.[1];
      if (!kind) {
        expect(where, source).toBeNull();
        continue;
      }
      expect(where && ids.has(where.id), source).toBe(true);
      expect(where?.sub, source).toBe(
        { 'curated pros-cons': 'pros-cons', synergies: 'synergies', 'gear-reco.json': 'gear' }[
          kind
        ],
      );
      seen.add(kind);
    }
    expect([...seen].sort()).toEqual(['curated pros-cons', 'gear-reco.json', 'synergies']);
    // Un perso hors du roster n'a pas de nom dans sa provenance : pas de fiche.
    expect(tagSourceSheet('curated pros-cons · 2999999.pros[0].en')).toBeNull();
  });

  it('`ADMIN_BASE` : le site de dev de Caddy d’office, `.env.local` le remplace', () => {
    vi.stubEnv('ADMIN_BASE', '');
    expect(DASHBOARD_DISK.adminBase()).toBe('https://outerpedia.local');
    expect(ADMIN_BASE_DEFAULT).toBe('https://outerpedia.local');
    vi.stubEnv('ADMIN_BASE', 'http://localhost:3000');
    expect(DASHBOARD_DISK.adminBase()).toBe('http://localhost:3000');
  });

  it('git : l’état de « Pousser », le dernier commit, les fichiers modifiés ou non suivis comptés', async () => {
    const { git } = await dashboardState(
      disk({
        gitState: () => ({ branch: 'main', ahead: 3, behind: 1 }),
        lastCommit: () => 'cfd7ae96\tfeat(quick): onglet « Bannières » (B35)\til y a 2 jours',
        porcelain: () => ' M scripts/quick/actions.ts\nA  docs/DONE.md\n?? scripts/quick/ui/tabs/',
      }),
    );
    expect(git).toEqual({
      branch: 'main',
      ahead: 3,
      behind: 1,
      last: {
        hash: 'cfd7ae96',
        subject: 'feat(quick): onglet « Bannières » (B35)',
        when: 'il y a 2 jours',
      },
      dirty: 3,
    });
  });

  it('git : sans amont ni commit, le bloc le dit sans lever', async () => {
    const { git, errors } = await dashboardState(
      disk({
        gitState: () => ({ branch: 'essai', ahead: null, behind: 0 }),
        lastCommit: () => '',
      }),
    );
    expect(git).toEqual({ branch: 'essai', ahead: null, behind: 0, last: null, dirty: 0 });
    expect(errors).toEqual({});
  });

  it('game : le client égal, en avance, en retard — comparés segment par segment', async () => {
    const client = async (version: string | null, site = '1.11.404') =>
      (await dashboardState(disk({ siteVersion: () => site, clientVersion: () => version }))).game;
    expect(await client('1.11.404')).toEqual({
      site: '1.11.404',
      version: '1.11.404',
      client: 'same',
      proposal: false,
    });
    expect((await client('1.11.405'))?.client).toBe('ahead');
    expect((await client('1.12.0'))?.client).toBe('ahead');
    // Pas une comparaison de texte : 1000 est après 404.
    expect((await client('1.11.1000'))?.client).toBe('ahead');
    expect((await client('1.11.99'))?.client).toBe('behind');
    expect((await client('1.10.503'))?.client).toBe('behind');
  });

  it('game : pas de client sur ce poste — `absent`, pas une erreur', async () => {
    const { game, errors } = await dashboardState(disk({ clientVersion: () => null }));
    expect(game).toEqual({ site: '1.11.404', version: null, client: 'absent', proposal: false });
    expect(errors).toEqual({});
  });

  it('game : `proposal` — un fichier de data/extracted plus récent que son homologue ET différent', async () => {
    const asked: string[] = [];
    const proposal = async (
      mtimes: Record<string, number>,
      same: boolean | (() => boolean) = false,
    ) =>
      (
        await dashboardState(
          disk({
            mtime: (path) => {
              asked.push(path);
              return mtimes[path] ?? null;
            },
            sameBytes: () => (typeof same === 'function' ? same() : same),
          }),
        )
      ).game?.proposal;

    // Jamais de build sur ce poste : rien n'attend.
    expect(await proposal({})).toBe(false);
    // Quelques fichiers, pas tout le dossier — et aucun de ceux à rétention.
    expect([...new Set(asked.map((p) => p.replace(/^data\/[a-z]+\//, '')))]).toEqual([
      'game-version.json',
      'characters.json',
      'skills.json',
      'items.json',
    ]);

    const newer = { 'data/extracted/characters.json': 200, 'data/generated/characters.json': 100 };
    expect(await proposal(newer)).toBe(true);
    // `pnpm dev` rebâtit la proposition à l'identique : la date seule ne suffit pas.
    expect(await proposal(newer, true)).toBe(false);
    // Le validé est plus récent (un pull de l'autre poste) : la proposition est périmée.
    const older = { 'data/extracted/skills.json': 100, 'data/generated/skills.json': 200 };
    expect(await proposal(older)).toBe(false);
    expect(await proposal({ ...older, 'data/generated/skills.json': 100 })).toBe(false);
    // Un fichier proposé que le validé n'a pas du tout.
    expect(await proposal({ 'data/extracted/items.json': 100 })).toBe(true);
    // Les octets ne sont lus que pour un fichier plus récent.
    const read = vi.fn(() => true);
    await proposal(older, read);
    expect(read).not.toHaveBeenCalled();
  });

  it('game : `proposal` ignore ce que la garde perso de promote écarterait', async () => {
    const newer = { 'data/extracted/characters.json': 200, 'data/generated/characters.json': 100 };
    const proposal = async (files: Record<string, unknown>) =>
      (
        await dashboardState(
          disk({
            mtime: (path) => newer[path as keyof typeof newer] ?? null,
            sameBytes: () => false,
            readJson: (path) => files[path] ?? null,
          }),
        )
      ).game?.proposal;

    // La seule différence : un perso proposé que le validé ne connaît pas — la
    // garde l'écarterait, rien ne partirait à la promotion.
    const validated = { '2000001': { name: 'Aer' } };
    expect(
      await proposal({
        'data/extracted/characters.json': { ...validated, '2400015': { name: '' } },
        'data/generated/characters.json': validated,
      }),
    ).toBe(false);
    // Un perso connu qui change : une vraie proposition.
    expect(
      await proposal({
        'data/extracted/characters.json': { '2000001': { name: 'Aer+' }, '2400015': {} },
        'data/generated/characters.json': validated,
      }),
    ).toBe(true);
    // Sans perso non intégré, la différence d'octets suffit.
    expect(
      await proposal({
        'data/extracted/characters.json': validated,
        'data/generated/characters.json': validated,
      }),
    ).toBe(true);
  });

  it('bannières : les actives par fin, les à venir par début, les expirées tues, la détection comptée', async () => {
    const banner = (id: string, start: string, end: string): Banner => ({
      id,
      name: `Perso ${id}`,
      start,
      end,
    });
    const window = (characterId: string) => ({
      characterId,
      type: 'pickup',
      start: '2026-10-20',
      end: '2026-11-17',
    });
    const { banners } = await dashboardState(
      disk({
        banners: () => ({
          banners: [
            banner('5', '2026-10-21', '2026-11-18'),
            banner('4', '2026-10-13', '2026-11-10'),
            banner('1', '2026-09-22', '2026-10-20'),
            // Dernier jour, et premier jour : actives toutes les deux.
            banner('2', '2026-09-10', TODAY),
            banner('6', TODAY, '2026-10-09'),
            // Finie hier.
            banner('3', '2026-09-08', '2026-10-07'),
          ],
          missing: [window('7'), window('8')],
          drift: [
            {
              id: '1',
              name: 'Perso 1',
              start: '2026-09-22',
              curated: '2026-10-20',
              game: '2026-10-21',
              type: 'pickup',
            },
          ],
        }),
      }),
    );
    expect(banners).toEqual({
      active: [
        { id: '2', name: 'Perso 2', daysLeft: 0 },
        { id: '6', name: 'Perso 6', daysLeft: 1 },
        { id: '1', name: 'Perso 1', daysLeft: 12 },
      ],
      upcoming: [
        { id: '4', name: 'Perso 4', inDays: 5 },
        { id: '5', name: 'Perso 5', inDays: 13 },
      ],
      missing: 2,
      drift: 1,
    });
  });

  it('bannières : sans table du jeu, la raison passe — la liste est servie quand même', async () => {
    const { banners, errors } = await dashboardState(
      disk({ banners: () => ({ banners: [], missing: [], drift: [], gameError: NO_GAME_DATA }) }),
    );
    expect(banners).toEqual({
      active: [],
      upcoming: [],
      missing: 0,
      drift: 0,
      gameError: NO_GAME_DATA,
    });
    expect(errors).toEqual({});
  });

  it(`codes promo : les actifs, et ceux qui expirent sous ${COUPON_EXPIRY_DAYS} jours, au jour près`, async () => {
    const coupon = (code: string, start: string, end: string): PromoCode => ({
      code,
      start,
      end,
      description: { GOLD: '1' },
    });
    const { coupons } = await dashboardState(
      disk({
        coupons: async () => ({
          list: [
            coupon('FAR', '2026-09-01', '2026-12-31'),
            // Sept jours : dedans. Huit : dehors.
            coupon('SEVEN', '2026-10-01', '2026-10-15'),
            coupon('EIGHT', '2026-10-01', '2026-10-16'),
            coupon('SOON', '2026-10-01', '2026-10-11'),
            coupon('LASTDAY', '2026-10-01', TODAY),
            // Fini hier, et pas encore commencé : ni actifs ni à échéance.
            coupon('GONE', '2026-09-01', '2026-10-07'),
            coupon('NEXT', '2026-10-09', '2026-10-12'),
          ],
        }),
      }),
    );
    expect(COUPON_EXPIRY_DAYS).toBe(7);
    expect(coupons).toEqual({
      total: 7,
      active: 5,
      within: 7,
      expiring: [
        { code: 'LASTDAY', daysLeft: 0 },
        { code: 'SOON', daysLeft: 3 },
        { code: 'SEVEN', daysLeft: 7 },
      ],
    });
  });

  it('codes promo : R2 injoignable — l’instantané local est compté, et la raison jointe', async () => {
    const { coupons, errors } = await dashboardState(
      disk({
        coupons: async () => ({
          list: [{ code: 'LOCAL', start: '2026-10-01', end: '2026-10-31', description: {} }],
          error: 'R2 unreadable: timeout',
        }),
      }),
    );
    expect(coupons).toEqual({
      total: 1,
      active: 1,
      within: 7,
      expiring: [],
      error: 'R2 unreadable: timeout',
    });
    expect(errors).toEqual({});
  });

  it('un bloc qui lève rend `null` et sa raison ; les autres sont servis', async () => {
    const state = await dashboardState(
      disk({
        inbox: () => {
          throw new Error('extraction indisponible');
        },
        clientVersion: () => {
          throw new Error('manifest.dat illisible');
        },
        coupons: () => Promise.reject(new Error('fetch failed')),
        gitState: () => ({ branch: 'main', ahead: 1, behind: 0 }),
      }),
    );
    expect(state.inbox).toBeNull();
    expect(state.game).toBeNull();
    expect(state.coupons).toBeNull();
    expect(state.errors).toEqual({
      inbox: 'extraction indisponible',
      game: 'manifest.dat illisible',
      coupons: 'fetch failed',
    });
    expect(state.git?.ahead).toBe(1);
    expect(state.banners).toEqual({ active: [], upcoming: [], missing: 0, drift: 0 });
    expect(state.today).toBe(TODAY);

    // Chacun des cinq, seul : jamais un rejet de `dashboardState`.
    const boom = () => {
      throw new Error('boom');
    };
    for (const [name, over] of [
      ['inbox', { adminBase: boom }],
      ['git', { porcelain: boom }],
      ['git', { gitState: boom }],
      ['game', { siteVersion: boom }],
      ['game', { mtime: boom }],
      ['banners', { banners: boom }],
      ['coupons', { coupons: boom }],
    ] as const) {
      const one = await dashboardState(disk(over));
      expect(one.errors, name).toEqual({ [name]: 'boom' });
      expect(one[name], name).toBeNull();
    }
  });
});

describe('saveBannerList — écritures injectées', () => {
  const RIN: Banner = {
    id: '2700019',
    name: 'Resonance Rin',
    start: '2026-09-22',
    end: '2026-10-20',
  };
  const TITIA: Banner = { id: '2000122', name: 'Titia', start: '2026-09-08', end: '2026-10-06' };

  /**
   * Les trois écritures, factices : elles notent leur ordre. `saveBanners` tient
   * le contrat du store — la VRAIE validation, et rien d'écrit si elle refuse.
   */
  function deps(
    over: { publish?: Awaited<ReturnType<BannersDeps['publishBanners']>>; git?: Outcome } = {},
  ) {
    const calls = {
      order: [] as string[],
      written: [] as Banner[][],
      git: [] as [string[], string][],
    };
    const fake: BannersDeps = {
      saveBanners: async (list) => {
        const errors = validateBanners(list);
        if (errors.length) return errors;
        calls.order.push('fichier');
        calls.written.push(list);
        return [];
      },
      publishBanners: async () => {
        calls.order.push('R2');
        return over.publish ?? { ok: true, purged: true };
      },
      commitPaths: (paths, message) => {
        calls.order.push('commit');
        calls.git.push([paths, message]);
        return over.git ?? { ok: true, log: ['git : fait'] };
      },
    };
    return { calls, fake };
  }

  it('fichier → R2 → commit, sur le seul banner.json, la liste entière', async () => {
    const { calls, fake } = deps();
    const steps: string[] = [];
    const out = await saveBannerList([RIN, TITIA], ['Titia'], fake, (line, doing) =>
      steps.push(`${doing ? '… ' : ''}${line}`),
    );

    expect(out).toEqual({
      ok: true,
      log: [
        '2 bannières écrites dans data/curated/banner.json.',
        'publié sur R2 + edge purgé — en ligne en ≤ 10 min.',
        'git : fait',
      ],
      issues: [],
      written: true,
    });
    expect(calls.order).toEqual(['fichier', 'R2', 'commit']);
    expect(calls.written).toEqual([[RIN, TITIA]]);
    expect(calls.git).toEqual([[['data/curated/banner.json'], 'chore(banner): Titia']]);
    // Le journal suit au fil de l'eau, l'étape lente annoncée avant de finir.
    expect(steps).toEqual([
      '2 bannières écrites dans data/curated/banner.json.',
      '… publication sur R2, puis purge de l’edge',
      'publié sur R2 + edge purgé — en ligne en ≤ 10 min.',
    ]);
  });

  it('n’écrit que les quatre champs du fichier : les clés de la page restent à la page', async () => {
    const { calls, fake } = deps();
    await saveBannerList([{ ...RIN, key: 7, was: null } as Banner], ['Resonance Rin'], fake);
    expect(calls.written).toEqual([[RIN]]);
  });

  it('R2 en échec : une ligne du journal, le commit est fait — et le résultat le dit', async () => {
    const { calls, fake } = deps({
      publish: { ok: false, purged: false, error: 'R2_* absents de .env.local' },
    });
    const out = await saveBannerList([RIN], ['Resonance Rin'], fake);

    expect(calls.order).toEqual(['fichier', 'R2', 'commit']);
    expect(out).toMatchObject({ ok: false, written: true, issues: [] });
    expect(out.log).toEqual([
      '1 bannière écrite dans data/curated/banner.json.',
      'R2 NON PUBLIÉ : R2_* absents de .env.local',
      'git : fait',
      'R2 non publié : la home ne suivra qu’au prochain enregistrement, ou à `pnpm commit`.',
    ]);
  });

  it('R2 publié sans purge de l’edge : dit, et ce n’est pas un échec', async () => {
    const { fake } = deps({ publish: { ok: true, purged: false, error: 'jeton absent' } });
    const out = await saveBannerList([RIN], ['Resonance Rin'], fake);
    expect(out.ok).toBe(true);
    expect(out.log[1]).toBe('publié sur R2 (jeton absent) — en ligne en ≤ 10 min.');
  });

  it('validation en échec : rien d’écrit, ni publié, ni committé — l’erreur située', async () => {
    const { calls, fake } = deps();
    const draft: Banner = { id: '2000122', name: 'Titia', start: '', end: '' };
    const out = await saveBannerList([RIN, draft, { ...RIN, id: '' }], ['Titia'], fake);

    expect(calls.order).toEqual([]);
    expect(out).toEqual({
      ok: false,
      log: [
        'REFUSÉ — Banner 2 (Titia): invalid start date (YYYY-MM-DD expected).',
        'REFUSÉ — Banner 2 (Titia): invalid end date (YYYY-MM-DD expected).',
        'REFUSÉ — Banner 3 (Resonance Rin): character id is required.',
      ],
      issues: [
        { index: 1, message: 'Banner 2 (Titia): invalid start date (YYYY-MM-DD expected).' },
        { index: 1, message: 'Banner 2 (Titia): invalid end date (YYYY-MM-DD expected).' },
        { index: 2, message: 'Banner 3 (Resonance Rin): character id is required.' },
      ],
      written: false,
    });
  });

  it('une liste qui n’en est pas une : refusée avant le store', async () => {
    const { calls, fake } = deps();
    const out = await saveBannerList(undefined as unknown as Banner[], [], fake);
    expect(out).toEqual({
      ok: false,
      log: ['Liste de bannières attendue.'],
      issues: [],
      written: false,
    });
    expect(calls.order).toEqual([]);
  });

  it('le message de commit : un nom, trois noms, puis le compte', async () => {
    const message = async (changed: string[]) => {
      const { calls, fake } = deps();
      await saveBannerList([RIN], changed, fake);
      return calls.git[0][1];
    };
    expect(await message(['Titia'])).toBe('chore(banner): Titia');
    expect(await message(['Lambda', 'Titia', 'Resonance Rin'])).toBe(
      'chore(banner): Lambda, Titia, Resonance Rin',
    );
    expect(await message(['Lambda', 'Titia', 'Resonance Rin', 'Caren'])).toBe(
      'chore(banner): 4 bannières',
    );
    // Deux fenêtres du même perso : nommé une fois.
    expect(await message(['Resonance Rin', 'Resonance Rin'])).toBe('chore(banner): Resonance Rin');
    // La page ne nomme rien : le message reste lisible.
    expect(await message([])).toBe('chore(banner): mise à jour des bannières');
  });

  it('un commit refusé est un échec d’après écriture : le disque porte la liste', async () => {
    const { fake } = deps({ git: { ok: false, log: ['git commit a échoué'] } });
    const out = await saveBannerList([RIN], ['Resonance Rin'], fake);
    expect(out).toMatchObject({ ok: false, written: true });
    expect(out.log.at(-1)).toBe('git commit a échoué');
  });
});

describe('changelogState — le fichier, le roster, les gabarits et les libellés servis', () => {
  const ENTRIES: ChangelogEntry[] = [
    {
      date: '2026-10-06',
      type: 'character',
      title: { en: 'Demiurge Lambda' },
      content: { en: ['Added.'] },
      link: { kind: 'character', slug: 'demiurge-lambda' },
    },
    { date: '2026-09-23', type: 'news', title: { en: 'Old news' }, content: {} },
  ];
  const disk: ChangelogDisk = { loadChangelog: () => ENTRIES, today: () => '2026-10-08' };

  it('les entrées telles que le disque, dans son ordre, et le jour', () => {
    const state = changelogState(disk);
    expect(state.entries).toBe(ENTRIES);
    expect(state.today).toBe('2026-10-08');
  });

  it('le roster : id, nom complet anglais et slug, par nom', () => {
    const { roster } = changelogState(disk);
    expect(roster).toHaveLength(getCharacterListItems().length);
    expect(roster.map((c) => c.name)).toEqual(
      [...roster.map((c) => c.name)].sort((a, b) => a.localeCompare(b)),
    );
    expect(roster.find((c) => c.slug === 'demiurge-lambda')).toEqual({
      id: expect.stringMatching(/^\d+$/),
      name: 'Demiurge Lambda',
      slug: 'demiurge-lambda',
    });
    expect(roster.filter((c) => !c.slug)).toEqual([]);
  });

  it('les gabarits et leurs champs préremplis au jour : la page n’en recopie aucun', () => {
    const { templates } = changelogState(disk);
    expect(templates.map((t) => [t.id, t.label, t.type, t.fields.map((f) => f.key)])).toEqual([
      ['character', 'Perso', 'character', ['name', 'scope']],
      ['guide', 'Guide', 'guide', ['guide', 'slug']],
      ['update', 'Mise à jour', 'update', ['guide', 'mode', 'month', 'slug']],
      ['feature', 'Page / outil', 'feature', []],
      ['news', 'News', 'news', []],
      ['fix', 'Correctif', 'fix', []],
      ['manual', 'Manuel', 'guide', []],
    ]);
    const update = templates.find((t) => t.id === 'update');
    expect(update?.fields).toEqual([
      {
        key: 'guide',
        label: 'Guide',
        kind: 'text',
        value: '',
        placeholder: 'Annihilator',
        options: [],
      },
      {
        key: 'mode',
        label: 'Mode',
        kind: 'choice',
        value: 'Joint Challenge',
        placeholder: '',
        options: [
          { value: 'Joint Challenge', label: 'Joint Challenge' },
          { value: 'Guild Raid', label: 'Guild Raid' },
          { value: 'World Boss', label: 'World Boss' },
        ],
      },
      // Le mois courant, au jour du serveur.
      {
        key: 'month',
        label: 'Mois',
        kind: 'month',
        value: 'October 2026',
        placeholder: '',
        options: [],
      },
      {
        key: 'slug',
        label: 'Slug du guide',
        kind: 'text',
        value: '',
        placeholder: 'annihilator',
        options: [],
      },
    ]);
    expect(
      changelogState({ ...disk, today: () => '2027-01-02' })
        .templates.find((t) => t.id === 'update')
        ?.fields.find((f) => f.key === 'month')?.value,
    ).toBe('January 2027');
  });

  it('les libellés des types et des sortes de lien, et les langues dans leurs deux ordres', () => {
    const state = changelogState(disk);
    expect(state.types).toEqual([
      { value: 'guide', label: 'Guide' },
      { value: 'update', label: 'Mise à jour' },
      { value: 'feature', label: 'Page / outil' },
      { value: 'character', label: 'Perso' },
      { value: 'news', label: 'News' },
      { value: 'fix', label: 'Correctif' },
    ]);
    expect(state.linkKinds.map((k) => [k.value, k.label])).toEqual([
      ['', 'aucun lien'],
      ['character', 'perso (slug)'],
      ['guide', 'guide (chemin)'],
      ['tool', 'outil (chemin)'],
      ['page', 'page (chemin)'],
    ]);
    // `file` : l'ordre des langues dans le fichier ; `shown` : celui de l'écran.
    expect(state.langs).toEqual({
      default: 'en',
      file: LANGS,
      shown: ['en', 'fr', 'es', 'jp', 'kr', 'zh'],
    });
  });

  it('le disque réel se lit : des entrées, toutes datées et typées', () => {
    const { entries, types } = changelogState();
    expect(entries.length).toBeGreaterThan(100);
    const known = new Set<string>(types.map((t) => t.value));
    expect(
      entries.filter((e) => !known.has(e.type) || !/^\d{4}-\d{2}-\d{2}$/.test(e.date)),
    ).toEqual([]);
  });
});

describe('fillChangelogTemplate — un gabarit rempli par le serveur', () => {
  const TODAY = '2026-10-08';
  const lambda = getCharacterListItems().find((c) => slugForId(c.id) === 'demiurge-lambda');
  const filled = (template: unknown, values: unknown) => {
    const out = fillChangelogTemplate(template, values, TODAY);
    if ('error' in out) throw new Error(out.error);
    return out;
  };

  it('Perso : le titre dans les six langues depuis le roster, le slug, la date du jour', () => {
    expect(lambda).toBeTruthy();
    const out = filled('character', { character: lambda?.id });
    expect(out.type).toBe('character');
    expect(out.date).toBe(TODAY);
    expect(out.link).toEqual({ kind: 'character', value: 'demiurge-lambda' });
    expect(Object.keys(out.title).sort()).toEqual([...LANGS].sort());
    for (const lang of LANGS)
      expect(out.title[lang], lang).toBe(lambda && characterDisplayName(lambda, lang));
    expect(out.title.en).toBe('Demiurge Lambda');
    // Le nom du jeu dans chaque langue, pas l'anglais recopié.
    expect(new Set(Object.values(out.title)).size).toBeGreaterThan(1);
  });

  it('Perso : la variante « exclusive equipment » quand le jeu lui connaît un EE, sinon l’autre', () => {
    const owners = new Set(getEEViews().map((e) => e.characterId));
    const roster = getCharacterListItems();
    const withEe = roster.find((c) => owners.has(c.id));
    expect(withEe).toBeTruthy();
    const name = withEe ? characterDisplayName(withEe) : '';
    expect(filled('character', { character: withEe?.id }).content).toEqual([
      `${name} has been added to the database with full skills, stats and exclusive equipment.`,
    ]);
    const without = roster.find((c) => !owners.has(c.id));
    if (without)
      expect(filled('character', { character: without.id }).content).toEqual([
        `${characterDisplayName(without)} has been added to the database with full skills and stats.`,
      ]);
    // Une variante donnée l'emporte sur la déduction.
    expect(
      filled('character', { character: withEe?.id, scope: 'skills and stats' }).content,
    ).toEqual([`${name} has been added to the database with full skills and stats.`]);
  });

  it('Perso : un nom saisi ne remplace pas celui du roster', () => {
    expect(
      filled('character', { character: lambda?.id, name: 'Intrus', slug: 'intrus' }),
    ).toMatchObject({ title: { en: 'Demiurge Lambda' }, link: { value: 'demiurge-lambda' } });
  });

  it('Mise à jour : les valeurs d’office (mode, mois courant) quand rien n’est saisi', () => {
    expect(filled('update', { guide: 'Annihilator', slug: 'annihilator' })).toEqual({
      type: 'update',
      title: { en: 'Annihilator' },
      content: ['Annihilator Joint Challenge Guide updated for October 2026 version.'],
      link: { kind: 'guide', value: '/guides/joint-challenge/annihilator' },
      date: TODAY,
    });
  });

  it('un champ laissé vide n’est pas une erreur : il reste écrit dans l’entrée', () => {
    expect(filled('update', { guide: '', mode: 'Guild Raid', slug: '' })).toMatchObject({
      title: { en: '{guide}' },
      content: ['{guide} Guild Raid Guide updated for October 2026 version.'],
      link: { kind: 'guide', value: '/guides/guild-raid/{slug}' },
    });
    // Ce qui n'est pas une chaîne est ignoré, pas écrit « [object Object] ».
    expect(filled('update', { guide: { en: 'x' }, slug: 7 }).title).toEqual({ en: '{guide}' });
    expect(filled('update', null).title).toEqual({ en: '{guide}' });
  });

  it('Manuel : une entrée vierge, datée du jour', () => {
    expect(filled('manual', {})).toEqual({
      type: 'guide',
      title: {},
      content: [],
      link: { kind: '', value: '' },
      date: TODAY,
    });
  });

  it('un gabarit ou un perso inconnu est rendu en erreur, pas levé', () => {
    expect(fillChangelogTemplate('nope', {}, TODAY)).toEqual({ error: 'gabarit inconnu : nope' });
    expect(fillChangelogTemplate(undefined, {}, TODAY)).toEqual({ error: 'gabarit inconnu : ' });
    expect(fillChangelogTemplate('character', { character: 'nope' }, TODAY)).toEqual({
      error: 'perso inconnu : nope',
    });
    expect(fillChangelogTemplate('character', {}, TODAY)).toEqual({
      error: 'perso inconnu : (aucun)',
    });
  });
});

describe('saveChangelogList — écritures injectées', () => {
  const LAMBDA: ChangelogEntry = {
    date: '2026-10-06',
    type: 'character',
    title: { en: 'Demiurge Lambda', fr: 'Démiurge Lambda' },
    content: { en: ['Demiurge Lambda has been added.'], fr: ['Démiurge Lambda est là.'] },
    link: { kind: 'character', slug: 'demiurge-lambda' },
  };
  const NEWS: ChangelogEntry = {
    date: '2026-09-23',
    type: 'news',
    title: { en: 'Outerpedia in French and Spanish' },
    content: { en: ['First.', 'Second.'] },
  };

  /**
   * Les deux écritures, factices : elles notent leur ordre. `saveChangelog` tient
   * le contrat du store — sa règle du titre anglais, et rien d'écrit s'il refuse.
   */
  function deps(over: { git?: Outcome } = {}) {
    const calls = {
      order: [] as string[],
      asked: 0,
      written: [] as ChangelogEntry[][],
      git: [] as [string[], string][],
    };
    const fake: ChangelogDeps = {
      saveChangelog: async (list) => {
        calls.asked += 1;
        const errors = list.flatMap((e, i) =>
          e.title?.en?.trim() ? [] : [`Entrée ${i + 1} : titre EN requis.`],
        );
        if (errors.length) return errors;
        calls.order.push('fichier');
        calls.written.push(list);
        return [];
      },
      commitPaths: (paths, message) => {
        calls.order.push('commit');
        calls.git.push([paths, message]);
        return over.git ?? { ok: true, log: ['git : fait'] };
      },
    };
    return { calls, fake };
  }

  it('fichier → commit, sur le seul changelog.json, la liste entière — pas de R2', async () => {
    const { calls, fake } = deps();
    const steps: string[] = [];
    const out = await saveChangelogList([LAMBDA, NEWS], ['Demiurge Lambda'], fake, (line) =>
      steps.push(line),
    );

    expect(out).toEqual({
      ok: true,
      log: [
        '2 entrées écrites dans data/curated/changelog.json — lu au build : en ligne après « Pousser » et la CI.',
        'git : fait',
      ],
      issues: [],
      written: true,
    });
    expect(calls.order).toEqual(['fichier', 'commit']);
    expect(calls.written).toEqual([[LAMBDA, NEWS]]);
    expect(calls.git).toEqual([
      [['data/curated/changelog.json'], 'chore(changelog): Demiurge Lambda'],
    ]);
    expect(steps).toEqual([out.log[0]]);
  });

  it('n’écrit que la forme du fichier : les clés de la page, les vides et les espaces restent dehors', async () => {
    const { calls, fake } = deps();
    await saveChangelogList(
      [
        {
          key: 12,
          was: null,
          date: '2026-10-08',
          type: 'update',
          draft: false,
          title: { en: '  Annihilator ', fr: '', xx: 'langue inconnue', jp: 7 },
          content: { en: [' One. ', '', '   ', 'Two.'], fr: [], kr: 'pas une liste' },
          link: { kind: 'guide', href: ' /guides/joint-challenge/annihilator ', slug: 'ignoré' },
          image: '   ',
        },
        // Un lien sans valeur, ou d'une sorte inconnue, n'en est pas un.
        { ...NEWS, link: { kind: 'page', href: '  ' }, draft: true, image: ' /images/a.webp ' },
        { ...NEWS, link: { kind: 'video', href: '/x' }, draft: 'oui' },
        { ...NEWS, link: { kind: 'character', slug: ' titia ', href: '/ignoré' } },
      ],
      ['Annihilator'],
      fake,
    );
    expect(calls.written[0]).toEqual([
      {
        date: '2026-10-08',
        type: 'update',
        title: { en: 'Annihilator' },
        content: { en: ['One.', 'Two.'] },
        link: { kind: 'guide', href: '/guides/joint-challenge/annihilator' },
      },
      { ...NEWS, image: '/images/a.webp', draft: true },
      NEWS,
      { ...NEWS, link: { kind: 'character', slug: 'titia' } },
    ]);
    // L'ordre des clés est celui du fichier : date, type, titre, contenu, lien, image, brouillon.
    expect(Object.keys(calls.written[0][1])).toEqual([
      'date',
      'type',
      'title',
      'content',
      'image',
      'draft',
    ]);
  });

  it('le fichier réel, renvoyé intact, se réécrit à l’identique — clés et langues dans leur ordre', async () => {
    const real = loadChangelog();
    expect(real.length).toBeGreaterThan(100);
    const { calls, fake } = deps();
    const out = await saveChangelogList(structuredClone(real), [], fake);
    expect(out.ok).toBe(true);
    expect(JSON.stringify(calls.written[0])).toBe(JSON.stringify(real));
    expect(calls.git[0][1]).toBe('chore(changelog): mise à jour du journal');
  });

  it('une validation en échec n’écrit ni ne committe rien, et situe l’entrée', async () => {
    const { calls, fake } = deps();
    const out = await saveChangelogList(
      [LAMBDA, { ...NEWS, title: { fr: 'Sans anglais' } }, { ...NEWS, title: { en: '  ' } }],
      ['x'],
      fake,
    );
    expect(out).toEqual({
      ok: false,
      log: ['REFUSÉ — Entrée 2 : titre EN requis.', 'REFUSÉ — Entrée 3 : titre EN requis.'],
      issues: [
        { index: 1, message: 'Entrée 2 : titre EN requis.' },
        { index: 2, message: 'Entrée 3 : titre EN requis.' },
      ],
      written: false,
    });
    expect(calls.order).toEqual([]);
    expect(calls.written).toEqual([]);
    expect(calls.git).toEqual([]);
  });

  it('un champ de gabarit non rempli est refusé AVANT le store, situé et nommé', async () => {
    const { calls, fake } = deps();
    const out = await saveChangelogList(
      [
        LAMBDA,
        {
          date: '2026-10-08',
          type: 'update',
          title: { en: '{guide}' },
          content: { en: ['{guide} Joint Challenge Guide updated for October 2026 version.'] },
          link: { kind: 'guide', href: '/guides/joint-challenge/{slug}' },
        },
        { ...NEWS, content: { en: ['Released in {month}.'] } },
      ],
      ['{guide}'],
      fake,
    );
    expect(out).toEqual({
      ok: false,
      log: [
        'REFUSÉ — Entrée 2 : champs de gabarit non remplis — {guide}, {slug}.',
        'REFUSÉ — Entrée 3 : champ de gabarit non rempli — {month}.',
      ],
      issues: [
        { index: 1, message: 'Entrée 2 : champs de gabarit non remplis — {guide}, {slug}.' },
        { index: 2, message: 'Entrée 3 : champ de gabarit non rempli — {month}.' },
      ],
      written: false,
    });
    // Le store n'a même pas été sollicité : il aurait écrit, lui ne connaît pas les gabarits.
    expect(calls.asked).toBe(0);
    expect(calls.git).toEqual([]);
  });

  it('le message de commit : un titre, jusqu’à trois, leur nombre au-delà', async () => {
    const message = async (changed: string[]) => {
      const { calls, fake } = deps();
      await saveChangelogList([LAMBDA], changed, fake);
      return calls.git[0][1];
    };
    expect(await message(['Demiurge Lambda'])).toBe('chore(changelog): Demiurge Lambda');
    expect(await message(['Demiurge Lambda', ' Annihilator ', 'Universal Tower'])).toBe(
      'chore(changelog): Demiurge Lambda, Annihilator, Universal Tower',
    );
    expect(await message(['A', 'B', 'C', 'D'])).toBe('chore(changelog): 4 entrées');
    // Une entrée sans titre anglais (retirée telle quelle) ne laisse pas de virgule orpheline.
    expect(await message(['', 'Annihilator'])).toBe('chore(changelog): Annihilator');
    expect(await message([])).toBe('chore(changelog): mise à jour du journal');
  });

  it('refuse ce qui n’est pas une liste, sans rien écrire', async () => {
    const { calls, fake } = deps();
    expect(await saveChangelogList({ list: [LAMBDA] }, [], fake)).toEqual({
      ok: false,
      log: ['Liste d’entrées attendue.'],
      issues: [],
      written: false,
    });
    expect(calls.asked).toBe(0);
  });

  it('un commit refusé est un échec d’après écriture : le disque porte la liste', async () => {
    const { fake } = deps({ git: { ok: false, log: ['git commit a échoué'] } });
    const out = await saveChangelogList([LAMBDA], ['Demiurge Lambda'], fake);
    expect(out).toMatchObject({ ok: false, written: true });
    expect(out.log.at(-1)).toBe('git commit a échoué');
  });
});

describe('previewChangelogEntry — ce que la page /changelog montrerait', () => {
  const lambda = getCharacterListItems().find((c) => slugForId(c.id) === 'demiurge-lambda');
  const ENTRY = {
    date: '2026-10-06',
    type: 'character',
    title: { en: 'Demiurge Lambda', fr: 'Démiurge Lambda' },
    content: {
      en: ['Added the **Universal Tower** guide: floor by floor.', 'Plain bullet.'],
      fr: ['Ajout du guide de la **Tour aux Mille Formes**.'],
    },
    link: { kind: 'character', slug: 'demiurge-lambda' },
  };
  const ok = async (entry: unknown, lang: unknown) => {
    const out = await previewChangelogEntry(entry, lang);
    if ('error' in out) throw new Error(out.error);
    return out;
  };

  it('le gras en segments, le lien du perso (href et libellé), son portrait sans image explicite', async () => {
    const out = await ok(ENTRY, 'en');
    expect(out).toEqual({
      type: 'character',
      badge: en['changelog.type.character'],
      icon: '🛡️',
      date: 'Oct 6, 2026',
      title: 'Demiurge Lambda',
      bullets: [
        [
          { text: 'Added the ' },
          { text: 'Universal Tower', bold: true },
          { text: ' guide: floor by floor.' },
        ],
        [{ text: 'Plain bullet.' }],
      ],
      link: {
        kind: 'character',
        label: en['changelog.goto.character'],
        href: '/characters/demiurge-lambda',
      },
      image: expect.stringMatching(
        new RegExp(`/images/characters/faceicon/FI_${lambda?.id}\\.png$`),
      ),
    });
  });

  it('dans la langue demandée : le titre, les puces, les libellés et la date', async () => {
    const out = await ok(ENTRY, 'fr');
    expect(out.title).toBe('Démiurge Lambda');
    expect(out.bullets).toEqual([
      [
        { text: 'Ajout du guide de la ' },
        { text: 'Tour aux Mille Formes', bold: true },
        { text: '.' },
      ],
    ]);
    expect(out.badge).toBe(fr['changelog.type.character']);
    expect(out.link?.label).toBe(fr['changelog.goto.character']);
    expect(out.date).toBe('6 oct. 2026');
  });

  it('une langue sans texte se replie sur l’anglais, comme la page', async () => {
    const out = await ok(ENTRY, 'jp');
    expect(out.title).toBe('Demiurge Lambda');
    expect(out.bullets).toHaveLength(2);
    // Une langue inconnue, ou absente : l'anglais.
    expect((await ok(ENTRY, 'xx')).badge).toBe(en['changelog.type.character']);
    expect((await ok(ENTRY, undefined)).title).toBe('Demiurge Lambda');
  });

  it('une image explicite l’emporte ; sans lien ni image, l’icône du type', async () => {
    const withImage = await ok({ ...ENTRY, image: '/images/ui/custom.webp' }, 'en');
    expect(withImage.image).toMatch(/\/images\/ui\/custom\.webp$/);
    const bare = await ok({ date: '2026-09-23', type: 'news', title: { en: 'News' } }, 'en');
    expect(bare).toMatchObject({ icon: '📣', image: null, link: null, bullets: [] });
    // Un outil ou une page : un lien, pas de vignette.
    const tool = await ok(
      { ...ENTRY, type: 'feature', link: { kind: 'tool', href: '/team-planner' } },
      'en',
    );
    expect(tool.link).toEqual({
      kind: 'tool',
      label: en['changelog.goto.tool'],
      href: '/team-planner',
    });
    expect(tool.image).toBeNull();
  });

  it('un aperçu n’est pas un contrôle : sans titre, sans date lisible, un slug inconnu passent', async () => {
    const out = await ok(
      { date: 'bientôt', type: 'character', link: { kind: 'character', slug: 'nope' } },
      'en',
    );
    expect(out).toMatchObject({ title: '', date: 'bientôt', bullets: [], image: null });
    expect(out.link?.href).toBe('/characters/nope');
    expect((await ok({ date: '2026-13-45', type: 'fix' }, 'en')).date).toBe('2026-13-45');
  });

  it('un type inconnu, ou ce qui n’est pas une entrée, est rendu en erreur', async () => {
    expect(await previewChangelogEntry({ ...ENTRY, type: 'annonce' }, 'en')).toEqual({
      error: 'type inconnu : annonce',
    });
    expect(await previewChangelogEntry({}, 'en')).toEqual({ error: 'type inconnu : (vide)' });
    for (const bad of [null, undefined, 'x', [ENTRY]])
      expect(await previewChangelogEntry(bad, 'en')).toEqual({
        error: 'entry : une entrée du journal attendue',
      });
  });
});

describe('POST /api/translate — « Traduire » générique, par translateNotes', () => {
  it('le titre et les puces d’une entrée : un texte chacun, les résultats alignés', async () => {
    const calls: string[][] = [];
    const fake: TranslateDeps = {
      autoTranslate: async (texts, targets) => {
        calls.push(texts);
        return {
          results: texts.map((text) =>
            Object.fromEntries(targets.map((lang) => [lang, `${lang}: ${text}`])),
          ),
          provider: 'deepl',
        };
      },
      hasKey: () => true,
    };
    // Une entrée sans titre : sa case reste, vide, et les puces gardent leur rang.
    const out = await translateNotes(['', 'First **bold** bullet.', 'Second bullet.'], fake);
    expect(calls).toEqual([['First **bold** bullet.', 'Second bullet.']]);
    expect(out).toMatchObject({
      results: [{}, { fr: 'fr: First **bold** bullet.' }, { es: 'es: Second bullet.' }],
      provider: 'deepl',
    });
  });

  it('la route générique et celle de Gear reco sont la même : une seule fonction derrière', () => {
    const server = readFileSync(join(import.meta.dirname, 'server.ts'), 'utf8');
    expect(server).toContain(
      "(url.pathname === '/api/translate' || url.pathname === '/api/gear-reco/translate')",
    );
    expect(server.match(/translateNotes\(/g)).toHaveLength(1);
  });
});

// ------------------------------------------------------------ tables du jeu ---

/** Des sources FACTICES : deux lecteurs à docblock, un sans, un fichier qui ne lit rien. */
const USAGE_SOURCES: UsageSource[] = [
  {
    path: 'datagen/generators/recruit.ts',
    text: [
      '/**',
      ' * Générateur — DOMAINE RECRUTEMENT (`recruit.json`).',
      ' *',
      ' * Sert les guides de la catégorie general-guides.',
      ' */',
      "import { loadTable } from '../lib/tables';",
      "const groups = loadTable('RecruitGroupTemplet');",
      'const rates = loadTable( "RecruitTemplet" );',
      "const again = loadTable('RecruitGroupTemplet');",
      // Ni un nom en variable, ni un nom composé : aucune table n'y est nommée.
      'for (const name of names) loadTable(name);',
      'const text = loadTable(`Text${suffix}`);',
    ].join('\n'),
  },
  {
    path: 'datagen/extractor/specs/character.ts',
    text: [
      '/**',
      " * Spec d'extraction — PERSONNAGES (CharacterTemplet), entité",
      ' * qui relie tout.',
      ' */',
      "for (const r of loadTable('RecruitGroupTemplet')) seen.add(r.PickupID);",
      'const columns = loadColumns(`CharacterTemplet`);',
      "const names = loadTextIndex('TextCharacter');",
    ].join('\n'),
  },
  {
    path: 'scripts/quick/actions.ts',
    text: "import './env';\nconst has = existsSync(tablePath('RecruitGroupTemplet'));\n",
  },
  { path: 'datagen/lib/idle.ts', text: '/** Ne lit rien. */\nexport const n = 1;\n' },
  {
    // Une lecture CITÉE dans un commentaire n'en est pas une.
    path: 'datagen/lib/text.ts',
    text: [
      '/**',
      ' * Primitive #2 — résolution de texte localisé.',
      " * Un build appelle `loadTextIndex('TextSystem')` depuis quinze générateurs.",
      ' */',
      "// const rows = loadTable('ItemTemplet');",
      "export const DOC = 'https://example.test/doc';",
    ].join('\n'),
  },
];

describe('tableUsage — qui lit quelle table, d’après les sources', () => {
  const usage = tableUsage(USAGE_SOURCES);

  it('une table = son nom écrit en dur dans un appel de lecture ; un appel par variable est ignoré', () => {
    expect([...usage.keys()].sort()).toEqual([
      'CharacterTemplet',
      'RecruitGroupTemplet',
      'RecruitTemplet',
      'TextCharacter',
    ]);
    // Une table lue par personne n'a pas d'entrée — ni celle qu'un commentaire cite.
    expect(usage.get('ItemTemplet')).toBeUndefined();
    expect(usage.get('TextSystem')).toBeUndefined();
    // Le `//` d'une adresse n'ouvre pas un commentaire : la lecture qui la suit compte.
    expect(
      tableUsage([
        { path: 'datagen/a.ts', text: "const u = 'https://x.test'; loadTable('AreaTemplet');" },
      ]).get('AreaTemplet')?.usedBy,
    ).toEqual([{ name: 'a', path: 'datagen/a.ts' }]);
  });

  it('un générateur qui lit deux tables est le lecteur des deux, une fois chacune', () => {
    const recruit = { name: 'generators/recruit', path: 'datagen/generators/recruit.ts' };
    expect(usage.get('RecruitTemplet')?.usedBy).toEqual([recruit]);
    // Lue deux fois par le même fichier : un seul lecteur.
    expect(usage.get('RecruitGroupTemplet')?.usedBy.filter((r) => r.path === recruit.path)).toEqual(
      [recruit],
    );
  });

  it('les lecteurs par chemin : sans extension, sans `datagen/` en tête, le chemin complet à côté', () => {
    expect(usage.get('RecruitGroupTemplet')?.usedBy).toEqual([
      { name: 'extractor/specs/character', path: 'datagen/extractor/specs/character.ts' },
      { name: 'generators/recruit', path: 'datagen/generators/recruit.ts' },
      { name: 'scripts/quick/actions', path: 'scripts/quick/actions.ts' },
    ]);
    // L'ordre des sources ne compte pas.
    expect(tableUsage([...USAGE_SOURCES].reverse()).get('RecruitGroupTemplet')).toEqual(
      usage.get('RecruitGroupTemplet'),
    );
  });

  it('la note : la première ligne du docblock de chaque lecteur, une par ligne — `…` si la phrase continue', () => {
    expect(usage.get('RecruitTemplet')?.note).toBe(
      'Générateur — DOMAINE RECRUTEMENT (`recruit.json`).',
    );
    // Un lecteur sans docblock en tête ne dit rien.
    expect(usage.get('RecruitGroupTemplet')?.note).toBe(
      "Spec d'extraction — PERSONNAGES (CharacterTemplet), entité…\nGénérateur — DOMAINE RECRUTEMENT (`recruit.json`).",
    );
    expect(tableUsage([USAGE_SOURCES[2]]).get('RecruitGroupTemplet')?.note).toBe('');
  });

  it('deux lecteurs au même docblock ne le disent qu’une fois ; un docblock d’une ligne se lit', () => {
    const twin = (path: string): UsageSource => ({
      path,
      text: "/** Extracteur DAMAGE — cibles. */\nloadTable('MonsterTemplet');",
    });
    const out = tableUsage([twin('datagen/damage/a.ts'), twin('datagen/damage/b.ts')]);
    expect(out.get('MonsterTemplet')).toEqual({
      usedBy: [
        { name: 'damage/a', path: 'datagen/damage/a.ts' },
        { name: 'damage/b', path: 'datagen/damage/b.ts' },
      ],
      note: 'Extracteur DAMAGE — cibles.',
    });
  });
});

describe('gameTablesState — le catalogue et l’usage, lectures injectées', () => {
  const info = (name: string, bytes = 1000) => ({ name, bytes, mtimeMs: 1_700_000_000_000 });
  const disk = (over: Partial<GameTablesDisk> = {}): GameTablesDisk => ({
    // L'ordre du disque : alphabétique.
    listTables: () => [
      info('AreaTemplet'),
      info('CharacterTemplet', 2_400_000),
      info('RecruitGroupTemplet', 180_167),
      info('RecruitTemplet'),
      info('ZoneTemplet'),
    ],
    sources: () => USAGE_SOURCES,
    ...over,
  });

  it('les tables lues d’abord, par nombre de lecteurs puis par nom ; les autres ensuite', () => {
    const state = gameTablesState(disk());
    expect(state.tables.map((t) => [t.name, t.usedBy.length])).toEqual([
      ['RecruitGroupTemplet', 3],
      ['CharacterTemplet', 1],
      ['RecruitTemplet', 1],
      ['AreaTemplet', 0],
      ['ZoneTemplet', 0],
    ]);
    expect(state.tables[0]).toEqual({
      ...info('RecruitGroupTemplet', 180_167),
      usedBy: [
        { name: 'extractor/specs/character', path: 'datagen/extractor/specs/character.ts' },
        { name: 'generators/recruit', path: 'datagen/generators/recruit.ts' },
        { name: 'scripts/quick/actions', path: 'scripts/quick/actions.ts' },
      ],
      note: "Spec d'extraction — PERSONNAGES (CharacterTemplet), entité…\nGénérateur — DOMAINE RECRUTEMENT (`recruit.json`).",
    });
    expect(state.tables[3]).toEqual({ ...info('AreaTemplet'), usedBy: [], note: '' });
    // Trois tables du disque sont lues, par trois fichiers — `TextCharacter`,
    // lue mais absente du disque, ne se compte pas.
    expect(state.used).toBe(3);
    expect(state.readers).toBe(3);
    expect('error' in state).toBe(false);
  });

  it('les colonnes de langue masquées : la règle de l’admin, l’anglais reste', () => {
    const { hiddenColumns } = gameTablesState(disk());
    expect(hiddenColumns).toEqual(
      expect.arrayContaining(['Japanese', 'Korean', 'French', 'Spanish', 'China_Traditional']),
    );
    expect(hiddenColumns).not.toContain('English');
  });

  it('sans `.gamedata/parsed/` : liste vide et `error`, pas une levée', () => {
    expect(gameTablesState(disk({ listTables: () => [] }))).toEqual({
      tables: [],
      used: 0,
      readers: 0,
      hiddenColumns: expect.any(Array),
      error: NO_GAME_DATA,
    });
    expect(NO_GAME_DATA).toBe('Pas de données du jeu : lancer un patch (pull) d’abord.');
  });

  it('l’usage est calculé UNE fois par jeu de lectures ; `recompute` relit les sources', () => {
    const sources = vi.fn(() => USAGE_SOURCES);
    const listTables = vi.fn(() => [info('RecruitTemplet')]);
    const d = disk({ sources, listTables });
    gameTablesState(d);
    gameTablesState(d);
    expect(sources).toHaveBeenCalledTimes(1);
    // Le catalogue, lui, est relu à chaque appel : un pull le change.
    expect(listTables).toHaveBeenCalledTimes(2);

    sources.mockReturnValue([]);
    expect(gameTablesState(d).used).toBe(1);
    expect(gameTablesState(d, true).used).toBe(0);
    expect(sources).toHaveBeenCalledTimes(2);
    // Le recalcul remplace le mémo.
    expect(gameTablesState(d).used).toBe(0);
    expect(sources).toHaveBeenCalledTimes(2);
  });
});

describe('queryGameTable, gameTableSchema — le store de l’admin, factice', () => {
  const schema: TableSchema = {
    table: 'CItemTemplet',
    columns: ['ID', 'NameID', 'DissolveRewardID', 'Dead'],
    filled: ['ID', 'NameID', 'DissolveRewardID'],
    rowCount: 2,
  };
  const page: TablePage = {
    ...schema,
    rows: [{ ID: '1', NameID: 'NAME_ITEM_1' }],
    matched: 1,
    page: 1,
    pageSize: 50,
    texts: {},
    links: { DissolveRewardID: 'RewardTemplet' },
  };
  const deps = () => {
    const d = {
      listTables: vi.fn(() => [{ name: 'ItemTemplet', bytes: 10, mtimeMs: 1 }]),
      queryTable: vi.fn(() => page),
      describeTable: vi.fn(() => schema),
      linkTargets: vi.fn(() => ({ DissolveRewardID: 'RewardTemplet' })),
    };
    return d satisfies GameTableDeps;
  };

  it('un nom qui n’est pas un basename : 400, rien n’est lu', () => {
    for (const name of ['', '../etc/passwd', 'a/b', 'Item.json', 'a b']) {
      const d = deps();
      expect(queryGameTable(name, {}, d), name).toEqual({
        error: 'nom de table invalide',
        status: 400,
      });
      expect(gameTableSchema(name, d), name).toEqual({
        error: 'nom de table invalide',
        status: 400,
      });
      expect(d.listTables).not.toHaveBeenCalled();
      expect(d.queryTable).not.toHaveBeenCalled();
      expect(d.describeTable).not.toHaveBeenCalled();
    }
  });

  it('une table que le disque n’a pas : 404, en la nommant', () => {
    const d = deps();
    expect(queryGameTable('NopeTemplet', { q: 'x' }, d)).toEqual({
      error: 'table inconnue : NopeTemplet',
      status: 404,
    });
    expect(gameTableSchema('NopeTemplet', d)).toEqual({
      error: 'table inconnue : NopeTemplet',
      status: 404,
    });
    expect(d.queryTable).not.toHaveBeenCalled();
    expect(d.describeTable).not.toHaveBeenCalled();
  });

  it('les paramètres de la route de l’admin : sous-chaîne, colonne, `exact=1`, page, `resolve=1`', () => {
    const d = deps();
    expect(
      queryGameTable(
        'ItemTemplet',
        { q: 'gold', col: 'ID', exact: '1', page: '3', resolve: '1' },
        d,
      ),
    ).toBe(page);
    expect(d.queryTable).toHaveBeenLastCalledWith('ItemTemplet', {
      q: 'gold',
      col: 'ID',
      exact: true,
      page: 3,
      pageSize: 50,
      resolve: true,
    });

    // Sans rien : la première page, en sous-chaîne, sans résolution. Une page
    // illisible vaut la première ; `exact` et `resolve` ne valent que `1`.
    queryGameTable('ItemTemplet', {}, d);
    queryGameTable('ItemTemplet', { page: 'deux', exact: 'true', resolve: '0' }, d);
    const first = { q: '', col: '', exact: false, page: 1, pageSize: 50, resolve: false };
    expect(d.queryTable.mock.calls.slice(1)).toEqual([
      ['ItemTemplet', first],
      ['ItemTemplet', first],
    ]);
  });

  it('le schéma : `describeTable` et ses liens croisés, sans une ligne', () => {
    const d = deps();
    expect(gameTableSchema('ItemTemplet', d)).toEqual({
      ...schema,
      links: { DissolveRewardID: 'RewardTemplet' },
    });
    expect(d.describeTable).toHaveBeenCalledWith('ItemTemplet');
    expect(d.linkTargets).toHaveBeenCalledWith(schema.columns);
    expect(d.queryTable).not.toHaveBeenCalled();
  });
});

/**
 * Un glossaire FACTICE pour l'onglet « Effets » : six statuts (une paire, sa
 * paire irremovable, deux sans miroir), une mécanique sans nom d'icône ni
 * description, et le curé qui va avec — un nom français et une famille, une
 * description, un effet masqué, une création.
 */
const fxEffect = (id: string, en: string, over: Partial<Effect> = {}): Effect => ({
  id,
  name: { ...emptyDict(), en },
  desc: { ...emptyDict(), en: `${en}.` },
  icon: '',
  isDebuff: false,
  origin: 'tooltip',
  tooltips: [id],
  ...over,
});
const EFFECT_CURATED: Record<string, EffectCurated> = {
  '15': { name: { fr: 'Hâte' }, keys: ['HASTE'], tag: 'statBoosts' },
  '27': { desc: { en: 'Cannot take damage.' } },
  '1': { tag: 'utility', hidden: true },
  UNCOUNTERABLE: {
    name: { en: 'Uncounterable' },
    desc: { en: 'Negates reactive strikes.' },
    icon: 'IG_Buff_Seal_Counter',
    keys: ['BT_SEAL_COUNTER', 'UNCOUNTERABLE'],
    tag: 'utility',
  },
};
const effectsDisk = (curated: Record<string, EffectCurated> = EFFECT_CURATED): EffectsDisk => ({
  sources: (): EffectSources => ({
    effects: Object.fromEntries(
      [
        fxEffect('15', 'Increased Speed', {
          name: { ...emptyDict(), en: 'Increased Speed', jp: 'スピードUP', fr: 'Vitesse accrue' },
          icon: 'IG_Buff_Stat_Speed',
          tooltips: ['15', '2015'],
        }),
        fxEffect('26', 'Reduced Speed', {
          name: { ...emptyDict(), en: 'Reduced Speed', fr: 'VIT réduite' },
          icon: 'IG_Buff_Stat_Speed',
          isDebuff: true,
        }),
        fxEffect('1015', 'Increased Speed', {
          icon: 'IG_Buff_Stat_Speed_Interruption',
          irremovable: true,
        }),
        fxEffect('1026', 'Reduced Speed', {
          icon: 'IG_Buff_Stat_Speed_Interruption',
          isDebuff: true,
          irremovable: true,
        }),
        fxEffect('27', 'Invulnerability', { icon: 'IG_Buff_Invincible', desc: emptyDict() }),
        fxEffect('1', 'Burned', { icon: 'IG_Buff_Dot_Burn', isDebuff: true }),
        fxEffect('900', 'Zap', {
          desc: emptyDict(),
          isDebuff: true,
          origin: 'type',
          tooltips: [],
        }),
      ].map((e) => [e.id, e]),
    ),
    byTooltip: {},
    byLabel: {},
    byKey: {
      buff: { 'BT_STAT|ST_SPEED': '15', INCREASED_SPEED: '15', 'BT_STAT|ST_SPEED_IR': '1015' },
      debuff: { 'BT_STAT|ST_SPEED': '26', 'BT_STAT|ST_SPEED_IR': '1026', BT_DOT_BURN: '1' },
    },
    curated,
  }),
});

describe('effectsState — le catalogue des effets, sources injectées', () => {
  it('range comme l’admin : paires miroir, orphelins par nom, la création à sa place', () => {
    const { catalog } = effectsState(effectsDisk());
    expect(catalog.pairs.map((p) => [p.buff.id, p.debuff.id])).toEqual([
      ['15', '26'],
      ['1015', '1026'],
    ]);
    expect(catalog.orphanBuffs.map((e) => e.id)).toEqual(['27', 'UNCOUNTERABLE']);
    expect(catalog.orphanDebuffs.map((e) => e.id)).toEqual(['1', '900']);
  });

  it('une ligne : le nom fusionné, l’origine, la famille et son libellé, les clés des deux index', () => {
    const { catalog } = effectsState(effectsDisk());
    const speed = catalog.pairs[0].buff;
    expect(speed).toMatchObject({
      id: '15',
      name: 'Increased Speed',
      icon: 'IG_Buff_Stat_Speed',
      isDebuff: false,
      origin: 'tooltip',
      iconEditorial: false,
      irremovable: false,
      tag: 'statBoosts',
      family: 'Stat Boosts',
      overridden: true,
      hidden: false,
      noDesc: false,
      keys: ['BT_STAT|ST_SPEED', 'INCREASED_SPEED', 'HASTE'],
    });
    // L'extrait SANS la curation d'un côté, l'entrée du disque de l'autre.
    expect(speed.extracted?.name.en).toBe('Increased Speed');
    expect(speed.extracted?.tooltips).toEqual(['15', '2015']);
    expect(speed.curated).toEqual(EFFECT_CURATED['15']);
    // Sans curation : une entrée vide, pas de famille.
    expect(catalog.pairs[0].debuff).toMatchObject({
      curated: {},
      tag: null,
      family: null,
      overridden: false,
    });
  });

  it('une création n’a pas d’extrait ; un debuff prend le libellé de SON côté', () => {
    const { catalog } = effectsState(effectsDisk());
    const made = catalog.orphanBuffs.find((e) => e.id === 'UNCOUNTERABLE');
    expect(made).toMatchObject({
      name: 'Uncounterable',
      origin: 'curated',
      extracted: null,
      iconEditorial: true,
      keys: ['BT_SEAL_COUNTER', 'UNCOUNTERABLE'],
    });
    const burn = catalog.orphanDebuffs.find((e) => e.id === '1');
    expect(burn).toMatchObject({ tag: 'utility', family: 'Utility Debuffs', hidden: true });
    expect(made?.family).toBe('Utility');
  });

  it('compte les « sans description », curation comprise, et sert ce que la page ne recopie pas', () => {
    const state = effectsState(effectsDisk());
    // 900 n'a ni description extraite ni curée ; 27 n'en a que par le curé.
    expect(state.catalog.orphanDebuffs.find((e) => e.id === '900')?.noDesc).toBe(true);
    expect(state.catalog.orphanBuffs.find((e) => e.id === '27')?.noDesc).toBe(false);
    expect(state.counts).toEqual({
      total: 8,
      statuses: 6,
      mechanics: 1,
      creations: 1,
      curated: 4,
      noDesc: 1,
      hidden: 1,
    });
    expect(state.families.buff).toEqual([
      { value: 'statBoosts', label: 'Stat Boosts' },
      { value: 'supporting', label: 'Supporting' },
      { value: 'utility', label: 'Utility' },
      { value: 'unique', label: 'Unique Buffs' },
    ]);
    expect(state.families.debuff.map((f) => f.label)).toContain('Control Effects (CC)');
    expect(state.origins).toEqual({ tooltip: 'statut', type: 'mécanique', curated: 'création' });
    expect(state.langs).toEqual(LANGS);
    expect(state.sprite).toBe('images/ui/effect');
    // Les icônes déjà portées, une fois chacune, triées : les suggestions du champ.
    expect(state.icons).toEqual([
      'IG_Buff_Dot_Burn',
      'IG_Buff_Invincible',
      'IG_Buff_Seal_Counter',
      'IG_Buff_Stat_Speed',
      'IG_Buff_Stat_Speed_Interruption',
    ]);
  });

  it('les sources du jour se lisent : un catalogue non vide, chaque effet une fois', () => {
    const { catalog, counts } = effectsState();
    const ids = [
      ...catalog.pairs.flatMap((p) => [p.buff.id, p.debuff.id]),
      ...catalog.orphanBuffs.map((e) => e.id),
      ...catalog.orphanDebuffs.map((e) => e.id),
    ];
    expect(ids.length).toBeGreaterThan(100);
    expect(new Set(ids).size).toBe(ids.length);
    expect(counts.total).toBe(ids.length);
  });
});

describe('effectsSearch, effectNewId — la règle de l’admin, jouée au serveur', () => {
  it('rend, par effet qui répond, le champ qui a répondu', () => {
    // « tes » : le milieu de « Vitesse accrue » ne répond plus.
    expect(effectsSearch('tes', effectsDisk())).toEqual({ q: 'tes', matches: {} });
    expect(effectsSearch('spe', effectsDisk()).matches).toEqual({
      '15': { field: 'name.en', value: 'Increased Speed' },
      '26': { field: 'name.en', value: 'Reduced Speed' },
      '1015': { field: 'name.en', value: 'Increased Speed' },
      '1026': { field: 'name.en', value: 'Reduced Speed' },
    });
    expect(effectsSearch('BT_SP', effectsDisk()).matches?.['26']).toEqual({
      field: 'key',
      value: 'BT_STAT|ST_SPEED',
    });
    expect(effectsSearch('スピ', effectsDisk()).matches?.['15']).toEqual({
      field: 'name.jp',
      value: 'スピードUP',
    });
    // Le nom curé se cherche (accent replié), la clé curée aussi.
    expect(effectsSearch('hate', effectsDisk()).matches).toEqual({
      '15': { field: 'name.fr', value: 'Hâte' },
    });
    expect(effectsSearch('haste', effectsDisk()).matches).toEqual({
      '15': { field: 'key', value: 'HASTE' },
    });
    expect(effectsSearch('seal', effectsDisk()).matches).toEqual({
      UNCOUNTERABLE: { field: 'key', value: 'BT_SEAL_COUNTER' },
    });
  });

  it('une saisie vide, ou qui n’est pas un texte : `null`, tout le catalogue reste', () => {
    expect(effectsSearch('  ', effectsDisk())).toEqual({ q: '  ', matches: null });
    expect(effectsSearch(null, effectsDisk())).toEqual({ q: '', matches: null });
  });

  it('forge l’id d’une création comme l’admin, et dit s’il est pris', () => {
    expect(effectNewId(' fixed damage ', effectsDisk())).toEqual({
      id: 'FIXED_DAMAGE',
      exists: false,
    });
    // Pris par une création curée, ou par un effet extrait.
    expect(effectNewId('uncounterable', effectsDisk())).toEqual({
      id: 'UNCOUNTERABLE',
      exists: true,
    });
    expect(effectNewId('15', effectsDisk())).toEqual({ id: '15', exists: true });
    expect(effectNewId('   ', effectsDisk())).toEqual({ id: '', exists: false });
    expect(effectNewId(undefined, effectsDisk())).toEqual({ id: '', exists: false });
  });
});

describe('saveEffects — store et git injectés', () => {
  /** Le disque et les deux écritures, factices : elles notent leurs appels. */
  function deps(
    over: {
      curated?: Record<string, EffectCurated>;
      errors?: Record<string, string[]>;
      git?: Outcome;
    } = {},
  ) {
    const calls = {
      upsert: [] as [string, EffectCurated][],
      git: [] as [string[], string][],
    };
    const fake: EffectsDeps = {
      ...effectsDisk(over.curated),
      upsert: async (id, curated) => {
        calls.upsert.push([id, curated]);
        return over.errors?.[id] ?? [];
      },
      commitPaths: (paths, message) => {
        calls.git.push([paths, message]);
        return over.git ?? { ok: true, log: ['git : fait'] };
      },
    };
    return { calls, fake };
  }

  const change = (
    id: string,
    curated: EffectCurated,
    over: Partial<Omit<EffectChange, 'id' | 'curated'>> = {},
  ): EffectChange => ({ id, curated, was: EFFECT_CURATED[id] ?? {}, ...over });

  it('un effet : le store de l’admin, UN commit du fichier curé, à son nom anglais', async () => {
    const { calls, fake } = deps();
    const out = await saveEffects([change('26', { tag: 'statReduction', note: 'famille' })], fake);

    expect(out).toEqual({
      ok: true,
      log: ['Reduced Speed (26) : entrée curée écrite.', 'git : fait'],
      refused: [],
      stale: [],
      saved: ['26'],
      reasons: {},
    });
    expect(calls.upsert).toEqual([['26', { tag: 'statReduction', note: 'famille' }]]);
    expect(calls.git).toEqual([[['data/curated/effects.json'], 'chore(effects): Reduced Speed']]);
  });

  it('un lot : un appel au store par effet, UN commit « N effets »', async () => {
    const { calls, fake } = deps();
    const out = await saveEffects(
      [
        change('26', { hidden: true }),
        change('15', { ...EFFECT_CURATED['15'], name: { en: 'Hasted' } }),
      ],
      fake,
    );
    expect(out).toMatchObject({ ok: true, saved: ['26', '15'], refused: [] });
    expect(calls.upsert.map(([id]) => id)).toEqual(['26', '15']);
    expect(calls.git).toEqual([[['data/curated/effects.json'], 'chore(effects): 2 effets']]);
    // Le commit et le journal portent le nom d'APRÈS l'enregistrement.
    expect(out.log).toContain('Hasted (15) : entrée curée écrite.');
  });

  it('ramène l’entrée à son contrat : blancs retirés, vides et champs inconnus absents', async () => {
    const { calls, fake } = deps();
    await saveEffects(
      [
        change('26', {
          name: { en: '  Slowed ', fr: '   ', xx: 'hors langues' },
          desc: {},
          icon: ' IG_Buff_Slow ',
          keys: [' SLOW ', '', 'SLOWED'],
          tag: ' ',
          hidden: false,
          note: '',
          intrus: 1,
        } as unknown as EffectCurated),
      ],
      fake,
    );
    expect(calls.upsert).toEqual([
      ['26', { name: { en: 'Slowed' }, icon: 'IG_Buff_Slow', keys: ['SLOW', 'SLOWED'] }],
    ]);
  });

  it('tout vider retire l’entrée curée d’un effet extrait', async () => {
    const { calls, fake } = deps();
    const out = await saveEffects([change('15', {})], fake);
    expect(calls.upsert).toEqual([['15', {}]]);
    expect(out.log[0]).toBe('Increased Speed (15) : entrée curée retirée, l’extrait fait foi.');
    expect(calls.git[0][1]).toBe('chore(effects): Increased Speed');
  });

  it('le disque porte déjà l’entrée : ni store ni commit, et ce n’est pas un échec', async () => {
    const { calls, fake } = deps();
    // La même entrée, ses langues dans un autre ordre.
    const out = await saveEffects(
      [change('15', { tag: 'statBoosts', keys: ['HASTE'], name: { fr: 'Hâte' } })],
      fake,
    );
    expect(out).toMatchObject({
      ok: true,
      log: ['Rien à enregistrer : le disque porte déjà ces valeurs.'],
      saved: [],
      refused: [],
    });
    expect(calls).toEqual({ upsert: [], git: [] });
  });

  it('le disque a changé depuis le chargement : refusé et `stale`, les autres partent', async () => {
    const { calls, fake } = deps();
    const out = await saveEffects(
      [
        change('15', { tag: 'utility' }, { was: { tag: 'statBoosts' } }),
        change('26', { tag: 'cc' }),
      ],
      fake,
    );
    expect(out.ok).toBe(false);
    expect(out.saved).toEqual(['26']);
    expect(out.refused).toEqual(['15']);
    expect(out.stale).toEqual(['15']);
    expect(out.reasons).toEqual({
      '15': 'Increased Speed (15) : le disque a changé depuis le chargement.',
    });
    expect(calls.upsert.map(([id]) => id)).toEqual(['26']);
    expect(calls.git).toEqual([[['data/curated/effects.json'], 'chore(effects): Reduced Speed']]);
  });

  it('les refus du store sont rendus tels quels, sans commit', async () => {
    const { calls, fake } = deps({ errors: { '26': ['effectCurated[26].tag — attendu string'] } });
    const out = await saveEffects([change('26', { tag: 'cc' })], fake);
    expect(out).toEqual({
      ok: false,
      log: [
        'REFUSÉ — Reduced Speed (26) : effectCurated[26].tag — attendu string',
        'Rien à enregistrer.',
      ],
      refused: ['26'],
      stale: [],
      saved: [],
      reasons: { '26': 'Reduced Speed (26) : effectCurated[26].tag — attendu string' },
    });
    expect(calls.git).toEqual([]);
  });

  it('une création : un id nouveau, forgé comme l’admin, un nom anglais', async () => {
    const { calls, fake } = deps();
    const made = { name: { en: 'Fixed Damage' }, keys: ['FIXED_DAMAGE'], isDebuff: false };
    const out = await saveEffects([change('FIXED_DAMAGE', made, { create: true })], fake);
    expect(out).toMatchObject({ ok: true, saved: ['FIXED_DAMAGE'], refused: [] });
    expect(out.log[0]).toBe('Fixed Damage (FIXED_DAMAGE) : effet créé.');
    expect(calls.upsert).toEqual([['FIXED_DAMAGE', made]]);
    expect(calls.git[0][1]).toBe('chore(effects): Fixed Damage');
  });

  it('une création en doublon est refusée : l’id d’un effet extrait, ou d’une création', async () => {
    const { calls, fake } = deps();
    const out = await saveEffects(
      [
        change('15', { name: { en: 'Mine' } }, { create: true, was: {} }),
        change('UNCOUNTERABLE', { name: { en: 'Mine' } }, { create: true, was: {} }),
      ],
      fake,
    );
    expect(out.ok).toBe(false);
    expect(out.refused).toEqual(['15', 'UNCOUNTERABLE']);
    expect(out.stale).toEqual([]);
    expect(out.reasons['15']).toBe('15 existe déjà : l’ouvrir pour l’éditer, pas le créer.');
    expect(calls).toEqual({ upsert: [], git: [] });
  });

  it('une création sans nom anglais, ou sous un id que l’admin n’aurait pas forgé : refusée', async () => {
    const { calls, fake } = deps();
    const out = await saveEffects(
      [
        change('NO_NAME', { desc: { en: 'x' } }, { create: true }),
        change('bad id', { name: { en: 'Bad' } }, { create: true }),
        change('', { name: { en: 'Empty' } }, { create: true }),
        // Une création du disque ne se vide pas non plus.
        change('UNCOUNTERABLE', {}),
      ],
      fake,
    );
    expect(out.refused).toEqual(['NO_NAME', 'bad id', '', 'UNCOUNTERABLE']);
    expect(out.reasons).toEqual({
      NO_NAME: 'NO_NAME (NO_NAME) : une création porte au moins un nom anglais.',
      'bad id': 'id de création invalide : « bad id » (attendu BAD_ID).',
      '': 'id de création invalide : «  » (attendu un id).',
      UNCOUNTERABLE: 'Uncounterable (UNCOUNTERABLE) : une création porte au moins un nom anglais.',
    });
    expect(calls).toEqual({ upsert: [], git: [] });
  });

  it('un effet inconnu sans `create`, un lot vide : rien ne s’écrit', async () => {
    const { calls, fake } = deps();
    const ghost = await saveEffects([change('GHOST', { name: { en: 'Ghost' } })], fake);
    expect(ghost).toMatchObject({ ok: false, refused: ['GHOST'] });
    expect(ghost.reasons.GHOST).toBe('effet inconnu : GHOST.');
    for (const none of [[], null as unknown as EffectChange[]])
      expect(await saveEffects(none, fake)).toMatchObject({
        ok: false,
        log: ['Aucune modification à enregistrer.'],
      });
    expect(calls).toEqual({ upsert: [], git: [] });
  });

  it('un commit qui échoue : l’échec est rendu, l’effet reste « enregistré » sur le disque', async () => {
    const { fake } = deps({ git: { ok: false, log: ['git commit a échoué : hook'] } });
    const out = await saveEffects([change('26', { hidden: true })], fake);
    expect(out).toMatchObject({ ok: false, saved: ['26'], refused: [] });
    expect(out.log.at(-1)).toBe('git commit a échoué : hook');
  });
});

/**
 * Un petit catalogue servi pour l'onglet « Items » : une gemme du jeu, un
 * matériau sans description ni icône, une monnaie, un costume masqué, une
 * création bakée dont l'id est LITTÉRALEMENT encodé — et le curé qui va avec,
 * plus une création que le catalogue ne porte pas encore.
 */
const itemLang = (dict: Record<string, string>): LangDict => dict as LangDict;
const catalogEntry = (en: string, over: Partial<CatalogEntry> = {}): CatalogEntry => ({
  kind: 'item',
  name: { ...emptyDict(), en },
  desc: { ...emptyDict(), en: `${en}.` },
  icon: 'TI_Item',
  grade: 'normal',
  type: 'material',
  star: 0,
  ...over,
});
const ITEM_CATALOG: Record<string, CatalogEntry> = {
  '15001': catalogEntry('Stage 1 Attack Gem', { type: 'gem', star: 1, icon: 'TI_GEM_ATK_1' }),
  '20001': catalogEntry('Mystery Dust', { desc: undefined, icon: '', grade: 'rare' }),
  SYS_ASSET_GOLD: catalogEntry('Gold', { kind: 'goods', type: 'goods', icon: 'CM_TopMenu_Gold' }),
  COSTUME_1: catalogEntry('Shutendouji Rin', {
    kind: 'costume',
    type: 'costume',
    grade: 'rare',
    hidden: true,
  }),
  'Hero%20Piece': catalogEntry('Hero Piece', {
    kind: 'custom',
    type: 'custom',
    icon: 'CM_Piece_Frame',
  }),
};
const ITEM_CURATED: Record<string, ItemCurated> = {
  SYS_ASSET_GOLD: { icon: 'CM_TopMenu_Gold', note: 'icône du menu' },
  COSTUME_1: { hidden: true },
  'Hero%20Piece': {
    name: itemLang({ en: 'Hero Piece', fr: 'Fragment de Héros' }),
    icon: 'CM_Piece_Frame',
  },
  TI_Item_Stamina: { name: itemLang({ en: 'Stamina' }), icon: 'TI_Item_Stamina' },
};
const itemsDisk = (
  over: {
    catalog?: Record<string, CatalogEntry>;
    curated?: Record<string, ItemCurated>;
    sprites?: string[];
    hasSprites?: boolean;
    tables?: string[];
  } = {},
): ItemsDisk => ({
  catalog: () => over.catalog ?? ITEM_CATALOG,
  curated: () => over.curated ?? ITEM_CURATED,
  unusedIcons: () => over.sprites ?? ['TI_Class_Mage', 'TI_Item_New'],
  hasSprites: () => over.hasSprites ?? true,
  tables: () => over.tables ?? ['ItemTemplet', 'TextItem', 'TextSystem'],
});

describe('itemsState — le catalogue servi sous l’overlay du curé, lectures injectées', () => {
  it('les lignes : l’overlay de l’admin, la création pas encore bakée en queue', () => {
    const { items } = itemsState(itemsDisk());
    expect(items.map((r) => r.id)).toEqual([
      '15001',
      '20001',
      'SYS_ASSET_GOLD',
      'COSTUME_1',
      'Hero%20Piece',
      'TI_Item_Stamina',
    ]);
    const row = (id: string) => items.find((r) => r.id === id);

    expect(row('15001')).toEqual({
      id: '15001',
      name: 'Stage 1 Attack Gem',
      type: 'gem',
      kind: 'item',
      grade: 'normal',
      star: 1,
      icon: 'TI_GEM_ATK_1',
      hasDesc: true,
      hidden: false,
      overridden: false,
      base: {
        name: ITEM_CATALOG['15001'].name,
        desc: ITEM_CATALOG['15001'].desc,
        icon: 'TI_GEM_ATK_1',
      },
      curated: {},
    });
    // Ni description ni icône : ce que les filtres « sans … » liront.
    expect(row('20001')).toMatchObject({ hasDesc: false, icon: '', overridden: false });
    expect(row('COSTUME_1')).toMatchObject({ hidden: true, overridden: true });
    // L'id littéralement encodé, tel quel ; l'entrée curée est celle du disque.
    expect(row('Hero%20Piece')).toMatchObject({ name: 'Hero Piece', kind: 'custom' });
    expect(row('Hero%20Piece')?.curated).toBe(ITEM_CURATED['Hero%20Piece']);
    // Une création que le catalogue ne porte pas : pas de base, tout vient du curé.
    expect(row('TI_Item_Stamina')).toEqual({
      id: 'TI_Item_Stamina',
      name: 'Stamina',
      type: 'custom',
      kind: 'custom',
      grade: 'normal',
      star: 0,
      icon: 'TI_Item_Stamina',
      hasDesc: false,
      hidden: false,
      overridden: true,
      base: null,
      curated: ITEM_CURATED.TI_Item_Stamina,
    });
  });

  it('le curé prime sur le catalogue : nom, icône, masquage', () => {
    const { items } = itemsState(
      itemsDisk({
        curated: {
          '20001': {
            name: itemLang({ en: 'Dust' }),
            desc: itemLang({ en: 'Fine dust.' }),
            icon: 'TI_Dust',
            hidden: true,
          },
        },
      }),
    );
    expect(items.find((r) => r.id === '20001')).toMatchObject({
      name: 'Dust',
      icon: 'TI_Dust',
      hasDesc: true,
      hidden: true,
      overridden: true,
      // Le placeholder reste ce que le catalogue servi porte.
      base: { name: ITEM_CATALOG['20001'].name, icon: '' },
    });
  });

  it('les comptes de l’en-tête, les types présents, les langues du jeu, le dossier des icônes', () => {
    const s = itemsState(itemsDisk());
    expect(s.counts).toEqual({ items: 5, currencies: 1, noDesc: 2, unused: 2, curated: 4 });
    expect(s.types).toEqual(['costume', 'custom', 'gem', 'goods', 'material']);
    expect(s.langs).toEqual(['en', 'jp', 'kr', 'zh', 'fr', 'es']);
    expect(s.sprite).toBe('images/items');
    expect(s.unused).toEqual(['TI_Class_Mage', 'TI_Item_New']);
    expect(s.hasSprites).toBe(true);
  });

  it('`canBake` : les deux tables que le rebake relit sont là — sinon l’état se lit quand même', () => {
    expect(itemsState(itemsDisk()).canBake).toBe(true);
    for (const tables of [[], ['ItemTemplet'], ['TextSystem', 'TextItem']]) {
      const s = itemsState(itemsDisk({ tables }));
      expect(s.canBake, tables.join()).toBe(false);
      expect(s.items).toHaveLength(6);
      expect(s.noBake).toBe(NO_ITEM_BAKE);
    }
  });

  it('sans images du jeu : aucun sprite, et l’état le dit', () => {
    const s = itemsState(itemsDisk({ sprites: [], hasSprites: false }));
    expect(s.unused).toEqual([]);
    expect(s.hasSprites).toBe(false);
    expect(s.counts.unused).toBe(0);
  });

  it('relit le DISQUE à chaque appel : un rebake se voit sans relancer quick', () => {
    let catalog = ITEM_CATALOG;
    const disk = { ...itemsDisk(), catalog: () => catalog };
    expect(itemsState(disk).items.find((r) => r.id === '20001')?.name).toBe('Mystery Dust');
    catalog = { ...ITEM_CATALOG, '20001': catalogEntry('Stardust') };
    expect(itemsState(disk).items.find((r) => r.id === '20001')?.name).toBe('Stardust');
    // Et la lecture de la route est le fichier du dépôt, pas l'import statique.
    const real = ITEMS_DISK.catalog();
    expect(Object.keys(real).length).toBeGreaterThan(1000);
    expect(real['Hero%20Piece']?.kind).toBe('custom');
    expect(ITEMS_DISK.catalog()).not.toBe(real);
  });
});

describe('itemsSearch, resolveText — la règle d’Effets et les textes du jeu', () => {
  it('par début de mot, sur le nom anglais : `Hero` trouve `Hero%20Piece`, son id intact', () => {
    expect(itemsSearch('Hero', itemsDisk())).toEqual({
      q: 'Hero',
      matches: { 'Hero%20Piece': { field: 'name.en', value: 'Hero Piece' } },
    });
    expect(itemsSearch('pie', itemsDisk()).matches).toEqual({
      'Hero%20Piece': { field: 'name.en', value: 'Hero Piece' },
    });
    // Jamais par le milieu d'un mot.
    expect(itemsSearch('ero', itemsDisk()).matches).toEqual({});
  });

  it('par l’id, exact ou par ses mots — et les sprites à intégrer par leur nom', () => {
    expect(itemsSearch('15001', itemsDisk()).matches).toEqual({
      '15001': { field: 'id', value: '15001' },
    });
    expect(itemsSearch('sys_asset', itemsDisk()).matches).toEqual({
      SYS_ASSET_GOLD: { field: 'id', value: 'SYS_ASSET_GOLD' },
    });
    expect(itemsSearch('ti_class', itemsDisk()).matches).toEqual({
      TI_Class_Mage: { field: 'id', value: 'TI_Class_Mage' },
    });
    // Le nom effectif : le curé prime.
    expect(Object.keys(itemsSearch('stamina', itemsDisk()).matches ?? {})).toEqual([
      'TI_Item_Stamina',
    ]);
  });

  it('une saisie vide ne filtre rien', () => {
    expect(itemsSearch('  ', itemsDisk())).toEqual({ q: '  ', matches: null });
    expect(itemsSearch(null, itemsDisk())).toEqual({ q: '', matches: null });
  });

  it('`resolveText` : la clé sans blancs, le texte du résolveur, `null` sans clé', () => {
    const asked: string[] = [];
    const resolveKey = (key: string) => {
      asked.push(key);
      return key === 'SYS_STAMINA' ? itemLang({ en: 'Stamina', fr: 'Endurance' }) : null;
    };
    expect(resolveText(' SYS_STAMINA ', resolveKey)).toEqual({
      key: 'SYS_STAMINA',
      text: { en: 'Stamina', fr: 'Endurance' },
    });
    expect(resolveText('NOPE', resolveKey)).toEqual({ key: 'NOPE', text: null });
    expect(resolveText('  ', resolveKey)).toEqual({ key: '', text: null });
    expect(resolveText(null, resolveKey)).toEqual({ key: '', text: null });
    expect(asked).toEqual(['SYS_STAMINA', 'NOPE']);
  });
});

describe('saveItems — store, bake et git factices', () => {
  /** Le disque et les trois écritures, factices : elles notent leurs appels, dans l'ordre. */
  function deps(
    over: {
      curated?: Record<string, ItemCurated>;
      tables?: string[];
      errors?: Record<string, string[]>;
      bakeFails?: Record<string, string>;
      git?: Outcome;
    } = {},
  ) {
    const calls = {
      order: [] as string[],
      upsert: [] as [string, ItemCurated][],
      bake: [] as string[],
      git: [] as [string[], string][],
    };
    const fake: ItemsDeps = {
      ...itemsDisk({ curated: over.curated, tables: over.tables }),
      upsert: async (id, curated) => {
        calls.order.push(`upsert ${id}`);
        calls.upsert.push([id, curated]);
        return over.errors?.[id] ?? [];
      },
      bake: async (id) => {
        calls.order.push(`bake ${id}`);
        calls.bake.push(id);
        if (over.bakeFails?.[id]) throw new Error(over.bakeFails[id]);
      },
      commitPaths: (paths, message) => {
        calls.order.push('git');
        calls.git.push([paths, message]);
        return over.git ?? { ok: true, log: ['git : fait'] };
      },
    };
    return { calls, fake };
  }

  const change = (
    id: string,
    curated: ItemCurated,
    over: Partial<Omit<ItemChange, 'id' | 'curated'>> = {},
  ): ItemChange => ({ id, curated, was: ITEM_CURATED[id] ?? {}, ...over });
  const BOTH = ['data/curated/items.json', 'data/generated/items.json'];

  it('un item : le store PUIS le rebake, UN commit des DEUX fichiers, à son nom anglais', async () => {
    const { calls, fake } = deps();
    const out = await saveItems([change('20001', { desc: itemLang({ en: 'Dust.' }) })], fake);

    expect(out).toEqual({
      ok: true,
      log: ['Mystery Dust (20001) : entrée curée écrite, catalogue rebaké.', 'git : fait'],
      refused: [],
      stale: [],
      saved: ['20001'],
      reasons: {},
    });
    expect(calls.upsert).toEqual([['20001', { desc: { en: 'Dust.' } }]]);
    expect(calls.order).toEqual(['upsert 20001', 'bake 20001', 'git']);
    expect(calls.git).toEqual([[BOTH, 'chore(items): Mystery Dust']]);
  });

  it('un lot : store et rebake PAR item, UN commit « N items »', async () => {
    const { calls, fake } = deps();
    const out = await saveItems(
      [
        change('20001', { name: itemLang({ en: 'Dust' }) }),
        change('15001', { note: 'la première gemme' }),
      ],
      fake,
    );
    expect(out).toMatchObject({ ok: true, saved: ['20001', '15001'], refused: [] });
    expect(calls.order).toEqual([
      'upsert 20001',
      'bake 20001',
      'upsert 15001',
      'bake 15001',
      'git',
    ]);
    expect(calls.git).toEqual([[BOTH, 'chore(items): 2 items']]);
    // Le journal porte le nom d'APRÈS l'enregistrement.
    expect(out.log).toContain('Dust (20001) : entrée curée écrite, catalogue rebaké.');
  });

  it('sans tables du jeu : refusé AVANT toute écriture — pas de curé en avance sur le catalogue', async () => {
    for (const tables of [[], ['ItemTemplet'], ['TextSystem']]) {
      const { calls, fake } = deps({ tables });
      const out = await saveItems([change('20001', { note: 'x' })], fake);
      expect(out).toEqual({
        ok: false,
        log: [`Rien n’est écrit — ${NO_ITEM_BAKE}.`],
        refused: [],
        stale: [],
        saved: [],
        reasons: {},
      });
      expect(calls.order, tables.join()).toEqual([]);
    }
    expect(NO_ITEM_BAKE).toContain('tables du jeu absentes');
  });

  it('`stale` : le disque ne porte plus l’entrée que la page avait chargée, rien n’est écrit', async () => {
    const { calls, fake } = deps();
    const out = await saveItems(
      [change('SYS_ASSET_GOLD', { icon: 'TI_Gold' }, { was: { icon: 'CM_Old' } })],
      fake,
    );
    expect(out).toMatchObject({ ok: false, stale: ['SYS_ASSET_GOLD'], saved: [] });
    expect(out.refused).toEqual(['SYS_ASSET_GOLD']);
    expect(out.reasons.SYS_ASSET_GOLD).toBe(
      'Gold (SYS_ASSET_GOLD) : le disque a changé depuis le chargement.',
    );
    expect(calls.order).toEqual([]);
    // Un item sans entrée, que la page croyait curé : périmé aussi.
    const other = deps();
    expect(
      (await saveItems([change('15001', { note: 'x' }, { was: { hidden: true } })], other.fake))
        .stale,
    ).toEqual(['15001']);
  });

  it('compacte comme l’éditeur de l’admin : langues vides et blancs retirés, `hidden` seulement vrai', async () => {
    const { calls, fake } = deps();
    await saveItems(
      [
        change('20001', {
          name: { en: '  Dust ', fr: '   ', xx: 'hors langues' },
          desc: {},
          icon: ' TI_Dust ',
          hidden: false,
          note: '  à revoir ',
          intrus: 1,
        } as unknown as ItemCurated),
        change('15001', { hidden: true, note: '   ' }),
      ],
      fake,
    );
    expect(calls.upsert).toEqual([
      ['20001', { name: { en: 'Dust' }, icon: 'TI_Dust', note: 'à revoir' }],
      ['15001', { hidden: true }],
    ]);
  });

  it('une entrée vide supprime l’override — et une création sort alors du catalogue', async () => {
    const { calls, fake } = deps();
    const out = await saveItems(
      [
        change('SYS_ASSET_GOLD', { name: itemLang({ en: ' ' }), icon: '', note: '' }),
        change('Hero%20Piece', {}),
      ],
      fake,
    );
    expect(calls.upsert).toEqual([
      ['SYS_ASSET_GOLD', {}],
      ['Hero%20Piece', {}],
    ]);
    expect(calls.bake).toEqual(['SYS_ASSET_GOLD', 'Hero%20Piece']);
    expect(out.log.slice(0, 2)).toEqual([
      'Gold (SYS_ASSET_GOLD) : entrée curée retirée, le jeu fait foi.',
      'Hero Piece (Hero%20Piece) : entrée curée retirée — une création, elle sort du catalogue.',
    ]);
  });

  it('`Hero%20Piece` passe TEL QUEL au store et au rebake : ni décodé, ni ré-encodé', async () => {
    const { calls, fake } = deps();
    const out = await saveItems(
      [change('Hero%20Piece', { ...ITEM_CURATED['Hero%20Piece'], note: 'fragments' })],
      fake,
    );
    expect(out).toMatchObject({ ok: true, saved: ['Hero%20Piece'] });
    expect(calls.upsert[0][0]).toBe('Hero%20Piece');
    expect(calls.bake).toEqual(['Hero%20Piece']);
    expect(calls.git).toEqual([[BOTH, 'chore(items): Hero Piece']]);
  });

  it('une création : un id nouveau, un nom anglais — l’item est créé', async () => {
    const { calls, fake } = deps();
    const out = await saveItems(
      [
        change(
          'TI_Item_New',
          { name: itemLang({ en: 'New Thing' }), icon: 'TI_Item_New' },
          { create: true },
        ),
      ],
      fake,
    );
    expect(out).toMatchObject({ ok: true, saved: ['TI_Item_New'], refused: [] });
    expect(out.log[0]).toBe('New Thing (TI_Item_New) : item créé, catalogue rebaké.');
    expect(calls.order).toEqual(['upsert TI_Item_New', 'bake TI_Item_New', 'git']);
    expect(calls.git).toEqual([[BOTH, 'chore(items): New Thing']]);
  });

  it('une création sans nom anglais est refusée, rien n’est écrit', async () => {
    const { calls, fake } = deps();
    const out = await saveItems(
      [
        change(
          'TI_Item_New',
          { name: itemLang({ fr: 'Chose' }), icon: 'TI_Item_New' },
          { create: true },
        ),
      ],
      fake,
    );
    expect(out).toMatchObject({ ok: false, refused: ['TI_Item_New'], saved: [] });
    expect(out.reasons.TI_Item_New).toBe(
      'TI_Item_New (TI_Item_New) : une création porte au moins un nom anglais.',
    );
    expect(calls.order).toEqual([]);
    // Et une création que le catalogue ne porte pas encore ne se vide pas non plus.
    const live = deps();
    const emptied = await saveItems([change('TI_Item_Stamina', {})], live.fake);
    expect(emptied.reasons.TI_Item_Stamina).toMatch(/une création porte au moins un nom anglais/);
    expect(live.calls.order).toEqual([]);
  });

  it('l’id d’une création : ni espace, ni %, ni /, ni vide', async () => {
    for (const id of ['My Item', 'A%20B', 'a/b', '', 'tab\tbed']) {
      const { calls, fake } = deps();
      const out = await saveItems(
        [change(id, { name: itemLang({ en: 'X' }) }, { create: true })],
        fake,
      );
      expect(out.reasons[id], id).toBe(
        `id de création invalide : « ${id} » (ni espace, ni %, ni /).`,
      );
      expect(out.ok).toBe(false);
      expect(calls.order, id).toEqual([]);
    }
  });

  it('une création sur un id qui existe — au catalogue ou au curé — est refusée', async () => {
    for (const id of ['15001', 'Hero%20Piece', 'TI_Item_Stamina']) {
      const { calls, fake } = deps();
      const out = await saveItems(
        [change(id, { name: itemLang({ en: 'X' }) }, { create: true, was: {} })],
        fake,
      );
      expect(out.reasons[id], id).toBe(`${id} existe déjà : l’ouvrir pour l’éditer, pas le créer.`);
      expect(calls.order, id).toEqual([]);
    }
  });

  it('un id inconnu, hors création, est refusé', async () => {
    const { calls, fake } = deps();
    const out = await saveItems([change('99999', { note: 'x' })], fake);
    expect(out.reasons['99999']).toBe('item inconnu : 99999.');
    expect(calls.order).toEqual([]);
  });

  it('les refus du store sont rendus tels quels : ni rebake, ni commit', async () => {
    const { calls, fake } = deps({
      errors: { '20001': ['itemCurated[20001].icon — attendu string'] },
    });
    const out = await saveItems([change('20001', { icon: 'TI_Dust' })], fake);
    expect(out).toMatchObject({ ok: false, refused: ['20001'], saved: [] });
    expect(out.reasons['20001']).toBe(
      'Mystery Dust (20001) : itemCurated[20001].icon — attendu string',
    );
    expect(calls.order).toEqual(['upsert 20001']);
    expect(out.log.at(-1)).toBe('Rien à enregistrer.');
  });

  it('un item refusé n’arrête pas le lot : les autres partent, le résultat est en échec', async () => {
    const { calls, fake } = deps();
    const out = await saveItems(
      [
        change('99999', { note: 'x' }),
        change('20001', { note: 'gardé' }),
        change('SYS_ASSET_GOLD', { icon: 'X' }, { was: {} }),
      ],
      fake,
    );
    expect(out).toMatchObject({
      ok: false,
      saved: ['20001'],
      refused: ['99999', 'SYS_ASSET_GOLD'],
      stale: ['SYS_ASSET_GOLD'],
    });
    expect(calls.order).toEqual(['upsert 20001', 'bake 20001', 'git']);
    expect(calls.git).toEqual([[BOTH, 'chore(items): Mystery Dust']]);
  });

  it('un rebake qui lève malgré les tables : l’item est refusé avec sa raison, le curé écrit est committé', async () => {
    const { calls, fake } = deps({ bakeFails: { '20001': 'ItemTemplet illisible' } });
    const out = await saveItems(
      [change('20001', { note: 'x' }), change('15001', { note: 'y' })],
      fake,
    );
    expect(out).toMatchObject({ ok: false, saved: ['15001'], refused: ['20001'], stale: [] });
    expect(out.reasons['20001']).toBe(
      'Mystery Dust (20001) : curé enregistré, mais rebake de items.json échoué : ItemTemplet illisible',
    );
    // Le fichier curé est modifié : il ne reste pas derrière, hors commit.
    expect(calls.order).toEqual([
      'upsert 20001',
      'bake 20001',
      'upsert 15001',
      'bake 15001',
      'git',
    ]);
    expect(calls.git).toEqual([[BOTH, 'chore(items): 2 items']]);
  });

  it('rien à écrire : le disque porte déjà ces valeurs, ni store ni commit', async () => {
    const { calls, fake } = deps();
    const out = await saveItems(
      [change('SYS_ASSET_GOLD', { icon: ' CM_TopMenu_Gold ', note: 'icône du menu' })],
      fake,
    );
    expect(out).toEqual({
      ok: true,
      log: ['Rien à enregistrer : le disque porte déjà ces valeurs.'],
      refused: [],
      stale: [],
      saved: [],
      reasons: {},
    });
    expect(calls.order).toEqual([]);
    expect((await saveItems([], fake)).log).toEqual(['Aucune modification à enregistrer.']);
  });

  it('un commit qui échoue rend le lot en échec, son journal joint', async () => {
    const { fake } = deps({ git: { ok: false, log: ['git commit a échoué : verrou'] } });
    const out = await saveItems([change('20001', { note: 'x' })], fake);
    expect(out.ok).toBe(false);
    expect(out.saved).toEqual(['20001']);
    expect(out.log.at(-1)).toBe('git commit a échoué : verrou');
  });
});

describe('comicLangOf — la langue que dit le nom', () => {
  it('lit les trois suffixes, en capitales comme en minuscules', () => {
    expect(comicLangOf('outerplane_comic08_EN.png')).toBe('EN');
    expect(comicLangOf('outerplane_comic08_JP.png')).toBe('JP');
    expect(comicLangOf('outerplane_comic08_KR.png')).toBe('KR');
    expect(comicLangOf('outerplane_comic04_en.jpg')).toBe('EN');
    expect(comicLangOf('outerplane_comic04_jp.png')).toBe('JP');
    expect(comicLangOf('outerplane_comic04_kr.webp')).toBe('KR');
  });

  it('rend `null` sans suffixe, ou quand il n’est pas juste avant l’extension', () => {
    expect(comicLangOf('comic01.jpg')).toBeNull();
    expect(comicLangOf('20260710_121053.jpg')).toBeNull();
    expect(comicLangOf('yami_EN_.png')).toBeNull();
    expect(comicLangOf('comic_EN_final.png')).toBeNull();
    expect(comicLangOf('comicEN.png')).toBeNull();
    expect(comicLangOf('comic_FR.png')).toBeNull();
  });
});

describe('groupComics — une ligne par BD, une case par langue', () => {
  it('trois fichiers d’une BD : une ligne à trois cases', () => {
    const [en, jp, kr] = ['c08_EN.png', 'c08_JP.png', 'c08_kr.png'].map(page);

    expect(groupComics([kr, en, jp])).toEqual([{ stem: 'c08', slots: { EN: en, JP: jp, KR: kr } }]);
  });

  it('deux BD mélangées : deux lignes, dans l’ordre d’arrivée', () => {
    const [a, b, c, d, e] = ['c08_EN.png', 'c07_JP.png', 'c08_KR.png', 'c07_EN.png', 'c08_JP.png'];

    expect(groupComics([a, b, c, d, e].map(page))).toEqual([
      { stem: 'c08', slots: { EN: page(a), KR: page(c), JP: page(e) } },
      { stem: 'c07', slots: { JP: page(b), EN: page(d) } },
    ]);
  });

  it('un fichier sans suffixe reste seul, dans la langue par défaut', () => {
    const files = ['c08_EN.png', 'c08.jpg', 'comic01.jpg'].map(page);

    expect(groupComics(files, 'JP')).toEqual([
      { stem: 'c08', slots: { EN: files[0], JP: files[1] } },
      { stem: 'comic01', slots: { JP: files[2] } },
    ]);
    expect(groupComics([page('comic01.jpg')])).toEqual([
      { stem: 'comic01', slots: { EN: page('comic01.jpg') } },
    ]);
  });

  it('une langue donnée à la main passe avant celle du nom', () => {
    const fixed = { ...page('c08_EN.png'), lang: 'KR' as const };

    expect(groupComics([fixed])).toEqual([{ stem: 'c08', slots: { KR: fixed } }]);
  });

  it('deux planches pour la même case : la seconde ouvre une ligne, rien n’est écrasé', () => {
    const [png, jpg] = ['c08_EN.png', 'c08_EN.jpg'].map(page);

    expect(groupComics([png, jpg])).toEqual([
      { stem: 'c08', slots: { EN: png } },
      { stem: 'c08', slots: { EN: jpg } },
    ]);
  });
});

describe('addComics — écritures injectées', () => {
  const dirs: string[] = [];
  afterEach(() => {
    for (const d of dirs.splice(0)) rmSync(d, { recursive: true, force: true });
  });

  /** Un pool temporaire, et la chaîne factice : elle note ses appels, rien d'autre. */
  function deps(over: Partial<ComicsDeps> = {}) {
    const dir = mkdtempSync(join(tmpdir(), 'quick-comics-'));
    dirs.push(dir);
    const calls = { chain: [] as string[], git: [] as [string[], string][] };
    const fake: ComicsDeps = {
      dir,
      collect: async () => {
        calls.chain.push('collect');
        return { made: 4, skipped: 0 };
      },
      pushEditorial: () => void calls.chain.push('editorial'),
      pushAssets: () => {
        calls.chain.push('assets');
        return { ok: true, error: '' };
      },
      syncSeed: () => {
        calls.chain.push('seed');
        return 'mis à jour';
      },
      commitPaths: (paths, message) => {
        calls.git.push([paths, message]);
        return { ok: true, log: ['git : fait'] };
      },
      ...over,
    };
    return { dir, calls, fake };
  }

  it('deux langues : chaque fichier dans SON dossier, la chaîne UNE fois, UN commit', async () => {
    const { dir, calls, fake } = deps();
    const out = await addComics(
      [
        {
          lang: 'EN',
          files: [page('outerplane_comic08_EN.png'), page('outerplane_comic07_EN.png')],
        },
        { lang: 'KR', files: [page('outerplane_comic08_KR.png')] },
      ],
      undefined,
      fake,
    );

    expect(out.ok).toBe(true);
    expect(readdirSync(dir).sort()).toEqual(['EN', 'KR']);
    expect(readdirSync(join(dir, 'EN')).sort()).toEqual([
      'outerplane_comic07_EN.png',
      'outerplane_comic08_EN.png',
    ]);
    expect(readdirSync(join(dir, 'KR'))).toEqual(['outerplane_comic08_KR.png']);
    // Le contenu est celui envoyé, décodé.
    expect(readFileSync(join(dir, 'KR', 'outerplane_comic08_KR.png'), 'utf8')).toBe(
      'outerplane_comic08_KR.png',
    );
    expect(calls.chain).toEqual(['collect', 'editorial', 'assets', 'seed']);
    expect(calls.git).toEqual([
      [
        ['data/generated/comics.json', 'datagen/assets/pushed.json'],
        'chore(assets): 4-comics comic08, comic07 (EN, KR)',
      ],
    ]);
    expect(out.log).toEqual([
      'déposé : EN/outerplane_comic08_EN.png',
      'déposé : EN/outerplane_comic07_EN.png',
      'déposé : KR/outerplane_comic08_KR.png',
      'conversion webp : 4 produites, 0 déjà à jour.',
      'originaux sauvegardés sur R2 (editorial:push).',
      'poussé sur R2 — la galerie lit le manifeste à la requête.',
      'repli committé : mis à jour.',
      'git : fait',
    ]);
  });

  it('le message nomme les BD sans suffixe, les langues dans leur ordre, et abrège au-delà de trois', async () => {
    const { calls, fake } = deps();
    await addComics(
      [
        { lang: 'KR', files: ['a_KR.png', 'b.png'].map(page) },
        { lang: 'JP', files: ['a_jp.png', 'c_JP.png', 'd_JP.png', 'e_JP.png'].map(page) },
      ],
      undefined,
      fake,
    );

    expect(calls.git[0][1]).toBe('chore(assets): 4-comics a, b, c et 2 autres (JP, KR)');
  });

  it('nom refusé : AUCUN fichier écrit, pas même ceux d’avant, ni chaîne ni commit', async () => {
    const { dir, calls, fake } = deps();
    const out = await addComics(
      [
        { lang: 'EN', files: [page('ok_EN.png')] },
        { lang: 'JP', files: [page('ok_JP.png'), page('유마님_JP.png')] },
      ],
      undefined,
      fake,
    );

    expect(out).toEqual({ ok: false, log: ['Nom de fichier refusé : 유마님_JP.png'] });
    expect(readdirSync(dir)).toEqual([]);
    expect(calls).toEqual({ chain: [], git: [] });
  });

  it('langue inconnue, envoi vide : rien n’est écrit', async () => {
    const { dir, calls, fake } = deps();
    const unknown = await addComics(
      [
        { lang: 'EN', files: [page('ok_EN.png')] },
        { lang: 'FR' as 'EN', files: [page('ok_FR.png')] },
      ],
      undefined,
      fake,
    );
    const empty = await addComics([{ lang: 'EN', files: [] }], undefined, fake);

    expect(unknown).toEqual({ ok: false, log: ['Langue inconnue : FR'] });
    expect(empty).toEqual({ ok: false, log: ['Aucun fichier.'] });
    expect(readdirSync(dir)).toEqual([]);
    expect(calls).toEqual({ chain: [], git: [] });
  });

  it('un nom à chemin est ramené à son basename, dans le dossier de sa langue', async () => {
    const { dir, fake } = deps();
    await addComics([{ lang: 'JP', files: [page('../../evil_JP.png')] }], undefined, fake);

    expect(readdirSync(join(dir, 'JP'))).toEqual(['evil_JP.png']);
    expect(existsSync(join(dir, '..', 'evil_JP.png'))).toBe(false);
  });

  it('push R2 en échec : les originaux sont déposés, mais ni repli ni commit', async () => {
    const { calls, fake } = deps({ pushAssets: () => ({ ok: false, error: 'R2 muet' }) });
    const out = await addComics([{ lang: 'EN', files: [page('a_EN.png')] }], undefined, fake);

    expect(out.ok).toBe(false);
    expect(out.log.at(-1)).toBe('assets:push a échoué : R2 muet');
    expect(calls).toEqual({ chain: ['collect', 'editorial'], git: [] });
  });
});

describe('monstersRoster, monsterSheetState, saveMonsterKit — l’onglet « Monstres », tout injecté', () => {
  // Un VRAI kit, lu du committé (la suite tourne sans les tables du jeu) : le
  // premier boss dont deux cartes au moins portent des chips — de quoi en
  // déplacer une. Son id est dérivé, jamais écrit ici ; le reste est factice.
  const SKILLS = committedMonsterSkills();
  const none: MonsterKitSections = { chipOwner: {}, chipHide: {}, chipAdd: {} };
  /** Ce qu'une page a chargé d'un kit que le disque ne cure pas : son `was`. */
  const empty = pickMonsterKit(none, []);
  const REAL = Object.values(committedMonsters()).find((m) => {
    if (m.type !== 'boss' || !m.name.en) return false;
    const { cards } = monsterKitCards(m, SKILLS, none);
    const [from, to] = cards.filter((c) => c.chips.length);
    return Boolean(to) && !to.chips.includes(from.chips[0]);
  })!;
  const named = (id: string, en: string, over: Partial<Monster> = {}): Monster => ({
    ...REAL,
    id,
    name: { ...REAL.name, en },
    spawns: [],
    ...over,
  });
  const BOSS = named(REAL.id, 'Mega Boss');
  // Son jumeau : les mêmes skills, sous un autre id.
  const TWIN = named('twin', 'Twin Boss');
  // Un monstre du site, sans guide ; et un autre, ni l'un ni l'autre.
  const MOB = named('mob', 'Aaa Mob', {
    type: 'monster',
    skills: [],
    spawns: [{ dungeon: 'd1' }] as Monster['spawns'],
  });
  const LONE = named('lone', 'Zed Lone', { skills: [] });

  const KIT = monsterKitCards(BOSS, SKILLS, none);
  const KIT_IDS = KIT.cards.map((c) => c.id);
  /** Deux cartes qui portent des chips, et la première chip de la première. */
  const [FROM, TO] = KIT.cards.filter((c) => c.chips.length);
  const CHIP = KIT.chips.find((c) => c.buff === FROM.chips[0])!;
  const OTHER = KIT.chips.find((c) => c.buff === TO.chips[0])!;

  const GUIDE: GuideRef = { category: 'joint-challenge', slug: 'mega', title: 'Mega Boss Guide' };
  const GUIDE2: GuideRef = { category: 'adventure', slug: 'S1-1-1', title: 'S1 : Mega Boss' };
  const CATALOG: Record<string, EffectOption> = {
    '48': { id: '48', name: 'Stunned', icon: 'IG_Buff_Stun', isDebuff: true },
    '7': { id: '7', name: 'Increased Attack', icon: 'IG_Buff_Atk', isDebuff: false },
  };
  const PATH = 'data/curated/monster-skills.json';
  const row = (m: Monster, guides: GuideRef[], place = '') => ({
    id: m.id,
    name: m.name.en,
    type: m.type,
    icon: img.monster(m.icon),
    place,
    guides,
  });

  /** Les lectures et les deux écritures, factices : elles notent leurs appels. */
  function deps(
    over: {
      sections?: MonsterKitSections;
      siteError?: string;
      errors?: string[];
      git?: Outcome;
    } = {},
  ) {
    const calls = {
      apply: [] as KitCurationPatch[],
      git: [] as [string[], string][],
      guideIds: 0,
      siteIds: 0,
    };
    const state = { stamp: 's1', sections: over.sections ?? none };
    const fake: MonstersDeps = {
      monsters: () => ({ [BOSS.id]: BOSS, twin: TWIN, mob: MOB, lone: LONE }),
      skills: () => SKILLS,
      sections: () => state.sections,
      catalog: () => CATALOG,
      guideIds: () => {
        calls.guideIds++;
        return new Map([
          [BOSS.id, [GUIDE, GUIDE2]],
          ['twin', [GUIDE]],
          ['hors-committe', [GUIDE]],
        ]);
      },
      siteIds: () => {
        calls.siteIds++;
        if (over.siteError) throw new Error(over.siteError);
        return new Set([BOSS.id, 'mob', 'hors-committe']);
      },
      dungeons: () => ({ d1: { mode: 'mode_inconnu', name: { en: 'Stage 1' } } as DungeonRef }),
      stamp: () => state.stamp,
      applyKit: async (patch) => {
        calls.apply.push(patch);
        return over.errors ?? [];
      },
      commitPaths: (paths, message) => {
        calls.git.push([paths, message]);
        return over.git ?? { ok: true, log: ['git : fait'] };
      },
    };
    return { calls, fake, state };
  }

  it('le kit de travail : deux cartes à chips, la chip de l’une absente de l’autre', () => {
    expect(TO.chips).not.toContain(CHIP.buff);
    expect(CHIP.defaultCards).toEqual([FROM.id]);
  });

  it('roster : les monstres des GUIDES d’abord, avec leurs guides, puis ceux du site — chaque groupe par nom', () => {
    const { fake } = deps();
    expect(monstersRoster(fake)).toEqual({
      roster: [
        row(BOSS, [GUIDE, GUIDE2]),
        row(TWIN, [GUIDE]),
        // Du site, sans guide : après les guides, quel que soit son nom. Son
        // libellé : « mode · stage » de ses spawns (un mode sans titre garde son slug).
        row(MOB, [], 'mode_inconnu · Stage 1'),
      ],
      // `site` compte les deux ; un id que le committé n'a pas n'a pas de ligne.
      counts: { guides: 2, site: 3 },
    });
  });

  it('roster : gardé tant que rien ne bouge (`stamp`), recalculé ensuite', () => {
    const { calls, fake, state } = deps();
    const first = monstersRoster(fake);
    expect(monstersRoster(fake).roster).toBe(first.roster);
    expect(calls).toMatchObject({ guideIds: 1, siteIds: 1 });
    state.stamp = 's2';
    expect(monstersRoster(fake).roster).not.toBe(first.roster);
    expect(calls).toMatchObject({ guideIds: 2, siteIds: 2 });
  });

  it('roster sans tables du jeu : les monstres des guides sont servis, la raison dite — et rien n’est gardé', () => {
    const { calls, fake } = deps({ siteError: 'table MonsterTemplet introuvable' });
    const out = monstersRoster(fake);
    expect(out.roster.map((r) => r.id)).toEqual([BOSS.id, 'twin']);
    expect(out.counts).toEqual({ guides: 2, site: 2 });
    expect(out.siteError).toBe('table MonsterTemplet introuvable');
    monstersRoster(fake);
    expect(calls.siteIds).toBe(2);
  });

  it('état : la ligne et ses guides, les cartes à l’adresse de leur icône, les chips, le catalogue', () => {
    const { fake } = deps();
    const state = monsterSheetState(BOSS.id, fake);
    if ('error' in state) throw new Error(state.error);
    expect(state.monster).toEqual(row(BOSS, [GUIDE, GUIDE2]));
    expect(state.kit.cards.map((c) => c.id)).toEqual(KIT_IDS);
    // Le sprite du skill est devenu l'adresse de son icône sur le site.
    for (const [i, card] of state.kit.cards.entries()) {
      expect(card).not.toHaveProperty('icon');
      expect(card.iconSrc).toBe(KIT.cards[i].icon ? img.skill(KIT.cards[i].icon!) : undefined);
      expect(card.chips).toEqual(KIT.cards[i].chips);
    }
    expect(state.kit.chips).toEqual(KIT.chips);
    expect(state.disk).toEqual(none);
    expect(state.catalog).toBe(CATALOG);
    expect(state.sprite).toBe('images/ui/effect');
    expect(state.guideBase).toBe(`${process.env.ADMIN_BASE || ADMIN_BASE_DEFAULT}/en/guides`);
  });

  it('état : `shared` — les skills que d’autres monstres portent, leur nombre et leurs noms', () => {
    const { fake } = deps();
    const state = monsterSheetState(BOSS.id, fake);
    if ('error' in state) throw new Error(state.error);
    // Le jumeau porte tout le kit : chaque carte est partagée par deux monstres.
    expect(state.shared).toEqual(
      Object.fromEntries(
        KIT_IDS.map((id) => [id, { count: 2, names: ['Mega Boss', 'Twin Boss'] }]),
      ),
    );
    // Un monstre seul sur ses skills : rien de partagé.
    const alone = monsterSheetState('mob', fake);
    expect('error' in alone ? null : alone.shared).toEqual({});
  });

  it('état : `disk` — le curé restreint à CE kit, celui d’un autre kit écarté', () => {
    const { fake } = deps({
      sections: {
        chipOwner: { [CHIP.buff]: ['skill-d-un-jumeau', TO.id], ailleurs: 'zz' },
        chipHide: { [FROM.id]: ['ref-heritee'], zz: ['x'] },
        chipAdd: { [TO.id]: ['48'], zz: ['7'] },
      },
    });
    const state = monsterSheetState(BOSS.id, fake);
    if ('error' in state) throw new Error(state.error);
    expect(state.disk).toEqual({
      chipOwner: { [CHIP.buff]: TO.id },
      chipHide: { [FROM.id]: ['ref-heritee'] },
      chipAdd: { [TO.id]: ['48'] },
    });
    // Et les cartes le montrent : la chip est sur sa carte cible.
    expect(state.kit.cards.find((c) => c.id === TO.id)?.chips).toContain(CHIP.buff);
    expect(state.kit.cards.find((c) => c.id === TO.id)?.added).toEqual(['48']);
  });

  it('état : un monstre hors des guides et du site se lit quand même ; un inconnu est dit', () => {
    const { fake } = deps();
    const state = monsterSheetState('lone', fake);
    expect('error' in state ? null : state.monster).toEqual(row(LONE, []));
    expect(monsterSheetState('nope', fake)).toEqual({ error: 'monstre inconnu : nope' });
  });

  it('enregistrer : une chip déplacée, une masquée, un effet ajouté — le store, `kitSkillIds` COMPLET, UN commit au nom du monstre', async () => {
    const { calls, fake } = deps();
    const changes = {
      chipOwner: { [CHIP.buff]: TO.id },
      chipHide: { [TO.id]: [OTHER.buff] },
      chipAdd: { [FROM.id]: [' 48 ', '48'] },
    };
    const out = await saveMonsterKit(BOSS.id, changes, empty, fake);

    expect(out).toEqual({
      ok: true,
      log: [
        `« ${CHIP.name} » : déplacée sur « ${TO.name} »`,
        `chips de « ${FROM.name} » : 0 masquée, 1 ajoutée`,
        `chips de « ${TO.name} » : 1 masquée, 0 ajoutée`,
        'git : fait',
      ],
      written: true,
      stale: false,
      refused: [],
    });
    expect(calls.apply).toEqual([
      {
        kitSkillIds: KIT_IDS,
        chipOwner: { [CHIP.buff]: TO.id },
        chipHide: { [TO.id]: [OTHER.buff] },
        chipAdd: { [FROM.id]: ['48'] },
      },
    ]);
    expect(calls.git).toEqual([[[PATH], `chore(monsters): Mega Boss (${BOSS.id})`]]);
  });

  it('enregistrer : « par défaut » retire le porteur curé (`null`) ; ce que le disque porte déjà ne part pas', async () => {
    const sections = { ...none, chipOwner: { [CHIP.buff]: TO.id }, chipAdd: { [FROM.id]: ['48'] } };
    const { calls, fake } = deps({ sections });
    const was = pickMonsterKit(sections, KIT_IDS);
    const out = await saveMonsterKit(
      BOSS.id,
      { chipOwner: { [CHIP.buff]: null, [OTHER.buff]: null }, chipAdd: { [FROM.id]: ['48'] } },
      was,
      fake,
    );
    expect(out.log[0]).toBe(`« ${CHIP.name} » : remise à sa place par défaut`);
    expect(calls.apply).toEqual([
      { kitSkillIds: KIT_IDS, chipOwner: { [CHIP.buff]: null }, chipHide: {}, chipAdd: {} },
    ]);

    // Rien ne bouge : ni store, ni commit, et ce n'est pas une erreur.
    const idle = deps({ sections });
    expect(
      await saveMonsterKit(BOSS.id, { chipOwner: { [CHIP.buff]: TO.id } }, was, idle.fake),
    ).toEqual({
      ok: true,
      log: ['Rien à enregistrer : le disque porte déjà ces valeurs.'],
      written: false,
      stale: false,
      refused: [],
    });
    expect(idle.calls).toMatchObject({ apply: [], git: [] });
  });

  it('refus : une carte hors du kit — située, rien n’est écrit', async () => {
    const { calls, fake } = deps();
    const out = await saveMonsterKit(BOSS.id, { chipHide: { zz: [CHIP.buff] } }, empty, fake);
    expect(out).toMatchObject({ ok: false, written: false, stale: false });
    expect(out.refused).toEqual([{ card: 'zz', reason: 'pas une carte de ce monstre' }]);
    expect(out.log).toEqual([
      'REFUSÉ — Mega Boss · chips de « zz » : pas une carte de ce monstre.',
      'Rien à enregistrer.',
    ]);
    expect(calls).toMatchObject({ apply: [], git: [] });
  });

  it('refus : une ref masquée qui n’est pas une chip de la carte — sauf si l’envoi l’y déplace', async () => {
    const { calls, fake } = deps();
    const out = await saveMonsterKit(BOSS.id, { chipHide: { [TO.id]: [CHIP.buff] } }, empty, fake);
    expect(out.refused).toEqual([
      { card: TO.id, reason: `« ${CHIP.buff} » : pas une chip de cette carte` },
    ]);
    expect(calls.apply).toEqual([]);

    const moved = deps();
    const ok = await saveMonsterKit(
      BOSS.id,
      { chipOwner: { [CHIP.buff]: TO.id }, chipHide: { [TO.id]: [CHIP.buff] } },
      empty,
      moved.fake,
    );
    expect(ok.refused).toEqual([]);
    expect(moved.calls.apply[0].chipHide).toEqual({ [TO.id]: [CHIP.buff] });
  });

  it('refus : un effet ajouté hors du catalogue', async () => {
    const { calls, fake } = deps();
    const out = await saveMonsterKit(
      BOSS.id,
      { chipAdd: { [FROM.id]: ['48', 'nope'] } },
      empty,
      fake,
    );
    expect(out.refused).toEqual([
      { card: FROM.id, reason: '« nope » : effet inconnu du glossaire' },
    ]);
    expect(calls.apply).toEqual([]);
  });

  it('refus : `chipOwner` vers un skill hors du kit, situé à la carte de la chip ; un buff inconnu, à l’envoi', async () => {
    const { calls, fake } = deps();
    const out = await saveMonsterKit(
      BOSS.id,
      { chipOwner: { [CHIP.buff]: 'zz', fantome: TO.id } },
      empty,
      fake,
    );
    expect(out.refused).toEqual([
      { card: FROM.id, reason: `« ${CHIP.name} » : « zz » n’est pas une carte de ce kit` },
      { reason: '« fantome » : pas une chip de ce kit' },
    ]);
    expect(calls).toMatchObject({ apply: [], git: [] });
  });

  it('une ref HÉRITÉE du fichier est conservée : elle n’est ni refusée ni effacée', async () => {
    const sections = {
      ...none,
      chipHide: { [FROM.id]: ['buff-disparu'] },
      chipAdd: { [FROM.id]: ['effet-retire'] },
    };
    const { calls, fake } = deps({ sections });
    const out = await saveMonsterKit(
      BOSS.id,
      {
        chipHide: { [FROM.id]: ['buff-disparu', CHIP.buff] },
        chipAdd: { [FROM.id]: ['effet-retire', '7'] },
      },
      pickMonsterKit(sections, KIT_IDS),
      fake,
    );
    expect(out).toMatchObject({ ok: true, refused: [] });
    expect(calls.apply[0]).toMatchObject({
      chipHide: { [FROM.id]: ['buff-disparu', CHIP.buff] },
      chipAdd: { [FROM.id]: ['effet-retire', '7'] },
    });
  });

  it('`was` périmé : `stale`, sans écriture — le curé d’un AUTRE kit, lui, n’y fait rien', async () => {
    const { calls, fake } = deps({ sections: { ...none, chipAdd: { [FROM.id]: ['7'] } } });
    const out = await saveMonsterKit(BOSS.id, { chipAdd: { [FROM.id]: ['48'] } }, empty, fake);
    expect(out).toEqual({
      ok: false,
      log: [
        'REFUSÉ — Mega Boss · chips : le disque a changé depuis le chargement.',
        'Rien à enregistrer.',
      ],
      written: false,
      stale: true,
      refused: [{ reason: 'le disque a changé depuis le chargement' }],
    });
    expect(calls).toMatchObject({ apply: [], git: [] });

    const elsewhere = deps({ sections: { ...none, chipAdd: { zz: ['7'] } } });
    const ok = await saveMonsterKit(
      BOSS.id,
      { chipAdd: { [FROM.id]: ['48'] } },
      empty,
      elsewhere.fake,
    );
    expect(ok).toMatchObject({ ok: true, stale: false, written: true });
  });

  it('une carte en écart n’est pas écrite, les autres le sont : UN commit, et l’issue le dit', async () => {
    const { calls, fake } = deps();
    const out = await saveMonsterKit(
      BOSS.id,
      {
        chipHide: { [FROM.id]: ['pas-une-chip'] },
        chipAdd: { [FROM.id]: ['48'], [TO.id]: ['7'] },
      },
      empty,
      fake,
    );
    expect(out).toMatchObject({ ok: false, written: true, stale: false });
    expect(out.refused).toEqual([
      { card: FROM.id, reason: '« pas-une-chip » : pas une chip de cette carte' },
    ]);
    expect(calls.apply).toEqual([
      { kitSkillIds: KIT_IDS, chipOwner: {}, chipHide: {}, chipAdd: { [TO.id]: ['7'] } },
    ]);
    expect(calls.git).toHaveLength(1);
  });

  it('un refus du store est situé à sa carte — ou à celle de la chip pour `chipOwner` — et rien n’est committé', async () => {
    const { calls, fake } = deps({
      errors: [
        `chipHide[${TO.id}] : string list expected`,
        `chipOwner[${CHIP.buff}] : zz is not a skill of the kit`,
        'kitSkillIds missing',
      ],
    });
    const out = await saveMonsterKit(BOSS.id, { chipAdd: { [FROM.id]: ['48'] } }, empty, fake);
    expect(out).toMatchObject({ ok: false, written: false });
    expect(out.refused).toEqual([
      { card: TO.id, reason: 'string list expected' },
      { card: FROM.id, reason: 'zz is not a skill of the kit' },
      { reason: 'kitSkillIds missing' },
    ]);
    expect(calls.apply).toHaveLength(1);
    expect(calls.git).toEqual([]);
  });

  it('un monstre inconnu, une forme fausse : refusés sans rien lire de plus', async () => {
    const { calls, fake } = deps();
    expect(await saveMonsterKit('nope', {}, empty, fake)).toMatchObject({
      ok: false,
      log: ['monstre inconnu : nope.'],
    });
    for (const bad of ['x', null, [], { chipHide: [] }, { chipOwner: 'x' }])
      expect((await saveMonsterKit(BOSS.id, bad, empty, fake)).refused).toHaveLength(1);
    const lists = await saveMonsterKit(BOSS.id, { chipAdd: { [FROM.id]: 'x' } }, empty, fake);
    expect(lists.refused).toEqual([
      { card: FROM.id, reason: 'chipAdd : une liste de refs attendue' },
    ]);
    expect(calls).toMatchObject({ apply: [], git: [] });
  });

  it('un commit en échec : l’écriture est faite, l’issue est un échec', async () => {
    const { fake } = deps({ git: { ok: false, log: ['git commit a échoué : hook'] } });
    const out = await saveMonsterKit(BOSS.id, { chipAdd: { [FROM.id]: ['48'] } }, empty, fake);
    expect(out).toMatchObject({ ok: false, written: true });
    expect(out.log.at(-1)).toBe('git commit a échoué : hook');
  });
});

describe('commitPaths, pushMain, gitState — sur un dépôt jetable', () => {
  const dirs: string[] = [];

  // Les fonctions lancent `git` avec l'environnement du processus : rien de
  // celui d'un hook (`GIT_DIR`, `GIT_INDEX_FILE`… qui viseraient le dépôt du
  // projet malgré le `cwd`) ni de la configuration du poste (signature des
  // commits, hooks globaux) ne doit y entrer.
  beforeEach(() => {
    for (const key of Object.keys(process.env))
      if (key.startsWith('GIT_')) vi.stubEnv(key, undefined);
    const home = mkdtempSync(join(tmpdir(), 'quick-git-home-'));
    dirs.push(home);
    writeFileSync(join(home, 'gitconfig'), '');
    vi.stubEnv('GIT_CONFIG_GLOBAL', join(home, 'gitconfig'));
    vi.stubEnv('GIT_CONFIG_NOSYSTEM', '1');
  });
  afterEach(() => {
    vi.unstubAllEnvs();
    for (const d of dirs.splice(0)) rmSync(d, { recursive: true, force: true });
  });

  /** `git` dans `cwd`, pour monter la scène et la relire ; lève s'il échoue. */
  const sh = (cwd: string, ...args: string[]): string => {
    const r = spawnSync('git', args, { cwd, encoding: 'utf8' });
    if (r.status !== 0) throw new Error(`git ${args.join(' ')} : ${r.stderr}`);
    return r.stdout.trim();
  };
  const identity = (cwd: string): void => {
    sh(cwd, 'config', 'user.name', 'quick test');
    sh(cwd, 'config', 'user.email', 'quick@test.invalid');
  };
  /** Écrit `name` dans le dépôt `cwd` (pas indexé : c'est le rôle de `commitPaths`). */
  const write = (cwd: string, name: string, content: string): void =>
    writeFileSync(join(cwd, name), content);

  /** Un dépôt de travail sur `main`, sans amont. */
  function lone() {
    const root = mkdtempSync(join(tmpdir(), 'quick-git-'));
    dirs.push(root);
    const work = join(root, 'work');
    sh(root, 'init', '-b', 'main', work);
    identity(work);
    write(work, 'data.json', '{}\n');
    sh(work, 'add', '--', 'data.json');
    sh(work, 'commit', '-m', 'chore: depart');
    return { root, work };
  }

  /** Le même, avec son amont `bare` à côté et le commit de départ poussé. */
  function repo() {
    const { root, work } = lone();
    const bare = join(root, 'origin.git');
    sh(root, 'init', '--bare', '-b', 'main', bare);
    sh(work, 'remote', 'add', 'origin', bare);
    sh(work, 'push', '-u', 'origin', 'main');
    return { root, work, bare };
  }

  /** Un AUTRE clone pousse un commit dans l'amont : `work` est en retard. */
  function pushFromElsewhere(root: string, bare: string): void {
    const other = join(root, 'other');
    sh(root, 'clone', bare, other);
    identity(other);
    write(other, 'ailleurs.json', '{}\n');
    sh(other, 'add', '--', 'ailleurs.json');
    sh(other, 'commit', '-m', 'chore: ailleurs');
    sh(other, 'push');
  }

  const head = (cwd: string): string => sh(cwd, 'rev-parse', 'main');

  it('un enregistrement committe, compte ce qui attend, et ne pousse pas', () => {
    const { work, bare } = repo();
    const start = head(bare);
    expect(gitState(work)).toEqual({ branch: 'main', ahead: 0, behind: 0 });

    write(work, 'data.json', '{"a":1}\n');
    const steps: string[] = [];
    const out = commitPaths(['data.json'], 'chore(coupons): essai', (l) => steps.push(l), work);

    expect(out).toEqual({
      ok: true,
      log: ['git : chore(coupons): essai', 'committé — 1 commit à pousser (bouton « Pousser »).'],
    });
    expect(steps).toEqual(out.log);
    expect(sh(work, 'log', '-1', '--format=%s')).toBe('chore(coupons): essai');
    expect(gitState(work)).toEqual({ branch: 'main', ahead: 1, behind: 0 });
    // L'amont n'a PAS bougé.
    expect(head(bare)).toBe(start);

    write(work, 'data.json', '{"a":2}\n');
    expect(commitPaths(['data.json'], 'chore(coupons): encore', undefined, work).log.at(-1)).toBe(
      'committé — 2 commits à pousser (bouton « Pousser »).',
    );
    expect(head(bare)).toBe(start);
  });

  it('ne committe que les chemins donnés, et rien quand ils n’ont pas changé', () => {
    const { work } = repo();
    write(work, 'voisin.json', '{}\n');

    expect(commitPaths(['data.json'], 'chore: rien', undefined, work)).toEqual({
      ok: true,
      log: ['git : rien à committer.'],
    });
    expect(gitState(work).ahead).toBe(0);

    write(work, 'data.json', '{"a":1}\n');
    expect(commitPaths(['data.json'], 'chore: un seul', undefined, work).ok).toBe(true);
    expect(sh(work, 'show', '--name-only', '--format=', 'HEAD')).toBe('data.json');
    // Le travail d'à côté reste où il est : ni indexé, ni committé.
    expect(sh(work, 'status', '--porcelain')).toBe('?? voisin.json');
  });

  it('un fichier indexé à côté ne part pas avec l’enregistrement, et reste indexé', () => {
    const { work } = repo();
    // Indexé au terminal pendant que quick tourne.
    write(work, 'autre.txt', 'au terminal\n');
    sh(work, 'add', '--', 'autre.txt');

    // Un chemin suivi qui change, un fichier NOUVEAU : les deux entrent.
    write(work, 'data.json', '{"a":1}\n');
    write(work, 'neuf.json', '{}\n');
    expect(commitPaths(['data.json', 'neuf.json'], 'chore: les miens', undefined, work)).toEqual({
      ok: true,
      log: ['git : chore: les miens', 'committé — 1 commit à pousser (bouton « Pousser »).'],
    });
    const stat = sh(work, 'show', '--stat', '--format=%s', 'HEAD');
    expect(stat).toMatch(/^chore: les miens\n/);
    expect(stat).toContain('data.json');
    expect(stat).toContain('neuf.json');
    expect(stat).not.toContain('autre.txt');
    expect(sh(work, 'diff', '--cached', '--name-only')).toBe('autre.txt');
    expect(sh(work, 'status', '--porcelain')).toBe('A  autre.txt');

    // La re-sauvegarde à l'identique ne prend pas l'index d'à côté pour du neuf.
    const saved = head(work);
    expect(commitPaths(['data.json', 'neuf.json'], 'chore: rien', undefined, work)).toEqual({
      ok: true,
      log: ['git : rien à committer.'],
    });
    // Sans chemin non plus : `git commit --` prendrait l'index entier.
    expect(commitPaths([], 'chore: vide', undefined, work)).toEqual({
      ok: true,
      log: ['git : rien à committer.'],
    });
    expect(head(work)).toBe(saved);
    expect(sh(work, 'diff', '--cached', '--name-only')).toBe('autre.txt');
  });

  it('les hooks tournent dès qu’un chemin n’est pas du JSON, sur ces chemins seuls', () => {
    const { work } = repo();
    // Un pre-commit à la manière de lefthook (`stage_fixed`) : il note ce qu'il
    // voit d'indexé, « formate » les `.ts` et les ré-indexe.
    const seen = join(work, '.git', 'hook-seen');
    mkdirSync(join(work, '.git', 'hooks'), { recursive: true });
    writeFileSync(
      join(work, '.git', 'hooks', 'pre-commit'),
      [
        '#!/bin/sh',
        'git diff --cached --name-only >> .git/hook-seen',
        'for f in $(git diff --cached --name-only); do',
        '  case "$f" in *.ts) echo "// formate" >> "$f"; git add -- "$f";; esac',
        'done',
        '',
      ].join('\n'),
      { mode: 0o755 },
    );
    write(work, 'autre.txt', 'au terminal\n');
    sh(work, 'add', '--', 'autre.txt');

    // Que du `.json` : `--no-verify`, le hook ne tourne pas.
    write(work, 'data.json', '{"a":1}\n');
    expect(commitPaths(['data.json'], 'chore: donnee', undefined, work).ok).toBe(true);
    expect(existsSync(seen)).toBe(false);

    // Un `.ts` dans le lot : il tourne, et ne voit pas le fichier d'à côté.
    write(work, 'data.json', '{"a":2}\n');
    write(work, 'code.ts', 'export {};\n');
    expect(commitPaths(['data.json', 'code.ts'], 'feat: code', undefined, work).ok).toBe(true);
    expect(readFileSync(seen, 'utf8')).toBe('code.ts\ndata.json\n');
    // Ce qu'il a ré-indexé est dans le commit, et ne traîne pas dans l'index.
    expect(sh(work, 'show', 'HEAD:code.ts')).toBe('export {};\n// formate');
    expect(sh(work, 'status', '--porcelain')).toBe('A  autre.txt');
  });

  it('« Pousser » envoie ce qui attend ; rien à pousser n’est pas une erreur', () => {
    const { work, bare } = repo();
    expect(pushMain(undefined, work)).toEqual({ ok: true, log: ['rien à pousser.'] });

    write(work, 'data.json', '{"a":1}\n');
    commitPaths(['data.json'], 'chore: un', undefined, work);
    write(work, 'data.json', '{"a":2}\n');
    commitPaths(['data.json'], 'chore: deux', undefined, work);

    const steps: [string, boolean | undefined][] = [];
    const out = pushMain((line, doing) => steps.push([line, doing]), work);

    expect(out).toEqual({ ok: true, log: ['poussé — la CI build et déploie.'] });
    // Que du `.json` dans ce qui part : le pre-push est sauté, rien à annoncer.
    expect(steps).toEqual([
      ['git push', true],
      ['poussé — la CI build et déploie.', undefined],
    ]);
    expect(head(bare)).toBe(head(work));
    expect(gitState(work)).toEqual({ branch: 'main', ahead: 0, behind: 0 });
    expect(pushMain(undefined, work)).toEqual({ ok: true, log: ['rien à pousser.'] });
  });

  it('annonce le pre-push AVANT, dès qu’un commit en attente porte autre chose que du JSON', () => {
    const { work, bare } = repo();
    write(work, 'data.json', '{"a":1}\n');
    commitPaths(['data.json'], 'chore: donnee', undefined, work);
    write(work, 'code.ts', 'export {};\n');
    commitPaths(['code.ts'], 'feat: code', undefined, work);

    const doing: string[] = [];
    const out = pushMain((line, d) => void (d && doing.push(line)), work);

    expect(doing).toEqual(['pre-push : typecheck… (une minute), puis git push']);
    expect(out.ok).toBe(true);
    expect(head(bare)).toBe(head(work));
  });

  it('branche en retard : le push est refusé, les commits restent, le conseil est donné', () => {
    const { root, work, bare } = repo();
    pushFromElsewhere(root, bare);
    write(work, 'data.json', '{"a":1}\n');
    commitPaths(['data.json'], 'chore: local', undefined, work);
    // Sans `git fetch`, le dépôt ne sait rien de ce retard.
    expect(gitState(work)).toEqual({ branch: 'main', ahead: 1, behind: 0 });

    const refused = pushMain(undefined, work);
    expect(refused.ok).toBe(false);
    expect(refused.log).toHaveLength(2);
    expect(refused.log[0]).toMatch(/^git push a échoué \(1 commit reste en local\) : /);
    expect(refused.log[1]).toBe('Corriger avec `git pull --rebase` puis « Pousser » de nouveau.');
    expect(sh(work, 'log', '-1', '--format=%s')).toBe('chore: local');

    // Une fois l'amont relu (au terminal), le retard se compte — et le push
    // reste refusé tant que le `pull --rebase` n'est pas fait.
    sh(work, 'fetch');
    expect(gitState(work)).toEqual({ branch: 'main', ahead: 1, behind: 1 });
    expect(pushMain(undefined, work).log.at(-1)).toContain('git pull --rebase');

    sh(work, 'pull', '--rebase');
    expect(gitState(work)).toEqual({ branch: 'main', ahead: 1, behind: 0 });
    expect(pushMain(undefined, work).ok).toBe(true);
    expect(head(bare)).toBe(head(work));
  });

  it('sans amont : `ahead` est `null`, le commit passe et rien ne se pousse', () => {
    const { work } = lone();
    expect(gitState(work)).toEqual({ branch: 'main', ahead: null, behind: 0 });

    write(work, 'data.json', '{"a":1}\n');
    expect(commitPaths(['data.json'], 'chore: seul', undefined, work)).toEqual({
      ok: true,
      log: [
        'git : chore: seul',
        'committé — la branche main n’a pas d’amont : rien à pousser d’ici.',
      ],
    });
    expect(pushMain(undefined, work)).toEqual({
      ok: false,
      log: ['la branche main n’a pas d’amont : rien à pousser d’ici.'],
    });
  });
});
