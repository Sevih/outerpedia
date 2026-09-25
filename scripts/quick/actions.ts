/**
 * quick/actions — les TROIS gestes du quotidien, sortis du panneau admin.
 *
 * Mettre à jour un code promo, déposer une 4-comic ou ajouter une vidéo ne
 * demandait jusqu'ici RIEN de moins qu'un `pnpm dev` complet : `clean:all`
 * (suppression de `node_modules` + réinstallation) puis `dev-refresh` (pull
 * Steam, build de la proposition, collecte des images), pour finir par cliquer
 * dans l'admin. Des minutes de pipeline de données pour changer quatre lignes
 * de JSON.
 *
 * Ce module ne RÉIMPLÉMENTE rien : il rappelle les mêmes stores que les routes
 * admin (`loadCouponsForEdit`/`saveCouponsLive`, `collectComics`, `upsertCharacterCurated`,
 * `fetchMeta`…), sans Next et sans serveur de dev. Les alias `@/` et `@datagen/`
 * sont résolus par tsx via tsconfig.
 *
 * CE QUI PART EN PROD, ET COMMENT :
 *   - codes promo : la liste VIVANTE est sur R2 (le staff en ajoute aussi depuis
 *     Discord) ; l'écran la lit, puis l'écrit conditionnellement et purge
 *     l'edge (`lib/data/live-coupons`) → en ligne tout de suite, sans build.
 *     `coupons.json` committé n'en est que l'instantané ;
 *   - 4-comics : la galerie lit le manifeste R2 à la requête (cf. le docblock de
 *     `collect-comics`) → une BD apparaît dès le push R2 ;
 *   - vidéos : lues au RENDU, donc visibles seulement une fois le site rebâti.
 *
 * Les TROIS poussent quand même avec la CI (cf. `commitAndPush`) : R2 avance la
 * mise en ligne de la donnée vive, il ne dispense pas du déploiement — le site
 * bâti garde ses propres copies de tout ça.
 */
import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { basename, resolve, sep } from 'node:path';
import {
  loadCouponsForEdit,
  saveCouponsLive,
  type PromoCode,
} from '@/lib/admin/promo-banner-store';
import { catalogOptions } from '@/lib/data/item-catalog';
import { rankItemMatches } from '@/lib/data/item-search';
import { fetchMeta, searchOfficial } from '@/lib/admin/youtube';
import { upsertCharacterCurated } from '@/lib/admin/curated-store';
import { loadCuratedCharacters } from '@/lib/data/curated';
import { characterDisplayName, getCharacterListItems } from '@/lib/data/characters';
import { listGuides } from '@/lib/data/guides';
import { GUIDE_SPECS } from '@/lib/admin/guide-draft';
import { collectComics } from '@datagen/assets/collect-comics';
import { pushEditorial } from '@datagen/assets/editorial';
import { syncComicsSeed } from '@datagen/assets/sync-comics-seed';
import { refreshVideoMeta } from '@datagen/video-meta';
import { COMIC_LANGS, type ComicLang } from '@datagen/generators/comics';
import { writeJson } from '@datagen/lib/json';

/** Journal rendu tel quel dans l'interface (une ligne = une étape). */
export interface Outcome {
  ok: boolean;
  log: string[];
}

const EDITORIAL_COMICS = resolve('.editorial/comics');
const CONTENTS_DIR = resolve('src/app/[lang]/guides/_contents');

// ---------------------------------------------------------------- git --------

/**
 * Committe et pousse des chemins EXPLICITES (jamais `git add -A` : un dossier
 * entier embarquerait le travail en cours d'à côté — cf. CONVENTIONS.md).
 *
 * PAS de « [skip ci] », pour AUCUN des trois gestes (décision Sevih) : R2 met
 * bien la donnée vive en ligne sans build, mais le site DÉPLOYÉ en garde des
 * copies cuites — le repli committé des 4-comics, les pages qui lisent les
 * coupons au rendu. Sauter le build les laissait en retard jusqu'au prochain
 * push sans rapport, c'est-à-dire diverger en silence. Le déploiement part donc
 * avec le changement qui le justifie ; R2 ne fait plus qu'avancer la mise en
 * ligne de quelques minutes sur lui.
 *
 * Les hooks sont sautés (`--no-verify`) SEULEMENT quand tous les chemins sont du
 * JSON de données : le pre-commit ne fait que passer prettier (or `writeJson`
 * écrit déjà le format canonique prettier, cf. `formatJson`) et le pre-push un
 * `tsc --noEmit` triple — une minute d'attente pour des fichiers qu'aucun type
 * ne peut casser. Dès qu'un chemin n'est pas un `.json`, les hooks tournent.
 */
