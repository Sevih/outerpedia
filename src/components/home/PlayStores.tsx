import Link from 'next/link';
import { FaApple, FaGooglePlay, FaSteam } from 'react-icons/fa';
import type { IconType } from 'react-icons';
import type { Lang } from '@/lib/i18n/config';
import { localePath } from '@/lib/navigation';
import { GAME_STORE_URLS } from '@/lib/game-stores';

/**
 * Note « Jouer à OUTERPLANE » — les trois stores du jeu (URL de
 * `@/lib/game-stores`) et un renvoi au guide « How to play » pour le reste
 * (Google Play Games sur PC). Les noms de stores ne se traduisent pas ; icônes
 * `react-icons` décoratives, le nom est écrit à côté.
 */

const STORES: { key: keyof typeof GAME_STORE_URLS; name: string; icon: IconType }[] = [
  { key: 'steam', name: 'Steam', icon: FaSteam },
  { key: 'playstore', name: 'Google Play', icon: FaGooglePlay },
  { key: 'appstore', name: 'App Store', icon: FaApple },
];

export interface PlayStoresStrings {
  title: string;
  /** Libellé du lien vers le guide « How to play ». */
  more: string;
}

export function PlayStores({ lang, strings }: { lang: Lang; strings: PlayStoresStrings }) {
  return (
    <section className="card flex flex-col gap-3 p-4 md:flex-row md:items-center md:gap-4">
      <h2 className="text-content-strong font-semibold md:shrink-0">{strings.title}</h2>
      <ul className="flex flex-wrap gap-2">
        {STORES.map(({ key, name, icon: Icon }) => (
          <li key={key}>
            <a
              href={GAME_STORE_URLS[key]}
              target="_blank"
              rel="noopener noreferrer"
              className="border-line-subtle bg-surface-overlay text-content-strong hover:bg-surface-sunken inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-sm font-semibold transition-colors"
            >
              <Icon className="text-base" aria-hidden />
              {name}
            </a>
          </li>
        ))}
      </ul>
      <Link
        href={localePath(lang, '/guides/other/how-to-play')}
        className="text-content-muted hover:text-content-strong text-sm underline-offset-2 hover:underline md:ml-auto md:text-right"
      >
        {strings.more}
      </Link>
    </section>
  );
}
