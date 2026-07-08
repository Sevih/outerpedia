import { PlaceholderPage } from '@/components/admin/PlaceholderPage';

export const dynamic = 'force-dynamic';

export default function Page() {
  return (
    <PlaceholderPage
      title="Extractor · Monstre"
      kind="extractor"
      note="Extraction des monstres — à venir."
    />
  );
}
