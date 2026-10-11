import { ContributionImport } from '@/components/admin/ContributionImport';
import { adminGuideMenu } from '@/lib/admin/guide-nav';

export const dynamic = 'force-dynamic';

/** Accueil du Guide editor : import de contribution + rappel des types. */
export default function GuidesIndex() {
  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <h1 className="text-content-strong text-xl font-semibold">Guide editor</h1>
        <p className="text-content-muted text-sm">
          Pick a guide type in the left menu to list and edit its guides. Here:{' '}
          {adminGuideMenu()
            .map((c) => c.label)
            .join(', ')}
          . Boss guides are edited in quick (Guides).
        </p>
      </div>
      <ContributionImport />
    </div>
  );
}
