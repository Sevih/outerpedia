'use client';

/**
 * Damage Calculator — client, l'ORCHESTRATEUR : moteur BRANCHÉ (05/08/2026),
 * la table Résultat affiche les dégâts calculés par `src/lib/damage` via le
 * pont partagé `buildInputsFromZ` (le même chemin que fixtures.test.ts et le
 * panneau Debug). Aucune donnée n'est localisée ici : tout vient du wrapper —
 * à UNE exception près : les DESCS du popover de skill (SkillTip.tsx), qui
 * arrivent en dictionnaires complets d'une projection chargée à la demande et
 * se localisent au rendu (`lang`).
 *
 * Géographie du dossier (audit D4, 25/08/2026 — découpage mécanique) :
 *   - `contracts.ts` (types du pont wrapper → client), `stores.ts`
 *     (localStorage + cycle de capture), `ui.tsx` (briques d'affichage),
 *     `target-pickers.tsx` (slots d'équipement + picker de cible) ;
 *   - `use-scenario-state.ts` (état du scénario + réglages de compte +
 *     persistance `?z=`), `use-damage-tables.ts` (tables + resolvers) ;
 *   - `SettingsTab.tsx`, `ResultTable.tsx`, `ScenariosPanel.tsx` (sections) ;
 *   - ICI : l'état de capture (branchOn/scénarios sauvés), le rapport et ses
 *     dérivés (mécaniques, procs, compteurs), les colonnes Attaquant / Cible /
 *     Contexte, et le câblage de toutes les sections.
 *
 * Décisions produit (Sevih, 26/07/2026) :
 *   - stats SAISIES depuis la fiche du jeu → l'UI ne montre que ce que la fiche
 *     ne porte pas (sets de combat, arme/accessoire, EE, Rogue's Charm, quirks) ;
 *   - niveaux de skill INDÉPENDANTS (S1/S2/S3, chain+dual partagés) ;
 *   - quirks de COMPTE : réglage persistant (localStorage) sur les arbres réels ;
 *   - 4 unités max sur le terrain (attaquant + 3 alliés, cibles 1–4).
 */

import { useMemo, useState, useEffect } from 'react';
import LZString from 'lz-string';
import { img, ELEMENT_ORDER } from '@/lib/images';
import { useStoredState } from '@/lib/client-storage';
import { EquipmentIcon } from '@/components/equipment/EquipmentIcon';
import { EffectIconTile } from '@/components/character/EffectChips';
import { FilterPill } from '@/components/character/filters/FilterPill';
import { GameText } from '@/components/ui/GameText';
import { SkillIconTip } from './SkillTip';
import {
  buildInputsFromZ,
  flattenReport,
  type CalculatorUrlState as UrlState,
} from '@/lib/damage/scenario';
import {
  buildDamageReport,
  elementOf,
  FX_CHIP_TOOLTIPS,
  sheetSlugOfStat,
  type DamageReportResult,
} from '@/lib/damage/inputs';
import { BASE_AMOUNT_STATS, passiveConditionMet } from '@/lib/damage/passives';
import { conditionBuffRef } from '@/lib/damage/gear';
import { ENGINE_GAME_VERSION, type DamageBranch, type DamageFixture } from '@/lib/damage/harness';
import dynamic from 'next/dynamic';

/**
 * Harnais de capture OPT-IN (build de dev, ou `?dev=1` en prod) : chargé à la
 * DEMANDE — ses ~700 lignes sortent du bundle initial que télécharge tout
 * visiteur de la page (audit D2, 07/08/2026 ; seule occurrence de
 * `next/dynamic` du projet — ailleurs le découpage par route suffit, ici le
 * composant est opt-in DANS la route).
 */
const DebugHarness = dynamic(() => import('./DebugHarness').then((m) => m.DebugHarness));
import {
  type AllyPick,
  type DcBossPassive,
  type DcBuffOption,
  type DcEffectRef,
  type DcSpawn,
  type Props,
} from './contracts';
import { DEV_BUILD, SCENARIOS_STORE, scnKey, type SavedScenario } from './stores';
import {
  Card,
  CharPicker,
  CharPortrait,
  EffectRefTag,
  Eyebrow,
  MonsterPortrait,
  SELECT_CLASS,
  SkillTag,
  Stepper,
  TranscendSlider,
  vars,
} from './ui';
import { GearSlot, SetsSlot, TargetPicker } from './target-pickers';
import { useScenarioState } from './use-scenario-state';
import { useDamageTables } from './use-damage-tables';
import { SettingsTab } from './SettingsTab';
import { ResultTable } from './ResultTable';
import { ScenariosPanel } from './ScenariosPanel';

// L'état `?z=` (`UrlState`) vit dans la LIB (`CalculatorUrlState`,
// src/lib/damage/scenario.ts) : le pont z → entrées moteur et le test des
// fixtures lisent LA même définition que ce composant.

// ── Composant principal ────────────────────────────────────────────────────

