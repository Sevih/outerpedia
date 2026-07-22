import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Route } from 'next';
import glossariesJson from '@data/generated/glossaries.json';
import type { Glossaries, Skill } from '@datagen/contracts';
import { EntityDiffPanel } from '@/components/admin/EntityDiffPanel';
import { MonsterActions } from '@/components/admin/MonsterActions';
import { EntitySwitch } from '@/components/admin/EntitySwitch';
import { EffectChipsRow, type StatusMap } from '@/components/character/EffectChips';
import { SkillsSection } from '@/components/character/SkillsSection';
import type { CardSkill } from '@/components/character/SkillCard';
import { buildStatusMap, immunityChipEffects, monsterSkillViews } from '@/lib/skill-view';
import { mergeStatusEffects } from '@/lib/data/effects';
import { lRec } from '@/lib/i18n/localize';
import { expandRankContexts } from '@/lib/monster-stats';
import { MonsterStatsCard } from '@/components/admin/MonsterStatsCard';
import { entityReview, monsterArchiveOf } from '@/lib/admin/review-store';
import { monsterBossBadgeSrc, monsterIconSrc, monsterSlotSrc } from '@/lib/admin/monster-icon';
import { img } from '@/lib/images';
import {
  committedEncounters,
  committedMonsterSkills,
  committedMonsters,
  freshEncounters,
  freshMonsters,
  rankOptionAdminLabels,
  tooltipName,
} from '@/lib/admin/monster-store';
import { extractedMonsterBundle } from '@/lib/admin/review-store';

export const dynamic = 'force-dynamic';

const glossaries = glossariesJson as unknown as Glossaries;

/** Fiche extracteur d'un monstre : extraction fraîche, diff, actions — MÊMES
 * composants que la fiche perso (SkillCard + chips d'effets). */
