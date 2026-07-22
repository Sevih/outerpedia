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
import { useMemo, useState } from 'react';
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
import { applyTranslation, createFreshness } from '@/lib/admin/translate-fill';
import { EditorTabs } from '@/components/admin/EditorTabs';
import { InlineTextField } from '@/components/admin/InlineTextField';
import {
  CharacterChips,
  CharacterNameDatalist,
  viewsByName,
  type ChipView,
} from '@/components/admin/CharacterChips';
import { CharacterGroups, type GroupWithReason } from '@/components/admin/CharacterGroups';
import type { CharOption } from '@/components/admin/CharacterPicker';
import { GroupPicker, type GroupOption } from '@/components/admin/GroupPicker';
import { IdLabelPicker, type IdLabel } from '@/components/admin/IdLabelPicker';
import { VideoCurator } from '@/components/admin/VideoCurator';
import type { VideoItem } from '@/components/ui/MultiVideoEmbed';

const LANGS = ['en', 'jp', 'kr', 'zh', 'fr'] as const;
type L = (typeof LANGS)[number];
const MAX_SLOTS = 4;
/** Datalist des noms de persos, posée une fois par page. */
const DATALIST_ID = 'guide-char-names';
/** Jeton stocké par les guides = NOM D'AFFICHAGE EN du perso. */
type ViewOf = (token: string) => ChipView | undefined;

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

/**
 * Tous les textes localisés d'une version, dans l'ordre — les OBJETS EUX-MÊMES
 * (la traduction écrit dedans). Sert aussi à photographier l'état au montage
 * pour ne retraduire que ce qui a bougé.
 */
