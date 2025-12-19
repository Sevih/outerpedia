import Link from 'next/link';
import Image from 'next/image';
import { getServerI18n } from '@/lib/contexts/server-i18n';
import { getTenantServer } from '@/tenants/tenant.server';

type GuideItem = {
  slug: string;
  title: string;
  description: string;
  icon: string;
  category: string;
  last_updated: string;
  author: string;
};

type Props = {
  items: GuideItem[];
  depth6Note?: string;
};

// Maps slug to i18n key for route names
const ROUTE_I18N_KEYS: Record<string, string> = {
  'depth1-route1': 'monad.route.1',
  'depth2-route1': 'monad.route.2',
  'depth3-route1': 'monad.route.3',
  'depth4-route1': 'monad.route.4.1',
  'depth4-route2': 'monad.route.4.2',
  'depth5-route1': 'monad.route.5',
  'depth6-route1': 'monad.route.1',
  'depth6-route2': 'monad.route.2',
  'depth6-route3': 'monad.route.3',
  'depth6-route4': 'monad.route.4',
  'depth6-route5': 'monad.route.5',
};

// Maps depth to illustration
const DEPTH_ILLUSTRATIONS: Record<number, string> = {
  1: '/images/guides/monad-gate/T_DungeonArea_01.webp',
  2: '/images/guides/monad-gate/T_DungeonArea_02.webp',
  3: '/images/guides/monad-gate/T_DungeonArea_03.webp',
  4: '/images/guides/monad-gate/T_DungeonArea_04.webp',
  5: '/images/guides/monad-gate/T_DungeonArea_05.webp',
};

// D6 routes map to their original world illustrations
const D6_ROUTE_ILLUSTRATIONS: Record<string, string> = {
  'depth6-route1': '/images/guides/monad-gate/T_DungeonArea_01.webp',
  'depth6-route2': '/images/guides/monad-gate/T_DungeonArea_02.webp',
  'depth6-route3': '/images/guides/monad-gate/T_DungeonArea_03.webp',
  'depth6-route4': '/images/guides/monad-gate/T_DungeonArea_04.webp',
  'depth6-route5': '/images/guides/monad-gate/T_DungeonArea_05.webp',
};

// Reusable card component for consistent sizing
type CardProps = {
  title: string;
  illustration: string;
  routes: { slug: string; name: string }[];
  date: string;
  author: string;
  isClickable?: boolean;
  href?: string;
};

function MonadDepthCard({ title, illustration, routes, date, author, isClickable, href }: CardProps) {
  const content = (
    <>
      {/* Illustration - ratio 1:2 */}
      <div className="relative w-24 h-48 shrink-0 rounded-lg overflow-hidden border border-zinc-600 group-hover:border-yellow-500/50 transition-colors">
        <Image
          src={illustration}
          alt={title}
          fill
          sizes="96px"
          className="object-cover"
        />
      </div>

      {/* Content */}
      <div className="flex flex-col min-w-0">
        {/* Title */}
        <div className="text-lg font-semibold text-white mb-2">
          {title}
        </div>

        {/* Routes */}
        <div className="flex flex-col gap-1.5 mb-2">
          {routes.map((route) => (
            isClickable ? (
              <span
                key={route.slug}
                className="inline-flex items-center px-2 py-1 rounded-md bg-zinc-700/50 text-sm text-zinc-200 group-hover:text-yellow-400 group-hover:bg-yellow-500/20 border border-zinc-600 group-hover:border-yellow-500/50 transition-colors"
              >
                {route.name}
              </span>
            ) : (
              <Link
                key={route.slug}
                href={`/guides/monad-gate/${route.slug}`}
                className="group/route inline-flex items-center px-2 py-1 rounded-md bg-zinc-700/50 hover:bg-yellow-500/20 border border-zinc-600 hover:border-yellow-500/50 transition-colors"
              >
                <span className="text-sm text-zinc-200 group-hover/route:text-yellow-400 transition-colors">
                  {route.name}
                </span>
              </Link>
            )
          ))}
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Meta info */}
        <div className="flex items-center gap-2 text-xs text-zinc-400">
          <span>{new Date(date).toLocaleDateString()}</span>
          <span>-</span>
          <span className="truncate">{author}</span>
        </div>
      </div>
    </>
  );

  if (isClickable && href) {
    return (
      <Link
        href={href}
        className="group flex gap-3 p-3 rounded-xl border border-zinc-700/50 bg-zinc-800/30 hover:bg-zinc-800/50 hover:border-yellow-500/30 transition-colors"
      >
        {content}
      </Link>
    );
  }

  return (
    <div className="flex gap-3 p-3 rounded-xl border border-zinc-700/50 bg-zinc-800/30">
      {content}
    </div>
  );
}

