/**
 * quick/actions — les SEPT gestes du quotidien, sortis du panneau admin.
 *
 * Mettre à jour un code promo, déposer une 4-comic, ajouter une vidéo, régler un
 * rang, une reco d'équipement ou un nom court ne demandait jusqu'ici RIEN de
 * moins qu'un `pnpm dev` complet : `clean:all`
 * (suppression de `node_modules` + réinstallation) puis `dev-refresh` (pull
 * Steam, build de la proposition, collecte des images), pour finir par cliquer
 * dans l'admin. Des minutes de pipeline de données pour changer quatre lignes
 * de JSON.
 *
 * Ce module ne RÉIMPLÉMENTE rien : il rappelle les mêmes stores que les routes
 * admin (`loadCouponsForEdit`/`saveCouponsLive`, `collectComics`, `upsertCharacterCurated`,
 * `upsertEeCurated`, `upsertGearReco`, `fetchMeta`…), sans Next et sans serveur de dev. Les alias `@/` et `@datagen/`
 * sont résolus par tsx via tsconfig.
 *
 * CE QUI PART EN PROD, ET COMMENT :
 *   - codes promo : la liste VIVANTE est sur R2 (le staff en ajoute aussi depuis
 *     Discord) ; l'écran la lit, puis l'écrit conditionnellement et purge
 *     l'edge (`lib/data/live-coupons`) → en ligne tout de suite, sans build.
 *     `coupons.json` committé n'en est que l'instantané ;
 *   - 4-comics : la galerie lit le manifeste R2 à la requête (cf. le docblock de
 *     `collect-comics`) → une BD apparaît dès le push R2 ;
 *   - vidéos : lues au RENDU, donc visibles seulement une fois le site rebâti ;
 *   - rangs et rôles : lus au RENDU eux aussi (les quatre tier lists) ;
 *   - recos d'équipement : lues au RENDU elles aussi (les fiches de perso) ;
 *   - noms courts et alias de recherche : lus au RENDU eux aussi (le libellé
 *     sous les cartes, le champ recherche des listes de persos).
 *
 * Les SIX COMMITTENT, sans rien demander, et aucun ne pousse (cf.
 * `commitPaths`) : pousser à chaque geste lançait la CI à chaque geste. Le push
 * est un geste à part, le bouton « Pousser » de l'en-tête (`pushMain`), qui dit
 * combien de commits attendent (`gitState`). Il part quand même avec la CI : R2
 * avance la mise en ligne de la donnée vive, il ne dispense pas du déploiement
 * — le site bâti garde ses propres copies de tout ça.
 */
import { spawnSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { basename, resolve } from 'node:path';
import {
  loadCouponsForEdit,
  saveCouponsLive,
  type PromoCode,
} from '@/lib/admin/promo-banner-store';
import { catalogOptions } from '@/lib/data/item-catalog';
import { rankItemMatches } from '@/lib/data/item-search';
import { fetchMeta, searchOfficial } from '@/lib/admin/youtube';
import { upsertCharacterCurated } from '@/lib/admin/curated-store';
import { upsertEeCurated, type EeCuratedPatch } from '@/lib/admin/equipment-curated-store';
import { gearSelectOptions, type GearOption } from '@/lib/admin/gear-options';
import { previewGearReco } from '@/lib/admin/gear-preview-actions';
import { expandBuild } from '@/lib/admin/gear-preset-resolve';
import { upsertGearReco } from '@/lib/admin/gear-reco-store';
import { upsertSearchAliases } from '@/lib/admin/search-alias-store';
import { upsertShortName } from '@/lib/admin/short-name-store';
import { appendGuideVideo } from '@/lib/admin/guide-store';
import { autoTranslate } from '@/lib/admin/translate-actions';
import { loadCuratedCharacters } from '@/lib/data/curated';
import {
  characterDisplayName,
  characterSearchNames,
  getCharacterListItems,
} from '@/lib/data/characters';
import {
  getAmuletFamilies,
  getEEViews,
  getSetViews,
  getTalismanFamilies,
  getWeaponFamilies,
  loadEquipmentEditorial,
  resolvePassives,
  type GearFamily,
} from '@/lib/data/equipment';
import { loadGearPresets, loadGearReco } from '@/lib/data/gear-reco';
import { listGuides } from '@/lib/data/guides';
import { loadSearchAliases } from '@/lib/data/search-aliases';
import { loadShortNames } from '@/lib/data/short-names';
import { GUIDE_SPECS } from '@/lib/admin/guide-draft';
import { DEFAULT_LANG, LANGS, type Lang } from '@/lib/i18n/config';
import { lRec } from '@/lib/i18n/localize';
import { TAG_REGEX, checkText } from '@/lib/parse-text';
import { STAT_ICON } from '@/lib/stats';
import { transcendenceLabel } from '@/lib/transcendence';
import { fitsOnTwoLines } from '@/components/character/CharacterPortrait';
import {
  CURATED_ROLES,
  CURATED_STEPS,
  CURATED_STEP_RARITY,
  EE_TIERS,
  TIERS,
} from '@/components/tierlist/tiers';
import type { CharacterCurated, GearBuild, GearPresets, LocalizedText } from '@contracts';
import type { EquipmentCuratedEntry } from '@datagen/curated/equipment';
import { validateGearBuilds } from '@datagen/curated/gear-reco';
import { collectComics } from '@datagen/assets/collect-comics';
import { pushEditorial } from '@datagen/assets/editorial';
import { syncComicsSeed } from '@datagen/assets/sync-comics-seed';
import { refreshVideoMeta } from '@datagen/video-meta';
import { COMIC_LANGS, type ComicLang } from '@datagen/generators/comics';
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
 * Le pre-commit est sauté (`--no-verify`) SEULEMENT quand tous les chemins sont
 * du JSON de données : il ne fait qu'y passer prettier, or `writeJson` écrit
 * déjà le format canonique prettier (cf. `formatJson`). Dès qu'un chemin n'est
 * pas un `.json`, les hooks tournent.
 */
export function commitPaths(
  paths: string[],
  message: string,
  report?: Report,
  cwd?: string,
): Outcome {
  const j = journal(report);

  const add = git(['add', '--', ...paths], cwd);
  if (!add.ok) return { ok: false, log: [`git add a échoué : ${add.out}`] };

  // Rien d'indexé = rien à dire (re-sauvegarde à l'identique) : pas une erreur.
  if (git(['diff', '--cached', '--quiet'], cwd).ok)
    return { ok: true, log: ['git : rien à committer.'] };

  const dataOnly = paths.every((p) => p.endsWith('.json'));
  const commit = git(['commit', ...(dataOnly ? ['--no-verify'] : []), '-m', message], cwd);
  if (!commit.ok) return { ok: false, log: [`git commit a échoué : ${commit.out}`] };
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
];

/** `entry` avec `key` posé (à sa place s'il est nouveau) ou retiré (`undefined`). */
function withField(
  entry: CharacterCurated,
  key: keyof CharacterCurated,
  value: string | Record<string, string> | undefined,
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
    steps: STEP_KEYS.map((key) => ({
      key,
      label: transcendenceLabel(CURATED_STEP_RARITY, Number(key)),
    })),
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
 * « Traduire » de l'onglet Gear reco : les notes anglaises d'un perso vers les
 * autres langues du site, d'UN appel (`autoTranslate` prend tous les textes à
 * la fois et préserve les tags `{…}`). `results` est aligné sur `texts` ; un
 * texte vide n'est pas envoyé et rend `{}`.
 *
 * Rien ne s'écrit ici : la page pose les traductions dans son modèle, et c'est
 * `saveGearReco` qui en contrôle les tags à l'enregistrement.
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