export function DamageCalculatorBrowser({
  chars,
  kits,
  weapons,
  amulets,
  sets,
  talismans,
  ees,
  targets,
  statFields,
  targetStatFields,
  talismanMains,
  buffOptions,
  quirks,
  codexTiers,
  guildTiers,
  titleHpPct,
  effectRefs,
  lang,
  labels: L,
}: Props) {
  const [tab, setTab] = useState<'calc' | 'settings'>('calc');
  // Feedback du bouton « copier le lien » (l'URL porte déjà tout le scénario).
  const [copied, setCopied] = useState(false);
  // État du SCÉNARIO + réglages de COMPTE + persistance `?z=` : tout vit
  // dans useScenarioState (audit D4 phase 2) — destructuré sous les MÊMES
  // noms que les anciens useState, le JSX ci-dessous n'a pas bougé.
  const {
    attackerId,
    setAttackerId,
    transcend,
    setTranscend,
    skillLvls,
    setSkillLvls,
    setPicks,
    setSetPicks,
    weaponSlug,
    setWeaponSlug,
    weaponTier,
    setWeaponTier,
    amuletSlug,
    setAmuletSlug,
    amuletTier,
    setAmuletTier,
    talismanOn,
    setTalismanOn,
    talisMain,
    setTalisMain,
    talisMainLv,
    setTalisMainLv,
    eeOwned,
    setEeOwned,
    eeLevel,
    setEeLevel,
    affinityLvl,
    setAffinityLvl,
    affinityTier,
    level,
    setLevel,
    statVals,
    setStatVals,
    quirkLvls,
    setQuirkLvls,
    codexLvl,
    setCodexLvl,
    guildLvl,
    setGuildLvl,
    premiumOn,
    setPremiumOn,
    targetTab,
    setTargetTab,
    targetId,
    setTargetId,
    spawnIdx,
    setSpawnIdx,
    tgtElement,
    setTgtElement,
    tgtStats,
    setTgtStats,
    tgtBoss,
    setTgtBoss,
    tgtGuildBuff,
    setTgtGuildBuff,
    tgtTitleBuff,
    setTgtTitleBuff,
    tgtBroken,
    setTgtBroken,
    tgtEnraged,
    setTgtEnraged,
    tgtHpPct,
    setTgtHpPct,
    targetsHit,
    setTargetsHit,
    allies,
    setAllies,
    stackDecls,
    setStackDecls,
    atkFx,
    setAtkFx,
    tgtFx,
    setTgtFx,
    metConds,
    setMetConds,
    atkBuffN,
    setAtkBuffN,
    atkDebuffN,
    setAtkDebuffN,
    atkTeamBuffN,
    setAtkTeamBuffN,
    tgtBuffN,
    setTgtBuffN,
    tgtDebuffN,
    setTgtDebuffN,
    hpPct,
    setHpPct,
    devMode,
    obs,
    setObs,
    pickAttacker,
    resetScenario,
    loadScenario,
    buildZ,
    packZ,
    flushShareUrl,
  } = useScenarioState({ chars, kits, weapons, amulets, sets, talismanMains, targets });

  // ── Cycle de capture (harnais) : saisie « en jeu » dans la table Résultat,
  // un scénario = UNE ligne sauvée d'un `+` (Sevih 05/08/2026). ──
  // Branches OBSERVABLES : quelles colonnes prennent une saisie. `miss` coché
  // FORCE sa branche (sans esquive, le miss n'existe qu'avec un buff de miss
  // chance) ; décocher `normal` sert le crit forcé (passif → P(normal) = 0).
  const [branchOn, setBranchOn] = useState<Record<DamageBranch, boolean>>({
    normal: true,
    critical: true,
    miss: false,
  });
  const [savedScnsRaw, setSavedScns, scnsReady] = useStoredState(SCENARIOS_STORE);
  // ASSAINI avant tout rendu : un état chaud d'HMR (entrées v1 encore en
  // mémoire après le swap de code, vu le 05/08 — `s.real` undefined) ou une
  // donnée corrompue ne doit jamais faire tomber le composant.
  const savedScns = savedScnsRaw.filter(
    (s) =>
      typeof s?.real === 'number' &&
      typeof s?.z === 'string' &&
      typeof s?.slot === 'string' &&
      typeof s?.branch === 'string',
  );
  // Miroir FICHIER en dev (Sevih 10/08/2026) : write-through de la liste vers
  // `.dev/damage-scenarios.json` via la route dev — un lecteur hors navigateur
  // (agent) lit les captures sans copier-coller. Gaté sur `scnsReady` : ne
  // jamais écraser le fichier avec le fallback [] d'avant hydratation. Build
  // de dev SEULEMENT (en prod `?dev=1`, la route n'existe pas).
  useEffect(() => {
    if (!DEV_BUILD || !scnsReady) return;
    void fetch('/api/dev/damage-scenarios', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(savedScnsRaw),
    }).catch(() => {
      /* miroir best-effort : le localStorage reste la vérité */
    });
  }, [savedScnsRaw, scnsReady]);
  const [flash, setFlash] = useState<string | null>(null);
  const say = (msg: string) => {
    setFlash(msg);
    window.setTimeout(() => setFlash(null), 2500);
  };
  // « Importer » : coller le JSON ⧉ reçu d'un beta testeur (le flux inverse
  // de ⧉ — eux capturent via `?dev=1`, Sevih vérifie ici, 06/08/2026).
  const [importOpen, setImportOpen] = useState(false);
  const [importTxt, setImportTxt] = useState('');

  const attacker = attackerId ? chars.find((c) => c.id === attackerId) : undefined;
  const kit = attackerId ? (kits[attackerId] ?? []) : [];
  const ee = attackerId ? ees[attackerId] : undefined;
  const weapon = weaponSlug ? weapons.find((w) => w.slug === weaponSlug) : undefined;
  const amulet = amuletSlug ? amulets.find((a) => a.slug === amuletSlug) : undefined;
  const talisman = talismans[0];

  // Saisie/stats finales : SEULES les stats qui pilotent les dégâts de CE perso
  // (`statKeys`, dérivé des kits par damage-scaling.json). Le select des buffs
  // garde la liste complète : il sert aussi la CIBLE (DEF down…).
  const sheetFields = attacker
    ? statFields.filter((f) => attacker.statKeys.includes(f.key))
    : statFields;

  // Cibles : modes distincts (ordre du jeu) — pastilles de filtre du picker.
  const modes = useMemo(() => {
    const seen = new Set<string>();
    const out: string[] = [];
    for (const tg of targets)
      if (!seen.has(tg.mode)) {
        seen.add(tg.mode);
        out.push(tg.mode);
      }
    return out;
  }, [targets]);
  const target = targetId ? targets.find((tg) => tg.id === targetId) : undefined;
  const spawn = target?.spawns[Math.min(spawnIdx, target.spawns.length - 1)];
  // Les buffs/débuffs de scénario attendent les DEUX combattants (Sevih
  // 27/07/2026) — en manuel, la cible « existe » dès l'onglet.
  const targetReady = targetTab === 'manual' || Boolean(target);

  // Armes/accessoires filtrés par la classe de l'attaquant (classLimit du jeu).
  // Pas de useMemo : le React Compiler mémoïse seul (et refuse de préserver une
  // mémoïsation manuelle depuis que `attacker` alimente aussi le cadre debug).
  const pickableWeapons = attacker
    ? weapons.filter((w) => !w.classLimits.length || w.classLimits.includes(attacker.cls))
    : weapons;
  const pickableAmulets = attacker
    ? amulets.filter((a) => !a.classLimits.length || a.classLimits.includes(attacker.cls))
    : amulets;

  // Chips proposés : même filtre de pertinence que la saisie des stats.
  const relevantFx = (options: DcBuffOption[]) =>
    options.filter((o) => !o.stat || !attacker || attacker.statKeys.includes(o.stat));
  const toggleFx = (set: (fn: (prev: string[]) => string[]) => void, key: string) =>
    set((prev) => (prev.includes(key) ? prev.filter((x) => x !== key) : [...prev, key]));

  // Passifs de BOSS du preset — chips AUTO (jamais togglables : en jeu ils
  // sont permanents et indélébiles). La condition élémentaire s'évalue contre
  // l'attaquant COURANT, même relation § 6 que le moteur.
  const bossPassivesFor = (s: DcBossPassive['side']): DcBossPassive[] =>
    (target?.passives ?? []).filter((p) => p.side === s);
  const bossPassiveActive = (p: DcBossPassive): boolean => {
    // Buff d'ENRAGE : gaté par la coche du scénario (même règle que le moteur).
    if (p.rage && !tgtEnraged) return false;
    if (!p.condition) return true;
    if (p.condition === 'OWNER_RAGE') return tgtEnraged;
    const a = attacker ? elementOf(attacker.element) : undefined;
    const d = target ? elementOf(target.element) : undefined;
    return (
      a !== undefined && d !== undefined && passiveConditionMet(p.condition, a, d, p.conditionValue)
    );
  };

  // ── MOTEUR BRANCHÉ (05/08/2026) : tables + resolvers dans useDamageTables
  // (chargées à la première sélection d'attaquant — ou dès l'hydratation si
  // le harnais a des scénarios sauvés qui attendent leur Δ). Le rapport
  // PUBLIC passe par le MÊME pont que le panneau Debug et fixtures.test.ts
  // (buildInputsFromZ → amont pur) — jamais un deuxième chemin de calcul.
  const { dmgData, dmgErr, resolvePresetLocal, resolveGearLocal, resolveTalisMainLocal } =
    useDamageTables({
      attackerId,
      devMode,
      savedScnsLen: savedScns.length,
      chars,
      weapons,
      amulets,
      talismans,
      talismanMains,
      targets,
    });

  // Entrées + rapport du scénario COURANT — recalculés au rendu (quelques ms
  // sur un kit complet) ; null tant que le scénario est incomplet ou les
  // tables absentes. Le détail d'une erreur moteur vit dans le panneau Debug.
  // Quirks ACTIFS du compte (niveau > 0) — réglage hors z, comme le Codex.
  const activeQuirks: Record<string, number> = Object.fromEntries(
    Object.entries(quirkLvls).filter(([, v]) => v > 0),
  );
  const scenarioInputs = buildInputsFromZ(buildZ(), {
    codexLevel: codexLvl,
    guildLevel: guildLvl,
    premiumHp: premiumOn,
    quirks: activeQuirks,
    resolvePreset: resolvePresetLocal,
    resolveGear: resolveGearLocal,
    resolveTalismanMain: resolveTalisMainLocal,
  });
  let report: DamageReportResult | null = null;
  if (dmgData && scenarioInputs.attacker && scenarioInputs.target) {
    try {
      report = buildDamageReport(scenarioInputs.attacker, scenarioInputs.target, dmgData, {
        // La coche MISS (dev) force sa branche — en prod elle reste false.
        includeMissBranch: branchOn.miss,
        ...(scenarioInputs.targetsHit !== undefined
          ? { targetsHit: scenarioInputs.targetsHit }
          : {}),
      });
    } catch {
      report = null;
    }
  }
  /** Valeur de stat finale → affichage (‰ des stats % → « x% », plat brut). */
  const fmtStat = (v: number | undefined, percent: boolean): string =>
    v === undefined ? '—' : percent ? `${v / 10}%` : v.toLocaleString();

  // Chips de passifs de boss : ACTIVES et qui pèsent un MONTANT pour ce
  // scénario — la crit chance de l'équipe ne s'affiche que si le kit la LIT
  // (§ 9.1, ex. 2000067) ; sans rapport, repli sur la base (Sevih 17/08/2026).
  const amountStats = new Set(report?.attackerAmountStats ?? BASE_AMOUNT_STATS);
  const bossPassiveShown = (p: DcBossPassive): boolean =>
    bossPassiveActive(p) &&
    (p.side !== 'attacker' || p.stat === undefined || amountStats.has(p.stat));

  // Mécaniques perso : entrées `stateful` du rapport (kit/EE/quirks + passifs
  // d'ALLIÉS) — leur condition d'ÉTAT de combat (ressource, buffs posés… —
  // CheckAvailable § 12.1) n'est jamais évaluée par le moteur ; la coche du
  // panneau Contexte la déclare remplie (z `cs`).
  const statefulPassives = report
    ? [report.kitPassives, report.gearPassives, report.quirkPassives, report.allyPassives].flatMap(
        (i) => (i?.entries ?? []).filter((e) => e.stateful),
      )
    : [];

  // Procs dynamiques DÉCLARABLES (« ce perso a cette méca stackée N fois »,
  // Sevih 23/08/2026) : procs damage-pertinents côté attaquant — de son
  // PROPRE kit/EE/quirks comme de ses alliés — dédup par buffId (un même
  // buff référencé par plusieurs sources = UNE instance, même règle que le
  // moteur). Deux exclusions (Sevih 23/08) :
  //  - un proc qui porte le tooltip d'une CHIP générique EST ce buff visible
  //    en jeu (mêmes magnitudes, pas de cumul) — il se déclare par la chip,
  //    un stepper le ferait compter DEUX fois (FX_CHIP_TOOLTIPS) ;
  //  - un BT_STAT dont la stat ne pèse aucun MONTANT dans ce scénario
  //    (counter rate, buff resist…) n'a rien à déclarer — même filtre que
  //    les chips de passifs de boss (`amountStats`).
  const stackableDynamics = (() => {
    const seen = new Set<string>();
    return report
      ? [report.kitPassives, report.gearPassives, report.quirkPassives, report.allyPassives]
          .flatMap((i) => i?.dynamic ?? [])
          .filter((d) => {
            if (d.side !== 'attacker' || seen.has(d.buffId)) return false;
            if (d.tooltipId !== undefined && FX_CHIP_TOOLTIPS[d.tooltipId] !== undefined)
              return false;
            if (d.buff.type === 'BT_STAT' && (!d.buff.stat || !amountStats.has(d.buff.stat)))
              return false;
            seen.add(d.buffId);
            return true;
          })
      : [];
  })();
  // Libellé d'un proc : le NOM du jeu de sa source (perso allié, skill du
  // kit — déclinaisons BURST résolues sur la rangée qui porte `burstIds` —
  // EE, nœud d'éveil) — jamais de texte écrit main ; repli sur le buffId
  // brut.
  const dynLabel = (d: (typeof stackableDynamics)[number]): { name: string; slot?: string } => {
    if (d.ally)
      return {
        name: chars.find((c) => c.id === d.ally)?.label ?? d.ally,
        // Slot du skill de l'ALLIÉ (résolu par le moteur — « Eris S2 »).
        ...(d.slot ? { slot: d.slot } : {}),
      };
    if (d.source === 'kit') {
      const row = kit.find((r) => r.id === d.sourceId || r.burstIds?.includes(d.sourceId));
      if (row) return { name: row.name, slot: row.slot };
    }
    if (d.source === 'ee' && ee) return { name: ee.name };
    if (d.source === 'quirk') {
      for (const g of quirks) {
        const n = g.nodes.find((x) => String(x.id) === d.sourceId);
        if (n) return { name: n.name };
      }
    }
    return { name: d.buffId };
  };
  // Ce que le proc FAIT, lisible : tag du glossaire quand la ligne porte un
  // ToolTipID (même tag inline que conditions et DoT), sinon le nom localisé
  // de la stat visée (fiche), sinon « dégâts » pour la famille BT_DMG (§ 9.1)
  // — la magnitude vient de la donnée (OAT_RATE et stats-% : affichage en %).
  const dynEffect = (
    d: (typeof stackableDynamics)[number],
  ): { ref?: DcEffectRef; what?: string; amount: string } => {
    const ref = d.tooltipId !== undefined ? effectRefs[String(d.tooltipId)] : undefined;
    const v = d.buff.value ?? 0;
    const slug = d.buff.stat !== undefined ? sheetSlugOfStat(d.buff.stat) : undefined;
    const field = slug !== undefined ? statFields.find((f) => f.key === slug) : undefined;
    const pct = d.buff.applyingType === 'OAT_RATE' || field?.percent === true;
    const amount = `${v >= 0 ? '+' : ''}${pct ? `${v / 10}%` : v}`;
    if (ref) return { ref, amount };
    const what =
      field?.label ?? d.buff.stat ?? (d.buff.type === 'BT_DMG' ? L.context.dmgWord : undefined);
    return { ...(what !== undefined ? { what } : {}), amount };
  };

  // Compteurs § 9.1 (« ×N buffs/débuffs ») : le scénario DÉCLARE les nombres
  // (le moteur ne compte jamais les chips — elles ne couvrent pas tous les
  // états du jeu). Un stepper n'apparaît que si un passif du rapport côté
  // attaquant LIT sa famille (actif OU stateful — ex. Eris 2000117_2_4 :
  // +20 % par débuff de la cible sur S2/S3).
  const counterTypes = new Set(
    report
      ? [
          ...[
            report.kitPassives,
            report.gearPassives,
            report.quirkPassives,
            report.allyPassives,
          ].flatMap((i) => i?.entries ?? []),
          ...(report.bossPassives?.entries ?? []),
        ]
          .filter((e) => e.side === 'attacker')
          .map((e) => e.buff.type)
      : [],
  );
  const counterInputs = (
    [
      { type: 'BT_DMG_OWNER_BUFF', label: L.context.ownBuffs, value: atkBuffN, set: setAtkBuffN },
      {
        type: 'BT_DMG_OWNER_DEBUFF',
        label: L.context.ownDebuffs,
        value: atkDebuffN,
        set: setAtkDebuffN,
      },
      {
        type: 'BT_DMG_OWNER_TEAM_BUFF',
        label: L.context.teamBuffs,
        value: atkTeamBuffN,
        set: setAtkTeamBuffN,
        // Σ sur l'ÉQUIPE entière — plafond plus large que les compteurs mono-
        // entité (même borne que le pont scenario.ts).
        max: 40,
      },
      { type: 'BT_DMG_TARGET_BUFF', label: L.context.tgtBuffs, value: tgtBuffN, set: setTgtBuffN },
      {
        type: 'BT_DMG_TARGET_DEBUFF',
        label: L.context.tgtDebuffs,
        value: tgtDebuffN,
        set: setTgtDebuffN,
      },
    ] as const
  ).filter((c) => counterTypes.has(c.type));
  // Libellé d'une mécanique : le NOM du jeu de sa source (skill du kit via le
  // slot lanceur, EE, nœud d'éveil) — jamais de texte écrit main ; repli sur
  // le buffId brut (identifiant stable) si la source ne se résout pas.
  // Les callers BURST se résolvent sur le slot du skill BURSTABLE du kit
  // (la rangée qui porte `burstIds` — S1 chez Caren : le « toujours S2 »
  // d'avant contredisait la table Résultat, revue 18/08/2026).
  const SLOT_OF_CALLER: Record<string, string> = {
    SKT_FIRST: 'S1',
    SKT_SECOND: 'S2',
    SKT_ULTIMATE: 'S3',
  };
  const kitBurstSlot = kit.find((r) => r.burstIds?.length)?.slot;
  const slotOfCaller = (c: string): string | undefined =>
    SLOT_OF_CALLER[c] ?? (c.startsWith('SKT_BURST_') ? kitBurstSlot : undefined);
  const mechLabel = (e: (typeof statefulPassives)[number]): { name: string; slot?: string } => {
    // Entrée d'ALLIÉ : sa source (skill/EE) vit dans le kit de l'ALLIÉ, hors
    // des props — le NOM du personnage allié situe la mécanique.
    if (e.ally) {
      const nm = chars.find((c) => c.id === e.ally)?.label;
      if (nm) return { name: nm };
    }
    const slot = e.callers?.map(slotOfCaller).find((s) => s !== undefined);
    if (e.source === 'kit' && slot) {
      const nm = kit.find((r) => r.slot === slot)?.name;
      if (nm) return { name: nm, slot };
    }
    if (e.source === 'ee' && ee) return { name: ee.name, ...(slot ? { slot } : {}) };
    if (e.source === 'quirk') {
      for (const g of quirks) {
        const n = g.nodes.find((x) => String(x.id) === e.sourceId);
        if (n) return { name: n.name, ...(slot ? { slot } : {}) };
      }
    }
    return { name: e.buffId, ...(slot ? { slot } : {}) };
  };
  /** Libellé LISIBLE de la condition d'une mécanique (« Target has … »,
   *  « Target HP below 90% »…) — gabarit localisé, `{n}` = seuil (HPRATE en
   *  ‰ → %) ; repli sur l'enum brut si le gabarit manquait. Quand la condition
   *  référence un buff PRÉCIS (`conditionBuffRef` — prédicat PARTAGÉ avec le
   *  wrapper, sentinelles « n'importe quel buff » exclues), le gabarit
   *  `condsRef` s'ouvre autour de `{buff}` et le buff devient un TAG INLINE
   *  (icône + nom, desc en tooltip — Sevih 22/08/2026, remplace le « : nom »
   *  en texte plat du 18/08) ; sans entrée au glossaire (marqueur technique
   *  au NameID vide, ex. 4089002 des Irréguliers), l'id brut plutôt qu'un
   *  libellé générique trompeur. */
  const mechCond = (
    e: (typeof statefulPassives)[number],
  ): { pre: string; ref?: DcEffectRef; post?: string } | undefined => {
    if (!e.condition) return undefined;
    const refId = conditionBuffRef(e.condition, e.conditionValue);
    if (refId !== undefined) {
      const ref = effectRefs[refId];
      const tplRef = L.context.condsRef[e.condition];
      if (ref && tplRef !== undefined) {
        const [pre, post] = tplRef.split('{buff}');
        return { pre, ref, ...(post ? { post } : {}) };
      }
      const tpl = L.context.conds[e.condition] ?? e.condition;
      return { pre: `${tpl} : #${refId}` };
    }
    const tpl = L.context.conds[e.condition];
    if (!tpl) return { pre: e.condition };
    const n =
      e.conditionValue !== undefined
        ? e.condition.includes('HPRATE')
          ? e.conditionValue / 10
          : e.conditionValue
        : undefined;
    return { pre: n !== undefined ? tpl.replace('{n}', String(n)) : tpl };
  };

  // ── Cycle de capture (harnais) : un scénario = UNE ligne de dégâts ──
  // Le `+` d'une cellule fige z (TOUS les réglages UI) + réglages de compte +
  // la ligne (slot × branche) + la valeur EN JEU saisie.
  const saveCell = (slot: string, branch: DamageBranch, real: number) => {
    const entry: SavedScenario = {
      atk: attacker?.label ?? '?',
      tgt: target ? target.name : `${tgtElement ?? '?'} (${L.target.manual})`,
      slot,
      branch,
      real,
      z: packZ(),
      ...(codexLvl > 0 ? { codex: codexLvl } : {}),
      ...(guildLvl > 0 ? { guild: guildLvl } : {}),
      ...(premiumOn ? { premium: true } : {}),
      ...(Object.keys(activeQuirks).length ? { quirks: activeQuirks } : {}),
      gameVersion: ENGINE_GAME_VERSION,
      savedAt: new Date().toISOString(),
    };
    setSavedScns((prev) => {
      const i = prev.findIndex((s) => scnKey(s) === scnKey(entry));
      return i >= 0 ? prev.map((s, j) => (j === i ? entry : s)) : [...prev, entry];
    });
    say(`${entry.slot} ${entry.branch} sauvegardé`);
  };

  // Calculés des scénarios sauvegardés — REJOUÉS à l'affichage par le même
  // pont, jamais stockés : un moteur qui bouge se voit immédiatement dans le
  // Δ. Pas de useMemo : le React Compiler mémoïse seul.
  const savedCalcs = (): { calcs: Map<string, number>; pending: Set<string> } => {
    const calcs = new Map<string, number>();
    // Lignes EN ATTENTE : le slot existe mais sa chaîne de hits est irrésolue
    // (§ 12.4) — la valeur en jeu est gardée, le Δ attendra le moteur.
    const pending = new Set<string>();
    const out = { calcs, pending };
    if (!dmgData) return out;
    for (const s of savedScns) {
      try {
        const st = JSON.parse(
          LZString.decompressFromEncodedURIComponent(s.z) || 'null',
        ) as UrlState | null;
        if (!st) continue;
        const inp = buildInputsFromZ(st, {
          codexLevel: s.codex ?? 0,
          guildLevel: s.guild ?? 0,
          premiumHp: s.premium === true,
          ...(s.quirks ? { quirks: s.quirks } : {}),
          resolvePreset: resolvePresetLocal,
          resolveGear: resolveGearLocal,
          resolveTalismanMain: resolveTalisMainLocal,
        });
        if (!inp.attacker || !inp.target) continue;
        const r = buildDamageReport(inp.attacker, inp.target, dmgData, {
          ...(s.branch === 'miss' ? { includeMissBranch: true } : {}),
          ...(inp.targetsHit !== undefined ? { targetsHit: inp.targetsHit } : {}),
        });
        const hit = flattenReport(r).find((l) => l.slot === s.slot && l.branch === s.branch);
        if (hit) {
          calcs.set(scnKey(s), hit.damage);
        } else {
          const base = s.slot.split('#')[0];
          const stuck = r.slots.some(
            (sl) =>
              sl.hitsUnresolved === true &&
              sl.report.states.length === 0 &&
              `${sl.slot}${sl.burst !== undefined ? `b${sl.burst}` : ''}` === base,
          );
          if (stuck) pending.add(scnKey(s));
        }
      } catch {
        // z illisible → pas de calculé, la ligne l'affiche « — »
      }
    }
    return out;
  };

  // « Charger » : re-remplit le calculateur ENTIER (reset + applyZ + réglages
  // de compte) puis pré-remplit la cellule observée et coche sa branche.
  const loadSaved = (s: SavedScenario) => {
    if (!loadScenario(s)) {
      say(`${s.atk} vs ${s.tgt} : z illisible — non chargé`);
      return;
    }
    setObs({ [`${s.slot}|${s.branch}`]: String(s.real) });
    setBranchOn((p) => ({ ...p, [s.branch]: true }));
    say(`${s.atk} vs ${s.tgt} chargé`);
  };

  // « ⧉ JSON » : le DamageFixture (une ligne observée) à committer dans
  // src/lib/damage/fixtures/ puis référencer dans fixtures/index.ts.
  const copyScenario = (s: SavedScenario) => {
    const fixture: DamageFixture = {
      name: `${s.atk} vs ${s.tgt} · ${s.slot} ${s.branch}`,
      z: s.z,
      ...(s.codex !== undefined ? { codex: s.codex } : {}),
      ...(s.guild !== undefined ? { guild: s.guild } : {}),
      ...(s.premium ? { premium: true } : {}),
      ...(s.quirks ? { quirks: s.quirks } : {}),
      gameVersion: s.gameVersion,
      observed: [{ slot: s.slot, branch: s.branch, damage: s.real }],
    };
    void navigator.clipboard
      .writeText(JSON.stringify(fixture, null, 2))
      .then(() => say('copié — coller dans src/lib/damage/fixtures/'));
  };

  const deleteScenario = (s: SavedScenario) =>
    setSavedScns((prev) => prev.filter((x) => scnKey(x) !== scnKey(s)));

  // Import : une fixture ⧉ (ou un tableau de fixtures) → un scénario sauvé
  // PAR ligne observée, upsert par clé (z + slot + branche) comme le `+`.
  const importScenarios = () => {
    let parsed: unknown = null;
    try {
      parsed = JSON.parse(importTxt);
    } catch {
      say('JSON illisible — rien importé');
      return;
    }
    const list = (Array.isArray(parsed) ? parsed : [parsed]) as Partial<DamageFixture>[];
    const entries: SavedScenario[] = [];
    for (const f of list) {
      if (typeof f?.z !== 'string' || !Array.isArray(f.observed)) continue;
      // Libellés d'affichage : le nom ⧉ suit « atk vs tgt · ligne » — sinon
      // le nom entier sert d'attaquant (affichage seulement, le z fait foi).
      const name = typeof f.name === 'string' ? f.name : '';
      const m = /^(.+?) vs (.+?)(?: · .+)?$/.exec(name);
      for (const o of f.observed) {
        const branchOk =
          typeof o?.branch === 'string' && ['normal', 'critical', 'miss'].includes(o.branch);
        if (typeof o?.slot !== 'string' || !branchOk) continue;
        if (typeof o.damage !== 'number' || o.damage <= 0) continue;
        entries.push({
          atk: m?.[1] ?? (name || 'import'),
          tgt: m?.[2] ?? '?',
          slot: o.slot,
          branch: o.branch as DamageBranch,
          real: o.damage,
          z: f.z,
          ...(typeof f.codex === 'number' && f.codex > 0 ? { codex: f.codex } : {}),
          ...(typeof f.guild === 'number' && f.guild > 0 ? { guild: f.guild } : {}),
          ...(f.premium === true ? { premium: true } : {}),
          ...(f.quirks && typeof f.quirks === 'object' ? { quirks: f.quirks } : {}),
          gameVersion: typeof f.gameVersion === 'string' ? f.gameVersion : '?',
          savedAt: new Date().toISOString(),
        });
      }
    }
    if (!entries.length) {
      say('aucune ligne valide — rien importé');
      return;
    }
    setSavedScns((prev) => {
      const next = [...prev];
      for (const e of entries) {
        const i = next.findIndex((s) => scnKey(s) === scnKey(e));
        if (i >= 0) next[i] = e;
        else next.push(e);
      }
      return next;
    });
    setImportTxt('');
    setImportOpen(false);
    say(`${entries.length} ligne(s) importée(s)`);
  };

  // Rejoué une fois par rendu (hors harnais : aucun scénario, maps vides).
  const savedCalcMap = devMode
    ? savedCalcs()
    : { calcs: new Map<string, number>(), pending: new Set<string>() };

  const offensiveSkills = kit.filter((s) => s.offensive);
  const supportSkills = kit.filter((s) => !s.offensive);

  const wellClass = 'border-line-subtle bg-surface-sunken/70 rounded-lg border';

  // Cadre de DEBUG (Sevih 27/07/2026) : l'état exact que le moteur consommera
  // — savoir ce qu'on a et ce qui est actif pendant le branchement du rapport.
  const debugState = {
    attacker: attacker
      ? {
          id: attacker.id,
          level,
          transcend: attacker.transcend[transcend]?.label ?? null,
          // Le palier 0..5 est LA valeur de calcul ; le niveau saisi ne sert
          // qu'à l'UI (paliers tous les 20 — Sevih 03/08/2026).
          affinity: { level: affinityLvl, tier: affinityTier },
          skills: skillLvls,
          weapon: weapon ? { slug: weapon.slug, tier: weaponTier } : null,
          amulet: amulet ? { slug: amulet.slug, tier: amuletTier } : null,
          sets: setPicks,
          roguesCharm: talismanOn,
          talisman: talisMain ? { main: talisMain, lv: talisMainLv } : null,
          ee: ee && eeOwned ? { level: eeLevel } : null,
          stats: statVals,
          hpPct,
        }
      : null,
    target:
      targetTab === 'manual'
        ? {
            manual: {
              element: tgtElement,
              stats: tgtStats,
              boss: tgtBoss,
              guildBuff: tgtGuildBuff,
              titleBuff: tgtTitleBuff,
              hpPct: tgtHpPct,
            },
          }
        : target
          ? {
              id: target.id,
              mode: target.mode,
              spawn: spawn ? { label: spawn.label, level: spawn.level, stats: spawn.stats } : null,
              hpPct: tgtHpPct,
            }
          : null,
    context: { targetsHit, targetBroken: tgtBroken, attackerFx: atkFx, targetFx: tgtFx },
    team: allies
      .filter((a) => a.id)
      .map((a) => ({
        id: a.id,
        transcend: chars.find((c) => c.id === a.id)?.transcend[a.transcend]?.label ?? null,
        talisman: a.talisman ? { main: a.talisman, lv: a.talismanLv } : null,
        ee: a.id && ees[a.id] ? { owned: a.ee, plus10: a.eePlus } : null,
        weapon: a.weapon ? { slug: a.weapon, tier: a.weaponTier } : null,
        amulet: a.amulet ? { slug: a.amulet, tier: a.amuletTier } : null,
      })),
    quirks: Object.fromEntries(Object.entries(quirkLvls).filter(([, v]) => v > 0)),
    codex: codexLvl,
    guild: guildLvl,
    premium: premiumOn,
  };

  return (
    <div className="mx-auto w-full max-w-400 space-y-4">
      {/* Bandeau : le CAVEAT du moteur (ce qui n'est pas encore compté). */}
      <div className="border-warn/30 bg-warn/10 text-warn rounded-lg border px-4 py-2.5 text-center text-sm">
        {L.report.wip}
      </div>

      {/* Onglets : le calculateur, et le réglage de COMPTE (quirks) à côté. */}
      <div className="border-line-subtle bg-surface-sunken/70 mx-auto grid w-full max-w-md grid-cols-2 gap-1 rounded-lg border p-1">
        {(['calc', 'settings'] as const).map((tb) => (
          <button
            key={tb}
            type="button"
            className={`h-8 cursor-pointer rounded-md text-xs font-bold transition ${
              tab === tb ? 'bg-accent text-surface-base' : 'text-content-muted hover:text-content'
            }`}
            onClick={() => setTab(tb)}
          >
            {tb === 'calc' ? L.title : L.settings.title}
          </button>
        ))}
      </div>

      {tab === 'settings' && (
        <SettingsTab
          codexLvl={codexLvl}
          setCodexLvl={setCodexLvl}
          codexTiers={codexTiers}
          guildLvl={guildLvl}
          setGuildLvl={setGuildLvl}
          guildTiers={guildTiers}
          premiumOn={premiumOn}
          setPremiumOn={setPremiumOn}
          titleHpPct={titleHpPct}
          quirks={quirks}
          quirkLvls={quirkLvls}
          setQuirkLvls={setQuirkLvls}
          labels={L}
        />
      )}

      {tab === 'calc' && (
        // Reset du scénario + partage : l'URL EST l'état (Sevih 27/07/2026).
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={resetScenario}
            className="border-line-subtle text-content-subtle hover:text-content h-7 cursor-pointer rounded-lg border border-dashed px-3 text-xs"
          >
            {L.toolbar.reset}
          </button>
          <button
            type="button"
            onClick={() => {
              void navigator.clipboard.writeText(flushShareUrl()).then(() => {
                setCopied(true);
                window.setTimeout(() => setCopied(false), 1500);
              });
            }}
            className="border-line-subtle text-content-subtle hover:text-content h-7 cursor-pointer rounded-lg border border-dashed px-3 text-xs"
          >
            {copied ? L.toolbar.copied : L.toolbar.copy}
          </button>
        </div>
      )}

      {tab === 'calc' && (
        <div className="grid items-start gap-4 xl:grid-cols-[7fr_6fr_12fr]">
          {/* ═══ COLONNE 1 — ATTAQUANT ═══ */}
          <div className="min-w-0 space-y-4">
            <Card title={L.panels.attacker}>
              <CharPicker
                chars={chars}
                value={attackerId}
                onPick={pickAttacker}
                onClear={() => setAttackerId(null)}
                placeholder={L.pick}
                labels={L}
                aside={
                  // Transcendance : les PALIERS RÉELS du perso, même slider que
                  // la fiche (demande Sevih 27/07/2026), logé sous le nom.
                  attacker && attacker.transcend.length > 0 ? (
                    <TranscendSlider
                      tiers={attacker.transcend}
                      idx={transcend}
                      onIdx={setTranscend}
                    />
                  ) : undefined
                }
              />

              {/* Niveau (1..120, défaut 120) : requis par le terme Codex de la
                reconstruction fiche → combat (spec § 16.1 — Sevih 03/08/2026). */}
              {attacker && (
                <div className="flex items-center gap-2">
                  <span className="text-content-subtle font-mono text-[9px] tracking-wide uppercase">
                    {L.target.lv}
                  </span>
                  <input
                    type="range"
                    min={1}
                    max={120}
                    value={level}
                    onChange={(e) => setLevel(Number(e.target.value))}
                    className="h-3 min-w-0 flex-1 cursor-pointer accent-sky-500"
                    aria-label={`${L.target.lv} ${level}`}
                  />
                  <span className="text-content font-mono text-xs tabular-nums">{level}</span>
                </div>
              )}

              {/* Affinité (Trust) : saisie au NIVEAU 0..100, paliers tous les
                20 (Sevih 03/08/2026) — seuls les paliers 0..5 comptent pour
                les calculs (buffs passifs plats ABSENTS de la fiche affichée,
                le moteur les ajoutera — binaire 27/07/2026). */}
              {attacker && (
                <div className="flex items-center gap-2">
                  <span className="text-content-subtle font-mono text-[9px] tracking-wide uppercase">
                    {L.affinity}
                  </span>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={affinityLvl}
                    onChange={(e) => setAffinityLvl(Number(e.target.value))}
                    className="h-3 min-w-0 flex-1 cursor-pointer accent-sky-500"
                    aria-label={`${L.affinity} ${affinityLvl}`}
                  />
                  <span className="text-content font-mono text-xs tabular-nums">{affinityLvl}</span>
                  <span className="text-content-subtle font-mono text-[10px] tabular-nums">
                    {affinityTier}/5
                  </span>
                </div>
              )}
            </Card>

            {/* Ordre de la colonne (Sevih 27/07/2026) : perso → stats → skills
              → équipement. */}
            {attacker && (
              <Card
                title={L.stats.title}
                right={<span className="text-content-subtle text-[10px]">{L.stats.sheetNote}</span>}
              >
                <div className="grid grid-cols-2 gap-2">
                  {sheetFields.map((f) => (
                    <label key={f.key} className="min-w-0 space-y-1">
                      <span className="text-content-subtle block truncate font-mono text-[9px] tracking-wide uppercase">
                        {f.label}
                      </span>
                      <span className="border-line-subtle bg-surface-sunken/70 focus-within:border-accent flex h-8 w-full min-w-0 items-center gap-1 rounded-lg border px-2">
                        <input
                          type="text"
                          inputMode="decimal"
                          value={statVals[f.key] ?? ''}
                          onChange={(e) => setStatVals((s) => ({ ...s, [f.key]: e.target.value }))}
                          className="text-content w-full min-w-0 flex-1 bg-transparent font-mono text-sm font-bold tabular-nums outline-none"
                        />
                        {f.percent && <span className="text-content-subtle text-xs">%</span>}
                      </span>
                    </label>
                  ))}
                </div>
              </Card>
            )}

            {attacker && (
              <Card title={L.skills.title}>
                {/* Niveaux de skill indépendants (chain/dual hors périmètre),
                  en COLONNES : slot / icône / tag / niveau, côte à côte. */}
                <div className="grid grid-cols-3 gap-1.5">
                  {kit.map((row) => (
                    <div
                      key={row.slot}
                      className={`${wellClass} flex flex-col items-center gap-1.5 px-1 py-2`}
                      title={row.name}
                    >
                      <span className="text-content-subtle font-mono text-[10px] font-bold">
                        {row.slot}
                      </span>
                      {/* Icône décorative (le nom est le title du puits et
                        l'en-tête du popover) — alt vide, règle CONVENTIONS. */}
                      <SkillIconTip row={row} lvl={skillLvls[row.slot] ?? row.maxLevel} lang={lang}>
                        {row.iconSrc ? (
                          <img
                            src={row.iconSrc}
                            alt=""
                            aria-hidden
                            width={36}
                            height={36}
                            className="block h-9 w-9 rounded-lg"
                            loading="lazy"
                          />
                        ) : (
                          <span className="border-line-subtle bg-surface-raised/60 block h-9 w-9 rounded-lg border" />
                        )}
                      </SkillIconTip>
                      <SkillTag offensive={row.offensive} labels={L} />
                      <Stepper
                        value={skillLvls[row.slot] ?? row.maxLevel}
                        min={1}
                        max={row.maxLevel}
                        onChange={(v) => setSkillLvls((s) => ({ ...s, [row.slot]: v }))}
                        format={(v) => `Lv ${v}`}
                      />
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {attacker && (
              <Card title={L.equipment.title}>
                {/* 6 cases (Sevih 27/07/2026) : arme / accessoire, set 1 / set 2,
                  EE / talisman. Sets de COMBAT seuls (les sets de stats sont
                  dans la fiche). */}
                <div className="grid gap-1.5 sm:grid-cols-2">
                  <GearSlot
                    title={L.equipment.weapon}
                    placeholder={L.equipment.pickWeapon}
                    options={pickableWeapons}
                    value={weapon}
                    tier={weaponTier}
                    attackerCls={attacker.cls}
                    onPick={(slug) => {
                      setWeaponSlug(slug);
                      setWeaponTier(0);
                    }}
                    onClear={() => setWeaponSlug(null)}
                    onTier={setWeaponTier}
                    labels={L}
                  />
                  <GearSlot
                    title={L.equipment.accessory}
                    placeholder={L.equipment.pickAccessory}
                    options={pickableAmulets}
                    value={amulet}
                    tier={amuletTier}
                    attackerCls={attacker.cls}
                    onPick={(slug) => {
                      setAmuletSlug(slug);
                      setAmuletTier(0);
                    }}
                    onClear={() => setAmuletSlug(null)}
                    onTier={setAmuletTier}
                    labels={L}
                  />

                  <SetsSlot sets={sets} picks={setPicks} onChange={setSetPicks} labels={L} />

                  <div className={`${wellClass} space-y-1.5 p-2`}>
                    {/* Même garde anti-débordement que GearSlot : le titre EE
                      est long, le Stepper wrappe sous lui au lieu de sortir
                      de la case (bug signalé Sevih 03/08/2026). */}
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                      <Eyebrow>{L.equipment.ee}</Eyebrow>
                      {/* Le niveau sert aux mains « dégâts vs élément » ET au
                        choix du palier de passif Lv0/Lv10 — visible pour TOUT
                        EE possédé (demande Sevih 03/08/2026 ; il n'était
                        affiché qu'avec une main dmgMain). */}
                      {eeOwned && ee && (
                        <Stepper
                          value={eeLevel}
                          min={0}
                          max={10}
                          onChange={setEeLevel}
                          format={(v) => `+${v}`}
                          className="ml-auto shrink-0"
                        />
                      )}
                    </div>
                    {ee ? (
                      <>
                        {/* Même motif que le talisman : checkbox « possédé »
                          (+0 ≠ absent : le passif Lv0 s'applique dès qu'on le
                          porte), en-tête icône + nom, puis les descriptions en
                          PLEINE LARGEUR de la case (demande Sevih 27/07/2026). */}
                        <label className="flex cursor-pointer items-center gap-2">
                          <input
                            type="checkbox"
                            checked={eeOwned}
                            onChange={() => setEeOwned(!eeOwned)}
                            className="accent-accent h-3.5 w-3.5 cursor-pointer"
                          />
                          <EquipmentIcon src={ee.src} grade={ee.grade} size={34} />
                          <div className="min-w-0">
                            <p
                              className={`text-xs font-semibold wrap-break-word ${eeOwned ? 'text-content' : 'text-content-subtle'}`}
                            >
                              {ee.name}
                            </p>
                            {eeOwned && ee.dmgMain && (
                              <p className="text-accent font-mono text-[11px] font-bold tabular-nums">
                                {ee.dmgMain.label} +{(ee.dmgMain.levels[eeLevel] ?? 0) / 10}%
                              </p>
                            )}
                          </div>
                        </label>
                        {/* Un palier par ligne : Lv0 / Lv10 SÉPARÉS (le palier
                          +10 remplace le précédent), « + » quand il s'AJOUTE.
                          Le palier inactif AU NIVEAU CHOISI est grisé : sous
                          +10 les lignes Lv10 dorment ; à +10 une ligne Lv10
                          non-« + » remplace la Lv0. */}
                        {ee.rows.map((row, i) => {
                          const lv10Replaces = ee.rows.some((r) => r.level >= 10 && !r.isAdd);
                          const active =
                            eeLevel >= 10 ? row.level >= 10 || !lv10Replaces : row.level < 10;
                          return (
                            <div
                              key={i}
                              className={`flex items-start gap-1.5 ${eeOwned && active ? '' : 'opacity-60'}`}
                            >
                              <span className="border-line-subtle text-accent mt-0.5 rounded border px-1 font-mono text-[9px] font-bold whitespace-nowrap">
                                {row.isAdd ? '+' : ''}
                                {row.level >= 10 ? L.equipment.lv10 : L.equipment.lv0}
                              </span>
                              <GameText
                                text={row.html}
                                className={`min-w-0 flex-1 text-[11px] leading-relaxed whitespace-pre-line ${eeOwned && active ? 'text-content-muted' : 'text-content-subtle'}`}
                              />
                            </div>
                          );
                        })}
                      </>
                    ) : (
                      <p className="text-content-subtle text-[11px]">{L.equipment.eeNone}</p>
                    )}
                  </div>

                  {/* Talisman du porteur : main stat (buff d'ÉQUIPE § 15,
                    24/08/2026) + enhancement, puis Rogue's Charm en CASE À
                    COCHER — équipé au +10 ou non (son passif +10, dégâts sur
                    cible break). */}
                  <div className={`${wellClass} space-y-1.5 p-2`}>
                    <Eyebrow>{L.equipment.talisman}</Eyebrow>
                    {/* Colonne attaquant plus étroite que la team : le niveau
                      passe SOUS le select (Sevih 24/08/2026). */}
                    <div className="space-y-1.5">
                      <select
                        value={talisMain ?? ''}
                        onChange={(e) => setTalisMain(e.target.value || null)}
                        className={`${SELECT_CLASS} w-full min-w-0`}
                        title={L.equipment.talisman}
                      >
                        <option value="">{L.equipment.talisman}</option>
                        {talismanMains.map((mn) => (
                          <option key={mn.key} value={mn.key}>
                            {mn.label}
                          </option>
                        ))}
                      </select>
                      {talisMain && (
                        <span className="border-line-subtle bg-surface-sunken/70 focus-within:border-accent flex h-8 w-full min-w-0 items-center gap-0.5 rounded-lg border px-1.5">
                          <span className="text-content-subtle text-xs">+</span>
                          <input
                            type="number"
                            min={0}
                            max={10}
                            value={talisMainLv}
                            onChange={(e) =>
                              setTalisMainLv(
                                Math.min(Math.max(Math.trunc(Number(e.target.value) || 0), 0), 10),
                              )
                            }
                            className="text-content w-full min-w-0 flex-1 bg-transparent text-right font-mono text-xs font-bold tabular-nums outline-none"
                          />
                        </span>
                      )}
                    </div>
                    {talisman && (
                      <>
                        <label className="flex cursor-pointer items-center gap-2">
                          <input
                            type="checkbox"
                            checked={talismanOn}
                            onChange={() => setTalismanOn(!talismanOn)}
                            className="accent-accent h-3.5 w-3.5 cursor-pointer"
                          />
                          <EquipmentIcon
                            icon={talisman.icon}
                            grade={talisman.grade}
                            size={34}
                            stars={talisman.star}
                            overlayIcon={talisman.overlayIcon}
                          />
                          <span
                            className={`min-w-0 text-xs font-semibold wrap-break-word ${talismanOn ? 'text-content' : 'text-content-subtle'}`}
                          >
                            {talisman.label} +10
                          </span>
                        </label>
                        {talisman.text && (
                          <GameText
                            text={talisman.text}
                            className={`text-[11px] leading-relaxed whitespace-pre-line ${talismanOn ? 'text-content-muted' : 'text-content-subtle opacity-60'}`}
                          />
                        )}
                      </>
                    )}
                  </div>
                </div>
              </Card>
            )}
          </div>

          {/* ═══ COLONNE 2 — CIBLE (et l'équipe sur le terrain) ═══ */}
          <div className="min-w-0 space-y-4">
            <Card title={L.panels.target}>
              {/* Preset (donjon réel) OU saisie manuelle (Sevih 27/07/2026). */}
              <div className="border-line-subtle bg-surface-sunken/70 grid grid-cols-2 gap-1 rounded-lg border p-1">
                {(['preset', 'manual'] as const).map((tb) => (
                  <button
                    key={tb}
                    type="button"
                    className={`h-7 cursor-pointer rounded-md text-xs font-bold transition ${
                      targetTab === tb
                        ? 'bg-accent text-surface-base'
                        : 'text-content-muted hover:text-content'
                    }`}
                    onClick={() => setTargetTab(tb)}
                  >
                    {tb === 'preset' ? L.target.preset : L.target.manual}
                  </button>
                ))}
              </div>

              {targetTab === 'preset' ? (
                <div className="space-y-2">
                  <TargetPicker
                    targets={targets}
                    modes={modes}
                    value={target}
                    level={spawn?.level}
                    onPick={(id) => {
                      setTargetId(id);
                      setSpawnIdx(0);
                    }}
                    onClear={() => setTargetId(null)}
                    labels={L}
                  />

                  {target && (
                    <>
                      {target.line ? (
                        // LIGNE de guild raid : un seul sélecteur de stage qui
                        // traverse les entrées de la ligne (chaque stage est
                        // un donjon/monstre distinct → bascule de targetId) et
                        // finit sur les stages d'OVERGRADE (spawns du dernier
                        // stage templeté du main boss → bascule de spawnIdx).
                        <label className="block space-y-1">
                          <span className="text-content-subtle font-mono text-[9px] tracking-wide uppercase">
                            {L.target.stage}
                          </span>
                          <select
                            value={`${target.id}|${spawnIdx}`}
                            onChange={(e) => {
                              const sep = e.target.value.lastIndexOf('|');
                              setTargetId(e.target.value.slice(0, sep));
                              setSpawnIdx(Number(e.target.value.slice(sep + 1)));
                            }}
                            className={SELECT_CLASS}
                          >
                            {targets
                              .filter((t) => t.line === target.line)
                              .sort((a, b) => (a.stage ?? 0) - (b.stage ?? 0))
                              .flatMap((t) =>
                                t.spawns.map((s, si) => (
                                  <option key={`${t.id}|${si}`} value={`${t.id}|${si}`}>
                                    {s.label || vars(L.target.fight, { n: si + 1 })} · {L.target.lv}{' '}
                                    {s.level}
                                  </option>
                                )),
                              )}
                          </select>
                        </label>
                      ) : (
                        target.spawns.length > 1 && (
                          <label className="block space-y-1">
                            <span className="text-content-subtle font-mono text-[9px] tracking-wide uppercase">
                              {target.ranked ? L.target.rank : L.target.stage}
                            </span>
                            <select
                              value={spawnIdx}
                              onChange={(e) => setSpawnIdx(Number(e.target.value))}
                              className={SELECT_CLASS}
                            >
                              {target.spawns.map((s, i) => (
                                <option key={i} value={i}>
                                  {s.label || vars(L.target.fight, { n: i + 1 })} · {L.target.lv}{' '}
                                  {s.level}
                                </option>
                              ))}
                            </select>
                          </label>
                        )
                      )}
                      {spawn && (
                        // Stats défensives EFFECTIVES du spawn (adv/bossHp déjà
                        // appliqués) — celles qui pèsent sur les dégâts, en
                        // clair et SANS troncature (demande Sevih 27/07/2026).
                        <div className="grid grid-cols-2 gap-1.5">
                          {targetStatFields.map((f) => (
                            <div key={f.key} className={`${wellClass} min-w-0 px-2.5 py-1.5`}>
                              <span className="text-content-subtle block font-mono text-[9px] tracking-wide uppercase">
                                {f.label}
                              </span>
                              <span className="text-content block font-mono text-sm font-bold tabular-nums">
                                {f.percent
                                  ? `${(spawn.stats[f.key as keyof DcSpawn['stats']] ?? 0) / 10}%`
                                  : (
                                      spawn.stats[f.key as keyof DcSpawn['stats']] ?? 0
                                    ).toLocaleString()}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </>
                  )}
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="space-y-1">
                    <span className="text-content-subtle block font-mono text-[9px] tracking-wide uppercase">
                      {L.target.element}
                    </span>
                    <div className="flex gap-1.5">
                      {ELEMENT_ORDER.map((el) => (
                        <FilterPill
                          key={el}
                          active={tgtElement === el}
                          onClick={() => setTgtElement(tgtElement === el ? null : el)}
                          className="h-8 w-8 px-0"
                          title={el}
                        >
                          <img
                            src={img.element(el)}
                            alt={el}
                            className="h-5 w-5"
                            width={20}
                            height={20}
                          />
                        </FilterPill>
                      ))}
                    </div>
                  </div>

                  {/* Conditionnels « vs boss » — les presets sont TOUS des
                    boss, en manuel il faut le dire (Sevih 27/07/2026). */}
                  <label className="flex cursor-pointer items-center gap-2">
                    <input
                      type="checkbox"
                      checked={tgtBoss}
                      onChange={() => setTgtBoss(!tgtBoss)}
                      className="accent-accent h-3.5 w-3.5 cursor-pointer"
                    />
                    <span className="text-content-muted text-xs">{L.target.bossFlag}</span>
                  </label>

                  {/* Buffs MAX_HP (§ 16.2) : en manuel le MODE est inconnu →
                    une coche PAR buff (listes de modes différentes) ; sans
                    effet si le réglage de compte correspondant est éteint. */}
                  <label className="flex cursor-pointer items-center gap-2">
                    <input
                      type="checkbox"
                      checked={tgtGuildBuff}
                      onChange={() => setTgtGuildBuff(!tgtGuildBuff)}
                      className="accent-accent h-3.5 w-3.5 cursor-pointer"
                    />
                    <span className="text-content-muted text-xs">{L.target.guildBuffFlag}</span>
                  </label>
                  {premiumOn && (
                    <label className="flex cursor-pointer items-center gap-2">
                      <input
                        type="checkbox"
                        checked={tgtTitleBuff}
                        onChange={() => setTgtTitleBuff(!tgtTitleBuff)}
                        className="accent-accent h-3.5 w-3.5 cursor-pointer"
                      />
                      <span className="text-content-muted text-xs">{L.target.titleBuffFlag}</span>
                    </label>
                  )}

                  <div className="grid grid-cols-2 gap-2">
                    {targetStatFields.map((f) => (
                      <label key={f.key} className="min-w-0 space-y-1">
                        <span className="text-content-subtle block truncate font-mono text-[9px] tracking-wide uppercase">
                          {f.label}
                        </span>
                        <span className="border-line-subtle bg-surface-sunken/70 focus-within:border-accent flex h-8 w-full min-w-0 items-center gap-1 rounded-lg border px-2">
                          <input
                            type="text"
                            inputMode="decimal"
                            value={tgtStats[f.key] ?? ''}
                            onChange={(e) =>
                              setTgtStats((s) => ({ ...s, [f.key]: e.target.value }))
                            }
                            className="text-content w-full min-w-0 flex-1 bg-transparent font-mono text-sm font-bold tabular-nums outline-none"
                          />
                          {f.percent && <span className="text-content-subtle text-xs">%</span>}
                        </span>
                      </label>
                    ))}
                  </div>

                  {/* Pré-remplit depuis le preset sélectionné (spawn courant). */}
                  <button
                    type="button"
                    disabled={!spawn}
                    onClick={() => {
                      if (!spawn || !target) return;
                      setTgtElement(target.element);
                      setTgtStats(
                        Object.fromEntries(
                          targetStatFields.map((f) => {
                            const v = spawn.stats[f.key as keyof DcSpawn['stats']] ?? 0;
                            return [f.key, String(f.percent ? v / 10 : v)];
                          }),
                        ),
                      );
                    }}
                    className="border-line-subtle text-content-subtle not-disabled:hover:text-content h-8 w-full rounded-lg border border-dashed text-xs not-disabled:cursor-pointer disabled:opacity-40"
                  >
                    {L.target.copyFromSelected}
                  </button>
                </div>
              )}
            </Card>

            <Card
              title={L.panels.team}
              right={<span className="text-content-subtle font-mono text-[9px]">1 + 3</span>}
            >
              <div className="space-y-1.5">
                {/* Par allié : perso + transcendance + main stat du talisman
                  porté — les trois pèsent sur le rapport (Sevih 27/07/2026). */}
                {allies.map((ally, i) => {
                  const patch = (p: Partial<AllyPick>) =>
                    setAllies((all) => all.map((a, j) => (j === i ? { ...a, ...p } : a)));
                  const allyChar = ally.id ? chars.find((c) => c.id === ally.id) : undefined;
                  return (
                    <div key={i} className={ally.id ? `${wellClass} space-y-1.5 p-2` : undefined}>
                      <CharPicker
                        chars={chars.filter(
                          (c) =>
                            c.id !== attackerId && !allies.some((a, j) => j !== i && a.id === c.id),
                        )}
                        value={ally.id}
                        onPick={(id) =>
                          patch({
                            id,
                            // Palier max du perso choisi par défaut.
                            transcend: (chars.find((c) => c.id === id)?.transcend.length ?? 1) - 1,
                          })
                        }
                        onClear={() => patch({ id: null })}
                        placeholder={vars(L.team.emptySlot, { n: i + 2 })}
                        labels={L}
                        aside={
                          allyChar && allyChar.transcend.length > 0 ? (
                            <TranscendSlider
                              tiers={allyChar.transcend}
                              idx={ally.transcend}
                              onIdx={(v) => patch({ transcend: v })}
                            />
                          ) : undefined
                        }
                      />
                      {allyChar && (
                        <div className="flex items-center gap-1.5">
                          <select
                            value={ally.talisman ?? ''}
                            onChange={(e) => patch({ talisman: e.target.value || null })}
                            className={`${SELECT_CLASS} min-w-0 flex-7`}
                            title={L.equipment.talisman}
                          >
                            <option value="">{L.equipment.talisman}</option>
                            {talismanMains.map((m) => (
                              <option key={m.key} value={m.key}>
                                {m.label}
                              </option>
                            ))}
                          </select>
                          {/* Enhancement +0…+10 : le montant de la main stat en
                            dépend (Sevih 27/07/2026). */}
                          {ally.talisman && (
                            <span className="border-line-subtle bg-surface-sunken/70 focus-within:border-accent flex h-8 min-w-0 flex-3 items-center gap-0.5 rounded-lg border px-1.5">
                              <span className="text-content-subtle text-xs">+</span>
                              <input
                                type="number"
                                min={0}
                                max={10}
                                value={ally.talismanLv}
                                onChange={(e) =>
                                  patch({
                                    talismanLv: Math.min(
                                      Math.max(Math.trunc(Number(e.target.value) || 0), 0),
                                      10,
                                    ),
                                  })
                                }
                                className="text-content w-full min-w-0 flex-1 bg-transparent text-right font-mono text-xs font-bold tabular-nums outline-none"
                              />
                            </span>
                          )}
                        </div>
                      )}
                      {/* Arme / accessoire de l'allié (24/08/2026) : des
                        uniques portent des lignes MY_TEAM* (ex. +10 % vs boss
                        aux alliés) — seules celles qui ATTEIGNENT l'attaquant
                        comptent (mode allié du moteur). Breakthrough T0..T4 :
                        le niveau du passif en dépend. */}
                      {allyChar &&
                        (
                          [
                            ['weapon', 'weaponTier', weapons, L.equipment.pickWeapon],
                            ['amulet', 'amuletTier', amulets, L.equipment.pickAccessory],
                          ] as const
                        ).map(([slugKey, tierKey, catalog, placeholder]) => (
                          <div key={slugKey} className="flex items-center gap-1.5">
                            <select
                              value={ally[slugKey] ?? ''}
                              onChange={(e) => patch({ [slugKey]: e.target.value || null })}
                              className={`${SELECT_CLASS} min-w-0 flex-7`}
                              title={placeholder}
                            >
                              <option value="">{placeholder}</option>
                              {catalog
                                .filter(
                                  (g) =>
                                    !g.classLimits.length || g.classLimits.includes(allyChar.cls),
                                )
                                .map((g) => (
                                  <option key={g.slug} value={g.slug}>
                                    {g.label}
                                  </option>
                                ))}
                            </select>
                            {ally[slugKey] && (
                              <span className="border-line-subtle bg-surface-sunken/70 focus-within:border-accent flex h-8 min-w-0 flex-3 items-center gap-0.5 rounded-lg border px-1.5">
                                <span className="text-content-subtle text-xs">T</span>
                                <input
                                  type="number"
                                  min={0}
                                  max={4}
                                  value={ally[tierKey]}
                                  onChange={(e) =>
                                    patch({
                                      [tierKey]: Math.min(
                                        Math.max(Math.trunc(Number(e.target.value) || 0), 0),
                                        4,
                                      ),
                                    })
                                  }
                                  className="text-content w-full min-w-0 flex-1 bg-transparent text-right font-mono text-xs font-bold tabular-nums outline-none"
                                />
                              </span>
                            )}
                          </div>
                        ))}
                      {/* EE possédé / +10 : certains EE portent sur l'équipe
                        (Sevih 27/07/2026) — seulement si le perso en a un. */}
                      {allyChar && ees[allyChar.id] && (
                        <div className="flex items-center gap-4 px-0.5">
                          <label className="flex cursor-pointer items-center gap-1.5">
                            <input
                              type="checkbox"
                              checked={ally.ee}
                              onChange={() =>
                                patch(ally.ee ? { ee: false, eePlus: false } : { ee: true })
                              }
                              className="accent-accent h-3.5 w-3.5 cursor-pointer"
                            />
                            <span className="text-content-muted text-xs">{L.team.eeOwned}</span>
                          </label>
                          <label
                            className={`flex items-center gap-1.5 ${ally.ee ? 'cursor-pointer' : 'opacity-40'}`}
                          >
                            <input
                              type="checkbox"
                              checked={ally.eePlus}
                              disabled={!ally.ee}
                              onChange={() => patch({ eePlus: !ally.eePlus })}
                              className="accent-accent h-3.5 w-3.5 not-disabled:cursor-pointer"
                            />
                            <span className="text-content-muted text-xs">{L.team.eePlus}</span>
                          </label>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </Card>
          </div>

          {/* ═══ COLONNE 3 — RÉGLAGES (méca + buffs), puis RAPPORT dessous
            (disposition Sevih 27/07/2026 : Attaquant / Cible / Réglages, le
            résultat sous les réglages). ═══ */}
          <div className="min-w-0 space-y-4">
            {/* CONTEXTE = tout ce qui entoure le combat (fusion Sevih
              27/07/2026) : cibles touchées + buffs/débuffs de scénario. Le
              type de contenu se déduit du preset, le PvP est hors périmètre. */}
            <Card
              title={L.context.title}
              right={
                <span className="text-content-subtle font-mono text-[9px]">
                  {atkFx.length + tgtFx.length}
                </span>
              }
            >
              {/* Les buffs STANDARDISÉS du jeu, à bascule — seulement ceux qui
                pèsent sur les dégâts, filtrés comme la saisie des stats.
                DEUX colonnes avec portrait — l'attaquant et la cible — chacune
                avec ses buffs puis ses débuffs ; rien ne s'affiche tant que les
                deux combattants ne sont pas choisis (Sevih 27/07/2026). */}
              {!attacker || !targetReady ? (
                <p className="text-content-subtle px-2 py-6 text-center text-xs">
                  {L.buffs.awaitPick}
                </p>
              ) : (
                <>
                  {/* PV actuels des deux combattants — c'est du CONTEXTE (Sevih
                    27/07/2026) : sets « missing Health » côté attaquant, skills
                    sur PV max/actuels/manquants côté cible. */}
                  <div className="grid grid-cols-2 gap-2">
                    {(
                      [
                        { label: L.context.attackerHp, value: hpPct, set: setHpPct },
                        { label: L.context.targetHp, value: tgtHpPct, set: setTgtHpPct },
                      ] as const
                    ).map((f) => (
                      <label key={f.label} className="min-w-0 space-y-1">
                        <span className="text-content-subtle block truncate font-mono text-[9px] tracking-wide uppercase">
                          {f.label}
                        </span>
                        <span className="border-line-subtle bg-surface-sunken/70 focus-within:border-accent flex h-8 w-full min-w-0 items-center gap-1 rounded-lg border px-2">
                          <input
                            type="text"
                            inputMode="numeric"
                            value={f.value}
                            onChange={(e) => f.set(e.target.value)}
                            className="text-content w-full min-w-0 flex-1 bg-transparent font-mono text-sm font-bold tabular-nums outline-none"
                          />
                          <span className="text-content-subtle text-xs">%</span>
                        </span>
                      </label>
                    ))}
                  </div>

                  {/* Cible en BREAK — état de combat qui pèse via § 9.1
                    (Rogue's Charm +10, set Pulverization, EE Lv10…). */}
                  <label className="flex cursor-pointer items-center gap-2 text-xs">
                    <input
                      type="checkbox"
                      checked={tgtBroken}
                      onChange={() => setTgtBroken(!tgtBroken)}
                      className="accent-accent"
                    />
                    <span className={tgtBroken ? 'text-content' : 'text-content-muted'}>
                      {L.target.breakFlag}
                    </span>
                  </label>

                  {/* Boss ENRAGÉ (z `en`) : les buffs de son skill d'enrage
                    (ex. Chimera : DMG Reduce +40 pts) et ses passifs
                    `OWNER_RAGE` s'activent — coche visible seulement quand le
                    preset a un skill d'enrage, jamais deviné. */}
                  {target?.hasRage && (
                    <label className="flex cursor-pointer items-center gap-2 text-xs">
                      <input
                        type="checkbox"
                        checked={tgtEnraged}
                        onChange={() => setTgtEnraged(!tgtEnraged)}
                        className="accent-accent"
                      />
                      <span className={tgtEnraged ? 'text-content' : 'text-content-muted'}>
                        {L.target.enrageFlag}
                      </span>
                    </label>
                  )}

                  {/* Mécaniques PERSO (entrées `stateful` du moteur) : conditions
                    d'état de combat des passifs kit/EE/quirks — ex. les 5 Kaizer
                    Energy du S3 de Noa. Jamais évaluées par le moteur
                    (CheckAvailable § 12.1) : la coche déclare « remplie en jeu »
                    et voyage dans z (`cs`). Libellé = nom du jeu de la source. */}
                  {statefulPassives.length > 0 && (
                    <div className="space-y-1">
                      <span className="text-content-subtle font-mono text-[9px] tracking-wide uppercase">
                        {L.context.mechanics}
                      </span>
                      <p className="text-content-subtle text-[10px]">{L.context.mechanicsHint}</p>
                      {statefulPassives.map((e) => {
                        const m = mechLabel(e);
                        const cond = mechCond(e);
                        const on = metConds.includes(e.buffId);
                        return (
                          <label
                            key={`${e.source}:${e.sourceId}:${e.buffId}`}
                            title={`${e.buffId}${e.condition ? ` · ${e.condition}` : ''}`}
                            className="flex cursor-pointer items-center gap-2 text-xs"
                          >
                            <input
                              type="checkbox"
                              checked={on}
                              onChange={() => toggleFx(setMetConds, e.buffId)}
                              className="accent-accent"
                            />
                            <span className={on ? 'text-content' : 'text-content-muted'}>
                              {m.name}
                            </span>
                            {m.slot && (
                              <span className="text-content-subtle font-mono text-[9px]">
                                {m.slot}
                              </span>
                            )}
                            {cond && (
                              <span className="text-content-subtle flex flex-wrap items-center gap-1 text-[10px]">
                                — {cond.pre}
                                {cond.ref && <EffectRefTag r={cond.ref} />}
                                {cond.post}
                              </span>
                            )}
                          </label>
                        );
                      })}
                    </div>
                  )}

                  {/* Procs dynamiques à STACKS (kit/EE/quirks du porteur +
                    alliés) qui atteignent l'attaquant : jamais simulés — le
                    stepper déclare les stacks posés EN JEU (z `ab`, plafond
                    = StackCount de la ligne). Prouvé 23/08/2026 : 1 S2
                    d'Eris = 1 stack du +20 % Strikers, S1 de Francesca
                    exact. */}
                  {stackableDynamics.length > 0 && (
                    <div className="space-y-1">
                      <span className="text-content-subtle font-mono text-[9px] tracking-wide uppercase">
                        {L.context.stackBuffs}
                      </span>
                      <p className="text-content-subtle text-[10px]">{L.context.stackBuffsHint}</p>
                      {stackableDynamics.map((d) => {
                        const n = stackDecls[d.buffId] ?? 0;
                        const max = d.maxStacks ?? 1;
                        const m = dynLabel(d);
                        const eff = dynEffect(d);
                        return (
                          <label
                            key={`${d.ally ?? ''}:${d.buffId}`}
                            title={`${d.buffId} · ${d.createType}`}
                            className="flex items-center justify-between gap-2 text-xs"
                          >
                            <span
                              className={`flex min-w-0 flex-wrap items-center gap-1.5 ${n > 0 ? 'text-content' : 'text-content-muted'}`}
                            >
                              {m.name}
                              {m.slot && (
                                <span className="text-content-subtle font-mono text-[9px]">
                                  {m.slot}
                                </span>
                              )}
                              <span className="text-content-subtle flex items-center gap-1 text-[10px]">
                                —{d.targetClass && (L.context.classNames[d.targetClass] ?? '')}
                                {eff.ref && <EffectRefTag r={eff.ref} />}
                                {eff.what}
                                <span className="font-mono">{eff.amount}</span>
                                {max > 1 ? vars(L.context.stackMax, { n: max }) : ''}
                              </span>
                            </span>
                            <span className="border-line-subtle bg-surface-sunken/70 focus-within:border-accent flex h-7 w-16 items-center rounded-lg border px-2">
                              <input
                                type="text"
                                inputMode="numeric"
                                value={String(n)}
                                onChange={(e) => {
                                  const v = Number(e.target.value);
                                  const next = Number.isFinite(v)
                                    ? Math.min(Math.max(Math.round(v), 0), max)
                                    : 0;
                                  setStackDecls((all) => {
                                    if (next === 0) {
                                      const rest = { ...all };
                                      delete rest[d.buffId];
                                      return rest;
                                    }
                                    return { ...all, [d.buffId]: next };
                                  });
                                }}
                                className="text-content w-full min-w-0 bg-transparent text-right font-mono text-sm font-bold tabular-nums outline-none"
                              />
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  )}

                  {/* Cibles touchées : SEULEMENT si le kit a un skill offensif
                    multi-cible — la décroissance AoE ne concerne pas les kits
                    mono-cible (décision Sevih 27/07/2026). */}
                  {offensiveSkills.some((s) => s.aoe) && (
                    <div className="space-y-1">
                      <span className="text-content-subtle font-mono text-[9px] tracking-wide uppercase">
                        {L.context.targetsHit}
                      </span>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4].map((n) => (
                          <button
                            key={n}
                            type="button"
                            className={`h-7 flex-1 cursor-pointer rounded-md border font-mono text-xs font-bold transition ${
                              targetsHit === n
                                ? 'border-accent bg-accent/15 text-accent'
                                : 'border-line-subtle bg-surface-sunken/70 text-content-subtle hover:text-content'
                            }`}
                            onClick={() => setTargetsHit(n)}
                          >
                            {n}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Compteurs § 9.1 (« ×N buffs/débuffs ») — visibles quand un
                    passif du rapport LIT la famille : le scénario déclare les
                    nombres EN JEU (chips comprises), le moteur ne compte
                    jamais à la place du joueur. */}
                  {counterInputs.length > 0 && (
                    <div className="space-y-1">
                      <span className="text-content-subtle font-mono text-[9px] tracking-wide uppercase">
                        {L.context.counters}
                      </span>
                      <p className="text-content-subtle text-[10px]">{L.context.countersHint}</p>
                      {counterInputs.map((c) => (
                        <label
                          key={c.type}
                          className="flex items-center justify-between gap-2 text-xs"
                        >
                          <span className={c.value > 0 ? 'text-content' : 'text-content-muted'}>
                            {c.label}
                          </span>
                          <span className="border-line-subtle bg-surface-sunken/70 focus-within:border-accent flex h-7 w-16 items-center rounded-lg border px-2">
                            <input
                              type="text"
                              inputMode="numeric"
                              value={String(c.value)}
                              onChange={(e) => {
                                const n = Number(e.target.value);
                                const max = 'max' in c ? c.max : 20;
                                c.set(
                                  Number.isFinite(n)
                                    ? Math.min(Math.max(Math.round(n), 0), max)
                                    : 0,
                                );
                              }}
                              className="text-content w-full min-w-0 bg-transparent text-right font-mono text-sm font-bold tabular-nums outline-none"
                            />
                          </span>
                        </label>
                      ))}
                    </div>
                  )}

                  <div className="grid gap-2 sm:grid-cols-2">
                    {(
                      [
                        {
                          key: 'atk',
                          portrait: <CharPortrait c={attacker} className="h-16 w-16" />,
                          name: attacker.label,
                          groups: [
                            { title: L.buffs.atkBuff, options: buffOptions.atkBuff },
                            { title: L.buffs.atkDebuff, options: buffOptions.atkDebuff },
                          ],
                          on: atkFx,
                          set: setAtkFx,
                          passives: bossPassivesFor('attacker'),
                        },
                        {
                          key: 'tgt',
                          portrait: target ? (
                            // Le MÊME composant portrait que le picker et la
                            // tuile de cible (fond de rareté + overlays, rôle
                            // de la donnée — un renfort n'a pas le badge boss).
                            <MonsterPortrait
                              tg={target}
                              level={spawn?.level}
                              className="h-16 w-16"
                            />
                          ) : tgtElement ? (
                            <span className="border-line-subtle grid h-16 w-16 shrink-0 place-items-center rounded-lg border">
                              <img
                                src={img.element(tgtElement)}
                                alt={tgtElement}
                                className="h-8 w-8"
                              />
                            </span>
                          ) : (
                            <span className="border-line-subtle text-content-subtle grid h-16 w-16 shrink-0 place-items-center rounded-lg border text-lg font-bold">
                              ?
                            </span>
                          ),
                          name: target ? target.name : L.target.manual,
                          groups: [
                            { title: L.buffs.tgtBuff, options: buffOptions.tgtBuff },
                            { title: L.buffs.tgtDebuff, options: buffOptions.tgtDebuff },
                          ],
                          on: tgtFx,
                          set: setTgtFx,
                          passives: bossPassivesFor('target'),
                        },
                      ] as const
                    ).map((side) => (
                      <div key={side.key} className={`${wellClass} space-y-2 p-2.5`}>
                        <div className="flex items-center gap-2">
                          {side.portrait}
                          <span className="text-content min-w-0 text-xs font-semibold wrap-break-word">
                            {side.name}
                          </span>
                        </div>
                        {side.groups.map((group) => (
                          <div key={group.title} className="space-y-1">
                            <Eyebrow>{group.title}</Eyebrow>
                            <div className="flex flex-wrap gap-1.5">
                              {relevantFx(group.options).map((o) => {
                                const on = side.on.includes(o.key);
                                return (
                                  <button
                                    key={o.key}
                                    type="button"
                                    aria-pressed={on}
                                    title={o.desc}
                                    onClick={() => toggleFx(side.set, o.key)}
                                    className={`flex cursor-pointer items-center gap-1.5 rounded-lg border px-2 py-1 text-xs transition ${
                                      on
                                        ? o.debuff
                                          ? 'border-danger bg-danger/10 text-content'
                                          : 'border-accent bg-accent/10 text-content'
                                        : 'border-line-subtle bg-surface-raised/70 text-content-muted hover:text-content'
                                    }`}
                                  >
                                    <EffectIconTile
                                      icon={o.icon}
                                      isDebuff={o.debuff}
                                      className="h-5 w-5"
                                    />
                                    <span>{o.name}</span>
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        ))}
                        {side.passives.some(bossPassiveShown) && (
                          <div className="space-y-1">
                            <Eyebrow>{L.buffs.bossPassive}</Eyebrow>
                            <div className="flex flex-wrap gap-1.5">
                              {/* Seules les chips ACTIVES pour ce matchup ET qui
                                pèsent un montant sont montrées — pas les 3
                                variantes élémentaires quand une seule concerne
                                l'attaquant, pas la crit chance quand le kit ne
                                la lit pas (Sevih 17/08/2026). */}
                              {side.passives.filter(bossPassiveShown).map((p, i) => (
                                <span
                                  key={`${p.name}:${p.label}:${i}`}
                                  title={p.name}
                                  className={`flex items-center gap-1.5 rounded-lg border px-2 py-1 text-xs ${
                                    side.key === 'atk'
                                      ? 'border-danger bg-danger/10 text-content'
                                      : 'border-accent bg-accent/10 text-content'
                                  }`}
                                >
                                  <span className="font-semibold">{p.name}</span>
                                  <span>{p.label}</span>
                                  {p.cond && (
                                    <span className="text-[10px] opacity-75">· {p.cond}</span>
                                  )}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  <button
                    type="button"
                    disabled
                    className="border-line-subtle text-content-subtle h-8 w-full cursor-not-allowed rounded-lg border border-dashed text-xs"
                    title={L.buffs.kitsSoon}
                  >
                    {L.buffs.fromKits} · {L.buffs.kitsSoon}
                  </button>

                  {/* Stats FINALES des deux combattants — SORTIE du moteur :
                    attaquant = combatStats § 16.1 (affinité, chips, passifs de
                    boss, MAX_HP § 16.2 appliqués) ; cible = les entrées
                    effectives que le moteur consomme (spawn ou saisie). */}
                  <div className={`${wellClass} space-y-1.5 p-2.5`}>
                    <div className="flex items-baseline gap-2">
                      <span className="text-accent font-mono text-[10px] font-bold tracking-wide uppercase">
                        {L.stats.final}
                      </span>
                      <span className="text-content-subtle text-[10px]">{L.stats.finalNote}</span>
                    </div>
                    <div className="grid gap-x-4 gap-y-1.5 sm:grid-cols-2">
                      {(
                        [
                          {
                            title: L.panels.attacker,
                            fields: sheetFields,
                            values: (report?.combatStats ?? {}) as Record<
                              string,
                              number | undefined
                            >,
                          },
                          {
                            title: L.panels.target,
                            fields: targetStatFields,
                            values: (scenarioInputs.target?.stats ?? {}) as Record<
                              string,
                              number | undefined
                            >,
                          },
                        ] as const
                      ).map((col) => (
                        <div key={col.title} className="min-w-0 space-y-0.5">
                          <span className="text-content-subtle block font-mono text-[9px] tracking-wide uppercase">
                            {col.title}
                          </span>
                          {col.fields.map((f) => (
                            <span key={f.key} className="flex items-baseline gap-2 text-[11px]">
                              <span className="text-content-subtle truncate">{f.label}</span>
                              <span className="flex-1" />
                              <span
                                className={`font-mono font-bold tabular-nums ${
                                  col.values[f.key] !== undefined
                                    ? 'text-content'
                                    : 'text-content-muted'
                                }`}
                              >
                                {fmtStat(col.values[f.key], f.percent)}
                              </span>
                            </span>
                          ))}
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </Card>

            <ResultTable
              attacker={attacker}
              kit={kit}
              supportSkills={supportSkills}
              report={report}
              skillLvls={skillLvls}
              lang={lang}
              devMode={devMode}
              branchOn={branchOn}
              setBranchOn={setBranchOn}
              obs={obs}
              setObs={setObs}
              saveCell={saveCell}
              effectRefs={effectRefs}
              dmgData={dmgData}
              dmgErr={dmgErr}
              labels={L}
            />
          </div>
        </div>
      )}

      {/* Cycle de capture (harnais) : sauvegarde + brouillons de scénarios —
        la saisie « en jeu » vit DANS la table Résultat ci-dessus (checkbox par
        colonne de branche). AU-DESSUS du panneau Debug (Sevih 05/08/2026). */}
      {tab === 'calc' && devMode && (
        <ScenariosPanel
          savedScns={savedScns}
          savedCalcMap={savedCalcMap}
          loadSaved={loadSaved}
          copyScenario={copyScenario}
          deleteScenario={deleteScenario}
          importOpen={importOpen}
          setImportOpen={setImportOpen}
          importTxt={importTxt}
          setImportTxt={setImportTxt}
          importScenarios={importScenarios}
          flash={flash}
        />
      )}

      {/* HARNAIS (Sevih 27/07/2026) — spec docs/specs/damage-debug-harness.md ;
        libellés en dur (§ 5). Branché sur le moteur : l'état courant passe par
        le pont partagé (buildInputsFromZ) — le même chemin que fixtures.test.ts. */}
      {tab === 'calc' && devMode && (
        <DebugHarness
          state={debugState}
          skills={offensiveSkills.map((s) => ({ slot: s.slot, name: s.name }))}
          zState={buildZ()}
          resolvePreset={resolvePresetLocal}
          resolveGear={resolveGearLocal}
          resolveTalismanMain={resolveTalisMainLocal}
          codexLevel={codexLvl}
          guildLevel={guildLvl}
          premiumHp={premiumOn}
          includeMiss={branchOn.miss}
          quirks={activeQuirks}
          data={dmgData}
          dataErr={dmgErr}
        />
      )}
    </div>
  );
}
