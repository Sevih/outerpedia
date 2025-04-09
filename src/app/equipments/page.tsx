import type { Metadata } from "next";
import EquipmentsClient from "./EquipmentsClient";

export const metadata: Metadata = {
  title: "Outerpedia - Equipments",
};

export default function EquipmentsPage() {
  return <EquipmentsClient />;
}
