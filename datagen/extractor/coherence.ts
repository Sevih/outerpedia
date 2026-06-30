/**
 * Oracle de COHÉRENCE complet — personnages.
 *
 * Confronte la sortie V3 à TOUTES les sources perso de V2 (`data/legacy`), pas
 * seulement `character/*.json` :
 *   1. VALEURS  — pour chaque champ extrait, la valeur V3 == V2 ? (normalisée)
 *   2. CATÉGORIES — chaque bloc de donnée V2 (profils, skins, vidéos, stats,
 *      pros-cons, reco) a-t-il un équivalent en V3 ? (extrait / curé / manquant)
 *
 *   tsx datagen/extractor/coherence.ts
 *
 * Outil temporaire lié à l'oracle `data/legacy` (supprimable avec lui).
 */
import { readFileSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';

type Dict = Record<string, unknown>;
const load = (p: string): Dict => JSON.parse(readFileSync(resolve(p), 'utf8')) as Dict;
const tryLoad = (p: string): Dict => {
  try {
    return load(p);
  } catch {
    return {};
  }
};

const C = load('data/generated/characters.json') as Record<string, Dict>;
const G = load('data/generated/glossaries.json') as Dict & {
  elements: Dict;
  classes: Dict;
  gifts: Dict;
};

// Oracle par entité (V2 character/*.json), indexé par ID.
const LEGACY_DIR = 'data/legacy/character';
const V2: Record<string, Dict> = {};
for (const f of readdirSync(resolve(LEGACY_DIR))) {
  if (f.endsWith('.json')) {
    const o = load(`${LEGACY_DIR}/${f}`);
    V2[String(o.ID)] = o;
  }
}

// --- 1) Cohérence des valeurs -------------------------------------------------

const stripVA = (s: unknown) =>
  String(s ?? '')
    .replace(/^(VA|CV)\.\s*/, '')
    .trim()
    .toLowerCase();
const gloss = (g: Dict, slug: unknown) => (g[String(slug)] as Dict | undefined)?.en;

interface Check {
  field: string;
  /** valeur comparable côté V3 */
  v3: (c: Dict) => unknown;
  /** valeur comparable côté V2 */
  v2: (o: Dict) => unknown;
  /** ignore l'entité (ex. règle de nom des fusions) */
  skip?: (c: Dict, o: Dict) => boolean;
  /** différence attendue → informatif, pas un échec */
  info?: string;
}

const CHECKS: Check[] = [
  {
    field: 'name',
    v3: (c) =>
      c.showNickName && c.nickname
        ? `${(c.nickname as Dict).en} ${(c.name as Dict).en}`
        : (c.name as Dict).en,
    v2: (o) => o.Fullname,
    skip: (c) => Boolean(c.originalCharacter), // fusions : V2 = "Core Fusion: X" (voulu)
  },
  { field: 'rarity', v3: (c) => c.rarity, v2: (o) => o.Rarity },
  { field: 'element', v3: (c) => gloss(G.elements, c.element), v2: (o) => o.Element },
  { field: 'class', v3: (c) => gloss(G.classes, c.class), v2: (o) => o.Class },
  {
    field: 'subClass',
    v3: (c) => c.subClass,
    v2: (o) => String(o.SubClass ?? '').toLowerCase() || undefined,
  },
  {
    field: 'chainType',
    v3: (c) => c.chainType,
    v2: (o) => String(o.Chain_Type ?? '').toLowerCase() || undefined,
  },
  { field: 'gift', v3: (c) => gloss(G.gifts, c.gift), v2: (o) => o.gift },
  { field: 'originalCharacter', v3: (c) => c.originalCharacter, v2: (o) => o.originalCharacter },
  {
    field: 'voiceActor',
    v3: (c) => stripVA((c.voiceActor as Dict | undefined)?.en),
    v2: (o) => stripVA(o.VoiceActor),
    info: 'V3 = valeur du jeu (choix A) ; écarts = orthographe V2',
  },
];

function valueCoherence() {
  console.log('\n━━━ 1. COHÉRENCE DES VALEURS (V3 vs V2) ━━━');
  for (const chk of CHECKS) {
    let ok = 0,
      ko = 0,
      seen = 0;
    const ex: string[] = [];
    for (const [id, o] of Object.entries(V2)) {
      const c = C[id];
      if (!c || chk.skip?.(c, o)) continue;
      const a = chk.v2(o);
      if (a === undefined || a === '') continue; // V2 n'a pas la donnée
      seen++;
      if (chk.v3(c) === a) ok++;
      else {
        ko++;
        if (ex.length < 3)
          ex.push(`${id}: v3=${JSON.stringify(chk.v3(c))} v2=${JSON.stringify(a)}`);
      }
    }
    const tag = ko === 0 ? '✅' : chk.info ? 'ℹ️ ' : '❌';
    console.log(
      `  ${tag} ${chk.field.padEnd(18)} ${ok}/${seen}${ko ? `  (${ko} écarts) ${ex.join(' | ')}` : ''}`,
    );
    if (ko && chk.info) console.log(`        ↳ ${chk.info}`);
  }
}

// --- 2) Couverture des catégories de donnée ----------------------------------

interface Category {
  name: string;
  /** nb d'entités V2 ayant cette donnée */
  v2Count: number;
  /** état V3 */
  status: string;
}

function categoryCoverage() {
  const profiles = tryLoad('data/legacy/character-profiles.json');
  const skins = tryLoad('data/legacy/character-skins.json');
  const videos = tryLoad('data/legacy/character-videos.json');
  const prosCons = tryLoad('data/legacy/pros-cons.json');
  const stats = tryLoad('data/legacy/generated/character-stats.json');
  const recoDir = (() => {
    try {
      return readdirSync(resolve('data/legacy/reco')).filter((f) => f.endsWith('.json')).length;
    } catch {
      return 0;
    }
  })();

  // Curé : videos + pros-cons (data/curated, seedé depuis legacy par slug).
  const curated = tryLoad('data/curated/characters.json') as Record<string, Dict>;
  const curVideos = Object.values(curated).filter((c) => c.videos).length;
  const curPros = Object.values(curated).filter((c) => c.prosCons).length;

  // Skins : couverture + cohérence vs V2 (character-skins.json).
  const v3Costumes = Object.values(C).filter((c) => Array.isArray(c.costumes)).length;
  let skinOk = 0,
    skinSeen = 0;
  for (const [id, list] of Object.entries(skins as Record<string, Dict[]>)) {
    const cos = C[id]?.costumes as Dict[] | undefined;
    if (!cos) continue;
    skinSeen++;
    if (cos.length === list.length && (cos[0]?.name as Dict)?.en === (list[0]?.name as Dict)?.en)
      skinOk++;
  }

  // skill.offensive : cohérence vs V2 (offensive embarqué par skill).
  const S = tryLoad('data/generated/skills.json') as Record<string, Dict>;
  let offOk = 0,
    offSeen = 0;
  for (const o of Object.values(V2)) {
    for (const sk of Object.values((o.skills as Record<string, Dict>) ?? {})) {
      const id = String(sk.NameIDSymbol ?? '');
      if (sk.offensive === undefined || !S[id]) continue;
      offSeen++;
      if (S[id].offensive === sk.offensive) offOk++;
    }
  }

  // Profils : couverture + cohérence de valeurs vs V2.
  const v3Profiles = Object.values(C).filter((c) => c.profile).length;
  let profOk = 0,
    profSeen = 0;
  for (const [id, vp] of Object.entries(profiles as Record<string, Dict>)) {
    const p = C[id]?.profile as Dict | undefined;
    if (!p) continue;
    profSeen++;
    const heightOk = !vp.height || p.height === parseInt(String(vp.height), 10);
    const bdayOk = !vp.birthday || p.birthday === vp.birthday;
    if (heightOk && bdayOk) profOk++;
  }

  const cats: Category[] = [
    {
      name: 'profils (birthday/height/weight/story)',
      v2Count: Object.keys(profiles).length,
      status: `✅ EXTRAIT — V3 ${v3Profiles} persos, valeurs ${profOk}/${profSeen} cohérentes`,
    },
    {
      name: 'skins (nom + icône costume)',
      v2Count: Object.keys(skins).length,
      status: `✅ EXTRAIT — V3 ${v3Costumes} persos, ${skinOk}/${skinSeen} cohérents (costumes)`,
    },
    {
      name: 'stats détaillées par palier',
      v2Count: Object.keys(stats).length,
      status:
        '🟢 OK — V3 = base+transcend ; passif premium = effet skill class_passive (BT_STAT_PREMIUM)',
    },
    {
      name: 'videos (liste youtube)',
      v2Count: Object.keys(videos).length,
      status: `✅ CURÉ — ${curVideos} dans data/curated (seedé)`,
    },
    {
      name: 'pros-cons',
      v2Count: Object.keys(prosCons).length,
      status: `✅ CURÉ — ${curPros} dans data/curated (seedé)`,
    },
    {
      name: 'reco (gear)',
      v2Count: recoDir,
      status: '🟠 CURÉ — différé (système codé, à traiter avec le gear)',
    },
    {
      name: 'skill.offensive',
      v2Count: offSeen,
      status: `✅ EXTRAIT — ${offOk}/${offSeen} cohérents (dmg||chain)`,
    },
  ];

  console.log('\n━━━ 2. COUVERTURE DES CATÉGORIES ━━━');
  for (const c of cats) {
    const cnt = c.v2Count < 0 ? '   ?' : String(c.v2Count).padStart(4);
    console.log(`  ${cnt} V2  │ ${c.name.padEnd(40)} ${c.status}`);
  }
}

valueCoherence();
categoryCoverage();
console.log('');
