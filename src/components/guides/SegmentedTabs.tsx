'use client';

/**
 * ONGLETS SEGMENTÉS — un sélecteur générique « une chose à la fois ».
 *
 * Le guild raid empile trois axes de choix : la PHASE (1/2), le SOUS-BOSS (A/B)
 * en phase 1, l'ÉQUIPE en phase 2. Les trois se lisent pareil — une rangée de
 * boutons, un seul panneau visible — donc un seul composant les sert, imbriqué à
 * volonté. Les panneaux sont RENDUS PAR LE SERVEUR (passés en `content`) : tout
 * voyage dans la charge utile, le client ne fait que basculer l'affichage.
 *
 * Synchronisation URL OPTIONNELLE (`urlKey`) : avec une clé, le choix vit dans
 * le hash (`#<urlKey>=<clé d'onglet>`, cf. `url-hash`) — lien partageable, comme
 * la version. Sans clé, c'est de l'état local (navigation de confort).
 */
import { useState, type ReactNode } from 'react';
import { useUrlSlice } from '@/hooks/useUrlSlice';
import { readHashParam, writeHashParam } from '@/lib/url-hash';

export interface TabItem {
  key: string;
  /** Libellé du bouton (peut contenir une icône/pastille). */
  label: ReactNode;
  /** Contenu du panneau, rendu côté serveur. */
  content: ReactNode;
}

export function SegmentedTabs({
  tabs,
  ariaLabel,
  defaultIndex = 0,
  urlKey,
  variant = 'pill',
}: {
  tabs: TabItem[];
  ariaLabel: string;
  defaultIndex?: number;
  /** Paramètre de hash à synchroniser (ex. `phase`, `boss`, `team`). */
  urlKey?: string;
  /**
   * Style des boutons : `pill` (segmenté compact, défaut), `boss` (boutons
   * riches, portrait + nom + élément, surbrillance en anneau — le sélecteur de
   * sous-boss façon V2) ou `icon` (juste l'icône, anneau doré sur l'actif — les
   * onglets de compétences en mode compact).
   */
  variant?: 'pill' | 'boss' | 'icon';
}) {
  const [localSelected, setLocalSelected] = useState(defaultIndex);
  // Lecture inconditionnelle (règle des hooks) ; ignorée sans `urlKey`. Snapshot
  // serveur `null` → premier rendu sur `defaultIndex`, resync après hydratation.
  const hashValue = useUrlSlice('hashchange', () => (urlKey ? readHashParam(urlKey) : null));

  if (!tabs.length) return null;

  let selected = localSelected;
  if (urlKey) {
    const idx = hashValue ? tabs.findIndex((tab) => tab.key === hashValue) : -1;
    selected = idx >= 0 ? idx : defaultIndex;
  }

  const select = (i: number) => {
    if (urlKey) writeHashParam(urlKey, tabs[i].key);
    else setLocalSelected(i);
  };

  const active = tabs[Math.min(selected, tabs.length - 1)];

  // Conteneur de la barre d'onglets + boutons, selon la variante.
  const listClass =
    variant === 'boss'
      ? 'flex flex-wrap gap-2'
      : variant === 'icon'
        ? 'flex flex-wrap gap-1.5'
        : 'border-line-subtle bg-surface-sunken inline-flex flex-wrap gap-0.5 rounded-lg border p-0.5';

  const buttonClass = (isActive: boolean) => {
    if (variant === 'boss')
      return `flex items-center gap-2 rounded-lg border px-3 py-2 text-left text-sm font-semibold transition-colors ${
        isActive
          ? 'border-accent/40 bg-accent/15 text-accent ring-accent/30 ring-1'
          : 'border-line-subtle bg-surface-raised text-content hover:text-content-strong cursor-pointer'
      }`;
    // `icon` : pas de fond, juste l'icône ; l'actif porte un anneau doré.
    if (variant === 'icon')
      return `rounded-lg p-0.5 transition ${
        isActive ? 'ring-accent ring-2' : 'cursor-pointer opacity-50 hover:opacity-100'
      }`;
    return `flex items-center gap-1.5 rounded-md px-3 py-1 text-sm font-semibold transition-colors ${
      isActive ? 'bg-accent text-accent-fg' : 'text-content hover:bg-surface-raised cursor-pointer'
    }`;
  };

  return (
    <div className="space-y-4">
      {tabs.length > 1 && (
        <div role="tablist" aria-label={ariaLabel} className={listClass}>
          {tabs.map((tab, i) => (
            <button
              key={tab.key}
              type="button"
              role="tab"
              aria-selected={i === selected}
              onClick={() => select(i)}
              className={buttonClass(i === selected)}
            >
              {tab.label}
            </button>
          ))}
        </div>
      )}
      <div>{active.content}</div>
    </div>
  );
}
