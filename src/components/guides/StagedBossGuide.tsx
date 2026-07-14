import type { LocalizedText } from '@contracts';
import { getT } from '@/i18n';
import { lRec } from '@/lib/i18n/localize';
import { parseText, type ParseCtx } from '@/lib/parse-text';
import { readGuideFile, type GuideContentProps } from '@/lib/data/guides';
import {
  difficultyLabel,
  encountersOfGroup,
  groupCombatants,
  type Encounter,
} from '@/lib/data/encounters';
import { lootDetails, stageLoot, type LootBadge, type StageLootGear } from '@/lib/data/rewards';
import { BossCard } from '@/components/guides/BossPanel';
import { InlineTooltip } from '@/components/inline/InlineTooltip';
import { ItemInline } from '@/components/inline/ItemInline';
import { LootPanel } from '@/components/guides/LootPanel';
import { lootPanelLabels } from '@/components/guides/loot-labels';
import {
  EncounterPane,
  EncounterSelection,
  EncounterSlider,
} from '@/components/guides/EncounterSelection';
import { TacticalTips } from '@/components/guides/TacticalTips';
import { RecommendedCharacters } from '@/components/guides/RecommendedCharacters';
import { TeamSlots } from '@/components/guides/TeamSlots';
import { MultiVideoEmbed, type VideoItem } from '@/components/ui/MultiVideoEmbed';

/** `strings.json` — le texte du guide. */
interface GuideStrings {
  intro: LocalizedText & { en: string };
}

/** `tips.json` */
interface GuideTips {
  tactical: (LocalizedText & { en: string })[];
}

/** `recommended.json` */
type GuideRecommended = Array<{
  characters: string[];
  reason?: LocalizedText & { en: string };
}>;

/**
 * `teams.json` — les équipes par PLAGE de stages. Le mode ne change pas de
 * boss à mi-échelle, mais il change de règles (immunités et passifs des stages
 * hauts) : l'équipe des stages 1-10 n'est pas celle des stages 11-13. La plage
 * se lit sur `difficulty.order` (donnée du jeu), et l'équipe suit la glissière
 * comme les cartes — on ne montre jamais une équipe pour un stage qu'elle ne
 * couvre pas.
 */
interface GuideTeams {
  buckets: Array<{
    /** [premier, dernier] stage couverts (bornes incluses, `difficulty.order`). */
    stages: [number, number];
    slots: string[][];
    note?: LocalizedText & { en: string };
  }>;
}

/** `videos.json` */
type GuideVideos = VideoItem[];

/** Indexes (0-based) des stages qu'une plage couvre. */
function stageIndexesIn(encounters: Encounter[], [from, to]: [number, number]): number[] {
  return encounters
    .map((e, i) => ({ order: e.ref.difficulty?.order ?? i + 1, i }))
    .filter(({ order }) => order >= from && order <= to)
    .map(({ i }) => i);
}

/**
 * Le RÉSUMÉ du butin LÉGENDAIRE du stage, en icônes — sets d'armure et familles
 * d'armes / accessoires uniques (cf. `stageLoot`), nom au survol, lien détail
 * pour les familles. Rien d'autre : l'or, l'exp et le filler sont du bruit, et
 * un stage qui ne droppe aucun unique n'affiche RIEN — c'est la réponse
 * honnête. Le DÉTAIL de ces objets se déplie derrière « Details » (`LootPanel`).
 */
