/**
 * Primitive — placeholders des textes du jeu, UNE écriture par règle.
 *
 * Module PUR (ni `node:fs` ni tables) : le site l'importe tel quel
 * (`resolveSkillText` sert `SkillDescription`, rendu dans un composant client),
 * le datagen lui passe les valeurs lues dans les tables.
 *
 * Deux familles :
 *   - équipement : `[Value]`, `[Rate]`, `[Turn]` et variantes, remplis depuis
 *     les valeurs d'un palier (`BuffValues`) ;
 *   - compétences : `[Buff_C/V/T_<id>]`, l'id complet du buff dans le crochet,
 *     remplis par une fonction de lecture (niveau → `vars` côté site, tables
 *     côté datagen).
 */

/** Valeurs formatées d'un buff à un niveau, prêtes à remplir un template (clés absentes si non applicables). */
export interface BuffValues {
  value?: string;
  rate?: string;
  turn?: string;
  value2?: string;
  turn2?: string;
  value4?: string;
  value5?: string;
}

/** Valeurs de placeholder d'un buff de skill à un niveau : chance / valeur / tours. */
export interface SkillBuffVars {
  /** Chance d'application (CreateRate/10, incl. 100%) — `[Buff_C_<id>]`. */
  c?: string;
  /** Valeur — `[Buff_V_<id>]`. Règle du client (`GetSkillDescReplaceText`,
   *  branche `v`) : `OAT_RATE` → magnitude/10 en %, sinon valeur SIGNÉE ; le
   *  « % » suit `GetStatValue` (`IsPercentStat`), le signe tombe derrière
   *  « by » (cf. `unsignedValueIds`). */
  v?: string;
  /** Durée en tours (TurnDuration) — `[Buff_T_<id>]`. */
  t?: string;
}

/**
 * Remplit un template (`[Value]`, `[Rate]`, `[Turn]` + variantes) avec des valeurs.
 * `color` enrobe chaque valeur de `<color=#28d9ed>` (présentation) ; valeur absente → `?`.
 */
export function fillValuePlaceholders(template: string, v: BuffValues, color: boolean): string {
  const w = (s: string) => (color ? `<color=#28d9ed>${s}</color>` : s);
  const f = (s: string | undefined) => (s == null ? '?' : w(s));
  const fs = (s: string | undefined, sign: '+' | '-') => (s == null ? '?' : w(`${sign}${s}`));
  return (
    template
      .replace(/\[\+Value5\]/gi, fs(v.value5, '+'))
      .replace(/\[-Value5\]/gi, fs(v.value5, '-'))
      .replace(/\[Value5\]/gi, f(v.value5))
      .replace(/\[\+Value4\]/gi, fs(v.value4, '+'))
      .replace(/\[-Value4\]/gi, fs(v.value4, '-'))
      .replace(/\[Value4\]/gi, f(v.value4))
      .replace(/\[\+Value2\]/gi, fs(v.value2, '+'))
      .replace(/\[-Value2\]/gi, fs(v.value2, '-'))
      .replace(/\[Value2\]/gi, f(v.value2))
      .replace(/\[RATE\]/gi, f(v.rate))
      .replace(/\[Rate1?\]/g, f(v.rate))
      .replace(/\[\+Value\]/gi, fs(v.value, '+'))
      .replace(/\[-Value\]/gi, fs(v.value, '-'))
      .replace(/\[Value\]/gi, f(v.value))
      // `[+Turn]` SANS signe, volontairement. Le jeu, lui, affiche « +N » : le
      // « + » est bien un signe pour le client, qui le remet
      // (`CUtilUI.GetUniqueNameOptionDescReplaceText` : « for +1 turns », 3
      // options touchées). On l'omet parce que c'est une DURÉE — les gabarits
      // disent « [+Turn]ターンの間 » / « [+Turn]턴 » / « [+Turn]回合 », soit
      // « pendant N tours », et « pendant +2 tours » se lit mal. Écart de
      // lisibilité assumé (décision de Sevih, 15/10/2026). (`[-Turn]`
      // n'apparaît nulle part dans les tables : défensif.)
      .replace(/\[\+Turn1?\]/gi, f(v.turn))
      .replace(/\[-Turn\]/gi, fs(v.turn, '-'))
      .replace(/\[Turn2\]/gi, f(v.turn2))
      .replace(/\[Turn\]/gi, f(v.turn))
  );
}

