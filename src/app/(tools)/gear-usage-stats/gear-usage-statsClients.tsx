'use client';
import { useRef, useEffect, useState } from "react";
import Image from "next/image";
import EquipmentInlineTag from '@/app/components/EquipmentInlineTag';
import InlineBarList from '@/app/components/InlineBarList';
import CharacterInlineStacked from '@/app/components/CharacterInlineStacked'
import Link from 'next/link'

type GearItem = {
    name: string;
    type: 'Weapon' | 'Amulet' | 'Set';
    class: string | null;
    count: number;
    characters: string[];
};

const tabList = [
    { key: "Set", label: "Sets", icon: "armor.webp" },
    { key: "Weapon", label: "Weapons", icon: "weapon.webp" },
    { key: "Amulet", label: "Amulets", icon: "accessory.webp" },
] as const;

const CLASSES = ['Striker', 'Defender', 'Ranger', 'Healer', 'Mage'] as const;

export default function GearUsageStatsClients({ data }: { data: GearItem[] }) {
    const [activeTab, setActiveTab] = useState<'Set' | 'Weapon' | 'Amulet'>('Set');
    const [classFilter, setClassFilter] = useState<string[]>([]);

    const indicatorRef = useRef<HTMLDivElement>(null);
    const [activeTabRef, setActiveTabRef] = useState<HTMLButtonElement | null>(null);

    useEffect(() => {
        if (activeTabRef && indicatorRef.current) {
            const { offsetLeft, offsetWidth } = activeTabRef;
            indicatorRef.current.style.left = `${offsetLeft}px`;
            indicatorRef.current.style.width = `${offsetWidth}px`;
        }
    }, [activeTabRef]);

    const filtered = data.filter(item => item.type === activeTab);

    const filteredByClass =
        activeTab === 'Set'
            ? filtered
            : classFilter.length === 0
                ? filtered
                : filtered.filter(item =>
                    item.class === null || classFilter.includes(item.class)
                );

    const top10: GearItem[] = [...filteredByClass].sort((a, b) => b.count - a.count).slice(0, 5);



    return (

        
        <div className="p-4 max-w-5xl mx-auto">
            <p className="text-red-500 font-semibold bg-red-100 border border-red-300 rounded px-4 py-2 text-center">
                The statistics below are based on <strong>Evamains</strong> recommended builds only.  <br />
                <strong> A 0 count doesn&apos;t mean the item is bad</strong>, just that it hasn&apos;t been included in current recommendations.
            </p>

{/* Flèche retour */}
        <div className="relative top-4 left-4 z-20 h-[32px] w-[32px]">
          <Link href={`/tools`} className="relative block h-full w-full">
            <Image
              src="/images/ui/CM_TopMenu_Back.webp"
              alt="Back"
              fill
              sizes='32px'
              className="opacity-80 hover:opacity-100 transition-opacity"
            />
          </Link>
        </div>


            {/* Onglets stylés */}
            <div className="relative flex justify-center mb-6 mt-4">
                <div className="relative bg-gray-100 dark:bg-gray-800 rounded-full p-1 flex gap-1 min-w-[300px]">
                    {/* Barre animée */}
                    <div
                        ref={indicatorRef}
                        className="absolute top-1 left-0 h-[calc(100%-0.5rem)] bg-cyan-500 rounded-full transition-all duration-300 z-0"
                    ></div>

                    {tabList.map(({ key, label, icon }) => (
                        <button
                            key={key}
                            onClick={() => {
                                setActiveTab(key);
                                setClassFilter([]);
                            }}
                            ref={el => {
                                if (activeTab === key) setActiveTabRef(el);
                            }}
                            className={`relative z-10 px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2 transition-colors duration-300 ${activeTab === key
                                ? "text-white"
                                : "text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700"
                                }`}
                        >
                            <div className="relative w-[24px] h-[24px]">
                                <Image
                                    src={`/images/ui/nav/${icon}`}
                                    alt={label}
                                    fill
                                    className="object-contain"
                                    sizes="24px"
                                />
                            </div>
                            <span className="inline">{label}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Filtres de classe */}
            {activeTab !== 'Set' && (
                <div className="flex justify-center flex-wrap gap-2 mb-6">
                    <button
                        onClick={() => setClassFilter([])}
                        className={`border p-1 rounded ${classFilter.length === 0 ? "bg-cyan-500" : "bg-transparent"}`}
                    >
                        <span className="px-2 text-sm font-semibold text-white">All</span>
                    </button>

                    {CLASSES.map(cl => (
                        <button
                            key={cl}
                            onClick={() =>
                                setClassFilter(prev =>
                                    prev.includes(cl)
                                        ? prev.filter(c => c !== cl)
                                        : [...prev, cl]
                                )
                            }
                            className={`border p-1 rounded transition ${classFilter.includes(cl) ? "bg-cyan-500" : "bg-transparent"}`}
                        >
                            <div className="relative w-[24px] h-[24px]">
                                <Image
                                    src={`/images/ui/class/${cl.toLowerCase()}.webp`}
                                    alt={cl}
                                    fill
                                    className="object-contain"
                                    sizes="24px"
                                />
                            </div>
                        </button>
                    ))}
                </div>
            )}



            {/* Graphique */}
            <h2 className="text-lg font-semibold mb-2 text-center">
                Most Used {activeTab}s
            </h2>
            <div className="mb-10 h-[200px] w-full">
                <InlineBarList
                    data={top10}
                    allData={filteredByClass}
                    type={activeTab.toLowerCase() as 'weapon' | 'amulet' | 'set'}
                />
            </div>

            {/* Tableau */}
            <h2 className="text-lg font-semibold mb-2 text-center">
                Full {activeTab} List
            </h2>
            <table className="w-full text-sm border border-gray-300 rounded-md overflow-hidden shadow-md">
                <thead className="bg-neutral-900 text-white sticky top-0 z-10">
                    <tr>
                        <th className="text-left p-3">Name</th>
                        <th className="text-left p-3">Used by</th>
                        <th className="text-left p-3">Characters</th>
                    </tr>
                </thead>

                <tbody>
                    {filteredByClass.map((item, idx) => (
                        <tr
                            key={idx}
                            className="border-t border-neutral-700 even:bg-neutral-900 hover:bg-neutral-800 transition-colors"
                        >
                            {/* Name */}
                            <td className="p-3">
                                <EquipmentInlineTag
                                    name={item.name}
                                    type={activeTab.toLowerCase() as 'weapon' | 'amulet' | 'set'}
                                />
                            </td>

                            {/* Count */}
                            <td className="p-3 font-bold text-white">{item.count}</td>

                            {/* Characters */}
                            <td className="p-3">
                                <div className="grid gap-2 grid-cols-4 sm:grid-cols-6 md:grid-cols-8 xl:grid-cols-10">
                                    {item.characters.map((charName) => (
                                        <CharacterInlineStacked key={charName} name={charName} size={40} />
                                    ))}
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

        </div>
    );
}
