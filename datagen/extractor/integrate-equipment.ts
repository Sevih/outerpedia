/**
 * INTÉGRATION PAR ENTITÉ — ÉQUIPEMENT (le geste de validation humain, côté gear).
 *
 * Pendant de `integrate.ts` (perso/monstre) pour l'équipement. Intégrer une
 * entité d'équipement =
 *   1. merger SES lignes dans le fichier de slot (`weapon.json`, `accessory.json`,
 *      `talisman.json`, `ee.json`, `sets.json`) — une FAMILLE couvre plusieurs
 *      ids (paliers d'étoiles) ;
 *   2. merger SON entrée de famille dans `families.json` (armes/amulettes/
 *      talismans) ;
 *   3. merger les records PARTAGÉS qu'elle référence — pools de stats, passifs,
 *      paliers de casse — dans `pools.json` / `passives.json` / `breakLimits.json`
 *      (comme `integrateCharacter` embarque les skills : sans ça, réfs pendantes
 *      côté site pour une famille neuve) ;
 *   4. stager SES images (icônes d'items + de passifs) depuis les assets du jeu.
 *
 * Les glossaires transverses (grades, classes, noms de stats) restent, comme pour
 * le perso, du ressort de la revue globale (`datagen:build`) : une famille neuve
 * réutilise des grades/classes déjà committés, donc pas de réf pendante.
 *
 * Le cœur DONNÉES (`integrateEquipmentData`) est à chemin injectable et sans I/O
 * d'image → c'est la partie destructive, donc la partie testée
 * (`integrate-equipment.test.ts`). Le wrapper public y branche l'extraction
 * fraîche et le staging d'images.
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { writeJson as writeCanonicalJson } from '../lib/json';
import { buildImageIndex } from '../assets/source';
import { stageAssets } from '../assets/stage';
import type { AssetRequest } from '../assets/manifest';
import { buildEquipment, type EquipmentData, type Family } from '../generators/equipment';
import type { IntegrateReport } from './integrate';

const GEN = resolve('data/generated');

type Dict = Record<string, unknown>;
// `dir` injectable : les tests travaillent sur un dossier temporaire, jamais sur
// le vrai `data/generated` (écritures destructives). Mêmes helpers que
// `integrate.ts` — volontairement locaux pour ne pas coupler les deux cœurs.
const readJsonOr = (dir: string, rel: string): Dict => {
  try {
    return JSON.parse(readFileSync(resolve(dir, rel), 'utf8')) as Dict;
  } catch {
    return {}; // fichier absent (1re intégration) : on part d'un dictionnaire vide
  }
};
const writeJson = async (dir: string, rel: string, data: unknown): Promise<void> =>
  writeCanonicalJson(resolve(dir, rel), data);

/** Kind d'entité d'équipement intégrable — aligné sur les cibles de revue. */
export type EquipmentEntityKind = 'weapon' | 'accessory' | 'talisman' | 'ee' | 'set';

/** slot EquipmentData + fichier généré + clé de famille (null = pas de famille). */
const KIND: Record<
  EquipmentEntityKind,
  { slot: keyof EquipmentData; file: string; familyKey: 'weapon' | 'accessory' | 'talisman' | null }
> = {
  weapon: { slot: 'weapon', file: 'weapon', familyKey: 'weapon' },
  accessory: { slot: 'accessory', file: 'accessory', familyKey: 'accessory' },
  talisman: { slot: 'talisman', file: 'talisman', familyKey: 'talisman' },
  ee: { slot: 'ee', file: 'ee', familyKey: null },
  set: { slot: 'sets', file: 'sets', familyKey: null },
};

/** Forme lâche d'un item construit : seuls les champs de RÉFÉRENCE nous intéressent. */
interface GearRefs {
  icon?: string;
  main?: string[];
  sub?: string | null;
  options?: string[];
  passives?: { id: string }[];
  breakLimit?: string | null;
}

/** Ids de records partagés référencés par un lot d'items (pools/passifs/casse). */
function refsOf(items: GearRefs[]): {
  pools: Set<string>;
  passives: Set<string>;
  breaks: Set<string>;
} {
  const pools = new Set<string>();
  const passives = new Set<string>();
  const breaks = new Set<string>();
  for (const it of items) {
    for (const p of it.main ?? []) pools.add(p);
    if (it.sub) pools.add(it.sub);
    for (const o of it.options ?? []) pools.add(o);
    for (const pr of it.passives ?? []) passives.add(pr.id);
    if (it.breakLimit) breaks.add(it.breakLimit);
  }
  return { pools, passives, breaks };
}

/** Merge dans `rel` les seules clés `keys` prises dans `fresh` ; ne touche rien d'autre. */
async function mergeShared(
  dir: string,
  rel: string,
  fresh: Dict,
  keys: Set<string>,
  files: string[],
): Promise<void> {
  if (!keys.size) return;
  const committed = readJsonOr(dir, `equipment/${rel}.json`);
  for (const k of keys) if (k in fresh) committed[k] = fresh[k];
  await writeJson(dir, `equipment/${rel}.json`, committed);
  files.push(`equipment/${rel}.json`);
}