function StageLootIcons({
  pieceLabels,
  loot,
}: {
  /** Libellés « 2 set » / « 4 set » (localisés par l'appelant). */
  pieceLabels: Record<2 | 4, string>;
  loot: { sets: LootBadge[]; gear: StageLootGear[] };
}) {
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {loot.sets.map((s) => (
        <InlineTooltip
          key={s.iconSrc}
          content={
            <div className="flex max-w-64 flex-col gap-1">
              <span className="text-content-strong text-sm font-bold">{s.name}</span>
              {/* Les bonus qu'on vient farmer — 2 et 4 pièces quand le set a
                    les deux, celui qu'il a sinon. */}
              {s.effects?.map((e) => (
                <p key={e.pieces} className="text-content text-xs">
                  <span className="text-content-strong font-semibold">{pieceLabels[e.pieces]}</span>{' '}
                  {e.text}
                </p>
              ))}
            </div>
          }
        >
          <button type="button" className="cursor-default align-middle">
            {/* eslint-disable-next-line @next/next/no-img-element -- asset R2/staging */}
            <img src={s.iconSrc} alt={s.name} className="h-8 w-8 object-contain" loading="lazy" />
          </button>
        </InlineTooltip>
      ))}
      {loot.gear.map((g) => (
        <ItemInline
          key={g.href}
          iconOnly
          size={28}
          href={g.href}
          item={{ name: g.name, iconSrc: g.iconSrc, grade: g.grade, desc: g.desc }}
        />
      ))}
    </div>
  );
}

/**
 * RENDU PARTAGÉ d'un guide de boss À STAGES — un mode PERMANENT qui rejoue le
 * même combat sur une échelle de niveaux (Special Request : 13 stages, le boss
 * monte de niveau et durcit son kit en haut d'échelle).
 *
 * Le pendant de `VersionedBossGuide`, sur l'autre axe : là où le Joint
 * Challenge date ses conseils (versions saisonnières, un combat par saison),
 * le Special Request ÉTAGE les siens (un seul combat permanent, treize
 * paliers). Le guide désigne son combat par le `group` de son META (pas de
 * saison qui le porterait dans un config de version), et tout en découle :
 * l'échelle, les monstres, les niveaux, les récompenses.
 *
 * UNE glissière pilote toute la page : les cartes de boss (fusionnées par
 * contenu — cf. `groupCombatants` — et calées sur le stage via le mode suiveur
 * de `BossRank`), les récompenses du stage, et l'équipe de la plage. Les
 * conseils et les persos recommandés, écrits pour l'échelle entière, restent
 * fixes.
 *
 * STRICT : un tag ou un nom de perso inconnu JETTE (build SSG cassé).
 */
