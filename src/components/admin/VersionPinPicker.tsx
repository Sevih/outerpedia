'use client';

/**
 * QUEL ÉTAT DU BOSS cette version du guide montre — live, ou l'une de ses
 * archives. C'est le SEUL degré de liberté réel d'une version : mesuré sur les
 * 16 guides versionnés du site, aucun ne change de combat d'une version à
 * l'autre. Le combat appartient au guide ; ce qui bouge, c'est l'état du boss.
 *
 * L'écran est donc un choix par MONSTRE, pas une saisie de clés : `pinned` était
 * jusqu'ici invisible en admin (posé par « Versionner », modifiable nulle part),
 * ce qui rendait un épinglage impossible à corriger sans ouvrir le JSON.
 */
import { archiveLabel, type PinTarget } from '@/lib/admin/guide-pin-targets';

// Les cibles et le libellé d'une archive vivent dans `guide-pin-targets.ts` :
// quick (section « Guides ») lit les mêmes.
export type { PinTarget };

const LIVE = '';

export function VersionPinPicker({
  targets,
  pinned,
  onChange,
}: {
  targets: PinTarget[];
  /** Clés d'archive choisies — la liste est CREUSE (absent = live). */
  pinned: string[];
  onChange: (next: string[]) => void;
}) {
  /** Le choix courant pour un monstre : sa clé d'archive, ou live. */
  const current = (id: string) => pinned.find((k) => k.split('@')[0] === id) ?? LIVE;

  const pick = (id: string, key: string) => {
    // Un monstre n'a qu'UN état par version : on remplace le sien plutôt que
    // d'empiler, sinon le rendu tranche en silence (premier gagnant).
    const rest = pinned.filter((k) => k.split('@')[0] !== id);
    onChange(key === LIVE ? rest.sort() : [...rest, key].sort());
  };

  if (!targets.length) {
    return (
      <p className="text-content-subtle text-xs">
        No battle assigned to this guide — nothing to pin.
      </p>
    );
  }

  return (
    <div className="space-y-2">
      {targets.map((m) => (
        <div
          key={m.id}
          className="border-line-subtle bg-surface-sunken flex items-start gap-3 rounded-md border p-2"
        >
          {m.icon && <img src={m.icon} alt="" className="h-9 w-9 shrink-0 rounded object-cover" />}
          <div className="min-w-0 flex-1 space-y-1">
            <p className="text-content text-sm font-medium">
              {m.name}{' '}
              <span className="text-content-subtle font-normal">· {m.where.join(', ')}</span>
            </p>
            {m.archives.length ? (
              <div className="flex flex-wrap gap-x-4 gap-y-1">
                <Choice
                  name={m.id}
                  checked={current(m.id) === LIVE}
                  onSelect={() => pick(m.id, LIVE)}
                  label="Live"
                />
                {m.archives.map((a) => (
                  <Choice
                    key={a.key}
                    name={m.id}
                    checked={current(m.id) === a.key}
                    onSelect={() => pick(m.id, a.key)}
                    label={archiveLabel(a)}
                  />
                ))}
              </div>
            ) : (
              // Listé quand même : son absence se lirait comme un oubli du scan,
              // alors que le fait à dire est « celui-là n'a jamais été versionné ».
              <p className="text-content-subtle text-xs">Live — never versioned.</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

function Choice({
  name,
  checked,
  onSelect,
  label,
}: {
  name: string;
  checked: boolean;
  onSelect: () => void;
  label: string;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-1.5 text-xs">
      <input
        type="radio"
        name={`pin-${name}`}
        checked={checked}
        onChange={onSelect}
        className="accent-accent"
      />
      <span className={checked ? 'text-content' : 'text-content-muted'}>{label}</span>
    </label>
  );
}
