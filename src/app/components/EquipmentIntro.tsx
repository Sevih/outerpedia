import { useState } from 'react';
import Image from 'next/image';
import StarLevelItem from '@/app/components/StarLevelItem';

const highlightable = [
    { key: 'stars', label: 'Star Level: from 1★ yellow star to 6★ yellow' },
    { key: 'reforge', label: 'Reforge Level: from 1★ orange to 6★ orange' },
    { key: 'rarity', label: 'Grade: Normal, Superior, Epic, Legendary' },
    { key: 'upgrade', label: 'Upgrade Level: from 0 to +10' },
    { key: 'tier', label: 'Breakthrough: from T0 to T4' },
    { key: 'set', label: 'Set Effect or Unique Effect' },
    { key: 'class', label: 'Class restriction (Legendary weapons & accessories)' }
];

function OverlayBox({ className = '' }: { className?: string }) {
    return <div className={`absolute z-40 animate-pulse border-2 border-white rounded bg-yellow-300/30 ${className}`} />;
}

export default function EquipmentIntro() {
    const [hovered, setHovered] = useState<string | null>(null);

    return (
        <div className="flex gap-4">
            <ul className="list-disc list-inside space-y-1">
                {highlightable.map(({ key, label }) => (
                    <li
                        key={key}
                        className="cursor-pointer transition-opacity"
                        onMouseEnter={() => setHovered(key)}
                        onMouseLeave={() => setHovered(null)}
                    >
                        {label}
                    </li>
                ))}
            </ul>
            <div className="relative w-[96px] h-[96px] rounded-md shadow-lg overflow-hidden">
                {/* Card image layer */}
                <div className="relative w-full h-full transition-all duration-300">
                    {/* Background (grayed or not) */}
                    <div className={`absolute inset-0 z-0 transition-all duration-300 ${hovered && hovered !== 'rarity' ? 'grayscale opacity-50' : ''}`}>
                        <Image
                            src="/images/ui/bg_item_leg.webp"
                            alt="background"
                            fill
                            sizes="96px"
                            className="object-cover"
                        />
                    </div>

                    <Image
                        src="/images/equipment/regular_sword.png"
                        alt="regular_sword"
                        fill
                        sizes="96px"
                        className={`relative z-10 object-contain transition-all duration-300 ${hovered ? 'grayscale opacity-50' : ''}`}
                    />
                    <div className={`absolute bottom-1 left-1 inline-flex items-center z-20 w-full transition-all duration-300 ${hovered && hovered !== 'stars' && hovered !== 'reforge' ? 'grayscale opacity-50' : ''}`}>
                        <StarLevelItem orange={2} yellow={4} size={18} />
                    </div>
                    <div className={`absolute top-2 right-2 z-20 translate-x-1/3 -translate-y-1/3 transition-all duration-300 ${hovered && hovered !== 'set' ? 'grayscale opacity-50' : ''}`}>
                        <Image
                            src="/images/ui/effect/TI_Icon_UO_Weapon_08.webp"
                            alt="Effect"
                            width={24}
                            height={24}
                            style={{ width: 24, height: 24 }}
                        />
                    </div>
                    <div className={`absolute right-2 top-8 -translate-y-1/3 z-20 translate-x-1/3 transition-all duration-300 ${hovered && hovered !== 'class' ? 'grayscale opacity-50' : ''}`}>
                        <Image
                            src="/images/ui/class/ranger.webp"
                            alt="Class"
                            width={24}
                            height={24}
                            style={{ width: 24, height: 24 }}
                        />
                    </div>
                    <div className={`absolute top-12 left-0 z-30 italic font-bold text-white px-1 rounded transition-all duration-300 ${hovered && hovered !== 'tier' ? 'grayscale opacity-50' : ''}`}>
                        T1
                    </div>
                    <div
                        className={`absolute top-13 right-0 z-30 text-xs text-white px-1 transition-all duration-300 ${hovered && hovered !== 'upgrade' ? 'grayscale opacity-50' : ''}`}
                        style={{
                            background: 'linear-gradient(to left, rgba(0,0,0,1), rgba(0,0,0,0))'
                        }}
                    >
                        +4
                    </div>
                </div>

                {/* Highlight overlays */}
                {hovered === 'stars' && <OverlayBox className="bottom-1 h-5 w-full" />}
                {hovered === 'reforge' && <OverlayBox className="bottom-1 left-1 h-5 w-8" />}
                {hovered === 'upgrade' && <OverlayBox className="right-0 top-12.5 w-7 h-5" />}
                {hovered === 'tier' && <OverlayBox className="top-12 left-0 right-0 w-8 h-6" />}
                {hovered === 'class' && <OverlayBox className="right-0 top-5.5 w-6 h-7" />}
                {hovered === 'set' && <OverlayBox className="right-0 top-0 w-6 h-6" />}
            </div>
        </div>
    );
}
