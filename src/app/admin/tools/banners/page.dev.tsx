import { BannersEditor } from '@/components/admin/BannersEditor';
import type { CharOption } from '@/components/admin/CharacterPicker';
import { loadBanners } from '@/lib/admin/promo-banner-store';
import { characterDisplayName, getCharacterListItems } from '@/lib/data/characters';

export const dynamic = 'force-dynamic';

export default function ToolBanners() {
  const chars: CharOption[] = getCharacterListItems().map((c) => ({
    id: c.id,
    name: characterDisplayName(c),
    element: c.element,
    class: c.class,
    rarity: c.rarity,
  }));

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-content-strong text-xl font-semibold">Tools · Banner</h1>
        <p className="text-content-muted text-sm">
          Choisis le perso par nom (l&apos;id se renseigne tout seul). « Regen depuis V2 » réimporte
          depuis le repo voisin.
        </p>
      </div>
      <BannersEditor initial={loadBanners()} chars={chars} />
    </div>
  );
}
