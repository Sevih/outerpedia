import Link from 'next/link';
import type { Route } from 'next';
import { notFound } from 'next/navigation';
import { EffectHiddenToggle } from '@/components/admin/EffectHiddenToggle';
import { EffectIconTile } from '@/components/character/EffectChips';
import { getMergedEffect, loadCuratedEffects, mergeStatusEffects } from '@/lib/data/effects';
import { CharacterVisual } from '@/components/admin/CharacterVisual';
import { EntitySwitch } from '@/components/admin/EntitySwitch';
import { EntityDiffPanel } from '@/components/admin/EntityDiffPanel';
import { IntegrateCharacterButton } from '@/components/admin/IntegrateCharacterButton';
import { SkillsSection } from '@/components/character/SkillsSection';
import { BurstSection, type BurstCard } from '@/components/character/BurstSection';
import { ChainDualSection } from '@/components/character/ChainDualSection';
import { SkillDescription } from '@/components/character/SkillDescription';
import type { CardSkill } from '@/components/character/SkillCard';
import {
  buildBurstViews,
  buildChainView,
  buildStatusMap,
  cardEffects,
  dedupSkills,
  mainSkills,
} from '@/lib/skill-view';
import { img } from '@/lib/images';
import { lRec } from '@/lib/i18n/localize';
import { statAbbr } from '@/lib/stats';
import { getCharacter } from '@/lib/data/characters';
import { getCharacterCurated } from '@/lib/data/curated';
import { entityReview, extractedBundle } from '@/lib/admin/review-store';
import { diffLabels, skillLabel } from '@/lib/admin/diff-labels';
import type { Glossaries, LocalizedText, Skill } from '@contracts';
import glossariesData from '@data/generated/glossaries.json';
import committedSkillsData from '@data/generated/skills.json';
import setsData from '@data/generated/equipment/sets.json';

const G = glossariesData as unknown as Glossaries;
const COMMITTED_SKILLS = committedSkillsData as unknown as Record<string, Skill>;
const SETS = setsData as unknown as Record<string, { name: LocalizedText }>;

/**
 * VUE EXTRACTOR d'un perso : l'extraction FRAÎCHE (la proposition) + le contrôle
 * (statut, V2, diff vs committé, intégration). Lecture/vérification. La curation
 * vit côté Editor (bascule en haut).
 */
