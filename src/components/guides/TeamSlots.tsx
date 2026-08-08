import type { ReactNode } from 'react';
import type { Lang } from '@/lib/i18n/config';
import {
  characterBaseName,
  characterNamePrefix,
  resolveGuideCharacter,
} from '@/lib/data/characters';
import { characterTags, loadCuratedCharacters } from '@/lib/data/curated';
import { CharacterCard } from '@/components/character/CharacterCard';
import { TeamSlotCarousel } from './TeamSlotCarousel';

/**
 * ÉQUIPE SUGGÉRÉE — un carrousel par POSTE.
 *
 * Chaque emplacement liste des personnages INTERCHANGEABLES pour ce rôle, pas
 * une équipe à recruter en entier. Les empiler en colonne le taisait ; le
 * carrousel le dit (cf. `TeamSlotCarousel`).
 *
 * Des CARTES, pas des vignettes : c'est la même brique que le roster
 * (`CharacterCard`, aux cotes du jeu), donc le lecteur reconnaît d'un
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

  // La place que les cartes tournées prennent hors scène est une propriété de la
  // RANGÉE, pas du poste : le poste le plus fourni la fixe pour tous, sinon les
  // quatre cartes d'une équipe cessent d'être régulièrement espacées.
  const rowOptions = Math.max(...slots.map((options) => options.length));

  return (
    <section className="space-y-3">
      {(title || badge) && (
        <h2 className="text-content-strong flex items-center gap-2 text-xl font-bold">
          {badge}
          {title}
        </h2>
      )}
      {/* AUCUN écart horizontal, et c'est voulu. Chaque carte est le nez d'un
          cylindre dont les voisines débordent sur les côtés ; cet écart-là a
          longtemps essayé de couvrir ce débordement à l'aveugle (48 → 64 → 96 px
          selon le viewport), alors qu'il dépend du NOMBRE D'OPTIONS et pas de la
          taille de l'écran — un poste à trois options avait trop d'air, un poste à
          huit se traversait quand même. Le carrousel RÉSERVE désormais sa propre
          emprise (cf. `sideOverflow`) : deux emprises accolées ne se touchent déjà
          pas, en rajouter par-dessus ne ferait que délaver la rangée.
          L'écart VERTICAL reste, lui : l'emprise réservée est latérale, elle ne
          dit rien de deux rangées enroulées l'une sous l'autre. */}
      <div className="flex flex-wrap justify-center gap-x-0 gap-y-6">
        {slots.map((options, i) => {
          // Nom inconnu = erreur de contenu → le build SSG CASSE (le résolveur jette).
          const resolved = options.map((name) => resolveGuideCharacter(name, lang, 'TeamSlots'));

          return (
            <TeamSlotCarousel
              key={i}
              labels={resolved.map((r) => r.name)}
              prevLabel={labels.prev}
              nextLabel={labels.next}
              rowOptions={rowOptions}
            >
              {resolved.map(({ character: c, href }) => (
                <CharacterCard
                  key={c.id}
                  id={c.id}
                  name={characterBaseName(c, lang)}
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
