import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { notFound } from 'next/navigation';
import { LANGS, normalizeLang } from '@/lib/i18n/config';
import { lRec } from '@/lib/i18n/localize';
import { getT } from '@/i18n';
import {
  createPageMetadata,
  buildUrl,
  buildVideoGameCharacterJsonLd,
  buildBreadcrumbJsonLd,
} from '@/lib/seo';
import JsonLd from '@/components/seo/JsonLd';
import { SkillsSection, type SkillPriority } from '@/components/character/SkillsSection';
import { BurstSection, type BurstCard } from '@/components/character/BurstSection';
import { ChainDualSection } from '@/components/character/ChainDualSection';
import { SkillDescription } from '@/components/character/SkillDescription';
import type { CardSkill } from '@/components/character/SkillCard';
import { RANGE_TO_TARGET } from '@/lib/skills';
import {
  buildBurstViews,
  buildChainView,
  buildStatusMap,
  cardEffects,
  dedupSkills,
  mainSkills,
} from '@/lib/skill-view';
import { mergeStatusEffects } from '@/lib/data/effects';
import { GearRecoSection } from '@/components/character/GearRecoSection';
import { getCharacterGearReco } from '@/lib/data/gear-reco';
import { img, ELEMENT_TEXT, ROLE_BG } from '@/lib/images';
import { elementHex } from '@/components/character/detail/theme';
import { OverviewSection } from '@/components/character/detail/OverviewSection';
import { QuickToc, type TocSection } from '@/components/character/detail/QuickToc';
import type { FullArt } from '@/components/character/detail/FullArtCarousel';
import {
  characterDisplayName,
  characterNamePrefix,
  getCharacter,
  getCharacterBySlug,
  listCharacterSlugs,
  slugForId,
} from '@/lib/data/characters';
import { localePath } from '@/lib/navigation';
import {
  SynergiesSection,
  type SynergyGroupView,
} from '@/components/character/detail/SynergiesSection';
import { MultiVideoEmbed, type VideoItem } from '@/components/ui/MultiVideoEmbed';
import { TranscendTierProvider } from '@/components/character/detail/TranscendTierContext';
import { characterTags, getCharacterCurated } from '@/lib/data/curated';
import { getCharacterProsCons } from '@/lib/data/pros-cons';
import { firstTagOfKind, tagLabel } from '@/lib/data/tags';
import { parseText } from '@/lib/parse-text';
import {
  computeStatSteps,
  getStatLayers,
  getGiftItems,
  getRecallItem,
  getTranscendTiers,
  type GiftView,
} from '@/lib/data/char-progression';
import { STEP_STAT_KEYS, type StepStatKey } from '@/lib/stat-compose';
import { statDesc, statName } from '@/lib/stats';
import { getEquipmentDetail } from '@/lib/data/equipment-detail';
import { shopSourceLabel, slugifyEquipment } from '@/lib/data/equipment';
import {
  StatsRankingSection,
  type TierEntry,
} from '@/components/character/detail/StatsRankingSection';
import {
  EeTranscendSection,
  type EeCardView,
} from '@/components/character/detail/EeTranscendSection';
import { ProsConsSection } from '@/components/character/detail/ProsConsSection';
import type { Glossaries, LangDict, Skill } from '@contracts';
import charactersMeta from '@data/generated/glossaries.json';
import skillsData from '@data/generated/skills.json';
import eeData from '@data/generated/equipment/ee.json';

const G = charactersMeta as unknown as Glossaries;
const SKILLS = skillsData as unknown as Record<string, Skill>;
const EE = eeData as unknown as Record<string, { name: LangDict; grade: string }>;

export function generateStaticParams() {
  const slugs = listCharacterSlugs();
  return LANGS.flatMap((lang) => slugs.map((slug) => ({ lang, slug })));
}

export const revalidate = 86400;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}): Promise<Metadata> {
  const { lang: raw, slug } = await params;
  const lang = normalizeLang(raw);
  const char = getCharacterBySlug(slug);
  if (!char) return {};
  const name = characterDisplayName(char, lang);
  const el = lRec(G.elements[char.element], lang);
  const cl = lRec(G.classes[char.class], lang);
  const t = await getT(lang);
  return createPageMetadata({
    lang,
    path: `/characters/${slug}`,
    title: name,
    description: t('page.character.meta_description', { name, element: el, classType: cl }),
    // FI en PNG (aperçus Discord/OG) — mêmes propriété et taille que la V2.
    ogImage: img.facePng(char.id),
    ogImageSize: { width: 150, height: 150 },
  });
}

