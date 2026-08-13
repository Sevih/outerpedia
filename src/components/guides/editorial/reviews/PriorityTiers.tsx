/**
 * Rangées de PRIORITÉ (ordre de pull / déblocage / transcendance) : portraits
 * groupés par palier, l'étoile affichée est la CIBLE éditoriale (pas la rareté),
 * séparateurs `>`/`≥` optionnels entre entrées (ordre strict, guide Core
 * Fusion). Les noms éditoriaux résolvent au BUILD (nom inconnu = build cassé).
 *
 * Les héros de COLLAB portent le BADGE `collab` : leur palier dit où ils se
 * situeraient, mais ils ne s'obtiennent que pendant leur événement (retour
 * Shiraen — le badge a remplacé l'atténuation, jugée trop discrète).
 */
import type { Lang } from '@/lib/i18n/config';
import { resolveGuideCharacter } from '@/lib/data/characters';
import { loadShortNames } from '@/lib/data/short-names';
import { CharacterPortrait } from '@/components/character/CharacterPortrait';

export interface PriorityEntry {
  name: string;
  /**
   * PALIER DE TRANSCENDANCE visé par l'éditorial (`TransStar` : 3, 4, 6, 9 pour
   * les crans PLEINS), pas la rareté du perso et SURTOUT pas un compte
   * d'étoiles. Les deux échelles coïncident jusqu'à 4 puis divergent — 5★ est le
   * palier 6, 6★ le palier 9 — et c'est la confusion qui a fait afficher « 5★ »
   * à une cible saisie « 6★ » dans les priorités de pull. Sans erreur ni signal,
   * puisqu'un palier 6 est parfaitement valide.
   *
   * Même unité que la tier list, migrée pour la même raison (cf.
   * `transcend-step.test.ts`) : deux données voisines dans deux unités,
   * c'est précisément ce qui produit ce bug.
   */
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
  // Noms courts curés : le portrait ne s'en sert que si le nom complet ne tient
  // pas sous la vignette (lecture fs — ce composant est rendu côté serveur).
  const shorts = loadShortNames();
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
                const isCollab = (g.character.tags ?? []).includes('collab');
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
                      rarity={g.character.rarity}
                      transcendence={e.stars}
                      size={64}
                      href={g.href}
                      badgeTag={isCollab ? 'collab' : undefined}
                      shortName={shorts[g.character.id]?.[lang] ?? shorts[g.character.id]?.en}
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
