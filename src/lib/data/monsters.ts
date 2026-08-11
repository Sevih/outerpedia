/**
 * Accès lecture aux MONSTRES validés (donnée d'extraction committée) — côté
 * public (guides). L'admin a son propre store (`src/lib/admin/monster-store`).
 */
import type {
  MonsterArchiveEntry,
  EncountersFile,
  Glossaries,
  Monster,
  MonsterSkillsFile,
  MonstersFile,
  Skill,
} from '@contracts';
import type { Lang } from '@/lib/i18n/config';
import { lRec } from '@/lib/i18n/localize';
import { loadDataJson } from '@/lib/data/disk';
import { buildBossView, type BossView } from '@/lib/data/boss-view';
import { liveKitSources, type KitSources } from '@/lib/skill-view';
import { img } from '@/lib/images';
// Type SEUL (effacé à la compilation) : le contrat de props de la vignette vit
// avec elle, pas dupliqué ici.
import type { MonsterThumb } from '@/components/ui/Thumbnail';

// Lus au DISQUE (cache mtime), pas importés : l'admin réécrit ces fichiers à
// chaque « Enregistrer » — un import statique les mettrait dans le graphe de
// modules et chaque save recompilerait les routes (cf. src/lib/data/disk.ts).
const MONSTERS = (): MonstersFile => loadDataJson<MonstersFile>('generated/monsters.json');
const SKILLS = (): MonsterSkillsFile =>
  loadDataJson<MonsterSkillsFile>('generated/monster-skills.json');
const DUNGEONS = (): EncountersFile => loadDataJson<EncountersFile>('generated/encounters.json');
const G = (): Glossaries => loadDataJson<Glossaries>('generated/glossaries.json');

/**
 * ID ÉPINGLÉ : `<id>@<n>` désigne un ÉTAT FIGÉ du boss, archivé par le bouton
 * « Versionner » de l'admin (`datagen/extractor/version-monster.ts`), et non
 * l'entité vivante. Un guide écrit contre l'ancien état continue ainsi de
 * décrire ce qu'il décrit après une refonte du boss en jeu.
 *
 * La convention était déjà posée côté jointure saison (`seasonsForBoss` coupe le
 * suffixe pour retrouver l'entité), mais rien ne savait LIRE l'archive : y
 * épingler un guide l'aurait fait jeter au rendu. C'est ce trou-ci que ferme
 * cette résolution.
 *
 * Un id vivant ne contient pas de `@` : pour lui, rien ne change.
 */
const isPinned = (id: string): boolean => id.includes('@');

/**
 * Entrée d'archive d'un id épinglé. LÈVE si le fichier manque : un pin qui ne
 * résout pas est une erreur de donnée (l'archive est append-only, elle ne perd
 * rien), et échouer ici nomme le vrai problème — laisser passer `undefined`
 * ferait dire à l'appelant « absent de monsters.json », ce qui est faux et
 * enverrait chercher au mauvais endroit.
 */
function archived(key: string): MonsterArchiveEntry {
  try {
    return loadDataJson<MonsterArchiveEntry>(`generated/monster-archive/${key}.json`);
  } catch {
    throw new Error(
      `Monstre épinglé « ${key} » : archive introuvable ` +
        `(data/generated/monster-archive/${key}.json). Un guide pointe une version ` +
        `figée qui n'a jamais été écrite, ou le fichier n'a pas été committé.`,
    );
  }
}

export function getMonster(id: string): Monster | undefined {
  return isPinned(id) ? archived(id).monster : MONSTERS()[id];
}

