import Link from 'next/link';
import type { Route } from 'next';
import { notFound } from 'next/navigation';
import { CharacterCuratedEditor } from '@/components/admin/CharacterCuratedEditor';
import { EffectHiddenToggle } from '@/components/admin/EffectHiddenToggle';
import { EffectIconTile } from '@/components/character/EffectChips';
import { getMergedEffect, loadCuratedEffects } from '@/lib/data/effects';
import { CharacterVisual } from '@/components/admin/CharacterVisual';
import { EntityDiffPanel } from '@/components/admin/EntityDiffPanel';
import { IntegrateCharacterButton } from '@/components/admin/IntegrateCharacterButton';
import { V2ControlPanel } from '@/components/admin/V2ControlPanel';
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
import { GearRecoEditor, type GearRecoOptions } from '@/components/admin/GearRecoEditor';
import { gearSelectOptions } from '@/lib/admin/gear-options';
import { loadGearReco, loadGearPresets } from '@/lib/data/gear-reco';
import { characterDisplayName, getCharacter } from '@/lib/data/characters';
import { computeStatSteps } from '@/lib/data/char-progression';
import { getCharacterCurated } from '@/lib/data/curated';
import {
  characterV2Control,
  entityReview,
  extractedBundle,
  type ControlGlossaries,
} from '@/lib/admin/review-store';
import type { Glossaries, Skill } from '@contracts';
import glossariesData from '@data/generated/glossaries.json';

const G = glossariesData as unknown as Glossaries;

export default async function AdminCharacterExtractor({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  // La vue EXTRACTEUR montre l'extraction FRAÎCHE (la proposition), toujours.
  const bundle = extractedBundle(id);
  if (!bundle) notFound();
  const { char } = bundle;
  const skills = Object.values(bundle.skills) as Skill[];

  const committed = getCharacter(id);
  const isNew = !committed;
  const review = entityReview('character', id);
  const hasChanges = isNew || review.fields.length > 0;
  const control = characterV2Control(
    char as unknown as Record<string, unknown>,
    G as unknown as ControlGlossaries,
    skills,
    // Paliers de stats AFFICHÉS (même calcul que la fiche publique) — comparés
    // aux paliers de l'oracle V2 (character-stats.json).
    computeStatSteps(char).steps,
  );
  const curated = getCharacterCurated(id);

  // Skills pré-localisés (EN), MÊME rendu que le site. En cartes : les 3 mains
  // (variante complète si dupliqués) + fusion_passive/extra. Écartés :
  // class_passive (commun à tous), unique_passive (passifs de TRANSCENDANCE —
  // section dédiée à venir), strike_*/backup_* et bursts (vues chaîne/burst).
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
        className="w-full text-center text-[10px] leading-tight whitespace-pre-line text-zinc-200"
      />
    ) : null,
  }));
  const chainView = buildChainView(uniqueSkills, 'en');

  // Options des sélecteurs gear reco (helper partagé avec /admin/gear-presets).
  const presets = loadGearPresets();
  const gearOptions: GearRecoOptions = {
    ...gearSelectOptions(),
    presets: {
      talismans: presets.talismans,
      sets: Object.keys(presets.sets),
      substats: Object.keys(presets.substats),
    },
  };
  const gearInitial = loadGearReco()[id] ?? [];
  // Icônes + descs des chips depuis les effets FUSIONNÉS (mêmes tooltips que le site).
  const statuses = buildStatusMap(uniqueSkills, 'en');

  // Statuts référencés par le kit : bascule « ignoré du live » sans quitter la
  // fiche (écrit l'override curé de l'effet).
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
      {/* Statut d'intégration */}
      {isNew ? (
        <p className="border-accent/40 bg-accent/5 text-accent rounded-lg border p-3 text-sm font-medium">
          Nouveau — extrait du jeu, PAS ENCORE intégré. Vérifie ci-dessous puis intègre.
        </p>
      ) : review.fields.length === 0 ? (
        <p className="text-success text-sm">
          ✓ À jour — le committé correspond à l&apos;extraction.
        </p>
      ) : null}

      <CharacterVisual
        char={char}
        tags={[...(curated.tags ?? []), ...(char.originalCharacter ? ['core-fusion'] : [])]}
      />

      {/* Contrôle vs V2 : valeurs + reste à intégrer */}
      <V2ControlPanel control={control} />

      {/* Diff extraction ↔ committé */}
      <EntityDiffPanel fields={review.fields} />
      {hasChanges && <IntegrateCharacterButton id={id} isNew={isNew} />}

      {/* Ce que l'extraction produit : stats */}
      <section className="space-y-2">
        <h2 className="text-content-strong text-xs font-semibold uppercase">Stats (extraites)</h2>
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
            Statuts référencés ({refEffects.size})
          </h2>
          <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2 lg:grid-cols-3">
            {[...refEffects.entries()].map(([effId, e]) => (
              <div
                key={effId}
                className="border-line-subtle flex items-center gap-2 rounded-md border px-2 py-1.5"
              >
                {e.icon && <EffectIconTile icon={e.icon} isDebuff={e.isDebuff} />}
                <Link
                  href={`/admin/effects/${encodeURIComponent(effId)}` as Route}
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

      {/* Recos d'équipement (nouveau format curé, sélecteurs par id) */}
      <GearRecoEditor charId={id} initial={gearInitial} options={gearOptions} />

      {/* Costumes + profil, compacts */}
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

      {/* Champs manuels (curé) */}
      <section className="border-line-subtle border-t pt-4">
        <h2 className="text-content-strong mb-3 text-xs font-semibold uppercase">
          Champs manuels (curé)
        </h2>
        <CharacterCuratedEditor
          id={id}
          characterName={characterDisplayName(char)}
          initial={curated}
        />
      </section>
    </div>
  );
}
