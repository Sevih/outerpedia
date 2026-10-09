/**
 * quick/actions — les DIX gestes du quotidien, sortis du panneau admin.
 *
 * Mettre à jour un code promo ou une bannière, déposer une 4-comic, ajouter une
 * vidéo, régler un rang, une reco d'équipement ou un nom court, curer un effet,
 * écrire une entrée du journal du site ne demandait
 * jusqu'ici RIEN de moins qu'un `pnpm dev` complet : `clean:all`
 * (suppression de `node_modules` + réinstallation) puis `dev-refresh` (pull
 * Steam, build de la proposition, collecte des images), pour finir par cliquer
 * dans l'admin. Des minutes de pipeline de données pour changer quatre lignes
 * de JSON.
 *
 * Ce module ne RÉIMPLÉMENTE rien : il rappelle les mêmes stores que les routes
 * admin (`loadCouponsForEdit`/`saveCouponsLive`, `saveBanners`/`publishBanners`,
 * `collectComics`, `upsertCharacterCurated`,
 * `upsertEeCurated`, `upsertGearReco`, `upsertEffectCurated`, `fetchMeta`…), sans Next et sans serveur de dev. Les alias `@/` et `@datagen/`
 * sont résolus par tsx via tsconfig.
 *
 * CE QUI PART EN PROD, ET COMMENT :
 *   - codes promo : la liste VIVANTE est sur R2 (le staff en ajoute aussi depuis
 *     Discord) ; l'écran la lit, puis l'écrit conditionnellement et purge
 *     l'edge (`lib/data/live-coupons`) → en ligne tout de suite, sans build.
 *     `coupons.json` committé n'en est que l'instantané ;
 *   - bannières : `banner.json` est écrit ici, puis poussé sur R2 et l'edge
 *     purgé (`runtime-publish`) — la home le lit en runtime → en ligne en
 *     ≤ 10 min, sans build ;
 *   - 4-comics : la galerie lit le manifeste R2 à la requête (cf. le docblock de
 *     `collect-comics`) → une BD apparaît dès le push R2 ;
 *   - vidéos : lues au RENDU, donc visibles seulement une fois le site rebâti ;
 *   - rangs et rôles : lus au RENDU eux aussi (les quatre tier lists) ;
 *   - fiche d'un perso (rangs, rôle, paliers, priorité de skills, tags, pros /
 *     cons, synergies) : le même curé, lu au RENDU lui aussi (tier lists,
 *     fiche du perso) — et les chips masquées ou ajoutées de ses skills
 *     (`character-skills.json`), lues au RENDU de même ;
 *   - recos d'équipement : lues au RENDU elles aussi (les fiches de perso) ;
 *   - noms courts et alias de recherche : lus au RENDU eux aussi (le libellé
 *     sous les cartes, le champ recherche des listes de persos) ;
 *   - effets (noms, descriptions, icônes, familles, masquage) : lus au RENDU
 *     eux aussi (chips des skills, glossaire, filtres de `/characters`) ;
 *   - journal du site : `changelog.json` est lu par import statique, donc au
 *     BUILD (la page `/changelog`, la home, le flux RSS).
 *
 * Les NEUF COMMITTENT, sans rien demander, et aucun ne pousse (cf.
 * `commitPaths`) : pousser à chaque geste lançait la CI à chaque geste. Le push
 * est un geste à part, le bouton « Pousser » de l'en-tête (`pushMain`), qui dit
 * combien de commits attendent (`gitState`). Il part quand même avec la CI : R2
 * avance la mise en ligne de la donnée vive, il ne dispense pas du déploiement
 * — le site bâti garde ses propres copies de tout ça.
 */
import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { basename, resolve } from 'node:path';
import {
  loadBanners,
  loadCouponsForEdit,
  saveBanners,
  saveCouponsLive,
  type Banner,
  type PromoCode,
} from '@/lib/admin/promo-banner-store';
import { publishBanners, type RuntimePublishResult } from '@/lib/admin/runtime-publish';
import { loadChangelog, saveChangelog } from '@/lib/admin/changelog-store';
import { HIDDEN_LANG_COLUMNS } from '@/lib/admin/gamedata-columns';
import {
  PAGE_SIZE,
  describeTable,
  isValidTableName,
  linkTargets,
  listGameTables,
  queryTable,
  type TableInfo,
  type TablePage,
  type TableQuery,
  type TableSchema,
} from '@/lib/admin/gamedata-store';
import {
  CHANGELOG_LINK_KINDS,
  CHANGELOG_TEMPLATES,
  CHANGELOG_TYPES,
  CHARACTER_SCOPE,
  fillTemplate,
  templateDefaults,
  unfilledFields,
  type FilledTemplate,
  type TemplateValue,
} from '@/lib/admin/changelog-templates';
import { catalogOptions } from '@/lib/data/item-catalog';
import { rankItemMatches } from '@/lib/data/item-search';
import { fetchMeta, searchOfficial } from '@/lib/admin/youtube';
import { characterKitCards, kitEffectCatalog, pickKitCards } from '@/lib/admin/character-kit';
import {
  applyCharacterKitCuration,
  loadCharacterKitSections,
  type CharacterKitPatch,
} from '@/lib/admin/character-skill-curated-store';
import { upsertCharacterCurated } from '@/lib/admin/curated-store';
import { effectKeysById, newEffectId, pairEffects } from '@/lib/admin/effect-catalog';
import {
  effectHaystack,
  effectMatches,
  type EffectCatalog,
  type EffectMatch,
} from '@/lib/admin/effect-search';
import { upsertEffectCurated } from '@/lib/admin/effects-store';
import { upsertEeCurated, type EeCuratedPatch } from '@/lib/admin/equipment-curated-store';
import { gearSelectOptions, type GearOption } from '@/lib/admin/gear-options';
import { previewGearReco } from '@/lib/admin/gear-preview-actions';
import { renderInlineBatch } from '@/lib/admin/inline-preview-actions';
import { buildInlineRefs } from '@/lib/admin/inline-refs';
import { expandBuild } from '@/lib/admin/gear-preset-resolve';
import { upsertGearReco } from '@/lib/admin/gear-reco-store';
import { upsertSearchAliases } from '@/lib/admin/search-alias-store';
import { upsertShortName } from '@/lib/admin/short-name-store';
import { appendGuideVideo } from '@/lib/admin/guide-store';
import { autoTranslate } from '@/lib/admin/translate-actions';
import { loadCuratedCharacters } from '@/lib/data/curated';
import { EFFECT_FAMILIES, effectFamilyLabel, type EffectSide } from '@/lib/data/effect-families';
import {
  getMergedEffects,
  liveEffectSources,
  type EffectSources,
  type MergedEffect,
} from '@/lib/data/effects';
import {
  resolveChangelogEntry,
  type ChangelogEntry,
  type ChangelogLink,
  type ChangelogType,
} from '@/lib/data/changelog';
import {
  characterDisplayName,
  characterSearchNames,
  getCharacterListItems,
  slugForId,
} from '@/lib/data/characters';
import {
  gearById,
  getAmuletFamilies,
  getEEViews,
  getSetViews,
  getTalismanFamilies,
  getWeaponFamilies,
  loadEquipmentEditorial,
  resolvePassives,
  type GearFamily,
} from '@/lib/data/equipment';
import { eeEditorChips, eeModelForView, type EeChipMeta } from '@/lib/data/equipment-detail';
import { loadGearPresets, loadGearReco } from '@/lib/data/gear-reco';
import { listGuides } from '@/lib/data/guides';
import { loadSearchAliases } from '@/lib/data/search-aliases';
import { loadShortNames } from '@/lib/data/short-names';
import { GUIDE_SPECS } from '@/lib/admin/guide-draft';
import { img } from '@/lib/images';
import { DEFAULT_LANG, LANGS, isValidLang, normalizeLang, type Lang } from '@/lib/i18n/config';
import { lRec } from '@/lib/i18n/localize';
import { getT } from '@/i18n';
import { bulletSegments, type BulletSegment } from '@/lib/changelog-bullets';
import { localePath } from '@/lib/navigation';
import { TAG_REGEX, checkText, type InlineSegment } from '@/lib/parse-text';
import { STAT_ICON } from '@/lib/stats';
import { transcendenceLabel } from '@/lib/transcendence';
import type { EffectOption, KitEditorCard } from '@/components/admin/CharacterKitEditor';
import { fitsOnTwoLines } from '@/components/character/CharacterPortrait';
import {
  CHANGELOG_TYPE_ICON,
  changelogGotoKey,
  changelogHref,
  changelogThumb,
  formatChangelogDate,
} from '@/components/changelog/presentation';
import {
  CURATED_ROLES,
  CURATED_STEPS,
  CURATED_STEP_RARITY,
  EE_TIERS,
  HUMAN_TAGS,
  TIERS,
} from '@/components/tierlist/tiers';
import type {
  CharacterCurated,
  EffectCurated,
  GameVersion,
  GearBuild,
  GearPresets,
  LocalizedText,
  ProsCons,
  SkillPriority,
} from '@contracts';
import type { InboxItem } from '@/lib/admin/admin-inbox';
import type { SynergyGroup } from '@datagen/curated/character';
import type { EquipmentCuratedEntry } from '@datagen/curated/equipment';
import { compactEffect } from '@datagen/curated/effects';
import { validateGearBuilds } from '@datagen/curated/gear-reco';
import { collectComics } from '@datagen/assets/collect-comics';
import { stripUnintegratedCharacters } from '@datagen/promote';
import { pushEditorial } from '@datagen/assets/editorial';
import { syncComicsSeed } from '@datagen/assets/sync-comics-seed';
import { refreshVideoMeta } from '@datagen/video-meta';
import { COMIC_LANGS, type ComicLang } from '@datagen/generators/comics';
import { recruitWindows, type RecruitWindow } from '@datagen/generators/recruit';
import { findSteamInstall, installedResVersion } from '@datagen/extract/steam';
import { loadTable, tablePath, type Row } from '@datagen/lib/tables';
import { groupByStem, splitComicName } from './ui/comics-group.mjs';

/** Journal rendu tel quel dans l'interface (une ligne = une étape). */
export interface Outcome {
  ok: boolean;
  log: string[];
}

/**
 * Envoi d'une ligne À L'INSTANT où elle est écrite (cf. `stream` dans
 * server.ts). Sans lui, le journal n'existait qu'au RETOUR : déposer une
 * 4-comic enchaîne conversion webp, deux poussées R2, une purge d'edge et un
 * commit git — deux minutes pendant lesquelles l'onglet affichait un texte figé,
 * où rien ne distingue « ça avance » de « c'est mort » (constat Sevih du
 * 28/09 : cru bloqué, ça ne l'était pas).
 */
export type Report = (line: string, doing?: boolean) => void;

/**
 * Journal à deux temps, parce qu'une ligne n'a pas la même valeur selon qu'elle
 * ANNONCE ou CONSTATE :
 *   - `doing` — l'étape commence. Streamée seulement : elle ne dit rien du
 *     résultat et n'a donc rien à faire dans l'`Outcome` relu après coup. C'est
 *     elle qui porte l'information utile ici, une étape ne se signalant sinon
 *     qu'une fois FINIE — soit, pour la plus lente, après la longue attente
 *     qu'il s'agit d'expliquer.
 *   - `done` — l'étape est passée. Streamée ET gardée.
 */
function journal(report?: Report) {
  const lines: string[] = [];
  return {
    lines,
    doing: (line: string): void => report?.(line, true),
    done: (line: string): void => {
      lines.push(line);
      report?.(line);
    },
  };
}

const EDITORIAL_COMICS = resolve('.editorial/comics');

// ---------------------------------------------------------------- git --------

/** Où en est la branche par rapport à son amont — ce que montre « Pousser ». */
export interface GitState {
  branch: string;
  /** Commits locaux à pousser ; `null` quand la branche n'a pas d'amont. */
  ahead: number | null;
  /** Commits de l'amont absents d'ici, d'après le DERNIER fetch (cf. `gitState`). */
  behind: number;
}

/** `git` dans `cwd` (défaut : le dépôt, d'où quick est lancé), sortie et statut. */
function git(args: string[], cwd?: string): { ok: boolean; out: string } {
  const r = spawnSync('git', args, { cwd, encoding: 'utf8' });
  return { ok: r.status === 0, out: `${r.stdout ?? ''}${r.stderr ?? ''}`.trim() };
}

const commits = (n: number): string => `${n} commit${n > 1 ? 's' : ''}`;

/**
 * La branche courante et son écart à l'amont (`@{u}`), SANS `git fetch` : aucun
 * réseau ici, l'en-tête de la page le demande à chaque chargement. `behind` est
 * donc ce que le dépôt SAIT — un commit poussé d'ailleurs depuis le dernier
 * fetch ne s'y voit pas, c'est le refus de `git push` qui le dira.
 */
export function gitState(cwd?: string): GitState {
  const branch = git(['rev-parse', '--abbrev-ref', 'HEAD'], cwd).out;
  const gap = git(['rev-list', '--left-right', '--count', '@{u}...HEAD'], cwd);
  if (!gap.ok) return { branch, ahead: null, behind: 0 };
  // À gauche ce que l'amont a de plus, à droite ce que `HEAD` a de plus.
  const [behind, ahead] = gap.out.split(/\s+/).map(Number);
  return { branch, ahead, behind };
}

/**
 * Committe des chemins EXPLICITES (jamais `git add -A` : un dossier entier
 * embarquerait le travail en cours d'à côté — cf. CONVENTIONS.md), et ne pousse
 * JAMAIS : un enregistrement est un commit local, qui se défait, et « Pousser »
 * (`pushMain`) envoie d'un coup ceux qui attendent. La dernière ligne du
 * journal en donne le compte.
 *
 * Le commit ne porte QUE ces chemins : `git commit -- <chemins>` prend leur
 * contenu dans l'arbre de travail et laisse le reste de l'index tel quel. Un
 * fichier indexé au terminal pendant que quick tourne ne part donc pas avec
 * l'enregistrement, et reste indexé. Le `git add` d'avant ne sert qu'aux
 * fichiers NOUVEAUX — un pathspec ne connaît que ce que git suit déjà — et
 * « rien à committer » se juge sur ces chemins contre `HEAD`, pas sur l'index
 * entier : ce qui est indexé à côté ne fait pas croire qu'il y a quelque chose.
 *
 * Le pre-commit est sauté (`--no-verify`) SEULEMENT quand tous les chemins sont
 * du JSON de données : il ne fait qu'y passer prettier, or `writeJson` écrit
 * déjà le format canonique prettier (cf. `formatJson`). Dès qu'un chemin n'est
 * pas un `.json`, les hooks tournent — sur un index TEMPORAIRE (celui d'un
 * commit par pathspec), où ils ne voient d'indexé que ces chemins.
 */
export function commitPaths(
  paths: string[],
  message: string,
  report?: Report,
  cwd?: string,
): Outcome {
  const j = journal(report);
  // Sans chemin, `git commit --` committerait l'index entier.
  if (!paths.length) return { ok: true, log: ['git : rien à committer.'] };

  const add = git(['add', '--', ...paths], cwd);
  if (!add.ok) return { ok: false, log: [`git add a échoué : ${add.out}`] };

  // Ces chemins pareils à `HEAD` = rien à dire (re-sauvegarde à l'identique) :
  // pas une erreur.
  if (git(['diff', '--quiet', 'HEAD', '--', ...paths], cwd).ok)
    return { ok: true, log: ['git : rien à committer.'] };

  const dataOnly = paths.every((p) => p.endsWith('.json'));
  const commit = git(
    ['commit', ...(dataOnly ? ['--no-verify'] : []), '-m', message, '--', ...paths],
    cwd,
  );
  if (!commit.ok) return { ok: false, log: [`git commit a échoué : ${commit.out}`] };
  // Ce qu'un hook ré-indexe (prettier, `stage_fixed`) entre dans le commit par
  // l'index temporaire, pas dans le vrai, qui garderait la version d'AVANT le
  // formatage — indexée, donc prête à le défaire. On réaligne ces chemins.
  if (!dataOnly) git(['add', '--', ...paths], cwd);
  j.done(`git : ${message}`);

  const { branch, ahead } = gitState(cwd);
  j.done(
    ahead === null
      ? `committé — la branche ${branch} n’a pas d’amont : rien à pousser d’ici.`
      : `committé — ${commits(ahead)} à pousser (bouton « Pousser »).`,
  );
  return { ok: true, log: j.lines };
}

/**
 * « Pousser » : `git push` de la branche courante, avec tous les commits que
 * les gestes y ont laissés.
 *
 * PAS de « [skip ci] » (décision Sevih) : R2 met bien la donnée vive en ligne
 * sans build, mais le site DÉPLOYÉ en garde des copies cuites — le repli
 * committé des 4-comics, les pages qui lisent les coupons au rendu. Sauter le
 * build les laissait en retard jusqu'au prochain push sans rapport,
 * c'est-à-dire diverger en silence. Le déploiement part donc avec le push.
 *
 * Le pre-push (un `tsc --noEmit` triple, une minute) suit la règle du
 * pre-commit, calculée sur ce qui part : sauté quand les commits en attente ne
 * touchent que du `.json`, qu'aucun type ne peut casser ; sinon il tourne, et
 * le journal le dit AVANT.
 *
 * Un refus ne perd rien : les commits restent locaux. Le cas courant est une
 * branche en retard — le `git pull --rebase` se fait au terminal, pas d'ici.
 */
export function pushMain(report?: Report, cwd?: string): Outcome {
  const j = journal(report);

  const { branch, ahead } = gitState(cwd);
  if (ahead === null)
    return { ok: false, log: [`la branche ${branch} n’a pas d’amont : rien à pousser d’ici.`] };
  if (!ahead) return { ok: true, log: ['rien à pousser.'] };

  const dataOnly = git(['diff', '--name-only', '@{u}..HEAD'], cwd)
    .out.split('\n')
    .filter(Boolean)
    .every((p) => p.endsWith('.json'));
  j.doing(dataOnly ? 'git push' : 'pre-push : typecheck… (une minute), puis git push');
  const push = git(['push', ...(dataOnly ? ['--no-verify'] : [])], cwd);
  if (!push.ok)
    return {
      ok: false,
      log: [
        `git push a échoué (${commits(ahead)} ${ahead > 1 ? 'restent' : 'reste'} en local) : ${push.out}`,
        'Corriger avec `git pull --rebase` puis « Pousser » de nouveau.',
      ],
    };
  j.done('poussé — la CI build et déploie.');
  return { ok: true, log: j.lines };
}

// ------------------------------------------------------------ codes promo ----

export interface RewardOption {
  id: string;
  name: string;
  icon: string;
}

/** Catalogue des récompenses, allégé pour le sélecteur (items + monnaies). */
export function rewardOptions(): RewardOption[] {
  return catalogOptions().map((o) => ({ id: o.id, name: o.name, icon: o.icon }));
}

/**
 * Recherche du sélecteur, SERVIE — le classement par pertinence vit dans
 * `item-search`, avec le picker de l'admin. La page ne refiltre pas la liste de
 * son côté : c'est comme ça que « Gold » avait fini sous vingt coffres ici
 * alors que l'admin savait déjà le trier.
 */
export function searchRewards(query: string): RewardOption[] {
  return rankItemMatches(rewardOptions(), query);
}

/** Liste vivante (R2) + son jeton de version ; rafraîchit l'instantané local. */
export const currentCoupons = loadCouponsForEdit;

/**
 * Enregistre la LISTE complète (même contrat que la route admin : l'écran est
 * l'éditeur, il renvoie son état) sur R2 si personne ne l'a modifiée depuis
 * `etag`, puis committe l'instantané.
 *
 * L'ordre compte : R2 d'abord (validation comprise — c'est la prod), git
 * ensuite. Un conflit n'écrit RIEN : l'écran recharge la liste.
 */
export async function saveCouponList(
  list: PromoCode[],
  etag: string,
  report?: Report,
): Promise<Outcome & { etag?: string }> {
  const j = journal(report);
  const log = j.lines;

  j.doing('enregistrement sur R2, puis purge de l’edge');
  const res = await saveCouponsLive(list, etag);
  if (!res.ok) return { ok: false, log: res.errors };
  j.done(
    `${list.length} codes enregistrés sur R2${res.purged ? ' + edge purgé' : ` (${res.purgeError ?? 'edge non purgé'})`}.`,
  );

  const commit = commitPaths(
    ['data/curated/coupons.json'],
    'chore(coupons): mise à jour des codes promo',
    report,
  );
  return { ok: commit.ok, etag: res.etag, log: [...log, ...commit.log] };
}

// -------------------------------------------------------------- bannières ----

/** Le seul fichier que l'onglet « Bannières » écrit et committe. */
const BANNER_PATH = 'data/curated/banner.json';

/**
 * Jusqu'où le passé intéresse : une fenêtre du jeu finie depuis plus longtemps
 * n'est pas proposée à l'insertion. `banner.json` ne suit pas tout l'historique
 * de la table — au 08/10/2026 elle porte 118 fenêtres qu'il n'a pas, toutes
 * anciennes.
 */
export const BANNER_LOOKBACK_DAYS = 60;

export const NO_GAME_DATA = 'Pas de données du jeu : lancer un patch (pull) d’abord.';

/** Un jour du calendrier, comme `banner.json` et `isoDate` les écrivent. */
const ISO_DAY = /^\d{4}-\d{2}-\d{2}$/;

/** `day` décalé de `days` jours, en jours UTC. */
const shiftDay = (day: string, days: number): string =>
  new Date(Date.parse(`${day}T00:00:00Z`) + days * 86_400_000).toISOString().slice(0, 10);

/** Une bannière curée dont la fin n'est pas celle de la table. */
export interface BannerDrift {
  id: string;
  name: string;
  start: string;
  /** La fin de `banner.json`. */
  curated: string;
  /** Celle de la table. */
  game: string;
  type: string;
}

