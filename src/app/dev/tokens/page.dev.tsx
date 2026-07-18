'use client';

/**
 * GALERIE DE TOKENS EN CONTEXTE (dev-only, route `/dev/tokens` — `.dev.tsx` non
 * buildé en prod). Plutôt que des pastilles nues, chaque token de couleur est
 * montré APPLIQUÉ dans une mini-maquette du composant guide qui l'utilise
 * (nœud Monad, chip buff/debuff, valeur de stat, encart de statut, chaîne,
 * élément, rareté…) : on voit à quoi il sert ET comment il rend. La valeur
 * résolue sur `:root` s'affiche à côté. Ajuster = éditer le token dans
 * `src/app/globals.css`, pas les vues.
 */
import { useSyncExternalStore } from 'react';
import { GUIDE_ACCENT } from '@/components/guides/guide-accents';

// Valeur résolue d'une CSS var sur `:root` — lecture SANS setState (règle
// react-hooks/set-state-in-effect gardée active) : subscribe no-op, la valeur
// ne bouge pas, snapshot serveur vide.
const noop = () => () => {};
function useCssVar(varName: string): string {
  return useSyncExternalStore(
    noop,
    () => getComputedStyle(document.documentElement).getPropertyValue(varName).trim(),
    () => '',
  );
}

/** Puce « token » : nom + valeur résolue, pour annoter une maquette. */
function TokenTag({ v }: { v: string }) {
  const resolved = useCssVar(v);
  return (
    <span className="border-line-subtle text-content-subtle inline-flex items-center gap-1.5 rounded border px-1.5 py-0.5 font-mono text-[10px]">
      <span
        className="border-line inline-block h-3 w-3 rounded-sm border"
        style={{ background: `var(${v})` }}
      />
      {v.replace(/^--(color-)?/, '')}
      <span className="text-content-subtle/70">{resolved}</span>
    </span>
  );
}

/** Bloc de démo : un titre, la maquette, et les tokens qu'elle emploie. */
function Demo({
  title,
  tokens,
  children,
}: {
  title: string;
  tokens: string[];
  children: React.ReactNode;
}) {
  return (
    <section className="border-line-subtle bg-surface-raised rounded-xl border p-4">
      <h2 className="text-content-strong mb-3 text-sm font-semibold tracking-wide uppercase">
        {title}
      </h2>
      <div className="mb-3">{children}</div>
      <div className="flex flex-wrap gap-1.5">
        {tokens.map((v) => (
          <TokenTag key={v} v={v} />
        ))}
      </div>
    </section>
  );
}

/** Chip d'effet façon EffectChips (icône ronde + libellé). */
function Chip({ tint, label }: { tint: string; label: string }) {
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium"
      style={{
        background: `color-mix(in srgb, var(${tint}) 18%, transparent)`,
        color: `var(${tint})`,
      }}
    >
      <span className="h-2.5 w-2.5 rounded-full" style={{ background: `var(${tint})` }} />
      {label}
    </span>
  );
}

/** Faux nœud de carte Monad : point teinté + libellé dans la couleur du rôle. */
function Node({ token, label }: { token: string; label: string }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <span
        className="border-on-vivid/30 h-8 w-8 rounded-full border"
        style={{ background: `var(${token})` }}
      />
      <span className="text-[11px] font-semibold" style={{ color: `var(${token})` }}>
        {label}
      </span>
    </div>
  );
}

const ELEMENTS: [string, string][] = [
  ['--color-fire', 'Fire'],
  ['--color-water', 'Water'],
  ['--color-earth', 'Earth'],
  ['--color-light', 'Light'],
  ['--color-dark-elem', 'Dark'],
];

