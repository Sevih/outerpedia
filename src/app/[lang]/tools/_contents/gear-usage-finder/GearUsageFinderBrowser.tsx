'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import type { Route } from 'next';
import { CharacterPortrait } from '@/components/character/CharacterPortrait';
import { EquipmentIcon } from '@/components/equipment/EquipmentIcon';
import { FilterPill } from '@/components/character/filters/FilterPill';
import { ClassIconPill } from '@/components/character/filters/FilterAtoms';
import type { RawFinderBuild } from './finder';

const EQUIP_TYPES = ['weapon', 'amulet', 'set'] as const;
export type EquipType = (typeof EQUIP_TYPES)[number];

type Mode = 'reco' | 'free';
const MODES: Mode[] = ['reco', 'free'];

const CLASSES = ['striker', 'defender', 'ranger', 'healer', 'mage'] as const;

/** Ordres canoniques d'affichage des mains (parité V2). */
const WEAPON_MAIN_ORDER = ['ATK%', 'HP%', 'DEF%'];
const AMULET_MAIN_ORDER = [
  'PEN%',
  'SPD',
  'ATK%',
  'HP%',
  'DEF%',
  'EFF',
  'DMG RED%',
  'CHC',
  'CHD',
  'DMG UP%',
  'RES',
  'CDMG RED%',
];
/** Substats proposables (les clés des priorités curées). */
const SUBSTATS = [
  'ATK',
  'HP',
  'DEF',
  'SPD',
  'CHC',
  'CHD',
  'EFF',
  'RES',
  'DMG UP%',
  'DMG RED%',
  'CDMG RED%',
];

/** Pièce sélectionnable (nom localisé côté serveur). */
export interface FinderGearItem {
  key: string;
  name: string;
  icon: string;
  grade: string;
  star?: number;
  overlayIcon?: string;
  classType?: string;
  /** Restrictions de classe (slugs) — vide = toutes classes. */
  classLimits: string[];
  /** Main stats possibles (mode libre). */
  mains: string[];
}

/** Perso résolu (nom localisé côté serveur) des cartes de résultat. */
export interface FinderCharacter {
  id: string;
  slug: string;
  name: string;
  class: string;
}

export interface FinderLabels {
  /** Libellé + description de chaque mode. */
  modes: Record<Mode, { label: string; desc: string }>;
  stepType: string;
  stepClass: string;
  stepMain: string;
  stepSubs: string;
  stepSet: string;
  /** Libellés des types d'équipement. */
  types: Record<EquipType, string>;
  matches: string;
  noUsers: string;
}

interface MatchResult {
  charId: string;
  buildCount: number;
  score: number;
  mainStatMatch: boolean;
  matchedSubCount: number;
}

/** En-tête d'étape centré (petit label majuscule) + contenu. */
function Step({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-content-muted mb-2 text-center text-xs tracking-wide uppercase">{label}</p>
      {children}
    </div>
  );
}

/** Carte de pièce dans la grille de sélection (tuile + nom). */
function GearCard({ item }: { item: FinderGearItem }) {
  return (
    <span className="flex items-center gap-2">
      <EquipmentIcon
        icon={item.icon}
        grade={item.grade}
        alt={item.name}
        size={40}
        stars={item.star}
        overlayIcon={item.overlayIcon}
        classType={item.classType}
      />
      <span className="text-content min-w-0 flex-1 truncate text-left text-sm">{item.name}</span>
    </span>
  );
}

/**
 * Gear Usage Finder (portage V2) : « j'ai loot cette pièce, qui peut la
 * jouer ? ». Deux modes — Recommandé (ne propose que pièces/mains présentes
 * dans les builds curés, main stat stricte) et Libre (tout le catalogue, les
 * résultats sont SCORÉS : main qui matche = 4 pts, chaque substat = 1 pt).
 * Parcours en étapes : type → classe → pièce → main → substats ; les persos
 * qui matchent sortent en cartes triées par score. État local pur (parité V2,
 * un résultat se consulte, il ne se partage pas filtré).
 */