/**
 * ÉPINGLAGE D'UN GUIDE VERSIONNÉ — `<id>` → `<id>@<n>`, pour les guides qui ne
 * NOMMENT pas leur boss.
 *
 * Un guide versionné (joint challenge, world boss, guild raid) désigne un COMBAT
 * (`group`), pas un monstre : ses monstres sont résolus au rendu depuis
 * `encounters.json`, et il n'y a donc aucun id à réécrire dans le guide. Le pin
 * ne peut vivre que dans une LISTE à part — `pinned` dans le `config.json` de la
 * version — et c'est le rendu qui doit faire passer chaque id du combat au
 * travers. C'est ce que fait ce résolveur.
 *
 * La liste est CREUSE, exprès : un combat amène plusieurs monstres et une maj
 * n'en touche souvent qu'un. Un id absent reste donc LIVE, ce qui rend zéro
 * migration nécessaire sur les guides existants.
 *
 * Un id déjà épinglé n'est pas retouché : le guide a alors tranché lui-même.
 */
export function pinResolver(pinned?: readonly string[]): (id: string) => string {
  if (!pinned?.length) return (id) => id;
  const byLiveId = new Map<string, string>();
  // Premier gagnant : deux pins du même monstre dans une version est une erreur
  // de contenu, et prendre le second silencieusement la rendrait invisible.
  for (const key of pinned) {
    const live = key.split('@')[0];
    if (!byLiveId.has(live)) byLiveId.set(live, key);
  }
  return (id) => (isPinned(id) ? id : (byLiveId.get(id) ?? id));
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
  const names = new Map<string, string>();
  const count = new Map<string, number>();
  const byId = new Map<string, Monster>();
  for (const id of ids) {
    // `getMonster` et pas la table vivante : un guide épinglé passe ici des ids
    // `<id>@<n>`, et c'est le nom D'ÉPOQUE qu'il faut désambiguïser.
    const m = getMonster(id);
    if (!m) continue;
    byId.set(id, m);
    const name = lRec(m.name, lang);
    names.set(id, name);
    count.set(name, (count.get(name) ?? 0) + 1);
  }
  for (const [id, name] of names) {
    if ((count.get(name) ?? 0) < 2) continue;
    const element = lRec(G().elements?.[byId.get(id)!.element], lang);
    if (element) names.set(id, `${name} (${element})`);
  }
  return names;
}

/**
 * Skills d'un monstre (dans l'ordre du kit ; ids inconnus ignorés). `id` est
 * celui qui a servi à l'obtenir : sur un id
 * ÉPINGLÉ, les skills viennent de l'archive, pas de la table vivante.
 *
 * Le paramètre est REQUIS, et volontairement : les ids de skills sont les mêmes
 * avant et après une refonte, seul leur CONTENU change. Un appelant qui
 * l'oublierait afficherait donc les skills du nouveau boss sous l'entité figée —
 * faux, et parfaitement silencieux. Le typage force à trancher.
 */
export function getMonsterSkills(m: Monster, id: string): Skill[] {
  const skills = isPinned(id) ? archived(id).skills : SKILLS();
  return m.skills.map((sid) => skills[sid]).filter((s): s is Skill => Boolean(s));
}

/**
 * La VUE d'un boss, prête à rendre — le SEUL endroit où l'affichage choisit sa
 * provenance. Un id vivant lit le live ; un id épinglé lit l'archive, y compris
 * ses DONJONS : `versionMonster` les fige exprès pour que la carte garde ses
 * contextes de stats quand le donjon disparaît du live (événement retiré, stage
 * re-niveauté). Ils n'étaient jusqu'ici jamais relus — promesse écrite dans
 * l'archive, non tenue au rendu.
 */
export function getBossView(id: string): BossView | undefined {
  const monster = getMonster(id);
  if (!monster) return undefined;
  const entry = isPinned(id) ? archived(id) : undefined;
  return buildBossView(id, monster, getMonsterSkills(monster, id), {
    ...bossKitSources(entry),
    dungeons: entry?.dungeons ?? DUNGEONS(),
    ...(entry?.modes ? { modes: entry.modes } : {}),
    ...(entry?.sources?.curatedMonsterSkills
      ? { curation: entry.sources.curatedMonsterSkills }
      : {}),
    // Le tampon d'archive voyage AVEC la vue : la carte est la seule à pouvoir
    // dire « ceci est figé », et elle ne relira pas le disque pour le savoir.
    ...(entry
      ? {
          archived: {
            version: entry.version,
            ...(entry.gameVersion ? { gameVersion: entry.gameVersion } : {}),
            committedAt: entry.committedAt,
            ...(entry.label ? { label: entry.label } : {}),
          },
        }
      : {}),
  });
}

