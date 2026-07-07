/**
 * CLI de l'extracteur : `tsx datagen/extractor/run.ts <entité>`
 *
 * Exécute la spec d'une entité et imprime un RAPPORT :
 *   - nombre d'entités, écarts de schéma (validation runtime) ;
 *   - complétude vs `data/legacy` : champs zappés (`todo`/`unknown`),
 *     entités manquantes/nouvelles.
 *
 * But : « voir si on a zappé des trucs ou pas » avant de toucher au front.
 */
import { runSpec } from './core/runner';
import { getSpec, specIds } from './specs';

const STATUS_LABEL: Record<string, string> = {
  unknown: '❓ INCONNU (non déclaré)',
  todo: '🔴 À FAIRE (donnée de jeu non extraite)',
  extracted: '✅ extrait',
  curated: '✍️  curé (humain)',
  ignore: '⚪ ignoré',
};

function main(): void {
  const id = process.argv[2];
  if (!id) {
    console.error(`Usage: tsx datagen/extractor/run.ts <entité>\nEntités: ${specIds().join(', ')}`);
    process.exit(1);
  }
  const spec = getSpec(id);
  if (!spec) {
    console.error(`Spec inconnue: « ${id} ». Dispo: ${specIds().join(', ')}`);
    process.exit(1);
  }

  const r = runSpec(spec);
  const count = Object.keys(r.items).length;
  console.log(`\n━━━ extracteur: ${id} ━━━`);
  console.log(`entités extraites : ${count}`);

  // Validation runtime (contrats à dents).
  if (r.issues.length === 0) {
    console.log(`schéma            : ✅ conforme`);
  } else {
    console.log(`schéma            : ❌ ${r.issues.length} écart(s)`);
    for (const iss of r.issues.slice(0, 20)) console.log(`   ${iss.path} — ${iss.message}`);
    if (r.issues.length > 20) console.log(`   … +${r.issues.length - 20}`);
  }

  // Complétude vs oracle.
  if (r.completeness) {
    const c = r.completeness;
    console.log(`\n── complétude vs data/legacy (${c.oracleCount} entités oracle) ──`);

    const byStatus = new Map<string, Array<{ field: string; seen: number }>>();
    for (const f of c.fields) {
      const arr = byStatus.get(f.status) ?? [];
      arr.push({ field: f.field, seen: f.seen });
      byStatus.set(f.status, arr);
    }
    for (const status of ['unknown', 'todo', 'extracted', 'curated', 'ignore']) {
      const arr = byStatus.get(status);
      if (!arr || arr.length === 0) continue;
      console.log(`\n  ${STATUS_LABEL[status]}`);
      for (const { field, seen } of arr)
        console.log(`     ${field.padEnd(20)} (${seen}/${c.oracleCount})`);
    }

    if (c.missingEntities.length) {
      console.log(
        `\n  ⚠️  ${c.missingEntities.length} entité(s) oracle SANS sortie : ${c.missingEntities.slice(0, 15).join(', ')}${c.missingEntities.length > 15 ? '…' : ''}`,
      );
    }
    if (c.extraEntities.length) {
      console.log(
        `\n  ➕ ${c.extraEntities.length} entité(s) nouvelle(s) (absentes de l'oracle) : ${c.extraEntities.slice(0, 15).join(', ')}${c.extraEntities.length > 15 ? '…' : ''}`,
      );
    }
    if (!c.missingEntities.length && !c.extraEntities.length) {
      console.log(`\n  ✅ couverture entités : 1:1 avec l'oracle`);
    }
  } else {
    console.log(`\n(pas d'oracle déclaré pour cette entité)`);
  }
  console.log('');
}

main();
