/**
 * Accès lecture aux MONSTRES validés (donnée d'extraction committée) — côté
 * public (guides). L'admin a son propre store (`src/lib/admin/monster-store`).
 */
import type {
  EncountersFile,
  Glossaries,
  Monster,
  MonsterSkillsFile,
  MonstersFile,
  RankOption,
  Skill,
} from '@contracts';
import type { Lang } from '@/lib/i18n/config';
import { lRec } from '@/lib/i18n/localize';
import { loadDataJson } from '@/lib/data/disk';
import { expandRankContexts, type SpawnContext } from '@/lib/monster-stats';
import { img } from '@/lib/images';

// Lus au DISQUE (cache mtime), pas importés : l'admin réécrit ces fichiers à
// chaque « Enregistrer » — un import statique les mettrait dans le graphe de
// modules et chaque save recompilerait les routes (cf. src/lib/data/disk.ts).
const MONSTERS = (): MonstersFile => loadDataJson<MonstersFile>('generated/monsters.json');
const SKILLS = (): MonsterSkillsFile =>
  loadDataJson<MonsterSkillsFile>('generated/monster-skills.json');
const DUNGEONS = (): EncountersFile => loadDataJson<EncountersFile>('generated/encounters.json');
const G = (): Glossaries => loadDataJson<Glossaries>('generated/glossaries.json');

export function getMonster(id: string): Monster | undefined {
  return MONSTERS()[id];
}

/**
 * Tous les monstres, étiquetés par leur nom — pour un SÉLECTEUR (admin, guides
 * dimensional-singularity : `meta.bossId`). Trié par nom.
 */
export function listMonsters(lang: Lang): { id: string; label: string }[] {
  return Object.entries(MONSTERS())
    .map(([id, m]) => ({ id, label: lRec(m.name, lang) || id }))
    .sort((a, b) => a.label.localeCompare(b.label));
}

/**
 * Noms d'affichage d'un ENSEMBLE de monstres, l'élément entrant dans le nom
 * quand — et seulement quand — plusieurs monstres de l'ensemble le partagent.
 *
 * Urd, Verdandi et Skuld existent chacune en DEUX exemplaires : même nom, même
 * sprite, seuls l'élément et le donjon diffèrent. Côte à côte dans la rotation,
 * deux cartes rigoureusement identiques n'apprennent rien — d'où « Urd (Light) »
 * et « Urd (Dark) », que la V2 écrivait à la main dans le titre de chaque guide.
 *
 * Ici c'est une RÈGLE, pas une liste : la collision est constatée sur l'ensemble
 * passé, dans la langue rendue (les noms JP/KR/ZH peuvent se heurter là où l'EN
 * ne se heurte pas, et l'inverse). Un futur doublon se désambiguïse tout seul ;
 * et le jour où le jeu les renomme, on ne colle plus « (Light) » sur des noms
 * déjà distincts.
 */
export function monsterDisplayNames(ids: string[], lang: Lang): Map<string, string> {
  const monsters = MONSTERS();
  const names = new Map<string, string>();
  const count = new Map<string, number>();
  for (const id of ids) {
    const m = monsters[id];
    if (!m) continue;
    const name = lRec(m.name, lang);
    names.set(id, name);
    count.set(name, (count.get(name) ?? 0) + 1);
  }
  for (const [id, name] of names) {
    if ((count.get(name) ?? 0) < 2) continue;
    const element = lRec(G().elements?.[monsters[id]!.element], lang);
    if (element) names.set(id, `${name} (${element})`);
  }
  return names;
}

/** Skills d'un monstre (dans l'ordre du kit ; ids inconnus ignorés). */
export function getMonsterSkills(m: Monster): Skill[] {
  const skills = SKILLS();
  return m.skills.map((id) => skills[id]).filter((s): s is Skill => Boolean(s));
}