/**
 * D'où le boss tire le SENS de ses références d'effets. Une archive qui porte
 * ses sources gouverne seule : on ne complète PAS avec le live, sinon la moitié
 * figée et la moitié courante se mélangeraient sans qu'on puisse dire laquelle
 * on regarde. Que les sections figées suffisent est vérifié par un test, pas
 * espéré (`boss-view.test.ts` : « le rendu ne consulte que les sections figées »).
 *
 * Une archive SANS sources est d'avant ce mécanisme : elle retombe sur le live,
 * ce qui reste exactement le comportement qu'elle a toujours eu.
 */
function bossKitSources(entry?: MonsterArchiveEntry): KitSources {
  const s = entry?.sources;
  if (!s) return liveKitSources();
  // Index manquant → index VIDE, jamais `undefined` : la chaîne de résolution
  // indexe ces tables sans les tester (`g.effectByTooltip[ref]`), et une archive
  // écrite par une version antérieure du versionneur peut ne pas toutes les
  // porter. Un guide qui plante au rendu pour une section absente serait un
  // très mauvais échange — une réf non résolue se voit déjà à l'écran.
  const g = {
    ...s.glossary,
    effects: s.glossary.effects ?? {},
    effectByTooltip: s.glossary.effectByTooltip ?? {},
    effectByLabel: s.glossary.effectByLabel ?? {},
    effectByKey: s.glossary.effectByKey ?? { buff: {}, debuff: {} },
    statScales: s.glossary.statScales ?? {},
  } as Glossaries;
  return {
    g,
    fx: {
      effects: g.effects,
      byTooltip: g.effectByTooltip,
      byLabel: g.effectByLabel,
      byKey: g.effectByKey,
      curated: s.curatedEffects,
    },
  };
}

// Échelles de stats, quirks de compte, passifs de palier et rencontres du
// monstre vivent désormais DANS la vue : ils venaient du glossaire live, alors
// que la carte d'un boss épinglé doit les lire à SA source. Leurs accesseurs
// (`getStatScales`, `getBossQuirkMods`, `getRankOptions`, `rankOptionLabels`,
// `monsterSpawnContexts`) n'avaient qu'un appelant — la carte — et sont partis
// avec lui : cf. `bossRankOptionLabels` et `bossSpawnContexts` (boss-view.ts).

/**
 * Icône NUE d'un monstre (convention du jeu) : `icon` commençant par « 2 » =
 * modèle de PERSONNAGE réutilisé en boss → face icon composée ; sinon vignette
 * `MT_<icon>` (namespace boss existant — même clé que les sources d'équipement,
 * jamais de doublon inter-namespace).
 *
 * Pour un PORTRAIT, prendre `monsterThumb` : celui-ci ne rend que l'image, sans
 * le fond, les étoiles ni la bannière que le jeu pose autour. Il reste bon pour
 * les icônes posées dans du texte ou dans l'étiquette d'un onglet, où la
 * vignette complète serait illisible.
 */
export function monsterIconSrc(m: Pick<Monster, 'icon'>): string {
  return m.icon.startsWith('2') ? img.face(m.icon) : img.boss(`MT_${m.icon}`);
}

/**
 * Le monstre réduit à ce que sa VIGNETTE demande (cf. `MonsterThumb`) — à passer
 * tel quel à `Thumbnail`. Les vues qui traversent la frontière serveur → client
 * transportent cette forme, jamais une URL déjà résolue : c'est ce raccourci qui
 * faisait perdre le type, la rareté, l'élément et la classe en chemin.
 */
export function monsterThumb(
  m: Pick<Monster, 'icon' | 'type' | 'rarity' | 'element' | 'class'>,
): MonsterThumb {
  return { icon: m.icon, type: m.type, stars: m.rarity, element: m.element, cls: m.class };
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
