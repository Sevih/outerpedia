'use client';

/**
 * Corps d'édition ÉDITORIAL PARTAGÉ (pros/cons + synergies) — brique CONTRÔLÉE
 * (état chez le parent). Sert l'éditeur admin (`EditorialEditor` : barre de
 * langue + traduction + save fichier) ET l'outil public de contribution
 * (`ProsConsSynergyPublicTool` : EN only + export). L'UI de saisie n'existe qu'ICI
 * (pas de doublon) ; seuls diffèrent les alentours (langue, écriture).
 *
 * Les textes portent des tags inline `{B/…}` (contrôlés par /admin/tags), rendus
 * fidèlement en place via `renderInlineBatch` (server action publique).
 */
import { useEffect, useState } from 'react';
import { type Keyed, withKey } from '@/lib/admin/keyed';
import { InlineTextField } from '@/components/admin/InlineTextField';
import { InlinePreview } from '@/components/admin/InlinePreview';
import { CharacterPortrait } from '@/components/character/CharacterPortrait';
import type { InlineRefs } from '@/lib/admin/inline-refs';
import type { InlineSegment } from '@/lib/parse-text';
import { renderInlineBatch } from '@/lib/admin/inline-preview-actions';

export type LocalizedText = Partial<Record<'en' | 'jp' | 'kr' | 'zh' | 'fr', string>>;
export interface SynergyGroup {
  heroes: string[];
  reason?: LocalizedText;
}

/** Portrait d'un héros (résolu serveur) pour l'affichage des synergies. */
export interface HeroView {
  id: string;
  name: string;
  element: string;
  classType: string;
  rarity: number;
  href?: string;
}

export type EditorialLang = 'en' | 'jp' | 'kr' | 'zh' | 'fr';

const btn =
  'rounded-md border border-line bg-surface-base px-3 py-1.5 text-sm hover:border-accent disabled:opacity-50';
const input =
  'w-full rounded-md border border-line bg-surface-base px-2 py-1 text-sm focus:border-accent focus:outline-none';

/**
 * Résout un héros saisi (nom EN ou tag) vers son ID. Un id déjà connu, une saisie
 * vide ou un tag `{…}` passent tels quels. Partagé save (admin) / export (public).
 */
export function makeResolveHero(charNames: Record<string, string>): (raw: string) => string {
  const nameToId = new Map(Object.entries(charNames).map(([cid, n]) => [n.toLowerCase(), cid]));
  return (raw: string): string => {
    const v = raw.trim();
    if (!v || v.startsWith('{') || charNames[v]) return v;
    return nameToId.get(v.toLowerCase()) ?? v;
  };
}

