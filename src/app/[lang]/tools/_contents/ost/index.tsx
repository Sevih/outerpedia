import { getT } from '@/i18n';
import type { Lang } from '@/lib/i18n/config';
import { getBgmTracks } from '@/lib/data/bgm';
import { OstPlayer, type BgmTrack } from './OstPlayer';

/**
 * OST (jukebox) — wrapper SERVEUR : résout les libellés i18n et passe la table
 * `bgm_mapping.json` (générée par `pnpm datagen:build`) au player client. La
 * localisation des NOMS de piste se fait côté client depuis les champs
 * `name_<lang>` de chaque entrée.
 *
 * ARCHIVÉES : une piste `retired` est un mp3 que le jeu a retiré de ses bundles
 * mais que R2 sert toujours (rétention de catalogue de `promote`, cf.
 * `RETAIN_CATALOGS`) — elle passe dans la playlist « Archivées » du player.
 */
export default async function Ost({ lang }: { lang: Lang }) {
  const t = await getT(lang);
  const all: BgmTrack[] = getBgmTracks();
  return (
    <OstPlayer
      lang={lang}
      tracks={all.filter((x) => !x.retired)}
      archived={all.filter((x) => x.retired)}
      strings={{
        download: t('ost.download'),
        selectTrack: t('ost.selectTrack'),
        disclaimer1: t('ost.disclaimer.line1'),
        disclaimer2: t('ost.disclaimer.line2'),
        keyboardShortcuts: t('ost.keyboardShortcuts'),
        tabTracks: t('ost.tabTracks'),
        tabArchived: t('ost.tabArchived'),
        archivedNote: t('ost.archivedNote'),
        loadError: t('ost.loadError'),
        colTitle: t('ost.colTitle'),
        colDuration: t('ost.colDuration'),
        colSize: t('ost.colSize'),
        shuffle: t('ost.shuffle'),
        repeat: {
          off: t('ost.repeat.off'),
          all: t('ost.repeat.all'),
          one: t('ost.repeat.one'),
        },
        mute: t('ost.mute'),
        unmute: t('ost.unmute'),
        play: t('ost.play'),
        pause: t('ost.pause'),
        previous: t('common.previous'),
        next: t('common.next'),
      }}
    />
  );
}
