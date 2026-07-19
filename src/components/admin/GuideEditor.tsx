'use client';

/**
 * Éditeur UNIFIÉ des guides de boss de la famille (joint-challenge,
 * special-request, irregular-extermination, adventure-license).
 *
 * Une seule UI pilotée par le `CatSpec` de la catégorie : versionné ou plat,
 * monstre par `group`, équipes en `slots` / `buckets` (plages de stages) /
 * `named` (équipes titrées). Chaque texte est un `InlineTextField` (aperçu
 * fidèle via le vrai `parseText`) ; les conseils s'éditent en BLOC (une ligne =
 * un conseil) avec un unique rendu en liste, comme sur le vrai guide.
 */
import { useState } from 'react';
import type { VideoRef } from '@contracts';
import { type Keyed, stripKey, withKey } from '@/lib/admin/keyed';
import type { InlineRefs } from '@/lib/admin/inline-refs';
import {
  guideSpec,
  hasText,
  type GuideDraft,
  type LText,
  type RecoGroupDraft,
  type RecoSectionDraft,
  type TeamDraft,
  type TipSectionDraft,
  type VersionDraft,
} from '@/lib/admin/guide-draft';
import { autoTranslate } from '@/lib/admin/translate-actions';
import { EditorTabs } from '@/components/admin/EditorTabs';
import { InlineTextField } from '@/components/admin/InlineTextField';
import { CharacterPortrait } from '@/components/character/CharacterPortrait';
import type { CharOption } from '@/components/admin/CharacterPicker';
import { GroupPicker, type GroupOption } from '@/components/admin/GroupPicker';
import { IdLabelPicker, type IdLabel } from '@/components/admin/IdLabelPicker';
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

const itemsToBlock = (items: LText[], lang: L): string =>
  items.map((t) => t[lang] ?? '').join('\n');
