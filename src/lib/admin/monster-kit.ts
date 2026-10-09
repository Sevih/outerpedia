/**
 * Le KIT d'un monstre tel que son éditeur de câblage le montre : les cartes de
 * skills, les chips que le kit pose (dédoublonnées par buff) avec leur place
 * « règles pures » et ce que la curation en fait (`chipOwner`, `chipHide`,
 * `chipAdd` de `data/curated/monster-skills.json`), et le catalogue du
 * glossaire que « + » propose.
 *
 * Partagé par l'éditeur de l'admin (`/admin/editor/monsters/[id]`) et l'onglet
 * « Monstres » de quick : le même calcul, sur un monstre et un catalogue de
 * skills — l'extraction fraîche pour l'admin, le committé pour quick.
 *
 * Et les monstres que les GUIDES désignent (`guideMonsterIds`) : ce que quick
 * met en avant, plutôt que les 4 848 monstres du jeu.
 */
import type { DungeonRef, Monster, Skill } from '@contracts';
import type { EffectOption, KitChip } from '@/components/admin/MonsterKitEditor';
import { kitEffectCatalog } from '@/lib/admin/character-kit';
import { committedMonsters } from '@/lib/admin/monster-store';
import { getMergedEffects, type MergedEffect } from '@/lib/data/effects';
import { encountersOfGroup, getEncounter } from '@/lib/data/encounters';
import { listGuides, readGuideVersionFile } from '@/lib/data/guides';
import { monsterChipMeta, monsterSkillViews } from '@/lib/skill-view';
import { resolveSkillText } from '@/lib/skills';

/** Les trois sections du fichier curé, telles que le disque les porte. */
export interface MonsterKitSections {
  chipOwner: Record<string, string | string[]>;
  chipHide: Record<string, string[]>;
  chipAdd: Record<string, string[]>;
}

/**
 * Les trois sections restreintes à UN kit (le fichier est global) : par buff,
 * le porteur choisi PARMI les skills de ce kit ; par skill du kit, ses buffs
 * masqués et ses réfs ajoutées.
 */
export interface MonsterKitDisk {
  chipOwner: Record<string, string>;
  chipHide: Record<string, string[]>;
  chipAdd: Record<string, string[]>;
}

/** Une carte du kit : un skill, et ce que la curation du disque y pose. */
export interface MonsterKitCard {
  id: string;
  name: string;
  type: string;
  /** Placeholders résolus aux vars du dernier niveau. */
  desc?: string;
  /** Sprite brut du skill : chaque appelant en fait son adresse. */
  icon?: string;
  /** Buffs des chips AFFICHÉES ici (`owner ?? défaut`, moins les masquées). */
  chips: string[];
  /** Buffs des chips masquées sur cette carte (`chipHide`). */
  hidden: string[];
  /** Réfs du glossaire ajoutées à cette carte (`chipAdd`). */
  added: string[];
}

export interface MonsterKit {
  cards: MonsterKitCard[];
  /** Les buffs CHIPABLES du kit, un par buff, dans l'ordre des skills. */
  chips: KitChip[];
}

/** Le porteur curé d'un buff pour CE kit : le premier candidat qui en est un skill. */
function kitOwner(
  owner: string | string[] | undefined,
  kitIds: ReadonlySet<string>,
): string | null {
  const candidates = Array.isArray(owner) ? owner : owner ? [owner] : [];
  return candidates.find((c) => kitIds.has(c)) ?? null;
}

/** Une section par skill, restreinte aux skills d'un kit. */
const pickSkills = (
  section: Record<string, string[]>,
  kitIds: ReadonlySet<string>,
): Record<string, string[]> =>
  Object.fromEntries(Object.entries(section).filter(([sid]) => kitIds.has(sid)));

