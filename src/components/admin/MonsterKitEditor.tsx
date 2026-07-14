'use client';

/* eslint-disable @next/next/no-img-element -- sprites dev */
import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { EffectPillShell } from '@/components/character/EffectChips';
import { renderGameColors } from '@/components/ui/GameText';

/** Un buff CHIPABLE du kit, selon les tables. */
export interface KitChip {
  buff: string;
  /** Skill PORTEUR selon les tables (cible par défaut de chipHide). */
  carrier: string;
  name: string;
  icon?: string;
  isDebuff: boolean;
  /** Cartes où la chip s'affiche sous les RÈGLES SEULES (caller/desc-réf). */
  defaultCards: string[];
  /** chipOwner posé pour CE kit (null = règles). */
  owner: string | null;
  /** Cartes où la chip est masquée (chipHide). */
  hiddenOn: string[];
}

export interface KitEditorSkill {
  id: string;
  name: string;
  type: string;
  desc?: string;
  iconSrc?: string;
}

/** Effet du glossaire proposable en chipAdd. */
export interface EffectOption {
  id: string;
  name: string;
  icon?: string;
  isDebuff: boolean;
  /** Variante indissipable (effet DISTINCT de la version normale). */
  irremovable?: boolean;
}

/**
 * Éditeur du CÂBLAGE d'affichage d'un kit monstre, rendu comme l'extracteur
 * (cartes de skills + chips) mais interactif : glisser une chip sur une autre
 * carte = chipOwner ; × = chipHide sur la carte ; + = chipAdd par réf
 * d'effet du glossaire. Écrit `data/curated/monster-skills.json` via l'API
 * dev — présentation seule, la donnée extraite reste fidèle aux tables.
 */
