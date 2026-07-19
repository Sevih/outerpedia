'use client';

/* eslint-disable @next/next/no-img-element -- sprites/rangs dev */
import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { EffectIconTile, EffectPillShell } from '@/components/character/EffectChips';
import { renderGameColors } from '@/components/ui/GameText';
import type { EeChipMeta } from '@/lib/data/equipment-detail';
import type { EffectOption } from '@/components/admin/CharacterKitEditor';
import { img } from '@/lib/images';
import { postJson } from '@/lib/admin/post-json';

/** Rangs éditoriaux EE avec image (`IG_Event_Rank_*`). */
const RANKS = ['', 'S', 'A', 'B', 'C', 'D'];

const field =
  'w-full rounded-md border border-line bg-surface-base px-3 py-1.5 text-sm text-content focus:border-accent focus:outline-none';
const label = 'text-xs font-semibold uppercase tracking-wide text-content-subtle';

/** Sélecteur de rang + aperçu image (déblocage ou +10). */
function RankSelect({
  title,
  value,
  onChange,
}: {
  title: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="space-y-1">
      <p className={label}>{title}</p>
      <div className="flex items-center gap-2">
        <select
          className={`${field} w-auto`}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        >
          {/* Valeur héritée hors plage : préservée pour ne pas perdre la donnée. */}
          {value && !RANKS.includes(value) && <option value={value}>{value}</option>}
          {RANKS.map((r) => (
            <option key={r} value={r}>
              {r || '—'}
            </option>
          ))}
        </select>
        {value && <img src={img.rank(value)} alt={value} className="h-7 w-auto" />}
      </div>
    </div>
  );
}

/**
 * Éditeur curé d'un EE : priorité éditoriale (`rank` au déblocage / `rank10` au
 * +10) + câblage d'affichage des chips de passifs (× masque, + ajoute du
 * glossaire — carte UNIQUE, l'EE n'a qu'un jeu de passifs). Écrit la section
 * `ee` de `data/curated/equipment.json` via l'API dev, en un seul enregistrement.
 */