export default async function MonadGateGuideGrid({ items, depth6Note }: Props) {
  const { key: langKey } = await getTenantServer();
  const { t } = await getServerI18n(langKey);

  // Group by depth
  const groupedByDepth = items.reduce<Record<string, GuideItem[]>>((acc, item) => {
    const match = item.slug.match(/^depth(\d+)/i);
    const depth = match ? match[1] : '0';
    if (!acc[depth]) acc[depth] = [];
    acc[depth].push(item);
    return acc;
  }, {});

  // Sort items within each depth by route number
  Object.values(groupedByDepth).forEach(group => {
    group.sort((a, b) => {
      const aRoute = parseInt(a.slug.match(/route(\d+)/i)?.[1] || '0', 10);
      const bRoute = parseInt(b.slug.match(/route(\d+)/i)?.[1] || '0', 10);
      return aRoute - bRoute;
    });
  });

  const d6Routes = groupedByDepth['6'] || [];

  return (
    <div className="space-y-6">
      {depth6Note && (
        <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-4 text-sm text-neutral-300">
          <span className="font-semibold text-yellow-500">Note:</span> {depth6Note}
        </div>
      )}

      {/* D1-D5 Grid - Staggered layout */}
      <div className="flex flex-col gap-4">
        {/* Row 1: D1, D2 */}
        <div className="flex gap-30 justify-center">
          {[1, 2].map((depth) => {
            const depthRoutes = groupedByDepth[String(depth)];
            if (!depthRoutes) return null;
            const illustration = DEPTH_ILLUSTRATIONS[depth];
            const mostRecentDate = depthRoutes.reduce((latest, item) => {
              return item.last_updated > latest ? item.last_updated : latest;
            }, depthRoutes[0].last_updated);
            const authors = [...new Set(depthRoutes.map(r => r.author))].join(', ');
            const routes = depthRoutes.map((item) => ({
              slug: item.slug,
              name: ROUTE_I18N_KEYS[item.slug] ? t(ROUTE_I18N_KEYS[item.slug]) : item.title,
            }));
            return (
              <MonadDepthCard
                key={depth}
                title={`Depth ${depth}`}
                illustration={illustration}
                routes={routes}
                date={mostRecentDate}
                author={authors}
              />
            );
          })}
        </div>

        {/* Row 2: D3 centered */}
        <div className="flex justify-center">
          {(() => {
            const depthRoutes = groupedByDepth['3'];
            if (!depthRoutes) return null;
            const illustration = DEPTH_ILLUSTRATIONS[3];
            const mostRecentDate = depthRoutes.reduce((latest, item) => {
              return item.last_updated > latest ? item.last_updated : latest;
            }, depthRoutes[0].last_updated);
            const authors = [...new Set(depthRoutes.map(r => r.author))].join(', ');
            const routes = depthRoutes.map((item) => ({
              slug: item.slug,
              name: ROUTE_I18N_KEYS[item.slug] ? t(ROUTE_I18N_KEYS[item.slug]) : item.title,
            }));
            return (
              <MonadDepthCard
                title="Depth 3"
                illustration={illustration}
                routes={routes}
                date={mostRecentDate}
                author={authors}
              />
            );
          })()}
        </div>

        {/* Row 3: D4, D5 */}
        <div className="flex gap-30 justify-center">
          {[4, 5].map((depth) => {
            const depthRoutes = groupedByDepth[String(depth)];
            if (!depthRoutes) return null;
            const illustration = DEPTH_ILLUSTRATIONS[depth];
            const mostRecentDate = depthRoutes.reduce((latest, item) => {
              return item.last_updated > latest ? item.last_updated : latest;
            }, depthRoutes[0].last_updated);
            const authors = [...new Set(depthRoutes.map(r => r.author))].join(', ');
            const routes = depthRoutes.map((item) => ({
              slug: item.slug,
              name: ROUTE_I18N_KEYS[item.slug] ? t(ROUTE_I18N_KEYS[item.slug]) : item.title,
            }));
            return (
              <MonadDepthCard
                key={depth}
                title={`Depth ${depth}`}
                illustration={illustration}
                routes={routes}
                date={mostRecentDate}
                author={authors}
              />
            );
          })}
        </div>
      </div>

      {/* D6 Separator */}
      {d6Routes.length > 0 && (
        <>
          <div className="flex items-center gap-4">
            <div className="flex-1 h-px bg-zinc-700" />
            <span className="text-xl font-semibold text-white">Depth 6</span>
            <div className="flex-1 h-px bg-zinc-700" />
          </div>

          {/* D6 Grid */}
          <div className="flex flex-wrap gap-4">
            {d6Routes.map((item) => {
              const i18nKey = ROUTE_I18N_KEYS[item.slug];
              const routeName = i18nKey ? t(i18nKey) : item.title;
              const illustration = D6_ROUTE_ILLUSTRATIONS[item.slug];

              return (
                <MonadDepthCard
                  key={item.slug}
                  title="Depth 6"
                  illustration={illustration}
                  routes={[{ slug: item.slug, name: routeName }]}
                  date={item.last_updated}
                  author={item.author}
                  isClickable
                  href={`/guides/monad-gate/${item.slug}`}
                />
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
