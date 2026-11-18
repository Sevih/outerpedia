/**
 * Guide « Terminology & TL;DR » : le jargon du chat (rotation, pen set,
 * counter…) et le vocabulaire courant des gachas (pity, banner, DoT…) en une
 * page. Un TL;DR de sept puces, puis huit sections de termes, chacun avec une
 * à trois phrases et le lien vers le guide ou l'outil qui en dit plus. Les
 * termes génériques sont définis POUR OUTERPLANE : le nom du jeu quand il
 * diffère, et « Not in Outerplane » pour un mécanisme que le jeu n'a pas.
 *
 * Server Component composé sur les primitives éditoriales partagées ; seule la
 * barre de sommaire (TocBar) est cliente. parse-text en STRICT : une référence
 * de contenu morte casse le build.
 *
 * Les TERMES (abréviations, jargon) restent en anglais dans toutes les langues
 * et vivent ici ; les définitions sont dans `labels.ts`. Quatre choses viennent
 * de la DONNÉE plutôt que d'être recopiées : le nom complet d'une stat
 * (`statName`), sa définition (celle du guide Stats, `../stats/labels`), le
 * nom officiel d'un mode ou d'une fonction dans la langue de la page (glossaire
 * `modes`, `unlock-content`) et les chiffres du recrutement (`recruit.json` :
 * taux, prix, garantie), injectés par jetons `{…}` dans les définitions.
 *
 * Pas de JSON-LD propre : `src/lib/seo` n'a pas de helper `DefinedTermSet`, et
 * le cadre de la page porte déjà Article et BreadcrumbList.
 */
import type { ReactNode } from 'react';
import Link from 'next/link';
import type { LangDict } from '@contracts';
import { LANGUAGES, type Lang } from '@/lib/i18n/config';
import { getT } from '@/i18n';
import { lRec } from '@/lib/i18n/localize';
import { localePath } from '@/lib/navigation';
import { cn } from '@/lib/cn';
import { img } from '@/lib/images';
import { parseText, type ParseCtx } from '@/lib/parse-text';
import { STAT_ICON } from '@/lib/stats';
import { statName } from '@/lib/data/stat-glossary';
import { getGlossaries } from '@/lib/data/glossaries';
import { getUnlockEntry } from '@/lib/data/unlock-content';
import { getRecruitKind } from '@/lib/data/recruit';
import { bannerConfigOf } from '@/lib/gacha';
import { GUIDE_CATEGORIES, type GuideCategorySlug } from '@/lib/data/guide-categories';
import { Callout, DotList, Prose, SectionHeading } from '@/components/guides/editorial/blocks';
import { TocBar } from '@/components/guides/editorial/TocBar';
import { RelatedGuides } from '@/components/guides/editorial/RelatedGuides';
import { EDITORIAL_ACCENT, type EditorialAccent } from '@/components/guides/editorial/accents';
import { LABELS as STATS } from '../stats/labels';
import { LABELS } from './labels';

type LabelKey = keyof typeof LABELS;

/** Un terme : le mot du chat (anglais partout), son développé, sa définition. */
interface Term {
  term: string;
  /** Développé ou synonymes, sous le terme. */
  aka?: string;
  def: LabelKey;
  /** Nom officiel du jeu, lu dans la donnée — ligne « In game: » s'il diffère. */
  official?: LangDict;
}

/* Ancres stables (jamais localisées) du TL;DR et des 8 sections. */
const SECTIONS = [
  { id: 'tldr', accent: 'sky', label: 'tocTldr' },
  { id: 'combat', accent: 'rose', label: 'sectionCombat' },
  { id: 'stats', accent: 'violet', label: 'sectionStats' },
  { id: 'gear', accent: 'amber', label: 'sectionGear' },
  { id: 'heroes-pulls', accent: 'emerald', label: 'sectionHeroes' },
  { id: 'gacha-economy', accent: 'rose', label: 'sectionEconomy' },
  { id: 'roles', accent: 'cyan', label: 'sectionRoles' },
  { id: 'content', accent: 'sky', label: 'sectionContent' },
  { id: 'community-slang', accent: 'violet', label: 'sectionSlang' },
] as const satisfies readonly { id: string; accent: EditorialAccent; label: LabelKey }[];

