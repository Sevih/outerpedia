/**
 * La CARTE d'un boss — construite depuis les données monstres VALIDÉES
 * (`data/generated/monsters.json` + `monster-skills.json`) : en-tête (icône,
 * nom, élément/classe), stats interpolées au niveau de rencontre, immunités
 * (tooltips du jeu → encyclopédie des effets) et compétences en lignes.
 * Composant SERVEUR.
 *
 * Elle ne connaît QU'UN monstre et QUE ses rencontres — c'est une primitive.
 * Qui les choisit ne la regarde pas :
 *   - la Singularity lui donne les 30 paliers d'un boss unique (`BossPanel`) ;
 *   - le Joint Challenge en pose TROIS, une par difficulté (`BossEncounters`) ;
 *   - le World Boss en pose deux côte à côte dans ses ligues hautes.
 * Aucun `if (mode === …)` ici, et il n'y en aura jamais : les modes composent,
 * ils ne configurent pas.
 */
import type { TranslationKey } from '@/i18n';
import { LANGUAGES, type Lang } from '@/lib/i18n/config';
import { getT } from '@/i18n';
import { lRec } from '@/lib/i18n/localize';
import { img } from '@/lib/images';
import { RANGE_TO_TARGET } from '@/lib/skills';
import type { SpawnContext } from '@/lib/monster-stats';
import { localizeStatuses } from '@/lib/data/effects';
import { getBossView } from '@/lib/data/monsters';
import { bossRankOptionLabels, bossSpawnContexts, type BossSkillView } from '@/lib/data/boss-view';
import type { CardSkill } from '@/components/character/SkillCard';
import { EffectIconBadge } from '@/components/character/EffectChips';
import { Thumbnail } from '@/components/ui/Thumbnail';
import { statIconSprite, statAbbr } from '@/lib/stats';
import { statName } from '@/lib/data/stat-glossary';
import { MonsterSkills, MonsterSkillBody } from './MonsterSkills';
import { SegmentedTabs, type TabItem } from './SegmentedTabs';
import { BossRankProvider, BossLevel } from './BossRank';
import { BossStats, type StatLabel } from './BossStats';
import { Disclosure } from '@/components/ui/Disclosure';

