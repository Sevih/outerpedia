/* eslint-disable no-console */
const fs = require("fs/promises");
const path = require("path");

/**
 * @typedef {"regular" | "limited" | "premium"} PoolType
 * @typedef {"premium" | "limited" | "seasonal" | "collab" | null} BadgeType
 * @typedef {Object} Entry
 * @property {PoolType} type
 * @property {BadgeType} badge
 * @property {string} name
 * @property {string} id
 * @property {string} slug
 * @property {string} element
 * @property {string} class
 * @property {number|string} rarity
 */


// --- CHEMINS ---
const CHAR_DIR = path.resolve(process.cwd(), "src/data/char");
const OUT_DIR = path.resolve(process.cwd(), "src/data");

// === UTILS ===
async function readJsonSafe(file) {
  try {
    const raw = await fs.readFile(file, "utf8");
    return JSON.parse(raw);
  } catch {
    return null;
  }
}
function pick(obj, keys) {
  for (const k of keys) {
    if (obj && obj[k] !== undefined && obj[k] !== null) return obj[k];
  }
  return undefined;
}
function extractString(obj, keys, fallback = "") {
  const v = pick(obj, keys);
  if (typeof v === "string") return v;
  if (typeof v === "number") return String(v);
  return fallback;
}
function extractNumberOrString(obj, keys, fallback = "") {
  const v = pick(obj, keys);
  if (typeof v === "number" || typeof v === "string") return v;
  return fallback;
}

/** @returns {"regular"|"limited"|"premium"} */
function inferType(char) {
  // premium = tags inclut "premium"
  const tags = pick(char, ["tags", "Tags"]) || [];
  const low = (Array.isArray(tags) ? tags : [tags]).map((t) =>
    String(t).toLowerCase()
  );

  // limited = champ limited:true
  if (char.limited === true) return "limited";
  if (low.includes("premium")) return "premium";
  return "regular";
}

/** @returns {"premium"|"limited"|"seasonal"|"collab"|null} */
function inferBadge(char) {
  const tags = pick(char, ["tags", "Tags"]) || [];
  const low = (Array.isArray(tags) ? tags : [tags]).map((t) =>
    String(t).toLowerCase()
  );

  // priorité simple : limited > premium > seasonal > collab
  if (low.includes("seasonal")) return "seasonal";
  if (low.includes("collab")) return "collab";
  if (char.limited === true || low.includes("limited")) return "limited";
  if (low.includes("premium")) return "premium";

  return null;
}


async function main() {
  let files = [];
  try {
    const names = await fs.readdir(CHAR_DIR);
    files = names
      .filter((n) => n.toLowerCase().endsWith(".json"))
      .map((n) => path.join(CHAR_DIR, n));
  } catch (e) {
    console.error("❌ Dossier introuvable:", CHAR_DIR, e);
    process.exit(1);
  }

  /** @type {Entry[]} */ const regular = [];
  /** @type {Entry[]} */ const limited = [];
  /** @type {Entry[]} */ const premium = [];

  const EXCLUDED_NAMES = ["K", "Lisha", "Snow", "Eva"];

  for (const file of files) {
    const base = path.basename(file);
    const slug = base.replace(/\.json$/i, "");
    const json = await readJsonSafe(file);
    if (!json) {
      console.warn("⚠️ JSON illisible:", base);
      continue;
    }

    const char = json.character ?? json;
    const id = String(char.ID);
    const name = char.Fullname;   // fixed
    const element = char.Element;    // fixed
    const clazz = char.Class;      // fixed
    const rarity = char.Rarity;     // fixed (number)
    const type = inferType(char);
    const badge = inferBadge(char);
    // 👉 Skip si le perso est exclu
    if (EXCLUDED_NAMES.includes(name)) {
      console.log(`⏩ Skip exclu: ${name}`);
      continue;
    }



    const entry = { type, badge, id, name, slug, element, class: clazz, rarity };

    if (type === "limited") limited.push(entry);
    else if (type === "premium") premium.push(entry);
    else regular.push(entry);
  }

  await fs.mkdir(OUT_DIR, { recursive: true });

  const byName = (a, b) => a.name.localeCompare(b.name, "en");

  await fs.writeFile(
    path.join(OUT_DIR, "characters_regular.json"),
    JSON.stringify(regular.sort(byName), null, 2),
    "utf8"
  );
  await fs.writeFile(
    path.join(OUT_DIR, "characters_premium.json"),
    JSON.stringify(premium.sort(byName), null, 2),
    "utf8"
  );
  await fs.writeFile(
    path.join(OUT_DIR, "characters_limited.json"),
    JSON.stringify(limited.sort(byName), null, 2),
    "utf8"
  );

  console.log(`✅ Généré:
- ${path.join(OUT_DIR, "characters_regular.json")} (${regular.length})
- ${path.join(OUT_DIR, "characters_premium.json")} (${premium.length})
- ${path.join(OUT_DIR, "characters_limited.json")} (${limited.length})`);
}

main().catch((e) => {
  console.error("❌ Erreur:", e);
  process.exit(1);
});
