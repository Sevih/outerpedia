/**
 * LISTE des événements communautaires (`/event`).
 *
 * Route DÉDIÉE et non un slug du routeur à plat (`[lang]/[slug]`) : l'outil a
 * des sous-pages (`/event/<slug>`), et un segment `event/` qui n'aurait pas sa
 * propre page laisserait `/event` dépendre d'un repli du routeur dynamique.
 * L'enveloppe reste celle des autres outils (`ToolShell`), le rendu et les
 * libellés viennent du même wrapper `_contents/event`.
 */
import type { Metadata } from 'next';
import { normalizeLang } from '@/lib/i18n/config';
import { getT } from '@/i18n';
import { createPageMetadata } from '@/lib/seo';
import { img } from '@/lib/images';
import { getToolMeta } from '@/lib/data/tools';
import { ToolShell } from '@/components/tools/ToolShell';
import EventTool from '../tools/_contents/event';

export const revalidate = 86400;

type Props = { params: Promise<{ lang: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang: raw } = await params;
  const lang = normalizeLang(raw);
  const t = await getT(lang);
  const tool = getToolMeta('event');
  return createPageMetadata({
    lang,
    path: '/event',
    title: t('page.tool.meta_title').replace('{title}', t('tools.event')),
    description: t('tools.event.desc'),
    ...(tool && { ogImage: img.toolIconPng(tool.icon) }),
  });
}

export default async function EventListPage({ params }: Props) {
  const { lang: raw } = await params;
  const lang = normalizeLang(raw);
  const t = await getT(lang);
  return (
    <ToolShell
      lang={lang}
      slug="event"
      title={t('tools.event')}
      description={t('tools.event.desc')}
      t={t}
    >
      <EventTool lang={lang} />
    </ToolShell>
  );
}
