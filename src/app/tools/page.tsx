import type { Metadata } from 'next';
import { createPageMetadata } from '@/lib/seo'
import { getToolRoutes } from "@/lib/getToolRoutes";
import Link from "next/link";
import Image from "next/image";
import { headers } from 'next/headers'
import { getServerI18n } from '@/lib/contexts/server-i18n'
import { resolveTenantFromHost } from '@/tenants/config'

export async function generateMetadata(): Promise<Metadata> {
  return createPageMetadata({
    path: '/tools',
    titleKey: 'tools.meta.title',
    descKey: 'tools.meta.desc',
    ogTitleKey: 'tools.meta.ogTitle',
    ogDescKey: 'tools.meta.ogDesc',
    keywords: [
      'outerpedia', 
      'outerplane tools', 
      'outerplane utilities', 
      'tier list',
      'gear finder',
      'pull simulator',
      'coupon codes',
      'exclusive equipment',
      'patch notes'
    ],
    image: {
      url: '/images/ui/nav/CM_Lobby_Btn_StepUp.png',
      width: 150,
      height: 150,
      altFallback: 'Outerplane Tools',
    },
  })
}

export default async function ToolsPage() {
  const h = await headers()
  const host = h.get('host') ?? ''
  const lang = resolveTenantFromHost(host)

  const { t } = await getServerI18n(lang)
  const tools = getToolRoutes(t);

  return (
    <main className="p-6">
      {/* 🏷️ Heading mis à "Utilities" */}
      <h1 className="text-3xl font-bold mb-6">{t('tools.page.h1')}</h1>
      <section className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {tools.map((tool) => (
          <Link
            key={tool.href}
            href={tool.href}
            className={`relative block rounded-2xl border p-6 hover:shadow-lg transition bg-card hover:bg-muted/20 ${tool.hidden ? 'opacity-50 border-dashed' : ''}`}
          >
            {tool.hidden && (
              <span className="absolute top-2 right-2 bg-yellow-600 text-white text-xs font-bold px-2 py-0.5 rounded">
                HIDDEN
              </span>
            )}
            <div className="flex items-center gap-4">
              <div className="shrink-0">
                <Image
                  src={`/images/ui/${tool.icon}`}
                  alt={`${tool.name} icon`}
                  width={64}
                  height={64}
                  className="rounded"
                />
              </div>
              <div>
                <h2 className="text-xl font-bold mb-1">{tool.name}</h2>
                <p className="text-sm text-muted-foreground leading-snug">{tool.description}</p>
              </div>
            </div>
          </Link>
        ))}
      </section>
    </main>
  );
}