/** Upsert d'une famille dans le tableau du slot : remplace en place, sinon ajoute en fin. */
function upsertFamily(arr: Family[], fam: Family): Family[] {
  const i = arr.findIndex((f) => f.id === fam.id);
  if (i >= 0) {
    const next = arr.slice();
    next[i] = fam;
    return next;
  }
  return [...arr, fam];
}

/**
 * Cœur DONNÉES de l'intégration équipement : merge de l'entité + de ses records
 * partagés dans `dir`. Retourne les fichiers écrits ET les sprites à stager
 * (icônes d'items + de passifs) — le wrapper s'occupe des images. Séparé pour
 * être testable sur un dossier temporaire.
 */
export async function integrateEquipmentData(
  dir: string,
  fresh: EquipmentData,
  kind: EquipmentEntityKind,
  id: string,
): Promise<{ files: string[]; icons: string[] }> {
  const { slot, file, familyKey } = KIND[kind];
  const slotData = fresh[slot] as Dict;
  const files: string[] = [];
  const icons = new Set<string>();

  // 1) Ids membres : la famille couvre plusieurs paliers ; ee/set = un seul id.
  let memberIds: string[];
  let family: Family | undefined;
  if (familyKey) {
    family = fresh.families[familyKey].find((f) => f.id === id);
    if (!family) throw new Error(`famille ${kind} ${id} absente de l'extraction fraîche`);
    memberIds = family.ids;
  } else {
    if (!(id in slotData)) throw new Error(`${kind} ${id} absent de l'extraction fraîche`);
    memberIds = [id];
  }

  // Lignes de slot (nouvelle clé en fin, existante remplacée en place → diff minimal).
  const committedSlot = readJsonOr(dir, `equipment/${file}.json`);
  const members: GearRefs[] = [];
  for (const mid of memberIds) {
    const item = slotData[mid] as GearRefs | undefined;
    if (!item) continue;
    committedSlot[mid] = item;
    members.push(item);
    if (item.icon) icons.add(item.icon);
  }
  await writeJson(dir, `equipment/${file}.json`, committedSlot);
  files.push(`equipment/${file}.json`);

  // 2) Entrée de famille (armes/amulettes/talismans).
  if (family && familyKey) {
    const famFile = readJsonOr(dir, 'equipment/families.json') as Record<string, Family[]>;
    famFile[familyKey] = upsertFamily(famFile[familyKey] ?? [], family);
    await writeJson(dir, 'equipment/families.json', famFile);
    files.push('equipment/families.json');
  }

  // 3) Records partagés référencés (pools / passifs / paliers de casse).
  const { pools, passives, breaks } = refsOf(members);
  for (const pid of passives) {
    const p = fresh.passives[pid] as { icon?: string } | undefined;
    if (p?.icon) icons.add(p.icon);
  }
  await mergeShared(dir, 'pools', fresh.pools as Dict, pools, files);
  await mergeShared(dir, 'passives', fresh.passives as Dict, passives, files);
  await mergeShared(dir, 'breakLimits', fresh.breakLimits as Dict, breaks, files);

  return { files, icons: [...icons] };
}

/** Demande de staging d'une icône d'équipement (+ variante PNG pour l'og:image). */
function iconRequests(icons: string[], topIcon: string | undefined): AssetRequest[] {
  const reqs: AssetRequest[] = icons.map((icon) => ({
    kind: 'image',
    key: `images/equipment/${icon}.webp`,
    candidates: [icon],
    domain: 'equipment',
  }));
  // og:image (aperçus Discord/OG) des pages détail : PNG de l'icône représentative.
  if (topIcon)
    reqs.push({
      kind: 'image',
      key: `images/equipment/${topIcon}.png`,
      candidates: [topIcon],
      domain: 'equipment',
    });
  return reqs;
}

/**
 * Intègre UNE entité d'équipement (bouton « Intégrer » de la fiche extracteur) :
 * données (lignes + famille + records partagés) puis images. Déclenché par
 * l'admin uniquement. Committe via git, puis `pnpm assets:push` pour le R2.
 */
export async function integrateEquipment(
  kind: EquipmentEntityKind,
  id: string,
): Promise<IntegrateReport> {
  const fresh = buildEquipment();
  const { files, icons } = await integrateEquipmentData(GEN, fresh, kind, id);

  // Icône représentative pour l'og PNG : topId de la famille, sinon l'id lui-même.
  const { slot, familyKey } = KIND[kind];
  const topId = familyKey ? fresh.families[familyKey].find((f) => f.id === id)?.topId : id;
  const topIcon = topId ? (fresh[slot] as Dict)[topId] : undefined;
  const topIconName =
    topIcon && typeof (topIcon as GearRefs).icon === 'string'
      ? (topIcon as GearRefs).icon
      : undefined;

  const assets = await stageAssets(iconRequests(icons, topIconName), buildImageIndex());
  return { id, files, assets };
}
