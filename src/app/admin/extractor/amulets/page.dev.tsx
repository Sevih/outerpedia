import { EquipmentReport } from '@/components/admin/EquipmentReport';
import { equipmentV2Control } from '@/lib/admin/equipment-control';

export const dynamic = 'force-dynamic';

export default function Page() {
  return (
    <EquipmentReport title="Extractor · Amulet" report={equipmentV2Control('amulets')[0] ?? null} />
  );
}
