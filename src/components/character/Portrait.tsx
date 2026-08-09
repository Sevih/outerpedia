/**
 * LE PORTRAIT DU JEU, à l'identique — le grand format vertical.
 *
 * LE NŒUD TRANSCRIT est `CharacterThumbnailList`, dans
 * `CUICharacterMainPageScrollCell` : la carte de la page « personnages », de
 * l'archive et de l'écran de transcendance — celle que le site imite avec ses
 * grilles. Il n'a pas de bundle à lui, chaque écran en déplie une copie. Lu aux
 * bundles avec UnityPy, comme `datagen/assets/extract-face-layout.py` le fait pour
 * les face icons.
 *
 * IL EN EXISTE UN SECOND, et l'avoir lu a servi : `CUICharacterLongThumbnail`
 * (pvploading, synchro, infiltrate, recruit — onze copies concordantes) porte le
 * MÊME MonoBehaviour, `CUICharacterThumbnail`, celui-là même que les deux vignettes
 * carrées de `ui/Thumbnail`. Il a d'abord été transcrit seul, ce qui donnait un nom
 * écrasé à la taille du titre : sa boîte de nom fait 100 quand celle-ci en fait 150,
 * et `m_BestFit` en tire deux corps très différents. Les deux se sont ensuite
 * révélés IDENTIQUES partout ailleurs — rail d'étoiles au pixel près, élément,
 * classe, voile, ancrage du niveau — ce qui a confirmé la lecture des deux côtés.
 * Cette page-ci est celle que le site veut ; l'autre n'est plus rendue, mais quatre
 * de ses valeurs sont notées où elles diffèrent, pour qu'on sache que la différence
 * a été vue et écartée, pas manquée.
 *
 * CE QUE LE PORTRAIT N'EST PAS. Il ne se compose pas : `img.portrait(id)` EST déjà
 * l'image finale. Le fond dégradé, le damier, la bordure biseautée ET le filigrane
 * de race sont cuits dans le PNG — vérifié en comparant les sprites `CT_Symbol_*`
 * (Human, Elf, Demon, Alien) au fond des `CT_<id>` : le motif y est déjà. C'est
 * pourquoi les nœuds `Symbol` et `Slot_Normal` du prefab sont inactifs (un `Demon`
 * traîne allumé, résidu d'éditeur). Ce fichier ne pose QUE la chrome.
 *
 * Six choses que la donnée tranche, et qu'on ne devinerait pas :
 *
 *   1. LE MASQUE NE MASQUE RIEN. `Mask` pose `CT_Mask_Thumbnail` en 9-slice
 *      (border 28 de tous côtés) avec `showMaskGraphic = 0` : de quoi croire à des
 *      coins arrondis. Son alpha est à 255 SUR TOUTE LA SURFACE, coins compris —
 *      vérifié pixel par pixel. Pas de `border-radius` ici : ce serait une invention.
 *
 *   2. L'ART EST PLEIN CADRE, malgré les apparences. Le `m_FaceIconRect` ne fait
 *      que 140×330 — mais ce rect ne contraint RIEN : le prefab `FI_` qu'on y
 *      instancie porte sa propre taille (`MainThumbnail`, 180×344, ancré au
 *      centre), donc il déborde ce parent et c'est le `Mask` de 180×344 au-dessus
 *      qui le cadre. Réduire l'art à 140×330 serait l'erreur que ce rect invite à
 *      faire. (Le nœud `long` écrit d'ailleurs 180×344 à cet endroit, ce qui a levé
 *      le doute.)
 *
 *   3. LE VOILE N'EST PAS UN DÉCOR. `Dim` est `m_DimImage`, allumé par
 *      `SetDim(bool)` — et c'est un APLAT NOIR opaque, pas un vignetage. Le prefab
 *      le laisse `active`, mais c'est l'état d'éditeur : le rendre par défaut
 *      noircirait tout le portrait à 70 %. D'où la prop `dim`, éteinte par défaut.
 *      (La vignette carrée a l'écueil inverse : son `Dim` de racine, lui, est bien
 *      un décor fixe.)
 *
 *   4. LES ÉTOILES SE REMPLISSENT PAR LE HAUT. Ce point ne se lit dans aucun
 *      prefab, seulement dans le code : `CUtilUI.SetStarImage` éteint d'abord tout
 *      le tableau (`Foreach(img => SetActive(false))`), puis allume
 *      `m_StarImage[0 .. ShowUIStar-1]` par indexation DIRECTE, et colore
 *      `m_StarImage[ShowUIStar-1]`. Or l'index 0 est l'emplacement du HAUT — le
 *      prefab numérote ses nœuds `Star1`→`Star6` (l'autre nœud, `Star5`→`Star0`),
 *      mais les positions comme l'ordre du tableau partent du haut dans les deux.
 *      Les étoiles gagnées occupent donc le haut du rail, et celle qui porte la
 *      teinte du « + » est la plus BASSE des allumées.
 *
 *   5. LE NIVEAU EST DEUX TEXTES, PAS UN, et sa boîte n'est pas contrainte.
 *      `Level` est un `HorizontalLayoutGroup` doublé d'un `ContentSizeFitter` en
 *      `m_HorizontalFit = 2` (PreferredSize) : « Lv. » et le nombre y sont posés
 *      côte à côte à deux corps différents (15 et 25), et la boîte s'ajuste au
 *      contenu au lieu de le rogner. Seuls son `left` et son `top` s'appliquent.
 *      Les deux textes sont ITALIQUES (`m_FontStyle = 2` — dans Unity 1 = gras),
 *      les seuls du portrait à ne pas être droits.
 *
 *   6. LE TITRE N'A PAS LA MÊME POLICE QUE LE NOM. `Text_Demi` pointe un `m_Font`
 *      différent de `Text_Name`, et les deux sont résolus : le titre prend l'asset
 *      `NotoSans_Regular`, le nom et le niveau l'asset `NotoSans_Bold`. L'étiquette
 *      Unity ment sur les deux — voir le bloc `m_BestFit`, qui dit ce qu'elles sont
 *      vraiment et porte leurs chasses.
 *
 * Composant SERVEUR (aucun état, aucun hook) : utilisable depuis les guides comme
 * depuis un composant client.
 *
 * LA GÉOMÉTRIE N'EST PLUS ICI : elle vit dans `portrait-layout`, que ce fichier et
 * le peintre canvas (`portrait-canvas`, pour l'export PNG du tier-list-maker)
 * lisent tous deux. Une transcription, deux rendus.
 */
