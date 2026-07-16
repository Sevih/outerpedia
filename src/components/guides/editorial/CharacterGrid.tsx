/**
 * Grille de portraits de personnages liés à leur fiche — le bloc « persos »
 * des tables éditoriales (héros gratuits, picks de bannière…).
 *
 * Reçoit des NOMS D'AFFICHAGE EN (la clé du contenu éditorial, comme
 * RecommendedCharacters) : un nom inconnu casse le build via
 * `resolveGuideCharacter`. Peut aussi recevoir des vues déjà résolues
 * (dérivations data — cf. free-heroes-start-banner).
 */
import type { Lang } from '@/lib/i18n/config';
import { resolveGuideCharacter, type GuideCharacter } from '@/lib/data/characters';
import { CharacterPortrait } from '@/components/character/CharacterPortrait';

export function CharacterGrid({
  names,
  characters,
  lang,
  where,
  cols = 3,
  size = 56,
}: {
  /** Noms d'affichage EN, résolus (et validés) par le data layer. */
  names?: string[];
  /** Persos déjà résolus — alternative à `names` pour les listes dérivées. */
  characters?: GuideCharacter[];
  lang: Lang;
  /** Contexte pour le message d'erreur de résolution (nom du guide). */
  where: string;
  cols?: 2 | 3 | 4;
  size?: number;
}) {
  const resolved =
    characters ?? (names ?? []).map((name) => resolveGuideCharacter(name, lang, where));
  // Tailwind ne voit que des littéraux — pas de `grid-cols-${cols}`.
  const colsClass = { 2: 'sm:grid-cols-2', 3: 'sm:grid-cols-3', 4: 'sm:grid-cols-4' }[cols];
  return (
    <div className={`grid w-fit grid-cols-2 gap-1.5 ${colsClass}`}>
      {resolved.map(({ character: c, name, href }) => (
        <CharacterPortrait
          key={c.id}
          id={c.id}
          name={name}
          element={c.element}
          classType={c.class}
          rarity={c.rarity}
          size={size}
          href={href}
        />
      ))}
    </div>
  );
}
