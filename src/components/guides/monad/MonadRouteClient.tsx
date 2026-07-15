'use client';

/**
 * Wrapper client d'une page de route Monad Gate (port de `MonadRoutePage` V2) :
 * gère les VARIANTES de layout de map (depth 10 en a deux) via des onglets et le
 * paramètre `?v=<index>` (deep-link depuis la vue de catégorie), et compose
 * l'en-tête récompense + la carte. Tout le contenu est déjà résolu côté serveur
 * (strings, nodeLabels, rewards) — ce composant n'orchestre que la sélection.
 */
import { useEffect, useState } from 'react';
import type { MonadRouteFile } from '@/lib/data/monad';
import type { Lang } from '@/lib/i18n/config';
import MonadGateMap, { type MonadStrings } from './MonadGateMap';
import MonadRouteReward, { type RewardDisplay } from './MonadRouteReward';

/** Une variante de map d'une route (label d'onglet + données + récompenses). */
export interface RouteVariant {
  label: string;
  route: MonadRouteFile;
  reward: RewardDisplay;
}

interface Props {
  variants: RouteVariant[];
  lang: Lang;
  strings: MonadStrings;
  rewardLabels: { rewards: string; firstClear: string };
  title?: string;
}

export default function MonadRouteClient({ variants, lang, strings, rewardLabels, title }: Props) {
  const [active, setActive] = useState(0);

  // Onglet initial depuis `?v=<index>` — lu de window pour éviter useSearchParams
  // (qui forcerait une frontière Suspense sur la page).
  useEffect(() => {
    if (variants.length < 2) return;
    const raw = new URLSearchParams(window.location.search).get('v');
    if (raw === null) return;
    const idx = parseInt(raw, 10);
    // Lecture ONE-SHOT du deep-link : pas un état externe qui re-render, et
    // useSearchParams forcerait un Suspense sur la page (cf. commentaire ci-dessus).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (Number.isInteger(idx) && idx >= 0 && idx < variants.length) setActive(idx);
  }, [variants.length]);

  const current = variants[active] ?? variants[0];

  return (
    <div className="space-y-4">
      <MonadRouteReward reward={current.reward} labels={rewardLabels} />
      {variants.length > 1 && (
        <div className="flex gap-2">
          {variants.map((v, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setActive(i)}
              className={`rounded border px-3 py-1.5 text-sm font-medium transition ${
                active === i
                  ? 'text-surface-base border-yellow-400 bg-yellow-400'
                  : 'border-line bg-surface-raised text-content hover:border-line-strong'
              }`}
            >
              {v.label}
            </button>
          ))}
        </div>
      )}
      <MonadGateMap
        key={active}
        nodes={current.route.nodes}
        edges={current.route.edges}
        lang={lang}
        strings={strings}
        title={title}
      />
    </div>
  );
}
