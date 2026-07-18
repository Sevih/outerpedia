/* eslint-disable @next/next/no-img-element -- sprites dev (aperçu éditeur) */
'use client';

import { useState } from 'react';
import type { GearBuild, GearPick, SetCombo } from '@contracts';
import type { GearOption } from '@/lib/admin/gear-options';
import { postJson } from '@/lib/admin/post-json';
import { type Keyed, rowKey, stripKey, withKey } from '@/lib/admin/keyed';

const field =
  'w-full rounded-md border border-line bg-surface-base px-2 py-1 text-sm text-content focus:border-accent focus:outline-none';
const label = 'text-xs font-semibold uppercase tracking-wide text-content-subtle';
const btn = 'rounded border border-line px-2 py-0.5 text-xs text-content-subtle hover:text-content';

const sprite = (name: string) => `/api/admin/sprite/${encodeURIComponent(name)}`;

/**
 * Aperçu « à vue » de l'item sélectionné : sprite du jeu, badge `$` pour un
 * preset, ⚠ pour un id irrésolu, sinon un carré vide (rien de sélectionné).
 */
function IconChip({ id, options }: { id: string; options: GearOption[] }) {
  const box = 'h-8 w-8 shrink-0 rounded';
  if (id.startsWith('$'))
    return (
      <span
        className={`${box} bg-surface-raised text-content-subtle flex items-center justify-center text-xs font-semibold`}
      >
        $
      </span>
    );
  if (id.startsWith('!'))
    return (
      <span
        className={`${box} text-danger flex items-center justify-center text-xs`}
        title={id.slice(1)}
      >
        ⚠
      </span>
    );
  const icon = id ? options.find((o) => o.id === id)?.icon : undefined;
  if (!icon)
    return (
      <span className={`${box} bg-surface-raised/40 border-line-subtle border border-dashed`} />
    );
  return <img src={sprite(icon)} alt="" className={`${box} object-contain`} />;
}

/** Aperçu des sets d'un preset (une icône par set du combo). */
function SetPresetIcons({ icons }: { icons?: string[] }) {
  if (!icons?.length)
    return (
      <span className="bg-surface-raised/40 border-line-subtle h-8 w-8 shrink-0 rounded border border-dashed" />
    );
  return (
    <span className="flex shrink-0 items-center gap-0.5">
      {icons.map((icon, i) => (
        <img key={i} src={sprite(icon)} alt="" className="h-8 w-8 object-contain" />
      ))}
    </span>
  );
}

/** Options des sélecteurs (générées serveur : plus de fautes de frappe possibles). */
export interface GearRecoOptions {
  weapons: GearOption[];
  amulets: GearOption[];
  talismans: GearOption[];
  sets: GearOption[];
  /** Talismans avec leur CONTENU (pour convertir une saisie manuelle en preset). */
  presets: { talismans: Record<string, string[]>; sets: string[]; substats: string[] };
  /** Icônes des sets composant chaque preset de sets (aperçu « à vue »). */
  setPresetIcons?: Record<string, string[]>;
}

/** Si la liste manuelle d'ids égale un preset (même multiset), le référence. */
function toTalismanPreset(ids: string[], presets: Record<string, string[]>): string[] {
  if (!ids.length || ids.some((tl) => tl.startsWith('$'))) return ids;
  const key = [...ids].sort().join('|');
  for (const [slug, pIds] of Object.entries(presets)) {
    if ([...pIds].sort().join('|') === key) return [`$${slug}`];
  }
  return ids;
}

type Status = { kind: 'idle' | 'ok' | 'err'; msg?: string };

function ItemSelect({
  value,
  onChange,
  options,
  presets,
}: {
  value: string;
  onChange: (v: string) => void;
  options: GearOption[];
  presets?: string[];
}) {
  return (
    <select className={field} value={value} onChange={(e) => onChange(e.target.value)}>
      <option value="">—</option>
      {value.startsWith('!') && <option value={value}>⚠ {value.slice(1)} (irrésolu)</option>}
      {presets?.map((p) => (
        <option key={`$${p}`} value={`$${p}`}>
          $ {p}
        </option>
      ))}
      {options.map((o) => (
        <option key={o.id} value={o.id}>
          {o.label}
        </option>
      ))}
    </select>
  );
}

