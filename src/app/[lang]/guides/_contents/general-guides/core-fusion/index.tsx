/**
 * Guide « Core Fusion » — priorités de déblocage + review par héros fusion.
 * Les reviews et priorités sont ÉDITORIALES (transplant V2) ; TOUT le reste
 * dérive des tables du jeu : paires base ↔ fusion (plus de hack
 * `replace('2700','2000')`), coûts par palier (plus de [300,150…] en dur),
 * renommages de skills (remplace le cf-skill-names.json généré par la V2),
 * comparaison d'EE (données équipement V3).
 */
import { Fragment, type ReactNode } from 'react';
import type { Lang } from '@/lib/i18n/config';
import { getT } from '@/i18n';
import { lRec } from '@/lib/i18n/localize';
import { parseText, type ParseCtx } from '@/lib/parse-text';
import { characterDisplayName } from '@/lib/data/characters';
import {
  fusionSkillRenames,
  getCoreFusionPairs,
  type CoreFusionPair,
} from '@/lib/data/core-fusion';
import { Callout, Prose } from '@/components/guides/editorial/blocks';
import { HeroReviewCard } from '@/components/guides/editorial/reviews/HeroReviewCard';
import { PriorityTiers } from '@/components/guides/editorial/reviews/PriorityTiers';
import {
  EeComparison,
  FusionCostPills,
  SkillChangeRows,
  type SkillChangeRowData,
} from '@/components/guides/editorial/reviews/fusion';
import { LABELS } from './labels';
import { unlockOrder } from './priorities';
import { fusionReviews, type FusionReviewEntry } from './reviews';

const WHERE = 'core-fusion';

/** Libellés de slot (identiques V2, non localisés — noms techniques). */
const SLOT_LABEL: Record<string, string> = {
  s1: 'S1',
  s2: 'S2',
  s3: 'S3',
  chain: 'Chain / Dual',
};

/** Les `\n` éditoriaux → retours à la ligne (+ parse-text par segment). */
function withLineBreaks(text: string, ctx: ParseCtx): ReactNode {
  return text.split('\n').map((seg, i) => (
    <Fragment key={i}>
      {i > 0 && <br />}
      <span>{parseText(seg.trim(), ctx)}</span>
    </Fragment>
  ));
}

export default async function CoreFusionGuide({ lang }: { lang: Lang }) {
  const t = await getT(lang);
  const ctx: ParseCtx = { lang, t, strict: true };
  const L = (m: (typeof LABELS)[keyof typeof LABELS]): string => lRec(m, lang);

  // Paires du JEU, indexées par nom d'affichage EN (la clé de l'éditorial).
  // Une review sur un perso non-fusion (ou l'inverse : une fusion du jeu sans
  // review) signale un éditorial périmé — contrôlé au build.
  const pairs = getCoreFusionPairs();
  const pairByName = new Map(pairs.map((p) => [characterDisplayName(p.fusion, 'en'), p]));
  const reviewed = new Set(fusionReviews.map((r) => r.name));
  for (const p of pairs) {
    const name = characterDisplayName(p.fusion, 'en');
    if (!reviewed.has(name)) {
      console.warn(`core-fusion : « ${name} » (${p.fusion.id}) n'a pas encore de review`);
    }
  }

  const card = (entry: FusionReviewEntry): ReactNode => {
    const pair = pairByName.get(entry.name) as CoreFusionPair | undefined;
    if (!pair) {
      throw new Error(`${WHERE} : « ${entry.name} » n'est pas une core-fusion du jeu`);
    }
    const renames = new Map(fusionSkillRenames(pair).map((r) => [r.key, r]));
    const changeRows: SkillChangeRowData[] = [];
    for (const key of ['s1', 's2', 's3', 'chain'] as const) {
      const change = entry.changes?.[key];
      if (!change) continue;
      const rename = renames.get(key);
      changeRows.push({
        label: SLOT_LABEL[key],
        ...(rename
          ? {
              rename: {
                from: lRec(rename.from, lang) || rename.from.en,
                to: lRec(rename.to, lang) || rename.to.en,
              },
            }
          : {}),
        review: parseText(lRec(change, lang), ctx),
      });
    }
    return (
      <HeroReviewCard key={entry.name} character={pair.fusion} lang={lang}>
        <p className="text-content-muted text-sm whitespace-pre-line">
          {parseText(lRec(entry.review, lang), ctx)}
        </p>
        {changeRows.length > 0 && (
          <div className="space-y-2">
            <h4 className="m-0 text-sm font-semibold text-purple-300">{L(LABELS.skillChanges)}</h4>
            <SkillChangeRows rows={changeRows} />
          </div>
        )}
        {entry.changes?.passive && (
          <Callout accent="violet" label={L(LABELS.fusionPassive)}>
            {parseText(lRec(entry.changes.passive, lang), ctx)}
          </Callout>
        )}
        {entry.changes?.transcendence && (
          <Callout accent="amber" label={L(LABELS.transcendence)}>
            {parseText(lRec(entry.changes.transcendence, lang), ctx)}
          </Callout>
        )}
        <EeComparison
          baseId={pair.base.id}
          fusionId={pair.fusion.id}
          lang={lang}
          labels={{
            title: L(LABELS.exclusiveEquipment),
            base: L(LABELS.oldEE),
            coreFusion: L(LABELS.newEE),
            effect: 'Lv. 1',
            effectMax: 'Lv. 10',
          }}
        />
        <FusionCostPills
          info={pair.info}
          levels={entry.recommendedLevels}
          lang={lang}
          label={L(LABELS.recommendedLevel)}
          orLabel="or"
        />
      </HeroReviewCard>
    );
  };

  const tiers = [
    { title: L(LABELS.priority1st), entries: unlockOrder.first },
    { title: L(LABELS.priority2nd), entries: unlockOrder.second },
    { title: L(LABELS.priority3rd), entries: unlockOrder.third },
  ].filter((tier) => tier.entries.length > 0);
  // Comme en V2 : un seul palier rempli = pas besoin de le titrer.
  const showTitles = tiers.length > 1;

  return (
    <>
      <Prose>{withLineBreaks(L(LABELS.intro), ctx)}</Prose>
      <section className="border-line bg-surface-raised/60 space-y-6 rounded-2xl border p-6">
        <h2 className="text-content-strong m-0 text-center text-xl font-semibold">
          {L(LABELS.unlockPriority)}
        </h2>
        <PriorityTiers
          tiers={tiers.map((tier) => (showTitles ? tier : { entries: tier.entries }))}
          lang={lang}
          where={WHERE}
        />
      </section>
      {[...fusionReviews].sort((a, b) => a.name.localeCompare(b.name)).map(card)}
    </>
  );
}
