import { PlaceholderPage } from '@/components/admin/PlaceholderPage';

export const dynamic = 'force-dynamic';

export default function Page() {
  return (
    <PlaceholderPage
      title="Extractor · Armor"
      kind="extractor"
      note="Contrôle des armures — pas d’oracle V2 dédié pour l’instant."
    />
  );
}