export interface BannerDiff {
  missing: RecruitWindow[];
  drift: BannerDrift[];
}

/**
 * Ce que la table du jeu sait et que `banner.json` ne dit pas — PURE. Une
 * bannière se reconnaît à son perso et à son début, comme le fichier les suit :
 *
 *   - `missing` : une fenêtre du jeu sans bannière curée de même (perso, début),
 *     si elle n'est pas finie depuis plus de `BANNER_LOOKBACK_DAYS` jours —
 *     récentes d'abord ;
 *   - `drift` : même (perso, début) des deux côtés, fins différentes.
 *
 * Une bannière curée absente de la table n'est PAS un écart : VAGames purge les
 * vieilles lignes, et une bannière se pré-saisit avant que le patch l'apporte.
 * Une fenêtre sans dates lisibles (DEMIURGE, la fin d'une SEASONAL_SELECTION —
 * cf. `recruitWindows`) ne se compare pas : elle n'est ni proposée ni un écart,
 * « aligner » une fin sur `0` écrirait une bannière que `validateBanners` refuse.
 */
export function diffBanners(curated: Banner[], game: RecruitWindow[], today: string): BannerDiff {
  const key = (id: string, start: string): string => `${id} @ ${start}`;
  // Deux groupes peuvent porter le même (perso, début) : la fin la plus tardive
  // parle pour eux.
  const windows = new Map<string, RecruitWindow[]>();
  for (const w of game) {
    if (!ISO_DAY.test(w.start) || !ISO_DAY.test(w.end)) continue;
    const k = key(w.characterId, w.start);
    windows.set(k, [...(windows.get(k) ?? []), w]);
  }
  const latest = (list: RecruitWindow[]): RecruitWindow =>
    list.reduce((a, b) => (b.end > a.end ? b : a));

  const known = new Set(curated.map((b) => key(b.id, b.start)));
  const floor = shiftDay(today, -BANNER_LOOKBACK_DAYS);
  const missing = [...windows]
    .filter(([k]) => !known.has(k))
    .map(([, list]) => latest(list))
    .filter((w) => w.end >= floor)
    .sort((a, b) => b.start.localeCompare(a.start) || a.characterId.localeCompare(b.characterId));

  const drift = curated.flatMap((b): BannerDrift[] => {
    const list = windows.get(key(b.id, b.start));
    if (!list || list.some((w) => w.end === b.end)) return [];
    const w = latest(list);
    return [{ id: b.id, name: b.name, start: b.start, curated: b.end, game: w.end, type: w.type }];
  });
  return { missing, drift };
}

/** Les lectures de l'onglet « Bannières », injectées : le curé, la table, le jour. */
export interface BannersDisk {
  loadBanners: () => Banner[];
  /** Les lignes de `RecruitGroupTemplet` — `null` tant qu'aucun pull ne l'a posée. */
  recruitGroups: () => Row[] | null;
  /** Le jour UTC, la règle de la home (`todayUTC` de `lib/home`). */
  today: () => string;
}

/** Celles de la route : le store de l'admin, `.gamedata/parsed/`, l'horloge. */
export const BANNERS_DISK: BannersDisk = {
  loadBanners,
  recruitGroups: () =>
    existsSync(tablePath('RecruitGroupTemplet')) ? loadTable('RecruitGroupTemplet') : null,
  today: () => new Date().toISOString().slice(0, 10),
};

/**
 * L'onglet « Bannières » : `banner.json` tel que le disque le porte (pas sa
 * copie R2), le jour UTC, le roster (id et nom complet anglais — la page
 * compose le visage de l'id, comme dans Rangs), les fenêtres de la table du jeu
 * (`game`) et ce qu'elle sait de plus que le fichier (`diffBanners`).
 *
 * Un perso de la table absent du roster est `unknown` : pas encore intégré au
 * site, la home ne saurait pas l'afficher.
 *
 * Sans table (`.gamedata/parsed/` jamais tiré) ou sur une table illisible :
 * `game` à `null` et `gameError`, jamais une erreur de route — la liste curée
 * s'édite sans la détection.
 */
export function bannersState(disk: BannersDisk = BANNERS_DISK) {
  const banners = disk.loadBanners();
  const today = disk.today();
  const roster = getCharacterListItems()
    .map((c) => ({ id: c.id, name: characterDisplayName(c) }))
    .sort((a, b) => a.name.localeCompare(b.name));

  let game: RecruitWindow[] | null = null;
  let gameError: string | undefined;
  try {
    const groups = disk.recruitGroups();
    if (groups) game = recruitWindows(groups, new Set(roster.map((c) => c.id)));
    else gameError = NO_GAME_DATA;
  } catch (e: unknown) {
    gameError = `RecruitGroupTemplet illisible : ${e instanceof Error ? e.message : String(e)}`;
  }

  return {
    banners,
    today,
    roster,
    game,
    ...(gameError ? { gameError } : {}),
    ...diffBanners(banners, game ?? [], today),
  };
}

/** Un refus de `validateBanners`, situé : `index` est le rang dans la liste envoyée. */
export interface BannerIssue {
  index: number | null;
  message: string;
}

/** Situe un écart de `validateBanners` (« Banner 3 (Titia): invalid end date… »). */
function locateBannerError(error: string): BannerIssue {
  const m = /^Banner (\d+) /.exec(error);
  return { index: m ? Number(m[1]) - 1 : null, message: error };
}

/** Les trois écritures de `saveBannerList`, injectées : le store, R2, git. */
export interface BannersDeps {
  saveBanners: (list: Banner[]) => Promise<string[]>;
  publishBanners: () => Promise<RuntimePublishResult>;
  commitPaths: (paths: string[], message: string, report?: Report) => Outcome;
}

/** Celles de la route : le store et la publication de l'admin, le vrai `commitPaths`. */
export const BANNERS_DEPS: BannersDeps = { saveBanners, publishBanners, commitPaths };

/** Au-delà, le message de commit compte les bannières au lieu de les nommer. */
const BANNERS_NAMED = 3;

/** `chore(banner): Lambda, Titia` — ou leur nombre, au-delà de trois. */
function bannerCommitMessage(changed: string[]): string {
  const names = [...new Set(changed.map((n) => n.trim()).filter(Boolean))];
  if (changed.length > BANNERS_NAMED) return `chore(banner): ${changed.length} bannières`;
  return `chore(banner): ${names.join(', ') || 'mise à jour des bannières'}`;
}

/**
 * Enregistre la LISTE complète des bannières (même contrat que la route admin :
 * l'écran est l'éditeur, il renvoie son état) : `saveBanners` — la validation
 * de l'admin, puis le fichier —, `publishBanners` (R2 et purge de l'edge), puis
 * un commit sur ce seul fichier. `changed` nomme les bannières qui ont bougé
 * (ajoutées, modifiées, retirées) : la page les connaît, le message de commit
 * les dit.
 *
 * Une erreur de validation n'écrit, ne publie ni ne committe RIEN : `issues`
 * les situe pour la page, le journal les dit.
 *
 * Un échec de R2 n'est PAS un refus, comme dans l'admin : le fichier est écrit
 * et committé quand même, le résultat est en échec (`ok` faux) pour que le
 * journal se déplie sur la ligne qui le dit. `written` : le disque porte la
 * liste, la page le relit.
 */
export async function saveBannerList(
  list: Banner[],
  changed: string[],
  deps: BannersDeps,
  report?: Report,
): Promise<Outcome & { issues: BannerIssue[]; written: boolean }> {
  if (!Array.isArray(list))
    return { ok: false, log: ['Liste de bannières attendue.'], issues: [], written: false };
  // Les quatre champs du fichier, et eux seuls : la page porte aussi ses clés.
  const banners = list.map((b): Banner => ({
    id: String(b?.id ?? ''),
    name: String(b?.name ?? ''),
    start: String(b?.start ?? ''),
    end: String(b?.end ?? ''),
  }));

  const errors = await deps.saveBanners(banners);
  if (errors.length)
    return {
      ok: false,
      log: errors.map((e) => `REFUSÉ — ${e}`),
      issues: errors.map(locateBannerError),
      written: false,
    };

  const j = journal(report);
  const n = banners.length;
  j.done(`${n} bannière${n > 1 ? 's écrites' : ' écrite'} dans ${BANNER_PATH}.`);

  j.doing('publication sur R2, puis purge de l’edge');
  const pub = await deps.publishBanners();
  j.done(
    pub.ok
      ? `publié sur R2${pub.purged ? ' + edge purgé' : ` (${pub.error ?? 'edge non purgé'})`} — en ligne en ≤ 10 min.`
      : `R2 NON PUBLIÉ : ${pub.error ?? 'erreur inconnue'}`,
  );

  const commit = deps.commitPaths([BANNER_PATH], bannerCommitMessage(changed), report);
  return {
    ok: commit.ok && pub.ok,
    log: [
      ...j.lines,
      ...commit.log,
      // En dernier : c'est la ligne que le journal montre en rouge.
      ...(pub.ok
        ? []
        : ['R2 non publié : la home ne suivra qu’au prochain enregistrement, ou à `pnpm commit`.']),
    ],
    issues: [],
    written: true,
  };
}

// -------------------------------------------------------- journal du site ----

/** Le seul fichier que l'onglet « Journal du site » écrit et committe. */
const CHANGELOG_PATH = 'data/curated/changelog.json';

/** Les lectures de l'onglet « Journal du site », injectées : le curé, le jour. */
export interface ChangelogDisk {
  loadChangelog: () => ChangelogEntry[];
  /** Le jour UTC — la date d'une entrée est aussi sa mise en ligne. */
  today: () => string;
}

/** Celles de la route : le store de l'admin, l'horloge. */
export const CHANGELOG_DISK: ChangelogDisk = {
  loadChangelog,
  today: () => new Date().toISOString().slice(0, 10),
};

/**
 * L'onglet « Journal du site » : `changelog.json` tel que le disque le porte,
 * dans l'ordre du fichier, le jour UTC, le roster (id, nom complet anglais,
 * slug — la recherche du gabarit Perso et du lien d'une entrée), les gabarits
 * avec leurs champs préremplis au jour, et les libellés des types et des sortes
 * de lien : la page n'en recopie aucun.
 *
 * `langs.file` est l'ordre des langues dans le fichier (celui de `LANGS`),
 * `langs.shown` celui de l'écran, comme Gear reco : l'anglais, puis le français
 * et l'espagnol que Sevih relit, puis le reste.
 */
export function changelogState(disk: ChangelogDisk = CHANGELOG_DISK) {
  const today = disk.today();
  return {
    entries: disk.loadChangelog(),
    today,
    roster: getCharacterListItems()
      .map((c) => ({ id: c.id, name: characterDisplayName(c), slug: slugForId(c.id) ?? '' }))
      .sort((a, b) => a.name.localeCompare(b.name)),
    templates: CHANGELOG_TEMPLATES.map((t) => {
      const defaults = templateDefaults(t, today);
      return {
        id: t.id,
        label: t.label,
        type: t.type,
        fields: t.fields.map((f) => ({
          key: f.key,
          label: f.label,
          kind: f.kind,
          value: defaults[f.key] ?? '',
          placeholder: f.placeholder ?? '',
          options: (f.options ?? []).map((o) => ({ value: o.value, label: o.label ?? o.value })),
        })),
      };
    }),
    types: CHANGELOG_TYPES,
    linkKinds: CHANGELOG_LINK_KINDS,
    langs: {
      default: DEFAULT_LANG,
      file: LANGS,
      shown: [...NOTE_LANGS, ...LANGS.filter((l) => !NOTE_LANGS.includes(l))],
    },
  };
}

/**
 * Un gabarit rempli, prêt à poser en tête de liste : `fillTemplate`, appelé
 * ICI — la page n'a ni les noms du roster dans les six langues ni la règle de
 * remplissage, et une seule copie ne peut pas diverger de l'autre. Rien ne
 * s'écrit.
 *
 * `values` : les champs saisis dans le formulaire du gabarit. Pour le gabarit
 * Perso, `character` est l'id du perso choisi : son nom par langue
 * (`characterDisplayName`), son slug (`slugForId`), et la variante « exclusive
 * equipment » quand le jeu lui en connaît un. Un champ laissé vide n'est PAS
 * une erreur : il reste écrit dans l'entrée (`{guide}`), refusé seulement à
 * l'enregistrement.
 */
export function fillChangelogTemplate(
  templateId: unknown,
  values: unknown,
  today: string,
): (FilledTemplate & { date: string }) | { error: string } {
  const template = CHANGELOG_TEMPLATES.find((t) => t.id === templateId);
  if (!template) return { error: `gabarit inconnu : ${String(templateId ?? '')}` };
  const given: Record<string, TemplateValue> = {};
  if (values && typeof values === 'object')
    for (const [key, value] of Object.entries(values))
      if (typeof value === 'string') given[key] = value;

  const picked: Record<string, TemplateValue> = {};
  const who = template.fields.find((f) => f.kind === 'character');
  if (who) {
    const c = getCharacterListItems().find((x) => x.id === given.character);
    if (!c) return { error: `perso inconnu : ${String(given.character ?? '') || '(aucun)'}` };
    picked[who.key] = perLang((l) => characterDisplayName(c, l));
    picked.slug = slugForId(c.id) ?? '';
    given.scope ??= getEEViews().some((e) => e.characterId === c.id)
      ? CHARACTER_SCOPE.ee
      : CHARACTER_SCOPE.base;
  }
  return {
    ...fillTemplate(template, { ...templateDefaults(template, today), ...given, ...picked }),
    date: today,
  };
}

/** Les sortes de lien qu'une entrée peut porter. */
const CHANGELOG_LINKS = new Set<string>(CHANGELOG_LINK_KINDS.map((k) => k.value).filter(Boolean));

/** Le lien d'une entrée reçue : une sorte connue et une valeur, sinon aucun. */
function cleanChangelogLink(raw: unknown): ChangelogLink | undefined {
  if (!raw || typeof raw !== 'object') return undefined;
  const { kind, slug, href } = raw as Record<string, unknown>;
  if (typeof kind !== 'string' || !CHANGELOG_LINKS.has(kind)) return undefined;
  const value = kind === 'character' ? slug : href;
  if (typeof value !== 'string' || !value.trim()) return undefined;
  return kind === 'character'
    ? { kind, slug: value.trim() }
    : { kind: kind as Exclude<ChangelogLink['kind'], 'character'>, href: value.trim() };
}

/**
 * Une entrée reçue de la page, réduite à ce que le fichier porte — la règle de
 * l'éditeur de l'admin (`toEntry`) : les clés du fichier et elles seules, dans
 * son ordre ; un titre vide ou une langue sans puce ne s'écrivent pas ; `draft`
 * seulement s'il est vrai. L'ordre des langues reçu est gardé : une entrée du
 * disque renvoyée intacte se réécrit à l'identique (aucun diff sur ce que la
 * page n'a pas touché). `image`, que l'éditeur de l'admin perdait, est gardée.
 */
function cleanChangelogEntry(raw: unknown): ChangelogEntry {
  const e = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>;
  const perKnownLang = <T>(map: unknown, keep: (v: unknown) => T | undefined) => {
    const out: Partial<Record<Lang, T>> = {};
    if (map && typeof map === 'object')
      for (const [lang, v] of Object.entries(map)) {
        const kept = isValidLang(lang) ? keep(v) : undefined;
        if (kept !== undefined) out[lang as Lang] = kept;
      }
    return out;
  };
  const text = (v: unknown): string | undefined =>
    typeof v === 'string' && v.trim() ? v.trim() : undefined;
  const lines = (v: unknown): string[] | undefined => {
    const kept = Array.isArray(v) ? v.flatMap((x) => text(x) ?? []) : [];
    return kept.length ? kept : undefined;
  };
  const link = cleanChangelogLink(e.link);
  const image = text(e.image);
  return {
    date: String(e.date ?? ''),
    type: String(e.type ?? '') as ChangelogType,
    title: perKnownLang(e.title, text),
    content: perKnownLang(e.content, lines),
    ...(link && { link }),
    ...(image && { image }),
    ...(e.draft === true && { draft: true }),
  };
}

/** Un refus situé : `index` est le rang de l'entrée dans la liste envoyée. */
export interface ChangelogIssue {
  index: number | null;
  message: string;
}

/** Situe un refus de `saveChangelog` (« Entrée 3 : titre EN requis. »). */
function locateChangelogError(error: string): ChangelogIssue {
  const m = /^Entrée (\d+) /.exec(error);
  return { index: m ? Number(m[1]) - 1 : null, message: error };
}

/** Les deux écritures de `saveChangelogList`, injectées : le store, git. */
export interface ChangelogDeps {
  saveChangelog: (list: ChangelogEntry[]) => Promise<string[]>;
  commitPaths: (paths: string[], message: string, report?: Report) => Outcome;
}

/** Celles de la route : le store de l'admin, le vrai `commitPaths`. */
export const CHANGELOG_DEPS: ChangelogDeps = { saveChangelog, commitPaths };

/** Au-delà, le message de commit compte les entrées au lieu de les nommer. */
const CHANGELOG_NAMED = 3;

/** `chore(changelog): Demiurge Lambda, Annihilator` — ou leur nombre, au-delà de trois. */
function changelogCommitMessage(changed: string[]): string {
  if (changed.length > CHANGELOG_NAMED) return `chore(changelog): ${changed.length} entrées`;
  const titles = changed.map((t) => t.trim()).filter(Boolean);
  return `chore(changelog): ${titles.join(', ') || 'mise à jour du journal'}`;
}

/**
 * Enregistre la LISTE complète du journal (même contrat que la route admin :
 * l'écran est l'éditeur, il renvoie son état) : `saveChangelog` — la validation
 * de l'admin, puis le fichier —, puis un commit sur ce seul fichier. `changed`
 * porte les titres anglais des entrées qui ont bougé (ajoutées, modifiées,
 * retirées) : la page les connaît, le message de commit les dit.
 *
 * Pas de R2 : le site lit `changelog.json` par import statique, une entrée
 * n'est en ligne qu'après « Pousser » et le build de la CI.
 *
 * Deux refus, qui n'écrivent ni ne committent RIEN, situés par rang (`issues`) :
 * un champ de gabarit encore écrit dans une entrée (`{guide}` — vu d'abord, le
 * store ne le connaît pas), puis la validation du store (titre anglais, type,
 * date).
 */
export async function saveChangelogList(
  list: unknown,
  changed: string[],
  deps: ChangelogDeps,
  report?: Report,
): Promise<Outcome & { issues: ChangelogIssue[]; written: boolean }> {
  if (!Array.isArray(list))
    return { ok: false, log: ['Liste d’entrées attendue.'], issues: [], written: false };
  const entries = list.map(cleanChangelogEntry);

  const unfilled = entries.flatMap((e, index): ChangelogIssue[] => {
    const fields = unfilledFields(e);
    if (!fields.length) return [];
    const many = fields.length > 1 ? 's' : '';
    return [
      {
        index,
        message: `Entrée ${index + 1} : champ${many} de gabarit non rempli${many} — ${fields.map((f) => `{${f}}`).join(', ')}.`,
      },
    ];
  });
  const issues = unfilled.length
    ? unfilled
    : (await deps.saveChangelog(entries)).map(locateChangelogError);
  if (issues.length)
    return {
      ok: false,
      log: issues.map((i) => `REFUSÉ — ${i.message}`),
      issues,
      written: false,
    };

  const j = journal(report);
  const n = entries.length;
  j.done(
    `${n} entrée${n > 1 ? 's écrites' : ' écrite'} dans ${CHANGELOG_PATH} — lu au build : en ligne après « Pousser » et la CI.`,
  );
  const commit = deps.commitPaths([CHANGELOG_PATH], changelogCommitMessage(changed), report);
  return { ok: commit.ok, log: [...j.lines, ...commit.log], issues: [], written: true };
}

/** Ce que la page `/changelog` montrerait d'une entrée, dans une langue. */
export interface ChangelogPreview {
  type: ChangelogType;
  /** Le libellé du badge de type, dans la langue (`changelog.type.*`). */
  badge: string;
  /** L'emoji du type : la vignette de repli, quand `image` est `null`. */
  icon: string;
  /** La date comme la carte l'écrit ; telle que saisie si elle n'en est pas une. */
  date: string;
  title: string;
  /** Une puce = ses segments (`bulletSegments` : le gras, et lui seul). */
  bullets: BulletSegment[][];
  link: { kind: ChangelogLink['kind']; label: string; href: string } | null;
  /** L'adresse de la vignette — relative à la base des images quand elle commence par `/`. */
  image: string | null;
}

/**
 * L'aperçu de l'onglet « Journal du site » : une entrée EN COURS d'édition,
 * rendue par les fonctions de la page — `resolveChangelogEntry` (la langue,
 * repli anglais), `bulletSegments` (le gras), et la présentation de la carte
 * (`changelogThumb` : l'image explicite, sinon le portrait du perso ou la carte
 * du guide ; `changelogHref` ; les libellés i18n du badge et du lien). Rien ne
 * s'écrit, rien n'est validé : c'est un aperçu, un titre vide passe.
 *
 * Seul un type inconnu est refusé (la carte n'aurait ni badge ni icône). Tout
 * refus est RENDU, jamais levé.
 */