export async function BossCard({
  monsterId,
  spawns: modeSpawns,
  lang,
  role,
  followStages,
  afterStats,
  hideSpawnLabel,
  compact,
}: {
  monsterId: string;
  /**
   * Les rencontres à parcourir — imposées par le MODE. Absentes, ce sont celles
   * du monstre lui-même : un boss qu'aucun mode ne contextualise se décrit par
   * ses propres rencontres (c'était le rôle de `BossPanel`).
   */
  spawns?: SpawnContext[];
  lang: Lang;
  /** Rôle dans la rencontre (`DungeonMonster.role`) — badge sur les renforts. */
  role?: 'boss' | 'add';
  /** Mode SUIVEUR : sélection de rencontre → index dans `spawns` (cf. BossRank). */
  followStages?: Record<number, number>;
  /** Masque le suffixe « — <mode · donjon> » des stats (cf. `BossStats`). */
  hideSpawnLabel?: boolean;
  /**
   * Mode COMPACT (guild raid) : les stats sont repliées derrière un bouton et les
   * compétences deviennent des onglets (une icône par skill, une seule description
   * à la fois) — de quoi poser trois boss sur une page sans la noyer.
   */
  compact?: boolean;
  /**
   * Bloc du MODE inséré entre les stats et les compétences — là où le Special
   * Request pose sa glissière de stage et le butin du stage. La carte ne sait
   * pas ce que c'est : les modes composent, ils ne configurent pas.
   */
  afterStats?: React.ReactNode;
}) {
  // TOUT ce que la carte affiche vient d'ICI : identité, stats, kit résolu,
  // immunités, sous-glossaire des statuts. Live ou archive, même code —
  // c'est `getBossView` qui choisit la provenance (cf. src/lib/data/boss-view.ts).
  const view = getBossView(monsterId);
  // Réf de contenu cassée = bug de guide : on casse le build, pas de repli muet.
  if (!view) {
    throw new Error(
      `BossCard : monstre « ${monsterId} » absent de data/generated/monsters.json — ` +
        `à extraire/valider via l'admin (Extractor › Monsters).`,
    );
  }

  const t = await getT(lang);
  const name = lRec(view.name, lang);
  const spawns = modeSpawns ?? bossSpawnContexts(view, lang);
  const statuses = localizeStatuses(view.statuses, lang);

  const targetLabel = (s: BossSkillView): string | undefined => {
    const key = RANGE_TO_TARGET[s.range ?? ''];
    if (!key) return undefined;
    return t(`page.character.skill.target_${key}${s.offensive ? '' : '_ally'}` as TranslationKey);
  };
  const cardSkills: CardSkill[] = view.skills.map((s) => ({
    id: s.id,
    name: lRec(s.name, lang),
    desc: s.desc ? lRec(s.desc, lang) : undefined,
    icon: s.icon,
    targetLabel: targetLabel(s),
    maxLevel: s.maxLevel,
    levels: s.levels,
    effects: s.effects,
  }));

  // Immunités déjà résolues : une réf que le glossaire ne connaît pas arrive
  // SANS effet et s'affiche en ROUGE (signal d'erreur de contenu, comme parse-text).
  const immunities = view.immunities;
  const panelStats = view.stats;

  // Le jeu nomme ses stats : on ne fait que traduire le slug en icône + nom
  // localisé, une fois, ici — `BossStats` est client, il ne traduit rien.
  const statLabels: Record<string, StatLabel> = {};
  for (const slug of Object.keys(panelStats)) {
    statLabels[slug] = {
      abbr: statAbbr(slug),
      name: statName(slug, lang),
      icon: statIconSprite(slug),
    };
  }

  // Un STAGE n'a pas de badge : il se dit. Le gabarit est déjà traduit dans les
  // cinq langues (`guides.difficulty.stage` — celui du guild raid), et seul le
  // serveur a le `t` : on l'appose ici, la glissière est cliente.
  const scale = spawns.map((s) =>
    s.stage ? { ...s, stageLabel: t('guides.difficulty.stage', { n: s.stage }) } : s,
  );

  return (
    <BossRankProvider spawns={scale} followStages={followStages}>
      {/* CONTENEUR de requêtes : la carte s'adapte à la place QU'ELLE A, pas à la
          taille de l'écran. C'est la seule façon honnête de la rendre posable
          n'importe où — `MonsterLineup` la met en pleine largeur, ou en demi
          quand deux monstres se comparent côte à côte, et sur un grand écran un
          `lg:` (qui mesure le VIEWPORT) laisserait la demi-carte étaler ses stats
          sur une ligne prévue pour le double : elles s'écrasaient. */}
      <section className="@container space-y-4">
        {/* EN-TÊTE : qui est ce boss — icône, nom, élément, classe, et son NIVEAU
            au palier courant. Le niveau se lit là parce que c'est là qu'on le
            cherche (le jeu l'écrit au même endroit) ; il suit la glissière, d'où
            le contexte partagé. */}
        <div className="flex items-center gap-4">
          <Thumbnail {...view.thumb} kind="monster" name={name} className="h-16 w-16" />
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-content-strong text-xl font-bold">{name}</h2>
              {/* Un renfort se bat AVEC le boss, pas à sa place : sa carte le
                  dit d'un badge, sinon deux cartes empilées se lisent comme
                  deux boss — et le lecteur cherche lequel il affronte. */}
              {role === 'add' && (
                <span className="border-line-subtle bg-surface-sunken text-content rounded-full border px-2 py-0.5 font-mono text-[10px] font-semibold tracking-[0.14em] uppercase">
                  {t('guides.boss_display.add')}
                </span>
              )}
            </div>
            {/* Élément et classe ne sont plus écrits ici : la vignette les
                porte, aux places exactes où le jeu les met. Les répéter à côté
                du nom les montrait deux fois. Reste le NIVEAU, que la vignette
                ne peut pas donner — il suit la glissière de palier. */}
            <div className="mt-1 flex items-center gap-2">
              <BossLevel label={t('page.character.skill.level')} />
            </div>
          </div>
        </div>

        {/* Juste sous l'en-tête : ce contre quoi le boss est INSENSIBLE. C'est la
          suite de la même question — « à quoi j'ai affaire » — et ça se lit avant
          d'aller regarder ses chiffres.
          ICÔNES SEULES : une immunité se reconnaît à son symbole ; une rangée de
          pastilles nommées mangerait la ligne. Le nom vient au survol, au tap, et
          pour les lecteurs d'écran. Une réf non résolue s'affiche en ROUGE
          (signal d'erreur de contenu, comme parse-text). */}
        {immunities.length > 0 && (
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
            <h3 className="text-content font-mono text-[10px] font-semibold tracking-[0.14em] uppercase">
              {t('guides.boss_display.immunities')}
            </h3>
            <div className="flex flex-wrap items-center gap-1.5">
              {immunities.map(({ tid, effect }) =>
                effect ? (
                  <EffectIconBadge
                    key={tid}
                    // Plus discret que les chips de skill (h-7) : une rangée
                    // d'immunités est un rappel, pas le sujet de la carte.
                    className="h-5 w-5"
                    effect={{
                      name: lRec(effect.name, lang) || effect.name.en,
                      icon: effect.icon,
                      isDebuff: effect.isDebuff,
                      desc: effect.desc ? lRec(effect.desc, lang) : undefined,
                    }}
                  />
                ) : (
                  <span key={tid} className="text-danger-strong text-xs">
                    {tid}
                  </span>
                ),
              )}
            </div>
          </div>
        )}

        {(() => {
          const stats = (
            <BossStats
              stats={panelStats}
              scales={view.statScales}
              quirkMods={view.quirkMods}
              statLabels={statLabels}
              locale={LANGUAGES[lang].htmlLang}
              rankOptionLabels={bossRankOptionLabels(view, spawns, lang)}
              hideContextLabel={hideSpawnLabel}
              labels={{
                level: t('page.character.skill.level'),
                rank: t('guides.boss_display.rank'),
                options: t('guides.boss_display.rank_options'),
                rankPrev: t('guides.boss_display.rank_prev'),
                rankNext: t('guides.boss_display.rank_next'),
              }}
            />
          );
          // Compact : stats repliées derrière un bouton.
          return compact ? (
            <Disclosure label={t('guides.boss_display.stats')}>{stats}</Disclosure>
          ) : (
            stats
          );
        })()}

        {afterStats}

        {cardSkills.length > 0 && (
          <div className="space-y-1.5">
            <h3 className="text-content font-mono text-[10px] font-semibold tracking-[0.14em] uppercase">
              {t('guides.boss_display.skills')}
            </h3>
            {compact ? (
              // Compact : un onglet par skill (son icône), une seule description
              // à la fois — reprend le corps de ligne dans un cadre unique.
              <SegmentedTabs
                ariaLabel={t('guides.boss_display.skills')}
                variant="icon"
                tabs={cardSkills.map<TabItem>((skill) => ({
                  key: skill.id,
                  label:
                    skill.iconSrc || skill.icon ? (
                      <img
                        src={skill.iconSrc ?? img.skill(skill.icon!)}
                        alt={skill.name}
                        className="h-9 w-9 rounded object-contain"
                        width={36}
                        height={36}
                      />
                    ) : (
                      skill.name
                    ),
                  content: (
                    <MonsterSkillBody
                      skill={skill}
                      statuses={statuses}
                      lang={lang}
                      labels={{ cooldown: t('page.character.skill.cooldown') }}
                    />
                  ),
                }))}
              />
            ) : (
              <MonsterSkills
                skills={cardSkills}
                statuses={statuses}
                lang={lang}
                labels={{ cooldown: t('page.character.skill.cooldown') }}
              />
            )}
          </div>
        )}
      </section>
    </BossRankProvider>
  );
}

/**
 * Un boss SANS choix de difficulté — le mode n'en a qu'une, et les rencontres du
 * monstre suffisent à le décrire (Dimensional Singularity : un boss, trente
 * paliers). Reste le point d'entrée des guides qui ne désignent qu'un monstre.
 */
export async function BossPanel({ monsterId, lang }: { monsterId: string; lang: Lang }) {
  // Sans `spawns`, la carte prend les rencontres PROPRES du monstre — ce que
  // faisait ce panneau. Une seule résolution de vue au lieu de deux.
  return <BossCard monsterId={monsterId} lang={lang} />;
}
