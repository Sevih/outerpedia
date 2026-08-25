/**
 * Réglages de COMPTE du Damage Calculator (localStorage) et cycle de capture
 * des scénarios du harnais. Extrait de `DamageCalculatorBrowser.tsx` le
 * 25/08/2026 (audit D4 — découpage mécanique, contenu inchangé).
 */
import type { StoreSpec } from '@/lib/client-storage';
import type { DamageBranch } from '@/lib/damage/harness';

/** Niveaux de quirks POSSÉDÉS par nœud — réglage de compte, partagé entre
 *  sessions (et demain entre outils) via localStorage. */
export const QUIRKS_STORE: StoreSpec<Record<number, number>> = {
  key: 'outerpedia:damage-calculator:quirks',
  version: 1,
  fallback: {},
};

/** Niveau du Codex (archive) POSSÉDÉ — réglage de COMPTE, comme les quirks :
 *  c'est un compteur de complétions global, pas un réglage par perso. */
export const CODEX_STORE: StoreSpec<number> = {
  key: 'outerpedia:damage-calculator:codex',
  version: 1,
  fallback: 0,
};

/** Niveau de GUILDE (0 = sans guilde) — réglage de COMPTE : son buff MAX_HP
 *  (spec formule § 16.2) ne joue que dans certains modes, décidés par la
 *  cible (preset) ou une coche (manuel). */
export const GUILD_STORE: StoreSpec<number> = {
  key: 'outerpedia:damage-calculator:guild',
  version: 1,
  fallback: 0,
};

/** Buff de TITRE « Premium Body » (+5 % PV, § 16.2) — réglage de COMPTE,
 *  accordé côté serveur (pass) : introuvable en jeu par Sevih (05/08/2026),
 *  on l'expose en settings et les fixtures diront s'il matche quelque part. */
export const PREMIUM_STORE: StoreSpec<boolean> = {
  key: 'outerpedia:damage-calculator:premium-hp',
  version: 1,
  fallback: false,
};

// ── Cycle de capture des scénarios (harnais — libellés en dur, exemption
// harnais § 5). La saisie « en jeu » vit DANS la table Résultat, le cycle
// save/load au-dessus du panneau Debug (Sevih 05/08/2026).

/** Build de dev : le harnais est TOUJOURS actif. En production il reste caché
 *  sauf opt-in par URL `?dev=1` (avant `z`) — les beta testeurs capturent des
 *  scénarios et envoient le JSON ⧉ à Sevih (06/08/2026). Le gate est donc un
 *  ÉTAT runtime, plus un inline de build : le code du harnais part en prod. */
export const DEV_BUILD = process.env.NODE_ENV !== 'production';

/** Un scénario sauvegardé = UNE ligne de dégâts (Sevih 05/08/2026) : le `+`
 *  d'une cellule de la table Résultat fige le `z` courant (TOUS les réglages
 *  de l'UI y sont), les réglages de compte, la ligne (slot × branche) et la
 *  valeur constatée EN JEU. Le calculé n'est JAMAIS stocké : il est rejoué à
 *  l'affichage — un moteur qui bouge se voit immédiatement dans le Δ. */
export interface SavedScenario {
  /** Identité d'affichage figée à la sauvegarde (localisée à ce moment-là). */
  atk: string;
  tgt: string;
  /** Clé de ligne `flattenReport` (`S1`, `S2b1`, `#chaîne`…). */
  slot: string;
  branch: DamageBranch;
  /** Dégâts constatés EN JEU. */
  real: number;
  z: string;
  codex?: number;
  guild?: number;
  premium?: boolean;
  /** Quirks du compte à la capture (nœud → niveau, seuls les > 0). */
  quirks?: Record<string, number>;
  gameVersion: string;
  savedAt: string;
}

/** Scénarios sauvegardés — dev-only mais PERSISTANTS (les captures se font en
 *  plusieurs sessions). v2 : une ligne par scénario (v1 = fixture complète,
 *  format abandonné → repart à vide). */
export const SCENARIOS_STORE: StoreSpec<SavedScenario[]> = {
  key: 'outerpedia:damage-calculator:debug-scenarios',
  version: 2,
  fallback: [],
};

/** Clé d'upsert d'un scénario : même état d'UI + même ligne = même scénario. */
export const scnKey = (s: Pick<SavedScenario, 'z' | 'slot' | 'branch'>): string =>
  `${s.z}|${s.slot}|${s.branch}`;

/** Tolérance d'affichage du Δ (± %) — même défaut que fixtures.test.ts. */
export const DEFAULT_TOLERANCE = 0.5;
