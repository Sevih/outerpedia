/**
 * ui-serve — comment la page de quick, découpée dans `scripts/quick/ui/`, est
 * rendue au navigateur.
 *
 *   - `index.html` est la coquille : un marqueur `<!-- @tab nom -->` par onglet,
 *     que `assemblePage` remplace par `tabs/<nom>.html` ;
 *   - le reste (feuille de styles, modules de la page) part par `GET /ui/…`,
 *     et `resolveUiFile` dit quel fichier — ou aucun.
 *
 * PUR : ni disque ni réseau. `server.ts` lit les fichiers et répond ; ce
 * module décide, et c'est lui que les tests couvrent. La seconde fonction est
 * une garde : quick écoute parfois le réseau local (cf. `lan.ts`), et une route
 * qui sert des fichiers ne doit pas pouvoir sortir de son dossier.
 */
import { extname, resolve, sep } from 'node:path';

/** Le marqueur d'un onglet dans `index.html`. */
const TAB_MARKER = /<!-- @tab ([a-z0-9-]+) -->/g;
/** Ce qui ressemble à un marqueur sans en être un : une faute de frappe, à dire. */
const ANY_MARKER = /<!--\s*@tab\b[^>]*-->/;

/** Les onglets que la coquille réclame, dans l'ordre de la page. */
export function tabsOf(shell: string): string[] {
  return [...shell.matchAll(TAB_MARKER)].map((m) => m[1]);
}

/**
 * La page complète : la coquille, chaque marqueur remplacé par le markup de son
 * onglet. `readTab` rend le contenu de `tabs/<nom>.html`, ou `null` s'il manque.
 *
 * Un onglet réclamé sans fichier est une ERREUR, pas un trou dans la page : la
 * section absente, son script échouerait plus loin sur un `null` sans dire
 * pourquoi.
 */
export function assemblePage(shell: string, readTab: (name: string) => string | null): string {
  const page = shell.replace(TAB_MARKER, (_, name: string) => {
    const html = readTab(name);
    if (html === null)
      throw new Error(
        `index.html réclame l'onglet « ${name} », mais scripts/quick/ui/tabs/${name}.html manque`,
      );
    return html.trimEnd();
  });
  const stray = ANY_MARKER.exec(page);
  if (stray) throw new Error(`marqueur d'onglet illisible dans la page : ${stray[0]}`);
  return page;
}

/**
 * Ce que `GET /ui/…` accepte de servir, et sous quel type. Une LISTE BLANCHE :
 * les `.html` des onglets n'en sont pas (ils ne partent qu'assemblés), ni rien
 * d'autre de ce qui pourrait se trouver là.
 */
export const UI_TYPES: ReadonlyMap<string, string> = new Map([
  ['.css', 'text/css; charset=utf-8'],
  ['.js', 'text/javascript; charset=utf-8'],
  ['.mjs', 'text/javascript; charset=utf-8'],
  ['.woff2', 'font/woff2'],
  ['.png', 'image/png'],
  ['.svg', 'image/svg+xml'],
]);

/**
 * Le fichier de `root` (le dossier `ui/`) que désigne `path` — ce qui suit
 * `/ui/` dans l'adresse, encore encodé — et son type MIME ; `null` si la
 * demande n'est pas servie.
 *
 * Le chemin est décodé, résolu, PUIS vérifié : c'est le résultat qui doit être
 * sous `root`, quoi que l'adresse ait contenu (`..`, `%2e%2e`, `%2f`, un chemin
 * absolu, des `\` sous Windows).
 */
export function resolveUiFile(root: string, path: string): { file: string; type: string } | null {
  let decoded: string;
  try {
    decoded = decodeURIComponent(path);
  } catch {
    return null;
  }
  if (!decoded || decoded.includes('\0')) return null;
  if (decoded.split(/[\\/]/).includes('..')) return null;
  const base = resolve(root);
  const file = resolve(base, decoded);
  if (!file.startsWith(base + sep)) return null;
  const type = UI_TYPES.get(extname(file).toLowerCase());
  return type ? { file, type } : null;
}
