/**
 * Guide « How Quirks Work » (quirk / Awakening) — 3 onglets : Guide (concept
 * porté tel quel), Quirk Trees (arbres DÉRIVÉS de `quirks.json`), FAQ.
 *
 * La prose est éditoriale (labels.ts, tags parse-text strict). Les ARBRES —
 * nœuds, connexions, coûts + effets par niveau — DÉRIVENT du jeu
 * (`CharacterAwakeningNodeTemplet` & co, cf. générateur `quirks.ts`). Server
 * Component ; la navigation d'arbres + le survol vivent dans des composants client.
 */
import { Fragment, type ReactNode } from 'react';
import type { Lang } from '@/lib/i18n/config';
import { getT } from '@/i18n';
import { lRec } from '@/lib/i18n/localize';
import { parseText, type ParseCtx } from '@/lib/parse-text';
import { SegmentedTabs, type TabItem } from '@/components/guides/SegmentedTabs';
import { Prose, Callout, MiniPanel, QACard } from '@/components/guides/editorial/blocks';
import type { EditorialAccent } from '@/components/guides/editorial/accents';
import type { LocalizedText, QuirksData } from '@contracts';
import quirksRaw from '@data/generated/quirks.json';
import { LABELS, TERMS, ICON_TERM } from './labels';
import { QuirkTrees, type LocalCategory } from '@/components/quirks/QuirkTrees';
import {
  collectQuirkMaterials,
  localizeTree,
  quirkTreeLabels,
  quirkTreeSubLabel,
} from '@/components/quirks/localize';

const quirks = quirksRaw as unknown as QuirksData;

/** Nom localisé des catégories (par clé de groupe). */
const CATEGORY_TERM: Record<string, keyof typeof TERMS> = {
  pve: 'counteractStrongEnemies',
  class: 'classEnhancement',
  elemental: 'elementEnhancement',
  utility: 'utility',
  adventure: 'adventureLicense',
};
const CATEGORY_ACCENT: Record<string, EditorialAccent> = {
  pve: 'rose',
  class: 'amber',
  elemental: 'sky',
  utility: 'emerald',
  adventure: 'violet',
};
const CATEGORY_DESC: Record<string, LocalizedText> = {
  pve: LABELS.catCounteract,
  class: LABELS.catClass,
  elemental: LABELS.catElement,
  utility: LABELS.catUtility,
  adventure: LABELS.catAdventure,
};

