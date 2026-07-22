'use client';

/**
 * Puces de personnages éditables (portraits + retrait) avec ajout assisté par
 * datalist. Brique COMMUNE à tous les éditeurs admin et à l'outil public de
 * contribution : persos recommandés d'un guide, slots d'équipe, sources de
 * héros, tiers de review, groupes de synergie.
 *
 * Agnostique du JETON stocké : les guides désignent les persos par NOM EN, les
 * synergies par ID. Le parent fournit `resolve` (saisie → jeton, identité par
 * défaut) et `viewOf` (jeton → portrait) ; la déduplication porte sur le jeton
 * RÉSOLU, donc « Aer » saisi et `c1010` déjà présent comptent pour un.
 */
import { useState } from 'react';
import { CharacterPortrait } from '@/components/character/CharacterPortrait';
import type { CharOption } from '@/components/admin/CharacterPicker';

/** Portrait d'une puce — forme commune aux `CharOption` et aux héros résolus. */
export interface ChipView {
  id: string;
  name: string;
  element?: string;
  classType?: string;
  rarity?: number;
}

const input =
  'w-full rounded-md border border-line bg-surface-base px-2 py-1 text-sm focus:border-accent focus:outline-none';

/** Datalist des noms EN à poser une fois par page (référencée par `datalistId`). */
export function CharacterNameDatalist({ id, options }: { id: string; options: CharOption[] }) {
  return (
    <datalist id={id}>
      {options.map((c) => (
        <option key={c.id} value={c.name} />
      ))}
    </datalist>
  );
}

/** `CharOption` → puce (les deux formes ne diffèrent que par `class`/`classType`). */
export const chipView = (c?: CharOption): ChipView | undefined =>
  c && { id: c.id, name: c.name, element: c.element, classType: c.class, rarity: c.rarity };

/** `viewOf` des listes qui désignent les persos par NOM D'AFFICHAGE EN. */
export function viewsByName(options: CharOption[]): (token: string) => ChipView | undefined {
  const byName = new Map(options.map((c) => [c.name, c]));
  return (token) => chipView(byName.get(token));
}

export function CharacterChips({
  values,
  onChange,
  datalistId,
  viewOf,
  resolve = (raw) => raw.trim(),
  size = 48,
  placeholder = '+ hero…',
}: {
  /** Jetons stockés (noms EN ou ids, selon l'appelant). */
  values: string[];
  onChange: (values: string[]) => void;
  datalistId: string;
  viewOf: (token: string) => ChipView | undefined;
  /** Saisie → jeton stocké (résolution nom→id des synergies, par exemple). */
  resolve?: (raw: string) => string;
  size?: number;
  placeholder?: string;
}) {
  const [add, setAdd] = useState('');

  /** Ajoute un jeton au groupe : résout la saisie et refuse les DOUBLONS. */
  const addValue = (raw: string) => {
    const token = resolve(raw);
    if (!token) return;
    if (values.some((v) => resolve(v) === token)) return;
    onChange([...values, token]);
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      {values.map((token, i) => {
        const view = viewOf(token);
        return (
          <div key={i} className="relative">
            {view ? (
              <CharacterPortrait
                id={view.id}
                name={view.name}
                element={view.element}
                classType={view.classType}
                rarity={view.rarity}
                size={size}
              />
            ) : (
              <div
                className="border-line-subtle text-content-subtle flex items-center justify-center rounded-lg border p-1 text-center text-[10px]"
                style={{ width: size, height: size }}
              >
                {token.startsWith('{') ? 'tag' : token || '?'}
              </div>
            )}
            <button
              type="button"
              title="Remove"
              className="border-line bg-surface-raised text-danger absolute -top-1.5 -right-1.5 rounded-full border px-1 text-xs"
              onClick={() => onChange(values.filter((_, j) => j !== i))}
            >
              ✕
            </button>
          </div>
        );
      })}
      <input
        className={`${input} h-9 w-40`}
        list={datalistId}
        placeholder={placeholder}
        value={add}
        onChange={(e) => {
          const val = e.target.value;
          // Ajout DIRECT seulement sur un « saut » de valeur (choix dans la
          // datalist / autocomplétion) vers un perso CONNU. La frappe
          // char-par-char n'ajoute JAMAIS — sinon un nom plus long qu'un nom
          // existant (« Francesca » vs « Fran ») serait impossible à taper.
          if (val.length - add.length > 1 && viewOf(resolve(val))) {
            addValue(val);
            setAdd('');
          } else {
            setAdd(val);
          }
        }}
        onKeyDown={(e) => {
          if (e.key !== 'Enter') return;
          e.preventDefault();
          addValue(add);
          setAdd('');
        }}
      />
    </div>
  );
}
