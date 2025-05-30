import Image from 'next/image';
import StarLevelItem from '@/app/components/StarLevelItem';

type EquipmentCardProps = {
    data: {
        type: 'Weapon' | 'Accessary' | 'Helmet' | 'Gloves' | 'Armor' | 'Shoes';
        rarity: 'normal' | 'superior' | 'epic' | 'legendary';
        star: number;
        reforge: number;
        tier: number | null;
        level: number | null;
        class: 'ranger' | 'striker' | 'healer' | 'defender' | 'mage' | null;
        effect: number | null;
    };
};

export default function EquipmentCardInline({ data }: EquipmentCardProps) {
    const realStar = data.star - data.reforge;
    const stars = <StarLevelItem orange={data.reforge} yellow={realStar} size={18} />;
    const effet = data.effect !== null ? String(data.effect).padStart(2, '0') : null;

    return (
        <div className="relative w-[96px] h-[96px] rounded-md">
            <div className="relative w-[96px] h-[96px] rounded-md">
                {/* Background */}
                <div className="absolute inset-0 z-0">
                    <Image
                        src={`/images/bg/CT_Slot_${data.rarity}.webp`}
                        alt="background"
                        fill
                        sizes="96px"
                        className="object-cover"
                    />
                </div>

                {/* Equipment image */}
                <Image
                    src={`/images/equipment/TI_Equipment_${data.type}_0${data.star}.webp`}
                    alt="equipment"
                    fill
                    sizes="96px"
                    className="relative z-10 object-contain"
                />

                {/* Stars */}
                <div className="absolute bottom-1 left-0 w-full z-20 inline-flex justify-center items-center">
                    {stars}
                </div>

                {/* effect icon */}
                {effet && (
                    <div className="absolute top-2 right-2 z-20 translate-x-1/3 -translate-y-1/3">
                        <Image
                            src={
                                ['Helmet', 'Gloves', 'Armor', 'Shoes'].includes(data.type)
                                    ? `/images/ui/effect/TI_Icon_Set_Enchant_${effet}.webp`
                                    : `/images/ui/effect/TI_Icon_UO_${data.type}_${effet}.webp`
                            }
                            alt="Effect"
                            width={24}
                            height={24}
                            style={{ width: 24, height: 24 }}
                        />
                    </div>
                )}


                {/* Class icon */}
                {data.class && (
                    <div className="absolute right-2 top-8 -translate-y-1/3 z-20 translate-x-1/3">
                        <Image
                            src={`/images/ui/class/${data.class}.webp`}
                            alt="Class"
                            width={24}
                            height={24}
                            style={{ width: 24, height: 24 }}
                        />
                    </div>
                )}

                {/* Tier */}
                {data.tier !== null && (
                    <div className="absolute top-12 left-0 z-30 italic font-bold text-white px-1 rounded">
                        T{data.tier}
                    </div>
                )}

                {/* Level */}
                {data.level !== null && (
                    <div
                        className="absolute top-13 right-0 z-30 text-xs text-white px-1"
                        style={{
                            background: 'linear-gradient(to left, rgba(0,0,0,1), rgba(0,0,0,0))'
                        }}
                    >
                        +{data.level}
                    </div>
                )}
            </div>
        </div>
    );
}
