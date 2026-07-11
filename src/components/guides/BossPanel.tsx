/**
 * Panneau BOSS d'un guide — construit depuis les données monstres VALIDÉES
 * (`data/generated/monsters.json` + `monster-skills.json`) : en-tête (icône,
 * nom, élément/classe), stats interpolées au niveau de rencontre, immunités
 * (tooltips du jeu → encyclopédie des effets) et skills rendus par la MÊME
 * `SkillsSection` que les fiches personnage. Composant SERVEUR.
 */
import type { TranslationKey } from '@/i18n';
import { LANGUAGES, type Lang } from '@/lib/i18n/config';
import { getT } from '@/i18n';
import { lRec } from '@/lib/i18n/localize';
import { img } from '@/lib/images';
import { RANGE_TO_TARGET } from '@/lib/skills';
import {
  buildStatusMap,
  dedupSkills,
  immunityChipEffects,
  mergeStatusEffects,
  monsterSkillViews,
} from '@/lib/skill-view';
import { effectForTooltip, getMergedEffect } from '@/lib/data/effects';
import {
  getMonster,
  getMonsterSkills,
  getStatScales,
  monsterIconSrc,
  getBossQuirkMods,
  monsterSpawnContexts,
  rankOptionLabels,
} from '@/lib/data/monsters';
import { SkillsSection } from '@/components/character/SkillsSection';
import type { CardSkill } from '@/components/character/SkillCard';
import { EffectIconTile } from '@/components/character/EffectChips';
import { InlineIcon } from '@/components/inline/InlineIcon';
import { BossStats } from './BossStats';
import type { Skill } from '@contracts';

export async function BossPanel({ monsterId, lang }: { monsterId: string; lang: Lang }) {
  const monster = getMonster(monsterId);
  // Réf de contenu cassée = bug de guide : on casse le build, pas de repli muet.
  if (!monster) {
    throw new Error(
      `BossPanel : monstre « ${monsterId} » absent de data/generated/monsters.json — ` +
        `à extraire/valider via l'admin (Extractor › Monsters).`,
    );
  }

  const t = await getT(lang);
  const name = lRec(monster.name, lang);
  const spawns = monsterSpawnContexts(monster, lang);
  const skills = dedupSkills(getMonsterSkills(monster));
  const statuses = buildStatusMap(skills, lang);

  const targetLabel = (s: Skill): string | undefined => {
    const key = RANGE_TO_TARGET[s.range ?? ''];
    if (!key) return undefined;
    return t(`page.character.skill.target_${key}${s.offensive ? '' : '_ally'}` as TranslationKey);
  };
  // Vue « kit » monstre : chips réattribuées par réf de desc, enrage fusionné
  // (le rage_finish sans nom disparaît, ses chips rejoignent la carte enter).
  const cardSkills: CardSkill[] = monsterSkillViews(skills)
    .filter(({ skill: s }) => s.name.en)
    .map(({ skill: s, effects }) => ({
      id: s.id,
      name: lRec(s.name, lang),
      desc: s.desc ? lRec(s.desc, lang) : undefined,
      icon: s.icon,
      targetLabel: targetLabel(s),
      maxLevel: s.maxLevel,
      levels: s.levels.map((l) => ({
        level: l.level,
        cool: l.cool,
        wgReduce: l.wgReduce,
        vars: l.vars,
      })),
      effects,
    }));
  // Chips curées en plus (chipAdd) : leur statut n'est pas porté par les
  // skills eux-mêmes — résolu depuis les chips des cartes.
  mergeStatusEffects(
    statuses,
    cardSkills.flatMap((c) => c.effects ?? []),
    lang,
  );

  // Immunités : tooltips affichés en jeu + TYPES de mécanique (BT_STUN,
  // BT_COOL_CHARGE, ST_ATK…), résolus vers les effets canoniques
  // (immunityChipEffects — même logique que l'admin). Une réf non résolue
  // s'affiche en ROUGE (signal d'erreur de contenu, comme parse-text).
  const { effects: immunityRefs, unresolved } = immunityChipEffects(monster);
  const immunities = [
    ...immunityRefs.map((e) => ({
      tid: e.tooltip!,
      effect: effectForTooltip(e.tooltip!) ?? getMergedEffect(e.tooltip!),
    })),
    ...unresolved.map((tid) => ({ tid, effect: undefined })),
  ];

  return (
    <section className="space-y-4">
      <div className="flex items-center gap-4">
        {/* eslint-disable-next-line @next/next/no-img-element -- asset R2/staging */}
        <img
          src={monsterIconSrc(monster)}
          alt={name}
          className="border-line-subtle h-16 w-16 rounded-lg border object-cover"
        />
        <div>
          <h2 className="text-content-strong text-xl font-bold">{name}</h2>
          <div className="mt-1 flex items-center gap-2">
            {/* eslint-disable-next-line @next/next/no-img-element -- asset R2/staging */}
            <img src={img.element(monster.element)} alt={monster.element} className="h-5 w-5" />
            {/* eslint-disable-next-line @next/next/no-img-element -- asset R2/staging */}
            <img src={img.klass(monster.class)} alt={monster.class} className="h-5 w-5" />
          </div>
        </div>
      </div>

      <BossStats
        stats={monster.stats}
        scales={getStatScales()}
        spawns={spawns}
        quirkMods={getBossQuirkMods()}
        locale={LANGUAGES[lang].htmlLang}
        rankOptionLabels={rankOptionLabels(spawns, lang)}
        labels={{
          level: t('page.character.skill.level'),
          rank: t('guides.boss_display.rank'),
          damage: t('guides.boss_display.damage'),
          rankBar: t('guides.boss_display.rank_bar'),
          options: t('guides.boss_display.rank_options'),
        }}
      />

      {immunities.length > 0 && (
        <div className="space-y-1">
          <h3 className="text-content-strong text-sm font-semibold">
            {t('guides.boss_display.immunities')}
          </h3>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
            {immunities.map(({ tid, effect }) =>
              effect ? (
                <InlineIcon
                  key={tid}
                  iconNode={
                    <EffectIconTile
                      icon={effect.icon}
                      isDebuff={effect.isDebuff}
                      className="h-4.5 w-4.5"
                    />
                  }
                  label={lRec(effect.name, lang) || effect.name.en}
                  color={effect.isDebuff ? 'text-debuff' : 'text-buff'}
                  underline={false}
                />
              ) : (
                <span key={tid} className="text-red-500">
                  {tid}
                </span>
              ),
            )}
          </div>
        </div>
      )}

      {cardSkills.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-content-strong text-sm font-semibold">
            {t('guides.boss_display.skills')}
          </h3>
          <SkillsSection
            skills={cardSkills}
            statuses={statuses}
            labels={{
              cooldown: t('page.character.skill.cooldown'),
              wgr: t('page.character.skill.wgr'),
              level: t('page.character.skill.level'),
              enhancement: t('page.character.skill.enhancement'),
            }}
          />
        </div>
      )}
    </section>
  );
}
