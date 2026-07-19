'use client';

/**
 * Outil PUBLIC de contribution à UNE slice éditoriale d'un perso (pour Jaego) :
 * soit les PROS/CONS (`slice='prosCons'`, kind `character-pros-cons`), soit les
 * SYNERGIES (`slice='synergies'`, kind `character-synergy`) — deux outils distincts,
 * un composant paramétré. Zéro écriture serveur, zéro login : on choisit UN perso,
 * on édite en ANGLAIS (la trad se fait à l'import admin) et on EXPORTE ce perso.
 *
 * Deux MODES de sélection : « Add » ne liste que les persos SANS cette slice,
 * « Edit » que ceux qui en ONT déjà (le mode pilote aussi le `mode` de l'enveloppe).
 * La SAISIE réutilise `EditorialFields` (même brique que l'admin) ; l'export ne
 * porte QUE la slice éditée (l'autre reste intacte à l'import).
 */
import { useState } from 'react';
import type { CharacterCurated } from '@contracts';
import { type Keyed, stripKey, withKey } from '@/lib/admin/keyed';
import type { InlineRefs } from '@/lib/admin/inline-refs';
import type { CharOption } from '@/components/admin/CharacterPicker';
import { CharacterPortrait } from '@/components/character/CharacterPortrait';
import { downloadJson } from '@/components/admin/premium-limited/PremiumLimitedParts';
import {
  EditorialFields,
  makeResolveHero,
  type HeroView,
  type LocalizedText,
  type SynergyGroup,
} from '@/components/admin/editorial/EditorialFields';
import {
  makeContribution,
  type ContributionKind,
  type EditorialContributionPayload,
} from '@/lib/contribute/contribution';

const btn =
  'rounded-md border border-line bg-surface-base px-3 py-1.5 text-sm hover:border-accent disabled:opacity-50';
const fileSlug = (s: string) =>
  s
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-') || 'character';

/** Slice éditoriale seedée dans l'outil (les autres champs curés ne sont pas exposés). */
export type EditorialSeed = Pick<CharacterCurated, 'prosCons' | 'synergies'>;
type PickMode = 'add' | 'edit';