export function MonsterKitEditor({
  skills,
  chips: initialChips,
  chipAdd: initialAdd,
  catalog,
}: {
  skills: KitEditorSkill[];
  chips: KitChip[];
  /** Réfs tooltip ajoutées par carte (état curé actuel). */
  chipAdd: Record<string, string[]>;
  /** Effets du glossaire (id → méta) pour le bouton + et les réfs actuelles. */
  catalog: Record<string, EffectOption>;
}) {
  const router = useRouter();
  const [chips, setChips] = useState<KitChip[]>(initialChips);
  const [adds, setAdds] = useState<Record<string, string[]>>(() => ({
    ...Object.fromEntries(skills.map((s) => [s.id, [] as string[]])),
    ...initialAdd,
  }));
  const [adding, setAdding] = useState<string | null>(null);
  const [addQuery, setAddQuery] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  // Modifié ? Comparaison sur la forme normalisée (listes vides écartées).
  const normAdds = (a: Record<string, string[]>) =>
    JSON.stringify(
      Object.entries(a)
        .filter(([, l]) => l.length)
        .sort(([x], [y]) => x.localeCompare(y)),
    );
  const dirty =
    JSON.stringify(chips) !== JSON.stringify(initialChips) ||
    normAdds(adds) !== normAdds(initialAdd);

  /** Cartes où une chip s'affiche dans l'ÉTAT ÉDITÉ courant. */
  const displayCards = (c: KitChip): string[] =>
    (c.owner ? [c.owner] : c.defaultCards).filter((id) => !c.hiddenOn.includes(id));

  // Libellés de recherche UNIQUES : des effets DISTINCTS partagent un nom —
  // variante irremovable (Unbuffable 39/1039) ou natures opposées (Starving
  // Devil buff/debuff). Une map nom→id nue laisserait le dernier homonyme
  // écraser les autres (le + insérait toujours l'irremovable) et la datalist
  // montrait deux options identiques. Les homonymes sont suffixés
  // (« Unbuffable (irremovable, debuff) ») ; un reliquat de collision (même
  // nom, même nature, même flag) porte son id.
  const options = useMemo(() => {
    const counts = new Map<string, number>();
    for (const o of Object.values(catalog)) {
      const k = o.name.toLowerCase();
      counts.set(k, (counts.get(k) ?? 0) + 1);
    }
    const seen = new Set<string>();
    return Object.values(catalog).map((o) => {
      let label = o.name;
      if ((counts.get(o.name.toLowerCase()) ?? 0) > 1) {
        const tags = [o.irremovable ? 'irremovable' : null, o.isDebuff ? 'debuff' : 'buff'].filter(
          (t): t is string => Boolean(t),
        );
        label = `${o.name} (${tags.join(', ')})`;
      }
      if (seen.has(label.toLowerCase())) label = `${label} [${o.id}]`;
      seen.add(label.toLowerCase());
      return { id: o.id, label };
    });
  }, [catalog]);
  const byName = useMemo(
    () => new Map(options.map((o) => [o.label.toLowerCase(), o.id])),
    [options],
  );

  const moveChip = (buff: string, to: string) =>
    setChips((prev) =>
      prev.map((c) =>
        c.buff === buff ? { ...c, owner: to, hiddenOn: c.hiddenOn.filter((id) => id !== to) } : c,
      ),
    );
  const hideChip = (buff: string, on: string) =>
    setChips((prev) =>
      prev.map((c) =>
        c.buff === buff ? { ...c, hiddenOn: [...new Set([...c.hiddenOn, on])] } : c,
      ),
    );
  const restoreChip = (buff: string, on: string) =>
    setChips((prev) =>
      prev.map((c) =>
        c.buff === buff ? { ...c, hiddenOn: c.hiddenOn.filter((id) => id !== on) } : c,
      ),
    );

  const confirmAdd = (skillId: string) => {
    const q = addQuery.trim();
    const id = catalog[q] ? q : byName.get(q.toLowerCase());
    if (!id) {
      setMessage(`« ${q} » : effet inconnu du glossaire.`);
      return;
    }
    setAdds((prev) => ({ ...prev, [skillId]: [...new Set([...(prev[skillId] ?? []), id])] }));
    setAdding(null);
    setAddQuery('');
    setMessage(null);
  };
  const removeAdd = (skillId: string, ref: string) =>
    setAdds((prev) => ({ ...prev, [skillId]: (prev[skillId] ?? []).filter((r) => r !== ref) }));

  const save = async () => {
    setBusy(true);
    setMessage(null);
    // État COMPLET du kit (idempotent) — chipOwner par buff, chipHide par
    // carte, chipAdd par carte.
    const chipOwner: Record<string, string | null> = {};
    const chipHide: Record<string, string[]> = Object.fromEntries(
      skills.map((s) => [s.id, [] as string[]]),
    );
    for (const c of chips) {
      chipOwner[c.buff] = c.owner;
      for (const on of c.hiddenOn) chipHide[on]?.push(c.buff);
    }
    const res = await fetch('/api/admin/curated/monster-skills', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        kitSkillIds: skills.map((s) => s.id),
        chipOwner,
        chipHide,
        chipAdd: adds,
      }),
    });
    const json = (await res.json()) as { ok: boolean; errors?: string[] };
    setBusy(false);
    if (!json.ok) {
      setMessage(`Erreur : ${(json.errors ?? ['inconnue']).join(' ; ')}`);
      return;
    }
    setMessage('Enregistré — data/curated/monster-skills.json (à committer via git).');
    router.refresh();
  };

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-content-strong text-xs font-semibold uppercase">
          Câblage des chips (curé — présentation seule)
        </h2>
        <div className="flex items-center gap-3">
          {message && <span className="text-content-subtle text-xs">{message}</span>}
          <button
            type="button"
            onClick={save}
            disabled={busy || !dirty}
            className="bg-accent text-accent-fg rounded-md px-3 py-1.5 text-sm font-medium disabled:opacity-50"
          >
            {busy ? 'Enregistrement…' : 'Enregistrer'}
          </button>
        </div>
      </div>
      <p className="text-content-subtle text-xs">
        Glisse une chip sur une autre carte pour la réattribuer (chipOwner) · × pour la masquer sur
        sa carte (chipHide) · + pour ajouter un effet du glossaire (chipAdd).
      </p>

      <datalist id="kit-editor-effects">
        {options.map((o) => (
          <option key={o.id} value={o.label} />
        ))}
      </datalist>

      {skills.map((s) => {
        const own = chips.filter((c) => displayCards(c).includes(s.id));
        const hidden = chips.filter((c) => c.hiddenOn.includes(s.id));
        const added = adds[s.id] ?? [];
        return (
          <div
            key={s.id}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              const buff = e.dataTransfer.getData('chip/buff');
              const addRef = e.dataTransfer.getData('chip/add');
              const from = e.dataTransfer.getData('chip/from');
              if (buff) moveChip(buff, s.id);
              else if (addRef && from && from !== s.id) {
                removeAdd(from, addRef);
                setAdds((prev) => ({
                  ...prev,
                  [s.id]: [...new Set([...(prev[s.id] ?? []), addRef])],
                }));
              }
            }}
            className="border-line-subtle rounded-lg border p-3"
          >
            <div className="flex items-start gap-2.5">
              {s.iconSrc && (
                <img
                  src={s.iconSrc}
                  alt=""
                  className="h-10 w-10 shrink-0 rounded object-contain"
                  onError={(e) => {
                    e.currentTarget.style.visibility = 'hidden';
                  }}
                />
              )}
              <div className="min-w-0">
                <p className="text-content-strong text-sm font-semibold">
                  {s.name || '(sans nom)'}{' '}
                  <span className="text-content-subtle font-mono text-xs font-normal">
                    {s.id} · {s.type}
                  </span>
                </p>
                {s.desc && (
                  <p className="text-content-subtle text-xs whitespace-pre-line">
                    {renderGameColors(s.desc.replace(/\\n/g, '\n'))}
                  </p>
                )}
              </div>
            </div>

            <div className="mt-2 flex flex-wrap items-center gap-1.5">
              {own.map((c) => (
                <span
                  key={c.buff}
                  draggable
                  onDragStart={(e) => e.dataTransfer.setData('chip/buff', c.buff)}
                  title={`${c.buff} — porté par les tables : ${c.carrier}`}
                  className="cursor-grab active:cursor-grabbing"
                >
                  <EffectPillShell icon={c.icon} name={c.name} isDebuff={c.isDebuff}>
                    <button
                      type="button"
                      onClick={() => hideChip(c.buff, s.id)}
                      title="Masquer sur cette carte (chipHide)"
                      className="ml-0.5 rounded px-0.5 text-[11px] leading-none opacity-60 hover:opacity-100"
                    >
                      ✕
                    </button>
                  </EffectPillShell>
                </span>
              ))}
              {added.map((ref) => {
                const o = catalog[ref];
                return (
                  <span
                    key={ref}
                    draggable
                    onDragStart={(e) => {
                      e.dataTransfer.setData('chip/add', ref);
                      e.dataTransfer.setData('chip/from', s.id);
                    }}
                    title={`chipAdd ${ref}`}
                    className="ring-accent/60 cursor-grab rounded-md ring-1 active:cursor-grabbing"
                  >
                    <EffectPillShell
                      icon={o?.icon}
                      name={o?.name ?? ref}
                      isDebuff={o?.isDebuff ?? false}
                    >
                      <button
                        type="button"
                        onClick={() => removeAdd(s.id, ref)}
                        title="Retirer (chipAdd)"
                        className="ml-0.5 rounded px-0.5 text-[11px] leading-none opacity-60 hover:opacity-100"
                      >
                        ✕
                      </button>
                    </EffectPillShell>
                  </span>
                );
              })}
              {hidden.map((c) => (
                <span
                  key={`hidden-${c.buff}`}
                  title={`${c.buff} — masquée ici (chipHide)`}
                  className="border-line flex items-center gap-1 rounded-md border border-dashed py-0.5 pr-1 pl-1 opacity-50"
                >
                  <span className="text-content-subtle text-[11px] font-semibold line-through">
                    {c.name}
                  </span>
                  <button
                    type="button"
                    onClick={() => restoreChip(c.buff, s.id)}
                    title="Rétablir la chip"
                    className="text-content-subtle hover:text-content ml-0.5 rounded px-0.5 text-[11px] leading-none"
                  >
                    ↺
                  </button>
                </span>
              ))}
              {adding === s.id ? (
                <span className="flex items-center gap-1">
                  <input
                    autoFocus
                    list="kit-editor-effects"
                    value={addQuery}
                    onChange={(e) => setAddQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') confirmAdd(s.id);
                      if (e.key === 'Escape') setAdding(null);
                    }}
                    placeholder="Nom d'effet ou réf tooltip…"
                    className="border-line bg-surface-base text-content w-52 rounded-md border px-2 py-0.5 text-xs"
                  />
                  <button
                    type="button"
                    onClick={() => confirmAdd(s.id)}
                    className="bg-accent text-accent-fg rounded px-1.5 py-0.5 text-xs"
                  >
                    OK
                  </button>
                  <button
                    type="button"
                    onClick={() => setAdding(null)}
                    className="text-content-subtle hover:text-content px-1 text-xs"
                  >
                    annuler
                  </button>
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setAdding(s.id);
                    setAddQuery('');
                  }}
                  title="Ajouter un effet (chipAdd)"
                  className="border-line text-content-subtle hover:text-content-strong hover:border-line-strong rounded-md border border-dashed px-1.5 py-0.5 text-xs"
                >
                  +
                </button>
              )}
            </div>
          </div>
        );
      })}
    </section>
  );
}
