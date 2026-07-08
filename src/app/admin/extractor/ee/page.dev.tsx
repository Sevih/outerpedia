import { EquipmentReport } from '@/components/admin/EquipmentReport';
import { equipmentV2Control } from '@/lib/admin/equipment-control';

export const dynamic = 'force-dynamic';

export default function Page() {
  return <EquipmentReport title="Extractor · EE" report={equipmentV2Control('ee')[0] ?? null} />;
}