export default function TokensGallery() {
  return (
    <div className="bg-surface-base text-content min-h-screen p-6">
      <header className="mb-6">
        <h1 className="text-content-strong text-2xl font-bold">Tokens de couleur — en contexte</h1>
        <p className="text-content-muted mt-1 text-sm">
          Chaque token montré dans une maquette du composant qui l’emploie. Valeurs sur{' '}
          <code>:root</code> ; ajuster dans <code>src/app/globals.css</code>.
        </p>
      </header>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Surfaces / contenu / lignes — la base neutre théminée */}
        <Demo
          title="Surfaces · contenu · lignes"
          tokens={[
            '--color-surface-base',
            '--color-surface-raised',
            '--color-surface-overlay',
            '--color-content-strong',
            '--color-content',
            '--color-content-muted',
            '--color-content-subtle',
            '--color-line',
            '--color-line-subtle',
          ]}
        >
          <div className="border-line bg-surface-overlay space-y-1 rounded-lg border p-3">
            <div className="text-content-strong font-semibold">Titre de carte (content-strong)</div>
            <div className="text-content text-sm">Corps de texte normal (content).</div>
            <div className="text-content-muted text-sm">Sous-texte atténué (content-muted).</div>
            <div className="text-content-subtle text-xs">Légende discrète (content-subtle).</div>
          </div>
        </Demo>

        {/* Statut : info / succès / warn / danger (encarts de guide) */}
        <Demo
          title="Statut (encarts, liens)"
          tokens={['--color-accent', '--color-success', '--color-warn', '--color-danger']}
        >
          <div className="space-y-1.5 text-sm">
            <a className="text-accent hover:underline" href="#">
              Lien / info (accent)
            </a>
            {[
              ['--color-success', 'Recommandé — ça marche'],
              ['--color-warn', 'Attention — nuance à connaître'],
              ['--color-danger', 'Piège — à éviter'],
            ].map(([tok, txt]) => (
              <div
                key={tok}
                className="rounded-md border px-2 py-1"
                style={{
                  color: `var(${tok})`,
                  borderColor: `color-mix(in srgb, var(${tok}) 40%, transparent)`,
                  background: `color-mix(in srgb, var(${tok}) 10%, transparent)`,
                }}
              >
                {txt}
              </div>
            ))}
          </div>
        </Demo>

        {/* Nœuds Monad Gate — usage réel des tokens --monad-* */}
        <Demo
          title="Nœuds Monad Gate"
          tokens={[
            '--color-monad-milestone',
            '--color-monad-explore',
            '--color-monad-combat',
            '--color-monad-story',
          ]}
        >
          <div className="flex flex-wrap gap-5">
            <Node token="--color-monad-milestone" label="Jalon" />
            <Node token="--color-monad-explore" label="Exploration" />
            <Node token="--color-monad-combat" label="Combat" />
            <Node token="--color-monad-story" label="Narratif" />
          </div>
        </Demo>

        {/* Encarts/pastilles Monad Gate — popups de choix & résumé True Ending */}
        <Demo
          title="Encarts Monad Gate (popups · résumé)"
          tokens={[
            '--color-monad-choice-bd',
            '--color-monad-choice-bg',
            '--color-monad-choice-chip-bd',
            '--color-monad-choice-text',
            '--color-monad-key',
            '--color-monad-key-soft',
            '--color-monad-key-badge',
            '--color-monad-void-bd',
            '--color-monad-void-bg',
            '--color-monad-void-text',
            '--color-monad-quest-bd',
            '--color-monad-quest-text',
          ]}
        >
          <div className="space-y-2 text-xs">
            {/* Choix sélectionné dans le popup (fond vert plein) */}
            <div className="text-content-strong border-monad-choice-bd bg-monad-choice-bg inline-block rounded border px-3 py-2">
              Choix sélectionné (true path)
            </div>
            {/* Ligne du résumé : pastille numérotée + chip + clé */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="border-monad-quest-bd/40 bg-monad-milestone/15 text-monad-quest-text flex h-6 w-6 items-center justify-center rounded-full border font-bold">
                1
              </span>
              <span className="border-monad-choice-chip-bd/60 bg-monad-choice-bg/30 text-monad-choice-text inline-flex items-center rounded-md border px-2.5 py-1 text-sm">
                Choix A
              </span>
              <span className="text-monad-key-soft inline-flex items-center gap-1 font-medium">
                🔑 Objet
              </span>
            </div>
            {/* Encart « le choix n'a pas d'importance » (rouge translucide) */}
            <span className="border-monad-void-bd/60 bg-monad-void-bg/30 text-monad-void-text inline-flex items-center rounded border px-2 py-0.5 font-semibold">
              Le choix n’a pas d’importance
            </span>
            {/* « Donne une clé » sur un nœud + pastille 🔑 du nœud compact */}
            <div className="flex items-center gap-3">
              <span className="text-monad-key inline-flex items-center gap-1">
                🔑 Donne une clé
              </span>
              <span className="bg-monad-key-badge flex h-5 w-5 items-center justify-center rounded-full text-[10px]">
                🔑
              </span>
            </div>
          </div>
        </Demo>

        {/* Sélection jaune-or — onglets/cartes actifs des category-views */}
        <Demo
          title="Sélection (onglet · carte active)"
          tokens={['--color-select', '--color-select-fg', '--color-select-fg-hover']}
        >
          <div className="flex flex-wrap items-center gap-3 text-sm">
            {/* Onglet sélectionné partiel (bord/fond translucides + texte) */}
            <span className="border-select/50 bg-select/10 text-select-fg rounded-md border px-3 py-1">
              Onglet actif
            </span>
            {/* Pastille pleinement sélectionnée (texte sombre sur aplat) */}
            <span className="text-surface-base border-select bg-select rounded-md border px-3 py-1 font-semibold">
              Sélection pleine
            </span>
            {/* Vignette au survol : anneau jaune */}
            <span className="ring-line hover:ring-select/50 rounded-md px-3 py-1 ring-1 transition-all">
              Vignette (survol)
            </span>
            {/* Lien révélateur */}
            <button type="button" className="text-select-fg hover:text-select-fg-hover underline">
              Lien (survol)
            </button>
          </div>
        </Demo>

        {/* Chips d'effet (buff / debuff) */}
        <Demo
          title="Chips d’effet (buff / debuff)"
          tokens={['--color-buff-tint', '--color-debuff-tint']}
        >
          <div className="flex flex-wrap gap-2">
            <Chip tint="--color-buff-tint" label="Atk Up" />
            <Chip tint="--color-buff-tint" label="Barrier" />
            <Chip tint="--color-debuff-tint" label="Stun" />
            <Chip tint="--color-debuff-tint" label="Burn" />
          </div>
        </Demo>

        {/* Valeurs de stat (TurnOrder / BossStats) */}
        <Demo
          title="Valeurs de stat"
          tokens={['--color-stat', '--color-highlight', '--color-equipment']}
        >
          <div className="flex flex-wrap items-center gap-4 text-sm">
            <span className="text-content-strong">
              Mero <span className="text-stat text-xs">184 SPD</span>
            </span>
            <span className="text-highlight font-semibold">Valeur clé (highlight)</span>
            <span className="text-equipment">Nom d’équipement</span>
          </div>
        </Demo>

        {/* Chaîne / duo (marqueurs de progression) */}
        <Demo
          title="Chaîne (start · join · finish)"
          tokens={['--color-chain-start', '--color-chain-join', '--color-chain-finish']}
        >
          <div className="flex items-center gap-2 text-xs font-bold">
            {[
              ['--color-chain-start', 'Start'],
              ['--color-chain-join', 'Join'],
              ['--color-chain-finish', 'Finish'],
            ].map(([tok, txt], i) => (
              <span key={tok} className="contents">
                {i > 0 && <span className="text-content-subtle">→</span>}
                <span
                  className="rounded px-2 py-1"
                  style={{ background: `var(${tok})`, color: 'var(--color-surface-base)' }}
                >
                  {txt}
                </span>
              </span>
            ))}
          </div>
        </Demo>

        {/* Éléments */}
        <Demo title="Éléments" tokens={ELEMENTS.map(([t]) => t)}>
          <div className="flex flex-wrap gap-3 text-sm font-semibold">
            {ELEMENTS.map(([tok, name]) => (
              <span
                key={tok}
                className="rounded-md px-2 py-1 ring-2"
                style={{ color: `var(${tok})`, boxShadow: `inset 0 0 0 1px var(${tok})` }}
              >
                {name}
              </span>
            ))}
          </div>
        </Demo>

        {/* Rareté / grades d'item */}
        <Demo
          title="Rareté · grades d’item"
          tokens={[
            '--color-rarity-1',
            '--color-rarity-2',
            '--color-rarity-3',
            '--color-item-normal',
            '--color-item-superior',
            '--color-item-epic',
            '--color-item-legendary',
            '--color-singularity',
          ]}
        >
          <div className="flex flex-wrap gap-2 text-xs font-bold">
            {[
              ['--color-item-normal', 'Normal'],
              ['--color-item-superior', 'Superior'],
              ['--color-item-epic', 'Epic'],
              ['--color-item-legendary', 'Legendary'],
              ['--color-singularity', 'Singularity'],
            ].map(([tok, txt]) => (
              <span key={tok} style={{ color: `var(${tok})` }}>
                {txt}
              </span>
            ))}
          </div>
        </Demo>

        {/* Rôles d'équipe (tier list / compositions) */}
        <Demo
          title="Rôles d’équipe"
          tokens={['--color-role-dps', '--color-role-support', '--color-role-sustain']}
        >
          <div className="text-on-vivid flex flex-wrap gap-2 text-xs font-semibold">
            {[
              ['--color-role-dps', 'DPS'],
              ['--color-role-support', 'Support'],
              ['--color-role-sustain', 'Sustain'],
            ].map(([tok, txt]) => (
              <span key={tok} className="rounded px-2 py-1" style={{ background: `var(${tok})` }}>
                {txt}
              </span>
            ))}
          </div>
        </Demo>

        {/* Grades AX + chaleur des paliers (dégradé) */}
        <Demo
          title="Grades AX · chaleur des paliers"
          tokens={[
            '--color-ax-grade-c',
            '--color-ax-grade-b',
            '--color-ax-grade-a',
            '--color-ax-grade-s',
            '--color-ax-grade-sp',
            '--rank-heat-lo',
            '--rank-heat-mid',
            '--rank-heat-hi',
          ]}
        >
          <div className="space-y-2">
            <div className="flex flex-wrap gap-2 text-xs font-bold">
              {[
                ['--color-ax-grade-c', 'C'],
                ['--color-ax-grade-b', 'B'],
                ['--color-ax-grade-a', 'A'],
                ['--color-ax-grade-s', 'S'],
                ['--color-ax-grade-sp', 'S+'],
              ].map(([tok, txt]) => (
                <span key={tok} style={{ color: `var(${tok})` }}>
                  {txt}
                </span>
              ))}
            </div>
            <div
              className="h-3 w-full rounded-full"
              style={{
                background:
                  'linear-gradient(90deg, var(--rank-heat-lo), var(--rank-heat-mid), var(--rank-heat-hi))',
              }}
            />
          </div>
        </Demo>

        {/* Accents de catégorie — la vraie map GUIDE_ACCENT appliquée (survole
            une pastille pour l'ombre colorée -glow). */}
        <section className="border-line-subtle bg-surface-raised rounded-xl border p-4 lg:col-span-2">
          <h2 className="text-content-strong mb-3 text-sm font-semibold tracking-wide uppercase">
            Accents de catégorie (GUIDE_ACCENT)
          </h2>
          <div className="flex flex-wrap gap-2">
            {Object.entries(GUIDE_ACCENT).map(([slug, a]) => (
              <span
                key={slug}
                className={`rounded-lg border px-3 py-1.5 text-sm transition-all ${a.text} ${a.pillBg} ${a.pillBorder} ${a.hoverBorder} ${a.glow}`}
              >
                {slug}
              </span>
            ))}
          </div>
          <p className="text-content-subtle mt-3 text-[11px]">
            Chaque catégorie : <code>-fg</code> (texte) + <code>-bd</code> (fond/bord à opacités) +{' '}
            <code>-glow</code> (ombre au survol). <code>other</code> = neutre.
          </p>
        </section>
      </div>
    </div>
  );
}