/** Éditeur des PICKS d'un slot (arme/amulette) : équipement + main stat. */
function PickList({
  title,
  picks,
  onChange,
  options,
}: {
  title: string;
  picks: GearPick[];
  onChange: (p: GearPick[]) => void;
  options: GearOption[];
}) {
  return (
    <div className="space-y-1">
      <p className={label}>{title}</p>
      {picks.map((p, i) => (
        <div key={i} className="flex items-center gap-1">
          <IconChip id={p.id} options={options} />
          <ItemSelect
            value={p.id}
            onChange={(id) => onChange(picks.map((x, j) => (j === i ? { ...x, id } : x)))}
            options={options}
          />
          <input
            className={`${field} w-28`}
            value={p.mainStat ?? ''}
            placeholder="main stat"
            onChange={(e) =>
              onChange(
                picks.map((x, j) =>
                  j === i ? { ...x, mainStat: e.target.value || undefined } : x,
                ),
              )
            }
          />
          <button
            type="button"
            className={btn}
            onClick={() => onChange(picks.filter((_, j) => j !== i))}
          >
            ✕
          </button>
        </div>
      ))}
      <button type="button" className={btn} onClick={() => onChange([...picks, { id: '' }])}>
        + ajouter
      </button>
    </div>
  );
}

/**
 * Éditeur des recos d'équipement d'un perso (NOUVEAU format curé) :
 * builds nommés, équipements choisis par SÉLECTEUR (ids V3), presets `$slug`,
 * substats (`$preset` ou chaîne « ATK>CHC=CHD »), note EN/FR (parse-text).
 * Zéro build + enregistrer = supprime l'entrée du perso.
 */