export async function previewChangelogEntry(
  entry: unknown,
  lang: unknown,
): Promise<ChangelogPreview | { error: string }> {
  if (!entry || typeof entry !== 'object' || Array.isArray(entry))
    return { error: 'entry : une entrée du journal attendue' };
  const clean = cleanChangelogEntry(entry);
  if (!CHANGELOG_TYPES.some((t) => t.value === clean.type))
    return { error: `type inconnu : ${clean.type || '(vide)'}` };
  try {
    const l = normalizeLang(typeof lang === 'string' ? lang : DEFAULT_LANG);
    const t = await getT(l);
    const resolved = resolveChangelogEntry(clean, l);
    const href = changelogHref(resolved.link);
    const dated = ISO_DAY.test(resolved.date) && !Number.isNaN(Date.parse(resolved.date));
    return {
      type: resolved.type,
      badge: t(`changelog.type.${resolved.type}`),
      icon: CHANGELOG_TYPE_ICON[resolved.type],
      date: dated ? formatChangelogDate(resolved.date, l) : resolved.date,
      title: resolved.title,
      bullets: resolved.content.map(bulletSegments),
      link:
        resolved.link && href
          ? {
              kind: resolved.link.kind,
              label: t(changelogGotoKey(resolved.link.kind)),
              href: localePath(l, href),
            }
          : null,
      image: changelogThumb(resolved) ?? null,
    };
  } catch (e: unknown) {
    return { error: e instanceof Error ? e.message : String(e) };
  }
}

// -------------------------------------------------------- tableau de bord ----

/**
 * Le site de dev de ce poste, où vit l'admin : Caddy le sert sous ce nom sur
 * les deux PC (`Caddyfile.dev`, comme `QUICK_HOST` de `lan.ts`). `ADMIN_BASE`
 * dans `.env.local` le remplace — un `http://localhost:3000` sans Caddy.
 */
export const ADMIN_BASE_DEFAULT = 'https://outerpedia.local';

/**
 * Les pages de l'admin que quick a déjà : `href` d'un item de l'inbox → section
 * de quick. Le lot qui porte une page y ajoute sa ligne : le tableau de bord y
 * renvoie alors au lieu de l'admin (`inQuick`). Aujourd'hui l'éditeur des
 * effets, celui des persos (la « Fiche perso », Gear reco compris), celui des
 * EE (son sous-onglet « EE ») et les outils Pro / Con et Synergy (deux autres
 * de ses sous-onglets) — l'inbox, elle, ne renvoie encore qu'à l'extractor, aux
 * tags et aux données du jeu.
 */
export const ADMIN_TO_QUICK: Readonly<Record<string, string>> = {
  '/admin/editor/characters': 'character',
  '/admin/editor/ee': 'character',
  '/admin/editor/effects': 'effects',
  '/admin/tools/pros-cons': 'character',
  '/admin/tools/synergies': 'character',
};

/** Sous combien de jours un code promo actif est « à échéance ». */
export const COUPON_EXPIRY_DAYS = 7;

/**
 * Ce que `proposal` compare, de `data/extracted/` à `data/generated/` : la
 * version et trois fichiers lourds, pas tout le dossier. Aucun des fichiers à
 * rétention de `promote.ts` (monstres, rencontres) : ceux-là diffèrent de la
 * proposition par construction.
 */
const PROPOSAL_FILES = ['game-version.json', 'characters.json', 'skills.json', 'items.json'];

/** Jours entiers de `from` à `to`, deux jours du calendrier. */
const daysBetween = (from: string, to: string): number =>
  Math.round((Date.parse(`${to}T00:00:00Z`) - Date.parse(`${from}T00:00:00Z`)) / 86_400_000);

export type DashboardBlock = 'inbox' | 'git' | 'game' | 'banners' | 'coupons';

/** Les lectures du tableau de bord, injectées : l'admin, git, le jeu, les deux listes. */
export interface DashboardDisk {
  /** `buildInbox()` de l'admin : SA liste, triée par lui. */
  inbox: () => InboxItem[] | Promise<InboxItem[]>;
  /** Où l'admin répond (`ADMIN_BASE`). */
  adminBase: () => string;
  /** `href` admin → section de quick (`ADMIN_TO_QUICK`). */
  quickTabs: Readonly<Record<string, string>>;
  gitState: () => GitState;
  /** `git log -1 --format=%h%x09%s%x09%cr`, brut ; vide sans commit. */
  lastCommit: () => string;
  /** `git status --porcelain`, brut. */
  porcelain: () => string;
  /** `resVersion` de `data/generated/game-version.json`. */
  siteVersion: () => string;
  /** Celle du client Steam installé ; `null` sans client sur ce poste. */
  clientVersion: () => string | null;
  /** Date de modification d'un fichier du dépôt (ms) ; `null` s'il manque. */
  mtime: (path: string) => number | null;
  /** Deux fichiers du dépôt, identiques à l'octet ? */
  sameBytes: (a: string, b: string) => boolean;
  /** Un JSON du dépôt, parsé ; `null` s'il manque. */
  readJson: (path: string) => unknown;
  banners: () => Pick<
    ReturnType<typeof bannersState>,
    'banners' | 'missing' | 'drift' | 'gameError'
  >;
  coupons: () => Promise<{ list: PromoCode[]; error?: string }>;
  /** Le jour UTC, la même règle que les bannières. */
  today: () => string;
}

/** Celles de la route : l'admin tel quel, le dépôt, le client Steam, R2. */
export const DASHBOARD_DISK: DashboardDisk = {
  // À la demande : le moteur de revue pèse, et les autres routes ne le lisent pas.
  inbox: async () => (await import('@/lib/admin/admin-inbox')).buildInbox(),
  adminBase: () => process.env.ADMIN_BASE || ADMIN_BASE_DEFAULT,
  quickTabs: ADMIN_TO_QUICK,
  gitState: () => gitState(),
  lastCommit: () => {
    const log = git(['log', '-1', '--format=%h%x09%s%x09%cr']);
    return log.ok ? log.out : '';
  },
  porcelain: () => {
    const status = git(['status', '--porcelain']);
    if (!status.ok) throw new Error(`git status a échoué : ${status.out}`);
    return status.out;
  },
  siteVersion: () =>
    (JSON.parse(readFileSync(resolve('data/generated/game-version.json'), 'utf8')) as GameVersion)
      .resVersion,
  clientVersion: () => {
    const install = findSteamInstall();
    return install ? installedResVersion(install) : null;
  },
  mtime: (path) => statSync(resolve(path), { throwIfNoEntry: false })?.mtimeMs ?? null,
  sameBytes: (a, b) =>
    statSync(resolve(a)).size === statSync(resolve(b)).size &&
    readFileSync(resolve(a)).equals(readFileSync(resolve(b))),
  readJson: (path) =>
    statSync(resolve(path), { throwIfNoEntry: false })
      ? (JSON.parse(readFileSync(resolve(path), 'utf8')) as unknown)
      : null,
  banners: () => bannersState(),
  coupons: currentCoupons,
  today: BANNERS_DISK.today,
};

/**
 * Une proposition d'extraction attend-elle d'être revue ou promue ? Vrai si un
 * des `PROPOSAL_FILES` de `data/extracted/` est plus récent que son homologue
 * de `data/generated/` ET n'a pas les mêmes octets — la date seule serait
 * vraie en permanence : `pnpm dev` rebâtit la proposition à chaque lancement,
 * à l'identique quand le jeu n'a pas bougé. Sans `data/extracted/` (jamais de
 * build sur ce poste) : rien n'attend. Et une différence qui se réduit aux
 * persos que la garde perso de `promote.ts` écarterait (proposés, inconnus du
 * validé — un perso d'un patch à venir, sans nom) n'est PAS une proposition :
 * rien ne partirait à la promotion (décision Sevih, 08/10).
 */
function hasProposal(disk: DashboardDisk): boolean {
  // Les persos que la garde de `promote.ts` écarterait : proposés, inconnus du
  // validé. Lus une fois, seulement si un fichier mérite la comparaison.
  let unintegrated: ReadonlySet<string> | null = null;
  const guard = (): ReadonlySet<string> => {
    if (unintegrated) return unintegrated;
    const ids = (path: string): string[] => {
      const data = disk.readJson(path);
      return data && typeof data === 'object' ? Object.keys(data as object) : [];
    };
    const known = new Set(ids('data/generated/characters.json'));
    unintegrated = new Set(ids('data/extracted/characters.json').filter((id) => !known.has(id)));
    return unintegrated;
  };
  // Même contenu une fois les persos non intégrés retirés de la proposition ?
  const sameAfterGuard = (extracted: string, generated: string): boolean => {
    const ids = guard();
    if (!ids.size) return false;
    const proposed = disk.readJson(extracted);
    stripUnintegratedCharacters(proposed, ids);
    return JSON.stringify(proposed) === JSON.stringify(disk.readJson(generated));
  };

  return PROPOSAL_FILES.some((name) => {
    const extracted = `data/extracted/${name}`;
    const generated = `data/generated/${name}`;
    const extractedAt = disk.mtime(extracted);
    if (extractedAt === null) return false;
    const generatedAt = disk.mtime(generated);
    if (generatedAt === null) return true;
    if (extractedAt <= generatedAt || disk.sameBytes(extracted, generated)) return false;
    return !sameAfterGuard(extracted, generated);
  });
}

/**
 * Le tableau de bord, l'accueil de quick : ce qui demande une action. Il ne
 * décide de rien — chaque bloc relit ce qu'un autre écran sait déjà :
 *
 *   - `inbox` : l'inbox de l'admin, TELLE QUELLE, chaque item avec son adresse
 *     complète dans l'admin (`href`) et, quand quick a déjà la section,
 *     `inQuick` et son `tab` ;
 *   - `git` : `gitState` (le compte de « Pousser »), le dernier commit et le
 *     nombre de fichiers modifiés ou non suivis (`dirty`) ;
 *   - `game` : la version du site contre celle du client installé (`client` :
 *     `same`, `ahead` — un patch attend —, `behind`, `absent`), et `proposal` ;
 *   - `banners` : les actives et les à venir de `banner.json`, et les comptes
 *     de la détection (`missing`, `drift`) — ceux de l'onglet Bannières ;
 *   - `coupons` : les actifs, et ceux qui expirent sous `COUPON_EXPIRY_DAYS`.
 *
 * Chaque bloc est INDÉPENDANT : une lecture qui lève rend `null` pour le sien
 * et sa raison dans `errors`, les autres sont servis — jamais une erreur de
 * route.
 */
export async function dashboardState(disk: DashboardDisk = DASHBOARD_DISK) {
  const today = disk.today();
  const errors: Partial<Record<DashboardBlock, string>> = {};
  const block = async <T>(name: DashboardBlock, read: () => T | Promise<T>): Promise<T | null> => {
    try {
      return await read();
    } catch (e: unknown) {
      errors[name] = e instanceof Error ? e.message : String(e);
      return null;
    }
  };

  // Lancé en premier : c'est le seul bloc qui attend le réseau (R2).
  const couponsRead = block('coupons', async () => {
    const { list, error } = await disk.coupons();
    const active = list.filter((c) => c.start <= today && today <= c.end);
    return {
      total: list.length,
      active: active.length,
      within: COUPON_EXPIRY_DAYS,
      expiring: active
        .map((c) => ({ code: c.code, daysLeft: daysBetween(today, c.end) }))
        .filter((c) => c.daysLeft <= COUPON_EXPIRY_DAYS)
        .sort((a, b) => a.daysLeft - b.daysLeft || a.code.localeCompare(b.code)),
      // R2 injoignable : c'est l'instantané local qui est compté.
      ...(error ? { error } : {}),
    };
  });

  const inbox = await block('inbox', async () => {
    const base = disk.adminBase().replace(/\/+$/, '');
    return (await disk.inbox()).map((item) => {
      const tab = disk.quickTabs[item.href] ?? null;
      return { ...item, href: `${base}${item.href}`, inQuick: tab !== null, tab };
    });
  });

  const gitBlock = await block('git', () => {
    const [hash = '', subject = '', when = ''] = disk.lastCommit().split('\t');
    return {
      ...disk.gitState(),
      last: hash ? { hash, subject, when } : null,
      dirty: disk.porcelain().split('\n').filter(Boolean).length,
    };
  });

  const game = await block('game', () => {
    const site = disk.siteVersion();
    const client = disk.clientVersion();
    const gap = client === null ? 0 : client.localeCompare(site, 'en', { numeric: true });
    return {
      site,
      version: client,
      client:
        client === null
          ? ('absent' as const)
          : gap > 0
            ? ('ahead' as const)
            : gap < 0
              ? ('behind' as const)
              : ('same' as const),
      proposal: hasProposal(disk),
    };
  });

  const banners = await block('banners', () => {
    const state = disk.banners();
    return {
      active: state.banners
        .filter((b) => b.start <= today && today <= b.end)
        .map((b) => ({ id: b.id, name: b.name, daysLeft: daysBetween(today, b.end) }))
        .sort((a, b) => a.daysLeft - b.daysLeft),
      upcoming: state.banners
        .filter((b) => b.start > today)
        .map((b) => ({ id: b.id, name: b.name, inDays: daysBetween(today, b.start) }))
        .sort((a, b) => a.inDays - b.inDays),
      missing: state.missing.length,
      drift: state.drift.length,
      ...(state.gameError ? { gameError: state.gameError } : {}),
    };
  });

  return { today, inbox, git: gitBlock, game, banners, coupons: await couponsRead, errors };
}

// ---------------------------------------------------------------- comics -----

/** Nom de fichier ASSAINI : basename seul, jeu de caractères clos. */
function safeName(name: string): string | null {
  const base = basename(name);
  return /^[A-Za-z0-9._-]+\.(png|jpe?g|webp)$/i.test(base) ? base : null;
}

export interface ComicUpload {
  name: string;
  /** Contenu du fichier en base64 (l'écran lit l'image côté navigateur). */
  data: string;
}

/** Les planches d'UNE langue dans un envoi — celle du dossier où elles vont. */
export interface ComicBatch {
  lang: ComicLang;
  files: ComicUpload[];
}

/** Une BD : son radical, et sa planche dans chaque langue où elle est venue. */
export interface ComicGroup {
  stem: string;
  slots: Partial<Record<ComicLang, ComicUpload>>;
}

/**
 * La langue que dit le NOM d'une planche (`_EN`, `_JP`, `_KR` juste avant
 * l'extension, sans égard à la casse), ou `null`. La règle vit dans
 * `ui/comics-group.mjs`, que la page charge aussi.
 */
export function comicLangOf(name: string): ComicLang | null {
  return splitComicName(name, COMIC_LANGS).lang;
}

/**
 * Les planches regroupées par BD, dans l'ordre d'arrivée (cf. `groupByStem`).
 * Une planche va dans la langue qu'elle porte (`lang`), sinon dans celle de son
 * nom, sinon dans `fallback`.
 */
export function groupComics(
  files: (ComicUpload & { lang?: ComicLang })[],
  fallback: ComicLang = COMIC_LANGS[0],
): ComicGroup[] {
  return groupByStem(files, COMIC_LANGS, fallback);
}

/** Ce que `addComics` écrit et lance, injecté : le pool, la chaîne, git. */
export interface ComicsDeps {
  /** Le pool éditorial des BD : un dossier par langue. */
  dir: string;
  /** Conversion webp et manifeste (`assets:collect-comics`). */
  collect: () => Promise<{ made: number; skipped: number }>;
  /** Sauvegarde des originaux (`editorial:push`). */
  pushEditorial: () => void;
  /** `assets:push` : le staging sur R2, puis la purge de l'edge. */
  pushAssets: () => { ok: boolean; error: string };
  /** Repli committé réaligné sur le manifeste en ligne ; rend ce qu'il a fait. */
  syncSeed: () => string;
  commitPaths: (paths: string[], message: string, report?: Report) => Outcome;
}

/** Celles de la route : le vrai pool, la vraie chaîne, le vrai `commitPaths`. */
export const COMICS_DEPS: ComicsDeps = {
  dir: EDITORIAL_COMICS,
  collect: collectComics,
  pushEditorial,
  pushAssets: () => {
    const push = spawnSync(process.execPath, [resolve('scripts/assets-push.mjs')], {
      encoding: 'utf8',
    });
    return { ok: push.status === 0, error: (push.stderr ?? '').trim() };
  },
  syncSeed: () => syncComicsSeed(),
  commitPaths,
};

/** Au-delà, le message de commit dit « et N autres » (comme celui des rangs). */
const COMICS_NAMED = 3;

/**
 * Dépose des planches dans le pool éditorial — plusieurs BD, plusieurs langues,
 * chaque fichier dans le dossier de SA langue — puis rejoue UNE fois la
 * sous-chaîne 4-comics de `pnpm images`, et ELLE SEULE : la chaîne complète
 * collecte aussi persos, audio et wallpapers, sans rapport avec une BD ajoutée.
 * Un envoi = un commit, quel que soit le nombre de BD et de langues : une BD en
 * trois langues en demandait trois.
 *
 * Tout est contrôlé AVANT la première écriture : une langue inconnue ou un nom
 * refusé n'écrit rien, ni ce fichier ni ceux qui le précèdent dans l'envoi.
 *
 * `assets:push` reste appelé en entier : il est incrémental (diff sha1 contre
 * `pushed.json`), donc seules les nouvelles clés partent réellement.
 */
export async function addComics(
  batches: ComicBatch[],
  report?: Report,
  deps: ComicsDeps = COMICS_DEPS,
): Promise<Outcome> {
  const drops: (ComicUpload & { lang: ComicLang })[] = [];
  for (const batch of Array.isArray(batches) ? batches : []) {
    if (!COMIC_LANGS.includes(batch.lang))
      return { ok: false, log: [`Langue inconnue : ${batch.lang}`] };
    for (const f of batch.files ?? []) {
      const name = safeName(f.name);
      if (!name) return { ok: false, log: [`Nom de fichier refusé : ${f.name}`] };
      drops.push({ name, data: f.data, lang: batch.lang });
    }
  }
  if (!drops.length) return { ok: false, log: ['Aucun fichier.'] };

  const j = journal(report);
  const log = j.lines;
  for (const f of drops) {
    const dir = resolve(deps.dir, f.lang);
    mkdirSync(dir, { recursive: true });
    writeFileSync(resolve(dir, f.name), Buffer.from(f.data, 'base64'));
    j.done(`déposé : ${f.lang}/${f.name}`);
  }

  j.doing('conversion webp');
  const made = await deps.collect();
  j.done(`conversion webp : ${made.made} produites, ${made.skipped} déjà à jour.`);

  j.doing('sauvegarde des originaux sur R2 (editorial:push)');
  deps.pushEditorial();
  j.done('originaux sauvegardés sur R2 (editorial:push).');

  j.doing('push R2 du staging, puis purge de l’edge — l’étape la plus lente');
  const push = deps.pushAssets();
  if (!push.ok) return { ok: false, log: [...log, `assets:push a échoué : ${push.error}`] };
  j.done('poussé sur R2 — la galerie lit le manifeste à la requête.');

  j.done(`repli committé : ${deps.syncSeed()}.`);

  // Le message nomme les BD par leur radical, sans le préfixe commun des
  // planches officielles (`outerplane_comic08` → `comic08`), puis les langues.
  const stems = [...new Set(groupComics(drops).map((g) => g.stem.replace(/^outerplane_/, '')))];
  const langs = COMIC_LANGS.filter((l) => drops.some((f) => f.lang === l));
  const others = stems.length - COMICS_NAMED;
  const commit = deps.commitPaths(
    ['data/generated/comics.json', 'datagen/assets/pushed.json'],
    `chore(assets): 4-comics ${stems.slice(0, COMICS_NAMED).join(', ')}${others > 0 ? ` et ${others} autres` : ''} (${langs.join(', ')})`,
    report,
  );
  return { ok: commit.ok, log: [...log, ...commit.log] };
}

// --------------------------------------------------------------- vidéos ------

export type VideoTarget =
  | { kind: 'character'; id: string }
  | { kind: 'guide'; category: string; slug: string; version?: string };

export interface VideoTargetOption {
  value: string;
  label: string;
}

/**
 * Cibles proposées : un perso (tableau `videos` du curé) ou un guide.
 *
 * Côté guides on ne retient que les catégories dont la spec dit `videos: true`,
 * et le fichier visé est le `videos.json` du guide — à la racine s'il est plat,
 * sous `versions/<clé>/` s'il est versionné (la version la plus récente par
 * défaut, c'est celle qu'on alimente).
 */
export function videoTargets(): { characters: VideoTargetOption[]; guides: VideoTargetOption[] } {
  // Nom COMPLET, jamais le nom nu : `characterDisplayName` recolle le préfixe
  // (« Core Fusion », ou le surnom quand le perso l'inclut — « Monad Iota »).
  // Sans lui la liste montre plusieurs « Iota » que rien ne distingue.
  // Étiquetage en anglais (langue pivot de l'admin).
  const characters = getCharacterListItems()
    .map((c) => ({ value: `character:${c.id}`, label: characterDisplayName(c) }))
    .sort((a, b) => a.label.localeCompare(b.label));

  const guides = listGuides()
    .filter((g) => GUIDE_SPECS[g.category]?.videos)
    .map((g) => {
      const version = g.versions[0]?.key;
      return {
        value: `guide:${g.category}:${g.slug}${version ? `:${version}` : ''}`,
        label: `${g.category} · ${g.slug}${version ? ` (${version})` : ''}`,
      };
    })
    .sort((a, b) => a.label.localeCompare(b.label));

  return { characters, guides };
}

/** Reconstruit une cible depuis la valeur du sélecteur. */
export function parseTarget(value: string): VideoTarget | null {
  const [kind, ...rest] = value.split(':');
  if (kind === 'character' && rest[0]) return { kind: 'character', id: rest[0] };
  if (kind === 'guide' && rest[0] && rest[1])
    return { kind: 'guide', category: rest[0], slug: rest[1], version: rest[2] };
  return null;
}

/** Id YouTube d'une URL collée, ou l'id lui-même s'il est déjà nu. */
export function youtubeId(input: string): string | null {
  const raw = input.trim();
  if (/^[A-Za-z0-9_-]{11}$/.test(raw)) return raw;
  const m = raw.match(/(?:v=|youtu\.be\/|embed\/|shorts\/)([A-Za-z0-9_-]{11})/);
  return m ? m[1] : null;
}

export const searchVideos = (query: string) => searchOfficial(query);

