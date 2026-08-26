/**
 * dump — génère `<root>/apk/dumped/dump.cs` via Il2CppDumper (`pnpm datagen:dump-android`,
 * la source de SECOURS depuis le 26/08/2026 ; le défaut est `dump-steam.ts`).
 *
 * `dump.cs` = tout le code du client sous forme lisible (enums, structures, méthodes).
 * Les générateurs (goods, recruit) n'en lisent QU'`ASSET_TYPE`, mais le fichier sert
 * aussi au datamine libre (formules de dégâts, etc.) — d'où le dump complet.
 *
 * SOURCE = l'APK INSTALLÉ sur l'émulateur. Il2CppDumper exige DEUX fichiers de la
 * MÊME version, sinon il échoue (`MetadataRegistration : 0`). Ce n'est PAS une
 * protection : c'est un DÉPAREILLAGE. On les extrait donc du MÊME install :
 *   - global-metadata.dat ← base.apk (assets/bin/Data/Managed/Metadata/)
 *   - libil2cpp.so        ← split_config.arm64_v8a.apk (lib/arm64-v8a/)
 * → paire garantie assortie, aucune manip manuelle, aucun .so à fournir.
 *
 * Extraction fiable : `adb exec-out` corrompt le binaire (traduction CRLF), donc on
 * fait `unzip -p` CÔTÉ DEVICE vers /data/local/tmp, puis `adb pull` (transfert exact).
 *
 * Sortie : `.gamedata/apk/dumped/` (dump.cs + il2cpp.h + script.json + DummyDll).
 * Prérequis : LDPlayer lancé + jeu installé, runtime .NET 6 (Il2CppDumper).
 * ADB surchargeable via ADB_PATH.
 */
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { isMain } from '../lib/is-main';
import { PKG, capture, ensureRoot, gameVersion, pickDevice, stream } from './adb';
import { IL2CPPDUMPER, ensureTool } from './tools';
import { gamedata } from '../lib/paths';

// Entrées à extraire des APK (chemins internes stables du zip).
const META_ENTRY = 'assets/bin/Data/Managed/Metadata/global-metadata.dat';
const SO_ENTRY = 'lib/arm64-v8a/libil2cpp.so';
// `globalgamemanagers` porte les PlayerSettings du build, dont l'`m_ActiveColorSpace`
// que rien d'autre ne dit (ni prefabs, ni matériaux, ni bundles) — cf.
// `assets/extract-portrait-fx.py`. Il vivait dans une APK déposée à la main, donc
// sur UNE machine ; on le tire du jeu INSTALLÉ, comme la paire metadata/so.
const GGM_ENTRY = 'assets/bin/Data/globalgamemanagers';

const APK_DIR = gamedata('apk');
const META = resolve(APK_DIR, 'global-metadata.dat');
const SO = resolve(APK_DIR, 'libil2cpp.so');
const GGM = resolve(APK_DIR, 'globalgamemanagers');
const OUT = resolve(APK_DIR, 'dumped');
// Empreinte du dump : ATTESTE que le script.json d'à côté sort de CE binaire
// (`refresh` la compare à l'installé pour décider d'un re-dump).
const STAMP = resolve(OUT, '.dump-stamp.json');
const REMOTE_TMP = '/data/local/tmp';

/** Chemins des APK (base + splits) de l'install, via `pm path`. */
function apkPaths(serial: string): string[] {
  return capture(['-s', serial, 'shell', 'pm', 'path', PKG])
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.startsWith('package:'))
    .map((l) => l.slice('package:'.length));
}

/**
 * Extrait une entrée d'un APK vers un fichier local, à l'OCTET EXACT.
 * `unzip -p` côté device (la redirection shell Android est propre) → `adb pull`.
 */
function extractFromApk(serial: string, apk: string, entry: string, dest: string): void {
  const remote = `${REMOTE_TMP}/il2cppdump_extract.bin`;
  // Guillemets simples autour de l'APK : le chemin contient `==` (base64 du install id).
  // BusyBox `unzip -p` bavarde sur stderr (`invalid zip magic`, bénin) et SORT en
  // erreur même quand l'entrée est extraite : on force donc un exit 0 (`; true`) et
  // on supprime son bruit — la validité est jugée sur le fichier tiré, pas le code.
  stream(['-s', serial, 'shell', `unzip -p '${apk}' '${entry}' 2>/dev/null > ${remote}; true`]);
  mkdirSync(dirname(dest), { recursive: true });
  stream(['-s', serial, 'pull', remote, dest]);
  stream(['-s', serial, 'shell', `rm -f ${remote}`]);
  if (!existsSync(dest) || statSync(dest).size === 0) {
    throw new Error(`Extraction vide : ${entry} introuvable dans ${apk} ?`);
  }
}

