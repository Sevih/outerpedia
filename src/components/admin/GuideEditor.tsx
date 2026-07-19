'use client';

/**
 * Éditeur UNIFIÉ d'un guide de boss VERSIONNÉ (pilote : joint-challenge).
 *
 * Modèle métier (Sevih) : 1 monstre désigné (obligatoire) + conseils + persos +
 * équipe + vidéos, le tout par version. Les parties éditables sont réparties en
 * ONGLETS (comme l'éditeur perso). Chaque texte est un `InlineTextField` (aperçu
 * fidèle intégré via le vrai `parseText`) ; les conseils s'éditent en BLOC (une
 * ligne = un conseil) avec un unique rendu en liste, comme sur le vrai guide.
 */
import { useState } from 'react';
import type { VideoRef } from '@contracts';
import { type Keyed, stripKey, withKey } from '@/lib/admin/keyed';
import type { InlineRefs } from '@/lib/admin/inline-refs';
import type {
  GuideDraft,
  LText,
  RecoGroupDraft,
  TipSectionDraft,
  VersionDraft,
} from '@/lib/admin/guide-draft';
import { autoTranslate } from '@/lib/admin/translate-actions';
import { EditorTabs } from '@/components/admin/EditorTabs';
import { InlineTextField } from '@/components/admin/InlineTextField';
import { CharacterPortrait } from '@/components/character/CharacterPortrait';
import type { CharOption } from '@/components/admin/CharacterPicker';
import { GroupPicker, type GroupOption } from '@/components/admin/GroupPicker';
import { VideoCurator } from '@/components/admin/VideoCurator';
import type { VideoItem } from '@/components/ui/MultiVideoEmbed';

const LANGS = ['en', 'jp', 'kr', 'zh', 'fr'] as const;
type L = (typeof LANGS)[number];
const MAX_SLOTS = 4;

const btn =
  'rounded-md border border-line bg-surface-base px-3 py-1.5 text-sm hover:border-accent disabled:opacity-50';
const input =
  'w-full rounded-md border border-line bg-surface-base px-2 py-1 text-sm focus:border-accent focus:outline-none';
const heading = 'text-content-strong text-sm font-semibold';
const hasText = (t?: LText): boolean =>
  t ? Object.values(t).some((x) => typeof x === 'string' && x.trim()) : false;

/** Conseils d'une langue → un bloc (une ligne par conseil). */
const itemsToBlock = (items: LText[], lang: L): string =>
  items.map((t) => t[lang] ?? '').join('\n');

/**
 * Bloc édité → liste de conseils localisés. L'EN est la STRUCTURE : l'éditer
 * ajoute/retire des conseils ; éditer une autre langue ne fait que remplir les
 * traductions par index, sans jamais changer le nombre de conseils.
 */