/**
 * Bloc édité → liste localisée. L'EN est la STRUCTURE : l'éditer ajoute/retire
 * des entrées ; une autre langue ne fait que remplir les traductions par index.
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
  dungeonOptions = [],
  monsterOptions = [],
}: {
  category: string;
  slug: string;
  initial: GuideDraft;
  refs: InlineRefs;
  charOptions: CharOption[];
  groupOptions: GroupOption[];
  dungeonOptions?: IdLabel[];
  monsterOptions?: IdLabel[];
}) {
  const spec = guideSpec(category);
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
  const [adding, setAdding] = useState(false);
  const [newKey, setNewKey] = useState('');
  const [fromKey, setFromKey] = useState('');
  const [addBusy, setAddBusy] = useState(false);

  const charByName = new Map(charOptions.map((c) => [c.name, c]));
  const groupLabel = (g?: string) => groupOptions.find((o) => o.group === g)?.label ?? g ?? '';
  const dungeonLabel = (id: string) => dungeonOptions.find((o) => o.id === id)?.label ?? id;
  const titlePlaceholder = (hasRaw: boolean, title?: LText) =>
    hasRaw && !hasText(title)
      ? 'Titre auto (généré) — écrire pour forcer'
      : `Titre (optionnel${lang === 'en' ? '' : `, EN : ${title?.en ?? '—'}`})`;

  if (!spec) return <p className="text-content-subtle text-sm">Catégorie non éditable.</p>;

  const v: Keyed<VersionDraft> | undefined = versions[active];

  const patch = (p: Partial<VersionDraft>) => {
    if (!v) return;
    const next = versions.slice();
    next[active] = { ...v, ...p };
    setVersions(next);
  };
  const editLText = (cur: LText | undefined, val: string): LText => {
    const next: LText = { ...(cur ?? { en: '' }) };
    if (val) next[lang] = val;
    else delete next[lang];
    if (next.en === undefined) next.en = '';
    return next;
  };
  const show = (t: LText | undefined): string => t?.[lang] ?? '';
  const orUndef = (t: LText): LText | undefined => (hasText(t) ? t : undefined);

  /* --- Auto-traduction (version active + intro) --- */
  async function translateEmpty() {
    if (!v) return;
    setTrans('loading');
    setTransMsg(null);
    const targets = LANGS.filter((l) => l !== 'en');

    const nextIntro: LText = { ...intro };
    const cv: VersionDraft = {
      ...v,
      tipSections: v.tipSections.map((s) => ({
        ...s,
        title: s.title ? { ...s.title } : undefined,
        tips: s.tips.map((t) => ({ ...t })),
      })),
      notes: v.notes.map((t) => ({ ...t })),
      recommended: v.recommended.map((g) => ({
        ...g,
        reason: g.reason ? { ...g.reason } : undefined,
      })),
      recoSections: v.recoSections.map((s) => ({
        ...s,
        title: s.title ? { ...s.title } : undefined,
        groups: s.groups.map((g) => ({ ...g, reason: g.reason ? { ...g.reason } : undefined })),
      })),
      teams: v.teams.map((t) => ({
        ...t,
        title: t.title ? { ...t.title } : undefined,
        note: t.note ? { ...t.note } : undefined,
        notes: t.notes ? t.notes.map((n) => ({ ...n })) : undefined,
      })),
    };

    // Collecte des LText EXISTANTS avec un EN (on ne remplit que les vides).
    const recs: LText[] = [];
    if (nextIntro.en?.trim()) recs.push(nextIntro);
    cv.tipSections.forEach((s) => {
      if (s.title?.en?.trim()) recs.push(s.title);
      s.tips.forEach((t) => t.en?.trim() && recs.push(t));
    });
    cv.notes.forEach((t) => t.en?.trim() && recs.push(t));
    cv.recommended.forEach((g) => g.reason?.en?.trim() && recs.push(g.reason));
    cv.recoSections.forEach((s) => {
      if (s.title?.en?.trim()) recs.push(s.title);
      s.groups.forEach((g) => g.reason?.en?.trim() && recs.push(g.reason));
    });
    cv.teams.forEach((t) => {
      if (t.title?.en?.trim()) recs.push(t.title);
      if (t.note?.en?.trim()) recs.push(t.note);
      t.notes?.forEach((n) => n.en?.trim() && recs.push(n));
    });

    if (!recs.length) {
      setTrans('done');
      setTransMsg('Rien à traduire (aucun texte EN).');
      return;
    }
    try {
      const { results, provider } = await autoTranslate(
        recs.map((r) => r.en),
        targets,
      );
      let filled = 0;
      recs.forEach((rec, k) => {
        const tr = (results[k] ?? {}) as Partial<Record<L, string>>;
        for (const l of targets) {
          if (tr[l] && !rec[l]?.trim()) {
            rec[l] = tr[l]!;
            filled++;
          }
        }
      });
      setIntro(nextIntro);
      patch(cv);
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

  /* --- Enregistrement / ajout de version --- */
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

  /* --- Bloc de slots réutilisable (max 4) --- */
  function SlotsBlock({
    slots,
    onChange,
  }: {
    slots: string[][];
    onChange: (slots: string[][]) => void;
  }) {
    return (
      <div className="space-y-2">
        {slots.map((slot, si) => (
          <div key={si} className="flex items-start gap-2">
            <span className="text-content-subtle mt-3 w-6 shrink-0 text-right text-xs">
              {si + 1}
            </span>
            <div className="min-w-0 flex-1">
              <CharacterChips
                names={slot}
                charByName={charByName}
                onChange={(names) => onChange(slots.map((s, j) => (j === si ? names : s)))}
              />
            </div>
            <button
              type="button"
              className="text-danger mt-2 shrink-0 text-sm"
              title="Supprimer le slot"
              onClick={() => onChange(slots.filter((_, j) => j !== si))}
            >
              ✕
            </button>
          </div>
        ))}
        {slots.length < MAX_SLOTS && (
          <button type="button" className={btn} onClick={() => onChange([...slots, []])}>
            + slot
          </button>
        )}
      </div>
    );
  }

  /* --- Onglets de la version active --- */
  function monsterTab() {
    if (!v) return null;
    // Donjons ordonnés (adventure : `meta.dungeons`).
    if (spec!.monster === 'dungeons-meta') {
      const dungeons = v.dungeons ?? [];
      return (
        <section className="space-y-2">
          <p className={heading}>
            Donjons <span className="text-content-subtle font-normal">(du plus facile au dur)</span>
          </p>
          {dungeons.map((id, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="text-content-subtle w-6 text-right text-xs">{i + 1}</span>
              <span className="text-content flex-1 text-sm">{dungeonLabel(id)}</span>
              <button
                type="button"
                className="text-danger text-sm"
                title="Retirer"
                onClick={() => patch({ dungeons: dungeons.filter((_, j) => j !== i) })}
              >
                ✕
              </button>
            </div>
          ))}
          <IdLabelPicker
            options={dungeonOptions}
            value=""
            onSelect={(id) => id && patch({ dungeons: [...dungeons, id] })}
            placeholder="Ajouter un donjon…"
          />
          {!dungeons.length && <p className="text-warn text-xs">Au moins un donjon est requis.</p>}
        </section>
      );
    }
    // Boss unique (dimensional-singularity : `meta.bossId`).
    if (spec!.monster === 'bossId-meta') {
      return (
        <section className="space-y-1.5">
          <p className={heading}>Boss (monstre)</p>
          <IdLabelPicker
            options={monsterOptions}
            value={v.bossId ?? ''}
            onSelect={(id) => patch({ bossId: id || undefined })}
            placeholder="Chercher un monstre…"
          />
          {!v.bossId && <p className="text-warn text-xs">Un boss est requis.</p>}
        </section>
      );
    }
    // Combat par `group` (config ou meta).
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
    const setSection = (si: number, p: Partial<TipSectionDraft>) =>
      patch({ tipSections: v.tipSections.map((s, j) => (j === si ? { ...s, ...p } : s)) });

    // Plat : une seule liste sans titre. Versionné : sections titrées.
    if (!spec!.tipTitles) {
      const section = v.tipSections[0] ?? { tips: [] };
      return (
        <section className="space-y-2">
          <p className={heading}>Conseils</p>
          <InlineTextField
            value={itemsToBlock(section.tips, lang)}
            refs={refs}
            lang={lang}
            rows={6}
            layout="stacked"
            previewMode="list"
            placeholder="Un conseil par ligne…"
            onChange={(val) =>
              patch({ tipSections: [{ tips: blockToItems(val, section.tips, lang) }] })
            }
          />
        </section>
      );
    }
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
                placeholder={titlePlaceholder(Boolean(section.rawTitle), section.title)}
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
              onChange={(val) =>
                patch({ notes: v.notes.map((n, j) => (j === i ? editLText(n, val) : n)) })
              }
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

  // Liste éditable de groupes de persos (chips + raison) — réutilisée à plat et
  // en sections (dimensional-singularity).
  function RecoGroups({
    groups,
    onChange,
  }: {
    groups: RecoGroupDraft[];
    onChange: (groups: RecoGroupDraft[]) => void;
  }) {
    return (
      <div className="space-y-3">
        {groups.map((g, gi) => {
          const setGroup = (p: Partial<RecoGroupDraft>) =>
            onChange(groups.map((x, j) => (j === gi ? { ...x, ...p } : x)));
          return (
            <div key={gi} className="border-line-subtle space-y-3 rounded-lg border p-3">
              <div className="flex items-start justify-between gap-2">
                <CharacterChips
                  names={g.characters}
                  charByName={charByName}
                  onChange={(characters) => setGroup({ characters })}
                />
                <button
                  type="button"
                  className="text-danger shrink-0 text-sm"
                  onClick={() => onChange(groups.filter((_, j) => j !== gi))}
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
        <button
          type="button"
          className={btn}
          onClick={() => onChange([...groups, { characters: [] }])}
        >
          + groupe
        </button>
      </div>
    );
  }

  function recoTab() {
    if (!v) return null;
    // dim : persos en SECTIONS titrées (= `content.teams`, rendu RecommendedCharacters).
    if (spec!.recoSections) {
      const setSec = (si: number, p: Partial<RecoSectionDraft>) =>
        patch({ recoSections: v.recoSections.map((s, j) => (j === si ? { ...s, ...p } : s)) });
      return (
        <section className="space-y-4">
          <p className={heading}>Persos recommandés (sections)</p>
          {v.recoSections.map((s, si) => (
            <div key={si} className="card space-y-3 rounded-xl p-4">
              <div className="flex items-center gap-2">
                <input
                  className={`${input} max-w-xs`}
                  placeholder={titlePlaceholder(Boolean(s.rawTitle), s.title)}
                  value={show(s.title)}
                  onChange={(e) =>
                    setSec(si, { title: orUndef(editLText(s.title, e.target.value)) })
                  }
                />
                <button
                  type="button"
                  className="text-danger ml-auto text-sm"
                  onClick={() => patch({ recoSections: v.recoSections.filter((_, j) => j !== si) })}
                >
                  ✕ section
                </button>
              </div>
              <RecoGroups groups={s.groups} onChange={(groups) => setSec(si, { groups })} />
            </div>
          ))}
          <button
            type="button"
            className={btn}
            onClick={() => patch({ recoSections: [...v.recoSections, { groups: [] }] })}
          >
            + section
          </button>
        </section>
      );
    }
    return (
      <section className="space-y-3">
        <p className={heading}>Persos recommandés</p>
        <RecoGroups groups={v.recommended} onChange={(g) => patch({ recommended: g })} />
      </section>
    );
  }

  function teamTab() {
    if (!v) return null;
    const setTeam = (ti: number, p: Partial<TeamDraft>) =>
      patch({ teams: v.teams.map((t, j) => (j === ti ? { ...t, ...p } : t)) });

    // slots : une seule équipe (créée à la volée).
    if (spec!.teams === 'slots') {
      const team = v.teams[0] ?? { slots: [] };
      const setSlots = (slots: string[][]) => patch({ teams: [{ ...team, slots }] });
      return (
        <section className="space-y-3">
          <p className={heading}>
            Équipe <span className="text-content-subtle font-normal">(max {MAX_SLOTS} slots)</span>
          </p>
          <SlotsBlock slots={team.slots} onChange={setSlots} />
          <div>
            <p className="text-content-subtle mb-1 text-xs uppercase">Note d’équipe ({lang})</p>
            <InlineTextField
              value={show(team.note)}
              refs={refs}
              lang={lang}
              layout="stacked"
              placeholder={lang === 'en' ? '' : (team.note?.en ?? '')}
              onChange={(val) =>
                patch({ teams: [{ ...team, note: orUndef(editLText(team.note, val)) }] })
              }
            />
          </div>
        </section>
      );
    }

    // buckets (special-request) : plusieurs équipes par plage de stages.
    if (spec!.teams === 'buckets') {
      return (
        <section className="space-y-4">
          {v.teams.map((t, ti) => (
            <div key={ti} className="card space-y-3 rounded-xl p-4">
              <div className="flex items-center gap-2">
                <span className="text-content-subtle text-xs uppercase">Stages</span>
                <input
                  type="number"
                  className={`${input} w-16`}
                  value={t.stages?.[0] ?? 1}
                  onChange={(e) =>
                    setTeam(ti, { stages: [Number(e.target.value) || 1, t.stages?.[1] ?? 1] })
                  }
                />
                <span className="text-content-subtle">→</span>
                <input
                  type="number"
                  className={`${input} w-16`}
                  value={t.stages?.[1] ?? 1}
                  onChange={(e) =>
                    setTeam(ti, { stages: [t.stages?.[0] ?? 1, Number(e.target.value) || 1] })
                  }
                />
                <button
                  type="button"
                  className="text-danger ml-auto text-sm"
                  onClick={() => patch({ teams: v.teams.filter((_, j) => j !== ti) })}
                >
                  ✕ plage
                </button>
              </div>
              <SlotsBlock slots={t.slots} onChange={(slots) => setTeam(ti, { slots })} />
              <div>
                <p className="text-content-subtle mb-1 text-xs uppercase">Note ({lang})</p>
                <InlineTextField
                  value={show(t.note)}
                  refs={refs}
                  lang={lang}
                  layout="stacked"
                  placeholder={lang === 'en' ? '' : (t.note?.en ?? '')}
                  onChange={(val) => setTeam(ti, { note: orUndef(editLText(t.note, val)) })}
                />
              </div>
            </div>
          ))}
          <button
            type="button"
            className={btn}
            onClick={() => patch({ teams: [...v.teams, { stages: [1, 1], slots: [] }] })}
          >
            + plage de stages
          </button>
        </section>
      );
    }

    // named (irregular / adventure-license) : équipes titrées + note multi-§.
    return (
      <section className="space-y-4">
        {v.teams.map((t, ti) => (
          <div key={ti} className="card space-y-3 rounded-xl p-4">
            <div className="flex items-center gap-2">
              <input
                className={`${input} max-w-xs`}
                placeholder={
                  t.rawTitle && !hasText(t.title)
                    ? 'Titre auto (généré) — écrire pour forcer'
                    : `Titre de l’équipe (optionnel${lang === 'en' ? '' : `, EN : ${t.title?.en ?? '—'}`})`
                }
                value={show(t.title)}
                onChange={(e) =>
                  setTeam(ti, { title: orUndef(editLText(t.title, e.target.value)) })
                }
              />
              <button
                type="button"
                className="text-danger ml-auto text-sm"
                onClick={() => patch({ teams: v.teams.filter((_, j) => j !== ti) })}
              >
                ✕ équipe
              </button>
            </div>
            <SlotsBlock slots={t.slots} onChange={(slots) => setTeam(ti, { slots })} />
            <div>
              <p className="text-content-subtle mb-1 text-xs uppercase">
                Note ({lang}) — un paragraphe par ligne
              </p>
              <InlineTextField
                value={itemsToBlock(t.notes ?? [], lang)}
                refs={refs}
                lang={lang}
                rows={4}
                layout="stacked"
                previewMode="list"
                placeholder="Un paragraphe par ligne…"
                onChange={(val) => setTeam(ti, { notes: blockToItems(val, t.notes ?? [], lang) })}
              />
            </div>
          </div>
        ))}
        <button
          type="button"
          className={btn}
          onClick={() => patch({ teams: [...v.teams, { slots: [] }] })}
        >
          + équipe
        </button>
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

  const tabs = [
    { key: 'monster', label: 'Monstre', content: monsterTab() },
    { key: 'tips', label: 'Conseils', content: tipsTab() },
    ...(spec.notes ? [{ key: 'notes', label: 'Notes', content: notesTab() }] : []),
    { key: 'reco', label: 'Persos', content: recoTab() },
    ...(spec.teams !== 'none' ? [{ key: 'team', label: 'Équipe', content: teamTab() }] : []),
    ...(spec.videos ? [{ key: 'videos', label: 'Vidéos', content: videosTab() }] : []),
  ];

  return (
    <div className="space-y-6">
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

      {/* Intro */}
      <section className="space-y-1.5">
        <p className={heading}>
          Intro du guide
          {spec.versioned && (
            <span className="text-content-subtle font-normal">
              {' '}
              (commune à toutes les versions)
            </span>
          )}
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

      {/* Barre de versions (versionné uniquement) */}
      {spec.versioned && (
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
      )}

      {spec.versioned && adding && (
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

      {!v ? (
        <p className="text-content-subtle text-sm">
          Aucune version — ajoute-en une pour commencer.
        </p>
      ) : (
        <EditorTabs tabs={tabs} />
      )}

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