/** Échelle d'affichage des stats (per-mille → % ou brut) — glossaire global. */
export function getStatScales(): Record<string, string> {
  return G().statScales;
}

/** Quirks de compte réduisant les stats affichées des boss (EFF/RES −10 %). */
export function getBossQuirkMods(): Record<string, number> {
  return G().bossQuirkMods ?? {};
}

/**
 * Passifs de PALIER (`glossaries.rankOptions`) : les buffs que le boss gagne en
 * montant de palier. Optionnel dans le glossaire — absent = aucun passif
 * affiché (jamais une valeur inventée).
 */
export function getRankOptions(): Record<string, RankOption> {
  return G().rankOptions ?? {};
}

/**
 * Libellés localisés des passifs de palier d'un monstre, prêts pour le rendu
 * client (id d'option → « Increased Penetration +30% »). Une option inconnue du
 * glossaire est simplement OMISE : mieux vaut ne rien dire qu'inventer.
 */
export function rankOptionLabels(contexts: SpawnContext[], lang: Lang): Record<string, string> {
  const glossary = getRankOptions();
  const out: Record<string, string> = {};
  for (const id of new Set(contexts.flatMap((c) => c.options ?? []))) {
    const o = glossary[id];
    if (!o) continue;
    const name = o.name ? lRec(o.name, lang) : undefined;
    if (!name) continue;
    // `value` est un per-mille pour les taux (convention du jeu, cf. statScales).
    const amount =
      o.value && o.stat && G().statScales?.[o.stat] === 'percent'
        ? ` ${o.value > 0 ? '+' : ''}${o.value / 10}%`
        : o.value
          ? ` ${o.value > 0 ? '+' : ''}${o.value}`
          : '';
    out[id] = `${name}${amount}`;
  }
  return out;
}

/**
 * Icône d'un monstre (convention du jeu) : `icon` commençant par « 2 » =
 * modèle de PERSONNAGE réutilisé en boss → face icon composée ; sinon vignette
 * `MT_<icon>` (namespace boss existant — même clé que les sources d'équipement,
 * jamais de doublon inter-namespace).
 */
export function monsterIconSrc(m: Pick<Monster, 'icon'>): string {
  return m.icon.startsWith('2') ? img.face(m.icon) : img.boss(`MT_${m.icon}`);
}

/**
 * Même portrait, en PNG : la carte de partage (og:image) d'un guide de boss.
 * Les aperçus Discord/OG digèrent mal le WebP — les fiches de persos et d'EE
 * poussent déjà une variante PNG pour la même raison. ~128×128, donc une carte
 * carrée (`summary`), pas une bannière : c'est la vignette du boss, pas une
 * illustration — cf. `createPageMetadata`.
 */
export function monsterOgImage(m: Pick<Monster, 'icon'>): string {
  return m.icon.startsWith('2') ? img.facePng(m.icon) : img.bossPng(`MT_${m.icon}`);
}

/**
 * Rencontres connues d'un monstre, avec les MODIFICATEURS du donjon (adv
 * per-mille, PV réels du mode) et un libellé « Mode · Stage » localisé — prêt
 * pour le calcul de stats effectives (src/lib/monster-stats).
 */
export function monsterSpawnContexts(m: Monster, lang: Lang): SpawnContext[] {
  const dungeons = DUNGEONS();
  const g = G();
  return (m.spawns ?? []).flatMap((s) => {
    const d = dungeons[s.dungeon];
    if (!d) return [];
    const mode = g.modes?.[d.mode] ? lRec(g.modes[d.mode], lang) : d.mode;
    return expandRankContexts(
      {
        level: s.level,
        label: `${mode} · ${lRec(d.name, lang) || d.name.en}`,
        ...(d.adv ? { adv: d.adv } : {}),
        ...(d.bossHp ? { bossHp: d.bossHp } : {}),
        ...(s.hpLines ? { hpLines: s.hpLines } : {}),
      },
      d.ranks,
    );
  });
}
