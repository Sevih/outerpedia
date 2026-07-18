import { ExtractorSidebar } from '@/components/admin/ExtractorSidebar';
import { buildGearRows } from '@/lib/admin/gear-rows';

export const dynamic = 'force-dynamic';

/** Master-detail Editor EE : liste des EE (mêmes lignes que l'Extractor), liens
 * vers la curation. */
export default function EditorEeLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex gap-6">
      <ExtractorSidebar rows={buildGearRows('ee')} basePath="/admin/editor/ee" />
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
