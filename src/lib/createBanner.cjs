/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require("fs/promises");
const path = require("path");

const DATA_DIR = path.resolve(process.cwd(), "src/data");
async function read(file) { return JSON.parse(await fs.readFile(file, "utf8")); }

// ========== RÈGLES ==========
const DEFAULT_MILEAGE_COST = 200;
const RULES = {
  all: {
    name: "All Characters",
    includeTypes: ["regular", "premium", "limited"],
    rates: { star3: 0.025, star2: 0.19, star1: 0.785 },
    weightsByTypeInStar3: { regular: 1, premium: 1, limited: 1 },
    focusShareOfStar3: 0,
    mileage: { enabled: true, cost: DEFAULT_MILEAGE_COST, scope: "global" },
    guarantee2StarInTen: true,
  },

  // PREMIUM (in-game Demiurge): 3★ = 3.75% = 1.25% focus + 2.5% reste
  premium_standard: {
    name: "Premium (Standard)",
    includeTypes: ["regular", "premium"],
    rates: { star3: 0.0375, star2: 0.19, star1: 0.7725 }, // <<< important
    weightsByTypeInStar3: { regular: 1, premium: 1, limited: 0 }, // ratio géré dans drawOne
    focusShareOfStar3: 0, // split géré dans drawOne
    mileage: { enabled: true, cost: DEFAULT_MILEAGE_COST, scope: "global" },
    guarantee2StarInTen: true,
  },

  // LIMITED rate-up : 1.25% limited focus + 1.25% regular
  limited_rateup: {
    name: "Limited Rate-Up",
    includeTypes: ["regular", "limited"],
    rates: { star3: 0.025, star2: 0.19, star1: 0.785 },
    weightsByTypeInStar3: { regular: 1, premium: 0, limited: 1 },
    focusShareOfStar3: 0, // split géré dans drawOne
    mileage: { enabled: true, cost: 150, scope: "perBanner" },
    guarantee2StarInTen: false,
  },

  // REGULAR rate-up : 50/50 focus vs non-focus dans les 3★
  regular_focus: {
    name: "Regular Focus",
    includeTypes: ["regular"],
    rates: { star3: 0.025, star2: 0.19, star1: 0.785 },
    weightsByTypeInStar3: { regular: 1, premium: 0, limited: 0 },
    focusShareOfStar3: 0.5,
    mileage: { enabled: true, cost: DEFAULT_MILEAGE_COST, scope: "global" },
    guarantee2StarInTen: true,
  },
};

// ========== UTILS ==========
function splitByRarity(list) {
  const s1 = [], s2 = [], s3 = [];
  for (const c of list) {
    const r = Number(c.rarity);
    if (r === 3) s3.push(c);
    else if (r === 2) s2.push(c);
    else if (r === 1) s1.push(c);
  }
  return { star1: s1, star2: s2, star3: s3 };
}

function pickWeighted(items, getWeight) {
  if (!items.length) return null;
  let total = 0;
  for (const it of items) total += Math.max(0, getWeight(it));
  if (total <= 0) return items[(Math.random() * items.length) | 0];
  let r = Math.random() * total;
  for (const it of items) {
    const w = Math.max(0, getWeight(it));
    if (r < w) return it;
    r -= w;
  }
  return items[items.length - 1];
}

function randomUniform(arr) {
  if (!arr.length) return null;
  return arr[(Math.random() * arr.length) | 0];
}

function rollStar(rates) {
  const r = Math.random();
  if (r < rates.star3) return 3;
  if (r < rates.star3 + rates.star2) return 2;
  return 1;
}

// Mileage store par défaut (mémoire)
function makeMemoryStore() {
  const m = new Map();
  return {
    get: (k) => m.get(k) || 0,
    set: (k, v) => { m.set(k, v); },
  };
}
function resolveMileageKey(kind, focus, overrideKey) {
  if (overrideKey) return overrideKey;
  if (RULES[kind]?.mileage?.scope === "perBanner") {
    // clé spécifique à la bannière limited (inclut le(s) focus pour isoler)
    const focusKey = (focus && focus.length) ? focus.join("+") : "nofocus";
    return `gacha:mileage:${kind}:${focusKey}`;
  }
  // global partagé entre bannières non-limited
  return `gacha:mileage:global`;
}