export function EeCuratedEditor({
  id,
  chips,
  catalog,
  initial,
}: {
  /** Id de personnage (= id d'EE). */
  id: string;
  /** Chips AUTO de l'EE (positions règles pures), à masquer. */
  chips: EeChipMeta[];
  /** Glossaire (id → méta) pour le bouton + et les réfs actuelles. */
  catalog: Record<string, EffectOption>;
  initial: { rank?: string; rank10?: string; chipHide?: string[]; chipAdd?: string[] };
}) {
  const router = useRouter();
  const [rank, setRank] = useState(initial.rank ?? '');
  const [rank10, setRank10] = useState(initial.rank10 ?? '');
  const [hides, setHides] = useState<string[]>(initial.chipHide ?? []);
  const [adds, setAdds] = useState<string[]>(initial.chipAdd ?? []);
  const [adding, setAdding] = useState(false);
  const [addQuery, setAddQuery] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const norm = (l: string[]) => JSON.stringify([...l].sort());
  const dirty =
    rank !== (initial.rank ?? '') ||
    rank10 !== (initial.rank10 ?? '') ||
    norm(hides) !== norm(initial.chipHide ?? []) ||
    norm(adds) !== norm(initial.chipAdd ?? []);

  // Libellés de recherche uniques (homonymes suffixés) — même règle que
  // l'éditeur de câblage perso/monstre.
  const options = useMemo(() => {
    const counts = new Map<string, number>();
    for (const o of Object.values(catalog)) {
      const k = o.name.toLowerCase();
      counts.set(k, (counts.get(k) ?? 0) + 1);
    }
    const seen = new Set<string>();
    return Object.values(catalog).map((o) => {
      let l = o.name;
      if ((counts.get(o.name.toLowerCase()) ?? 0) > 1) {
        const tags = [o.irremovable ? 'irremovable' : null, o.isDebuff ? 'debuff' : 'buff'].filter(
          (t): t is string => Boolean(t),
        );
        l = `${o.name} (${tags.join(', ')})`;
      }
      if (seen.has(l.toLowerCase())) l = `${l} [${o.id}]`;
      seen.add(l.toLowerCase());
      return { id: o.id, label: l };
    });
  }, [catalog]);
  const byName = useMemo(
    () => new Map(options.map((o) => [o.label.toLowerCase(), o.id])),
    [options],
  );

  const isHidden = (ref: string) => hides.includes(ref);
  const toggleHide = (ref: string, on: boolean) =>
    setHides((prev) => (on ? [...new Set([...prev, ref])] : prev.filter((r) => r !== ref)));

  const confirmAdd = () => {
    const q = addQuery.trim();
    const eid = catalog[q] ? q : byName.get(q.toLowerCase());
    if (!eid) {
      setMessage(`“${q}” : effect unknown to the glossary.`);
      return;
    }
    setAdds((prev) => [...new Set([...prev, eid])]);
    setAdding(false);
    setAddQuery('');
    setMessage(null);
  };
  const removeAdd = (ref: string) => setAdds((prev) => prev.filter((r) => r !== ref));

  const save = async () => {
    setBusy(true);
    setMessage(null);
    try {
      const json = await postJson<{ ok: boolean; errors?: string[] }>(
        `/api/admin/curated/ee/${id}`,
        { rank, rank10, chipHide: hides, chipAdd: adds },
      );
      if (!json.ok) {
        setMessage(`Error: ${(json.errors ?? ['unknown']).join(' ; ')}`);
        return;
      }
      setMessage('Saved — data/curated/equipment.json (commit via git).');
      router.refresh();
    } catch (e) {
      setMessage(`Error: ${(e as Error).message}`);
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-content-strong text-xs font-semibold uppercase">EE curation</h2>
        <div className="flex items-center gap-3">
          {message && <span className="text-content-subtle text-xs">{message}</span>}
          <button
            type="button"
            onClick={save}
            disabled={busy || !dirty}
            className="bg-accent text-accent-fg rounded-md px-3 py-1.5 text-sm font-medium disabled:opacity-50"
          >
            {busy ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>

      {/* Priorité éditoriale (tier list EE) */}
      <section className="grid gap-4 sm:grid-cols-2">
        <RankSelect title="Rank at unlock" value={rank} onChange={setRank} />
        <RankSelect title="Rank at +10" value={rank10} onChange={setRank10} />
      </section>

      {/* Câblage des chips de passifs (carte unique) */}
      <section className="space-y-2">
        <p className={label}>Passive buffs / debuffs</p>
        <p className="text-content-subtle text-xs">
          × hides a chip (chipHide) · + adds an effect from the glossary (chipAdd).
        </p>
        <datalist id="ee-kit-effects">
          {options.map((o) => (
            <option key={o.id} value={o.label} />
          ))}
        </datalist>
        <div className="border-line-subtle flex flex-wrap items-center gap-1.5 rounded-lg border p-3">
          {chips.length === 0 && adds.length === 0 && (
            <span className="text-content-subtle text-xs">No auto chip.</span>
          )}
          {chips.map((c) =>
            isHidden(c.ref) ? (
              <span
                key={`hidden-${c.ref}`}
                title={`${c.ref} — hidden (chipHide)`}
                className="border-line flex items-center gap-1 rounded-md border border-dashed py-0.5 pr-1 pl-1 opacity-50"
              >
                <span className="text-content-subtle text-[11px] font-semibold line-through">
                  {c.name}
                </span>
                <button
                  type="button"
                  onClick={() => toggleHide(c.ref, false)}
                  title="Restore the chip"
                  className="text-content-subtle hover:text-content ml-0.5 rounded px-0.5 text-[11px] leading-none"
                >
                  ↺
                </button>
              </span>
            ) : (
              <span key={c.ref} title={c.ref}>
                <EffectPillShell icon={c.icon} name={c.name} isDebuff={c.isDebuff}>
                  <button
                    type="button"
                    onClick={() => toggleHide(c.ref, true)}
                    title="Hide (chipHide)"
                    className="ml-0.5 rounded px-0.5 text-[11px] leading-none opacity-60 hover:opacity-100"
                  >
                    ✕
                  </button>
                </EffectPillShell>
              </span>
            ),
          )}
          {adds.map((ref) => {
            const o = catalog[ref];
            return (
              <span
                key={`add-${ref}`}
                title={`chipAdd ${ref}`}
                className="ring-accent/60 rounded-md ring-1"
              >
                <EffectPillShell
                  icon={o?.icon}
                  name={o?.name ?? ref}
                  isDebuff={o?.isDebuff ?? false}
                >
                  <button
                    type="button"
                    onClick={() => removeAdd(ref)}
                    title="Remove (chipAdd)"
                    className="ml-0.5 rounded px-0.5 text-[11px] leading-none opacity-60 hover:opacity-100"
                  >
                    ✕
                  </button>
                </EffectPillShell>
              </span>
            );
          })}
          {adding ? (
            <span className="flex items-center gap-1">
              <input
                autoFocus
                list="ee-kit-effects"
                value={addQuery}
                onChange={(e) => setAddQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') confirmAdd();
                  if (e.key === 'Escape') setAdding(false);
                }}
                placeholder="Effect name or tooltip ref…"
                className="border-line bg-surface-base text-content w-52 rounded-md border px-2 py-0.5 text-xs"
              />
              <button
                type="button"
                onClick={confirmAdd}
                className="bg-accent text-accent-fg rounded px-1.5 py-0.5 text-xs"
              >
                OK
              </button>
              <button
                type="button"
                onClick={() => setAdding(false)}
                className="text-content-subtle hover:text-content px-1 text-xs"
              >
                cancel
              </button>
            </span>
          ) : (
            <button
              type="button"
              onClick={() => {
                setAdding(true);
                setAddQuery('');
              }}
              title="Add an effect (chipAdd)"
              className="border-line text-content-subtle hover:text-content-strong hover:border-line-strong rounded-md border border-dashed px-1.5 py-0.5 text-xs"
            >
              +
            </button>
          )}
        </div>

        {/* Aide-mémoire : descriptions des effets affichés (chips + ajouts). */}
        {(() => {
          const items = [
            ...chips
              .filter((c) => !isHidden(c.ref))
              .map((c) => ({
                key: c.ref,
                name: c.name,
                icon: c.icon,
                isDebuff: c.isDebuff,
                desc: c.desc,
              })),
            ...adds
              .map((ref) => catalog[ref])
              .filter((o): o is EffectOption => Boolean(o))
              .map((o) => ({
                key: o.id,
                name: o.name,
                icon: o.icon,
                isDebuff: o.isDebuff,
                desc: o.desc,
              })),
          ].filter((e) => e.desc);
          if (!items.length) return null;
          return (
            <div className="border-line-subtle space-y-1.5 rounded-lg border p-3">
              {items.map((e) => (
                <div key={e.key} className="flex items-start gap-2">
                  {e.icon && (
                    <EffectIconTile
                      icon={e.icon}
                      isDebuff={e.isDebuff}
                      className="h-5 w-5 shrink-0"
                    />
                  )}
                  <p className="min-w-0 text-xs">
                    <span
                      className={
                        e.isDebuff ? 'text-debuff font-semibold' : 'text-buff font-semibold'
                      }
                    >
                      {e.name}
                    </span>
                    <span className="text-content-subtle whitespace-pre-line">
                      {' — '}
                      {renderGameColors((e.desc ?? '').replace(/\\n/g, '\n'))}
                    </span>
                  </p>
                </div>
              ))}
            </div>
          );
        })()}
      </section>
    </section>
  );
}