export function GearRecoEditor({
  charId,
  initial,
  options,
}: {
  charId: string;
  initial: GearBuild[];
  options: GearRecoOptions;
}) {
  const [builds, setBuilds] = useState<Keyed<GearBuild>[]>(() => initial.map(withKey));
  const [status, setStatus] = useState<Status>({ kind: 'idle' });

  const patch = (i: number, b: Partial<GearBuild>) =>
    setBuilds((all) => all.map((x, j) => (j === i ? { ...x, ...b } : x)));

  async function save() {
    setStatus({ kind: 'idle' });
    // Nettoyage : picks sans id et combos vides écartés ; une liste manuelle de
    // talismans identique à un preset est convertie en `$preset`.
    const clean = builds.map((b) => ({
      // `_key` est présentationnel : retiré avant sérialisation (spread `...b`).
      ...stripKey(b),
      weapons: b.weapons?.filter((p) => p.id),
      amulets: b.amulets?.filter((p) => p.id),
      talismans: b.talismans
        ? toTalismanPreset(b.talismans.filter(Boolean), options.presets.talismans)
        : undefined,
      sets: b.sets?.filter((c) => c.preset || c.pieces?.length),
    }));
    try {
      await postJson(`/api/admin/curated/gear-reco/${charId}`, clean);
      setStatus({ kind: 'ok', msg: 'Enregistré' });
    } catch (e) {
      setStatus({ kind: 'err', msg: (e as Error).message });
    }
  }

  return (
    <section className="space-y-4">
      <h2 className="text-content-strong text-xs font-semibold uppercase">
        Équipement recommandé (curé)
      </h2>

      {builds.map((b, i) => (
        <div key={b._key} className="border-line-subtle space-y-3 rounded-lg border p-3">
          <div className="flex items-center gap-2">
            <input
              className={`${field} max-w-60 font-semibold`}
              value={b.name}
              placeholder="Nom du build (Speed, PvP…)"
              onChange={(e) => patch(i, { name: e.target.value })}
            />
            <button
              type="button"
              className={btn}
              onClick={() =>
                setBuilds((all) => {
                  const copy = structuredClone(all[i]);
                  copy.name = `${copy.name} (copie)`;
                  copy._key = rowKey(); // clé neuve — sinon collision avec l'original
                  return [...all.slice(0, i + 1), copy, ...all.slice(i + 1)];
                })
              }
            >
              Dupliquer
            </button>
            <button
              type="button"
              className={btn}
              onClick={() => setBuilds((all) => all.filter((_, j) => j !== i))}
            >
              Supprimer le build
            </button>
          </div>

          <div className="grid gap-3 lg:grid-cols-2">
            <PickList
              title="Armes"
              picks={b.weapons ?? []}
              onChange={(weapons) => patch(i, { weapons })}
              options={options.weapons}
            />
            <PickList
              title="Amulettes"
              picks={b.amulets ?? []}
              onChange={(amulets) => patch(i, { amulets })}
              options={options.amulets}
            />

            <div className="space-y-1">
              <p className={label}>Talismans (ou preset $)</p>
              {(b.talismans ?? []).map((tl, ti) => (
                <div key={ti} className="flex items-center gap-1">
                  <IconChip id={tl} options={options.talismans} />
                  <ItemSelect
                    value={tl}
                    onChange={(v) =>
                      patch(i, { talismans: b.talismans!.map((x, j) => (j === ti ? v : x)) })
                    }
                    options={options.talismans}
                    presets={Object.keys(options.presets.talismans)}
                  />
                  <button
                    type="button"
                    className={btn}
                    onClick={() => patch(i, { talismans: b.talismans!.filter((_, j) => j !== ti) })}
                  >
                    ✕
                  </button>
                </div>
              ))}
              <button
                type="button"
                className={btn}
                onClick={() => patch(i, { talismans: [...(b.talismans ?? []), ''] })}
              >
                + ajouter
              </button>
            </div>

            <div className="space-y-1">
              <p className={label}>Combos de sets (preset $ ou pièces)</p>
              {(b.sets ?? []).map((c, ci) => (
                <div key={ci} className="flex items-center gap-1">
                  <SetPresetIcons
                    icons={c.preset ? options.setPresetIcons?.[c.preset] : undefined}
                  />
                  <select
                    className={`${field} w-32`}
                    value={c.preset ?? ''}
                    onChange={(e) =>
                      patch(i, {
                        sets: b.sets!.map((x, j): SetCombo =>
                          j === ci ? { preset: e.target.value || undefined, pieces: x.pieces } : x,
                        ),
                      })
                    }
                  >
                    <option value="">preset…</option>
                    {options.presets.sets.map((p) => (
                      <option key={p} value={p}>
                        $ {p}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    className={btn}
                    onClick={() => patch(i, { sets: b.sets!.filter((_, j) => j !== ci) })}
                  >
                    ✕
                  </button>
                </div>
              ))}
              <button
                type="button"
                className={btn}
                onClick={() => patch(i, { sets: [...(b.sets ?? []), {}] })}
              >
                + ajouter
              </button>
            </div>
          </div>

          <div className="grid gap-3 lg:grid-cols-2">
            <div className="space-y-1">
              <p className={label}>Substats ($preset ou « ATK&gt;CHC=CHD »)</p>
              <input
                className={field}
                list={`substat-presets-${charId}`}
                value={b.substats ?? ''}
                onChange={(e) => patch(i, { substats: e.target.value || undefined })}
              />
              <datalist id={`substat-presets-${charId}`}>
                {options.presets.substats.map((p) => (
                  <option key={p} value={`$${p}`} />
                ))}
              </datalist>
            </div>
            <div className="space-y-1">
              <p className={label}>Note (EN, tags parse-text OK)</p>
              <textarea
                className={`${field} h-14`}
                value={b.note?.en ?? ''}
                onChange={(e) =>
                  patch(i, {
                    note: e.target.value ? { ...b.note, en: e.target.value } : undefined,
                  })
                }
              />
            </div>
          </div>
        </div>
      ))}

      <div className="flex items-center gap-3">
        <button
          type="button"
          className={btn}
          onClick={() => setBuilds((all) => [...all, withKey({ name: `Build ${all.length + 1}` })])}
        >
          + Nouveau build
        </button>
        <button
          type="button"
          onClick={save}
          className="bg-accent text-accent-fg rounded-md px-4 py-1.5 text-sm font-semibold hover:opacity-90"
        >
          Enregistrer
        </button>
        {status.kind === 'ok' && <span className="text-success text-sm">{status.msg}</span>}
        {status.kind === 'err' && <span className="text-danger text-sm">{status.msg}</span>}
      </div>
    </section>
  );
}