const blockToItems = (block: string, prev: LText[], lang: L): LText[] => {
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

/* --- Puces de personnages (persos recommandés + slots d'équipe) --- */

function CharacterChips({
  names,
  charByName,
  onChange,
}: {
  names: string[];
  charByName: Map<string, CharOption>;
  onChange: (names: string[]) => void;
}) {
  const [add, setAdd] = useState('');
  return (
    <div className="flex flex-wrap items-center gap-2">
      {names.map((n, i) => {
        const c = charByName.get(n);
        return (
          <div key={i} className="relative">
            {c ? (
              <CharacterPortrait
                id={c.id}
                name={c.name}
                element={c.element}
                classType={c.class}
                rarity={c.rarity}
                size={48}
              />
            ) : (
              <div className="border-line-subtle text-content-subtle flex h-12 w-12 items-center justify-center rounded-lg border p-1 text-center text-[10px]">
                {n || '?'}
              </div>
            )}
            <button
              type="button"
              title="Retirer"
              className="border-line bg-surface-raised text-danger absolute -top-1.5 -right-1.5 rounded-full border px-1 text-xs"
              onClick={() => onChange(names.filter((_, j) => j !== i))}
            >
              ✕
            </button>
          </div>
        );
      })}
      <input
        className={`${input} h-9 w-36`}
        list="guide-char-names"
        placeholder="+ perso…"
        value={add}
        onChange={(e) => setAdd(e.target.value)}
        onKeyDown={(e) => {
          if (e.key !== 'Enter') return;
          e.preventDefault();
          const raw = add.trim();
          if (raw) onChange([...names, raw]);
          setAdd('');
        }}
      />
    </div>
  );
}

/* --- Éditeur principal --- */

export function GuideEditor({
  category,
  slug,
  initial,
  refs,
  charOptions,
  groupOptions,
}: {
  category: string;
  slug: string;
  initial: GuideDraft;
  refs: InlineRefs;
  charOptions: CharOption[];
  groupOptions: GroupOption[];
}) {
  const [lang, setLang] = useState<L>('en');
  const [intro, setIntro] = useState<LText>(initial.intro);
  const [versions, setVersions] = useState<Keyed<VersionDraft>[]>(() =>
    initial.versions.map(withKey),
  );
  const [active, setActive] = useState(0);
  const [state, setState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);
  const [trans, setTrans] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');
  const [transMsg, setTransMsg] = useState<string | null>(null);
  // Ajout de version : brouillon de clé + version source à dupliquer.
  const [adding, setAdding] = useState(false);
  const [newKey, setNewKey] = useState('');
  const [fromKey, setFromKey] = useState('');
  const [addBusy, setAddBusy] = useState(false);

  const charByName = new Map(charOptions.map((c) => [c.name, c]));
  const groupLabel = (g?: string) => groupOptions.find((o) => o.group === g)?.label ?? g ?? '';

  const v: Keyed<VersionDraft> | undefined = versions[active];

  /** Remplace la version active par une version patchée. */
  const patch = (p: Partial<VersionDraft>) => {
    if (!v) return;
    const next = versions.slice();
    next[active] = { ...v, ...p };
    setVersions(next);
  };

  /** Édite une valeur localisée pour la langue courante (préserve les autres). */
  const editLText = (cur: LText | undefined, val: string): LText => {
    const next: LText = { ...(cur ?? { en: '' }) };
    if (val) next[lang] = val;
    else delete next[lang];
    if (next.en === undefined) next.en = '';
    return next;
  };
  /** Valeur affichée d'un LText pour la langue courante. */
  const show = (t: LText | undefined): string => t?.[lang] ?? '';
  /** LText nettoyé → undefined si entièrement vide. */
  const orUndef = (t: LText): LText | undefined => (hasText(t) ? t : undefined);

  /* --- Auto-traduction (version active + intro) --- */
  async function translateEmpty() {
    setTrans('loading');
    setTransMsg(null);
    const targets = LANGS.filter((l) => l !== 'en');
    type Job =
      | { en: string; t: 'intro' }
      | { en: string; t: 'tip'; si: number; ti: number }
      | { en: string; t: 'note'; i: number }
      | { en: string; t: 'reason'; gi: number }
      | { en: string; t: 'teamNote' };
    const jobs: Job[] = [];
    if (intro.en?.trim()) jobs.push({ en: intro.en, t: 'intro' });
    v?.tipSections.forEach((s, si) =>
      s.tips.forEach((tip, ti) => tip.en?.trim() && jobs.push({ en: tip.en, t: 'tip', si, ti })),
    );
    v?.notes.forEach((n, i) => n.en?.trim() && jobs.push({ en: n.en, t: 'note', i }));
    v?.recommended.forEach(
      (g, gi) => g.reason?.en?.trim() && jobs.push({ en: g.reason.en, t: 'reason', gi }),
    );
    if (v?.teamNote?.en?.trim()) jobs.push({ en: v.teamNote.en, t: 'teamNote' });

    if (!jobs.length) {
      setTrans('done');
      setTransMsg('Rien à traduire (aucun texte EN).');
      return;
    }
    try {
      const { results, provider } = await autoTranslate(
        jobs.map((j) => j.en),
        targets,
      );
      let filled = 0;
      const fillInto = (rec: LText, tr: Partial<Record<L, string>>) => {
        for (const l of targets) {
          if (tr[l] && !rec[l]?.trim()) {
            rec[l] = tr[l]!;
            filled++;
          }
        }
      };
      const nextIntro: LText = { ...intro };
      const tipSections: TipSectionDraft[] = v
        ? v.tipSections.map((s) => ({ ...s, tips: s.tips.map((t) => ({ ...t })) }))
        : [];
      const notes = v ? v.notes.map((t) => ({ ...t })) : [];
      const reco: RecoGroupDraft[] = v
        ? v.recommended.map((g) => ({ ...g, reason: g.reason ? { ...g.reason } : undefined }))
        : [];
      const teamNote: LText | undefined = v?.teamNote ? { ...v.teamNote } : undefined;

      jobs.forEach((job, k) => {
        const tr = (results[k] ?? {}) as Partial<Record<L, string>>;
        if (job.t === 'intro') fillInto(nextIntro, tr);
        else if (job.t === 'tip') fillInto(tipSections[job.si].tips[job.ti], tr);
        else if (job.t === 'note') fillInto(notes[job.i], tr);
        else if (job.t === 'reason') {
          const g = reco[job.gi];
          const reason: LText = { ...(g.reason ?? { en: '' }) };
          fillInto(reason, tr);
          g.reason = reason;
        } else if (job.t === 'teamNote' && teamNote) fillInto(teamNote, tr);
      });

      setIntro(nextIntro);
      if (v) patch({ tipSections, notes, recommended: reco, teamNote });
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

  /* --- Enregistrement --- */
  async function save() {
    setState('saving');
    setError(null);
    const draft: GuideDraft = { intro, versions: versions.map(stripKey) };
    try {
      const res = await fetch(`/api/admin/guides/${category}/${slug}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ op: 'save', draft }),
      });
      const json = (await res.json()) as { ok: boolean; errors?: string[] };
      if (!json.ok) throw new Error(json.errors?.join(' · ') ?? res.statusText);
      setState('saved');
    } catch (e) {
      setState('error');
      setError((e as Error).message);
    }
  }

  /* --- Ajout d'une version (duplication) --- */
  async function confirmAddVersion() {
    setAddBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/guides/${category}/${slug}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ op: 'add-version', newKey: newKey.trim(), fromKey }),
      });
      const json = (await res.json()) as { ok: boolean; errors?: string[]; draft?: GuideDraft };
      if (!json.ok || !json.draft) throw new Error(json.errors?.join(' · ') ?? res.statusText);
      setVersions(json.draft.versions.map(withKey));
      setIntro(json.draft.intro);
      const idx = json.draft.versions.findIndex((x) => x.key === newKey.trim());
      setActive(idx < 0 ? 0 : idx);
      setAdding(false);
      setNewKey('');
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setAddBusy(false);
    }
  }

  /* --- Contenus des onglets de la version active --- */
  function monsterTab() {
    if (!v) return null;
    return (
      <section className="space-y-1.5">
        <p className={heading}>Monstre (combat)</p>
        <GroupPicker
          options={groupOptions}
          value={v.group ?? ''}
          onSelect={(group) => patch({ group: group || undefined })}
        />
        {!v.group && (
          <p className="text-warn text-xs">
            Aucun combat désigné — la version n’affichera pas de panneau de boss.
          </p>
        )}
      </section>
    );
  }

  function tipsTab() {
    if (!v) return null;
    const setSection = (si: number, p: Partial<TipSectionDraft>) => {
      const sections = v.tipSections.slice();
      sections[si] = { ...sections[si], ...p };
      patch({ tipSections: sections });
    };
    return (
      <section className="space-y-4">
        {v.tipSections.length === 0 && (
          <p className="text-content-subtle text-sm">Aucune section — ajoute-en une.</p>
        )}
        {v.tipSections.map((section, si) => (
          <div key={si} className="card space-y-2 rounded-xl p-4">
            <div className="flex items-center gap-2">
              <input
                className={`${input} max-w-xs`}
                placeholder={`Titre de section (optionnel${lang === 'en' ? '' : `, EN : ${section.title?.en ?? '—'}`})`}
                value={show(section.title)}
                onChange={(e) =>
                  setSection(si, { title: orUndef(editLText(section.title, e.target.value)) })
                }
              />
              <button
                type="button"
                className="text-danger ml-auto text-sm"
                title="Supprimer la section"
                onClick={() => patch({ tipSections: v.tipSections.filter((_, j) => j !== si) })}
              >
                ✕ section
              </button>
            </div>
            <InlineTextField
              value={itemsToBlock(section.tips, lang)}
              refs={refs}
              lang={lang}
              rows={5}
              layout="stacked"
              previewMode="list"
              placeholder="Un conseil par ligne…"
              onChange={(val) => setSection(si, { tips: blockToItems(val, section.tips, lang) })}
            />
          </div>
        ))}
        <button
          type="button"
          className={btn}
          onClick={() => patch({ tipSections: [...v.tipSections, { tips: [] }] })}
        >
          + section
        </button>
      </section>
    );
  }

  function notesTab() {
    if (!v) return null;
    return (
      <section className="space-y-2">
        <p className={heading}>
          Notes libres <span className="text-content-subtle font-normal">(paragraphes)</span>
        </p>
        {v.notes.map((note, i) => (
          <div key={i} className="grid grid-cols-[1fr_auto] items-start gap-2">
            <InlineTextField
              value={show(note)}
              refs={refs}
              lang={lang}
              layout="stacked"
              placeholder={lang === 'en' ? '' : (note.en ?? '')}
              onChange={(val) => {
                const notes = v.notes.slice();
                notes[i] = editLText(note, val);
                patch({ notes });
              }}
            />
            <button
              type="button"
              className="text-danger text-sm"
              title="Supprimer"
              onClick={() => patch({ notes: v.notes.filter((_, j) => j !== i) })}
            >
              ✕
            </button>
          </div>
        ))}
        <button
          type="button"
          className={btn}
          onClick={() => patch({ notes: [...v.notes, { en: '' }] })}
        >
          + note
        </button>
      </section>
    );
  }

  function recoTab() {
    if (!v) return null;
    return (
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <p className={heading}>Persos recommandés</p>
          <button
            type="button"
            className={btn}
            onClick={() => patch({ recommended: [...v.recommended, { characters: [] }] })}
          >
            + groupe
          </button>
        </div>
        {v.recommended.map((g, gi) => {
          const setGroup = (p: Partial<RecoGroupDraft>) => {
            const reco = v.recommended.slice();
            reco[gi] = { ...g, ...p };
            patch({ recommended: reco });
          };
          return (
            <div key={gi} className="card space-y-3 rounded-xl p-4">
              <div className="flex items-start justify-between gap-2">
                <CharacterChips
                  names={g.characters}
                  charByName={charByName}
                  onChange={(characters) => setGroup({ characters })}
                />
                <button
                  type="button"
                  className="text-danger shrink-0 text-sm"
                  onClick={() => patch({ recommended: v.recommended.filter((_, j) => j !== gi) })}
                >
                  Supprimer
                </button>
              </div>
              <div>
                <p className="text-content-subtle mb-1 text-xs uppercase">Raison ({lang})</p>
                <InlineTextField
                  value={show(g.reason)}
                  refs={refs}
                  lang={lang}
                  layout="stacked"
                  placeholder={lang === 'en' ? '' : (g.reason?.en ?? '')}
                  onChange={(val) => setGroup({ reason: orUndef(editLText(g.reason, val)) })}
                />
              </div>
            </div>
          );
        })}
      </section>
    );
  }

  function teamTab() {
    if (!v) return null;
    return (
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <p className={heading}>
            Équipe <span className="text-content-subtle font-normal">(max {MAX_SLOTS} slots)</span>
          </p>
          {v.teamSlots.length < MAX_SLOTS && (
            <button
              type="button"
              className={btn}
              onClick={() => patch({ teamSlots: [...v.teamSlots, []] })}
            >
              + slot
            </button>
          )}
        </div>
        {v.teamSlots.map((slot, si) => (
          <div key={si} className="flex items-start gap-2">
            <span className="text-content-subtle mt-3 w-6 shrink-0 text-right text-xs">
              {si + 1}
            </span>
            <div className="min-w-0 flex-1">
              <CharacterChips
                names={slot}
                charByName={charByName}
                onChange={(names) => {
                  const teamSlots = v.teamSlots.slice();
                  teamSlots[si] = names;
                  patch({ teamSlots });
                }}
              />
            </div>
            <button
              type="button"
              className="text-danger mt-2 shrink-0 text-sm"
              title="Supprimer le slot"
              onClick={() => patch({ teamSlots: v.teamSlots.filter((_, j) => j !== si) })}
            >
              ✕
            </button>
          </div>
        ))}
        <div>
          <p className="text-content-subtle mb-1 text-xs uppercase">Note d’équipe ({lang})</p>
          <InlineTextField
            value={show(v.teamNote)}
            refs={refs}
            lang={lang}
            layout="stacked"
            placeholder={lang === 'en' ? '' : (v.teamNote?.en ?? '')}
            onChange={(val) => patch({ teamNote: orUndef(editLText(v.teamNote, val)) })}
          />
        </div>
      </section>
    );
  }

  function videosTab() {
    if (!v) return null;
    return (
      <VideoCurator
        characterName={groupLabel(v.group) || slug}
        videos={v.videos.map((vid) => ({
          platform: vid.platform,
          id: vid.id,
          title: vid.title,
          author: vid.author,
        }))}
        onChange={(next: VideoRef[]) =>
          patch({
            videos: next.map((r) => ({
              platform: (r.platform as VideoItem['platform']) ?? 'youtube',
              id: r.id,
              title: r.title ?? '',
              ...(r.author ? { author: r.author } : {}),
            })),
          })
        }
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Datalist partagée des noms de persos (chips reco + équipe) */}
      <datalist id="guide-char-names">
        {charOptions.map((c) => (
          <option key={c.id} value={c.name} />
        ))}
      </datalist>

      {/* Langue + auto-traduction */}
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
          title="Traduit l'EN vers les langues encore vides (DeepL → Haiku)"
        >
          {trans === 'loading' ? 'Traduction…' : 'Traduire (EN → vides)'}
        </button>
        {transMsg && (
          <span className={`text-xs ${trans === 'error' ? 'text-danger' : 'text-content-subtle'}`}>
            {transMsg}
          </span>
        )}
      </div>

      {/* Intro partagée (commune à toutes les versions) */}
      <section className="space-y-1.5">
        <p className={heading}>
          Intro du guide{' '}
          <span className="text-content-subtle font-normal">(commune à toutes les versions)</span>
        </p>
        <InlineTextField
          value={show(intro)}
          refs={refs}
          lang={lang}
          layout="stacked"
          placeholder={lang === 'en' ? '' : (intro.en ?? '')}
          onChange={(val) => setIntro(editLText(intro, val))}
        />
      </section>

      {/* Onglets de version + ajout */}
      <div className="border-line-subtle flex flex-wrap items-center gap-1 border-b pb-2">
        {versions.map((ver, i) => (
          <button
            key={ver._key}
            type="button"
            onClick={() => setActive(i)}
            className={`rounded-md px-3 py-1 text-sm ${i === active ? 'bg-accent/20 text-accent font-semibold' : 'text-content-muted hover:bg-surface-overlay'}`}
          >
            {ver.key}
            {i === 0 && <span className="text-content-subtle ml-1 text-[10px]">(récente)</span>}
          </button>
        ))}
        <button
          type="button"
          className="text-accent ml-2 text-sm hover:underline"
          onClick={() => {
            setAdding((s) => !s);
            setFromKey(versions[0]?.key ?? '');
          }}
        >
          ＋ version
        </button>
      </div>

      {/* Panneau d'ajout de version */}
      {adding && (
        <div className="border-line bg-surface-raised flex flex-wrap items-end gap-3 rounded-md border p-3">
          <label className="text-content-subtle text-xs">
            Nouvelle version (YYYY-MM)
            <input
              className={`${input} mt-1 w-32`}
              placeholder="2026-08"
              value={newKey}
              onChange={(e) => setNewKey(e.target.value)}
            />
          </label>
          <label className="text-content-subtle text-xs">
            Dupliquer depuis
            <select
              className={`${input} mt-1 w-40`}
              value={fromKey}
              onChange={(e) => setFromKey(e.target.value)}
            >
              {versions.map((ver) => (
                <option key={ver._key} value={ver.key}>
                  {ver.key}
                </option>
              ))}
            </select>
          </label>
          <button
            type="button"
            className={btn}
            disabled={addBusy || !newKey.trim() || !fromKey}
            onClick={confirmAddVersion}
          >
            {addBusy ? 'Création…' : 'Créer la version'}
          </button>
          <button
            type="button"
            className="text-content-subtle text-sm hover:underline"
            onClick={() => setAdding(false)}
          >
            annuler
          </button>
        </div>
      )}

      {/* Éditeur de la version active — parties en onglets */}
      {!v ? (
        <p className="text-content-subtle text-sm">
          Aucune version — ajoute-en une pour commencer.
        </p>
      ) : (
        <EditorTabs
          tabs={[
            { key: 'monster', label: 'Monstre', content: monsterTab() },
            { key: 'tips', label: 'Conseils', content: tipsTab() },
            { key: 'notes', label: 'Notes', content: notesTab() },
            { key: 'reco', label: 'Persos', content: recoTab() },
            { key: 'team', label: 'Équipe', content: teamTab() },
            { key: 'videos', label: 'Vidéos', content: videosTab() },
          ]}
        />
      )}

      {/* Enregistrement */}
      <div className="border-line-subtle flex items-center gap-3 border-t pt-4">
        <button type="button" className={btn} onClick={save} disabled={state === 'saving'}>
          {state === 'saving' ? 'Enregistrement…' : 'Enregistrer le guide'}
        </button>
        {state === 'saved' && <span className="text-success text-sm">✓ enregistré</span>}
        {(state === 'error' || error) && <span className="text-danger text-sm">{error}</span>}
      </div>
    </div>
  );
}
