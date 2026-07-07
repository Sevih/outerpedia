import { Fragment } from 'react';
import { img } from '@/lib/images';
import { SkillCard, type CardSkill, type SkillCardLabels } from './SkillCard';
import type { StatusMap } from './EffectChips';

/** Étape de la priorité de montée (pré-localisée). */
export interface PriorityStep {
  name: string;
  icon?: string;
}

/** Bloc « Skill Upgrade Priority » pré-localisé. */
export interface SkillPriority {
  title: string;
  steps: PriorityStep[];
  ruleTitle: string;
  rules: string[];
  ruleChain: string;
}

/**
 * Section Compétences (portage V2) : priorité de montée éventuelle puis grille
 * 3 colonnes de SkillCard. Composant SERVEUR — tout arrive pré-localisé, seule
 * la carte (sélecteur de niveau) est cliente.
 */
export function SkillsSection({
  skills,
  statuses,
  labels,
  priority,
}: {
  skills: CardSkill[];
  statuses: StatusMap;
  labels: SkillCardLabels;
  priority?: SkillPriority | null;
}) {
  if (!skills.length) return null;

  return (
    <div className="flex flex-col gap-6">
      {priority && priority.steps.length > 0 && (
        <div className="mx-auto max-w-2xl text-center">
          <div className="font-game text-lg font-bold">{priority.title}</div>
          <div className="mt-3 flex flex-wrap items-start justify-center gap-3 text-sm">
            {priority.steps.map((step, i) => (
              <Fragment key={i}>
                {i > 0 && (
                  // eslint-disable-next-line @next/next/no-img-element -- asset R2/staging
                  <img src={img.chainArrow()} alt="→" width={24} height={24} className="mt-2.5" />
                )}
                <span className="flex flex-col items-center gap-1">
                  {step.icon && (
                    // eslint-disable-next-line @next/next/no-img-element -- asset R2/staging
                    <img src={img.skill(step.icon)} alt={step.name} width={36} height={36} />
                  )}
                  <span className="text-xs font-semibold text-yellow-300">{step.name}</span>
                </span>
              </Fragment>
            ))}
          </div>
          <div className="mt-4 border-l-2 border-amber-400/70 bg-amber-400/5 px-4 py-3 text-left">
            <p className="mb-2 text-xs font-semibold text-yellow-100/90">{priority.ruleTitle}</p>
            <ul className="ml-4 list-inside list-disc space-y-1 text-xs text-yellow-100/90">
              {priority.rules.map((r, i) => (
                <li key={i}>{r}</li>
              ))}
            </ul>
            <p className="mt-3 text-xs text-yellow-100/90">{priority.ruleChain}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {skills.map((skill) => (
          <SkillCard key={skill.id} skill={skill} statuses={statuses} labels={labels} />
        ))}
      </div>
    </div>
  );
}
