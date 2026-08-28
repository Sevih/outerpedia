/**
 * commit — publication guidée (`pnpm commit`).
 *
 * Enchaîne, dans l'ordre, avec ARRÊT au premier problème :
 *   0. PRÉ-VOL : la branche est-elle à jour sur origin ? (STOP si en retard)
 *      Rejoué juste avant le push R2, seul point de non-retour.
 *   1. CONTRÔLES : format:check → lint → typecheck → test  (STOP si ça casse)
 *   2. CHOIX du bump de version (patch/minor/major) — l'écriture dans
 *      package.json est différée à l'étape 5 : abandonner ne modifie rien
 *      (la version est lue de là par next.config.ts → NEXT_PUBLIC_APP_VERSION ;
 *       pas de sw.js à synchroniser)
 *   3. message de commit (prompt)
 *   4. images → assets:collect + assets:push (R2)   ← AVANT le push git,
 *      car « merger/pousser = déployer » et la prod lit R2.
 *   5. git add -A → commit → push (branche courante)
 *
 * PAS de `next build` : c'est le boulot de la CI (un build local casse les types,
 * cf. datagen/README). Les contrôles tournent EN TÊTE (avant tout effet de bord)
 * pour ne rien publier de cassé — lefthook, lui, ne vérifie qu'au commit/push,
 * trop tard pour le push R2.
 *
 * Flags :
 *   --dry-run         simule (aucune commande réelle)
 *   --no-push         commit local, pas de push
 *   --no-ci           push SANS déclencher la CI (suffixe « [skip ci] » dans le
 *                     message, honoré nativement par GitHub Actions : ni check,
 *                     ni build, ni deploy — la prod reste sur le commit d'avant,
 *                     le prochain push « normal » embarquera tout)
 *   --skip-controls   saute les contrôles (à tes risques)
 *   --msg "<texte>"   message de commit (skip le prompt)
 */
import { execSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';

const argv = process.argv.slice(2);
const has = (f: string): boolean => argv.includes(f);
const val = (f: string): string | null => {
  const i = argv.indexOf(f);
  return i > -1 && argv[i + 1] ? argv[i + 1] : null;
};

const DRY_RUN = has('--dry-run');
const NO_PUSH = has('--no-push');
/**
 * GitHub Actions saute TOUS les workflows `push`/`pull_request` si le commit de
 * TÊTE du push contient `[skip ci]` (ou `[ci skip]`, `[no ci]`, `[skip actions]`).
 * Aucun réglage côté ci.yml : on se contente de suffixer le message — après le
 * contrôle conventional, pour que le format vérifié soit celui tapé.
 */
const NO_CI = has('--no-ci');
const SKIP_CI_TAG = '[skip ci]';
const SKIP_CONTROLS = has('--skip-controls');
const FORCE_MSG = val('--msg');

const PKG = resolve('package.json');

/**
 * Format de message exigé (conventional commits, garde-fou 2026-07-16) : le
 * CHANGELOG se reconstruit du log git — « import MG », « guild raid & tower »
 * y ont creusé des trous impossibles à combler après coup (commits poussés).
 */
const CONVENTIONAL =
  /^(feat|fix|docs|chore|refactor|perf|test|style|ci|build|revert)(\([^)]+\))?!?: .+/;
const CONVENTIONAL_HELP =
  'Format attendu : type(portée): description — ex. « feat(guides): carte Monad Gate ».\n' +
  'Types : feat fix docs chore refactor perf test style ci build revert.';

/** Exécute une commande shell (stdout/stderr hérités). Lève si code ≠ 0. */
function sh(cmd: string): void {
  if (DRY_RUN) {
    console.log(`  \x1b[90m[dry-run] ${cmd}\x1b[0m`);
    return;
  }
  execSync(cmd, { stdio: 'inherit' });
}

/** Sortie capturée (pour parser), sans dry-run. */
function shOut(cmd: string): string {
  return execSync(cmd, { encoding: 'utf-8' }).trim();
}