function versionTexts(ver: VersionDraft): LText[] {
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

/* --- Briques d'édition (HORS du composant) ---
 *
 * ⚠ Ces composants DOIVENT rester au niveau module. Déclarés dans le corps de
 * `GuideEditor`, leur identité change à chaque rendu : React démonte puis
 * remonte tout leur sous-arbre à CHAQUE frappe — le champ perd le focus et
 * chaque `InlineTextField` refait son aperçu (une requête par champ, par
 * lettre). */

/** Bloc de slots d'équipe (max 4) — une ligne = les alternatives d'un slot. */
function SlotsBlock({
  slots,
  viewOf,
  onChange,
}: {
  slots: string[][];
  viewOf: ViewOf;
  onChange: (slots: string[][]) => void;
}) {
  return (
    <div className="space-y-2">
      {slots.map((slot, si) => (
        <div key={si} className="flex items-start gap-2">
          <span className="text-content-subtle mt-3 w-6 shrink-0 text-right text-xs">{si + 1}</span>
          <div className="min-w-0 flex-1">
            <CharacterChips
              values={slot}
              datalistId={DATALIST_ID}
              viewOf={viewOf}
              onChange={(names) => onChange(slots.map((s, j) => (j === si ? names : s)))}
            />
          </div>
          <button
            type="button"
            className="text-danger mt-2 shrink-0 text-sm"
            title="Delete slot"
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

/**
 * Persos recommandés — même brique que les synergies d'une fiche perso (des
 * portraits + une raison, éditée une à la fois). Les guides désignent les persos
 * par NOM EN, d'où l'adaptation `characters` ⇄ `heroes` en entrée/sortie.
 */
function RecoGroups({
  groups,
  onChange,
  lang,
  refs,
  viewOf,
}: {
  groups: RecoGroupDraft[];
  onChange: (groups: RecoGroupDraft[]) => void;
  lang: L;
  refs: InlineRefs;
  viewOf: ViewOf;
}) {
  const adapted: GroupWithReason[] = groups.map((g) => ({
    heroes: g.characters,
    ...(g.reason ? { reason: g.reason } : {}),
  }));
  return (
    <CharacterGroups
      groups={adapted}
      onChange={(next) =>
        onChange(
          next.map((g) => ({
            characters: g.heroes,
            // L'EN reste la structure du contenu localisé (cf. `editLText`).
            ...(hasText(g.reason) ? { reason: { ...g.reason, en: g.reason?.en ?? '' } } : {}),
          })),
        )
      }
      newGroup={() => ({ heroes: [] })}
      lang={lang}
      refs={refs}
      datalistId={DATALIST_ID}
      viewOf={viewOf}
      chipSize={48}
    />
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
  // Photo des EN au chargement : référence de ce qui est « déjà traduit ».
  const [freshness] = useState(() =>
    createFreshness([initial.intro, ...initial.versions.flatMap(versionTexts)].map((t) => t?.en)),
  );

  const viewOf = useMemo(() => viewsByName(charOptions), [charOptions]);
  const groupLabel = (g?: string) => groupOptions.find((o) => o.group === g)?.label ?? g ?? '';
  const dungeonLabel = (id: string) => dungeonOptions.find((o) => o.id === id)?.label ?? id;
  const titlePlaceholder = (hasRaw: boolean, title?: LText) =>
    hasRaw && !hasText(title)
      ? 'Auto title (generated) — type to override'
      : `Title (optional${lang === 'en' ? '' : `, EN: ${title?.en ?? '—'}`})`;

  if (!spec) return <p className="text-content-subtle text-sm">Non-editable category.</p>;

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
  async function translateAll() {
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

    // Ne part au traducteur que ce qui a BOUGÉ (EN édité/ajouté) ou à qui il
    // manque une langue — inutile de repayer DeepL pour l'identique.
    const recs = [nextIntro, ...versionTexts(cv)].filter((t) => freshness.isStale(t, targets));

    if (!recs.length) {
      setTrans('done');
      setTransMsg('Nothing to translate — every English text is already up to date.');
      return;
    }
    try {
      const { results, provider } = await autoTranslate(
        recs.map((r) => r.en),
        targets,
      );
      let filled = 0;
      recs.forEach((rec, k) => {
        filled += applyTranslation(rec, results[k] ?? {}, targets);
        freshness.markFresh(rec);
      });
      setIntro(nextIntro);
      patch(cv);
      setTrans('done');
      setTransMsg(
        filled
          ? `${filled} field(s) translated via ${provider === 'haiku' ? 'Haiku (DeepL quota reached)' : 'DeepL'} — to review before saving.`
          : 'Every translation already matched the English text.',
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

  /* --- Onglets de la version active --- */
  function monsterTab() {
    if (!v) return null;
    // Donjons ordonnés (adventure : `meta.dungeons`).
    if (spec!.monster === 'dungeons-meta') {
      const dungeons = v.dungeons ?? [];
      return (
        <section className="space-y-2">
          <p className={heading}>
            Dungeons{' '}
            <span className="text-content-subtle font-normal">(from easiest to hardest)</span>
          </p>
          {dungeons.map((id, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="text-content-subtle w-6 text-right text-xs">{i + 1}</span>
              <span className="text-content flex-1 text-sm">{dungeonLabel(id)}</span>
              <button
                type="button"
                className="text-danger text-sm"
                title="Remove"
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
            placeholder="Add a dungeon…"
          />
          {!dungeons.length && (
            <p className="text-warn text-xs">At least one dungeon is required.</p>
          )}
        </section>
      );
    }
    // Boss unique (dimensional-singularity : `meta.bossId`).
    if (spec!.monster === 'bossId-meta') {
      return (
        <section className="space-y-1.5">
          <p className={heading}>Boss (monster)</p>
          <IdLabelPicker
            options={monsterOptions}
            value={v.bossId ?? ''}
            onSelect={(id) => patch({ bossId: id || undefined })}
            placeholder="Search for a monster…"
          />
          {!v.bossId && <p className="text-warn text-xs">A boss is required.</p>}
        </section>
      );
    }
    // Combat par `group` (config ou meta).
    return (
      <section className="space-y-1.5">
        <p className={heading}>Monster (battle)</p>
        <GroupPicker
          options={groupOptions}
          value={v.group ?? ''}
          onSelect={(group) => patch({ group: group || undefined })}
        />
        {!v.group && (
          <p className="text-warn text-xs">
            No battle assigned — the version won’t show a boss panel.
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
          <p className={heading}>Tips</p>
          <InlineTextField
            value={itemsToBlock(section.tips, lang)}
            refs={refs}
            lang={lang}
            rows={6}
            layout="stacked"
            previewMode="list"
            placeholder="One tip per line…"
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
          <p className="text-content-subtle text-sm">No section — add one.</p>
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
                title="Delete section"
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
              placeholder="One tip per line…"
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
          Free notes <span className="text-content-subtle font-normal">(paragraphs)</span>
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
              title="Delete"
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
    // dim : persos en SECTIONS titrées (= `content.teams`, rendu RecommendedCharacters).
    if (spec!.recoSections) {
      const setSec = (si: number, p: Partial<RecoSectionDraft>) =>
        patch({ recoSections: v.recoSections.map((s, j) => (j === si ? { ...s, ...p } : s)) });
      return (
        <section className="space-y-4">
          <p className={heading}>Recommended characters (sections)</p>
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
              <RecoGroups
                groups={s.groups}
                onChange={(groups) => setSec(si, { groups })}
                lang={lang}
                refs={refs}
                viewOf={viewOf}
              />
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
        <p className={heading}>Recommended characters</p>
        <RecoGroups
          groups={v.recommended}
          onChange={(g) => patch({ recommended: g })}
          lang={lang}
          refs={refs}
          viewOf={viewOf}
        />
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
            Team <span className="text-content-subtle font-normal">(max {MAX_SLOTS} slots)</span>
          </p>
          <SlotsBlock slots={team.slots} viewOf={viewOf} onChange={setSlots} />
          <div>
            <p className="text-content-subtle mb-1 text-xs uppercase">Team note ({lang})</p>
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
                  ✕ range
                </button>
              </div>
              <SlotsBlock
                slots={t.slots}
                viewOf={viewOf}
                onChange={(slots) => setTeam(ti, { slots })}
              />
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
            + stage range
          </button>
        </section>
      );
    }

    // sections (world-boss) : équipes titrées par phase (titre libre + note simple).
    if (spec!.teams === 'sections') {
      return (
        <section className="space-y-4">
          {v.teams.map((t, ti) => (
            <div key={ti} className="card space-y-3 rounded-xl p-4">
              <div className="flex items-center gap-2">
                <input
                  className={`${input} max-w-xs`}
                  placeholder={titlePlaceholder(false, t.title)}
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
                  ✕ team
                </button>
              </div>
              <SlotsBlock
                slots={t.slots}
                viewOf={viewOf}
                onChange={(slots) => setTeam(ti, { slots })}
              />
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
            onClick={() => patch({ teams: [...v.teams, { slots: [] }] })}
          >
            + team (phase)
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
                    ? 'Auto title (generated) — type to override'
                    : `Team title (optional${lang === 'en' ? '' : `, EN: ${t.title?.en ?? '—'}`})`
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
                ✕ team
              </button>
            </div>
            <SlotsBlock
              slots={t.slots}
              viewOf={viewOf}
              onChange={(slots) => setTeam(ti, { slots })}
            />
            <div>
              <p className="text-content-subtle mb-1 text-xs uppercase">
                Note ({lang}) — one paragraph per line
              </p>
              <InlineTextField
                value={itemsToBlock(t.notes ?? [], lang)}
                refs={refs}
                lang={lang}
                rows={4}
                layout="stacked"
                previewMode="list"
                placeholder="One paragraph per line…"
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
          + team
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
    { key: 'monster', label: 'Monster', content: monsterTab() },
    { key: 'tips', label: 'Tips', content: tipsTab() },
    ...(spec.notes ? [{ key: 'notes', label: 'Notes', content: notesTab() }] : []),
    { key: 'reco', label: 'Characters', content: recoTab() },
    ...(spec.teams !== 'none' ? [{ key: 'team', label: 'Team', content: teamTab() }] : []),
    ...(spec.videos ? [{ key: 'videos', label: 'Videos', content: videosTab() }] : []),
  ];

  return (
    <div className="space-y-6">
      <CharacterNameDatalist id={DATALIST_ID} options={charOptions} />

      {/* Langue + auto-traduction */}
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

      {/* Intro */}
      <section className="space-y-1.5">
        <p className={heading}>
          Guide intro
          {spec.versioned && (
            <span className="text-content-subtle font-normal"> (shared across all versions)</span>
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
              {i === 0 && <span className="text-content-subtle ml-1 text-[10px]">(recent)</span>}
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
            New version (YYYY-MM)
            <input
              className={`${input} mt-1 w-32`}
              placeholder="2026-08"
              value={newKey}
              onChange={(e) => setNewKey(e.target.value)}
            />
          </label>
          {versions.length > 0 ? (
            <label className="text-content-subtle text-xs">
              Duplicate from
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
          ) : (
            <span className="text-content-subtle text-xs">First version — blank.</span>
          )}
          <button
            type="button"
            className={btn}
            disabled={addBusy || !newKey.trim() || (versions.length > 0 && !fromKey)}
            onClick={confirmAddVersion}
          >
            {addBusy ? 'Creating…' : 'Create version'}
          </button>
          <button
            type="button"
            className="text-content-subtle text-sm hover:underline"
            onClick={() => setAdding(false)}
          >
            cancel
          </button>
        </div>
      )}

      {!v ? (
        <p className="text-content-subtle text-sm">No version — add one to start.</p>
      ) : (
        <EditorTabs tabs={tabs} />
      )}

      <div className="border-line-subtle flex items-center gap-3 border-t pt-4">
        <button type="button" className={btn} onClick={save} disabled={state === 'saving'}>
          {state === 'saving' ? 'Saving…' : 'Save guide'}
        </button>
        {state === 'saved' && <span className="text-success text-sm">✓ saved</span>}
        {(state === 'error' || error) && <span className="text-danger text-sm">{error}</span>}
      </div>
    </div>
  );
}
