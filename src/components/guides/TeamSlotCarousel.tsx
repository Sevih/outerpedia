'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { CARD_PX, CARD_WIDTH } from '@/components/character/CharacterCard';
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
 * Cylindre 3D inchangé, mais SANS keen-slider : la bibliothèque n'apportait
 * que la physique du glissé, qui tient ici en un `Pointer Events` — souris et
 * tactile par le même chemin. Le projet reste à quatre dépendances.
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
 * `perspective` est COURTE (inchangée) : c'est elle qui écrase les cartes de
 * derrière et les tasse au lieu de les laisser s'étaler sur les côtés. Elle est
 * maintenant UNIQUE — c'est la valeur que les deux grandes scènes utilisaient déjà,
 * et sur la petite elle retrouve à 5 % près le rapport perspective/largeur de
 * l'ancien couple 120 px / 66 px.
 */
const PERSPECTIVE_PX = 150;

/**
 * Rayon du cylindre — SERRÉ, et c'est le réglage à toucher si la roue déborde.
 *
 * À l'angle θ, une carte voisine se projette en `x = r·sin θ` : plus le rayon est
 * grand, plus elle part sur le CÔTÉ, jusqu'à empiéter sur le poste d'à côté. En la
 * rapprochant de l'axe, elle s'en va DERRIÈRE plutôt qu'à côté — ce qui est le
 * propre d'un carrousel. Une largeur de carte, donc, et non les 1,4 d'avant. Le
 * terme en `count` recule un peu la roue quand les options se pressent, pour qu'à
 * huit cartes elles ne se traversent pas.
 *
 * Sorti du composant parce que la RANGÉE en a besoin pour un autre poste que
 * celui-ci (cf. `rowOptions`).
 */
const cylinderRadius = (width: number, count: number) =>
  Math.round(width * 1.4) + Math.max(0, count - 5) * 10;

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

/**
 * DE COMBIEN UNE VOISINE SORT-ELLE DE LA SCÈNE ? — en pixels, d'un côté.
 *
 * La scène ne fait qu'UNE carte de large, mais les cartes de derrière sont
 * tournées : elles se projettent sur les côtés et débordent. Le transform les pose
 * à `rotateY(θ) translateZ(r)` dans un parent reculé de `r`, donc un point d'abscisse
 * locale `x₀` atterrit en
 *
 *   x₃ = x₀·cos θ + r·sin θ        z₃ = r·cos θ − x₀·sin θ − r
 *
 * et la perspective le ramène vers l'axe : `x_écran = x₃ · p / (p − z₃)`.
 *
 * ON CALCULE LES DEUX ARÊTES, PAS LE CENTRE. Une carte tournée n'est pas plate face
 * à l'œil : ses deux bords verticaux sont à des PROFONDEURS différentes, donc à des
 * échelles différentes — c'est tout le sens d'une perspective. Réduire la carte à
 * son centre avec une seule échelle (ce que faisait la première version de cette
 * fonction) se trompe dans les deux sens et pas qu'un peu : à quatre options et
 * 152 px, elle réservait 12 px là où il en faut 35 ; à huit options et 128 px, elle
 * en réservait 73 pour 49 réels. Le cas qui punit est le premier — sous-réserver
 * fait revenir le chevauchement qu'on prétendait corriger.
 *
 * Le résultat, lui, reste contre-intuitif, et c'est pourquoi ce calcul est ici
 * plutôt qu'un écart choisi à l'œil dans le conteneur : le débordement NE DÉPEND
 * PRESQUE PAS de la taille de la carte (35 à 43 px de quatre à six options, sur les
 * quatre paliers), parce que la perspective étant fixe, une carte plus grande tourne
 * sur un rayon plus grand mais recule d'autant. Il tient dans une bande de 35 à
 * 50 px dès quatre options, et ne s'effondre qu'à deux ou trois.
 *
 * L'écart du conteneur, lui, grandissait avec le VIEWPORT (48 → 64 → 96 px) : deux
 * quantités sur deux axes qui ne se croisent jamais. Il suffisait sur grand écran et
 * jamais en dessous de 1024 — les roues voisines s'y traversaient et on ne savait
 * plus quelle carte appartenait à quel poste, ce que le carrousel est précisément
 * censé dire.
 */
function sideOverflow(width: number, radius: number, count: number): number {
  const half = width / 2;
  let max = 0;
  // Seules les voisines à ±2 sont visibles (cf. `hidden` plus bas) ; celles à −d
  // sont le miroir de celles à +d, d'où la valeur absolue plutôt qu'une seconde
  // boucle.
  for (let d = 1; d <= 2; d++) {
    const th = (2 * Math.PI * d) / count;
    for (const edge of [-1, 1]) {
      const x = edge * half * Math.cos(th) + radius * Math.sin(th);
      const z = radius * Math.cos(th) - edge * half * Math.sin(th) - radius;
      max = Math.max(max, Math.abs((x * PERSPECTIVE_PX) / Math.max(1, PERSPECTIVE_PX - z)));
    }
  }
  return Math.max(0, Math.round(max - half));
}

