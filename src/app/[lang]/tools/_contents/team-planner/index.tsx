import { getT } from '@/i18n';
import type { Lang } from '@/lib/i18n/config';
import { characterDisplayName, getAllCharacters } from '@/lib/data/characters';
import { mergeStatusEffects } from '@/lib/data/effects';
import { buildTeamKitView, dedupSkills, type TargetedChip } from '@/lib/skill-view';
import { isDebuffEffect, type StatusMap } from '@/components/character/EffectChips';
import type { Skill } from '@contracts';
import skillsData from '@data/generated/skills.json';
import eeData from '@data/generated/equipment/ee.json';
import passivesData from '@data/generated/equipment/passives.json';
import { TeamPlannerBrowser, type TpChar, type TpFx, type TpLabels } from './TeamPlannerBrowser';

/**
 * Team Planner — wrapper SERVEUR : construit le roster (noms localisés ICI, le
 * client ne localise rien) et, par perso, les effets de kit CLASSÉS PAR CIBLE
 * via `buildTeamKitView` (skill-view — mêmes règles de routage que les cartes
 * de la fiche) : buffs sur soi, buffs d'équipe, debuffs ennemis, apports du
 * burst, chaîne et duo. Le client ne reçoit que des RÉFS de statut + la
 * `StatusMap` résolue (nom/icône/nature/desc) — aucun moteur côté client.
 *
 * L'EE compte dans le kit de base (sections « Team Buffs/Debuffs »), comme la
 * clé `ee` du générateur skill-buffs V2.
 */

type RawEffect = NonNullable<Skill['effects']>[number];

const SKILLS = skillsData as unknown as Record<string, Skill>;
const EE = eeData as unknown as Record<string, { character?: string; passives?: { id: string }[] }>;
const PASSIVES = passivesData as unknown as Record<string, { effects?: RawEffect[] }>;

/** Cible alliée hors soi (l'équipe, un allié, le prochain de la chaîne…). */
const isTeamTarget = (t: string): boolean =>
  t.startsWith('my_team') || t === 'next_chain_striker' || t === 'me_n_one';
const isEnemyTarget = (t: string): boolean => t.startsWith('enemy');
const anyTarget = (): boolean => true;

/**
 * Réfs de statut d'un bucket, filtrées par NATURE affichée (statut résolu —
 * règle unique `isDebuffEffect`) et par cible, dédupliquées dans l'ordre.
 * Seuls les statuts nommés non `hidden` passent (règle des chips).
 */
function refsOf(
  chips: TargetedChip[],
  statuses: StatusMap,
  side: 'buff' | 'debuff',
  targetOk: (t: string) => boolean,
): string[] {
  const out: string[] = [];
  const seen = new Set<string>();
  for (const { chip, target } of chips) {
    if (!targetOk(target)) continue;
    const ref = chip.tooltip ?? chip.label;
    if (!ref || seen.has(ref)) continue;
    const st = statuses[ref];
    if (!st || st.hidden) continue;
    if ((side === 'debuff') !== isDebuffEffect(chip.category, st.isDebuff)) continue;
    seen.add(ref);
    out.push(ref);
  }
  return out;
}

export default async function TeamPlanner({ lang }: { lang: Lang }) {
  const t = await getT(lang);

  // Effets des passifs d'EE, rattachés au perso (tous niveaux : +1 et +10).
  const eeEffects = new Map<string, RawEffect[]>();
  for (const item of Object.values(EE)) {
    if (!item.character) continue;
    const effs = (item.passives ?? []).flatMap((ref) => PASSIVES[ref.id]?.effects ?? []);
    if (effs.length)
      eeEffects.set(item.character, [...(eeEffects.get(item.character) ?? []), ...effs]);
  }

  // Une passe : vues de kit + statuts référencés (map PARTAGÉE entre persos).
  const statuses: StatusMap = {};
  const chars: TpChar[] = [];
  const fxById: Record<string, TpFx> = {};
  const views = new Map<string, ReturnType<typeof buildTeamKitView>>();
  for (const c of getAllCharacters()) {
    const skills = dedupSkills(c.skills.map((id) => SKILLS[id]).filter(Boolean));
    const view = buildTeamKitView(skills, eeEffects.get(c.id) ?? []);
    views.set(c.id, view);
    mergeStatusEffects(
      statuses,
      [view.base, view.burst, view.chain, view.dual].flat().map((x) => x.chip),
      lang,
    );
    chars.push({
      id: c.id,
      label: characterDisplayName(c, lang),
      element: c.element,
      cls: c.class,
      rarity: c.rarity,
      chainType: c.chainType,
    });
  }
  chars.sort((a, b) => b.rarity - a.rarity || a.label.localeCompare(b.label));

  // Classement par cible/nature — la map des statuts doit être COMPLÈTE avant
  // (la nature affichée vient du statut résolu, pas de la catégorie brute).
  const used = new Set<string>();
  for (const [id, view] of views) {
    const fx: TpFx = {
      self: refsOf(view.base, statuses, 'buff', (tg) => tg === 'me'),
      team: refsOf(view.base, statuses, 'buff', isTeamTarget),
      debuff: refsOf(view.base, statuses, 'debuff', isEnemyTarget),
      burstBuff: refsOf(view.burst, statuses, 'buff', (tg) => tg === 'me' || isTeamTarget(tg)),
      burstDebuff: refsOf(view.burst, statuses, 'debuff', isEnemyTarget),
      chainBuff: refsOf(view.chain, statuses, 'buff', anyTarget),
      chainDebuff: refsOf(view.chain, statuses, 'debuff', anyTarget),
      dualBuff: refsOf(view.dual, statuses, 'buff', anyTarget),
      dualDebuff: refsOf(view.dual, statuses, 'debuff', anyTarget),
    };
    const all = Object.values(fx).flat();
    if (!all.length) continue;
    for (const ref of all) used.add(ref);
    fxById[id] = fx;
  }
  // La map envoyée au client ne porte que les statuts réellement référencés.
  const usedStatuses: StatusMap = {};
  for (const ref of used) usedStatuses[ref] = statuses[ref];

  const labels: TpLabels = {
    wip: t('tools.team-planner.wip'),
    teamNamePlaceholder: t('tools.team-planner.team_name.placeholder'),
    emptySlot: t('tools.team-planner.empty_slot'),
    pickCharacter: t('tools.team-planner.pick_character'),
    search: t('common.search'),
    all: t('common.all'),
    reset: t('tools.team-planner.reset'),
    share: t('tools.team-planner.share'),
    copied: t('common.copied'),
    chainOrder: t('tools.team-planner.chain_order'),
    chainOrderDesc: t('tools.team-planner.chain_order.desc'),
    chains: {
      start: t('characters.chains.starter'),
      join: t('characters.chains.companion'),
      finish: t('characters.chains.finisher'),
    },
    teamBuffs: t('tools.team-planner.team_buffs'),
    teamDebuffs: t('tools.team-planner.team_debuffs'),
    burstEffects: t('tools.team-planner.burst_effects'),
    dualAttackEffects: t('tools.team-planner.dual_attack_effects'),
    noEffects: t('tools.team-planner.no_effects'),
  };

  return <TeamPlannerBrowser chars={chars} fx={fxById} statuses={usedStatuses} labels={labels} />;
}
