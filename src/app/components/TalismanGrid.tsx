import TalismanCard from "./TalismanCard";
import type { Talisman } from "@/types/equipment";
import { getTenantServer } from "@/tenants/tenant.server";



type Props = {
  talismans: Talisman[];
};


export default async function TalismanGrid({ talismans }: Props) {
  const { key: langKey } = await getTenantServer()

  return (
    <section className="flex flex-wrap gap-4 justify-center">
      {talismans.map((t, i) => (
        <TalismanCard
          key={`${t.name}-${i}`}
          talisman={t}
          langue={langKey}
        />
      ))}
    </section>
  )
}
