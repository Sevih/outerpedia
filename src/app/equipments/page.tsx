import type { Metadata } from "next";
import { getTenantServer } from '@/tenants/tenant.server'
import { Suspense } from 'react'
import EquipmentsClient from "./EquipmentsClient";
import weapons from "@/data/weapon.json";
import accessories from "@/data/amulet.json";
import talismans from "@/data/talisman.json";
import sets from "@/data/sets.json";
import eeData from "@/data/ee.json";

export const metadata: Metadata = {
  title: "Equipments – Outerpedia",
  description: "Browse all equipment in Outerplane.",
  keywords: ["Outerplane", "Equipments", "Gear", "Stats", "Builds", "Outerpedia"],
  alternates: {
    canonical: "https://outerpedia.com/equipments",
  },
  openGraph: {
    title: "Equipments – Outerpedia",
    description: "Browse all equipment in Outerplane.",
    url: "https://outerpedia.com/equipments",
    type: "website",
    images: [
      {
        url: "https://outerpedia.com/images/ui/nav/CM_Lobby_Button_Inventory.png",
        width: 150,
        height: 150,
        alt: "Outerpedia Equipments",
      },
    ],
  },
  twitter: {
    card: "summary",
    title: "Equipments – Outerpedia",
    description: "Browse all equipment in Outerplane.",
    images: ["https://outerpedia.com/images/ui/nav/CM_Lobby_Button_Inventory.png"],
  },
};

export default async function EquipmentsPage() {
  const { key: langKey } = await getTenantServer()

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "VideoGame",
    "name": "Outerplane",
    "url": "https://outerpedia.com/",
    "description": "Outerpedia is a fan-made encyclopedia for the mobile RPG Outerplane. Browse equipments, characters, sets and more.",
    "hasPart": [
      ...weapons.map(w => ({
        "@type": "CreativeWork",
        "name": w.name,
        "image": `https://outerpedia.com/images/equipment/${w.image}`
      })),
      ...accessories.map(a => ({
        "@type": "CreativeWork",
        "name": a.name,
        "image": `https://outerpedia.com/images/equipment/${a.image}`
      })),
      ...sets.map((s, i) => {
        const variants = ["Helmet", "Armor", "Gloves", "Shoes"];
        const variant = variants[i % variants.length];
        return {
          "@type": "CreativeWork",
          "name": s.name,
          "image": `https://outerpedia.com/images/equipment/TI_Equipment_${variant}_06.webp`
        };
      }),
      ...talismans.map(t => ({
        "@type": "CreativeWork",
        "name": t.name,
        "image": `https://outerpedia.com/images/equipment/TI_Equipment_Talisman_${t.icon}.webp`
      })),
      ...Object.entries(eeData).map(([charKey, ee]) => ({
        "@type": "CreativeWork",
        "name": ee.name,
        "image": `https://outerpedia.com/images/characters/ex/${charKey}.webp`
      }))
    ]
  }

  return (

    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Suspense fallback={<div>Loading...</div>}>
        <EquipmentsClient lang={langKey} />;
      </Suspense>
    </>
  )

}
