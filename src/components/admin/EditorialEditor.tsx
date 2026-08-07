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
import { createFreshness } from '@/lib/admin/translate-fill';
import { useAutoTranslate } from '@/lib/admin/useAutoTranslate';
import { TranslateButton } from '@/components/admin/TranslateButton';
import type { InlineRefs } from '@/lib/admin/inline-refs';
import {
  EditorialFields,
  makeResolveHero,
  type HeroView,
  type LocalizedText,
  type SynergyGroup,
} from '@/components/admin/editorial/EditorialFields';
import { LANGS } from '@/lib/i18n/config';
import { btn } from './_ui';

export type { HeroView } from '@/components/admin/editorial/EditorialFields';

type L = (typeof LANGS)[number];

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
  const translate = useAutoTranslate({
    langs: LANGS,
    freshness,
    // Les copies sont faites D'ABORD : le hook mute les enregistrements qu'on lui
    // rend, ils doivent donc déjà appartenir aux tableaux que `commit` publiera.
    // (Avant, une structure `jobs` {kind, index} reroutait chaque résultat vers sa
    // case — le filtrage du périmé et le report vivent maintenant dans le hook.)
    collect: () => {
      const nextPros = pros.map((p) => ({ ...p }));
      const nextCons = cons.map((c) => ({ ...c }));
      const nextSyn = synergies.map((g) => ({
        ...g,
        reason: g.reason ? { ...g.reason } : undefined,
      }));
      const records: LocalizedText[] = [
        ...nextPros,
        ...nextCons,
        // Seules les synergies QUI ONT une raison sont traduisibles.
        ...nextSyn.map((g) => g.reason).filter((r): r is LocalizedText => Boolean(r)),
      ];
      return { draft: { nextPros, nextCons, nextSyn }, records };
    },
    commit: ({ nextPros, nextCons, nextSyn }) => {
      setPros(nextPros);
      setCons(nextCons);
      setSynergies(nextSyn);
    },
  });

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
        <TranslateButton t={translate} className={btn} />
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