const TLDR: LabelKey[] = [
  'tldrSpeed',
  'tldrScaling',
  'tldrCaps',
  'tldrSets',
  'tldrDebuffs',
  'tldrRotation',
  'tldrGuides',
];

const COMBAT: Term[] = [
  { term: 'Turn / Priority', def: 'cTurn' },
  { term: 'AP', aka: 'Action Points', def: 'cAp' },
  { term: 'Burst', aka: 'Burst 1 / 2 / 3', def: 'cBurst' },
  { term: 'CP', aka: 'Chain Points', def: 'cCp' },
  { term: 'Chain', aka: 'Skill Chain, chain attack', def: 'cChain' },
  { term: 'Dual Attack', def: 'cDual' },
  { term: 'Combo', def: 'cCombo' },
  { term: 'WG / Break', aka: 'Weakness Gauge', def: 'cWg' },
  { term: 'Counter', aka: 'Counterattack, counter-pick', def: 'cCounter' },
  { term: 'Extra turn', def: 'cExtraTurn' },
  { term: 'Cooldown', aka: 'CD', def: 'cCooldown' },
  { term: 'Rotation', def: 'cRotation' },
  { term: 'Skill order', aka: 'Skill order for attacking', def: 'cSkillOrder' },
  { term: 'Opener', def: 'cOpener' },
  { term: 'Speed tuning', def: 'cSpeedTuning' },
  { term: 'Uptime', def: 'cUptime' },
  { term: 'AoE / single target', aka: 'Area of effect', def: 'cAoe' },
  { term: 'Status effect', def: 'cStatus' },
  { term: 'Buff', def: 'cBuff' },
  { term: 'Debuff', def: 'cDebuff' },
  { term: 'Immunity', def: 'cImmunity' },
  { term: 'CC', aka: 'Crowd control', def: 'cCc' },
  { term: 'Stun', def: 'cStun' },
  { term: 'Immobile', def: 'cImmobile' },
  { term: 'Silence', def: 'cSilence' },
  { term: 'Taunt', def: 'cTaunt' },
  { term: 'DoT', aka: 'Damage over time', def: 'cDot' },
  { term: 'DoT stacking', def: 'cDotStack' },
  { term: 'Tick', def: 'cTick' },
];

/**
 * Stats : abréviation du site (`STAT_ABBR`, le jeu n'en a aucune), clé de
 * `STAT_ICON` / `statName`, définition du guide Stats, précision éventuelle.
 * Ni ACC (stat retirée du jeu) ni LS (aucune définition dans le dépôt).
 */
const STAT_ROWS: {
  abbr: string;
  stat: string;
  desc: (typeof STATS)[keyof typeof STATS];
  note?: LabelKey;
}[] = [
  { abbr: 'ATK', stat: 'ATK', desc: STATS.desc_ATK },
  { abbr: 'DEF', stat: 'DEF', desc: STATS.desc_DEF },
  { abbr: 'HP', stat: 'HP', desc: STATS.desc_HP },
  { abbr: 'SPD', stat: 'SPD', desc: STATS.desc_SPD },
  { abbr: 'CHC', stat: 'CHC', desc: STATS.desc_CHC, note: 'sChc' },
  { abbr: 'CHD', stat: 'CHD', desc: STATS.desc_CHD, note: 'sChd' },
  { abbr: 'PEN', stat: 'PEN', desc: STATS.desc_PEN, note: 'sPen' },
  { abbr: 'EFF', stat: 'EFF', desc: STATS.desc_EFF, note: 'sEff' },
  { abbr: 'RES / Resist', stat: 'RES', desc: STATS.desc_RES, note: 'sRes' },
  { abbr: 'DMG UP', stat: 'DMG UP%', desc: STATS.desc_DMGUP, note: 'sDmgUp' },
  { abbr: 'DMG RED', stat: 'DMG RED%', desc: STATS.desc_DMGRED },
  { abbr: 'CDMG RED', stat: 'CDMG RED%', desc: STATS.desc_CDMGRED },
];