export function GearUsageFinderBrowser({
  weapons,
  amulets,
  sets,
  builds,
  characters,
  labels,
}: {
  weapons: FinderGearItem[];
  amulets: FinderGearItem[];
  sets: FinderGearItem[];
  builds: RawFinderBuild[];
  characters: FinderCharacter[];
  labels: FinderLabels;
}) {
  const [mode, setMode] = useState<Mode>('reco');
  const [equipType, setEquipType] = useState<EquipType>('weapon');
  const [classFilter, setClassFilter] = useState<string>(CLASSES[0]);
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [mainStat, setMainStat] = useState<string | null>(null);
  const [selectedSubs, setSelectedSubs] = useState<string[]>([]);

  const charById = useMemo(() => new Map(characters.map((c) => [c.id, c])), [characters]);

  // Toute sélection amont invalide l'aval (pièce → main → subs).
  const resetSelection = () => {
    setSelectedKey(null);
    setMainStat(null);
    setSelectedSubs([]);
  };
  const handleGearSelect = (key: string | null) => {
    setSelectedKey(key);
    setMainStat(null);
    setSelectedSubs([]);
  };
  const toggleSub = (sub: string) =>
    setSelectedSubs((prev) =>
      prev.includes(sub) ? prev.filter((s) => s !== sub) : [...prev, sub],
    );

  // Clés (familles/sets) présentes dans AU MOINS un build — filtre du mode reco.
  const usedKeys = useMemo(() => {
    const keys = new Set<string>();
    for (const b of builds) {
      for (const k of Object.keys(b.weapons)) keys.add(k);
      for (const k of Object.keys(b.amulets)) keys.add(k);
      for (const s of b.sets) keys.add(s);
    }
    return keys;
  }, [builds]);

  // Grille de pièces : classe compatible (restriction vide = libre) ; en mode
  // reco, seulement les pièces réellement recommandées quelque part.
  const filteredGear = useMemo(() => {
    const source = equipType === 'weapon' ? weapons : equipType === 'amulet' ? amulets : [];
    return source.filter(
      (g) =>
        (g.classLimits.length === 0 || g.classLimits.includes(classFilter)) &&
        (mode === 'free' || usedKeys.has(g.key)),
    );
  }, [equipType, weapons, amulets, classFilter, usedKeys, mode]);

  const filteredSets = useMemo(
    () => sets.filter((s) => mode === 'free' || usedKeys.has(s.key)),
    [sets, usedKeys, mode],
  );

  // Mains proposées pour la pièce choisie : le pool de la famille (libre) ou
  // les mains réellement recommandées (reco), dans l'ordre canonique.
  const availableMainStats = useMemo(() => {
    if (!selectedKey || equipType === 'set') return [];
    const order = equipType === 'weapon' ? WEAPON_MAIN_ORDER : AMULET_MAIN_ORDER;
    const rank = (s: string) => {
      const i = order.indexOf(s);
      return i === -1 ? order.length : i;
    };
    let stats: string[];
    if (mode === 'free') {
      const item = filteredGear.find((g) => g.key === selectedKey);
      stats = item?.mains ?? [];
    } else {
      const field = equipType === 'weapon' ? 'weapons' : 'amulets';
      stats = [...new Set(builds.flatMap((b) => b[field][selectedKey] ?? []))];
    }
    return [...stats].sort((a, b) => rank(a) - rank(b));
  }, [selectedKey, equipType, builds, mode, filteredGear]);

  // Matching : score = main qui matche (4 pts) + substats communes (1 pt
  // chacune) ; par perso on garde son MEILLEUR build et on compte les builds.
  const results = useMemo((): MatchResult[] => {
    const byChar = new Map<string, MatchResult>();
    for (const build of builds) {
      const char = charById.get(build.charId);
      if (!char || !selectedKey) continue;

      let mainStatMatch = false;
      if (equipType === 'set') {
        if (!build.sets.includes(selectedKey)) continue;
      } else {
        if (char.class !== classFilter) continue;
        const mains = build[equipType === 'weapon' ? 'weapons' : 'amulets'][selectedKey];
        if (!mains) continue;
        if (mode === 'reco') {
          // Strict : la main choisie doit être une main recommandée du build.
          if (!mainStat || !mains.includes(mainStat)) continue;
          mainStatMatch = true;
        } else if (mainStat) {
          mainStatMatch = mains.includes(mainStat);
        }
      }

      const matchedSubCount = selectedSubs.filter((s) => build.subs.includes(s)).length;
      const score = (mainStatMatch ? 4 : 0) + matchedSubCount;

      const prev = byChar.get(build.charId);
      if (!prev || score > prev.score) {
        byChar.set(build.charId, {
          charId: build.charId,
          buildCount: (prev?.buildCount ?? 0) + 1,
          score,
          mainStatMatch,
          matchedSubCount,
        });
      } else {
        prev.buildCount++;
      }
    }
    return [...byChar.values()].sort((a, b) => b.score - a.score);
  }, [builds, charById, equipType, selectedKey, mainStat, classFilter, selectedSubs, mode]);

  // Reco : arme/amulette exige pièce + main ; libre : la pièce suffit.
  const hasSelection =
    mode === 'reco' && equipType !== 'set'
      ? selectedKey !== null && mainStat !== null
      : selectedKey !== null;
  const showSubstats =
    mode === 'reco' && equipType !== 'set' ? mainStat !== null : selectedKey !== null;
  const showMainLine = mode === 'free' && mainStat && equipType !== 'set';
  const maxScore = (mainStat && equipType !== 'set' ? 4 : 0) + selectedSubs.length;

  const gearGrid = (items: FinderGearItem[]) => (
    <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3">
      {items.map((g) => (
        <button
          key={g.key}
          type="button"
          onClick={() => handleGearSelect(selectedKey === g.key ? null : g.key)}
          className={`cursor-pointer rounded-lg p-1.5 transition ${
            selectedKey === g.key
              ? 'bg-sky-500/20 ring-1 ring-sky-500'
              : 'hover:bg-surface-raised/80'
          }`}
        >
          <GearCard item={g} />
        </button>
      ))}
    </div>
  );

  const substatsStep = (
    <Step label={labels.stepSubs}>
      <div className="flex flex-wrap justify-center gap-2">
        {SUBSTATS.map((sub) => (
          <FilterPill
            key={sub}
            active={selectedSubs.includes(sub)}
            onClick={() => toggleSub(sub)}
            className="h-8 px-3"
          >
            {sub}
          </FilterPill>
        ))}
      </div>
    </Step>
  );

  return (
    <div className="mx-auto max-w-250 space-y-5">
      {/* Sélecteur de mode */}
      <div className="space-y-2">
        <div className="flex justify-center gap-2">
          {MODES.map((m) => (
            <FilterPill
              key={m}
              active={mode === m}
              onClick={() => {
                setMode(m);
                resetSelection();
              }}
              className="h-9 px-4"
            >
              {labels.modes[m].label}
            </FilterPill>
          ))}
        </div>
        <p className="text-content-muted text-center text-xs">{labels.modes[mode].desc}</p>
      </div>

      {/* Type d'équipement */}
      <Step label={labels.stepType}>
        <div className="flex flex-wrap justify-center gap-2">
          {EQUIP_TYPES.map((type) => (
            <FilterPill
              key={type}
              active={equipType === type}
              onClick={() => {
                setEquipType(type);
                setClassFilter(CLASSES[0]);
                resetSelection();
              }}
              className="h-9 px-4"
            >
              {labels.types[type]}
            </FilterPill>
          ))}
        </div>
      </Step>

      {/* ── Parcours arme / amulette ── */}
      {equipType !== 'set' && (
        <>
          <Step label={labels.stepClass}>
            <div className="flex flex-wrap justify-center gap-2">
              {CLASSES.map((cls) => (
                <ClassIconPill
                  key={cls}
                  classType={cls}
                  active={classFilter === cls}
                  onClick={() => {
                    setClassFilter(cls);
                    resetSelection();
                  }}
                />
              ))}
            </div>
          </Step>

          <Step label={labels.types[equipType]}>{gearGrid(filteredGear)}</Step>

          {selectedKey && availableMainStats.length > 0 && (
            <Step label={labels.stepMain}>
              <div className="flex flex-wrap justify-center gap-2">
                {availableMainStats.map((stat) => (
                  <FilterPill
                    key={stat}
                    active={mainStat === stat}
                    onClick={() => {
                      setMainStat(mainStat === stat ? null : stat);
                    }}
                    className="h-8 px-3"
                  >
                    {stat}
                  </FilterPill>
                ))}
              </div>
            </Step>
          )}

          {showSubstats && substatsStep}
        </>
      )}

      {/* ── Parcours set ── */}
      {equipType === 'set' && (
        <>
          <Step label={labels.stepSet}>{gearGrid(filteredSets)}</Step>
          {selectedKey && substatsStep}
        </>
      )}

      {/* ── Résultats ── */}
      {hasSelection && (
        <div className="mt-2 space-y-3">
          <p className="text-content-muted text-center text-sm">
            {results.length > 0 ? `${results.length} ${labels.matches}` : labels.noUsers}
          </p>

          {results.length > 0 && (
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
              {results.map((r) => {
                const char = charById.get(r.charId);
                if (!char) return null;
                return (
                  <Link
                    key={r.charId}
                    href={`/characters/${char.slug}` as Route}
                    className="border-line-subtle bg-surface-raised/40 hover:bg-surface-raised/80 relative flex items-center gap-3 rounded-lg border p-2 transition"
                  >
                    {maxScore > 0 && (
                      <span
                        className={`absolute top-1.5 right-2 text-xs font-medium ${
                          r.score === maxScore ? 'text-emerald-400' : 'text-content-muted'
                        }`}
                      >
                        {r.score}/{maxScore}
                      </span>
                    )}
                    {/* Largeur fixe : le span racine du portrait est en w-full. */}
                    <span className="w-12 shrink-0">
                      <CharacterPortrait id={char.id} name={char.name} size={48} showName={false} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="text-content block truncate text-sm font-medium">
                        {char.name}
                      </span>
                      {showMainLine && r.mainStatMatch && (
                        <span className="block text-xs text-emerald-400">{mainStat} ✓</span>
                      )}
                      {selectedSubs.length > 0 && (
                        <span className="text-content-muted block text-xs">
                          Subs:{' '}
                          <span
                            className={
                              r.matchedSubCount === selectedSubs.length
                                ? 'text-emerald-400'
                                : 'text-content'
                            }
                          >
                            {r.matchedSubCount}/{selectedSubs.length}
                          </span>
                        </span>
                      )}
                      {r.buildCount > 1 && (
                        <span className="text-content-subtle block text-[10px]">
                          {r.buildCount} builds
                        </span>
                      )}
                    </span>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
