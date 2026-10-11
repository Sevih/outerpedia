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
          Guides are edited in quick (Guides) — boss guides and the three editable general guides
          (Premium &amp; Limited, Free Heroes, Shop priorities), where contributions are imported
          too. This page stays reachable by its URL until the admin is removed. Guide types here:{' '}
          {adminGuideMenu()
            .map((c) => c.label)
            .join(', ')}
          .
        </p>
      </div>
      <ContributionImport />
    </div>
  );
}