const GEAR: Term[] = [
  { term: 'Gear / Equipment', def: 'gGear' },
  { term: 'Set', aka: '2-piece / 4-piece', def: 'gSet' },
  { term: 'Main stat / substat', def: 'gMainSub' },
  { term: 'Enhance', aka: '+10, +15', def: 'gEnhance' },
  { term: 'Reforge', def: 'gReforge' },
  { term: 'Breakthrough', aka: 'T0 to T4', def: 'gBreakthrough' },
  { term: 'Reroll', aka: 'Transistone', def: 'gReroll' },
  { term: 'EE', aka: 'Exclusive Equipment', def: 'gEe' },
  { term: 'Talisman', def: 'gTalisman' },
  { term: 'Gems', def: 'gGems' },
  { term: 'Pen set', aka: 'Penetration Set', def: 'gPenSet' },
  { term: 'Revenge set', def: 'gRevengeSet' },
  { term: 'Speed tuning (gear)', def: 'gSpeedTuning' },
  { term: 'Loadout', def: 'gLoadout' },
];

const HEROES: Term[] = [
  { term: 'Rarity', aka: '1★ to 3★', def: 'hRarity' },
  { term: 'Transcend / dupes', aka: 'Ascension, awakening', def: 'hTranscend' },
  { term: 'Hero pieces', aka: 'Shards, fragments', def: 'hPieces' },
  { term: 'Limit Break', def: 'hLimitBreak' },
  { term: 'Skill up priorities', def: 'hSkillUp' },
  { term: 'Limited', def: 'hLimited' },
  { term: 'Premium', def: 'hPremium' },
  { term: 'Mileage', def: 'hMileage' },
  { term: 'Reroll', aka: 'Account reroll', def: 'hReroll' },
  { term: 'Core Fusion', def: 'hCoreFusion' },
];

const ROLES: Term[] = [
  { term: 'DPS', aka: 'Damage dealer', def: 'rDps' },
  { term: 'Nuker', def: 'rNuker' },
  { term: 'Bruiser', def: 'rBruiser' },
  { term: 'Support', def: 'rSupport' },
  { term: 'Buffer', def: 'rBuffer' },
  { term: 'Debuffer', def: 'rDebuffer' },
  { term: 'Sustain / healer', def: 'rSustain' },
  { term: 'Tank', def: 'rTank' },
  { term: 'Cleanse', def: 'rCleanse' },
  { term: 'Dispel', def: 'rDispel' },
  { term: 'Team comp', aka: 'Team composition', def: 'rTeamComp' },
  { term: 'Synergy', def: 'rSynergy' },
];

const SLANG: Term[] = [
  { term: 'F2P', aka: 'Free to play', def: 'lF2p' },
  { term: 'P2W', aka: 'Pay to win', def: 'lP2w' },
  { term: 'Whale', def: 'lWhale' },
  { term: 'Meta', def: 'lMeta' },
  { term: 'Off-meta', def: 'lOffMeta' },
  { term: 'Power creep', def: 'lPowerCreep' },
  { term: 'Tier list', def: 'lTierList' },
  { term: 'Carry', def: 'lCarry' },
  { term: 'Endgame', def: 'lEndgame' },
  { term: 'Clear', aka: 'Content clear', def: 'lClear' },
  { term: 'PvE / PvP', def: 'lPve' },
  { term: 'SSS++', def: 'lSss' },
];

/** Un mode du jeu : abréviation du chat, nom anglais, noms officiels, guides. */
interface Mode {
  term: string;
  /** Nom anglais que l'abréviation développe. */
  name?: string;
  /** Noms officiels du jeu (un mode en deux opérations en porte deux). */
  official: LangDict[];
  /** Catégorie de guides du mode, quand il en a une. */
  category?: GuideCategorySlug;
  def: LabelKey;
}

/** Nom officiel lu dans la donnée — absent = build cassé, pas un trou muet. */
function official(dict: LangDict | undefined, what: string): LangDict {
  if (!dict) throw new Error(`terminology : nom officiel introuvable pour « ${what} »`);
  return dict;
}

/**
 * Recrutement, monnaies et progression. Les noms du jeu (Recruit, Sweep, Auto
 * Battle) sont ceux de l'écran de déblocage, dans la langue de la page.
 */
