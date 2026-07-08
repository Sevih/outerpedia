import { CharactersSidebar } from '@/components/admin/CharactersSidebar';
import { buildCharacterRows } from '@/lib/admin/character-rows';

export const dynamic = 'force-dynamic';

/** Master-detail Extractor : liste des persos (statuts committé ↔ extraction). */
export default function ExtractorCharactersLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex gap-6">
      <CharactersSidebar rows={buildCharacterRows()} basePath="/admin/extractor/characters" />
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