// --- placeholders de COMPÉTENCE ----------------------------------------------
// Client (`CUtilUI.GetSkillDescReplaceText`) : le contenu du crochet passe en
// minuscules avant d'être lu — `[buff_v_…]` (skills de monstres, geas) vaut
// `[Buff_V_…]`. L'id garde sa casse écrite : les `vars` sont indexées sous
// la même (aucun repli de casse sur l'id).

/** Motif d'un placeholder de compétence : lettre (c/v/t) + id du buff. */
const SKILL_PLACEHOLDER = /\[buff_([cvt])_(.+?)\]/gi;

/**
 * Remplit les `[Buff_C/V/T_<id>]` d'un texte avec les valeurs que `varsOf`
 * donne pour l'id. Les balises `<color=…>` du template restent (donnée
 * canonique). Valeur absente → « ? ». Un gabarit qui écrit lui-même le « - »
 * devant le placeholder (geas en chinois : « 效果抵抗-[buff_v_…] ») ne le voit
 * pas doublé par une valeur négative.
 */
export function fillSkillPlaceholders(
  template: string,
  varsOf: (buffId: string) => SkillBuffVars | undefined,
): string {
  return template.replace(
    SKILL_PLACEHOLDER,
    (_m, kind: string, buffId: string, offset: number, text: string) => {
      const v = varsOf(buffId);
      const k = kind.toLowerCase();
      const val = (k === 'c' ? v?.c : k === 't' ? v?.t : v?.v) ?? '?';
      const before = text.slice(0, offset).replace(/(<color=[^>]*>)+$/i, '');
      return val.startsWith('-') && /[-−－]$/.test(before) ? val.slice(1) : val;
    },
  );
}

/** Ids des buffs cités par des `[Buff_C/V/T_<id>]`, sur tous les textes donnés
 *  (les six langues d'une desc : une langue peut citer un id que l'anglais ne
 *  cite pas, cf. 9101 en japonais). */
export function skillPlaceholderIds(texts: Iterable<string | undefined>): Set<string> {
  const out = new Set<string>();
  for (const t of texts) if (t) for (const m of t.matchAll(SKILL_PLACEHOLDER)) out.add(m[2]);
  return out;
}

/**
 * Ids dont la valeur `[Buff_V_<id>]` s'affiche SANS signe (décision de Sevih,
 * 17/10/2026). Le client garde le signe hors `OAT_RATE` — c'est lui qui dit
 * « -50 boss Resilience » — mais il écrit aussi « decreases AP by -20 » : quand
 * le texte ANGLAIS met « by » juste devant le placeholder, le verbe porte déjà
 * le sens et la valeur passe en absolu, quel que soit le verbe : « Increases the
 * cooldown … by -1 » du jeu s'affiche « by 1 » (décision de Sevih du
 * 18/10/2026, après relecture de C22 : 160039, `roguelight_060`).
 * Un id cité plusieurs fois ne perd son signe que si TOUTES ses occurrences le
 * demandent. La décision vaut pour les six langues (les `vars` sont communes).
 */
export function unsignedValueIds(enTexts: Iterable<string | undefined>): Set<string> {
  const unsigned = new Set<string>();
  const signed = new Set<string>();
  for (const t of enTexts) {
    if (!t) continue;
    for (const m of t.matchAll(SKILL_PLACEHOLDER)) {
      if (m[1].toLowerCase() !== 'v') continue;
      const before = t.slice(0, m.index).replace(/<\/?color[^>]*>/gi, '');
      const byContext = /\bby\s*$/i.test(before);
      (byContext ? unsigned : signed).add(m[2]);
    }
  }
  for (const id of signed) unsigned.delete(id);
  return unsigned;
}
