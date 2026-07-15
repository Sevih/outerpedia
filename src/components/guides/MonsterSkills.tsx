import type { Lang } from '@/lib/i18n/config';
import { img } from '@/lib/images';
import { levelAt } from '@/lib/skills';
import type { CardSkill } from '@/components/character/SkillCard';
import { SkillDescription } from '@/components/character/SkillDescription';
import { EffectChipsRow, type StatusMap } from '@/components/character/EffectChips';

/** Libellés déjà traduits. */
export interface MonsterSkillsLabels {
  cooldown: string;
}

/**
 * Compétences d'un MONSTRE, en LIGNES.
 *
 * Les fiches de personnages utilisent `SkillsSection` : une grille de cartes,
 * avec sélecteur de niveau et paliers d'amélioration. Rien de tout ça n'existe
 * chez un monstre — vérifié sur la donnée : les 92 compétences de monstres sont
 * TOUTES à `maxLevel: 1`, et aucune ne réduit la WG. La carte de perso appliquée
 * à un boss, c'est donc trois quarts de chrome vide et une description écrasée
 * dans une colonne étroite.
 *
 * D'où la ligne : l'icône, le nom, ses effets, et la description sur toute la
 * largeur — qui est ce qu'on vient lire dans un guide de boss.
 */
/**
 * Le CORPS d'un skill (nom, chips d'effet, cooldown/cible, description) — sans son
 * icône (portée par la ligne ou, en compact, par l'onglet). Réutilisé par les
 * lignes ci-dessous ET le mode compact des cartes de boss (onglets par icône).
 */
export function MonsterSkillBody({
  skill,
  statuses,
  labels,
  lang,
}: {
  skill: CardSkill;
  statuses: StatusMap;
  labels: MonsterSkillsLabels;
  lang: Lang;
}) {
  const lv = levelAt(skill.levels, 1);
  return (
    <div className="min-w-0 flex-1 space-y-1.5">
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
        <h4 className="text-content-strong text-sm font-semibold">{skill.name}</h4>
        {lv?.cool ? (
          <span className="border-line-subtle bg-surface-base text-content rounded border px-1.5 py-0.5 text-[11px]">
            {labels.cooldown} {lv.cool}
          </span>
        ) : null}
        {skill.targetLabel && (
          <span className="border-line-subtle bg-surface-base text-content rounded border px-1.5 py-0.5 text-[11px]">
            {skill.targetLabel}
          </span>
        )}
      </div>

      <EffectChipsRow effects={skill.effects ?? []} statuses={statuses} />

      {skill.desc && (
        <SkillDescription
          desc={skill.desc}
          vars={lv?.vars}
          lang={lang}
          className="text-content text-xs leading-relaxed whitespace-pre-line"
        />
      )}
    </div>
  );
}

export function MonsterSkills({
  skills,
  statuses,
  labels,
  lang,
}: {
  skills: CardSkill[];
  statuses: StatusMap;
  labels: MonsterSkillsLabels;
  lang: Lang;
}) {
  if (!skills.length) return null;

  return (
    <div className="flex flex-col gap-2">
      {skills.map((skill) => (
        <div
          key={skill.id}
          className="border-line-subtle bg-surface-raised flex items-start gap-3 rounded-lg border p-3"
        >
          {(skill.iconSrc || skill.icon) && (
            // eslint-disable-next-line @next/next/no-img-element -- asset R2/staging
            <img
              src={skill.iconSrc ?? img.skill(skill.icon!)}
              alt=""
              className="h-8 w-8 shrink-0 object-contain"
              loading="lazy"
            />
          )}
          <MonsterSkillBody skill={skill} statuses={statuses} labels={labels} lang={lang} />
        </div>
      ))}
    </div>
  );
}