function economy(): Term[] {
  const unlock = (type: string): LangDict => {
    const entry = getUnlockEntry(type);
    return official(entry?.officialName ?? entry?.lockScreenName, `unlock-content ${type}`);
  };
  return [
    { term: 'Gacha', def: 'eGacha', official: unlock('MAIN_MENU_RECRUIT') },
    { term: 'Banner', def: 'eBanner' },
    { term: 'Starter banner', aka: 'Start Dash', def: 'eStarter' },
    { term: 'Pull / dupe', def: 'ePull' },
    { term: 'Rate', def: 'eRate' },
    { term: 'Pity', def: 'ePity' },
    { term: 'Hard pity', def: 'eHardPity' },
    { term: 'Soft pity', def: 'eSoftPity' },
    { term: '50/50', def: 'eFifty' },
    { term: 'Guarantee', def: 'eGuarantee' },
    { term: 'Summon ticket', aka: 'Recruitment ticket', def: 'eTicket' },
    { term: 'Premium currency', def: 'ePremiumCurrency' },
    { term: 'Free currency', def: 'eFreeCurrency' },
    { term: 'Hoarding', def: 'eHoarding' },
    { term: 'Stamina / Energy', def: 'eStamina' },
    { term: 'Sweep / Skip', def: 'eSweep', official: unlock('BATTLE_SWEEP') },
    { term: 'Auto-battle', def: 'eAuto', official: unlock('BATTLE_AUTO') },
    { term: 'Farming', def: 'eFarming' },
    { term: 'Daily / weekly quests', aka: 'Missions', def: 'eQuests' },
    { term: 'Battle pass', def: 'eBattlePass' },
    { term: 'Value pack', def: 'ePack' },
    { term: 'Progression wall', def: 'eWall' },
  ];
}

/**
 * Chiffres du recrutement, LUS dans `recruit.json` et injectés par jetons dans
 * les définitions : écrits en dur, ils se périment au premier rééquilibrage des
 * bannières. La bannière Rate Up sert de référence (taux, garantie, prix).
 */
function recruitFacts(lang: Lang): Record<string, string> {
  const rateUp = bannerConfigOf('rateup', getRecruitKind('pickup'));
  const premium = getRecruitKind('premium');
  if (!rateUp.guarantee) {
    throw new Error('terminology : la bannière Rate Up n’a plus de garantie dans recruit.json');
  }
  const n = (value: number): string => value.toLocaleString(LANGUAGES[lang].htmlLang);
  return {
    pity: n(rateUp.guarantee.at),
    rate3: n(rateUp.focus3Rate + rateUp.offFocus3Rate),
    rateFeatured: n(rateUp.focus3Rate),
    price: n(rateUp.etherCost),
    pricePremium: n(premium.price1),
    callCost: n(premium.ticketCost),
  };
}

function modes(): Mode[] {
  const g = getGlossaries();
  const mode = (key: string) => official(g.modes?.[key], `modes.${key}`);
  return [
    {
      term: 'GR',
      name: 'Guild Raid',
      official: [mode('guild_raid_main_boss')],
      category: 'guild-raid',
      def: 'mGr',
    },
    {
      term: 'WB',
      name: 'World Boss',
      official: [mode('world_boss')],
      category: 'world-boss',
      def: 'mWb',
    },
    {
      term: 'JC',
      name: 'Joint Challenge',
      official: [mode('event_boss')],
      category: 'joint-challenge',
      def: 'mJc',
    },
    {
      term: 'IE',
      name: 'Irregular Extermination',
      official: [mode('irregular_chase'), mode('irregular_infiltrate')],
      category: 'irregular-extermination',
      def: 'mIe',
    },
    {
      term: 'ST',
      name: 'Skyward Tower',
      official: [mode('tower')],
      category: 'skyward-tower',
      def: 'mSt',
    },
    {
      term: 'SR',
      name: 'Special Request',
      official: [official(g.modeFamilies?.special_request, 'modeFamilies.special_request')],
      category: 'special-request',
      def: 'mSr',
    },
    {
      term: 'DS',
      name: 'Dimensional Singularity',
      official: [mode('monad_battle_2')],
      category: 'dimensional-singularity',
      def: 'mDs',
    },
    {
      term: 'Monad Gate',
      official: [mode('monad_battle_1')],
      category: 'monad-gate',
      def: 'mMonad',
    },
    {
      term: 'PvP',
      name: 'Arena',
      official: [official(getUnlockEntry('PVP')?.officialName, 'unlock-content PVP')],
      def: 'mArena',
    },
  ];
}

