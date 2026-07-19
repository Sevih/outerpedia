/**
 * Guide « Growth Systems » (heroes-growth) — 7 onglets (Gems fusionné dans
 * Special Equipment).
 *
 * Les tables NUMÉRIQUES (limit break, skill upgrade, EE/talisman, XP food)
 * DÉRIVENT de `data/generated/hero-growth.json` (cf. le générateur : coûts
 * exacts, auto-corrigés). La PROSE et les données non dérivables (gifts
 * d'affinité, paliers, effets de transcendance) sont éditoriales (labels.ts /
 * editorial.ts). Server Component ; items en tuile à cadre de rareté (ItemInline).
 */
import type { ReactNode } from 'react';
import Link from 'next/link';
import type { Route } from 'next';
import type { Lang } from '@/lib/i18n/config';
import { getT } from '@/i18n';
import { lRec } from '@/lib/i18n/localize';
import { parseText, type ParseCtx } from '@/lib/parse-text';
import { img } from '@/lib/images';
import { ItemInline } from '@/components/inline/ItemInline';
import { StarIcon } from '@/components/guides/editorial/banner/StarText';
import { SegmentedTabs, type TabItem } from '@/components/guides/SegmentedTabs';
import { Prose, Callout, DotList } from '@/components/guides/editorial/blocks';
import { getCatalog } from '@/lib/data/items';
import { STAR_SPRITE } from '@/lib/data/char-progression';
import type { LocalizedText, HeroGrowthData, ItemRef, ItemCost } from '@contracts';
import growthRaw from '@data/generated/hero-growth.json';
import { LABELS, GEAR_POINTS } from './labels';
import { AFFINITY_GIFTS, AFFINITY_REWARDS, TRANSCENDENCE_STEPS } from './editorial';

const growth = growthRaw as HeroGrowthData;
const RARITIES = ['1', '2', '3'] as const;

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