import { img } from '@/lib/images';
import { transcendenceRow, type StarTone } from '@/components/ui/Thumbnail';
import {
  BADGE_BOX,
  bestFit,
  CLASS_BOX,
  CLASS_SLUGS,
  cap,
  DEMI_BOX,
  DEMI_FONT,
  DEMI_SIZE,
  DIM_ALPHA,
  effectOffsets,
  ELEMENT_BOX,
  FRAME_H,
  FRAME_W,
  LEVEL_BOX,
  LEVEL_FX,
  LEVEL_LABEL_SIZE,
  LEVEL_VALUE_SIZE,
  NAME_BOX,
  NAME_FONT,
  NAME_FX,
  NAME_SIZE,
  STAR_OFF,
  STAR_OFF_ALPHA,
  STAR_OFF_SHADOW,
  STAR_ON,
  STAR_SLOT,
  STAR_SLOT_ALPHA,
  TEXT_COLOR,
  type GameFont,
  type Rect,
  type TextEffect,
} from './portrait-layout';

/** Un rect de la table, en pourcentages du cadre — la façon dont le DOM le pose. */
function box(r: Rect): React.CSSProperties {
  return {
    left: `${(r.left / FRAME_W) * 100}%`,
    top: `${(r.top / FRAME_H) * 100}%`,
    width: `${(r.w / FRAME_W) * 100}%`,
    height: `${(r.h / FRAME_H) * 100}%`,
  };
}

/**
 * Une mesure du prefab (corps de texte, distance d'un effet) en % de la LARGEUR du
 * cadre, via `@container` : la typographie suit la taille du portrait au lieu de
 * rester sur le flux de la page.
 */
const cqw = (n: number) => `${(n / FRAME_W) * 100}cqw`;

/** Les effets d'un texte, rendus en `text-shadow`. */
function textShadow(layers: readonly TextEffect[]): string {
  return layers
    .flatMap((fx) =>
      effectOffsets(fx).map(([dx, dy]) => `${cqw(dx)} ${cqw(dy)} 0 rgba(0,0,0,${fx.a})`),
    )
    .join(', ');
}

/**
 * Les classes du CADRE. `aspect-180/344` tient la proportion, la LARGEUR vient de
 * l'appelant — d'où l'assemblage par jointure : perdre un espace entre les deux
 * suffit à donner un cadre de largeur nulle, muet.
 */
