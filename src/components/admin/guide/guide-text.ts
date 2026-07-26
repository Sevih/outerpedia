/**
 * Conversions de texte de `GuideEditor` (audit F9) — cœurs PURS, sans JSX ni
 * état, sortis du composant pour être lisibles et testables seuls.
 *
 * Ils portent une règle qui n'a rien d'évident : **l'ANGLAIS est la STRUCTURE**
 * du contenu localisé. Éditer le bloc EN ajoute ou retire des entrées de la
 * liste ; éditer une autre langue ne fait que remplir des traductions, par
 * index. Sans ça, traduire un guide en FR pourrait en supprimer des conseils.
 */
import type { LText, VersionDraft } from '@/lib/admin/guide-draft';

type L = 'en' | 'jp' | 'kr' | 'zh' | 'fr';

/** Liste localisée → bloc éditable (une ligne par entrée). */
export const itemsToBlock = (items: LText[], lang: L): string =>
  items.map((t) => t[lang] ?? '').join('\n');

/**
 * Bloc édité → liste localisée. L'EN est la STRUCTURE : l'éditer ajoute/retire
 * des entrées ; une autre langue ne fait que remplir les traductions par index.
 */
export const blockToItems = (block: string, prev: LText[], lang: L): LText[] => {
  const lines = block.split('\n');
  if (lang === 'en') return lines.map((line, i) => ({ ...(prev[i] ?? { en: '' }), en: line }));
  return prev.map((t, i) => {
    const line = lines[i] ?? '';
    const next: LText = { ...t };
    if (line.trim()) next[lang] = line;
    else delete next[lang];
    return next;
  });
};

/**
 * Tous les textes localisés d'une version, dans l'ordre — les OBJETS EUX-MÊMES
 * (la traduction écrit dedans). Sert aussi à photographier l'état au montage
 * pour ne retraduire que ce qui a bougé.
 */
export function versionTexts(ver: VersionDraft): LText[] {
  const out: LText[] = [];
  ver.tipSections.forEach((s) => {
    if (s.title) out.push(s.title);
    out.push(...s.tips);
  });
  out.push(...ver.notes);
  ver.recommended.forEach((g) => g.reason && out.push(g.reason));
  ver.recoSections.forEach((s) => {
    if (s.title) out.push(s.title);
    s.groups.forEach((g) => g.reason && out.push(g.reason));
  });
  ver.teams.forEach((t) => {
    if (t.title) out.push(t.title);
    if (t.note) out.push(t.note);
    if (t.notes) out.push(...t.notes);
  });
  return out;
}
