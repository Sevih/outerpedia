'use client';

/**
 * LE PORTRAIT AVEC SON EFFET — `Portrait`, plus le contenu de `FX_Holder`.
 *
 * `Portrait` reste ce qu'il est : un composant SERVEUR qui ne sait que poser la
 * chrome. Ce fichier-ci n'ajoute qu'un calque, celui que
 * `CUICharacterThumbnail.SetEffect` instancie pour 25 personnages sur 124
 * (`CharacterExtraTemplet.ThumbnailEffect`). Un perso sans effet rend EXACTEMENT
 * le portrait statique — pas de canvas, pas de contexte WebGL, pas de boucle.
 *
 * POURQUOI UN CANVAS ET PAS DU CSS. L'animation du jeu n'est pas une transition :
 * c'est un shader qui fait défiler quatre textures et multiplie leurs
 * échantillons par 70. Le GLSL compilé étant lisible dans les bundles, on le
 * rejoue (`portrait-fx-gl`) au lieu d'en approcher le rendu.
 *
 * CE QUE CE FICHIER DÉCIDE, ET QUE LE MOTEUR NE PEUT PAS DÉCIDER :
 *
 *   - `prefers-reduced-motion` fige l'effet au lieu de le supprimer. Il ne PORTE
 *     aucune information — c'est une parure de rareté, que les étoiles et les
 *     tags disent déjà — donc une image fixe suffit et rien ne se perd.
 *   - hors écran ou onglet caché, la boucle s'arrête.
 *   - le nombre de contextes WebGL VIVANTS est plafonné (cf. `LIVE_CAP`).
 */
import { useEffect, useMemo, useRef, useState } from 'react';
import { img } from '@/lib/images';
import { Portrait, type PortraitProps } from './Portrait';
import { fxNameOf, PORTRAIT_FX } from './portrait-fx';
import { mountPortraitFx, type PortraitFxHandle } from './portrait-fx-gl';
import { fxBleed } from './portrait-fx-sim';

/**
 * COMBIEN DE CONTEXTES WebGL ON GARDE VIVANTS, toutes cartes confondues.
 *
 * Ce n'est pas un réglage de confort : un navigateur ne tient qu'une quinzaine
 * de contextes à la fois et, au-delà, PERD les plus anciens en silence — la
 * carte du haut de page se vide pendant qu'on scrolle. Or quinze personnages
 * portent `_Demi` : une grille les demanderait tous d'un coup.
 *
 * On plafonne donc nous-mêmes, et on libère par ORDRE DE DERNIÈRE APPARITION à
 * l'écran plutôt qu'au hasard du navigateur. Une carte libérée n'est pas perdue :
 * son prochain passage à l'écran RESSUSCITE son contexte — un canvas ne rend
 * jamais qu'un seul contexte, même perdu, et c'est `mountPortraitFx` qui le
 * restaure (les textures, elles, restent dans le cache HTTP).
 */
const LIVE_CAP = 8;

interface LiveFx {
  onScreen: boolean;
  /** Rang de dernière apparition — le plus petit part en premier. */
  seq: number;
  release: () => void;
}
const live = new Set<LiveFx>();
let seqCounter = 0;

/**
 * Ramène le nombre de contextes vivants sous le plafond.
 *
 * On ne libère QUE des cartes hors écran, jamais une carte visible : une carte
 * libérée ne se ranime qu'au prochain franchissement de son observateur, donc en
 * sacrifier une qui est déjà à l'écran la laisserait éteinte tant qu'on ne
 * scrolle pas. Si tout est visible, on dépasse le plafond plutôt que d'éteindre
 * ce que le lecteur regarde — cas qui ne se produit qu'avec plus de {@link
 * LIVE_CAP} portraits animés simultanément à l'écran.
 */
function evict(): void {
  while (live.size > LIVE_CAP) {
    let victim: LiveFx | undefined;
    for (const e of live) {
      // Le plus anciennement vu parmi ceux qui ne sont pas à l'écran.
      if (!e.onScreen && (!victim || e.seq < victim.seq)) victim = e;
    }
    if (!victim) return;
    live.delete(victim);
    victim.release();
  }
}

