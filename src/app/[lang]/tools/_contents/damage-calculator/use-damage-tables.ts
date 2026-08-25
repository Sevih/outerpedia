'use client';

/**
 * Tables damage du client (~11 Mo de JSON, import dynamique — rien dans le
 * bundle initial du visiteur public, un seul chargement par session) +
 * resolvers LOCAUX du pont z → moteur (preset, gear, main de talisman) — le
 * même contrat que les resolvers node de fixtures.test.ts. Extrait du
 * composant principal (découpage du 25/08/2026 — déplacement mécanique ;
 * seule adaptation : `savedScns.length` devient le paramètre `savedScnsLen`).
 */
import { useEffect, useRef, useState } from 'react';
import { type DamageData } from '@/lib/damage/inputs';
import type { Props } from './contracts';

export function useDamageTables({
  attackerId,
  devMode,
  savedScnsLen,
  chars,
  weapons,
  amulets,
  talismans,
  talismanMains,
  targets,
}: Pick<Props, 'chars' | 'weapons' | 'amulets' | 'talismans' | 'talismanMains' | 'targets'> & {
  attackerId: string | null;
  devMode: boolean;
  /** Nombre de scénarios sauvés du harnais — leur Δ attend les tables. */
  savedScnsLen: number;
}) {
  const [dmgData, setDmgData] = useState<DamageData | null>(null);
  const [dmgErr, setDmgErr] = useState<string | null>(null);
  const dmgLoading = useRef(false);
  useEffect(() => {
    const scnsWaiting = devMode && savedScnsLen > 0;
    if ((!attackerId && !scnsWaiting) || dmgData || dmgErr || dmgLoading.current) return;
    dmgLoading.current = true;
    void Promise.all([
      import('@data/generated/damage/characters.json'),
      import('@data/generated/damage/growth.json'),
      import('@data/generated/damage/buffs.json'),
      import('@data/generated/damage/targets.json'),
      import('@data/generated/damage/equipment.json'),
    ])
      .then(([c, g, b, t, q]) => {
        setDmgData({
          characters: c.default,
          growth: g.default,
          buffs: b.default,
          targets: t.default,
          equipment: q.default,
        } as unknown as DamageData);
      })
      .catch((e: unknown) => setDmgErr(e instanceof Error ? e.message : String(e)));
    // `savedScnsLen` : les scénarios arrivent APRÈS montage (hydratation
    // localStorage de useStoredState) — l'effet doit re-tirer à ce moment-là.
    // `devMode` aussi : `?dev=1` est lu dans un effet, après le premier rendu.
  }, [attackerId, dmgData, dmgErr, devMode, savedScnsLen]);

  // Cible preset → stats effectives au spawn — partagé entre le rapport
  // public et le harnais (même closure, mêmes stats que l'affichage).
  const resolvePresetLocal = (ti: string, si: number) => {
    const tg = targets.find((x) => x.id === ti);
    const sp = tg?.spawns[Math.min(si, (tg?.spawns.length ?? 1) - 1)];
    return tg && sp
      ? {
          element: tg.element,
          stats: sp.stats,
          mode: tg.modeSlug,
          // `id` = `${encounterId}:${bossId}` — même découpe que le resolver
          // node (preset-target.ts).
          monsterId: ti.slice(ti.lastIndexOf(':') + 1),
        }
      : undefined;
  };

  // Équipement (slug UI → groupes d'options uniques des tables damage) —
  // même contrat que le resolver node (preset-gear.ts) : les props portent la
  // jointure, la variante PAR CLASSE suit l'attaquant (Briareos/Gorgon).
  const resolveGearLocal = (kind: 'weapon' | 'amulet' | 'talisman', slug: string, aId: string) => {
    const g =
      kind === 'weapon'
        ? weapons.find((x) => x.slug === slug)
        : kind === 'amulet'
          ? amulets.find((x) => x.slug === slug)
          : talismans.find((x) => x.slug === slug);
    // La classe vient de l'ATTAQUANT DU SCÉNARIO (celui du z rejoué — pas
    // forcément la sélection courante) : variantes Briareos/Gorgon.
    const cls = chars.find((c) => c.id === aId)?.cls;
    const groups = (cls && g?.dmgGroupsByClass?.[cls]) || g?.dmgGroups;
    return groups?.length ? { groups } : undefined;
  };
  // Main de talisman (slug → buffId du buff d'équipe § 15) — même table que
  // les selects (props `talismanMains`, résolue par le wrapper depuis les
  // pools réels ; pendant node : resolveTalismanMainBuff, preset-gear.ts).
  const resolveTalisMainLocal = (slug: string) => {
    const hit = talismanMains.find((mn) => mn.key === slug);
    return hit ? { buffId: hit.buffId } : undefined;
  };

  return { dmgData, dmgErr, resolvePresetLocal, resolveGearLocal, resolveTalisMainLocal };
}