/**
 * Ajoute une vidéo à sa cible, méta YouTube résolue au passage, puis rafraîchit
 * le cache `video-meta.json` (Schema.org exige `uploadDate`, jamais écrit à la
 * main) et committe. Ces données sont lues au rendu : elles n'existent en prod
 * qu'après « Pousser » et le build de la CI.
 */
export async function addVideo(
  target: VideoTarget,
  input: string,
  label?: string,
  report?: Report,
): Promise<Outcome> {
  const id = youtubeId(input);
  if (!id) return { ok: false, log: [`Id YouTube illisible : ${input}`] };

  const j = journal(report);
  const log = j.lines;

  j.doing('métadonnées YouTube');
  const meta = (await fetchMeta([id]))[id];
  if (!meta) return { ok: false, log: [`YouTube ne connaît pas ${id} (ou la clé API manque).`] };

  j.done(`${meta.title} — ${meta.author}`);
  const touched: string[] = [];

  if (target.kind === 'character') {
    const curated = loadCuratedCharacters()[target.id] ?? {};
    const videos = curated.videos ?? [];
    if (videos.some((v) => v.id === id))
      return { ok: false, log: [...log, 'Déjà présente sur ce perso.'] };
    const errors = await upsertCharacterCurated(target.id, {
      ...curated,
      videos: [
        ...videos,
        {
          platform: 'youtube',
          id,
          title: meta.title,
          author: meta.author,
          uploadDate: meta.uploadDate,
        },
      ],
    });
    if (errors.length) return { ok: false, log: [...log, ...errors] };
    touched.push('data/curated/characters.json');
    j.done(`ajoutée au perso ${target.id}.`);
  } else {
    // Le FICHIER dépend de la famille du guide (content.json, config.json d'une
    // version, ou videos.json), et le store est seul à le savoir — c'est pour
    // avoir recalculé ce chemin ici qu'on écrivait des vidéos que la page ne lit
    // pas. Même principe que les persos, qui passent par `upsertCharacterCurated`.
    const added = await appendGuideVideo(target.category, target.slug, target.version, {
      platform: 'youtube',
      id,
      title: meta.title,
      author: meta.author,
      ...(label ? { label } : {}),
    });
    if (!added.path) return { ok: false, log: [...log, ...added.errors] };
    touched.push(added.path);
    j.done(`ajoutée au guide ${target.category}/${target.slug} (${added.path}).`);
  }

  j.doing('rafraîchissement du cache video-meta');
  await refreshVideoMeta();
  touched.push('data/generated/video-meta.json');
  j.done('cache video-meta rafraîchi.');

  const commit = commitPaths(touched, `feat(videos): ${meta.title}`, report);
  return { ok: commit.ok, log: [...log, ...commit.log] };
}

// ---------------------------------------------------------- rangs et rôles ---

/**
 * Les colonnes de l'onglet « Rangs ». Cinq valeurs simples par perso, et deux
 * tables `palier → valeur` (PvE seulement) dont CHAQUE palier est une cellule.
 */
export const RANK_FIELDS = [
  'rank',
  'rankPvp',
  'role',
  'eeRank',
  'eeRank10',
  'rankByTranscend',
  'roleByTranscend',
] as const;
export type RankField = (typeof RANK_FIELDS)[number];

/** Ce que chaque colonne accepte — `''` (cellule vidée) en plus, partout. */
const FIELD_VALUES: Record<RankField, readonly string[]> = {
  rank: TIERS,
  rankPvp: TIERS,
  role: CURATED_ROLES,
  eeRank: EE_TIERS,
  eeRank10: EE_TIERS,
  rankByTranscend: TIERS,
  roleByTranscend: CURATED_ROLES,
};

/** Libellé d'une colonne dans le journal. */
const FIELD_LABELS: Record<RankField, string> = {
  rank: 'PvE',
  rankPvp: 'PvP',
  role: 'rôle',
  eeRank: 'EE base',
  eeRank10: 'EE +10',
  rankByTranscend: 'PvE',
  roleByTranscend: 'rôle',
};

const STEP_KEYS = CURATED_STEPS.map(String);
const isTable = (f: RankField): f is 'rankByTranscend' | 'roleByTranscend' =>
  f === 'rankByTranscend' || f === 'roleByTranscend';
const isEe = (f: RankField): f is 'eeRank' | 'eeRank10' => f === 'eeRank' || f === 'eeRank10';

/**
 * Une cellule modifiée. `from` est la valeur que la page AVAIT CHARGÉE, `to`
 * celle choisie ; `''` = cellule vide des deux côtés. `step` (clé `TransStar`)
 * désigne le palier quand `field` est une des deux tables.
 */
export interface RankChange {
  id: string;
  field: RankField;
  step?: string;
  from: string;
  to: string;
}

/** L'état du disque contre lequel un lot de changements s'applique. */
export interface RankDisk {
  /** `data/curated/characters.json`. */
  curated: Record<string, CharacterCurated>;
  /** Section `ee` de `data/curated/equipment.json` (clé = id de perso). */
  ee: Record<string, EquipmentCuratedEntry>;
  /** Ids des persos intégrés, et de ceux qui ont un EE. */
  roster: ReadonlySet<string>;
  eeOwners: ReadonlySet<string>;
}

export interface RankPlan {
  /** Entrées COMPLÈTES à passer à `upsertCharacterCurated`. */
  characters: Record<string, CharacterCurated>;
  /** Patchs COMPLETS à passer à `upsertEeCurated` (chips reprises du disque). */
  ee: Record<string, EeCuratedPatch>;
  applied: RankChange[];
  /** Cellules écartées, avec la raison dite à l'écran. */
  refused: { change: RankChange; reason: string }[];
}

/**
 * Ordre dans lequel une entrée curée range ses champs (celui du fichier). Un
 * champ AJOUTÉ prend sa place au lieu de tomber en queue d'entrée, après les
 * vidéos : le diff d'un rang PvP posé reste une ligne, là où on l'attend.
 */
const CURATED_ORDER = [
  'rank',
  'rankPvp',
  'role',
  'tags',
  'skillPriority',
  'rankByTranscend',
  'roleByTranscend',
  'prosCons',
  'videos',
  'synergies',
];

/** `entry` avec `key` posé (à sa place s'il est nouveau) ou retiré (`undefined`). */
function withField(
  entry: CharacterCurated,
  key: keyof CharacterCurated,
  value:
    | string
    | string[]
    | Record<string, string>
    | SkillPriority
    | ProsCons
    | SynergyGroup[]
    | undefined,
): CharacterCurated {
  const rest = Object.entries(entry).filter(([k]) => k !== key);
  if (value === undefined) return Object.fromEntries(rest) as CharacterCurated;
  if (key in entry) return { ...entry, [key]: value } as CharacterCurated;
  const rankOf = (k: string): number => {
    const i = CURATED_ORDER.indexOf(k);
    return i < 0 ? CURATED_ORDER.length : i;
  };
  const at = rest.findIndex(([k]) => rankOf(k) > rankOf(key));
  rest.splice(at < 0 ? rest.length : at, 0, [key, value]);
  return Object.fromEntries(rest) as CharacterCurated;
}

/** Valeur d'une cellule sur le disque (`''` = vide). */
function diskValue(disk: RankDisk, c: RankChange): string {
  if (isEe(c.field)) return disk.ee[c.id]?.[c.field === 'eeRank' ? 'rank' : 'rank10'] ?? '';
  const entry = disk.curated[c.id];
  if (isTable(c.field)) return entry?.[c.field]?.[c.step ?? ''] ?? '';
  return entry?.[c.field] ?? '';
}

/**
 * Applique un lot de cellules modifiées à l'état du disque — PURE : rien n'est
 * lu ni écrit ici, `saveRanks` s'en charge autour.
 *
 * Le contrat tient en trois règles :
 *   - l'entrée EXISTANTE est reprise, seuls les champs réglés par l'onglet
 *     bougent (`tags`, `skillPriority`, `videos`, `prosCons`, `synergies`, les
 *     chips des EE… repartent tels quels) ;
 *   - une cellule dont la valeur sur disque n'est plus `from` est REFUSÉE :
 *     quelqu'un l'a changée depuis le chargement de la page, et l'écraser ferait
 *     disparaître son réglage sans un mot. Si le disque porte déjà `to`, il n'y
 *     a rien à faire ni à refuser ;
 *   - les deux tables sont des ESCALIERS (cf. `atStep`) : un palier vidé retire
 *     sa clé, la dernière clé retirée retire le champ, et une clé héritée hors
 *     des paliers pleins n'est ni proposée ni touchée.
 */
export function planRankChanges(disk: RankDisk, changes: RankChange[]): RankPlan {
  const plan: RankPlan = { characters: {}, ee: {}, applied: [], refused: [] };

  for (const change of changes) {
    const refuse = (reason: string): void => void plan.refused.push({ change, reason });
    const { id, field, step, to } = change;

    if (!RANK_FIELDS.includes(field)) {
      refuse('colonne inconnue');
      continue;
    }
    if (!disk.roster.has(id)) {
      refuse('perso inconnu');
      continue;
    }
    if (to !== '' && !FIELD_VALUES[field].includes(to)) {
      refuse(`« ${to} » n'est pas une valeur de cette colonne`);
      continue;
    }
    if (isTable(field) && !STEP_KEYS.includes(step ?? '')) {
      refuse(`le palier « ${step ?? ''} » ne se cure pas`);
      continue;
    }
    if (isEe(field) && !disk.eeOwners.has(id)) {
      refuse("ce perso n'a pas d'EE");
      continue;
    }

    const current = diskValue(disk, change);
    if (current === to) continue;
    if (current !== change.from) {
      refuse(
        `la page avait « ${change.from || 'vide'} », le disque porte « ${current || 'vide'} »`,
      );
      continue;
    }

    if (isEe(field)) {
      const entry = disk.ee[id] ?? {};
      // Le store prend l'état COMPLET de ses quatre champs : un patch sans les
      // chips les effacerait. On repart donc de l'entrée du disque.
      const patch = (plan.ee[id] ??= {
        rank: entry.rank,
        rank10: entry.rank10,
        chipHide: entry.chipHide,
        chipAdd: entry.chipAdd,
      });
      patch[field === 'eeRank' ? 'rank' : 'rank10'] = to;
    } else {
      const entry = plan.characters[id] ?? disk.curated[id] ?? {};
      if (isTable(field)) {
        const table = { ...entry[field] };
        if (to) table[step!] = to;
        else delete table[step!];
        plan.characters[id] = withField(
          entry,
          field,
          Object.keys(table).length ? table : undefined,
        );
      } else {
        plan.characters[id] = withField(entry, field, to || undefined);
      }
    }
    plan.applied.push(change);
  }
  return plan;
}

export interface RankRow {
  id: string;
  /** Nom COMPLET en anglais, comme la cible des vidéos (cf. `videoTargets`). */
  name: string;
  element: string;
  class: string;
  rarity: number;
  hasEe: boolean;
  rank: string;
  rankPvp: string;
  role: string;
  eeRank: string;
  eeRank10: string;
  rankByTranscend: Record<string, string>;
  roleByTranscend: Record<string, string>;
}

/** Les paliers curables et leur libellé (« 5★ »), tels que les menus les montrent. */
const rankSteps = (): { key: string; label: string }[] =>
  STEP_KEYS.map((key) => ({ key, label: transcendenceLabel(CURATED_STEP_RARITY, Number(key)) }));

function rankDisk(): RankDisk {
  return {
    curated: loadCuratedCharacters(),
    ee: loadEquipmentEditorial().ee,
    roster: new Set(getCharacterListItems().map((c) => c.id)),
    eeOwners: new Set(getEEViews().map((e) => e.characterId)),
  };
}

/**
 * L'onglet « Rangs » : tout le roster avec ses réglages, lus du disque à
 * l'instant, et les listes que les menus proposent (celles de l'admin).
 */
export function rankState() {
  const disk = rankDisk();
  const rows: RankRow[] = getCharacterListItems().map((c) => {
    const cu = disk.curated[c.id] ?? {};
    const ee = disk.ee[c.id] ?? {};
    return {
      id: c.id,
      name: characterDisplayName(c),
      element: c.element,
      class: c.class,
      rarity: c.rarity,
      hasEe: disk.eeOwners.has(c.id),
      rank: cu.rank ?? '',
      rankPvp: cu.rankPvp ?? '',
      role: cu.role ?? '',
      eeRank: ee.rank ?? '',
      eeRank10: ee.rank10 ?? '',
      rankByTranscend: cu.rankByTranscend ?? {},
      roleByTranscend: cu.roleByTranscend ?? {},
    };
  });
  return {
    rows,
    tiers: TIERS,
    eeTiers: EE_TIERS,
    roles: CURATED_ROLES,
    steps: rankSteps(),
  };
}

/**
 * Enregistre un lot de cellules : relecture du disque, plan (`planRankChanges`),
 * écriture par les DEUX stores de l'admin, puis un seul commit sur les fichiers
 * réellement touchés.
 *
 * Une cellule refusée n'arrête pas le lot : les autres partent, et `refused`
 * dit à la page lesquelles marquer. Un lot où rien ne passe n'écrit ni ne
 * committe rien.
 */
export async function saveRanks(
  changes: RankChange[],
  report?: Report,
): Promise<Outcome & { refused: Pick<RankChange, 'id' | 'field' | 'step'>[] }> {
  if (!Array.isArray(changes) || !changes.length)
    return { ok: false, log: ['Aucune modification à enregistrer.'], refused: [] };

  const j = journal(report);
  const log = j.lines;
  const names = new Map(getCharacterListItems().map((c) => [c.id, characterDisplayName(c)]));
  const cell = (c: RankChange): string => {
    const step = isTable(c.field)
      ? ` à ${transcendenceLabel(CURATED_STEP_RARITY, Number(c.step))}`
      : '';
    return `${names.get(c.id) ?? c.id} · ${FIELD_LABELS[c.field] ?? c.field}${step}`;
  };

  const plan = planRankChanges(rankDisk(), changes);
  const refused = plan.refused.map(({ change }) => change);
  for (const r of plan.refused) j.done(`REFUSÉ — ${cell(r.change)} : ${r.reason}.`);

  const touched = new Set<string>();
  const failed = new Set<string>();
  for (const [id, entry] of Object.entries(plan.characters)) {
    const errors = await upsertCharacterCurated(id, entry);
    if (errors.length) {
      failed.add(id);
      for (const e of errors) j.done(`REFUSÉ — ${names.get(id) ?? id} : ${e}`);
    } else touched.add('data/curated/characters.json');
  }
  for (const [id, patch] of Object.entries(plan.ee)) {
    const errors = await upsertEeCurated(id, patch);
    if (errors.length) {
      // L'EE et le perso sont deux fichiers : seul le côté fautif est écarté.
      failed.add(`ee:${id}`);
      for (const e of errors) j.done(`REFUSÉ — EE de ${names.get(id) ?? id} : ${e}`);
    } else touched.add('data/curated/equipment.json');
  }

  const lost = (c: RankChange): boolean => failed.has(isEe(c.field) ? `ee:${c.id}` : c.id);
  const written = plan.applied.filter((c) => !lost(c));
  refused.push(...plan.applied.filter(lost));
  for (const c of written) j.done(`${cell(c)} : ${c.from || 'vide'} → ${c.to || 'vide'}`);

  const keys = refused.map(({ id, field, step }) => ({ id, field, step }));
  if (!touched.size)
    return refused.length
      ? { ok: false, log: [...log, 'Rien à enregistrer.'], refused: keys }
      : { ok: true, log: ['Rien à enregistrer : le disque porte déjà ces valeurs.'], refused: [] };

  const who = [...new Set(written.map((c) => names.get(c.id) ?? c.id))];
  const commit = commitPaths(
    [...touched],
    `chore(tierlist): rangs et rôles — ${who.slice(0, 3).join(', ')}${who.length > 3 ? ` et ${who.length - 3} autres` : ''}`,
    report,
  );
  return { ok: commit.ok && !refused.length, log: [...log, ...commit.log], refused: keys };
}

// ------------------------------------------------------------ fiche perso ----

/**
 * Le curé des persos, celui des EE quand un rang ou des chips d'EE partent avec
 * la fiche (sous-onglet EE), et celui des chips de skills (sous-onglet Skills).
 */
const CHARACTERS_PATH = 'data/curated/characters.json';
const EQUIPMENT_PATH = 'data/curated/equipment.json';
const CHARACTER_SKILLS_PATH = 'data/curated/character-skills.json';

/** Un perso du roster, pour l'en-tête de la fiche et le picker de héros. */
export interface SheetRosterRow {
  id: string;
  /** Nom COMPLET en anglais, comme dans Rangs et Gear reco. */
  name: string;
  element: string;
  class: string;
  subClass: string;
  rarity: number;
}

type RosterItem = ReturnType<typeof getCharacterListItems>[number];

const sheetRosterRow = (c: RosterItem): SheetRosterRow => ({
  id: c.id,
  name: characterDisplayName(c),
  element: c.element,
  class: c.class,
  subClass: c.subClass ?? '',
  rarity: c.rarity,
});

/**
 * Le roster de la « Fiche perso », par nom : ce que le picker de héros montre.
 * Servi à part de l'état d'un perso — lu une fois, pas à chaque perso ouvert.
 */
export function characterRoster(): { roster: SheetRosterRow[] } {
  return {
    roster: getCharacterListItems()
      .map(sheetRosterRow)
      .sort((a, b) => a.name.localeCompare(b.name)),
  };
}

/** Les deux sections du curé des chips de skills : cardId → refs. */
export type KitSections = Record<'chipHide' | 'chipAdd', Record<string, string[]>>;

/** Un passif d'EE, en lecture : son palier (1 = au déblocage, 10 = à +10), son nom, ses textes. */
export interface SheetEePassive {
  level: number;
  name: string;
  texts: string[];
}

/**
 * L'EE d'un perso tel que le JEU le donne, sans sa curation : de quoi dessiner
 * sa tuile (`icon` sous `images/equipment`), le second porteur — le pendant
 * core-fusion `27…` d'un `20…`, que le site montre sur la fiche de l'EE —, ses
 * chips AUTO (`eeEditorChips`, celles que la curation peut masquer) et ses
 * passifs.
 */
export interface SheetEeItem {
  itemId: string;
  /** Nom en anglais. */
  name: string;
  icon: string;
  star: number;
  grade: string;
  companion?: { id: string; name: string };
  chips: EeChipMeta[];
  passives: SheetEePassive[];
}

/**
 * La lecture de la fiche : le disque de Rangs (curé des persos, EE, roster) ;
 * pour le sous-onglet Skills, les cartes de skills du perso (lève s'il n'a pas
 * de kit lisible), le curé des chips et le catalogue des effets ; pour le
 * sous-onglet EE, l'EE du perso (`null` : il n'en a pas) et le catalogue de
 * son « ＋ effet » — celui de Skills, chaque effet avec sa description.
 */
export interface CharacterSheetDisk {
  disk: () => RankDisk;
  kitCards: (id: string) => Promise<KitEditorCard[]>;
  kitSections: () => KitSections;
  kitCatalog: () => Record<string, EffectOption>;
  eeItem: (id: string) => SheetEeItem | null;
  eeCatalog: () => Record<string, EffectOption>;
}

/** La lecture et les écritures de `saveCharacterSheet`, injectées : les stores et git. */
export interface CharacterSheetDeps extends CharacterSheetDisk {
  upsertCharacter: (id: string, curated: CharacterCurated) => Promise<string[]>;
  upsertEe: (id: string, patch: EeCuratedPatch) => Promise<string[]>;
  applyKit: (patch: CharacterKitPatch) => Promise<string[]>;
  commitPaths: (paths: string[], message: string, report?: Report) => Outcome;
}

/**
 * L'EE d'un perso, assemblé comme la fiche de l'éditeur de l'admin
 * (`/admin/editor/ee/[id]`) : la vue, les chips AUTO, les passifs résolus et le
 * second porteur du modèle de page.
 */
function sheetEeItem(id: string): SheetEeItem | null {
  const view = getEEViews().find((v) => v.characterId === id);
  if (!view) return null;
  const model = eeModelForView(view, DEFAULT_LANG);
  const companion = model.ownerCompanion;
  return {
    itemId: view.itemId,
    name: model.name,
    icon: gearById(view.itemId)?.icon ?? '',
    star: view.star,
    grade: view.grade,
    ...(companion ? { companion: { id: companion.id, name: companion.name } } : {}),
    chips: eeEditorChips(id, DEFAULT_LANG),
    passives: model.passives.map((p) => ({ level: p.unlockLevel, name: p.name, texts: p.texts })),
  };
}

/** Le catalogue de Skills (`kitEffectCatalog`), chaque effet avec sa description : l'aide-mémoire de l'EE. */
function eeEffectCatalog(): Record<string, EffectOption> {
  const effects = getMergedEffects();
  const descs = new Map(effects.map((e) => [e.id, e.desc.en]));
  return Object.fromEntries(
    Object.entries(kitEffectCatalog(effects)).map(([id, o]) => [
      id,
      descs.get(id) ? { ...o, desc: descs.get(id) } : o,
    ]),
  );
}

/**
 * Celles des routes : le disque de Rangs, les stores de l'admin, le vrai
 * `commitPaths`. Les cartes de skills sont celles de l'éditeur de l'admin
 * (`characterKitCards` sur le bundle de l'extraction), aux icônes du site.
 */
export const CHARACTER_SHEET_DEPS: CharacterSheetDeps = {
  disk: rankDisk,
  kitCards: async (id) => {
    // À la demande : l'extraction pèse, et les autres routes ne la lisent pas.
    const { extractedBundle } = await import('@/lib/admin/review-store');
    const bundle = extractedBundle(id);
    if (!bundle) throw new Error('perso absent de l’extraction du jeu');
    return characterKitCards(bundle, img.skill);
  },
  kitSections: loadCharacterKitSections,
  kitCatalog: () => kitEffectCatalog(),
  eeItem: sheetEeItem,
  eeCatalog: eeEffectCatalog,
  upsertCharacter: upsertCharacterCurated,
  upsertEe: upsertEeCurated,
  applyKit: applyCharacterKitCuration,
  commitPaths,
};

