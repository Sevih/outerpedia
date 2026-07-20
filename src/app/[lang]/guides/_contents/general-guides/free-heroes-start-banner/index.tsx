/**
 * Guide « Free Heroes & Starter Banners » — deux onglets : les héros gratuits
 * (par source) et la stratégie Custom Banner (picks recommandés).
 *
 * Server Component (les SegmentedTabs sont clients, leur CONTENU est rendu
 * serveur). La section « pas encore dans la Custom Banner » se DÉRIVE du pool
 * réel du jeu (data/generated/recruit.json) : réguliers 3★ absents du
 * pool — plus de liste éditoriale par exclusion comme en V2.
 */
import { Fragment, type ReactNode } from 'react';
import type { Lang } from '@/lib/i18n/config';
import { getT } from '@/i18n';
import { lRec } from '@/lib/i18n/localize';
import { localePath } from '@/lib/navigation';
import { parseText, type ParseCtx } from '@/lib/parse-text';
import {
  characterDisplayName,
  getAllCharacters,
  resolveGuideCharacter,
  slugForId,
  type GuideCharacter,
} from '@/lib/data/characters';
import { isInCustomRecruitPool } from '@/lib/data/recruit';
import { SegmentedTabs } from '@/components/guides/SegmentedTabs';
import { Callout, Prose, SectionHeading } from '@/components/guides/editorial/blocks';
import { CharacterGrid } from '@/components/guides/editorial/CharacterGrid';
import { LABELS } from './labels';
import { customBannerPicks, freeHeroesSources } from './recommended';

const WHERE = 'free-heroes-start-banner';

/** Tags qui excluent un perso du roster « régulier » recrutable. */
const SPECIAL_TAGS = new Set(['premium', 'limited', 'seasonal', 'collab', 'core-fusion']);

/** Les `\n` éditoriaux → retours à la ligne (+ parse-text par segment). */
function withLineBreaks(text: string, ctx?: ParseCtx): ReactNode {
  return text.split('\n').map((seg, i) => (
    <Fragment key={i}>
      {i > 0 && <br />}
      {ctx ? parseText(seg.trim(), ctx) : seg.trim()}
    </Fragment>
  ));
}

const TH = 'border-line border px-3 py-2';
const TD = 'border-line border px-3 py-2 align-middle';

