/**
 * Cœur PUR de l'auto-traduction du journal du site (`ChangelogEditor`).
 *
 * Le titre d'une entrée est un texte localisé ordinaire, que le traducteur sait
 * traiter tel quel. Le CONTENU, lui, est une LISTE de puces par langue — d'où ces
 * deux fonctions, qui font l'aller (puces → enregistrements traduisibles) et le
 * retour (enregistrements traduits → puces).
 *
 * ⚠ UNE PUCE = UN ENREGISTREMENT. Ne pas « optimiser » en joignant les puces par
 * `\n` pour n'envoyer qu'un texte par entrée : rien ne garantit le nombre de
 * lignes EN RETOUR. `PROTECT` (`translate-actions`) ne couvre pas le saut de
 * ligne — Haiku ne le préserve que sur consigne de prompt, et l'appel DeepL ne
 * passe ni `preserve_formatting` ni `splitting_tags`. Un redécoupage désaligné
 * mélangerait les puces EN SILENCE. Et le découpage ne coûte AUCUN appel de plus :
 * `useAutoTranslate` groupe tous les enregistrements périmés en une requête.
 *
 * L'ANGLAIS EST LA STRUCTURE, comme dans l'éditeur de guides : le nombre de puces
 * d'une entrée traduite suit celui de l'anglais.
 */
import { LANGS, type Lang } from '@/lib/i18n/config';

export type Localized = Partial<Record<Lang, string>>;
export type LocalizedLines = Partial<Record<Lang, string[]>>;

/** Une puce EN = un enregistrement, portant les traductions déjà présentes au même index. */
export function contentBullets(content: LocalizedLines): Localized[] {
  return (content.en ?? []).map((line, k) => {
    const rec: Localized = { en: line };
    for (const l of LANGS) {
      if (l === 'en') continue;
      const v = content[l]?.[k];
      if (v) rec[l] = v;
    }
    return rec;
  });
}

/**
 * Reprojette les puces traduites dans le contenu. Renvoie `null` quand RIEN n'a
 * bougé pour cette entrée — et c'est le point important.
 *
 * Reprojeter une entrée INTACTE la réalignerait sur la structure anglaise, donc
 * supprimerait ses puces orphelines (une langue plus longue que l'EN). Ce serait
 * une perte de texte silencieuse sur une entrée que l'utilisateur n'a même pas
 * fait traduire — le bouton ne doit toucher que ce qu'il a réellement traduit.
 */
export function rebuiltContent(
  content: LocalizedLines,
  bullets: Localized[],
  before: Localized[],
): LocalizedLines | null {
  const touched = bullets.some((b, k) => LANGS.some((l) => l !== 'en' && b[l] !== before[k]?.[l]));
  if (!touched) return null;

  const next: LocalizedLines = { ...content };
  for (const l of LANGS) {
    if (l === 'en') continue;
    const lines = bullets.map((b) => b[l]?.trim() ?? '');
    if (lines.some(Boolean)) next[l] = lines;
  }
  return next;
}
