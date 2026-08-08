'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { CARD_WIDTH } from '@/components/character/CharacterCard';
import { onTabListKeyDown } from '@/lib/tablist';

/**
 * UN POSTE D'ÉQUIPE, ET SES REMPLAÇANTS.
 *
 * Un emplacement d'équipe n'est pas un personnage : c'est un RÔLE, et plusieurs
 * personnages peuvent le tenir. Sur les 56 emplacements des guides, 21 offrent
 * quatre options ou plus, et deux en offrent huit. Les empiler en colonne — ce
 * que faisait ma première version — donnait un mur de trente portraits où rien
 * ne disait qu'on n'en joue qu'UN à la fois. Le carrousel, lui, le dit : une
 * carte devant, les autres derrière.
 *
 * Cylindre 3D comme en V2, mais SANS keen-slider : la bibliothèque n'apportait
 * que la physique du glissé, qui tient ici en un `Pointer Events` — souris et
 * tactile par le même chemin. La V3 reste à quatre dépendances.
 *
 * Les cartes sont rendues en amont et passées en enfants : ce composant ne fait
 * que tourner le cylindre.
 */

/**
 * LA SCÈNE NE CONNAÎT PLUS LES COTES DE LA CARTE — ELLE LES MESURE.
 *
 * Elle en portait une copie : trois gabarits (66×128, 100×192, 120×231) sous un
 * commentaire qui affirmait qu'ils venaient « telles quelles de `CharacterCard` ».
 * C'était vrai le jour où ils ont été écrits. La carte a changé deux fois depuis,
 * la copie non : la scène chaussait encore du 66 de large quand la carte en faisait
 * 104, et les cartes débordaient de leur cylindre par le bas jusqu'à 105 px — droit
 * sur les flèches et les points de navigation. Deux tables qui basculent en plus à
 * des seuils différents (768/1024 ici, 640/1024/1440 là-bas) ne pouvaient que
 * rediverger.
 *
 * Désormais : la scène prend la LARGEUR de la carte par ses classes (`CARD_WIDTH`,
 * exportée), et sa HAUTEUR d'un vrai exemplaire de carte laissé dans le flux. Aucun
 * nombre à tenir à jour — et la hauteur suit toute seule les 34 px que le nom prend
 * sous la carte tant qu'il n'est pas passé dans le cadre.
 *
 * `perspective` est COURTE (comme en V2) : c'est elle qui écrase les cartes de
 * derrière et les tasse au lieu de les laisser s'étaler sur les côtés. Elle est
 * maintenant UNIQUE — c'est la valeur que les deux grandes scènes utilisaient déjà,
 * et sur la petite elle retrouve à 5 % près le rapport perspective/largeur de
 * l'ancien couple 120 px / 66 px.
 */
const PERSPECTIVE_PX = 150;

/**
 * Le survol des cartes est ÉTEINT dans le cylindre.
 *
 * `CharacterCard` fait un `hover:opacity-80`. Une opacité < 1 crée un nouveau
 * contexte d'empilement, ce qui aplatit le `preserve-3d` du parent : la carte
 * survolée se met à clignoter et à passer devant/derrière ses voisines. Ce n'est
 * pas réparable en réglant des z-index — c'est la 3D et l'opacité qui ne
 * cohabitent pas. On la neutralise ICI, localement, plutôt que d'amputer la
 * carte que le roster utilise (et où l'effet marche très bien).
 */
const NO_HOVER_FADE = '[&_a]:transition-none [&_a:hover]:opacity-100';