/**
 * Le kit d'un perso, pour le sous-onglet Skills : ses cartes de skills et leurs
 * chips AUTO, ce que le disque masque (`chipHide`) et ajoute (`chipAdd`) sur
 * ces cartes, le catalogue des effets que « ＋ effet » propose et le dossier de
 * leurs icônes. `error` : les cartes sont illisibles (pas de tables du jeu sur
 * ce poste) — le reste de la fiche se lit quand même.
 */
export interface SheetKit extends KitSections {
  cards: KitEditorCard[];
  catalog: Record<string, EffectOption>;
  sprite: string;
  error?: string;
}

async function sheetKit(id: string, disk: CharacterSheetDisk): Promise<SheetKit> {
  let cards: KitEditorCard[] = [];
  let error = '';
  try {
    cards = await disk.kitCards(id);
  } catch (e: unknown) {
    error = e instanceof Error ? e.message : String(e);
  }
  const sections = disk.kitSections();
  return {
    cards,
    chipHide: pickKitCards(sections.chipHide, cards),
    chipAdd: pickKitCards(sections.chipAdd, cards),
    catalog: disk.kitCatalog(),
    sprite: EFFECT_SPRITE,
    ...(error ? { error } : {}),
  };
}

/** Les quatre champs curés d'un EE, tels que le disque les porte — vides compris. */
export interface EeCuratedState {
  rank: string;
  rank10: string;
  chipHide: string[];
  chipAdd: string[];
}

const eeCuratedState = (entry: EquipmentCuratedEntry | undefined): EeCuratedState => ({
  rank: entry?.rank ?? '',
  rank10: entry?.rank10 ?? '',
  chipHide: entry?.chipHide ?? [],
  chipAdd: entry?.chipAdd ?? [],
});

/**
 * L'EE d'un perso, pour le sous-onglet EE : l'item du jeu (`SheetEeItem`), ce
 * que le disque en cure — ses deux rangs, les chips masquées et ajoutées — et
 * le catalogue des effets que « ＋ effet » propose, descriptions comprises.
 */
export interface SheetEe extends SheetEeItem, EeCuratedState {
  catalog: Record<string, EffectOption>;
}

/**
 * La « Fiche perso » d'un perso : sa ligne du roster (avec sa chaîne et ses tags
 * DÉRIVÉS du jeu, en lecture), son entrée curée du disque ENTIÈRE (les
 * sous-onglets Pros / Cons et Synergies y lisent `prosCons` et `synergies`),
 * ses rangs tels que Rangs les sert — et l'échelle, les rôles, les paliers des
 * menus —, les tags humains que la fiche coche, ses vidéos en lecture. Pour les
 * textes à tags inline : `refs`, ce que ces tags peuvent viser (les listes de
 * l'éditeur assisté de l'admin, `buildInlineRefs`), et `langs`, les langues du
 * site dans l'ordre où l'onglet les range — l'anglais se saisit, les autres se
 * génèrent par « Traduire ». Pour le sous-onglet Skills : `kit` (`SheetKit`).
 * Pour le sous-onglet EE : `ee` (`SheetEe`, `null` si le perso n'a pas d'EE) et
 * `eeTiers`, l'échelle de ses deux rangs. Lu du disque à chaque appel. `error` :
 * le perso n'est pas du roster.
 */
export async function characterSheetState(
  id: string,
  disk: CharacterSheetDisk = CHARACTER_SHEET_DEPS,
) {
  const c = getCharacterListItems().find((x) => x.id === id);
  if (!c) return { error: `perso inconnu : ${id}` };
  const read = disk.disk();
  const curated = read.curated[id] ?? {};
  const item = disk.eeItem(id);
  const ee: SheetEe | null = item
    ? { ...item, ...eeCuratedState(read.ee[id]), catalog: disk.eeCatalog() }
    : null;
  return {
    char: { ...sheetRosterRow(c), chain: c.chainType ?? '', tags: c.tags ?? [] },
    curated,
    ranks: {
      rank: curated.rank ?? '',
      rankPvp: curated.rankPvp ?? '',
      role: curated.role ?? '',
      rankByTranscend: curated.rankByTranscend ?? {},
      roleByTranscend: curated.roleByTranscend ?? {},
    },
    tiers: TIERS,
    eeTiers: EE_TIERS,
    roles: CURATED_ROLES,
    steps: rankSteps(),
    humanTags: HUMAN_TAGS,
    videos: curated.videos ?? [],
    refs: buildInlineRefs(),
    langs: {
      default: DEFAULT_LANG,
      shown: [...NOTE_LANGS, ...LANGS.filter((l) => !NOTE_LANGS.includes(l))],
    },
    kit: await sheetKit(id, disk),
    ee,
  };
}

/**
 * L'aperçu des textes à tags inline de la fiche (pros, cons, raisons de
 * synergie) : chaque texte en segments, tels que le site les rend dans `lang`
 * — `renderInlineBatch`, l'aperçu de l'éditeur de l'admin, appelé tel quel (pas
 * de garde `IS_DEV` : il ne fait que lire). Un tag que le site ne résout pas
 * sort en segment `unknown`. `segments` est aligné sur `texts`. Rien ne
 * s'écrit ; tout refus est RENDU, jamais levé.
 */
export async function previewInline(
  texts: unknown,
  lang: unknown,
  render: (texts: string[], lang: string) => Promise<InlineSegment[][]> = renderInlineBatch,
): Promise<{ segments: InlineSegment[][] } | { error: string }> {
  if (!Array.isArray(texts) || texts.some((t) => typeof t !== 'string'))
    return { error: 'texts : une liste de textes attendue' };
  try {
    return {
      segments: await render(texts as string[], typeof lang === 'string' ? lang : DEFAULT_LANG),
    };
  } catch (e: unknown) {
    return { error: e instanceof Error ? e.message : String(e) };
  }
}

/** Les champs du curé que la fiche écrit hors des rangs, dans l'ordre du fichier. */
const SHEET_KEYS = ['tags', 'skillPriority', 'prosCons', 'synergies'] as const;
type SheetKey = (typeof SHEET_KEYS)[number];

const SHEET_LABELS: Record<SheetKey, string> = {
  tags: 'tags',
  skillPriority: 'priorité de skills',
  prosCons: 'pros / cons',
  synergies: 'synergies',
};

/** Les listes de textes de la fiche : où un refus se situe, à la ligne près. */
export type SheetList = 'pros' | 'cons' | 'synergies';

const PRIORITY_KEYS = ['first', 'second', 'ultimate'] as const;

/**
 * Ce que la fiche envoie. `ranks` : des cellules, comme Rangs les envoie (rang
 * PvE, rang PvP, rôle, paliers). `curated` : les champs hors rangs, chacun
 * ENTIER et seulement s'il a bougé — une priorité vide n'y est pas, une liste
 * de tags est celle des tags humains cochés, `prosCons` porte les deux listes
 * et `synergies` tous les groupes. `was` : l'entrée que la page avait chargée.
 * `kit` : les chips de skills, par carte modifiée — la liste ENTIÈRE de ses refs
 * masquées, celle de ses effets ajoutés (vide = plus rien sur cette carte).
 * `ee` : les chips de l'EE, ses deux listes ENTIÈRES, et l'entrée curée de l'EE
 * que la page avait chargée (`was`) — ses RANGS, eux, sont des cellules de
 * `ranks` (`eeRank`, `eeRank10`).
 */
export interface CharacterSheetChanges {
  ranks?: RankChange[];
  curated?: {
    skillPriority?: SkillPriority;
    tags?: string[];
    prosCons?: ProsCons;
    synergies?: SynergyGroup[];
  };
  was?: CharacterCurated;
  kit?: CharacterKitPatch;
  ee?: { chipHide: string[]; chipAdd: string[]; was: EeCuratedState };
}

/**
 * Un refus situé : la cellule de rang (`field`, `step`), le champ de la fiche,
 * la ligne d'une de ses listes (`list`, `index` — le rang dans la liste
 * ENVOYÉE, à partir de zéro), la carte de skill d'un refus de chips
 * (`field: 'kit'`, `card`), ou les chips de l'EE (`field: 'ee'`).
 */
export interface SheetRefusal {
  field: RankField | SheetKey | 'kit' | 'ee';
  step?: string;
  list?: SheetList;
  index?: number;
  card?: string;
  reason: string;
}

/**
 * Ce que rend `saveCharacterSheet`. `written` : un store a écrit, la page relit
 * le disque. `stale` : refusé parce que le DISQUE avait changé sous un champ de
 * la fiche, ou sous l'entrée curée de l'EE — rien n'a été écrit, et la page
 * rend le disque au lieu de garder une saisie qui déferait l'écriture d'un autre.
 */
export interface CharacterSheetOutcome extends Outcome {
  written: boolean;
  stale: boolean;
  refused: SheetRefusal[];
}

const sameJson = (a: unknown, b: unknown): boolean =>
  JSON.stringify(a ?? null) === JSON.stringify(b ?? null);

/** Une priorité de skills venue de la page : des entiers, les vides absents. */
function cleanSkillPriority(raw: unknown): SkillPriority | string {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return 'forme inattendue';
  const out: SkillPriority = {};
  for (const key of PRIORITY_KEYS) {
    const v = (raw as Record<string, unknown>)[key];
    if (v === undefined || v === null || v === '') continue;
    if (typeof v !== 'number' || !Number.isInteger(v) || v < 0)
      return `« ${String(v)} » n'est pas un entier`;
    out[key] = v;
  }
  return out;
}

/**
 * Les tags du curé d'après les cases de la fiche : les tags humains cochés,
 * dans l'ordre de `HUMAN_TAGS`. Un tag du disque qui n'en est pas un (hérité)
 * reste, la fiche ne le montre pas.
 */
function cleanSheetTags(raw: unknown, disk: readonly string[]): string[] | string {
  if (!Array.isArray(raw) || raw.some((t) => typeof t !== 'string')) return 'forme inattendue';
  const stray = (raw as string[]).find((t) => !HUMAN_TAGS.includes(t));
  if (stray !== undefined) return `« ${stray} » n'est pas un tag humain`;
  return [
    ...disk.filter((t) => !HUMAN_TAGS.includes(t)),
    ...HUMAN_TAGS.filter((t) => (raw as string[]).includes(t)),
  ];
}

/** Ce qui cloche dans une ligne d'une liste de la fiche. */
interface ListIssue {
  list: SheetList;
  index: number;
  reason: string;
}

/**
 * Un texte localisé venu de la page : les langues du site, dans l'ordre reçu
 * (celui du fichier pour un texte qui en vient). Une langue vide n'est pas
 * écrite — le rendu se replie sur l'anglais.
 */
function cleanSheetText(raw: unknown): LocalizedText | string {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return 'forme inattendue';
  const out: LocalizedText = {};
  for (const [lang, text] of Object.entries(raw)) {
    if (!isValidLang(lang)) return `langue inconnue « ${lang} »`;
    if (typeof text !== 'string') return `${lang} : une chaîne attendue`;
    if (text.trim()) out[lang] = text;
  }
  return out;
}

/**
 * Ce qui cloche dans un texte à tags inline — les trois contrôles des notes de
 * Gear reco (`checkGearBuilds`), parce que l'enregistrement committe sur `main` :
 * l'anglais, langue de repli, est là ; chaque tag de chaque langue se résout
 * (`checkText`, la résolution du rendu) ; un texte écrit dans toutes les
 * langues du site porte partout les mêmes balises (`inline-tag-parity.test.ts`
 * ferait échouer la suite sur le fichier committé).
 */
function localizedIssues(text: LocalizedText): string[] {
  const note: Partial<Record<string, string>> = text;
  const out: string[] = [];
  if (!note[DEFAULT_LANG]?.trim()) out.push(`pas de texte « ${DEFAULT_LANG} », la langue de repli`);
  for (const [lang, value] of Object.entries(note))
    for (const c of checkText(value ?? ''))
      if (!c.ok)
        out.push(
          `${lang === DEFAULT_LANG ? '' : `${lang} : `}tag inconnu ${c.tag} (${c.reason ?? 'sans correspondance'})`,
        );
  if (LANGS.every((l) => typeof note[l] === 'string')) {
    const ref = tagsOf(note[DEFAULT_LANG] ?? '').join(' ');
    for (const lang of LANGS) {
      const own = tagsOf(note[lang] ?? '').join(' ');
      if (own !== ref)
        out.push(
          `${lang} : balises « ${own || 'aucune'} », « ${DEFAULT_LANG} » porte « ${ref || 'aucune'} »`,
        );
    }
  }
  return out;
}

/** Les deux listes d'un `prosCons`, absentes comprises : ce qui se compare. */
const prosConsSides = (pc: ProsCons | undefined): Required<ProsCons> => ({
  pros: pc?.pros ?? [],
  cons: pc?.cons ?? [],
});

/**
 * Les pros et les cons venus de la page, contrôlés ligne à ligne. Une ligne
 * sans aucun texte n'est pas écrite (elle ne compte pas non plus comme un
 * écart) ; `index` reste celui de la liste envoyée.
 */
function cleanProsCons(raw: unknown): { value: Required<ProsCons>; issues: ListIssue[] } | string {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return 'forme inattendue';
  const value: Required<ProsCons> = { pros: [], cons: [] };
  const issues: ListIssue[] = [];
  for (const list of ['pros', 'cons'] as const) {
    const sent = (raw as Record<string, unknown>)[list] ?? [];
    if (!Array.isArray(sent)) return `${list} : une liste attendue`;
    sent.forEach((item: unknown, index) => {
      const text = cleanSheetText(item);
      if (typeof text === 'string') return void issues.push({ list, index, reason: text });
      if (!Object.keys(text).length) return;
      const bad = localizedIssues(text);
      if (bad.length) issues.push({ list, index, reason: bad.join(' ; ') });
      else value[list].push(text);
    });
  }
  return { value, issues };
}

/**
 * Les groupes de synergie venus de la page : des héros du roster — un groupe
 * sans héros est un écart, l'admin le retirait sans rien dire —, et une raison
 * contrôlée comme un pro. Une raison sans aucun texte n'est pas écrite.
 */
function cleanSynergies(
  raw: unknown,
  roster: ReadonlySet<string>,
): { value: SynergyGroup[]; issues: ListIssue[] } | string {
  if (!Array.isArray(raw)) return 'forme inattendue';
  const value: SynergyGroup[] = [];
  const issues: ListIssue[] = [];
  raw.forEach((item: unknown, index) => {
    const bad = (reason: string): void => void issues.push({ list: 'synergies', index, reason });
    if (!item || typeof item !== 'object' || Array.isArray(item)) return bad('forme inattendue');
    const { heroes, reason } = item as { heroes?: unknown; reason?: unknown };
    if (!Array.isArray(heroes) || heroes.some((h) => typeof h !== 'string'))
      return bad('héros : une liste d’ids attendue');
    if (!heroes.length) return bad('groupe sans héros');
    const stray = (heroes as string[]).filter((h) => !roster.has(h));
    if (stray.length) return bad(`hors du roster : ${stray.map((h) => `« ${h} »`).join(', ')}`);
    const text = reason === undefined ? {} : cleanSheetText(reason);
    if (typeof text === 'string') return bad(`raison : ${text}`);
    const written = Object.keys(text).length > 0;
    const wrong = written ? localizedIssues(text) : [];
    if (wrong.length) return bad(wrong.join(' ; '));
    value.push({ heroes: heroes as string[], ...(written ? { reason: text } : {}) });
  });
  return { value, issues };
}

/** Ce qui cloche dans les chips envoyées : sur une carte, ou dans la forme entière. */
interface KitIssue {
  card?: string;
  reason: string;
}

const KIT_SECTIONS = ['chipHide', 'chipAdd'] as const;

/**
 * Les chips de skills venues de la page, contrôlées contre les cartes du perso
 * (celles que le SERVEUR calcule), le disque et le catalogue des effets. Une
 * liste que le disque porte déjà n'est pas un changement. Ne s'ajoute à ce que
 * le disque porte qu'une ref que la carte connaît : masquer vise une de ses
 * chips, ajouter un effet du catalogue — une ref héritée du fichier, elle,
 * reste. Une carte en écart n'est pas écrite du tout. `patch` : les seules
 * listes qui bougent, entières ; `said` : une ligne de journal par carte.
 */
function planKit(
  raw: unknown,
  cards: readonly KitEditorCard[],
  disk: KitSections,
  catalog: Record<string, EffectOption>,
): { patch: KitSections; said: string[]; issues: KitIssue[] } | string {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return 'forme inattendue';
  const patch: KitSections = { chipHide: {}, chipAdd: {} };
  const issues: KitIssue[] = [];
  for (const section of KIT_SECTIONS) {
    const sent = (raw as Record<string, unknown>)[section] ?? {};
    if (typeof sent !== 'object' || Array.isArray(sent)) return `${section} : forme inattendue`;
    for (const [cid, list] of Object.entries(sent as Record<string, unknown>)) {
      const card = cards.find((c) => c.id === cid);
      if (!card) {
        issues.push({ card: cid, reason: 'pas une carte de ce perso' });
        continue;
      }
      if (!Array.isArray(list) || list.some((v) => typeof v !== 'string')) {
        issues.push({ card: cid, reason: `${section} : une liste de refs attendue` });
        continue;
      }
      const clean = [...new Set((list as string[]).map((v) => v.trim()).filter(Boolean))];
      const before = disk[section][cid] ?? [];
      if (sameJson(clean, before)) continue;
      const known = (ref: string): boolean =>
        section === 'chipHide' ? card.chips.some((c) => c.ref === ref) : ref in catalog;
      const stray = clean.filter((ref) => !before.includes(ref) && !known(ref));
      if (stray.length)
        issues.push({
          card: cid,
          reason: `${stray.map((ref) => `« ${ref} »`).join(', ')} : ${
            section === 'chipHide' ? 'pas une chip de cette carte' : 'effet inconnu du glossaire'
          }`,
        });
      else patch[section][cid] = clean;
    }
  }
  for (const { card } of issues)
    if (card) for (const section of KIT_SECTIONS) delete patch[section][card];

  const said = cards
    .filter((c) => KIT_SECTIONS.some((section) => c.id in patch[section]))
    .map((c) => {
      const n = (section: 'chipHide' | 'chipAdd'): number =>
        (patch[section][c.id] ?? disk[section][c.id] ?? []).length;
      const [hidden, added] = [n('chipHide'), n('chipAdd')];
      return `chips de « ${c.name || c.id} » : ${hidden} masquée${hidden > 1 ? 's' : ''}, ${added} ajoutée${added > 1 ? 's' : ''}`;
    });
  return { patch, said, issues };
}

/**
 * Les chips de l'EE venues de la page, contrôlées comme celles d'une carte de
 * skill (`planKit`) contre les chips AUTO de l'EE (celles que le SERVEUR
 * calcule), le disque et le catalogue des effets : masquer vise une de ses
 * chips, ajouter un effet du catalogue — une ref héritée du fichier qui n'en
 * est plus une reste, sans refus. Les listes sont nettoyées et dédoublonnées.
 * Rendu : les deux listes telles qu'elles s'écriraient et `moved` (le disque
 * ne les porte pas déjà), ou la raison du refus — rien n'est alors écrit des
 * chips.
 */
function planEe(
  raw: unknown,
  item: SheetEeItem,
  disk: EeCuratedState,
  catalog: Record<string, EffectOption>,
): { chipHide: string[]; chipAdd: string[]; moved: boolean } | string {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return 'forme inattendue';
  const lists = { chipHide: [] as string[], chipAdd: [] as string[] };
  const issues: string[] = [];
  for (const section of KIT_SECTIONS) {
    const list = (raw as Record<string, unknown>)[section] ?? [];
    if (!Array.isArray(list) || list.some((v) => typeof v !== 'string'))
      return `${section} : une liste de refs attendue`;
    const clean = [...new Set((list as string[]).map((v) => v.trim()).filter(Boolean))];
    const known = (ref: string): boolean =>
      section === 'chipHide' ? item.chips.some((c) => c.ref === ref) : ref in catalog;
    const stray = clean.filter((ref) => !disk[section].includes(ref) && !known(ref));
    if (stray.length)
      issues.push(
        `${stray.map((ref) => `« ${ref} »`).join(', ')} : ${
          section === 'chipHide' ? 'pas une chip de cet EE' : 'effet inconnu du glossaire'
        }`,
      );
    lists[section] = clean;
  }
  if (issues.length) return issues.join(' ; ');
  return { ...lists, moved: KIT_SECTIONS.some((s) => !sameJson(lists[s], disk[s])) };
}

