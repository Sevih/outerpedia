/**
 * Le KIT d'un perso tel que son éditeur de câblage le montre : les cartes de
 * skills et leurs chips AUTO (positions « règles pures » = curation vide),
 * résolues comme le rendu, la curation du disque restreinte à ces cartes, et le
 * catalogue du glossaire que « + » propose.
 *
 * Partagé par deux sections de quick, la « Fiche perso » (sous-onglet Skills)
 * et la fiche perso d'« Extraction » : le même calcul, sur le même bundle (un
 * perso et ses skills), chacune avec sa source d'icônes de skill.
 */
import type { Character, Skill } from '@contracts';
import {
  isDebuffEffect,
  type ClientEffect,
  type StatusMap,
} from '@/components/character/EffectChips';
import { getSheetTranscendTiers } from '@/lib/data/char-progression';
import { getMergedEffects, type MergedEffect } from '@/lib/data/effects';
import {
  DUAL_CARD_SUFFIX,
  buildBurstViews,
  buildChainView,
  buildStatusMap,
  burstSkills,
  cardEffects,
  dedupSkills,
  mainSkills,
  syntheticBurstEffects,
  toClientEffects,
} from '@/lib/skill-view';
import { img } from '@/lib/images';
import { lRec } from '@/lib/i18n/localize';
import { resolveSkillText } from '@/lib/skills';

/** Une chip AUTO d'une carte (positions « règles pures »), déjà résolue. */
export interface CardChip {
  /** Ref d'identité = `tooltip ?? label` de l'effet (clé de chipHide). */
  ref: string;
  name: string;
  icon?: string;
  isDebuff: boolean;
  /**
   * Chip du skill BURSTABLE héritée de ses bursts : les niveaux des bursts qui
   * la portent, quand aucune variante du skill lui-même ne la porte. Un effet
   * synthétique de burst (le bonus WG, lu dans le texte des bursts sans être
   * rattaché à l'un d'eux) vaut `[1, 2, 3]`.
   */
  via?: (1 | 2 | 3)[];
}

/** Une carte de skill éditable (main, fusion_passive, extra, chaîne, duo). */
export interface KitEditorCard {
  id: string;
  name: string;
  type: string;
  desc?: string;
  iconSrc?: string;
  chips: CardChip[];
  /** La carte du skill burstable (celui qui porte `burstAP`). */
  burst?: true;
}

/** Un burst du skill burstable, en lecture : son coût AP, son texte, ses chips propres. */
export interface KitBurstCard {
  level: 1 | 2 | 3;
  id: string;
  cost?: number;
  desc?: string;
  chips: CardChip[];
}

/** Un palier de transcendance, en lecture : bonus cumulés (%) et lignes du passif unique. */
export interface KitTranscendTier {
  label: string;
  atkPct: number;
  defPct: number;
  hpPct: number;
  passives: string[];
}

/** Ce que la fiche montre du kit sans l'éditer : les bursts et la transcendance. */
export interface KitExtras {
  bursts: KitBurstCard[];
  transcend: KitTranscendTier[];
}

/** Effet du glossaire proposable en chipAdd. */
export interface EffectOption {
  id: string;
  name: string;
  icon?: string;
  isDebuff: boolean;
  /** Variante indissipable (effet DISTINCT de la version normale). */
  irremovable?: boolean;
  /** Description du jeu (aide-mémoire de curation). */
  desc?: string;
}

/** Le perso et SES skills : le bundle de l'extraction, ou son équivalent committé. */
export interface CharacterKitBundle {
  char: { element: string; chainType?: string };
  skills: Record<string, unknown>;
}

/** Le perso et ses skills, dédoublonnés. */
const kitSkills = (bundle: CharacterKitBundle): Skill[] =>
  dedupSkills(Object.values(bundle.skills) as Skill[]);

/** La ref d'identité d'un effet de carte. */
const refOf = (e: ClientEffect): string | undefined => e.tooltip ?? e.label;

/**
 * Un effet de carte → chip d'éditeur (dédup par ref : une ref = une chip
 * masquable, comme au rendu où les homonymes fusionnent).
 */