export function TeamSlotCarousel({
  children,
  labels,
  prevLabel,
  nextLabel,
}: {
  /** Une carte par option, rendue en amont. */
  children: ReactNode[];
  /** Nom de chaque option — étiquettes d'accessibilité et points de navigation. */
  labels: string[];
  prevLabel: string;
  nextLabel: string;
}) {
  /**
   * L'index est MONOTONE, pas modulo.
   *
   * Avec un index borné, passer de la dernière carte à la première ramenait
   * l'angle de −315° à 0° : le cylindre REMBOBINAIT sous les yeux du lecteur au
   * lieu de poursuivre sa rotation. En laissant l'index filer (…, 7, 8, 9…), la
   * roue tourne toujours dans le sens du geste. Le contenu, lui, se lit modulo.
   */
  const [index, setIndex] = useState(0);
  /** Degrés de rotation en cours de glissé (0 hors geste). */
  const [dragDeg, setDragDeg] = useState(0);
  const [dragging, setDragging] = useState(false);
  const dragX = useRef(0);
  /** Le geste a-t-il VRAIMENT bougé ? — sinon un glissé finirait par ouvrir la fiche du perso. */
  const moved = useRef(false);

  /**
   * Largeur RÉELLE de la scène, mesurée. C'est le dernier endroit où le cylindre a
   * besoin d'un nombre : le rayon et la conversion « pixels glissés → degrés » ne
   * s'expriment pas en CSS. Un `ResizeObserver` plutôt qu'un `useMediaQuery` —
   * l'ancienne paire de média-queries redécidait en JS ce que les classes de la
   * carte décident déjà en CSS, et se trompait dès que l'un des deux bougeait.
   */
  const sceneRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const el = sceneRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const count = children.length;

  // Une seule option : pas de cylindre — un cylindre à une face n'est qu'une
  // carte flanquée de flèches mortes. Même enveloppe que les autres, pour que la
  // ligne d'équipe reste droite.
  if (count <= 1) return <div className="flex flex-col items-center gap-2">{children}</div>;

  const step = 360 / count;
  /**
   * Rayon du cylindre — SERRÉ, et c'est le réglage à toucher si la roue déborde.
   *
   * À l'angle θ, une carte voisine se projette en `x = r·sin θ` : plus le rayon
   * est grand, plus elle part sur le CÔTÉ, jusqu'à empiéter sur le poste d'à
   * côté. En la rapprochant de l'axe, elle s'en va DERRIÈRE plutôt qu'à côté —
   * ce qui est le propre d'un carrousel. Une largeur de carte, donc, et non les
   * 1,4 de la V2. Le terme en `count` recule un peu la roue quand les options se
   * pressent, pour qu'à huit cartes elles ne se traversent pas.
   */
  const radius = Math.round(width * 1.4) + Math.max(0, count - 5) * 10;
  const active = ((index % count) + count) % count;

  /** Va vers l'option `i` par le PLUS COURT chemin — jamais un tour complet. */
  const goTo = (i: number) => {
    let d = i - active;
    if (d > count / 2) d -= count;
    else if (d < -count / 2) d += count;
    setIndex(index + d);
  };

  // GLISSÉ — souris et tactile par le même chemin (Pointer Events). Une largeur
  // de carte fait tourner d'une option ; le cylindre suit le doigt en continu et
  // ne s'aligne qu'au relâchement, sur l'option la plus proche.
  const onDown = (e: React.PointerEvent) => {
    dragX.current = e.clientX;
    moved.current = false;
    setDragging(true);
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const onMove = (e: React.PointerEvent) => {
    if (!dragging) return;
    const dx = e.clientX - dragX.current;
    if (Math.abs(dx) > 4) moved.current = true;
    setDragDeg((dx / (width || 1)) * step);
  };
  const onUp = (e: React.PointerEvent) => {
    if (!dragging) return;
    const dx = e.clientX - dragX.current;
    setDragging(false);
    setDragDeg(0);
    setIndex(index - Math.round(dx / (width || 1)));
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <div
        ref={sceneRef}
        style={{ perspective: `${PERSPECTIVE_PX}px` }}
        className={`relative touch-pan-y select-none ${CARD_WIDTH} ${dragging ? 'cursor-grabbing' : 'cursor-grab'}`}
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onUp}
        // LE GLISSÉ NATIF DU NAVIGATEUR TUE LE NÔTRE.
        // Une image et un lien sont déplaçables par défaut : au bout de quelques
        // pixels le navigateur démarre SON glissé, s'empare du pointeur, et nos
        // `pointermove` cessent d'arriver — le cylindre se fige et on se retrouve
        // à traîner une vignette fantôme. Un `preventDefault` sur `dragstart`
        // (qui remonte de l'image jusqu'ici) le tue dans l'œuf.
        onDragStart={(e) => e.preventDefault()}
        // Un glissé qui s'achève sur une carte NE DOIT PAS ouvrir sa fiche.
        // On intercepte le clic à la capture, avant qu'il n'atteigne le lien.
        onClickCapture={(e) => {
          if (!moved.current) return;
          e.preventDefault();
          e.stopPropagation();
        }}
      >
        {/*
          LE GABARIT — une VRAIE carte, laissée dans le flux, qui donne sa hauteur à
          la scène. Les cartes du cylindre sont en `absolute` : sans elle la scène
          serait plate et il faudrait lui écrire une hauteur à la main, c'est-à-dire
          recommencer la copie de cotes qu'on vient de retirer.

          Elle reste VISIBLE tant que la mesure n'a pas eu lieu, ce qui la rend
          aussi le rendu serveur : le HTML servi porte une carte lisible et cliquable
          (un cylindre 3D ne tourne de toute façon pas sans JS), et le cylindre la
          recouvre à l'hydratation. `invisible` la retire alors du tableau
          d'accessibilité et de l'ordre de tabulation — il ne reste pas deux fois la
          même fiche à parcourir.
        */}
        <div className={width ? 'invisible' : ''}>{children[0]}</div>

        <div
          className={`absolute inset-0 transform-3d ${dragging ? '' : 'transition-transform duration-300'} ${
            width ? '' : 'invisible'
          }`}
          style={{ transform: `translateZ(-${radius}px) rotateY(${-step * index + dragDeg}deg)` }}
        >
          {children.map((child, i) => {
            // Distance ANGULAIRE à la carte active, bouclage compris : à huit
            // options, la 7ᵉ est à UNE carte de la 0ᵉ, pas à sept.
            let d = i - active;
            if (d > count / 2) d -= count;
            else if (d < -count / 2) d += count;
            const hidden = Math.abs(d) > 2;

            return (
              <div
                key={i}
                aria-hidden={i !== active}
                className={`absolute inset-0 flex items-center justify-center ${NO_HOVER_FADE} ${
                  hidden ? 'invisible' : ''
                } ${i === active && !dragging ? '' : 'pointer-events-none'}`}
                style={{ transform: `rotateY(${step * i}deg) translateZ(${radius}px)` }}
              >
                {/* Le flou vit sur un div INTÉRIEUR, jamais sur le wrapper
                    transformé : un `filter` y créerait un contexte d'empilement
                    qui aplatit le `preserve-3d` — même piège que l'opacité du
                    hover (cf. NO_HOVER_FADE). */}
                <div
                  className={`transition-[filter] duration-300 ${i === active ? '' : 'blur-[3px] grayscale-75'}`}
                >
                  {child}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => setIndex(index - 1)}
          aria-label={prevLabel}
          className="border-line-subtle bg-surface-raised text-content hover:border-line hover:text-content-strong cursor-pointer rounded border px-1.5 py-0.5 text-xs leading-none"
        >
          ◀
        </button>
        {/* Les points disent COMBIEN d'options existent — ce que la colonne
            donnait gratuitement et que le cylindre cache. */}
        <div
          className="flex items-center gap-1"
          role="tablist"
          aria-label={labels.join(', ')}
          onKeyDown={(e) => onTabListKeyDown(e, labels.length, active, goTo)}
        >
          {labels.map((label, i) => (
            <button
              key={label}
              type="button"
              role="tab"
              aria-selected={i === active}
              aria-label={label}
              tabIndex={i === active ? 0 : -1}
              onClick={() => goTo(i)}
              className={`h-1.5 cursor-pointer rounded-full transition-all ${
                i === active ? 'bg-accent w-3' : 'bg-line hover:bg-line-strong w-1.5'
              }`}
            />
          ))}
        </div>
        <button
          type="button"
          onClick={() => setIndex(index + 1)}
          aria-label={nextLabel}
          className="border-line-subtle bg-surface-raised text-content hover:border-line hover:text-content-strong cursor-pointer rounded border px-1.5 py-0.5 text-xs leading-none"
        >
          ▶
        </button>
      </div>
    </div>
  );
}
