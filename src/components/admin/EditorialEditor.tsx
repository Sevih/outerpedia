'use client';

/**
 * Éditeur ÉDITORIAL d'un perso : pros/cons + synergies (couche curée), côté ADMIN.
 * Volontairement séparé de l'extraction (/admin/characters) — ici on écrit du
 * contenu humain, on ne contrôle pas la donnée du jeu. Les textes portent des
 * tags inline `{B/…}` (contrôlés par /admin/tags).
 *
 * Ce wrapper gère les ALENTOURS (barre de langue, auto-traduction EN→vides,
 * enregistrement fichier) ; la SAISIE elle-même vit dans `EditorialFields`,
 * partagée avec l'outil public de contribution.
 */
import { useState } from 'react';
import type { CharacterCurated } from '@contracts';
import { type Keyed, stripKey, withKey } from '@/lib/admin/keyed';
import { autoTranslate } from '@/lib/admin/translate-actions';
import { applyTranslation, createFreshness } from '@/lib/admin/translate-fill';
import type { InlineRefs } from '@/lib/admin/inline-refs';
import {
  EditorialFields,
  makeResolveHero,
  type HeroView,
  type LocalizedText,
  type SynergyGroup,
} from '@/components/admin/editorial/EditorialFields';

export type { HeroView } from '@/components/admin/editorial/EditorialFields';

const LANGS = ['en', 'jp', 'kr', 'zh', 'fr'] as const;
type L = (typeof LANGS)[number];

const btn =
  'rounded-md border border-line bg-surface-base px-3 py-1.5 text-sm hover:border-accent disabled:opacity-50';

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
  // Photo des EN au chargement : référence de ce qui est « déjà traduit ».
  const [freshness] = useState(() =>
    createFreshness([
      ...(curated.prosCons?.pros ?? []).map((t) => t.en),
      ...(curated.prosCons?.cons ?? []).map((t) => t.en),
      ...(curated.synergies ?? []).map((g) => g.reason?.en),
    ]),
  );

  /**
   * Auto-traduit l'EN vers TOUTES les autres langues (pros, cons, raisons de
   * synergie) en un seul appel — les trads existantes sont ÉCRASÉES, l'EN fait
   * foi (cf. `applyTranslation`). À REVOIR avant enregistrement.
   */
  async function translateAll() {
    setTrans('loading');
    setTransMsg(null);
    const tgt = LANGS.filter((l) => l !== 'en');
    // On n'envoie que ce qui a BOUGÉ (EN édité/ajouté) ou à qui il manque une
    // langue — inutile de repayer DeepL pour l'identique.
    const jobs: { en: string; kind: 'pros' | 'cons' | 'reason'; i: number }[] = [];
    const stale = (t?: LocalizedText) => Boolean(t && freshness.isStale(t, tgt));
    pros.forEach((p, i) => stale(p) && jobs.push({ en: p.en!, kind: 'pros', i }));
    cons.forEach((p, i) => stale(p) && jobs.push({ en: p.en!, kind: 'cons', i }));
    synergies.forEach((g, i) => stale(g.reason) && jobs.push({ en: g.reason!.en!, kind: 'reason', i })); // prettier-ignore
    if (!jobs.length) {
      setTrans('done');
      setTransMsg('Nothing to translate — every English text is already up to date.');
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
      const fillInto = (rec: LocalizedText, tr: Partial<LocalizedText>) => {
        filled += applyTranslation(rec, tr, tgt);
        freshness.markFresh(rec);
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
          ? `${filled} field(s) translated via ${provider === 'haiku' ? 'Haiku (DeepL quota reached)' : 'DeepL'} — review before saving.`
          : 'Every translation already matched the English text.',
      );
    } catch (e) {
      setTrans('error');
      setTransMsg((e as Error).message);
    }
  }

  async function save() {
    setState('saving');
    setError(null);
    const resolveHero = makeResolveHero(charNames);
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
        <span className="text-content-subtle text-xs uppercase">Language</span>
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
          onClick={translateAll}
          disabled={trans === 'loading'}
          title="Regenerates every other language from the English text — existing translations are overwritten (DeepL → Haiku)"
        >
          {trans === 'loading' ? 'Translating…' : 'Translate (EN → all)'}
        </button>
        {transMsg && (
          <span className={`text-xs ${trans === 'error' ? 'text-danger' : 'text-content-subtle'}`}>
            {transMsg}
          </span>
        )}
      </div>

      <EditorialFields
        lang={lang}
        refs={refs}
        charNames={charNames}
        heroViews={heroViews}
        show={show}
        pros={pros}
        cons={cons}
        synergies={synergies}
        onPros={setPros}
        onCons={setCons}
        onSynergies={setSynergies}
      />

      <div className="flex items-center gap-3">
        <button type="button" className={btn} onClick={save} disabled={state === 'saving'}>
          {state === 'saving' ? 'Saving…' : 'Save'}
        </button>
        {state === 'saved' && <span className="text-success text-sm">✓ saved</span>}
        {state === 'error' && <span className="text-danger text-sm">{error}</span>}
      </div>
    </div>
  );
}
