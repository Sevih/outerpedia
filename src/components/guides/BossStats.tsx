'use client';

import { useCallback, useRef, type PointerEvent as ReactPointerEvent } from 'react';
import { img } from '@/lib/images';
import { rankBadgeSprite } from '@/lib/ranks';
import {
  formatMonsterStat,
  orderedStats,
  statAt,
  type SpawnContext,
  type StatRange,
} from '@/lib/monster-stats';
import { useBossRank } from './BossRank';

/** Un grade (E, D, C…) et ses crans (E, E+, E++), dans l'ordre des paliers. */
interface RankGrade {
  name: string;
  /** Position, sur l'échelle complète, du milieu du grade — 0..1. */
  mid: number;
  /** Indices (dans `options`) des crans du grade. */
  indexes: number[];
}

/**
 * Groupe les paliers par GRADE — le nom moins ses « + ». Les 30 paliers de
 * Singularity forment 10 grades de 3 crans, mais on ne le suppose pas : le
 * regroupement suit les noms tels qu'ils viennent de la donnée, en conservant
 * l'ordre. Une échelle irrégulière (ou un cran ajouté par un patch) se range
 * donc toute seule.
 */
function rankGrades(options: SpawnContext[]): RankGrade[] {
  const last = options.length - 1;
  const grades: { name: string; indexes: number[] }[] = [];
  options.forEach((s, index) => {
    // Échelle de STAGES : le repère est le numéro du stage — et il vaut d'être
    // écrit, car il ne commence pas toujours à 1 (Anubis entre en rotation au
    // stage 8 : ses repères se lisent 8, 9, 10).
    if (!s.rank) {
      if (s.stage) grades.push({ name: String(s.stage), indexes: [index] });
      return;
    }
    const name = s.rank.replace(/\+/g, '');
    const prev = grades[grades.length - 1];
    if (prev && prev.name === name) prev.indexes.push(index);
    else grades.push({ name, indexes: [index] });
  });
  return grades.map((g) => {
    const center = (g.indexes[0] + g.indexes[g.indexes.length - 1]) / 2;
    return { ...g, mid: last > 0 ? center / last : 0 };
  });
}

/** Une stat, prête à afficher : le jeu la nomme, on ne fait que la poser. */
export interface StatLabel {
  /** Abréviation canonique (`ATK`) — affichée quand le jeu n'a pas d'icône. */
  abbr: string;
  /** Nom complet localisé (« Attack ») — au survol, et pour les lecteurs d'écran. */
  name: string;
  /** Sprite `CM_Stat_Icon_*`, absent pour la WG (cf. `statIconSprite`). */
  icon?: string;
}

/** Libellés DÉJÀ localisés (composant client : il ne traduit pas). */
export interface BossStatsLabels {
  level: string;
  /** « Palier » — nom du curseur (lecteurs d'écran). */
  rank: string;
  /** « Passifs du palier ». */
  options: string;
  /** « Palier précédent » — aria du pas-à-pas. */
  rankPrev: string;
  /** « Palier suivant » — aria du pas-à-pas. */
  rankNext: string;
}

/**
 * Stats d'un boss À LA RENCONTRE — calcul partagé avec la carte admin
 * (src/lib/monster-stats) : ordre de l'écran du jeu, EFF/RES en valeur brute,
 * modificateurs du donjon appliqués, quirks de compte déduits.
 *
 * DEUX RÉGIMES :
 *  - rencontre simple → les stats au niveau du spawn ;
 *  - MODE À SCORE (le palier porte une tranche de dégâts : Singularity…) → le
 *    palier n'est pas une difficulté qu'on choisit, c'est la TRANCHE DE DÉGÂTS
 *    qu'on inflige. Ce que la donnée appelle les « PV » du boss vaut alors
 *    exactement la LARGEUR de cette tranche — ce ne sont pas des PV, et la
 *    valeur n'est même pas monotone (la barre A+ est plus étroite que la barre
 *    A). On ne l'affiche donc pas : sortie de la grille, point.
 */
