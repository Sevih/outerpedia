import Link from 'next/link';
import type { Route } from 'next';
import type { ReactNode } from 'react';
import { img } from '@/lib/images';
import { FitText } from '@/components/ui/FitText';

/**
 * Carte personnage — portage PIXEL de la V2 : portrait avec badge de
 * recrutement, colonne d'étoiles sur slot sombre, icônes core-fusion / classe /
 * élément empilées à droite, nom (préfixe + base) en surimpression avec
 * text-shadow. Trois tailles fixes (sm/md/lg) aux mesures V2 exactes.
 */
const SIZES = {
  sm: {
    container: 'h-[128px] w-[66px]',
    namePx: { max: 11, min: 8 },
    prefixPx: { max: 8, min: 6 },
    nameLeft: 'left-1.5',
    nameMaxW: '',
    nameOverlay: false,
    iconSize: 18,
    classIconSize: 18,
    elemBottom: 'bottom-2',
    classBottom: 'bottom-8',
    coreFusionBottom: 'bottom-[50px]',
    starSize: 8,
    starPos: 'top-0.25 right-0.25',
    starPt: 'pt-2.5',
    starGap: '-space-y-0.5',
    slotWidth: 10,
    slotHeight: 57,
    badgeClass: '',
  },
  md: {
    container: 'h-[192px] w-[100px]',
    namePx: { max: 11, min: 9 },
    prefixPx: { max: 9, min: 7 },
    nameLeft: 'left-1.5',
    nameMaxW: 'max-w-[calc(100%-0.75rem)]',
    nameOverlay: true,
    iconSize: 22,
    classIconSize: 24,
    elemBottom: 'bottom-3.5',
    classBottom: 'bottom-12',
    coreFusionBottom: 'bottom-18',
    starSize: 11,
    starPos: 'top-1 right-0.75',
    starPt: 'pt-3',
    starGap: '-space-y-0.5',
    slotWidth: 13,
    slotHeight: 78,
    badgeClass: 'w-[60px] top-1.5 left-0.5',
  },
  lg: {
    container: 'h-[231px] w-[120px]',
    namePx: { max: 14, min: 12 },
    prefixPx: { max: 10, min: 7 },
    nameLeft: 'left-2',
    nameMaxW: 'max-w-[calc(100%-0.75rem)]',
    nameOverlay: true,
    iconSize: 26,
    classIconSize: 26,
    elemBottom: 'bottom-3.5',
    classBottom: 'bottom-12',
    coreFusionBottom: 'bottom-[74px]',
    starSize: 14,
    starPos: 'top-1 right-0.75',
    starPt: 'pt-3.5',
    starGap: '-space-y-0.75',
    slotWidth: 17,
    slotHeight: 94,
    badgeClass: 'w-[75px] top-2 left-0.5',
  },
} as const;

/** Ordre V2 des badges de recrutement : le premier tag trouvé fait le badge. */
const RECRUIT_ORDER = ['collab', 'seasonal', 'premium', 'free', 'limited'] as const;

export type CharacterCardSize = keyof typeof SIZES;

export interface CharacterCardProps {
  id: string;
  name: string;
  /** Préfixe de titre au-dessus du nom (« Core Fusion », « Demiurge »…). */
  prefix?: string | null;
  /** Slugs V3 (fire/striker…) — les helpers d'images capitalisent. */
  element?: string;
  classType?: string;
  rarity?: number;
  tags?: string[];
  size?: CharacterCardSize;
  href?: string;
  showName?: boolean;
  showIcons?: boolean;
  showElement?: boolean;
  showClass?: boolean;
  showStars?: boolean;
  showBadge?: boolean;
  priority?: boolean;
  children?: ReactNode;
}

