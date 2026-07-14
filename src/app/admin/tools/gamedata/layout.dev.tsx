import { GameDataTableList } from '@/components/admin/GameDataTableList';
import { listGameTables } from '@/lib/admin/gamedata-store';

export const dynamic = 'force-dynamic';

export default function GameDataLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex gap-4">
      <GameDataTableList tables={listGameTables()} />
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
