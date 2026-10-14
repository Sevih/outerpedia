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
import {
  publishBanners,
  publishEvents,
  type RuntimePublishResult,
} from '@/lib/admin/runtime-publish';
import { loadEventsForAdmin, saveEvents, validateEvents } from '@/lib/admin/events-store';
import {
  EVENT_BLOCK_KINDS,
  EVENT_BLOCK_LABEL,
  EVENT_TYPE_LABEL,
  locateEventError,
  newEvent,
  newEventBlock,
  type EventIssue,
} from '@/lib/admin/event-edit';
import {
  EVENT_TYPES,
  EVENT_VIDEO_PLATFORMS,
  eventStatus,
  type EventEntry,
} from '@/lib/data/events';
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
import { catalogOptions, listItemEntries } from '@/lib/data/item-catalog';
import { rankItemMatches } from '@/lib/data/item-search';
import { isVideoPlatform, resolveVideo } from '@/lib/admin/video-add';
import { fetchMeta, searchOfficial } from '@/lib/admin/youtube';
import { characterKitCards, kitEffectCatalog, pickKitCards } from '@/lib/admin/character-kit';
import {
  GEAR_TARGETS,
  gearSheet,
  type GearClassVariantView,
  type GearPassiveView,
  type GearSheet,
  type GearTarget,
} from '@/lib/admin/gear-sheet';
import {
  monsterEncounters,
  monsterRageLabel,
  monsterRelations,
  monsterStatContexts,
  monsterStatsSheet,
  type DungeonSources,
  type MonsterStatsSheet,
} from '@/lib/admin/monster-sheet';
import {
  SPRITE_ROUTE,
  monsterBossBadgeSrc,
  monsterIconSrc,
  monsterSlotSrc,
} from '@/lib/admin/monster-icon';
import {
  RELEASE_CURATED_PATH,
  missingReleaseDates,
  type MissingRelease,
} from '@/lib/admin/release-check';
import { immunityChipEffects } from '@/lib/skill-view';
import { getGlossaries } from '@/lib/data/glossaries';
import { tagDef, tagLabel } from '@/lib/data/tags';
import {
  guideMonsterIds,
  monsterKitCards,
  monsterKitCatalog,
  monsterPlaces,
  pickMonsterKit,
  type GuideRef,
  type MonsterKitCard,
  type MonsterKitDisk,
  type MonsterKitSections,
} from '@/lib/admin/monster-kit';
import {
  gameModeGroups,
  hasOtherModes,
  modeKeysOf,
  modeLabelsOf,
  modeOptionsOf,
} from '@/lib/admin/game-modes';
import {
  applyKitCuration,
  loadKitCurationSections,
  type KitCurationPatch,
} from '@/lib/admin/monster-skill-curated-store';
import {
  committedEncounters,
  committedMonsterSkills,
  committedMonsters,
  rankOptionAdminLabels,
  siteMonsterIds,
  tooltipName,
  type EncountersData,
} from '@/lib/admin/monster-store';
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
import { resolveGameText } from '@/lib/admin/game-text';
import { gearSelectOptions, type GearOption } from '@/lib/admin/gear-options';
import { previewGearReco } from '@/lib/admin/gear-preview-actions';
import { renderInlineBatch } from '@/lib/admin/inline-preview-actions';
import { buildInlineRefs } from '@/lib/admin/inline-refs';
import { expandBuild } from '@/lib/admin/gear-preset-resolve';
import {
  bakeItemCatalogEntry,
  loadItemCurated,
  upsertItemCurated,
  type ItemCurated,
} from '@/lib/admin/item-curated-store';
import { unusedItemIcons } from '@/lib/admin/item-icons';
import { upsertGearReco } from '@/lib/admin/gear-reco-store';
import { upsertSearchAliases } from '@/lib/admin/search-alias-store';
import { upsertShortName } from '@/lib/admin/short-name-store';
import {
  addGuideVersion,
  loadGuideDraft,
  patchGuideMetaFields,
  saveGuideDraft,
  type GuideMetaPatch,
} from '@/lib/admin/guide-store';
import { categoriesWithVisibleGuide } from '@/lib/admin/guide-nav';
import { buildPinTargets, type PinTarget } from '@/lib/admin/guide-pin-targets';
import {
  GUIDES_CONTENTS_SUBDIR,
  archivePrefixes,
  hasRelevantChange,
  stampMeta,
  todayLocal,
} from '@/lib/admin/guide-stamp';
import {
  IMPACT_STARS,
  blockOfKey,
  generalGuideForm,
  generalGuideKind,
  type GeneralBlock,
  type GeneralField,
  type GeneralGuideForm,
  type GeneralGuideKind,
} from '@/lib/admin/general-guide-form';
import {
  coreFusionRoster,
  loadCoreFusion,
  loadFreeHeroes,
  loadPremiumLimited,
  normalizeReview,
  premiumLimitedRoster,
  saveCoreFusion,
  saveFreeHeroes,
  savePremiumLimited,
  type CoreFusionData,
  type CoreFusionHero,
  type FreeHeroesData,
  type PremiumLimitedData,
} from '@/lib/admin/general-guide-store';
import { FUSION_TIERS, isFusionOp, normalizeFusionReview } from '@/lib/admin/core-fusion-shape';
import {
  loadShopPriorities,
  saveShopPriorities,
  type ShopPrioritiesEditData,
  type ShopPrioritiesSaveData,
} from '@/lib/admin/shop-priorities-store';
import { PERIODS, PRIORITIES, overlayOf } from '@/lib/admin/shop-priorities-shape';
import { importContribution, type ImportResult } from '@/lib/admin/contribution-actions';
import { parseContribution } from '@/lib/contribute/contribution';
import {
  GUIDE_CATEGORIES,
  GUIDE_CATEGORY_SLUGS,
  GUIDE_TIER_KEYS,
  GUIDE_TIERS,
} from '@/lib/data/guide-categories';
import type { SectionTitle } from '@/lib/data/guide-sections';
import type { InlineRefs } from '@/lib/admin/inline-refs';
import type { VideoItem } from '@/components/ui/MultiVideoEmbed';
import { autoTranslate } from '@/lib/admin/translate-actions';
import { loadCuratedCharacters } from '@/lib/data/curated';
import { loadCuratedJson } from '@/lib/data/disk';
import { EFFECT_FAMILIES, effectFamilyLabel, type EffectSide } from '@/lib/data/effect-families';
import {
  getMergedEffect,
  getMergedEffects,
  liveEffectSources,
  mergeStatusEffects,
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
import { getEncounters, listDungeons, listGroups, type GroupChoice } from '@/lib/data/encounters';
import { guideUpdatedDate, listGuides, readGuideVersionFile, type Guide } from '@/lib/data/guides';
import { listMonsters } from '@/lib/data/monsters';
import { loadSearchAliases } from '@/lib/data/search-aliases';
import { loadShortNames } from '@/lib/data/short-names';
import {
  guideSpec,
  type CatSpec,
  type GuideDraft,
  type RawConfig,
  type VersionDraft,
} from '@/lib/admin/guide-draft';
import { img } from '@/lib/images';
import {
  DEFAULT_LANG,
  GAME_LANGS,
  LANGS,
  isValidLang,
  normalizeLang,
  type Lang,
} from '@/lib/i18n/config';
import { lRec } from '@/lib/i18n/localize';
import { getT } from '@/i18n';
import { bulletSegments, type BulletSegment } from '@/lib/changelog-bullets';
import { localePath } from '@/lib/navigation';
import { TAG_REGEX, checkText, type InlineSegment } from '@/lib/parse-text';
import { STAT_ICON, statAbbr } from '@/lib/stats';
import { transcendenceFullSteps, transcendenceLabel } from '@/lib/transcendence';
import type { EffectOption, KitEditorCard } from '@/lib/admin/character-kit';
import type { KitChip } from '@/lib/admin/monster-kit';
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
  CatalogEntry,
  CharacterCurated,
  DungeonRef,
  EffectCurated,
  GameVersion,
  GearBuild,
  GearPresets,
  LangDict,
  LocalizedText,
  Monster,
  MonsterArchiveEntry,
  ProsCons,
  Skill,
  SkillPriority,
  VideoRef,
} from '@contracts';
import type { Character } from '@datagen/extractor/specs/character';
import type { InboxItem, InboxTone } from '@/lib/admin/admin-inbox';
import { diffLabels, skillLabel, type DiffResolvers } from '@/lib/admin/diff-labels';
import { diffTree, type DiffGroup } from '@/lib/admin/diff-tree';
import type {
  DiffBuckets,
  EntityReview,
  EquipmentEntityKind,
  ReviewEntity,
  ReviewEntityStatus,
  TargetReview,
} from '@/lib/admin/review-types';
import type {
  IntegrateModeReport,
  IntegrateMonsterReport,
  IntegrateReport,
} from '@/lib/admin/review-store';
import {
  MONSTER_FILES,
  freezeCommitMessage,
  freezePlanOf,
  freezeReportOf,
  guidesToStamp,
  monsterDirtyFiles,
  nextArchive,
  pinIndex,
  writtenFiles,
  type FreezeGuide,
  type FreezeHead,
  type FreezePlan,
  type FreezeReport,
  type PinRef,
} from '@/lib/admin/monster-freeze';
import { applyRepin, planRepin, type RepinPlan, type RepinResult } from '@/lib/admin/repin-guides';
import type { VersionMonsterReport } from '@datagen/extractor/version-monster';
import type { EquipmentData } from '@datagen/generators/equipment';
import { ITEM_SPRITE_DIR, buildImageIndex, type ImageIndex } from '@datagen/assets/source';
import type { AcceptReport, MinorReport } from '@datagen/extractor/review';
import { addedFields, removedFields } from '@datagen/extractor/core/changes';
import type { StageResult } from '@datagen/assets/stage';
import { isPvpEligible, type SynergyGroup } from '@datagen/curated/character';
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
import { fileStamp, listTableNames, loadTable, tablePath, type Row } from '@datagen/lib/tables';
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

// ------------------------------------------------------------- événements ----

/** Le seul fichier que la section « Événements » écrit et committe. */
const EVENTS_PATH = 'data/curated/events.json';

/** Les lectures et les écritures de la section « Événements », injectées. */
export interface EventsDeps {
  loadEvents: () => EventEntry[];
  /** La validation de l'admin, pure : les refus, situables par `locateEventError`. */
  validateEvents: (list: EventEntry[]) => string[];
  saveEvents: (list: EventEntry[]) => Promise<string[]>;
  publishEvents: () => Promise<RuntimePublishResult>;
  commitPaths: (paths: string[], message: string, report?: Report) => Outcome;
  /** L'instant du serveur (ms) : le statut se calcule ici, pas à l'horloge du navigateur. */
  now: () => number;
}

/** Celles de la route : le store et la publication de l'admin, le vrai `commitPaths`, l'horloge. */
export const EVENTS_DEPS: EventsDeps = {
  loadEvents: loadEventsForAdmin,
  validateEvents,
  saveEvents,
  publishEvents,
  commitPaths,
  now: Date.now,
};

/** Les pages `/event/<slug>` du site, pour « ouvrir sur le site ». */
const eventsSiteBase = (): string =>
  `${process.env.DEV_SITE_BASE || DEV_SITE_BASE_DEFAULT}/${DEFAULT_LANG}/event`;

/**
 * La section « Événements » : `events.json` tel que le disque le porte (pas sa
 * copie R2), dans l'ordre du fichier, le statut de chacun à l'instant du
 * serveur (`eventStatus` : la règle du site, en UTC — `status[i]` va avec
 * `events[i]`), cet instant, et ce que la page n'a pas à recopier : les
 * libellés des familles et des genres de bloc, les genres, les plateformes, et
 * les squelettes d'un événement neuf (du jour UTC du serveur) et d'un bloc
 * neuf par genre, avec son titre.
 */
export function eventsState(deps: EventsDeps = EVENTS_DEPS) {
  const events = deps.loadEvents();
  const now = deps.now();
  const day = new Date(now).toISOString().slice(0, 10);
  return {
    events,
    status: events.map((e) => eventStatus(e, now)),
    now: new Date(now).toISOString(),
    siteBase: eventsSiteBase(),
    langs: { default: DEFAULT_LANG, shown: LANGS },
    labels: { type: EVENT_TYPE_LABEL, block: EVENT_BLOCK_LABEL },
    types: EVENT_TYPES,
    kinds: EVENT_BLOCK_KINDS,
    platforms: EVENT_VIDEO_PLATFORMS,
    skeleton: {
      event: newEvent(day),
      block: Object.fromEntries(EVENT_BLOCK_KINDS.map((k) => [k, newEventBlock(k)])),
    },
  };
}

/** JSON à clés triées : deux objets égaux le sont quel que soit l'ordre de leurs clés. */
function canonJson(v: unknown): string {
  const sort = (x: unknown): unknown =>
    Array.isArray(x)
      ? x.map(sort)
      : x && typeof x === 'object'
        ? Object.fromEntries(
            Object.entries(x as Record<string, unknown>)
              .filter(([, y]) => y !== undefined)
              .sort(([a], [b]) => a.localeCompare(b))
              .map(([k, y]) => [k, sort(y)]),
          )
        : x;
  return JSON.stringify(sort(v ?? null));
}

/** Les clés du modèle, et elles seules : la page peut porter les siennes. */
const EVENT_KEYS = [
  'slug',
  'type',
  'title',
  'summary',
  'organizer',
  'cover',
  'start',
  'end',
  'phases',
  'blocks',
  'draft',
  'revealEarly',
] as const;

const cleanEvent = (raw: unknown): EventEntry => {
  const r = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>;
  return Object.fromEntries(
    EVENT_KEYS.filter((k) => r[k] !== undefined).map((k) => [k, r[k]]),
  ) as unknown as EventEntry;
};

/** `chore(events): <slug>` quand un seul événement a bougé (ajouté, retouché, retiré), sinon leur compte. */
function eventsCommitMessage(list: EventEntry[], disk: EventEntry[]): string {
  const before = new Map(disk.map((e) => [e.slug, canonJson(e)]));
  const changed = new Set<string>();
  for (const e of list) if (before.get(e.slug) !== canonJson(e)) changed.add(e.slug);
  const kept = new Set(list.map((e) => e.slug));
  for (const e of disk) if (!kept.has(e.slug)) changed.add(e.slug);
  const slugs = [...changed];
  if (slugs.length === 1) return `chore(events): ${slugs[0]}`;
  return `chore(events): ${slugs.length ? `${slugs.length} événements` : 'mise à jour des événements'}`;
}

/**
 * Enregistre la LISTE complète des événements (le contrat de la route admin :
 * l'écran est l'éditeur, il renvoie son état) : `was` — la liste telle que la
 * page l'avait chargée — doit être ce que le disque porte encore, sinon
 * `stale` et rien n'est écrit (la page relit) ; `validateEvents` AVANT toute
 * écriture, chaque refus situé (`issues`) pour la page et dit au journal ;
 * puis `saveEvents` (le fichier, canonique), `publishEvents` (R2 et purge de
 * l'edge : le site lit R2 au runtime, l'événement paraît SANS déploiement) et
 * UN commit sur ce seul fichier, nommé d'après ce qui a bougé.
 *
 * Un échec de R2 n'est PAS un refus, la règle des Bannières : le fichier est
 * écrit et committé quand même, le résultat est en échec (`ok` faux) pour que
 * le journal se déplie sur la ligne qui le dit. `written` : le disque porte la
 * liste, la page le relit.
 */
