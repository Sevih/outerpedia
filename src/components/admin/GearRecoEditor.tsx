'use client';

/**
 * Éditeur des recos d'équipement d'un perso — SURFACE UNIFIÉE : le rendu est le
 * VRAI `GearRecoSection` (tuiles 6★, onglets), et chaque tuile est cliquable pour
 * ouvrir son éditeur inline. On travaille en PIÈCES (presets dépliés côté page,
 * recompressés côté save) → mapping 1:1 tuile ↔ pick. La résolution (icônes,
 * noms) vient d'une server action debouncée ; l'édition mute le brut.
 */
import { useEffect, useMemo, useState } from 'react';
import type { GearBuild, GearPick, SetCombo } from '@contracts';
import type { GearOption } from '@/lib/admin/gear-options';
import { postJson } from '@/lib/admin/post-json';
import { type Keyed, rowKey, stripKey, withKey } from '@/lib/admin/keyed';
import { InlineTextField } from '@/components/admin/InlineTextField';
import {
  SlotCard,
  Row,
  ItemRow,
  SubstatPrioBar,
  type GearItem,
} from '@/components/character/GearRecoSection';
import type { InlineRefs } from '@/lib/admin/inline-refs';
import { autoTranslate } from '@/lib/admin/translate-actions';
import {
  previewGearReco,
  listImportableBuilds,
  type PreviewBuild,
  type ImportableChar,
} from '@/lib/admin/gear-preview-actions';

const NOTE_LANGS = ['en', 'jp', 'kr', 'zh', 'fr'] as const;
type NoteLang = (typeof NOTE_LANGS)[number];

const field =
  'w-full rounded-md border border-line bg-surface-base px-2 py-1 text-sm text-content focus:border-accent focus:outline-none';
const label = 'text-xs font-semibold uppercase tracking-wide text-content-subtle';
const btn = 'rounded border border-line px-2 py-0.5 text-xs text-content-subtle hover:text-content';

/** Options des sélecteurs (générées serveur : plus de fautes de frappe possibles). */
export interface GearRecoOptions {
  weapons: GearOption[];
  amulets: GearOption[];
  talismans: GearOption[];
  sets: GearOption[];
  /** Contenu des presets (dépliage déjà fait côté page ; ici pour info/labels). */
  presets: { talismans: Record<string, string[]>; sets: string[]; substats: string[] };
  setPresetIcons?: Record<string, string[]>;
}

type Status = { kind: 'idle' | 'ok' | 'err'; msg?: string };
type EditKey = { slot: 'weapons' | 'amulets' | 'talismans'; index: number } | null;

/** Select d'un équipement (option filtrée + valeur hors-classe réinjectée). */
function ItemSelect({
  value,
  onChange,
  options,
  allOptions,
}: {
  value: string;
  onChange: (v: string) => void;
  options: GearOption[];
  allOptions?: GearOption[];
}) {
  const missing =
    value && !value.startsWith('!') && !options.some((o) => o.id === value)
      ? (allOptions ?? options).find((o) => o.id === value)
      : undefined;
  return (
    <select className={field} value={value} onChange={(e) => onChange(e.target.value)}>
      <option value="">—</option>
      {value.startsWith('!') && <option value={value}>⚠ {value.slice(1)} (irrésolu)</option>}
      {missing && <option value={missing.id}>{missing.label} (hors classe)</option>}
      {options.map((o) => (
        <option key={o.id} value={o.id}>
          {o.label}
        </option>
      ))}
    </select>
  );
}