export function BossStats({
  stats,
  scales,
  quirkMods,
  statLabels,
  labels,
  locale,
  rankOptionLabels,
  hideContextLabel,
}: {
  stats: Record<string, StatRange>;
  /** Échelle d'affichage par slug (`percent` = per-mille → %). */
  scales: Record<string, string>;
  /** Quirks de compte réduisant les stats du boss (`glossaries.bossQuirkMods`). */
  quirkMods?: Record<string, number>;
  /** Icône + nom de chaque stat, par slug (préparés côté serveur). */
  statLabels: Record<string, StatLabel>;
  labels: BossStatsLabels;
  /** Locale BCP-47, pour le formatage des grands nombres. */
  locale: string;
  /** Passifs de palier DÉJÀ localisés (id d'option → libellé). */
  rankOptionLabels?: Record<string, string>;
  /**
   * Masque le suffixe « — <mode · donjon> » de la ligne de niveau. Vrai quand un
   * conteneur porte DÉJÀ ce contexte (onglets de sous-boss/difficulté du guild
   * raid) : le répéter sous les stats n'apprend rien.
   */
  hideContextLabel?: boolean;
}) {
  // Le palier vit dans le contexte : le NIVEAU qu'il fixe se lit aussi dans
  // l'en-tête du boss, à l'autre bout du panneau (cf. BossRank). En mode
  // SUIVEUR (`controlled`), le sélecteur de rencontre du haut de page pilote
  // déjà cet axe : la grille rend les stats du stage choisi et n'affiche AUCUN
  // sélecteur à elle.
  const { options, selected, setSelected, ctx, controlled } = useBossRank();

  // PAS DE LIGNE « PV » DANS UN MODE À SCORE — et ce n'est pas un oubli.
  //
  // Là où le rang se gagne aux DÉGÂTS (Singularity, World Boss), la barre que le
  // joueur vide n'est pas la vie du boss : c'est la TRANCHE de son palier
  // (`DungeonRank.hp` = max − min + 1, cf. `monster-stats`). Le monstre a bien
  // des PV au templet — 100 000 tout plat pour Belial — mais ils ne correspondent
  // à rien de ce que le jeu montre. Les afficher inventerait une stat.
  // Les modes SANS score (joint challenge, guild raid) ont, eux, un vrai
  // `bossHp` : ils affichent leurs PV, et c'est la même grille qui s'en charge.
  const scoreMode = Boolean(ctx.damage);
  const grid = orderedStats(stats).filter(([slug]) => !(scoreMode && slug === 'hp'));
  const passives = (ctx.options ?? [])
    .map((id) => rankOptionLabels?.[id])
    .filter((l): l is string => Boolean(l));

  // Une échelle graduée — par GRADES (badges E…SSS) ou par STAGES (numéros).
  // Les deux se parcourent à la glissière ; ce qui les sépare est ce qu'on pose
  // sur le pouce (cf. `RankSlider`).
  const hasRanks = Boolean(options[0]?.rank ?? options[0]?.stage);

  return (
    <div className="space-y-4">
      {/* PALIERS À GAUCHE, STATS À DROITE — TANT QUE LA CARTE EST LARGE. Le palier
          n'est pas un réglage qu'on pousse en haut de page et qu'on oublie : on le
          change POUR regarder les stats bouger, et les deux doivent tenir dans un
          même coup d'œil.

          Mais la carte n'est pas toujours seule : `MonsterLineup` la pose en DEMI
          largeur quand deux monstres se comparent (les deux phases d'un world
          boss). Là, cette même ligne écrase la grille contre la glissière. Le
          seuil est donc celui du CONTENEUR (`@3xl` ≈ 48 rem), pas du viewport :
          en dessous, la glissière passe au-dessus et les stats retombent juste
          au-dessus des compétences — là où on les lit. */}
      <div className="flex flex-col gap-4 @3xl:flex-row @3xl:items-start">
        {!controlled && hasRanks && options.length > 1 && (
          <div className="border-line-subtle bg-surface-raised flex flex-col gap-1 rounded-xl border px-3 py-4 @3xl:w-80 @3xl:shrink-0">
            <RankSlider
              options={options}
              selected={selected}
              onSelect={setSelected}
              labels={labels}
            />
          </div>
        )}

        <div className="min-w-0 flex-1 space-y-3">
          {/* Rencontres sans palier (difficultés nommées) : quelques boutons suffisent. */}
          {!controlled && !hasRanks && options.length > 1 && (
            <div className="flex flex-wrap items-center gap-1 text-xs">
              <span className="text-content-muted mr-1">{labels.level}</span>
              {options.map((s, i) => (
                <button
                  key={i}
                  type="button"
                  title={s.label}
                  onClick={() => setSelected(i)}
                  className={`rounded px-2 py-0.5 transition-colors ${
                    i === selected
                      ? 'bg-accent/15 text-accent ring-accent/40 ring-1'
                      : 'bg-surface-raised text-content-muted hover:text-content-strong'
                  }`}
                >
                  {s.level}
                </button>
              ))}
            </div>
          )}

          {/* Icône + valeur, comme l'écran du jeu. Le nom complet reste atteignable
              (survol, lecteur d'écran) : l'abréviation était une convention de wiki,
              l'icône est la langue du jeu. Faute d'icône (WG), l'abréviation revient. */}
          {/* Le nombre de colonnes suit la LARGEUR DE LA CARTE, pas celle de
              l'écran : une demi-carte garde des cases lisibles au lieu d'en
              tasser quatre dans la place de deux. */}
          <div className="grid grid-cols-2 gap-1.5 @md:grid-cols-3 @2xl:grid-cols-4">
            {grid.map(([slug, r]) => {
              const label = statLabels[slug];
              return (
                <div
                  key={slug}
                  title={label?.name}
                  className="border-line-subtle bg-surface-raised flex items-center gap-1.5 rounded-md border px-2 py-1"
                >
                  {label?.icon ? (
                    // eslint-disable-next-line @next/next/no-img-element -- asset R2/staging
                    <img
                      src={img.statIcon(label.icon)}
                      alt=""
                      className="h-5 w-5 shrink-0 object-contain"
                    />
                  ) : (
                    <span className="text-content w-5 shrink-0 text-center text-[10px] font-semibold">
                      {label?.abbr ?? slug}
                    </span>
                  )}
                  {/* PAS DE NOMBRE DE BARRES ICI. Le montant de vie suffit à qui
                      prépare un combat ; le « × 50 » du Special Request ne faisait
                      qu'encombrer la case. `hpLines` reste dans la donnée — c'est
                      lui qui désigne le boss PRINCIPAL d'un combat — et la carte
                      admin continue de l'afficher, là où il sert à contrôler. */}
                  <span className="text-content-strong min-w-0 truncate text-sm font-semibold tabular-nums">
                    {formatMonsterStat(slug, statAt(slug, r, ctx, quirkMods), scales, locale)}
                  </span>
                  <span className="sr-only">{label?.name ?? slug}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {passives.length > 0 && (
        <div className="space-y-1.5">
          <h4 className="text-content font-mono text-[10px] font-semibold tracking-[0.14em] uppercase">
            {labels.options}
          </h4>
          <div className="flex flex-wrap gap-1.5">
            {passives.map((label) => (
              <span
                key={label}
                className="border-line-subtle bg-surface-raised text-content rounded-full border px-2.5 py-0.5 text-xs"
              >
                {label}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* En mode SUIVEUR, rien : la glissière de stage porte déjà stage, niveau
          et mode — cette ligne ne ferait que les répéter sous chaque carte. */}
      {!controlled && options.length === 1 && (
        <p className="text-content-muted text-xs">
          {labels.level} {ctx.level}
          {!hideContextLabel && ctx.label ? ` — ${ctx.label}` : ''}
        </p>
      )}
    </div>
  );
}

/**
 * GLISSIÈRE DE PALIER — l'échelle entière, d'un coup d'œil, et RIEN D'AUTRE.
 *
 * Le palier ne s'écrit qu'UNE fois : sur le curseur, par son badge. L'en-tête
 * qui le répétait en image puis en toutes lettres, juste au-dessus de la barre
 * qui le portait déjà, disait trois fois la même chose. Le NIVEAU, lui, est parti
 * là où on le cherche : à côté de la classe du boss (cf. `BossRank`).
 *
 * La piste est un dégradé de CHALEUR (froid = E, chaud = SSS++, tokens
 * `--rank-heat-*`) : la position du curseur dit à elle seule où l'on se trouve
 * sur l'échelle et ce qu'il reste au-dessus. C'est ce que ni un menu déroulant
 * ni trente vignettes quasi identiques ne savaient dire.
 *
 * Les graduations sont posées à leur position RÉELLE et marquées plus fort au
 * début de chaque grade ; les noms de grade sont ancrés au MILIEU de leur groupe.
 * Rien n'est supposé de la forme de l'échelle : tout se déduit des noms de
 * paliers (cf. `rankGrades`), donc un cran ajouté par un patch se place seul.
 *
 * `role="slider"` : un vrai curseur, pas une rangée de boutons déguisée — donc
 * glissable au doigt (`touch-none` + capture du pointeur), cliquable n'importe où
 * sur la piste, et pilotable au clavier (←/→ un cran, Page↑/↓ trois, Début/Fin).
 *
 * Le pas-à-pas est ◀ ▶, PAS ▲ ▼ : sur une barre horizontale, « la flèche du haut »
 * ne veut rien dire — et c'est précisément comme ça qu'on finit par la brancher
 * à l'envers. Gauche = on descend l'échelle, droite = on la monte, comme le curseur.
 */
function RankSlider({
  options,
  selected,
  onSelect,
  labels,
}: {
  options: SpawnContext[];
  selected: number;
  onSelect: (index: number) => void;
  labels: BossStatsLabels;
}) {
  const last = options.length - 1;
  // DEUX éléments, deux rôles — c'est le cœur du correctif.
  //  - `hit` ÉCOUTE : c'est toute la zone du sélecteur (rail + pouce + repères de
  //    grade). Le pouce fait 38 px et son centre se cale sur le cran : à E il
  //    déborde de 19 px À GAUCHE du rail, à SSS++ de 19 px à droite. Quand le rail
  //    écoutait lui-même, ces débords tombaient hors de la zone sensible et il ne
  //    restait, sous le doigt, que ce qui recouvrait encore le rail.
  //  - `rail` MESURE : la géométrie (0 % → 100 %) se lit sur lui seul, sinon le
  //    rembourrage de la zone d'écoute décalerait tous les crans.
  const hit = useRef<HTMLDivElement>(null);
  const rail = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);
  const ctx = options[selected]!;
  const grades = rankGrades(options);
  const pos = last > 0 ? selected / last : 0;

  const clamp = useCallback((i: number) => Math.min(last, Math.max(0, i)), [last]);

  /** Cran le plus proche du pointeur — mesuré sur le RAIL, pas sur la zone d'écoute. */
  const indexAt = useCallback(
    (clientX: number) => {
      const box = rail.current?.getBoundingClientRect();
      if (!box || box.width === 0) return selected;
      const ratio = Math.min(1, Math.max(0, (clientX - box.left) / box.width));
      return Math.round(ratio * last);
    },
    [last, selected],
  );

  const onDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    // La capture garde le glissé vivant même quand le doigt sort de la zone.
    hit.current?.setPointerCapture(e.pointerId);
    dragging.current = true;
    onSelect(indexAt(e.clientX));
  };
  const onMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (dragging.current) onSelect(indexAt(e.clientX));
  };
  const onUp = () => {
    dragging.current = false;
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    const jump: Record<string, number> = {
      ArrowRight: 1,
      ArrowUp: 1,
      ArrowLeft: -1,
      ArrowDown: -1,
      PageUp: 3,
      PageDown: -3,
    };
    let next: number;
    if (e.key === 'Home') next = 0;
    else if (e.key === 'End') next = last;
    else if (e.key in jump) next = clamp(selected + jump[e.key]!);
    else return;
    e.preventDefault();
    onSelect(next);
  };

  /** ◀ / ▶ : un cran vers le bas ou vers le haut de l'échelle. */
  const step = (delta: 1 | -1, aria: string, glyph: string) => (
    <button
      type="button"
      aria-label={aria}
      disabled={delta < 0 ? selected === 0 : selected === last}
      onClick={() => onSelect(clamp(selected + delta))}
      className="border-line bg-surface-base text-content hover:text-content-strong enabled:hover:border-line-strong flex h-7 w-6 shrink-0 items-center justify-center rounded border text-[10px] transition-colors disabled:opacity-30"
    >
      {glyph}
    </button>
  );

  return (
    <div className="flex items-center gap-2">
      {step(-1, labels.rankPrev, '◀')}

      {/* ZONE D'ÉCOUTE : tout le bloc du sélecteur répond au clic et au glissé —
          le rail, le pouce (y compris ses débords), et jusqu'aux repères de grade.
          Le rembourrage `px-5` réserve la place des débords du pouce ; il ne
          fausse rien, la géométrie étant mesurée sur le rail. */}
      <div
        ref={hit}
        role="slider"
        tabIndex={0}
        aria-label={labels.rank}
        aria-valuemin={0}
        aria-valuemax={last}
        aria-valuenow={selected}
        aria-valuetext={`${ctx.rank ?? ctx.stageLabel ?? ''} — ${labels.level} ${ctx.level}`}
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onUp}
        onLostPointerCapture={onUp}
        onKeyDown={onKeyDown}
        className="focus-visible:ring-ring min-w-0 flex-1 cursor-pointer touch-none rounded px-5 py-0.5 select-none focus-visible:ring-2 focus-visible:outline-none"
      >
        <div ref={rail} className="relative h-11">
          <span
            aria-hidden
            className="absolute inset-x-0 top-1/2 h-2.5 -translate-y-1/2 rounded-full"
            style={{
              background:
                'linear-gradient(90deg, var(--rank-heat-lo), var(--rank-heat-mid), var(--rank-heat-hi))',
            }}
          />

          {options.map((s, i) => {
            const gradeStart = !s.rank?.includes('+');
            return (
              <span
                key={i}
                aria-hidden
                className="bg-surface-sunken absolute top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
                style={{
                  left: `${(last > 0 ? i / last : 0) * 100}%`,
                  width: gradeStart ? 2 : 1,
                  height: gradeStart ? 12 : 7,
                  opacity: gradeStart ? 0.55 : 0.3,
                }}
              />
            );
          })}

          <span
            aria-hidden
            className="border-accent bg-surface-base ring-accent/20 pointer-events-none absolute top-1/2 flex h-9.5 w-9.5 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-[10px] border-2 shadow-lg ring-4 transition-[left] duration-75"
            style={{ left: `${pos * 100}%` }}
          >
            {/* Un GRADE se reconnaît à son badge ; un STAGE n'en a pas — il porte
                son numéro (le jeu ne dessine rien d'autre pour l'Adventure
                License). Le libellé complet (« Stage 8 ») reste dit au lecteur
                d'écran, sous le pouce. */}
            {ctx.rank ? (
              /* eslint-disable-next-line @next/next/no-img-element -- asset R2/staging */
              <img
                src={img.rankBadge(rankBadgeSprite(ctx.rank))}
                alt=""
                draggable={false}
                className="h-7.5 w-7.5 object-contain"
              />
            ) : (
              ctx.stage && (
                <span className="text-content-strong font-mono text-sm font-bold">{ctx.stage}</span>
              )
            )}
          </span>
        </div>

        {/* Repères de grade, ancrés au milieu de leur groupe : les points d'appui
            de l'échelle (E … SSS), sans afficher les trente crans. */}
        <div aria-hidden className="relative h-4">
          {grades.map((g) => (
            <span
              key={g.name}
              className={`absolute -translate-x-1/2 font-mono text-[10px] font-bold transition-colors ${
                g.indexes.includes(selected) ? 'text-accent' : 'text-content-strong'
              }`}
              style={{ left: `${g.mid * 100}%` }}
            >
              {g.name}
            </span>
          ))}
        </div>
      </div>

      {step(1, labels.rankNext, '▶')}
    </div>
  );
}