export async function saveEventList(
  list: unknown,
  was: unknown,
  deps: EventsDeps = EVENTS_DEPS,
  report?: Report,
): Promise<Outcome & { issues: EventIssue[]; written: boolean; stale: boolean }> {
  const refuse = (log: string[], issues: EventIssue[] = [], stale = false) => ({
    ok: false,
    log,
    issues,
    written: false,
    stale,
  });
  if (!Array.isArray(list)) return refuse(['Liste d’événements attendue.']);

  const disk = deps.loadEvents();
  if (canonJson(was) !== canonJson(disk))
    return refuse(
      ['REFUSÉ — le disque a changé depuis le chargement : la page est relue, rien n’est écrit.'],
      [],
      true,
    );

  const events = list.map(cleanEvent);
  const errors = deps.validateEvents(events);
  if (errors.length)
    return refuse(
      errors.map((e) => `REFUSÉ — ${e}`),
      errors.map(locateEventError),
    );
  // Le store revalide avant d'écrire : un refus ici serait une divergence entre
  // les deux, à dire plutôt qu'à taire.
  const more = await deps.saveEvents(events);
  if (more.length)
    return refuse(
      more.map((e) => `REFUSÉ — ${e}`),
      more.map(locateEventError),
    );

  const j = journal(report);
  const n = events.length;
  j.done(`${n} événement${n > 1 ? 's écrits' : ' écrit'} dans ${EVENTS_PATH}.`);

  j.doing('publication sur R2, puis purge de l’edge');
  const pub = await deps.publishEvents();
  j.done(
    pub.ok
      ? `publié sur R2${pub.purged ? ' + edge purgé' : ` (${pub.error ?? 'edge non purgé'})`} — en ligne en ≤ 10 min, sans déploiement.`
      : `R2 NON PUBLIÉ : ${pub.error ?? 'erreur inconnue'}`,
  );

  const commit = deps.commitPaths([EVENTS_PATH], eventsCommitMessage(events, disk), report);
  return {
    ok: commit.ok && pub.ok,
    log: [
      ...j.lines,
      ...commit.log,
      // En dernier : c'est la ligne que le journal montre en rouge.
      ...(pub.ok
        ? []
        : ['R2 non publié : le site ne suivra qu’au prochain enregistrement, ou à `pnpm commit`.']),
    ],
    issues: [],
    written: true,
    stale: false,
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
 * Le site de dev de ce poste, cible des liens de quick vers le site (guides,
 * événements) : Caddy le sert sous ce nom sur les deux PC (`Caddyfile.dev`,
 * comme `QUICK_HOST` de `lan.ts`). `DEV_SITE_BASE` dans `.env.local` le remplace — un
 * `http://localhost:3000` sans Caddy.
 */
export const DEV_SITE_BASE_DEFAULT = 'https://outerpedia.local';

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

/** Les lectures du tableau de bord, injectées : l'inbox, git, le jeu, les deux listes. */
export interface DashboardDisk {
  /** `buildInbox()` (`admin-inbox.ts`) : SA liste, triée par lui, chaque item adressé à quick (`tab`). */
  inbox: () => InboxItem[] | Promise<InboxItem[]>;
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

/** Celles de la route : l'inbox telle quelle, le dépôt, le client Steam, R2. */
export const DASHBOARD_DISK: DashboardDisk = {
  // À la demande : le moteur de revue pèse, et les autres routes ne le lisent pas.
  inbox: async () => (await import('@/lib/admin/admin-inbox')).buildInbox(),
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

/** Ce que l'inbox lit — pour le tableau de bord comme pour les pastilles du menu. */
type InboxDisk = Pick<DashboardDisk, 'inbox'>;

/**
 * L'inbox telle que quick la sert : SA liste, dans son ordre, chaque item à
 * l'adresse qu'elle lui donne dans quick (`tab`, `null` quand rien ne le
 * situe — son `detail` dit alors où). L'item des tags morts d'un seul perso
 * porte en plus `sheet`, la même adresse : c'est une FICHE, que la page ouvre
 * dans un nouvel onglet. UNE lecture pour le tableau de bord et pour les
 * pastilles du menu : les deux comptent la même chose.
 */
async function quickInbox(disk: InboxDisk) {
  return (await disk.inbox()).map((item) => ({
    ...item,
    ...(item.key === 'tags' && item.tab ? { sheet: item.tab } : {}),
  }));
}

/** La gravité d'une teinte de l'inbox : la pire d'une section fait sa pastille. */
const TONE_RANK: Record<InboxTone, number> = { muted: 0, warn: 1, danger: 2 };

/** La pastille d'une section du menu : ce qu'il y a à y faire, et sa teinte. */
export interface SectionBadge {
  count: number;
  tone: InboxTone;
}

/**
 * L'inbox comptée par SECTION de quick : le premier segment de l'adresse où
 * l'item renvoie — sa fiche (`sheet`) sinon son onglet (`tab`) ; `extractor/monster`
 * compte pour `extractor`, `character/<id>/pros-cons` pour `character`. Un item
 * que rien ne situe (ni l'un ni l'autre) n'a pas de pastille. Le compte est le
 * `count` de l'item — le volume que l'inbox annonce, jamais nul chez elle ; un
 * item qui n'en dirait pas compte pour un —, la teinte la pire de la section.
 */
export function sectionBadges(
  items: readonly { tab: string | null; sheet?: string; count: number; tone: InboxTone }[],
): Record<string, SectionBadge> {
  const sections: Record<string, SectionBadge> = {};
  for (const item of items) {
    const section = (item.sheet ?? item.tab)?.split('/')[0];
    if (!section) continue;
    const count = item.count > 0 ? item.count : 1;
    const seen = sections[section];
    sections[section] = seen
      ? {
          count: seen.count + count,
          tone: TONE_RANK[item.tone] > TONE_RANK[seen.tone] ? item.tone : seen.tone,
        }
      : { count, tone: item.tone };
  }
  return sections;
}

/**
 * Le client installé contre le site (`resVersion`, comparaison numérique) :
 * `ahead` — un patch attend —, `behind`, `same`, ou `absent` sans client.
 */
function clientGap(site: string, client: string | null) {
  const gap = client === null ? 0 : client.localeCompare(site, 'en', { numeric: true });
  return client === null
    ? ('absent' as const)
    : gap > 0
      ? ('ahead' as const)
      : gap < 0
        ? ('behind' as const)
        : ('same' as const);
}

/** Ce que les pastilles lisent : l'inbox, et les deux versions du jeu. */
type BadgesDisk = InboxDisk & Pick<DashboardDisk, 'siteVersion' | 'clientVersion'>;

/**
 * Les pastilles du menu (`GET /api/badges`) : l'inbox du tableau de bord par
 * section (`sectionBadges`), plus une pastille « Patch » quand le client
 * installé est en avance sur le site (`clientGap`, le `client: 'ahead'` du
 * bloc `game`) ; `at`, l'heure de la lecture. Rien de git ni de R2, et du jeu
 * ses deux seuls fichiers de version, sans réseau : la route coûte l'inbox,
 * dont le diff est mémoïsé sur l'empreinte de ses entrées (`memoizedBuckets`,
 * `admin-inbox.ts`). Une version illisible ôte la pastille « Patch », jamais
 * la route.
 */
export async function badgesState(disk: BadgesDisk = DASHBOARD_DISK) {
  const inbox = await quickInbox(disk);
  let waiting = false;
  try {
    waiting = clientGap(disk.siteVersion(), disk.clientVersion()) === 'ahead';
  } catch {
    // Pas de pastille : le Tableau de bord, lui, dit pourquoi (`errors.game`).
  }
  const patch = waiting ? [{ tab: 'patch', count: 1, tone: 'warn' as const }] : [];
  return { sections: sectionBadges([...inbox, ...patch]), at: new Date().toISOString() };
}

/**
 * Le tableau de bord, l'accueil de quick : ce qui demande une action. Il ne
 * décide de rien — chaque bloc relit ce qu'un autre écran sait déjà :
 *
 *   - `inbox` : l'inbox (`buildInbox`, `admin-inbox.ts`), TELLE QUELLE, chaque
 *     item avec son adresse dans quick (`tab`, `null` quand rien ne le
 *     situe) ; l'item des tags morts porte en plus `sheet`, la fiche du perso,
 *     quand ils viennent tous de lui (`deadTagSheet`) ;
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

  const inbox = await block('inbox', () => quickInbox(disk));

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
    return { site, version: client, client: clientGap(site, client), proposal: hasProposal(disk) };
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
// Une vidéo s'ajoute là où elle vit : dans la Fiche d'un perso (carte Vidéos),
// dans le sous-onglet Vidéos d'un guide. Les deux pages cherchent sur la chaîne
// officielle et résolvent une URL par ces deux LECTURES ; la liste, elle, part
// avec leur « Enregistrer » (`saveCharacterSheet`, `saveGuide`).

const VIDEO_META_PATH = 'data/generated/video-meta.json';

export const searchVideos = (query: string) => searchOfficial(query);

/**
 * La vidéo d'une URL ou d'un id — rien n'est écrit. YouTube : ses métadonnées
 * lues de l'API ; Twitch et Bilibili : le `title` saisi, sans appel réseau.
 */
export const videoMeta = (input: unknown, title?: unknown) => resolveVideo(input, fetchMeta, title);

/**
 * Le cache `video-meta.json` après une écriture qui a touché des vidéos
 * (Schema.org exige `uploadDate`, jamais écrit à la main) : `true` s'il a été
 * rafraîchi — il part alors dans le commit. Un échec (YouTube injoignable) est
 * dit au journal et n'arrête rien : le curé est déjà écrit et doit être
 * committé, `pnpm datagen:video-meta` rattrapera le cache.
 */
async function refreshVideoCache(
  refresh: () => Promise<void>,
  j: ReturnType<typeof journal>,
): Promise<boolean> {
  j.doing('rafraîchissement du cache video-meta');
  try {
    await refresh();
  } catch (e: unknown) {
    j.done(
      `cache video-meta NON rafraîchi (${e instanceof Error ? e.message : String(e)}) — \`pnpm datagen:video-meta\` le rattrapera.`,
    );
    return false;
  }
  j.done('cache video-meta rafraîchi.');
  return true;
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
    | VideoRef[]
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
  /**
   * Nom COMPLET en anglais, jamais le nom nu : `characterDisplayName` recolle
   * le préfixe (« Core Fusion », ou le surnom quand le perso l'inclut — « Monad
   * Iota »). Sans lui la liste montre plusieurs « Iota » que rien ne distingue.
   */
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
/** Les dates de sortie servies au site : dérivées des notes de MAJ, le curé par-dessus. */
const RELEASE_GENERATED_PATH = 'data/generated/character-release.json';

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

/** Un champ du récap : ce qui est curé, et les persos à qui il manque. */
export interface CoverageField {
  key: string;
  label: string;
  /**
   * Où le champ se règle : un sous-onglet de la fiche (`fiche`, `pros-cons`,
   * `synergies`, `ee`, `gear`), ou le chemin d'une autre section (`names`,
   * `extractor/character`) — la page y ouvre le perso manquant.
   */
  sub: string;
  /** Ce que le libellé dit au survol, quand il ne se suffit pas. */
  hint?: string;
  done: number;
  /** Par nom. */
  missing: { id: string; name: string }[];
}

/** Le récap de la curation : le roster entier, puis une ligne par champ. */
export interface CharacterCoverage {
  total: number;
  fields: CoverageField[];
}

/**
 * Les lectures du récap de la « Fiche perso » : le roster, le curé des persos,
 * les recos de gear, les noms courts, les dates de sortie posées à la main et
 * celles du fichier généré (dérivées des notes de MAJ), le curé des EE et ceux
 * qui en ont un, ceux que le PvP admet — et `stamp`, ce qui date le tout : le
 * récap n'est recalculé que s'il bouge.
 */
export interface CharacterCoverageDisk {
  roster: () => SheetRosterRow[];
  curated: () => Record<string, CharacterCurated>;
  gearReco: () => Record<string, GearBuild[]>;
  shortNames: () => Record<string, LocalizedText>;
  releases: () => Record<string, string>;
  generatedReleases: () => Record<string, string>;
  ee: () => Record<string, EquipmentCuratedEntry>;
  eeOwners: () => ReadonlySet<string>;
  pvpEligible: () => ReadonlySet<string>;
  stamp: () => string;
}

/**
 * Celles de la route : les cinq curés du disque et les dates de sortie
 * générées. L'éligibilité au PvP est la règle du site (`isPvpEligible`, base
 * 3★), jouée sur le roster — pas une liste d'ids tenue ici. `mtimeOf`, pas
 * `fileStamp` : la page relit le récap au retour d'un enregistrement, que les
 * deux secondes de `fileStamp` lui cacheraient.
 */
export const CHARACTER_COVERAGE_DISK: CharacterCoverageDisk = {
  roster: () => characterRoster().roster,
  curated: loadCuratedCharacters,
  gearReco: loadGearReco,
  shortNames: loadShortNames,
  releases: () =>
    loadCuratedJson<{ releases?: Record<string, string> }>('curated/character-release.json', {})
      .releases ?? {},
  generatedReleases: () => readGeneratedJson('character-release.json') as Record<string, string>,
  ee: () => loadEquipmentEditorial().ee,
  eeOwners: () => new Set(getEEViews().map((e) => e.characterId)),
  pvpEligible: () => {
    const items = getCharacterListItems();
    const rarity = new Map(items.map((c) => [c.id, c.rarity]));
    return new Set(items.filter((c) => isPvpEligible(c, (id) => rarity.get(id))).map((c) => c.id));
  },
  stamp: () =>
    [
      CHARACTERS_PATH,
      GEAR_RECO_PATH,
      SHORT_NAMES_PATH,
      RELEASE_CURATED_PATH,
      RELEASE_GENERATED_PATH,
      EQUIPMENT_PATH,
    ]
      .map(mtimeOf)
      .join('|'),
};

const coverageMemo = new WeakMap<
  CharacterCoverageDisk,
  { stamp: string; coverage: CharacterCoverage }
>();

/**
 * Le récap de la curation, pour l'arrivée sur la « Fiche perso » : par champ,
 * combien de persos le portent et lesquels ne l'ont pas (par nom). Un champ
 * VIDE ne compte pas : des pros / cons sans ligne, un texte sans langue, une
 * liste sans élément. Le récap compte ce qui est DÛ : l'EE ne se compte que
 * parmi les persos qui en ont un, le Rang PvP que parmi ceux que le PvP admet
 * (`disk.pvpEligible()`) — les autres ne sont ni faits ni manquants, `done +
 * missing` y est plus court que `total`. La date de sortie ne manque qu'au
 * perso qui n'en a d'AUCUNE source : ni posée à la main (le curé), ni dans le
 * fichier généré, qui porte celles dérivées des notes de mise à jour. Gardé
 * tant qu'aucun des fichiers lus n'a bougé (`disk.stamp()`), comme
 * `monstersIndex`.
 */
export function characterCoverage(
  disk: CharacterCoverageDisk = CHARACTER_COVERAGE_DISK,
): CharacterCoverage {
  const stamp = disk.stamp();
  const kept = coverageMemo.get(disk);
  if (kept?.stamp === stamp) return kept.coverage;

  const roster = disk.roster();
  const curated = disk.curated();
  const gear = disk.gearReco();
  const short = disk.shortNames();
  const releases = disk.releases();
  const generatedReleases = disk.generatedReleases();
  const ee = disk.ee();
  const eeOwners = disk.eeOwners();
  const pvpEligible = disk.pvpEligible();
  const said = (text: LocalizedText | undefined): boolean =>
    Object.values(text ?? {}).some((v) => Boolean(v?.trim()));

  const field = (
    key: string,
    label: string,
    sub: string,
    has: (id: string) => boolean,
    among: SheetRosterRow[] = roster,
    hint?: string,
  ): CoverageField => ({
    key,
    label,
    sub,
    ...(hint ? { hint } : {}),
    done: among.filter((c) => has(c.id)).length,
    missing: among
      .filter((c) => !has(c.id))
      .map(({ id, name }) => ({ id, name }))
      .sort((a, b) => a.name.localeCompare(b.name) || a.id.localeCompare(b.id)),
  });

  const coverage: CharacterCoverage = {
    total: roster.length,
    fields: [
      field('prosCons', 'Pros / Cons', 'pros-cons', (id) => {
        const pc = curated[id]?.prosCons;
        return Boolean(pc?.pros?.length || pc?.cons?.length);
      }),
      field('synergies', 'Synergies', 'synergies', (id) => Boolean(curated[id]?.synergies?.length)),
      field('skillPriority', 'Priorité de skills', 'fiche', (id) =>
        Object.values(curated[id]?.skillPriority ?? {}).some((v) => v !== undefined),
      ),
      field('tags', 'Tags', 'fiche', (id) => Boolean(curated[id]?.tags?.length)),
      field('rank', 'Rang PvE', 'fiche', (id) => Boolean(curated[id]?.rank)),
      field(
        'rankPvp',
        'Rang PvP',
        'fiche',
        (id) => Boolean(curated[id]?.rankPvp),
        roster.filter((c) => pvpEligible.has(c.id)),
        'parmi les persos de base 3★ (règle du site : pas de rang PvP pour un 1★ ou 2★ natif)',
      ),
      field('gear', 'Gear reco', 'gear', (id) => Boolean(gear[id]?.length)),
      field(
        'ee',
        'EE',
        'ee',
        (id) => Boolean(ee[id]?.rank || ee[id]?.rank10),
        roster.filter((c) => eeOwners.has(c.id)),
      ),
      field('shortName', 'Nom court', 'names', (id) => said(short[id])),
      field(
        'release',
        'Date de sortie',
        'extractor/character',
        (id) => Boolean(releases[id] || generatedReleases[id]),
        roster,
        'curée ou dérivée des notes de MAJ',
      ),
      field('videos', 'Vidéos', 'fiche', (id) => Boolean(curated[id]?.videos?.length)),
    ],
  };
  coverageMemo.set(disk, { stamp, coverage });
  return coverage;
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
  /** Le cache `video-meta.json`, recalculé du disque : après une liste de vidéos écrite. */
  refreshVideoMeta: () => Promise<void>;
  commitPaths: (paths: string[], message: string, report?: Report) => Outcome;
}

/**
 * L'EE d'un perso pour le sous-onglet EE de la « Fiche perso » : la vue, les
 * chips AUTO, les passifs résolus et le second porteur du modèle de page.
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
  refreshVideoMeta,
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
 * menus —, les tags humains que la fiche coche, ses vidéos (la carte Vidéos les
 * édite : `curated.videos` part avec « Enregistrer »). Pour les
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
const SHEET_KEYS = ['tags', 'skillPriority', 'prosCons', 'videos', 'synergies'] as const;
type SheetKey = (typeof SHEET_KEYS)[number];

const SHEET_LABELS: Record<SheetKey, string> = {
  tags: 'tags',
  skillPriority: 'priorité de skills',
  prosCons: 'pros / cons',
  videos: 'vidéos',
  synergies: 'synergies',
};

/** Les listes de textes de la fiche : où un refus se situe, à la ligne près. */
export type SheetList = 'pros' | 'cons' | 'synergies';

/**
 * Les pros et les cons tels que la page les envoie. Une colonne est une liste
 * de textes PAR RANG ; son identité étant le rang, une ligne anglaise effacée,
 * insérée ou déplacée ne dit pas d'elle-même où sont ses traductions. `from`
 * le dit, par colonne : pour chaque ligne anglaise (les `from.length` premiers
 * textes), le rang DE L'ENVOI qui porte ses traductions — `null` pour une ligne
 * nouvelle. Les textes au-delà ne sont que des traductions à reprendre. Sans
 * `from`, chaque texte est une ligne, à son rang.
 */
export interface SentProsCons extends ProsCons {
  from?: Partial<Record<'pros' | 'cons', (number | null)[]>>;
}

const PRIORITY_KEYS = ['first', 'second', 'ultimate'] as const;

/**
 * Ce que la fiche envoie. `ranks` : des cellules, comme Rangs les envoie (rang
 * PvE, rang PvP, rôle, paliers). `curated` : les champs hors rangs, chacun
 * ENTIER et seulement s'il a bougé — une priorité vide n'y est pas, une liste
 * de tags est celle des tags humains cochés, `prosCons` porte les deux listes
 * (`SentProsCons` : avec, quand l'anglais d'une colonne a bougé, le rang
 * d'origine de chaque ligne), `videos` toutes les vidéos dans l'ordre de la
 * page et `synergies` tous les groupes. `was` : l'entrée que la page avait
 * chargée.
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
    prosCons?: SentProsCons;
    videos?: VideoRef[];
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

/**
 * Les vidéos d'un perso venues de la page, dans SON ordre, rebâties sur les
 * seules clés du modèle (`VideoRef`) : la plateforme — une de celles que le
 * site rend, gardée telle quelle — et l'id, puis le titre, l'auteur et la date
 * quand ils sont là. Un id en double est refusé — la page le refuse déjà à
 * l'ajout.
 */
function cleanSheetVideos(raw: unknown): VideoRef[] | string {
  if (!Array.isArray(raw)) return 'une liste attendue';
  const out: VideoRef[] = [];
  for (const v of raw) {
    if (!v || typeof v !== 'object' || Array.isArray(v)) return 'forme inattendue';
    const r = v as Record<string, unknown>;
    if (typeof r.platform !== 'string' || !r.platform.trim()) return 'une vidéo sans plateforme';
    if (!isVideoPlatform(r.platform)) return `« ${r.platform} » n'est pas une plateforme connue`;
    if (typeof r.id !== 'string' || !r.id.trim()) return 'une vidéo sans id';
    if (out.some((o) => o.platform === r.platform && o.id === r.id))
      return `« ${r.id} » est en double`;
    const video: VideoRef = { platform: r.platform, id: r.id };
    for (const key of ['title', 'author', 'uploadDate'] as const) {
      const text = r[key];
      if (text === undefined || text === null || text === '') continue;
      if (typeof text !== 'string') return `${r.id} · ${key} : une chaîne attendue`;
      video[key] = text;
    }
    out.push(video);
  }
  return out;
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
 * Les rangs d'origine d'une colonne (`SentProsCons.from`), contrôlés contre ses
 * `sent` textes : un rang de l'envoi, pris une seule fois, ou `null`. Absents :
 * chaque texte est une ligne, à son rang.
 */
function lineOrigins(raw: unknown, sent: number): (number | null)[] | string {
  if (raw === undefined) return Array.from({ length: sent }, (_, i) => i);
  if (!Array.isArray(raw) || raw.length > sent) return 'rangs d’origine : forme inattendue';
  const seen = new Set<number>();
  for (const n of raw as unknown[]) {
    if (n === null) continue;
    if (typeof n !== 'number' || !Number.isInteger(n) || n < 0 || n >= sent || seen.has(n))
      return `rangs d’origine : « ${String(n)} » inattendu`;
    seen.add(n);
  }
  return raw as (number | null)[];
}

/**
 * Les traductions d'un rang sous l'anglais d'une autre ligne : les langues du
 * rang, dans leur ordre — l'anglais en tête s'il n'en portait pas.
 */
function underEnglish(source: LocalizedText, en: string | undefined): LocalizedText {
  const out: LocalizedText = {};
  if (en !== undefined && !(DEFAULT_LANG in source)) out[DEFAULT_LANG] = en;
  for (const [lang, text] of Object.entries(source) as [Lang, string][])
    if (lang !== DEFAULT_LANG) out[lang] = text;
    else if (en !== undefined) out[lang] = en;
  return out;
}

/**
 * Les pros et les cons venus de la page, contrôlés ligne à ligne. Une ligne
 * sans aucun texte n'est pas écrite (elle ne compte pas non plus comme un
 * écart) ; `index` reste celui de la liste envoyée.
 *
 * Les traductions sont RÉALIGNÉES sur `from` : une ligne garde celles de son
 * rang d'origine, où qu'elle soit maintenant ; une ligne nouvelle n'a que son
 * anglais (`fresh` les compte) ; les traductions d'un rang que plus aucune
 * ligne ne reprend sont retranchées (`orphans` compte ces rangs).
 */
function cleanProsCons(
  raw: unknown,
): { value: Required<ProsCons>; issues: ListIssue[]; fresh: number; orphans: number } | string {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return 'forme inattendue';
  const origins = (raw as Record<string, unknown>).from ?? {};
  if (typeof origins !== 'object' || Array.isArray(origins))
    return 'rangs d’origine : forme inattendue';
  const value: Required<ProsCons> = { pros: [], cons: [] };
  const issues: ListIssue[] = [];
  let fresh = 0;
  let orphans = 0;
  for (const list of ['pros', 'cons'] as const) {
    const sent = (raw as Record<string, unknown>)[list] ?? [];
    if (!Array.isArray(sent)) return `${list} : une liste attendue`;
    const from = lineOrigins((origins as Record<string, unknown>)[list], sent.length);
    if (typeof from === 'string') return `${list} · ${from}`;
    const taken = new Set(from);
    const texts = sent.map((item: unknown) => cleanSheetText(item));
    texts.forEach((own, index) => {
      if (typeof own === 'string') return void issues.push({ list, index, reason: own });
      if (!taken.has(index) && Object.keys(own).some((lang) => lang !== DEFAULT_LANG)) orphans++;
      if (index >= from.length) {
        if (DEFAULT_LANG in own)
          issues.push({ list, index, reason: 'une ligne anglaise sans rang d’origine' });
        return;
      }
      const origin = from[index];
      const source = origin === null ? {} : texts[origin];
      // Un rang d'origine illisible : son refus est dit à SON rang.
      if (typeof source === 'string') return;
      const text = origin === index ? own : underEnglish(source, own[DEFAULT_LANG]);
      if (!Object.keys(text).length) return;
      if (origin === null) fresh++;
      const bad = localizedIssues(text);
      if (bad.length) issues.push({ list, index, reason: bad.join(' ; ') });
      else value[list].push(text);
    });
  }
  return { value, issues, fresh, orphans };
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
 *     (`list`, `index`), et la liste entière n'est pas écrite. Les traductions
 *     des pros et des cons sont réalignées sur le rang d'origine de chaque
 *     ligne (`SentProsCons.from`, `cleanProsCons`) : le journal dit les lignes
 *     nouvelles sans traduction et les traductions orphelines retranchées. Les
 *     vidéos (`cleanSheetVideos`) partent dans l'ordre de la page ; écrites, le cache
 *     `video-meta.json` est rafraîchi (`deps.refreshVideoMeta`) et part dans
 *     le commit ;
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
      // Ce que le réalignement a fait des traductions, comme la page l'annonçait.
      const s = (n: number): string => (n > 1 ? 's' : '');
      const shifted = [
        pc.fresh ? `${pc.fresh} ligne${s(pc.fresh)} nouvelle${s(pc.fresh)} sans traduction` : '',
        pc.orphans
          ? `${pc.orphans} traduction${s(pc.orphans)} orpheline${s(pc.orphans)} retranchée${s(pc.orphans)}`
          : '',
      ].filter(Boolean);
      said.push(
        empty
          ? `${SHEET_LABELS.prosCons} retirés`
          : `${SHEET_LABELS.prosCons} : ${pros.length} pro${s(pros.length)}, ${cons.length} con${s(cons.length)}${
              shifted.length ? ` — ${shifted.join(', ')}` : ''
            }`,
      );
    }
  }
  let videosMoved = false;
  if (keys.includes('videos')) {
    const videos = cleanSheetVideos(sent.videos);
    if (typeof videos === 'string')
      refuse({ field: 'videos', reason: videos }, `${name} · ${SHEET_LABELS.videos}`);
    else if (!sameJson(videos, current.videos ?? [])) {
      const n = videos.length;
      next = withField(next, 'videos', n ? videos : undefined);
      said.push(n ? `${SHEET_LABELS.videos} : ${n}` : `${SHEET_LABELS.videos} retirées`);
      videosMoved = true;
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
      // Le cache des métadonnées suit la liste écrite : une vidéo ajoutée y
      // entre, une vidéo retirée de partout en sort.
      if (videosMoved && (await refreshVideoCache(deps.refreshVideoMeta, j)))
        touched.add(VIDEO_META_PATH);
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

/** Le seul fichier que le sous-onglet « Gear reco » de la fiche écrit et committe. */
const GEAR_RECO_PATH = 'data/curated/gear-reco.json';

/**
 * Les langues que portent presque toutes les notes du fichier, dans l'ordre où
 * le sous-onglet les range : l'anglais se saisit, les autres (celles-ci d'abord, puis
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
 * Le sous-onglet « Gear reco » de la fiche : les presets en lecture seule, les
 * listes des sélecteurs (celles de l'admin, jointes à ce que leurs tuiles
 * montrent — `gearTileFacts`, `setTileFacts`) et, avec `id`, les builds de ce
 * perso lus du disque à l'instant. Pas de roster : la fiche fournit le perso.
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
 * L'aperçu du sous-onglet Gear reco de la fiche : les builds EN COURS d'édition, tels que
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

// --------------------------------------------------------------- monstres ----

/** Le curé du câblage des chips de skills de monstres : la SEULE écriture de l'onglet. */
const MONSTER_SKILLS_PATH = 'data/curated/monster-skills.json';

/** Un monstre, pour le picker de l'onglet « Monstres » et l'en-tête de sa fiche. */
export interface MonsterRosterRow {
  id: string;
  /** Nom en anglais. */
  name: string;
  type: string;
  /** L'adresse de son icône (`img.monster`). */
  icon: string;
  /**
   * Où on l'affronte : les titres de ses modes de jeu (`modeLabelsOf` — « Autres »
   * pour un mode qu'aucun groupe ne range), deux au plus puis « +n » ; vide : aucun spawn.
   */
  place: string;
  /**
   * Les modes de jeu de ses spawns : des clés de `modeGroups`, dans leur ordre ;
   * vide avec `otherModes` faux : aucun spawn, la pastille « sans mode ».
   */
  modes: string[];
  /** Des spawns dans un mode qu'aucun groupe ne range : la pastille « Autres » du picker. */
  otherModes: boolean;
  /** Les stages / zones de ses spawns : les deux premiers. */
  zones: string[];
  /** Les guides qui le désignent ; vide : un monstre du site, sans guide. */
  guides: GuideRef[];
}

/** Un mode de jeu du picker de Monstres : son titre, et combien de monstres du roster s'y affrontent. */
export interface MonsterModeGroup {
  key: string;
  label: string;
  count: number;
}

/**
 * Les lectures de l'onglet « Monstres » : les monstres et leurs skills COMMITTÉS
 * (`data/generated/`), le curé des chips, le catalogue des effets, les monstres
 * que les guides désignent, ceux que le site utilise (lève sans tables du jeu),
 * les donjons où lire un spawn — et `stamp`, ce qui date le tout : le roster
 * n'est recalculé que s'il bouge.
 */
export interface MonstersDisk {
  monsters: () => Record<string, Monster>;
  skills: () => Record<string, Skill>;
  sections: () => MonsterKitSections;
  catalog: () => Record<string, EffectOption>;
  guideIds: (monsters: Record<string, Monster>) => Map<string, GuideRef[]>;
  siteIds: () => Set<string>;
  dungeons: () => Record<string, DungeonRef>;
  stamp: () => string;
}

/** La lecture et les écritures de `saveMonsterKit`, injectées : le store de l'admin et git. */
export interface MonstersDeps extends MonstersDisk {
  applyKit: (patch: KitCurationPatch) => Promise<string[]>;
  commitPaths: (paths: string[], message: string, report?: Report) => Outcome;
}

/** Un JSON de `data/generated/` gardé en mémoire tant que son fichier n'a pas bougé (7 et 12 Mo). */
function stamped<T>(path: string, read: () => T): () => T {
  let kept: { stamp: string; value: T } | undefined;
  return () => {
    const stamp = fileStamp(path);
    if (kept?.stamp !== stamp) kept = { stamp, value: read() };
    return kept.value;
  };
}

/** Le dossier des guides : leurs `meta.json` et les `config.json` de leurs versions. */
const GUIDES_DIR = 'src/app/[lang]/guides/_contents';

/** La date la plus récente des fichiers où un guide désigne un monstre, et leur compte. */
function guideFilesStamp(): string {
  let latest = 0;
  let count = 0;
  const see = (path: string): void => {
    const at = statSync(path, { throwIfNoEntry: false })?.mtimeMs;
    if (at === undefined) return;
    count++;
    latest = Math.max(latest, at);
  };
  const dirs = (path: string): string[] => {
    try {
      return readdirSync(path, { withFileTypes: true })
        .filter((d) => d.isDirectory())
        .map((d) => resolve(path, d.name));
    } catch {
      return [];
    }
  };
  for (const category of dirs(resolve(GUIDES_DIR)))
    for (const guide of dirs(category)) {
      see(resolve(guide, 'meta.json'));
      for (const version of dirs(resolve(guide, 'versions'))) see(resolve(version, 'config.json'));
    }
  return `${count}:${latest}`;
}

/**
 * Celles des routes : le COMMITTÉ (ce que le site montre — quick édite donc
 * sans les tables du jeu), le store de l'admin, le vrai `commitPaths`.
 */
export const MONSTERS_DEPS: MonstersDeps = {
  monsters: stamped('data/generated/monsters.json', committedMonsters),
  skills: stamped('data/generated/monster-skills.json', committedMonsterSkills),
  sections: loadKitCurationSections,
  catalog: () => monsterKitCatalog(),
  guideIds: guideMonsterIds,
  siteIds: siteMonsterIds,
  dungeons: getEncounters,
  stamp: () =>
    [
      fileStamp('data/generated/monsters.json'),
      fileStamp('data/generated/encounters.json'),
      guideFilesStamp(),
    ].join('|'),
  applyKit: applyKitCuration,
  commitPaths,
};

/** Ce que le roster calcule une fois : ses lignes, et qui porte chaque skill. */
interface MonstersIndex {
  roster: MonsterRosterRow[];
  rows: Map<string, MonsterRosterRow>;
  counts: { guides: number; site: number };
  /** Les modes de jeu, dans l'ordre du damage calc du site (`gameModeGroups`). */
  modeGroups: MonsterModeGroup[];
  /** Sans tables du jeu, « utilisés par le site » ne se calcule pas : la raison. */
  siteError?: string;
  /** skill → les monstres qui le portent. */
  carriers: Map<string, string[]>;
}

const monstersMemo = new WeakMap<MonstersDisk, { stamp: string; index: MonstersIndex }>();

/** Ce que montre un monstre que le jeu ne nomme pas. */
const NO_NAME = '(sans nom)';

/** Combien de modes de jeu l'en-tête d'un monstre nomme, avant « +n ». */
const PLACE_MODES = 2;

/** Les modes de jeu d'un monstre, en une ligne : « Story · Skyward Tower +1 ». */
const modesPlace = (labels: string[]): string =>
  labels.slice(0, PLACE_MODES).join(' · ') +
  (labels.length > PLACE_MODES ? ` +${labels.length - PLACE_MODES}` : '');

/** Par nom, puis par id ; les monstres sans nom ferment la liste. */
const byName = (a: MonsterRosterRow, b: MonsterRosterRow): number =>
  Number(a.name === NO_NAME) - Number(b.name === NO_NAME) ||
  a.name.localeCompare(b.name) ||
  a.id.localeCompare(b.id);

/** L'index des monstres, recalculé quand `disk.stamp()` bouge. */
function monstersIndex(disk: MonstersDisk): MonstersIndex {
  const stamp = disk.stamp();
  const kept = monstersMemo.get(disk);
  if (kept?.stamp === stamp) return kept.index;

  const monsters = disk.monsters();
  const dungeons = disk.dungeons();
  const groups = gameModeGroups(dungeons, DEFAULT_LANG);
  const guides = disk.guideIds(monsters);
  const row = (m: Monster): MonsterRosterRow => {
    const { modes, zones } = monsterPlaces(m, dungeons);
    return {
      id: m.id,
      name: m.name.en || NO_NAME,
      type: m.type,
      icon: img.monster(m.icon),
      place: modesPlace(modeLabelsOf(groups, modes)),
      modes: modeKeysOf(groups, modes),
      otherModes: hasOtherModes(groups, modes),
      zones: zones.slice(0, 2),
      guides: guides.get(m.id) ?? [],
    };
  };

  let site = new Set<string>();
  let siteError = '';
  try {
    site = disk.siteIds();
  } catch (e: unknown) {
    siteError = e instanceof Error ? e.message : String(e);
  }
  const all = Object.values(monsters);
  const inGuides = all
    .filter((m) => guides.has(m.id))
    .map(row)
    .sort(byName);
  const inSite = all
    .filter((m) => !guides.has(m.id) && site.has(m.id))
    .map(row)
    .sort(byName);
  const roster = [...inGuides, ...inSite];

  const carriers = new Map<string, string[]>();
  for (const m of all)
    for (const sid of new Set(m.skills)) {
      const list = carriers.get(sid);
      if (list) list.push(m.id);
      else carriers.set(sid, [m.id]);
    }

  const index: MonstersIndex = {
    roster,
    rows: new Map(roster.map((r) => [r.id, r])),
    counts: { guides: inGuides.length, site: roster.length },
    modeGroups: groups.map(({ key, label }) => ({
      key,
      label,
      count: roster.filter((r) => r.modes.includes(key)).length,
    })),
    ...(siteError ? { siteError } : {}),
    carriers,
  };
  // Un calcul sans la liste du site n'est pas gardé : les tables peuvent arriver.
  if (!siteError) monstersMemo.set(disk, { stamp, index });
  return index;
}

/**
 * Le roster de l'onglet « Monstres » : ceux que les GUIDES désignent d'abord
 * (`guideMonsterIds`, chacun avec ses guides), puis les autres monstres que le
 * site utilise (`siteMonsterIds`) — chaque groupe par nom. `counts.site` compte
 * les deux. `modeGroups` : les modes de jeu où les ranger, dans l'ordre et sous
 * les titres du damage calc du site, chacun avec le nombre de monstres du roster
 * qui s'y affrontent (`modes` d'une ligne en porte les clés). Servi à part de
 * l'état d'un monstre, et gardé tant que ni les monstres, ni les donjons, ni
 * les guides n'ont bougé. Sans tables du jeu sur le poste, la liste du site
 * manque (`siteError`) : les monstres des guides, eux, se lisent du committé.
 */
export function monstersRoster(disk: MonstersDisk = MONSTERS_DEPS) {
  const { roster, counts, modeGroups, siteError } = monstersIndex(disk);
  return { roster, counts, modeGroups, ...(siteError ? { siteError } : {}) };
}

/** Une carte du kit telle que la page la reçoit : l'adresse de son icône, pas son sprite. */
export type MonsterSheetCard = Omit<MonsterKitCard, 'icon'> & { iconSrc?: string };

/** Combien de noms de monstres un badge « partagé » cite. */
const SHARED_NAMES = 5;

/**
 * La fiche d'un monstre, pour l'onglet « Monstres » : sa ligne (ses guides
 * compris), les cartes de son kit et leurs chips (`monsterKitCards` sur le
 * COMMITTÉ — ce que le site montre), ce que le disque en cure, restreint à ce
 * kit (`disk` : `chipOwner`, `chipHide`, `chipAdd` — renvoyé tel quel à
 * l'enregistrement, c'est son `was`), le catalogue des effets, où mènent les
 * liens de guide (`guideBase`), et `shared` : par
 * skill que d'AUTRES monstres portent aussi, leur nombre (lui compris) et
 * jusqu'à cinq de leurs noms — masquer ou ajouter sur un tel skill vaut pour
 * tous. Lu du disque à chaque appel. `error` : le monstre n'est pas du committé.
 */
export function monsterSheetState(id: string, disk: MonstersDisk = MONSTERS_DEPS) {
  const monsters = disk.monsters();
  const m = monsters[id];
  if (!m) return { error: `monstre inconnu : ${id}` };
  const index = monstersIndex(disk);
  const { cards, chips } = monsterKitCards(m, disk.skills(), disk.sections());
  const shared: Record<string, { count: number; names: string[] }> = {};
  for (const card of cards) {
    const ids = index.carriers.get(card.id) ?? [];
    if (ids.length < 2) continue;
    const names = [...new Set(ids.map((mid) => monsters[mid]?.name.en || mid))];
    shared[card.id] = { count: ids.length, names: names.slice(0, SHARED_NAMES) };
  }
  return {
    monster: index.rows.get(id) ?? {
      id,
      name: m.name.en || NO_NAME,
      type: m.type,
      icon: img.monster(m.icon),
      place: '',
      modes: [],
      otherModes: false,
      zones: [],
      guides: [],
    },
    kit: {
      cards: cards.map(({ icon, ...card }): MonsterSheetCard => ({
        ...card,
        ...(icon ? { iconSrc: img.skill(icon) } : {}),
      })),
      chips,
    },
    disk: pickMonsterKit(
      disk.sections(),
      cards.map((c) => c.id),
    ),
    catalog: disk.catalog(),
    shared,
    guideBase: `${process.env.DEV_SITE_BASE || DEV_SITE_BASE_DEFAULT}/${DEFAULT_LANG}/guides`,
  };
}

/**
 * Ce que l'onglet envoie : par buff déplacé, sa carte (`null` : par défaut) ;
 * par carte modifiée, la liste ENTIÈRE de ses buffs masqués et celle de ses
 * effets ajoutés.
 */
export interface MonsterKitChanges {
  chipOwner?: Record<string, string | null>;
  chipHide?: Record<string, string[]>;
  chipAdd?: Record<string, string[]>;
}

/** Un refus situé à sa carte ; sans carte, il vaut pour l'envoi entier. */
export interface MonsterKitRefusal {
  card?: string;
  reason: string;
}

/**
 * Ce que rend `saveMonsterKit`. `written` : le store a écrit, la page relit le
 * disque. `stale` : refusé parce que le disque ne portait plus, pour ce kit, ce
 * que la page avait chargé — rien n'a été écrit, la page rend le disque.
 */
export interface MonsterKitOutcome extends Outcome {
  written: boolean;
  stale: boolean;
  refused: MonsterKitRefusal[];
}

/** Une section par clé triée : deux lectures du même état se comparent. */
const sortedKeys = (rec: Record<string, unknown> | undefined): Record<string, unknown> =>
  Object.fromEntries(Object.entries(rec ?? {}).sort(([a], [b]) => a.localeCompare(b)));

const sameKitDisk = (a: Partial<MonsterKitDisk> | undefined, b: MonsterKitDisk): boolean =>
  (['chipOwner', 'chipHide', 'chipAdd'] as const).every((section) =>
    sameJson(sortedKeys(a?.[section]), sortedKeys(b[section])),
  );

const isRecord = (v: unknown): v is Record<string, unknown> =>
  Boolean(v) && typeof v === 'object' && !Array.isArray(v);

/**
 * Le câblage venu de la page, contrôlé contre le kit que le SERVEUR calcule,
 * le disque et le catalogue — le contrôle de `planKit`, plus `chipOwner` :
 *   - un buff déplacé est une chip de ce kit, sa cible une carte du kit ou
 *     `null` (par défaut) ;
 *   - une carte de `chipHide` ou de `chipAdd` est un skill du kit ; une ref
 *     masquée NOUVELLE est une chip que cette carte montre (par défaut, par le
 *     disque ou par un déplacement de cet envoi), un effet ajouté NOUVEAU est du
 *     catalogue ; une ref HÉRITÉE du fichier, elle, reste.
 * Ce que le disque porte déjà n'est pas un changement ; une carte en écart
 * n'est pas écrite du tout. `patch` : ce qui bouge ; `said` : le journal.
 */
function planMonsterKit(
  raw: unknown,
  cards: readonly MonsterKitCard[],
  chips: readonly KitChip[],
  disk: MonsterKitDisk,
  catalog: Record<string, EffectOption>,
): { patch: Required<MonsterKitChanges>; said: string[]; issues: MonsterKitRefusal[] } | string {
  if (!isRecord(raw)) return 'forme inattendue';
  const patch: Required<MonsterKitChanges> = { chipOwner: {}, chipHide: {}, chipAdd: {} };
  const issues: MonsterKitRefusal[] = [];
  const cardOf = (id: string) => cards.find((c) => c.id === id);
  const label = (id: string): string => cardOf(id)?.name || id;

  const owners = raw.chipOwner ?? {};
  if (!isRecord(owners)) return 'chipOwner : forme inattendue';
  for (const [buff, target] of Object.entries(owners)) {
    const chip = chips.find((c) => c.buff === buff);
    if (!chip) {
      issues.push({ reason: `« ${buff} » : pas une chip de ce kit` });
      continue;
    }
    // Le refus se lit là où la chip est montrée : sa carte du disque.
    const at = chip.owner ?? chip.defaultCards[0];
    if (target !== null && (typeof target !== 'string' || !cardOf(target))) {
      issues.push({
        card: at,
        reason: `« ${chip.name} » : « ${String(target)} » n’est pas une carte de ce kit`,
      });
      continue;
    }
    if (target !== (disk.chipOwner[buff] ?? null)) patch.chipOwner[buff] = target;
  }

  /** Les cartes où une chip peut se montrer : sa place du disque, et celle de cet envoi. */
  const shownOn = (chip: KitChip): string[] => {
    const moved = patch.chipOwner[chip.buff];
    return [...chip.defaultCards, ...(chip.owner ? [chip.owner] : []), ...(moved ? [moved] : [])];
  };
  for (const section of KIT_SECTIONS) {
    const sent = raw[section] ?? {};
    if (!isRecord(sent)) return `${section} : forme inattendue`;
    for (const [cid, list] of Object.entries(sent)) {
      if (!cardOf(cid)) {
        issues.push({ card: cid, reason: 'pas une carte de ce monstre' });
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
        section === 'chipHide'
          ? chips.some((c) => c.buff === ref && shownOn(c).includes(cid))
          : ref in catalog;
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

  const said = [
    ...Object.entries(patch.chipOwner).map(([buff, target]) => {
      const name = chips.find((c) => c.buff === buff)?.name ?? buff;
      return target
        ? `« ${name} » : déplacée sur « ${label(target)} »`
        : `« ${name} » : remise à sa place par défaut`;
    }),
    ...cards
      .filter((c) => KIT_SECTIONS.some((section) => c.id in patch[section]))
      .map((c) => {
        const n = (section: 'chipHide' | 'chipAdd'): number =>
          (patch[section][c.id] ?? disk[section][c.id] ?? []).length;
        const [hidden, added] = [n('chipHide'), n('chipAdd')];
        return `chips de « ${c.name || c.id} » : ${hidden} masquée${hidden > 1 ? 's' : ''}, ${added} ajoutée${added > 1 ? 's' : ''}`;
      }),
  ];
  return { patch, said, issues };
}

/**
 * Enregistre le câblage des chips d'UN monstre, en un geste et un commit.
 *
 * Dans l'ordre :
 *   - `was` — les trois sections du curé restreintes au kit, telles que la page
 *     les avait chargées (`disk` de `monsterSheetState`) — doit être ce que le
 *     disque porte encore : sinon tout est refusé `stale`, SANS écriture
 *     (l'admin ou l'autre poste a écrit entre-temps, et un skill est souvent
 *     partagé : un autre monstre a pu le régler) ;
 *   - l'envoi est contrôlé par `planMonsterKit` contre le kit que le serveur
 *     calcule pour CE monstre : un écart est un refus situé à sa carte, qui
 *     n'empêche pas les autres ;
 *   - ce qui bouge part au store de l'admin (`applyKitCuration`, la seule
 *     écriture du curé) avec `kitSkillIds` COMPLET — c'est lui qui préserve les
 *     porteurs des kits jumeaux ; ses refus sont situés à leur carte ;
 *   - puis UN commit du fichier curé, au nom du monstre.
 *
 * Rien d'écrit : rien de committé.
 */
export async function saveMonsterKit(
  id: string,
  changes: unknown,
  was: Partial<MonsterKitDisk> | undefined,
  deps: MonstersDeps,
  report?: Report,
): Promise<MonsterKitOutcome> {
  const refused: MonsterKitRefusal[] = [];
  const out = (
    ok: boolean,
    lines: string[],
    more: { written?: boolean; stale?: boolean } = {},
  ): MonsterKitOutcome => ({
    ok,
    log: lines,
    written: more.written ?? false,
    stale: more.stale ?? false,
    refused,
  });

  const monsters = deps.monsters();
  const m = monsters[id];
  if (!m) return out(false, [`monstre inconnu : ${id}.`]);
  const name = m.name.en || id;

  const j = journal(report);
  const sections = deps.sections();
  const { cards, chips } = monsterKitCards(m, deps.skills(), sections);
  const kitSkillIds = cards.map((c) => c.id);
  const disk = pickMonsterKit(sections, kitSkillIds);
  const refuse = (r: MonsterKitRefusal): void => {
    refused.push(r);
    const card = r.card ? ` de « ${cards.find((c) => c.id === r.card)?.name || r.card} »` : '';
    j.done(`REFUSÉ — ${name} · chips${card} : ${r.reason}.`);
  };

  if (!sameKitDisk(was, disk)) {
    refuse({ reason: 'le disque a changé depuis le chargement' });
    return out(false, [...j.lines, 'Rien à enregistrer.'], { stale: true });
  }

  const plan = planMonsterKit(changes, cards, chips, disk, deps.catalog());
  if (typeof plan === 'string') {
    refuse({ reason: plan });
    return out(false, [...j.lines, 'Rien à enregistrer.']);
  }
  for (const issue of plan.issues) refuse(issue);
  if (!plan.said.length)
    return refused.length
      ? out(false, [...j.lines, 'Rien à enregistrer.'])
      : out(true, ['Rien à enregistrer : le disque porte déjà ces valeurs.']);

  j.doing('écriture du câblage des chips');
  const errors = await deps.applyKit({ kitSkillIds, ...plan.patch });
  if (errors.length) {
    // Le store nomme la carte, ou le buff, en tête de son refus : `chipHide[<id>] : …`.
    for (const e of errors) {
      const [, section, key, reason] = /^(chip(?:Hide|Add|Owner))\[(.+?)\] : (.*)$/.exec(e) ?? [];
      const chip = section === 'chipOwner' ? chips.find((c) => c.buff === key) : undefined;
      const card = chip ? (chip.owner ?? chip.defaultCards[0]) : key;
      refuse({ ...(card ? { card } : {}), reason: reason ?? e });
    }
    return out(false, [...j.lines, 'Rien à enregistrer.']);
  }
  for (const line of plan.said) j.done(line);

  const commit = deps.commitPaths(
    [MONSTER_SKILLS_PATH],
    `chore(monsters): ${name} (${id})`,
    report,
  );
  return out(commit.ok && !refused.length, [...j.lines, ...commit.log], { written: true });
}

// ------------------------------------------------------------------ items ----

/** Le curé des items, et le catalogue servi que chaque enregistrement rebake. */
const ITEMS_CURATED_PATH = 'data/curated/items.json';
const ITEMS_CATALOG_PATH = 'data/generated/items.json';

/** D'où viennent les icônes d'item, sous la base des images (`img.item`). */
const ITEM_SPRITE = 'images/items';

/** Les tables que le rebake d'une entrée relit (`buildItemCatalog`). */
const ITEM_BAKE_TABLES: readonly string[] = ['ItemTemplet', 'TextSystem'];

/** Le refus de `saveItems` sur un poste sans ces tables, et le mot de la savebar. */
export const NO_ITEM_BAKE =
  'tables du jeu absentes : le rebake de items.json échouerait après l’écriture du curé';

/**
 * Les lectures de l'onglet « Items ». Le catalogue est relu DU DISQUE à chaque
 * appel : `getCatalog` importe `items.json` statiquement, et dans le processus
 * long de quick il ne bougerait plus après un rebake (ni après une promotion).
 */
export interface ItemsDisk {
  catalog: () => Record<string, CatalogEntry>;
  curated: () => Record<string, ItemCurated>;
  /** Les sprites `TI_*` extraits que rien ne porte ; vide sans images du jeu. */
  unusedIcons: (
    catalog: Record<string, CatalogEntry>,
    curated: Record<string, ItemCurated>,
  ) => string[];
  /** Le dossier des sprites d'items extraits existe sur ce poste. */
  hasSprites: () => boolean;
  /** Les tables parsées du poste, par leur nom. */
  tables: () => string[];
}

/** Celles de la route : les fichiers du dépôt, les images et les tables du jeu. */
export const ITEMS_DISK: ItemsDisk = {
  catalog: () =>
    JSON.parse(readFileSync(resolve(ITEMS_CATALOG_PATH), 'utf8')) as Record<string, CatalogEntry>,
  curated: loadItemCurated,
  unusedIcons: unusedItemIcons,
  hasSprites: () => existsSync(ITEM_SPRITE_DIR),
  tables: listTableNames,
};

/** Un item du catalogue : sa ligne, et ce que sa fiche édite. */
export interface ItemRow {
  id: string;
  /** Nom anglais EFFECTIF (le curé prime) : la ligne, le commit. '' sans nom. */
  name: string;
  type: string;
  kind: CatalogEntry['kind'];
  grade: string;
  star: number;
  /** Icône effective, sous `images/items`. */
  icon: string;
  /** Une description anglaise, curation comprise. */
  hasDesc: boolean;
  hidden: boolean;
  /** Une entrée curée existe. */
  overridden: boolean;
  /**
   * L'entrée du catalogue servi — le placeholder de la fiche, comme `itemBase`
   * dans l'admin : curé DÉJÀ baké compris. `null` : une création que le
   * catalogue ne porte pas encore.
   */
  base: { name: LangDict; desc?: LangDict; icon: string } | null;
  /** L'entrée du disque, telle quelle ; `{}` sans curation. */
  curated: ItemCurated;
}

const canBakeItems = (disk: ItemsDisk): boolean => {
  const tables = new Set(disk.tables());
  return ITEM_BAKE_TABLES.every((t) => tables.has(t));
};

/** Les lignes du catalogue : l'overlay de l'admin (`listItemEntries`), sur le disque. */
function itemRows(
  catalog: Record<string, CatalogEntry>,
  curated: Record<string, ItemCurated>,
): ItemRow[] {
  return listItemEntries(catalog, curated).map((e) => {
    const base = catalog[e.id];
    return {
      id: e.id,
      name: e.name.en ?? '',
      type: e.type,
      kind: e.kind,
      grade: e.grade,
      star: e.star,
      icon: e.icon,
      hasDesc: Boolean(e.desc?.en),
      hidden: Boolean(e.hidden),
      overridden: e.curated,
      base: base ? { name: base.name, desc: base.desc, icon: base.icon } : null,
      curated: curated[e.id] ?? {},
    };
  });
}

/**
 * L'onglet « Items » : le catalogue servi (`data/generated/items.json`, relu du
 * disque) sous l'overlay du curé — la liste de l'éditeur « Item » de l'admin —,
 * chaque item avec ce que sa fiche édite. Et ce que la page ne doit pas
 * recopier : les sprites extraits que rien ne porte (`unused` ; sans images du
 * jeu sur le poste, `hasSprites` le dit et la liste est vide), les comptes de
 * l'en-tête de l'admin, les types présents, les langues du jeu, le dossier des
 * icônes, et `canBake` — les tables que le rebake relit sont là ; sans elles
 * rien ne s'enregistre d'ici (`saveItems`).
 */
export function itemsState(disk: ItemsDisk = ITEMS_DISK) {
  const catalog = disk.catalog();
  const curated = disk.curated();
  const items = itemRows(catalog, curated);
  const unused = disk.unusedIcons(catalog, curated);
  const currencies = items.filter((e) => e.type === 'goods').length;
  return {
    items,
    unused,
    hasSprites: disk.hasSprites(),
    counts: {
      items: items.length - currencies,
      currencies,
      noDesc: items.filter((e) => !e.hasDesc).length,
      unused: unused.length,
      curated: items.filter((e) => e.overridden).length,
    },
    types: [...new Set(items.map((e) => e.type))].sort(),
    langs: GAME_LANGS,
    sprite: ITEM_SPRITE,
    canBake: canBakeItems(disk),
    noBake: NO_ITEM_BAKE,
  };
}

/**
 * La recherche de l'onglet : la règle d'Effets (`effectMatches` — chaque mot de
 * la saisie COMMENCE un mot du champ), sur l'id et le nom anglais effectif, et
 * sur le nom des sprites à intégrer. Par item qui répond, le champ qui a
 * répondu. `matches` à `null` : saisie vide, tout le catalogue reste. Un id
 * est lu TEL QUEL : `Hero%20Piece` n'est ni décodé ni ré-encodé.
 */
export function itemsSearch(
  query: unknown,
  disk: ItemsDisk = ITEMS_DISK,
): { q: string; matches: Record<string, EffectMatch> | null } {
  const q = typeof query === 'string' ? query : '';
  if (!q.trim()) return { q, matches: null };
  const catalog = disk.catalog();
  const curated = disk.curated();
  const matches: Record<string, EffectMatch> = {};
  const seek = (id: string, en: string): void => {
    const hit = effectMatches(effectHaystack({ id, keys: [], name: en ? { en } : {} }), q);
    if (hit) matches[id] = hit;
  };
  for (const e of listItemEntries(catalog, curated)) seek(e.id, e.name.en ?? '');
  for (const sprite of disk.unusedIcons(catalog, curated)) seek(sprite, '');
  return { q, matches };
}

/**
 * « clé… » : le texte du jeu sous une clé (`resolveGameText` de l'admin —
 * `TextSystem`, `TextItem`…), dans les langues du jeu ; `null` si aucune table
 * ne la porte. Une lecture.
 */
export function resolveText(
  key: unknown,
  resolveKey: (key: string) => LangDict | null = resolveGameText,
): { key: string; text: LangDict | null } {
  const k = trimmed(key);
  return { key: k, text: k ? resolveKey(k) : null };
}

/** Un texte par langue du JEU, blancs retirés ; rien si aucune n'est remplie. */
function cleanGameText(raw: unknown): LangDict | undefined {
  if (!raw || typeof raw !== 'object') return undefined;
  const out: Record<string, string> = {};
  for (const l of GAME_LANGS) {
    const text = trimmed((raw as Record<string, unknown>)[l]);
    if (text) out[l] = text;
  }
  // Partiel, comme l'éditeur de l'admin l'écrit (`compact`) : l'overlay et le
  // bake prennent le dict tel quel, une langue absente y manque.
  return Object.keys(out).length ? (out as LangDict) : undefined;
}

/**
 * Une entrée curée venue de la page, ramenée à ce que l'éditeur de l'admin
 * compose (`compact` et `build` d'`ItemCuratedEditor`) : les champs connus,
 * dans un ordre fixe, langues vides retirées, `icon` et `note` sans blancs
 * autour, `hidden` seulement s'il est vrai. Le store ne compacte pas : c'est
 * ici que l'entrée vide devient `{}` — la suppression.
 */
function cleanItemCurated(raw: unknown): ItemCurated {
  const r = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>;
  const c: ItemCurated = {};
  const name = cleanGameText(r.name);
  const desc = cleanGameText(r.desc);
  if (name) c.name = name;
  if (desc) c.desc = desc;
  if (trimmed(r.icon)) c.icon = trimmed(r.icon);
  if (r.hidden === true) c.hidden = true;
  if (trimmed(r.note)) c.note = trimmed(r.note);
  return c;
}

const sameItemCurated = (a: unknown, b: unknown): boolean =>
  JSON.stringify(cleanItemCurated(a)) === JSON.stringify(cleanItemCurated(b));

/** L'id d'une création : ni blanc, ni `%`, ni `/` — il part tel quel dans une adresse d'image. */
const ITEM_NEW_ID = /^[^\s%/]+$/;

/** Un item de l'onglet : ce qu'il doit porter, et ce que la page avait chargé. */
export interface ItemChange {
  id: string;
  curated: ItemCurated;
  was: ItemCurated;
  /** « ＋ item » : l'id est NOUVEAU — refusé s'il existe déjà. */
  create?: boolean;
}

/** La lecture et les écritures de `saveItems`, injectées : le store, le bake et git. */
export interface ItemsDeps extends ItemsDisk {
  upsert: (id: string, curated: ItemCurated) => Promise<string[]>;
  bake: (id: string) => Promise<void>;
  commitPaths: (paths: string[], message: string, report?: Report) => Outcome;
}

/** Celles de la route : le store de l'admin, son rebake, le vrai `commitPaths`. */
export const ITEMS_DEPS: ItemsDeps = {
  ...ITEMS_DISK,
  upsert: upsertItemCurated,
  bake: bakeItemCatalogEntry,
  commitPaths,
};

/** Ce que rend `saveItems` : la forme de `saveEffects` (cf. `EffectsOutcome`). */
export type ItemsOutcome = EffectsOutcome;

/**
 * Enregistre un lot d'items : pour chacun, le disque doit encore porter
 * l'entrée curée que la page avait chargée (`was`), puis `upsertItemCurated` —
 * le store de l'admin, ses refus de schéma rendus tels quels —, puis
 * `bakeItemCatalogEntry`, qui refait SON entrée du catalogue servi ; enfin UN
 * commit des DEUX fichiers : `chore(items): <nom anglais>`, « N items » pour
 * un lot.
 *
 * SANS TABLES DU JEU, RIEN NE S'ÉCRIT. Le rebake recalcule l'entrée depuis
 * `ItemTemplet` et `TextSystem` et lève sans elles : la route de l'admin
 * écrivait d'abord le curé, puis répondait « curé enregistré, mais rebake
 * échoué » — un état à moitié fait, le curé en avance sur le catalogue. Le lot
 * est donc refusé AVANT toute écriture sur un poste qui ne les a pas.
 *
 * Une CRÉATION (`create`) passe par la même porte avec un id nouveau : sans
 * blanc, ni `%`, ni `/`, absent du catalogue ET du curé. Un item que le
 * catalogue ne porte pas n'existe que par son entrée : elle garde un nom
 * anglais (la règle de l'éditeur de l'admin). Un id existant n'est jamais
 * décodé ni ré-encodé — `Hero%20Piece` est écrit ainsi dans les deux fichiers.
 *
 * Une entrée vide retire la clé (le store) — et, pour une création que le
 * catalogue portait, le rebake la retire AUSSI du catalogue : c'est ce que
 * fait l'admin, le journal le dit. Un item refusé n'arrête pas le lot. Si le
 * rebake d'un item lève malgré tout, son curé EST écrit : il est refusé avec
 * cette raison, et le commit part quand même, pour ne pas laisser le fichier
 * modifié derrière lui.
 */
export async function saveItems(
  changes: ItemChange[],
  deps: ItemsDeps,
  report?: Report,
): Promise<ItemsOutcome> {
  const refused: string[] = [];
  const stale: string[] = [];
  const saved: string[] = [];
  const reasons: Record<string, string> = {};
  const out = (ok: boolean, lines: string[]): ItemsOutcome => ({
    ok,
    log: lines,
    refused,
    stale,
    saved,
    reasons,
  });
  if (!Array.isArray(changes) || !changes.length)
    return out(false, ['Aucune modification à enregistrer.']);
  if (!canBakeItems(deps)) return out(false, [`Rien n’est écrit — ${NO_ITEM_BAKE}.`]);

  const j = journal(report);
  // Ceux dont le curé est sur le disque, rebake réussi ou non : le commit.
  const named: string[] = [];
  const refuse = (id: string, why: string): void => {
    if (!refused.includes(id)) refused.push(id);
    reasons[id] ??= why;
    j.done(`REFUSÉ — ${why}`);
  };

  for (const c of changes) {
    const id = String(c?.id ?? '');
    // Le disque, relu pour CET item : une entrée posée d'ailleurs (l'admin,
    // l'autre poste) depuis le chargement de la page ne doit pas être écrasée.
    const base = deps.catalog()[id];
    const disk = deps.curated()[id];
    if (c?.create) {
      // D'abord « existe déjà » : `Hero%20Piece` est un id du catalogue, pas
      // un id mal formé.
      if (base || disk) {
        refuse(id, `${id} existe déjà : l’ouvrir pour l’éditer, pas le créer.`);
        continue;
      }
      if (!ITEM_NEW_ID.test(id)) {
        refuse(id, `id de création invalide : « ${id} » (ni espace, ni %, ni /).`);
        continue;
      }
    } else if (!base && !disk) {
      refuse(id, `item inconnu : ${id}.`);
      continue;
    }
    const label = `${disk?.name?.en ?? base?.name.en ?? id} (${id})`;
    if (!sameItemCurated(disk, c.was)) {
      stale.push(id);
      refuse(id, `${label} : le disque a changé depuis le chargement.`);
      continue;
    }

    const next = cleanItemCurated(c.curated);
    // Le disque porte déjà cette entrée : rien à écrire, rien à refuser.
    if (sameItemCurated(next, disk)) continue;
    if (!base && !next.name?.en) {
      refuse(id, `${label} : une création porte au moins un nom anglais.`);
      continue;
    }
    const errors = await deps.upsert(id, next);
    if (errors.length) {
      for (const e of errors) refuse(id, `${label} : ${e}`);
      continue;
    }
    const name = next.name?.en ?? base?.name.en ?? id;
    named.push(name);
    j.doing(`${name} (${id}) : rebake de son entrée de items.json`);
    try {
      await deps.bake(id);
    } catch (e: unknown) {
      const why = e instanceof Error ? e.message : String(e);
      refuse(id, `${name} (${id}) : curé enregistré, mais rebake de items.json échoué : ${why}`);
      continue;
    }
    saved.push(id);
    const empty = !Object.keys(next).length;
    j.done(
      empty
        ? base?.kind === 'custom'
          ? `${name} (${id}) : entrée curée retirée — une création, elle sort du catalogue.`
          : `${name} (${id}) : entrée curée retirée, le jeu fait foi.`
        : `${name} (${id}) : ${c.create ? 'item créé' : 'entrée curée écrite'}, catalogue rebaké.`,
    );
  }

  if (!named.length)
    return refused.length
      ? out(false, [...j.lines, 'Rien à enregistrer.'])
      : out(true, ['Rien à enregistrer : le disque porte déjà ces valeurs.']);

  const commit = deps.commitPaths(
    [ITEMS_CURATED_PATH, ITEMS_CATALOG_PATH],
    `chore(items): ${named.length === 1 ? named[0] : `${named.length} items`}`,
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

// ----------------------------------------------------------------- guides ----

/** Le dossier des guides, relatif au dépôt, et le dossier d'UN guide. */
const guideDirOf = (category: string, slug: string): string =>
  `${GUIDES_CONTENTS_SUBDIR}/${category}/${slug}`;

/**
 * Les fichiers d'un dossier qui diffèrent de `HEAD` — modifiés, nouveaux
 * (non suivis) ou supprimés —, chemins POSIX relatifs au dépôt. C'est ce qu'un
 * enregistrement de guide committe, et ce sur quoi la règle de datation joue :
 * `git status` du dossier, comme `scripts/stamp-guides.ts` le lit du dépôt
 * entier. Les renommages sortent en deux chemins (cf. le script).
 */
function gitDirtyFiles(dir: string, cwd?: string): string[] {
  const r = git(['status', '--porcelain', '-z', '--untracked-files=all', '--', dir], cwd);
  if (!r.ok) return [];
  const files: string[] = [];
  const recs = r.out.split('\0');
  for (let i = 0; i < recs.length; i++) {
    const rec = recs[i];
    if (rec.length < 4) continue;
    files.push(rec.slice(3).replace(/\\/g, '/'));
    if (/[RC]/.test(rec.slice(0, 2))) {
      const orig = recs[++i];
      if (orig) files.push(orig.replace(/\\/g, '/'));
    }
  }
  return files;
}

/** Une ligne de la vue d'ensemble : un guide, ce qu'on en lit sans l'ouvrir. */
export interface GuideOverviewRow {
  slug: string;
  /** Titre anglais. */
  title: string;
  /** `meta.updated`, ou dérivée de la version la plus récente. */
  updated: string;
  versions: number;
  /** La version la plus récente (`YYYY-MM`), pour un guide versionné. */
  newest?: string;
  hidden: boolean;
  /** Le boss ou le combat, en clair ; vide quand le guide n'en désigne pas. */
  battle: string;
  /**
   * Éditable dans quick : sa catégorie est de `GUIDE_SPECS`, ou c'est l'un des
   * guides généraux à fragment éditable (`GENERAL_GUIDE_KINDS`) ; sinon son
   * contenu est en code (`index.tsx`).
   */
  editable: boolean;
  /** Son palier (`meta.tier`, les guides généraux) : la page les range sous lui. */
  tier?: string;
}

/** Une catégorie de la vue d'ensemble, ses guides triés comme sur le site. */
export interface GuideOverviewCategory {
  slug: string;
  /** Libellé anglais de la catégorie. */
  label: string;
  /** Au moins un guide éditable dans quick (`GUIDE_SPECS`, ou un général à fragment éditable). */
  editable: boolean;
  versioned: boolean;
  /** Guides cachés de la catégorie, montrés ou non. */
  hidden: number;
  guides: GuideOverviewRow[];
}

/** Les textes éditables de `meta.json` : le titre, la description, `hidden`. */
export interface GuideMetaState {
  title: LocalizedText & { en: string };
  description: LocalizedText & { en: string };
  hidden: boolean;
}

/** Les lectures de la section « Guides » : le scan, les stores, les listes des pickers. */
export interface GuidesDisk {
  guides: () => Guide[];
  draft: (category: string, slug: string) => GuideDraft;
  /** Le `config.json` d'une version — son combat, pour la vue d'ensemble. */
  config: (guide: Guide, version: string) => RawConfig | undefined;
  groups: (modes?: readonly string[]) => GroupChoice[];
  dungeons: () => { id: string; label: string }[];
  monsters: () => { id: string; label: string }[];
  roster: () => SheetRosterRow[];
  refs: () => InlineRefs;
  pins: (draft: GuideDraft) => Promise<PinTarget[]>;
}

/** Les écritures de `saveGuide` et d'« ＋ version », injectées : les stores, le stamp, git. */
export interface GuidesDeps extends GuidesDisk {
  saveDraft: (category: string, slug: string, draft: GuideDraft) => Promise<string[]>;
  patchMeta: (category: string, slug: string, patch: GuideMetaPatch) => Promise<boolean>;
  addVersion: (
    category: string,
    slug: string,
    newKey: string,
    fromKey: string,
  ) => Promise<string[]>;
  /** Les fichiers de `dir` (relatif au dépôt) qui diffèrent de `HEAD`. */
  dirty: (dir: string) => string[];
  /** Re-date un `meta.json` ; `false` s'il portait déjà cette date. */
  stamp: (metaPath: string, date: string) => Promise<boolean>;
  today: () => string;
  /** Le cache `video-meta.json`, recalculé du disque : après des vidéos écrites. */
  refreshVideoMeta: () => Promise<void>;
  commitPaths: (paths: string[], message: string, report?: Report) => Outcome;
}

/** Celles des routes : le scan du site, les stores de l'admin, le stamp partagé, le vrai git. */
export const GUIDES_DEPS: GuidesDeps = {
  guides: listGuides,
  draft: loadGuideDraft,
  config: (guide, version) => readGuideVersionFile<RawConfig>(guide, version, 'config.json'),
  groups: (modes) => listGroups(DEFAULT_LANG, modes),
  dungeons: () => listDungeons(DEFAULT_LANG),
  monsters: () => listMonsters(DEFAULT_LANG),
  roster: () => characterRoster().roster,
  refs: buildInlineRefs,
  pins: buildPinTargets,
  saveDraft: saveGuideDraft,
  patchMeta: patchGuideMetaFields,
  addVersion: addGuideVersion,
  dirty: (dir) => gitDirtyFiles(dir),
  stamp: stampMeta,
  today: todayLocal,
  refreshVideoMeta,
  commitPaths,
};

/** Le site de dev du poste, où « ouvrir sur le site » mène (cf. `guideBase` des monstres). */
const guidesSiteBase = (): string =>
  `${process.env.DEV_SITE_BASE || DEV_SITE_BASE_DEFAULT}/${DEFAULT_LANG}/guides`;

/** Les guides d'une catégorie, triés comme `listGuidesByCategory` : `order`, puis récent, puis slug. */
const byGuideOrder = (a: Guide, b: Guide): number =>
  (a.order ?? Number.MAX_SAFE_INTEGER) - (b.order ?? Number.MAX_SAFE_INTEGER) ||
  guideUpdatedDate(b).localeCompare(guideUpdatedDate(a)) ||
  a.slug.localeCompare(b.slug);

/**
 * La vue d'ensemble de la section « Guides » : par catégorie du site (dans son
 * ordre), ses guides — slug, titre anglais, date, versions, caché, le boss ou
 * le combat en clair — et si quick l'édite (`GUIDE_SPECS`, ou l'un des quatre
 * guides généraux à fragment éditable) ou si son contenu est en code, et le
 * palier d'un guide général (`tier`, avec la liste `tiers`). Une
 * catégorie dont TOUS les guides sont cachés n'y est pas (la
 * règle de `visibleCategorySlugs` du site : c'est ainsi qu'Adventure License
 * et Monad Gate, morts, quittent la liste), sauf `withHidden` — la case
 * « cachés » — qui montre tout, badge « caché » à l'appui. Lu du disque à
 * chaque appel.
 */
export function guidesOverview(disk: GuidesDisk = GUIDES_DEPS, withHidden = false) {
  const all = disk.guides();
  const groupLabel = new Map(disk.groups().map((g) => [g.group, g.label]));
  const monsterLabel = new Map(disk.monsters().map((m) => [m.id, m.label]));
  const dungeonLabel = new Map(disk.dungeons().map((d) => [d.id, d.label]));
  const battleOf = (g: Guide): string => {
    if (g.group) return groupLabel.get(g.group) ?? g.group;
    if (g.bossId) return monsterLabel.get(g.bossId.split('@')[0]) ?? g.bossId;
    if (g.dungeons?.length) {
      const first = dungeonLabel.get(g.dungeons[0]) ?? g.dungeons[0];
      return g.dungeons.length > 1 ? `${first} (+${g.dungeons.length - 1})` : first;
    }
    const newest = g.versions[0];
    if (newest) {
      const cfg = disk.config(g, newest.key) as Record<string, unknown> | undefined;
      const group = [cfg?.group, cfg?.main].find((k) => typeof k === 'string');
      if (typeof group === 'string') return groupLabel.get(group) ?? group;
    }
    return '';
  };
  const editableRow = (g: Guide): boolean =>
    Boolean(guideSpec(g.category)) ||
    (g.category === GENERAL_CATEGORY && generalGuideKind(g.slug) !== undefined);
  const row = (g: Guide): GuideOverviewRow => ({
    slug: g.slug,
    title: g.title.en,
    updated: guideUpdatedDate(g),
    versions: g.versions.length,
    ...(g.versions[0] ? { newest: g.versions[0].key } : {}),
    hidden: Boolean(g.hidden),
    battle: battleOf(g),
    editable: editableRow(g),
    ...(g.tier ? { tier: g.tier } : {}),
  });
  const alive = new Set(categoriesWithVisibleGuide(GUIDE_CATEGORY_SLUGS, all));
  const categories: GuideOverviewCategory[] = [];
  for (const slug of GUIDE_CATEGORY_SLUGS) {
    const mine = all.filter((g) => g.category === slug);
    if (!mine.length || (!withHidden && !alive.has(slug))) continue;
    const shown = (withHidden ? mine : mine.filter((g) => !g.hidden)).sort(byGuideOrder);
    const spec = guideSpec(slug);
    categories.push({
      slug,
      label: GUIDE_CATEGORIES[slug].label.en,
      editable: Boolean(spec) || mine.some(editableRow),
      versioned: Boolean(spec?.versioned),
      hidden: mine.filter((g) => g.hidden).length,
      guides: shown.map(row),
    });
  }
  return {
    categories,
    withHidden,
    counts: {
      guides: all.filter((g) => !g.hidden).length,
      hidden: all.filter((g) => g.hidden).length,
      categories: categories.length,
    },
    // Les paliers des guides généraux, dans l'ordre de lecture du site, libellés en anglais.
    tiers: GUIDE_TIER_KEYS.map((key) => ({ key, label: GUIDE_TIERS[key].label.en })),
    siteBase: guidesSiteBase(),
  };
}

/** Les textes de `meta.json` que la page édite, tels que le disque les porte. */
const guideMetaState = (g: Guide): GuideMetaState => ({
  title: g.title,
  description: g.description,
  hidden: Boolean(g.hidden),
});

/**
 * L'état d'UN guide pour la section « Guides » : ce que le scan en sait (sa
 * catégorie et son libellé, son titre anglais, sa date, son icône, son auteur,
 * ses versions), sa `spec` — ce que l'écran doit montrer —, son brouillon
 * (`loadGuideDraft`, le même que l'admin), ses textes de meta éditables, les
 * options des pickers selon la spec (les combats du mode, avec leur libellé et
 * leur icône ; les donjons ; les monstres ; le roster par nom d'affichage
 * anglais — ce que les équipes et les recos désignent), les `refs` des tags
 * inline, les cibles de pin d'un versionné (en lecture), les langues, et où
 * « ouvrir sur le site » mène. Lu du disque à chaque appel. `error` : guide
 * inconnu, ou catégorie dont le contenu est en code.
 */
export async function guideDraftState(
  category: string,
  slug: string,
  disk: GuidesDisk = GUIDES_DEPS,
) {
  const guide = disk.guides().find((g) => g.category === category && g.slug === slug);
  if (!guide) return { error: `guide inconnu : ${category}/${slug}` };
  const spec = guideSpec(category);
  if (!spec) return { error: `catégorie non éditable, contenu en code : ${category}` };
  const draft = disk.draft(category, slug);
  const usesGroup = spec.monster === 'group-config' || spec.monster === 'group-meta';
  return {
    guide: {
      category,
      slug,
      label: GUIDE_CATEGORIES[guide.category].label.en,
      title: guide.title.en,
      updated: guideUpdatedDate(guide),
      icon: guide.icon,
      author: guide.author,
      hidden: Boolean(guide.hidden),
      versions: guide.versions,
    },
    spec,
    draft,
    meta: guideMetaState(guide),
    options: {
      groups: usesGroup ? disk.groups(spec.groupModes) : [],
      dungeons: spec.monster === 'dungeons-meta' ? disk.dungeons() : [],
      monsters: spec.monster === 'bossId-meta' ? disk.monsters() : [],
      roster: disk.roster(),
    },
    refs: disk.refs(),
    pins: spec.versioned ? await disk.pins(draft) : [],
    langs: {
      default: DEFAULT_LANG,
      shown: [...NOTE_LANGS, ...LANGS.filter((l) => !NOTE_LANGS.includes(l))],
    },
    siteBase: guidesSiteBase(),
  };
}

/**
 * Un refus SITUÉ d'un enregistrement de guide : la version (`''` pour un guide
 * plat, absente pour ce qui vaut pour tout le guide), l'onglet de la page
 * (`guide`, `meta`, `battle`, `intro`, `tips`, `notes`, `reco`, `team`,
 * `videos`), le rang dans la liste de l'onglet, le champ.
 */
export interface GuideRefusal {
  version?: string;
  tab: string;
  index?: number;
  field?: string;
  reason: string;
}

export interface GuideSaveOutcome extends Outcome {
  written: boolean;
  stale: boolean;
  refused: GuideRefusal[];
}

type LTextOut = LocalizedText & { en: string };

/**
 * Un texte localisé venu de la page, réduit aux langues écrites (une langue
 * vidée ne s'écrit pas), ou `undefined` s'il n'en a aucune ; une forme
 * inattendue, un texte sans anglais ou un tag que le site ne résout pas rend
 * la raison du refus.
 */
function cleanGuideText(raw: unknown): LTextOut | undefined | string {
  if (raw === undefined || raw === null) return undefined;
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return 'texte : forme inattendue';
  const out: Record<string, string> = {};
  for (const [lang, value] of Object.entries(raw as Record<string, unknown>)) {
    if (!isValidLang(lang)) return `langue inconnue : ${lang}`;
    if (typeof value !== 'string') return `${lang} : une chaîne attendue`;
    if (value.trim()) out[lang] = value;
  }
  if (!Object.keys(out).length) return undefined;
  const bad = localizedIssues(out as LocalizedText);
  return bad.length ? bad.join(' ; ') : (out as LTextOut);
}

/** Une liste de noms (persos d'un slot, d'un groupe) : des chaînes non vides, sans blancs autour. */
function cleanNames(raw: unknown): string[] | string {
  if (!Array.isArray(raw) || raw.some((n) => typeof n !== 'string'))
    return 'une liste de noms attendue';
  return (raw as string[]).map((n) => n.trim()).filter(Boolean);
}

/** Une liste de clés d'archive `<id>@<n>` (le `pinned` d'une version), telle quelle. */
function cleanPins(raw: unknown): string[] | string {
  if (!Array.isArray(raw) || raw.some((k) => typeof k !== 'string' || !/^\d+@\d+$/.test(k)))
    return 'pinned : des clés « <id>@<n> » attendues';
  return [...(raw as string[])];
}

/**
 * Les vidéos d'une version, telles que la page les a reçues : `label` et le
 * reste préservés. La plateforme est une de celles que le site rend.
 */
function cleanVideos(raw: unknown): VideoItem[] | string {
  if (!Array.isArray(raw)) return 'videos : une liste attendue';
  for (const v of raw) {
    if (!v || typeof v !== 'object' || typeof (v as { id?: unknown }).id !== 'string')
      return 'videos : chaque vidéo porte un id';
    const { platform } = v as { platform?: unknown };
    if (!isVideoPlatform(platform))
      return `videos : « ${String(platform)} » n'est pas une plateforme connue`;
  }
  return raw as VideoItem[];
}

/**
 * Une version venue de la page, rebâtie sur les SEULES clés du modèle
 * (`VersionDraft`) : les textes nettoyés et contrôlés, les noms de persos
 * contre le roster, les pins et les vidéos tels quels. Chaque écart est un
 * refus situé — onglet et rang — et la version n'est pas rendue.
 */
function cleanGuideVersion(
  raw: unknown,
  spec: CatSpec,
  names: ReadonlySet<string>,
  refuse: (r: Omit<GuideRefusal, 'version'>) => void,
): VersionDraft | null {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    refuse({ tab: 'guide', reason: 'version : forme inattendue' });
    return null;
  }
  const v = raw as Record<string, unknown>;
  let ok = true;
  const text = (value: unknown, where: Omit<GuideRefusal, 'version' | 'reason'>) => {
    const out = cleanGuideText(value);
    if (typeof out === 'string') {
      refuse({ ...where, reason: out });
      ok = false;
      return undefined;
    }
    return out;
  };
  const texts = (value: unknown, where: Omit<GuideRefusal, 'version' | 'reason'>): LTextOut[] => {
    if (!Array.isArray(value)) {
      refuse({ ...where, reason: 'une liste de textes attendue' });
      ok = false;
      return [];
    }
    return value.flatMap((t, i) => {
      const out = text(t, { ...where, index: where.index ?? i });
      return out ? [out] : [];
    });
  };
  const heroes = (value: unknown, where: Omit<GuideRefusal, 'version' | 'reason'>): string[] => {
    const out = cleanNames(value);
    if (typeof out === 'string') {
      refuse({ ...where, reason: out });
      ok = false;
      return [];
    }
    const stray = out.filter((n) => !names.has(n));
    if (stray.length) {
      refuse({ ...where, reason: `hors du roster : ${stray.map((n) => `« ${n} »`).join(', ')}` });
      ok = false;
    }
    return out;
  };
  const list = (value: unknown, what: string, where: Omit<GuideRefusal, 'version' | 'reason'>) => {
    if (Array.isArray(value)) return value as unknown[];
    refuse({ ...where, reason: `${what} : une liste attendue` });
    ok = false;
    return [];
  };
  const record = (value: unknown): Record<string, unknown> =>
    value && typeof value === 'object' && !Array.isArray(value)
      ? (value as Record<string, unknown>)
      : {};
  const rawTitle = (value: unknown) =>
    value && typeof value === 'object' && !Array.isArray(value)
      ? { rawTitle: value as SectionTitle }
      : {};

  const out: VersionDraft = {
    key: typeof v.key === 'string' ? v.key : '',
    ...(v.labelOverride && typeof v.labelOverride === 'object'
      ? { labelOverride: v.labelOverride as LocalizedText }
      : {}),
    ...(typeof v.group === 'string' && v.group ? { group: v.group } : {}),
    ...(typeof v.bossId === 'string' && v.bossId ? { bossId: v.bossId } : {}),
    tipSections: list(v.tipSections, 'tips', { tab: 'tips' }).map((s, i) => {
      const r = record(s);
      const title = text(r.title, { tab: 'tips', index: i, field: 'title' });
      return {
        ...(title ? { title } : {}),
        ...rawTitle(r.rawTitle),
        tips: texts(r.tips, { tab: 'tips', index: i }),
      };
    }),
    notes: texts(v.notes, { tab: 'notes' }),
    recommended: list(v.recommended, 'recommended', { tab: 'reco' }).map((g, i) => {
      const r = record(g);
      const reason = text(r.reason, { tab: 'reco', index: i, field: 'reason' });
      return {
        characters: heroes(r.characters, { tab: 'reco', index: i }),
        ...(reason ? { reason } : {}),
      };
    }),
    recoSections: list(v.recoSections, 'recoSections', { tab: 'reco' }).map((s, i) => {
      const r = record(s);
      const title = text(r.title, { tab: 'reco', index: i, field: 'title' });
      return {
        ...(title ? { title } : {}),
        ...rawTitle(r.rawTitle),
        groups: list(r.groups, 'groups', { tab: 'reco', index: i }).map((g) => {
          const gr = record(g);
          const reason = text(gr.reason, { tab: 'reco', index: i, field: 'reason' });
          return {
            characters: heroes(gr.characters, { tab: 'reco', index: i }),
            ...(reason ? { reason } : {}),
          };
        }),
      };
    }),
    teams: list(v.teams, 'teams', { tab: 'team' }).map((t, i) => {
      const r = record(t);
      const title = text(r.title, { tab: 'team', index: i, field: 'title' });
      const note = text(r.note, { tab: 'team', index: i, field: 'note' });
      const stages = Array.isArray(r.stages) ? r.stages.map(Number) : undefined;
      if (stages && (stages.length !== 2 || stages.some((n) => !Number.isInteger(n) || n < 1))) {
        refuse({
          tab: 'team',
          index: i,
          field: 'stages',
          reason: 'plage de stages : deux entiers',
        });
        ok = false;
      }
      return {
        ...(stages ? { stages: [stages[0], stages[1]] as [number, number] } : {}),
        ...rawTitle(r.rawTitle),
        ...(title ? { title } : {}),
        slots: list(r.slots, 'slots', { tab: 'team', index: i }).map((slot) =>
          heroes(slot, { tab: 'team', index: i }),
        ),
        ...(note ? { note } : {}),
        ...(r.notes !== undefined ? { notes: texts(r.notes, { tab: 'team', index: i }) } : {}),
      };
    }),
    videos: [],
  };
  if (v.dungeons !== undefined) {
    const d = cleanNames(v.dungeons);
    if (typeof d === 'string') {
      refuse({ tab: 'battle', reason: `donjons : ${d}` });
      ok = false;
    } else if (d.length) out.dungeons = d;
  }
  // `pinned` : PRÉSENT seulement quand la page a touché aux pins — absent, le
  // store garde ceux du disque (cf. `VersionDraft.pinned`).
  if (v.pinned !== undefined) {
    const p = cleanPins(v.pinned);
    if (typeof p === 'string') {
      refuse({ tab: 'battle', reason: p });
      ok = false;
    } else out.pinned = p;
  }
  const videos = cleanVideos(v.videos ?? []);
  if (typeof videos === 'string') {
    refuse({ tab: 'videos', reason: videos });
    ok = false;
  } else out.videos = videos;
  if (spec.notes === false && out.notes.length) out.notes = [];
  return ok ? out : null;
}

/**
 * Les textes de meta venus de la page : le titre et la description (l'anglais
 * requis, les autres langues écrites gardées), `hidden`. Un écart est un refus
 * situé à l'onglet Méta.
 */
function cleanGuideMeta(raw: unknown, refuse: (r: GuideRefusal) => void): GuideMetaPatch | null {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    refuse({ tab: 'meta', reason: 'meta : forme inattendue' });
    return null;
  }
  const m = raw as Record<string, unknown>;
  const out: GuideMetaPatch = {};
  let ok = true;
  for (const key of ['title', 'description'] as const) {
    const text = cleanGuideText(m[key]);
    if (typeof text === 'string') {
      refuse({ tab: 'meta', field: key, reason: text });
      ok = false;
    } else if (!text?.en?.trim()) {
      refuse({ tab: 'meta', field: key, reason: 'l’anglais est requis' });
      ok = false;
    } else out[key] = text;
  }
  out.hidden = m.hidden === true;
  return ok ? out : null;
}

/**
 * « Enregistrer » d'un guide : TOUT le guide en un geste — le brouillon entier
 * (`saveGuideDraft` réécrit toutes les versions, c'est sa règle) et ses textes
 * de meta —, puis le stamp, puis UN commit.
 *
 * Dans l'ordre : `was` doit être ce que le disque porte (sinon `stale`, rien
 * n'est écrit — l'admin ou l'autre poste a écrit entre-temps) ; le brouillon
 * et le meta sont CONTRÔLÉS avant toute écriture (textes, tags inline par la
 * résolution du site, noms de persos dans le roster, ce que le store exigerait
 * — l'intro, le combat, les clés de version), chaque écart SITUÉ à sa
 * version, son onglet, sa ligne ; puis le store écrit le brouillon, ses refus
 * rendus situés eux aussi ; puis `patchGuideMetaFields` (titre, description,
 * `hidden`) en une écriture ; puis ce qui a BOUGÉ dans le dossier du guide se
 * lit de git — rien : rien à committer, ni stamp — et, si un fichier PERTINENT
 * a bougé (hors archives de version : la règle de `scripts/stamp-guides.ts`,
 * partagée), `meta.updated` passe à aujourd'hui, le `meta.json` re-daté
 * partant dans le même commit, `chore(guides): <catégorie>/<slug>`. Les
 * `.json` de quick partent en `--no-verify` : sans ce stamp, une édition par
 * quick ne re-daterait jamais le guide. Les vidéos d'une version ont bougé
 * (une ajoutée, une retirée) : le cache `video-meta.json` est rafraîchi
 * (`deps.refreshVideoMeta`) et part dans ce commit.
 */
export async function saveGuide(
  category: string,
  slug: string,
  body: unknown,
  deps: GuidesDeps = GUIDES_DEPS,
  report?: Report,
): Promise<GuideSaveOutcome> {
  const refused: GuideRefusal[] = [];
  const out = (
    ok: boolean,
    lines: string[],
    more: { written?: boolean; stale?: boolean } = {},
  ): GuideSaveOutcome => ({
    ok,
    log: lines,
    written: more.written ?? false,
    stale: more.stale ?? false,
    refused,
  });
  const name = `${category}/${slug}`;
  const spec = guideSpec(category);
  if (!spec) return out(false, [`catégorie non éditable : ${category}.`]);
  const guide = deps.guides().find((g) => g.category === category && g.slug === slug);
  if (!guide) return out(false, [`guide inconnu : ${name}.`]);
  const b = (body && typeof body === 'object' ? body : {}) as Record<string, unknown>;

  const j = journal(report);
  const where = (r: GuideRefusal): string =>
    [
      r.version ? `version ${r.version}` : '',
      r.tab,
      r.index !== undefined ? `[${r.index}]` : '',
      r.field ? `· ${r.field}` : '',
    ]
      .filter(Boolean)
      .join(' ');
  const refuse = (r: GuideRefusal): void => {
    refused.push(r);
    j.done(`REFUSÉ — ${name} · ${where(r)} : ${r.reason}.`);
  };

  // Le disque, relu : ce que la page avait chargé doit être ce qu'il porte encore.
  const disk = { draft: deps.draft(category, slug), meta: guideMetaState(guide) };
  if (!sameJson(b.was, disk)) {
    refuse({ tab: 'guide', reason: 'le disque a changé depuis le chargement' });
    return out(false, [...j.lines, 'Rien à enregistrer.'], { stale: true });
  }

  const meta = cleanGuideMeta(b.meta, refuse);

  const raw = (b.draft && typeof b.draft === 'object' ? b.draft : null) as Record<
    string,
    unknown
  > | null;
  if (!raw || !Array.isArray(raw.versions)) {
    refuse({ tab: 'guide', reason: 'brouillon : forme inattendue' });
    return out(false, [...j.lines, 'Rien à enregistrer.']);
  }
  const intro = cleanGuideText(raw.intro);
  if (typeof intro === 'string') refuse({ tab: 'intro', reason: intro });
  else if (spec.introRequired && !intro?.en?.trim())
    refuse({ tab: 'intro', reason: 'l’intro (anglais) est requise' });
  const names = new Set(deps.roster().map((c) => c.name));
  const versions = raw.versions.map((v) => {
    const key = v && typeof v === 'object' ? String((v as { key?: unknown }).key ?? '') : '';
    return cleanGuideVersion(v, spec, names, (r) => refuse({ ...r, version: key }));
  });
  for (const v of versions) {
    if (!v) continue;
    if (spec.versioned && !/^\d{4}-(0[1-9]|1[0-2])$/.test(v.key))
      refuse({
        version: v.key,
        tab: 'guide',
        reason: `clé de version attendue YYYY-MM (« ${v.key} »)`,
      });
    if (spec.monster === 'dungeons-meta' && !v.dungeons?.length)
      refuse({ version: v.key, tab: 'battle', reason: 'au moins un donjon est requis' });
    if (spec.monster === 'bossId-meta' && !v.bossId)
      refuse({ version: v.key, tab: 'battle', reason: 'un boss (monstre) est requis' });
    if (spec.monster === 'group-meta' && !v.group)
      refuse({ version: v.key, tab: 'battle', reason: 'un combat (monstre) est requis' });
  }
  if (refused.length || !meta) return out(false, [...j.lines, 'Rien à enregistrer.']);
  const draft: GuideDraft = {
    intro: (typeof intro === 'object' ? intro : undefined) ?? { en: '' },
    versions: versions.filter((v): v is VersionDraft => v !== null),
  };

  j.doing('écriture du guide');
  const errors = await deps.saveDraft(category, slug, draft);
  for (const e of errors) {
    const key = /version key : “([^”]+)”/.exec(e)?.[1];
    refuse({
      ...(key ? { version: key } : {}),
      tab: /intro/i.test(e) ? 'intro' : /dungeon|boss|battle/i.test(e) ? 'battle' : 'guide',
      reason: e,
    });
  }
  if (errors.length) return out(false, [...j.lines, 'Rien à enregistrer.']);
  if (!sameJson(meta, { ...disk.meta, hidden: disk.meta.hidden })) {
    const wrote = await deps.patchMeta(category, slug, meta);
    if (!wrote) {
      refuse({ tab: 'meta', reason: 'meta.json refusé par le store' });
      return out(false, [...j.lines, 'Rien à enregistrer.']);
    }
  }

  // Ce qui a bougé, lu de git : les fichiers du guide qui diffèrent de HEAD —
  // y compris une version posée par « ＋ version » et pas encore committée.
  const dir = guideDirOf(category, slug);
  const base = `${dir}/`;
  const changed = deps.dirty(dir);
  if (!changed.length)
    return out(true, [...j.lines, 'Rien à enregistrer : le disque porte déjà ces valeurs.']);
  j.done(
    `${changed.length} fichier${changed.length > 1 ? 's' : ''} du guide ${changed.length > 1 ? 'ont' : 'a'} bougé`,
  );

  const keys = guide.versions.map((v) => v.key);
  let stamped = false;
  if (hasRelevantChange(base, changed, archivePrefixes(base, keys))) {
    const today = deps.today();
    stamped = await deps.stamp(`${base}meta.json`, today);
    if (stamped) j.done(`meta.updated : ${today}`);
  } else j.done('archives seules : la date du guide ne bouge pas');
  // Le cache des métadonnées suit les vidéos écrites, version par version.
  const videosOf = (d: GuideDraft) => d.versions.map((v) => [v.key, v.videos]);
  const cached =
    !sameJson(videosOf(draft), videosOf(disk.draft)) &&
    (await refreshVideoCache(deps.refreshVideoMeta, j));
  const paths = [
    ...new Set([
      ...changed,
      ...(stamped ? [`${base}meta.json`] : []),
      ...(cached ? [VIDEO_META_PATH] : []),
    ]),
  ];
  const commit = deps.commitPaths(paths, `chore(guides): ${name}`, report);
  return out(commit.ok, [...j.lines, ...commit.log], { written: true });
}

/**
 * « ＋ version » : une version nouvelle d'un guide versionné (`addGuideVersion`
 * : la clé `YYYY-MM`, dupliquée de `fromKey` ou vierge — sans hériter du pin).
 * Un geste qui ÉCRIT SANS COMMITTER : la copie est une BASE à réécrire, pas
 * un contenu à publier — committée telle quelle, elle deviendrait la version
 * par défaut du site, copie conforme de la précédente sous une autre date. Le
 * prochain « Enregistrer » l'emporte avec ses retouches, dans son commit ; la
 * page le dit. Rend le brouillon relu, la version nouvelle découverte.
 */
export async function addGuideVersionAction(
  category: string,
  slug: string,
  newKey: unknown,
  fromKey: unknown,
  deps: GuidesDeps = GUIDES_DEPS,
): Promise<Outcome & { draft?: GuideDraft; version?: string }> {
  const key = String(newKey ?? '').trim();
  const from = String(fromKey ?? '').trim();
  const errors = await deps.addVersion(category, slug, key, from);
  if (errors.length) return { ok: false, log: errors };
  return {
    ok: true,
    log: [
      `version ${key} créée sur le disque${from ? ` (copie de ${from}, sans son épinglage)` : ' (vierge)'} — pas committée : « Enregistrer » l’emportera.`,
    ],
    draft: deps.draft(category, slug),
    version: key,
  };
}

// -------------------------------------------------------- guides généraux ----

/** La catégorie des guides généraux ; quatre de ses guides ont un fragment éditable. */
const GENERAL_CATEGORY = 'general-guides';

/** Les fichiers d'un enregistrement de shop hors du dossier du guide : le curé et le dérivé. */
const SHOP_DATA_FILES = [
  'data/curated/shop-priorities.json',
  'data/generated/shop-priorities.json',
];

/** Ce qu'un import de contribution peut écrire hors des guides : le curé des persos. */
const CHARACTERS_CURATED_FILE = 'data/curated/characters.json';

/** Un palier plein de transcendance, tel que la page le propose : sa valeur et son libellé. */
export interface StepOption {
  value: number;
  label: string;
}

/** Les données d'un guide général, telles que son store les lit. */
export type GeneralGuideData =
  PremiumLimitedData | FreeHeroesData | ShopPrioritiesEditData | CoreFusionData;

/** Les lectures et les écritures des guides généraux, injectées : les stores, l'import, git. */
export interface GeneralGuidesDeps {
  guides: () => Guide[];
  roster: () => SheetRosterRow[];
  refs: () => InlineRefs;
  /** Les paliers PLEINS d'un perso, d'après sa rareté (et ses exceptions). */
  steps: (rarity: number, id: string) => StepOption[];
  /** Les persos ATTENDUS de Premium & Limited, par bucket (les tags du roster) : le compteur « X / Y reviews ». */
  buckets: () => Record<string, string[]>;
  /** Les héros FUSION du jeu : les reviews attendues de Core Fusion, et les niveaux de fusion de chacun. */
  fusions: () => CoreFusionHero[];
  loadPremiumLimited: () => PremiumLimitedData;
  loadFreeHeroes: () => FreeHeroesData;
  loadShopPriorities: () => ShopPrioritiesEditData;
  loadCoreFusion: () => CoreFusionData;
  savePremiumLimited: (data: PremiumLimitedData) => Promise<string[]>;
  saveFreeHeroes: (data: FreeHeroesData) => Promise<string[]>;
  saveShopPriorities: (data: ShopPrioritiesSaveData) => Promise<string[]>;
  saveCoreFusion: (data: CoreFusionData) => Promise<string[]>;
  importContribution: (raw: unknown) => Promise<ImportResult>;
  /** Les fichiers d'un chemin (relatif au dépôt) qui diffèrent de `HEAD`. */
  dirty: (path: string) => string[];
  stamp: (metaPath: string, date: string) => Promise<boolean>;
  today: () => string;
  commitPaths: (paths: string[], message: string, report?: Report) => Outcome;
}

/** Celles des routes : les stores de l'admin, l'import de contribution, le stamp partagé, le vrai git. */
export const GENERAL_GUIDES_DEPS: GeneralGuidesDeps = {
  guides: listGuides,
  roster: () => characterRoster().roster,
  refs: buildInlineRefs,
  steps: (rarity, id) =>
    transcendenceFullSteps(rarity, id).map((value) => ({
      value,
      label: transcendenceLabel(rarity, value, id),
    })),
  buckets: premiumLimitedRoster,
  fusions: coreFusionRoster,
  loadPremiumLimited,
  loadFreeHeroes,
  loadShopPriorities,
  loadCoreFusion,
  savePremiumLimited,
  saveFreeHeroes,
  saveShopPriorities,
  saveCoreFusion,
  importContribution,
  dirty: (path) => gitDirtyFiles(path),
  stamp: stampMeta,
  today: todayLocal,
  commitPaths,
};

/** Les données d'un guide général, par son modèle. */
function loadGeneral(kind: GeneralGuideKind, deps: GeneralGuidesDeps): GeneralGuideData {
  switch (kind) {
    case 'premium-limited':
      return deps.loadPremiumLimited();
    case 'free-heroes':
      return deps.loadFreeHeroes();
    case 'core-fusion':
      return deps.loadCoreFusion();
    default:
      return deps.loadShopPriorities();
  }
}

/**
 * L'état d'un guide GÉNÉRAL à fragment éditable, pour la section « Guides » :
 * ce que le scan en sait (comme un guide de boss), sa FORME (`generalGuideForm`
 * : les onglets, les blocs, les champs — c'est elle que la page rend, sans
 * connaître le guide), ses données telles que son store les lit, le roster
 * par nom d'affichage anglais et, pour Premium & Limited et Core Fusion, les
 * paliers pleins de chaque perso (les options de `stars`) et les persos
 * attendus (`rosters` : par bucket, ou les fusions du jeu) — pour Core Fusion
 * encore, les niveaux de fusion de chaque héros (`levels`) —, les `refs`, les
 * langues, le site.
 * Lu du disque à chaque appel. `error` : guide inconnu, ou dont le contenu
 * est en code (les dix autres généraux), ou données illisibles.
 */
export function generalGuideState(slug: string, deps: GeneralGuidesDeps = GENERAL_GUIDES_DEPS) {
  const kind = generalGuideKind(slug);
  if (!kind) return { error: `guide général non éditable, contenu en code : ${slug}` };
  const guide = deps.guides().find((g) => g.category === GENERAL_CATEGORY && g.slug === slug);
  if (!guide) return { error: `guide inconnu : ${GENERAL_CATEGORY}/${slug}` };
  let data: GeneralGuideData;
  try {
    data = loadGeneral(kind, deps);
  } catch (e: unknown) {
    return { error: `données illisibles : ${e instanceof Error ? e.message : String(e)}` };
  }
  const roster = deps.roster();
  const fusions = kind === 'core-fusion' ? deps.fusions() : [];
  return {
    guide: {
      category: GENERAL_CATEGORY,
      slug,
      label: GUIDE_CATEGORIES[GENERAL_CATEGORY].label.en,
      title: guide.title.en,
      updated: guideUpdatedDate(guide),
      icon: guide.icon,
      author: guide.author,
      hidden: Boolean(guide.hidden),
      versions: [] as Guide['versions'],
    },
    spec: generalGuideForm(slug, data) as GeneralGuideForm,
    data,
    options: {
      roster,
      steps:
        kind === 'premium-limited' || kind === 'core-fusion'
          ? Object.fromEntries(roster.map((c) => [c.id, deps.steps(c.rarity, c.id)]))
          : {},
      // Les persos attendus (`view: 'roster'` de la forme) : par bucket, ceux que
      // `contribute/premium-reviews` compte — le tag `premium`, la famille
      // `limited` ; pour Core Fusion, les fusions du jeu.
      rosters:
        kind === 'premium-limited'
          ? deps.buckets()
          : kind === 'core-fusion'
            ? { 'core-fusion': fusions.map((f) => f.name) }
            : {},
      // Les niveaux de fusion de chaque héros fusion, par id (les cases de `levels`).
      levels: Object.fromEntries(fusions.map((f) => [f.id, f.levels])),
    },
    refs: deps.refs(),
    langs: {
      default: DEFAULT_LANG,
      shown: [...NOTE_LANGS, ...LANGS.filter((l) => !NOTE_LANGS.includes(l))],
    },
    siteBase: guidesSiteBase(),
  };
}

/**
 * Un refus SITUÉ d'un enregistrement de guide général : l'onglet de la page, la
 * CLÉ du champ (le chemin dans les données, joint par des points — celle que
 * la page donne à ses champs : `reviews.premium.2.review`), ou l'entrée seule
 * (`sources.0.entries.1`) ; sans clé : tout l'onglet, ou tout le guide
 * (`guide`).
 */
export interface GeneralRefusal {
  tab: string;
  key?: string;
  reason: string;
}

export interface GeneralSaveOutcome extends Outcome {
  written: boolean;
  stale: boolean;
  refused: GeneralRefusal[];
}

type Rec = Record<string, unknown>;
const isRec = (v: unknown): v is Rec => Boolean(v) && typeof v === 'object' && !Array.isArray(v);

/** Ce qu'un contrôle de champ a sous la main : le roster, les paliers d'un perso, ses niveaux de fusion, le refus. */
interface GeneralCleanContext {
  names: ReadonlySet<string>;
  steps: (name: string) => StepOption[] | undefined;
  levels: (name: string) => number[] | undefined;
  refuse: (key: string, reason: string) => void;
}

/**
 * Un champ d'une entrée, venu de la page, contrôlé selon son genre (cf.
 * `GeneralFieldKind`) : rendu nettoyé dans `out` (absent quand il est vide et
 * facultatif), ou refusé à sa clé — et `ok` passe à faux.
 */
function cleanGeneralField(
  f: GeneralField,
  entry: Rec,
  out: Rec,
  key: string,
  ctx: GeneralCleanContext,
): boolean {
  const v = entry[f.key];
  const no = (reason: string): false => {
    ctx.refuse(key, reason);
    return false;
  };
  switch (f.kind) {
    case 'text': {
      const t = cleanGuideText(v);
      if (typeof t === 'string') return no(t);
      if (f.required && !t?.en?.trim()) return no(`${f.label} (anglais) : requis`);
      if (t) out[f.key] = t;
      return true;
    }
    case 'hero': {
      if (v !== undefined && typeof v !== 'string') return no('un nom de perso attendu');
      const name = (v ?? '').trim();
      out[f.key] = name;
      if (!name) return f.required ? no('un héros est requis') : true;
      const free = Boolean(f.unreleasedKey && entry[f.unreleasedKey] === true);
      if (!free && !ctx.names.has(name)) return no(`hors du roster : « ${name} »`);
      return true;
    }
    case 'heroes': {
      const names = cleanNames(v ?? []);
      if (typeof names === 'string') return no(names);
      out[f.key] = names;
      if (f.required && !names.length) return no('au moins un héros est requis');
      const stray = names.filter((n) => !ctx.names.has(n));
      return stray.length
        ? no(`hors du roster : ${stray.map((n) => `« ${n} »`).join(', ')}`)
        : true;
    }
    case 'select': {
      const value = typeof v === 'string' ? v : String(f.default ?? '');
      if (!f.options?.some((o) => o.value === value)) return no(`choix inconnu : « ${value} »`);
      out[f.key] = value;
      return true;
    }
    case 'stars': {
      const n = typeof v === 'number' ? v : Number(v);
      if (!Number.isInteger(n)) return no('un palier (entier) attendu');
      out[f.key] = n;
      const heroField = f.key === 'name' ? undefined : (entry.name as unknown);
      const steps = typeof heroField === 'string' ? ctx.steps(heroField.trim()) : undefined;
      if (steps && !steps.some((s) => s.value === n))
        return no(
          `« ${n} » n’est pas un palier plein — attendu ${steps.map((s) => `${s.value} (${s.label})`).join(', ')}`,
        );
      return true;
    }
    case 'string':
    case 'target':
      if (v !== undefined && v !== null && typeof v !== 'string') return no('un texte attendu');
      out[f.key] = typeof v === 'string' ? v : '';
      return true;
    case 'number': {
      if (v === undefined || v === null || v === '') return true;
      const n = typeof v === 'number' ? v : Number(v);
      if (!Number.isFinite(n)) return no('un nombre attendu');
      out[f.key] = n;
      return true;
    }
    case 'check':
      if (v === true) out[f.key] = true;
      return true;
    case 'priority': {
      if (v === undefined || v === null || v === '') return true;
      if (typeof v !== 'string' || !(PRIORITIES as readonly string[]).includes(v))
        return no(`priorité inconnue : « ${String(v)} » (S, A, B, C)`);
      out[f.key] = v;
      return true;
    }
    case 'impact': {
      const grid: Record<string, { pve: string; pvp: string }> = {};
      const raw = isRec(v) ? v : {};
      for (const star of IMPACT_STARS) {
        const cell = isRec(raw[star]) ? (raw[star] as Rec) : {};
        const side = (s: unknown): string | null => {
          const t = typeof s === 'string' ? s.trim() : s === undefined || s === null ? '' : null;
          return t !== null && /^([1-5]?)$/.test(t) ? t : null;
        };
        const pve = side(cell.pve);
        const pvp = side(cell.pvp);
        if (pve === null || pvp === null) return no(`impact ${star}★ : une note de 1 à 5, ou rien`);
        grid[star] = { pve, pvp };
      }
      out[f.key] = grid;
      return true;
    }
    case 'levels': {
      const list = v ?? [];
      if (!Array.isArray(list) || list.some((n) => !Number.isInteger(n)))
        return no('des niveaux (entiers) attendus');
      const levels = [...new Set(list as number[])].sort((a, b) => a - b);
      out[f.key] = levels;
      const known = typeof entry.name === 'string' ? ctx.levels(entry.name.trim()) : undefined;
      const stray = known ? levels.filter((n) => !known.includes(n)) : [];
      return stray.length
        ? no(
            `« ${stray.join(', ')} » n’est pas un niveau de fusion — attendu ${(known ?? []).join(', ')}`,
          )
        : true;
    }
    case 'op': {
      if (v === undefined || v === null || v === '') out[f.key] = null;
      else if (isFusionOp(v)) out[f.key] = v;
      else return no(`relation inconnue : « ${String(v)} » (>, >=, ou rien)`);
      return true;
    }
    case 'group': {
      if (v === undefined || v === null) return true;
      if (!isRec(v)) return no(`${f.label} : forme inattendue`);
      const group: Rec = {};
      let ok = true;
      for (const sub of f.fields ?? [])
        if (!cleanGeneralField(sub, v, group, `${key}.${sub.key}`, ctx)) ok = false;
      if (Object.keys(group).length) out[f.key] = group;
      return ok;
    }
    case 'cost': {
      if (v === undefined || v === null) return true;
      if (!isRec(v)) return no('coût : forme inattendue');
      const amount = typeof v.amount === 'number' ? v.amount : Number(v.amount);
      if (!Number.isFinite(amount) || amount < 0) return no('coût : un montant attendu');
      const currency = typeof v.currency === 'string' ? v.currency.trim() : '';
      if (!currency) return no('coût : la monnaie est requise');
      out[f.key] = { currency, amount };
      return true;
    }
    case 'limit': {
      if (v === undefined || v === null) return true;
      if (!isRec(v)) return no('limite : forme inattendue');
      const count = typeof v.count === 'number' ? v.count : Number(v.count);
      if (!Number.isInteger(count) || count < 1) return no('limite : un compte entier attendu');
      if (typeof v.period !== 'string' || !(PERIODS as readonly string[]).includes(v.period))
        return no(`limite : période inconnue (${PERIODS.join(', ')})`);
      out[f.key] = { count, period: v.period };
      return true;
    }
    case 'product':
      if (typeof entry.key !== 'string' || !entry.key) return no('ligne sans clé de produit');
      out.key = entry.key;
      return true;
    default:
      return true;
  }
}

/** Les entrées d'une liste (un bloc, ou la sous-liste d'une entrée), contrôlées champ à champ. */
function cleanGeneralList(
  raw: unknown,
  fields: GeneralField[],
  nested: GeneralBlock['nested'],
  key: string,
  ctx: GeneralCleanContext,
): Rec[] | null {
  if (!Array.isArray(raw)) {
    ctx.refuse(key, 'une liste attendue');
    return null;
  }
  let ok = true;
  const out = raw.map((e, i) => {
    const entryKey = `${key}.${i}`;
    const entry = isRec(e) ? e : {};
    if (!isRec(e)) {
      ctx.refuse(entryKey, 'entrée : forme inattendue');
      ok = false;
    }
    const clean: Rec = {};
    for (const f of fields)
      if (!cleanGeneralField(f, entry, clean, `${entryKey}.${f.key}`, ctx)) ok = false;
    if (nested) {
      const sub = cleanGeneralList(
        entry[nested.key] ?? [],
        nested.fields,
        undefined,
        `${entryKey}.${nested.key}`,
        ctx,
      );
      if (!sub) ok = false;
      clean[nested.key] = sub ?? [];
    }
    return clean;
  });
  return ok ? out : null;
}

const getAt = (root: unknown, path: readonly string[]): unknown =>
  path.reduce<unknown>((o, k) => (isRec(o) || Array.isArray(o) ? (o as Rec)[k] : undefined), root);

/** Pose `value` à `path` dans `root`, en créant les objets manquants ; `undefined` retire la clé. */
function setAt(root: Rec, path: readonly string[], value: unknown): void {
  let o: Rec = root;
  path.slice(0, -1).forEach((k, i) => {
    // Un segment numérique à suivre : une liste à créer, pas un objet.
    if (!isRec(o[k]) && !Array.isArray(o[k])) o[k] = /^\d+$/.test(path[i + 1]) ? [] : {};
    o = o[k] as Rec;
  });
  const last = path[path.length - 1];
  if (value === undefined) delete o[last];
  else o[last] = value;
}

/**
 * Les données d'un guide général venues de la page, rebâties sur la FORME :
 * chaque bloc à son chemin, chaque entrée réduite aux champs décrits et
 * contrôlés (textes nettoyés et tags vérifiés, noms de persos dans le roster,
 * paliers, priorités, grilles d'impact…), un texte vide et facultatif absent.
 * Chaque écart est un refus situé à sa clé, et rien n'est rendu.
 */
function cleanGeneralData(
  form: GeneralGuideForm,
  raw: unknown,
  ctx: GeneralCleanContext,
): Rec | null {
  if (!isRec(raw)) {
    ctx.refuse('', 'données : forme inattendue');
    return null;
  }
  const out: Rec = {};
  let ok = true;
  for (const tab of form.tabs)
    for (const block of tab.blocks) {
      const key = block.path.join('.');
      const value = getAt(raw, block.path);
      if (block.kind === 'text') {
        const t = cleanGuideText(value);
        if (typeof t === 'string') {
          ctx.refuse(key, t);
          ok = false;
        } else if (block.required && !t?.en?.trim()) {
          ctx.refuse(key, `${block.label} (anglais) : requis`);
          ok = false;
        } else setAt(out, block.path, t);
      } else if (block.kind === 'texts') {
        const list = Array.isArray(value) ? value : null;
        if (!list) {
          ctx.refuse(key, 'une liste de textes attendue');
          ok = false;
          continue;
        }
        const texts: LTextOut[] = [];
        list.forEach((t, i) => {
          const c = cleanGuideText(t);
          if (typeof c === 'string') {
            ctx.refuse(`${key}.${i}`, c);
            ok = false;
          } else if (block.required && !c?.en?.trim()) {
            ctx.refuse(`${key}.${i}`, `${block.label} (anglais) : requis`);
            ok = false;
          } else if (c) texts.push(c);
        });
        setAt(out, block.path, texts);
      } else {
        const list = cleanGeneralList(value ?? [], block.fields ?? [], block.nested, key, ctx);
        if (!list) ok = false;
        setAt(out, block.path, list ?? []);
      }
    }
  return ok ? out : null;
}

/** Ce que le store d'un modèle attend, bâti des données nettoyées. */
function toStorePayload(
  kind: GeneralGuideKind,
  clean: Rec,
): PremiumLimitedData | FreeHeroesData | ShopPrioritiesSaveData | CoreFusionData {
  switch (kind) {
    case 'premium-limited': {
      const reviews = (clean.reviews ?? {}) as Rec;
      const priorities = (clean.priorities ?? {}) as Rec;
      const order = (b: string) => {
        const o = (priorities[b] ?? {}) as Rec;
        return {
          first: (o.first ?? []) as PremiumLimitedData['priorities']['premium']['first'],
          second: (o.second ?? []) as PremiumLimitedData['priorities']['premium']['second'],
          third: (o.third ?? []) as PremiumLimitedData['priorities']['premium']['third'],
          transcend: (o.transcend ??
            []) as PremiumLimitedData['priorities']['premium']['transcend'],
        };
      };
      const list = (b: string) =>
        ((reviews[b] ?? []) as Partial<PremiumLimitedData['reviews']['premium'][number]>[]).map(
          normalizeReview,
        );
      return {
        reviews: { premium: list('premium'), limited: list('limited') },
        priorities: { premium: order('premium'), limited: order('limited') },
      };
    }
    case 'core-fusion': {
      const priorities = (clean.priorities ?? {}) as Rec;
      return {
        reviews: ((clean.reviews ?? []) as Partial<CoreFusionData['reviews'][number]>[]).map(
          normalizeFusionReview,
        ),
        priorities: Object.fromEntries(
          FUSION_TIERS.map((tier) => [tier, priorities[tier] ?? []]),
        ) as CoreFusionData['priorities'],
      };
    }
    case 'free-heroes':
      return {
        sources: ((clean.sources ?? []) as Rec[]).map((s) => ({
          source: s.source as FreeHeroesData['sources'][number]['source'],
          entries: ((s.entries ?? []) as Rec[]).map((e) => ({
            names: e.names as string[],
            pickType: e.pickType as 'one' | 'all',
            reason: (e.reason ?? {
              en: '',
            }) as FreeHeroesData['sources'][number]['entries'][number]['reason'],
          })),
        })),
      };
    default: {
      const editorial = (clean.editorial ?? {}) as Rec;
      const textShops = (editorial.textShops ?? {}) as Record<string, Rec>;
      return {
        overlay: overlayOf(
          ((clean.derived ?? []) as Rec[]).map((shop) => ({
            rows: (shop.rows ?? []) as {
              key: string;
              priority?: 'S' | 'A' | 'B' | 'C';
              notes?: LocalizedText;
            }[],
          })),
        ),
        editorial: {
          shopNotes: (editorial.shopNotes ?? {}) as Record<string, LocalizedText>,
          textShops: Object.fromEntries(
            Object.entries(textShops).map(([k, shop]) => [
              k,
              {
                paragraphs: (shop.paragraphs ?? []) as LocalizedText[],
                ...(shop.gearNote ? { gearNote: shop.gearNote as LocalizedText } : {}),
              },
            ]),
          ),
          eventItems: (editorial.eventItems ??
            []) as ShopPrioritiesSaveData['editorial']['eventItems'],
          resourceItems: (editorial.resourceItems ??
            []) as ShopPrioritiesSaveData['editorial']['resourceItems'],
        },
      };
    }
  }
}

/** Un refus du store (« Premium/second #2: … », « Source 1, entry 2: … », « Reviews #3 … »), ramené à son onglet et sa clé. */
function situateStoreError(kind: GeneralGuideKind, error: string): Omit<GeneralRefusal, 'reason'> {
  if (kind === 'premium-limited') {
    const m = /^(Premium|Limited)(?:\/(first|second|third|transcend))? #(\d+)/.exec(error);
    if (m) {
      const bucket = m[1].toLowerCase();
      const i = Number(m[3]) - 1;
      return {
        tab: `${bucket}-${m[2] ? 'priorities' : 'reviews'}`,
        key: m[2] ? `priorities.${bucket}.${m[2]}.${i}` : `reviews.${bucket}.${i}`,
      };
    }
  } else if (kind === 'core-fusion') {
    const m = /^(?:Reviews|Priorities\/(first|second|third)) #(\d+)/.exec(error);
    if (m) {
      const i = Number(m[2]) - 1;
      return m[1]
        ? { tab: 'priorities', key: `priorities.${m[1]}.${i}` }
        : { tab: 'reviews', key: `reviews.${i}` };
    }
  } else if (kind === 'free-heroes') {
    const m = /^Source (\d+)(?:, entry (\d+))?/.exec(error);
    if (m) {
      const i = Number(m[1]) - 1;
      return {
        tab: 'sources',
        key: m[2] ? `sources.${i}.entries.${Number(m[2]) - 1}` : `sources.${i}`,
      };
    }
  } else {
    const item = /^(Event|Resource) item (\d+)/.exec(error);
    if (item) {
      const tab = item[1].toLowerCase();
      return { tab, key: `editorial.${tab}Items.${Number(item[2]) - 1}` };
    }
    const para = /^Text shop “([^”]+)”, paragraph (\d+)/.exec(error);
    if (para)
      return {
        tab: para[1],
        key: `editorial.textShops.${para[1]}.paragraphs.${Number(para[2]) - 1}`,
      };
  }
  return { tab: 'guide' };
}

/**
 * L'avertissement d'un Core Fusion écrit alors qu'une fusion du jeu n'a pas de
 * review : le store l'accepte (la saisie se fait une par une), le rendu du
 * guide lève au build (`core-fusion/index.tsx` : « n'a pas encore de review »).
 * Une ligne, ou aucune.
 */
function unreviewedFusionsWarning(data: CoreFusionData, fusions: Iterable<string>): string[] {
  const reviewed = new Set(data.reviews.map((r) => r.name));
  const missing = [...fusions].filter((name) => !reviewed.has(name));
  if (!missing.length) return [];
  const many = missing.length > 1;
  return [
    `${missing.length} fusion${many ? 's' : ''} sans review (${missing.join(', ')}) : le build du site refusera tant qu’${many ? 'elles n’en ont' : 'elle n’en a'} pas.`,
  ];
}

/**
 * « Enregistrer » d'un guide général : ses données entières, en un geste.
 *
 * Dans l'ordre : `was` doit être ce que le store lit encore (sinon `stale`,
 * rien n'est écrit — l'admin ou l'autre poste a écrit entre-temps) ; les
 * données sont CONTRÔLÉES sur la forme avant toute écriture (textes et tags
 * par la résolution du site, l'anglais requis où le store l'exige, noms de
 * persos dans le roster — sauf un perso « pas encore sorti » —, paliers
 * pleins, priorités, grilles d'impact, niveaux de fusion), chaque écart SITUÉ
 * à son onglet et sa clé ; puis le store écrit (`savePremiumLimited`,
 * `saveCoreFusion`, `saveFreeHeroes` — les deux fichiers de Premium & Limited
 * sont solidaires, ceux de Core Fusion aussi —, ou
 * `saveShopPriorities` sous verrou : le curé, le dérivé régénéré,
 * l'éditorial), ses refus rendus situés eux aussi — Core Fusion écrit avec
 * une fusion du jeu sans review : pas un refus, un AVERTISSEMENT, en dernière
 * ligne du journal (celle qu'un journal réussi montre replié) ; puis ce qui a BOUGÉ se
 * lit de git — le dossier du guide et, pour les shops, ses deux fichiers de
 * `data/` —, rien : rien à committer, ni stamp ; sinon `meta.updated` passe à
 * aujourd'hui (la règle de F18 : un fichier du guide a bougé, le guide est
 * re-daté) et UN commit `chore(guides): general-guides/<slug>` emporte tout,
 * le `meta.json` compris.
 */
export async function saveGeneralGuide(
  slug: string,
  body: unknown,
  deps: GeneralGuidesDeps = GENERAL_GUIDES_DEPS,
  report?: Report,
): Promise<GeneralSaveOutcome> {
  const refused: GeneralRefusal[] = [];
  const out = (
    ok: boolean,
    lines: string[],
    more: { written?: boolean; stale?: boolean } = {},
  ): GeneralSaveOutcome => ({
    ok,
    log: lines,
    written: more.written ?? false,
    stale: more.stale ?? false,
    refused,
  });
  const name = `${GENERAL_CATEGORY}/${slug}`;
  const kind = generalGuideKind(slug);
  if (!kind) return out(false, [`guide général non éditable, contenu en code : ${slug}.`]);
  const guide = deps.guides().find((g) => g.category === GENERAL_CATEGORY && g.slug === slug);
  if (!guide) return out(false, [`guide inconnu : ${name}.`]);
  const b = (isRec(body) ? body : {}) as Rec;

  const j = journal(report);
  const refuse = (r: GeneralRefusal): void => {
    refused.push(r);
    j.done(`REFUSÉ — ${name} · ${r.key ? r.key : r.tab} : ${r.reason}.`);
  };

  // Le disque, relu : ce que la page avait chargé doit être ce qu'il porte encore.
  const disk = loadGeneral(kind, deps);
  if (!sameJson(b.was, disk)) {
    refuse({ tab: 'guide', reason: 'le disque a changé depuis le chargement' });
    return out(false, [...j.lines, 'Rien à enregistrer.'], { stale: true });
  }
  const form = generalGuideForm(slug, disk) as GeneralGuideForm;
  const roster = deps.roster();
  const byName = new Map(roster.map((c) => [c.name, c]));
  const fusionLevels = new Map(
    (kind === 'core-fusion' ? deps.fusions() : []).map((f) => [f.name, f.levels]),
  );
  const clean = cleanGeneralData(form, b.data, {
    names: new Set(byName.keys()),
    steps: (heroName) => {
      const c = byName.get(heroName);
      return c ? deps.steps(c.rarity, c.id) : undefined;
    },
    levels: (heroName) => fusionLevels.get(heroName),
    refuse: (key, reason) =>
      refuse({
        tab: key ? (blockOfKey(form, key)?.tab.id ?? 'guide') : 'guide',
        ...(key ? { key } : {}),
        reason,
      }),
  });
  if (!clean) return out(false, [...j.lines, 'Rien à enregistrer.']);

  j.doing('écriture du guide');
  const payload = toStorePayload(kind, clean);
  const errors =
    kind === 'premium-limited'
      ? await deps.savePremiumLimited(payload as PremiumLimitedData)
      : kind === 'free-heroes'
        ? await deps.saveFreeHeroes(payload as FreeHeroesData)
        : kind === 'core-fusion'
          ? await deps.saveCoreFusion(payload as CoreFusionData)
          : await deps.saveShopPriorities(payload as ShopPrioritiesSaveData);
  for (const e of errors) refuse({ ...situateStoreError(kind, e), reason: e });
  if (errors.length) return out(false, [...j.lines, 'Rien à enregistrer.']);
  // Écrit : ce que le build du site refusera encore se dit, sans rien refuser ici.
  const warned =
    kind === 'core-fusion'
      ? unreviewedFusionsWarning(payload as CoreFusionData, fusionLevels.keys())
      : [];

  // Ce qui a bougé, lu de git : le dossier du guide, et pour les shops le curé et le dérivé.
  const dir = guideDirOf(GENERAL_CATEGORY, slug);
  const roots = [dir, ...(kind === 'shop-priorities' ? SHOP_DATA_FILES : [])];
  const changed = [...new Set(roots.flatMap((r) => deps.dirty(r)))];
  if (!changed.length)
    return out(true, [
      ...j.lines,
      'Rien à enregistrer : le disque porte déjà ces valeurs.',
      ...warned,
    ]);
  j.done(
    `${changed.length} fichier${changed.length > 1 ? 's' : ''} ${changed.length > 1 ? 'ont' : 'a'} bougé`,
  );
  const today = deps.today();
  const metaPath = `${dir}/meta.json`;
  if (await deps.stamp(metaPath, today)) j.done(`meta.updated : ${today}`);
  const paths = [...new Set([...changed, metaPath])];
  const commit = deps.commitPaths(paths, `chore(guides): ${name}`, report);
  // Un commit raté garde SA ligne en dernier : c'est elle que le journal montre en rouge.
  const tail = commit.ok ? [...commit.log, ...warned] : [...warned, ...commit.log];
  return out(commit.ok, [...j.lines, ...tail], { written: true });
}

export interface ImportOutcome extends Outcome {
  /** La contribution a été écrite (committée ou non). */
  imported: boolean;
  /** Son `kind`, lu de l'enveloppe. */
  kind?: string;
  summary?: string;
  /** Les refus de l'import, tels quels. */
  errors: string[];
}

/**
 * « Importer une contribution » : le JSON exporté par un outil `/contribute/*`
 * (ou glissé de Shiraen), remis TEL QUEL à `importContribution` de l'admin —
 * qui le route par son `kind`, le fusionne dans le bon store, retraduit ce
 * que l'anglais contribué impose, et écrit —, ses refus rendus tels quels.
 * Puis ce qu'il a écrit se lit de git — le dossier de Premium & Limited pour
 * une review, le curé des persos pour des pros / cons ou des synergies — et
 * part en UN commit `chore(guides): import <kind>` ; une review re-date le
 * guide (`meta.json` dans le commit). Rien n'a bougé : rien n'est committé.
 */
export async function importContributionAction(
  raw: unknown,
  deps: GeneralGuidesDeps = GENERAL_GUIDES_DEPS,
  report?: Report,
): Promise<ImportOutcome> {
  const j = journal(report);
  let kind: string;
  try {
    kind = parseContribution(raw).kind;
  } catch (e: unknown) {
    const why = e instanceof Error ? e.message : String(e);
    return { ok: false, log: [`Contribution illisible : ${why}`], imported: false, errors: [why] };
  }
  j.doing(`import d’une contribution « ${kind} »`);
  const r = await deps.importContribution(raw);
  if (!r.ok) {
    for (const e of r.errors) j.done(`REFUSÉ — ${e}`);
    return {
      ok: false,
      log: [...j.lines, 'Rien n’est écrit.'],
      imported: false,
      kind,
      errors: r.errors,
    };
  }
  j.done(r.summary);
  const review = kind === 'premium-limited-review';
  const dir = guideDirOf(GENERAL_CATEGORY, 'premium-limited');
  const changed = [...new Set(deps.dirty(review ? dir : CHARACTERS_CURATED_FILE))];
  const done = (ok: boolean, lines: string[]): ImportOutcome => ({
    ok,
    log: lines,
    imported: true,
    kind,
    summary: r.summary,
    errors: [],
  });
  if (!changed.length)
    return done(true, [
      ...j.lines,
      'Rien à committer : le disque portait déjà cette contribution.',
    ]);
  const paths = [...changed];
  if (review) {
    const today = deps.today();
    const metaPath = `${dir}/meta.json`;
    if (await deps.stamp(metaPath, today)) j.done(`meta.updated : ${today}`);
    paths.push(metaPath);
  }
  const commit = deps.commitPaths([...new Set(paths)], `chore(guides): import ${kind}`, report);
  return done(commit.ok, [...j.lines, ...commit.log]);
}

// ------------------------------------------------------------- extraction ----
//
// La section « Extraction » (lot F20, étape 19 de la migration) : la REVUE de
// maintenance de l'admin (`datagen/extractor/review.ts` — une extraction
// FRAÎCHE bâtie en mémoire depuis `.gamedata` contre ce que `data/generated/`
// committe), cible par cible, puis ses gestes : confirmer l'extraction d'une
// cible, appliquer ses retouches mineures, intégrer ou retirer un item. Dans
// l'admin ces gestes écrivaient et disaient « commit via git » ; ici ils
// COMMITTENT, comme tout quick. Le moteur pèse (il ouvre les tables du jeu) :
// il est importé à la demande, comme l'inbox du tableau de bord.

/** Une cible de l'extractor : la ligne de `datagen/extractor/targets.ts` que quick montre. */
export interface ExtractorTargetInfo {
  id: string;
  label: string;
  /** Relatif à `data/generated/`. */
  file: string;
  /** Le sous-objet d'un fichier partagé (les effets sous `glossaries.json`). */
  subKey?: string;
  /** Cible en LECTURE (`readOnly` du registre) : elle se lit, aucun geste ne l'écrit. */
  readOnly?: true;
}

/** Ce qu'une cible a à revoir, les cinq comptes de l'admin. */
export type ExtractorBuckets = DiffBuckets;

/** Une entité de la revue, nommée, son diff prêt à poser. */
export interface ExtractorEntityRow {
  key: string;
  name: string;
  status: ReviewEntityStatus;
  /** Le nombre de feuilles qui divergent (zéro pour une nouvelle ou une disparue). */
  fields: number;
  /** Le diff en arbre ; une nouvelle ou une disparue y montre toutes ses feuilles, en ajout ou en retrait. */
  diff: DiffGroup[];
  /** Hors du périmètre du site (la bascule « hors site ») : ni fiche, ni intégration. */
  offSite?: true;
}

export type ExtractorMode = 'all' | 'minor';

/** Les lectures et les écritures de la section, injectées : le moteur de revue, le disque, git. */
export interface ExtractorDeps {
  /** Les tables du jeu sont sur ce poste (sans elles, rien ne se lit ni ne s'écrit). */
  tables: () => boolean;
  /**
   * Les dix cibles, dans l'ordre de l'admin (`EXTRACTOR_ENTITIES`), et les
   * cibles en lecture du registre, chacune à la suite de celle qu'elle y suit
   * (« Skills de monstres » sous « Monstres »).
   */
  targets: () => Promise<ExtractorTargetInfo[]>;
  /** `bucketsOf` de l'admin : mémoïsé, tolérant (zéro partout sans extraction). */
  bucketsOf: (id: string) => Promise<DiffBuckets>;
  /**
   * `offSiteOf` de l'admin : les entités d'une cible hors du périmètre du site,
   * du même mémo que `bucketsOf` (aucune revue de plus), zéro sans extraction.
   */
  offSiteOf: (id: string) => Promise<number>;
  /** `reviewTarget` : le committé contre l'extraction fraîche. */
  review: (id: string) => Promise<TargetReview>;
  /** `reviewEntities` : le diff aplati en entités classées. */
  entities: (diff: TargetReview['diff']) => Promise<ReviewEntity[]>;
  /** `actionableDiff` : les monstres restreints au périmètre du site. */
  actionable: (id: string, diff: TargetReview['diff']) => Promise<TargetReview['diff']>;
  /** `targetBuild` : l'extraction fraîche d'une cible (clé → entité). */
  fresh: (id: string) => Promise<Record<string, unknown>>;
  /** Le committé d'une cible, lu du disque (`{}` s'il manque). */
  committed: (target: ExtractorTargetInfo) => Record<string, unknown>;
  /** Les résolveurs d'ids d'une cible (`diff-labels`) : les skills d'un perso, d'un monstre. */
  resolvers: (id: string) => Promise<DiffResolvers>;
  /** La signature de ce que l'écran a vu : les tables et le fichier committé. */
  signature: (target: ExtractorTargetInfo) => string;
  acceptTarget: (id: string) => Promise<AcceptReport>;
  acceptMinor: (id: string) => Promise<MinorReport>;
  integrateItem: (key: string) => Promise<IntegrateReport>;
  commitPaths: (paths: string[], message: string, report?: Report) => Outcome;
  // --- les fiches par entité et leur intégration (lot F21) ---
  /** `entityReview` : le statut d'UNE entité (added, changed, removed, same) et ses champs divergents. */
  entityReview: (id: string, key: string) => Promise<EntityReview>;
  /** Le perso frais et SES skills frais (`extractedBundle`) ; rien s'il n'est pas dans l'extraction. */
  characterBundle: (id: string) => Promise<CharacterBundle | undefined>;
  /** Le monstre frais et SES skills frais (`extractedMonsterBundle`). */
  monsterBundle: (id: string) => Promise<MonsterBundle | undefined>;
  /** `monster-skills.json` du disque : le repli des skills d'un monstre disparu du frais. */
  committedMonsterSkills: () => Record<string, Skill>;
  /** Le build d'équipement frais ENTIER (familles, pools, passifs), mémoïsé sur les tables. */
  equipment: () => Promise<EquipmentData>;
  /** Les rencontres fraîches : donjons, titres de modes, passifs de palier, quirks de compte. */
  encounters: () => Promise<EncountersData>;
  /** `encounters.json` du disque : le repli d'un donjon disparu du frais. */
  committedDungeons: () => Record<string, DungeonRef>;
  /** `glossaries.statScales` : l'échelle d'affichage de chaque stat. */
  statScales: () => Record<string, string>;
  /** Les libellés humains des passifs de palier (`rankOptionAdminLabels`). */
  rankOptionLabels: (ids: string[]) => Promise<Record<string, string>>;
  /** Les immunités d'un monstre en chips nommées, et les réfs sans entrée au glossaire. */
  immunities: (m: Monster) => Promise<{ chips: SheetChip[]; unresolved: string[] }>;
  /** Les statuts que les skills d'un perso référencent, résolus par le glossaire des effets. */
  referencedEffects: (skills: Skill[]) => Promise<ReferencedEffect[]>;
  /** Les archives figées d'un monstre (`monsterArchiveOf`), de la plus ancienne à la plus récente. */
  archives: (id: string) => Promise<MonsterArchiveEntry[]>;
  /** L'index inverse des pins (`pinIndex`) : par clé `<id>@<n>`, les guides qui l'épinglent. */
  pinners: () => Map<string, PinRef[]>;
  /** Les persos sans date de sortie une fois ce perso frais posé dans le committé (`missingReleaseDates`). */
  missingReleases: (char: Character) => Promise<MissingRelease[]>;
  /** Les intégrations du moteur — `syncDerived` (damage, solver) est DANS celles du perso, du monstre et du mode. */
  integrateCharacter: (id: string) => Promise<IntegrateReport>;
  integrateEquipment: (kind: EquipmentEntityKind, id: string) => Promise<IntegrateReport>;
  integrateMonster: (id: string) => Promise<IntegrateMonsterReport>;
  integrateMode: (mode: string) => Promise<IntegrateModeReport>;
  /** Les fichiers que `syncDerived` écrit sous `data/generated/` (damage, solver), tels qu'ils sont sur le disque. */
  derivedFiles: () => string[];
  /** L'index des sprites bruts du jeu (`buildImageIndex`), refait quand les tables bougent. */
  spriteIndex: () => ImageIndex;
}

/** Le perso frais et ses skills : la forme d'`extractedBundle`. */
export interface CharacterBundle {
  char: Character;
  skills: Record<string, unknown>;
}

/** Le monstre frais et ses skills : la forme d'`extractedMonsterBundle`. */
export interface MonsterBundle {
  monster: Monster;
  skills: Record<string, unknown>;
}

/** Une chip d'effet telle que la fiche la montre : sa ref, son nom, son icône, sa nature. */
export interface SheetChip {
  ref: string;
  name: string;
  icon?: string;
  isDebuff: boolean;
}

/** Un statut que le kit d'un perso référence, et s'il est caché du live (curé `hidden`). */
export interface ReferencedEffect {
  id: string;
  name: string;
  icon?: string;
  isDebuff: boolean;
  hidden: boolean;
}

const EXTRACTOR_EMPTY: DiffBuckets = { new: 0, diff: 0, minor: 0, typo: 0, removed: 0 };
const GENERATED_DIR = 'data/generated';

/** Le moteur de revue, importé à la demande : il ouvre les tables du jeu. */
const reviewEngine = () => import('@/lib/admin/review-store');

/** Un JSON de `data/generated/`, du disque ; `{}` s'il manque. */
function readGeneratedJson(file: string): Record<string, unknown> {
  const path = resolve(GENERATED_DIR, file);
  if (!existsSync(path)) return {};
  return JSON.parse(readFileSync(path, 'utf8')) as Record<string, unknown>;
}

/** La date d'un fichier, `absent` s'il manque — sans le délai de `fileStamp`. */
function mtimeOf(path: string): string {
  const s = statSync(path, { throwIfNoEntry: false });
  return s ? String(s.mtimeMs) : 'absent';
}

/**
 * Les skills frais et committés d'une cible (perso ou monstre), pour nommer un
 * id de skill dans un diff : l'id qui DISPARAÎT n'existe que côté committé,
 * celui qui apparaît que côté extraction. Mémoïsés sur la date des tables et
 * du fichier : `buildSkills` relit plusieurs tables.
 */
const skillsMemo = new Map<string, { stamp: string; skills: Record<string, unknown> }>();
async function skillsOf(id: 'character' | 'monster'): Promise<Record<string, unknown>> {
  const file = id === 'character' ? 'skills.json' : 'monster-skills.json';
  const stamp = `${mtimeOf(tablePath('TextSystem'))}|${mtimeOf(resolve(GENERATED_DIR, file))}`;
  const hit = skillsMemo.get(id);
  if (hit && hit.stamp === stamp) return hit.skills;
  const fresh =
    id === 'character'
      ? (await import('@datagen/generators/skills')).buildSkills().skills
      : (await import('@datagen/generators/monster-skills')).buildMonsterSkills().skills;
  const skills = { ...readGeneratedJson(file), ...fresh };
  skillsMemo.set(id, { stamp, skills });
  return skills;
}

/** Celles de la route : le moteur de l'admin, le disque, le vrai `commitPaths`. */
export const EXTRACTOR_DEPS: ExtractorDeps = {
  tables: () => existsSync(tablePath('TextSystem')),
  targets: async () => {
    const { EXTRACTOR_ENTITIES } = await import('@/lib/admin/admin-inbox');
    const { TARGETS, getTarget } = await import('@datagen/extractor/targets');
    const info = (t: (typeof TARGETS)[number]): ExtractorTargetInfo => ({
      id: t.id,
      label: t.label,
      file: t.file,
      ...(t.subKey ? { subKey: t.subKey } : {}),
      ...(t.readOnly ? { readOnly: true } : {}),
    });
    return EXTRACTOR_ENTITIES.flatMap((e) => {
      const t = getTarget(e.id);
      if (!t) return [];
      // Une cible en lecture n'est pas une entité de l'inbox : elle se range
      // sous celle qui la précède dans le registre.
      const readOnly: ExtractorTargetInfo[] = [];
      for (let i = TARGETS.indexOf(t) + 1; TARGETS[i]?.readOnly; i++)
        readOnly.push(info(TARGETS[i]));
      return [info(t), ...readOnly];
    });
  },
  bucketsOf: async (id) => (await import('@/lib/admin/admin-inbox')).bucketsOf(id),
  offSiteOf: async (id) => (await import('@/lib/admin/admin-inbox')).offSiteOf(id),
  review: async (id) => (await reviewEngine()).reviewTarget(id),
  entities: async (diff) => (await reviewEngine()).reviewEntities(diff),
  actionable: async (id, diff) =>
    (await import('@/lib/admin/monster-review')).actionableDiff(id, diff),
  fresh: async (id) => (await reviewEngine()).targetBuild(id),
  committed: (target) => {
    const raw = readGeneratedJson(target.file);
    if (!target.subKey) return raw;
    const sub = raw[target.subKey];
    return sub && typeof sub === 'object' ? (sub as Record<string, unknown>) : {};
  },
  resolvers: async (id): Promise<DiffResolvers> => {
    if (id === 'character') {
      const skills = await skillsOf('character');
      const sets = readGeneratedJson('equipment/sets.json') as Record<
        string,
        { name?: LangDict } | undefined
      >;
      return {
        skills: (sid) => skillLabel(skills[sid] as Parameters<typeof skillLabel>[0]),
        recommendedSets: (sid) => sets[sid]?.name?.en,
      };
    }
    if (id === 'monster') {
      const skills = await skillsOf('monster');
      return { skills: (sid) => skillLabel(skills[sid] as Parameters<typeof skillLabel>[0]) };
    }
    return {};
  },
  signature: (target) =>
    [
      mtimeOf(tablePath('TextSystem')),
      mtimeOf(resolve(GENERATED_DIR, target.file)),
      // Le catalogue d'items frais lit aussi le curé éditable.
      ...(target.id === 'item' ? [mtimeOf(resolve(ITEMS_CURATED_PATH))] : []),
    ].join('|'),
  acceptTarget: async (id) => (await reviewEngine()).acceptTarget(id),
  acceptMinor: async (id) => (await reviewEngine()).acceptMinor(id),
  integrateItem: async (key) => (await reviewEngine()).integrateItem(key),
  commitPaths,
  entityReview: async (id, key) => (await reviewEngine()).entityReview(id, key),
  characterBundle: async (id) => (await reviewEngine()).extractedBundle(id),
  monsterBundle: async (id) => (await reviewEngine()).extractedMonsterBundle(id),
  committedMonsterSkills,
  equipment: async () => (await import('@datagen/extractor/targets')).freshEquipment(),
  encounters: async () => (await import('@datagen/generators/encounters')).buildEncounters(),
  committedDungeons: committedEncounters,
  statScales: () => getGlossaries().statScales,
  rankOptionLabels: async (ids) => rankOptionAdminLabels(ids),
  immunities: async (m) => {
    const { effects, unresolved } = immunityChipEffects(m);
    const statuses = mergeStatusEffects({}, effects, 'en');
    return {
      chips: effects.map((e) => {
        const ref = e.tooltip ?? e.label ?? '';
        const st = statuses[ref];
        return {
          ref,
          name: st?.name ?? ref,
          ...(st?.icon ? { icon: st.icon } : {}),
          isDebuff: st?.isDebuff ?? true,
        };
      }),
      // Une réf numérique sans entrée au glossaire : le nom du tooltip du jeu la rend lisible.
      unresolved: unresolved.map((ref) => {
        const name = /^\d+$/.test(ref) ? tooltipName(ref) : undefined;
        return name ? `${ref} “${name}”` : ref;
      }),
    };
  },
  referencedEffects: async (skills) => {
    const g = getGlossaries();
    const seen = new Set<string>();
    const out: ReferencedEffect[] = [];
    for (const s of skills)
      for (const e of s.effects ?? []) {
        const effId = e.tooltip
          ? g.effectByTooltip[e.tooltip]
          : e.label && g.effectByLabel[e.label];
        if (!effId || seen.has(effId)) continue;
        seen.add(effId);
        const eff = getMergedEffect(effId);
        if (eff)
          out.push({
            id: effId,
            name: eff.name.en || effId,
            ...(eff.icon ? { icon: eff.icon } : {}),
            isDebuff: eff.isDebuff,
            hidden: eff.hidden,
          });
      }
    return out;
  },
  archives: async (id) => (await reviewEngine()).monsterArchiveOf(id),
  pinners: guidePinners,
  missingReleases: async (char) => {
    const committed = readGeneratedJson('characters.json') as Record<string, Character>;
    return missingReleaseDates({ ...committed, [char.id]: char });
  },
  integrateCharacter: async (id) => (await reviewEngine()).integrateCharacter(id),
  integrateEquipment: async (kind, id) => (await reviewEngine()).integrateEquipment(kind, id),
  integrateMonster: async (id) => (await reviewEngine()).integrateMonster(id),
  integrateMode: async (mode) => (await reviewEngine()).integrateMonsterMode(mode),
  derivedFiles: () => DERIVED_DIRS.flatMap((dir) => filesUnder(dir)),
  spriteIndex: () => {
    // Refait quand les tables bougent : un patch pulled pendant que quick
    // tourne ré-extrait aussi les images.
    const stamp = mtimeOf(tablePath('TextSystem'));
    if (!spriteMemo || spriteMemo.stamp !== stamp) spriteMemo = { stamp, index: buildImageIndex() };
    return spriteMemo.index;
  },
};

/** Les guides du site et le `config.json` de leurs versions, rangés par archive épinglée. */
function guidePinners(): Map<string, PinRef[]> {
  const guides = listGuides();
  const byName = new Map(guides.map((g) => [`${g.category}/${g.slug}`, g]));
  return pinIndex(guides, (g, version) => {
    const guide = byName.get(`${g.category}/${g.slug}`);
    return guide
      ? readGuideVersionFile<{ pinned?: unknown }>(guide, version, 'config.json')
      : undefined;
  });
}

/** Ce que `syncDerived` réécrit sous `data/generated/` : ses fichiers partent avec l'intégration. */
const DERIVED_DIRS = ['data/generated/damage', 'data/generated/solver'];

/** Les fichiers d'un dossier, récursivement, en chemins relatifs au dépôt ; rien s'il manque. */
function filesUnder(dir: string): string[] {
  const out: string[] = [];
  const walk = (rel: string): void => {
    for (const d of readdirSync(resolve(rel), { withFileTypes: true }).sort((a, b) =>
      a.name.localeCompare(b.name),
    )) {
      const path = `${rel}/${d.name}`;
      if (d.isDirectory()) walk(path);
      else if (d.isFile()) out.push(path);
    }
  };
  if (existsSync(resolve(dir))) walk(dir);
  return out;
}

let spriteMemo: { stamp: string; index: ImageIndex } | undefined;

/**
 * Le nom d'une entité d'une cible, d'après son entrée : le nom d'affichage
 * d'un perso (surnom ou « Core Fusion » compris), sinon `name.en`, sinon rien.
 */
function entityName(id: string, entry: unknown): string | undefined {
  if (!isRecord(entry)) return undefined;
  const name = entry.name;
  if (typeof name === 'string') return name || undefined;
  if (!isRecord(name)) return undefined;
  if (id === 'character' && typeof name.en === 'string')
    return characterDisplayName(entry as Parameters<typeof characterDisplayName>[0]) || undefined;
  // Un skill de monstre sans nom localisé (finisher, passif d'IA) : son type.
  if (id === 'monster-skill') return skillLabel(entry as Parameters<typeof skillLabel>[0]);
  return typeof name.en === 'string' && name.en ? name.en : undefined;
}

/** Les comptes d'une liste d'entités classées. */
function bucketsOfEntities(entities: ReviewEntity[]): DiffBuckets {
  const b: DiffBuckets = { ...EXTRACTOR_EMPTY };
  for (const e of entities) b[e.status]++;
  return b;
}

const EXTRACTOR_STATUSES: readonly ReviewEntityStatus[] = [
  'new',
  'diff',
  'minor',
  'typo',
  'removed',
];

/** Le rang de tri d'un statut : les vrais écarts d'abord, comme la sidebar de l'admin. */
const statusRank = (s: ReviewEntityStatus): number =>
  s === 'diff' ? 0 : s === 'new' ? 1 : s === 'removed' ? 2 : 3;

/** Le `?status=` de la bascule « hors site » de la cible monster. */
export const OFF_SITE_STATUS = 'offsite';

type ReviewDiff = TargetReview['diff'];

/**
 * Un diff partagé en deux : ce que le site sert (`actionableDiff`) et ce qu'il
 * écarte — les entités HORS du périmètre du site. Le complément de ce qu'il
 * garde, sans relire le périmètre : vide quand rien n'est filtré (une autre
 * cible que les monstres, ou un périmètre qui ne se calcule pas).
 */
async function splitBySite(
  id: string,
  diff: ReviewDiff,
  deps: ExtractorDeps,
): Promise<{ site: ReviewDiff; off: ReviewDiff }> {
  const site = await deps.actionable(id, diff);
  const kept = new Set([...site.added, ...site.removed, ...site.changed.map((c) => c.key)]);
  return {
    site,
    off: {
      ...diff,
      added: diff.added.filter((k) => !kept.has(k)),
      removed: diff.removed.filter((k) => !kept.has(k)),
      changed: diff.changed.filter((c) => !kept.has(c.key)),
    },
  };
}

/**
 * La vue d'ensemble : les cibles, chacune avec ses cinq comptes (ceux de
 * l'inbox — les monstres au périmètre du site), son fichier et le nombre
 * d'entités committées. La ligne des monstres dit de plus ce que le diff
 * complet porte HORS du site (`offSite`) : ses comptes restent ceux du site.
 * Les uns et l'autre sortent du mémo de l'inbox (`bucketsOf`, `offSiteOf`) :
 * la vue d'ensemble ne lance aucune revue elle-même, et rien à empreinte égale.
 * Sans tables du jeu sur le poste, les comptes sont à zéro et `tables` le dit
 * avec sa raison : rien ne se lit.
 */
export async function extractorOverview(deps: ExtractorDeps = EXTRACTOR_DEPS) {
  const tables = deps.tables();
  const targets = await deps.targets();
  const rows = [];
  for (const t of targets) {
    const buckets = tables ? await deps.bucketsOf(t.id) : EXTRACTOR_EMPTY;
    rows.push({
      id: t.id,
      label: t.label,
      file: t.file,
      site: t.id === 'monster',
      ...(t.id === 'monster' ? { offSite: tables ? await deps.offSiteOf(t.id) : 0 } : {}),
      ...(t.readOnly ? { readOnly: true as const } : {}),
      sheet: isSheetTarget(t.id),
      committed: Object.keys(deps.committed(t)).length,
      buckets,
      actionable: buckets.new + buckets.diff + buckets.removed,
      soft: buckets.minor + buckets.typo,
    });
  }
  return { tables, ...(tables ? {} : { reason: NO_GAME_DATA }), targets: rows };
}

/**
 * Une cible ouverte : ses entités classées et nommées, triées comme la sidebar
 * de l'admin (vrais écarts, nouvelles, disparues, puis retouches ; à statut
 * égal les plus touchées d'abord, puis par clé), filtrées par `status` et par
 * `q` (la règle d'Effets — chaque mot commence un mot — sur le nom et la clé),
 * chacune avec son diff en arbre (`diffTree`, les ids résolus). Les monstres
 * sont au périmètre du SITE, comme les comptes ; `offSite` compte ceux que le
 * diff complet porte en plus, et `status: 'offsite'` (la bascule « hors site »)
 * montre CEUX-LÀ à la place, tous statuts confondus, cherchés par `q` de même
 * — les comptes et `total` restent ceux du site. `was` est la signature de ce
 * que l'écran voit : un geste la renvoie, et refuse si elle a bougé.
 */
export async function extractorTarget(
  id: string,
  opts: { status?: string | null; q?: string | null } = {},
  deps: ExtractorDeps = EXTRACTOR_DEPS,
) {
  const target = (await deps.targets()).find((t) => t.id === id);
  if (!target) return { error: `cible inconnue : ${id}`, status: 404 } as const;
  const base = {
    id: target.id,
    label: target.label,
    file: target.file,
    site: id === 'monster',
    ...(target.readOnly ? { readOnly: true as const } : {}),
    /** Les entités de cette cible ont une fiche (`#extractor/<cible>/<clé>`). */
    sheet: isSheetTarget(id),
  };
  if (!deps.tables())
    return {
      ...base,
      tables: false as const,
      reason: NO_GAME_DATA,
      buckets: EXTRACTOR_EMPTY,
      total: 0,
      shown: 0,
      ...(base.site ? { offSite: 0 } : {}),
      entities: [] as ExtractorEntityRow[],
      was: '',
    };
  const review = await deps.review(id);
  const { site, off } = await splitBySite(id, review.diff, deps);
  const all = await deps.entities(site);
  const outside = base.site ? await deps.entities(off) : [];
  const offSite = base.site && opts.status === OFF_SITE_STATUS;
  const pool = offSite ? outside : all;
  const fresh = await deps.fresh(id);
  const committed = deps.committed(target);
  const nameOf = (key: string): string =>
    entityName(id, fresh[key]) ?? entityName(id, committed[key]) ?? key;
  // Une nouvelle (une disparue) n'a pas de diff : son dépliant montre toutes
  // ses feuilles en ajout (en retrait), prises dans le frais (le committé) déjà
  // lu. L'affichage seul : `fields`, le tri et les comptes restent ceux du diff.
  const shownFields = (e: ReviewEntity) =>
    e.status === 'new'
      ? addedFields(fresh[e.key])
      : e.status === 'removed'
        ? removedFields(committed[e.key])
        : e.fields;
  const status = EXTRACTOR_STATUSES.find((s) => s === opts.status);
  const q = typeof opts.q === 'string' ? opts.q.trim() : '';
  const named = pool.map((e) => ({ ...e, name: nameOf(e.key), shown: shownFields(e) }));
  const labels = diffLabels(
    named.flatMap((e) => e.shown),
    await deps.resolvers(id),
  );
  const entities: ExtractorEntityRow[] = named
    .filter((e) => !status || e.status === status)
    .filter(
      (e) => !q || effectMatches(effectHaystack({ id: e.key, keys: [], name: { en: e.name } }), q),
    )
    .sort(
      (a, b) =>
        statusRank(a.status) - statusRank(b.status) ||
        b.fields.length - a.fields.length ||
        a.key.localeCompare(b.key, undefined, { numeric: true }),
    )
    .map((e) => ({
      key: e.key,
      name: e.name,
      status: e.status,
      fields: e.fields.length,
      diff: diffTree(e.shown, labels),
      ...(offSite ? { offSite: true as const } : {}),
    }));
  return {
    ...base,
    tables: true as const,
    buckets: bucketsOfEntities(all),
    total: all.length,
    shown: entities.length,
    ...(base.site ? { offSite: outside.length } : {}),
    entities,
    was: deps.signature(target),
    // La cible monster porte le `select` de « Intégrer un mode ».
    ...(id === 'monster'
      ? { modes: await modeOptions(fresh as Record<string, Monster>, deps) }
      : {}),
  };
}

/** Le bilan d'images d'une écriture, en lignes de journal. */
function assetLines(assets: StageResult | undefined): string[] {
  if (!assets) return [];
  const lines = [
    `images : ${assets.staged} produite${assets.staged > 1 ? 's' : ''}, ${assets.restaged} refaite${assets.restaged > 1 ? 's' : ''}, ${assets.present} déjà là${assets.missing.length ? `, ${assets.missing.length} manquante${assets.missing.length > 1 ? 's' : ''}` : ''} — le staging part avec « Committer » de la section Patch.`,
  ];
  for (const m of assets.missing) lines.push(`image manquante : ${m.key} — ${m.reason}`);
  return lines;
}

export interface ExtractorOutcome extends Outcome {
  /** L'écran a vu autre chose que le disque : relire. */
  stale?: boolean;
  assets?: StageResult | null;
  typo?: number;
  minor?: number;
}

/** La porte des gestes : une cible qui s'écrit, les tables du jeu, puis la signature. */
async function extractorGate(
  id: string,
  was: unknown,
  deps: ExtractorDeps,
): Promise<{ target: ExtractorTargetInfo } | { refused: ExtractorOutcome }> {
  const target = (await deps.targets()).find((t) => t.id === id);
  if (!target) return { refused: { ok: false, log: [`cible inconnue : ${id}`] } };
  if (target.readOnly)
    return {
      refused: {
        ok: false,
        log: [
          `Rien n’est écrit — ${target.label} est une cible en lecture : data/generated/${target.file} part avec ses monstres (« Promouvoir » de la section Patch, ou « Intégrer » d’un monstre), jamais d’ici.`,
        ],
      },
    };
  if (!deps.tables())
    return { refused: { ok: false, log: [`Rien n’est écrit — ${NO_GAME_DATA}`] } };
  if (was !== deps.signature(target))
    return {
      refused: {
        ok: false,
        stale: true,
        log: [
          `Rien n’est écrit — ${target.label} : les tables du jeu ou data/generated/${target.file} ont changé depuis la lecture, la cible est relue.`,
        ],
      },
    };
  return { target };
}

/**
 * « Confirmer l'extraction » (`all` : `acceptTarget`, le fichier ENTIER
 * réécrit — nouvelles et disparues comprises, tout-ou-rien) ou « Appliquer les
 * retouches mineures » (`minor` : `acceptMinor`, les seules entités typo ou
 * mineures fusionnées) d'une cible, puis UN commit du fichier. Refusé AVANT
 * d'écrire pour une cible en lecture, sans tables du jeu, ou si l'écran a vu
 * autre chose (`stale`). Les
 * images des entités validées que l'écriture touche sont stagées par le
 * moteur ; le bilan va au journal, et la section Patch pousse le staging.
 */
export async function acceptExtraction(
  id: string,
  body: { mode?: unknown; was?: unknown },
  deps: ExtractorDeps = EXTRACTOR_DEPS,
  report?: Report,
): Promise<ExtractorOutcome> {
  const mode: ExtractorMode = body.mode === 'minor' ? 'minor' : 'all';
  const gate = await extractorGate(id, body.was, deps);
  if ('refused' in gate) return gate.refused;
  const { target } = gate;
  const path = `${GENERATED_DIR}/${target.file}`;
  const j = journal(report);
  if (mode === 'all') {
    j.doing(`${target.label} : écriture de l’extraction fraîche, entière, dans ${path}`);
    const r = await deps.acceptTarget(id);
    j.done(`${target.label} : extraction confirmée — ${path} réécrit en entier.`);
    for (const l of assetLines(r.assets)) j.done(l);
    const commit = deps.commitPaths(
      [path],
      `chore(extractor): ${id} — extraction confirmee`,
      report,
    );
    return { ok: commit.ok, log: [...j.lines, ...commit.log], assets: r.assets ?? null };
  }
  j.doing(`${target.label} : retouches mineures dans ${path}`);
  const r = await deps.acceptMinor(id);
  const n = r.typo + r.minor;
  if (!n)
    return {
      ok: true,
      log: [`${target.label} : aucune retouche mineure à appliquer.`],
      assets: null,
      typo: 0,
      minor: 0,
    };
  j.done(
    `${target.label} : ${r.minor} retouche${r.minor > 1 ? 's' : ''} mineure${r.minor > 1 ? 's' : ''} et ${r.typo} coquille${r.typo > 1 ? 's' : ''} appliquées dans ${path}.`,
  );
  for (const l of assetLines(r.assets)) j.done(l);
  const commit = deps.commitPaths(
    [path],
    `chore(extractor): ${id} — ${n} retouche${n > 1 ? 's' : ''} mineure${n > 1 ? 's' : ''}`,
    report,
  );
  return {
    ok: commit.ok,
    log: [...j.lines, ...commit.log],
    assets: r.assets ?? null,
    typo: r.typo,
    minor: r.minor,
  };
}

/**
 * « Intégrer » ou « Retirer » UN item de la revue (`integrateItem` : son entrée
 * fraîche reportée dans `items.json` — créée, mise à jour, ou supprimée quand
 * l'id a disparu du frais — et son icône stagée), puis UN commit. Même porte
 * que les acceptations : tables du jeu, signature.
 */
export async function integrateItemAction(
  key: unknown,
  was: unknown,
  deps: ExtractorDeps = EXTRACTOR_DEPS,
  report?: Report,
): Promise<ExtractorOutcome & { removed?: boolean }> {
  const id = typeof key === 'string' ? key.trim() : '';
  if (!id) return { ok: false, log: ['Aucun item.'] };
  const gate = await extractorGate('item', was, deps);
  if ('refused' in gate) return gate.refused;
  const { target } = gate;
  const fresh = await deps.fresh('item');
  const committed = deps.committed(target);
  if (!(id in fresh) && !(id in committed)) return { ok: false, log: [`item inconnu : ${id}`] };
  const name = entityName('item', fresh[id]) ?? entityName('item', committed[id]) ?? id;
  const removed = !(id in fresh);
  const j = journal(report);
  j.doing(`${name} (${id}) : ${removed ? 'retrait de' : 'intégration dans'} items.json`);
  const r = await deps.integrateItem(id);
  j.done(
    `${name} (${id}) : ${removed ? 'retiré de' : 'intégré dans'} ${r.files.map((f) => `${GENERATED_DIR}/${f}`).join(', ')}.`,
  );
  for (const l of assetLines(r.assets)) j.done(l);
  const commit = deps.commitPaths(
    r.files.map((f) => `${GENERATED_DIR}/${f}`),
    `chore(extractor): item ${name} (${id})`,
    report,
  );
  return { ok: commit.ok, log: [...j.lines, ...commit.log], assets: r.assets, removed };
}

// ------------------------------------------------------- fiches d'extraction ----
//
// Les FICHES par entité de la section « Extraction » (lot F21, étape 20 de la
// migration) : ce que l'extraction fraîche propose pour UN perso, UN monstre ou
// UNE entité d'équipement — ce que montraient les pages de l'extractor de
// l'ancien panneau admin —, et le geste « Intégrer » qui l'écrit dans `data/generated/`
// et COMMITTE. S'y ajoutent « Intégrer un mode » (tous les monstres d'un mode
// de jeu) et la route des sprites bruts du jeu, que les icônes des monstres et
// des skills frais n'ont qu'ici.

/** Les cibles qui ont une fiche : le perso, le monstre, l'équipement par famille (pas les armures). */
export type SheetTarget = 'character' | 'monster' | GearTarget;
export const SHEET_TARGETS: readonly SheetTarget[] = [
  'character',
  'monster',
  'ee',
  'weapon',
  'amulet',
  'talisman',
  'set',
];
export const isSheetTarget = (id: string): id is SheetTarget =>
  (SHEET_TARGETS as readonly string[]).includes(id);

/** L'adresse d'un sprite brut, sur la route de quick (`GET /api/sprite/<nom>`, `SPRITE_ROUTE`). */
const spriteSrc = (name: string): string => `${SPRITE_ROUTE}/${encodeURIComponent(name)}`;

/** Un nom de sprite : un basename, sans chemin ; l'extension est ignorée. */
const SPRITE_NAME = /^[\w.-]+$/;
const SPRITE_TYPES: Record<string, string> = {
  png: 'image/png',
  webp: 'image/webp',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
};

/**
 * Le fichier d'un sprite brut de `.gamedata/extracted/images`, par basename
 * (la règle de l'ancienne route de sprites du panneau admin : insensible à la casse, extension
 * tolérée) ; `null` pour un nom qui n'en est pas un ou un sprite absent.
 */
export function spriteFile(
  name: string,
  index: ImageIndex = EXTRACTOR_DEPS.spriteIndex(),
): { file: string; type: string } | null {
  if (!SPRITE_NAME.test(name)) return null;
  const file = index.get(name.toLowerCase().replace(/\.(png|webp|jpe?g)$/i, ''));
  if (!file) return null;
  const ext = file.split('.').pop()?.toLowerCase() ?? '';
  return { file, type: SPRITE_TYPES[ext] ?? 'application/octet-stream' };
}

/** Un mode de jeu du `select` de « Intégrer un mode ». */
export interface ModeOption {
  value: string;
  label: string;
}

/**
 * Les modes où un monstre frais spawne : une option par slug (« Intégrer un
 * mode » en intègre UN), dans l'ordre et sous les titres des groupes du damage
 * calc du site (`gameModeGroups`, titrés par l'extraction fraîche) — un titre
 * que plusieurs slugs portent est suffixé du slug, un mode sans groupe ferme la
 * liste sous « Autres » (`modeOptionsOf`).
 */
async function modeOptions(
  fresh: Record<string, Monster>,
  deps: ExtractorDeps,
): Promise<ModeOption[]> {
  const enc = await deps.encounters();
  const seen = new Set<string>();
  for (const m of Object.values(fresh))
    for (const s of m.spawns ?? []) {
      const mode = enc.dungeons[s.dungeon]?.mode;
      if (mode) seen.add(mode);
    }
  return modeOptionsOf(gameModeGroups(enc.dungeons, DEFAULT_LANG, enc), [...seen]);
}

/** Une ligne de stats extraites d'un perso : la fourchette du Lv 1 au Lv 100. */
export interface SheetStat {
  slug: string;
  abbr: string;
  value: string;
}

/** Une carte de skill telle que la fiche la montre : nom, type, description résolue, icône, chips. */
export interface SheetCard {
  id: string;
  name: string;
  type: string;
  /** Le type, et pour un `rage_enterN` le déclencheur réel (« rage_enter — à 70 % PV »). */
  typeLabel: string;
  desc?: string;
  iconSrc?: string;
  chips: SheetChip[];
}

/** Les types de monstres qui portent le badge « BOSS » (les mêmes que l'admin). */
const SLOT_FRAME_GRADE: Record<string, string> = {
  normal: 'normal',
  magic: 'magic',
  rare: 'rare',
  unique: 'unique',
};

/** Ce que l'écran a besoin de savoir d'un perso frais. */
export interface CharacterSheet {
  id: string;
  name: string;
  element: string;
  class: string;
  subClass?: string;
  race: string;
  rarity: number;
  chain?: string;
  portrait: string;
  stats: SheetStat[];
  tags: { slug: string; label: string; group?: string; detail?: string }[];
  cards: SheetCard[];
  effects: ReferencedEffect[];
  costumes: string[];
  /** Les persos sans date de sortie une fois celui-ci intégré : le geste est REFUSÉ tant qu'ils y sont. */
  missing: MissingRelease[];
}

/** Ce que l'écran a besoin de savoir d'un monstre : le frais, ou le committé d'un disparu. */
export interface MonsterSheet {
  id: string;
  name: string;
  nickname?: string;
  type: string;
  element: string;
  class: string;
  subClass?: string;
  race: string;
  rarity: number;
  aiType?: string;
  iconSrc: string;
  slotSrc: string;
  badgeSrc?: string;
  /** Vrai quand seul le committé le connaît : rien à intégrer. */
  committedOnly: boolean;
  stats: MonsterStatsSheet;
  encounters: ReturnType<typeof monsterEncounters>;
  relations: ReturnType<typeof monsterRelations>;
  immunities: { chips: SheetChip[]; unresolved: string[] };
  cards: SheetCard[];
  archives: {
    key: string;
    version: number;
    ref: string;
    committedAt: string;
    gameVersion?: string;
    label?: string;
    skills: number;
    /** Qui l'épingle (l'index inverse des guides) ; vide : orpheline. */
    pinnedBy: PinRef[];
  }[];
}

type SpritedPassive = GearPassiveView & { iconSrc: string };

/** Ce que l'écran a besoin de savoir d'une entité d'équipement fraîche : la fiche, ses sprites adressés. */
export interface GearSheetView extends Omit<GearSheet, 'passives' | 'classVariants' | 'pieces'> {
  iconSrc: string;
  /** Le cadre de rareté du site, derrière le sprite. */
  frame: string;
  passives: SpritedPassive[];
  classVariants?: (Omit<GearClassVariantView, 'passives'> & {
    iconSrc: string;
    passives: SpritedPassive[];
  })[];
  pieces?: { slot: string; icon: string; iconSrc: string }[];
}

/** Ce que « Intégrer » va écrire, en clair, et le message du commit. */
export interface IntegratePlan {
  files: string[];
  commit: string;
}

const integrateMessage = (target: string, name: string, key: string): string =>
  `chore(extractor): ${target} ${name} (${key}) integre`;

/** Les fichiers de `syncDerived`, dits une fois dans un plan. */
const DERIVED_PLAN = 'data/generated/damage/* et data/generated/solver/* (re-dérivés)';

const withSprite = <T extends { icon: string }>(p: T): T & { iconSrc: string } => ({
  ...p,
  iconSrc: spriteSrc(p.icon),
});

/**
 * La fiche d'une entité (`#extractor/<cible>/<clé>`) : son statut de revue et
 * son diff en arbre (celui de F20), la fiche selon la cible — le perso frais
 * (stats, tags détectés, cartes de skills aux icônes du jeu, statuts
 * référencés, costumes, et les dates de sortie qui MANQUERAIENT), le monstre
 * (stats par rencontre, rencontres, relations, immunités, skills, archives
 * figées — le committé en repli pour un monstre disparu), l'équipement par
 * famille depuis le FRAIS —, le PLAN de son intégration, les liens croisés,
 * et `was`, la signature que le geste renverra. Sans tables du jeu, rien ne se
 * lit et la réponse le dit.
 */
export async function extractorEntity(
  target: string,
  key: string,
  deps: ExtractorDeps = EXTRACTOR_DEPS,
) {
  const t = (await deps.targets()).find((x) => x.id === target);
  if (!t) return { error: `cible inconnue : ${target}`, status: 404 } as const;
  if (!isSheetTarget(target))
    return { error: `pas de fiche pour la cible ${target}`, status: 404 } as const;
  const base = { target, label: t.label, file: t.file, key };
  if (!deps.tables()) return { ...base, tables: false as const, reason: NO_GAME_DATA, was: '' };

  const review = await deps.entityReview(target, key);
  const labels = diffLabels(review.fields, await deps.resolvers(target));
  const common = {
    ...base,
    tables: true as const,
    /** Le statut de revue de l'entité : added, changed, removed, same. */
    review: review.status,
    fields: review.fields.length,
    diff: diffTree(review.fields, labels),
    was: deps.signature(t),
  };

  if (target === 'character') {
    const bundle = await deps.characterBundle(key);
    if (!bundle) return { ...common, character: null, plan: null, links: {} };
    const c = bundle.char;
    const skills = Object.values(bundle.skills) as Skill[];
    const cards: SheetCard[] = characterKitCards(bundle, spriteSrc).map((card) => ({
      id: card.id,
      name: card.name,
      type: card.type,
      typeLabel: card.type,
      ...(card.desc ? { desc: card.desc } : {}),
      ...(card.iconSrc ? { iconSrc: card.iconSrc } : {}),
      chips: card.chips,
    }));
    const character: CharacterSheet = {
      id: c.id,
      name: characterDisplayName(c),
      element: c.element,
      class: c.class,
      ...(c.subClass ? { subClass: c.subClass } : {}),
      race: c.race,
      rarity: c.rarity,
      ...(c.chainType ? { chain: c.chainType } : {}),
      portrait: spriteSrc(`CT_${c.id}`),
      stats: Object.entries(c.stats).map(([slug, r]) => ({
        slug,
        abbr: statAbbr(slug),
        value: r.min === r.max ? String(r.max) : `${r.min} – ${r.max}`,
      })),
      tags: (c.tags ?? []).map((slug) => {
        const group = tagDef(slug)?.group;
        return {
          slug,
          label: tagLabel(slug, 'en'),
          ...(group ? { group } : {}),
          ...(slug === 'ignore-defense' && c.ignoreDefense
            ? { detail: c.ignoreDefense.join(' + ') }
            : {}),
        };
      }),
      cards,
      effects: await deps.referencedEffects(skills),
      costumes: (c.costumes ?? []).map((x) => x.name.en),
      missing: await deps.missingReleases(c),
    };
    const plan: IntegratePlan = {
      files: [
        'characters.json',
        'skills.json',
        'characters-slug-to-id.json',
        'character-release.json',
        DERIVED_PLAN,
        'les images du perso et de ses skills, stagées',
      ],
      commit: integrateMessage('character', character.name, key),
    };
    return {
      ...common,
      character,
      plan,
      links: { sheet: `character/${key}` },
    };
  }

  if (target === 'monster') {
    const bundle = await deps.monsterBundle(key);
    const committedM = deps.committed(t)[key] as Monster | undefined;
    const m = bundle?.monster ?? committedM;
    if (!m) return { ...common, monster: null, plan: null, links: {} };
    // Les skills : le frais par-dessus le committé — ceux d'un disparu n'existent que là.
    const catalog: Record<string, Skill | undefined> = {
      ...deps.committedMonsterSkills(),
      ...((bundle?.skills ?? {}) as Record<string, Skill>),
    };
    const enc = await deps.encounters();
    const src: DungeonSources = {
      dungeons: enc.dungeons,
      modes: enc.modes,
      fallback: deps.committedDungeons(),
    };
    const contexts = monsterStatContexts(m, src);
    const optionLabels = await deps.rankOptionLabels(contexts.flatMap((x) => x.options ?? []));
    const allFresh = (await deps.fresh('monster')) as Record<string, Monster>;
    const pinners = deps.pinners();
    // Les cartes sous les RÈGLES SEULES (aucune curation) : la fiche montre ce
    // que le jeu dit ; le câblage des chips est l'onglet Monstres.
    const { cards, chips } = monsterKitCards(m, catalog, {
      chipOwner: {},
      chipHide: {},
      chipAdd: {},
    });
    const chipOf = (buff: string): SheetChip => {
      const c = chips.find((x) => x.buff === buff);
      return {
        ref: buff,
        name: c?.name ?? buff,
        ...(c?.icon ? { icon: c.icon } : {}),
        isDebuff: c?.isDebuff ?? false,
      };
    };
    const monster: MonsterSheet = {
      id: m.id,
      name: m.name.en || '(sans nom)',
      ...(m.nickname?.en ? { nickname: m.nickname.en } : {}),
      type: m.type,
      element: m.element,
      class: m.class,
      ...(m.subClass ? { subClass: m.subClass } : {}),
      race: m.race,
      rarity: m.rarity,
      ...(m.aiType ? { aiType: m.aiType } : {}),
      iconSrc: monsterIconSrc(m.icon, SPRITE_ROUTE),
      slotSrc: monsterSlotSrc(m.type, SPRITE_ROUTE),
      ...(monsterBossBadgeSrc(m.type, SPRITE_ROUTE)
        ? { badgeSrc: monsterBossBadgeSrc(m.type, SPRITE_ROUTE) }
        : {}),
      committedOnly: !bundle,
      stats: monsterStatsSheet(
        m.stats,
        contexts,
        deps.statScales(),
        enc.bossQuirkMods,
        optionLabels,
      ),
      encounters: monsterEncounters(m, src),
      relations: monsterRelations(m, allFresh),
      immunities: await deps.immunities(m),
      cards: cards.map((card) => {
        const rage = monsterRageLabel(m, card.type);
        return {
          id: card.id,
          name: card.name || '(sans nom)',
          type: card.type,
          typeLabel: rage ? `${card.type} — ${rage}` : card.type,
          ...(card.desc ? { desc: card.desc } : {}),
          ...(card.icon ? { iconSrc: spriteSrc(card.icon) } : {}),
          chips: card.chips.map(chipOf),
        };
      }),
      archives: (await deps.archives(key)).map((a) => ({
        key: `${a.id}@${a.version}`,
        version: a.version,
        ref: a.ref,
        committedAt: a.committedAt,
        ...(a.gameVersion ? { gameVersion: a.gameVersion } : {}),
        ...(a.label ? { label: a.label } : {}),
        skills: Object.keys(a.skills).length,
        pinnedBy: pinners.get(`${a.id}@${a.version}`) ?? [],
      })),
    };
    const plan: IntegratePlan | null = bundle
      ? {
          files: [
            'monsters.json',
            'monster-skills.json',
            ...(m.spawns?.length ? ['encounters.json (ses donjons)'] : []),
            DERIVED_PLAN,
          ],
          commit: integrateMessage('monster', monster.name, key),
        }
      : null;
    return { ...common, monster, plan, links: { chips: `monsters/${key}` } };
  }

  // L'équipement : la famille, l'EE ou le set, lu du build frais entier.
  const sheet = gearSheet(await deps.equipment(), target, key);
  if (!sheet) return { ...common, gear: null, plan: null, links: {} };
  const { passives, classVariants, pieces, ...rest } = sheet;
  const gear: GearSheetView = {
    ...rest,
    iconSrc: spriteSrc(sheet.icon),
    frame: img.slotFrame(SLOT_FRAME_GRADE[sheet.grade] ?? 'normal'),
    passives: passives.map(withSprite),
    ...(classVariants
      ? {
          classVariants: classVariants.map((v) => ({
            ...withSprite(v),
            passives: v.passives.map(withSprite),
          })),
        }
      : {}),
    ...(pieces ? { pieces: pieces.map(withSprite) } : {}),
  };
  const { kind, familyKey } = GEAR_TARGETS[target];
  const plan: IntegratePlan = {
    files: [
      `equipment/${kind === 'accessory' ? 'accessory' : kind === 'set' ? 'sets' : kind}.json${familyKey ? ' (toute la famille)' : ''}`,
      ...(familyKey ? ['equipment/families.json'] : []),
      'equipment/pools.json, passives.json, breakLimits.json (les records référencés)',
      'les icônes de la famille et de ses passifs, stagées',
    ],
    commit: integrateMessage(target, sheet.name.en, sheet.id),
  };
  return {
    ...common,
    gear,
    plan,
    links: sheet.characterId ? { sheet: `character/${sheet.characterId}/ee` } : {},
  };
}

/** Ce que rend « Intégrer » : l'issue, le bilan d'images, les dates manquantes d'un refus. */
export interface IntegrateOutcome extends ExtractorOutcome {
  missing?: MissingRelease[];
}

/** Les fichiers d'un rapport, sous `data/generated/`, plus ceux que `syncDerived` a réécrits. */
const integratedPaths = (files: string[], deps: ExtractorDeps, derived: boolean): string[] => [
  ...new Set([
    ...files.map((f) => `${GENERATED_DIR}/${f}`),
    ...(derived ? deps.derivedFiles() : []),
  ]),
];

/**
 * « Intégrer » (ou « Ré-intégrer ») UNE entité, puis UN commit : le perso
 * (`integrateCharacter` — entité, skills, slugs, dates de sortie, images,
 * `syncDerived`), le monstre (`integrateMonster` — entité, skills, donjons,
 * `syncDerived`), l'équipement (`integrateEquipment` — la famille entière,
 * `families.json`, les records référencés, les icônes). Même porte que les
 * gestes de F20 : tables du jeu, signature `was`. Un perso dont la date de
 * sortie manque est REFUSÉ avant d'écrire, avec la clé à ajouter au curé —
 * la garde de `releasesFor`, rendue sans exception. Les fichiers de
 * `syncDerived` (`data/generated/damage`, `solver`) partent dans le même
 * commit ; `data/extracted/solver` n'est pas suivi par git.
 */
export async function integrateEntity(
  target: string,
  key: unknown,
  was: unknown,
  deps: ExtractorDeps = EXTRACTOR_DEPS,
  report?: Report,
): Promise<IntegrateOutcome> {
  const id = typeof key === 'string' ? key.trim() : '';
  if (!id) return { ok: false, log: ['Aucune entité.'] };
  if (!isSheetTarget(target)) return { ok: false, log: [`pas de fiche pour la cible ${target}`] };
  const gate = await extractorGate(target, was, deps);
  if ('refused' in gate) return gate.refused;
  const j = journal(report);

  if (target === 'character') {
    const bundle = await deps.characterBundle(id);
    if (!bundle) return { ok: false, log: [`perso ${id} absent de l’extraction fraîche`] };
    const name = characterDisplayName(bundle.char);
    const missing = await deps.missingReleases(bundle.char);
    if (missing.length)
      return {
        ok: false,
        missing,
        log: [
          `Rien n’est écrit — ${missing.length > 1 ? `${missing.length} persos n’ont` : `${missing[0].label || missing[0].id} (${missing[0].id}) n’a`} de date de sortie d’aucune source : ajouter ${missing.map((m) => `« ${m.id} »`).join(', ')} à ${RELEASE_CURATED_PATH} (à la main, « id » : « AAAA-MM-JJ »), puis relire la fiche.`,
        ],
      };
    j.doing(
      `${name} (${id}) : intégration dans ${GENERATED_DIR} (entité, skills, slugs, dates de sortie), images, re-dérivation damage et solver`,
    );
    const r = await deps.integrateCharacter(id);
    j.done(`${name} (${id}) : intégré — ${r.files.join(', ')} ; damage et solver re-dérivés.`);
    for (const l of assetLines(r.assets)) j.done(l);
    const commit = deps.commitPaths(
      integratedPaths(r.files, deps, true),
      integrateMessage('character', name, id),
      report,
    );
    return { ok: commit.ok, log: [...j.lines, ...commit.log], assets: r.assets };
  }

  if (target === 'monster') {
    const bundle = await deps.monsterBundle(id);
    if (!bundle) return { ok: false, log: [`monstre ${id} absent de l’extraction fraîche`] };
    const name = bundle.monster.name.en || id;
    j.doing(
      `${name} (${id}) : intégration dans ${GENERATED_DIR} (entité, skills, donjons), re-dérivation damage et solver`,
    );
    const r = await deps.integrateMonster(id);
    j.done(`${name} (${id}) : intégré — ${r.files.join(', ')} ; damage et solver re-dérivés.`);
    const commit = deps.commitPaths(
      integratedPaths(r.files, deps, true),
      integrateMessage('monster', name, id),
      report,
    );
    return { ok: commit.ok, log: [...j.lines, ...commit.log], assets: null };
  }

  const sheet = gearSheet(await deps.equipment(), target, id);
  if (!sheet) return { ok: false, log: [`${target} ${id} absent de l’extraction fraîche`] };
  const name = sheet.name.en || sheet.id;
  const { kind } = GEAR_TARGETS[target];
  j.doing(
    `${name} (${sheet.id}) : intégration dans ${GENERATED_DIR}/equipment (${sheet.kind === 'family' ? 'la famille entière, families.json' : sheet.kind}, les records référencés), icônes`,
  );
  const r = await deps.integrateEquipment(kind, sheet.id);
  j.done(`${name} (${sheet.id}) : intégré — ${r.files.join(', ')}.`);
  for (const l of assetLines(r.assets)) j.done(l);
  const commit = deps.commitPaths(
    integratedPaths(r.files, deps, false),
    integrateMessage(target, name, sheet.id),
    report,
  );
  return { ok: commit.ok, log: [...j.lines, ...commit.log], assets: r.assets };
}

/** Le PLAN d'« Intégrer un mode » : les monstres qui seraient écrits. */
export interface ModePlan {
  mode: string;
  label: string;
  /** Les spawnés du mode, puis leurs adds, par id. */
  ids: { id: string; name: string; add: boolean }[];
  count: number;
  commit: string;
  was: string;
}

const modeMessage = (mode: string, n: number): string =>
  `chore(extractor): mode ${mode} — ${n} monstre${n > 1 ? 's' : ''} integre${n > 1 ? 's' : ''}`;

/** Les ids qu'`integrateMonsterMode` écrirait : les spawnés du mode et leurs adds (sa règle, rejouée). */
async function modeIds(
  mode: string,
  deps: ExtractorDeps,
): Promise<{ label: string; ids: ModePlan['ids'] }> {
  const fresh = (await deps.fresh('monster')) as Record<string, Monster>;
  const enc = await deps.encounters();
  const spawned = new Set<string>();
  for (const m of Object.values(fresh))
    if ((m.spawns ?? []).some((s) => enc.dungeons[s.dungeon]?.mode === mode)) spawned.add(m.id);
  const adds = new Set<string>();
  if (spawned.size)
    for (const m of Object.values(fresh)) {
      if (spawned.has(m.id)) continue;
      const anchors = [...(m.summonedBy ?? []), ...(m.linkedTo ?? [])];
      if (anchors.some((a) => spawned.has(a))) adds.add(m.id);
    }
  const name = (id: string): string => fresh[id]?.name.en || '(sans nom)';
  const ids = [...spawned, ...adds].sort().map((id) => ({ id, name: name(id), add: adds.has(id) }));
  return { label: enc.modes[mode]?.en ?? mode, ids };
}

/**
 * Le plan d'« Intégrer un mode » (`GET /api/extractor/mode?mode=`) : les ids
 * qui seraient écrits et leur nombre, AVANT le geste ; `was`, la signature de
 * la cible monster, que le geste renverra.
 */
export async function planMode(mode: unknown, deps: ExtractorDeps = EXTRACTOR_DEPS) {
  const slug = typeof mode === 'string' ? mode.trim() : '';
  if (!slug) return { error: 'mode manquant', status: 400 } as const;
  const target = (await deps.targets()).find((t) => t.id === 'monster');
  if (!target) return { error: 'cible inconnue : monster', status: 404 } as const;
  if (!deps.tables()) return { error: NO_GAME_DATA, status: 409 } as const;
  const { label, ids } = await modeIds(slug, deps);
  const plan: ModePlan = {
    mode: slug,
    label,
    ids,
    count: ids.length,
    commit: modeMessage(slug, ids.length),
    was: deps.signature(target),
  };
  return plan;
}

/**
 * « Intégrer un mode » (`integrateMonsterMode` : tous les spawnés du mode et
 * leurs adds — entités, skills, donjons —, `syncDerived`), puis UN commit.
 * Même porte : tables, signature. Un mode sans monstre est refusé avant
 * d'écrire.
 */
export async function integrateMode(
  mode: unknown,
  was: unknown,
  deps: ExtractorDeps = EXTRACTOR_DEPS,
  report?: Report,
): Promise<ExtractorOutcome & { ids?: string[] }> {
  const slug = typeof mode === 'string' ? mode.trim() : '';
  if (!slug) return { ok: false, log: ['Aucun mode.'] };
  const gate = await extractorGate('monster', was, deps);
  if ('refused' in gate) return gate.refused;
  const { label, ids } = await modeIds(slug, deps);
  if (!ids.length)
    return {
      ok: false,
      log: [`Rien n’est écrit — aucun monstre ne spawne dans le mode « ${slug} ».`],
    };
  const j = journal(report);
  j.doing(
    `mode ${label} : intégration de ${ids.length} monstre${ids.length > 1 ? 's' : ''} dans ${GENERATED_DIR} (entités, skills, donjons), re-dérivation damage et solver`,
  );
  const r = await deps.integrateMode(slug);
  j.done(
    `mode ${label} : ${r.ids.length} monstre${r.ids.length > 1 ? 's' : ''} intégré${r.ids.length > 1 ? 's' : ''} — ${r.files.join(', ')} ; damage et solver re-dérivés.`,
  );
  const commit = deps.commitPaths(
    integratedPaths(r.files, deps, true),
    modeMessage(slug, r.ids.length),
    report,
  );
  return { ok: commit.ok, log: [...j.lines, ...commit.log], assets: null, ids: r.ids };
}

// --------------------------------------------------- figer et ré-épingler ----
//
// Le VERSIONNAGE d'un monstre (lot F22, fin de l'étape 20 de la migration) :
// figer l'état committé d'un boss dans `data/generated/monster-archive/` et
// ré-épingler les guides qui le désignaient encore en live — `versionMonster`
// puis `applyRepin`, que l'admin enchaînait sans rien montrer (« Version the
// committed state », puis cinq boîtes). Ici c'est UN geste en deux temps : le
// PLAN d'abord (`freezePlan` : la clé à venir, l'état de HEAD, les guides
// touchés, gardés, en attente), puis « Figer » (`freezeMonster`), qui rejoue
// le plan, refuse s'il a bougé, écrit, re-date les guides touchés et COMMITTE
// le tout. Le moteur ne bouge pas ; la règle est dans
// `src/lib/admin/monster-freeze.ts`.

/** Les lectures et les écritures d'un figeage, injectées : le moteur, les guides, le stamp, git. */
export interface FreezeDeps {
  /** Le monstre committé (`data/generated/monsters.json`, du disque) ; rien s'il n'y est pas. */
  monster: (id: string) => Monster | undefined;
  /** Ses archives figées (`monsterArchiveOf`), de la plus ancienne à la plus récente. */
  archives: (id: string) => Promise<{ version: number }[]>;
  /** HEAD : son sha court, sa date, la version du jeu qu'il committe. */
  head: () => FreezeHead;
  /** Parmi ces chemins, ceux qui diffèrent de HEAD (`git status`). */
  dirty: (paths: readonly string[]) => string[];
  /** Le JSON d'un fichier à HEAD ; rien s'il n'y est pas. */
  headJson: (path: string) => Record<string, unknown> | undefined;
  /** Le JSON d'un fichier du disque ; rien s'il manque. */
  diskJson: (path: string) => Record<string, unknown> | undefined;
  /** Les guides du site (le scan), pour la règle de datation. */
  guides: () => FreezeGuide[];
  planRepin: (id: string, key: string) => RepinPlan;
  applyRepin: (plan: RepinPlan) => Promise<RepinResult>;
  versionMonster: (
    id: string,
    opts: { ref: 'HEAD'; label?: string },
  ) => Promise<VersionMonsterReport>;
  /** Re-date un `meta.json` ; `false` s'il portait déjà cette date. */
  stamp: (metaPath: string, date: string) => Promise<boolean>;
  today: () => string;
  commitPaths: (paths: string[], message: string, report?: Report) => Outcome;
}

/** Le contenu d'un fichier à HEAD (`monsters.json` pèse 7 Mo : le tampon de `git()` ne suffit pas). */
function gitShowHead(path: string): string | undefined {
  const r = spawnSync('git', ['show', `HEAD:${path}`], {
    encoding: 'utf8',
    maxBuffer: 64 * 1024 * 1024,
    stdio: ['ignore', 'pipe', 'ignore'],
  });
  return r.status === 0 ? r.stdout : undefined;
}

const parseObject = (raw: string | undefined): Record<string, unknown> | undefined => {
  if (!raw) return undefined;
  try {
    const v: unknown = JSON.parse(raw);
    return isRecord(v) ? v : undefined;
  } catch {
    return undefined;
  }
};

/** Celles des routes : le committé, le moteur de versionnage, le ré-épinglage de l'admin, le vrai git. */
export const FREEZE_DEPS: FreezeDeps = {
  monster: (id) => MONSTERS_DEPS.monsters()[id],
  archives: async (id) => (await import('@datagen/extractor/version-monster')).monsterArchiveOf(id),
  head: () => {
    const gameVersion = parseObject(gitShowHead('data/generated/game-version.json'))?.resVersion;
    return {
      ref: git(['rev-parse', '--short', 'HEAD']).out,
      committedAt: git(['log', '-1', '--format=%cI', 'HEAD']).out,
      ...(typeof gameVersion === 'string' && gameVersion ? { gameVersion } : {}),
    };
  },
  dirty: (paths) => {
    const r = git(['status', '--porcelain', '-z', '--', ...paths]);
    if (!r.ok) return [];
    return r.out
      .split('\0')
      .filter((rec) => rec.length > 3)
      .map((rec) => rec.slice(3).replace(/\\/g, '/'));
  },
  headJson: (path) => parseObject(gitShowHead(path)),
  diskJson: (path) =>
    existsSync(resolve(path)) ? parseObject(readFileSync(resolve(path), 'utf8')) : undefined,
  guides: listGuides,
  planRepin,
  applyRepin: (plan) => applyRepin(plan),
  versionMonster: async (id, opts) =>
    (await import('@datagen/extractor/version-monster')).versionMonster(id, opts),
  stamp: stampMeta,
  today: todayLocal,
  commitPaths,
};

/** Le plan d'un figeage et le plan de ré-épinglage dont il est tiré (c'est lui qu'`applyRepin` joue). */
async function computeFreeze(
  id: string,
  monster: Monster,
  deps: FreezeDeps,
): Promise<{ plan: FreezePlan; repin: RepinPlan }> {
  const archives = await deps.archives(id);
  const repin = deps.planRepin(id, nextArchive(id, archives).key);
  const dirty = monsterDirtyFiles(id, deps.dirty(Object.values(MONSTER_FILES)), {
    head: deps.headJson,
    disk: deps.diskJson,
  });
  const plan = freezePlanOf({
    id,
    name: monster.name.en || id,
    archives,
    head: deps.head(),
    repin,
    guides: deps.guides(),
    dirty,
  });
  return { plan, repin };
}

/**
 * Le PLAN de « Figer et ré-épingler » (`GET /api/extractor/freeze?id=`) : la
 * clé qui sera créée, l'état de HEAD qu'elle figera, les guides touchés AVANT
 * de figer (éditions directes, versions épinglées), ceux qu'on laisse en live
 * et pourquoi, les guides plats en attente, les guides re-datés, le message
 * du commit, `dirty` (non vide : l'écran avertit, l'archive figera HEAD, pas
 * le disque) et `was`. Rien ne s'écrit.
 * Les tables du jeu n'y sont pour rien : le figeage lit le committé.
 */
export async function freezePlan(id: unknown, deps: FreezeDeps = FREEZE_DEPS) {
  const key = typeof id === 'string' ? id.trim() : '';
  if (!key) return { error: 'monstre manquant', status: 400 } as const;
  const monster = deps.monster(key);
  if (!monster)
    return { error: `monstre ${key} absent du committé : rien à figer`, status: 404 } as const;
  return (await computeFreeze(key, monster, deps)).plan;
}

/** Ce que rend « Figer » : l'issue, le refus (`stale`), le rapport de ce qui est écrit. */
export interface FreezeOutcome extends Outcome {
  /** Le plan recalculé n'est plus celui que l'écran a montré : relire. */
  stale?: boolean;
  report?: FreezeReport;
}

/** La note d'une archive : une ligne, bornée. */
const FREEZE_LABEL_MAX = 120;

/**
 * « Figer » (`POST /api/extractor/freeze`), dans l'ordre : le plan est
 * RECALCULÉ ; un plan qui n'est plus celui que l'écran a montré (`was`) est
 * refusé, rien n'est écrit. Un monstre qui diffère de HEAD dans
 * `data/generated/` (`plan.dirty`) ne l'est PAS : c'est l'état où « Promouvoir »
 * (Patch) laisse un boss changé, et c'est l'ANCIEN état, celui de HEAD, qu'on
 * veut figer — le journal le dit avant l'archive.
 * Puis `versionMonster(id, { ref: 'HEAD', label })` écrit l'archive,
 * `applyRepin` joue le plan (les `meta.json` des guides plats, le `pinned` des
 * versions), les guides dont un `meta.json` ou le `config.json` de la version
 * la plus récente a bougé sont re-datés (la règle de `guide-stamp.ts`, comme
 * « Guides »), et UN commit porte l'archive, les `meta.json`, les
 * `config.json` et les `meta.json` re-datés.
 */
export async function freezeMonster(
  id: unknown,
  body: { label?: unknown; was?: unknown },
  deps: FreezeDeps = FREEZE_DEPS,
  report?: Report,
): Promise<FreezeOutcome> {
  const key = typeof id === 'string' ? id.trim() : '';
  if (!key) return { ok: false, log: ['Aucun monstre.'] };
  const monster = deps.monster(key);
  if (!monster) return { ok: false, log: [`Rien n’est figé — monstre ${key} absent du committé.`] };
  const { plan, repin } = await computeFreeze(key, monster, deps);
  if (body.was !== plan.was)
    return {
      ok: false,
      stale: true,
      log: [
        `Rien n’est figé — le plan de ${plan.name} (${key}) a changé depuis sa lecture (une archive, un guide ou un commit de plus) : il est relu.`,
      ],
    };
  const label =
    typeof body.label === 'string'
      ? body.label.replace(/\s+/g, ' ').trim().slice(0, FREEZE_LABEL_MAX)
      : '';

  const j = journal(report);
  if (plan.dirty.length)
    j.done(
      `le disque diffère de HEAD pour ce monstre (${plan.dirty.join(', ')}) : l’archive fige l’état COMMITTÉ ${plan.head.ref} du ${plan.head.committedAt.slice(0, 10)}, pas celui du disque`,
    );
  j.doing(`${plan.name} (${key}) : état de ${plan.head.ref} figé sous ${plan.key}`);
  let archive: VersionMonsterReport;
  try {
    archive = await deps.versionMonster(key, { ref: 'HEAD', ...(label ? { label } : {}) });
  } catch (e: unknown) {
    return {
      ok: false,
      log: [...j.lines, `Rien n’est figé — ${e instanceof Error ? e.message : String(e)}`],
    };
  }
  j.done(
    `${archive.key} figé : ${archive.file} — ${archive.skills} skill${archive.skills > 1 ? 's' : ''}, source ${archive.ref}${archive.gameVersion ? `, jeu ${archive.gameVersion}` : ''}${label ? `, note « ${label} »` : ''}.`,
  );

  // Le plan joué est celui qu'on a montré ; une clé autre que prévue (une
  // archive posée entre le calcul et l'écriture) le fait recalculer pour elle.
  let result: RepinResult;
  try {
    j.doing('ré-épinglage des guides');
    result = await deps.applyRepin(
      archive.key === plan.key ? repin : deps.planRepin(key, archive.key),
    );
  } catch (e: unknown) {
    return {
      ok: false,
      log: [
        ...j.lines,
        `Ré-épinglage en échec : ${e instanceof Error ? e.message : String(e)} — rien n’est committé ; ${archive.file} est sur le disque.`,
      ],
    };
  }
  const repinned = new Set([
    ...result.applied.map((e) => e.guide),
    ...result.pinnedVersions.map((p) => p.slice(0, p.lastIndexOf('@'))),
  ]);
  for (const e of result.applied)
    j.done(`${e.guide} : ${e.field} → ${Array.isArray(e.after) ? e.after.join(', ') : e.after}`);
  for (const p of result.pinnedVersions) {
    const at = p.lastIndexOf('@');
    j.done(`${p.slice(0, at)} : version ${p.slice(at + 1)} épinglée sur ${archive.key}`);
  }
  for (const g of result.skipped) j.done(`${g} : meta.json refusé par le store, guide laissé.`);
  if (!repinned.size) j.done('aucun guide à ré-épingler : l’archive naît orpheline.');

  // La datation : les seuls guides touchés, par la règle partagée.
  const files = writtenFiles(result);
  const today = deps.today();
  const stamped: string[] = [];
  const metas: string[] = [];
  for (const name of guidesToStamp(files, deps.guides())) {
    const meta = `${GUIDES_CONTENTS_SUBDIR}/${name}/meta.json`;
    // Un `meta.json` déjà à la date du jour n'est pas réécrit, mais il a pu
    // l'être par le ré-épinglage : il est dans `files` de toute façon.
    if (await deps.stamp(meta, today)) {
      stamped.push(name);
      metas.push(meta);
    }
  }
  if (stamped.length) j.done(`meta.updated : ${today} — ${stamped.join(', ')}`);

  const commit = deps.commitPaths(
    [...new Set([archive.file, ...files, ...metas])],
    freezeCommitMessage(plan.name, key, archive.version, repinned.size),
    report,
  );
  return {
    ok: commit.ok,
    log: [...j.lines, ...commit.log],
    report: freezeReportOf(archive, result, stamped),
  };
}
