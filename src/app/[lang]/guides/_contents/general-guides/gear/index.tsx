/**
 * Guide « Equipment Guide » (gear) — 5 onglets (Bases, Upgrading, Ascension,
 * Obtaining, FAQ).
 *
 * Les tables NUMÉRIQUES DÉRIVENT des données de jeu, pas de hardcode :
 *   - comparaison d'enhancement → `enhance.json` `examples` (base × ×5 au +10) ;
 *   - exemples de breakthrough → `getEquipmentDetail` (arme + sets, T0 vs T4) ;
 *   - ascension (activation, steps +11→+15, bonus +15, reroll) → `getAscensionView`
 *     (source `enhance.json`, générique par groupe arme/armure).
 * La PROSE et les règles non structurées (substats, tips, priorité) sont
 * éditoriales (labels.ts). Server Component ; items en tuile à cadre de rareté.
 */
import type { ReactNode } from 'react';
import type { Lang } from '@/lib/i18n/config';
import { getT } from '@/i18n';
import { lRec } from '@/lib/i18n/localize';
import { parseText, type ParseCtx } from '@/lib/parse-text';
import { img } from '@/lib/images';
import { ItemInline } from '@/components/inline/ItemInline';
import { InlineIcon } from '@/components/inline/InlineIcon';
import { EquipmentIcon } from '@/components/equipment/EquipmentIcon';
import { SkillDescription } from '@/components/character/SkillDescription';
import { SegmentedTabs, type TabItem } from '@/components/guides/SegmentedTabs';
import {
  Prose,
  Callout,
  MiniPanel,
  DotList,
  NumberedList,
} from '@/components/guides/editorial/blocks';
import { getCatalog } from '@/lib/data/items';
import { getAscensionView, getEquipmentDetail } from '@/lib/data/equipment-detail';
import type { LocalizedText, EnhanceRules } from '@contracts';
import enhanceRaw from '@data/generated/equipment/enhance.json';
import { LABELS } from './labels';
import { PropertyDiagram } from './PropertyDiagram';

const rules = enhanceRaw as unknown as EnhanceRules;

/** En-tête de colonne « Main Stat » du tableau d'ascension (non porté en V2). */
const MAIN_STAT_LABEL: LocalizedText = {
  en: 'Main Stat',
  jp: 'メインステ',
  kr: '메인 스탯',
  zh: '主属性',
  fr: 'Main Stat',
};

/** Matériaux (tuiles) référencés par NOM dans la prose éditoriale. */
const HAMMER_ITEMS = [
  "Apprentice's Hammer",
  "Expert's Hammer",
  "Master's Hammer",
  "Artisan's Hammer",
];
const CATALYST_ITEMS = [
  'Normal Reforge Catalyst',
  'Superior Reforge Catalyst',
  'Epic Reforge Catalyst',
  'Legendary Reforge Catalyst',
];
const GLUNITE_ITEMS = ['Glunite', 'Refined Glunite', 'Event Glunite', 'Armor Glunite'];

/** Index nom EN → item du catalogue (résout les items éditoriaux par nom). */
const CATALOG_BY_NAME = (() => {
  const m = new Map<
    string,
    { name: LocalizedText; icon: string; grade: string; desc?: LocalizedText }
  >();
  for (const e of Object.values(getCatalog())) {
    const key = e.name.en?.trim().toLowerCase();
    if (key && !m.has(key))
      m.set(key, { name: e.name, icon: e.icon, grade: e.grade, desc: e.desc });
  }
  return m;
})();
const catalogById = getCatalog();

/** Étiquette de rareté (comparaison d'enhancement) par grade dérivé. */
const ENHANCE_LABEL: Record<string, LocalizedText> = {
  normal: LABELS.enhanceLabel_normal,
  rare: LABELS.enhanceLabel_epic,
  unique: LABELS.enhanceLabel_legendary,
};

