'use client';

/**
 * État du SCÉNARIO du Damage Calculator + persistance URL `?z=` — extrait du
 * composant principal (audit D4 phase 2, 25/08/2026 — déplacement mécanique,
 * logique inchangée). Le hook possède :
 *   - tous les états du scénario (attaquant, équipement, cible, contexte) et
 *     les réglages de COMPTE (quirks/codex/guilde/titre, localStorage) ;
 *   - `devMode` (harnais : build de dev, ou `?dev=1` lu à l'hydratation) et
 *     `obs` (saisies « en jeu » de la table Résultat — `resetScenario` les
 *     vide avec le reste du scénario, c'est pour ça qu'elles vivent ici) ;
 *   - le cycle `?z=` complet : `applyZ` (hydratation au mount, « Charger » du
 *     harnais — les deux chemins restent d'accord), `buildZ`/`packZ` (état
 *     courant, jamais en retard de debounce), l'écriture d'URL débouncée et
 *     `flushShareUrl` (bouton copier).
 * Le composant principal DESTRUCTURE le retour sous les MÊMES noms que les
 * anciens useState : le JSX n'a pas bougé d'une ligne.
 */
import { useEffect, useRef, useState } from 'react';
import LZString from 'lz-string';
import { ELEMENT_ORDER } from '@/lib/images';
import { useStoredState } from '@/lib/client-storage';
import { type CalculatorUrlState as UrlState } from '@/lib/damage/scenario';
import { EMPTY_ALLY, type AllyPick, type Props, type SetPick } from './contracts';
import { CODEX_STORE, DEV_BUILD, GUILD_STORE, PREMIUM_STORE, QUIRKS_STORE } from './stores';

