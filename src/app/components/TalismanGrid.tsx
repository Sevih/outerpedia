import TalismanCard from "./TalismanCard";

type Talisman = {
  name: string;
  type: string;
  icon: string;
  icon_item: string;
  effect_name: string;
  effect: string;
  effect10: string;
  icon_effect: string;
  source: string | null;
  boss: string | null;
  mode: string | null;
};

type Props = {
  talismans: Talisman[];
};


export default function TalismanGrid({ talismans }: Props) {
  return (
    <section className="flex flex-wrap gap-4 justify-center">
      {talismans.map(t => (
        <TalismanCard
          key={t.name}
          name={t.name}
          icon_item={t.icon_item}
          icon={t.icon}
          icon_effect={t.icon_effect}
          effect_name={t.effect_name}
          effect={t.effect}
          effect10={t.effect10}
        />
      ))}
    </section>
  );
}
