/**
 * Blocs SERVEUR du gabarit bannière (portés : BannerRates/Rewards/
 * Resources/MileageInfo) — les briques que composent les guides « Banners &
 * Mileage » et, demain, « Premium & Limited ».
 *
 * Les TAUX et COÛTS viennent de `recruit.json` (générés depuis les tables du
 * jeu) ; les libellés de chrome vivent ici en `LocalizedText` ; tout texte
 * ÉDITORIAL (avertissements, notes) arrive déjà localisé de l'appelant.
 */
import type { ReactNode } from 'react';
import type { LocalizedText, RecruitDrop, RecruitKindInfo, RecruitRate } from '@contracts';
import type { Lang } from '@/lib/i18n/config';
import { lRec } from '@/lib/i18n/localize';
import { cn } from '@/lib/cn';
import { ItemInline, type InlineItem } from '@/components/inline/ItemInline';
import { InlineTooltip } from '@/components/inline/InlineTooltip';
import { StarIcon } from './StarText';
import { itemChipById, itemChipByName } from './items';

const LABELS = {
  specialFeature: {
    en: 'Special feature:',
    jp: '特徴:',
    kr: '특징:',
    zh: '特点：',
    fr: 'Particularité :',
  },
  guarantee2Star: {
    en: 'Using Recruit x 10 guarantees at least one 2{star} hero',
    jp: '10連募集で2{star}以上のヒーローが1体以上確定',
    kr: '10연 모집 시 2{star} 이상 영웅 1체 이상 확정',
    zh: '10连招募保底至少1个2{star}以上英雄',
    fr: 'Utiliser Recruit x 10 garantit au moins un Héros 2{star}',
  },
  guaranteeHighGrade: {
    en: 'Using Recruit x 10 guarantees at least one high-grade item',
    jp: '10連召喚で高級アイテムが1個以上確定',
    kr: '10연 호출 시 고급 아이템 1개 이상 확정',
    zh: '10连召唤保底至少1个高级物品',
    fr: 'Utiliser Recruit x 10 garantit au moins un objet de haute qualité',
  },
  rateUpGear: {
    en: 'Rate-Up Gear',
    jp: 'ピックアップ装備',
    kr: '픽업 장비',
    zh: '已选装备',
    fr: 'Équipement en focus',
  },
  guarantee: {
    en: 'Recruitment guarantee:',
    jp: '募集確定:',
    kr: '모집 확정:',
    zh: '招募保底：',
    fr: 'Garantie de Recruit :',
  },
  freePull: {
    en: '1 free pull per day',
    jp: '1日1回無料募集',
    kr: '1일 1회 무료 모집',
    zh: '每日1次免费招募',
    fr: '1 pull gratuit par jour',
  },
  dupesGive: {
    en: 'Duplicates give',
    jp: '重複時の獲得',
    kr: '중복 획득 시',
    zh: '重复获得时',
    fr: 'Les doublons donnent',
  },
  rarity: { en: 'Rarity', jp: 'レアリティ', kr: '희귀도', zh: '星级', fr: 'Rareté' },
  resources: {
    en: 'Resources',
    jp: '使用できるリソース',
    kr: '사용 가능한 재화',
    zh: '可使用资源',
    fr: 'Ressources',
  },
  perRecruit: {
    en: 'per recruit',
    jp: '1回募集あたり',
    kr: '1회 모집당',
    zh: '每次招募',
    fr: 'par Recruit',
  },
  grants: { en: 'Grants', jp: '獲得', kr: '획득', zh: '获得', fr: 'Donne' },
  noMileage: {
    en: 'No mileage',
    jp: 'マイレージ加算なし',
    kr: '마일리지 미적용',
    zh: '不计入点数',
    fr: 'Pas de mileage',
  },
  keptUntilUse: {
    en: 'is kept until you decide to use it.',
    jp: 'は使用するまで保持されます。',
    kr: '는 사용할 때까지 유지됩니다.',
    zh: '会保留直到使用。',
    fr: "est conservé jusqu'à ce que vous décidiez de l'utiliser.",
  },
  exchangeOptions: {
    en: 'Exchange options:',
    jp: '交換オプション:',
    kr: '교환 옵션:',
    zh: '交换选项：',
    fr: "Options d'échange :",
  },
  featuredHero: {
    en: 'Featured hero',
    jp: 'ピックアップヒーロー',
    kr: '픽업 영웅',
    zh: 'PICKUP同伴',
    fr: 'Héros en focus',
  },
  ownedBonus: {
    en: 'If you already own the hero, you get 15 additional',
    jp: '既に所持している場合は15個追加で獲得できます',
    kr: '이미 보유 중인 경우 15개가 추가로 지급됩니다',
    zh: '如已拥有该同伴，额外获得15个',
    fr: 'Si vous possédez déjà le Héros, vous obtenez 15 supplémentaires',
  },
} satisfies Record<string, LocalizedText>;

