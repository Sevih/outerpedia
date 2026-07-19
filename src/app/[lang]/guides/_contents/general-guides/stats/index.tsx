/**
 * Guide « Stats & Combat Mechanics » — 3 onglets : Basic Stats (glossaire des
 * stats), Combat Basics (système de priorité), FAQ (formules).
 *
 * Guide ÉDITORIAL : la prose vit dans labels.ts (5 langues) ; les entités de jeu
 * sont des tags parse-text strict ({S/…} stats, {B/…}/{D/…} effets, {SK/…|S1}
 * skills, {P/…} persos) — le glossaire stats/effets et les fiches persos/skills
 * étant déjà dérivés du jeu. Server Component.
 */
import { Fragment, type ReactNode } from 'react';
import type { Lang } from '@/lib/i18n/config';
import { getT } from '@/i18n';
import { lRec } from '@/lib/i18n/localize';
import { parseText, type ParseCtx } from '@/lib/parse-text';
import { SegmentedTabs, type TabItem } from '@/components/guides/SegmentedTabs';
import { SectionHeading, Prose, Callout } from '@/components/guides/editorial/blocks';
import { EDITORIAL_ACCENT, type EditorialAccent } from '@/components/guides/editorial/accents';
import { img } from '@/lib/images';
import type { LocalizedText } from '@contracts';
import { LABELS } from './labels';

/** Carte de stat repliable (<details> natif, rendu serveur). */
function StatCard({
  abbr,
  desc,
  ctx,
  children,
}: {
  abbr: string;
  desc: string;
  ctx: ParseCtx;
  children: ReactNode;
}) {
  return (
    <details className="border-line-subtle bg-surface-overlay group rounded-lg border">
      <summary className="flex cursor-pointer list-none items-center gap-3 p-3">
        <span className="text-sm font-semibold">{parseText(`{S/${abbr}}`, ctx)}</span>
        <span className="text-content-muted min-w-0 flex-1 truncate text-xs">{desc}</span>
        <span className="text-content-subtle shrink-0 transition-transform group-open:rotate-180">
          ▾
        </span>
      </summary>
      <div className="border-line-subtle text-content-muted space-y-2 border-t p-3 text-sm">
        {children}
      </div>
    </details>
  );
}

/** Groupe de stats titré. */
function StatGroup({
  accent,
  title,
  children,
}: {
  accent: EditorialAccent;
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="space-y-2.5">
      <SectionHeading accent={accent} title={title} />
      <div className="space-y-2">{children}</div>
    </section>
  );
}

/** Carte de contenu opaque, titre optionnel (équivalent V3 du `ContentCard`). */
function Card({
  accent,
  title,
  children,
}: {
  accent: EditorialAccent;
  title?: string;
  children: ReactNode;
}) {
  return (
    <div
      className={`border-line-subtle bg-surface-overlay text-content-muted rounded-lg border border-t-2 px-3.5 py-3 ${EDITORIAL_ACCENT[accent].borderT}`}
    >
      {title && <div className="text-content-strong mb-2 text-sm font-semibold">{title}</div>}
      {children}
    </div>
  );
}

/** Bloc repliable simple (<details> serveur) à en-tête textuel. */
function Collapse({ label, children }: { label: ReactNode; children: ReactNode }) {
  return (
    <details className="border-line-subtle bg-surface-overlay group rounded-lg border">
      <summary className="text-content flex cursor-pointer list-none items-center gap-2 p-3 text-sm font-semibold">
        <span className="text-content-subtle shrink-0 transition-transform group-open:rotate-180">
          ▾
        </span>
        {label}
      </summary>
      <div className="border-line-subtle text-content-muted space-y-2 border-t p-3 text-sm">
        {children}
      </div>
    </details>
  );
}

