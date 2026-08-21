/**
 * Primitive — SONDAGE de l'outillage python, partagé par les flux qui appellent
 * un script `.py` (`refresh` pour ses étapes de génération, `dump` pour les
 * listings ASM).
 *
 * Le principe, tiré de trois pannes : un module python manquant n'est pas une
 * erreur du script, c'est une machine non outillée. Il ne doit donc PAS faire
 * échouer le flux qui l'entoure — le JSON ou le listing committé prend le
 * relais. Un échec du script LUI-MÊME, en revanche, lève toujours : là c'est un
 * vrai problème (binaire périmé, méthode renommée, prefab illisible).
 */
import { spawnSync } from 'node:child_process';

/**
 * Outillage python d'une étape. Null si tout est là, sinon le motif du manque
 * (message destiné à l'utilisateur).
 *
 * Le module sondé est celui dont l'étape DÉPEND, pas un module témoin : sonder
 * UnityPy pour tout le monde laissait passer l'étape font-metrics (fontTools),
 * qui plantait alors en plein `pnpm dev` sur une machine outillée à moitié.
 */
export function pythonToolingMissing(mod: string): string | null {
  const probe = spawnSync('python', ['-c', `import ${mod}`], { stdio: 'ignore' });
  if (probe.error) return 'python introuvable';
  if (probe.status !== 0) return `module ${mod} absent`;
  return null;
}