function chipsOf(statuses: StatusMap, effects: ClientEffect[] | undefined): CardChip[] {
  const seen = new Set<string>();
  const out: CardChip[] = [];
  for (const e of effects ?? []) {
    const ref = refOf(e);
    if (!ref || seen.has(ref)) continue;
    seen.add(ref);
    const st = statuses[ref];
    out.push({
      ref,
      name: st?.name ?? ref,
      ...(st?.icon ? { icon: st.icon } : {}),
      isDebuff: isDebuffEffect(e.category, st?.isDebuff),
    });
  }
  return out;
}

/** Le skill burstable du kit (celui qui porte `burstAP`), s'il y en a un. */
const burstableOf = (skills: Skill[]): Skill | undefined =>
  mainSkills(skills).find((s) => s.burstAP?.length);

/**
 * D'où une chip du skill burstable `s` vient, quand ce n'est pas de lui :
 * `cardEffects` lui fait hériter des effets de TOUS les `burst_*` du kit et des
 * effets synthétiques de burst. Une ref que porte une variante du skill
 * (`toClientEffects` hors bursts) n'a pas de `via` ; sinon, les niveaux des
 * bursts qui la portent (le niveau d'un burst = son rang dans `burstSkills`,
 * un kit jumeau de perso à formes rangé avec lui) ; sinon, un effet
 * synthétique (bonus WG, tiré du texte de l'ensemble des bursts) : `[1, 2, 3]`.
 * Une ref que seuls des passifs ou les statuts de niveau apportent n'en a pas.
 */
function burstVia(skills: Skill[], s: Skill): (ref: string) => CardChip['via'] {
  const refs = (k: Skill) => (toClientEffects(k) ?? []).map(refOf).filter(Boolean);
  const own = new Set(skills.filter((k) => k.type === s.type).flatMap(refs));
  const levelOf = new Map(burstSkills(skills).map((b, i) => [b.type, (i + 1) as 1 | 2 | 3]));
  const byRef = new Map<string, Set<1 | 2 | 3>>();
  for (const b of skills.filter((k) => k.type.startsWith('burst_'))) {
    const level = levelOf.get(b.type);
    if (!level) continue;
    for (const ref of refs(b)) {
      if (ref && !own.has(ref)) (byRef.get(ref) ?? byRef.set(ref, new Set()).get(ref)!).add(level);
    }
  }
  const synthetic = new Set(syntheticBurstEffects(skills).map(refOf));
  return (ref) => {
    if (own.has(ref)) return undefined;
    const levels = byRef.get(ref);
    if (levels?.size) return [...levels].sort((a, b) => a - b);
    return synthetic.has(ref) ? [1, 2, 3] : undefined;
  };
}

/**
 * Les cartes éditables d'un kit — mains, fusion_passive, extra, puis la chaîne
 * et le duo — avec leurs chips AUTO. `skillIconSrc` : l'adresse de l'icône d'un
 * skill (la fiche d'Extraction sert les sprites bruts, pas encore stagés).
 */
