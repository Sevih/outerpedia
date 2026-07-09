/**
 * commit — publication guidée (`pnpm commit`).
 *
 * Enchaîne, dans l'ordre, avec ARRÊT au premier problème :
 *   1. CONTRÔLES : format:check → lint → typecheck → test  (STOP si ça casse)
 *   2. bump de version (patch/minor/major) → package.json
 *      (la version est lue de là par next.config.ts → NEXT_PUBLIC_APP_VERSION ;
 *       pas de sw.js à synchroniser en V3)
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
const SKIP_CONTROLS = has('--skip-controls');
const FORCE_MSG = val('--msg');

const PKG = resolve('package.json');

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

async function ask(rl: readline.Interface, q: string): Promise<string> {
  return (await rl.question(q)).trim();
}

async function main(): Promise<void> {
  if (DRY_RUN) console.log('\x1b[33m[DRY RUN]\x1b[0m\n');

  // 1) CONTRÔLES — au premier échec, on s'arrête AVANT tout effet de bord.
  if (SKIP_CONTROLS) {
    console.log('\x1b[90m[skip-controls] contrôles sautés.\x1b[0m');
  } else {
    const controls = [
      ['format', 'pnpm format:check'],
      ['lint', 'pnpm lint'],
      ['typecheck', 'pnpm typecheck'],
      ['test', 'pnpm test'],
    ] as const;
    for (const [label, cmd] of controls) {
      console.log(`\n▶ contrôle : ${label}`);
      try {
        sh(cmd);
      } catch {
        console.error(
          `\n\x1b[31m✗ Contrôle "${label}" échoué — rien n'a été publié. Corrige puis relance.\x1b[0m`,
        );
        if (label === 'format')
          console.error('  (astuce : `pnpm format` pour corriger le formatage)');
        process.exit(1);
      }
    }
    console.log('\n\x1b[32m✓ Tous les contrôles passent.\x1b[0m');
  }

  let newVersion = '';
  let msg = '';
  const rl = readline.createInterface({ input, output });
  try {
    // 2) BUMP DE VERSION.
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
      if (!DRY_RUN) writeFileSync(PKG, JSON.stringify(pkg, null, 2) + '\n');
      console.log(`Nouvelle version : \x1b[32m${newVersion}\x1b[0m`);
    } else {
      console.log('Version inchangée.');
    }

    // 3) MESSAGE (avant le push R2 : abandon ici = rien de publié).
    msg = FORCE_MSG ?? (await ask(rl, '\nMessage de commit : '));
    if (!msg) {
      console.log('Message vide — abandon.');
      process.exit(0);
    }
  } finally {
    // On LIBÈRE stdin AVANT de spawn git : un readline encore ouvert perturbe
    // les hooks git (spinner lefthook / TTY) et peut figer le commit.
    rl.close();
  }

  // 4) IMAGES → R2 (la prod lit R2 ; doit précéder le push git).
  console.log('\n▶ images (collect + push R2)');
  sh('pnpm images');

  // 5) COMMIT.
  const status = shOut('git status --porcelain');
  if (!status) {
    console.log('\nRien à committer.');
    process.exit(0);
  }
  const branch = shOut('git rev-parse --abbrev-ref HEAD');
  console.log(`\n▶ commit sur \x1b[36m${branch}\x1b[0m`);
  sh('git add -A');
  // --no-verify : on saute les hooks git (lefthook) car les contrôles ci-dessus
  // (format/lint/typecheck/test) SONT le garde-fou, joués plus tôt et avant le
  // push R2. Les hooks ne feraient que re-dérouler le même travail (et figeaient
  // le commit).
  sh(`git commit --no-verify -m ${JSON.stringify(msg)}`);

  // 6) PUSH.
  if (NO_PUSH) {
    console.log('\x1b[90m[no-push] pas de push.\x1b[0m');
  } else {
    console.log(`\n▶ push → ${branch}`);
    sh(`git push --no-verify origin ${branch}`);
  }

  console.log(`\n\x1b[32m✅ Terminé — ${newVersion} sur ${branch}.\x1b[0m\n`);
}

main().catch((e) => {
  console.error(`\n\x1b[31mErreur : ${e?.message ?? e}\x1b[0m`);
  process.exit(1);
});