export function CharacterCard({
  id,
  name,
  prefix,
  element,
  classType,
  rarity,
  tags,
  size = 'md',
  href,
  showName = true,
  showIcons = true,
  showElement,
  showClass,
  showStars = true,
  showBadge = true,
  priority = false,
  children,
}: CharacterCardProps) {
  const s = SIZES[size];
  const badgeTag =
    showBadge && s.badgeClass && tags ? RECRUIT_ORDER.find((tg) => tags.includes(tg)) : undefined;
  const renderElement = (showElement ?? showIcons) && element;
  const renderClass = (showClass ?? showIcons) && classType;
  const baseName = prefix ? name.replace(prefix, '').trim() : name;

  const portraitBox = (
    <div className={`relative overflow-hidden rounded ${s.container}`}>
      {/* eslint-disable-next-line @next/next/no-img-element -- asset R2/staging */}
      <img
        src={img.portrait(id)}
        alt={name}
        loading={priority ? 'eager' : 'lazy'}
        className="absolute inset-0 h-full w-full object-cover"
      />

      {/* Badge de recrutement — en haut à gauche */}
      {badgeTag && (
        // eslint-disable-next-line @next/next/no-img-element -- asset R2/staging
        <img
          src={img.recruitTag(badgeTag)}
          alt={badgeTag}
          className={`absolute z-10 h-auto ${s.badgeClass}`}
        />
      )}

      {/* Étoiles — en haut à droite sur slot sombre */}
      {showStars && rarity ? (
        <div
          className={`absolute ${s.starPos} z-10`}
          role="img"
          aria-label={`${rarity} star rarity`}
        >
          <div className="relative" style={{ width: s.slotWidth, height: s.slotHeight }}>
            {/* eslint-disable-next-line @next/next/no-img-element -- asset R2/staging */}
            <img
              src={img.starSlot()}
              alt=""
              className="absolute inset-0 h-full w-full object-contain"
            />
          </div>
          <div
            className={`absolute inset-0 flex flex-col items-center justify-start ${s.starGap} ${s.starPt}`}
          >
            {Array.from({ length: rarity }, (_, i) => (
              // eslint-disable-next-line @next/next/no-img-element -- asset R2/staging
              <img
                key={i}
                src={img.star()}
                alt=""
                style={{ width: s.starSize, height: s.starSize }}
              />
            ))}
          </div>
        </div>
      ) : null}

      {/* Dégradé bas */}
      <div className="absolute inset-x-0 bottom-0 z-5 h-1/4 bg-linear-to-t from-black/80 to-transparent" />

      {/* Icône d'élément — en bas à droite */}
      {renderElement && (
        <div
          className={`absolute ${s.elemBottom} right-1 z-10`}
          style={{ width: s.iconSize, height: s.iconSize }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element -- asset R2/staging */}
          <img
            src={img.element(element)}
            alt={element}
            className="absolute inset-0 h-full w-full object-contain"
          />
        </div>
      )}

      {/* Icône de classe — au-dessus de l'élément */}
      {renderClass && (
        <div
          className={`absolute ${s.classBottom} right-1 z-10`}
          style={{ width: s.classIconSize, height: s.classIconSize }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element -- asset R2/staging */}
          <img
            src={img.klass(classType)}
            alt={classType}
            className="absolute inset-0 h-full w-full object-contain"
          />
        </div>
      )}

      {/* Icône core-fusion — au-dessus de la classe */}
      {tags?.includes('core-fusion') && (
        <div
          className={`absolute ${s.coreFusionBottom} right-1 z-10`}
          style={{ width: s.classIconSize, height: s.classIconSize }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element -- asset R2/staging */}
          <img
            src={img.coreFusionTag()}
            alt="Core Fusion"
            className="absolute inset-0 h-full w-full object-contain"
          />
        </div>
      )}

      {/* Nom en surimpression — bas gauche (md/lg) */}
      {showName && s.nameOverlay && (
        <div
          style={{ textShadow: '1px 0 1px #000, -1px 0 1px #000, 0 1px 1px #000, 0 -1px 1px #000' }}
          className={`absolute bottom-4 ${s.nameLeft} z-10 ${s.nameMaxW} leading-tight font-bold text-white`}
        >
          {prefix && (
            <FitText max={s.prefixPx.max} min={s.prefixPx.min} className="text-zinc-300">
              {prefix}
            </FitText>
          )}
          <FitText max={s.namePx.max} min={s.namePx.min}>
            {baseName}
          </FitText>
        </div>
      )}
    </div>
  );

  const wrapper = href ? (
    <Link href={href as Route} className="block transition-opacity hover:opacity-80">
      {portraitBox}
    </Link>
  ) : (
    portraitBox
  );

  const hasExtra = children || (showName && !s.nameOverlay);
  if (!hasExtra) return wrapper;

  return (
    <div className="flex flex-col items-center gap-1">
      {wrapper}
      {showName && !s.nameOverlay && (
        <div
          className="text-center leading-tight text-zinc-200"
          style={{ maxWidth: s.container.includes('66') ? 66 : 120 }}
        >
          {prefix && (
            <FitText max={s.prefixPx.max} min={s.prefixPx.min} center className="text-zinc-400">
              {prefix}
            </FitText>
          )}
          <FitText max={s.namePx.max} min={s.namePx.min} center>
            {baseName}
          </FitText>
        </div>
      )}
      {children}
    </div>
  );
}
