import { ChangelogEditor } from '@/components/admin/ChangelogEditor';
import { loadChangelog } from '@/lib/admin/changelog-store';

export const dynamic = 'force-dynamic';

export default function ToolChangelog() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-content-strong text-xl font-semibold">Tools · Changelog</h1>
        <p className="text-content-muted text-sm">
          Journal du site (page <code>/changelog</code>). Une entrée dont la date est dans le futur
          reste cachée jusqu&apos;à cette date. « Regen depuis V2 » réimporte l&apos;historique.
        </p>
      </div>
      <ChangelogEditor initial={loadChangelog()} />
    </div>
  );
}