/** La curation du disque, restreinte au kit `skillIds`. */
export function pickMonsterKit(
  sections: MonsterKitSections,
  skillIds: readonly string[],
): MonsterKitDisk {
  const kitIds = new Set(skillIds);
  const chipOwner: Record<string, string> = {};
  for (const [buff, owner] of Object.entries(sections.chipOwner)) {
    const mine = kitOwner(owner, kitIds);
    if (mine) chipOwner[buff] = mine;
  }
  return {
    chipOwner,
    chipHide: pickSkills(sections.chipHide, kitIds),
    chipAdd: pickSkills(sections.chipAdd, kitIds),
  };
}

/**
 * Les cartes éditables d'un kit — une par skill du monstre présent dans
 * `skills` — et ses chips. `skills` : le catalogue où lire les skills du
 * monstre (le committé, ou l'extraction posée par-dessus).
 */
export function monsterKitCards(
  monster: Pick<Monster, 'skills'>,
  skills: Record<string, Skill | undefined>,
  sections: MonsterKitSections,
): MonsterKit {
  const kit = monster.skills.map((sid) => skills[sid]).filter((s): s is Skill => Boolean(s));

  // Positions sous les RÈGLES SEULES (caller/desc-réf, curation ignorée) : le
  // « défaut » que l'éditeur matérialise quand aucun chipOwner n'est posé.
  const defaultCards = new Map<string, string[]>();
  for (const v of monsterSkillViews(kit, {})) {
    for (const e of v.effects ?? []) {
      if (!e.buff) continue;
      const list = defaultCards.get(e.buff) ?? [];
      if (!list.includes(v.skill.id)) list.push(v.skill.id);
      defaultCards.set(e.buff, list);
    }
  }

  const kitIds = new Set(kit.map((s) => s.id));
  const hiddenOf = (buff: string): string[] =>
    kit.map((s) => s.id).filter((sid) => sections.chipHide[sid]?.includes(buff));

  const seen = new Set<string>();
  const chips: KitChip[] = kit.flatMap((s) =>
    (s.effects ?? []).flatMap((e) => {
      if (!e.buff || seen.has(e.buff)) return [];
      const meta = monsterChipMeta(e);
      if (!meta) return [];
      seen.add(e.buff);
      return [
        {
          buff: e.buff,
          carrier: s.id,
          ...meta,
          defaultCards: defaultCards.get(e.buff) ?? [s.id],
          owner: kitOwner(sections.chipOwner[e.buff], kitIds),
          hiddenOn: hiddenOf(e.buff),
        },
      ];
    }),
  );

  const cards: MonsterKitCard[] = kit.map((s) => ({
    id: s.id,
    name: s.name.en,
    type: s.type,
    // Placeholders [Buff_V/C/T_…] résolus aux vars du dernier niveau (sinon la
    // desc s'affiche brute — comme le rendu public via SkillDescription).
    ...(s.desc?.en
      ? { desc: resolveSkillText(s.desc.en, s.levels[s.levels.length - 1]?.vars) }
      : {}),
    ...(s.icon ? { icon: s.icon } : {}),
    chips: chips
      .filter(
        (c) => (c.owner ? [c.owner] : c.defaultCards).includes(s.id) && !c.hiddenOn.includes(s.id),
      )
      .map((c) => c.buff),
    hidden: chips.filter((c) => c.hiddenOn.includes(s.id)).map((c) => c.buff),
    added: sections.chipAdd[s.id] ?? [],
  }));

  return { cards, chips };
}

/** Catalogue du glossaire pour le bouton + (effets non masqués, nommés) : celui des persos. */
export function monsterKitCatalog(
  effects: MergedEffect[] = getMergedEffects(),
): Record<string, EffectOption> {
  return kitEffectCatalog(effects);
}

/**
 * Où l'on affronte un monstre : les slugs des modes de jeu de ses spawns, et
 * leurs stages / zones en anglais. `dungeons` : les donjons où lire —
 * l'extraction fraîche pour la sidebar de l'admin, `encounters.json` pour quick.
 */
