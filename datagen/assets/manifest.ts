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
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { STAT_ICON } from '../../src/lib/stats';

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
  // Items des fiches perso : cadeaux (gifts) + pièces de rappel (limit break).
  {
    const items = load('items.json') as unknown as Record<string, { type: string; icon: string }>;
    const prog = load('progression.json') as unknown as {
      limitBreak: Record<string, { recallItemId: string }[]>;
    };
    const wanted = new Set<string>();
    for (const [id, it] of Object.entries(items)) if (it.type === 'present') wanted.add(id);
    for (const list of Object.values(prog.limitBreak))
      for (const s of list)
        if (s.recallItemId && s.recallItemId !== '0') wanted.add(s.recallItemId);
    for (const id of wanted) {
      const icon = items[id]?.icon;
      if (icon)
        push({
          kind: 'image',
          key: `images/items/${icon}.webp`,
          candidates: [icon],
          domain: 'items',
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
