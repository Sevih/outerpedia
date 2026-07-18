/**
 * TOKENS DE JEU — les mentions d'ÉLÉMENT et de CLASSE dans les textes du jeu.
 *
 * Les descriptions de compétences nomment éléments et classes en toutes lettres,
 * dans la langue du joueur : « if the target is not a Defender », « 対象が防御型
 * でない場合 », « Increases damage received from Water and Earth enemies ». En jeu
 * ces mots sont lus comme des symboles ; en texte brut ils se noient.
 *
 * La V2 maintenait à la MAIN une table de tokens par langue (`boss-utils.ts` :
 * ELEMENT_TOKENS / CLASS_TOKENS, écrites en dur, quatre langues). Ici la table se
 * DÉDUIT du glossaire extrait (`glossaries.elements` / `.classes`) : ce sont déjà
 * les noms localisés, sortis du jeu. Un élément ajouté, une langue ajoutée —
 * ça suit tout seul, sans qu'on touche à ce fichier.
 *
 * Cohérence de langue : les tokens sont résolus par `lRec`, EXACTEMENT comme le
 * texte dans lequel on les cherche. Si le jeu ne fournit pas la langue (le
 * français, par exemple), les deux retombent ensemble sur l'anglais — on ne peut
 * donc pas chercher des tokens anglais dans un texte japonais, ni l'inverse.
 *
 * Vérifié sur les 92 descriptions de compétences de monstres : 6 mentions
 * anglaises tombent HORS des balises `<color>` du jeu (« non-Earth enemies »,
 * « Enemy Mage DMG ») — la détection ne peut donc pas se limiter aux passages
 * colorés. Et zéro faux positif : aucun de ces mots n'apparaît dans un autre sens.
 */
import type { Glossaries } from '@contracts';
import type { Lang } from '@/lib/i18n/config';
import { lRec } from '@/lib/i18n/localize';
import glossariesData from '@data/generated/glossaries.json';

const G = glossariesData as unknown as Glossaries;

export type GameTokenKind = 'element' | 'class';

/** Une mention reconnue dans un texte du jeu. */
export interface GameToken {
  kind: GameTokenKind;
  /** Slug canonique (`fire`, `defender`…) — clé des icônes et des couleurs. */
  slug: string;
  /** Le texte tel qu'il apparaissait, dans la langue rendue. */
  text: string;
}

interface TokenTable {
  re: RegExp;
  bySlugText: Map<string, { kind: GameTokenKind; slug: string }>;
}

/** Une table par langue — le coût de construction est payé une seule fois. */
const TABLES = new Map<Lang, TokenTable | null>();

/**
 * Un caractère d'IDÉOGRAMME ne connaît pas la notion de « bord de mot » : `\b`
 * n'y matche jamais. On ne borne donc que les langues à alphabet latin, où le
 * bord est indispensable (sans lui, « Fire » matcherait dans « Firewall »).
 */
function isLatin(text: string): boolean {
  return /^[\x20-\x7F]+$/.test(text);
}

function escape(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function tableFor(lang: Lang): TokenTable | null {
  const cached = TABLES.get(lang);
  if (cached !== undefined) return cached;

  const bySlugText = new Map<string, { kind: GameTokenKind; slug: string }>();
  const entries: { kind: GameTokenKind; slug: string; text: string }[] = [];
  for (const [kind, dict] of [
    ['element', G.elements],
    ['class', G.classes],
  ] as const) {
    for (const slug of Object.keys(dict ?? {})) {
      const text = lRec(dict?.[slug], lang);
      if (!text) continue;
      entries.push({ kind, slug, text });
      bySlugText.set(text, { kind, slug });
    }
  }

  if (!entries.length) {
    TABLES.set(lang, null);
    return null;
  }

  // PLUS LONG D'ABORD : sans ça, un token préfixe d'un autre gagnerait la course
  // et couperait le second en deux.
  const alt = entries
    .map((e) => e.text)
    .sort((a, b) => b.length - a.length)
    .map((text) => (isLatin(text) ? `\\b${escape(text)}\\b` : escape(text)))
    .join('|');

  const table = { re: new RegExp(`(${alt})`, 'g'), bySlugText };
  TABLES.set(lang, table);
  return table;
}

/**
 * Découpe un fragment de texte en morceaux bruts et en tokens reconnus. Le
 * fragment doit être DÉJÀ débarrassé des balises du jeu (`<color=…>`) : on ne
 * cherche des mots que dans du texte, jamais dans du balisage.
 */
export function splitGameTokens(text: string, lang: Lang): (string | GameToken)[] {
  const table = tableFor(lang);
  if (!table) return [text];

  const out: (string | GameToken)[] = [];
  let last = 0;
  let m: RegExpExecArray | null;
  table.re.lastIndex = 0;
  while ((m = table.re.exec(text))) {
    if (m.index > last) out.push(text.slice(last, m.index));
    const hit = table.bySlugText.get(m[1]);
    // Une alternance qui matche vient forcément de la table — mais on ne se
    // repose pas là-dessus : un token non résolu reste du texte.
    out.push(hit ? { ...hit, text: m[1] } : m[1]);
    last = m.index + m[0].length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}
