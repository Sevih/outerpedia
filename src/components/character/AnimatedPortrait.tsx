'use client';

/**
 * LE PORTRAIT AVEC SON EFFET — `Portrait`, plus le contenu de `FX_Holder`.
 *
 * `Portrait` reste ce qu'il est : un composant SERVEUR qui ne sait que poser la
 * chrome. Ce fichier-ci n'ajoute qu'un calque, celui que
 * `CUICharacterThumbnail.SetEffect` instancie pour les personnages qui en
 * portent un (`CharacterExtraTemplet.ThumbnailEffect`). Un perso sans effet rend
 * EXACTEMENT le portrait statique — pas de canvas, pas de contexte WebGL, pas de
 * boucle. Un perso dont l'effet n'est pas SERVI aussi (`effectVerdict` : prefab
 * pas extrait, ou un calque que le moteur ne transcrit pas) : un effet se pose
 * entier ou pas du tout.
 *
 * POURQUOI UN CANVAS ET PAS DU CSS. L'animation du jeu n'est pas une transition :
 * c'est un shader qui fait défiler quatre textures et multiplie leurs
 * échantillons par 70. Le GLSL compilé étant lisible dans les bundles, on le
 * rejoue (`portrait-fx-gl`) au lieu d'en approcher le rendu.
 *
 * Le canvas d'une carte est en 2D : c'est `portrait-fx-gl` qui rend TOUTES les
 * cartes dans un seul contexte WebGL et recopie chaque image dans le canvas de
 * la sienne. Il n'y a donc plus de nombre de contextes à tenir, ni de carte à
 * évincer.
 *
 * CE QUE CE FICHIER DÉCIDE, ET QUE LE MOTEUR NE PEUT PAS DÉCIDER — qui est
 * dessiné :
 *
 *   - une carte ne se monte qu'à sa PREMIÈRE entrée à l'écran. Tant qu'aucune
 *     carte animée n'y est entrée, il n'existe ni contexte ni boucle ;
 *   - hors écran ou onglet caché, elle n'est plus dessinée (elle garde sa
 *     dernière image, et son temps s'arrête) ;
 *   - `prefers-reduced-motion` fige l'effet au lieu de le supprimer. Il ne PORTE
 *     aucune information — c'est une parure de rareté, que les étoiles et les
 *     tags disent déjà — donc une image fixe suffit et rien ne se perd.
 */
import { useEffect, useMemo, useRef } from 'react';
import { img } from '@/lib/images';
import { Portrait, type PortraitProps } from './Portrait';
import { fxNameOf } from './portrait-fx';
import { mountPortraitFx, type PortraitFxHandle } from './portrait-fx-gl';
import { lastByTarget } from './portrait-fx-pool';
import { effectVerdict, fxBleed } from './portrait-fx-sim';

/** Une carte animée telle que l'observateur partagé la voit. */
interface Card {
  /** Dernier état rendu par l'observateur. */
  onScreen: boolean;
  /**
   * Monte l'effet si la carte vient d'entrer à l'écran pour la première fois,
   * puis accorde son animation à l'état courant (écran, onglet, mouvement réduit).
   */
  apply: () => void;
}
/** Les cartes observées, par canvas. */
const cards = new Map<Element, Card>();

// L'état de la PAGE, le même pour toutes les cartes : un écouteur pour toutes,
// posé à la première carte et retiré avec la dernière.
let tabVisible = true;
let reducedMotion = false;
let unwatchPage: (() => void) | undefined;

function applyAll(): void {
  for (const card of cards.values()) card.apply();
}

function watchPage(): () => void {
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const onMotion = () => {
    reducedMotion = motion.matches;
    applyAll();
  };
  const onVisibility = () => {
    tabVisible = document.visibilityState === 'visible';
    applyAll();
  };
  onMotion();
  onVisibility();
  motion.addEventListener('change', onMotion);
  document.addEventListener('visibilitychange', onVisibility);
  return () => {
    motion.removeEventListener('change', onMotion);
    document.removeEventListener('visibilitychange', onVisibility);
  };
}

