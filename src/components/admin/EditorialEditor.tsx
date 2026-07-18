'use client';

/**
 * Éditeur ÉDITORIAL d'un perso : pros/cons + synergies (couche curée).
 * Volontairement séparé de l'extraction (/admin/characters) — ici on écrit du
 * contenu humain, pas on ne contrôle la donnée du jeu. Les textes portent des
 * tags inline `{B/…}` (contrôlés par /admin/tags).
 */
import { useEffect, useState } from 'react';
import type { CharacterCurated } from '@contracts';
import { type Keyed, stripKey, withKey } from '@/lib/admin/keyed';
import { InlineTextField } from '@/components/admin/InlineTextField';
import { InlinePreview } from '@/components/admin/InlinePreview';
import { CharacterPortrait } from '@/components/character/CharacterPortrait';
import type { InlineRefs } from '@/lib/admin/inline-refs';
import type { InlineSegment } from '@/lib/parse-text';
import { renderInlineBatch } from '@/lib/admin/inline-preview-actions';
import { autoTranslate } from '@/lib/admin/translate-actions';

type LocalizedText = Partial<Record<'en' | 'jp' | 'kr' | 'zh' | 'fr', string>>;
interface SynergyGroup {
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

const LANGS = ['en', 'jp', 'kr', 'zh', 'fr'] as const;
type L = (typeof LANGS)[number];

const btn =
  'rounded-md border border-line bg-surface-base px-3 py-1.5 text-sm hover:border-accent disabled:opacity-50';
const input =
  'w-full rounded-md border border-line bg-surface-base px-2 py-1 text-sm focus:border-accent focus:outline-none';

export function EditorialEditor({
  id,
  curated,
  charNames,
  refs,
  heroViews,
  show = 'all',
}: {
  id: string;
  /** Entrée curée COMPLÈTE (on ne réécrit que prosCons/synergies dessus). */
  curated: CharacterCurated;
  /** id → nom EN (affichage des partenaires + saisie par nom). */
  charNames: Record<string, string>;
  /** Refs d'autocomplétion des tags inline. */
  refs: InlineRefs;
  /** id → portrait (synergies) ; fourni par la page synergies uniquement. */
  heroViews?: Record<string, HeroView>;
  /**
   * Sections affichées. Les Tools transverses n'en montrent qu'une ; l'autre
   * slice reste préservée (état initialisé depuis `curated`, réécrit à
   * l'identique au save).
   */
  show?: 'all' | 'prosCons' | 'synergies';
}) {
  const [lang, setLang] = useState<L>('en');
  const [pros, setPros] = useState<Keyed<LocalizedText>[]>(() =>
    (curated.prosCons?.pros ?? []).map(withKey),
  );
  const [cons, setCons] = useState<Keyed<LocalizedText>[]>(() =>
    (curated.prosCons?.cons ?? []).map(withKey),
  );
  const [synergies, setSynergies] = useState<Keyed<SynergyGroup>[]>(() =>
    (curated.synergies ?? []).map(withKey),
  );
  const [state, setState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);
  const [trans, setTrans] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');
  const [transMsg, setTransMsg] = useState<string | null>(null);
  // Pros/cons : onglet actif, ligne en édition. Synergies : raison en édition
  // (clé de groupe) + brouillon d'ajout de héros par groupe.
  const [tab, setTab] = useState<'pros' | 'cons'>('pros');
  const [editing, setEditing] = useState<number | null>(null);
  const [editReason, setEditReason] = useState<string | null>(null);
  const [addHero, setAddHero] = useState<Record<string, string>>({});
  // Segments rendus (aperçu en place) des lignes pros/cons et des raisons.
  const [segs, setSegs] = useState<{
    pros: InlineSegment[][];
    cons: InlineSegment[][];
    reasons: InlineSegment[][];
  }>({ pros: [], cons: [], reasons: [] });

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

  /**
   * Auto-traduit l'EN vers les langues VIDES (pros, cons, raisons de synergie) en
   * un seul appel. Ne réécrase jamais une trad existante ; les champs remplis
   * sont à REVOIR avant enregistrement.
   */
  async function translateEmpty() {
    setTrans('loading');
    setTransMsg(null);
    const tgt = LANGS.filter((l) => l !== 'en');
    const jobs: { en: string; kind: 'pros' | 'cons' | 'reason'; i: number }[] = [];
    pros.forEach((p, i) => p.en?.trim() && jobs.push({ en: p.en, kind: 'pros', i }));
    cons.forEach((p, i) => p.en?.trim() && jobs.push({ en: p.en, kind: 'cons', i }));
    synergies.forEach((g, i) => g.reason?.en?.trim() && jobs.push({ en: g.reason.en, kind: 'reason', i })); // prettier-ignore
    if (!jobs.length) {
      setTrans('done');
      setTransMsg('Rien à traduire (aucun texte EN).');
      return;
    }
    try {
      const { results, provider } = await autoTranslate(
        jobs.map((j) => j.en),
        tgt,
      );
      const nextPros = pros.slice();
      const nextCons = cons.slice();
      const nextSyn = synergies.slice();
      let filled = 0;
      // Remplit uniquement les langues VIDES (préserve les trads manuelles).
      const fillInto = (rec: LocalizedText, tr: Partial<LocalizedText>) => {
        for (const l of tgt) {
          if (tr[l] && !rec[l]?.trim()) {
            rec[l] = tr[l];
            filled++;
          }
        }
      };
      jobs.forEach((job, k) => {
        const tr = results[k] ?? {};
        if (job.kind === 'reason') {
          const g = nextSyn[job.i];
          const reason: LocalizedText = { ...(g.reason ?? {}) };
          fillInto(reason, tr);
          nextSyn[job.i] = { ...g, reason };
        } else {
          const arr = job.kind === 'pros' ? nextPros : nextCons;
          const rec: LocalizedText = { ...arr[job.i] };
          fillInto(rec, tr);
          arr[job.i] = { ...arr[job.i], ...rec };
        }
      });
      setPros(nextPros);
      setCons(nextCons);
      setSynergies(nextSyn);
      setTrans('done');
      setTransMsg(
        filled
          ? `${filled} champ(s) traduit(s) via ${provider === 'haiku' ? 'Haiku (quota DeepL atteint)' : 'DeepL'} — à revoir avant d’enregistrer.`
          : 'Toutes les langues cibles étaient déjà remplies.',
      );
    } catch (e) {
      setTrans('error');
      setTransMsg((e as Error).message);
    }
  }

  const nameToId = new Map(Object.entries(charNames).map(([cid, n]) => [n.toLowerCase(), cid]));
  const resolveHero = (raw: string): string => {
    const v = raw.trim();
    if (!v || v.startsWith('{') || charNames[v]) return v;
    return nameToId.get(v.toLowerCase()) ?? v;
  };

  async function save() {
    setState('saving');
    setError(null);
    // `stripKey` d'abord : `_key` fuirait au payload ET fausserait le filtre
    // (`Object.values` verrait la clé comme un contenu non vide).
    const cleanTexts = (list: Keyed<LocalizedText>[]): LocalizedText[] =>
      list.map(stripKey).filter((t) => Object.values(t).some((v) => v?.trim()));
    const body: CharacterCurated = {
      ...curated,
      prosCons: { pros: cleanTexts(pros), cons: cleanTexts(cons) },
      synergies: synergies
        .map((g) => ({ ...stripKey(g), heroes: g.heroes.map(resolveHero).filter(Boolean) }))
        .filter((g) => g.heroes.length),
    };
    if (!body.prosCons?.pros?.length && !body.prosCons?.cons?.length) delete body.prosCons;
    if (!body.synergies?.length) delete body.synergies;
    try {
      const res = await fetch(`/api/admin/curated/characters/${id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const json = (await res.json()) as { ok: boolean; errors?: string[] };
      if (!json.ok) throw new Error(json.errors?.join(' · ') ?? res.statusText);
      setState('saved');
    } catch (e) {
      setState('error');
      setError((e as Error).message);
    }
  }

  return (
    <div className="space-y-6">
      {/* Langue éditée (les autres langues sont préservées) */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-content-subtle text-xs uppercase">Langue</span>
        <div className="border-line flex overflow-hidden rounded-md border">
          {LANGS.map((l) => (
            <button
              key={l}
              type="button"
              className={`px-2.5 py-1 text-sm ${l === lang ? 'bg-accent/20 text-accent' : 'text-content-muted hover:bg-surface-overlay'}`}
              onClick={() => setLang(l)}
            >
              {l}
            </button>
          ))}
        </div>
        <button
          type="button"
          className={btn}
          onClick={translateEmpty}
          disabled={trans === 'loading'}
          title="Traduit l'EN vers les langues encore vides (Claude Haiku)"
        >
          {trans === 'loading' ? 'Traduction…' : 'Traduire (EN → vides)'}
        </button>
        {transMsg && (
          <span className={`text-xs ${trans === 'error' ? 'text-danger' : 'text-content-subtle'}`}>
            {transMsg}
          </span>
        )}
      </div>

      {show !== 'synergies' &&
        (() => {
          const side =
            tab === 'pros'
              ? { items: pros, set: setPros, segs: segs.pros, tone: 'text-emerald-400', sign: '+' }
              : { items: cons, set: setCons, segs: segs.cons, tone: 'text-red-400', sign: '−' };
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
                              {item[lang] || item.en || '(vide — cliquer pour écrire)'}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                    <button
                      type="button"
                      className="text-danger text-sm"
                      title="Supprimer"
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
                + entrée
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
              onClick={() => setSynergies([...synergies, withKey({ heroes: [] })])}
            >
              + groupe
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
              setSynergies(next);
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
                          title="Retirer"
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
                    placeholder="+ partenaire…"
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
                    onClick={() => setSynergies(synergies.filter((_, j) => j !== gi))}
                  >
                    Supprimer le groupe
                  </button>
                </div>

                {/* Raison — rendue, éditable au clic */}
                <div>
                  <p className="text-content-subtle mb-1 text-xs uppercase">Raison ({lang})</p>
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
                          {g.reason?.[lang] || g.reason?.en || '(vide — cliquer pour écrire)'}
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

      <div className="flex items-center gap-3">
        <button type="button" className={btn} onClick={save} disabled={state === 'saving'}>
          {state === 'saving' ? 'Enregistrement…' : 'Enregistrer'}
        </button>
        {state === 'saved' && <span className="text-success text-sm">✓ enregistré</span>}
        {state === 'error' && <span className="text-danger text-sm">{error}</span>}
      </div>
    </div>
  );
}
