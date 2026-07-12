/**
 * CLI de RATTRAPAGE du versionnage de boss — la voie NORMALE est le bouton
 * « Versionner » de l'admin (`/admin/extractor/monsters/<id>`), qui fige HEAD.
 *
 * Cette CLI ne sert que le cas que l'admin ne couvre pas : repêcher un état
 * DÉJÀ recouvert par plusieurs commits, via `--ref <commit>` (le trouver :
 * `git log -- data/generated/monsters.json`).
 *
 *   pnpm datagen:version-boss <id> [--ref <git-ref>|worktree] [--label "…"]
 */
import { versionMonster } from './extractor/version-monster';

const args = process.argv.slice(2);
const id = args.find((a) => !a.startsWith('--'));
const flag = (name: string): string | undefined =>
  args.includes(name) ? args[args.indexOf(name) + 1] : undefined;

if (!id) {
  console.error(
    'usage : pnpm datagen:version-boss <monsterId> [--ref <git-ref>|worktree] [--label "…"]',
  );
  process.exit(1);
}

async function main(monsterId: string): Promise<void> {
  const r = await versionMonster(monsterId, { ref: flag('--ref'), label: flag('--label') });
  console.log(
    `✔ ${r.key}${r.name ? ` (${r.name})` : ''} figé — ${r.skills} skill(s), source ${r.ref}` +
      (r.gameVersion ? `, jeu ${r.gameVersion}` : ''),
  );
  console.log(`  → ${r.file}`);
  console.log(`  Les guides épinglent cet état via \`${r.key}\` — committe le fichier.`);
}

main(id).catch((e) => {
  console.error(`✗ ${(e as Error).message}`);
  process.exit(1);
});