export interface AnimatedPortraitProps extends Omit<PortraitProps, 'fx'> {
  /**
   * Force un effet au lieu de celui du personnage — la page de contrôle en a
   * besoin pour montrer un effet sur un sujet qui ne le porte pas. En dehors
   * d'elle, personne ne devrait passer ça : le jeu, lui, ne choisit pas.
   */
  effect?: string;
  /** Remonte les refus du moteur (WebGL absent, branche non transcrite…). */
  onFxError?: (message: string) => void;
  /** N'afficher que ces calques, par nom de nœud — page de contrôle uniquement. */
  fxEmitters?: readonly string[];
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
}: {
  effect: string;
  art: string;
  bleed: { x: number; y: number };
  onFxError?: (m: string) => void;
  only?: readonly string[];
}) {
  const ref = useRef<HTMLCanvasElement>(null);
  const [reduced, setReduced] = useState(false);
  // Le rapporteur d'erreur arrive souvent en fonction inline : le mettre dans les
  // dépendances du montage remonterait le contexte à chaque rendu du parent. On le
  // tient donc à jour à part — et jamais pendant le rendu, où toucher une ref est
  // interdit.
  const report = useRef(onFxError);
  useEffect(() => {
    report.current = onFxError;
  }, [onFxError]);

  useEffect(() => {
    const q = window.matchMedia('(prefers-reduced-motion: reduce)');
    const sync = () => setReduced(q.matches);
    sync();
    q.addEventListener('change', sync);
    return () => q.removeEventListener('change', sync);
  }, []);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;

    let fx: PortraitFxHandle | undefined;
    let entry: LiveFx | undefined;
    let visible = document.visibilityState === 'visible';
    let onScreen = false;

    const apply = () => fx?.setRunning(!reduced && visible && onScreen);
    const onVisibility = () => {
      visible = document.visibilityState === 'visible';
      apply();
    };
    document.addEventListener('visibilitychange', onVisibility);

    const drop = () => {
      fx?.destroy();
      fx = undefined;
      entry = undefined;
    };

    // LE CONTEXTE N'EST CRÉÉ QU'À L'ENTRÉE À L'ÉCRAN. Il reste ensuite en place
    // tant qu'il n'est pas évincé : le détruire à chaque sortie ferait payer un
    // rechargement complet à chaque va-et-vient de scroll.
    const io = new IntersectionObserver(
      ([e]) => {
        onScreen = e.isIntersecting;
        if (onScreen && !fx) {
          fx = mountPortraitFx(canvas, {
            effect,
            art,
            onError: (m) => report.current?.(m),
            only,
            autoplay: !reduced,
          });
          entry = { onScreen: true, seq: ++seqCounter, release: drop };
          live.add(entry);
        }
        if (entry) {
          entry.onScreen = onScreen;
          if (onScreen) entry.seq = ++seqCounter;
        }
        // APRÈS avoir mis à jour le statut : une carte qui vient de sortir de
        // l'écran doit pouvoir être la victime de ce tour-ci.
        evict();
        apply();
      },
      { rootMargin: '128px' },
    );
    io.observe(canvas);

    return () => {
      document.removeEventListener('visibilitychange', onVisibility);
      io.disconnect();
      if (entry) live.delete(entry);
      drop();
    };
  }, [effect, art, reduced, only]);

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
      // qu'obtiendrait un div. Or `mountPortraitFx` écrit les attributs depuis
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
      // Aucun `mix-blend-mode` : le canvas peint l'art LUI-MÊME et l'effet s'y
      // ajoute en lumière linéaire. Un mélange CSS l'aurait fait en sRGB, ce qui
      // n'est pas la même opération (cf. l'en-tête de `portrait-fx-gl`).
    />
  );
}

export function AnimatedPortrait({
  effect,
  onFxError,
  fxEmitters,
  ...props
}: AnimatedPortraitProps) {
  const name = effect ?? fxNameOf(props.id);
  // Un nom d'effet que la table connaît mais qu'on n'a pas extrait ne rend rien :
  // c'est un palier de portage, pas une absence d'effet. `portrait-fx-gl` le dirait
  // aussi, mais autant ne pas monter un contexte WebGL pour l'entendre.
  const known = name ? Boolean(PORTRAIT_FX.effects[name]) : false;
  const bleed = useMemo(() => (known && name ? fxBleed(name) : { x: 0, y: 0 }), [known, name]);
  // La liste de calques arrive en LITTÉRAL depuis la page de contrôle : neuve à
  // chaque rendu, elle remonterait le contexte en boucle. On la stabilise sur son
  // CONTENU, pas sur son identité.
  const onlyKey = fxEmitters?.join(',');
  const only = useMemo(() => (onlyKey ? onlyKey.split(',') : undefined), [onlyKey]);
  return (
    <Portrait
      {...props}
      fx={
        known && name ? (
          <PortraitFxCanvas
            effect={name}
            art={img.portrait(props.id)}
            bleed={bleed}
            onFxError={onFxError}
            only={only}
          />
        ) : undefined
      }
    />
  );
}
