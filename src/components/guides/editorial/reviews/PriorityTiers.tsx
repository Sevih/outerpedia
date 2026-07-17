/**
 * Rangées de PRIORITÉ (ordre de pull / déblocage / transcendance) : portraits
 * groupés par palier, l'étoile affichée est la CIBLE éditoriale (pas la rareté),
 * séparateurs `>`/`≥` optionnels entre entrées (ordre strict, guide Core
 * Fusion). Les noms éditoriaux résolvent au BUILD (nom inconnu = build cassé).
 */
import type { Lang } from '@/lib/i18n/config';
import { resolveGuideCharacter } from '@/lib/data/characters';
import { CharacterPortrait } from '@/components/character/CharacterPortrait';

export interface PriorityEntry {
  name: string;
  /** Étoile CIBLE affichée sous le portrait. */
  stars: number;
  /** Relation avec l'entrée SUIVANTE (`>` strictement avant, `≥`). */
  op?: '>' | '>=' | null;
}

export interface PriorityTier {
  title?: string;
  entries: PriorityEntry[];
}

const OP_LABEL: Record<string, string> = { '>': '>', '>=': '≥' };

export function PriorityTiers({
  tiers,
  lang,
  where,
}: {
  tiers: PriorityTier[];
  lang: Lang;
  where: string;
}) {
  return (
    <div className="space-y-5">
      {tiers
        .filter((t) => t.entries.length > 0)
        .map((tier, i) => (
          <div key={i} className="space-y-2">
            {tier.title && (
              <div className="text-content-strong text-center text-sm font-semibold">
                {tier.title}
              </div>
            )}
            <div className="flex flex-wrap items-center justify-center gap-3">
              {tier.entries.map((e, j) => {
                const g = resolveGuideCharacter(e.name, lang, where);
                return (
                  <span key={j} className="flex items-center gap-3">
                    {j > 0 && tier.entries[j - 1].op && (
                      <span className="text-content-subtle text-lg font-bold" aria-hidden>
                        {OP_LABEL[tier.entries[j - 1].op as string]}
                      </span>
                    )}
                    <CharacterPortrait
                      id={g.character.id}
                      name={g.name}
                      element={g.character.element}
                      classType={g.character.class}
                      rarity={e.stars}
                      size={64}
                      href={g.href}
                    />
                  </span>
                );
              })}
            </div>
          </div>
        ))}
    </div>
  );
}
