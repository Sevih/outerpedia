/**
 * COLLECTE globale des assets : `pnpm assets:collect`.
 *
 * Manifest (besoins dérivés de la donnée) → images extraites du JEU
 * (`.gamedata/extracted/images`) → conversion webp → `.assets-staging/`.
 * Écrit `manifest-report.json` (affiché par l'admin) : requis / présents /
 * manquants par domaine. `pnpm assets:push` pousse ensuite vers R2.
 */
import { copyFileSync, existsSync, mkdirSync, statSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import sharp from 'sharp';
import { isMain } from '../lib/is-main';
import { RUNTIME_DATA_FILES } from '../../src/lib/admin/runtime-publish';
import { buildAssetManifest } from './manifest';
import { buildImageIndex, GAME_IMAGES_DIR } from './source';
import { stageAssets, STAGING_DIR } from './stage';

async function main(): Promise<void> {
  if (!existsSync(GAME_IMAGES_DIR)) {
    console.error(
      `Images du jeu introuvables (${GAME_IMAGES_DIR}) — lance : pnpm datagen:extract images`,
    );
    process.exit(1);
  }

  const index = buildImageIndex();
  console.log(`index jeu : ${index.size} sprites`);

  const manifest = buildAssetManifest();
  const byDomain = new Map<string, typeof manifest>();
  for (const r of manifest) {
    const list = byDomain.get(r.domain);
    if (list) list.push(r);
    else byDomain.set(r.domain, [r]);
  }

  const report: Record<string, unknown> = {};
  const allMissing: Array<{ key: string; reason: string }> = [];
  for (const [domain, requests] of byDomain) {
    const res = await stageAssets(requests, index);
    report[domain] = { required: requests.length, ...res, missing: res.missing.length };
    allMissing.push(...res.missing);
    const flag = res.missing.length ? ` ⚠ ${res.missing.length} manquant(s)` : ' ✓';
    // Les REFAITS sont l'information neuve : ce sont les assets corrigés en
    // place, ceux que l'ancien staging (« la cible existe → on passe ») ratait.
    const redone = res.restaged ? ` · ${res.restaged} refaits` : '';
    console.log(
      `  ${domain.padEnd(12)} ${String(requests.length).padStart(5)} requis · ${res.present} déjà là · ${res.staged} produits${redone}${flag}`,
    );
  }

  // DÉRIVÉ : variante PORTRAIT du fond de page (l'artwork est paysage —
  // pivoté 90° pour couvrir les écrans verticaux sans zoom excessif).
  // Refait aussi quand le fond paysage a changé : sa seule EXISTENCE ne prouve
  // pas qu'il dérive du fond actuel.
  const bg = resolve(STAGING_DIR, 'images/background_compressed.webp');
  const bgPortrait = resolve(STAGING_DIR, 'images/background_compressed_portrait.webp');
  if (
    existsSync(bg) &&
    (!existsSync(bgPortrait) || statSync(bgPortrait).mtimeMs < statSync(bg).mtimeMs)
  ) {
    await sharp(bg).rotate(90).webp({ quality: 90 }).toFile(bgPortrait);
    console.log('  fond portrait généré (rotation 90°)');
  }

  // JSON RUNTIME (coupons, bannières) : copie de `data/curated/` vers le staging
  // (`data/<name>`) — ainsi `pnpm commit` (→ pnpm images → assets:push, qui
  // diffe et purge) resynchronise R2 même quand une édition a contourné le Save
  // admin, qui publie déjà en direct (cf. src/lib/admin/runtime-publish).
  {
    mkdirSync(resolve(STAGING_DIR, 'data'), { recursive: true });
    let staged = 0;
    for (const name of RUNTIME_DATA_FILES) {
      const src = resolve('data/curated', name);
      if (!existsSync(src)) continue;
      copyFileSync(src, resolve(STAGING_DIR, 'data', name));
      staged++;
    }
    console.log(`  data runtime ${String(staged).padStart(5)} JSON copiés (coupons/bannières)`);
  }

  mkdirSync(STAGING_DIR, { recursive: true });
  writeFileSync(
    resolve(STAGING_DIR, 'manifest-report.json'),
    JSON.stringify(
      {
        generatedAt: new Date().toISOString(),
        source: GAME_IMAGES_DIR,
        total: manifest.length,
        missingCount: allMissing.length,
        byDomain: report,
        missing: allMissing,
      },
      null,
      2,
    ) + '\n',
  );

  if (allMissing.length) {
    console.log(`\nManquants (${allMissing.length}) :`);
    for (const m of allMissing.slice(0, 20)) console.log(`  ${m.key} — ${m.reason}`);
    if (allMissing.length > 20) console.log(`  … +${allMissing.length - 20}`);
  }
}

// Exécution directe seulement (`pnpm assets:collect`) — et un échec (sharp,
// FS…) doit sortir en code 1, pas en unhandledRejection.
if (isMain(import.meta.url)) {
  main().catch((e) => {
    console.error(`\n✗ assets:collect a échoué : ${e instanceof Error ? e.message : e}`);
    process.exit(1);
  });
}
