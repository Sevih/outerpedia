'use client';

/**
 * Éditeur ÉDITORIAL d'un perso : pros/cons + synergies (couche curée).
 * Volontairement séparé de l'extraction (/admin/characters) — ici on écrit du
 * contenu humain, pas on ne contrôle la donnée du jeu. Les textes portent des
 * tags inline `{B/…}` (contrôlés par /admin/tags).
 */
import { useState } from 'react';
import type { CharacterCurated } from '@contracts';
import { type Keyed, stripKey, withKey } from '@/lib/admin/keyed';
import { InlineTextField } from '@/components/admin/InlineTextField';
import type { InlineRefs } from '@/lib/admin/inline-refs';
import { autoTranslate } from '@/lib/admin/translate-actions';

type LocalizedText = Partial<Record<'en' | 'jp' | 'kr' | 'zh' | 'fr', string>>;
interface SynergyGroup {
  heroes: string[];
  reason?: LocalizedText;
}

const LANGS = ['en', 'jp', 'kr', 'zh', 'fr'] as const;
type L = (typeof LANGS)[number];

const btn =
  'rounded-md border border-line bg-surface-base px-3 py-1.5 text-sm hover:border-accent disabled:opacity-50';
const input =
  'w-full rounded-md border border-line bg-surface-base px-2 py-1 text-sm focus:border-accent focus:outline-none';

/** Édition d'une liste de textes localisés (pros OU cons). */
function TextListEditor({
  title,
  items,
  lang,
  refs,
  onChange,
}: {
  title: string;
  items: Keyed<LocalizedText>[];
  lang: L;
  refs: InlineRefs;
  onChange: (next: Keyed<LocalizedText>[]) => void;
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-content-strong text-sm font-semibold">{title}</p>
        <button
          type="button"
          className={btn}
          onClick={() => onChange([...items, withKey({ en: '' })])}
        >
          + entrée
        </button>
      </div>
      {items.map((item, i) => (
        <div
          key={item._key}
          className="border-line-subtle flex items-start gap-2 rounded-lg border p-2"
        >
          <div className="flex-1">
            <InlineTextField
              value={item[lang] ?? ''}
              refs={refs}
              lang={lang}
              layout="stacked"
              placeholder={lang === 'en' ? '' : (item.en ?? '')}
              onChange={(v) => {
                const next = items.slice();
                next[i] = { ...item, [lang]: v };
                if (!v) delete next[i][lang];
                onChange(next);
              }}
            />
          </div>
          <button
            type="button"
            className={`${btn} text-danger`}
            onClick={() => onChange(items.filter((_, j) => j !== i))}
            aria-label="Supprimer"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );
}

export function EditorialEditor({
  id,
  curated,
  charNames,
  refs,
  show = 'all',
}: {
  id: string;
  /** Entrée curée COMPLÈTE (on ne réécrit que prosCons/synergies dessus). */
  curated: CharacterCurated;
  /** id → nom EN (affichage des partenaires + saisie par nom). */
  charNames: Record<string, string>;
  /** Refs d'autocomplétion des tags inline. */
  refs: InlineRefs;
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

      {show !== 'synergies' && (
        <div className="grid gap-6 lg:grid-cols-2">
          <TextListEditor title="Pros" items={pros} lang={lang} refs={refs} onChange={setPros} />
          <TextListEditor title="Cons" items={cons} lang={lang} refs={refs} onChange={setCons} />
        </div>
      )}

      {/* Synergies */}
      {show !== 'prosCons' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-content-strong text-sm font-semibold">Synergies</p>
            <button
              type="button"
              className={btn}
              onClick={() => setSynergies([...synergies, withKey({ heroes: [''] })])}
            >
              + groupe
            </button>
          </div>
          {synergies.map((g, gi) => (
            <div key={g._key} className="border-line-subtle space-y-2 rounded-lg border p-3">
              <div className="flex items-start gap-2">
                <div className="flex-1 space-y-1">
                  <p className="text-content-subtle text-xs uppercase">
                    Partenaires (id, nom EN exact, ou tag {'{…}'})
                  </p>
                  {g.heroes.map((h, hi) => (
                    <div key={hi} className="flex items-center gap-2">
                      <input
                        className={input}
                        value={h}
                        onChange={(e) => {
                          const next = synergies.slice();
                          next[gi] = { ...g, heroes: g.heroes.with(hi, e.target.value) };
                          setSynergies(next);
                        }}
                      />
                      <span className="text-content-subtle w-40 truncate text-xs">
                        {charNames[resolveHero(h)] ?? (h.startsWith('{') ? 'tag' : '—')}
                      </span>
                      <button
                        type="button"
                        className={`${btn} text-danger`}
                        onClick={() => {
                          const next = synergies.slice();
                          next[gi] = { ...g, heroes: g.heroes.filter((_, j) => j !== hi) };
                          setSynergies(next);
                        }}
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    className={btn}
                    onClick={() => {
                      const next = synergies.slice();
                      next[gi] = { ...g, heroes: [...g.heroes, ''] };
                      setSynergies(next);
                    }}
                  >
                    + partenaire
                  </button>
                </div>
                <button
                  type="button"
                  className={`${btn} text-danger`}
                  onClick={() => setSynergies(synergies.filter((_, j) => j !== gi))}
                >
                  Supprimer le groupe
                </button>
              </div>
              <div>
                <p className="text-content-subtle text-xs uppercase">Raison ({lang})</p>
                <InlineTextField
                  value={g.reason?.[lang] ?? ''}
                  refs={refs}
                  lang={lang}
                  placeholder={lang === 'en' ? '' : (g.reason?.en ?? '')}
                  onChange={(v) => {
                    const next = synergies.slice();
                    const reason: LocalizedText = { ...(g.reason ?? {}), [lang]: v };
                    if (!v) delete reason[lang];
                    next[gi] = { ...g, reason: Object.keys(reason).length ? reason : undefined };
                    setSynergies(next);
                  }}
                />
              </div>
            </div>
          ))}
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