export function EditorialPublicTool({
  slice,
  kind,
  initialCurated,
  charOptions,
  charNames,
  heroViews,
  refs,
}: {
  /** Slice éditée par cet outil. */
  slice: 'prosCons' | 'synergies';
  /** `kind` d'enveloppe correspondant (routage à l'import). */
  kind: ContributionKind;
  initialCurated: Record<string, EditorialSeed>;
  charOptions: CharOption[];
  charNames: Record<string, string>;
  heroViews: Record<string, HeroView>;
  refs: InlineRefs;
}) {
  const [pickMode, setPickMode] = useState<PickMode>('add');
  const [id, setId] = useState<string>('');
  const [pros, setPros] = useState<Keyed<LocalizedText>[]>([]);
  const [cons, setCons] = useState<Keyed<LocalizedText>[]>([]);
  const [synergies, setSynergies] = useState<Keyed<SynergyGroup>[]>([]);

  const charById = new Map(charOptions.map((c) => [c.id, c]));
  const heroName = charById.get(id)?.name ?? id;

  /** Le perso a-t-il DÉJÀ cette slice ? (répartit Add / Edit). */
  const hasSlice = (cid: string): boolean => {
    const seed = initialCurated[cid];
    return slice === 'prosCons'
      ? !!(seed?.prosCons?.pros?.length || seed?.prosCons?.cons?.length)
      : !!seed?.synergies?.length;
  };
  // Add → persos SANS la slice ; Edit → persos qui en ONT une.
  const options = charOptions.filter((c) =>
    pickMode === 'add' ? !hasSlice(c.id) : hasSlice(c.id),
  );

  /** Sélectionne un perso et seed son éditorial existant. */
  const pick = (cid: string) => {
    setId(cid);
    const seed = initialCurated[cid] ?? {};
    setPros((seed.prosCons?.pros ?? []).map(withKey));
    setCons((seed.prosCons?.cons ?? []).map(withKey));
    setSynergies((seed.synergies ?? []).map(withKey));
  };

  /** Bascule Add/Edit : on repart d'une sélection vierge. */
  const switchMode = (m: PickMode) => {
    setPickMode(m);
    setId('');
    setPros([]);
    setCons([]);
    setSynergies([]);
  };

  function exportSelected() {
    if (!id) return;
    const resolveHero = makeResolveHero(charNames);
    const cleanTexts = (list: Keyed<LocalizedText>[]): LocalizedText[] =>
      list.map(stripKey).filter((t) => Object.values(t).some((v) => v?.trim()));

    let payload: EditorialContributionPayload;
    let prefix: string;
    if (slice === 'prosCons') {
      payload = { id, prosCons: { pros: cleanTexts(pros), cons: cleanTexts(cons) } };
      prefix = 'pros-cons';
    } else {
      const cleanSyn = synergies
        .map((g) => ({ ...stripKey(g), heroes: g.heroes.map(resolveHero).filter(Boolean) }))
        .filter((g) => g.heroes.length);
      payload = { id, synergies: cleanSyn };
      prefix = 'synergies';
    }
    const envelope = makeContribution(kind, pickMode, payload);
    downloadJson(`${prefix}-${fileSlug(heroName)}.json`, envelope);
  }

  const what = slice === 'prosCons' ? 'pros / cons' : 'synergies';

  return (
    <div className="space-y-6">
      <div className="border-line bg-surface-raised/60 rounded-lg border p-3 text-sm">
        <p className="text-content">
          Pick a hero, write its <strong>{what}</strong> (in English), then click{' '}
          <strong>Export this hero</strong> and send the JSON file — it will be reviewed and
          integrated. Translations are handled on import.
        </p>
      </div>

      {/* Mode Add (no {what} yet) / Edit (already has {what}) */}
      <div className="border-line-subtle flex gap-1 border-b pb-2">
        {(['add', 'edit'] as const).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => switchMode(m)}
            className={`rounded-md px-3 py-1 text-sm capitalize ${m === pickMode ? 'bg-accent/20 text-accent font-semibold' : 'text-content-muted hover:bg-surface-overlay'}`}
          >
            {m === 'add' ? `Add (no ${what} yet)` : `Edit (has ${what})`}
          </button>
        ))}
      </div>

      {/* Grille de portraits (on choisit à la tête, pas au nom) */}
      <div className="space-y-2">
        <span className="text-content-subtle text-xs uppercase">
          {options.length} hero{options.length === 1 ? '' : 'es'}{' '}
          {pickMode === 'add' ? `without ${what}` : `with ${what}`}
        </span>
        {options.length === 0 ? (
          <p className="text-content-subtle text-sm">
            {pickMode === 'add' ? `Everyone already has ${what}.` : `No hero has ${what} yet.`}
          </p>
        ) : (
          <div className="border-line-subtle max-h-96 overflow-y-auto rounded-lg border p-2">
            <div className="flex flex-wrap gap-2">
              {options.map((c) => {
                const v = heroViews[c.id];
                const active = c.id === id;
                return (
                  <button
                    key={c.id}
                    type="button"
                    title={c.name}
                    onClick={() => pick(c.id)}
                    className={`flex w-16 flex-col items-center gap-0.5 rounded-lg border p-1 ${active ? 'border-accent bg-accent/10' : 'hover:border-line border-transparent'}`}
                  >
                    {v ? (
                      <CharacterPortrait
                        id={v.id}
                        name={v.name}
                        element={v.element}
                        classType={v.classType}
                        rarity={v.rarity}
                        size={48}
                        showName={false}
                      />
                    ) : (
                      <span className="bg-surface-overlay flex h-12 w-12 items-center justify-center rounded-lg text-[9px]">
                        ?
                      </span>
                    )}
                    <span className="text-content-strong w-full text-center text-[10px] leading-tight wrap-break-word">
                      {c.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {id ? (
        <>
          <EditorialFields
            lang="en"
            refs={refs}
            charNames={charNames}
            heroViews={heroViews}
            show={slice}
            pros={pros}
            cons={cons}
            synergies={synergies}
            onPros={setPros}
            onCons={setCons}
            onSynergies={setSynergies}
          />
          <div className="border-line-subtle flex items-center gap-3 border-t pt-4">
            <button
              type="button"
              className={btn}
              onClick={exportSelected}
              title="Download the hero being edited"
            >
              Export this hero
            </button>
          </div>
        </>
      ) : (
        <p className="text-content-subtle text-sm">Pick a hero to start.</p>
      )}
    </div>
  );
}
