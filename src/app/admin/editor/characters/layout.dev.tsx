import { CharactersSidebar } from '@/components/admin/CharactersSidebar';
import { buildCharacterRows } from '@/lib/admin/character-rows';

export const dynamic = 'force-dynamic';

/** Master-detail Editor : même liste des persos, liens vers la curation. */
export default function EditorCharactersLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex gap-6">
      <CharactersSidebar rows={buildCharacterRows()} basePath="/admin/editor/characters" />
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
