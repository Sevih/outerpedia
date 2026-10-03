'use client';

import type { HeroTrackerData } from './contracts';
import { HeroCard } from './HeroCard';
import { EmptyState, HeroPicker, RosterBar } from './roster';
import { Settings } from './Settings';
import { SummaryPanel } from './SummaryPanel';
import { useRosterView } from './use-roster-view';
import { useTrackerState } from './use-tracker-state';

/**
 * Suivi de compte — écran CLIENT. L'état vit dans le localStorage (aucun
 * compte, aucune écriture serveur) ; le calcul est délégué au moteur pur voisin.
 *
 * Parti pris de la refonte (maquette « 2a — édition en place ») : LE RÉCAP EST
 * L'ÉCRAN. Il reste collant pendant qu'on saisit, parce que voir le total bouger
 * est la seule raison de remplir ce formulaire. La saisie tient dans la rangée
 * du héros, dépliée ; le roster complet vit dans un tiroir « ajouter », pour que
 * les 119 héros ne noient plus les cinq qu'on monte vraiment.
 *
 * Découpé le 03/10/2026 : ce fichier garde la composition et le câblage.
 * L'état du compte vit dans `use-tracker-state.ts`, ce que l'écran en montre
 * dans `use-roster-view.ts` ; les sections sont `SummaryPanel`, `Settings`,
 * `HeroCard` et `roster.tsx`, sur les briques de `ui.tsx` ; types et
 * constantes dans `contracts.ts`, spec du store dans `stores.ts`.
 */

export function HeroTrackerBrowser({
  heroes,
  rules,
  transcend,
  items,
  elementNames,
  limitedTags,
  classNames,
  labels,
}: HeroTrackerData) {
  // État du COMPTE, puis ce que l'écran en montre : deux hooks (découpage du
  // 03/10/2026), destructurés sous les MÊMES noms que les anciennes
  // déclarations — le JSX ci-dessous n'a pas bougé.
  const {
    store,
    setStore,
    ready,
    query,
    setQuery,
    axis,
    setAxis,
    open,
    setOpen,
    picking,
    setPicking,
    element,
    setElement,
    filters,
    setFilters,
    sort,
    setSort,
    tracked,
    heroById,
    ladder,
    asTracked,
    hidden,
    fusionPairs,
    minTranscend,
    maxTarget,
    needs,
    shown,
    counted,
    total,
    update,
    frozen,
    setFrozen,
    importState,
    onImport,
    toggle,
    withTarget,
  } = useTrackerState({ heroes, rules, transcend, labels });
  const { shopping, itemTotal, trackedRows, sortedRows, trackedTotal, pickable } = useRosterView({
    heroes,
    rules,
    items,
    store,
    tracked,
    heroById,
    hidden,
    shown,
    maxTarget,
    needs,
    total,
    axis,
    filters,
    sort,
    frozen,
    query,
    element,
  });

  return (
    <div className="space-y-4 lg:grid lg:grid-cols-[22rem_minmax(0,1fr)] lg:items-start lg:gap-5 lg:space-y-0">
      {/* ══ Colonne récap — collante : on voit le total bouger pendant la saisie ══ */}
      <div className="sticky top-0 z-20 -mx-4 space-y-3 px-4 sm:mx-0 sm:px-0 lg:top-4">
        <SummaryPanel
          total={total}
          shopping={shopping}
          itemTotal={itemTotal}
          heroById={heroById}
          elementNames={elementNames}
          limitedTags={limitedTags}
          axis={axis}
          onAxis={setAxis}
          labels={labels}
        />
        <Settings
          store={store}
          setStore={setStore}
          fusionPairs={fusionPairs}
          // Le TOTAL suivi, pas la liste filtrée : « réinitialiser » disparaissait
          // dès qu'un filtre ne montrait rien alors que des héros étaient suivis.
          trackedCount={trackedTotal}
          onImport={onImport}
          importState={importState}
          labels={labels}
        />
      </div>

      {/* ══ Colonne héros ══ */}
      <div className="space-y-3" aria-busy={!ready}>
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="text-content-strong text-base font-semibold">
            {labels.myHeroes}{' '}
            <span className="text-content-muted font-normal">
              {/* « 4 / 12 » quand un réglage en masque : sans ça, des héros
                  disparaissent sans que rien ne le dise. */}
              {trackedRows.length}
              {trackedRows.length !== trackedTotal && ` / ${trackedTotal}`}
            </span>
          </h2>
          <div className="flex-1" />
          <button
            type="button"
            onClick={() => setPicking((v) => !v)}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
              picking
                ? 'border-line text-content-muted hover:bg-line/40 border'
                : 'bg-accent text-accent-fg hover:brightness-110'
            }`}
          >
            {picking ? '×' : '+'} {labels.addHero}
          </button>
        </div>

        {trackedTotal > 0 && (
          <RosterBar
            filters={filters}
            onFilters={(f) => {
              setFrozen(null);
              setFilters(f);
            }}
            sort={sort}
            onSort={(s) => {
              setFrozen(null);
              setSort(s);
            }}
            elementNames={elementNames}
            classNames={classNames}
            labels={labels}
          />
        )}

        {trackedTotal === 0 && !picking ? (
          <EmptyState labels={labels} onPick={() => setPicking(true)} />
        ) : sortedRows.length === 0 ? (
          // Suivre des héros et n'en voir aucun est un ÉTAT DE FILTRE, pas un
          // roster vide : proposer « choisir mes héros » ici serait un contresens.
          <p className="border-line-subtle text-content-subtle rounded-xl border border-dashed px-4 py-6 text-center text-sm">
            {labels.noMatch}
          </p>
        ) : (
          <ul className="space-y-2">
            {sortedRows.map((hero) => (
              <HeroCard
                key={hero.id}
                hero={hero}
                entry={tracked[hero.id]}
                need={needs.get(hero.id)}
                steps={ladder(asTracked(hero))}
                minTranscend={minTranscend(hero)}
                rules={rules}
                items={items}
                withTarget={withTarget}
                counted={counted(hero)}
                expanded={open === hero.id}
                onExpand={() => {
                  setFrozen((f) => f ?? sortedRows.map((h) => h.id));
                  setOpen((v) => (v === hero.id ? null : hero.id));
                }}
                onUntrack={() => toggle(hero)}
                onChange={(side, patch) => update(hero, side, patch)}
                labels={labels}
              />
            ))}
          </ul>
        )}

        {picking && (
          <HeroPicker
            rows={pickable}
            query={query}
            onQuery={setQuery}
            element={element}
            onElement={setElement}
            elementNames={elementNames}
            onToggle={toggle}
            labels={labels}
          />
        )}
      </div>
    </div>
  );
}
