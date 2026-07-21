import { EventsEditor } from '@/components/admin/EventsEditor';
import { loadEventsForAdmin } from '@/lib/admin/events-store';

export const dynamic = 'force-dynamic';

export default function ToolEvents() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-content-strong text-xl font-semibold">Tools · Événements</h1>
        <p className="text-content-muted text-sm">
          Contenu de <code>/event</code> et des pages <code>/event/&lt;slug&gt;</code>. Le statut (à
          venir / en cours / terminé) se DÉDUIT des dates — rien à basculer à la main. Enregistrer
          publie aussi la copie runtime sur R2 : l&apos;événement paraît en prod sans redéploiement.
        </p>
      </div>
      <EventsEditor initial={loadEventsForAdmin()} />
    </div>
  );
}
