import type { ReactNode } from 'react';
import type { Lang } from '@/lib/i18n/config';
import {
  characterDisplayName,
  characterNamePrefix,
  findCharacterByName,
  slugForId,
} from '@/lib/data/characters';
import { characterTags, loadCuratedCharacters } from '@/lib/data/curated';
import { localePath } from '@/lib/navigation';
import { ResponsiveCharacterCard } from '@/components/character/ResponsiveCharacterCard';
import { TeamSlotCarousel } from './TeamSlotCarousel';

/**
 * ÉQUIPE SUGGÉRÉE — un carrousel par POSTE.
 *
 * Chaque emplacement liste des personnages INTERCHANGEABLES pour ce rôle, pas
 * une équipe à recruter en entier. Les empiler en colonne le taisait ; le
 * carrousel le dit (cf. `TeamSlotCarousel`).
 *
 * Des CARTES, pas des vignettes : c'est la même brique que le roster
 * (`ResponsiveCharacterCard`, aux cotes du jeu), donc le lecteur reconnaît d'un
 * coup d'œil ce qu'il voit — élément, classe, rareté, badge de recrutement, nom.
 * Une face icon de 64 px ne porte que la moitié de ça.
 */
export function TeamSlots({
  title,
  badge,
  slots,
  note,
  lang,
  labels,
}: {
  /** Titre de section — omis quand un conteneur (onglets…) le porte déjà. */
  title?: string;
  /** Pastille optionnelle avant le titre (badge d'élément/effet d'une équipe). */
  badge?: ReactNode;
  /** Un tableau par poste : noms d'affichage EN des options. */
  slots: string[][];
  /** Note déjà localisée/parseText côté appelant. */
  note?: ReactNode;
  lang: Lang;
  labels: { prev: string; next: string };
}) {
  if (!slots.length) return null;

  // Une seule lecture des persos curés pour toute la section (badges de
  // recrutement) — comme le fait le roster.
  const curated = loadCuratedCharacters();

  return (
    <section className="space-y-3">
      {(title || badge) && (
        <h2 className="text-content-strong flex items-center gap-2 text-xl font-bold">
          {badge}
          {title}
        </h2>
      )}
      {/* Les postes RESPIRENT : chaque carte est le nez d'un cylindre dont les
          voisines débordent sur les côtés. Collées, deux roues voisines se
          marchent dessus et on ne sait plus quelle carte appartient à quel
          poste. */}
      <div className="flex flex-wrap justify-center gap-12 sm:gap-16 lg:gap-24">
        {slots.map((options, i) => {
          const resolved = options.map((name) => {
            const c = findCharacterByName(name);
            // Nom inconnu = erreur de contenu → le build SSG CASSE.
            if (!c) throw new Error(`TeamSlots : personnage inconnu « ${name} »`);
            return c;
          });

          return (
            <TeamSlotCarousel
              key={i}
              labels={resolved.map((c) => characterDisplayName(c, lang))}
              prevLabel={labels.prev}
              nextLabel={labels.next}
            >
              {resolved.map((c) => {
                const slug = slugForId(c.id);
                return (
                  <ResponsiveCharacterCard
                    key={c.id}
                    id={c.id}
                    name={characterDisplayName(c, lang)}
                    prefix={characterNamePrefix(c, lang)}
                    element={c.element}
                    classType={c.class}
                    rarity={c.rarity}
                    tags={characterTags(c, curated)}
                    href={slug ? localePath(lang, `/characters/${slug}`) : undefined}
                  />
                );
              })}
            </TeamSlotCarousel>
          );
        })}
      </div>
      {note && <div className="panel-info px-4 py-3 text-sm">{note}</div>}
    </section>
  );
}