export function useScenarioState({
  chars,
  kits,
  weapons,
  amulets,
  sets,
  talismanMains,
  targets,
}: Pick<Props, 'chars' | 'kits' | 'weapons' | 'amulets' | 'sets' | 'talismanMains' | 'targets'>) {
  const [attackerId, setAttackerId] = useState<string | null>(null);
  // INDEX dans les paliers de transcendance du perso (défaut : palier max).
  const [transcend, setTranscend] = useState(0);
  const [skillLvls, setSkillLvls] = useState<Record<string, number>>({});
  // Sets choisis (0 à 2) : 4 pièces d'armure au total → un seul 4P, ou 2P+2P.
  const [setPicks, setSetPicks] = useState<SetPick[]>([]);
  const [weaponSlug, setWeaponSlug] = useState<string | null>(null);
  const [weaponTier, setWeaponTier] = useState(0);
  const [amuletSlug, setAmuletSlug] = useState<string | null>(null);
  const [amuletTier, setAmuletTier] = useState(0);
  // Rogue's Charm +10 : simple interrupteur (lignes spéciales — dégâts vs break).
  const [talismanOn, setTalismanOn] = useState(false);
  // Main stat du talisman du PORTEUR (buff d'ÉQUIPE § 15, 24/08/2026) +
  // enhancement +0..+10 (le montant de la main en dépend, 11 niveaux du 6★).
  const [talisMain, setTalisMain] = useState<string | null>(null);
  const [talisMainLv, setTalisMainLv] = useState(10);
  // EE possédé ou non — +0 ≠ absent : le passif Lv0 s'applique dès qu'on le porte.
  const [eeOwned, setEeOwned] = useState(true);
  // Niveau d'enchant de l'EE (+0..+10) — ne sert qu'aux mains « dégâts vs élément ».
  const [eeLevel, setEeLevel] = useState(10);
  // Affinité (Trust) : la SAISIE est le niveau 0..100 (paliers tous les 20 —
  // Sevih 03/08/2026), le palier 0..5 dérivé sert seul aux calculs. Buffs
  // passifs plats ABSENTS de la fiche affichée (canal buffValue, binaire
  // 27/07/2026) : le moteur les ajoute.
  const [affinityLvl, setAffinityLvl] = useState(0);
  const affinityTier = Math.floor(affinityLvl / 20);
  // Niveau du perso (1..120, défaut 120) : le terme Codex de la reconstruction
  // fiche → combat (spec formule § 16.1, `sheetToCombatStat`) exige la stat de
  // BASE, donc le niveau (demande Sevih 03/08/2026).
  const [level, setLevel] = useState(120);
  const [statVals, setStatVals] = useState<Record<string, string>>({});
  const [quirkLvls, setQuirkLvls] = useStoredState(QUIRKS_STORE);
  const [codexLvl, setCodexLvl] = useStoredState(CODEX_STORE);
  const [guildLvl, setGuildLvl] = useStoredState(GUILD_STORE);
  const [premiumOn, setPremiumOn] = useStoredState(PREMIUM_STORE);
  // Cible : preset (donjon réel) OU saisie manuelle — le type de contenu se
  // DÉDUIT du preset choisi, le PvP est hors périmètre (Sevih 27/07/2026).
  const [targetTab, setTargetTab] = useState<'preset' | 'manual'>('preset');
  const [targetId, setTargetId] = useState<string | null>(null);
  const [spawnIdx, setSpawnIdx] = useState(0);
  // Cible MANUELLE : élément + stats défensives (mêmes champs que le preset)
  // + flag boss (conditionnels « vs boss » — les presets sont TOUS des boss).
  const [tgtElement, setTgtElement] = useState<string | null>(null);
  const [tgtStats, setTgtStats] = useState<Record<string, string>>({});
  const [tgtBoss, setTgtBoss] = useState(false);
  // Buffs MAX_HP en MANUEL : le mode du contenu est inconnu → une coche
  // explicite PAR buff, leurs listes de modes diffèrent (en preset, le mode
  // du donjon décide seul — spec § 16.2).
  const [tgtGuildBuff, setTgtGuildBuff] = useState(false);
  const [tgtTitleBuff, setTgtTitleBuff] = useState(false);
  // Cible en BREAK (jauge détruite) — contexte § 9.1 (Rogue's Charm +10,
  // set Pulverization, EE Lv10…) ; vaut pour preset ET manuel.
  const [tgtBroken, setTgtBroken] = useState(false);
  // Boss ENRAGÉ (z `en`) : buffs du skill d'enrage + passifs `OWNER_RAGE`
  // actifs (moteur passives.ts) — coche visible quand le preset a un skill
  // d'enrage (`hasRage`), jamais deviné.
  const [tgtEnraged, setTgtEnraged] = useState(false);
  // PV actuels de la cible (%) — skills qui tapent sur PV max/actuels/manquants.
  const [tgtHpPct, setTgtHpPct] = useState('100');
  const [targetsHit, setTargetsHit] = useState(1);
  const [allies, setAllies] = useState<AllyPick[]>([EMPTY_ALLY, EMPTY_ALLY, EMPTY_ALLY]);
  // Stacks déclarés des procs DYNAMIQUES qui atteignent l'attaquant — son
  // propre kit/EE/quirks comme ses alliés (buffId → stacks, z `ab`) : le
  // moteur ne simule jamais un proc, le joueur déclare l'état du combat
  // (prouvé 23/08/2026 : 1 S2 d'Eris = 1 stack du +20 % Strikers).
  const [stackDecls, setStackDecls] = useState<Record<string, number>>({});
  // Buffs/débuffs de scénario ACTIFS (clés de DcBuffOption), par côté.
  const [atkFx, setAtkFx] = useState<string[]>([]);
  const [tgtFx, setTgtFx] = useState<string[]>([]);
  // Conditions d'ÉTAT déclarées remplies (z `cs`, buffIds) — mécaniques perso
  // (entrées `stateful` de gear.ts) ; toggles dans le harnais.
  const [metConds, setMetConds] = useState<string[]>([]);
  // Compteurs § 9.1 DÉCLARÉS (« ×N buffs/débuffs » — z `ob`/`od`/`ot`/`db`/
  // `dd`) : jamais dérivés des chips (elles ne couvrent pas tous les états du
  // jeu) ; steppers visibles seulement quand un passif LIT la famille.
  const [atkBuffN, setAtkBuffN] = useState(0);
  const [atkDebuffN, setAtkDebuffN] = useState(0);
  const [atkTeamBuffN, setAtkTeamBuffN] = useState(0);
  const [tgtBuffN, setTgtBuffN] = useState(0);
  const [tgtDebuffN, setTgtDebuffN] = useState(0);
  // PV actuels de l'attaquant (%) — ne sert qu'aux sets « missing Health ».
  const [hpPct, setHpPct] = useState('100');

  // Harnais visible : toujours en build de dev, opt-in `?dev=1` en prod (beta
  // testeurs). Posé APRÈS le mount (lecture d'URL) — le SSR rend sans harnais.
  const [devMode, setDevMode] = useState(DEV_BUILD);
  // `obs` : valeur constatée EN JEU par ligne, clé `slot|branch` (flattenReport).
  const [obs, setObs] = useState<Record<string, string>>({});

  const pickAttacker = (id: string) => {
    setAttackerId(id);
    setTranscend((chars.find((c) => c.id === id)?.transcend.length ?? 1) - 1);
    setAffinityLvl(0);
    const lvls: Record<string, number> = {};
    for (const row of kits[id] ?? []) lvls[row.slot] = row.maxLevel;
    setSkillLvls(lvls);
    setWeaponSlug(null);
    setAmuletSlug(null);
    setEeOwned(true);
    setEeLevel(10);
  };

  // Reset du SCÉNARIO (Sevih 27/07/2026) — les quirks (réglage de COMPTE) et
  // l'onglet courant ne bougent pas ; l'URL se nettoie via l'effet débouncé.
  const resetScenario = () => {
    setAttackerId(null);
    setTranscend(0);
    setAffinityLvl(0);
    setLevel(120);
    setSkillLvls({});
    setSetPicks([]);
    setWeaponSlug(null);
    setWeaponTier(0);
    setAmuletSlug(null);
    setAmuletTier(0);
    setTalismanOn(false);
    setTalisMain(null);
    setTalisMainLv(10);
    setEeOwned(true);
    setEeLevel(10);
    setStatVals({});
    setHpPct('100');
    setTargetTab('preset');
    setTargetId(null);
    setSpawnIdx(0);
    setTgtElement(null);
    setTgtStats({});
    setTgtBoss(false);
    setTgtBroken(false);
    setTgtEnraged(false);
    setTgtGuildBuff(false);
    setTgtTitleBuff(false);
    setTgtHpPct('100');
    setTargetsHit(1);
    setAllies([EMPTY_ALLY, EMPTY_ALLY, EMPTY_ALLY]);
    setStackDecls({});
    setAtkFx([]);
    setTgtFx([]);
    setMetConds([]);
    setAtkBuffN(0);
    setAtkDebuffN(0);
    setAtkTeamBuffN(0);
    setTgtBuffN(0);
    setTgtDebuffN(0);
    // Cycle de capture (dev) : un nouveau scénario repart d'observés vides.
    setObs({});
  };

  // ── Persistance URL (`?z=` lz-string, motif team-planner) ────────────────
  // Hydratation UNE fois au mount, puis écriture DÉBOUNCÉE à chaque
  // changement : un refresh ne perd plus le scénario (demande Sevih
  // 27/07/2026). Les QUIRKS restent en localStorage — réglage de COMPTE.
  const didHydrate = useRef(false);
  // Applique un état `?z=` DÉCOMPRESSÉ aux états du scénario — revalidation
  // complète (ids inconnus écartés, nombres bornés) : l'entrée vient de l'URL
  // ou d'un scénario sauvegardé, jamais fiable. Partagé entre l'hydratation au
  // mount et « Charger » du harnais (les deux chemins restent d'accord).
  const applyZ = (st: UrlState) => {
    const char = st.a ? chars.find((c) => c.id === st.a) : undefined;
    if (char) {
      setAttackerId(char.id);
      const maxIdx = Math.max(char.transcend.length - 1, 0);
      setTranscend(typeof st.x === 'number' ? Math.min(Math.max(st.x, 0), maxIdx) : maxIdx);
      // `af` = NIVEAU 0..100 depuis le 03/08/2026 (avant : palier 0..5 —
      // outil unlisted, pas de rétrocompat des vieilles URLs).
      if (typeof st.af === 'number') setAffinityLvl(Math.min(Math.max(st.af, 0), 100));
      if (typeof st.lv === 'number') setLevel(Math.min(Math.max(st.lv, 1), 120));
      const lvls: Record<string, number> = {};
      for (const row of kits[char.id] ?? []) {
        const v = st.k?.[row.slot];
        lvls[row.slot] =
          typeof v === 'number' ? Math.min(Math.max(v, 1), row.maxLevel) : row.maxLevel;
      }
      setSkillLvls(lvls);
      if (st.w && weapons.some((x) => x.slug === st.w)) setWeaponSlug(st.w);
      if (typeof st.y === 'number') setWeaponTier(Math.min(Math.max(st.y, 0), 4));
      if (st.m && amulets.some((x) => x.slug === st.m)) setAmuletSlug(st.m);
      if (typeof st.q === 'number') setAmuletTier(Math.min(Math.max(st.q, 0), 4));
      if (Array.isArray(st.s))
        setSetPicks(
          st.s
            .filter(
              (p): p is [string, number] => Array.isArray(p) && sets.some((x) => x.id === p[0]),
            )
            .slice(0, 2)
            .map(([setId, tier]) => ({ setId, tier: tier ? 1 : 0 })),
        );
      if (st.t) setTalismanOn(true);
      if (typeof st.tm === 'string' && talismanMains.some((mn) => mn.key === st.tm)) {
        setTalisMain(st.tm);
        if (typeof st.tml === 'number') setTalisMainLv(Math.min(Math.max(st.tml, 0), 10));
      }
      if (st.eo === 0) setEeOwned(false);
      if (typeof st.e === 'number') setEeLevel(Math.min(Math.max(st.e, 0), 10));
      if (st.v && typeof st.v === 'object')
        setStatVals(
          Object.fromEntries(Object.entries(st.v).filter(([, v]) => typeof v === 'string')),
        );
      if (typeof st.h === 'string') setHpPct(st.h);
      if (Array.isArray(st.b)) setAtkFx(st.b.filter((x): x is string => typeof x === 'string'));
      if (Array.isArray(st.d)) setTgtFx(st.d.filter((x): x is string => typeof x === 'string'));
      if (Array.isArray(st.cs))
        setMetConds(st.cs.filter((x): x is string => typeof x === 'string'));
      // Compteurs § 9.1 côté attaquant — mêmes bornes que le pont scenario.ts.
      if (typeof st.ob === 'number') setAtkBuffN(Math.min(Math.max(st.ob, 0), 20));
      if (typeof st.od === 'number') setAtkDebuffN(Math.min(Math.max(st.od, 0), 20));
      if (typeof st.ot === 'number') setAtkTeamBuffN(Math.min(Math.max(st.ot, 0), 40));
    }
    if (st.g) setTargetTab('manual');
    if (st.ti && targets.some((tg) => tg.id === st.ti)) {
      setTargetId(st.ti);
      if (typeof st.si === 'number') setSpawnIdx(Math.max(st.si, 0));
    }
    if (st.te && (ELEMENT_ORDER as readonly string[]).includes(st.te)) setTgtElement(st.te);
    if (st.tv && typeof st.tv === 'object')
      setTgtStats(
        Object.fromEntries(Object.entries(st.tv).filter(([, v]) => typeof v === 'string')),
      );
    if (st.tb) setTgtBoss(true);
    if (st.bk) setTgtBroken(true);
    if (st.en) setTgtEnraged(true);
    if (st.gb) setTgtGuildBuff(true);
    if (st.pb) setTgtTitleBuff(true);
    if (typeof st.th === 'string') setTgtHpPct(st.th);
    if (typeof st.db === 'number') setTgtBuffN(Math.min(Math.max(st.db, 0), 20));
    if (typeof st.dd === 'number') setTgtDebuffN(Math.min(Math.max(st.dd, 0), 20));
    if (typeof st.n === 'number') setTargetsHit(Math.min(Math.max(st.n, 1), 4));
    if (Array.isArray(st.al))
      setAllies(
        Array.from({ length: 3 }, (_, i) => {
          const row = st.al?.[i];
          if (!Array.isArray(row)) return EMPTY_ALLY;
          const [id, tx, tal, tlv, eo, ep, w, wy, m, mq] = row;
          const c = typeof id === 'string' ? chars.find((x) => x.id === id) : undefined;
          if (!c) return EMPTY_ALLY;
          const maxIdx = Math.max(c.transcend.length - 1, 0);
          const ee = typeof eo === 'number' ? Boolean(eo) : true;
          return {
            id: c.id,
            transcend: typeof tx === 'number' ? Math.min(Math.max(tx, 0), maxIdx) : maxIdx,
            talisman:
              typeof tal === 'string' && talismanMains.some((mn) => mn.key === tal) ? tal : null,
            talismanLv: typeof tlv === 'number' ? Math.min(Math.max(tlv, 0), 10) : 10,
            ee,
            eePlus: ee && (typeof ep === 'number' ? Boolean(ep) : true),
            weapon: typeof w === 'string' && weapons.some((x) => x.slug === w) ? w : null,
            weaponTier: typeof wy === 'number' ? Math.min(Math.max(wy, 0), 4) : 0,
            amulet: typeof m === 'string' && amulets.some((x) => x.slug === m) ? m : null,
            amuletTier: typeof mq === 'number' ? Math.min(Math.max(mq, 0), 4) : 0,
          };
        }),
      );
    if (Array.isArray(st.ab))
      setStackDecls(
        Object.fromEntries(
          st.ab.filter(
            (r): r is [string, number] =>
              Array.isArray(r) && typeof r[0] === 'string' && typeof r[1] === 'number' && r[1] > 0,
          ),
        ),
      );
  };

  // Hydratation `?z=` UNE fois au mount — SANS tableau de deps, à dessein :
  // le garde `didHydrate` ne laisse passer que le premier rendu, et l'effet
  // voit toujours l'`applyZ` du rendu courant (pas de liste de deps à tenir).
  useEffect(() => {
    if (didHydrate.current) return;
    didHydrate.current = true;
    const params = new URLSearchParams(window.location.search);
    // `?dev=1` (avant `z` dans les liens partagés) : active le harnais en
    // production — lu AVANT le retour anticipé, un lien peut n'avoir que lui.
    if (params.get('dev') === '1') {
      void Promise.resolve().then(() => setDevMode(true));
    }
    const zRaw = params.get('z');
    if (!zRaw) return;
    let parsed: UrlState | null = null;
    try {
      parsed = JSON.parse(
        LZString.decompressFromEncodedURIComponent(zRaw) || 'null',
      ) as UrlState | null;
    } catch {
      parsed = null;
    }
    if (!parsed || typeof parsed !== 'object') return;
    const st = parsed;
    // Règle set-state-in-effect : la pose d'état est déférée en microtâche.
    void Promise.resolve().then(() => applyZ(st));
  });

  // « Charger » du harnais : rejoue un scénario SAUVEGARDÉ dans le calculateur
  // entier — reset puis applyZ (un champ absent de z doit retrouver sa valeur
  // par défaut, pas celle du scénario précédent). Les réglages de COMPTE
  // capturés (codex/guilde/titre) sont REPOSÉS : le recalcul doit reproduire
  // la capture, pas l'état courant du compte.
  const loadScenario = (f: {
    z: string;
    codex?: number;
    guild?: number;
    premium?: boolean;
    quirks?: Record<string, number>;
  }): boolean => {
    let st: UrlState | null = null;
    try {
      st = JSON.parse(LZString.decompressFromEncodedURIComponent(f.z) || 'null') as UrlState | null;
    } catch {
      st = null;
    }
    if (!st || typeof st !== 'object') return false;
    resetScenario();
    applyZ(st);
    setCodexLvl(f.codex ?? 0);
    setGuildLvl(f.guild ?? 0);
    setPremiumOn(f.premium === true);
    // Quirks capturés avec le scénario : restaurés tels quels (réglage de
    // compte — un scénario d'un autre compte doit rejouer SES quirks). Un
    // scénario SANS quirks (capturé avant le branchement) ne dit rien : on ne
    // touche pas aux réglages courants — le re-tamponnage (« Charger » puis
    // `+`) refige alors la ligne AVEC les quirks du compte.
    if (f.quirks) {
      setQuirkLvls(Object.fromEntries(Object.entries(f.quirks).map(([k, v]) => [Number(k), v])));
    }
    return true;
  };

  // État d'URL COURANT — partagé entre l'effet débouncé, le bouton « copier
  // le lien », la capture de fixture ET le rapport du harnais : aucun d'eux
  // ne doit lire une URL en retard de debounce (Sevih 27/07/2026). `buildZ`
  // rend l'OBJET (le pont z → moteur le consomme), `packZ` le compresse.
  const buildZ = (): UrlState => {
    const z: UrlState = {};
    if (attackerId) {
      z.a = attackerId;
      z.x = transcend;
      if (affinityLvl) z.af = affinityLvl;
      if (level !== 120) z.lv = level;
      z.k = skillLvls;
      if (weaponSlug) {
        z.w = weaponSlug;
        if (weaponTier) z.y = weaponTier;
      }
      if (amuletSlug) {
        z.m = amuletSlug;
        if (amuletTier) z.q = amuletTier;
      }
      if (setPicks.length) z.s = setPicks.map((p) => [p.setId, p.tier]);
      if (talismanOn) z.t = 1;
      if (talisMain) {
        z.tm = talisMain;
        if (talisMainLv !== 10) z.tml = talisMainLv;
      }
      if (!eeOwned) z.eo = 0;
      if (eeLevel !== 10) z.e = eeLevel;
      const vals = Object.fromEntries(Object.entries(statVals).filter(([, v]) => v !== ''));
      if (Object.keys(vals).length) z.v = vals;
      if (hpPct !== '100') z.h = hpPct;
      if (atkFx.length) z.b = atkFx;
      if (tgtFx.length) z.d = tgtFx;
      if (metConds.length) z.cs = metConds;
      if (atkBuffN > 0) z.ob = atkBuffN;
      if (atkDebuffN > 0) z.od = atkDebuffN;
      if (atkTeamBuffN > 0) z.ot = atkTeamBuffN;
    }
    if (targetTab === 'manual') z.g = 1;
    if (targetId) {
      z.ti = targetId;
      if (spawnIdx) z.si = spawnIdx;
    }
    if (tgtElement) z.te = tgtElement;
    const tv = Object.fromEntries(Object.entries(tgtStats).filter(([, v]) => v !== ''));
    if (Object.keys(tv).length) z.tv = tv;
    if (tgtBoss) z.tb = 1;
    if (tgtBroken) z.bk = 1;
    if (tgtEnraged) z.en = 1;
    if (tgtGuildBuff) z.gb = 1;
    if (tgtTitleBuff) z.pb = 1;
    if (tgtHpPct !== '100') z.th = tgtHpPct;
    if (tgtBuffN > 0) z.db = tgtBuffN;
    if (tgtDebuffN > 0) z.dd = tgtDebuffN;
    if (targetsHit > 1) z.n = targetsHit;
    if (allies.some((a) => a.id))
      z.al = allies.map((a) => {
        const base: NonNullable<UrlState['al']>[number] = [
          a.id ?? '',
          a.transcend,
          a.talisman ?? '',
          a.talismanLv,
          Number(a.ee),
          Number(a.eePlus),
        ];
        // Arme/accessoire d'allié (24/08/2026) : 4 champs de queue, omis
        // quand rien n'est porté (les vieux liens restent identiques).
        if (a.weapon || a.amulet)
          base.push(a.weapon ?? '', a.weaponTier, a.amulet ?? '', a.amuletTier);
        return base;
      });
    // Stacks déclarés — kit/EE/quirks du porteur comme des alliés : le champ
    // vit indépendamment de `al`.
    const ab = Object.entries(stackDecls).filter(([, n]) => n > 0);
    if (ab.length) z.ab = ab;
    return z;
  };
  const packZ = (): string => {
    const z = buildZ();
    return Object.keys(z).length ? LZString.compressToEncodedURIComponent(JSON.stringify(z)) : '';
  };

  /** Query string de l'état courant : `dev=1` (mode harnais collant — il doit
   *  survivre aux réécritures d'URL) AVANT `z`. */
  const buildQuery = (packed: string): string => {
    const parts = [...(devMode && !DEV_BUILD ? ['dev=1'] : []), ...(packed ? [`z=${packed}`] : [])];
    return parts.length ? `?${parts.join('&')}` : '';
  };

  /** URL de partage de l'état courant — et l'écrit dans la barre au passage. */
  const flushShareUrl = (): string => {
    const url = `${window.location.pathname}${buildQuery(packZ())}${window.location.hash}`;
    window.history.replaceState(null, '', url);
    return `${window.location.origin}${url}`;
  };

  // SANS tableau de deps, à dessein : l'effet re-arme le timer à chaque rendu
  // et n'écrit que 400 ms après le DERNIER — même débounce qu'avant, sans la
  // liste de 24 deps à maintenir.
  useEffect(() => {
    if (!didHydrate.current) return;
    const timer = window.setTimeout(() => {
      window.history.replaceState(
        null,
        '',
        `${window.location.pathname}${buildQuery(packZ())}${window.location.hash}`,
      );
    }, 400);
    return () => window.clearTimeout(timer);
  });

  return {
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
  };
}
