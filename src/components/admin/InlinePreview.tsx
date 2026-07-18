'use client';

/**
 * Aperçu CLIENT d'un texte éditorial inline : rend les tags `{X/…}` en libellés
 * colorés (résolus depuis les refs déjà chargées) + les balises `<color=#hex>`
 * et sauts de ligne. Instantané, sans aller-retour serveur — la VALIDATION
 * précise (raison par tag) reste servie par `/api/admin/preview-text`.
 *
 * Ce n'est pas le rendu final à l'octet (pas d'icônes ni de tooltips riches),
 * mais la MISE EN FORME fidèle : chaque référence résolue prend sa couleur, une
 * référence inconnue passe en ROUGE — exactement comme le site.
 */
import { Fragment, type ReactNode } from 'react';
import type { InlineRefs } from '@/lib/admin/inline-refs';
import { renderGameColors } from '@/components/ui/GameText';

/** Même motif que `parse-text` (rendu). */
const TAG_REGEX = /\{((?:[BDSCEPL])|EE|AS|SKB|SK|I-(?:W|A|T|I))\/([^}]+)\}/g;

/** Couleur + source de refs par type de tag (miroir de `parse-text`). */
const TYPE_META: Record<string, { refsKey?: keyof InlineRefs; color: string; link?: boolean }> = {
  B: { refsKey: 'effectBuff', color: 'text-buff' },
  D: { refsKey: 'effectDebuff', color: 'text-debuff' },
  P: { refsKey: 'character', color: 'text-buff', link: true },
  SK: { refsKey: 'character', color: 'text-highlight', link: true },
  EE: { refsKey: 'characterEE', color: 'text-item-legendary', link: true },
  S: { refsKey: 'stat', color: 'text-content-strong' },
  E: { refsKey: 'element', color: 'text-content-strong' },
  C: { refsKey: 'klass', color: 'text-class' },
  'I-I': { refsKey: 'item', color: 'text-equipment' },
  'I-W': { refsKey: 'weapon', color: 'text-equipment' },
  'I-A': { refsKey: 'amulet', color: 'text-equipment' },
  'I-T': { refsKey: 'talisman', color: 'text-equipment' },
  AS: { refsKey: 'set', color: 'text-equipment', link: true },
  L: { color: 'text-highlight', link: true },
  SKB: { color: 'text-equipment' },
};

/** Rend un segment de texte brut (couleurs du jeu + `\n` littéraux). */
function plain(text: string, key: number): ReactNode {
  return <Fragment key={`p${key}`}>{renderGameColors(text.replace(/\\n/g, '\n'))}</Fragment>;
}

/** Résout le libellé affiché d'un tag et s'il est connu (sinon rouge). */
function resolveTag(
  type: string,
  value: string,
  refs: InlineRefs,
): { label: string; className: string } {
  const meta = TYPE_META[type];
  if (!meta) return { label: `{${type}/${value}}`, className: 'text-danger' };
  const find = (key: keyof InlineRefs, v: string) =>
    refs[key].find((o) => o.value.toLowerCase() === v.trim().toLowerCase());
  const underline = meta.link ? ' underline decoration-dotted' : '';

  // Types composés : on n'affiche que la partie utile.
  if (type === 'L') return { label: value.split('|')[0], className: meta.color + underline };
  if (type === 'SK') {
    const [name, slot] = value.split('|');
    const known = Boolean(find('character', name));
    return {
      label: `${name.trim()}${slot ? ` ${slot.trim()}` : ''}`,
      className: (known ? meta.color : 'text-danger') + underline,
    };
  }
  if (type === 'C') {
    const name = value.split('|')[0];
    return { label: find('klass', name)?.label ?? name.trim(), className: meta.color };
  }
  if (!meta.refsKey) return { label: value, className: meta.color + underline };

  const found = find(meta.refsKey, value);
  return found
    ? { label: found.label, className: meta.color + underline }
    : { label: value, className: 'text-danger' + underline };
}

export function InlinePreview({ text, refs }: { text: string; refs: InlineRefs }) {
  if (!text.trim()) return <span className="text-content-subtle text-xs">Aperçu…</span>;
  const parts: ReactNode[] = [];
  let last = 0;
  let key = 0;
  // `matchAll` (pas de mutation de lastIndex sur la regex module-level).
  for (const m of text.matchAll(TAG_REGEX)) {
    const at = m.index ?? 0;
    if (at > last) parts.push(plain(text.slice(last, at), key++));
    const { label, className } = resolveTag(m[1], m[2], refs);
    parts.push(
      <span key={`g${key++}`} className={className}>
        {label}
      </span>,
    );
    last = at + m[0].length;
  }
  if (last < text.length) parts.push(plain(text.slice(last), key++));
  return <span className="whitespace-pre-line">{parts}</span>;
}