/**
 * UN SEUL OBSERVATEUR POUR TOUTES LES CARTES. Il ne décide plus que d'une
 * chose : qui est à l'écran, donc qui est dessiné. Le lot d'une image arrive
 * d'un coup, et c'est le DERNIER état de chaque carte qui compte
 * (`lastByTarget`) — deux franchissements peuvent s'y accumuler.
 */
function onIntersect(entries: IntersectionObserverEntry[]): void {
  for (const [target, onScreen] of lastByTarget(entries)) {
    // Absente : démontée entre la mise en file de l'entrée et ce callback.
    const card = cards.get(target);
    if (!card) continue;
    card.onScreen = onScreen;
    card.apply();
  }
}

let observer: IntersectionObserver | undefined;

function observe(canvas: Element, card: Card): void {
  unwatchPage ??= watchPage();
  observer ??= new IntersectionObserver(onIntersect, { rootMargin: '128px' });
  cards.set(canvas, card);
  observer.observe(canvas);
}

function unobserve(canvas: Element): void {
  observer?.unobserve(canvas);
  cards.delete(canvas);
  if (!cards.size) {
    unwatchPage?.();
    unwatchPage = undefined;
  }
}

export interface AnimatedPortraitProps extends Omit<PortraitProps, 'fx'> {
  /**
   * Force un effet au lieu de celui du personnage — la page de contrôle en a
   * besoin pour montrer un effet sur un sujet qui ne le porte pas. En dehors
   * d'elle, personne ne devrait passer ça : le jeu, lui, ne choisit pas.
   */
  effect?: string;
  /**
   * Id qui PORTE l'effet quand il diffère de l'id affiché — le cas du skin :
   * `id` est le modèle de costume (l'art), mais l'effet appartient au
   * PERSONNAGE, comme dans le jeu (un skin posé ne fait pas disparaître la
   * parure — vécu avec 2020059 sur 2000059, la table n'a pas de ligne par
   * modèle). Absent : l'effet se résout sur `id`.
   */
  fxId?: string;
  /** Remonte les refus du moteur (WebGL absent, branche non transcrite…). */
  onFxError?: (message: string) => void;
  /** N'afficher que ces calques, par nom de nœud — page de contrôle uniquement. */
  fxEmitters?: readonly string[];
  /**
   * Simule le plafond de taille des textures (plus grand côté, en texels) —
   * page de contrôle uniquement, cf. `texCap` de `mountPortraitFx`.
   */
  fxTexCap?: number;
}

/**
 * Un pourcentage qui SURVIT à l'aller-retour du navigateur. React 19 vérifie
 * l'hydratation en relisant le style depuis le CSSOM, et Blink re-sérialise les
 * nombres CSS à 6 chiffres significatifs : un float64 plein (`-5.043330504…%`)
 * revient `-5.04333%` et déclenche un FAUX mismatch d'hydratation (vécu sur les
 * débords de `_Dungeon`). Trois décimales, zéros de queue retirés : ce qui reste
 * fait l'aller-retour à l'identique — et 0,001 % du cadre est très en dessous du
 * pixel.
 */
function pct(v: number): string {
  return `${parseFloat((v * 100).toFixed(3))}%`;
}

