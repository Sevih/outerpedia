'use client';

/**
 * GALERIE DE TOKENS (dev-only, route `/dev/tokens` — fichier `.dev.tsx` non
 * buildé en prod). Rend chaque token de couleur sémantique en pastille + sa
 * valeur RÉSOLUE (lue au runtime sur `:root`), groupé par famille. Sert de
 * référence visuelle pour la tokenisation des couleurs guides : on voit d'un
 * coup d'œil ce que vaut chaque rôle et on ajuste dans `src/app/globals.css`.
 */
import { useSyncExternalStore } from 'react';

interface Group {
  title: string;
  note?: string;
  vars: string[];
}

// Familles de tokens exposés par `@theme inline` (+ quelques bruts utiles).
const GROUPS: Group[] = [
  { title: 'Surfaces', vars: ['--color-surface-base', '--color-surface-raised', '--color-surface-overlay', '--color-surface-sunken'] }, // prettier-ignore
  { title: 'Contenu (texte)', vars: ['--color-content-strong', '--color-content', '--color-content-muted', '--color-content-subtle'] }, // prettier-ignore
  {
    title: 'Lignes / ring',
    vars: ['--color-line-subtle', '--color-line', '--color-line-strong', '--color-ring'],
  },
  { title: 'Statut', note: 'accent=info/lien · success · warn · danger', vars: ['--color-accent', '--color-accent-fg', '--color-success', '--color-warn', '--color-danger'] }, // prettier-ignore
  { title: 'Buff / Debuff', vars: ['--color-buff', '--color-debuff', '--color-buff-tint', '--color-debuff-tint', '--color-buff-bg', '--color-debuff-bg'] }, // prettier-ignore
  { title: 'Éléments', vars: ['--color-fire', '--color-water', '--color-earth', '--color-light', '--color-dark-elem', '--color-class'] }, // prettier-ignore
  { title: 'Rareté', vars: ['--color-rarity-1', '--color-rarity-2', '--color-rarity-3'] },
  { title: 'Grades d’item', vars: ['--color-item-normal', '--color-item-superior', '--color-item-epic', '--color-item-legendary', '--color-singularity'] }, // prettier-ignore
  { title: 'Grades AX (ascension)', vars: ['--color-ax-grade-c', '--color-ax-grade-b', '--color-ax-grade-a', '--color-ax-grade-s', '--color-ax-grade-sp'] }, // prettier-ignore
  { title: 'Chaîne', note: 'start / join / finish', vars: ['--color-chain-start', '--color-chain-join', '--color-chain-finish'] }, // prettier-ignore
  { title: 'Nœuds Monad Gate', note: 'jalon / exploration / combat / narratif', vars: ['--color-monad-milestone', '--color-monad-explore', '--color-monad-combat', '--color-monad-story'] }, // prettier-ignore
  { title: 'Rôles divers', vars: ['--color-stat', '--color-stat-accent', '--color-highlight', '--color-equipment', '--color-on-vivid', '--color-role-dps', '--color-role-support', '--color-role-sustain'] }, // prettier-ignore
  { title: 'Chaleur des paliers (bruts, non --color-)', note: 'lus en var() depuis des styles inline', vars: ['--rank-heat-lo', '--rank-heat-mid', '--rank-heat-hi'] }, // prettier-ignore
];

const label = (v: string) => v.replace(/^--(color-)?/, '');

// Valeur résolue d'une CSS var sur `:root` — lecture SANS setState (règle
// react-hooks/set-state-in-effect gardée active) ; la valeur ne change pas, le
// subscribe est un no-op, le snapshot serveur est vide.
const noop = () => () => {};
function useCssVar(varName: string): string {
  return useSyncExternalStore(
    noop,
    () => getComputedStyle(document.documentElement).getPropertyValue(varName).trim(),
    () => '',
  );
}

function Swatch({ varName }: { varName: string }) {
  const resolved = useCssVar(varName);
  return (
    <div className="border-line-subtle bg-surface-raised flex items-center gap-3 rounded-lg border p-2">
      <div
        className="border-line h-12 w-12 shrink-0 rounded-md border"
        style={{ background: `var(${varName})` }}
      />
      <div className="min-w-0">
        <div className="text-content-strong truncate font-mono text-xs">{label(varName)}</div>
        <div className="text-content-subtle truncate font-mono text-[11px]">{resolved || '…'}</div>
      </div>
    </div>
  );
}

export default function TokensGallery() {
  return (
    <div className="bg-surface-base min-h-screen p-6">
      <header className="mb-6">
        <h1 className="text-content-strong text-2xl font-bold">Tokens de couleur</h1>
        <p className="text-content-muted mt-1 text-sm">
          Référence dev des tokens sémantiques (<code>src/app/globals.css</code>). Pastille + valeur
          résolue sur <code>:root</code>. Ajuster une valeur = éditer le token, pas les vues.
        </p>
      </header>
      <div className="space-y-8">
        {GROUPS.map((g) => (
          <section key={g.title}>
            <h2 className="text-content-strong mb-1 text-sm font-semibold tracking-wide uppercase">
              {g.title}
            </h2>
            {g.note && <p className="text-content-subtle mb-2 text-xs">{g.note}</p>}
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
              {g.vars.map((v) => (
                <Swatch key={v} varName={v} />
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
