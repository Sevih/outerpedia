import { getT } from '@/i18n';
import type { Lang } from '@/lib/i18n/config';
import bgmData from '@data/generated/bgm_mapping.json';
import { OstPlayer, type BgmTrack } from './OstPlayer';

/**
 * OST (jukebox) — wrapper SERVEUR : résout les libellés i18n et passe la table
 * `bgm_mapping.json` (générée par `pnpm datagen:bgm`) au player client. La
 * localisation des NOMS de piste se fait côté client depuis les champs
 * `name_<lang>` de chaque entrée.
 */
export default async function Ost({ lang }: { lang: Lang }) {
  const t = await getT(lang);
  return (
    <OstPlayer
      lang={lang}
      tracks={bgmData as BgmTrack[]}
      strings={{
        download: t('ost.download'),
        selectTrack: t('ost.selectTrack'),
        disclaimer1: t('ost.disclaimer.line1'),
        disclaimer2: t('ost.disclaimer.line2'),
        keyboardShortcuts: t('ost.keyboardShortcuts'),
      }}
    />
  );
}
