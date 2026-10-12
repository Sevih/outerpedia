/**
 * Le diff d'UNE entité, LISIBLE : les feuilles d'un `FieldDiff[]` groupées par
 * racine (`skills[#102].desc.en` sous « skills › Fire Strike · active »), une
 * chaîne contre une chaîne en diff de MOTS (`diff-words`), toute autre valeur
 * rendue en ARBRE — une ligne par clé, les listes énumérées, « (absent) » pour
 * un côté vide. Jamais un `JSON.stringify` sur une ligne : c'était le « pas
 * joli » de `EntityDiffPanel` (revue d'extraction, migration 19).
 *
 * PUR : la page de quick reçoit ces groupes du serveur et ne fait que les
 * poser ; les libellés des ids (`labels`, cf. `diff-labels`) viennent de
 * l'appelant, qui seul sait ce que vaut un id dans son domaine.
 */
import { diffRoot, labelKey } from '@/lib/admin/diff-labels';
import type { FieldDiff } from '@/lib/admin/review-types';
import { colorSegments, diffWords, type WordSegment } from '@/lib/admin/diff-words';

/** Une ligne d'arbre : sa profondeur, sa clé, sa valeur (absente pour une branche). */
export interface TreeLine {
  depth: number;
  /** `''` pour une valeur nue à la racine. */
  key: string;
  /** La valeur en segments (couleurs du jeu rendues) ; une BRANCHE n'en a pas. */
  value?: WordSegment[];
  /** Le libellé humain d'un id résolu (« — Fire Strike · active »). */
  label?: string;
  /** La valeur n'existe pas de ce côté. */
  absent?: boolean;
  /** Une branche : combien d'entrées elle porte. */
  count?: number;
}

/** Un champ changé : un texte en diff de mots, ou deux arbres. */
export type DiffField =
  | {
      path: string;
      /** Le chemin SOUS le groupe (`desc › en`), `(entier)` quand c'est le groupe même. */
      name: string;
      kind: 'text';
      existing: WordSegment[];
      extracted: WordSegment[];
    }
  | {
      path: string;
      name: string;
      kind: 'tree';
      existing: TreeLine[];
      extracted: TreeLine[];
    };

/** Les champs d'une racine (et de son élément identifié, s'il y en a un). */
export interface DiffGroup {
  /** `skills`, ou `skills[#102]`. */
  key: string;
  /** La racine, puis l'élément résolu : « skills › Fire Strike · active ». */
  title: string;
  fields: DiffField[];
}

export const ABSENT = '(absent)';

function isPlainObject(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

/** Segments d'un chemin de feuille : `costumes[#17].name.en` → costumes, #17, name, en. */
export function pathSegments(path: string): string[] {
  return path.split(/[.[\]]+/).filter(Boolean);
}

/** Un scalaire en segments : une chaîne garde ses couleurs du jeu, le reste s'écrit tel quel. */
function scalar(v: unknown): WordSegment[] {
  if (typeof v === 'string') return v ? colorSegments(v) : [{ kind: 'same', text: '""' }];
  return [{ kind: 'same', text: v === null ? 'null' : String(v) }];
}

/** La clé d'un élément de liste : son `id` quand il en a un, sinon son rang. */
function elementKey(e: unknown, i: number): string {
  if (isPlainObject(e) && (typeof e.id === 'string' || typeof e.id === 'number'))
    return `#${String(e.id)}`;
  return `[${i}]`;
}

/**
 * Une valeur en lignes d'arbre. `resolve` donne le libellé d'un id scalaire
 * (les éléments d'une liste d'ids, la valeur nue d'un champ `skills[3]`).
 */
export function treeLines(
  v: unknown,
  resolve: (value: string) => string | undefined = () => undefined,
): TreeLine[] {
  const out: TreeLine[] = [];
  const walk = (value: unknown, depth: number, key: string): void => {
    if (value === undefined) {
      out.push({ depth, key, value: [{ kind: 'same', text: ABSENT }], absent: true });
      return;
    }
    if (Array.isArray(value)) {
      // La racine n'a pas de ligne de titre : ses entrées sont l'arbre.
      const inner = key ? depth + 1 : depth;
      if (key) out.push({ depth, key, count: value.length });
      if (key && !value.length) out[out.length - 1].value = [{ kind: 'same', text: '[]' }];
      value.forEach((e, i) => walk(e, inner, elementKey(e, i)));
      return;
    }
    if (isPlainObject(value)) {
      const entries = Object.entries(value);
      const inner = key ? depth + 1 : depth;
      if (key) out.push({ depth, key, count: entries.length });
      if (key && !entries.length) out[out.length - 1].value = [{ kind: 'same', text: '{}' }];
      for (const [k, e] of entries) walk(e, inner, k);
      return;
    }
    const label = typeof value === 'string' ? resolve(value) : undefined;
    out.push({ depth, key, value: scalar(value), ...(label ? { label } : {}) });
  };
  walk(v, 0, '');
  return out;
}

/**
 * Les feuilles groupées par racine — et par élément identifié (`[#id]`) juste
 * sous la racine, dont le libellé résolu fait le titre du groupe. Une chaîne
 * contre une chaîne va en diff de mots, sauf si l'une des deux est un id
 * résolu (« 132 » contre « 130 » mot à mot ne dit rien) : les libellés sont
 * alors montrés, en arbre.
 */
export function diffTree(fields: FieldDiff[], labels: Record<string, string> = {}): DiffGroup[] {
  const groups = new Map<string, DiffGroup>();
  for (const f of fields) {
    const root = diffRoot(f.path);
    const seg = pathSegments(f.path);
    const idSeg = seg[1]?.startsWith('#') ? seg[1] : undefined;
    const key = idSeg ? `${root}[${idSeg}]` : root;
    const resolve = (value: string): string | undefined => labels[labelKey(root, value)];
    let group = groups.get(key);
    if (!group) {
      const elementLabel = idSeg ? (resolve(idSeg.slice(1)) ?? idSeg) : undefined;
      group = { key, title: elementLabel ? `${root} › ${elementLabel}` : root, fields: [] };
      groups.set(key, group);
    }
    const rest = seg.slice(idSeg ? 2 : 1);
    const name = rest.length ? rest.join(' › ') : '(entier)';
    const bothStrings = typeof f.existing === 'string' && typeof f.extracted === 'string';
    const resolved =
      (typeof f.existing === 'string' && resolve(f.existing)) ||
      (typeof f.extracted === 'string' && resolve(f.extracted));
    if (bothStrings && !resolved) {
      const words = diffWords(f.existing as string, f.extracted as string);
      group.fields.push({
        path: f.path,
        name,
        kind: 'text',
        existing: words.existing,
        extracted: words.extracted,
      });
    } else {
      group.fields.push({
        path: f.path,
        name,
        kind: 'tree',
        existing: treeLines(f.existing, resolve),
        extracted: treeLines(f.extracted, resolve),
      });
    }
  }
  return [...groups.values()];
}