/** Multi-select de main stats (puces) — stocké joint par « / ». */
function MainStatPicker({
  value,
  available,
  onChange,
}: {
  value?: string;
  available: string[];
  onChange: (v: string | undefined) => void;
}) {
  const selected = value
    ? value
        .split('/')
        .map((s) => s.trim())
        .filter(Boolean)
    : [];
  const set = (next: string[]) => onChange(next.length ? next.join('/') : undefined);
  const toggle = (s: string) =>
    set(selected.includes(s) ? selected.filter((x) => x !== s) : [...selected, s]);
  const extras = selected.filter((s) => !available.includes(s));
  if (!available.length && !selected.length)
    return <span className="text-content-subtle px-1 text-[11px]">choisir l’équipement</span>;
  return (
    <div className="flex flex-wrap items-center gap-1">
      {available.map((s) => (
        <button
          key={s}
          type="button"
          onClick={() => toggle(s)}
          className={`rounded border px-1.5 py-0.5 text-[11px] ${
            selected.includes(s)
              ? 'border-accent text-accent'
              : 'border-line-subtle text-content-subtle hover:text-content'
          }`}
        >
          {s}
        </button>
      ))}
      {extras.map((s) => (
        <button
          key={s}
          type="button"
          onClick={() => toggle(s)}
          title="Valeur hors pool — cliquer pour retirer"
          className="border-danger/50 text-danger rounded border px-1.5 py-0.5 text-[11px]"
        >
          {s} ✕
        </button>
      ))}
    </div>
  );
}

/** Tuile placeholder (pick vide / non résolu) — invite à choisir. */
function EmptyTile({ text = '＋ choisir' }: { text?: string }) {
  return (
    <div className="border-line-subtle text-content-subtle flex h-13 items-center gap-2 rounded border border-dashed px-3 text-xs">
      {text}
    </div>
  );
}

