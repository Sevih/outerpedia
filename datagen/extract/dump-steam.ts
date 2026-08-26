/**
 * dump-steam — génère `<root>/apk/dumped/dump.cs` depuis le CLIENT STEAM
 * (`pnpm datagen:dump`). Pendant Mono de `dump.ts` (Il2CppDumper sur l'APK
 * Android, le secours) : même sortie pour l'aval (`lib/dump.ts` lit les deux syntaxes), et
 * en prime le code ENTIER, lisible — le client Steam est compilé en Mono, pas en
 * IL2CPP, et `Assembly-CSharp.dll` n'est pas obfusqué (noms complets, chemins
 * source d'origine dans les attributs).
 *
 * Entrées, copiées de l'install À CHAQUE dump (assortiment garanti, comme la
 * paire metadata/so côté Android) :
 *   - Assembly-CSharp.dll → <root>/apk/Assembly-CSharp.dll
 *   - globalgamemanagers  → <root>/apk/globalgamemanagers (colorSpace pour
 *                           portrait-fx, bundleVersion pour l'empreinte)
 *
 * Sorties (`<root>/apk/dumped/`) :
 *   - src/**\/*.cs        projet décompilé (ilspycmd -p), un type par fichier —
 *                        ce que lit `extract-cs.ts`, et le datamine libre ;
 *   - dump.cs            concaténation de src/ — le fichier UNIQUE que les
 *                        générateurs lisent (`readDump`), même nom qu'Android ;
 *   - .dump-stamp.json   empreinte : `source: 'steam'`, version applicative,
 *                        build Steam, sha256 du DLL. `refresh` la compare au DLL
 *                        tiré pour décider d'un re-dump ; `extract-cs` la vérifie.
 *
 * Prérequis : runtime .NET 10 (`dotnet --list-runtimes`), le jeu Steam installé.
 * Python + UnityPy pour la version applicative (sinon « inconnue », jamais devinée).
 * Chemin d'ilspycmd surchargeable via ILSPYCMD (le .dll du paquet).
 */
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import {
  copyFileSync,
  existsSync,
  mkdirSync,
  readFileSync,
  rmSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import { resolve } from 'node:path';
import { walkFiles } from '../lib/fs';
import { isMain } from '../lib/is-main';
import { gamedata } from '../lib/paths';
import { pythonToolingMissing } from '../lib/python';
import { extractListings } from './extract-cs';
import { requireSteamInstall, type SteamInstall } from './steam';
import { ILSPYCMD, ensureTool } from './tools';

const APK_DIR = gamedata('apk');
const DLL = resolve(APK_DIR, 'Assembly-CSharp.dll');
const GGM = resolve(APK_DIR, 'globalgamemanagers');
const OUT = resolve(APK_DIR, 'dumped');
const SRC = resolve(OUT, 'src');
const DUMP_CS = resolve(OUT, 'dump.cs');
const STAMP = resolve(OUT, '.dump-stamp.json');

function sha256(path: string): string {
  return createHash('sha256').update(readFileSync(path)).digest('hex');
}

/**
 * Version applicative du client (`bundleVersion`), via UnityPy. `'inconnue'` si
 * python/UnityPy manquent ou si le fichier ne la porte pas — la valeur
 * inconnue ne déclenche jamais de re-dump (cf. `dumpDecision`), donc pas de
 * fausse alerte, juste une empreinte moins bavarde.
 */
export function bundleVersion(ggm: string): string {
  const missing = pythonToolingMissing('UnityPy');
  if (missing) {
    console.warn(`  ⚠ version applicative non lue — ${missing}.`);
    return 'inconnue';
  }
  try {
    const v = execFileSync('python', [resolve('datagen/extract/bundle-version.py'), ggm], {
      encoding: 'utf-8',
      stdio: ['ignore', 'pipe', 'inherit'],
    }).trim();
    return v || 'inconnue';
  } catch {
    return 'inconnue';
  }
}

/**
 * `dump.cs` = tous les .cs du projet, à plat, chacun précédé de son chemin. Le
 * même fichier unique qu'Android : les générateurs n'ont qu'un chemin à
 * connaître, et un `grep` y trouve tout.
 */
function concatenate(srcDir: string, dest: string): number {
  const parts: string[] = [];
  let n = 0;
  walkFiles(srcDir, (abs, rel) => {
    if (!rel.endsWith('.cs')) return;
    parts.push(`// ===== ${rel}\n${readFileSync(abs, 'utf-8')}\n`);
    n++;
  });
  parts.sort();
  writeFileSync(dest, parts.join('\n'));
  return n;
}

export function dumpSteam(install: SteamInstall = requireSteamInstall()): void {
  console.log(`🎮 Steam : ${install.root}${install.buildId ? ` (build ${install.buildId})` : ''}`);
  mkdirSync(APK_DIR, { recursive: true });
  copyFileSync(install.assemblyDll, DLL);
  copyFileSync(install.globalGameManagers, GGM);
  const version = bundleVersion(GGM);
  console.log(`✓ DLL + globalgamemanagers copiés (jeu ${version}).`);

  const ilspy = process.env.ILSPYCMD ?? ensureTool(ILSPYCMD);
  // Décompilation PROPRE : la sortie précédente est effacée, sinon un type
  // renommé par le jeu laisserait son ancien fichier — et `extract-cs` le
  // trouverait encore, listing crédible et périmé.
  rmSync(SRC, { recursive: true, force: true });
  mkdirSync(SRC, { recursive: true });
  console.log('↻ ilspycmd → src/ (projet décompilé) ...');
  execFileSync('dotnet', [ilspy, '-p', '-o', SRC, DLL], { stdio: 'inherit' });
  const n = concatenate(SRC, DUMP_CS);
  console.log(`✓ ${n} fichiers → dump.cs`);

  // Empreinte écrite APRÈS le décompileur : elle atteste que src/ sort de CE DLL.
  writeFileSync(
    STAMP,
    JSON.stringify(
      {
        source: 'steam',
        gameVersion: version,
        buildId: install.buildId,
        dll: { sha256: sha256(DLL), bytes: statSync(DLL).size },
      },
      null,
      2,
    ) + '\n',
  );
  console.log(`✅ dump généré dans ${OUT}`);

  // Les listings C# des specs damage suivent le dump à chaque patch. Un échec
  // ici doit se VOIR (méthode renommée) ; le dump
  // lui-même reste acquis — relancer seul via `pnpm datagen:extract-cs`.
  console.log('↻ listings C# (datagen/extract/extract-cs.ts) ...');
  extractListings();
}

if (isMain(import.meta.url)) {
  try {
    if (!existsSync(resolve('datagen/extract/listings.json'))) {
      throw new Error('datagen/extract/listings.json introuvable.');
    }
    dumpSteam();
  } catch (e) {
    console.error('\n✗ datagen:dump a échoué :', e instanceof Error ? e.message : e);
    process.exit(1);
  }
}
