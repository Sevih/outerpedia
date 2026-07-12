/**
 * IMPORT ONE-SHOT : `data/legacy/reco/*` (écrit main, noms EN) →
 * `data/curated/gear-reco.json` + `data/curated/gear-presets.json` (ids V3).
 *
 * Résolution par nom EN normalisé (apostrophes/casse) contre l'équipement
 * généré. Tout nom irrésoluble est LISTÉ en sortie et conservé tel quel
 * préfixé `!` (visible dans l'admin, à arbitrer à la main) — on ne perd rien.
 *
 * Relançable : écrase les deux fichiers de sortie (pas de fusion).
 */
import { readFileSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { writeJson } from './lib/json';
import type {
  GearBuild,
  GearPick,
  GearPresets,
  SetCombo,
  SetComboPiece,
} from './curated/gear-reco';
import { validateGearBuilds, validateGearPresets } from './curated/gear-reco';

const ROOT = resolve(__dirname, '..');
const LEGACY = resolve(ROOT, 'data/legacy/reco');
const GEN = resolve(ROOT, 'data/generated/equipment');

type LangDictJson = Record<string, { name?: Record<string, string>; classLimit?: string | null }>;

/** Nom EN normalisé pour la correspondance (casse, apostrophes, espaces). */
const norm = (s: string) => s.toLowerCase().replace(/[’‘]/g, "'").replace(/\s+/g, ' ').trim();

interface NameIndex {
  /** nom normalisé → id (premier id numérique croissant). */
  byName: Map<string, string>;
  /** `nom|classe` → id (équipements de boss déclinés par classe). */
  byNameClass: Map<string, string>;
}

/** Index nom EN normalisé → id, depuis un json d'équipement généré. */
function indexByName(file: string): NameIndex {
  const data = JSON.parse(readFileSync(resolve(GEN, file), 'utf8')) as LangDictJson;
  const byName = new Map<string, string>();
  const byNameClass = new Map<string, string>();
  const ids = Object.keys(data).sort((a, b) => Number(a) - Number(b));
  for (const id of ids) {
    const e = data[id];
    const en = e.name?.en;
    if (!en) continue;
    const key = norm(en);
    if (!byName.has(key)) byName.set(key, id);
    if (e.classLimit) {
      const ck = `${key}|${e.classLimit}`;
      if (!byNameClass.has(ck)) byNameClass.set(ck, id);
    }
  }
  return { byName, byNameClass };
}

const weapons = indexByName('weapon.json');
const amulets = indexByName('accessory.json');
const talismans = indexByName('talisman.json');
const sets = indexByName('sets.json');

const unresolved = new Map<string, string[]>(); // nom → contextes
function miss(kind: string, name: string, ctx: string): string {
  const key = `${kind}: ${name}`;
  unresolved.set(key, [...(unresolved.get(key) ?? []), ctx]);
  return `!${name}`;
}

function resolveId(idx: NameIndex, kind: string, name: string, ctx: string): string {
  // Gear de boss décliné par classe : « Gorgon's Wrath [Ranger] ».
  const m = /^(.*)\s*\[(\w+)\]$/.exec(name.trim());
  if (m) {
    const hit = idx.byNameClass.get(`${norm(m[1])}|${m[2].toLowerCase()}`);
    if (hit) return hit;
  }
  // Les sets legacy s'écrivent sans le suffixe « Set » du jeu.
  return idx.byName.get(norm(name)) ?? idx.byName.get(norm(`${name} Set`)) ?? miss(kind, name, ctx);
}

// --- Presets -----------------------------------------------------------------
interface LegacyPresets {
  talismans: Record<string, string[]>;
  sets: Record<string, { name: string; count: number }[]>;
  substats: Record<string, string>;
}
const legacyPresets = JSON.parse(
  readFileSync(resolve(LEGACY, '_presets.json'), 'utf8'),
) as LegacyPresets;

const presets: GearPresets = { talismans: {}, sets: {}, substats: {} };
for (const [slug, names] of Object.entries(legacyPresets.talismans)) {
  presets.talismans[slug] = names.map((n) =>
    resolveId(talismans, 'talisman', n, `preset $${slug}`),
  );
}
for (const [slug, combo] of Object.entries(legacyPresets.sets)) {
  presets.sets[slug] = combo.map((p): SetComboPiece => ({
    set: resolveId(sets, 'set', p.name, `preset $${slug}`),
    count: p.count,
  }));
}
presets.substats = { ...legacyPresets.substats };

// --- Recos par personnage ------------------------------------------------------
interface LegacyBuild {
  Weapon?: { name: string; mainStat?: string }[];
  Amulet?: { name: string; mainStat?: string }[];
  Talisman?: string[];
  Set?: string[];
  SubstatPrio?: string;
  Note?: string;
}

const reco: Record<string, GearBuild[]> = {};
for (const file of readdirSync(LEGACY).sort()) {
  if (!/^\d+\.json$/.test(file)) continue;
  const charId = file.replace('.json', '');
  const legacy = JSON.parse(readFileSync(resolve(LEGACY, file), 'utf8')) as Record<
    string,
    LegacyBuild
  >;
  const builds: GearBuild[] = [];
  for (const [name, b] of Object.entries(legacy)) {
    const ctx = `${charId}/${name}`;
    const pick =
      (idx: NameIndex, kind: string) =>
      (w: { name: string; mainStat?: string }): GearPick => ({
        id: resolveId(idx, kind, w.name, ctx),
        ...(w.mainStat ? { mainStat: w.mainStat } : {}),
      });
    const build: GearBuild = { name };
    if (b.Weapon?.length) build.weapons = b.Weapon.map(pick(weapons, 'weapon'));
    if (b.Amulet?.length) build.amulets = b.Amulet.map(pick(amulets, 'amulet'));
    if (b.Talisman?.length) {
      build.talismans = b.Talisman.map((tn) =>
        tn.startsWith('$') ? tn : resolveId(talismans, 'talisman', tn, ctx),
      );
    }
    if (b.Set?.length) {
      build.sets = b.Set.map((s): SetCombo => ({ preset: s }));
    }
    if (b.SubstatPrio) build.substats = b.SubstatPrio;
    if (b.Note?.trim()) build.note = { en: b.Note.trim() };
    builds.push(build);
  }
  const errors = validateGearBuilds(charId, builds);
  if (errors.length) {
    console.error(`✗ ${charId} invalide :\n  ${errors.join('\n  ')}`);
    process.exitCode = 1;
  }
  reco[charId] = builds;
}

// Presets de sets référencés mais absents de _presets.json ?
for (const builds of Object.values(reco)) {
  for (const b of builds) {
    for (const c of b.sets ?? []) {
      if (c.preset && !presets.sets[c.preset]) {
        unresolved.set(`set-preset: $${c.preset}`, [
          ...(unresolved.get(`set-preset: $${c.preset}`) ?? []),
          b.name,
        ]);
      }
    }
    if (b.substats?.startsWith('$') && !presets.substats[b.substats.slice(1)]) {
      unresolved.set(`substat-preset: ${b.substats}`, [b.name]);
    }
    for (const tn of b.talismans ?? []) {
      if (tn.startsWith('$') && !presets.talismans[tn.slice(1)]) {
        unresolved.set(`talisman-preset: ${tn}`, [b.name]);
      }
    }
  }
}

const presetErrors = validateGearPresets(presets);
if (presetErrors.length) {
  console.error(`✗ presets invalides :\n  ${presetErrors.join('\n  ')}`);
  process.exitCode = 1;
}

const sortNum = (o: Record<string, unknown>) =>
  Object.fromEntries(
    Object.entries(o).sort(([a], [b]) => a.localeCompare(b, undefined, { numeric: true })),
  );
async function write(): Promise<void> {
  await writeJson(resolve(ROOT, 'data/curated/gear-reco.json'), sortNum(reco));
  await writeJson(resolve(ROOT, 'data/curated/gear-presets.json'), {
    talismans: sortNum(presets.talismans),
    sets: sortNum(presets.sets),
    substats: sortNum(presets.substats),
  });

  console.log(
    `✓ ${Object.keys(reco).length} persos, ${Object.values(reco).reduce((n, b) => n + b.length, 0)} builds, presets: ${Object.keys(presets.talismans).length} talismans / ${Object.keys(presets.sets).length} sets / ${Object.keys(presets.substats).length} substats`,
  );
  if (unresolved.size) {
    console.log(`\n⚠ ${unresolved.size} référence(s) irrésolue(s) (conservées préfixées «!») :`);
    for (const [k, ctxs] of unresolved) console.log(`  ${k} — ${[...new Set(ctxs)].join(', ')}`);
  }
}

write().catch((e) => {
  console.error(`\n\x1b[31mErreur : ${e?.message ?? e}\x1b[0m`);
  process.exit(1);
});