const ROOT_CLASS = (className: string) =>
  ['@container relative block aspect-180/344 shrink-0', className].join(' ');

/** Ce qu'un texte du portrait pose comme style de police. */
function fontOf(font: GameFont): React.CSSProperties {
  return {
    fontFamily: `var(${font.cssVar})`,
    fontWeight: font.weight,
    // Le `Text` d'Unity n'applique pas le `GPOS` de la police (cf. `bestFit`).
    fontKerning: 'none',
  };
}

export interface PortraitProps {
  /** Id de perso (`characters.json`) — sert `CT_<id>`, l'art entier. */
  id: string;
  /** Nom affiché, et alternative textuelle de l'art. */
  name: string;
  /** BasicStar 1..3. Décide, avec le palier, du nombre d'étoiles. */
  rarity: number;
  /**
   * Palier de transcendance (`TransStar`), de la rareté jusqu'à 9. C'est LUI qui
   * décide combien d'étoiles s'allument et de quelle teinte — pas un compteur.
   * Omis = perso non transcendé. Le site ne stocke pas cet état joueur : la prop
   * n'existe que pour les rendus qui le connaissent.
   */
  transcendence?: number;
  /** Slug d'élément (fire/water/earth/light/dark). Omis = pas d'icône. */
  element?: string;
  /** Slug de classe du site (striker/defender/ranger/mage/healer). */
  cls?: string;
  /** Niveau. Omis = pas de cartouche « Lv. ». */
  level?: number;
  /**
   * Titre posé au-dessus du nom (`Text_Demi`, soit `m_AdditionalNameText`).
   *
   * TOUS LES PERSOS N'EN ONT PAS, et ça ne se déduit pas du `nickname` — les 124 du
   * site en ont un en base. L'indication est `showNickName`, que le datagen tire du
   * jeu : 21 persos sur 124. La règle vit dans `characterNamePrefix`
   * (`lib/data/characters`), qui couvre aussi le « Core Fusion » des entités
   * fusionnées — c'est elle que l'appelant doit passer ici, et non le nickname brut.
   */
  prefix?: string;
  /**
   * Cache le nom ET son titre — certains écrans du jeu ne les montrent pas, et
   * c'est aussi ce qu'un appelant coupe quand le portrait est trop petit pour eux
   * (cf. `textClassName`).
   */
  hideName?: boolean;
  /**
   * Cache TOUT le rail d'étoiles — le slot, les six creux et les allumées.
   *
   * Le jeu, lui, le montre TOUJOURS : il n'y a pas de portrait sans rail, et cette
   * prop ne transcrit donc rien. Elle existe pour le tier-list-maker, dont le
   * réglage « rareté » vaut pour toute la page — vignettes carrées comme cartes —
   * et qu'on ne peut pas honorer en omettant une prop, l'élément et la classe se
   * coupant, eux, en n'étant simplement pas passés. Même statut que `hideName` :
   * un interrupteur du SITE, pas une valeur relevée.
   */
  hideStars?: boolean;
  /**
   * Classes ajoutées au nom ET au titre — le seul levier de l'appelant sur eux.
   *
   * LA LISIBILITÉ EN PETIT SE RÈGLE ICI, et pas dans ce fichier. Le nom est écrit
   * DANS le cadre à un corps proportionnel : sous ~128 px de large il passe sous
   * `text-xs`, et le titre bien avant. Poser ce seuil dans le composant reviendrait
   * à y écrire un nombre que le jeu n'a pas, alors que tout le reste est relevé —
   * et il dépend de l'appelant, pas du portrait.
   *
   * D'où cette prop plutôt qu'un `hideName` conditionnel : `CharacterCard` passe
   * `hidden md:flex` et écrit le nom SOUS le cadre en dessous de ce palier, comme
   * `CharacterPortrait` le fait pour la vignette carrée. Un seul DOM, la bascule
   * est purement CSS — un composant client qui mesure le viewport rendrait le même
   * service au prix d'un décalage à l'hydratation.
   */
  textClassName?: string;
  /**
   * Charge l'art en `eager` au lieu de `lazy` — pour les portraits peints
   * au-dessus de la ligne de flottaison, qui sont souvent le LCP de leur page.
   */
  priority?: boolean;
  /** `SetDim(true)` : le voile noir de l'état grisé (cf. piège 3). */
  dim?: boolean;
  /**
   * `m_FusionIconObj` — entité core-fusion. EXCLUSIF de `synchro` : les deux
   * badges partagent un emplacement, un core ne pouvant pas être synchronisé.
   * Celui-ci l'emporte si les deux sont passées.
   */
  coreFusion?: boolean;
  /** `m_SynchroObj` — perso synchronisé. Mêmes règles que `coreFusion`. */
  synchro?: boolean;
  /**
   * Taille du cadre. Une seule dimension suffit (`w-40`) : la proportion est tenue
   * par `aspect-180/344` — toute la géométrie s'exprime en % du cadre, et les %
   * horizontaux se résolvent sur la largeur quand les verticaux se résolvent sur la
   * hauteur. Un rectangle d'un autre ratio décalerait tout.
   */
  className?: string;
  /**
   * Le contenu de `FX_Holder` (`m_EffectHolder`) — l'effet ANIMÉ que `SetEffect`
   * instancie pour 25 personnages sur 124.
   *
   * Une PROP et non un calque en dur, parce que cet effet est du WebGL : il tient
   * un contexte, une boucle et des textures, donc un composant CLIENT, quand ce
   * fichier-ci est serveur et doit le rester (les guides l'appellent). `Portrait`
   * n'en connaît que la PLACE, qui est du prefab et rien d'autre — juste après
   * l'art, sous le rail d'étoiles, l'élément, la classe, le niveau et le nom.
   * Cf. `AnimatedPortrait`, qui la remplit.
   */
  fx?: React.ReactNode;
}

