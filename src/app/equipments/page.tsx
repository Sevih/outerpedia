import type { Metadata } from "next";
import EquipmentsClient from "./EquipmentsClient";

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

export default function EquipmentsPage() {
  return <EquipmentsClient />;
}
