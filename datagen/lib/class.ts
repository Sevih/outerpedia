/**
 * Slug CANONIQUE d'une classe de combat.
 *
 * L'enum du jeu ne correspond PAS au nom affiché : `CCT_Attacker`/`Attacker` se
 * traduit en « Striker », `Priest` en « Healer ». On dérive donc le slug du NOM
 * TextSystem, jamais de l'enum brut — sinon `class` vaudrait « attacker » (qui
 * est en réalité une SOUS-classe de Striker → collision) ou « priest ».
 *
 * Utilisé par l'extracteur perso ET le générateur d'équipement pour que `class`,
 * `classLimit` et le glossaire partagent les mêmes clés.
 */
import type { LangDict } from './lang';
import { resolveText } from './text';

/** Slug brut d'enum (`attacker`) → slug canonique (`striker`) + libellé localisé. */
export function resolveClass(
  rawSlug: string,
  tsys: Map<string, LangDict>,
): { slug: string; name: LangDict } {
  const name = resolveText(tsys, `SYS_CLASS_${rawSlug.toUpperCase()}`);
  const slug = (name.en || rawSlug).toLowerCase();
  return { slug, name };
}