/**
 * Récupère la PAIRE ASSORTIE (metadata + so) depuis l'APK installé sur l'émulateur.
 * C'est la garantie anti-dépareillage : les deux fichiers viennent du même install.
 * Renvoie la version du jeu ainsi extraite.
 */
function pullMatchedPair(): string {
  const serial = pickDevice();
  console.log(`📱 Device : ${serial}`);
  ensureRoot(serial);

  const apks = apkPaths(serial);
  const base = apks.find((p) => p.endsWith('/base.apk'));
  const arm64 = apks.find((p) => /arm64/.test(p));
  if (!base) throw new Error(`base.apk introuvable dans l'install (${apks.length} apk vus).`);
  if (!arm64) {
    throw new Error(
      `split arm64 introuvable (${apks.join(', ') || 'aucun apk'}). ` +
        `L'émulateur fournit-il bien la variante arm64-v8a ?`,
    );
  }

  console.log('↻ extraction metadata (base.apk)...');
  extractFromApk(serial, base, META_ENTRY, META);
  console.log('↻ extraction libil2cpp.so (split arm64)...');
  extractFromApk(serial, arm64, SO_ENTRY, SO);
  console.log('↻ extraction globalgamemanagers (base.apk)...');
  extractFromApk(serial, base, GGM_ENTRY, GGM);
  const version = gameVersion(serial) ?? 'inconnue';
  console.log(`✓ paire assortie extraite (jeu ${version}).`);
  return version;
}

function sha256(path: string): string {
  return createHash('sha256').update(readFileSync(path)).digest('hex');
}

/**
 * Force `RequireAnyKey: false` dans le config.json d'Il2CppDumper : sinon il
 * termine par un `Press any key to exit` (ReadKey) qui BLOQUE — ou plante quand
 * stdin est redirigé — même quand le dump a réussi.
 */
function disablePrompt(bin: string): void {
  const cfg = resolve(dirname(bin), 'config.json');
  if (!existsSync(cfg)) return;
  try {
    const json = JSON.parse(readFileSync(cfg, 'utf8'));
    if (json.RequireAnyKey !== false) {
      json.RequireAnyKey = false;
      writeFileSync(cfg, JSON.stringify(json, null, 2) + '\n');
    }
  } catch {
    // config.json illisible : on laisse Il2CppDumper avec ses défauts.
  }
}

export function dump(): void {
  // Paire assortie ré-extraite de l'émulateur À CHAQUE dump : c'est la seule
  // garantie d'assortiment .so/metadata. (L'ex-IL2CPP_SO « mode avancé » a été
  // supprimée — décision Sevih 2026-07-17 : jamais utilisée, et elle faisait
  // écraser le .so fourni quand la metadata manquait.)
  const version = pullMatchedPair();

  const bin = process.env.IL2CPP_DUMPER ?? ensureTool(IL2CPPDUMPER);
  disablePrompt(bin);
  mkdirSync(OUT, { recursive: true });
  console.log('↻ Il2CppDumper → dump.cs ...');
  // Il2CppDumper.exe <binaire> <global-metadata> <dossier-sortie>
  execFileSync(bin, [SO, META, OUT], { stdio: 'inherit' });
  // Empreinte écrite APRÈS le dumper : elle atteste que le script.json qui vient
  // d'atterrir dans OUT sort bien de ce .so-là.
  writeFileSync(
    STAMP,
    JSON.stringify(
      {
        gameVersion: version,
        so: { sha256: sha256(SO), bytes: statSync(SO).size },
        metadata: { sha256: sha256(META), bytes: statSync(META).size },
      },
      null,
      2,
    ) + '\n',
  );
  console.log(`✅ dump généré dans ${OUT}`);
  // Plus de listings ici : les specs damage se lisent sur le C# du client Steam
  // (`extract-cs.ts`) depuis le 26/08/2026 — cette source est le SECOURS.
}

if (isMain(import.meta.url)) {
  try {
    dump();
  } catch (e) {
    console.error('\n✗ datagen:dump a échoué :', e instanceof Error ? e.message : e);
    process.exit(1);
  }
}