/** Une section éditoriale de la fiche (portage du flux V2). */
interface Sec {
  anchor: string;
  title: string;
  body: ReactNode;
  /** Sections partageant un même `row` = côte à côte en lg (Burst + Chain). */
  row?: string;
  /** La section gère ses propres titres internes. */
  noHeader?: boolean;
}

export default async function CharacterDetail({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}) {
  const { lang: raw, slug } = await params;
  const lang = normalizeLang(raw);
  const char = getCharacterBySlug(slug);
  if (!char) notFound();

  const t = await getT(lang);
  const name = characterDisplayName(char, lang);
  const curated = getCharacterCurated(char.id);
  const hex = elementHex(char.element);
  const el = lRec(G.elements[char.element], lang);
  const cl = lRec(G.classes[char.class], lang);
  const sub = char.subClass ? lRec(G.subClasses[char.subClass]?.name, lang) : '';
  const va = lRec(char.voiceActor, lang);
  const ee = char.ee ? EE[char.ee] : undefined;
  const skills = dedupSkills(char.skills.map((id) => SKILLS[id]).filter(Boolean));

  // --- Overview -----------------------------------------------------------
  // Préfixe de titre : « Core Fusion » (libellé du jeu) ou surnom.
  const prefix = characterNamePrefix(char, lang);
  const baseName = lRec(char.name, lang);
  const fullArts: FullArt[] = [{ src: img.full(char.id), alt: name, label: null }];
  // Skins : full arts des costumes (rendus existants seulement). Une core-
  // fusion hérite des skins de sa base via leur modèle fusionné.
  {
    const skinSource = char.originalCharacter ? getCharacter(char.originalCharacter) : char;
    const isFusion = Boolean(char.originalCharacter);
    for (const cos of skinSource?.costumes ?? []) {
      const model = isFusion ? cos.fusionModel : cos.model;
      const hasArt = isFusion ? cos.fusionArt : cos.art;
      if (!hasArt || !model || model === '0' || model === char.id) continue;
      const label = lRec(cos.name, lang) || cos.name.en;
      fullArts.push({ src: img.full(model), alt: `${name} — ${label}`, label });
    }
  }
  // Badge « type d'unité » : le tag de recrutement du perso (extraction) ou
  // `free` (curé) — un seul badge, choisi par l'ordre canonique du vocabulaire.
  const unitTagSlug = firstTagOfKind(characterTags(char), 'recruit');
  const meta: Array<[string, string]> = [];
  if (va) meta.push([t('page.character.voice_actor'), va]);
  if (char.profile?.birthday) meta.push([t('page.character.birthday'), char.profile.birthday]);
  if (char.profile?.height) meta.push([t('page.character.height'), `${char.profile.height} cm`]);
  if (char.profile?.weight) meta.push([t('page.character.weight'), `${char.profile.weight} kg`]);

  // --- Skills : cartes V2 (mains), burst, chaîne & duo ----------------------
  const skillLabels = {
    cooldown: t('page.character.skill.cooldown'),
    wgr: t('page.character.skill.wgr'),
    level: t('page.character.skill.level'),
    enhancement: t('page.character.skill.enhancement'),
  };
  const targetLabel = (s: Skill): string | undefined => {
    const key = RANGE_TO_TARGET[s.range ?? ''];
    if (!key) return undefined;
    return t(
      `page.character.skill.target_${key}${s.offensive ? '' : '_ally'}` as Parameters<typeof t>[0],
    );
  };
  const mains = mainSkills(skills);
  const cardSkills: CardSkill[] = mains.map((s) => ({
    id: s.id,
    name: lRec(s.name, lang),
    desc: s.desc ? lRec(s.desc, lang) : undefined,
    icon: s.icon,
    burst: Boolean(s.burstAP?.length),
    targetLabel: targetLabel(s),
    maxLevel: s.maxLevel,
    levels: s.levels.map((l) => ({
      level: l.level,
      cool: l.cool,
      wgReduce: l.wgReduce,
      vars: l.vars,
      upgrades: l.upgrades?.map((u) => lRec(u, lang)).filter(Boolean),
    })),
    effects: cardEffects(skills, s),
  }));

  // Priorité de montée des skills (curée).
  const priority: SkillPriority | null = curated.skillPriority
    ? {
        title: t('page.character.skill.priority_title'),
        steps: Object.entries(curated.skillPriority)
          .filter((e): e is [string, number] => e[1] != null)
          .sort((a, b) => a[1] - b[1])
          .map(([type]) => {
            const s = mains.find((m) => m.type === type);
            return { name: s ? lRec(s.name, lang) : type, icon: s?.icon };
          }),
        ruleTitle: t('page.character.skill.priority_rule_title'),
        rules: [
          t('page.character.skill.priority_rule_1'),
          t('page.character.skill.priority_rule_2'),
          t('page.character.skill.priority_rule_3'),
        ],
        ruleChain: t('page.character.skill.priority_rule_chain'),
      }
    : null;

  // Bursts + chaîne & duo : vues partagées (mêmes données que le panneau admin).
  const burstCards: BurstCard[] = buildBurstViews(skills, lang).map((b) => ({
    level: b.level,
    cost: b.cost,
    effect: b.desc ? (
      <SkillDescription
        desc={b.desc}
        vars={b.vars}
        className="text-content w-full text-center text-[10px] leading-tight whitespace-pre-line"
      />
    ) : null,
  }));
  const chainView = buildChainView(skills, lang);
  const statuses = buildStatusMap(skills, lang);

  // --- JSON-LD --------------------------------------------------------------
  const path = `/characters/${slug}`;
  const charLd = buildVideoGameCharacterJsonLd({
    lang,
    path,
    name,
    description: `${name} — ${char.rarity}★ ${el}/${cl}`,
    image: img.portrait(char.id),
  });
  const crumbLd = buildBreadcrumbJsonLd([
    { name: 'Outerpedia', url: buildUrl(lang, '/') },
    { name: t('nav.characters'), url: buildUrl(lang, '/characters') },
    { name, url: buildUrl(lang, path) },
  ]);

  // --- Flux éditorial (ordre V2 ; les sections manquantes s'insèreront ici) --
  const statLayers = getStatLayers(char);
  const secs: Sec[] = [];
  const prosCons = getCharacterProsCons(char.id);
  if (prosCons) {
    const ctx = { lang, t };
    secs.push({
      anchor: 'pros-cons',
      title: t('page.character.toc.pros_cons'),
      body: (
        <ProsConsSection
          pros={prosCons.pros.map((e) => parseText(lRec(e, lang), ctx))}
          cons={prosCons.cons.map((e) => parseText(lRec(e, lang), ctx))}
          prosLabel={t('page.character.pros')}
          consLabel={t('page.character.cons')}
          showMoreLabel={t('page.character.pros_cons.show_more', {
            count: Math.max(0, prosCons.pros.length - 4) + Math.max(0, prosCons.cons.length - 4),
          })}
          showLessLabel={t('page.character.pros_cons.show_less')}
        />
      ),
    });
  }
  // Stats & Ranking : paliers calculés (formules du client, oracle V2) + tiers.
  {
    const view = computeStatSteps(char);
    const recallItems: Record<string, GiftView> = {};
    for (const st of view.steps) {
      const id = st.limitBreak?.recallItemId;
      if (id && !recallItems[id]) {
        const it = getRecallItem(id, lang);
        if (it) recallItems[id] = it;
      }
    }
    const eeDetail = char.ee
      ? getEquipmentDetail(slugifyEquipment((EE[char.ee]?.name ?? { en: '' }).en), lang)
      : null;
    const tierCards: TierEntry[] = [
      { label: t('page.character.tier.pve'), rank: curated.rank ?? undefined },
      { label: t('page.character.tier.pvp'), rank: curated.rankPvp ?? undefined },
      ...(eeDetail
        ? [
            { label: t('page.character.ee.rank'), rank: eeDetail.rank },
            { label: t('page.character.ee.rank10'), rank: eeDetail.rank10 },
          ]
        : []),
    ];
    secs.push({
      anchor: 'stats-ranking',
      title: t('page.character.toc.stats_ranking'),
      body: (
        <StatsRankingSection
          steps={view.steps}
          layers={statLayers}
          baseStar={char.rarity}
          fused={Boolean(char.originalCharacter)}
          statMeta={
            Object.fromEntries(
              STEP_STAT_KEYS.map((k) => [
                k,
                {
                  name: statName(k, lang),
                  ...(statDesc(k, lang) ? { desc: statDesc(k, lang) } : {}),
                },
              ]),
            ) as Record<StepStatKey, { name: string; desc?: string }>
          }
          recallItems={recallItems}
          tiers={tierCards}
          gifts={getGiftItems(char, lang)}
          labels={{
            title: t('page.character.stats.title'),
            limitBreakCost: t('page.character.stats.limit_break_cost'),
            noData: t('page.character.stats.no_data'),
            ranking: t('page.character.toc.ranking'),
            pve: t('page.character.tier.pve'),
            pvp: t('page.character.tier.pvp'),
            eeRank: t('page.character.ee.rank'),
            eeRank10: t('page.character.ee.rank10'),
            gifts: t('characters.filters.gifts'),
            comingSoon: t('common.coming_soon'),
            transcend: t('page.character.toc.transcend'),
            codex: t('page.character.stats.codex'),
            quirks: t('page.character.stats.quirks'),
            cpTitle: t('page.character.cp_title'),
          }}
        />
      ),
    });
  }
  // EE + Transcendance (côte à côte, comme V2).
  {
    const transcendTiers = getTranscendTiers(char, lang);
    let eeCard: EeCardView | undefined;
    if (ee && char.ee) {
      const slug = slugifyEquipment(ee.name.en);
      const model = getEquipmentDetail(slug, lang);
      if (model) {
        const lv1 = model.passives.filter((pt) => pt.unlockLevel <= 1).map((pt) => pt.texts[0]);
        let lv10All: string[] = [];
        for (const pt of model.passives) {
          const text = pt.texts[pt.texts.length - 1];
          if (pt.isAdd) lv10All.push(text);
          else lv10All = [text];
        }
        // Au +10 on n'affiche que le NOUVEAU (palier débloqué / valeur qui
        // change) — pas la répétition d'un effet de base inchangé.
        const lv10 = lv10All.filter((tx) => !lv1.includes(tx));
        // Chips buff/debuff des passifs (comme les skills) + statuts résolus.
        const eeEffects = model.passives.flatMap((pt) => pt.effects ?? []);
        mergeStatusEffects(statuses, eeEffects, lang);
        eeCard = {
          characterId: char.id,
          name: model.name,
          slug,
          // Main stat CONDITIONNELLE seule (la secondaire AP est technique).
          mainStats: (model.slots[0]?.options ?? []).map((o) => ({ key: o.key, label: o.label })),
          effectLv1: lv1,
          effectLv10: lv10,
          ...(eeEffects.length ? { effects: eeEffects, statuses } : {}),
          badgeIcon: model.passives[0]?.icon,
          badgeText: t('page.character.ee.badge', { name }),
        };
      }
    }
    if (eeCard || transcendTiers.length > 0) {
      secs.push({
        anchor: 'ee',
        title: t('page.character.toc.ee'),
        body: (
          <EeTranscendSection
            ee={eeCard}
            tiers={transcendTiers}
            labels={{
              ee: t('page.character.toc.ee'),
              mainStat: t('page.character.ee.main_stat'),
              effect: t('page.character.ee.effect'),
              effectMax: t('page.character.ee.effect_max'),
              transcend: t('page.character.toc.transcend'),
            }}
          />
        ),
      });
    }
  }
  secs.push({
    anchor: 'skills',
    title: t('page.character.toc.skills'),
    body: (
      <SkillsSection
        skills={cardSkills}
        statuses={statuses}
        labels={skillLabels}
        priority={priority}
      />
    ),
  });
  if (burstCards.length > 0) {
    secs.push({
      anchor: 'burst',
      title: t('page.character.toc.burst'),
      row: 'kit',
      body: <BurstSection bursts={burstCards} />,
    });
  }
  if (chainView) {
    secs.push({
      anchor: 'chain-dual',
      title: t('page.character.toc.chain_dual'),
      row: 'kit',
      body: (
        <ChainDualSection
          {...chainView}
          iconSrc={img.chain(char.element, char.chainType ?? 'start')}
          statuses={statuses}
          labels={{ ...skillLabels, dualWgr: t('page.character.skill.dual_wgr') }}
        />
      ),
    });
  }
  const gearBuilds = getCharacterGearReco(char.id, lang);
  if (gearBuilds) {
    secs.push({
      anchor: 'gear',
      title: t('page.character.toc.gear'),
      body: (
        <GearRecoSection
          builds={gearBuilds.map(({ note, ...b }) => {
            // Boutiques extraites → libellés traduits, fusionnés au libellé curé.
            const withLabel = <
              T extends { source?: import('@/lib/data/gear-reco').ResolvedItemSource },
            >(
              it: T,
            ): T => {
              if (!it.source) return it;
              const parts = [
                ...(it.source.shops ?? []).map((s) => shopSourceLabel(s, t)),
                ...(it.source.label ? [it.source.label] : []),
              ];
              return {
                ...it,
                source: {
                  bosses: it.source.bosses,
                  label: parts.length ? parts.join(' · ') : undefined,
                },
              };
            };
            return {
              ...b,
              weapons: b.weapons.map(withLabel),
              amulets: b.amulets.map(withLabel),
              talismans: b.talismans.map(withLabel),
              setEffects: b.setEffects.map(withLabel),
              noteNode: note ? parseText(note, { lang, t }) : undefined,
            };
          })}
          labels={{
            weapon: t('page.character.gear.weapon'),
            amulet: t('page.character.gear.amulet'),
            talisman: t('page.character.gear.talisman'),
            set: t('page.character.gear.set'),
            substatPrio: t('page.character.gear.substat_prio'),
            setEffects: t('equip.detail.set_effects'),
            note: t('page.character.gear.note'),
            piece2: t('equip.set.2piece'),
            piece4: t('equip.set.4piece'),
            source: t('equip.detail.source'),
          }}
        />
      ),
    });
  }
  // Synergies : partenaires curés (ids → portraits, raisons via parse-text).
  if (curated.synergies?.length) {
    const ctx = { lang, t };
    const groups: SynergyGroupView[] = curated.synergies.map((g) => ({
      heroes: g.heroes.map((h) => {
        const partner = h.startsWith('{') ? undefined : getCharacter(h);
        if (!partner) return { tag: parseText(h, ctx) };
        const slug = slugForId(partner.id);
        return {
          id: partner.id,
          name: characterDisplayName(partner, lang),
          element: partner.element,
          classType: partner.class,
          rarity: partner.rarity,
          href: slug ? localePath(lang, `/characters/${slug}`) : undefined,
        };
      }),
      reason: g.reason ? parseText(lRec(g.reason, lang) || (g.reason.en ?? ''), ctx) : undefined,
    }));
    secs.push({
      anchor: 'synergies',
      title: t('page.character.toc.synergies'),
      body: <SynergiesSection groups={groups} />,
    });
  }
  if (curated.videos && curated.videos.length > 0) {
    secs.push({
      anchor: 'video',
      title: t('page.character.toc.video'),
      body: (
        <MultiVideoEmbed
          byLabel={t('video.by')}
          videos={curated.videos.map((v) => ({
            platform: (v.platform as VideoItem['platform']) ?? 'youtube',
            id: v.id,
            title: v.title ?? name,
            author: v.author,
          }))}
        />
      ),
    });
  }

  const tocSections: TocSection[] = [
    { id: 'overview', label: t('page.character.toc.overview') },
    ...secs.map((s) => ({ id: s.anchor, label: s.title })),
  ];

  // Groupe les sections adjacentes partageant un `row` (Burst + Chain & Dual).
  const rows: Sec[][] = [];
  for (const s of secs) {
    const last = rows[rows.length - 1];
    if (s.row && last && last[0].row === s.row) last.push(s);
    else rows.push([s]);
  }

  return (
    <div className="cd-page" style={{ '--cd-el': hex } as React.CSSProperties}>
      <JsonLd data={charLd} />
      <JsonLd data={crumbLd} />

      <OverviewSection
        hex={hex}
        fullArts={fullArts}
        unitTag={
          unitTagSlug ? { label: tagLabel(unitTagSlug, lang), iconSrc: img.tag(unitTagSlug) } : null
        }
        roleTag={
          curated.role
            ? {
                label: t(`filters.roles.${curated.role}` as Parameters<typeof t>[0]),
                bgClass: ROLE_BG[curated.role],
              }
            : null
        }
        prefix={prefix}
        name={baseName}
        srSuffix={t('page.character.sr_suffix', { element: el, classType: cl })}
        rarity={char.rarity}
        element={{
          label: el,
          iconSrc: img.element(char.element),
          textClass: ELEMENT_TEXT[char.element] ?? '',
        }}
        klass={{ label: cl, iconSrc: img.klass(char.class) }}
        subClass={char.subClass ? { label: sub, iconSrc: img.subClass(char.subClass) } : null}
        starSrc={img.star()}
        meta={meta}
        story={char.profile?.story ? lRec(char.profile.story, lang) : null}
        lang={lang}
      />

      <QuickToc sections={tocSections} hex={hex} ariaLabel={t('page.character.toc.on_this_page')} />

      <main className="pb-20">
        <TranscendTierProvider initial={Math.max(0, statLayers.transcend.length - 1)}>
          {rows.map((row) => (
            <div
              key={row[0].anchor}
              className="mx-auto w-full max-w-285 px-4 pt-12 lg:px-6 lg:pt-16"
            >
              <div className={row.length > 1 ? 'grid gap-8 lg:grid-cols-2' : undefined}>
                {row.map((s) => (
                  <section key={s.anchor} id={s.anchor} className="min-w-0 scroll-mt-28">
                    {!s.noHeader && <h2 className="mb-4 text-2xl font-bold">{s.title}</h2>}
                    <div className="min-w-0">{s.body}</div>
                  </section>
                ))}
              </div>
            </div>
          ))}
        </TranscendTierProvider>
      </main>
    </div>
  );
}
