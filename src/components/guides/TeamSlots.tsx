import type { ReactNode } from 'react';
import type { Lang } from '@/lib/i18n/config';
import { characterNamePrefix, resolveGuideCharacter } from '@/lib/data/characters';
import { characterTags, loadCuratedCharacters } from '@/lib/data/curated';
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
          // Nom inconnu = erreur de contenu → le build SSG CASSE (le résolveur jette).
          const resolved = options.map((name) => resolveGuideCharacter(name, lang, 'TeamSlots'));

          return (
            <TeamSlotCarousel
              key={i}
              labels={resolved.map((r) => r.name)}
              prevLabel={labels.prev}
              nextLabel={labels.next}
            >
              {resolved.map(({ character: c, name, href }) => (
                <ResponsiveCharacterCard
                  key={c.id}
                  id={c.id}
                  name={name}
                  prefix={characterNamePrefix(c, lang)}
                  element={c.element}
                  classType={c.class}
                  rarity={c.rarity}
                  tags={characterTags(c, curated)}
                  href={href}
                />
              ))}
            </TeamSlotCarousel>
          );
        })}
      </div>
      {note && <div className="panel-info px-4 py-3 text-sm">{note}</div>}
    </section>
  );
}
