'use client';

/**
 * Pickers du Damage Calculator — slots d'arme/accessoire, sets, et le picker
 * de cible en modale (browser visuel de l'histoire compris). Extrait de
 * `DamageCalculatorBrowser.tsx` le 25/08/2026 (audit D4 — découpage
 * mécanique, contenu inchangé).
 */
import { useMemo, useState } from 'react';
import { img } from '@/lib/images';
import { EquipmentIcon } from '@/components/equipment/EquipmentIcon';
import { SearchField } from '@/components/character/filters/FilterAtoms';
import { GameText } from '@/components/ui/GameText';
import type { DcGear, DcLabels, DcSet, DcTarget, SetPick } from './contracts';
import { Eyebrow, Modal, MonsterPortrait, NoMatches, ROW_CLASS, SlotTile, Stepper } from './ui';

/** Slot d'arme/accessoire : picker + breakthrough T0–T4 + texte du passif
 *  (variante de CLASSE de l'attaquant quand la famille en a). */
export function GearSlot({
  title,
  placeholder,
  options,
  value,
  tier,
  attackerCls,
  onPick,
  onClear,
  onTier,
  labels,
}: {
  title: string;
  placeholder: string;
  options: DcGear[];
  value: DcGear | undefined;
  tier: number;
  attackerCls: string;
  onPick: (slug: string) => void;
  onClear: () => void;
  onTier: (v: number) => void;
  labels: DcLabels;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const q = search.trim().toLowerCase();
  const filtered = q ? options.filter((o) => o.label.toLowerCase().includes(q)) : options;
  const tiers = value ? (value.classTiers?.[attackerCls] ?? value.tiers) : undefined;
  const close = () => {
    setOpen(false);
    setSearch('');
  };
  return (
    <div className="border-line-subtle bg-surface-sunken/70 space-y-1.5 rounded-lg border p-2">
      {/* La case est étroite (grille 2 colonnes) : l'en-tête WRAP — le groupe
        Stepper+✕ descend sous le titre au lieu de déborder sous la case
        voisine, qui recouvrait le « + » (bug signalé Sevih 03/08/2026). */}
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
        <Eyebrow>{title}</Eyebrow>
        {value && (
          <span className="ml-auto flex shrink-0 items-center gap-2">
            <Stepper value={tier} min={0} max={4} onChange={onTier} format={(v) => `T${v}`} />
            <button
              type="button"
              className="text-content-subtle hover:text-danger cursor-pointer text-xs"
              onClick={onClear}
              title={labels.clear}
            >
              ✕
            </button>
          </span>
        )}
      </div>
      <div className="flex min-w-0 items-center gap-2">
        <SlotTile onClick={() => setOpen(true)} title={value?.label ?? placeholder}>
          {value ? (
            <EquipmentIcon
              icon={value.icon}
              grade={value.grade}
              size={44}
              stars={value.star}
              overlayIcon={value.overlayIcon}
              classType={gearClassOf(value, attackerCls)}
            />
          ) : null}
        </SlotTile>
        <span
          className={`min-w-0 text-xs wrap-break-word ${value ? 'text-content font-semibold' : 'text-content-subtle'}`}
        >
          {value ? value.label : placeholder}
        </span>
      </div>
      <Modal open={open} onClose={close} title={placeholder}>
        <SearchField value={search} onChange={setSearch} placeholder={labels.search} />
        {filtered.length ? (
          <GearGrid
            items={filtered.map((o) => ({
              key: o.slug,
              icon: o.icon,
              grade: o.grade,
              label: o.label,
              star: o.star,
              overlayIcon: o.overlayIcon,
              classType: gearClassOf(o, attackerCls),
              selected: o.slug === value?.slug,
            }))}
            onPick={(slug) => {
              onPick(slug);
              close();
            }}
          />
        ) : (
          <NoMatches label={labels.noMatches} />
        )}
      </Modal>
      {value && tiers && (
        <GameText
          text={tiers[tier] || labels.equipment.noPassive}
          className="text-content-muted text-[11px] leading-relaxed whitespace-pre-line"
        />
      )}
    </div>
  );
}

/** Grille de tuiles d'équipement d'une modale (tuile « comme partout » :
 *  cadre de grade + étoiles + icône d'effet + classe — façon pool). */
function GearGrid({
  items,
  onPick,
}: {
  items: {
    key: string;
    icon: string;
    grade: string;
    label: string;
    star?: number;
    overlayIcon?: string;
    classType?: string;
    selected?: boolean;
    /** Choix neutralisé (ex. duo de sets déjà complet). */
    disabled?: boolean;
  }[];
  onPick: (key: string) => void;
}) {
  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(4.5rem,1fr))] gap-1.5">
      {items.map((it) => (
        <button
          key={it.key}
          type="button"
          disabled={it.disabled}
          className="group flex flex-col items-center gap-1 not-disabled:cursor-pointer disabled:opacity-40"
          title={it.label}
          onClick={() => onPick(it.key)}
        >
          <span
            className={`group-hover:border-accent rounded-lg border transition ${
              it.selected ? 'border-accent' : 'border-transparent'
            }`}
          >
            {it.grade ? (
              <EquipmentIcon
                icon={it.icon}
                grade={it.grade}
                size={56}
                stars={it.star}
                overlayIcon={it.overlayIcon}
                classType={it.classType}
              />
            ) : (
              <img
                src={img.equipment(it.icon)}
                alt=""
                className="h-14 w-14"
                loading="lazy"
                width={56}
                height={56}
              />
            )}
          </span>
          <span className="text-content-muted group-hover:text-content w-full text-center text-[10px] leading-tight wrap-break-word">
            {it.label}
          </span>
        </button>
      ))}
    </div>
  );
}

