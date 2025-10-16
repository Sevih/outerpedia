// scripts/commit.mjs
import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import readline from "node:readline";

/* ==========================================================
 🧠  CLI FLAGS
 ========================================================== */
const args = new Set(process.argv.slice(2));
function argHas(flag) { return args.has(flag); }
function argValue(name, def = null) {
  const i = process.argv.indexOf(name);
  return i > -1 && process.argv[i + 1] ? process.argv[i + 1] : def;
}

// --- FLAGS PRINCIPAUX ---
const DRY_RUN       = argHas("--dry-run");
const SKIP_BUILD    = argHas("--skip-build") || argHas("--no-build");
const NO_PUSH       = argHas("--no-push");
const DO_TAG        = argHas("--tag");
const FORCE_TYPE    = argValue("--type");         // feature | fix | update | balance
const FORCE_TTL     = argValue("--title");        // titre changelog
const FORCE_MSG     = argValue("--msg");          // message commit
const LINES_FILE    = argValue("--from-file");    // fichier texte (liste des puces)
const NO_CHANGELOG  = argHas("--no-changelog");   // ignorer changelog

// --- AIDE / HELP ---
if (argHas("--help") || argHas("-h")) {
  console.log(`
\x1b[36m───────────────────────────────────────────────
🚀 OUTERPEDIA – Commit Automation Script
───────────────────────────────────────────────\x1b[0m

\x1b[1mUSAGE:\x1b[0m
  node scripts/commit.mjs [options]

\x1b[1mOPTIONS GÉNÉRALES:\x1b[0m
  \x1b[33m--dry-run\x1b[0m         → Simulation : rien n’est réellement modifié.
  \x1b[33m--skip-build\x1b[0m      → Ignore la phase "npm run build".
  \x1b[33m--no-push\x1b[0m         → Ne pousse pas sur Git (commit local uniquement).
  \x1b[33m--tag\x1b[0m             → Crée un tag "vX.Y.Z" après le commit.

\x1b[1mOPTIONS CHANGELOG:\x1b[0m
  \x1b[33m--type <type>\x1b[0m     → Type de mise à jour (feature | fix | update | balance).
  \x1b[33m--title "<titre>"\x1b[0m → Titre de l’entrée changelog.
  \x1b[33m--from-file <f>\x1b[0m   → Fichier contenant les lignes du changelog.
  \x1b[33m--no-changelog\x1b[0m    → Ignore changelog.ts et changelog.md.

\x1b[1mOPTIONS COMMIT:\x1b[0m
  \x1b[33m--msg "<message>"\x1b[0m → Message de commit direct (désactive le prompt).

\x1b[1mEXEMPLES:\x1b[0m
  node scripts/commit.mjs --dry-run
  node scripts/commit.mjs --skip-build
  node scripts/commit.mjs --type fix --title "Hotfix build" --msg "fix: build path"
  node scripts/commit.mjs --type feature --from-file .notes.txt --tag
  node scripts/commit.mjs --no-push --no-changelog --msg "chore: version bump"

\x1b[36m───────────────────────────────────────────────
Astuce:\x1b[0m combine plusieurs options pour automatiser un commit complet !
`);
  process.exit(0);
}

/* ==========================================================
 🧩  OUTILS GÉNÉRAUX
 ========================================================== */
function logStep(msg) { console.log(`\n${msg}`); }
function sh(cmd, { stdio = "inherit" } = {}) {
  if (DRY_RUN) { console.log(`[dry-run] ${cmd}`); return ""; }
  return execSync(cmd, { stdio, encoding: "utf-8" });
}
function safeReadFile(file) { return fs.existsSync(file) ? fs.readFileSync(file, "utf-8") : null; }
function writeFile(file, content) {
  if (DRY_RUN) { console.log(`[dry-run] write ${file} (${content.length} chars)`); return; }
  fs.writeFileSync(file, content, "utf-8");
}
function ensureFile(file, initContent = "") {
  if (!fs.existsSync(file)) fs.writeFileSync(file, initContent, "utf-8");
}
function ask(question) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise(res => rl.question(question, ans => (rl.close(), res(ans.trim()))));
}
async function choose(title, choices) {
  console.log(title);
  choices.forEach((c, i) => console.log(`  ${i + 1}) ${c}`));
  while (true) {
    const a = await ask("Choix: "); const n = Number(a);
    if (!Number.isNaN(n) && n >= 1 && n <= choices.length) return choices[n - 1];
    console.log("❌ Choix invalide.");
  }
}