/** Liste de définitions : une rangée par terme, deux colonnes à partir de `sm`. */
function TermList({ children }: { children: ReactNode }) {
  return (
    <dl className="border-line-subtle divide-line-subtle bg-surface-raised/60 m-0 divide-y overflow-hidden rounded-xl border">
      {children}
    </dl>
  );
}

/**
 * Une rangée : le terme (et son développé) à gauche, la définition à droite.
 * Sous `sm` les deux s'empilent — une liste, sans défilement horizontal.
 */
function TermRow({
  accent,
  term,
  aka,
  icon,
  children,
}: {
  accent: EditorialAccent;
  term: string;
  aka?: string;
  /** Icône décorative devant le terme (stat) : le terme porte l'information. */
  icon?: string;
  children: ReactNode;
}) {
  return (
    <div className="grid grid-cols-1 gap-x-5 gap-y-1.5 px-4 py-3.5 sm:grid-cols-3 lg:grid-cols-4">
      <dt className="min-w-0">
        <span
          className={cn(
            'inline-flex items-center gap-1.5 text-sm font-semibold',
            EDITORIAL_ACCENT[accent].text,
          )}
        >
          {icon && (
            <img src={icon} alt="" aria-hidden width={16} height={16} className="shrink-0" />
          )}
          {term}
        </span>
        {aka && <span className="text-content-subtle block text-xs">{aka}</span>}
      </dt>
      <dd className="text-content-muted m-0 flex min-w-0 flex-col gap-1.5 text-sm leading-relaxed text-pretty sm:col-span-2 lg:col-span-3">
        {children}
      </dd>
    </div>
  );
}