export default async function FreeHeroesStartBannerGuide({ lang }: { lang: Lang }) {
  const t = await getT(lang);
  const ctx: ParseCtx = { lang, t, strict: true };
  const L = (m: (typeof LABELS)[keyof typeof LABELS]): string => lRec(m, lang);

  // Noms des héros gratuits (pour scinder les picks custom en gratuit / à pull).
  const freeHeroNames = new Set(
    freeHeroesSources.flatMap((s) => s.entries.flatMap((e) => e.names)),
  );

  // « Pas encore dans la Custom Banner » : réguliers 3★ hors du pool réel.
  const notYetInPool: GuideCharacter[] = getAllCharacters()
    .filter((c) => c.rarity === 3)
    .filter((c) => !(c.tags ?? []).some((tag) => SPECIAL_TAGS.has(tag)))
    .filter((c) => !isInCustomRecruitPool(c.id))
    .map((c) => {
      const slug = slugForId(c.id);
      return {
        character: c,
        name: characterDisplayName(c, lang),
        href: slug ? localePath(lang, `/characters/${slug}`) : undefined,
      };
    })
    .sort((a, b) => a.name.localeCompare(b.name));

  const freeTab = (
    <div className="space-y-6">
      <p className="text-content-subtle text-sm italic">{L(LABELS.freeNote)}</p>
      <div className="w-full overflow-x-auto">
        <table className="border-line mx-auto w-auto rounded-md border text-center text-sm">
          <thead className="bg-surface-raised">
            <tr>
              <th className={TH}>{L(LABELS.thSource)}</th>
              <th className={TH}>{L(LABELS.thCharacters)}</th>
              <th className={TH}>{L(LABELS.thDetails)}</th>
            </tr>
          </thead>
          <tbody>
            {freeHeroesSources.flatMap((source, si) =>
              source.entries.map((entry, ei) => (
                <tr key={`${si}-${ei}`} className="even:bg-surface-raised/40">
                  <td className={`${TD} text-content font-medium`}>
                    {withLineBreaks(lRec(source.source, lang))}
                  </td>
                  <td className={TD}>
                    <CharacterGrid names={entry.names} lang={lang} where={WHERE} />
                  </td>
                  <td className={`${TD} text-content max-w-90 text-left text-sm`}>
                    {entry.pickType === 'one' && (
                      <div className="mb-2 text-center">
                        <span className="text-lg font-bold text-amber-400 [text-shadow:0_0_10px_rgba(251,191,36,0.8)]">
                          {L(LABELS.chooseOne)}
                        </span>
                      </div>
                    )}
                    {withLineBreaks(lRec(entry.reason, lang), ctx)}
                  </td>
                </tr>
              )),
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  const customTab = (
    <div className="space-y-6">
      <SectionHeading accent="sky" title={L(LABELS.pullingStrategy)} />
      <Prose>{L(LABELS.pullingDesc)}</Prose>
      <p className="text-content-subtle text-sm italic">{L(LABELS.pullingNote)}</p>

      <SectionHeading accent="violet" title={L(LABELS.recommendedPicks)} />
      <div className="w-full overflow-x-auto">
        <table className="border-line mx-auto w-auto rounded-md border text-center text-sm">
          <thead className="bg-surface-raised">
            <tr>
              <th className={TH}>{L(LABELS.thRecommended)}</th>
              <th className={TH}>{L(LABELS.thFreeAvailable)}</th>
              <th className={TH}>{L(LABELS.thDetails)}</th>
            </tr>
          </thead>
          <tbody>
            {customBannerPicks.map((entry, i) => (
              <tr key={i} className="even:bg-surface-raised/40">
                <td className={TD}>
                  <CharacterGrid
                    names={entry.names.filter((n) => !freeHeroNames.has(n))}
                    lang={lang}
                    where={WHERE}
                  />
                </td>
                <td className={TD}>
                  <CharacterGrid
                    names={entry.names.filter((n) => freeHeroNames.has(n))}
                    lang={lang}
                    where={WHERE}
                  />
                </td>
                <td className={`${TD} text-content max-w-90 text-left text-sm`}>
                  {withLineBreaks(lRec(entry.reason, lang), ctx)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {notYetInPool.length > 0 && (
        <div className="space-y-4">
          <SectionHeading accent="rose" title={L(LABELS.notYetAvailable)} />
          <Prose>{L(LABELS.notYetDesc)}</Prose>
          <div className="flex justify-center">
            <CharacterGrid characters={notYetInPool} lang={lang} where={WHERE} cols={4} />
          </div>
        </div>
      )}
    </div>
  );

  // Contrôle au BUILD : chaque nom éditorial doit résoudre (les grilles le font
  // déjà ; les picks scindés en deux grilles pourraient laisser passer un nom
  // dans une grille vide — on force la résolution de tous).
  for (const entry of customBannerPicks) {
    for (const name of entry.names) resolveGuideCharacter(name, lang, WHERE);
  }

  return (
    <>
      <Prose>{L(LABELS.intro)}</Prose>
      <Callout accent="amber">{L(LABELS.warning)}</Callout>
      <SegmentedTabs
        urlKey="tab"
        variant="game"
        ariaLabel={`${L(LABELS.tabFree)} / ${L(LABELS.tabCustom)}`}
        tabs={[
          { key: 'free', label: L(LABELS.tabFree), content: freeTab },
          { key: 'custom', label: L(LABELS.tabCustom), content: customTab },
        ]}
      />
    </>
  );
}