/**
 * Enregistre la « Fiche perso » d'UN perso, en un geste et un commit.
 *
 * Dans l'ordre :
 *   - les champs hors rangs (`changes.curated`) exigent que le disque porte
 *     encore, pour eux, l'entrée que la page avait chargée (`was`) : sinon tout
 *     est refusé `stale`, SANS écriture — les rangs non plus. De même les chips
 *     de l'EE (`changes.ee`) : l'entrée curée de l'EE doit être celle que la
 *     page avait chargée (`ee.was`, rangs compris — l'onglet Rangs ou l'admin a
 *     pu écrire entre-temps) ;
 *   - les rangs (`changes.ranks`) passent par le modèle de Rangs
 *     (`planRankChanges` sur le disque relu) : une cellule que le disque ne
 *     porte plus comme la page l'avait est refusée, située, et n'empêche pas le
 *     reste ; l'écriture est celle de Rangs (`upsertCharacterCurated`) ;
 *   - l'EE s'écrit par UN SEUL `upsertEeCurated`, qui prend l'état COMPLET de
 *     ses quatre champs : le rang venu des cellules (`plan.ee`) ET les chips
 *     de `changes.ee`, contrôlées par `planEe`, FUSIONNÉS sur l'entrée du
 *     disque — deux écritures bâties chacune sur le disque d'avant
 *     s'écraseraient. Un écart de chips est un refus situé (`field: 'ee'`), le
 *     rang part quand même ;
 *   - puis les champs hors rangs, posés SUR l'entrée que les rangs viennent
 *     d'écrire — le store remplace l'entrée entière —, par
 *     `upsertCharacterCurated` : ses refus de schéma sont rendus tels quels.
 *     Les pros, les cons et les raisons de synergie sont CONTRÔLÉS avant
 *     (`localizedIssues` : tags inline, langue de repli, parité), les héros
 *     d'une synergie aussi : un écart est un refus situé à la ligne
 *     (`list`, `index`), et la liste entière n'est pas écrite ;
 *   - puis les chips de skills (`changes.kit`), contrôlées par `planKit` contre
 *     les cartes que le serveur calcule pour CE perso, et écrites par
 *     `applyCharacterKitCuration` dans `character-skills.json` — seulement si
 *     une liste bouge ; un écart, ou un refus du store, est situé à sa carte
 *     (`card`) ;
 *   - puis UN commit des fichiers réellement touchés, au nom du perso.
 *
 * Les deux écritures passent par le verrou du store (`withStoreLock`), celui de
 * Rangs. Un champ refusé n'arrête pas les autres. Rien d'écrit : rien de committé.
 */
export async function saveCharacterSheet(
  id: string,
  changes: CharacterSheetChanges | undefined,
  deps: CharacterSheetDeps,
  report?: Report,
): Promise<CharacterSheetOutcome> {
  const refused: SheetRefusal[] = [];
  const out = (
    ok: boolean,
    lines: string[],
    more: { written?: boolean; stale?: boolean } = {},
  ) => ({
    ok,
    log: lines,
    written: more.written ?? false,
    stale: more.stale ?? false,
    refused,
  });

  const c = getCharacterListItems().find((x) => x.id === id);
  if (!c) return out(false, [`perso inconnu : ${id}.`]);
  const name = characterDisplayName(c);

  const ranks = Array.isArray(changes?.ranks) ? changes.ranks : [];
  const sent = (
    changes?.curated && typeof changes.curated === 'object' ? changes.curated : {}
  ) as Record<string, unknown>;
  const keys = SHEET_KEYS.filter((k) => k in sent);
  const hasKit = changes?.kit !== undefined;
  const hasEe = changes?.ee !== undefined;
  if (!ranks.length && !keys.length && !hasKit && !hasEe)
    return out(false, ['Aucune modification à enregistrer.']);

  const j = journal(report);
  const refuse = (r: SheetRefusal, said: string): void => {
    refused.push(r);
    j.done(`REFUSÉ — ${said} : ${r.reason}.`);
  };

  // Le disque, relu : une valeur posée d'ailleurs (Rangs, l'admin, l'autre
  // poste) depuis le chargement de la fiche ne doit pas être écrasée.
  const disk = deps.disk();
  const entry = disk.curated[id] ?? {};
  const moved = keys.filter((k) => !sameJson(entry[k], changes?.was?.[k]));
  for (const k of moved)
    refuse(
      { field: k, reason: 'le disque a changé depuis le chargement' },
      `${name} · ${SHEET_LABELS[k]}`,
    );
  // L'entrée curée de l'EE de même : le store prend ses quatre champs d'un
  // coup, des chips posées sur une entrée périmée déferaient l'écriture d'un autre.
  const eeDisk = eeCuratedState(disk.ee[id]);
  const eeMoved = hasEe && !sameJson(changes?.ee?.was, eeDisk);
  if (eeMoved)
    refuse({ field: 'ee', reason: 'le disque a changé depuis le chargement' }, `EE de ${name}`);
  if (moved.length || eeMoved)
    return out(false, [...j.lines, 'Rien à enregistrer.'], { stale: true });

  // 1. Les rangs, par le plan de Rangs. Une cellule d'un autre perso n'est pas de la fiche.
  const rankLabel = (r: Pick<RankChange, 'field' | 'step'>): string =>
    `${FIELD_LABELS[r.field] ?? r.field}${
      isTable(r.field) ? ` à ${transcendenceLabel(CURATED_STEP_RARITY, Number(r.step))}` : ''
    }`;
  const own = ranks.filter((r) => r?.id === id);
  for (const r of ranks)
    if (r?.id !== id)
      refuse(
        { field: r?.field, step: r?.step, reason: 'cette cellule n’est pas de ce perso' },
        `${String(r?.id ?? '')} · ${String(r?.field ?? '')}`,
      );
  const plan = planRankChanges(disk, own);
  for (const { change, reason } of plan.refused)
    refuse({ field: change.field, step: change.step, reason }, `${name} · ${rankLabel(change)}`);

  const touched = new Set<string>();
  // L'entrée sur laquelle se posent les champs hors rangs : celle que les rangs
  // viennent d'écrire, sinon celle du disque.
  let current = entry;
  const failed = new Set<'character' | 'ee'>();
  if (plan.characters[id]) {
    j.doing('écriture des rangs');
    const errors = await deps.upsertCharacter(id, plan.characters[id]);
    if (errors.length) failed.add('character');
    else {
      current = plan.characters[id];
      touched.add(CHARACTERS_PATH);
    }
    for (const e of errors) j.done(`REFUSÉ — ${name} : ${e}`);
  }
  // L'EE : le rang des cellules et les chips de `changes.ee`, en UNE écriture.
  let eeChips: Exclude<ReturnType<typeof planEe>, string> | null = null;
  if (hasEe) {
    const item = deps.eeItem(id);
    const checked = item
      ? planEe(changes?.ee, item, eeDisk, deps.eeCatalog())
      : "ce perso n'a pas d'EE";
    if (typeof checked === 'string')
      refuse({ field: 'ee', reason: checked }, `${name} · chips de l'EE`);
    else if (checked.moved) eeChips = checked;
  }
  const eePatch: EeCuratedPatch | undefined =
    plan.ee[id] ?? (eeChips ? { rank: eeDisk.rank, rank10: eeDisk.rank10 } : undefined);
  if (eePatch) {
    if (eeChips) Object.assign(eePatch, { chipHide: eeChips.chipHide, chipAdd: eeChips.chipAdd });
    j.doing('écriture de l’EE');
    const errors = await deps.upsertEe(id, eePatch);
    if (errors.length) failed.add('ee');
    else touched.add(EQUIPMENT_PATH);
    for (const e of errors) j.done(`REFUSÉ — EE de ${name} : ${e}`);
    if (errors.length && eeChips) refused.push({ field: 'ee', reason: errors[0] });
  }
  for (const r of plan.applied) {
    if (failed.has(isEe(r.field) ? 'ee' : 'character'))
      refused.push({ field: r.field, step: r.step, reason: 'refusé par le store' });
    else j.done(`${rankLabel(r)} : ${r.from || 'vide'} → ${r.to || 'vide'}`);
  }
  if (eeChips && !failed.has('ee')) {
    const [hidden, added] = [eeChips.chipHide.length, eeChips.chipAdd.length];
    j.done(
      `chips de l'EE : ${hidden} masquée${hidden > 1 ? 's' : ''}, ${added} ajoutée${added > 1 ? 's' : ''}`,
    );
  }

  // 2. Les champs hors rangs, sur l'entrée d'après les rangs.
  let next = current;
  const said: string[] = [];
  if (keys.includes('skillPriority')) {
    const sp = cleanSkillPriority(sent.skillPriority);
    if (typeof sp === 'string')
      refuse({ field: 'skillPriority', reason: sp }, `${name} · ${SHEET_LABELS.skillPriority}`);
    else if (!sameJson(sp, current.skillPriority ?? {})) {
      next = withField(next, 'skillPriority', Object.keys(sp).length ? sp : undefined);
      said.push(
        Object.keys(sp).length
          ? `${SHEET_LABELS.skillPriority} : ${PRIORITY_KEYS.map((k) => sp[k] ?? '—').join(' · ')}`
          : `${SHEET_LABELS.skillPriority} retirée`,
      );
    }
  }
  if (keys.includes('tags')) {
    const tags = cleanSheetTags(sent.tags, current.tags ?? []);
    if (typeof tags === 'string')
      refuse({ field: 'tags', reason: tags }, `${name} · ${SHEET_LABELS.tags}`);
    else if (!sameJson(tags, current.tags ?? [])) {
      next = withField(next, 'tags', tags.length ? tags : undefined);
      said.push(tags.length ? `tags : ${tags.join(', ')}` : 'tags retirés');
    }
  }
  if (keys.includes('prosCons')) {
    const pc = cleanProsCons(sent.prosCons);
    if (typeof pc === 'string')
      refuse({ field: 'prosCons', reason: pc }, `${name} · ${SHEET_LABELS.prosCons}`);
    else if (pc.issues.length)
      for (const { list, index, reason } of pc.issues)
        refuse({ field: 'prosCons', list, index, reason }, `${name} · ${list}[${index}]`);
    else if (!sameJson(pc.value, prosConsSides(current.prosCons))) {
      const { pros, cons } = pc.value;
      const empty = !pros.length && !cons.length;
      next = withField(next, 'prosCons', empty ? undefined : pc.value);
      said.push(
        empty
          ? `${SHEET_LABELS.prosCons} retirés`
          : `${SHEET_LABELS.prosCons} : ${pros.length} pro${pros.length > 1 ? 's' : ''}, ${cons.length} con${cons.length > 1 ? 's' : ''}`,
      );
    }
  }
  if (keys.includes('synergies')) {
    const syn = cleanSynergies(sent.synergies, disk.roster);
    if (typeof syn === 'string')
      refuse({ field: 'synergies', reason: syn }, `${name} · ${SHEET_LABELS.synergies}`);
    else if (syn.issues.length)
      for (const { list, index, reason } of syn.issues)
        refuse({ field: 'synergies', list, index, reason }, `${name} · ${list}[${index}]`);
    else if (!sameJson(syn.value, current.synergies ?? [])) {
      const n = syn.value.length;
      next = withField(next, 'synergies', n ? syn.value : undefined);
      said.push(
        n
          ? `${SHEET_LABELS.synergies} : ${n} groupe${n > 1 ? 's' : ''}`
          : `${SHEET_LABELS.synergies} retirées`,
      );
    }
  }
  if (said.length) {
    j.doing('écriture de la fiche');
    const errors = await deps.upsertCharacter(id, next);
    if (errors.length) {
      // Le store ne dit pas lequel des champs il refuse : tous sont marqués.
      for (const k of keys)
        if (!refused.some((r) => r.field === k)) refused.push({ field: k, reason: errors[0] });
      for (const e of errors) j.done(`REFUSÉ — ${name} : ${e}`);
    } else {
      touched.add(CHARACTERS_PATH);
      for (const line of said) j.done(line);
    }
  }

  // 3. Les chips de skills, sur les cartes que le serveur calcule pour ce perso.
  if (hasKit) {
    let cards: KitEditorCard[] = [];
    const kitRefuse = (card: string | undefined, reason: string): void =>
      refuse(
        { field: 'kit', ...(card ? { card } : {}), reason },
        `${name} · chips${card ? ` de « ${cards.find((c) => c.id === card)?.name || card} »` : ''}`,
      );
    let plan: ReturnType<typeof planKit> | null = null;
    try {
      cards = await deps.kitCards(id);
      plan = planKit(changes?.kit, cards, deps.kitSections(), deps.kitCatalog());
    } catch (e: unknown) {
      kitRefuse(undefined, `kit illisible (${e instanceof Error ? e.message : String(e)})`);
    }
    if (typeof plan === 'string') kitRefuse(undefined, plan);
    else if (plan) {
      for (const { card, reason } of plan.issues) kitRefuse(card, reason);
      if (plan.said.length) {
        j.doing('écriture des chips de skills');
        const errors = await deps.applyKit({ cardIds: cards.map((c) => c.id), ...plan.patch });
        // Le store nomme la carte en tête de son refus : `chipHide[<id>] : …`.
        for (const e of errors) {
          const m = /^chip(?:Hide|Add)\[(.+?)\] : (.*)$/.exec(e);
          kitRefuse(m?.[1], m?.[2] ?? e);
        }
        if (!errors.length) {
          touched.add(CHARACTER_SKILLS_PATH);
          for (const line of plan.said) j.done(line);
        }
      }
    }
  }

  if (!touched.size)
    return refused.length
      ? out(false, [...j.lines, 'Rien à enregistrer.'])
      : out(true, ['Rien à enregistrer : le disque porte déjà ces valeurs.']);

  const commit = deps.commitPaths([...touched], `chore(characters): ${name}`, report);
  return out(commit.ok && !refused.length, [...j.lines, ...commit.log], { written: true });
}

// ------------------------------------------------------------------ noms -----

const SHORT_NAMES_PATH = 'data/curated/short-names.json';
const SEARCH_ALIASES_PATH = 'data/curated/search-aliases.json';

/**
 * La largeur du libellé au palier le plus étroit — celui du mobile. Recopiée de
 * `SCALE.default.labelWidthPx` : la table de `CharacterCard` reste celle qui
 * décide (elle n'est pas exportée), l'onglet « Noms » constate — comme
 * `card-label.test.ts`, qui pose la même question à tout le roster.
 */
const LABEL_WIDTH_PX = 80;

/** Les deux lectures de l'onglet « Noms » : les curés, tels que le disque les porte. */
export interface NamesDisk {
  loadShortNames: () => Record<string, LocalizedText>;
  loadSearchAliases: () => Record<string, string[]>;
}

/** Celles de la route : les lecteurs du site. */
export const NAMES_DISK: NamesDisk = { loadShortNames, loadSearchAliases };

export interface NameRow {
  id: string;
  /** Nom COMPLET en anglais, comme dans Rangs : la ligne de la liste, le commit. */
  name: string;
  /** Nom COMPLET par langue (`characterDisplayName`), les six. */
  full: Record<Lang, string>;
  /** L'entrée du disque, telle quelle : les seules langues renseignées. */
  short: LocalizedText;
  aliases: string[];
  /** Ce qui est DÉJÀ cherchable sans alias (`characterSearchNames`). */
  base: string[];
  /**
   * Le verdict du site, par langue : le nom complet tient-il sous la carte, et
   * le nom court EFFECTIF (`lRec` : la langue, sinon l'anglais) — `null` sans
   * nom court.
   */
  fits: { full: Record<Lang, boolean>; short: Record<Lang, boolean | null> };
  /**
   * « À traiter » : au moins une langue où le nom complet déborde ET où le nom
   * court effectif manque ou déborde aussi — ce que `card-label.test.ts` refuse.
   */
  todo: boolean;
}

const perLang = <T>(of: (lang: Lang) => T): Record<Lang, T> =>
  Object.fromEntries(LANGS.map((l) => [l, of(l)])) as Record<Lang, T>;

/**
 * L'onglet « Noms » : tout le roster, ses noms complets, son nom court et ses
 * alias lus du disque à l'instant, et la réponse à « ce nom déborde-t-il ? » —
 * la règle du site (`fitsOnTwoLines`), appelée telle quelle, une fois, ici. Le
 * portrait est celui de Rangs : la page le compose de l'id.
 */
export function namesState(disk: NamesDisk = NAMES_DISK) {
  const shortNames = disk.loadShortNames();
  const searchAliases = disk.loadSearchAliases();
  const rows: NameRow[] = getCharacterListItems().map((c) => {
    const short = shortNames[c.id] ?? {};
    const full = perLang((l) => characterDisplayName(c, l));
    const fits = {
      full: perLang((l) => fitsOnTwoLines(full[l], LABEL_WIDTH_PX)),
      short: perLang((l) => {
        const effective = lRec(short, l);
        return effective ? fitsOnTwoLines(effective, LABEL_WIDTH_PX) : null;
      }),
    };
    return {
      id: c.id,
      name: characterDisplayName(c),
      full,
      short,
      aliases: searchAliases[c.id] ?? [],
      base: characterSearchNames(c),
      fits,
      todo: LANGS.some((l) => !fits.full[l] && fits.short[l] !== true),
    };
  });
  return { rows, langs: LANGS, width: LABEL_WIDTH_PX };
}

/**
 * Le verdict en direct de la saisie : la même règle, un booléen par texte, dans
 * l'ordre. Rien n'est lu ni écrit. Ce qui n'est pas une chaîne « tient » — il
 * n'y a rien à afficher.
 */
export function fitNames(texts: unknown): { fits: boolean[] } {
  if (!Array.isArray(texts)) return { fits: [] };
  return {
    fits: texts.map((t) => typeof t !== 'string' || fitsOnTwoLines(t, LABEL_WIDTH_PX)),
  };
}

/** Un perso de l'onglet « Noms » : ce qu'il doit porter, et ce que la page a chargé. */
export interface NameChange {
  id: string;
  short: LocalizedText;
  aliases: string[];
  was: { short: LocalizedText; aliases: string[] };
}

/** Les lectures et les écritures de `saveNames`, injectées : les stores et git. */
export interface NamesDeps extends NamesDisk {
  upsertShortName: (id: string, name: LocalizedText) => Promise<string[]>;
  upsertSearchAliases: (id: string, aliases: string[]) => Promise<string[]>;
  commitPaths: (paths: string[], message: string, report?: Report) => Outcome;
}

/** Celles de la route : les stores de l'admin et le vrai `commitPaths`. */
export const NAMES_DEPS: NamesDeps = {
  ...NAMES_DISK,
  upsertShortName,
  upsertSearchAliases,
  commitPaths,
};

const sameShort = (a: LocalizedText | undefined, b: LocalizedText | undefined): boolean =>
  LANGS.every((l) => (a?.[l] ?? '') === (b?.[l] ?? ''));
const sameAliases = (a: string[] | undefined, b: string[] | undefined): boolean =>
  (a ?? []).length === (b ?? []).length && (a ?? []).every((v, i) => v === b?.[i]);

/**
 * Enregistre un lot de persos : pour chacun, le disque doit encore porter ce
 * que la page avait chargé (`was`), puis `upsertShortName` et
 * `upsertSearchAliases` — les stores de l'admin, et seulement celui dont la
 * donnée change —, puis un seul commit sur les fichiers réellement touchés.
 *
 * Le trim et le dédoublonnage sont ceux des stores : rien n'est nettoyé ici, et
 * une liste d'alias vide leur est passée telle quelle (ils retirent la clé).
 *
 * Un perso refusé n'arrête pas le lot : les autres partent, `refused` dit à la
 * page lesquels marquer et `saved` lesquels ne sont plus en attente. Un lot où
 * rien ne passe n'écrit ni ne committe rien.
 */
export async function saveNames(
  changes: NameChange[],
  deps: NamesDeps,
  report?: Report,
): Promise<Outcome & { refused: string[]; saved: string[] }> {
  if (!Array.isArray(changes) || !changes.length)
    return { ok: false, log: ['Aucune modification à enregistrer.'], refused: [], saved: [] };

  const j = journal(report);
  const names = new Map(getCharacterListItems().map((c) => [c.id, characterDisplayName(c)]));
  const refused: string[] = [];
  const saved: string[] = [];
  const touched = new Set<string>();

  for (const c of changes) {
    const id = String(c?.id ?? '');
    const name = names.get(id);
    if (!name) {
      refused.push(id);
      j.done(`REFUSÉ — perso inconnu : ${id}.`);
      continue;
    }
    // Le disque, relu pour CE perso : un nom posé d'ailleurs (l'admin, l'autre
    // poste) depuis le chargement de la page ne doit pas être écrasé.
    const disk = {
      short: deps.loadShortNames()[id] ?? {},
      aliases: deps.loadSearchAliases()[id] ?? [],
    };
    if (!sameShort(disk.short, c.was?.short) || !sameAliases(disk.aliases, c.was?.aliases)) {
      refused.push(id);
      j.done(`REFUSÉ — ${name} : le disque a changé depuis le chargement.`);
      continue;
    }

    const short = c.short ?? {};
    const aliases = Array.isArray(c.aliases) ? c.aliases : [];
    const errors: string[] = [];
    const done: string[] = [];
    if (!sameShort(short, disk.short)) {
      errors.push(...(await deps.upsertShortName(id, short)));
      if (!errors.length) {
        touched.add(SHORT_NAMES_PATH);
        const said = LANGS.filter((l) => short[l]?.trim()).map((l) => `${l} « ${short[l]} »`);
        done.push(said.length ? `nom court ${said.join(', ')}` : 'nom court retiré');
      }
    }
    if (!errors.length && !sameAliases(aliases, disk.aliases)) {
      errors.push(...(await deps.upsertSearchAliases(id, aliases)));
      if (!errors.length) {
        touched.add(SEARCH_ALIASES_PATH);
        done.push(aliases.length ? `alias ${aliases.join(', ')}` : 'alias retirés');
      }
    }
    if (errors.length) {
      refused.push(id);
      for (const e of errors) j.done(`REFUSÉ — ${name} : ${e}`);
    }
    // Le perso est « enregistré » dès qu'un store a écrit pour lui : la page
    // relit le disque, et ce qui a été refusé après coup est dit au journal.
    if (done.length) {
      saved.push(id);
      j.done(`${name} : ${done.join(' ; ')}.`);
    }
  }

  if (!touched.size)
    return refused.length
      ? { ok: false, log: [...j.lines, 'Rien à enregistrer.'], refused, saved }
      : {
          ok: true,
          log: ['Rien à enregistrer : le disque porte déjà ces valeurs.'],
          refused,
          saved,
        };

  const commit = deps.commitPaths(
    [...touched],
    `chore(names): ${saved.length === 1 ? names.get(saved[0]) : `${saved.length} persos`}`,
    report,
  );
  return { ok: commit.ok && !refused.length, log: [...j.lines, ...commit.log], refused, saved };
}

// ------------------------------------------------------------- gear reco -----

/** Le seul fichier que l'onglet « Gear reco » écrit et committe. */
const GEAR_RECO_PATH = 'data/curated/gear-reco.json';