export default async function TerminologyGuide({ lang }: { lang: Lang }) {
  const t = await getT(lang);
  const ctx: ParseCtx = { lang, t, strict: true };
  const L = (key: LabelKey): string => lRec(LABELS[key], lang);
  // Jetons `{…}` des définitions : le filtre de la liste des héros est nommé
  // par les locales, les chiffres du recrutement viennent de `recruit.json`.
  const tokens: Record<string, string> = {
    filter: t('filters.scaling'),
    advanced: t('characters.filters.advanced'),
    ...recruitFacts(lang),
  };
  const fill = (text: string): string =>
    text.replace(/\{([a-zA-Z0-9]+)\}/g, (raw, name: string) => tokens[name] ?? raw);
  // parseText rend un TABLEAU (clés internes 0..n) : chaque appel vit dans son
  // propre parent (un `<span>` ici, jamais deux appels frères).
  const P = (key: LabelKey): ReactNode => <span>{parseText(fill(L(key)), ctx)}</span>;

  /** Ligne « In game: » — tue quand le nom du jeu redit le terme affiché. */
  const inGame = (names: string[]): ReactNode =>
    names.length > 0 && (
      <span className="text-content-subtle text-xs">
        {L('inGame')} {names.join(' / ')}
      </span>
    );

  const terms = (accent: EditorialAccent, rows: Term[]): ReactNode => (
    <TermList>
      {rows.map((row) => {
        const name = row.official ? lRec(row.official, lang) : '';
        const shown = [row.term, row.aka ?? ''].map((s) => s.toLowerCase());
        return (
          <TermRow key={row.def} accent={accent} term={row.term} aka={row.aka}>
            {P(row.def)}
            {inGame(name && !shown.includes(name.toLowerCase()) ? [name] : [])}
          </TermRow>
        );
      })}
    </TermList>
  );

  return (
    <>
      <Prose>{L('intro')}</Prose>

      <TocBar
        ariaLabel={t('page.character.toc.on_this_page')}
        sections={SECTIONS.map((s) => ({ id: s.id, accent: s.accent, label: L(s.label) }))}
      />

      <div className="flex flex-col gap-12">
        {/* ═══ TL;DR ═══ */}
        <section id="tldr" className="scroll-mt-28">
          <SectionHeading accent="sky" title={L('tldrTitle')} />
          <Callout accent="sky">
            <DotList accent="sky" items={TLDR.map((key) => P(key))} />
          </Callout>
        </section>

        {/* ═══ Combat ═══ */}
        <section id="combat" className="scroll-mt-28">
          <SectionHeading accent="rose" title={L('sectionCombat')} />
          {terms('rose', COMBAT)}
        </section>

        {/* ═══ Stats ═══ */}
        <section id="stats" className="scroll-mt-28">
          <SectionHeading accent="violet" title={L('sectionStats')} />
          <div className="flex flex-col gap-3.5">
            <Prose>{P('statsIntro')}</Prose>
            <TermList>
              {STAT_ROWS.map((row) => (
                <TermRow
                  key={row.abbr}
                  accent="violet"
                  term={row.abbr}
                  aka={statName(row.stat, lang)}
                  icon={img.statIcon(STAT_ICON[row.stat])}
                >
                  <span>{parseText(lRec(row.desc, lang), ctx)}</span>
                  {row.note && P(row.note)}
                </TermRow>
              ))}
              <TermRow accent="violet" term="100% pen">
                {P('sFullPen')}
              </TermRow>
              <TermRow accent="violet" term="Damage formula">
                {P('sFormula')}
              </TermRow>
            </TermList>
          </div>
        </section>

        {/* ═══ Gear ═══ */}
        <section id="gear" className="scroll-mt-28">
          <SectionHeading accent="amber" title={L('sectionGear')} />
          <div className="flex flex-col gap-3.5">
            <Prose>{P('gearIntro')}</Prose>
            {terms('amber', GEAR)}
          </div>
        </section>

        {/* ═══ Heroes & pulls ═══ */}
        <section id="heroes-pulls" className="scroll-mt-28">
          <SectionHeading accent="emerald" title={L('sectionHeroes')} />
          {terms('emerald', HEROES)}
        </section>

        {/* ═══ Gacha & economy ═══ */}
        <section id="gacha-economy" className="scroll-mt-28">
          <SectionHeading accent="rose" title={L('sectionEconomy')} />
          {terms('rose', economy())}
        </section>

        {/* ═══ Roles ═══ */}
        <section id="roles" className="scroll-mt-28">
          <SectionHeading accent="cyan" title={L('sectionRoles')} />
          <div className="flex flex-col gap-3.5">
            <Prose>{P('rolesIntro')}</Prose>
            {terms('cyan', ROLES)}
          </div>
        </section>

        {/* ═══ Content ═══ */}
        <section id="content" className="scroll-mt-28">
          <SectionHeading accent="sky" title={L('sectionContent')} />
          <div className="flex flex-col gap-3.5">
            <Prose>{L('contentIntro')}</Prose>
            <TermList>
              {modes().map((mode) => {
                // Nom du jeu dans la langue de la page ; tu quand il redit le
                // nom anglais déjà affiché sous l'abréviation.
                const shown = (mode.name ?? mode.term).toLowerCase();
                const names = mode.official
                  .map((dict) => lRec(dict, lang))
                  .filter((name) => name && name.toLowerCase() !== shown);
                return (
                  <TermRow key={mode.def} accent="sky" term={mode.term} aka={mode.name}>
                    {P(mode.def)}
                    {inGame(names)}
                    {mode.category && (
                      <span className="text-xs">
                        {L('modeGuides')}{' '}
                        <Link
                          href={localePath(lang, `/guides/${mode.category}`)}
                          className="text-highlight underline hover:brightness-125"
                        >
                          {lRec(GUIDE_CATEGORIES[mode.category].label, lang)}
                        </Link>
                      </span>
                    )}
                  </TermRow>
                );
              })}
            </TermList>
          </div>
        </section>

        {/* ═══ Community slang ═══ */}
        <section id="community-slang" className="scroll-mt-28">
          <SectionHeading accent="violet" title={L('sectionSlang')} />
          {terms('violet', SLANG)}
        </section>

        {/* ═══ Related Guides ═══ */}
        <RelatedGuides
          lang={lang}
          title={L('sectionRelatedGuides')}
          items={[
            { category: 'general-guides', slug: 'beginner-faq', accent: 'sky' },
            { category: 'general-guides', slug: 'stats', accent: 'violet' },
            { category: 'general-guides', slug: 'gear', accent: 'amber' },
            { category: 'general-guides', slug: 'heroes-growth', accent: 'emerald' },
          ]}
        />
      </div>
    </>
  );
}