export function characterKitCards(
  bundle: CharacterKitBundle,
  skillIconSrc: (icon: string) => string,
): KitEditorCard[] {
  const { char } = bundle;
  const uniqueSkills = kitSkills(bundle);
  const statuses = buildStatusMap(uniqueSkills, 'en');
  const toChips = (effects: ClientEffect[] | undefined) => chipsOf(statuses, effects);
  const burstable = burstableOf(uniqueSkills);

  const cards: KitEditorCard[] = [
    ...mainSkills(uniqueSkills),
    ...uniqueSkills.filter((s) => s.type === 'fusion_passive' || s.type === 'extra'),
  ].map((s) => {
    const chips = toChips(cardEffects(uniqueSkills, s, {}));
    const via = s === burstable ? burstVia(uniqueSkills, s) : undefined;
    return {
      id: s.id,
      name: lRec(s.name, 'en'),
      type: s.type,
      // Placeholders [Buff_V/C/T_…] résolus aux vars du dernier niveau (sinon la
      // desc s'affiche brute — comme le rendu public via SkillDescription).
      ...(s.desc
        ? { desc: resolveSkillText(lRec(s.desc, 'en'), s.levels[s.levels.length - 1]?.vars) }
        : {}),
      ...(s.icon ? { iconSrc: skillIconSrc(s.icon) } : {}),
      chips: via
        ? chips.map((c) => {
            const levels = via(c.ref);
            return levels ? { ...c, via: levels } : c;
          })
        : chips,
      ...(via ? { burst: true as const } : {}),
    };
  });
  // Chaîne & duo : deux cartes distinctes (id du chain_passive + suffixe duo).
  const cp = uniqueSkills.find((s) => s.type === 'chain_passive');
  const chainView = cp ? buildChainView(uniqueSkills, 'en', {}) : null;
  if (cp && chainView) {
    // Vars du dernier niveau de la chaîne pour résoudre les placeholders.
    const chainVars = chainView.levels[chainView.levels.length - 1]?.vars;
    cards.push({
      id: cp.id,
      name: chainView.name || 'Chain',
      type: 'chain_passive',
      ...(chainView.chainDesc ? { desc: resolveSkillText(chainView.chainDesc, chainVars) } : {}),
      iconSrc: img.chain(char.element, char.chainType ?? 'start'),
      chips: toChips(chainView.chainEffects),
    });
    cards.push({
      id: cp.id + DUAL_CARD_SUFFIX,
      name: 'Dual',
      type: 'dual',
      ...(chainView.dualDesc ? { desc: resolveSkillText(chainView.dualDesc, chainVars) } : {}),
      chips: toChips(chainView.dualEffects),
    });
  }
  return cards;
}

/**
 * Ce que la fiche montre du kit EN LECTURE, sous ses cartes : les bursts du
 * skill burstable (`buildBurstViews`, la section Burst du site — aucun sans
 * `burstAP`), chacun avec ses chips PROPRES, et les paliers de transcendance
 * de la fiche (`getSheetTranscendTiers`, la section Transcendance du site). Le
 * passif unique des paliers se lit dans les skills du BUNDLE, la source des
 * cartes ; l'échelle des paliers, elle, vient de la progression committée.
 */
export function characterKitExtras(bundle: CharacterKitBundle & { char: Character }): KitExtras {
  const uniqueSkills = kitSkills(bundle);
  const statuses = buildStatusMap(uniqueSkills, 'en');
  const views = burstableOf(uniqueSkills) ? buildBurstViews(uniqueSkills, 'en') : [];
  const bursts = burstSkills(uniqueSkills)
    .slice(0, views.length)
    .map((b, i): KitBurstCard => {
      const v = views[i];
      return {
        level: v.level,
        id: b.id,
        ...(v.cost !== undefined ? { cost: v.cost } : {}),
        ...(v.desc ? { desc: resolveSkillText(v.desc, v.vars) } : {}),
        chips: chipsOf(statuses, toClientEffects(b)),
      };
    });
  const transcend = getSheetTranscendTiers(
    bundle.char,
    'en',
    bundle.skills as Record<string, Skill>,
  ).map(({ label, atkPct, defPct, hpPct, passives }) => ({
    label,
    atkPct,
    defPct,
    hpPct,
    passives,
  }));
  return { bursts, transcend };
}

/** Une section de curation, restreinte aux cartes d'UN perso (le fichier est global). */
export function pickKitCards(
  section: Record<string, string[]>,
  cards: readonly Pick<KitEditorCard, 'id'>[],
): Record<string, string[]> {
  const cardIds = new Set(cards.map((c) => c.id));
  return Object.fromEntries(Object.entries(section).filter(([k]) => cardIds.has(k)));
}

/** Catalogue du glossaire pour le bouton + (effets non masqués, nommés). */
export function kitEffectCatalog(
  effects: MergedEffect[] = getMergedEffects(),
): Record<string, EffectOption> {
  return Object.fromEntries(
    effects
      .filter((e) => !e.hidden && e.name.en)
      .map((e) => [
        e.id,
        {
          id: e.id,
          name: e.name.en,
          ...(e.icon ? { icon: e.icon } : {}),
          isDebuff: e.isDebuff,
          ...(e.irremovable ? { irremovable: true } : {}),
        },
      ]),
  );
}
