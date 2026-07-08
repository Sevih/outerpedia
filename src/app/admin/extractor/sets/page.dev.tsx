import { EquipmentReport } from '@/components/admin/EquipmentReport';
import { equipmentV2Control } from '@/lib/admin/equipment-control';

export const dynamic = 'force-dynamic';

export default function Page() {
  return (
    <EquipmentReport title="Extractor · Sets" report={equipmentV2Control('sets')[0] ?? null} />
  );
}
