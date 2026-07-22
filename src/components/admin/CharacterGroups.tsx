'use client';

/**
 * Groupes de personnages avec RAISON — brique commune aux synergies d'une fiche
 * perso et aux persos recommandés d'un guide : c'est la même chose (des
 * portraits + un texte qui justifie le groupe).
 *
 * Édition « UNE raison à la fois » : au repos les raisons sont RENDUES (aperçu
 * fidèle, un seul batch pour toute la liste) et seule celle qu'on clique devient
 * un éditeur. C'est ce qui garde la frappe fluide : un seul `InlineTextField`
 * monté = un seul aller-retour d'aperçu par frappe, au lieu d'un par groupe.
 */
import { useEffect, useState } from 'react';
import type { LocalizedText } from '@contracts';
import type { Lang } from '@/lib/i18n/config';
import type { InlineRefs } from '@/lib/admin/inline-refs';
import type { InlineSegment } from '@/lib/parse-text';
import { renderInlineBatch } from '@/lib/admin/inline-preview-actions';
import { InlinePreview } from '@/components/admin/InlinePreview';
import { InlineTextField } from '@/components/admin/InlineTextField';
import { CharacterChips, type ChipView } from '@/components/admin/CharacterChips';

export interface GroupWithReason {
  heroes: string[];
  reason?: LocalizedText;
}

const btn =
  'rounded-md border border-line bg-surface-base px-3 py-1.5 text-sm hover:border-accent disabled:opacity-50';

export function CharacterGroups<G extends GroupWithReason>({
  groups,
  onChange,
  newGroup,
  lang,
  refs,
  datalistId,
  viewOf,
  resolve,
  keyOf,
  addLabel = '+ group',
  chipSize = 56,
}: {
  groups: G[];
  onChange: (next: G[]) => void;
  /** Fabrique d'un groupe vierge (l'appelant garde ses champs propres, ex. `_key`). */
  newGroup: () => G;
  lang: Lang;
  refs: InlineRefs;
  datalistId: string;
  viewOf: (token: string) => ChipView | undefined;
  resolve?: (raw: string) => string;
  /** Clé React stable ; à défaut l'index (suffisant : l'édition se réinitialise). */
  keyOf?: (group: G, index: number) => string;
  addLabel?: string;
  chipSize?: number;
}) {
  /** Clé du groupe dont la raison est en cours d'édition (une seule à la fois). */
  const [editing, setEditing] = useState<string | null>(null);
  const [segs, setSegs] = useState<InlineSegment[][]>([]);
  const key = (g: G, i: number) => (keyOf ? keyOf(g, i) : String(i));

  // Aperçu des raisons AU REPOS. Déclenché sur les TEXTES (sérialisés), pas sur
  // l'identité de `groups` : l'appelant peut reconstruire le tableau à chaque
  // rendu (adaptation d'un draft de guide) sans relancer la résolution.
  const textsKey = JSON.stringify(groups.map((g) => g.reason?.[lang] ?? ''));
  useEffect(() => {
    let cancelled = false;
    const h = setTimeout(async () => {
      try {
        const out = await renderInlineBatch(JSON.parse(textsKey) as string[], lang);
        if (!cancelled) setSegs(out);
      } catch {
        /* aperçu indisponible — silencieux */
      }
    }, 250);
    return () => {
      cancelled = true;
      clearTimeout(h);
    };
  }, [textsKey, lang]);

  const setGroup = (gi: number, patch: Partial<GroupWithReason>) => {
    const next = groups.slice();
    // Le patch ne touche que les champs du contrat commun — le reste de `G`
    // (clé React, champs propres à l'appelant) est préservé par le spread.
    next[gi] = { ...groups[gi], ...patch } as G;
    onChange(next);
  };

  return (
    <div className="space-y-3">
      {groups.map((g, gi) => {
        const k = key(g, gi);
        return (
          <div key={k} className="card space-y-3 rounded-xl p-4">
            <div className="flex flex-wrap items-start gap-3">
              <CharacterChips
                values={g.heroes}
                datalistId={datalistId}
                viewOf={viewOf}
                resolve={resolve}
                size={chipSize}
                onChange={(heroes) => setGroup(gi, { heroes })}
              />
              <button
                type="button"
                className={`${btn} text-danger ml-auto`}
                onClick={() => {
                  onChange(groups.filter((_, j) => j !== gi));
                  setEditing(null);
                }}
              >
                Delete the group
              </button>
            </div>

            {/* Raison — rendue, éditable au clic */}
            <div>
              <p className="text-content-subtle mb-1 text-xs uppercase">Reason ({lang})</p>
              {editing === k ? (
                <InlineTextField
                  value={g.reason?.[lang] ?? ''}
                  refs={refs}
                  lang={lang}
                  layout="stacked"
                  placeholder={lang === 'en' ? '' : (g.reason?.en ?? '')}
                  onChange={(v) => {
                    const reason: LocalizedText = { ...(g.reason ?? {}), [lang]: v };
                    if (!v) delete reason[lang];
                    setGroup(gi, { reason: Object.keys(reason).length ? reason : undefined });
                  }}
                />
              ) : (
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => setEditing(k)}
                  onKeyDown={(e) => e.key === 'Enter' && setEditing(k)}
                  className="text-content w-full cursor-pointer text-left text-[13px] leading-snug"
                >
                  {segs[gi]?.length ? (
                    <InlinePreview segments={segs[gi]} />
                  ) : (
                    <span className="text-content-subtle italic">
                      {g.reason?.[lang] || g.reason?.en || '(empty — click to write)'}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        );
      })}
      <button type="button" className={btn} onClick={() => onChange([...groups, newGroup()])}>
        {addLabel}
      </button>
    </div>
  );
}
