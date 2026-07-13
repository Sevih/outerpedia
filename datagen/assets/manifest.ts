/**
 * MANIFEST des assets — « de quelles images la donnée a-t-elle besoin ? »
 *
 * Dérivé de `data/generated/*` : chaque entité déclare ses besoins. La SOURCE
 * est l'extraction du JEU (`.gamedata/extracted/images`, noms de sprites =
 * clés stables) — jamais le pool V2, sauf l'ÉDITORIAL qui n'existe pas en jeu
 * (drapeaux, image OG, BD…).
 *
 * Trois genres de demandes :
 *   - `image`     : trouver le sprite du jeu (candidats = basenames) → webp ;
 *   - `face-icon` : COMPOSÉE depuis le portrait + layout Unity (cf. face-icon.ts) ;
 *   - `editorial` : copie telle quelle depuis le pool V2 (hors jeu).
 */
import { readFileSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { STAT_ICON } from '../../src/lib/stats';
import { rankBadgeSprite } from '../../src/lib/ranks';
import { MISSING_ITEM_ICONS as ITEM_ICON_BLACKLIST } from '../../src/lib/data/item-blacklist';
import { GUIDE_CATEGORIES } from '../../src/lib/data/guide-categories';
import { listGuides } from '../../src/lib/data/guides';
import { buildItemCatalog } from '../generators/item-catalog';

export type AssetRequest =
  | {
      kind: 'image';
      key: string;
      candidates: string[];
      domain: string;
      /** Copie depuis le pool V2 si aucun sprite du jeu ne matche (icônes wiki). */
      editorialFallback?: string;
    }
  | { kind: 'face-icon'; key: string; id: string; domain: string }
  | { kind: 'editorial'; key: string; source: string; domain: string };

type Dict = Record<string, Record<string, unknown>>;
const load = (p: string): Dict =>
  JSON.parse(readFileSync(resolve('data/generated', p), 'utf8')) as Dict;

const cap = (s: string) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s);

/** Besoins d'UN personnage (réutilisé par le manifest global ET l'intégration). */
export function characterAssetRequests(
  c: Record<string, unknown>,
  skillIcons: string[],
): AssetRequest[] {
  const id = String(c.id);
  const out: AssetRequest[] = [
    {
      kind: 'image',
      key: `images/characters/portrait/CT_${id}.webp`,
      candidates: [`CT_${id}`],
      domain: 'characters',
    },
    {
      kind: 'image',
      key: `images/characters/full/IMG_${id}.webp`,
      candidates: [`IMG_${id}`],
      domain: 'characters',
    },
    {
      kind: 'face-icon',
      key: `images/characters/faceicon/FI_${id}.webp`,
      id,
      domain: 'characters',
    },
    // Variante PNG : og:image de la fiche perso (aperçus Discord/OG).
    {
      kind: 'face-icon',
      key: `images/characters/faceicon/FI_${id}.png`,
      id,
      domain: 'characters',
    },
    {
      kind: 'image',
      key: `images/characters/atb/IG_Turn_${id}.webp`,
      candidates: [`IG_Turn_${id}`],
      domain: 'characters',
    },
  ];
  if (c.ee) {
    out.push({
      kind: 'image',
      key: `images/characters/ee/${id}.webp`,
      candidates: [`TI_Equipment_EX_${id}`],
      domain: 'characters',
    });
    // Variante PNG : og:image de la page détail de l'EE.
    out.push({
      kind: 'image',
      key: `images/characters/ee/${id}.png`,
      candidates: [`TI_Equipment_EX_${id}`],
      domain: 'characters',
    });
  }
  if (c.chainType && c.element) {
    const name = `Skill_ChainPassive_${cap(String(c.element))}_${cap(String(c.chainType))}`;
    out.push({
      kind: 'image',
      key: `images/characters/chain/${name}.webp`,
      candidates: [name],
      domain: 'characters',
    });
  }
  for (const icon of skillIcons) {
    out.push({
      kind: 'image',
      key: `images/characters/skills/${icon}.webp`,
      candidates: [icon],
      domain: 'skills',
    });
  }
  // SKINS/APPARENCES (20X…/27X…) : chacun a ses PROPRES CT_/FI_/IG_Turn_ — et
  // les boss « personnages » réutilisent souvent le FaceIconID d'un skin
  // (MonsterTemplet.FaceIconID = 2010004…) : sans ça, FI_<skin> ne serait
  // jamais produit et l'affichage tape dans le vide.
  for (const app of (c.appearances as string[] | undefined) ?? []) {
    out.push(
      {
        kind: 'image',
        key: `images/characters/portrait/CT_${app}.webp`,
        candidates: [`CT_${app}`],
        domain: 'characters',
      },
      {
        kind: 'face-icon',
        key: `images/characters/faceicon/FI_${app}.webp`,
        id: app,
        domain: 'characters',
      },
      {
        kind: 'image',
        key: `images/characters/atb/IG_Turn_${app}.webp`,
        candidates: [`IG_Turn_${app}`],
        domain: 'characters',
      },
    );
  }
  // Full arts des skins (modèles de costume dont le rendu existe — flag `art`).
  for (const cos of (c.costumes as Record<string, unknown>[] | undefined) ?? []) {
    const models = [
      cos.art ? String(cos.model) : null,
      cos.fusionArt ? String(cos.fusionModel) : null,
    ];
    for (const m of models) {
      if (!m || m === '0' || m === id) continue;
      out.push({
        kind: 'image',
        key: `images/characters/full/IMG_${m}.webp`,
        candidates: [`IMG_${m}`],
        domain: 'characters',
      });
    }
  }
  return out;
}