/**
 * Les langues que portent presque toutes les notes du fichier, dans l'ordre où
 * l'onglet les range : l'anglais se saisit, les autres (celles-ci d'abord, puis
 * le reste des langues du site) se génèrent par « Traduire » et se relisent.
 */
const NOTE_LANGS: readonly Lang[] = ['en', 'fr', 'es'];

/** Où une erreur se montre dans un build. */
export type GearSlot = 'name' | 'weapons' | 'amulets' | 'talismans' | 'sets' | 'substats' | 'note';

const GEAR_SLOT_LABELS: Record<GearSlot, string> = {
  name: 'nom',
  weapons: 'armes',
  amulets: 'amulettes',
  talismans: 'talismans',
  sets: 'sets',
  substats: 'substats',
  note: 'note',
};

/**
 * Une erreur située : `build` est le rang dans la liste envoyée (`null` quand
 * elle ne tient à aucun build), `index` celui de la pièce ou du combo dans son
 * slot. La page s'en sert pour cercler l'endroit.
 */
export interface GearIssue {
  build: number | null;
  slot?: GearSlot;
  index?: number;
  message: string;
}

/** Ce qu'un build a le droit de citer : les ids des sélecteurs et les presets. */
export interface GearCatalog {
  weapons: ReadonlySet<string>;
  amulets: ReadonlySet<string>;
  talismans: ReadonlySet<string>;
  sets: ReadonlySet<string>;
  presets: GearPresets;
}

function gearCatalog(): GearCatalog {
  const options = gearSelectOptions();
  const ids = (list: GearOption[]): Set<string> => new Set(list.map((o) => o.id));
  return {
    weapons: ids(options.weapons),
    amulets: ids(options.amulets),
    talismans: ids(options.talismans),
    sets: ids(options.sets),
    presets: loadGearPresets(),
  };
}

/**
 * Ce que la tuile d'une pièce montre en plus de son icône (`EquipmentIcon`,
 * côté site), par id d'option : le grade (son cadre de rareté), le dernier
 * palier d'étoiles, l'icône d'effet — celle du PREMIER palier de passif, comme
 * `toGearRows` de la page /equipment — et, pour un talisman, son type de
 * points. Une famille à variantes de classe (Briareos, Gorgon) rend une entrée
 * par variante, sous son id et avec SON passif : les ids de `familyOptions`
 * (`gear-options.ts`), auxquels ces faits se joignent.
 */
function gearTileFacts(families: GearFamily[]) {
  const effect = (refs: GearFamily['passives']) =>
    resolvePassives(refs, 'en')[0]?.icon || undefined;
  return new Map(
    families.flatMap((f) => {
      const base = { grade: f.grade, star: f.stars.at(-1), mode: f.mode };
      return f.classPassives?.length
        ? f.classPassives.map((v) => [v.id, { ...base, overlayIcon: effect(v.passives) }] as const)
        : [[f.id, { ...base, overlayIcon: effect(f.passives) }] as const];
    }),
  );
}

/** Les pièces d'un set dans l'ordre de ses tuiles (`SetCard`, `shownPieceIdx`). */
const SET_PIECES = ['helmet', 'armor', 'gloves', 'shoes'] as const;

/**
 * Ce que la tuile d'un set montre, par id : l'icône d'enchantement, ses quatre
 * pièces 6★, et ses bonus au dernier palier connu, en anglais (repli sur le
 * premier, comme la page /equipment). `has2P` : le set a un bonus 2 pièces —
 * Revenge et Patience n'en ont pas, ils ne s'apparient pas dans un combo 2 + 2.
 */
function setTileFacts() {
  return new Map(
    getSetViews('en').map((s) => {
      const last = s.tiers.at(-1);
      const p2 = last?.p2 ?? s.tiers[0]?.p2;
      const p4 = last?.p4 ?? s.tiers[0]?.p4;
      return [
        s.id,
        {
          setIcon: s.icon,
          pieceIcons: SET_PIECES.map((slot) => s.pieceIcons[slot] ?? ''),
          p2,
          p4,
          has2P: Boolean(p2),
        },
      ] as const;
    }),
  );
}

/**
 * L'onglet « Gear reco » : le roster (qui a des recos), les presets en lecture
 * seule, les listes des sélecteurs (celles de l'admin, jointes à ce que leurs
 * tuiles montrent — `gearTileFacts`, `setTileFacts`) et, avec `id`, les builds
 * de ce perso lus du disque à l'instant.
 *
 * Les builds viennent DEUX fois : `builds` en pièces (presets dépliés, comme
 * l'admin les édite) et `disk` tels que le fichier les porte. La page a besoin
 * des deux — un slot resté sur son preset repart sous son `$slug` d'origine, et
 * ne redevient des pièces que si on le règle à la pièce (deux presets peuvent
 * avoir le même contenu : replier des pièces rendrait le premier des deux, pas
 * forcément celui que le build citait).
 *
 * `statIcons` : la table `STAT_ICON` du site (abréviation → sprite), pour les
 * puces de stat principale de l'aperçu.
 */
export function gearRecoState(id?: string) {
  const reco = loadGearReco();
  const presets = loadGearPresets();
  const options = gearSelectOptions();
  const slim = (list: GearOption[]) =>
    list.map((o) => ({
      id: o.id,
      label: o.label,
      icon: o.icon,
      classLimits: o.classLimits,
      mainStats: o.mainStats,
    }));
  // Une option sans famille (ou sans vue de set) reste telle quelle : la page
  // lui pose une tuile sans cadre de rareté connu.
  const pieces = (list: GearOption[], families: GearFamily[]) => {
    const facts = gearTileFacts(families);
    return slim(list).map((o) => ({ ...o, ...facts.get(o.id) }));
  };
  const sets = setTileFacts();
  const disk = id === undefined ? undefined : (reco[id] ?? []);
  return {
    roster: getCharacterListItems()
      .map((c) => ({
        id: c.id,
        name: characterDisplayName(c),
        class: c.class,
        builds: reco[c.id]?.length ?? 0,
      }))
      .sort((a, b) => a.name.localeCompare(b.name)),
    presets: { talismans: presets.talismans, sets: presets.sets, substats: presets.substats },
    options: {
      weapons: pieces(options.weapons, getWeaponFamilies()),
      amulets: pieces(options.amulets, getAmuletFamilies()),
      talismans: pieces(options.talismans, getTalismanFamilies()),
      sets: slim(options.sets).map((o) => ({ ...o, ...sets.get(o.id) })),
    },
    langs: {
      default: DEFAULT_LANG,
      main: NOTE_LANGS,
      extra: LANGS.filter((l) => !NOTE_LANGS.includes(l)),
    },
    statIcons: STAT_ICON,
    ...(disk ? { id, disk, builds: disk.map((b) => expandBuild(b, presets)) } : {}),
  };
}

const tagsOf = (text: string): string[] => (text.match(TAG_REGEX) ?? []).sort();

/**
 * Ce que `validateGearBuilds` ne voit pas — il ne contrôle que la FORME, et un
 * id vide ou un preset qui n'existe pas sont des chaînes comme les autres. Or
 * l'enregistrement committe sur `main`, que « Pousser » envoie : trois contrôles
 * avant d'écrire.
 *
 *   - les RÉFÉRENCES : chaque pièce est un id des sélecteurs, chaque `$slug` un
 *     preset du fichier, un build a un nom ;
 *   - les TAGS INLINE des textes, par `checkText` — la résolution de
 *     `tag-control.ts`, dont le test fait échouer la suite sur un tag sans
 *     correspondance ;
 *   - la PARITÉ des balises d'une note écrite dans toutes les langues du site,
 *     règle de `inline-tag-parity.test.ts` (même forme de balise, même
 *     condition : il ne regarde que les blocs complets).
 *
 * Une stat principale hors du pool de sa pièce n'est PAS refusée : le fichier
 * en porte, et les refuser bloquerait l'enregistrement de ces persos.
 */
export function checkGearBuilds(builds: GearBuild[], catalog: GearCatalog): GearIssue[] {
  const issues: GearIssue[] = [];
  const { presets } = catalog;

  builds.forEach((b, build) => {
    const add = (slot: GearSlot, message: string, index?: number): void =>
      void issues.push({ build, slot, ...(index === undefined ? {} : { index }), message });
    const tags = (slot: GearSlot, text: string, where = ''): void => {
      for (const c of checkText(text)) if (!c.ok) add(slot, `${where}${c.tag} — ${c.reason}`);
    };

    if (!b.name.trim()) add('name', 'nom vide');
    tags('name', b.name);

    for (const slot of ['weapons', 'amulets'] as const)
      (b[slot] ?? []).forEach((p, i) => {
        if (!catalog[slot].has(p.id))
          add(slot, p.id ? `pièce inconnue « ${p.id} »` : 'pièce non choisie', i);
      });

    (b.talismans ?? []).forEach((t, i) => {
      if (t.startsWith('$')) {
        if (!Object.hasOwn(presets.talismans, t.slice(1)))
          add('talismans', `preset inconnu « ${t} »`, i);
      } else if (!catalog.talismans.has(t))
        add('talismans', t ? `talisman inconnu « ${t} »` : 'talisman non choisi', i);
    });

    (b.sets ?? []).forEach((combo, i) => {
      if (combo.preset) {
        if (!Object.hasOwn(presets.sets, combo.preset))
          add('sets', `preset inconnu « $${combo.preset} »`, i);
        return;
      }
      if (!combo.pieces?.length) return add('sets', 'combo vide', i);
      for (const p of combo.pieces)
        if (!catalog.sets.has(p.set))
          add('sets', p.set ? `set inconnu « ${p.set} »` : 'set non choisi', i);
    });

    if (b.substats) {
      if (b.substats.startsWith('$') && !Object.hasOwn(presets.substats, b.substats.slice(1)))
        add('substats', `preset inconnu « ${b.substats} »`);
      tags('substats', b.substats);
    }

    const note: Partial<Record<string, string>> = b.note ?? {};
    for (const [lang, text] of Object.entries(note)) if (text) tags('note', text, `${lang} : `);
    if (Object.keys(note).length && !note[DEFAULT_LANG]?.trim())
      add('note', `pas de texte « ${DEFAULT_LANG} », la langue de repli`);
    if (LANGS.every((l) => typeof note[l] === 'string')) {
      const ref = tagsOf(note[DEFAULT_LANG] ?? '').join(' ');
      for (const lang of LANGS) {
        const own = tagsOf(note[lang] ?? '').join(' ');
        if (own !== ref)
          add(
            'note',
            `${lang} : balises « ${own || 'aucune'} », « ${DEFAULT_LANG} » porte « ${ref || 'aucune'} »`,
          );
      }
    }
  });
  return issues;
}

/** Situe un écart de `validateGearBuilds` (« gearReco[id][1].weapons[0].id — … »). */
function locateGearError(error: string): GearIssue {
  const m = error.match(/^gearReco\[[^\]]*\]\[(\d+)\](?:\.(\w+))?(?:\[(\d+)\])?\S* — (.*)$/);
  if (!m) return { build: null, message: error };
  const [, build, slot, index, message] = m;
  const known = slot !== undefined && slot in GEAR_SLOT_LABELS;
  return {
    build: Number(build),
    ...(known ? { slot: slot as GearSlot } : {}),
    ...(known && index !== undefined ? { index: Number(index) } : {}),
    message: known ? message : error,
  };
}

/** Les deux écritures de `saveGearReco`, injectées : le store et git. */
export interface GearRecoDeps {
  upsert: (id: string, builds: GearBuild[]) => Promise<string[]>;
  commitPaths: (paths: string[], message: string, report?: Report) => Outcome;
}

/** Celles de la route : le store de l'admin et le vrai `commitPaths`. */
export const GEAR_RECO_DEPS: GearRecoDeps = { upsert: upsertGearReco, commitPaths };

/**
 * Enregistre les builds d'un perso — la liste COMPLÈTE, comme la route de
 * l'admin (une liste vide retire la clé) : forme, références et tags contrôlés
 * (`checkGearBuilds`), écriture par `upsertGearReco` (qui replie les pièces
 * vers leurs presets et trie le fichier), puis un commit sur ce seul fichier.
 * Une liste vide ne demande rien avant (un commit local se défait) : le journal
 * dit que le perso est retiré du fichier.
 *
 * Une erreur n'écrit ni ne committe RIEN : `issues` les situe pour la page, le
 * journal les dit. `written` distingue l'échec d'après écriture (un commit
 * refusé) — le disque porte alors les builds, et la page le relit.
 *
 * Pas de garde de concurrence, à la différence des rangs : la liste remplace
 * celle du disque, comme dans l'admin. La page relit le disque à chaque perso
 * choisi.
 */
export async function saveGearReco(
  id: string,
  builds: GearBuild[],
  deps: GearRecoDeps,
  report?: Report,
): Promise<Outcome & { issues: GearIssue[]; written: boolean }> {
  const char = getCharacterListItems().find((c) => c.id === id);
  if (!char) return { ok: false, log: [`Perso inconnu : ${id}`], issues: [], written: false };
  const name = characterDisplayName(char);

  const refuse = (issues: GearIssue[]) => ({
    ok: false,
    log: issues.map((i) => {
      const b = i.build === null ? undefined : builds[i.build];
      const where = [
        i.build === null
          ? name
          : `build ${i.build + 1}${typeof b?.name === 'string' && b.name ? ` « ${b.name} »` : ''}`,
        ...(i.slot
          ? [`${GEAR_SLOT_LABELS[i.slot]}${i.index === undefined ? '' : ` ${i.index + 1}`}`]
          : []),
      ].join(' · ');
      return `REFUSÉ — ${where} : ${i.message}`;
    }),
    issues,
    written: false,
  });

  // La FORME d'abord : le contrôle des références parcourt les builds.
  const shape = validateGearBuilds(id, builds);
  if (shape.length) return refuse(shape.map(locateGearError));
  const issues = checkGearBuilds(builds, gearCatalog());
  if (issues.length) return refuse(issues);

  const j = journal(report);
  const errors = await deps.upsert(id, builds);
  if (errors.length) return refuse(errors.map(locateGearError));
  j.done(
    builds.length
      ? `${name} : ${builds.length} build${builds.length > 1 ? 's' : ''} écrit${builds.length > 1 ? 's' : ''}.`
      : `gear-reco : ${name} retiré du fichier.`,
  );

  const commit = deps.commitPaths([GEAR_RECO_PATH], `chore(gear-reco): ${name}`, report);
  return { ok: commit.ok, log: [...j.lines, ...commit.log], issues: [], written: true };
}

/** Ce que rend l'aperçu de l'admin : les builds résolus, les libellés de la fiche. */
type GearPreview = Awaited<ReturnType<typeof previewGearReco>>;

/**
 * L'aperçu de l'onglet Gear reco : les builds EN COURS d'édition, tels que
 * `gToBuild` les enverrait à l'enregistrement, résolus par `previewGearReco` —
 * l'aperçu de l'admin, donc le résolveur de la fiche perso, appelé tel quel
 * (`'use server'` n'est ici qu'une chaîne ; sa garde `IS_DEV` passe grâce à
 * `env.ts`). Rien ne s'écrit.
 *
 * Tolérant, comme le résolveur : un id inconnu ou un preset absent sortent en
 * pièces `unresolved`, un nom vide passe — c'est un aperçu, pas un contrôle.
 * Seule la FORME est exigée (`validateGearBuilds` : une liste de builds, un nom
 * en chaîne, des listes de pièces), parce que le résolveur lève ou divague sur
 * autre chose. Tout refus est RENDU, jamais levé — une forme fausse, une
 * résolution qui lève, et l'aperçu que sa garde `IS_DEV` aurait coupé (il
 * rendrait zéro build sans rien dire).
 */
export async function previewGearBuilds(
  builds: unknown,
  lang: unknown,
): Promise<GearPreview | { error: string }> {
  if (!Array.isArray(builds)) return { error: 'builds : une liste de builds attendue' };
  const list = builds as GearBuild[];
  const shape = validateGearBuilds('aperçu', list).map(locateGearError);
  if (shape.length)
    return {
      error: shape
        .map((i) =>
          i.build === null
            ? i.message
            : `build ${i.build + 1}${i.slot ? ` · ${GEAR_SLOT_LABELS[i.slot]}` : ''} : ${i.message}`,
        )
        .join(' ; '),
    };
  try {
    const out = await previewGearReco(list, typeof lang === 'string' ? lang : DEFAULT_LANG);
    if (list.length && !out.builds.length)
      return { error: 'L’aperçu n’a rien rendu : sa garde IS_DEV l’a coupé (NODE_ENV).' };
    return out;
  } catch (e: unknown) {
    return { error: e instanceof Error ? e.message : String(e) };
  }
}

/** Ce que rend le traducteur de l'admin : une traduction par texte, et le moteur. */
type Translated = Awaited<ReturnType<typeof autoTranslate>>;

/**
 * Ce dont `translateNotes` dépend, injecté : le traducteur, et la présence
 * d'une clé. Aucun test n'appelle DeepL ni Anthropic.
 */
export interface TranslateDeps {
  autoTranslate: (texts: string[], targets: Lang[]) => Promise<Translated>;
  /** Une clé de traduction est-elle posée ? La clé elle-même ne sort pas d'ici. */
  hasKey: () => boolean;
}

/**
 * Celles de la route : `autoTranslate` de l'admin (DeepL, puis Claude Haiku
 * quand son quota est vide) et les variables qu'il lit — à l'appel, `.env.local`
 * étant chargé après les imports.
 */
export const TRANSLATE_DEPS: TranslateDeps = {
  autoTranslate,
  hasKey: () =>
    [process.env.DEEPL_API_KEY ?? process.env.DEEPL_API, process.env.ANTHROPIC_API_KEY].some(
      (key) => key?.trim(),
    ),
};

export const NO_TRANSLATE_KEY = 'Pas de clé DEEPL_API_KEY ni ANTHROPIC_API_KEY dans .env.local';

/**
 * « Traduire » : des textes anglais vers les autres langues du site, d'UN appel
 * (`autoTranslate` prend tous les textes à la fois et préserve les tags `{…}`).
 * `results` est aligné sur `texts` ; un texte vide n'est pas envoyé et rend
 * `{}`. Générique — `POST /api/translate` : les notes d'un perso (Gear reco, né
 * pour lui, d'où le nom), le titre et les puces d'une entrée du journal du site,
 * UNE PUCE = UN TEXTE (cf. `changelog-text.ts`).
 *
 * Rien ne s'écrit ici : la page pose les traductions dans son modèle, et c'est
 * l'enregistrement de l'onglet qui les contrôle (`saveGearReco` : les tags).
 *
 * Tout échec est RENDU, jamais levé — pas de clé (sans appeler le moteur), un
 * refus de DeepL ou d'Anthropic, et le moteur qui ne traduit rien : `provider`
 * à `none` est ce que rend `autoTranslate` quand sa garde `IS_DEV` le coupe
 * (cf. `env.ts`), un silence qui laisserait croire le texte traduit.
 */
export async function translateNotes(
  texts: string[],
  deps: TranslateDeps,
): Promise<Translated | { error: string }> {
  if (!deps.hasKey()) return { error: NO_TRANSLATE_KEY };
  const results: Translated['results'] = texts.map(() => ({}));
  const sent = texts.flatMap((text, i) => (text.trim() ? [i] : []));
  if (!sent.length) return { results, provider: 'none' };
  try {
    const out = await deps.autoTranslate(
      sent.map((i) => texts[i]),
      LANGS.filter((l) => l !== DEFAULT_LANG),
    );
    if (out.provider === 'none')
      return { error: 'Le traducteur n’a rien rendu : sa garde IS_DEV l’a coupé (NODE_ENV).' };
    sent.forEach((i, k) => {
      results[i] = out.results[k] ?? {};
    });
    return { results, provider: out.provider };
  } catch (e: unknown) {
    return { error: e instanceof Error ? e.message : String(e) };
  }
}

// ---------------------------------------------------------------- effets -----

/** Le curé des effets : overrides du glossaire extrait, et créations. */
const EFFECTS_PATH = 'data/curated/effects.json';

/** D'où viennent les icônes d'effet, sous la base des images (`img.effect`). */
const EFFECT_SPRITE = 'images/ui/effect';

/** Ce que l'origine d'un effet veut dire, pour la ligne et la fiche. */
const EFFECT_ORIGINS: Record<MergedEffect['origin'], string> = {
  tooltip: 'statut',
  type: 'mécanique',
  curated: 'création',
};

/** La lecture de l'onglet « Effets » : le glossaire extrait et le curé du disque. */
export interface EffectsDisk {
  sources: () => EffectSources;
}

/** Celle de la route : le lecteur du site, curé relu du disque à chaque appel. */
export const EFFECTS_DISK: EffectsDisk = { sources: liveEffectSources };

/** Un effet du catalogue : sa ligne, et ce que sa fiche édite. */
export interface EffectRow {
  id: string;
  /** Nom anglais FUSIONNÉ (le curé prime) : la ligne, le commit. '' sans nom. */
  name: string;
  icon: string;
  isDebuff: boolean;
  origin: MergedEffect['origin'];
  /** Icône du pool du wiki (posée par la curation), absente des sprites du jeu. */
  iconEditorial: boolean;
  irremovable: boolean;
  /** Famille éditoriale curée (`tag`) et son libellé, du côté de l'effet. */
  tag: string | null;
  family: string | null;
  /** Une entrée curée existe. */
  overridden: boolean;
  hidden: boolean;
  /** Pas de description anglaise, curation comprise : à documenter. */
  noDesc: boolean;
  /** Clés éditoriales : l'index généré (`BT_*`, alias), puis les curées. */
  keys: string[];
  /** Ce que l'EXTRACTION porte, sans la curation ; `null` pour une création. */
  extracted: {
    name: Record<string, string>;
    desc: Record<string, string>;
    icon: string;
    isDebuff: boolean;
    tooltips: string[];
  } | null;
  /** L'entrée du disque, telle quelle ; `{}` sans curation. */
  curated: EffectCurated;
}