function PortraitFxCanvas({
  effect,
  art,
  bleed,
  onFxError,
  only,
  texCap,
}: {
  effect: string;
  art: string;
  bleed: { x: number; y: number };
  onFxError?: (m: string) => void;
  only?: readonly string[];
  texCap?: number;
}) {
  const ref = useRef<HTMLCanvasElement>(null);
  // Le rapporteur d'erreur arrive souvent en fonction inline : le mettre dans les
  // dépendances du montage remonterait l'effet à chaque rendu du parent. On le
  // tient donc à jour à part — et jamais pendant le rendu, où toucher une ref est
  // interdit.
  const report = useRef(onFxError);
  useEffect(() => {
    report.current = onFxError;
  }, [onFxError]);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;

    let fx: PortraitFxHandle | undefined;

    const card: Card = {
      onScreen: false,
      apply: () => {
        // L'EFFET N'EST MONTÉ QU'À L'ENTRÉE À L'ÉCRAN — c'est là que le moteur
        // charge ses textures, et crée le contexte partagé s'il n'existe pas. Il
        // reste ensuite monté jusqu'au démontage de la carte : le défaire à
        // chaque sortie ferait payer un remontage à chaque va-et-vient de scroll.
        if (card.onScreen && !fx) {
          fx = mountPortraitFx(canvas, {
            effect,
            art,
            // Le moteur logge déjà chaque refus en console (une fois, cf. `say`
            // de `portrait-fx-gl`) : ce rapporteur ne sert qu'aux pages qui
            // veulent AFFICHER le refus.
            onError: (m) => report.current?.(m),
            only,
            texCap,
          });
        }
        fx?.setRunning(card.onScreen && tabVisible && !reducedMotion);
      },
    };
    observe(canvas, card);

    return () => {
      unobserve(canvas);
      fx?.destroy();
    };
  }, [effect, art, only, texCap]);

  return (
    <canvas
      ref={ref}
      aria-hidden
      // LE CANVAS DÉBORDE LE CADRE, du montant que la table dicte : le liseré `out`
      // va jusqu'à 5,5 unités hors d'un cadre large de 180 pour une épaisseur de
      // 13, et le jeu ne le masque pas (`FX_Holder` est FRÈRE du `Mask`). Le tenir
      // au ras du cadre en coupait plus du tiers.
      //
      // LA TAILLE EST EXPLICITE, ET C'EST VITAL : un canvas est un élément
      // REMPLACÉ, donc en `position:absolute` ses `width/height:auto` valent sa
      // taille INTRINSÈQUE (ses attributs) — pas l'étirement entre insets
      // qu'obtiendrait un div. Or le moteur écrit les attributs depuis
      // `clientWidth` : un canvas laissé en auto suit alors sa propre écriture et
      // enfle de ×dpr PAR FRAME, jusqu'à crever `MAX_TEXTURE_SIZE` (vécu — c'était
      // le « aucune cible linéaire acceptée en 23086×11566 »).
      className="pointer-events-none absolute"
      style={{
        left: pct(-bleed.x),
        top: pct(-bleed.y),
        width: pct(1 + 2 * bleed.x),
        height: pct(1 + 2 * bleed.y),
      }}
      // Aucun `mix-blend-mode` : le canvas reçoit l'art ET l'effet, que le moteur
      // a additionnés en lumière linéaire. Un mélange CSS l'aurait fait en sRGB,
      // ce qui n'est pas la même opération (cf. l'en-tête de `portrait-fx-gl`).
    />
  );
}

export function AnimatedPortrait({
  effect,
  fxId,
  onFxError,
  fxEmitters,
  fxTexCap,
  ...props
}: AnimatedPortraitProps) {
  const name = effect ?? fxNameOf(fxId ?? props.id);
  // Un effet qui n'est pas SERVI — pas extrait, ou en attente d'un calque que le
  // moteur ne transcrit pas — ne pose ni canvas ni contexte : la carte est le
  // portrait statique. `mountPortraitFx` en rendrait la moitié rendable ; c'est
  // ici qu'on décide de ne pas le lui demander (verdict mémoïsé par nom d'effet).
  const served = name ? effectVerdict(name).kind === 'served' : false;
  const bleed = useMemo(() => (served && name ? fxBleed(name) : { x: 0, y: 0 }), [served, name]);
  // La liste de calques arrive en LITTÉRAL depuis la page de contrôle : neuve à
  // chaque rendu, elle remonterait l'effet en boucle. On la stabilise sur son
  // CONTENU, pas sur son identité.
  const onlyKey = fxEmitters?.join(',');
  const only = useMemo(() => (onlyKey ? onlyKey.split(',') : undefined), [onlyKey]);
  return (
    <Portrait
      {...props}
      fx={
        served && name ? (
          <PortraitFxCanvas
            effect={name}
            art={img.portrait(props.id)}
            bleed={bleed}
            onFxError={onFxError}
            only={only}
            texCap={fxTexCap}
          />
        ) : undefined
      }
    />
  );
}