export function EditorialFields({
  lang,
  refs,
  charNames,
  heroViews,
  show,
  pros,
  cons,
  synergies,
  onPros,
  onCons,
  onSynergies,
}: {
  lang: EditorialLang;
  refs: InlineRefs;
  /** id → nom EN (affichage des partenaires + saisie par nom). */
  charNames: Record<string, string>;
  /** id → portrait (synergies) ; absent → carré de repli avec le nom/id. */
  heroViews?: Record<string, HeroView>;
  show: 'all' | 'prosCons' | 'synergies';
  pros: Keyed<LocalizedText>[];
  cons: Keyed<LocalizedText>[];
  synergies: Keyed<SynergyGroup>[];
  onPros: (next: Keyed<LocalizedText>[]) => void;
  onCons: (next: Keyed<LocalizedText>[]) => void;
  onSynergies: (next: Keyed<SynergyGroup>[]) => void;
}) {
  // État d'UI LOCAL (pas remonté au parent) : onglet pros/cons, ligne en édition,
  // raison en édition (clé de groupe), brouillon d'ajout de héros par groupe.
  const [tab, setTab] = useState<'pros' | 'cons'>('pros');
  const [editing, setEditing] = useState<number | null>(null);
  const [editReason, setEditReason] = useState<string | null>(null);
  const [addHero, setAddHero] = useState<Record<string, string>>({});
  const [segs, setSegs] = useState<{
    pros: InlineSegment[][];
    cons: InlineSegment[][];
    reasons: InlineSegment[][];
  }>({ pros: [], cons: [], reasons: [] });

  const resolveHero = makeResolveHero(charNames);

  // Rendu fidèle des lignes (aperçu en place) via la vraie donnée, debouncé.
  useEffect(() => {
    let cancelled = false;
    const none: InlineSegment[][] = [];
    const h = setTimeout(async () => {
      try {
        const [ps, cs, rs] = await Promise.all([
          show !== 'synergies' ? renderInlineBatch(pros.map((p) => p[lang] ?? ''), lang) : none, // prettier-ignore
          show !== 'synergies' ? renderInlineBatch(cons.map((c) => c[lang] ?? ''), lang) : none, // prettier-ignore
          show !== 'prosCons' ? renderInlineBatch(synergies.map((g) => g.reason?.[lang] ?? ''), lang) : none, // prettier-ignore
        ]);
        if (!cancelled) setSegs({ pros: ps, cons: cs, reasons: rs });
      } catch {
        /* aperçu indisponible — silencieux */
      }
    }, 250);
    return () => {
      cancelled = true;
      clearTimeout(h);
    };
  }, [pros, cons, synergies, lang, show]);

  return (
    <div className="space-y-6">
      {show !== 'synergies' &&
        (() => {
          const side =
            tab === 'pros'
              ? { items: pros, set: onPros, segs: segs.pros, tone: 'text-emerald-400', sign: '+' }
              : { items: cons, set: onCons, segs: segs.cons, tone: 'text-red-400', sign: '−' };
          return (
            <div className="space-y-3">
              {/* Onglets Pros / Cons */}
              <div className="border-line flex w-fit overflow-hidden rounded-md border">
                {(['pros', 'cons'] as const).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => {
                      setTab(s);
                      setEditing(null);
                    }}
                    className={`px-3 py-1 text-sm ${s === tab ? 'bg-accent/20 text-accent font-semibold' : 'text-content-muted hover:bg-surface-overlay'}`}
                  >
                    {s === 'pros' ? 'Pros' : 'Cons'} ({(s === 'pros' ? pros : cons).length})
                  </button>
                ))}
              </div>

              {/* Liste rendue (style fiche) + édition en place au clic */}
              <ul className="card flex flex-col gap-1.5 rounded-xl p-4">
                {side.items.map((item, i) => (
                  <li
                    key={item._key}
                    className="grid grid-cols-[16px_1fr_auto] items-start gap-1.5"
                  >
                    <span className={`font-mono text-sm font-bold ${side.tone}`}>{side.sign}</span>
                    <div className="min-w-0">
                      {editing === i ? (
                        <InlineTextField
                          value={item[lang] ?? ''}
                          refs={refs}
                          lang={lang}
                          layout="stacked"
                          placeholder={lang === 'en' ? '' : (item.en ?? '')}
                          onChange={(v) => {
                            const next = side.items.slice();
                            next[i] = { ...item, [lang]: v };
                            if (!v) delete next[i][lang];
                            side.set(next);
                          }}
                        />
                      ) : (
                        <div
                          role="button"
                          tabIndex={0}
                          onClick={() => setEditing(i)}
                          onKeyDown={(e) => e.key === 'Enter' && setEditing(i)}
                          className="text-content w-full cursor-pointer text-left text-[13px] leading-snug first-letter:uppercase"
                        >
                          {side.segs[i]?.length ? (
                            <InlinePreview segments={side.segs[i]} />
                          ) : (
                            <span className="text-content-subtle italic">
                              {item[lang] || item.en || '(empty — click to write)'}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                    <button
                      type="button"
                      className="text-danger text-sm"
                      title="Delete"
                      onClick={() => {
                        side.set(side.items.filter((_, j) => j !== i));
                        setEditing(null);
                      }}
                    >
                      ✕
                    </button>
                  </li>
                ))}
              </ul>
              <button
                type="button"
                className={btn}
                onClick={() => {
                  side.set([...side.items, withKey({ en: '' })]);
                  setEditing(side.items.length);
                }}
              >
                + entry
              </button>
            </div>
          );
        })()}

      {/* Synergies — héros en portraits, raison rendue et éditable au clic */}
      {show !== 'prosCons' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-content-strong text-sm font-semibold">Synergies</p>
            <button
              type="button"
              className={btn}
              onClick={() => onSynergies([...synergies, withKey({ heroes: [] })])}
            >
              + group
            </button>
          </div>
          <datalist id="hero-names">
            {Object.values(charNames).map((n) => (
              <option key={n} value={n} />
            ))}
          </datalist>
          {synergies.map((g, gi) => {
            const setGroup = (p: Partial<SynergyGroup>) => {
              const next = synergies.slice();
              next[gi] = { ...g, ...p };
              onSynergies(next);
            };
            return (
              <div key={g._key} className="card space-y-3 rounded-xl p-4">
                {/* Partenaires en portraits + ajout */}
                <div className="flex flex-wrap items-center gap-3">
                  {g.heroes.map((h, hi) => {
                    const view = heroViews?.[resolveHero(h)];
                    return (
                      <div key={hi} className="relative">
                        {view ? (
                          <CharacterPortrait
                            id={view.id}
                            name={view.name}
                            element={view.element}
                            classType={view.classType}
                            rarity={view.rarity}
                            size={56}
                          />
                        ) : (
                          <div className="border-line-subtle text-content-subtle flex h-14 w-14 items-center justify-center rounded-lg border p-1 text-center text-[10px]">
                            {h.startsWith('{') ? 'tag' : h || '?'}
                          </div>
                        )}
                        <button
                          type="button"
                          title="Remove"
                          className="border-line bg-surface-raised text-danger absolute -top-1.5 -right-1.5 rounded-full border px-1 text-xs"
                          onClick={() => setGroup({ heroes: g.heroes.filter((_, j) => j !== hi) })}
                        >
                          ✕
                        </button>
                      </div>
                    );
                  })}
                  <input
                    className={`${input} h-9 w-40`}
                    list="hero-names"
                    placeholder="+ partner…"
                    value={addHero[g._key] ?? ''}
                    onChange={(e) => setAddHero((m) => ({ ...m, [g._key]: e.target.value }))}
                    onKeyDown={(e) => {
                      if (e.key !== 'Enter') return;
                      e.preventDefault();
                      const raw = (addHero[g._key] ?? '').trim();
                      if (raw) setGroup({ heroes: [...g.heroes, resolveHero(raw)] });
                      setAddHero((m) => ({ ...m, [g._key]: '' }));
                    }}
                  />
                  <button
                    type="button"
                    className={`${btn} text-danger ml-auto`}
                    onClick={() => onSynergies(synergies.filter((_, j) => j !== gi))}
                  >
                    Delete the group
                  </button>
                </div>

                {/* Raison — rendue, éditable au clic */}
                <div>
                  <p className="text-content-subtle mb-1 text-xs uppercase">Reason ({lang})</p>
                  {editReason === g._key ? (
                    <InlineTextField
                      value={g.reason?.[lang] ?? ''}
                      refs={refs}
                      lang={lang}
                      layout="stacked"
                      placeholder={lang === 'en' ? '' : (g.reason?.en ?? '')}
                      onChange={(v) => {
                        const reason: LocalizedText = { ...(g.reason ?? {}), [lang]: v };
                        if (!v) delete reason[lang];
                        setGroup({ reason: Object.keys(reason).length ? reason : undefined });
                      }}
                    />
                  ) : (
                    <div
                      role="button"
                      tabIndex={0}
                      onClick={() => setEditReason(g._key)}
                      onKeyDown={(e) => e.key === 'Enter' && setEditReason(g._key)}
                      className="text-content w-full cursor-pointer text-left text-[13px] leading-snug"
                    >
                      {segs.reasons[gi]?.length ? (
                        <InlinePreview segments={segs.reasons[gi]} />
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
        </div>
      )}
    </div>
  );
}