/** Sortie capturée, `null` si la commande échoue (stderr avalé). */
function shSoft(cmd: string): string | null {
  try {
    return execSync(cmd, { encoding: 'utf-8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
  } catch {
    return null;
  }
}

/**
 * PRÉ-VOL — refuse de partir si la branche est en retard sur origin.
 *
 * Le push R2 est IRRÉVERSIBLE (l'edge est purgé, la prod sert aussitôt les
 * nouveaux fichiers) là où le push git, lui, peut être REFUSÉ. Le 2026-08-15
 * la séquence s'est arrêtée entre les deux : R2 servait deux images que le
 * dépôt n'enregistrait pas encore.
 *
 * Le vrai danger n'est pas ce décalage, c'est `pushed.json`. Calculé sur une
 * base périmée, il ignore les images qu'une AUTRE machine a déjà poussées :
 * `assets:push` les voit alors comme « à re-pousser » et écrase du récent par
 * du vieux — régression silencieuse, edge purgé pour servir l'ancienne image.
 * Un `git pull` APRÈS coup ne la rattrape pas : le mal est fait sur R2.
 *
 * D'où l'arrêt AVANT tout effet de bord. Joué deux fois : au démarrage (échec
 * en ~1 s au lieu de dérouler contrôles + prompts pour rien) et juste avant le
 * push R2, car les prompts durent ce qu'ils durent et une autre machine a le
 * temps de pousser entre-temps.
 *
 * Le fetch tourne MÊME en dry-run : lecture seule (il ne touche ni l'index ni
 * l'arbre), et un dry-run qui tairait « tu es en retard » ne servirait à rien.
 */
function preflight(branch: string): void {
  if (shSoft(`git fetch origin ${branch}`) === null) {
    console.log(`\x1b[90m  origin/${branch} injoignable ou inexistant — rien à comparer.\x1b[0m`);
    return;
  }
  if (shSoft(`git rev-parse --verify origin/${branch}`) === null) {
    console.log(`\x1b[90m  ${branch} n'existe pas encore sur origin — rien à comparer.\x1b[0m`);
    return;
  }
  const behind = Number(shSoft(`git rev-list --count HEAD..origin/${branch}`) ?? '0');
  if (!behind) {
    console.log(`\x1b[90m  origin/${branch} : à jour.\x1b[0m`);
    return;
  }
  console.error(
    `\n\x1b[31m✗ origin/${branch} a ${behind} commit(s) que tu n'as pas — rien n'a été publié.\x1b[0m\n` +
      `  Intègre-les, puis relance :\n` +
      `      git pull --rebase origin ${branch}\n` +
      `  Partir en retard pousserait un pushed.json calculé sur une base périmée,\n` +
      `  au risque d'écraser sur R2 une image plus récente par une plus ancienne.`,
  );
  process.exit(1);
}

async function ask(rl: readline.Interface, q: string): Promise<string> {
  return (await rl.question(q)).trim();
}

async function main(): Promise<void> {
  if (DRY_RUN) console.log('\x1b[33m[DRY RUN]\x1b[0m\n');

  const branch = shOut('git rev-parse --abbrev-ref HEAD');

  // 0) PRÉ-VOL — en TÊTE : inutile de dérouler 12 s de contrôles et deux
  // prompts pour se faire refuser au push, R2 déjà écrit.
  console.log(`\n▶ pré-vol : \x1b[36m${branch}\x1b[0m`);
  preflight(branch);

  // 1) CONTRÔLES — au premier échec, on s'arrête AVANT tout effet de bord.
  //
  // Un contrôle avec `fix` est AUTO-RÉPARABLE : on vérifie d'abord (rapide, ne
  // touche à rien quand tout va bien) et, seulement si ça casse, on applique le
  // correctif puis on re-vérifie (le `git add -A` plus bas embarque les
  // corrections). Le format n'est pas un « bug » à faire échouer — juste de
  // l'enroulement de ligne déterministe. Lint/typecheck/test, eux, restent
  // BLOQUANTS : pas de fix automatique, ce sont de vrais problèmes.
  if (SKIP_CONTROLS) {
    console.log('\x1b[90m[skip-controls] contrôles sautés.\x1b[0m');
  } else {
    const controls: { label: string; check: string; fix?: string }[] = [
      { label: 'format', check: 'pnpm format:check', fix: 'pnpm format' },
      { label: 'lint', check: 'pnpm lint' },
      { label: 'typecheck', check: 'pnpm typecheck' },
      { label: 'test', check: 'pnpm test' },
    ];
    for (const { label, check, fix } of controls) {
      console.log(`\n▶ contrôle : ${label}`);
      try {
        sh(check);
      } catch {
        if (fix) {
          console.log(`\x1b[33m  ⚠ ${label} : corrections appliquées automatiquement.\x1b[0m`);
          sh(fix);
          try {
            sh(check); // re-vérifie : un échec persistant = vrai problème.
          } catch {
            console.error(
              `\n\x1b[31m✗ ${label} : échec persistant après auto-correction — corrige à la main.\x1b[0m`,
            );
            process.exit(1);
          }
        } else {
          console.error(
            `\n\x1b[31m✗ Contrôle "${label}" échoué — rien n'a été publié. Corrige puis relance.\x1b[0m`,
          );
          process.exit(1);
        }
      }
    }
    console.log('\n\x1b[32m✓ Tous les contrôles passent.\x1b[0m');
  }

  let newVersion = '';
  /** Contenu du package.json bumpé — écrit en DIFFÉRÉ à l'étape commit. */
  let bumpedPkg: string | null = null;
  let msg = '';
  const rl = readline.createInterface({ input, output });
  try {
    // 2) BUMP DE VERSION (choix seulement — l'ÉCRITURE attend l'étape 6 :
    // un abandon ici ou au message laissait un package.json bumpé non
    // committé, et la relance re-bumpait par-dessus → versions sautées).
    const pkg = JSON.parse(readFileSync(PKG, 'utf-8')) as { version: string };
    const m = pkg.version.match(/^(\d+)\.(\d+)\.(\d+)$/);
    if (!m) throw new Error(`Version invalide dans package.json : "${pkg.version}"`);
    let [maj, min, pat] = [Number(m[1]), Number(m[2]), Number(m[3])];
    console.log(`\nVersion actuelle : \x1b[36m${pkg.version}\x1b[0m`);
    console.log('  1) patch (fix)   2) minor (feature)   3) major (breaking)   0) inchangée');
    const choice = await ask(rl, 'Bump : ');
    if (choice === '1') pat += 1;
    else if (choice === '2') {
      min += 1;
      pat = 0;
    } else if (choice === '3') {
      maj += 1;
      min = 0;
      pat = 0;
    }
    newVersion = `${maj}.${min}.${pat}`;
    if (newVersion !== pkg.version) {
      pkg.version = newVersion;
      bumpedPkg = JSON.stringify(pkg, null, 2) + '\n';
      console.log(`Nouvelle version : \x1b[32m${newVersion}\x1b[0m (écrite au commit)`);
    } else {
      console.log('Version inchangée.');
    }

    // 3) MESSAGE (avant le push R2 ET l'écriture du bump : abandon ici =
    // rien de publié, rien de modifié).
    if (FORCE_MSG && !CONVENTIONAL.test(FORCE_MSG)) {
      console.error(
        `\x1b[31mMessage --msg non conventionnel — refusé.\x1b[0m\n${CONVENTIONAL_HELP}`,
      );
      process.exit(1);
    }
    msg = FORCE_MSG ?? (await ask(rl, '\nMessage de commit : '));
    // Re-demande tant que le format n'est pas bon (vide = abandon, comme avant).
    while (msg && !CONVENTIONAL.test(msg)) {
      console.log(`\x1b[33mMessage non conventionnel.\x1b[0m ${CONVENTIONAL_HELP}`);
      msg = await ask(rl, 'Message de commit : ');
    }
    if (!msg) {
      console.log('Message vide — abandon.');
      process.exit(0);
    }
    if (NO_CI && !msg.includes(SKIP_CI_TAG)) msg = `${msg} ${SKIP_CI_TAG}`;
  } finally {
    // On LIBÈRE stdin AVANT de spawn git : un readline encore ouvert perturbe
    // les hooks git (spinner lefthook / TTY) et peut figer le commit.
    rl.close();
  }

  // 4) DATES DES GUIDES — bumpe `meta.updated` des guides dont un fichier
  // pertinent change (le build ne voit pas git ; la date vit committée). AVANT
  // le git add -A pour que les meta re-datés partent dans CE commit.
  console.log('\n▶ dates des guides (stamp)');
  sh('pnpm stamp:guides');

  // 5) IMAGES → R2 (la prod lit R2 ; doit précéder le push git).
  //
  // Dernier pré-vol : c'est LE point de non-retour, et les prompts ci-dessus
  // ont pu durer — une autre machine a eu le temps de pousser depuis l'étape 0.
  console.log('\n▶ pré-vol (rappel, avant publication)');
  preflight(branch);
  console.log('\n▶ images (collect + push R2)');
  // `--no-commit` : `pnpm images` auto-committe sinon les états d'assets
  // (`pushed.json`, repli 4-comics). Ici, le `git add -A` de l'étape 6 les
  // embarque avec le bump de version dans LE commit de la release — un commit
  // d'assets séparé, juste avant, le couperait en deux.
  sh('pnpm images --no-commit');

  // 6) COMMIT. L'écriture du bump arrive ICI (plus d'abandon possible), et
  // AVANT le status : un commit « bump seul » reste possible.
  if (bumpedPkg) {
    if (!DRY_RUN) writeFileSync(PKG, bumpedPkg);
    console.log(`package.json → ${newVersion}`);
  }
  const status = shOut('git status --porcelain');
  if (!status) {
    console.log('\nRien à committer.');
    process.exit(0);
  }
  console.log(`\n▶ commit sur \x1b[36m${branch}\x1b[0m`);
  sh('git add -A');
  // --no-verify : on saute les hooks git (lefthook) car les contrôles ci-dessus
  // (format/lint/typecheck/test) SONT le garde-fou, joués plus tôt et avant le
  // push R2. Les hooks ne feraient que re-dérouler le même travail (et figeaient
  // le commit).
  sh(`git commit --no-verify -m ${JSON.stringify(msg)}`);

  // 7) PUSH.
  if (NO_PUSH) {
    console.log('\x1b[90m[no-push] pas de push.\x1b[0m');
  } else {
    console.log(`\n▶ push → ${branch}${NO_CI ? ' \x1b[90m(sans CI)\x1b[0m' : ''}`);
    sh(`git push --no-verify origin ${branch}`);
  }

  console.log(`\n\x1b[32m✅ Terminé — ${newVersion} sur ${branch}.\x1b[0m\n`);
}

main().catch((e) => {
  console.error(`\n\x1b[31mErreur : ${e?.message ?? e}\x1b[0m`);
  process.exit(1);
});