export function Portrait({
  id,
  name,
  rarity,
  transcendence,
  element,
  cls,
  level,
  prefix,
  hideName = false,
  hideStars = false,
  textClassName = '',
  priority = false,
  dim = false,
  coreFusion = false,
  synchro = false,
  className = 'w-40',
  fx,
}: PortraitProps) {
  const [show, tone, plus] = transcendenceRow(rarity, transcendence);
  // `m_StarImage[ShowUIStar-1]` reçoit la teinte — soit, dans l'ordre du tableau
  // (haut → bas), la DERNIÈRE allumée, donc la plus basse. Elle ne se distingue que
  // si le palier porte un « + » ; sinon la table donne déjà 'y'.
  const litTone = (i: number): StarTone => (plus > 0 && i === show - 1 ? tone : 'y');

  return (
    // `@container` : le niveau et le nom sont du TEXTE, il leur faut une taille liée
    // au cadre et non au flux typographique de la page (cf. `cqw`).
    // `aspect-180/344` : la proportion EXACTE de l'art (1,911:1), pas 1:2 — un 1:2
    // étirerait de 4,6 %.
    // L'effet animé n'impose rien ici : le canvas peint l'art LUI-MÊME et mélange
    // en interne — aucun `mix-blend-mode`, donc aucun `isolate` à poser.
    <span className={ROOT_CLASS(className)}>
      {/* L'ART — plein cadre, malgré ce que dit `m_FaceIconRect` (cf. piège 2). */}
      <img
        src={img.portrait(id)}
        alt={name}
        loading={priority ? 'eager' : 'lazy'}
        className="absolute inset-0 h-full w-full"
      />

      {/* `FX_Holder` — à sa place du prefab : au-dessus de l'art, sous tout le
          reste. Vide pour 99 personnages sur 124. */}
      {fx}

      {/* LE RAIL D'ÉTOILES — le slot sombre, six creux, puis les allumées. */}
      {!hideStars && (
        <img
          src={img.starSlot()}
          alt=""
          aria-hidden
          className="absolute"
          style={{ ...box(STAR_SLOT), opacity: STAR_SLOT_ALPHA }}
        />
      )}
      {!hideStars &&
        STAR_OFF.map((r, i) => (
          <img
            key={`off-${i}`}
            src={img.starEmpty()}
            alt=""
            aria-hidden
            className="absolute"
            style={{
              ...box(r),
              opacity: STAR_OFF_ALPHA,
              filter: `drop-shadow(${cqw(STAR_OFF_SHADOW.x)} ${cqw(STAR_OFF_SHADOW.y)} 0 rgba(0,0,0,${STAR_OFF_SHADOW.a}))`,
            }}
          />
        ))}
      {!hideStars &&
        STAR_ON.slice(0, show).map((r, i) => (
          <img
            key={`on-${i}`}
            src={img.star(litTone(i))}
            alt=""
            aria-hidden
            className="absolute"
            style={box(r)}
          />
        ))}

      {/* CLASSE puis ÉLÉMENT — décoratifs pour un lecteur d'écran : leur `alt` ne
          pourrait être que le slug anglais brut (« dark », « mage ») dans les cinq
          langues, et le composant ne traduit rien. L'info reste portée par le nom
          à côté, lui localisé. */}
      {cls && CLASS_SLUGS.has(cls) && (
        <img
          src={img.boss(`CT_Class_${cap(cls)}`)}
          alt=""
          aria-hidden
          className="absolute"
          style={box(CLASS_BOX)}
        />
      )}
      {element && (
        <img
          src={img.boss(`CT_Element_${cap(element)}`)}
          alt=""
          aria-hidden
          className="absolute"
          style={box(ELEMENT_BOX)}
        />
      )}

      {/* LE BADGE d'état — un seul emplacement pour les deux, et un
          seul badge à la fois (cf. `BADGE_BOX`). Le core-fusion l'emporte si les
          deux props sont passées : l'état ne peut pas exister en jeu, autant le
          rendre visible plutôt que d'empiler deux sprites. */}
      {(coreFusion || synchro) && (
        <img
          src={coreFusion ? img.coreFusionTag() : img.syncIcon()}
          alt=""
          aria-hidden
          className="absolute"
          style={box(BADGE_BOX)}
        />
      )}

      {/* LE NIVEAU — deux textes côte à côte, largeur LIBRE (cf. piège 5), pas de
          plaque derrière : ce qui les détache de l'art, ce sont leurs effets. */}
      {level != null && (
        <span
          className="absolute flex items-center leading-none italic"
          style={{
            left: `${(LEVEL_BOX.left / FRAME_W) * 100}%`,
            top: `${(LEVEL_BOX.top / FRAME_H) * 100}%`,
            height: `${(LEVEL_BOX.h / FRAME_H) * 100}%`,
            color: TEXT_COLOR,
            textShadow: textShadow(LEVEL_FX),
            // `LvText` et son nombre portent le même `m_Font` que le nom.
            ...fontOf(NAME_FONT),
          }}
        >
          {/* `LvText` n'écrit pas son libellé : il porte `m_MessageKey = SYS_LV`.
              Vérifié dans `TextSystem` — la clé vaut « Lv. » dans les CINQ langues,
              coréen compris. La coder en dur est donc exact. */}
          <span style={{ fontSize: cqw(LEVEL_LABEL_SIZE) }}>Lv.</span>
          <span className="tabular-nums" style={{ fontSize: cqw(LEVEL_VALUE_SIZE) }}>
            {level}
          </span>
        </span>
      )}

      {/* LE TITRE puis LE NOM. Aucun dégradé sous eux : `LowBg` est inactif dans
          le prefab — ils ne tiennent que par leurs effets. `textClassName` est le
          levier de l'appelant : le seuil de lisibilité vit chez lui. */}
      {!hideName && (
        <>
          {prefix && (
            // `m_Alignment = 3` = MiddleLeft, comme le nom.
            <span
              className={`absolute flex items-center overflow-hidden leading-none whitespace-nowrap ${textClassName}`}
              style={{
                ...box(DEMI_BOX),
                fontSize: cqw(bestFit(prefix, DEMI_BOX.w, DEMI_SIZE, DEMI_FONT)),
                color: TEXT_COLOR,
                textShadow: textShadow(NAME_FX),
                ...fontOf(DEMI_FONT),
              }}
            >
              {prefix}
            </span>
          )}
          {/* `m_Alignment = 3` = MiddleLeft. */}
          <span
            className={`absolute flex items-center overflow-hidden leading-none whitespace-nowrap ${textClassName}`}
            style={{
              ...box(NAME_BOX),
              fontSize: cqw(bestFit(name, NAME_BOX.w, NAME_SIZE, NAME_FONT)),
              color: TEXT_COLOR,
              textShadow: textShadow(NAME_FX),
              ...fontOf(NAME_FONT),
            }}
          >
            {name}
          </span>
        </>
      )}

      {/* `SetDim(true)` — le voile de l'état grisé, à son `m_Color.a` exact. */}
      {dim && (
        <img
          src={img.portraitDim()}
          alt=""
          aria-hidden
          className="absolute inset-0 h-full w-full"
          style={{ opacity: DIM_ALPHA }}
        />
      )}
    </span>
  );
}