export default async function ExtractorMonsterPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const bundle = extractedMonsterBundle(id);
  const committed = committedMonsters()[id];
  const m = bundle?.monster ?? committed;
  if (!m) notFound();

  const review = entityReview('monster', id);
  const archives = monsterArchiveOf(id);
  const committedSkills = committedMonsterSkills();
  const skills = m.skills
    .map((sid) => (bundle?.skills[sid] ?? committedSkills[sid]) as Skill | undefined)
    .filter((s): s is Skill => Boolean(s));

  // Déclencheur d'enrage RÉEL (`Monster.rage`, extrait de RageTemplet) : les
  // descs des skills rage_enterN sont écrites pour UNE variante du boss et
  // mentent sur les autres (422400671 : desc « 50 000 PV », réel 70 % PV) —
  // le palier i correspond à rage_enter(i+1).
  const rageLabel = (type: string): string | undefined => {
    const n = /^rage_enter(\d*)$/.exec(type);
    const step = n && m.rage?.steps[Number(n[1] || '1') - 1];
    if (!step) return undefined;
    const at =
      m.rage!.trigger === 'hp_rate'
        ? `at ${step.value / 10}% HP`
        : m.rage!.trigger === 'lose_hp_value'
          ? `every ${step.value.toLocaleString('en-US')} HP lost`
          : m.rage!.trigger === 'turn_count'
            ? `at turn ${step.value}`
            : `${m.rage!.trigger} ${step.value}`;
    return step.duration ? `${at} · ${step.duration} turns` : at;
  };

  // Skills pré-localisés (EN), MÊME rendu que les persos — vue « kit » monstre
  // (chips réattribuées par réf de desc, enrage fusionné). Icônes = sprites
  // bruts (les icônes de skills monstres ne sont pas dans le staging).
  const cardSkills: CardSkill[] = monsterSkillViews(skills).map(({ skill: s, effects }) => ({
    id: s.id,
    name: lRec(s.name, 'en') || s.id,
    desc: s.desc ? lRec(s.desc, 'en') : undefined,
    icon: s.icon,
    iconSrc: s.icon ? `/api/admin/sprite/${encodeURIComponent(s.icon)}` : undefined,
    typeLabel: [s.type, rageLabel(s.type)].filter(Boolean).join(' — '),
    targetLabel: [s.target, s.range].filter(Boolean).join(' · ') || undefined,
    maxLevel: s.maxLevel,
    levels: s.levels.map((l) => ({
      level: l.level,
      cool: l.cool,
      wgReduce: l.wgReduce,
      vars: l.vars,
    })),
    effects,
  }));
  const skillLabels = { cooldown: 'CD', wgr: 'WGR', level: 'Lv.', enhancement: 'Enhancement' };

  // Statuts des chips : ceux du kit + ceux des CARTES (chips curées en plus,
  // ex. chipAdd) + ceux des IMMUNITÉS — tooltips affichés en jeu ET types de
  // mécanique (BT_STUN, BT_COOL_CHARGE, ST_ATK…) résolus via le glossaire
  // d'effets ; seuls les irrésolus restent affichés bruts.
  const statuses: StatusMap = buildStatusMap(skills, 'en');
  mergeStatusEffects(
    statuses,
    cardSkills.flatMap((c) => c.effects ?? []),
    'en',
  );
  const { effects: immunityEffects, unresolved: unresolvedImmunities } = immunityChipEffects(m);
  mergeStatusEffects(statuses, immunityEffects, 'en');

  const allFresh = freshMonsters();

  // Rencontres : où (mode/donjon/aire), à quel niveau — champs DE l'entité
  // (spawns/summonedBy/linkedTo), les donjons résolus via encounters.json
  // (frais, repli committé pour un monstre retenu dont le donjon a disparu).
  // Un add jamais spawné est localisé via ses INVOCATEURS ou son kit lié.
  const enc = freshEncounters();
  const oldDungeons = committedEncounters();
  const spawns = (m.spawns ?? [])
    .map((s) => ({ ...s, ref: enc.dungeons[s.dungeon] ?? oldDungeons[s.dungeon] }))
    .filter((s) => s.ref)
    .sort((a, b) => a.level - b.level);
  const modeLabel = (mode: string) => enc.modes[mode]?.en ?? mode;
  // Contextes de stats : une rencontre réelle par spawn, dépliée par palier.
  const statContexts = spawns.flatMap((s) =>
    expandRankContexts(
      {
        level: s.level,
        label: `${modeLabel(s.ref!.mode)} · ${s.ref!.name.en || s.dungeon}`,
        adv: s.ref!.adv,
        bossHp: s.ref!.bossHp,
        ...(s.hpLines ? { hpLines: s.hpLines } : {}),
      },
      s.ref!.ranks,
    ),
  );
  const summoners = (m.summonedBy ?? []).map((sid) => ({ id: sid, m: allFresh[sid] }));
  const linked = (m.linkedTo ?? []).map((sid) => ({ id: sid, m: allFresh[sid] }));
  const summons = Object.values(allFresh)
    .filter((x) => x.summonedBy?.includes(m.id))
    .map((x) => ({ id: x.id, m: x }));

  return (
    <div className="max-w-4xl space-y-5">
      <div className="space-y-1">
        <h1 className="text-content-strong flex items-center gap-3 text-xl font-semibold">
          <span className="relative h-14 w-14 shrink-0">
            <img
              src={monsterSlotSrc(m.type)}
              alt=""
              aria-hidden
              className="absolute inset-0 h-full w-full rounded object-cover"
            />
            <img
              src={monsterIconSrc(m.icon)}
              alt=""
              aria-hidden
              className="absolute inset-[7%] h-[86%] w-[86%] rounded object-cover"
            />
            {monsterBossBadgeSrc(m.type) && (
              <img
                src={monsterBossBadgeSrc(m.type)}
                alt="boss"
                className="absolute -top-1 -left-1 h-[30%] w-auto drop-shadow-md"
              />
            )}
          </span>
          <span>
            {m.name.en || '(no name)'}
            {m.nickname?.en && (
              <span className="text-content-subtle ml-2 text-sm font-normal">{m.nickname.en}</span>
            )}
          </span>
        </h1>
        <p className="text-content-subtle flex flex-wrap items-center gap-x-1.5 text-sm">
          <span className="font-mono">{m.id}</span> · {m.type} ·
          <img
            src={img.element(m.element)}
            alt={m.element}
            title={m.element}
            className="h-4.5 w-4.5"
            width={18}
            height={18}
          />
          <img
            src={img.klass(m.class)}
            alt={m.class}
            title={m.class}
            className="h-4.5 w-4.5"
            width={18}
            height={18}
          />
          {m.subClass ? `/ ${m.subClass}` : ''} · {m.race} · {m.rarity}★
          {m.aiType ? ` · AI ${m.aiType}` : ''}
          {review.status === 'removed' && (
            <span className="text-warn ml-2">absent from fresh extraction (committed kept)</span>
          )}
        </p>
      </div>

      <EntitySwitch id={m.id} mode="extractor" entity="monsters" />

      {review.status === 'changed' && <EntityDiffPanel fields={review.fields} />}

      <MonsterActions
        id={m.id}
        isNew={review.status === 'added'}
        canVersion={review.status !== 'added'}
      />

      {archives.length > 0 && (
        <div className="border-line-subtle rounded-lg border p-3 text-sm">
          <p className="text-content-strong mb-1 text-xs font-semibold uppercase">
            Frozen versions (pinnable by guides)
          </p>
          <ul className="space-y-0.5">
            {archives.map((a) => (
              <li key={a.version} className="text-content-subtle text-xs">
                <code className="text-content">
                  {a.id}@{a.version}
                </code>{' '}
                — {a.committedAt.slice(0, 10)}, source {a.ref}
                {a.gameVersion ? `, game ${a.gameVersion}` : ''}
                {a.label ? ` — ${a.label}` : ''} · {Object.keys(a.skills).length} skill(s)
              </li>
            ))}
          </ul>
        </div>
      )}

      <section className="space-y-2">
        <h2 className="text-content-strong text-xs font-semibold uppercase">
          Encounters ({spawns.length})
        </h2>
        {spawns.length > 0 ? (
          <ul className="space-y-0.5 text-xs">
            {spawns.slice(0, 25).map((s, i) => (
              <li key={i} className="text-content-subtle">
                <span className="text-content">{modeLabel(s.ref!.mode)}</span>
                {' · '}
                {s.ref!.name.en || s.dungeon}
                {s.ref!.area?.en ? ` (${s.ref!.area.en})` : ''}
                {' · '}
                <span className="text-content">Lv {s.level}</span>
                {s.hpLines ? ` · ${s.hpLines} bars` : ''}
              </li>
            ))}
            {spawns.length > 25 && (
              <li className="text-content-subtle">… {spawns.length - 25} more</li>
            )}
          </ul>
        ) : summoners.length > 0 || linked.length > 0 ? (
          <p className="text-content-subtle text-xs">
            Never spawned directly —{' '}
            {summoners.length > 0 && (
              <>
                summoned by:{' '}
                {summoners.map((s, i) => (
                  <span key={s.id}>
                    {i > 0 && ', '}
                    <Link
                      href={`/admin/extractor/monsters/${s.id}` as Route}
                      className="text-content hover:underline"
                    >
                      {s.m?.name.en ?? s.id}
                    </Link>
                  </span>
                ))}
                .{' '}
              </>
            )}
            {linked.length > 0 && (
              <>
                linked to the kit of:{' '}
                {linked.map((s, i) => (
                  <span key={s.id}>
                    {i > 0 && ', '}
                    <Link
                      href={`/admin/extractor/monsters/${s.id}` as Route}
                      className="text-content hover:underline"
                    >
                      {s.m?.name.en ?? s.id}
                    </Link>
                  </span>
                ))}
                .{' '}
              </>
            )}
            Located via these monsters.
          </p>
        ) : (
          <p className="text-content-subtle text-xs">
            No spawn or summoner found (removed or upcoming content?).
          </p>
        )}
        {summons.length > 0 && (
          <p className="text-content-subtle text-xs">
            Summons:{' '}
            {summons.map((s, i) => (
              <span key={s.id}>
                {i > 0 && ', '}
                <Link
                  href={`/admin/extractor/monsters/${s.id}` as Route}
                  className="text-content hover:underline"
                >
                  {s.m?.name.en ?? s.id}
                </Link>
              </span>
            ))}
          </p>
        )}
      </section>

      <section className="space-y-2">
        <h2 className="text-content-strong text-xs font-semibold uppercase">Encounter stats</h2>
        <MonsterStatsCard
          stats={m.stats}
          scales={glossaries.statScales}
          spawns={statContexts}
          optionLabels={rankOptionAdminLabels(statContexts.flatMap((c) => c.options ?? []))}
          quirkMods={enc.bossQuirkMods}
        />
      </section>

      {(immunityEffects.length > 0 || unresolvedImmunities.length > 0) && (
        <section className="space-y-2">
          <h2 className="text-content-strong text-xs font-semibold uppercase">Immunities</h2>
          {immunityEffects.length > 0 && (
            <EffectChipsRow effects={immunityEffects} statuses={statuses} />
          )}
          {unresolvedImmunities.length > 0 && (
            <p className="text-content-subtle text-xs">
              ⚠ no entry in the effects glossary:{' '}
              {unresolvedImmunities
                .map((ref) => {
                  const name = /^\d+$/.test(ref) ? tooltipName(ref) : undefined;
                  return name ? `${ref} “${name}”` : ref;
                })
                .join(', ')}
            </p>
          )}
        </section>
      )}

      {/* Skills : MÊME rendu que le site (cartes, chips, niveaux, descs résolues). */}
      <SkillsSection skills={cardSkills} statuses={statuses} labels={skillLabels} />
    </div>
  );
}