/** Icônes des skills d'un perso (depuis le catalogue skills). */
export function skillIconsOf(c: Record<string, unknown>, skills: Dict): string[] {
  const ids = (c.skills as string[]) ?? [];
  return ids.map((sid) => skills[sid]?.icon).filter((i): i is string => Boolean(i));
}

export function buildAssetManifest(): AssetRequest[] {
  const characters = load('characters.json');
  const skills = load('skills.json');
  const glossaries = load('glossaries.json') as unknown as {
    elements: Record<string, unknown>;
    classes: Record<string, unknown>;
    subClasses: Record<string, unknown>;
    effects: Record<string, { icon?: string }>;
  };

  const out: AssetRequest[] = [];
  const seen = new Set<string>();
  const push = (r: AssetRequest) => {
    if (!seen.has(r.key)) {
      seen.add(r.key);
      out.push(r);
    }
  };

  // --- Personnages (+ leurs skills) ------------------------------------------
  for (const c of Object.values(characters)) {
    for (const r of characterAssetRequests(c, skillIconsOf(c, skills))) push(r);
  }

  // --- Glossaires UI : éléments / classes / sous-classes ---------------------
  // Les icônes élément/classe du site = celles de l'ordre de tour du jeu
  // (IG_Turn_*), pas les CM_* (autres contextes d'UI).
  for (const el of Object.keys(glossaries.elements))
    push({
      kind: 'image',
      key: `images/ui/elem/IG_Turn_Element_${cap(el)}.webp`,
      candidates: [`IG_Turn_Element_${cap(el)}`],
      domain: 'ui',
    });
  // Le slug canonique diffère de l'enum du jeu (striker↔Attacker, healer↔Priest) ;
  // les sprites portent le nom d'ENUM → la clé reste au slug, candidats = enum.
  const CLASS_ENUM: Record<string, string> = { striker: 'Attacker', healer: 'Priest' };
  for (const cl of Object.keys(glossaries.classes))
    push({
      kind: 'image',
      key: `images/ui/class/IG_Turn_Class_${cap(cl)}.webp`,
      candidates: [
        `IG_Turn_Class_${cap(cl)}`,
        ...(CLASS_ENUM[cl] ? [`IG_Turn_Class_${CLASS_ENUM[cl]}`] : []),
      ],
      domain: 'ui',
    });
  for (const sc of Object.keys(glossaries.subClasses))
    push({
      kind: 'image',
      key: `images/ui/class/CM_Sub_Class_${cap(sc)}.webp`,
      candidates: [`CM_Sub_Class_${cap(sc)}`],
      domain: 'ui',
    });

  // --- Effets : icône de base + replis de nommage ----------------------------
  // Extraits (glossaire) + CRÉATIONS curées (mécaniques sans texte en jeu —
  // leurs icônes sont de vrais sprites du jeu).
  let curatedEffects: Record<string, { icon?: string }> = {};
  try {
    curatedEffects = JSON.parse(
      readFileSync(resolve('data/curated/effects.json'), 'utf8'),
    ) as Record<string, { icon?: string }>;
  } catch {
    /* pas de curé — rien à ajouter */
  }
  // Priorité aux sprites SC_* (icône nue) — les IG_* portent un cadre noir
  // opaque et ne servent qu'en repli.
  const sc = (n: string) => n.replace(/^IG_/, 'SC_');
  for (const e of [...Object.values(glossaries.effects), ...Object.values(curatedEffects)]) {
    if (!e.icon) continue;
    push({
      kind: 'image',
      key: `images/ui/effect/${e.icon}.webp`,
      candidates: [sc(e.icon), e.icon],
      domain: 'effects',
      editorialFallback: `ui/effect/${e.icon}.webp`,
    });
  }

  // --- Domaine équipement : pages /equipment ---------------------------------
  // Familles AFFICHABLES (grade unique aux paliers hauts), pièces de sets,
  // icônes de sets/passifs, cadres de rareté, boss des sources curées.
  {
    const tables = {
      weapon: load('equipment/weapon.json'),
      accessory: load('equipment/accessory.json'),
      talisman: load('equipment/talisman.json'),
      helmet: load('equipment/helmet.json'),
      armor: load('equipment/armor.json'),
      gloves: load('equipment/gloves.json'),
      shoes: load('equipment/shoes.json'),
      ee: load('equipment/ee.json'),
    };
    const passives = load('equipment/passives.json') as Record<string, { icon?: string }>;
    const pushItem = (icon: unknown) => {
      if (typeof icon === 'string' && icon)
        push({
          kind: 'image',
          key: `images/equipment/${icon}.webp`,
          candidates: [icon],
          domain: 'equipment',
        });
    };
    // Variante PNG : og:image des pages détail équipement (aperçus Discord/OG).
    const pushOgItem = (icon: unknown) => {
      pushItem(icon);
      if (typeof icon === 'string' && icon)
        push({
          kind: 'image',
          key: `images/equipment/${icon}.png`,
          candidates: [icon],
          domain: 'equipment',
        });
    };
    const passiveIcons = new Set<string>();
    const collectPassives = (it: Record<string, unknown>) => {
      for (const ref of (it.passives as { id: string }[] | undefined) ?? []) {
        const p = passives[ref.id];
        if (p?.icon) passiveIcons.add(p.icon);
      }
    };
    // Familles de wiki (la règle d'affichabilité vit dans families.json).
    const families = load('equipment/families.json') as unknown as Record<
      'weapon' | 'accessory' | 'talisman',
      { topId: string; wiki: boolean }[]
    >;
    for (const slot of ['weapon', 'accessory', 'talisman'] as const) {
      for (const f of families[slot]) {
        if (!f.wiki) continue;
        const it = tables[slot][f.topId];
        pushOgItem(it.icon);
        collectPassives(it);
      }
    }
    // EE : tous ; pièces d'armure des sets : paliers hauts (icônes partagées).
    for (const it of Object.values(tables.ee)) collectPassives(it);
    for (const slot of ['helmet', 'armor', 'gloves', 'shoes'] as const) {
      for (const it of Object.values(tables[slot])) {
        if (it.grade === 'unique' && Number(it.star) >= 6) pushOgItem(it.icon);
      }
    }
    for (const s of Object.values(load('equipment/sets.json'))) pushItem(s.icon);
    for (const icon of passiveIcons) pushItem(icon);
    // Icônes de stats du jeu (table unique STAT_ICON — src/lib/stats) + icône
    // du Combat Power (fiche perso).
    for (const sprite of new Set([...Object.values(STAT_ICON), 'CM_Icon_Power']))
      push({
        kind: 'image',
        key: `images/ui/stat/${sprite}.webp`,
        candidates: [sprite],
        domain: 'ui',
      });
    // Cadres de rareté des tuiles d'items + étoile singularity (détail à venir).
    for (const frame of ['Normal', 'Magic', 'Rare', 'Unique', 'Singularity'])
      push({
        kind: 'image',
        key: `images/ui/bg/TI_Slot_${frame}.webp`,
        candidates: [`TI_Slot_${frame}`],
        domain: 'ui',
      });
    // Matériaux d'ascension Singularity (coûts de la page détail).
    {
      const enh = load('equipment/enhance.json') as unknown as {
        singularity: {
          activation: { materials: { icon: string }[] };
          steps: { materials: { icon: string }[] }[];
        };
      };
      for (const m of [
        ...enh.singularity.activation.materials,
        ...enh.singularity.steps.flatMap((s) => s.materials),
      ])
        pushItem(m.icon);
    }
    // Boss des sources d'obtention (résolus par le build depuis le curé).
    for (const b of Object.values(load('equipment/bosses.json'))) {
      if (typeof b.icon === 'string' && b.icon)
        push({
          kind: 'image',
          key: `images/ui/boss/${b.icon}.webp`,
          candidates: [b.icon],
          domain: 'ui',
        });
    }
  }

  // --- Gear reco : icônes des équipements réellement recommandés -------------
  // Collecte CIBLÉE : uniquement les ids référencés par la couche curée
  // (gear-reco + presets), pas les ~850 items du jeu.
  try {
    const reco = JSON.parse(readFileSync(resolve('data/curated/gear-reco.json'), 'utf8')) as Record<
      string,
      {
        weapons?: { id: string }[];
        amulets?: { id: string }[];
        talismans?: string[];
        sets?: { preset?: string; pieces?: { set: string }[] }[];
      }[]
    >;
    const presets = JSON.parse(readFileSync(resolve('data/curated/gear-presets.json'), 'utf8')) as {
      talismans: Record<string, string[]>;
      sets: Record<string, { set: string }[]>;
    };
    const equip = (file: string) =>
      JSON.parse(readFileSync(resolve(`data/generated/equipment/${file}`), 'utf8')) as Record<
        string,
        { icon?: string }
      >;
    const tables = {
      weapons: equip('weapon.json'),
      amulets: equip('accessory.json'),
      talismans: equip('talisman.json'),
    };
    const setsTable = equip('sets.json');
    const wanted: Record<keyof typeof tables, Set<string>> = {
      weapons: new Set(),
      amulets: new Set(),
      talismans: new Set(),
    };
    const wantedSets = new Set<string>();
    for (const ids of Object.values(presets.talismans)) ids.forEach((i) => wanted.talismans.add(i));
    for (const combo of Object.values(presets.sets)) combo.forEach((p) => wantedSets.add(p.set));
    for (const builds of Object.values(reco))
      for (const b of builds) {
        b.weapons?.forEach((w) => wanted.weapons.add(w.id));
        b.amulets?.forEach((a) => wanted.amulets.add(a.id));
        b.talismans?.forEach((tl) => !tl.startsWith('$') && wanted.talismans.add(tl));
        b.sets?.forEach((c) => c.pieces?.forEach((p) => wantedSets.add(p.set)));
      }
    for (const [kind, ids] of Object.entries(wanted) as [keyof typeof tables, Set<string>][])
      for (const id of ids) {
        const icon = tables[kind][id]?.icon;
        if (icon)
          push({
            kind: 'image',
            key: `images/equipment/${icon}.webp`,
            candidates: [icon],
            domain: 'equipment',
          });
      }
    for (const id of wantedSets) {
      const icon = setsTable[id]?.icon;
      if (icon)
        push({
          kind: 'image',
          key: `images/ui/effect/${icon}.webp`,
          candidates: [icon],
          domain: 'ui',
        });
    }
  } catch {
    /* pas de gear-reco curé — rien à collecter */
  }

  // --- UI statique de la fiche perso (portage apparence V2) ------------------
  // Traits de titres, étoiles, onglets d'évolution, rangs, bursts, stats…
  const UI_SPRITES: Array<[dir: string, names: string[]]> = [
    [
      'common',
      [
        'CM_Result_Victory_Bg',
        'CM_Result_Victory_Line',
        'CM_Gradation_Bg',
        'CM_Gauge_CharacterInfo',
        'CM_Gauge_AccountInfo',
        'CM_Desc_Bg',
      ],
    ],
    [
      'star',
      [
        'CM_icon_star_y',
        'CM_Character_Thumbnail_Star_Slot',
        'CM_Star_Singularity',
        // Étoiles de transcendance (couleurs déclarées par le jeu).
        'CM_icon_star_w',
        'CM_icon_star_o',
        'CM_icon_star_r',
        'CM_icon_star_v',
      ],
    ],
    ['evo', ['CM_Evolution_Tab', 'CM_Evolution_Tab_Select']],
    ['rank', ['SSS', 'SS', 'S', 'A', 'B', 'C', 'D'].map((r) => `IG_Event_Rank_${r}`)],
    [
      'skills',
      ['CM_Skill_Icon_Burst', 'IG_Button_Burst_01', 'IG_Button_Burst_02', 'IG_Button_Burst_03'],
    ],
    ['nav', ['IG_Chain_Arrow']],
    [
      'effect',
      [
        'CM_Stat_Icon_ATK',
        'CM_Stat_Icon_DEF',
        'CM_Stat_Icon_HP',
        'CM_Stat_Icon_SPEED',
        'CM_Stat_Icon_CRITICAL',
        'CM_Stat_Icon_CRITICAL_DMG',
        'CM_Stat_Icon_CHANCE',
        'CM_Stat_Icon_RESIST',
        'CM_Stat_Icon_DMG_INCREASE',
        'CM_Stat_Icon_ENEMY_DMG_REDUCE',
      ],
    ],
  ];
  for (const [dir, names] of UI_SPRITES)
    for (const name of names)
      push({
        kind: 'image',
        key: `images/ui/${dir}/${name}.webp`,
        candidates: [name],
        domain: 'ui',
      });
  // Cartes de persos : badges de recrutement (Collab/Free absents des tables
  // du jeu → repli pool V2) + icône core-fusion.
  for (const name of [
    'CM_Recruit_Tag_Collab',
    'CM_Recruit_Tag_Seasonal',
    'CM_Recruit_Tag_Premium',
    'CM_Recruit_Tag_Free',
    'CM_Recruit_Tag_Fes',
  ])
    push({
      kind: 'image',
      key: `images/ui/recruit/${name}.webp`,
      candidates: [name],
      domain: 'ui',
      editorialFallback: `ui/recruit/${name}.webp`,
    });
  push({
    kind: 'image',
    key: 'images/ui/tags/CT_Core_Icon.webp',
    candidates: ['CT_Core_Icon'],
    domain: 'ui',
    editorialFallback: 'ui/tags/CT_Core_Icon.webp',
  });
  push({
    kind: 'image',
    key: 'images/items/CM_Goods_Gold.webp',
    candidates: ['CM_Goods_Gold'],
    domain: 'ui',
  });
  // Catalogue d'items UNIFIÉ : TOUTES les icônes déclarées (items + monnaies +
  // costumes + overrides/créations curés) sous le namespace `images/items/`. Un
  // item est référençable partout (fiches perso, cadeaux, rewards de promo-codes,
  // outils admin…). Collecter à la source (le catalogue = donnée, pas les 11k
  // sprites du jeu) évite les 404 ; les icônes sans sprite remontent au rapport.
  for (const icon of new Set(
    Object.values(buildItemCatalog())
      .map((e) => e.icon)
      .filter((i): i is string => Boolean(i) && !ITEM_ICON_BLACKLIST.has(i)),
  ))
    push({
      kind: 'image',
      key: `images/items/${icon}.webp`,
      candidates: [icon],
      domain: 'items',
    });
  // TOUS les sprites d'items du jeu (`TI_*`), y compris ceux pas encore
  // rattachés à un item : l'admin (Editor › Item) les liste comme « à rentrer »
  // et doit pouvoir les prévisualiser.
  try {
    const dir = resolve(
      '.gamedata/extracted/images/assets/editor/resources/sprite/at_thumbnailitemruntime',
    );
    for (const f of readdirSync(dir)) {
      if (!/^TI_.*\.png$/i.test(f)) continue;
      const icon = f.replace(/\.png$/i, '');
      push({
        kind: 'image',
        key: `images/items/${icon}.webp`,
        candidates: [icon],
        domain: 'items',
      });
    }
  } catch {
    /* sprites pas extraits */
  }

  // --- Guides : icônes de catégories + icônes des meta.json ------------------
  // Namespace UNIQUE `images/ui/guides/` (dédoublonné par clé — un sprite
  // partagé par N guides n'est stocké qu'une fois). Collecte DATA-DRIVEN :
  // catégories déclarées + scan des guides — jamais de liste manuelle. Les
  // visuels de boss ne passent PAS ici (référencés par `bossId`, namespace
  // boss existant) pour ne pas dupliquer un sprite entre namespaces.
  //
  // LES ICÔNES DE CATÉGORIE VIENNENT DU POOL V2, PAS DE L'EXTRACTION.
  //
  // Ce sont des icônes de MENU, et le jeu remanie ses menus : il a déjà réutilisé
  // `CM_Adventure_Cooperation`, `CM_Adventure_WorldBoss` et
  // `CM_Adventure_MonadGate` pour des vignettes de décor de 224×140 là où
  // c'étaient des icônes de ~80 px. Extraites telles quelles, elles donnaient des
  // paysages en guise d'icônes de menu sur /guides — et le sprite ÉTANT présent,
  // `editorialFallback` (qui ne se déclenche qu'en cas d'absence) ne voyait rien.
  //
  // Une liste d'exceptions aurait dérivé au premier remaniement suivant : c'est
  // une course qu'on ne gagne pas. Le pool V2 est FIGÉ et ces douze icônes y sont
  // toutes — c'est notre chrome de navigation, pas de la donnée de jeu, et il n'a
  // aucune raison de suivre les refontes d'UI de l'éditeur.
  //
  // Les icônes des GUIDES eux-mêmes (bannières `T_Banner_*` du meta.json) restent
  // extraites du jeu : celles-là SONT du contenu, et doivent suivre ses mises à
  // jour.
  const guides = listGuides();
  for (const icon of new Set(Object.values(GUIDE_CATEGORIES).map((c) => c.icon)))
    push({
      kind: 'editorial',
      key: `images/ui/guides/${icon}.webp`,
      source: `guides/${icon}.webp`,
      domain: 'guides',
    });
  for (const icon of new Set(guides.map((g) => g.icon)))
    push({
      kind: 'image',
      key: `images/ui/guides/${icon}.webp`,
      candidates: [icon],
      domain: 'guides',
      editorialFallback: `guides/${icon}.webp`,
    });
  // Boss liés aux guides (`meta.json` → bossId, convention : le boss COURANT) :
  // portrait sous le namespace boss EXISTANT (même clé que les sources
  // d'équipement → jamais deux copies) + icônes de ses skills sous le
  // namespace skills commun aux personnages. Icône commençant par « 2 » =
  // modèle de perso réutilisé → face icon déjà produite par le domaine perso.
  {
    const monsters = load('monsters.json') as Record<
      string,
      { icon?: string; skills?: string[] } | undefined
    >;
    const monsterSkills = load('monster-skills.json') as Record<
      string,
      { icon?: string } | undefined
    >;
    for (const g of guides) {
      if (!g.bossId) continue;
      const m = monsters[g.bossId];
      if (!m) continue;
      if (m.icon && !m.icon.startsWith('2')) {
        push({
          kind: 'image',
          key: `images/ui/boss/MT_${m.icon}.webp`,
          candidates: [`MT_${m.icon}`],
          domain: 'guides',
        });
        // Variante PNG : og:image du guide de boss (aperçus Discord/OG), même
        // convention que les faceicons de persos et les EE. Tirée UNIQUEMENT ici,
        // pour les boss qu'un guide couvre — la bibliothèque Singularity affiche
        // aussi des boss sans guide, qui n'ont donc pas de carte à partager.
        push({
          kind: 'image',
          key: `images/ui/boss/MT_${m.icon}.png`,
          candidates: [`MT_${m.icon}`],
          domain: 'guides',
        });
      }
      for (const sid of m.skills ?? []) {
        const icon = monsterSkills[sid]?.icon;
        if (icon)
          push({
            kind: 'image',
            key: `images/characters/skills/${icon}.webp`,
            candidates: [icon],
            domain: 'guides',
          });
      }
    }
  }

  // VARIANTES DE DIFFICULTÉ des boss de guides : les panneaux de rencontre
  // affichent TOUT le groupe de combat (ligues du world boss, stages…), et
  // chaque variante a son PROPRE kit — souvent avec des icônes qui
  // n'appartiennent à aucun personnage (Skill_Second_2100090 : le S2 de la
  // Dahlia de ligue Hard, 4086020). Collecte data-driven : bossId du guide →
  // groupes de combat de ses donjons (`encounters.group`) → monstres du
  // groupe → portrait + icônes de skills (dédup par clé via `push`).
  {
    const monsters = load('monsters.json') as Record<
      string,
      { icon?: string; skills?: string[]; spawns?: Array<{ dungeon: string }> } | undefined
    >;
    const monsterSkills = load('monster-skills.json') as Record<
      string,
      { icon?: string } | undefined
    >;
    const encounters = load('encounters.json') as Record<
      string,
      { group?: string; monsters?: Array<{ id: string }> } | undefined
    >;
    const groupMonsters = new Map<string, Set<string>>();
    const groupOf = new Map<string, string>();
    for (const [did, d] of Object.entries(encounters)) {
      if (!d?.group) continue;
      groupOf.set(did, d.group);
      const set = groupMonsters.get(d.group) ?? new Set<string>();
      for (const dm of d.monsters ?? []) set.add(dm.id);
      groupMonsters.set(d.group, set);
    }
    for (const g of guides) {
      if (!g.bossId) continue;
      const variants = new Set<string>();
      for (const s of monsters[g.bossId]?.spawns ?? []) {
        const grp = groupOf.get(s.dungeon);
        if (grp) for (const id of groupMonsters.get(grp) ?? []) variants.add(id);
      }
      for (const id of variants) {
        const m = monsters[id];
        if (!m) continue;
        if (m.icon && !m.icon.startsWith('2'))
          push({
            kind: 'image',
            key: `images/ui/boss/MT_${m.icon}.webp`,
            candidates: [`MT_${m.icon}`],
            domain: 'guides',
          });
        for (const sid of m.skills ?? []) {
          const icon = monsterSkills[sid]?.icon;
          if (icon)
            push({
              kind: 'image',
              key: `images/characters/skills/${icon}.webp`,
              candidates: [icon],
              domain: 'guides',
            });
        }
      }
    }
  }

  // Boss de la ROTATION Dimensional Singularity : la vue de catégorie les
  // affiche tous (bibliothèque), y compris ceux qu'aucun guide ne couvre encore
  // — ils ne seraient donc jamais collectés par le bloc `bossId` ci-dessus.
  // Collecte DATA-DRIVEN depuis `singularity.json`, sous le namespace boss
  // EXISTANT et avec la même clé (`MT_<icon>`) : un boss déjà tiré par un guide
  // ou par une source d'équipement n'est PAS stocké une seconde fois.
  //
  // On ne collecte PAS les sprites `MT_/T_Singularity_*` que porte la table :
  // ce sont d'autres visuels du MÊME boss. La vignette de boss suffit, et un
  // second visuel par boss serait exactement le doublon qu'on refuse.
  {
    const monsters = load('monsters.json') as Record<string, { icon?: string } | undefined>;
    const rotation = load('singularity.json') as unknown as {
      groups: { bosses: { monsters: string[]; thumbnail?: string; banner?: string }[] }[];
    };
    const bosses = rotation.groups.flatMap((g) => g.bosses);
    for (const id of new Set(bosses.flatMap((b) => b.monsters))) {
      const icon = monsters[id]?.icon;
      if (icon && !icon.startsWith('2'))
        push({
          kind: 'image',
          key: `images/ui/boss/MT_${icon}.webp`,
          candidates: [`MT_${icon}`],
          domain: 'guides',
        });
    }
    // Art DÉDIÉ du mode (bannière large + avatar rond), nommé par la table
    // elle-même : on ne fabrique aucun nom de fichier. Sprites distincts du
    // portrait `MT_<icon>` ci-dessus (cadrages différents), donc pas des
    // doublons — namespace unique `images/ui/singularity/`.
    for (const sprite of new Set(
      bosses.flatMap((b) => [b.thumbnail, b.banner].filter((s): s is string => Boolean(s))),
    ))
      push({
        kind: 'image',
        key: `images/ui/singularity/${sprite}.webp`,
        candidates: [sprite],
        domain: 'guides',
      });
  }

  // Badges de PALIER de combat (`CM_Event_Rank_*`) : collectés depuis les
  // paliers RÉELS des donjons, jamais depuis une liste écrite à la main — un
  // palier ajouté par un patch amène donc son sprite tout seul.
  {
    const encounters = load('encounters.json') as unknown as Record<
      string,
      { ranks?: { name?: string }[] }
    >;
    const names = new Set(
      Object.values(encounters).flatMap((d) =>
        (d.ranks ?? []).map((r) => r.name).filter((n): n is string => Boolean(n)),
      ),
    );
    for (const name of names) {
      const sprite = rankBadgeSprite(name);
      push({
        kind: 'image',
        key: `images/ui/rank/${sprite}.webp`,
        candidates: [sprite],
        domain: 'ui',
      });
    }
  }

  // --- Éditorial (n'existe pas en jeu) : drapeaux + OG -----------------------
  for (const flag of ['gb', 'jp', 'kr', 'cn', 'fr'])
    push({
      kind: 'editorial',
      key: `images/ui/flags/${flag}.svg`,
      source: `ui/flags/${flag}.svg`,
      domain: 'editorial',
    });
  push({
    kind: 'editorial',
    key: 'images/ui/og_default.jpg',
    source: 'ui/og_default.jpg',
    domain: 'editorial',
  });
  // Fond de page du site (artwork retravaillé, hors extraction).
  push({
    kind: 'editorial',
    key: 'images/background_compressed.webp',
    source: 'background_compressed.webp',
    domain: 'editorial',
  });
  // Icônes de tags (créées pour le wiki).
  for (const tag of [
    'premium',
    'limited',
    'seasonal',
    'collab',
    'free',
    'ignore-defense',
    'core-fusion',
  ])
    push({
      kind: 'editorial',
      key: `images/ui/tags/${tag}.webp`,
      source: `ui/tags/${tag}.webp`,
      domain: 'editorial',
    });

  return out;
}