/** `{star}` → icône (les libellés de chrome portent le marqueur historique). */
function starText(text: string): ReactNode {
  const parts = text.split('{star}');
  return parts.map((part, i) => (
    <span key={i}>
      {part}
      {i < parts.length - 1 && <StarIcon />}
    </span>
  ));
}

/**
 * Libellés EN de paliers que le client rend mal, par clé TextSystem — les
 * autres langues du jeu sont justes, seul l'anglais dérape :
 *   TITLE_05      le jeu dit « Chance Increase », trop vague pour un pickup ;
 *   EQUIP_TITLE_* le jeu dit « Advanced », là où l'éditeur communique
 *                 « High-Dimensional Supply » (et où JP/KR/ZH disent bien
 *                 « haute dimension » : 高次元物資 / 고차원 물자 / 高次元物资).
 * Sans override, la prochaine régénération réécrirait le libellé du client.
 */
const TITLE_EN_OVERRIDE: Record<string, string> = {
  SYS_RECRUIT_RATEINFO_TITLE_05: 'Focus Target Chance',
  SYS_RECRUIT_EQUIP_TITLE_06: 'High-Dimensional Supply III',
  SYS_RECRUIT_EQUIP_TITLE_04: 'High-Dimensional Supply II',
  SYS_RECRUIT_EQUIP_TITLE_02: 'High-Dimensional Supply I',
};

/**
 * Le palier VEDETTE — ce pour quoi on tire sur la bannière. C'est le palier
 * pickup (`*_TITLE_05`) quand il existe, sinon le 3★ (`*_TITLE_03`) : le
 * Custom Rate Up n'a pas de ligne pickup, ses 3 persos choisis sortent du
 * palier 3★. Dérivé des clés, donc juste sur les cinq bannières sans table à
 * tenir.
 */
function jackpotKeyOf(rates: RecruitRate[]): string | undefined {
  const find = (suffix: string) => rates.find((r) => r.titleKey.endsWith(suffix))?.titleKey;
  return find('_TITLE_05') ?? find('_TITLE_03');
}

/**
 * Taux d'une bannière — GÉNÉRÉS (`RecruitKindInfo.rates`, libellés du jeu).
 * La garantie du x10 se DÉRIVE des taux du slot garanti (une ligne à 0 % en
 * confirm = tirage garanti remonté) ; le pull gratuit de `freeCount`. Le
 * compteur de garantie (pity) arrive en revanche du dehors (`guarantee`) : il
 * ne vit dans aucune table.
 */