export default async function StatsGuide({ lang }: { lang: Lang }) {
  const t = await getT(lang);
  const ctx: ParseCtx = { lang, t, strict: true };
  const L = (m: LocalizedText): string => lRec(m, lang) || m.en || '';

  /** Rend une chaîne : tags parse-text + emphases `**gras**` + `code` (backticks). */
  const P = (m: LocalizedText): ReactNode => {
    const text = L(m);
    if (!text) return null;
    return text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g).map((part, i) => {
      const b = /^\*\*([^*]+)\*\*$/.exec(part);
      if (b)
        return (
          <strong key={i} className="text-content-strong font-semibold">
            {parseText(b[1], ctx)}
          </strong>
        );
      const c = /^`([^`]+)`$/.exec(part);
      if (c)
        return (
          <code
            key={i}
            className="border-line-subtle bg-surface-raised text-content rounded border px-1 py-0.5 font-mono text-xs"
          >
            {c[1]}
          </code>
        );
      return <Fragment key={i}>{parseText(part, ctx)}</Fragment>;
    });
  };

  /** Puce simple à partir d'un tag (buff/debuff/skill). */
  const tagList = (tags: string[]): ReactNode => (
    <ul className="text-content marker:text-content-subtle list-disc space-y-1 pl-5">
      {tags.map((tg) => (
        <li key={tg}>{parseText(tg, ctx)}</li>
      ))}
    </ul>
  );

  const bullets = (items: ReactNode[]): ReactNode => (
    <ul className="text-content marker:text-content-subtle list-disc space-y-1 pl-5">
      {items.map((it, i) => (
        <li key={i}>{it}</li>
      ))}
    </ul>
  );

  /** Bloc de formule en mono. */
  const mono = (m: LocalizedText): ReactNode => (
    <p className="border-line-subtle bg-surface-raised text-content w-fit max-w-full overflow-x-auto rounded border px-2 py-1 font-mono text-xs whitespace-pre-wrap">
      {L(m)}
    </p>
  );

  /* eslint-disable @next/next/no-img-element -- assets R2/staging */
  const combatIcon = (sprite: string, effect = false) => (
    <img
      src={effect ? img.effect(sprite) : img.combatIcon(sprite)}
      alt=""
      className="inline-block h-5 w-5 align-text-bottom"
    />
  );
  /* eslint-enable @next/next/no-img-element */

  // ════════════════════════════ Onglet : Basic Stats ════════════════════════════
  const statsPanel = (
    <div className="space-y-6 text-sm">
      <StatGroup accent="rose" title={L(LABELS.group_offensive)}>
        <StatCard abbr="ATK" desc={L(LABELS.desc_ATK)} ctx={ctx}>
          <p>{P(LABELS.atk_p1)}</p>
          <p>{P(LABELS.atk_p2)}</p>
          {tagList([
            '{D/BT_DOT_BURN}',
            '{D/BT_DOT_BLEED}',
            '{D/BT_DOT_POISON}',
            '{D/BT_DOT_LIGHTNING}',
          ])}
        </StatCard>
        <StatCard abbr="CHC" desc={L(LABELS.desc_CHC)} ctx={ctx}>
          <p>{P(LABELS.chc_p1)}</p>
          <p className="text-content font-semibold">{P(LABELS.chc_notes)}</p>
          <ul className="text-content marker:text-content-subtle list-disc space-y-1 pl-5">
            <li>{P(LABELS.chc_n1)}</li>
            <li>{P(LABELS.chc_n2)}</li>
            <li>{P(LABELS.chc_n3)}</li>
            <li>{P(LABELS.chc_n4)}</li>
          </ul>
        </StatCard>
        <StatCard abbr="CHD" desc={L(LABELS.desc_CHD)} ctx={ctx}>
          <p>{P(LABELS.chd_p1)}</p>
          <p>{P(LABELS.chd_p2)}</p>
          <p className="text-ed-amber">{P(LABELS.chd_p3)}</p>
        </StatCard>
        <StatCard abbr="PEN%" desc={L(LABELS.desc_PEN)} ctx={ctx}>
          <p>{P(LABELS.pen_p1)}</p>
          <p>{P(LABELS.pen_p2)}</p>
          <p>{P(LABELS.pen_p3)}</p>
          <p className="text-ed-amber">{P(LABELS.pen_p4)}</p>
          <p className="text-ed-amber text-xs">{P(LABELS.pen_note)}</p>
        </StatCard>
      </StatGroup>

      <Card accent="rose" title={L(LABELS.crit100_title)}>
        <p>{P(LABELS.crit100_intro)}</p>
        <div className="mt-1.5">
          {bullets([
            P(LABELS.crit_base),
            P(LABELS.crit_class),
            P(LABELS.crit_wizard),
            P(LABELS.crit_quirk),
            P(LABELS.crit_gear),
            P(LABELS.crit_accessory),
            P(LABELS.crit_talisman),
            P(LABELS.crit_gems),
            P(LABELS.crit_buff),
          ])}
        </div>
        <p className="mt-2">{P(LABELS.crit100_outro)}</p>
      </Card>

      <StatGroup accent="sky" title={L(LABELS.group_defensive)}>
        <StatCard abbr="HP" desc={L(LABELS.desc_HP)} ctx={ctx}>
          <p>{P(LABELS.hp_p1)}</p>
          <p>{P(LABELS.hp_p2)}</p>
          <p>{P(LABELS.hp_p3)}</p>
          {tagList(['{B/BT_BARRIER}', '{B/BT_INVINCIBLE}', '{B/BT_UNDEAD}'])}
        </StatCard>
        <StatCard abbr="DEF" desc={L(LABELS.desc_DEF)} ctx={ctx}>
          <p>{P(LABELS.def_p1)}</p>
          <p>{P(LABELS.def_p2)}</p>
          {tagList(['{D/BT_DOT_BURN}', '{B/BT_STAT|ST_PIERCE_POWER_RATE}', '{D/BT_FIXED_DAMAGE}'])}
        </StatCard>
      </StatGroup>

      <StatGroup accent="emerald" title={L(LABELS.group_utility)}>
        <StatCard abbr="SPD" desc={L(LABELS.desc_SPD)} ctx={ctx}>
          <p>{P(LABELS.spd_p1)}</p>
          <p>{P(LABELS.spd_p2)}</p>
          <p className="text-ed-amber">{P(LABELS.spd_p3)}</p>
        </StatCard>
      </StatGroup>

      <StatGroup accent="violet" title={L(LABELS.group_damage)}>
        <StatCard abbr="DMG UP%" desc={L(LABELS.desc_DMGUP)} ctx={ctx}>
          <p>{P(LABELS.dmgup_p1)}</p>
          <p className="text-content font-semibold">{P(LABELS.dmgup_formulaLabel)}</p>
          <p className="border-line-subtle bg-surface-raised text-content w-fit rounded border px-2 py-1 font-mono text-xs">
            {L(LABELS.dmgup_formula)}
          </p>
          <p className="text-content font-semibold">{P(LABELS.dmgup_howLabel)}</p>
          <ul className="text-content marker:text-content-subtle list-disc space-y-1 pl-5">
            <li>{P(LABELS.dmgup_h1)}</li>
            <li>{P(LABELS.dmgup_h2)}</li>
            <li>{P(LABELS.dmgup_h3)}</li>
          </ul>
          <p className="text-ed-amber text-xs">{P(LABELS.dmgup_note)}</p>
          <p className="text-content-subtle text-xs">{P(LABELS.dmgup_chdNote)}</p>
        </StatCard>
        <StatCard abbr="DMG RED%" desc={L(LABELS.desc_DMGRED)} ctx={ctx}>
          <p>{P(LABELS.dmgred_p1)}</p>
          <p className="text-content font-semibold">{P(LABELS.dmgred_exLabel)}</p>
          <p>{P(LABELS.dmgred_ex)}</p>
          <p className="text-content font-semibold">{P(LABELS.dmgred_critLabel)}</p>
          <p>{P(LABELS.dmgred_crit)}</p>
          <p className="text-ed-amber text-xs">{P(LABELS.dmgred_note)}</p>
          <p className="text-ed-amber text-xs">{P(LABELS.dmg_cap)}</p>
        </StatCard>
        <StatCard abbr="CDMG RED%" desc={L(LABELS.desc_CDMGRED)} ctx={ctx}>
          <p>{P(LABELS.cdmgred_p1)}</p>
          <p className="text-content font-semibold">{P(LABELS.cdmgred_exLabel)}</p>
          <p>{P(LABELS.cdmgred_ex1)}</p>
          <p>{P(LABELS.cdmgred_ex2)}</p>
          {L(LABELS.cdmgred_note) && (
            <p className="text-ed-amber text-xs">{P(LABELS.cdmgred_note)}</p>
          )}
          <p className="text-ed-amber text-xs">{P(LABELS.dmg_cap)}</p>
        </StatCard>
      </StatGroup>

      <StatGroup accent="amber" title={L(LABELS.group_effres)}>
        <StatCard abbr="EFF" desc={L(LABELS.desc_EFF)} ctx={ctx}>
          <p>{P(LABELS.eff_p1)}</p>
          <p>{P(LABELS.eff_p2)}</p>
          <p>{P(LABELS.eff_p3)}</p>
        </StatCard>
        <StatCard abbr="RES" desc={L(LABELS.desc_RES)} ctx={ctx}>
          <p>{P(LABELS.res_p1)}</p>
          <p>{P(LABELS.res_p2)}</p>
          <ul className="text-content marker:text-content-subtle list-disc space-y-1 pl-5">
            <li>{P(LABELS.res_b1)}</li>
            <li>RES − EFF = 100 → 50%</li>
            <li>RES − EFF = 300 → 25%</li>
            <li>RES − EFF = 900 → 10%</li>
          </ul>
          <p className="text-ed-amber">{P(LABELS.res_note)}</p>
        </StatCard>
      </StatGroup>
    </div>
  );

  // ════════════════════════════ Onglet : Combat Basics ════════════════════════════
  const combatPanel = (
    <div className="space-y-8 text-sm">
      {/* Système de priorité */}
      <section className="space-y-3">
        <SectionHeading accent="cyan" title={L(LABELS.combat_priority_heading)} />
        <Card accent="cyan">
          <p>{P(LABELS.cp_intro1)}</p>
          <p className="mt-2">
            {P(LABELS.cp_intro2)} {combatIcon('IG_Menu_Btn_Action')}
          </p>
          <div className="mt-2">{bullets([P(LABELS.cp_b0), P(LABELS.cp_b100)])}</div>
        </Card>

        <Collapse label={parseText('{S/SPD}', ctx)}>
          <p>{P(LABELS.sp_p1)}</p>
          {bullets([P(LABELS.sp_b1), P(LABELS.sp_b2), P(LABELS.sp_b3)])}
          <p>{P(LABELS.sp_p2)}</p>
        </Collapse>

        <Collapse label={<span className="text-ed-amber">{L(LABELS.pr_accordion)}</span>}>
          <p>{P(LABELS.pr_p1)}</p>
          <p>{P(LABELS.pr_p2)}</p>
          <p>{P(LABELS.pr_p3)}</p>
          <p className="text-ed-amber text-xs">
            {P(LABELS.pr_icon_note)}{' '}
            <span className="inline-block grayscale">
              {combatIcon('SC_Buff_Effect_Increase_Priority', true)}
            </span>
          </p>
          <p>{P(LABELS.pr_beneficial)}</p>
          <p>{P(LABELS.pr_detrimental)}</p>
          <Callout accent="amber" label={L(LABELS.pr_notes_title)}>
            {bullets([
              P(LABELS.pr_n1),
              P(LABELS.pr_n2),
              P(LABELS.pr_n3),
              P(LABELS.pr_n4),
              P(LABELS.pr_n5),
              P(LABELS.pr_n6),
            ])}
          </Callout>
        </Collapse>
      </section>

      {/* Déroulé d'un tour */}
      <section className="space-y-3">
        <SectionHeading accent="sky" title={L(LABELS.combat_turnflow_heading)} />
        <Card accent="sky">
          <p>{P(LABELS.tf_intro)}</p>
          <div className="mt-4 space-y-4">
            <div className="border-ed-emerald/60 border-l-2 pl-3">
              <p className="text-ed-emerald font-semibold">{L(LABELS.tf_start_title)}</p>
              {bullets([P(LABELS.tf_s1), P(LABELS.tf_s2), P(LABELS.tf_s3)])}
            </div>
            <div className="border-ed-sky/60 border-l-2 pl-3">
              <p className="text-ed-sky font-semibold">{L(LABELS.tf_action_title)}</p>
              <p className="text-ed-amber mt-1">{P(LABELS.tf_action_note)}</p>
              <div className="mt-3 space-y-3">
                <div>
                  <p className="text-content-strong font-medium">{L(LABELS.tf_choice_title)}</p>
                  {bullets([P(LABELS.tf_c1), P(LABELS.tf_c2)])}
                </div>
                <div>
                  <p className="text-content-strong font-medium">{L(LABELS.tf_hit_title)}</p>
                  <p className="mt-1">{P(LABELS.tf_hit_intro)}</p>
                  {bullets([P(LABELS.tf_pre), P(LABELS.tf_hit), P(LABELS.tf_post)])}
                  <p className="mt-2">{P(LABELS.tf_extra)}</p>
                  <p>{P(LABELS.tf_ally)}</p>
                  <p>{P(LABELS.tf_enemy)}</p>
                </div>
              </div>
            </div>
            <div className="border-ed-violet/60 border-l-2 pl-3">
              <p className="text-ed-violet font-semibold">{L(LABELS.tf_end_title)}</p>
              {bullets([P(LABELS.tf_e1), P(LABELS.tf_e2), P(LABELS.tf_e3)])}
            </div>
          </div>
        </Card>
      </section>

      {/* Premier tour */}
      <section className="space-y-3">
        <SectionHeading accent="violet" title={L(LABELS.combat_firstturn_heading)} />
        <Card accent="violet">
          <p>{P(LABELS.ft_intro)}</p>
          <Callout accent="sky" label={L(LABELS.ft_ex_title)}>
            {bullets([P(LABELS.ft_ex1), P(LABELS.ft_ex2), P(LABELS.ft_ex3)])}
          </Callout>
          <p className="mt-3">{P(LABELS.ft_rng)}</p>
          <Callout accent="amber" label={L(LABELS.ft_rng_title)}>
            <p>{L(LABELS.ft_rng_a)}</p>
            <p>{L(LABELS.ft_rng_b)}</p>
            <p className="mt-1">{P(LABELS.ft_rng_result)}</p>
          </Callout>
          <p className="mt-3">{P(LABELS.ft_pvp)}</p>
        </Card>
        <Card accent="sky" title={L(LABELS.ft_spd_title)}>
          <p>{P(LABELS.ft_spd_intro)}</p>
          <Callout accent="violet" label={L(LABELS.ft_ex_title)}>
            <p>{P(LABELS.ft_spd_ex1)}</p>
            <p>{P(LABELS.ft_spd_ex2)}</p>
            <p className="mt-1">{P(LABELS.ft_spd_ex3)}</p>
            <p className="mt-1">{P(LABELS.ft_spd_ex4)}</p>
            <p>{L(LABELS.ft_spd_ex5)}</p>
            <p>{P(LABELS.ft_spd_ex6)}</p>
            <p className="mt-1">{P(LABELS.ft_spd_ex7)}</p>
          </Callout>
          <p className="mt-3">{P(LABELS.ft_spd_transcend)}</p>
        </Card>
      </section>

      {/* Mécaniques spéciales */}
      <section className="space-y-3">
        <SectionHeading accent="amber" title={L(LABELS.combat_special_heading)} />
        <Card accent="amber" title={L(LABELS.sm_extra_title)}>
          <p>{P(LABELS.sm_extra_p)}</p>
        </Card>
        <Card accent="amber" title={L(LABELS.sm_vlada_title)}>
          <p>{P(LABELS.sm_vlada_p)}</p>
        </Card>
        <Card accent="amber" title={L(LABELS.sm_arena_title)}>
          <p>{P(LABELS.sm_arena_intro)}</p>
          {bullets([
            <span key="a1">
              {combatIcon('Skill_PVP_LeagueBuff_01')}{' '}
              <strong className="text-content-strong">{L(LABELS.sm_arena_1_name)}</strong>:{' '}
              {P(LABELS.sm_arena_1_body)}
            </span>,
            <span key="a2">
              {combatIcon('Skill_PVP_Penalty')}{' '}
              <strong className="text-content-strong">{L(LABELS.sm_arena_2_name)}</strong>:{' '}
              {P(LABELS.sm_arena_2_body)}
            </span>,
          ])}
        </Card>
      </section>
    </div>
  );

  // ════════════════════════════ Onglet : FAQ ════════════════════════════
  const faqPanel = (
    <div className="space-y-7 text-sm">
      <section className="space-y-2.5">
        <SectionHeading accent="rose" title={L(LABELS.faq_sec_critDots)} />
        <Collapse label={L(LABELS.q_critCap)}>
          <p>{P(LABELS.a_critCap)}</p>
        </Collapse>
        <Collapse label={L(LABELS.q_critOnHeal)}>
          <p>{P(LABELS.a_critOnHeal)}</p>
        </Collapse>
        <Collapse label={L(LABELS.q_dotCrit)}>
          <p>{P(LABELS.a_dotCrit)}</p>
        </Collapse>
        <Collapse label={L(LABELS.q_dotScaling)}>
          <p>{P(LABELS.a_dotScaling)}</p>
        </Collapse>
        <Collapse label={L(LABELS.q_penVsDots)}>
          <p>{P(LABELS.pvd_p1)}</p>
          {tagList(['{D/BT_DOT_BLEED}', '{D/BT_DOT_POISON}', '{D/BT_DOT_LIGHTNING}'])}
          <p>{P(LABELS.pvd_p2)}</p>
          {tagList(['{D/BT_DOT_BURN}', '{D/BT_DOT_CURSE}', '{D/ETERNAL_BLEEDING}'])}
          <p>{P(LABELS.pvd_p3)}</p>
        </Collapse>
      </section>

      <section className="space-y-2.5">
        <SectionHeading accent="violet" title={L(LABELS.faq_sec_dmgMods)} />
        <Collapse label={L(LABELS.q_dmgUpVsChd)}>
          <p>{P(LABELS.a_dmgUpVsChd)}</p>
        </Collapse>
        <Collapse label={L(LABELS.q_dmgRedVsCdmgRed)}>
          <p>{P(LABELS.a_dmgRedVsCdmgRed)}</p>
        </Collapse>
        <Collapse label={L(LABELS.q_dmgAdditive)}>
          <p>{P(LABELS.a_dmgAdditive)}</p>
        </Collapse>
        <Collapse label={L(LABELS.q_dmgRedCap)}>
          <p>{P(LABELS.a_dmgRedCap)}</p>
        </Collapse>
        <Collapse label={L(LABELS.q_debuffOnMiss)}>
          <p>{P(LABELS.dom_p1)}</p>
          <p>{P(LABELS.dom_p2)}</p>
        </Collapse>
        <Collapse label={L(LABELS.q_effResFormula)}>
          <p>{P(LABELS.a_effResFormula)}</p>
        </Collapse>
      </section>

      <section className="space-y-2.5">
        <SectionHeading accent="sky" title={L(LABELS.faq_sec_defPen)} />
        <Collapse label={L(LABELS.q_penVsHighDef)}>
          <p>{P(LABELS.a_penVsHighDef)}</p>
        </Collapse>
        <Collapse label={L(LABELS.q_fixedDamageMitigation)}>
          <p>{P(LABELS.a_fixedDamageMitigation)}</p>
        </Collapse>
      </section>

      <section className="space-y-2.5">
        <SectionHeading accent="emerald" title={L(LABELS.faq_sec_statScaling)} />
        <Collapse label={L(LABELS.q_dualScaling)}>
          <p>{P(LABELS.ds_p1)}</p>
          <p>{P(LABELS.ds_p2)}</p>
          <p>{P(LABELS.ds_p3)}</p>
        </Collapse>
        <Collapse label={L(LABELS.q_statScaling)}>
          <p>{P(LABELS.ss_p1)}</p>
          <p>{P(LABELS.ss_p2)}</p>
          {bullets([P(LABELS.ss_b1), P(LABELS.ss_b2)])}
          <p>{P(LABELS.ss_p3)}</p>
        </Collapse>
      </section>

      <section className="space-y-2.5">
        <SectionHeading accent="cyan" title={L(LABELS.faq_sec_speedPriority)} />
        <Collapse label={L(LABELS.q_speedFormula)}>
          <p>{P(LABELS.sf_p1)}</p>
          {mono(LABELS.sf_formula)}
          {bullets([
            P(LABELS.sf_base),
            P(LABELS.sf_gear),
            <span key="set">
              {P(LABELS.sf_set)}
              {bullets([L(LABELS.sf_set0), L(LABELS.sf_set2), L(LABELS.sf_set4)])}
            </span>,
          ])}
        </Collapse>
        <Collapse label={L(LABELS.q_priorityFormula)}>
          <p>{P(LABELS.pf_p1)}</p>
          {mono(LABELS.pf_formula)}
          {bullets([
            P(LABELS.pf_spd),
            P(LABELS.pf_top),
            P(LABELS.pf_transcend),
            <span key="buff">
              {P(LABELS.pf_buff)}
              {bullets([L(LABELS.pf_buff0), L(LABELS.pf_buff30), L(LABELS.pf_buffm30)])}
            </span>,
          ])}
        </Collapse>
        <Collapse label={L(LABELS.q_maxSpeed)}>
          <p>{P(LABELS.ms_p1)}</p>
          {bullets([
            P(LABELS.ms_base),
            P(LABELS.ms_gear),
            P(LABELS.ms_set),
            P(LABELS.ms_transcend),
          ])}
          <p>{P(LABELS.ms_total)}</p>
          <p>{P(LABELS.ms_ryu)}</p>
        </Collapse>
      </section>

      <section className="space-y-2.5">
        <SectionHeading accent="amber" title={L(LABELS.faq_sec_formulas)} />
        <Collapse label={L(LABELS.q_formula)}>
          <p>{P(LABELS.fm_p1)}</p>
          <p>{P(LABELS.fm_p2)}</p>
          <p className="text-content-strong mt-2 font-semibold">{L(LABELS.fm_h_def)}</p>
          <p>{P(LABELS.fm_def_label)}</p>
          <p>{P(LABELS.fm_def_desc)}</p>
          <p>{P(LABELS.fm_ehp_intro)}</p>
          <p>{P(LABELS.fm_ehp)}</p>
          <p>{P(LABELS.fm_pen_desc)}</p>
          <p>{P(LABELS.fm_ehp_pen)}</p>
          <p className="text-content-strong mt-2 font-semibold">{L(LABELS.fm_h_effres)}</p>
          <p>{P(LABELS.fm_effres_1)}</p>
          <p>{P(LABELS.fm_effres_2)}</p>
          {mono(LABELS.fm_effres_formula)}
        </Collapse>
        <Collapse label={L(LABELS.q_statFormulas)}>
          <p>{P(LABELS.statf_p1)}</p>
          {mono(LABELS.statf_formula)}
          <p>{P(LABELS.statf_note)}</p>
        </Collapse>
        <Collapse label={L(LABELS.q_damageFormula)}>
          <p>{P(LABELS.df_p1)}</p>
          {mono(LABELS.df_formula)}
          {bullets([
            P(LABELS.df_atk),
            P(LABELS.df_skill),
            P(LABELS.df_mit),
            <span key="rate">
              {P(LABELS.df_rate)}
              <span className="mt-1 block">{mono(LABELS.df_rate_formula)}</span>
              <span className="text-content-subtle mt-1 block text-xs">
                {P(LABELS.df_rate_note)}
              </span>
            </span>,
            P(LABELS.df_elem),
            P(LABELS.df_marking),
            P(LABELS.df_missed),
            P(LABELS.df_finalreduce),
          ])}
          <p className="text-content-subtle text-xs">{P(LABELS.df_source)}</p>
        </Collapse>
      </section>
    </div>
  );

  const tabs: TabItem[] = [
    { key: 'stats', label: L(LABELS.tab_stats), content: statsPanel },
    { key: 'combat', label: L(LABELS.tab_combat), content: combatPanel },
    { key: 'faq', label: L(LABELS.tab_faq), content: faqPanel },
  ];

  return (
    <>
      <Prose>{L(LABELS.intro)}</Prose>
      <SegmentedTabs tabs={tabs} ariaLabel={L(LABELS.title)} urlKey="tab" variant="game" />
    </>
  );
}
