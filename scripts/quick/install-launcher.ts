/**
 * install-launcher — pose l'icône de `quick` (`pnpm quick:install`), sur le
 * poste où on la lance : entrée `.desktop` sous Linux, raccourci du menu
 * Démarrer sous Windows. L'outil apparaît alors dans le menu (et peut être
 * épinglé à la barre des tâches), lancé d'un double-clic sans terminal.
 *
 * Les deux branches pointent le dépôt en ABSOLU — relancer la commande après un
 * déplacement du dépôt suffit à réparer le raccourci.
 */
import { spawnSync } from 'node:child_process';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { resolve } from 'node:path';
import { isMain } from '@datagen/lib/is-main';

const repo = resolve(import.meta.dirname, '..', '..');
const PNG = resolve(repo, 'public/icons/icon-192x192.png');

/**
 * Emballe un PNG en `.ico` — Windows veut une icône à ce format pour un
 * raccourci, et le dépôt n'en versionne pas (le site n'en a pas l'usage).
 *
 * Un `.ico` accepte une image PNG telle quelle depuis Vista : l'en-tête tient
 * en 22 octets (ICONDIR de 6 + une ICONDIRENTRY de 16) et le PNG suit, intact.
 * Pas de conversion, donc pas de dépendance d'image à tirer pour une icône.
 */
export function pngToIco(png: Buffer, size: number): Buffer {
  const header = Buffer.alloc(22);
  header.writeUInt16LE(0, 0); // réservé
  header.writeUInt16LE(1, 2); // type : 1 = icône
  header.writeUInt16LE(1, 4); // une seule image
  header.writeUInt8(size, 6); // largeur (0 signifierait 256)
  header.writeUInt8(size, 7); // hauteur
  header.writeUInt8(0, 8); // palette : aucune
  header.writeUInt8(0, 9); // réservé
  header.writeUInt16LE(1, 10); // plans
  header.writeUInt16LE(32, 12); // bits par pixel
  header.writeUInt32LE(png.length, 14);
  header.writeUInt32LE(22, 18); // le PNG commence juste après l'en-tête
  return Buffer.concat([header, png]);
}

function installLinux(): void {
  const dir = resolve(homedir(), '.local/share/applications');
  const file = resolve(dir, 'outerpedia-quick.desktop');
  mkdirSync(dir, { recursive: true });
  writeFileSync(
    file,
    `[Desktop Entry]
Type=Application
Name=Outerpedia quick
GenericName=Codes promo, 4-comics, vidéos
Comment=Les trois gestes du quotidien, sans lancer le serveur de dev
Exec=${resolve(repo, 'scripts/quick/launch.sh')}
Path=${repo}
Icon=${PNG}
Terminal=false
StartupNotify=true
Categories=Utility;
`,
    'utf8',
  );
  console.log(`Icône installée : ${file}`);
  console.log('Elle apparaît dans le menu sous « Outerpedia quick ».');
}

function installWindows(): void {
  const appData = process.env.APPDATA;
  const localAppData = process.env.LOCALAPPDATA;
  if (!appData || !localAppData)
    throw new Error('APPDATA/LOCALAPPDATA absents de l’environnement.');

  // L'icône est GÉNÉRÉE hors du dépôt : rien de binaire à committer pour un
  // fichier qui ne sert qu'au poste qui l'installe.
  const iconDir = resolve(localAppData, 'outerpedia-quick');
  const icon = resolve(iconDir, 'icon.ico');
  mkdirSync(iconDir, { recursive: true });
  writeFileSync(icon, pngToIco(readFileSync(PNG), 192));

  const lnk = resolve(appData, 'Microsoft/Windows/Start Menu/Programs/Outerpedia quick.lnk');
  const target = resolve(repo, 'scripts/quick/launch.cmd');

  // Un `.lnk` n'est pas un format qu'on écrit à la main : on passe par l'objet
  // COM WScript.Shell, présent sur tout Windows.
  //
  // Les chemins passent par des VARIABLES D'ENVIRONNEMENT, pas par des
  // arguments : avec `-Command`, powershell.exe recolle tout ce qui suit en une
  // seule ligne de commande qu'il réanalyse — `$args` reste vide et le premier
  // chemin devient un « jeton inattendu ». Un env: est lu tel quel, sans
  // réanalyse : ni espaces ni accents à échapper (la description en a).
  const ps = [
    '$s = (New-Object -ComObject WScript.Shell).CreateShortcut($env:QUICK_LNK)',
    '$s.TargetPath = $env:QUICK_TARGET',
    '$s.WorkingDirectory = $env:QUICK_CWD',
    '$s.IconLocation = $env:QUICK_ICON',
    '$s.Description = $env:QUICK_DESC',
    '$s.Save()',
  ].join('; ');

  const res = spawnSync('powershell', ['-NoProfile', '-NonInteractive', '-Command', ps], {
    encoding: 'utf8',
    env: {
      ...process.env,
      QUICK_LNK: lnk,
      QUICK_TARGET: target,
      QUICK_CWD: repo,
      QUICK_ICON: icon,
      QUICK_DESC: 'Codes promo, 4-comics, vidéos — sans lancer le serveur de dev',
    },
  });
  if (res.status !== 0)
    throw new Error(`Création du raccourci impossible : ${(res.stderr ?? '').trim()}`);

  console.log(`Raccourci installé : ${lnk}`);
  console.log('Il apparaît dans le menu Démarrer sous « Outerpedia quick ».');
}

// Garde d'exécution directe : sans elle, importer ce module pour `pngToIco`
// (un test, par exemple) POSAIT l'icône au passage.
if (isMain(import.meta.url)) {
  if (process.platform === 'win32') installWindows();
  else installLinux();
}