export default async function ExtractorCharacterDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const bundle = extractedBundle(id);
  if (!bundle) notFound();
  const { char } = bundle;
  const skills = Object.values(bundle.skills) as Skill[];

  const committed = getCharacter(id);
  const isNew = !committed;
  const review = entityReview('character', id);
  const hasChanges = isNew || review.fields.length > 0;
  const curated = getCharacterCurated(id);

  // Skills pré-localisés (EN), MÊME rendu que le site. En cartes : les 3 mains
  // (variante complète si dupliqués) + fusion_passive/extra.
  const uniqueSkills = dedupSkills(skills);
  const cardList = [
    ...mainSkills(uniqueSkills),
    ...uniqueSkills.filter((s) => s.type === 'fusion_passive' || s.type === 'extra'),
  ];
  const cardSkills: CardSkill[] = cardList.map((s) => ({
    id: s.id,
    name: lRec(s.name, 'en'),
    desc: s.desc ? lRec(s.desc, 'en') : undefined,
    icon: s.icon,
    burst: Boolean(s.burstAP?.length),
    typeLabel: s.type,
    targetLabel: [s.target, s.range].filter(Boolean).join(' · ') || undefined,
    maxLevel: s.maxLevel,
    levels: s.levels.map((l) => ({
      level: l.level,
      cool: l.cool,
      wgReduce: l.wgReduce,
      vars: l.vars,
      upgrades: l.upgrades?.map((u) => lRec(u, 'en')).filter(Boolean),
    })),
    effects: cardEffects(uniqueSkills, s),
  }));
  const skillLabels = { cooldown: 'CD', wgr: 'WGR', level: 'Lv.', enhancement: 'Enhancement' };

  // Bursts + chaîne & duo : mêmes vues que le site (EN).
  const burstCards: BurstCard[] = buildBurstViews(uniqueSkills, 'en').map((b) => ({
    level: b.level,
    cost: b.cost,
    effect: b.desc ? (
      <SkillDescription
        desc={b.desc}
        vars={b.vars}
        className="text-content w-full text-center text-[10px] leading-tight whitespace-pre-line"
      />
    ) : null,
  }));
  const chainView = buildChainView(uniqueSkills, 'en');
  const statuses = buildStatusMap(uniqueSkills, 'en');
  // Chips CURÉES en plus (chipAdd) : statut résolu depuis les chips des cartes
  // (même passe que la fiche publique et BossPanel).
  mergeStatusEffects(
    statuses,
    [
      ...cardSkills.flatMap((c) => c.effects ?? []),
      ...(chainView ? [...chainView.chainEffects, ...chainView.dualEffects] : []),
    ],
    'en',
  );

  // Libellés du diff : un écart de liste de skills est indécidable en ids nus.
  // L'id qui DISPARAÎT n'existe que côté committé (`skills.json`), celui qui
  // apparaît que côté extraction — d'où les deux sources.
  const labels = diffLabels(review.fields, {
    skills: (sid) => skillLabel((bundle.skills[sid] as Skill | undefined) ?? COMMITTED_SKILLS[sid]),
    recommendedSets: (sid) => (SETS[sid] ? lRec(SETS[sid].name, 'en') : undefined),
  });

  // Statuts référencés par le kit : lien encyclopédie + bascule « ignoré du live ».
  const curatedEffects = loadCuratedEffects();
  const refEffects = new Map<
    string,
    { name: string; icon?: string; isDebuff: boolean; hidden: boolean }
  >();
  for (const s of uniqueSkills)
    for (const e of s.effects ?? []) {
      const effId = e.tooltip ? G.effectByTooltip[e.tooltip] : e.label && G.effectByLabel[e.label];
      if (!effId || refEffects.has(effId)) continue;
      const eff = getMergedEffect(effId);
      if (eff)
        refEffects.set(effId, {
          name: eff.name.en || effId,
          icon: eff.icon || undefined,
          isDebuff: eff.isDebuff,
          hidden: eff.hidden,
        });
    }

  return (
    <div className="space-y-5">
      <EntitySwitch id={id} mode="extractor" entity="characters" />

      {/* Statut d'intégration */}
      {isNew ? (
        <p className="border-accent/40 bg-accent/5 text-accent rounded-lg border p-3 text-sm font-medium">
          New — extracted from the game, NOT YET integrated. Check below then integrate.
        </p>
      ) : review.fields.length === 0 ? (
        <p className="text-success text-sm">
          ✓ Up to date — the committed version matches the extraction.
        </p>
      ) : null}

      <CharacterVisual char={char} tags={[...(char.tags ?? []), ...(curated.tags ?? [])]} />

      {/* Ce que la DÉTECTION a produit — la partie « tags » de l'extraction. */}
      <section className="space-y-2">
        <h2 className="text-content-strong text-xs font-semibold uppercase">Tags (detected)</h2>
        {char.tags?.length ? (
          <div className="flex flex-wrap items-center gap-1.5">
            {char.tags.map((t) => (
              <span
                key={t}
                className="border-line-subtle text-content rounded border px-2 py-0.5 text-xs"
              >
                {t}
                {t === 'ignore-defense' && char.ignoreDefense && (
                  <span className="text-content-subtle"> · {char.ignoreDefense.join(' + ')}</span>
                )}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-content-subtle text-sm">No tag derived from the game data.</p>
        )}
        <p className="text-content-subtle text-xs">
          Acquisition ← banner (RecruitGroupTemplet) · ignore-defense ← penetration buffs
          (kit/EE/transcendence) · core-fusion ← lineage. The only human tag (<code>free</code>)
          lives on the Editor side.
        </p>
      </section>

      {/* Diff extraction ↔ committé */}
      <EntityDiffPanel fields={review.fields} labels={labels} />
      {hasChanges && <IntegrateCharacterButton id={id} isNew={isNew} />}

      {/* Ce que l'extraction produit : stats */}
      <section className="space-y-2">
        <h2 className="text-content-strong text-xs font-semibold uppercase">Stats (extracted)</h2>
        <div className="grid grid-cols-2 gap-2 text-sm sm:grid-cols-4">
          {Object.entries(char.stats).map(([key, r]) => (
            <div key={key} className="border-line-subtle rounded-md border px-3 py-1.5">
              <div className="text-content-subtle text-xs">{statAbbr(key)}</div>
              <div className="text-content">{r.min === r.max ? r.max : `${r.min} – ${r.max}`}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Ce que l'extraction produit : skills (descs résolues, chips, niveaux) */}
      <SkillsSection skills={cardSkills} statuses={statuses} labels={skillLabels} />

      {/* Statuts du kit : lien vers l'encyclopédie + bascule « ignoré du live » */}
      {refEffects.size > 0 && (
        <section className="space-y-2">
          <h2 className="text-content-strong text-xs font-semibold uppercase">
            Referenced statuses ({refEffects.size})
          </h2>
          <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2 lg:grid-cols-3">
            {[...refEffects.entries()].map(([effId, e]) => (
              <div
                key={effId}
                className="border-line-subtle flex items-center gap-2 rounded-md border px-2 py-1.5"
              >
                {e.icon && <EffectIconTile icon={e.icon} isDebuff={e.isDebuff} />}
                <Link
                  href={`/admin/editor/effects/${encodeURIComponent(effId)}` as Route}
                  className="text-content hover:text-accent min-w-0 flex-1 truncate text-sm"
                >
                  {e.name}
                </Link>
                <EffectHiddenToggle
                  effectId={effId}
                  curated={curatedEffects[effId] ?? {}}
                  initialHidden={e.hidden}
                />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Bursts + chaîne & duo, mêmes rendus que le site */}
      {burstCards.length > 0 && (
        <section className="space-y-2">
          <h2 className="text-content-strong text-xs font-semibold uppercase">Burst</h2>
          <BurstSection bursts={burstCards} />
        </section>
      )}
      {chainView && (
        <section className="space-y-2">
          <h2 className="text-content-strong text-xs font-semibold uppercase">Chain & Dual</h2>
          <ChainDualSection
            {...chainView}
            iconSrc={img.chain(char.element, char.chainType ?? 'start')}
            statuses={statuses}
            labels={{ ...skillLabels, dualWgr: 'Dual WGR' }}
          />
        </section>
      )}

      {/* Costumes, compacts */}
      {char.costumes && char.costumes.length > 0 && (
        <section className="space-y-1">
          <h2 className="text-content-strong text-xs font-semibold uppercase">
            Costumes ({char.costumes.length})
          </h2>
          <ul className="text-content-muted grid grid-cols-2 gap-1 text-sm sm:grid-cols-3">
            {char.costumes.map((c) => (
              <li key={c.id}>{lRec(c.name, 'en')}</li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