/** Icône de classe d'une tuile d'arme/accessoire : restriction unique, ou la
 *  classe de l'ATTAQUANT quand la famille varie par classe (Briareos/Gorgon). */
function gearClassOf(o: DcGear, attackerCls: string): string | undefined {
  if (o.classLimits.length === 1) return o.classLimits[0];
  return o.classTiers ? attackerCls : undefined;
}

/** Un set n'est appariable que s'il a un bonus 2P (Revenge/Patience : 4P seul). */
const has2P = (s: DcSet) => s.p2.some(Boolean);
const has4P = (s: DcSet) => s.p4.some(Boolean);

/**
 * Case UNIQUE des sets, SANS modale : les icônes des sets de combat sont
 * toutes affichées — cliquer valide/retire un set, et ce qui n'est plus
 * combinable se grise. 4 pièces d'armure au total : un duo n'est possible
 * qu'entre sets à bonus 2P (2P+2P) ; un set 4P-only (Revenge, Patience)
 * occupe tout et reste seul — jamais 4P+2P ni 4P+4P (décision Sevih
 * 27/07/2026). Le bonus est DÉRIVÉ : duo → 2P chacun ; seul → 4P si le set en
 * a un, sinon son 2P.
 */
export function SetsSlot({
  sets,
  picks,
  onChange,
  labels,
}: {
  sets: DcSet[];
  picks: SetPick[];
  onChange: (picks: SetPick[]) => void;
  labels: DcLabels;
}) {
  const first = picks.length === 1 ? sets.find((s) => s.id === picks[0].setId) : undefined;
  const piecesOf = (view: DcSet) =>
    picks.length === 2 || !has4P(view) ? ('2P' as const) : ('4P' as const);
  const pickable = (s: DcSet) => {
    if (picks.length >= 2) return false;
    if (!first) return true;
    return has2P(first) && has2P(s);
  };
  const toggle = (id: string) => {
    const has = picks.some((p) => p.setId === id);
    const view = sets.find((s) => s.id === id);
    if (!has && (!view || !pickable(view))) return;
    onChange(has ? picks.filter((p) => p.setId !== id) : [...picks, { setId: id, tier: 0 }]);
  };
  return (
    <div className="border-line-subtle bg-surface-sunken/70 space-y-1.5 rounded-lg border p-2 sm:col-span-2">
      <div className="flex items-center gap-2">
        <Eyebrow>{labels.equipment.sets}</Eyebrow>
        <span className="flex-1" />
        {picks.length > 0 && (
          <button
            type="button"
            className="text-content-subtle hover:text-danger cursor-pointer text-xs"
            onClick={() => onChange([])}
            title={labels.clear}
          >
            ✕
          </button>
        )}
      </div>
      <div className="flex flex-wrap gap-1.5">
        {sets.map((s) => {
          const on = picks.some((p) => p.setId === s.id);
          return (
            <button
              key={s.id}
              type="button"
              disabled={!on && !pickable(s)}
              aria-pressed={on}
              title={s.label}
              onClick={() => toggle(s.id)}
              className={`grid h-11 w-11 place-items-center rounded-lg border transition not-disabled:cursor-pointer disabled:opacity-40 ${
                on
                  ? 'border-accent bg-accent/10'
                  : 'border-line-subtle bg-surface-raised/60 hover:border-accent'
              }`}
            >
              <img src={img.equipment(s.icon)} alt={s.label} className="h-8 w-8" loading="lazy" />
            </button>
          );
        })}
      </div>
      {picks.length > 0 && (
        // Un set par LIGNE (pas côte à côte) : les textes d'effet respirent.
        <div className="space-y-1.5">
          {picks.map((pick, i) => {
            const view = sets.find((s) => s.id === pick.setId);
            if (!view) return null;
            const p = piecesOf(view);
            const stateIdx = pick.tier >= 4 ? 1 : 0;
            const effect =
              (p === '2P' ? view.p2[stateIdx] : view.p4[stateIdx]) ?? labels.equipment.noPassive;
            return (
              <div key={pick.setId} className="space-y-1">
                <div className="flex min-w-0 items-center gap-2">
                  <span className="text-content min-w-0 flex-1 text-xs font-semibold wrap-break-word">
                    {view.label}
                  </span>
                  <span className="border-line-subtle text-accent rounded border px-1.5 py-0.5 font-mono text-[10px] font-bold">
                    {p === '2P' ? labels.equipment.p2 : labels.equipment.p4}
                  </span>
                  <Stepper
                    value={pick.tier}
                    min={0}
                    max={4}
                    onChange={(v) =>
                      onChange(picks.map((p2, j) => (j === i ? { ...p2, tier: v } : p2)))
                    }
                    format={(v) => `T${v}`}
                  />
                </div>
                <GameText
                  text={effect}
                  className="text-content-muted text-[11px] leading-relaxed"
                />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/**
 * Browser VISUEL de l'histoire (Story / Origin Story — demande Sevih
 * 06/08/2026) : toggle Normal/Hard (rendu ROUGEÂTRE en hard), puis
 * saisons → épisodes (portrait du boss de l'épisode) → stages à combat
 * (accordéon des N vagues — TOUS les monstres d'une vague sont ciblables,
 * pas seulement le boss). Les stages sans combat n'existent pas dans la
 * donnée (aucun spawn) : rien à masquer.
 */
function StoryTargetBrowser({
  entries,
  labels,
  onPick,
  season,
  episode,
  onSeason,
  onEpisode,
}: {
  /** Entrées de la famille (story OU origin), les deux difficultés mêlées. */
  entries: DcTarget[];
  labels: DcLabels;
  onPick: (id: string) => void;
  /** Navigation saison/épisode CONTRÔLÉE par le picker : c'est son breadcrumb
   *  qui remonte la hiérarchie, sur tous les modes (Sevih 17/08/2026). */
  season: number | null;
  episode: number | null;
  onSeason: (n: number | null) => void;
  onEpisode: (n: number | null) => void;
}) {
  const [hard, setHard] = useState(false);
  /** Stage déplié (id de donjon) — accordéon des vagues. */
  const [openStage, setOpenStage] = useState<string | null>(null);

  // Difficulté courante : Normal et Hard sont des DONJONS distincts (ids
  // disjoints), la sélection saison/épisode survit au toggle (mêmes numéros
  // des deux côtés), le stage déplié non.
  const pool = entries.filter((tg) => tg.story?.hard === hard);
  const seasons = [...new Set(pool.map((tg) => tg.story!.season))].sort((a, b) => a - b);
  const inSeason = season != null ? pool.filter((tg) => tg.story!.season === season) : [];
  const inEpisode = episode != null ? inSeason.filter((tg) => tg.story!.episode === episode) : [];

  const dungeonIdOf = (tg: DcTarget) => tg.id.slice(0, tg.id.lastIndexOf(':'));
  /** Boss « d'affiche » d'un lot d'entrées : le boss du stage le plus haut. */
  const posterOf = (list: DcTarget[]): DcTarget | undefined => {
    let best: DcTarget | undefined;
    for (const tg of list) {
      if (tg.story!.role !== 'boss') continue;
      if (!best || (tg.story!.stage ?? 0) >= (best.story!.stage ?? 0)) best = tg;
    }
    return best ?? list[list.length - 1];
  };

  const episodes = season != null ? [...new Set(inSeason.map((tg) => tg.story!.episode))] : [];
  episodes.sort((a, b) => a - b);

  /** Stages de l'épisode, dans l'ordre du jeu (l'intro sans numéro ouvre). */
  const stages: { id: string; label: string; poster: DcTarget | undefined; list: DcTarget[] }[] =
    [];
  if (episode != null) {
    const byStage = new Map<string, DcTarget[]>();
    for (const tg of inEpisode) {
      const did = dungeonIdOf(tg);
      const list = byStage.get(did);
      if (list) list.push(tg);
      else byStage.set(did, [tg]);
    }
    for (const [did, list] of byStage)
      stages.push({ id: did, label: list[0].label, poster: posterOf(list), list });
    stages.sort((a, b) => (a.list[0].story!.stage ?? 0) - (b.list[0].story!.stage ?? 0));
  }

  // Rougeâtre en Hard (demande Sevih) : la teinte porte sur le CONTENEUR et
  // les cartes — tokens danger du thème, jamais de rouge Tailwind brut.
  const cardTint = hard
    ? 'bg-danger/10 hover:bg-danger/20'
    : 'bg-surface-sunken/50 hover:bg-surface-raised/80';
  const CARD = `flex w-full cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm transition ${cardTint}`;

  return (
    <div
      className={`space-y-2 rounded-xl p-2 ring-1 transition ${
        hard ? 'bg-danger/5 ring-danger/25' : 'ring-line-subtle'
      }`}
    >
      <div className="border-line-subtle bg-surface-sunken/70 inline-flex overflow-hidden rounded-lg border text-xs">
        <button
          type="button"
          onClick={() => {
            setHard(false);
            setOpenStage(null);
          }}
          className={`cursor-pointer px-3 py-1.5 font-semibold transition ${
            hard ? 'text-content-muted hover:bg-surface-raised/60' : 'bg-accent text-accent-fg'
          }`}
        >
          {labels.target.diffNormal}
        </button>
        <button
          type="button"
          onClick={() => {
            setHard(true);
            setOpenStage(null);
          }}
          className={`cursor-pointer px-3 py-1.5 font-semibold transition ${
            hard ? 'bg-danger text-on-vivid' : 'text-content-muted hover:bg-surface-raised/60'
          }`}
        >
          {labels.target.diffHard}
        </button>
      </div>

      {season == null ? (
        <div className="grid gap-1.5 sm:grid-cols-2">
          {seasons.map((n) => {
            const eps = new Set(
              pool.filter((tg) => tg.story!.season === n).map((tg) => tg.story!.episode),
            );
            return (
              <button key={n} type="button" className={CARD} onClick={() => onSeason(n)}>
                <span className="min-w-0 flex-col">
                  <span className="font-semibold">
                    {labels.target.seasonTpl.replace('{n}', String(n))}
                  </span>
                  <span className="text-content-subtle block text-[10px]">
                    {eps.size} × {labels.target.episode}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      ) : episode == null ? (
        <div className="grid gap-1.5 sm:grid-cols-2">
          {episodes.map((n) => {
            const list = inSeason.filter((tg) => tg.story!.episode === n);
            const poster = posterOf(list);
            return (
              <button key={n} type="button" className={CARD} onClick={() => onEpisode(n)}>
                {poster && <MonsterPortrait tg={poster} className="h-12 w-12" />}
                <span className="min-w-0 flex-col">
                  <span className="text-content-subtle block text-[10px] font-bold tracking-[0.14em] uppercase">
                    {labels.target.episode} {n}
                  </span>
                  <span className="truncate font-semibold">{list[0].story!.episodeName}</span>
                </span>
              </button>
            );
          })}
        </div>
      ) : (
        <div className="space-y-1">
          {stages.map((st) => (
            <div key={st.id}>
              <button
                type="button"
                className={CARD}
                onClick={() => setOpenStage(openStage === st.id ? null : st.id)}
              >
                {st.poster && <MonsterPortrait tg={st.poster} className="h-10 w-10" />}
                <span className="min-w-0 flex-1 truncate font-semibold">{st.label}</span>
                <span className="text-content-subtle text-[10px]" aria-hidden>
                  {openStage === st.id ? '▾' : '▸'}
                </span>
              </button>
              {openStage === st.id && (
                <div className="border-line-subtle ml-3 space-y-1.5 border-l py-1.5 pl-2">
                  {[...new Set(st.list.flatMap((tg) => tg.story!.waves.map((w) => w.wave)))]
                    .sort((a, b) => a - b)
                    .map((w) => (
                      <div key={w}>
                        <Eyebrow>{labels.target.waveTpl.replace('{n}', String(w))}</Eyebrow>
                        <div className="grid gap-0.5 sm:grid-cols-2">
                          {st.list
                            .map((tg) => ({
                              tg,
                              occ: tg.story!.waves.find((x) => x.wave === w),
                            }))
                            .filter(({ occ }) => occ)
                            .map(({ tg, occ }) => (
                              <button
                                key={tg.id}
                                type="button"
                                className={CARD}
                                onClick={() => onPick(tg.id)}
                              >
                                <MonsterPortrait tg={tg} className="h-12 w-12" />
                                <span className="min-w-0 flex-1 flex-col">
                                  <span className="flex items-center gap-1.5">
                                    <span className="truncate font-semibold">{tg.name}</span>
                                    {/* Exemplaires multiples dans la vague
                                        (story 1-1 : 2 × le même loup). */}
                                    {(occ!.count ?? 1) > 1 && (
                                      <span className="text-content-muted shrink-0 text-[11px] font-bold">
                                        ×{occ!.count}
                                      </span>
                                    )}
                                  </span>
                                  <span className="text-content-subtle block text-[10px]">
                                    {labels.target.lv}
                                    {occ!.level}
                                  </span>
                                </span>
                              </button>
                            ))}
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * Picker de cible en MODALE : mode → contenu. L'HISTOIRE (Story / Origin
 * Story) a son picker VISUEL (`StoryTargetBrowser` — demande Sevih
 * 06/08/2026) : ses 4 modes se replient en 2 entrées de famille, le toggle
 * Normal/Hard vit dans le browser. Les autres modes gardent la cascade de
 * selects portée par la donnée (`path` : ligue de world boss, phase de guild
 * raid, élément…), rendue en CARTES niveau par niveau — même grammaire que
 * les saisons du browser story, plus aucun select (Sevih 17/08/2026). La
 * recherche traverse la sélection courante (en famille story, elle bascule
 * sur la liste à plat). À l'OUVERTURE (aucun mode, pas de recherche), pas de
 * liste « All » : une carte par mode avec son compte de monstres — on choisit
 * toujours un mode pour dégrossir, la liste plate intégrale ne servait jamais ;
 * « tout » reste l'assiette de la recherche racine.
 */
const PICKER_CARD =
  'bg-surface-sunken/50 hover:bg-surface-raised/80 flex w-full cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm transition';
export function TargetPicker({
  targets,
  modes,
  value,
  level,
  onPick,
  onClear,
  labels,
}: {
  targets: DcTarget[];
  modes: string[];
  value: DcTarget | undefined;
  /** Niveau du spawn RÉSOLU — affiché à droite du nom (Sevih 27/07/2026). */
  level?: number;
  onPick: (id: string) => void;
  onClear: () => void;
  labels: DcLabels;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [mode, setMode] = useState('');
  const [path, setPath] = useState<string[]>([]);
  // Navigation saison/épisode du browser story — remontée ICI pour que le
  // breadcrumb couvre TOUS les modes (Sevih 17/08/2026).
  const [storySeason, setStorySeason] = useState<number | null>(null);
  const [storyEpisode, setStoryEpisode] = useState<number | null>(null);

  // Les 4 modes story se REPLIENT en 2 familles (le toggle Normal/Hard vit
  // dans le browser visuel) : leurs libellés de mode sortent de la liste,
  // remplacés par une entrée par famille présente. Valeurs préfixées
  // (`fam:`) — jamais confondues avec un libellé localisé.
  const storyModeLabels = new Set<string>();
  const famPresent = new Set<'story' | 'origin'>();
  for (const tg of targets)
    if (tg.story) {
      storyModeLabels.add(tg.mode);
      famPresent.add(tg.story.family);
    }
  const modeOptions: { value: string; label: string }[] = [
    ...(famPresent.has('story') ? [{ value: 'fam:story', label: labels.target.familyStory }] : []),
    ...(famPresent.has('origin')
      ? [{ value: 'fam:origin', label: labels.target.familyOrigin }]
      : []),
    ...modes.filter((m) => !storyModeLabels.has(m)).map((m) => ({ value: m, label: m })),
  ];
  const fam =
    mode === 'fam:story' ? ('story' as const) : mode === 'fam:origin' ? ('origin' as const) : null;
  // Compte d'entrées par valeur de mode (les 4 modes story comptent dans leur
  // famille, une LIGNE de guild raid compte pour 1) — cartes de l'accueil.
  const countOf = new Map<string, number>();
  {
    const linesSeen = new Set<string>();
    for (const tg of targets) {
      if (tg.line) {
        if (linesSeen.has(tg.line)) continue;
        linesSeen.add(tg.line);
      }
      const key = tg.story ? `fam:${tg.story.family}` : tg.mode;
      countOf.set(key, (countOf.get(key) ?? 0) + 1);
    }
  }

  const inMode = useMemo(
    () =>
      fam
        ? targets.filter((tg) => tg.story?.family === fam)
        : mode
          ? targets.filter((tg) => tg.mode === mode)
          : targets,
    [targets, mode, fam],
  );
  // Niveau de cascade COURANT (profondeur = choix déjà faits) : des CARTES,
  // comme les saisons du browser story — plus de selects (Sevih 17/08/2026).
  // Aucun mode ne mélange entrées avec et sans chemin (vérifié sur la donnée) :
  // exiger un choix par niveau ne rend rien inatteignable. (Jamais en famille
  // story : la navigation est le browser visuel.)
  const levelOpts: { value: string; count: number }[] = [];
  if (mode && !fam) {
    const seen = new Map<string, { value: string; count: number }>();
    const linesSeen = new Set<string>();
    for (const tg of inMode) {
      if (!path.every((p, i) => tg.path?.[i] === p)) continue;
      const v = tg.path?.[path.length];
      if (!v) continue;
      // Une ligne de guild raid = 1 carte → compte pour 1.
      if (tg.line) {
        if (linesSeen.has(tg.line)) continue;
        linesSeen.add(tg.line);
      }
      const hit = seen.get(v);
      if (hit) hit.count++;
      else {
        const opt = { value: v, count: 1 };
        seen.set(v, opt);
        levelOpts.push(opt);
      }
    }
  }
  const q = search.trim().toLowerCase();
  const pool = inMode.filter((tg) => path.every((p, i) => tg.path?.[i] === p));
  const filtered = q
    ? pool.filter((o) => o.label.toLowerCase().includes(q) || o.name.toLowerCase().includes(q))
    : pool;
  // Une LIGNE de guild raid = une seule carte (la première qui matche — en
  // recherche, celle dont le stage a matché) ; le sélecteur de stage du
  // panneau cible fait le reste.
  const display: DcTarget[] = [];
  {
    const linesSeen = new Set<string>();
    for (const tg of filtered) {
      if (tg.line) {
        if (linesSeen.has(tg.line)) continue;
        linesSeen.add(tg.line);
      }
      display.push(tg);
    }
  }
  const close = () => {
    setOpen(false);
    setSearch('');
  };
  return (
    <>
      <div className="flex min-w-0 items-center gap-2">
        <SlotTile
          large
          onClick={() => setOpen(true)}
          onClear={value ? onClear : undefined}
          clearTitle={labels.clear}
          title={value?.name ?? labels.select}
        >
          {value ? <MonsterPortrait tg={value} level={level} className="h-full w-full" /> : null}
        </SlotTile>
        {value ? (
          <span className="min-w-0 flex-1">
            <span className="text-content block text-sm font-semibold wrap-break-word">
              {value.name}
            </span>
            <span className="text-content-subtle block text-[11px] wrap-break-word">
              {[...(value.path ?? []), value.label].join(' · ')}
            </span>
          </span>
        ) : (
          <span className="text-content-subtle min-w-0 text-sm wrap-break-word">
            {labels.select}
          </span>
        )}
      </div>
      <Modal open={open} onClose={close} title={labels.panels.target}>
        <SearchField value={search} onChange={setSearch} placeholder={labels.search} />
        {/* BREADCRUMB (Sevih 17/08/2026) : « ← Mode / Niveau 1 / … » sur TOUS
            les modes — en famille story les segments sont la saison et
            l'épisode (leur navigation vit ici, le browser est contrôlé). La
            flèche remonte d'un niveau (puis au sommaire des modes), chaque
            segment ANCÊTRE est cliquable et saute à son niveau, le segment
            courant est inerte. */}
        {mode &&
          (() => {
            const crumbs: { label: string; jump: () => void }[] = [
              {
                label: modeOptions.find((o) => o.value === mode)?.label ?? mode,
                jump: fam
                  ? () => {
                      setStorySeason(null);
                      setStoryEpisode(null);
                    }
                  : () => setPath([]),
              },
              ...(fam
                ? [
                    ...(storySeason != null
                      ? [
                          {
                            label: labels.target.seasonTpl.replace('{n}', String(storySeason)),
                            jump: () => setStoryEpisode(null),
                          },
                        ]
                      : []),
                    ...(storyEpisode != null
                      ? [
                          {
                            label: `${labels.target.episode} ${storyEpisode}`,
                            jump: () => {},
                          },
                        ]
                      : []),
                  ]
                : path.map((p, i) => ({ label: p, jump: () => setPath(path.slice(0, i + 1)) }))),
            ];
            const up = () => {
              if (fam) {
                if (storyEpisode != null) setStoryEpisode(null);
                else if (storySeason != null) setStorySeason(null);
                else setMode('');
              } else if (path.length) {
                setPath(path.slice(0, -1));
              } else {
                setMode('');
              }
            };
            return (
              <div className="text-content-muted flex flex-wrap items-center gap-1 text-xs">
                <button
                  type="button"
                  onClick={up}
                  className="hover:text-content cursor-pointer transition"
                  title={labels.target.back}
                >
                  <span aria-hidden>←</span>
                </button>
                {crumbs.map((c, i) =>
                  i < crumbs.length - 1 ? (
                    <span key={i} className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={c.jump}
                        className="hover:text-content cursor-pointer transition"
                      >
                        {c.label}
                      </button>
                      <span aria-hidden>/</span>
                    </span>
                  ) : (
                    <span key={i} className="text-content font-semibold">
                      {c.label}
                    </span>
                  ),
                )}
              </div>
            );
          })()}
        {fam && !q ? (
          <StoryTargetBrowser
            entries={inMode}
            labels={labels}
            onPick={(id) => {
              onPick(id);
              close();
            }}
            season={storySeason}
            episode={storyEpisode}
            onSeason={setStorySeason}
            onEpisode={setStoryEpisode}
          />
        ) : !mode && !q ? (
          <div className="grid gap-1.5 sm:grid-cols-2">
            {modeOptions.map((m) => (
              <button
                key={m.value}
                type="button"
                className={PICKER_CARD}
                onClick={() => {
                  setMode(m.value);
                  setPath([]);
                  setStorySeason(null);
                  setStoryEpisode(null);
                }}
              >
                <span className="min-w-0 flex-col">
                  <span className="font-semibold">{m.label}</span>
                  <span className="text-content-subtle block text-[10px]">
                    {labels.target.monstersTpl.replace('{n}', String(countOf.get(m.value) ?? 0))}
                  </span>
                </span>
              </button>
            ))}
          </div>
        ) : levelOpts.length && !q ? (
          <div className="grid gap-1.5 sm:grid-cols-2">
            {levelOpts.map((o) => (
              <button
                key={o.value}
                type="button"
                className={PICKER_CARD}
                onClick={() => setPath([...path, o.value])}
              >
                <span className="min-w-0 flex-col">
                  <span className="font-semibold">{o.value}</span>
                  <span className="text-content-subtle block text-[10px]">
                    {labels.target.monstersTpl.replace('{n}', String(o.count))}
                  </span>
                </span>
              </button>
            ))}
          </div>
        ) : display.length ? (
          <div className="grid gap-0.5 sm:grid-cols-2">
            {display.map((o) => (
              <button
                key={o.id}
                type="button"
                className={ROW_CLASS}
                onClick={() => {
                  onPick(o.id);
                  close();
                }}
              >
                <MonsterPortrait tg={o} className="h-10 w-10" />
                <span className="min-w-0 flex-col">
                  <span className="truncate font-semibold">{o.name}</span>
                  {/* Sous-titre SANS ce que le breadcrumb dit déjà (mode et
                      niveaux traversés) : il ne reste que les niveaux non
                      choisis (recherche) et le stage (Sevih 17/08/2026) — une
                      LIGNE repliée n'affiche pas le stage de sa carte témoin,
                      le sélecteur du panneau le choisit. */}
                  <span className="text-content-subtle block truncate text-[10px]">
                    {[
                      mode ? null : o.mode,
                      ...(o.path ?? []).slice(path.length),
                      o.line ? null : o.label,
                    ]
                      .filter(Boolean)
                      .join(' · ')}
                  </span>
                </span>
              </button>
            ))}
          </div>
        ) : (
          <NoMatches label={labels.noMatches} />
        )}
      </Modal>
    </>
  );
}
