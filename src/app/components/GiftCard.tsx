'use client'

import ItemInlineDisplay from '@/app/components/ItemInline'

const giftMap: Record<string, string[]> = {
    Science: ["USB Drive", "Portable Gaming Device", "Smartphone", "Dungeon Core Fragment"],
    Luxury: ["Collector's Coin", "Elegant Teacup", "Decorative Chest Armor", "Noble's Ceremonial Sword"],
    'Magic Tool': ["Mana Potion", "Fay Dust", "Witch's Cauldron", "Magic Textbook"],
    Craftwork: ["Paper Crane", "Crystal Orb", "Lion Statue", "Dreamcatcher"],
    'Natural Object': ["Berry", "Wildflower", "Phantom Bird's Egg", "Leaf of World Tree"]
}

type Props = {
    category: keyof typeof giftMap
}

export default function GiftCard({ category }: Props) {
    const items = giftMap[category]

    return (
        <div className="grid grid-cols-2 gap-2 items-center w-fit">
            {items.map((name) => (
                <ItemInlineDisplay key={name} names={name} text={false} size={40} />
            ))}
        </div>
    )
}