export default async function HeroesGrowthGuide({ lang }: { lang: Lang }) {
  const t = await getT(lang);
  const ctx: ParseCtx = { lang, t, strict: true };
  const L = (m: LocalizedText): string => lRec(m, lang) || m.en || '';
  const fmt = (n: number): string => n.toLocaleString('en-US');

  /** Tuile à cadre de rareté depuis une réf d'item dérivée. */
  const chip = (ref: ItemRef, size = 22): ReactNode => (
    <ItemInline
      item={{ name: L(ref.name), iconSrc: img.item(ref.icon), grade: ref.grade }}
      size={size}
      color="text-content"
    />
  );

  /** Tuile depuis un id de catalogue (chaîne d'échange, items d'événement). */
  const chipById = (id: string, size = 22): ReactNode => {
    const e = catalogById[id];
    if (!e) return id;
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

  /** Tuile depuis un nom (items éditoriaux : gifts, vouchers) ; texte si absent. */
  const chipByName = (name: string, size = 20): ReactNode => {
    const e = CATALOG_BY_NAME.get(name.trim().toLowerCase());
    if (!e) return <span>{name}</span>;
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

  const costList = (costs: ItemCost[]): ReactNode =>
    costs.length ? (
      <span className="inline-flex flex-col gap-0.5">
        {costs.map((c, i) => (
          <span key={i} className="inline-flex items-center gap-1 whitespace-nowrap">
            {chip(c.item, 20)} <span className="text-content">×{c.count}</span>
          </span>
        ))}
      </span>
    ) : (
      <span className="text-content-subtle">—</span>
    );

  const Rarity = ({ n }: { n: string }) => (
    <span className="inline-flex items-center gap-0.5 whitespace-nowrap">
      {n}
      <StarIcon size={13} />
    </span>
  );

  /** Rangée de 6 étoiles de transcendance (sprites du jeu, comme TranscendSlider). */
  const StarRow = ({ stars, color }: { stars: number; color: string }) => (
    <span className="inline-flex shrink-0 items-center gap-0.5">
      {Array.from({ length: 6 }, (_, i) => {
        const sprite =
          i >= stars
            ? STAR_SPRITE.gray
            : i === stars - 1
              ? (STAR_SPRITE[color] ?? STAR_SPRITE.yellow)
              : STAR_SPRITE.yellow;
        return (
          // eslint-disable-next-line @next/next/no-img-element -- asset R2/staging
          <img key={i} src={img.transcendStar(sprite)} alt="" width={15} height={15} />
        );
      })}
    </span>
  );

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

  /** Bonus de stat de base d'une étape de transcendance sans effet spécial. */
  const STAT_BONUS: LocalizedText = {
    en: 'base ATK / DEF / HP bonus',
    jp: '基本ATK / DEF / HP ボーナス',
    kr: '기본 ATK / DEF / HP 보너스',
    zh: '基础 ATK / DEF / HP 加成',
    fr: 'bonus de base ATK / DEF / HP',
  };

  const TableShell = ({ head, children }: { head: ReactNode; children: ReactNode }) => (
    <div className="border-line overflow-x-auto rounded-xl border">
      <table className="w-full text-sm">
        <thead className="bg-surface-sunken text-content-subtle text-xs">{head}</thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );

  const th = (label: ReactNode) => <th className="px-3 py-2 text-left font-medium">{label}</th>;
  const td = (v: ReactNode) => <td className="text-content px-3 py-2 align-top">{v}</td>;

  // ---------- Onglet : Leveling
  const levelingPanel = (
    <div className="space-y-3 text-sm">
      <Prose>{L(LABELS.levelingDesc1)}</Prose>
      <Prose>{L(LABELS.levelingDesc2)}</Prose>
      <ul className="text-content space-y-1">
        {growth.xpFood.map((f) => (
          <li key={f.id} className="flex items-center gap-2">
            {chip(f, 22)}
            <span className="text-content">
              {L(LABELS.grantsXP)} {fmt(f.xp)} {L(LABELS.xpUnit)}
            </span>
          </li>
        ))}
      </ul>
      <p className="text-content flex flex-wrap items-center gap-1.5">
        {chipByName('Unlimited Restaurant Voucher')} <span>{L(LABELS.instantLv100)}</span>
      </p>
    </div>
  );

  // ---------- Onglet : Limit Break
  const lbRanges = growth.limitBreak['1'] ?? [];
  const limitBreakPanel = (
    <div className="space-y-3 text-sm">
      <Prose>{L(LABELS.limitBreakDesc)}</Prose>
      <Prose>{L(LABELS.limitBreakSource)}</Prose>
      <div className="border-line bg-surface-sunken text-content flex flex-wrap items-center gap-x-3 gap-y-2 rounded-lg border px-3 py-2">
        {chipById('30519')}
        <span className="text-content-subtle">→</span>
        <span className="inline-flex flex-wrap items-center gap-1.5">
          {chipById('30512')}
          <span className="text-content text-xs italic">
            ({L(LABELS.limitBreakChainElementChoice)})
          </span>
        </span>
        <span className="text-content-subtle">→</span>
        <span>{L(LABELS.limitBreakChainPerHero)}</span>
      </div>
      <TableShell
        head={
          <tr>
            {th(L(LABELS.colLvRange))}
            {RARITIES.map((r) => (
              <th key={r} className="px-3 py-2 text-center font-medium">
                <Rarity n={r} />
              </th>
            ))}
          </tr>
        }
      >
        {lbRanges.map((_, i) => (
          <tr key={i} className="border-line-subtle border-t">
            <td className="text-content px-3 py-2 font-medium whitespace-nowrap">
              Lv.{lbRanges[i].fromLevel} → Lv.{lbRanges[i].toLevel}
            </td>
            {RARITIES.map((r) => {
              const s = growth.limitBreak[r]?.[i];
              return (
                <td key={r} className="text-content px-3 py-2 text-center">
                  {s ? (
                    <span className="inline-flex flex-col items-center gap-0.5">
                      <span className="inline-flex items-center gap-1 whitespace-nowrap">
                        {chipById('30519', 18)} ×{s.pieces}
                      </span>
                      {goldCell(s.gold)}
                    </span>
                  ) : (
                    '—'
                  )}
                </td>
              );
            })}
          </tr>
        ))}
      </TableShell>
    </div>
  );

  // ---------- Onglet : Transcendence
  const transcendencePanel = (
    <div className="space-y-3 text-sm">
      <Prose>{L(LABELS.transcendenceDesc1)}</Prose>
      <Callout accent="amber">{parseText(L(LABELS.transcendenceDesc2), ctx)}</Callout>
      <Prose>{L(LABELS.transcendenceDesc3)}</Prose>
      <ul className="space-y-2">
        {TRANSCENDENCE_STEPS.map((s) => (
          <li key={s.step} className="text-content flex flex-wrap items-center gap-2">
            <span className="inline-flex shrink-0 items-center gap-1.5">
              <StarRow stars={s.stars} color={s.color} />
              <span className="w-8 font-medium">{s.step}</span>
            </span>
            <span className="text-content-subtle">→</span>
            <span>
              {s.effect ? (
                L(s.effect)
              ) : (
                <span className="text-content italic">{L(STAT_BONUS)}</span>
              )}
            </span>
          </li>
        ))}
      </ul>
      <p className="text-content-subtle text-xs italic">{L(LABELS.transcendenceNote)}</p>
    </div>
  );

  // ---------- Onglet : Affinity
  const rewardLabel = (r: 'stats' | 'chat') =>
    L(r === 'chat' ? LABELS.rewardChat : LABELS.rewardStats);
  const affinityPanel = (
    <div className="space-y-3 text-sm">
      <Prose>{L(LABELS.affinityDesc)}</Prose>
      <TableShell head={<tr />}>
        {AFFINITY_GIFTS.map((tier, i) => (
          <tr key={i} className="border-line-subtle border-t">
            {td(
              <span className="inline-flex flex-col gap-0.5">
                {tier.items.map((it, j) => (
                  <span key={j}>{chipByName(it)}</span>
                ))}
              </span>,
            )}
            <td className="text-content px-3 py-2 align-middle whitespace-nowrap">
              +{fmt(tier.points)}{' '}
              <span className="text-content">
                ({L(LABELS.bonus)}: +{fmt(tier.bonus)})
              </span>
            </td>
          </tr>
        ))}
      </TableShell>
      <p className="text-content flex flex-wrap items-center gap-1.5">
        {chipById('20007')} <span>{L(LABELS.affinityMaxItem)}</span>
      </p>

      <h3 className="text-content mt-4 font-semibold">{L(LABELS.affinityExpansionTitle)}</h3>
      <Prose>{L(LABELS.affinityExpansionDesc)}</Prose>
      <TableShell
        head={
          <tr>
            {th(L(LABELS.colLevel))}
            {th(L(LABELS.colReward))}
          </tr>
        }
      >
        {AFFINITY_REWARDS.map((r) => (
          <tr key={r.level} className="border-line-subtle border-t">
            <td className="text-content px-3 py-2 font-medium whitespace-nowrap">Lv. {r.level}</td>
            {td(rewardLabel(r.reward))}
          </tr>
        ))}
      </TableShell>

      <h3 className="text-content mt-4 font-semibold">{L(LABELS.bondChatTitle)}</h3>
      <Prose>{L(LABELS.bondChatIntro)}</Prose>
      <p className="text-content">
        <strong>Bond</strong> {L(LABELS.bondDesc)}
      </p>
      <p className="text-content">
        <strong>Chat</strong> {L(LABELS.chatDesc)}
      </p>
    </div>
  );

  // ---------- Onglet : Skill Upgrade
  const skillLevels = [2, 3, 4, 5];
  const skillPanel = (
    <div className="space-y-3 text-sm">
      <Prose>{L(LABELS.skillUpgradeDesc1)}</Prose>
      <Prose>{L(LABELS.skillUpgradeDesc2)}</Prose>
      <TableShell
        head={
          <tr>
            {th(L(LABELS.colUpgradeLevel))}
            {RARITIES.map((r) => (
              <th key={r} className="px-3 py-2 text-center font-medium">
                <Rarity n={r} />
              </th>
            ))}
          </tr>
        }
      >
        {skillLevels.map((lv) => (
          <tr key={lv} className="border-line-subtle border-t">
            <td className="text-content px-3 py-2 font-medium">Lv{lv}</td>
            {RARITIES.map((r) => {
              const row = growth.skillUpgrade[r]?.find((s) => s.level === lv);
              return (
                <td key={r} className="text-content px-3 py-2 text-center">
                  <span className="inline-flex flex-col items-center gap-0.5">
                    {(row?.manuals ?? []).map((m, i) => (
                      <span key={i} className="inline-flex items-center gap-1 whitespace-nowrap">
                        {chip(m.item, 18)} ×{m.count}
                      </span>
                    ))}
                  </span>
                </td>
              );
            })}
          </tr>
        ))}
      </TableShell>
    </div>
  );

  // ---------- Onglet : Special Equipment (+ Gems)
  const enchantTable = (rows: HeroGrowthData['specialEquip']['ee']) => (
    <TableShell
      head={
        <tr>
          {th('Lv.')}
          {th(L(LABELS.colMaterials))}
          {th(L(LABELS.colGold))}
          {th(L(LABELS.colGemSlot))}
        </tr>
      }
    >
      {rows.map((row) => (
        <tr key={row.level} className="border-line-subtle border-t">
          <td className="text-content px-3 py-2 font-medium">+{row.level}</td>
          {td(costList(row.materials))}
          <td className="text-content px-3 py-2">{goldCell(row.gold)}</td>
          <td className="text-content px-3 py-2 text-center">
            {row.gemSlot > 0 ? `+${row.gemSlot}` : <span className="text-content-subtle">—</span>}
          </td>
        </tr>
      ))}
    </TableShell>
  );
  const specialEquipPanel = (
    <div className="space-y-3 text-sm">
      <Prose>{L(LABELS.specialEquipmentDesc)}</Prose>

      <h3 className="text-content mt-2 font-semibold">{L(LABELS.eeTitle)}</h3>
      <Prose>{L(LABELS.eeDesc)}</Prose>
      {enchantTable(growth.specialEquip.ee)}
      <Prose>{L(LABELS.eeLv5Unlock)}</Prose>

      <h3 className="text-content mt-4 font-semibold">{L(LABELS.talismanTitle)}</h3>
      <Prose>{L(LABELS.talismanDesc)}</Prose>
      {enchantTable(growth.specialEquip.talisman)}
      <Callout accent="sky">{L(LABELS.auraNote)}</Callout>
      <Prose>{L(LABELS.materialsSource)}</Prose>

      <h3 className="text-content mt-4 font-semibold">{L(LABELS.gemsTitle)}</h3>
      <Prose>{L(LABELS.gemsDesc1)}</Prose>
      <Prose>{parseText(L(LABELS.gemsDesc2), ctx)}</Prose>
    </div>
  );

  // ---------- Onglet : Gear
  const gearHref = `/${lang}/guides/general-guides/gear` as Route;
  const gearPanel = (
    <div className="space-y-3 text-sm">
      <Prose>
        {L(LABELS.gearIntro).split(L(LABELS.gearEquipmentGuide))[0]}
        <Link href={gearHref} className="text-accent underline">
          {L(LABELS.gearEquipmentGuide)}
        </Link>
        {L(LABELS.gearIntro).split(L(LABELS.gearEquipmentGuide))[1]}
      </Prose>
      <DotList accent="sky" items={GEAR_POINTS.map((p) => L(p))} />
    </div>
  );

  const tabs: TabItem[] = [
    { key: 'leveling', label: L(LABELS.tabLeveling), content: levelingPanel },
    { key: 'limit-break', label: L(LABELS.tabLimitBreak), content: limitBreakPanel },
    { key: 'transcendence', label: L(LABELS.tabTranscendence), content: transcendencePanel },
    { key: 'affinity', label: L(LABELS.tabAffinity), content: affinityPanel },
    { key: 'skills', label: L(LABELS.tabSkills), content: skillPanel },
    { key: 'special-equip', label: L(LABELS.tabSpecialEquip), content: specialEquipPanel },
    { key: 'gear', label: L(LABELS.tabGear), content: gearPanel },
  ];

  return (
    <>
      <Prose>{L(LABELS.intro)}</Prose>
      <SegmentedTabs tabs={tabs} ariaLabel={L(LABELS.intro)} urlKey="tab" variant="game" />
    </>
  );
}
