import type { Lang } from '@/lib/i18n/config';
import { ResponsiveCharacterCard } from '@/components/character/ResponsiveCharacterCard';
import { getActiveBanners } from '@/lib/home';
import { BannerCountdown, BannerWrapper } from './BannerCountdown';

/**
 * Bannières de recrutement ACTIVES (curées via /admin/tools/banners) — carte
 * perso + compte à rebours. Section masquée s'il n'y en a aucune. Layout unique flex-wrap
 * (desktop et mobile) — pas de carousel dédié, les cartes s'enroulent.
 */
export function CurrentBanners({
  lang,
  title,
  endsInLabel,
  starAria,
}: {
  lang: Lang;
  title: string;
  endsInLabel: string;
  starAria: string;
}) {
  const banners = getActiveBanners(lang);
  if (banners.length === 0) return null;

  return (
    <section>
      <h2 className="text-content-strong mb-6 text-2xl font-bold">{title}</h2>
      <div className="flex flex-wrap justify-center gap-4 md:gap-6">
        {banners.map((b) => (
          <BannerWrapper key={b.id} endDate={b.end}>
            <div className="flex flex-col items-center gap-2">
              <ResponsiveCharacterCard
                id={b.id}
                name={b.name}
                prefix={b.prefix}
                element={b.element}
                classType={b.classType}
                rarity={b.rarity}
                tags={b.tags}
                href={b.href}
                starAriaLabel={starAria}
              />
              <BannerCountdown endDate={b.end} element={b.element} endsInLabel={endsInLabel} />
            </div>
          </BannerWrapper>
        ))}
      </div>
    </section>
  );
}
