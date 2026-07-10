import { GearDetail } from '@/components/admin/GearDetail';

export const dynamic = 'force-dynamic';

/** Fiche info d'une entrée du catalogue (extraction). */
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <GearDetail kind="amulets" id={decodeURIComponent(id)} />;
}
