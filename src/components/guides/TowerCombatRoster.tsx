'use client';

/**
 * LA ROSTER D'UN COMBAT very hard + son PANNEAU DE RESTRICTIONS.
 *
 * On écrit UNE seule roster par boss (tous les persos utiles, avec leur raison).
 * La restriction — tirée au hasard en jeu, et parfois DOUBLE — est un FILTRE
 * dérivé : un panneau d'icônes (Élément / Classe / Rareté × Interdit / Requis)
 * dont on peut activer plusieurs cases à la fois. La roster réagit en direct :
 *   - BAN : le perso reste affiché mais GRISÉ, barré d'une croix rouge ;
 *   - QUOTA : le perso est MIS EN AVANT (halo) ;
 * toute la sémantique vit dans `restrictionState` (pur), ici on n'affiche que.
 *
 * Le panneau se construit sur un VOCABULAIRE FIXE (pas sur le pool du jeu) : on
 * couvre tous les couples cible×sens, y compris ceux que le jeu n'utilise pas
 * encore (ban de rareté…) — c'est un explorateur « et si ma restriction était… ».
 *
 * `CharacterPortrait` est un composant PUR : on le rend côté client à partir des
 * métadonnées résolues au build. `img` est un simple constructeur de chemins.
 */
import { useState, type ReactNode } from 'react';
import { img } from '@/lib/images';
import { restrictionState, type RestrictionRule } from '@/lib/tower-restrictions';
import { RosterGroupCard, type RosterGroupCardCharacter } from './RosterGroupCard';

export type RosterCharacter = RosterGroupCardCharacter;

export interface RosterGroup {
  characters: RosterCharacter[];
  /** Raison déjà localisée + parseText par le parent (serveur). */
  reason?: ReactNode;
}

export interface RosterLabels {
  title: string;
  ban: string;
  force: string;
  clear: string;
  element: string;
  class: string;
  star: string;
}

/** Le vocabulaire des cibles, par colonne — noms de classe = ceux des persos. */
const VOCAB = {
  element: ['fire', 'water', 'earth', 'light', 'dark'],
  class: ['striker', 'defender', 'ranger', 'mage', 'healer'],
  star: ['1', '2', '3'],
} as const;

type ColType = keyof typeof VOCAB;
const COLUMNS: readonly ColType[] = ['element', 'class', 'star'];

const key = (type: ColType, subType: string, count: number) => `${type}|${subType}|${count}`;

/** Icône d'une case : sprite d'élément / de classe, ou badge « N★ ». */
function targetIcon(type: ColType, subType: string): ReactNode {
  if (type === 'element') {
    return (
      <img
        src={img.element(subType)}
        alt=""
        aria-hidden
        className="h-6 w-6"
        width={24}
        height={24}
      />
    );
  }
  if (type === 'class') {
    return (
      <img src={img.klass(subType)} alt="" aria-hidden className="h-6 w-6" width={24} height={24} />
    );
  }
  return <span className="text-xs font-bold tabular-nums">{subType}★</span>;
}

export function TowerCombatRoster({
  groups,
  labels,
  restrictable = true,
}: {
  groups: RosterGroup[];
  labels: RosterLabels;
  /** Faux sur les étages fixes (Demiurges 5/10/15, Floor 20) : aucune
   *  restriction n'y est tirée → pas de panneau, roster brute. */
  restrictable?: boolean;
}) {
  const [active, setActive] = useState<ReadonlySet<string>>(new Set());

  const rules: RestrictionRule[] = restrictable
    ? [...active].map((k) => {
        const [type, subType, count] = k.split('|');
        return { type, subType, count: Number(count) };
      })
    : [];

  const toggle = (k: string) =>
    setActive((prev) => {
      const next = new Set(prev);
      if (next.has(k)) next.delete(k);
      else next.add(k);
      return next;
    });

  if (!groups.length) return null;

  return (
    <section className="space-y-3">
      <h3 className="text-content-strong text-lg font-bold">{labels.title}</h3>

      {/* Panneau de restrictions — cases cumulables (étages aléatoires seulement) */}
      {restrictable && (
        <div className="border-line-subtle bg-surface-raised space-y-2 rounded-lg border p-3">
          <div className="flex flex-wrap gap-x-6 gap-y-3">
            {COLUMNS.map((type) => (
              <div key={type} className="space-y-1.5">
                <div className="text-content-muted text-xs font-semibold tracking-wide uppercase">
                  {labels[type]}
                </div>
                {[
                  { count: -1, label: labels.ban, ban: true },
                  { count: 1, label: labels.force, ban: false },
                ].map((dir) => (
                  <div key={dir.count} className="flex items-center gap-1.5">
                    <span className="text-content-muted w-14 shrink-0 text-xs">{dir.label}</span>
                    <div className="flex flex-wrap gap-1">
                      {VOCAB[type].map((subType) => {
                        const k = key(type, subType, dir.count);
                        const on = active.has(k);
                        return (
                          <button
                            key={subType}
                            type="button"
                            aria-pressed={on}
                            onClick={() => toggle(k)}
                            className={[
                              'flex h-9 w-9 items-center justify-center rounded-md border transition-colors',
                              on
                                ? dir.ban
                                  ? 'border-danger-strong bg-danger-strong/15'
                                  : 'border-accent bg-accent/15'
                                : 'border-line-subtle hover:border-line',
                            ].join(' ')}
                          >
                            {targetIcon(type, subType)}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
          {active.size > 0 && (
            <button
              type="button"
              onClick={() => setActive(new Set())}
              className="text-content-muted hover:text-content-strong text-xs underline"
            >
              {labels.clear}
            </button>
          )}
        </div>
      )}

      {/* Roster : la carte partagée, chaque portrait habillé de l'état dérivé
          de la restriction active (halo quota / grisé + croix de ban). */}
      <div className="space-y-3">
        {groups.map((g, gi) => (
          <RosterGroupCard
            key={gi}
            characters={g.characters}
            reason={g.reason}
            decorate={(portrait, c) => {
              const state = restrictionState(
                { element: c.element, class: c.classType, rarity: c.rarity },
                rules,
              );
              const excluded = state === 'excluded';
              return (
                <div
                  className={[
                    'relative rounded-lg',
                    state === 'match'
                      ? 'ring-accent ring-2 ring-offset-1 ring-offset-transparent'
                      : '',
                  ].join(' ')}
                >
                  <div className={excluded ? 'opacity-40 grayscale' : undefined}>{portrait}</div>
                  {excluded && (
                    <svg
                      viewBox="0 0 100 100"
                      aria-hidden
                      className="pointer-events-none absolute inset-0 h-full w-full"
                    >
                      <line
                        x1="12"
                        y1="12"
                        x2="88"
                        y2="88"
                        stroke="rgb(239 68 68)"
                        strokeWidth="9"
                        strokeLinecap="round"
                      />
                      <line
                        x1="88"
                        y1="12"
                        x2="12"
                        y2="88"
                        stroke="rgb(239 68 68)"
                        strokeWidth="9"
                        strokeLinecap="round"
                      />
                    </svg>
                  )}
                </div>
              );
            }}
          />
        ))}
      </div>
    </section>
  );
}