/**
 * La réserve à poser, DÈS LE RENDU SERVEUR — donc sans attendre de mesure.
 *
 * Elle prend le pire des quatre paliers du barème au lieu de la largeur réellement
 * servie. C'est une approximation de 2 à 4 px : à un nombre d'options donné, le
 * débordement ne bouge presque pas d'un palier à l'autre (35/38/37/35 à quatre
 * options), la perspective étant fixe. Ces quelques pixels valent largement ce
 * qu'ils achètent — une valeur disponible au PREMIER rendu.
 *
 * Sinon la réserve n'apparaissait qu'après le `ResizeObserver`, et toute la rangée
 * se réalignait sous les yeux du lecteur (constat Sevih : « y'a comme un flash au
 * chargement »). Une mise en page qui bouge après coup est un défaut, pas un détail.
 */
const reserveFor = (count: number) =>
  Math.max(...CARD_PX.map((w) => sideOverflow(w, cylinderRadius(w, count), count)));

export function TeamSlotCarousel({
  children,
  labels,
  prevLabel,
  nextLabel,
  rowOptions,
  selfSpacing = true,
}: {
  /** Une carte par option, rendue en amont. */
  children: ReactNode[];
  /** Nom de chaque option — étiquettes d'accessibilité et points de navigation. */
  labels: string[];
  prevLabel: string;
  nextLabel: string;
  /**
   * Nombre d'options du poste LE PLUS FOURNI de la rangée — la réserve latérale se
   * calcule sur lui, pas sur ce poste-ci.
   *
   * Sans ça, chaque poste réservait sa propre emprise et la rangée se déréglait :
   * un poste à une option n'a pas de cylindre donc ne réserve rien, un poste à six
   * réserve 40 px, et les quatre cartes d'une équipe cessaient d'être régulièrement
   * espacées (constat Sevih sur une équipe 2/2/6/2 — le poste fourni écartait ses
   * voisins de lui seul). L'espacement est une propriété de la RANGÉE : il ne peut
   * pas se décider poste par poste.
   *
   * Omis = ce poste seul, ce qui ne convient qu'à un carrousel isolé.
   */
  rowOptions?: number;
  /**
   * Le carrousel RÉSERVE lui-même la place que ses voisines occupent hors scène
   * (cf. `sideOverflow`), de sorte que le conteneur n'ait plus qu'à poser une
   * respiration constante. À ne mettre à `false` que sur `/dev/carousel`, qui
   * montre l'avant/après côte à côte.
   */
  selfSpacing?: boolean;
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

  /**
   * La réserve latérale, IDENTIQUE POUR TOUTE LA RANGÉE — celle qu'exige le poste
   * le plus fourni, appliquée aussi à celui qui n'a qu'une option. C'est ce qui
   * garde les quatre cartes d'une équipe régulièrement espacées.
   *
   * Le PLANCHER est une équipe pleine, quatre options : une rangée qui n'en propose
   * que deux ne déborde géométriquement de rien, ses cartes se colleraient donc bord
   * à bord. La réserve d'une équipe de quatre (35 à 38 px selon le palier) est le
   * minimum qui les laisse respirer, et elle a l'avantage d'être la MÊME que celle
   * des rangées fournies : les équipes d'un guide restent alignées entre elles, pas
   * seulement à l'intérieur d'une rangée.
   */
  const MIN_SPREAD = 4;
  const spread = Math.max(MIN_SPREAD, rowOptions ?? 0, count);
  const padding = selfSpacing ? { paddingInline: `${reserveFor(spread)}px` } : undefined;

  // Une seule option : pas de cylindre — un cylindre à une face n'est qu'une
  // carte flanquée de flèches mortes. Même enveloppe que les autres, pour que la
  // ligne d'équipe reste droite. Le `ref` y est TOUT DE MÊME posé : sans mesure,
  // pas de réserve, et ce poste-là décalerait la rangée à lui seul. La mesure est
  // juste ici — sans cylindre il n'y a ni points ni flèches, donc rien de plus
  // large que la carte.
  if (count <= 1)
    return (
      <div ref={sceneRef} className="flex flex-col items-center gap-2" style={padding}>
        {children}
      </div>
    );

  const step = 360 / count;
  const radius = cylinderRadius(width, count);
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
    <div
      className="flex flex-col items-center gap-2"
      // L'emprise réelle du cylindre, DÉCLARÉE : le flex du conteneur la voit et
      // range les postes en conséquence. Une rangée à huit options occupe donc
      // visiblement plus de large qu'une rangée à deux — ce qui est vrai, et que la
      // mise en page taisait.
      style={padding}
    >
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

        {/*
          LE CYLINDRE N'EXISTE QU'UNE FOIS LA SCÈNE MESURÉE — il n'est pas seulement
          caché en attendant.

          La nuance décide de ce que voit le lecteur. Rendu d'emblée, il l'était avec
          un rayon de 0 : les cartes empilées au centre, à pleine taille. La mesure
          arrivait, le rayon passait à ~180, et le `transition-transform` faisait
          l'animation — la roue s'ouvrait en 300 ms à chaque chargement de page
          (constat Sevih : « comme un flash au chargement »). Le masquer n'y changeait
          rien : une transition court aussi sur un élément qu'on vient de rendre
          visible. En le MONTANT avec son rayon définitif, il n'y a pas de valeur
          précédente, donc pas de transition — celle-ci ne sert plus qu'aux rotations
          voulues, ce pour quoi elle est là.
        */}
        {width > 0 && (
          <div
            className={`absolute inset-0 transform-3d ${dragging ? '' : 'transition-transform duration-300'}`}
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
        )}
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