export function commitAndPush(paths: string[], message: string): Outcome {
  const log: string[] = [];
  const run = (args: string[]): { ok: boolean; out: string } => {
    const r = spawnSync('git', args, { encoding: 'utf8' });
    const out = `${r.stdout ?? ''}${r.stderr ?? ''}`.trim();
    return { ok: r.status === 0, out };
  };

  const add = run(['add', '--', ...paths]);
  if (!add.ok) return { ok: false, log: [`git add a échoué : ${add.out}`] };

  // Rien d'indexé = rien à dire (re-sauvegarde à l'identique) : pas une erreur.
  if (run(['diff', '--cached', '--quiet']).ok)
    return { ok: true, log: ['git : rien à committer.'] };

  const dataOnly = paths.every((p) => p.endsWith('.json'));
  const hooks = dataOnly ? ['--no-verify'] : [];
  const commit = run(['commit', ...hooks, '-m', message]);
  if (!commit.ok) return { ok: false, log: [`git commit a échoué : ${commit.out}`] };
  log.push(`git : ${message}`);

  const push = run(['push', ...hooks]);
  // Le commit, lui, EST passé : le dire, sinon on croit avoir tout perdu et on
  // ressaisit la même chose. Le cas courant est une branche en retard.
  if (!push.ok)
    return {
      ok: false,
      log: [
        ...log,
        `git push a échoué (le commit local est fait) : ${push.out}`,
        'Corriger avec `git pull --rebase` puis `git push`.',
      ],
    };
  log.push('poussé — la CI build et déploie.');
  return { ok: true, log };
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
): Promise<Outcome & { etag?: string }> {
  const res = await saveCouponsLive(list, etag);
  if (!res.ok) return { ok: false, log: res.errors };

  const log = [
    `${list.length} codes enregistrés sur R2${res.purged ? ' + edge purgé' : ` (${res.purgeError ?? 'edge non purgé'})`}.`,
  ];
  const git = commitAndPush(
    ['data/curated/coupons.json'],
    'chore(coupons): mise à jour des codes promo',
  );
  return { ok: git.ok, etag: res.etag, log: [...log, ...git.log] };
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

/**
 * Dépose des planches dans le pool éditorial puis rejoue la sous-chaîne
 * 4-comics de `pnpm images` — et ELLE SEULE : la chaîne complète collecte aussi
 * persos, audio et wallpapers, sans rapport avec une BD ajoutée.
 *
 * `assets:push` reste appelé en entier : il est incrémental (diff sha1 contre
 * `pushed.json`), donc seules les nouvelles clés partent réellement.
 */
export async function addComics(lang: ComicLang, files: ComicUpload[]): Promise<Outcome> {
  if (!COMIC_LANGS.includes(lang)) return { ok: false, log: [`Langue inconnue : ${lang}`] };
  if (!files.length) return { ok: false, log: ['Aucun fichier.'] };

  const dir = resolve(EDITORIAL_COMICS, lang);
  mkdirSync(dir, { recursive: true });

  const log: string[] = [];
  for (const f of files) {
    const name = safeName(f.name);
    if (!name) return { ok: false, log: [`Nom de fichier refusé : ${f.name}`] };
    writeFileSync(resolve(dir, name), Buffer.from(f.data, 'base64'));
    log.push(`déposé : ${lang}/${name}`);
  }

  const made = await collectComics();
  log.push(`conversion webp : ${made.made} produites, ${made.skipped} déjà à jour.`);

  pushEditorial();
  log.push('originaux sauvegardés sur R2 (editorial:push).');

  const push = spawnSync(process.execPath, [resolve('scripts/assets-push.mjs')], {
    encoding: 'utf8',
  });
  if (push.status !== 0)
    return { ok: false, log: [...log, `assets:push a échoué : ${(push.stderr ?? '').trim()}`] };
  log.push('poussé sur R2 — la galerie lit le manifeste à la requête.');

  log.push(`repli committé : ${syncComicsSeed()}.`);

  const git = commitAndPush(
    ['data/generated/comics.json', 'datagen/assets/pushed.json'],
    'chore(assets): nouvelles 4-comics',
  );
  return { ok: git.ok, log: [...log, ...git.log] };
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

/**
 * `videos.json` d'un guide, CONFINÉ sous `_contents` — `null` si le couple
 * catégorie/slug s'en échappe. Même idiome que `guideDir` (guide-store) : la
 * garde est structurelle, il faut traiter le `null`.
 */
function guideVideosPath(t: Extract<VideoTarget, { kind: 'guide' }>): string | null {
  const dir = resolve(CONTENTS_DIR, t.category, t.slug);
  if (!dir.startsWith(CONTENTS_DIR + sep)) return null;
  const full = t.version
    ? resolve(dir, 'versions', t.version, 'videos.json')
    : resolve(dir, 'videos.json');
  return full.startsWith(CONTENTS_DIR + sep) ? full : null;
}

export const searchVideos = (query: string) => searchOfficial(query);

/**
 * Ajoute une vidéo à sa cible, méta YouTube résolue au passage, puis rafraîchit
 * le cache `video-meta.json` (Schema.org exige `uploadDate`, jamais écrit à la
 * main) et pousse — AVEC la CI cette fois : ces données sont lues au rendu,
 * elles n'existent en prod qu'après un build.
 */
export async function addVideo(
  target: VideoTarget,
  input: string,
  label?: string,
): Promise<Outcome> {
  const id = youtubeId(input);
  if (!id) return { ok: false, log: [`Id YouTube illisible : ${input}`] };

  const meta = (await fetchMeta([id]))[id];
  if (!meta) return { ok: false, log: [`YouTube ne connaît pas ${id} (ou la clé API manque).`] };

  const log = [`${meta.title} — ${meta.author}`];
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
    log.push(`ajoutée au perso ${target.id}.`);
  } else {
    const path = guideVideosPath(target);
    if (!path)
      return {
        ok: false,
        log: [...log, `Chemin de guide invalide : ${target.category}/${target.slug}`],
      };
    const list = existsSync(path)
      ? (JSON.parse(readFileSync(path, 'utf8')) as Array<{ id: string }>)
      : [];
    if (list.some((v) => v.id === id))
      return { ok: false, log: [...log, 'Déjà présente sur ce guide.'] };
    await writeJson(path, [
      ...list,
      {
        platform: 'youtube',
        id,
        title: meta.title,
        author: meta.author,
        ...(label ? { label } : {}),
      },
    ]);
    touched.push(path);
    log.push(`ajoutée au guide ${target.category}/${target.slug}.`);
  }

  await refreshVideoMeta();
  touched.push('data/generated/video-meta.json');
  log.push('cache video-meta rafraîchi.');

  const git = commitAndPush(touched, `feat(videos): ${meta.title}`);
  return { ok: git.ok, log: [...log, ...git.log] };
}