/* ==========================================================
 🧮  VERSION MANAGEMENT
 ========================================================== */
function parseVersion(v) {
  const m = v.trim().match(/^(\d+)\.(\d+)\.(\d+)$/);
  if (!m) throw new Error(`Version invalide: "${v}"`);
  return { major: +m[1], minor: +m[2], patch: +m[3] };
}
function readCurrentVersion() {
  const content = safeReadFile(".env.version");
  if (!content) throw new Error("Fichier .env.version introuvable.");
  const line = content.split(/\r?\n/).find(l => l.startsWith("NEXT_PUBLIC_APP_VERSION="));
  if (!line) throw new Error("Clé NEXT_PUBLIC_APP_VERSION absente de .env.version.");
  const raw = line.split("=")[1].trim();
  const { major, minor, patch } = parseVersion(raw);
  return { major, minor, patch, raw };
}
function writeVersion(newVersion) {
  writeFile(".env.version", `NEXT_PUBLIC_APP_VERSION=${newVersion}\n`);
  process.env.NEXT_PUBLIC_APP_VERSION = newVersion;
  console.log(`📦 .env.version -> NEXT_PUBLIC_APP_VERSION=${newVersion}`);
}

/* ==========================================================
 🧾  CHANGELOG HANDLING
 ========================================================== */
