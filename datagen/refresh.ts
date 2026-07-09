/**
 * refresh — définition UNIQUE du flux « rafraîchir la donnée depuis le jeu ».
 *
 * Le RÉSULTAT DU PULL pilote tout : on ne re-génère que si on a réellement tiré
 * du nouveau (ou `--force`). Sinon on saute toute la chaîne.
 *
 *   pull (si LDPlayer + diff)
 *     └─ si tiré : extract → convert → build → promote[ --apply] → [collect]
 *   [getNews]  ← optionnel (fetch web, indépendant du datamine)
 *
 * Deux points d'entrée partagent ce module (plus de logique dupliquée) :
 *   - `pnpm dev`         → scripts/dev-refresh.ts : { apply, collect, news } = true
 *   - `pnpm datagen:patch` → CLI ci-dessous : promote en DRY (revue), sans extras
 */
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join, resolve } from 'node:path';
import { pull } from './extract/pull-gamedata';

const TSX_CLI = resolve('node_modules/tsx/dist/cli.mjs');
const GAMEDATA = resolve('.gamedata/files');
// Empreinte des ENTRÉES au dernier build RÉUSSI. Tant que la signature actuelle
// == ce stamp, la donnée générée est à jour ; sinon on régénère. Comme le stamp
// n'est écrit qu'APRÈS un succès, un extract planté en cours laisse la signature
// désynchronisée → le run suivant se répare tout seul (sans avoir à `--force`).
const STAMP = resolve('.gamedata/.refresh-stamp');

/** Lance un script TS via tsx, en héritant du terminal. Lève si échec. */
function step(label: string, file: string, args: string[] = []): void {
  console.log(`\n▶ ${label}`);
  execFileSync(process.execPath, [TSX_CLI, resolve(file), ...args], { stdio: 'inherit' });
}

/**
 * Signature bon marché de `.gamedata/files` : md5 de la liste triée
 * `chemin:taille` (aucune lecture de contenu — les bundles sont content-addressed,
 * leur NOM change déjà avec le contenu). '' si le dossier est absent.
 */
function inputSignature(): string {
  if (!existsSync(GAMEDATA)) return '';
  const parts: string[] = [];
  const walk = (dir: string, prefix: string): void => {
    for (const e of readdirSync(dir, { withFileTypes: true })) {
      const rel = prefix ? `${prefix}/${e.name}` : e.name;
      const abs = join(dir, e.name);
      if (e.isDirectory()) walk(abs, rel);
      else if (e.isFile()) parts.push(`${rel}:${statSync(abs).size}`);
    }
  };
  walk(GAMEDATA, '');
  return createHash('md5').update(parts.sort().join('\n')).digest('hex');
}

const readStamp = (): string | null => {
  try {
    return readFileSync(STAMP, 'utf8').trim();
  } catch {
    return null;
  }
};

export type RefreshOptions = {
  /** Forcer la re-génération même si le local est déjà à jour (filet anti-échec). */
  force?: boolean;
  /** Sauter le pull (travail offline sur la donnée committée). */
  noPull?: boolean;
  /** `promote --apply` (écrit data/generated) plutôt que le dry-run de revue. */
  apply?: boolean;
  /** Rejouer `assets:collect` (staging des images). */
  collect?: boolean;
  /** Rejouer `getNews` (toujours, indépendant du pull). */
  news?: boolean;
};

/** Exécute le flux de rafraîchissement gaté sur le résultat du pull. */
export async function refresh(opts: RefreshOptions = {}): Promise<void> {
  const { force = false, noPull = false, apply = false, collect = false, news = false } = opts;

  // 1) Pull — ne tire que si LDPlayer est là ET que le distant diffère.
  let changed = false;
  if (noPull) {
    console.log('⏭  pull sauté (--no-pull).');
  } else {
    console.log('▶ pull (jeu → .gamedata)');
    changed = (await pull()).changed;
  }

  // 2) Décision de (re)génération. On régénère si :
  //   - `--force`, ou
  //   - le pull a ramené du neuf, ou
  //   - la signature des entrées ≠ stamp du dernier build réussi (AUTO-RÉPARATION :
  //     couvre un extract planté, un `.gamedata` restauré à la main, etc.).
  // Rien à générer si `.gamedata/files` est absent (ex. machine sans datamine).
  const hasGamedata = existsSync(GAMEDATA);
  const currentSig = inputSignature();
  const prevSig = readStamp();
  const staleByStamp = hasGamedata && prevSig !== null && prevSig !== currentSig;
  const doGen = hasGamedata && (force || changed || staleByStamp);

  if (doGen) {
    if (!changed && (force || staleByStamp)) {
      console.log(
        force
          ? '\n⚙  --force : re-génération malgré un local à jour.'
          : '\n⚙  signature des entrées ≠ dernier build → re-génération (auto-réparation).',
      );
    }
    step('extract  (.bytes + images)', 'datagen/extract/extract.ts');
    step('convert  (.bytes → templates)', 'datagen/templates/convert.ts');
    step('build    (générateurs → data/extracted)', 'datagen/build.ts');
    step(
      apply ? 'promote  (extracted → generated)' : 'promote  (revue du diff — dry-run)',
      'datagen/promote.ts',
      apply ? ['--apply'] : [],
    );
    if (collect) step('assets   (collecte images → staging)', 'datagen/assets/collect.ts');
    // Succès de toute la chaîne : on grave le stamp (une exception plus haut nous
    // aurait fait sortir avant → stamp inchangé → réparation au prochain run).
    writeFileSync(STAMP, currentSig);
  } else {
    console.log('\n✓ Donnée à jour — génération sautée.');
    // Amorçage silencieux : 1er run sans stamp mais donnée committée réputée à
    // jour → on grave la baseline sans régénérer (évite un extract inutile).
    if (hasGamedata && prevSig === null) writeFileSync(STAMP, currentSig);
  }

  // 3) News — optionnel (fetch web, indépendant du jeu).
  if (news) step('getNews', 'scripts/get-news.ts');
}

// Exécution directe = `pnpm datagen:patch` : refresh headless, promote en DRY
// (revue du diff) sauf `--apply`. Flags : --force / --no-pull / --apply / --collect.
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const a = process.argv.slice(2);
  refresh({
    force: a.includes('--force'),
    noPull: a.includes('--no-pull'),
    apply: a.includes('--apply'),
    collect: a.includes('--collect'),
    news: false,
  })
    .then(() => console.log('\n✅ refresh terminé.\n'))
    .catch((e) => {
      console.error('\n✗ refresh a échoué :', e?.message ?? e);
      process.exit(1);
    });
}
