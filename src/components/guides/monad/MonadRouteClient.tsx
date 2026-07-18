'use client';

/**
 * Wrapper client d'une page de route Monad Gate (port de `MonadRoutePage` V2) :
 * gère les VARIANTES de layout de map (depth 10 en a deux) via des onglets et le
 * paramètre `?v=<index>` (deep-link depuis la vue de catégorie), et compose
 * l'en-tête récompense + la carte. Tout le contenu est déjà résolu côté serveur
 * (strings, nodeLabels, rewards) — ce composant n'orchestre que la sélection.
 */
import type { MonadRouteFile } from '@/lib/data/monad';
import type { Lang } from '@/lib/i18n/config';
import { useUrlSlice, writeUrl } from '@/hooks/useUrlSlice';
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
}

export default function MonadRouteClient({ variants, lang, strings, rewardLabels }: Props) {
  // `?v=<index>` : l'URL est la SOURCE DE VÉRITÉ de la variante active (deep-link
  // partageable, Back/Forward pilote l'UI — cf. useUrlSlice). Lecture par
  // `window.location` et non `useSearchParams`, qui forcerait une frontière
  // Suspense sur la page.
  const raw = useUrlSlice('popstate', () => new URLSearchParams(window.location.search).get('v'));
  const idx = raw === null ? NaN : parseInt(raw, 10);
  const active = Number.isInteger(idx) && idx >= 0 && idx < variants.length ? idx : 0;
  const current = variants[active] ?? variants[0];

  const select = (i: number) =>
    writeUrl(() => {
      const url = new URL(window.location.href);
      // Variante par défaut → paramètre retiré (URL canonique propre).
      if (i === 0) url.searchParams.delete('v');
      else url.searchParams.set('v', String(i));
      window.history.replaceState(null, '', url);
    });

  return (
    <div className="space-y-4">
      <MonadRouteReward reward={current.reward} labels={rewardLabels} />
      {variants.length > 1 && (
        <div className="flex gap-2">
          {variants.map((v, i) => (
            <button
              key={i}
              type="button"
              onClick={() => select(i)}
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
      />
    </div>
  );
}