const CHANGELOG_TS = path.join("src", "data", "changelog.ts");
const CHANGELOG_MD = "changelog.md";
function insertChangelogTsBlock(block) {
  ensureFile(CHANGELOG_TS, "export const oldChangelog = [];\n");
  const ts = safeReadFile(CHANGELOG_TS);
  if (!ts) throw new Error(`Fichier ${CHANGELOG_TS} introuvable.`);
  const anchorRe = /export const oldChangelog\s*=\s*\[/;
  const anchorIdx = ts.search(anchorRe);
  if (anchorIdx >= 0) {
    const lineEnd = ts.indexOf("\n", anchorIdx);
    const out = ts.slice(0, lineEnd + 1) + block + ts.slice(lineEnd + 1);
    writeFile(CHANGELOG_TS, out);
    return;
  }
  const closeIdx = ts.indexOf("]");
  if (closeIdx > -1) {
    const out = ts.slice(0, closeIdx) + "\n" + block + ts.slice(closeIdx);
    writeFile(CHANGELOG_TS, out);
    return;
  }
  const rebuilt = `export const oldChangelog = [\n${block}];\n`;
  writeFile(CHANGELOG_TS, rebuilt);
}

/* ==========================================================
 🚀  MAIN EXECUTION
 ========================================================== */
(async () => {
  try {
    const { major, minor, patch, raw } = readCurrentVersion();
    console.log(`📦 Version actuelle : ${raw}`);

    const bump = await choose("Quel type de version ?", ["🔧 fix (patch)", "✨ minor", "💥 major"]);
    let M = major, m = minor, p = patch;
    if (bump.startsWith("🔧")) p += 1;
    else if (bump.startsWith("✨")) { m += 1; p = 0; }
    else { M += 1; m = 0; p = 0; }

    const newVersion = `${M}.${m}.${p}`;
    const today = new Date().toISOString().slice(0, 10);
    console.log(`➡️ Nouvelle version : ${newVersion}`);
    writeVersion(newVersion);

    const types = ["feature", "fix", "update", "balance"];
    const changelogType = (FORCE_TYPE && types.includes(FORCE_TYPE))
      ? FORCE_TYPE
      : await choose("Quel type de mise à jour pour le changelog ?", types);

    const title = FORCE_TTL ?? await ask("Titre de l'entrée changelog : ");
    let skip = NO_CHANGELOG || !title;
    if (skip) console.log("ℹ️ Pas de titre ou --no-changelog — pas d’entrée changelog.");

    let lines = [];
    if (!skip) {
      if (LINES_FILE) {
        const raw = safeReadFile(LINES_FILE) ?? "";
        lines = raw.split(/\r?\n/).map(s => s.trim()).filter(Boolean);
      } else {
        console.log("Écris les points du changelog (ligne vide pour terminer) :");
        while (true) { const l = await ask("• "); if (!l) break; lines.push(l); }
      }
    }

    const emoji = changelogType === "fix" ? "🐛" : changelogType === "update" ? "🛠" : changelogType === "balance" ? "⚖️" : "🚀";
    const mdBlock = skip ? "" : [`## ${emoji} ${title} (${today})`, ...lines.map(l => `- ${l}`), ""].join("\n");
    const tsBlock = skip ? "" : [
      "  {",
      `    date: "${today}",`,
      `    title: "${title.replace(/"/g, '\\"')}",`,
      `    type: "${changelogType}",`,
      "    content: [",
      ...lines.map(l => `      "- ${l.replace(/"/g, '\\"')}",`),
      "    ],",
      "  },",
      ""
    ].join("\n");

    if (!skip) {
      logStep("✍️ Mise à jour changelog.ts …");
      insertChangelogTsBlock(tsBlock);
      logStep("✍️ Mise à jour changelog.md (prepend) …");
      ensureFile(CHANGELOG_MD, "");
      const prev = safeReadFile(CHANGELOG_MD) ?? "";
      writeFile(CHANGELOG_MD, `${mdBlock}\n${prev}`);
    }

    logStep("✏️  Mise à jour package.json via npm run set-version …");
    sh(`npm run set-version "${newVersion}" && npm run inject-sw-version`);

    if (SKIP_BUILD) console.log("[skip-build] Build ignoré.");
    else { logStep("🏗 Lancement du build …"); sh("npm run build"); }

    const branch = execSync("git rev-parse --abbrev-ref HEAD", { encoding: "utf-8" }).trim();
    if (branch !== "master") {
      console.log(`⚠️  Branche courante : ${branch} (pas master)`);
      const cont = FORCE_MSG ? "y" : await ask("Continuer quand même ? (y/N) : ");
      if (!/^y$/i.test(cont)) { console.log("Abandon."); process.exit(0); }
    }

    const envAnnounce = process.env.DISCORD_ANNOUNCE;
    let msg = FORCE_MSG ?? await ask("Message de commit : ");
    let announceDiscord;
    if (envAnnounce === "0") announceDiscord = false;
    else if (FORCE_MSG) announceDiscord = envAnnounce !== "0";
    else {
      const ann = await ask("Annoncer sur Discord ? (Y/n) : ");
      announceDiscord = ann.trim() === "" || /^y$/i.test(ann);
    }
    const finalMsg = announceDiscord ? msg : `${msg} [no-discord]`;

    const statusBefore = execSync("git status --porcelain", { encoding: "utf-8" }).trim();
    if (!statusBefore) {
      console.log("ℹ️ Aucun changement détecté. Rien à committer.");
      process.exit(0);
    }

    logStep("✅ Git add/commit …");
    sh("git add .");
    sh(`git commit -m "${finalMsg.replace(/"/g, '\\"')}"`);

    if (DO_TAG) {
      logStep(`🏷  Tag v${newVersion}`);
      sh(`git tag v${newVersion}`);
    }

    if (!NO_PUSH) {
      logStep(`📤 Push sur ${branch}${DO_TAG ? " + tags" : ""} …`);
      sh(`git push origin ${branch}`);
      if (DO_TAG) sh("git push --tags");
    } else {
      console.log("[no-push] Aucun push effectué.");
    }

    console.log(`\n🎉 Fin du script — version ${newVersion} générée.`);
  } catch (err) {
    console.error("\n❌ Erreur:", err?.message ?? err);
    process.exit(1);
  }
})();
