import { ExtractorSidebar } from '@/components/admin/ExtractorSidebar';
import { characterExtractorRows } from '@/lib/admin/character-rows';

export const dynamic = 'force-dynamic';

/** Master-detail Extractor : liste des persos (statuts committé ↔ extraction). */
export default function ExtractorCharactersLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex gap-6">
      <ExtractorSidebar
        rows={characterExtractorRows()}
        basePath="/admin/extractor/characters"
        iconSize={36}
      />
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