export function monsterPlaces(
  m: Pick<Monster, 'spawns'>,
  dungeons: Record<string, DungeonRef | undefined>,
): { modes: string[]; zones: string[] } {
  // Stage/zone d'une rencontre : story → saison/épisode/zone/stage ; world
  // boss → LIGUE SEULE (les 4 donjons d'un groupe partagent le nom, et en
  // queue de ligne la difficulté sortait de l'écran) ; sinon le nom du
  // donjon (JC/poursuite/guild raid y portent leur difficulté).
  const zoneLabel = (dungeon: string): string | undefined => {
    const d = dungeons[dungeon];
    if (!d?.name.en) return undefined;
    if (d.season || d.episode) {
      const se = [d.season ? `S${d.season}` : '', d.episode ? `Ep${d.episode}` : '']
        .filter(Boolean)
        .join(' ');
      return [se, d.area?.en, d.name.en].filter(Boolean).join(' · ');
    }
    if (d.mode === 'world_boss' && d.difficulty?.name?.en) return d.difficulty.name.en;
    return d.name.en;
  };
  const modes = new Set<string>();
  const zones = new Set<string>();
  for (const s of m.spawns ?? []) {
    const mode = dungeons[s.dungeon]?.mode;
    if (mode) modes.add(mode);
    const z = zoneLabel(s.dungeon);
    if (z) zones.add(z);
  }
  return { modes: [...modes], zones: [...zones] };
}

/** Un guide, tel qu'un monstre le cite : de quoi le nommer et y mener. */
export interface GuideRef {
  category: string;
  slug: string;
  /** Titre anglais. */
  title: string;
}

/** Clés d'un `config.json` de version qui désignent un COMBAT (cf. `repin-guides.ts`). */
const GROUP_KEYS = ['group', 'main', 'subA', 'subB'] as const;

/**
 * Les monstres que les GUIDES désignent, et pour chacun ses guides.
 *
 * Un guide désigne un monstre de quatre façons (celles que `planRepin` suit) :
 * `meta.bossId` et `meta.monsters` le NOMMENT (`<id>@<n>`, une archive épinglée,
 * vaut son id) ; `meta.group`, `meta.dungeons` et les groupes des `config.json`
 * de ses versions désignent un COMBAT, dont les monstres se lisent dans
 * `encounters.json`. S'y ajoutent les ADDS de ces monstres — ceux que l'un
 * d'eux invoque (`summonedBy`) ou porte dans son kit (`linkedTo`) —, rangés
 * sous les guides de leur ancre.
 */
export function guideMonsterIds(
  monsters: Record<string, Pick<Monster, 'id' | 'summonedBy' | 'linkedTo'>> = committedMonsters(),
): Map<string, GuideRef[]> {
  const out = new Map<string, GuideRef[]>();
  const add = (id: string, ref: GuideRef): void => {
    const list = out.get(id);
    if (!list) out.set(id, [ref]);
    else if (!list.includes(ref)) list.push(ref);
  };

  for (const g of listGuides()) {
    const ref: GuideRef = { category: g.category, slug: g.slug, title: g.title.en };
    const ids = new Set<string>();
    const group = (key: unknown): void => {
      if (typeof key !== 'string') return;
      for (const e of encountersOfGroup(key)) for (const m of e.monsters) ids.add(m.id);
    };
    for (const named of [g.bossId, ...(g.monsters ?? [])]) if (named) ids.add(named.split('@')[0]);
    group(g.group);
    for (const dungeon of g.dungeons ?? [])
      for (const m of getEncounter(dungeon)?.monsters ?? []) ids.add(m.id);
    for (const v of g.versions) {
      const cfg = readGuideVersionFile<Record<string, unknown>>(g, v.key, 'config.json');
      if (cfg) for (const k of GROUP_KEYS) group(cfg[k]);
    }
    for (const id of ids) add(id, ref);
  }

  // Les adds : rattachés aux guides de leur ancre (invocateur ou boss lié).
  const direct = new Map(out);
  for (const m of Object.values(monsters)) {
    if (direct.has(m.id)) continue;
    for (const anchor of [...(m.summonedBy ?? []), ...(m.linkedTo ?? [])])
      for (const ref of direct.get(anchor) ?? []) add(m.id, ref);
  }
  return out;
}