// ========== BUILDER ==========
async function createBanner({ kind, focus = [], mileageStore, mileageKeyOverride } = {}) {
  const rule = RULES[kind];
  if (!rule) {
    const supported = Object.keys(RULES).join(", ");
    throw new Error(`Unknown banner kind "${kind}". Supported: ${supported}`);
  }

  const [reg, prem, lim] = await Promise.all([
    read(path.join(DATA_DIR, "characters_regular.json")).catch(() => []),
    read(path.join(DATA_DIR, "characters_premium.json")).catch(() => []),
    read(path.join(DATA_DIR, "characters_limited.json")).catch(() => []),
  ]);

  const byType = { regular: reg, premium: prem, limited: lim };
  const all = rule.includeTypes.flatMap((t) => byType[t] || []);
  const pools = splitByRarity(all);

  // ---- helpers comptages 3★ (R,P,L) sur les pools CANONIQUES (pas filtrés par includeTypes)
  const R = reg.filter(x => Number(x.rarity) === 3).length;
  const P = prem.filter(x => Number(x.rarity) === 3).length;
  const L = lim.filter(x => Number(x.rarity) === 3).length;

  // Mileage
  const store = mileageStore || makeMemoryStore();
  const mileageCfg = rule.mileage || { enabled: false };
  const mileageKey = mileageCfg.enabled ? resolveMileageKey(kind, focus, mileageKeyOverride) : null;
  const mileageCost = mileageCfg.cost ?? DEFAULT_MILEAGE_COST;

  const banner = {
    id: `${kind}${focus.length ? "-" + focus.join("+") : ""}`,
    name: rule.name,
    kind,
    rates: rule.rates,
    focus: focus.slice(),
    weightsByTypeInStar3: rule.weightsByTypeInStar3,
    pools,

    // --- Comptages accessibles
    getPoolCounts() { return { R, P, L }; },

    // --- Individual rates (F/D_f/L_f = 1 focus)
    getIndividualRates() {
      const r3 = this.rates.star3, r2 = this.rates.star2, r1 = this.rates.star1;
      const F = 1; // on force 1 focus
      const out = { star3_total: r3, star2_total: r2, star1_total: r1 };

      if (this.kind === "all") {
        const T = Math.max(1, R + P + L);
        out.perUnit3 = r3 / T;
        return out;
      }

      if (this.kind === "regular_focus") {
        const nonF = Math.max(0, R - F);
        out.focus_regular = 0.0125;             // 1 unité focus
        out.off_regular  = nonF ? 0.0125 / nonF : 0;
        return out;
      }

      if (this.kind === "premium_standard") {
        // 3★ = 3.75% = 1.25% premium focus + 2.5% reste (ratio par unité 2:1 = Regular:Premium off)
        const D_nf = Math.max(0, P - F);
        const rest = 0.0375 - 0.0125; // 0.025
        const denom = (2 * R) + D_nf;
        out.focus_premium = 0.0125;             // 1 unité focus
        out.off_premium   = denom ? rest * (1 / denom) : 0; // par unité premium off
        out.regular_unit  = denom ? rest * (2 / denom) : 0; // par unité regular
        return out;
      }

      if (this.kind === "limited_rateup") {
        // 3★ = 1.25% limited focus + 1.25% regular
        out.focus_limited = 0.0125;             // 1 unité focus
        out.regular_unit  = R ? 0.0125 / R : 0; // par unité regular
        out.off_limited   = 0;
        return out;
      }

      return out;
    },

    // === Mileage helpers ===
    getMileage() { return mileageKey ? store.get(mileageKey) : 0; },
    addMileage(n = 1) { if (mileageKey) store.set(mileageKey, Math.max(0, this.getMileage() + n)); },
    canExchange() {
      if (!mileageKey || !mileageCfg.enabled) return false;
      if (!this.focus.length) return false;
      return this.getMileage() >= mileageCost;
    },
    exchangeForFocus(slug) {
      if (!this.canExchange()) throw new Error("Not enough mileage or no focus set.");
      const focusSet = new Set(this.focus);
      const chosenSlug = slug ?? this.focus[0];
      if (!focusSet.has(chosenSlug)) throw new Error(`Slug "${chosenSlug}" is not in focus list.`);
      const target = this.pools.star3.find(c => c.slug === chosenSlug);
      if (!target) throw new Error(`Focus unit "${chosenSlug}" not found in 3★ pool.`);
      store.set(mileageKey, Math.max(0, this.getMileage() - mileageCost));
      return { rarity: 3, pick: target, exchanged: true };
    },
  };

  // Tirage 1x
  banner.drawOne = function drawOne(opts = { grantMileage: true }) {
    const rarity = rollStar(this.rates);
    if (mileageCfg.enabled && opts.grantMileage !== false) this.addMileage(1);

    if (rarity === 1) return { rarity, pick: randomUniform(this.pools.star1) };
    if (rarity === 2) return { rarity, pick: randomUniform(this.pools.star2) };

    // 3★
    const focusSet = new Set(this.focus);
    const inFocus = this.pools.star3.filter((c) => focusSet.has(c.slug));

    if (this.kind === "limited_rateup") {
      const regular3 = this.pools.star3.filter((c) => c.type === "regular");
      const focusLimited3 = inFocus.filter((c) => c.type === "limited");

      // 50% des 3★ vers Limited Focus (si dispo), 50% vers Regular
      const goLimited = focusLimited3.length && Math.random() < 0.5;
      if (goLimited) return { rarity: 3, pick: randomUniform(focusLimited3) };
      if (regular3.length) return { rarity: 3, pick: randomUniform(regular3) };
      // fallback
      const pool = focusLimited3.length ? focusLimited3 : regular3;
      return { rarity: 3, pick: randomUniform(pool) };
    }

    if (this.kind === "premium_standard") {
      const premFocus = this.pools.star3.filter(c => c.type === "premium" && focusSet.has(c.slug));
      const premOff   = this.pools.star3.filter(c => c.type === "premium" && !focusSet.has(c.slug));
      const regAll    = this.pools.star3.filter(c => c.type === "regular");

      // Parmi les 3★, 1/3 pour Focus (1.25%/3.75%), 2/3 pour le reste
      if (premFocus.length && Math.random() < (0.0125 / 0.0375)) {
        return { rarity: 3, pick: randomUniform(premFocus) };
      }
      // Reste 2.5% : ratio par unité 2:1 Regular:Premium(off)
      const candidates = [
        ...regAll.map(c => ({ c, w: 2 })),
        ...premOff.map(c => ({ c, w: 1 })),
      ];
      let total = candidates.reduce((s, x) => s + x.w, 0);
      if (total <= 0) {
        // fallback uniforme premium si besoin
        const pool = [...regAll, ...premOff, ...premFocus];
        return { rarity: 3, pick: randomUniform(pool) };
      }
      let r = Math.random() * total;
      for (const x of candidates) { if (r < x.w) return { rarity: 3, pick: x.c }; r -= x.w; }
      return { rarity: 3, pick: candidates[candidates.length - 1].c };
    }

    if (this.kind === "regular_focus") {
      // déjà géré par focusShareOfStar3 = 0.5 (ci-dessous)
    }

    // Autres bannières (ALL & REGULAR_FOCUS hors cas focus réussi) :
    const share = Math.max(0, Math.min(1, RULES[this.kind].focusShareOfStar3 || 0));
    const offFocus = this.pools.star3.filter((c) => !focusSet.has(c.slug));
    if (inFocus.length && share > 0 && Math.random() < share) {
      return { rarity: 3, pick: randomUniform(inFocus) };
    }
    const wb = this.weightsByTypeInStar3 || { regular: 1, premium: 1, limited: 1 };
    const pick = pickWeighted(offFocus, (c) => wb[c.type] ?? 1) || randomUniform(offFocus);
    return { rarity, pick };
  };

  // Tirage 10x (inchangé)
  banner.drawTen = function drawTen(opts = { grantMileage: true }) {
    const pulls = [];
    for (let i = 0; i < 10; i++) pulls.push(this.drawOne(opts));
    if (RULES[this.kind].guarantee2StarInTen) {
      const has2or3 = pulls.some((p) => p && (p.rarity === 2 || p.rarity === 3));
      if (!has2or3) {
        const idx = pulls.findIndex((p) => p && p.rarity === 1);
        if (idx >= 0 && this.pools.star2.length) {
          pulls[idx] = { rarity: 2, pick: randomUniform(this.pools.star2) };
        } else if (idx >= 0 && !this.pools.star2.length && this.pools.star3.length) {
          pulls[idx] = { rarity: 3, pick: this.drawOne(opts).pick };
        }
      }
    }
    const stats = {
      total: pulls.length,
      star3: pulls.filter((x) => x && x.rarity === 3).length,
      star2: pulls.filter((x) => x && x.rarity === 2).length,
      star1: pulls.filter((x) => x && x.rarity === 1).length,
      mileageAfter: this.getMileage(),
    };
    return { pulls, stats };
  };

  return banner;
}

module.exports = { createBanner, RULES };