export function BannerRates({
  info,
  lang,
  subtext,
  guarantee,
}: {
  info: RecruitKindInfo;
  lang: Lang;
  /** Note éditoriale sous la grille (ex. taux réel des Demiurge). */
  subtext?: string;
  /**
   * Règle du COMPTEUR DE GARANTIE de la bannière (déjà localisée) — le pity
   * introduit le 25/08/2026, distinct du mileage. Éditorial : aucune colonne
   * des tables ne le porte (`OpenRecruitCount` est un déblocage, pas ça).
   */
  guarantee?: string;
}) {
  const hasGuarantee = info.rates.some((r) => r.percent > 0 && r.confirmPercent === 0);
  const jackpotKey = jackpotKeyOf(info.rates);
  return (
    <div className="mx-auto max-w-xl space-y-3">
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {info.rates.map((rate: RecruitRate, i) => {
          const override = TITLE_EN_OVERRIDE[rate.titleKey];
          const title = override ? { ...rate.title, en: override } : rate.title;
          const label = lRec(title, lang) || title.en;
          const isJackpot = rate.titleKey === jackpotKey;
          const labelClass = isJackpot
            ? 'text-ed-amber-soft text-sm font-semibold'
            : 'text-content-muted text-sm';
          return (
            <div
              key={i}
              className={cn(
                'rounded-lg border p-3',
                isJackpot
                  ? 'border-ed-amber/40 bg-ed-amber/8'
                  : 'border-line-subtle bg-surface-overlay/50',
              )}
            >
              <div className="flex items-center justify-between gap-2">
                {rate.drops ? (
                  <InlineTooltip interactive content={<DropList drops={rate.drops} lang={lang} />}>
                    <span
                      className={cn(
                        labelClass,
                        'cursor-help underline decoration-dotted underline-offset-2',
                      )}
                    >
                      {label}
                    </span>
                  </InlineTooltip>
                ) : (
                  <span className={labelClass}>{label}</span>
                )}
                <span className="text-ed-amber text-lg font-bold">{rate.percent}%</span>
              </div>
            </div>
          );
        })}
      </div>
      {subtext && <p className="text-content-subtle text-xs">{subtext}</p>}
      <div className="flex flex-col gap-2">
        {hasGuarantee && (
          <div className="border-ed-amber/25 bg-ed-amber/5 rounded-lg border p-2.5">
            <p className="text-ed-amber-soft text-sm">
              <span className="font-semibold">{lRec(LABELS.specialFeature, lang)}</span>{' '}
              {/* La Dimensional Supply tire de l'ÉQUIPEMENT : son slot garanti
                  ne promet pas un Héros 2★ mais un objet de haute qualité. */}
              {info.kind === 'equipment'
                ? lRec(LABELS.guaranteeHighGrade, lang)
                : starText(lRec(LABELS.guarantee2Star, lang))}
            </p>
          </div>
        )}
        {guarantee && (
          <div className="border-ed-violet/25 bg-ed-violet/5 rounded-lg border p-2.5">
            <p className="text-ed-violet-soft text-sm">
              <span className="font-semibold">{lRec(LABELS.guarantee, lang)}</span> {guarantee}
            </p>
          </div>
        )}
        {info.freeCount > 0 && (
          <div className="border-ed-emerald/25 bg-ed-emerald/5 rounded-lg border p-2.5">
            <p className="text-ed-emerald-soft text-sm font-semibold">
              {lRec(LABELS.freePull, lang)}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Contenu d'un palier « sac de butin », au survol (tap sur mobile) — icône,
 * nom, quantité et taux ABSOLU du lot. Volontairement sans `ItemInline` : il
 * porte lui-même un tooltip, et imbriquer deux HoverCard ne rend rien de bon.
 */
function DropList({ drops, lang }: { drops: RecruitDrop[]; lang: Lang }) {
  return (
    <ul className="m-0 max-h-64 space-y-1 overflow-y-auto text-xs">
      {drops.map((drop) => {
        const item = itemChipById(drop.itemId, lang);
        return (
          <li key={`${drop.itemId}-${drop.count}`} className="flex items-center gap-2">
            {item.iconSrc && (
              <img
                src={item.iconSrc}
                alt=""
                aria-hidden
                width={16}
                height={16}
                className="shrink-0"
              />
            )}
            <span className="text-content grow">
              {item.name}
              {drop.count > 1 && <span className="text-content-subtle"> x{drop.count}</span>}
            </span>
            <span className="text-ed-amber shrink-0 tabular-nums">{drop.percent}%</span>
          </li>
        );
      })}
    </ul>
  );
}

export interface DupeReward {
  stars: number;
  wildcard: number;
  heroPiece: number;
  note?: string;
}

/** Table « les doublons donnent » (constantes éditoriales — stables). */
export function BannerRewards({ rewards, lang }: { rewards: DupeReward[]; lang: Lang }) {
  return (
    <div className="mx-auto max-w-xl space-y-2">
      <p className="text-content text-sm font-semibold">{lRec(LABELS.dupesGive, lang)}:</p>
      <div className="border-line-subtle bg-surface-raised/40 overflow-hidden rounded-lg border">
        <table className="w-full text-sm">
          <thead className="bg-surface-overlay/70">
            <tr className="border-line-subtle border-b">
              <th className="text-content-muted px-3 py-2 text-left font-semibold">
                {lRec(LABELS.rarity, lang)}
              </th>
              <th className="px-3 py-2 text-left font-semibold">
                <ItemInline item={itemChipByName('Wildcard Pieces', lang)} />
              </th>
              <th className="px-3 py-2 text-left font-semibold">
                <ItemInline item={itemChipByName('Hero Piece', lang)} />
              </th>
            </tr>
          </thead>
          <tbody>
            {rewards.map((r, i) => (
              <tr key={i} className={i < rewards.length - 1 ? 'border-line-subtle border-b' : ''}>
                <td className="text-content px-3 py-2.5">
                  {r.stars}
                  <StarIcon />
                </td>
                <td className="text-content px-3 py-2.5">{r.wildcard}</td>
                <td className="px-3 py-2.5">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-content">{r.heroPiece}</span>
                    {r.note && <span className="text-content-subtle text-xs">{r.note}</span>}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export interface ResourceRow {
  /** Chips d'items (résolus par l'appelant — `itemChipById`/`itemChipByName`). */
  items: InlineItem[];
  /** Coût par tirage (généré : `price1` / `ticketCost`). */
  cost: number;
  /** Chip du mileage gagné — `null` : ressource sans mileage (tickets event). */
  mileage: InlineItem | null;
  note?: string;
}

/** Ressources utilisables sur la bannière + mileage gagné par tirage. */
export function BannerResources({
  rows,
  lang,
  warning,
}: {
  rows: ResourceRow[];
  lang: Lang;
  /** Avertissement éditorial (ex. « pas d'éther ici »). */
  warning?: string;
}) {
  return (
    <div className="mx-auto max-w-2xl space-y-2">
      <p className="text-content text-sm font-semibold">{lRec(LABELS.resources, lang)}:</p>
      <div className="space-y-2">
        {rows.map((row, i) => (
          <div key={i} className="border-line-subtle bg-surface-raised/40 rounded-lg border p-3">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <div className="flex flex-1 flex-wrap items-center gap-2">
                {row.items.map((item, j) => (
                  <span key={j} className="inline-flex items-center gap-2">
                    {j > 0 && <span className="text-content-subtle">&</span>}
                    <ItemInline item={item} />
                  </span>
                ))}
              </div>
              <div className="flex flex-col gap-1 sm:items-end">
                <div className="text-content text-sm">
                  <span className="text-ed-amber font-semibold">{row.cost}</span>{' '}
                  {lRec(LABELS.perRecruit, lang)}
                </div>
                {row.mileage ? (
                  <div className="text-ed-emerald flex items-center gap-1 text-xs">
                    {lRec(LABELS.grants, lang)} 1 <ItemInline item={row.mileage} />
                  </div>
                ) : (
                  <div className="text-content-subtle text-xs">{lRec(LABELS.noMileage, lang)}</div>
                )}
              </div>
            </div>
            {row.note && (
              <p className="border-line-subtle text-content-subtle mt-2 border-t pt-2 text-xs">
                {row.note}
              </p>
            )}
          </div>
        ))}
      </div>
      {warning && (
        <div className="border-warn/25 bg-warn/5 mt-3 rounded-lg border p-2.5">
          <p className="text-warn/90 text-sm">{warning}</p>
        </div>
      )}
    </div>
  );
}

/** Encart mileage : conservation, options d'échange (coût GÉNÉRÉ), bonus dupes. */
export function MileageInfo({
  mileage,
  cost,
  lang,
  target = 'hero',
  note,
}: {
  mileage: InlineItem;
  /** Coût de l'échange de la contrepartie (`RecruitKindInfo.mileageCost`). */
  cost: number;
  lang: Lang;
  /**
   * Ce que le mileage achète. `hero` (défaut) : le perso vedette, avec la
   * seconde option en pièces de héros et le bonus doublon en wildcards.
   * `gear` (Dimensional Supply) : une pièce d'équipement — ni pièces de héros
   * ni wildcards, ces deux lignes n'existent pas sur cette bannière.
   */
  target?: 'hero' | 'gear';
  /** Note éditoriale sous l'encart (déjà localisée). */
  note?: string;
}) {
  const isHero = target === 'hero';
  return (
    <div className="border-ed-sky/25 bg-ed-sky/5 mx-auto max-w-xl space-y-3 rounded-lg border p-4">
      <p className="text-ed-sky-soft text-sm">
        <ItemInline item={mileage} /> {lRec(LABELS.keptUntilUse, lang)}
      </p>
      <div className="border-line-subtle bg-surface-overlay/50 rounded-lg border p-3">
        <p className="text-content mb-2 text-sm font-semibold">
          {lRec(LABELS.exchangeOptions, lang)}
        </p>
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-2">
            <span className="text-content-muted text-sm">
              {lRec(isHero ? LABELS.featuredHero : LABELS.rateUpGear, lang)}
            </span>
            <span className="text-ed-amber flex items-center gap-1 font-semibold">
              {cost} <ItemInline item={mileage} />
            </span>
          </div>
          {isHero && (
            <div className="flex items-center justify-between gap-2">
              <span className="text-content-muted flex items-center gap-1 text-sm">
                150 <ItemInline item={itemChipByName('Hero Piece', lang)} />
              </span>
              <span className="text-ed-amber flex items-center gap-1 font-semibold">
                {cost} <ItemInline item={mileage} />
              </span>
            </div>
          )}
        </div>
        {isHero && (
          <div className="border-line-subtle mt-3 border-t pt-3">
            <p className="text-content-subtle flex flex-wrap items-center gap-1 text-xs">
              {lRec(LABELS.ownedBonus, lang)}{' '}
              <ItemInline item={itemChipByName('Wildcard Pieces', lang)} />
            </p>
          </div>
        )}
        {note && (
          <div className="border-line-subtle mt-3 border-t pt-3">
            <p className="text-content-subtle text-xs">{note}</p>
          </div>
        )}
      </div>
    </div>
  );
}