export default async function QuirkGuide({ lang }: { lang: Lang }) {
  const t = await getT(lang);
  const ctx: ParseCtx = { lang, t, strict: true };
  const L = (m: LocalizedText): string => lRec(m, lang) || m.en || '';
  const P = (m: LocalizedText): ReactNode => parseText(L(m), ctx);

  /** parseText + résolution des {ICON_XXX} en terme de catégorie (gras). */
  const PQ = (m: LocalizedText): ReactNode => {
    const text = L(m);
    const out: ReactNode[] = [];
    const re = /\{(ICON_[A-Z_]+)\}/g;
    let last = 0;
    let i = 0;
    let mt: RegExpExecArray | null;
    while ((mt = re.exec(text)) !== null) {
      if (mt.index > last)
        out.push(<Fragment key={i++}>{parseText(text.slice(last, mt.index), ctx)}</Fragment>);
      const term = ICON_TERM[mt[1]];
      out.push(
        <strong key={i++} className="text-content-strong font-semibold">
          {term ? L(TERMS[term]) : mt[1]}
        </strong>,
      );
      last = mt.index + mt[0].length;
    }
    if (last < text.length)
      out.push(<Fragment key={i++}>{parseText(text.slice(last), ctx)}</Fragment>);
    return <>{out}</>;
  };

  // ── Arbres localisés + catalogue des matériaux (module quirks partagé) ──
  const categories: LocalCategory[] = quirks.categories.map((c) => ({
    key: c.key,
    label: L(TERMS[CATEGORY_TERM[c.key]]),
    trees: c.trees.map((tr) => ({
      label: quirkTreeSubLabel(c.key, tr.key, lang) ?? L(TERMS[CATEGORY_TERM[c.key]]),
      tree: localizeTree(tr, lang),
    })),
  }));
  const materials = collectQuirkMaterials(quirks, lang);

  // ════════════════════════════ Onglet : Guide ════════════════════════════
  const guidePanel = (
    <div className="space-y-5 text-sm">
      <div className="space-y-2">
        <h3 className="text-content-strong font-semibold">{L(LABELS.categoryOverview)}</h3>
        <div className="grid gap-2.5 sm:grid-cols-2">
          {quirks.categories.map((c) => (
            <MiniPanel
              key={c.key}
              accent={CATEGORY_ACCENT[c.key]}
              title={L(TERMS[CATEGORY_TERM[c.key]])}
            >
              {L(CATEGORY_DESC[c.key])}
            </MiniPanel>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="text-content-strong font-semibold">{L(LABELS.howItWorks)}</h3>
        <ul className="text-content list-disc space-y-1.5 pl-5">
          <li>{L(LABELS.howP1)}</li>
          <li>{PQ(LABELS.howP2)}</li>
          <li>{P(LABELS.howP3)}</li>
          <li>{P(LABELS.howP4)}</li>
        </ul>
      </div>

      <div className="space-y-2">
        <h3 className="text-content-strong font-semibold">{L(LABELS.upgradingPriority)}</h3>
        <Prose>{PQ(LABELS.priorityP1)}</Prose>
        <Prose>{PQ(LABELS.priorityP2)}</Prose>
        <Prose>{PQ(LABELS.priorityP3)}</Prose>
        <Prose>{PQ(LABELS.priorityP4)}</Prose>
      </div>

      <Callout accent="sky" label={L(LABELS.earlyGameExample)}>
        <div className="space-y-1.5">
          <p className="m-0">{P(LABELS.exampleIntro)}</p>
          <ul className="m-0 list-disc space-y-1 pl-5">
            <li>{P(LABELS.exampleP1)}</li>
            <li>{P(LABELS.exampleP2)}</li>
            <li>{P(LABELS.exampleP3)}</li>
          </ul>
          <p className="m-0">{L(LABELS.exampleOutro)}</p>
        </div>
      </Callout>
    </div>
  );

  // ════════════════════════════ Onglet : Arbres ════════════════════════════
  const treesPanel = (
    <div className="space-y-3 text-sm">
      <Prose>{L(LABELS.treesIntro)}</Prose>
      <QuirkTrees
        categories={categories}
        materials={materials}
        treeLabels={quirkTreeLabels(lang)}
      />
      <p className="text-content-subtle text-xs italic">{L(LABELS.treeResetNote)}</p>
    </div>
  );

  // ═════════════════════════════ Onglet : FAQ ═════════════════════════════
  const faqPanel = (
    <div className="space-y-3 text-sm">
      <QACard accent="sky" question={L(LABELS.faqRespecTitle)}>
        <Prose>{P(LABELS.faqRespecContent)}</Prose>
      </QACard>
      <QACard accent="amber" question={L(LABELS.faqSubnodesTitle)}>
        <Prose>{L(LABELS.faqSubnodesP1)}</Prose>
        <Prose>{PQ(LABELS.faqSubnodesP2)}</Prose>
      </QACard>
      <QACard accent="rose" question={L(LABELS.faqSkipTitle)}>
        <Prose>{L(LABELS.faqSkipIntro)}</Prose>
        <ul className="text-content list-disc space-y-1 pl-5">
          <li>{P(LABELS.faqSkipHealers)}</li>
          <li>{P(LABELS.faqSkipDefenders)}</li>
          <li>{P(LABELS.faqSkipTactician)}</li>
          <li>{P(LABELS.faqSkipDmgRed)}</li>
        </ul>
      </QACard>
      <QACard accent="emerald" question={L(LABELS.faqMaterialsTitle)}>
        <ul className="text-content list-disc space-y-1 pl-5">
          <li>{P(LABELS.faqMaterialProofDestiny)}</li>
          <li>{P(LABELS.faqMaterialTokenConnection)}</li>
          <li>{P(LABELS.faqMaterialProofWorth)}</li>
        </ul>
      </QACard>
    </div>
  );

  const tabs: TabItem[] = [
    { key: 'guide', label: L(LABELS.tab_guide), content: guidePanel },
    { key: 'trees', label: L(LABELS.tab_trees), content: treesPanel },
    { key: 'faq', label: L(LABELS.tab_faq), content: faqPanel },
  ];

  return (
    <>
      <Prose>{P(LABELS.introP1)}</Prose>
      <Prose>{P(LABELS.introP2)}</Prose>
      <SegmentedTabs tabs={tabs} ariaLabel={L(LABELS.title)} urlKey="tab" variant="game" />
    </>
  );
}