export function GearRecoEditor({
  charId,
  charClass,
  initial,
  options,
  refs,
}: {
  charId: string;
  charClass: string;
  initial: GearBuild[];
  options: GearRecoOptions;
  refs: InlineRefs;
}) {
  const [builds, setBuilds] = useState<Keyed<GearBuild>[]>(() => initial.map(withKey));
  const [active, setActive] = useState(0);
  const [editing, setEditing] = useState<EditKey>(null);
  const [noteLang, setNoteLang] = useState<NoteLang>('en');
  const [status, setStatus] = useState<Status>({ kind: 'idle' });
  const [trans, setTrans] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');
  const [transMsg, setTransMsg] = useState<string | null>(null);
  const [resolved, setResolved] = useState<{
    builds: PreviewBuild[];
    labels: import('@/components/character/GearRecoSection').GearRecoLabels;
  } | null>(null);
  const [importOpen, setImportOpen] = useState(false);
  const [importList, setImportList] = useState<ImportableChar[] | null>(null);
  const [importChar, setImportChar] = useState('');

  const inClass = (o: GearOption) => !o.classLimits?.length || o.classLimits.includes(charClass);
  const weaponOpts = options.weapons.filter(inClass);
  const amuletOpts = options.amulets.filter(inClass);
  const mainStatsOf = (all: GearOption[], id: string) =>
    all.find((o) => o.id === id)?.mainStats ?? [];

  const ai = Math.min(active, Math.max(0, builds.length - 1));
  const patch = (b: Partial<GearBuild>) =>
    setBuilds((all) => all.map((x, j) => (j === ai ? { ...x, ...b } : x)));

  // Brut aligné pour la RÉSOLUTION (pas de filtrage → indices 1:1 avec les tuiles).
  const forPreview = useMemo<GearBuild[]>(() => builds.map((b) => stripKey(b)), [builds]);
  // Brut nettoyé pour l'ENREGISTREMENT (picks vides et combos vides écartés).
  const forSave = useMemo<GearBuild[]>(
    () =>
      builds.map((b) => ({
        ...stripKey(b),
        weapons: b.weapons?.filter((p) => p.id),
        amulets: b.amulets?.filter((p) => p.id),
        talismans: b.talismans?.filter(Boolean),
        sets: b.sets?.filter((c) => c.preset || c.pieces?.length),
      })),
    [builds],
  );

  // Résolution debouncée (icônes/noms via la vraie donnée) pour l'affichage.
  useEffect(() => {
    let cancelled = false;
    const h = setTimeout(async () => {
      try {
        const res = await previewGearReco(forPreview, noteLang);
        if (!cancelled) setResolved(res);
      } catch {
        /* silencieux */
      }
    }, 250);
    return () => {
      cancelled = true;
      clearTimeout(h);
    };
  }, [forPreview, noteLang]);

  const build = builds[ai] as Keyed<GearBuild> | undefined;
  const rb = resolved?.builds[ai];
  const labels = resolved?.labels;
  const srcLabel = { source: labels?.source ?? '' };
  const resItem = (slot: 'weapons' | 'amulets' | 'talismans', i: number): GearItem | undefined =>
    rb?.[slot]?.[i];

  // --- Mutations d'un slot de picks (armes/amulettes) --------------------------
  const setPicks = (slot: 'weapons' | 'amulets', next: GearPick[]) => patch({ [slot]: next });
  const setTalismans = (next: string[]) => patch({ talismans: next });
  const setSets = (next: SetCombo[]) => patch({ sets: next });

  const isEditing = (
    slot: EditKey extends null ? never : NonNullable<EditKey>['slot'],
    i: number,
  ) => editing?.slot === slot && editing.index === i;
  const toggleEdit = (slot: NonNullable<EditKey>['slot'], i: number) =>
    setEditing((cur) => (cur && cur.slot === slot && cur.index === i ? null : { slot, index: i }));

  // --- Import ------------------------------------------------------------------
  async function openImport() {
    setImportOpen(true);
    if (!importList) {
      try {
        setImportList(await listImportableBuilds(charId));
      } catch {
        setImportList([]);
      }
    }
  }
  function importBuild(b: GearBuild) {
    setBuilds((all) => [...all, withKey(structuredClone(b))]);
    setActive(builds.length);
    setImportOpen(false);
  }

  // --- Traduction des notes ----------------------------------------------------
  async function translateNotes() {
    setTrans('loading');
    setTransMsg(null);
    const tgt = NOTE_LANGS.filter((l) => l !== 'en');
    const jobs: { i: number; en: string }[] = [];
    builds.forEach((b, i) => b.note?.en?.trim() && jobs.push({ i, en: b.note.en }));
    if (!jobs.length) {
      setTrans('done');
      setTransMsg('Rien à traduire (aucune note EN).');
      return;
    }
    try {
      const { results, provider } = await autoTranslate(
        jobs.map((j) => j.en),
        tgt,
      );
      const next = builds.slice();
      let filled = 0;
      jobs.forEach((job, k) => {
        const tr = results[k] ?? {};
        const note: NonNullable<GearBuild['note']> = { ...(next[job.i].note ?? {}) };
        for (const l of tgt) {
          if (tr[l] && !note[l]?.trim()) {
            note[l] = tr[l];
            filled++;
          }
        }
        next[job.i] = { ...next[job.i], note };
      });
      setBuilds(next);
      setTrans('done');
      setTransMsg(
        filled
          ? `${filled} note(s) via ${provider === 'haiku' ? 'Haiku (quota DeepL atteint)' : 'DeepL'} — à revoir.`
          : 'Notes déjà remplies.',
      );
    } catch (e) {
      setTrans('error');
      setTransMsg((e as Error).message);
    }
  }

  async function save() {
    setStatus({ kind: 'idle' });
    try {
      await postJson(`/api/admin/curated/gear-reco/${charId}`, forSave);
      setStatus({ kind: 'ok', msg: 'Enregistré' });
    } catch (e) {
      setStatus({ kind: 'err', msg: (e as Error).message });
    }
  }

  // --- Rendu d'un slot de picks (armes/amulettes) ------------------------------
  function pickSlot(
    slot: 'weapons' | 'amulets',
    title: string,
    picks: GearPick[],
    opts: GearOption[],
    allOpts: GearOption[],
  ) {
    return (
      <SlotCard label={title}>
        {picks.map((p, i) => {
          const it = resItem(slot, i);
          return (
            <Row key={i}>
              <div className="flex items-start gap-1">
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => toggleEdit(slot, i)}
                  onKeyDown={(e) => e.key === 'Enter' && toggleEdit(slot, i)}
                  className="flex-1 cursor-pointer text-left"
                >
                  {p.id && it && !it.unresolved ? (
                    <ItemRow item={it} labels={srcLabel} noLink />
                  ) : (
                    <EmptyTile />
                  )}
                </div>
                <button
                  type="button"
                  className={`${btn} text-danger`}
                  title="Retirer"
                  onClick={() => {
                    setPicks(
                      slot,
                      picks.filter((_, j) => j !== i),
                    );
                    setEditing(null);
                  }}
                >
                  ✕
                </button>
              </div>
              {isEditing(slot, i) && (
                <div className="border-line-subtle mt-2 space-y-2 rounded border p-2">
                  <ItemSelect
                    value={p.id}
                    onChange={(id) =>
                      setPicks(
                        slot,
                        picks.map((x, j) => (j === i ? { ...x, id } : x)),
                      )
                    }
                    options={opts}
                    allOptions={allOpts}
                  />
                  <MainStatPicker
                    value={p.mainStat}
                    available={mainStatsOf(allOpts, p.id)}
                    onChange={(mainStat) =>
                      setPicks(
                        slot,
                        picks.map((x, j) => (j === i ? { ...x, mainStat } : x)),
                      )
                    }
                  />
                </div>
              )}
            </Row>
          );
        })}
        <button
          type="button"
          className={`${btn} mt-1`}
          onClick={() => {
            setPicks(slot, [...picks, { id: '' }]);
            setEditing({ slot, index: picks.length });
          }}
        >
          ＋ ajouter
        </button>
      </SlotCard>
    );
  }

  return (
    <section className="space-y-4">
      <h2 className="text-content-strong text-xs font-semibold uppercase">
        Équipement recommandé (curé)
      </h2>

      {/* Onglets de builds + actions */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="border-line flex flex-wrap gap-1 rounded-lg border p-1">
          {builds.map((b, i) => (
            <button
              key={b._key}
              type="button"
              onClick={() => {
                setActive(i);
                setEditing(null);
              }}
              className={`rounded-md px-3 py-1 text-sm ${
                i === ai
                  ? 'bg-accent/20 text-accent font-semibold'
                  : 'text-content-muted hover:bg-surface-overlay'
              }`}
            >
              {b.name || `Build ${i + 1}`}
            </button>
          ))}
        </div>
        <button
          type="button"
          className={btn}
          onClick={() => {
            setBuilds((all) => [...all, withKey({ name: `Build ${all.length + 1}` })]);
            setActive(builds.length);
          }}
        >
          ＋ build
        </button>
        <button type="button" className={btn} onClick={openImport}>
          Importer…
        </button>
      </div>

      {/* Popover d'import */}
      {importOpen && (
        <div className="border-line bg-surface-raised space-y-2 rounded-md border p-3">
          <div className="flex items-center gap-2">
            <select
              className={`${field} max-w-60`}
              value={importChar}
              onChange={(e) => setImportChar(e.target.value)}
            >
              <option value="">{importList ? 'Choisir un perso…' : 'Chargement…'}</option>
              {importList?.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            <button type="button" className={btn} onClick={() => setImportOpen(false)}>
              Fermer
            </button>
          </div>
          {importChar &&
            importList
              ?.find((c) => c.id === importChar)
              ?.builds.map((b, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="text-content text-sm">{b.name || `Build ${i + 1}`}</span>
                  <button type="button" className={btn} onClick={() => importBuild(b)}>
                    Importer ce build
                  </button>
                </div>
              ))}
        </div>
      )}

      {!build ? (
        <p className="text-content-subtle text-sm">Aucun build. Ajoute-en un.</p>
      ) : (
        <div className="border-line-subtle space-y-4 rounded-lg border p-3">
          {/* Nom + actions du build actif */}
          <div className="flex flex-wrap items-center gap-2">
            <input
              className={`${field} max-w-60 font-semibold`}
              value={build.name}
              placeholder="Nom du build (Speed, PvP…)"
              onChange={(e) => patch({ name: e.target.value })}
            />
            <button
              type="button"
              className={btn}
              onClick={() =>
                setBuilds((all) => {
                  const copy = structuredClone(all[ai]);
                  copy.name = `${copy.name} (copie)`;
                  copy._key = rowKey();
                  return [...all.slice(0, ai + 1), copy, ...all.slice(ai + 1)];
                })
              }
            >
              Dupliquer
            </button>
            <button
              type="button"
              className={`${btn} text-danger`}
              onClick={() => {
                setBuilds((all) => all.filter((_, j) => j !== ai));
                setActive(0);
                setEditing(null);
              }}
            >
              Supprimer le build
            </button>
          </div>

          {/* Grille de slots — tuiles cliquables */}
          <div className="grid gap-3 sm:grid-cols-2">
            {pickSlot('weapons', 'Armes', build.weapons ?? [], weaponOpts, options.weapons)}
            {pickSlot('amulets', 'Amulettes', build.amulets ?? [], amuletOpts, options.amulets)}

            {/* Talismans */}
            <SlotCard label="Talismans">
              {(build.talismans ?? []).map((tl, i) => {
                const it = resItem('talismans', i);
                return (
                  <Row key={i}>
                    <div className="flex items-start gap-1">
                      <div
                        role="button"
                        tabIndex={0}
                        onClick={() => toggleEdit('talismans', i)}
                        onKeyDown={(e) => e.key === 'Enter' && toggleEdit('talismans', i)}
                        className="flex-1 cursor-pointer text-left"
                      >
                        {tl && it && !it.unresolved ? (
                          <ItemRow item={it} labels={srcLabel} noLink />
                        ) : (
                          <EmptyTile />
                        )}
                      </div>
                      <button
                        type="button"
                        className={`${btn} text-danger`}
                        title="Retirer"
                        onClick={() => {
                          setTalismans((build.talismans ?? []).filter((_, j) => j !== i));
                          setEditing(null);
                        }}
                      >
                        ✕
                      </button>
                    </div>
                    {isEditing('talismans', i) && (
                      <div className="border-line-subtle mt-2 space-y-2 rounded border p-2">
                        <ItemSelect
                          value={tl}
                          onChange={(v) =>
                            setTalismans((build.talismans ?? []).map((x, j) => (j === i ? v : x)))
                          }
                          options={options.talismans}
                        />
                      </div>
                    )}
                  </Row>
                );
              })}
              <button
                type="button"
                className={`${btn} mt-1`}
                onClick={() => {
                  setTalismans([...(build.talismans ?? []), '']);
                  setEditing({ slot: 'talismans', index: (build.talismans ?? []).length });
                }}
              >
                ＋ ajouter
              </button>
            </SlotCard>

            {/* Sets — combos de pièces {set, count} */}
            <SlotCard label="Sets" accentBg>
              {(build.sets ?? []).map((combo, ci) => (
                <Row key={ci}>
                  <div className="space-y-1.5">
                    {(combo.pieces ?? []).map((pc, pi) => (
                      <div key={pi} className="flex items-center gap-1">
                        <select
                          className={field}
                          value={pc.set}
                          onChange={(e) =>
                            setSets(
                              (build.sets ?? []).map((c, j) =>
                                j === ci
                                  ? {
                                      pieces: (c.pieces ?? []).map((x, k) =>
                                        k === pi ? { ...x, set: e.target.value } : x,
                                      ),
                                    }
                                  : c,
                              ),
                            )
                          }
                        >
                          <option value="">set…</option>
                          {options.sets.map((o) => (
                            <option key={o.id} value={o.id}>
                              {o.label}
                            </option>
                          ))}
                        </select>
                        <select
                          className={`${field} w-16`}
                          value={pc.count}
                          onChange={(e) =>
                            setSets(
                              (build.sets ?? []).map((c, j) =>
                                j === ci
                                  ? {
                                      pieces: (c.pieces ?? []).map((x, k) =>
                                        k === pi ? { ...x, count: Number(e.target.value) } : x,
                                      ),
                                    }
                                  : c,
                              ),
                            )
                          }
                        >
                          {[2, 4].map((n) => (
                            <option key={n} value={n}>
                              {n}p
                            </option>
                          ))}
                        </select>
                        <button
                          type="button"
                          className={`${btn} text-danger`}
                          onClick={() =>
                            setSets(
                              (build.sets ?? []).map((c, j) =>
                                j === ci
                                  ? { pieces: (c.pieces ?? []).filter((_, k) => k !== pi) }
                                  : c,
                              ),
                            )
                          }
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                    <div className="flex gap-1">
                      <button
                        type="button"
                        className={btn}
                        onClick={() =>
                          setSets(
                            (build.sets ?? []).map((c, j) =>
                              j === ci
                                ? { pieces: [...(c.pieces ?? []), { set: '', count: 2 }] }
                                : c,
                            ),
                          )
                        }
                      >
                        ＋ pièce
                      </button>
                      <button
                        type="button"
                        className={`${btn} text-danger`}
                        onClick={() => setSets((build.sets ?? []).filter((_, j) => j !== ci))}
                      >
                        Retirer le combo
                      </button>
                    </div>
                  </div>
                </Row>
              ))}
              <button
                type="button"
                className={`${btn} mt-1`}
                onClick={() =>
                  setSets([...(build.sets ?? []), { pieces: [{ set: '', count: 2 }] }])
                }
              >
                ＋ combo
              </button>
            </SlotCard>
          </div>

          {/* Substats */}
          <div className="space-y-1">
            <p className={label}>Substats (priorité « ATK&gt;CHC=CHD&gt;SPD »)</p>
            {build.substats && <SubstatPrioBar prio={build.substats} />}
            <input
              className={field}
              value={build.substats ?? ''}
              placeholder="ATK>CHC=CHD>SPD"
              onChange={(e) => patch({ substats: e.target.value || undefined })}
            />
          </div>

          {/* Note */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <p className={label}>Note ({noteLang})</p>
              <div className="border-line flex overflow-hidden rounded-md border">
                {NOTE_LANGS.map((l) => (
                  <button
                    key={l}
                    type="button"
                    onClick={() => setNoteLang(l)}
                    className={`px-2 py-0.5 text-[11px] ${l === noteLang ? 'bg-accent/20 text-accent' : 'text-content-muted hover:bg-surface-overlay'}`}
                  >
                    {l}
                  </button>
                ))}
              </div>
            </div>
            <InlineTextField
              value={build.note?.[noteLang] ?? ''}
              refs={refs}
              lang={noteLang}
              placeholder={noteLang === 'en' ? '' : (build.note?.en ?? '')}
              onChange={(v) => {
                const note = { ...(build.note ?? {}), [noteLang]: v };
                if (!v) delete note[noteLang];
                patch({ note: Object.keys(note).length ? note : undefined });
              }}
            />
          </div>
        </div>
      )}

      {/* Actions globales */}
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          className={btn}
          onClick={translateNotes}
          disabled={trans === 'loading'}
          title="Traduit les notes EN vers les langues encore vides"
        >
          {trans === 'loading' ? 'Traduction…' : 'Traduire notes (EN → vides)'}
        </button>
        <button
          type="button"
          onClick={save}
          className="bg-accent text-accent-fg rounded-md px-4 py-1.5 text-sm font-semibold hover:opacity-90"
        >
          Enregistrer
        </button>
        {transMsg && (
          <span className={`text-sm ${trans === 'error' ? 'text-danger' : 'text-content-subtle'}`}>
            {transMsg}
          </span>
        )}
        {status.kind === 'ok' && <span className="text-success text-sm">{status.msg}</span>}
        {status.kind === 'err' && <span className="text-danger text-sm">{status.msg}</span>}
      </div>
    </section>
  );
}