/** La ligne d'un effet fusionné. */
function effectRow(e: MergedEffect, src: EffectSources, keys: Map<string, Set<string>>): EffectRow {
  const raw = src.effects[e.id];
  const side: EffectSide = e.isDebuff ? 'debuff' : 'buff';
  return {
    id: e.id,
    name: e.name.en ?? '',
    icon: e.icon,
    isDebuff: e.isDebuff,
    origin: e.origin,
    iconEditorial: e.iconEditorial,
    irremovable: e.irremovable,
    tag: e.tag ?? null,
    family: e.tag ? effectFamilyLabel(side, e.tag) : null,
    overridden: e.overridden,
    hidden: e.hidden,
    noDesc: !e.desc.en,
    keys: [...(keys.get(e.id) ?? [])],
    extracted: raw
      ? {
          name: raw.name,
          desc: raw.desc,
          icon: raw.icon,
          isDebuff: raw.isDebuff,
          tooltips: raw.tooltips,
        }
      : null,
    curated: src.curated[e.id] ?? {},
  };
}

/**
 * L'onglet « Effets » : le catalogue tel que l'admin le range (`pairEffects` —
 * paires buff ↔ debuff miroir, puis orphelins), chaque effet avec ce que sa
 * fiche édite : l'extrait d'un côté, l'entrée curée du disque de l'autre. Et ce
 * que la page ne doit pas recopier : les comptes, les familles éditoriales et
 * leurs libellés par côté, les libellés d'origine, les langues, le dossier des
 * icônes, et les icônes déjà portées par un effet (les suggestions du champ).
 */
export function effectsState(disk: EffectsDisk = EFFECTS_DISK) {
  const src = disk.sources();
  const all = getMergedEffects(src);
  const keys = effectKeysById(src);
  const paired = pairEffects(all);
  const row = (e: MergedEffect): EffectRow => effectRow(e, src, keys);
  const catalog: EffectCatalog<EffectRow> = {
    pairs: paired.pairs.map(({ buff, debuff }) => ({ buff: row(buff), debuff: row(debuff) })),
    orphanBuffs: paired.orphanBuffs.map(row),
    orphanDebuffs: paired.orphanDebuffs.map(row),
  };
  const count = (is: (e: MergedEffect) => boolean): number => all.filter(is).length;
  const families = (side: EffectSide) =>
    EFFECT_FAMILIES[side].map((value) => ({ value, label: effectFamilyLabel(side, value) }));
  return {
    catalog,
    counts: {
      total: all.length,
      statuses: count((e) => e.origin === 'tooltip'),
      mechanics: count((e) => e.origin === 'type'),
      creations: count((e) => e.origin === 'curated'),
      curated: count((e) => e.overridden),
      noDesc: count((e) => !e.desc.en),
      hidden: count((e) => e.hidden),
    },
    families: { buff: families('buff'), debuff: families('debuff') },
    origins: EFFECT_ORIGINS,
    langs: LANGS,
    sprite: EFFECT_SPRITE,
    icons: [...new Set(all.map((e) => e.icon).filter(Boolean))].sort(),
  };
}

/**
 * La recherche de l'onglet : la règle de l'admin (`effect-search`), jouée ici —
 * la page ne la recopie pas. Par effet qui répond, le champ qui a répondu et
 * sa valeur (« clé BT_STAT|ST_SPEED », « nom fr »), que la ligne affiche.
 * `matches` à `null` : saisie vide, tout le catalogue reste.
 */
export function effectsSearch(
  query: unknown,
  disk: EffectsDisk = EFFECTS_DISK,
): { q: string; matches: Record<string, EffectMatch> | null } {
  const q = typeof query === 'string' ? query : '';
  if (!q.trim()) return { q, matches: null };
  const src = disk.sources();
  const keys = effectKeysById(src);
  const matches: Record<string, EffectMatch> = {};
  for (const e of getMergedEffects(src)) {
    const hit = effectMatches(
      effectHaystack({ id: e.id, keys: [...(keys.get(e.id) ?? [])], name: e.name }),
      q,
    );
    if (hit) matches[e.id] = hit;
  }
  return { q, matches };
}

/**
 * L'id qu'aurait un effet créé sous ce qui est tapé (`newEffectId`, la règle de
 * l'admin), et s'il est pris : un id qui existe ne se crée pas, il s'ouvre.
 */
export function effectNewId(
  raw: unknown,
  disk: EffectsDisk = EFFECTS_DISK,
): { id: string; exists: boolean } {
  const id = newEffectId(typeof raw === 'string' ? raw : '');
  const src = disk.sources();
  return { id, exists: Boolean(id) && Boolean(src.effects[id] ?? src.curated[id]) };
}

const trimmed = (v: unknown): string => (typeof v === 'string' ? v.trim() : '');

/** Un texte par langue du site, blancs retirés ; rien si aucune n'est remplie. */
function cleanLocalized(raw: unknown): LocalizedText | undefined {
  if (!raw || typeof raw !== 'object') return undefined;
  const out: LocalizedText = {};
  for (const l of LANGS) {
    const text = trimmed((raw as Record<string, unknown>)[l]);
    if (text) out[l] = text;
  }
  return Object.keys(out).length ? out : undefined;
}

/**
 * Une entrée curée venue de la page, ramenée à son contrat : les champs
 * connus, dans un ordre fixe, blancs retirés, vides absents — la forme que
 * l'éditeur de l'admin compose (`build`), puis `compactEffect`. Deux entrées
 * pareilles se comparent donc par leur JSON.
 */
function cleanEffectCurated(raw: unknown): EffectCurated {
  const r = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>;
  const keys = Array.isArray(r.keys) ? r.keys.map(trimmed).filter(Boolean) : [];
  return compactEffect({
    name: cleanLocalized(r.name),
    desc: cleanLocalized(r.desc),
    icon: trimmed(r.icon),
    ...(typeof r.isDebuff === 'boolean' ? { isDebuff: r.isDebuff } : {}),
    keys,
    tag: trimmed(r.tag),
    hidden: r.hidden === true,
    note: trimmed(r.note),
  });
}

const sameEffectCurated = (a: unknown, b: unknown): boolean =>
  JSON.stringify(cleanEffectCurated(a)) === JSON.stringify(cleanEffectCurated(b));

/** Un effet de l'onglet : ce qu'il doit porter, et ce que la page avait chargé. */
export interface EffectChange {
  id: string;
  curated: EffectCurated;
  was: EffectCurated;
  /** « ＋ effet » : l'id est NOUVEAU — refusé s'il existe déjà. */
  create?: boolean;
}

/** La lecture et les écritures de `saveEffects`, injectées : le store et git. */
export interface EffectsDeps extends EffectsDisk {
  upsert: (id: string, curated: EffectCurated) => Promise<string[]>;
  commitPaths: (paths: string[], message: string, report?: Report) => Outcome;
}

/** Celles de la route : le store de l'admin et le vrai `commitPaths`. */
export const EFFECTS_DEPS: EffectsDeps = {
  ...EFFECTS_DISK,
  upsert: upsertEffectCurated,
  commitPaths,
};

/**
 * Ce que rend `saveEffects` : `saved` ne sont plus en attente, `refused` sont
 * à marquer (leur première raison dans `reasons`), et parmi eux `stale` ont
 * été refusés parce que le DISQUE avait changé — la page leur rend le disque
 * au lieu de garder une saisie qui déferait l'écriture d'un autre.
 */
export interface EffectsOutcome extends Outcome {
  refused: string[];
  stale: string[];
  saved: string[];
  reasons: Record<string, string>;
}

/**
 * Enregistre un lot d'effets : pour chacun, le disque doit encore porter
 * l'entrée curée que la page avait chargée (`was`), puis `upsertEffectCurated`
 * — le store de l'admin, ses refus de schéma rendus tels quels —, puis UN
 * commit du fichier curé : `chore(effects): <nom anglais>`, « N effets » pour
 * un lot.
 *
 * Une CRÉATION (`create`) passe par la même porte avec un id nouveau : forgé
 * comme dans l'admin (`newEffectId`), refusé s'il existe déjà — extrait ou
 * curé —, car l'écrire remplacerait l'entrée d'un autre. Un effet sans extrait
 * n'existe que par son entrée : elle porte au moins un nom anglais (la règle de
 * l'éditeur de l'admin), donc elle ne se vide pas d'ici.
 *
 * Une entrée vide retire la clé (le store). Un effet refusé n'arrête pas le
 * lot : les autres partent (cf. `EffectsOutcome`). Un lot où rien ne passe
 * n'écrit ni ne committe rien.
 */
export async function saveEffects(
  changes: EffectChange[],
  deps: EffectsDeps,
  report?: Report,
): Promise<EffectsOutcome> {
  const refused: string[] = [];
  const stale: string[] = [];
  const saved: string[] = [];
  const reasons: Record<string, string> = {};
  const out = (ok: boolean, lines: string[]): EffectsOutcome => ({
    ok,
    log: lines,
    refused,
    stale,
    saved,
    reasons,
  });
  if (!Array.isArray(changes) || !changes.length)
    return out(false, ['Aucune modification à enregistrer.']);

  const j = journal(report);
  const named: string[] = [];
  const refuse = (id: string, why: string): void => {
    if (!refused.includes(id)) refused.push(id);
    reasons[id] ??= why;
    j.done(`REFUSÉ — ${why}`);
  };

  for (const c of changes) {
    const id = String(c?.id ?? '');
    // Le disque, relu pour CET effet : une entrée posée d'ailleurs (l'admin,
    // l'autre poste) depuis le chargement de la page ne doit pas être écrasée.
    const src = deps.sources();
    const extracted = src.effects[id];
    const disk = src.curated[id];
    if (c?.create) {
      if (!id || id !== newEffectId(id)) {
        refuse(id, `id de création invalide : « ${id} » (attendu ${newEffectId(id) || 'un id'}).`);
        continue;
      }
      if (extracted || disk) {
        refuse(id, `${id} existe déjà : l’ouvrir pour l’éditer, pas le créer.`);
        continue;
      }
    } else if (!extracted && !disk) {
      refuse(id, `effet inconnu : ${id}.`);
      continue;
    }
    const label = `${disk?.name?.en ?? extracted?.name.en ?? id} (${id})`;
    if (!sameEffectCurated(disk, c.was)) {
      stale.push(id);
      refuse(id, `${label} : le disque a changé depuis le chargement.`);
      continue;
    }

    const next = cleanEffectCurated(c.curated);
    // Le disque porte déjà cette entrée : rien à écrire, rien à refuser.
    if (sameEffectCurated(next, disk)) continue;
    if (!extracted && !next.name?.en) {
      refuse(id, `${label} : une création porte au moins un nom anglais.`);
      continue;
    }
    const errors = await deps.upsert(id, next);
    if (errors.length) {
      for (const e of errors) refuse(id, `${label} : ${e}`);
      continue;
    }
    saved.push(id);
    const name = next.name?.en ?? extracted?.name.en ?? id;
    named.push(name);
    j.done(
      Object.keys(next).length
        ? `${name} (${id}) : ${c.create ? 'effet créé' : 'entrée curée écrite'}.`
        : `${name} (${id}) : entrée curée retirée, l’extrait fait foi.`,
    );
  }

  if (!saved.length)
    return refused.length
      ? out(false, [...j.lines, 'Rien à enregistrer.'])
      : out(true, ['Rien à enregistrer : le disque porte déjà ces valeurs.']);

  const commit = deps.commitPaths(
    [EFFECTS_PATH],
    `chore(effects): ${named.length === 1 ? named[0] : `${named.length} effets`}`,
    report,
  );
  return out(commit.ok && !refused.length, [...j.lines, ...commit.log]);
}

// ---------------------------------------------------------- tables du jeu ----

/** Un fichier source, tel que la passe d'usage le lit. */
export interface UsageSource {
  /** Son chemin dans le dépôt, extension comprise (`datagen/generators/recruit.ts`). */
  path: string;
  text: string;
}

/** Un fichier qui lit une table. */
export interface TableReader {
  /** Sans extension, et sans `datagen/` en tête : `generators/recruit`. */
  name: string;
  /** Le chemin complet dans le dépôt. */
  path: string;
}

/** Qui lit une table, et à quoi elle sert d'après eux. */
export interface TableUse {
  usedBy: TableReader[];
  /** La première ligne du docblock de chaque lecteur, une par ligne. */
  note: string;
}

/**
 * Une lecture de table par son NOM écrit en dur : les trois primitives de
 * `datagen/lib/tables` (lignes, colonnes, chemin) et `loadTextIndex`, par où
 * passent les tables `Text*`. Un appel par variable n'est pas une lecture
 * repérable : il ne nomme aucune table.
 */
const TABLE_READ =
  /\b(?:loadTable|loadColumns|tablePath|loadTextIndex)\(\s*(['"`])([A-Za-z0-9_]+)\1/g;

/**
 * Les commentaires d'une source : un docblock qui CITE une lecture en exemple
 * n'en fait pas une. Le `//` d'une adresse (`https://`) n'en ouvre pas un.
 */
const COMMENTS = /\/\*[\s\S]*?\*\/|(?<![:\\])\/\/[^\n]*/g;

/** Le docblock qui ouvre un fichier (après un éventuel shebang). */
const FILE_DOCBLOCK = /^(?:#![^\n]*\n)?\s*\/\*\*([\s\S]*?)\*\//;

/**
 * La première ligne du docblock d'un fichier, sans son astérisque ; `…` quand
 * la phrase continue à la ligne suivante. Vide sans docblock en tête.
 */
function docblockLead(text: string): string {
  const body = FILE_DOCBLOCK.exec(text)?.[1];
  if (body === undefined) return '';
  const lines = body.split('\n').map((l) => l.replace(/^\s*\*?/, '').trim());
  const at = lines.findIndex(Boolean);
  if (at < 0) return '';
  const cut = Boolean(lines[at + 1]) && !/[.!?…]$/.test(lines[at]);
  return cut ? `${lines[at]}…` : lines[at];
}

/**
 * Qui lit quelle table — PURE : une passe sur des sources, rien de tenu à la
 * main. Une table se reconnaît à son nom écrit en dur dans un appel de lecture
 * (`TABLE_READ`), hors commentaires ; ses lecteurs sont rangés par chemin, et
 * sa `note` joint la première ligne du docblock de chacun, une par ligne, dans
 * le même ordre — l'utilité de la table DÉDUITE de qui s'en sert
 * (« Générateur — DOMAINE RECRUTEMENT (`recruit.json`). »). Deux lecteurs au
 * même docblock ne le disent qu'une fois.
 */
export function tableUsage(sources: UsageSource[]): Map<string, TableUse> {
  const readers = new Map<string, { reader: TableReader; lead: string }[]>();
  for (const source of [...sources].sort((a, b) => a.path.localeCompare(b.path))) {
    const code = source.text.replace(COMMENTS, '');
    const tables = new Set([...code.matchAll(TABLE_READ)].map((m) => m[2]));
    if (!tables.size) continue;
    const reader = {
      name: source.path.replace(/\.[a-z]+$/, '').replace(/^datagen\//, ''),
      path: source.path,
    };
    const lead = docblockLead(source.text);
    for (const table of tables)
      readers.set(table, [...(readers.get(table) ?? []), { reader, lead }]);
  }
  return new Map(
    [...readers].map(([table, list]) => [
      table,
      {
        usedBy: list.map((r) => r.reader),
        note: [...new Set(list.map((r) => r.lead).filter(Boolean))].join('\n'),
      },
    ]),
  );
}

/**
 * Où chercher qui lit les tables : le pipeline, la couche de données du site,
 * quick. Les tests n'en sont pas — une table lue par son seul test ne sert à
 * rien, et ceux de quick citent des lectures factices.
 */
const USAGE_ROOTS = ['datagen', 'src/lib/data', 'scripts/quick'];
const USAGE_FILE = /\.(?:ts|tsx|mjs)$/;
const USAGE_SKIP = /\.(?:test|d)\.[a-z]+$|(?:^|\/)node_modules\//;

/** Les sources des `USAGE_ROOTS`, lues du disque ; une racine absente ne donne rien. */
function readUsageSources(): UsageSource[] {
  return USAGE_ROOTS.flatMap((root) => {
    let files: string[];
    try {
      files = readdirSync(resolve(root), { recursive: true, encoding: 'utf8' });
    } catch {
      return [];
    }
    return files
      .map((file) => `${root}/${file.replaceAll('\\', '/')}`)
      .filter((path) => USAGE_FILE.test(path) && !USAGE_SKIP.test(path))
      .map((path) => ({ path, text: readFileSync(resolve(path), 'utf8') }));
  });
}

/** Les lectures de l'onglet « Tables du jeu », injectées : le catalogue et les sources. */
export interface GameTablesDisk {
  /** `listGameTables()` de l'admin : nom, octets, date — aucun contenu lu. */
  listTables: () => TableInfo[];
  /** Les fichiers où chercher qui lit les tables. */
  sources: () => UsageSource[];
}

/** Celles de la route : `.gamedata/parsed/` et les sources du dépôt. */
export const GAME_TABLES_DISK: GameTablesDisk = {
  listTables: listGameTables,
  sources: readUsageSources,
};

/** L'usage, par jeu de lectures : calculé une fois par processus (cf. `gameTablesState`). */
const usageMemo = new WeakMap<GameTablesDisk, Map<string, TableUse>>();

/**
 * L'onglet « Tables du jeu » : le catalogue de `.gamedata/parsed/` (nom, taille,
 * date d'extraction — sans lire une table) et, pour chacune, son USAGE
 * (`tableUsage`) : `usedBy`, les fichiers qui la lisent, et `note`. Les tables
 * LUES d'abord, par nombre de lecteurs décroissant puis par nom ; les autres
 * ensuite, par nom. `used` et `readers` : combien de tables sont lues, par
 * combien de fichiers. `hiddenColumns` : les colonnes de langue que le tableau
 * ne montre pas (la règle de l'admin, `HIDDEN_LANG_COLUMNS`).
 *
 * L'usage ne bouge qu'avec le code : il est calculé UNE FOIS par processus, et
 * de nouveau sur `recompute` (« Recalculer ») — jamais à chaque requête. Le
 * catalogue, lui, est relu à chaque appel : un pull le change.
 *
 * Sans table (`.gamedata/parsed/` jamais tiré) : liste vide et `error`, pas une
 * erreur de route.
 */
export function gameTablesState(disk: GameTablesDisk = GAME_TABLES_DISK, recompute = false) {
  const usage = (recompute ? undefined : usageMemo.get(disk)) ?? tableUsage(disk.sources());
  usageMemo.set(disk, usage);
  const tables = disk
    .listTables()
    .map((t) => ({ ...t, ...(usage.get(t.name) ?? { usedBy: [], note: '' }) }))
    .sort((a, b) => b.usedBy.length - a.usedBy.length || a.name.localeCompare(b.name));
  return {
    tables,
    used: tables.filter((t) => t.usedBy.length).length,
    readers: new Set(tables.flatMap((t) => t.usedBy.map((r) => r.path))).size,
    hiddenColumns: [...HIDDEN_LANG_COLUMNS],
    ...(tables.length ? {} : { error: NO_GAME_DATA }),
  };
}

/** Ce dont la lecture d'UNE table dépend, injecté : le store de l'admin, tel quel. */
export interface GameTableDeps {
  listTables: () => TableInfo[];
  queryTable: (name: string, query: TableQuery) => TablePage;
  describeTable: (name: string) => TableSchema;
  linkTargets: (columns: string[]) => Record<string, string>;
}

/** Celles de la route : `gamedata-store.ts`. */
export const GAME_TABLE_DEPS: GameTableDeps = {
  listTables: listGameTables,
  queryTable,
  describeTable,
  linkTargets,
};

/** Un refus, et le statut que la route lui donne — ceux de la route de l'admin. */
export interface GameTableRefusal {
  error: string;
  status: 400 | 404;
}

/** Un nom qui n'est pas un basename : 400 ; une table que le disque n'a pas : 404. */
function refuseTable(name: string, deps: GameTableDeps): GameTableRefusal | null {
  if (!isValidTableName(name)) return { error: 'nom de table invalide', status: 400 };
  if (!deps.listTables().some((t) => t.name === name))
    return { error: `table inconnue : ${name}`, status: 404 };
  return null;
}

/**
 * Une page d'une table brute — `queryTable` de l'admin, avec les paramètres de
 * sa route : `q` (sous-chaîne), `col`, `exact=1` (égalité stricte sur `col`),
 * `page`, `resolve=1` (les clés de texte en anglais). La recherche et la
 * pagination restent au serveur : une table monte à 18 Mo, la page n'en reçoit
 * jamais que `PAGE_SIZE` lignes.
 */
export function queryGameTable(
  name: string,
  query: Readonly<Record<string, string | undefined>>,
  deps: GameTableDeps = GAME_TABLE_DEPS,
): TablePage | GameTableRefusal {
  const refusal = refuseTable(name, deps);
  if (refusal) return refusal;
  const page = Number(query.page ?? '1');
  return deps.queryTable(name, {
    q: query.q ?? '',
    col: query.col ?? '',
    exact: query.exact === '1',
    page: Number.isFinite(page) ? page : 1,
    pageSize: PAGE_SIZE,
    resolve: query.resolve === '1',
  });
}

/** Le schéma effectif d'une table (`describeTable`) et ses liens croisés (`linkTargets`). */
export function gameTableSchema(
  name: string,
  deps: GameTableDeps = GAME_TABLE_DEPS,
): (TableSchema & { links: Record<string, string> }) | GameTableRefusal {
  const refusal = refuseTable(name, deps);
  if (refusal) return refusal;
  const schema = deps.describeTable(name);
  return { ...schema, links: deps.linkTargets(schema.columns) };
}
