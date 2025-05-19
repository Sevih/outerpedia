'use client';

import EquipmentInlineTag from '@/app/components/EquipmentInlineTag';

type GearItem = {
    name: string;
    type: 'Weapon' | 'Amulet' | 'Set';
    count: number;
};

export default function InlineBarList({
    data,      // top 10
    allData,   // tous les items (pour %)
    type,
}: {
    data: GearItem[];
    allData: GearItem[];
    type: 'weapon' | 'amulet' | 'set';
}) {
    const max = Math.max(...data.map((d) => d.count));
    const total = allData.reduce((sum, item) => sum + item.count, 0);

    return (
        <div className="space-y-3 w-full max-w-[800px] mx-auto">
            {data
                .filter((item) => item.count > 0)
                .map((item) => {
                    const usagePercent = total === 0 ? 0 : (item.count / total) * 100;

                    return (
                        <div key={item.name} className="flex items-center gap-3">
                            <div className="w-90 text-center text-sm">
                                <EquipmentInlineTag name={item.name} type={type} />
                            </div>

                            <div className="relative w-full max-w-[500px] bg-neutral-700 rounded h-8 overflow-hidden">
                                <div
                                    className="h-full rounded bg-[#24359c] flex justify-end items-center pr-2"
                                    style={{ width: `${(item.count / max) * 100}%` }}
                                >
                                    <span className="text-white text-xs font-semibold drop-shadow-sm">
                                        {Math.round(usagePercent)}% ({item.count})
                                    </span>
                                </div>
                            </div>
                        </div>
                    );
                })}
        </div>
    );
}