export async function StagedBossGuide({ lang, guide }: GuideContentProps) {
  const t = await getT(lang);
  const ctx: ParseCtx = { lang, t, strict: true };
  const at = `${guide.category}/${guide.slug}`;

  if (!guide.group) {
    throw new Error(`${at} : « group » manquant dans meta.json (guide de boss à stages).`);
  }
  const strings = readGuideFile<GuideStrings>(guide, 'strings.json');
  if (!strings) throw new Error(`${at} : strings.json manquant (intro du guide).`);

  const encounters = encountersOfGroup(guide.group);
  const combatants = groupCombatants(guide.group, lang);
  const tips = readGuideFile<GuideTips>(guide, 'tips.json');
  const recommended = readGuideFile<GuideRecommended>(guide, 'recommended.json');
  const teams = readGuideFile<GuideTeams>(guide, 'teams.json');
  const videos = readGuideFile<GuideVideos>(guide, 'videos.json');

  // Une plage d'équipe qui ne couvre AUCUN stage réel est une coquille de
  // contenu (bornes inversées, échelle mal lue) : on casse le build, sinon
  // l'équipe disparaît de la page sans un bruit.
  for (const bucket of teams?.buckets ?? []) {
    if (stageIndexesIn(encounters, bucket.stages).length === 0) {
      throw new Error(
        `${at} : teams.json — la plage [${bucket.stages.join(', ')}] ne couvre aucun stage ` +
          `du combat « ${guide.group} » (ordres connus : 1..${encounters.length}).`,
      );
    }
  }

  // La SIGNATURE de loot de l'échelle — lue sur le STAGE MAX et affichée telle
  // quelle à tous les stages : le pool légendaire est stable sur l'échelle
  // (seule l'étoile monte), à l'exception des stages 1-2 de deux échelles
  // récentes qui traînent en plus un pool générique d'anciens accessoires —
  // du bruit qu'on ne montre pas.
  const topReward = encounters[encounters.length - 1].ref.reward;
  const loot = topReward ? stageLoot(topReward, lang) : undefined;
  // Le DÉTAIL du même pool : les MiniCards de l'équipement (cf. `lootDetails`),
  // dépliées à la demande — les mêmes cartes que dans un build de perso.
  const details = topReward ? lootDetails(topReward, lang) : undefined;
  const lootLabels = lootPanelLabels(t);

  const levelWord = t('page.character.skill.level');
  const ticks = encounters.map((e, i) => String(e.ref.difficulty?.order ?? i + 1));
  const titles = encounters.map((e, i) => {
    const stage = difficultyLabel(e.ref, lang, t) ?? `${t('guides.difficulty.title')} ${i + 1}`;
    const level = Math.max(...e.monsters.map((m) => m.level));
    return `${stage} — ${levelWord} ${level}`;
  });

  return (
    <>
      {/* Contenu éditorial : même encre que le reste du guide, pas du gris de chrome. */}
      <p className="text-content text-sm leading-relaxed">
        {parseText(lRec(strings.intro, lang), ctx)}
      </p>

      {/* La sélection ouvre sur le stage le plus DUR : c'est celui pour lequel
          le guide est écrit (la V2 ne montrait même que celui-là). */}
      <EncounterSelection count={encounters.length} defaultIndex={encounters.length - 1}>
        <div className="space-y-6">
          {/* UNE carte par combattant DISTINCT, visible sur les stages où son
              variant apparaît, ses stats calées sur la glissière (mode suiveur).
              La glissière de stage et le butin légendaire du stage vivent DANS
              la carte du boss PRINCIPAL, entre ses stats et ses compétences —
              exactement un principal est visible à chaque stage. */}
          <div className="space-y-6">
            {combatants.map((c) => (
              <EncounterPane key={c.monsterId} indexes={c.stageIndexes}>
                <BossCard
                  monsterId={c.monsterId}
                  spawns={c.spawns}
                  followStages={c.spawnByStage}
                  role={c.role}
                  lang={lang}
                  afterStats={
                    c.main ? (
                      <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
                        <EncounterSlider
                          label={t('guides.difficulty.title')}
                          ticks={ticks}
                          titles={titles}
                          prevLabel={t('guides.difficulty.stage_prev')}
                          nextLabel={t('guides.difficulty.stage_next')}
                        />
                        {loot && details && (
                          <div className="min-w-0 flex-1">
                            <LootPanel
                              icons={
                                <StageLootIcons
                                  pieceLabels={{
                                    2: lootLabels.piece2,
                                    4: lootLabels.piece4,
                                  }}
                                  loot={loot}
                                />
                              }
                              details={details}
                              labels={lootLabels}
                            />
                          </div>
                        )}
                      </div>
                    ) : undefined
                  }
                />
              </EncounterPane>
            ))}
          </div>

          {tips && (
            <TacticalTips
              title={t('guides.tips.tactical')}
              tips={tips.tactical.map((tip) => parseText(lRec(tip, lang), ctx))}
            />
          )}

          {recommended && (
            <RecommendedCharacters
              title={t('guides.recommended.title')}
              lang={lang}
              groups={recommended.map((g) => ({
                characters: g.characters,
                reason: g.reason ? parseText(lRec(g.reason, lang), ctx) : undefined,
              }))}
            />
          )}

          {teams?.buckets.map((bucket) => (
            <EncounterPane
              key={bucket.stages.join('-')}
              indexes={stageIndexesIn(encounters, bucket.stages)}
            >
              <TeamSlots
                title={t('guides.team_selector')}
                lang={lang}
                slots={bucket.slots}
                note={bucket.note ? parseText(lRec(bucket.note, lang), ctx) : undefined}
                labels={{
                  prev: t('guides.team.prev_option'),
                  next: t('guides.team.next_option'),
                }}
              />
            </EncounterPane>
          ))}
        </div>
      </EncounterSelection>

      {videos?.length ? (
        <section className="space-y-2">
          <h2 className="text-content-strong text-xl font-bold">{t('guides.combat_footage')}</h2>
          <MultiVideoEmbed videos={videos} />
        </section>
      ) : null}
    </>
  );
}