export default async function GearGuide({ lang }: { lang: Lang }) {
  const t = await getT(lang);
  const ctx: ParseCtx = { lang, t, strict: true };
  const L = (msg: LocalizedText): string => lRec(msg, lang) || msg.en || '';
  const P = (msg: LocalizedText): ReactNode => parseText(L(msg), ctx);
  const fmt = (n: number): string => n.toLocaleString('en-US');

  // ── Dérivations de jeu ──
  const enhanceMult = 1 + rules.enhanceFactor * rules.maxEnhance; // ×5 au +10
  const axWeapon = getAscensionView('weapon', lang);
  const axArmor = getAscensionView('armor', lang);
  const surefire = getEquipmentDetail('surefire-greatsword', lang);
  const immunity = getEquipmentDetail('immunity-set', lang);
  const penetration = getEquipmentDetail('penetration-set', lang);
  const activationPct = Math.round((rules.singularity.activation.factor / enhanceMult) * 100);
  const stepPct = (i: number): number =>
    Math.round(((rules.singularity.steps[i]?.factor ?? 0) / enhanceMult) * 100);
  // Couleurs des grades C→S+ (déclarées par le jeu dans chaque bonus).
  const gradeColor: Record<string, string> = {};
  for (const g of axWeapon.bonuses[0]?.grades ?? []) gradeColor[g.grade] = g.color;
  const GRADES = ['C', 'B', 'A', 'S', 'S+'];

  /** Tuile depuis un nom d'item du catalogue ; texte brut si absent. */
  const chipByName = (name: string, size = 22): ReactNode => {
    const e = CATALOG_BY_NAME.get(name.trim().toLowerCase());
    if (!e) return <span className="text-content">{name}</span>;
    return (
      <ItemInline
        item={{
          name: L(e.name),
          iconSrc: img.item(e.icon),
          grade: e.grade,
          desc: e.desc && L(e.desc),
        }}
        size={size}
        color="text-content"
      />
    );
  };

  const goldIcon = catalogById['SYS_ASSET_GOLD']?.icon;
  const goldCell = (n: number): ReactNode => (
    <span className="inline-flex items-center gap-1 whitespace-nowrap">
      {goldIcon && (
        // eslint-disable-next-line @next/next/no-img-element -- asset R2/staging
        <img src={img.item(goldIcon)} alt="" width={15} height={15} className="inline-block" />
      )}
      {fmt(n)}
    </span>
  );

  /** Tuiles de matériaux d'ascension (icônes namespace équipement). */
  const matTiles = (mats: typeof axWeapon.activation.materials): ReactNode => (
    <span className="inline-flex flex-wrap items-center gap-2">
      {mats.map((mm) => (
        <span key={mm.icon} className="inline-flex items-center gap-1 whitespace-nowrap">
          <ItemInline
            item={{
              name: mm.name,
              iconSrc: img.equipment(mm.icon),
              grade: mm.grade,
              desc: mm.desc,
            }}
            size={20}
            color="text-content"
          />
          <span className="text-content">×{mm.count}</span>
        </span>
      ))}
    </span>
  );

  const Card = ({ children }: { children: ReactNode }) => (
    <div className="border-line bg-surface-raised/60 space-y-3 rounded-xl border p-4 md:p-5">
      {children}
    </div>
  );
  const Heading = ({ n, children }: { n?: number; children: ReactNode }) => (
    <div className="flex items-center gap-2">
      {n !== undefined && (
        <span className="bg-ed-sky/10 border-ed-sky/30 text-ed-sky inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-md border font-mono text-xs font-bold">
          {n}
        </span>
      )}
      <span className="text-content-strong text-base font-semibold">{children}</span>
    </div>
  );

  const TableShell = ({ head, children }: { head: ReactNode; children: ReactNode }) => (
    <div className="border-line overflow-x-auto rounded-xl border">
      <table className="w-full text-sm">
        <thead className="bg-surface-sunken text-content-subtle text-xs">{head}</thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
  const th = (label: ReactNode, cls = 'text-left') => (
    <th className={`px-3 py-2 font-medium ${cls}`}>{label}</th>
  );

  /** Barre de 6 segments : jaune = roll initial, orange = ajouté au reforge. */
  const SubstatBar = ({ roll, reforge }: { roll: number; reforge: number }) => (
    <span className="inline-flex gap-1">
      {Array.from({ length: 6 }, (_, i) => {
        const cls =
          i < roll
            ? 'bg-substat-roll'
            : i < roll + reforge
              ? 'bg-substat-reforge'
              : 'bg-substat-empty';
        return <span key={i} className={`h-2 w-8 rounded-sm ${cls}`} />;
      })}
    </span>
  );

  const rateColor = (r: number): string =>
    r >= 80 ? 'text-success' : r >= 50 ? 'text-warn' : 'text-danger';

  // ════════════════════════════ Onglet : Bases ════════════════════════════
  const PROP_ROWS = [
    { key: 'stars', label: L(LABELS.prop_stars) },
    { key: 'reforge', label: L(LABELS.prop_reforge) },
    { key: 'rarity', label: L(LABELS.prop_rarity) },
    { key: 'upgrade', label: L(LABELS.prop_upgrade) },
    { key: 'tier', label: L(LABELS.prop_tier) },
    { key: 'set', label: L(LABELS.prop_set) },
    { key: 'class', label: L(LABELS.prop_class) },
  ];
  const basicsPanel = (
    <div className="space-y-4 text-sm">
      <Card>
        <Heading>{L(LABELS.basics_overviewTitle)}</Heading>
        <Prose>
          {L(LABELS.basics_overviewText)}{' '}
          <span className="text-ed-rose font-semibold">{L(LABELS.basics_weapon)}</span>
          {', '}
          <span className="text-ed-violet font-semibold">{L(LABELS.basics_accessory)}</span>
          {', '}
          <span className="text-ed-sky font-semibold">{L(LABELS.basics_armor)}</span>
          {L(LABELS.basics_gearTypesEnd)}
        </Prose>
      </Card>

      <Card>
        <Heading>{L(LABELS.basics_propertiesTitle)}</Heading>
        <Prose>{L(LABELS.basics_propertiesText)}</Prose>
        {surefire && (
          <PropertyDiagram
            rows={PROP_ROWS}
            icon={surefire.icon}
            classType={surefire.classLimits?.[0]}
            effectIcon={surefire.passives[0]?.icon}
          />
        )}
      </Card>

      <Card>
        <Heading>{L(LABELS.basics_substatsTitle)}</Heading>
        <Prose>{L(LABELS.basics_substatsRule)}</Prose>
        <Prose>{L(LABELS.basics_substatsColorIntro)}</Prose>
        <div className="space-y-2">
          <SubstatBar roll={3} reforge={2} />
          <ul className="space-y-1">
            <li className="flex items-center gap-2">
              <span className="bg-substat-roll h-2.5 w-2.5 rounded-sm" />
              <span className="text-content">{L(LABELS.color_yellow)}</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="bg-substat-reforge h-2.5 w-2.5 rounded-sm" />
              <span className="text-content">{L(LABELS.color_orange)}</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="bg-substat-empty h-2.5 w-2.5 rounded-sm" />
              <span className="text-content">{L(LABELS.color_gray)}</span>
            </li>
          </ul>
        </div>
        <Callout accent="amber" label={L(LABELS.basics_maxYellowTitle)}>
          {L(LABELS.basics_maxYellowText)}
        </Callout>
        <Prose>{L(LABELS.basics_segmentsSchemaNote)}</Prose>
      </Card>
    </div>
  );

  // ═══════════════════════════ Onglet : Upgrading ═══════════════════════════
  const METHODS = [
    { title: LABELS.method_enhance_title, desc: LABELS.method_enhance_desc },
    { title: LABELS.method_reforge_title, desc: LABELS.method_reforge_desc },
    { title: LABELS.method_breakthrough_title, desc: LABELS.method_breakthrough_desc },
    { title: LABELS.method_changeStats_title, desc: LABELS.method_changeStats_desc },
  ];
  const matList = (items: string[]): ReactNode => (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-content-subtle">{L(LABELS.materials)}</span>
      {items.map((it) => (
        <span key={it}>{chipByName(it)}</span>
      ))}
    </div>
  );

  const upgradingPanel = (
    <div className="space-y-4 text-sm">
      <Prose>{L(LABELS.upgrading_intro)}</Prose>
      <div className="grid gap-3 sm:grid-cols-2">
        {METHODS.map((m, i) => (
          <MiniPanel
            key={i}
            accent={(['emerald', 'violet', 'amber', 'cyan'] as const)[i]}
            title={L(m.title)}
          >
            {L(m.desc)}
          </MiniPanel>
        ))}
      </div>

      {/* Enhance */}
      <Card>
        <Heading n={1}>{L(LABELS.method_enhance_title)}</Heading>
        <Prose>{L(LABELS.enhanceText)}</Prose>
        {matList(HAMMER_ITEMS)}
        <Callout accent="emerald" label={L(LABELS.tip)}>
          <ul className="m-0 list-disc space-y-1 pl-4">
            <li>{L(LABELS.enhanceTip1)}</li>
            <li>{L(LABELS.enhanceTip2)}</li>
            <li>{L(LABELS.enhanceTip3)}</li>
          </ul>
        </Callout>
        <div className="space-y-2">
          <div className="text-content-strong font-semibold">
            {L(LABELS.enhanceComparisonTitle)}
          </div>
          <div className="flex flex-wrap justify-center gap-6">
            {rules.examples.map((ex) => (
              <div key={`${ex.grade}-${ex.star}`} className="flex w-36 flex-col items-center gap-2">
                <span className="text-content-subtle text-xs">
                  {L(ENHANCE_LABEL[ex.grade] ?? LABELS.enhanceLabel_normal)}
                </span>
                <EquipmentIcon
                  icon={`TI_Equipment_Weapon_0${ex.star}`}
                  grade={ex.grade}
                  stars={ex.star}
                  size={60}
                />
                <span className="text-content font-mono text-sm">
                  {ex.statKey} {fmt(ex.base)}
                </span>
                <span className="text-content-subtle">↓ +{rules.maxEnhance}</span>
                <EquipmentIcon
                  icon={`TI_Equipment_Weapon_0${ex.star}`}
                  grade={ex.grade}
                  stars={ex.star}
                  enhanceLevel={rules.maxEnhance}
                  size={60}
                />
                <span className="text-success font-mono text-sm font-semibold">
                  {ex.statKey} {fmt(Math.round(ex.base * enhanceMult))}
                </span>
              </div>
            ))}
          </div>
          <p className="text-content-subtle text-xs italic">{L(LABELS.enhanceComparisonNote)}</p>
        </div>
      </Card>

      {/* Reforge */}
      <Card>
        <Heading n={2}>{L(LABELS.method_reforge_title)}</Heading>
        <Prose>{L(LABELS.reforgeText)}</Prose>
        {matList(CATALYST_ITEMS)}
        <Callout accent="violet" label={L(LABELS.note)}>
          {L(LABELS.reforgeTip)}
        </Callout>
        <div className="text-content-strong font-semibold">{L(LABELS.reforgeHowTitle)}</div>
        <NumberedList accent="violet" items={[L(LABELS.reforgeStep1), L(LABELS.reforgeStep2)]} />
        <Callout accent="violet" label={L(LABELS.reforgeLimitTitle)}>
          {L(LABELS.reforgeLimitText)}
        </Callout>
      </Card>

      {/* Breakthrough */}
      <Card>
        <Heading n={3}>{L(LABELS.method_breakthrough_title)}</Heading>
        <Prose>{L(LABELS.breakthroughText)}</Prose>
        {matList(GLUNITE_ITEMS)}
        <Callout accent="amber" label={L(LABELS.note)}>
          {L(LABELS.breakthroughTip)}
        </Callout>
        <div className="text-content-strong font-semibold">
          {L(LABELS.breakthroughExamplesTitle)}
        </div>
        <div className="grid gap-3 md:grid-cols-3">
          {surefire && (
            <div className="border-line-subtle bg-surface-overlay/40 space-y-2 rounded-lg border p-3">
              <div className="flex items-center gap-2">
                <EquipmentIcon
                  icon={surefire.icon}
                  grade="unique"
                  stars={6}
                  tier={4}
                  overlayIcon={surefire.passives[0]?.icon}
                  size={44}
                />
                <span className="text-content-strong text-sm font-semibold">{surefire.name}</span>
              </div>
              {surefire.slots[0]?.options[0] && (
                <div className="text-content flex items-center gap-2 text-xs">
                  <span>ATK</span>
                  <span className="font-mono">{fmt(surefire.slots[0].options[0].base)}</span>
                  <span className="text-content-subtle">→ T4</span>
                  <span className="text-success font-mono font-semibold">
                    {fmt(
                      Math.round(surefire.slots[0].options[0].base * (1 + rules.tierFactor * 4)),
                    )}
                  </span>
                </div>
              )}
              {surefire.passives[0]?.texts?.length ? (
                <div className="space-y-1 text-xs">
                  <SkillDescription
                    desc={surefire.passives[0].texts[0]}
                    className="text-content-muted"
                  />
                  <div className="text-content-subtle">↓ T4</div>
                  <SkillDescription
                    desc={surefire.passives[0].texts[surefire.passives[0].texts.length - 1]}
                    className="text-content"
                  />
                </div>
              ) : null}
            </div>
          )}
          {[immunity, penetration].map(
            (set) =>
              set?.setEffects && (
                <div
                  key={set.slug}
                  className="border-line-subtle bg-surface-overlay/40 space-y-2 rounded-lg border p-3"
                >
                  <div className="flex items-center gap-2">
                    <EquipmentIcon
                      icon={set.icon}
                      grade="unique"
                      stars={6}
                      tier={4}
                      overlayIcon={set.setIcon}
                      size={44}
                    />
                    <span className="text-content-strong text-sm font-semibold">{set.name}</span>
                  </div>
                  <div className="space-y-2 text-xs">
                    {(
                      [
                        ['T0', set.setEffects.p2, set.setEffects.p4, 'text-content-muted'],
                        [
                          'T4',
                          set.setEffects.p2e ?? set.setEffects.p2,
                          set.setEffects.p4e ?? set.setEffects.p4,
                          'text-content',
                        ],
                      ] as const
                    ).map(([tier, p2, p4, cls]) => (
                      <div key={tier}>
                        <span className="text-content-subtle mb-1 block text-[10px] font-bold tracking-wide">
                          {tier}
                        </span>
                        <div className="space-y-1">
                          {(
                            [
                              ['2P', p2],
                              ['4P', p4],
                            ] as const
                          ).map(([tag, v]) =>
                            v ? (
                              <div key={tag} className="flex gap-1.5">
                                <span className="border-buff/30 bg-buff/10 text-buff h-fit shrink-0 rounded border px-1 text-[10px] font-bold">
                                  {tag}
                                </span>
                                <SkillDescription desc={v} className={`${cls} inline`} />
                              </div>
                            ) : null,
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ),
          )}
        </div>
        <p className="text-content-subtle text-xs italic">{L(LABELS.breakthroughExamplesNote)}</p>
      </Card>

      {/* Change Stats */}
      <Card>
        <Heading n={4}>{L(LABELS.method_changeStats_title)}</Heading>
        <Prose>{L(LABELS.changeStatsText)}</Prose>
        <div className="grid gap-3 sm:grid-cols-2">
          <MiniPanel accent="cyan" title={L(LABELS.changeAll_title)}>
            <div className="space-y-2">
              <p className="m-0">{L(LABELS.changeAll_desc)}</p>
              <div className="flex items-center gap-2">
                <span className="text-content-subtle">Cost:</span>
                {chipByName('Transistone (Total)', 20)}
              </div>
            </div>
          </MiniPanel>
          <MiniPanel accent="cyan" title={L(LABELS.selectChange_title)}>
            <div className="space-y-2">
              <p className="m-0">{L(LABELS.selectChange_desc)}</p>
              <div className="flex items-center gap-2">
                <span className="text-content-subtle">Cost:</span>
                {chipByName('Transistone (Individual)', 20)}
              </div>
            </div>
          </MiniPanel>
        </div>
        <Callout accent="amber" label={L(LABELS.changeStatsWarningTitle)}>
          {L(LABELS.changeStatsWarningText)}
        </Callout>
      </Card>
    </div>
  );

  // ═══════════════════════════ Onglet : Ascension ═══════════════════════════
  const bonusTable = (bonuses: typeof axWeapon.bonuses): ReactNode => (
    <TableShell
      head={
        <tr>
          {th(L(LABELS.ascensionBonus_effect))}
          {th(L(LABELS.ascensionBonus_chance), 'text-center')}
          {th(L(LABELS.ascensionBonus_range), 'text-center')}
        </tr>
      }
    >
      {bonuses.map((b, i) => {
        const cMin = b.grades.find((g) => g.grade === 'C');
        const spMax = b.grades.find((g) => g.grade === 'S+');
        const split = cMin?.rangeAlt && spMax?.rangeAlt && b.splitLabels;
        return (
          <tr key={i} className="border-line-subtle border-t">
            <td className="text-content px-3 py-2">{b.name}</td>
            <td className="text-stat-accent px-3 py-2 text-center font-mono">{b.chance}%</td>
            <td className="px-3 py-2 text-center font-mono text-xs">
              <div>
                <span style={{ color: gradeColor.C }}>{cMin?.range}</span>
                <span className="text-content-subtle mx-1">→</span>
                <span style={{ color: gradeColor['S+'] }}>{spMax?.range}</span>
                {split && (
                  <span className="text-content-subtle ml-1">({b.splitLabels!.primary})</span>
                )}
              </div>
              {split && (
                <div>
                  <span style={{ color: gradeColor.C }}>{cMin?.rangeAlt}</span>
                  <span className="text-content-subtle mx-1">→</span>
                  <span style={{ color: gradeColor['S+'] }}>{spMax?.rangeAlt}</span>
                  <span className="text-content-subtle ml-1">({b.splitLabels!.alt})</span>
                </div>
              )}
            </td>
          </tr>
        );
      })}
    </TableShell>
  );

  const ascensionPanel = (
    <div className="space-y-4 text-sm">
      <Prose>{L(LABELS.ascension_intro)}</Prose>
      <div className="grid gap-3 md:grid-cols-2">
        <MiniPanel accent="emerald" title={L(LABELS.ascension_prereqTitle)}>
          {L(LABELS.ascension_prereqText)}
        </MiniPanel>
        <Callout accent="amber" label={L(LABELS.ascension_warningTitle)}>
          {L(LABELS.ascension_warningText)}
        </Callout>
      </div>

      {/* Activation */}
      <Card>
        <Heading n={1}>{L(LABELS.ascension_activationTitle)}</Heading>
        <Prose>{L(LABELS.ascension_activationDesc)}</Prose>
        <DotList
          accent="emerald"
          items={[
            L(LABELS.ascension_benefit_cap),
            `${L(LABELS.ascension_benefit_reforge)} (+${rules.singularity.addReforge})`,
            `${L(LABELS.ascension_benefit_mainStat)} (+${activationPct}%)`,
          ]}
        />
        <div className="border-line-subtle bg-surface-overlay/40 flex flex-wrap items-center gap-4 rounded-lg border p-3">
          <span className="text-content-subtle text-xs tracking-wide uppercase">
            {L(LABELS.ascension_activationCost)}
          </span>
          {goldCell(axWeapon.activation.price)}
          {matTiles(axWeapon.activation.materials)}
        </div>
      </Card>

      {/* Steps */}
      <Card>
        <Heading n={2}>{L(LABELS.ascension_stepsTitle)}</Heading>
        <Prose>{L(LABELS.ascension_stepsDesc)}</Prose>
        <TableShell
          head={
            <tr>
              {th(L(LABELS.ascensionTable_step))}
              {th(L(LABELS.ascensionTable_success), 'text-center')}
              {th(L(LABELS.ascensionTable_gold), 'text-right')}
              {th(L(LABELS.ascensionTable_materials))}
              {th(L(MAIN_STAT_LABEL), 'text-center')}
            </tr>
          }
        >
          {axWeapon.steps.map((s, i) => (
            <tr key={s.to} className="border-line-subtle border-t">
              <td className="text-content-strong px-3 py-2 font-mono font-semibold whitespace-nowrap">
                +{s.to - 1} <span className="text-content-subtle">→</span> +{s.to}
                {i === axWeapon.steps.length - 1 && (
                  <span className="bg-singularity/15 text-singularity ml-1.5 rounded px-1 text-[10px] font-bold">
                    ★
                  </span>
                )}
              </td>
              <td className={`px-3 py-2 text-center font-mono font-semibold ${rateColor(s.rate)}`}>
                {s.rate}%
              </td>
              <td className="text-stat-accent px-3 py-2 text-right font-mono whitespace-nowrap">
                {fmt(s.price)}
              </td>
              <td className="px-3 py-2">{matTiles(s.materials)}</td>
              <td className="text-success px-3 py-2 text-center font-mono">+{stepPct(i)}%</td>
            </tr>
          ))}
        </TableShell>
        <Callout accent="emerald" label={L(LABELS.ascension_failTitle)}>
          {L(LABELS.ascension_failText)}
        </Callout>
      </Card>

      {/* Bonus +15 */}
      <Card>
        <Heading n={3}>{L(LABELS.ascension_bonusTitle)}</Heading>
        <Prose>{L(LABELS.ascension_bonusDesc)}</Prose>
        <Callout accent="cyan" label={L(LABELS.ascension_randomTitle)}>
          {L(LABELS.ascension_randomText)}
        </Callout>
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-content-subtle text-xs">{L(LABELS.ascension_gradeLegend)}</span>
          {GRADES.map((g) => (
            <span
              key={g}
              className="font-mono text-sm font-semibold"
              style={{ color: gradeColor[g] }}
            >
              {g}
            </span>
          ))}
        </div>
        <div className="space-y-2">
          <div className="text-ed-rose text-sm font-semibold">
            {L(LABELS.ascension_offensiveTitle)}
          </div>
          {bonusTable(axWeapon.bonuses)}
        </div>
        <div className="space-y-2">
          <div className="text-ed-sky text-sm font-semibold">
            {L(LABELS.ascension_defensiveTitle)}
          </div>
          {bonusTable(axArmor.bonuses)}
          <p className="text-content-subtle text-xs italic">
            {L(LABELS.ascension_defensiveSplitNote)}
          </p>
        </div>
      </Card>

      {/* Reroll */}
      <Card>
        <Heading n={4}>{L(LABELS.ascension_rerollTitle)}</Heading>
        <Prose>{L(LABELS.ascension_rerollDesc)}</Prose>
        <div className="border-line-subtle bg-surface-overlay/40 flex flex-wrap items-center gap-4 rounded-lg border p-3">
          {goldCell(axWeapon.reroll.price)}
          {matTiles(axWeapon.reroll.materials)}
          <span className="text-success bg-success/10 rounded px-2 py-0.5 text-xs">
            {axWeapon.reroll.rate}%
          </span>
        </div>
      </Card>
    </div>
  );

  // ═══════════════════════════ Onglet : Obtaining ═══════════════════════════
  const PRIORITY = [
    { slot: LABELS.slot_weapons, desc: LABELS.slotDesc_weapons, cls: 'text-ed-rose' },
    { slot: LABELS.slot_accessories, desc: LABELS.slotDesc_accessories, cls: 'text-ed-violet' },
    { slot: LABELS.slot_gloves, desc: LABELS.slotDesc_gloves, cls: 'text-ed-amber' },
    { slot: LABELS.slot_otherArmor, desc: LABELS.slotDesc_otherArmor, cls: 'text-ed-sky' },
  ];
  const obtainingPanel = (
    <div className="space-y-4 text-sm">
      <Card>
        <Prose>{L(LABELS.obtaining_intro)}</Prose>
        <NumberedList
          accent="sky"
          items={[
            <span key="a">
              <strong className="text-content-strong">{L(LABELS.obt_farmBosses_title)}</strong> —{' '}
              {L(LABELS.obt_farmBosses_desc)}
            </span>,
            <span key="b">
              <strong className="text-content-strong">{L(LABELS.obt_craftArmor_title)}</strong> —{' '}
              {P(LABELS.obt_craftArmor_desc)}{' '}
              <span className="text-ed-amber">{L(LABELS.obt_craftArmor_warning)}</span>
            </span>,
            <span key="c">
              <strong className="text-content-strong">{L(LABELS.obt_preciseCraft_title)}</strong> —{' '}
              {P(LABELS.obt_preciseCraft_desc)}
            </span>,
            <span key="d">
              <strong className="text-content-strong">{L(LABELS.obt_irregularBosses_title)}</strong>{' '}
              — {L(LABELS.obt_irregularBosses_desc)}
            </span>,
          ]}
        />
      </Card>

      <Card>
        <Heading>{L(LABELS.obtaining_dropRateTitle)}</Heading>
        <Prose>
          {L(LABELS.obtaining_dropRateText_before)}
          <InlineIcon
            icon={img.item('EBT_WORLD_BOSS_TITLE')}
            label={L(LABELS.obtaining_worldlineExplorer)}
            underline={false}
          />
          {L(LABELS.obtaining_dropRateText_after)}
        </Prose>
      </Card>

      <Card>
        <Heading>{L(LABELS.obtaining_shopsTitle)}</Heading>
        <div className="grid gap-3 md:grid-cols-2">
          <MiniPanel accent="amber" title={L(LABELS.obtaining_limitedShopsTitle)}>
            <span>
              {L(LABELS.obtaining_limitedShopsText_before)}
              {chipByName('Ether', 18)}
              {L(LABELS.obtaining_limitedShopsText_after)}
            </span>
          </MiniPanel>
          <MiniPanel accent="sky" title={L(LABELS.obtaining_eventChestsTitle)}>
            {L(LABELS.obtaining_eventChestsText)}
          </MiniPanel>
        </div>
      </Card>

      <Card>
        <Heading>{L(LABELS.obtaining_priorityTitle)}</Heading>
        <Prose>{L(LABELS.obtaining_priorityIntro)}</Prose>
        <div className="space-y-2">
          {PRIORITY.map((p, i) => (
            <div
              key={i}
              className="border-line-subtle bg-surface-overlay/40 flex items-center gap-3 rounded-lg border p-3"
            >
              <span className={`text-lg font-bold ${p.cls}`}>{i + 1}</span>
              <div>
                <div className="text-content-strong font-semibold">{L(p.slot)}</div>
                <div className="text-content-muted text-xs">{L(p.desc)}</div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );

  // ═══════════════════════════════ Onglet : FAQ ═══════════════════════════════
  const QA = ({ q, children }: { q: string; children: ReactNode }) => (
    <div className="border-line-subtle bg-surface-raised/60 rounded-xl border px-4 py-3.5">
      <h3 className="text-content-strong text-[15px] leading-snug font-semibold">{q}</h3>
      <div className="text-content-muted mt-2 space-y-2 text-sm leading-relaxed">{children}</div>
    </div>
  );
  const faqPanel = (
    <div className="space-y-5 text-sm">
      <div className="space-y-2">
        <div className="text-content-strong text-sm font-semibold">
          {L(LABELS.faq_qualityTitle)}
        </div>
        <QA q={L(LABELS.faq_legendaryOnly_q)}>
          <p className="text-content m-0 font-semibold">{L(LABELS.faq_legendaryOnly_a1)}</p>
          <p className="m-0">{L(LABELS.faq_legendaryOnly_a2)}</p>
          <p className="m-0">{L(LABELS.faq_legendaryOnly_a3)}</p>
        </QA>
        <QA q={L(LABELS.faq_sixVsFive_q)}>
          <p className="m-0">{L(LABELS.faq_sixVsFive_a1)}</p>
          <p className="m-0">{L(LABELS.faq_sixVsFive_a2)}</p>
          <p className="m-0">{L(LABELS.faq_sixVsFive_a3)}</p>
        </QA>
      </div>

      <div className="space-y-2">
        <div className="text-content-strong text-sm font-semibold">
          {L(LABELS.faq_upgradingTitle)}
        </div>
        <QA q={L(LABELS.faq_transistoneUsage_q)}>
          <p className="m-0">{L(LABELS.faq_transistoneUsage_a)}</p>
        </QA>
        <QA q={L(LABELS.faq_badMainStat_q)}>
          <p className="m-0">{L(LABELS.faq_badMainStat_a)}</p>
        </QA>
        <QA q={L(LABELS.faq_badSubstats_q)}>
          <p className="m-0">{P(LABELS.faq_badSubstats_a)}</p>
        </QA>
      </div>

      <div className="space-y-2">
        <div className="text-content-strong text-sm font-semibold">
          {L(LABELS.faq_farmingTitle)}
        </div>
        <QA q={L(LABELS.faq_howToGet_q)}>
          <p className="m-0">{L(LABELS.faq_howToGet_intro)}</p>
          <ol className="m-0 list-decimal space-y-1 pl-5">
            <li>{L(LABELS.obt_farmBosses_desc)}</li>
            <li>
              {P(LABELS.obt_craftArmor_desc)} {L(LABELS.obt_craftArmor_warning)}
            </li>
            <li>{P(LABELS.obt_preciseCraft_desc)}</li>
            <li>{L(LABELS.obt_irregularBosses_desc)}</li>
          </ol>
        </QA>
        <QA q={L(LABELS.faq_dropBoost_q)}>
          <p className="m-0">
            {L(LABELS.obtaining_dropRateText_before)}
            <InlineIcon
              icon={img.item('EBT_WORLD_BOSS_TITLE')}
              label={L(LABELS.obtaining_worldlineExplorer)}
              underline={false}
            />
            {L(LABELS.obtaining_dropRateText_after)}
          </p>
        </QA>
        <QA q={L(LABELS.faq_limitedShop_q)}>
          <p className="m-0">
            {L(LABELS.obtaining_limitedShopsText_before)}
            {chipByName('Ether', 18)}
            {L(LABELS.obtaining_limitedShopsText_after)}
          </p>
        </QA>
        <QA q={L(LABELS.faq_eventChests_q)}>
          <p className="m-0">{L(LABELS.obtaining_eventChestsText)}</p>
        </QA>
      </div>
    </div>
  );

  const tabs: TabItem[] = [
    { key: 'basics', label: L(LABELS.tab_basics), content: basicsPanel },
    { key: 'upgrading', label: L(LABELS.tab_upgrading), content: upgradingPanel },
    { key: 'ascension', label: L(LABELS.tab_ascension), content: ascensionPanel },
    { key: 'obtaining', label: L(LABELS.tab_obtaining), content: obtainingPanel },
    { key: 'faq', label: L(LABELS.tab_faq), content: faqPanel },
  ];

  return (
    <>
      <Prose>{L(LABELS.intro)}</Prose>
      <SegmentedTabs tabs={tabs} ariaLabel={L(LABELS.heading)} urlKey="tab" variant="pill" />
    </>
  );
}
