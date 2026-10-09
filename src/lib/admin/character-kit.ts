/**
 * Le KIT d'un perso tel que son éditeur de câblage le montre : les cartes de
 * skills et leurs chips AUTO (positions « règles pures » = curation vide),
 * résolues comme le rendu, la curation du disque restreinte à ces cartes, et le
 * catalogue du glossaire que « + » propose.
 *
 * Partagé par l'éditeur de l'admin (`/admin/editor/characters/[id]`) et la
 * « Fiche perso » de quick : le même calcul, sur le même bundle (un perso et
 * ses skills), chacun avec sa source d'icônes de skill.
 */
import type { Skill } from '@contracts';
import type { CardChip, EffectOption, KitEditorCard } from '@/components/admin/CharacterKitEditor';
import { isDebuffEffect, type ClientEffect } from '@/components/character/EffectChips';
import { getMergedEffects, type MergedEffect } from '@/lib/data/effects';
import {
  DUAL_CARD_SUFFIX,
  buildChainView,
  buildStatusMap,
  cardEffects,
  dedupSkills,
  mainSkills,
} from '@/lib/skill-view';
import { img } from '@/lib/images';
import { lRec } from '@/lib/i18n/localize';
import { resolveSkillText } from '@/lib/skills';

/** Le perso et SES skills : le bundle de l'extraction, ou son équivalent committé. */
export interface CharacterKitBundle {
  char: { element: string; chainType?: string };
  skills: Record<string, unknown>;
}

/**
 * Les cartes éditables d'un kit — mains, fusion_passive, extra, puis la chaîne
 * et le duo — avec leurs chips AUTO. `skillIconSrc` : l'adresse de l'icône d'un
 * skill (l'admin sert les sprites bruts, pas encore stagés).
 */
export function characterKitCards(
  bundle: CharacterKitBundle,
  skillIconSrc: (icon: string) => string,
): KitEditorCard[] {
  const { char } = bundle;
  const uniqueSkills = dedupSkills(Object.values(bundle.skills) as Skill[]);
  const statuses = buildStatusMap(uniqueSkills, 'en');
  // Un effet de carte → chip d'éditeur (dédup par ref : une ref = une chip
  // masquable, comme au rendu où les homonymes fusionnent).
  const toChips = (effects: ClientEffect[] | undefined): CardChip[] => {
    const seen = new Set<string>();
    const out: CardChip[] = [];
    for (const e of effects ?? []) {
      const ref = e.tooltip ?? e.label;
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
  };

  const cards: KitEditorCard[] = [
    ...mainSkills(uniqueSkills),
    ...uniqueSkills.filter((s) => s.type === 'fusion_passive' || s.type === 'extra'),
  ].map((s) => ({
    id: s.id,
    name: lRec(s.name, 'en'),
    type: s.type,
    // Placeholders [Buff_V/C/T_…] résolus aux vars du dernier niveau (sinon la
    // desc s'affiche brute — comme le rendu public via SkillDescription).
    ...(s.desc
      ? { desc: resolveSkillText(lRec(s.desc, 'en'), s.levels[s.levels.length - 1]?.vars) }
      : {}),
    ...(s.icon ? { iconSrc: skillIconSrc(s.icon) } : {}),
    chips: toChips(cardEffects(uniqueSkills, s, {})),
  }));
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
