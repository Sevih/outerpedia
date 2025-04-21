import Image from "next/image";
import stats from "@/data/stats.json";

export default function StatIconsRow({ statsList }: { statsList: string[] }) {
  return (
    <div className="flex flex-col items-center gap-2 mt-2">
      <p className="text-yellow-300 font-semibold text-sm">Main Stats</p>
      <div className="flex justify-center flex-wrap gap-2">
        {statsList.map((stat, i) => {
          const data = stats[stat as keyof typeof stats];
          if (!data) return null;
          return (
            <div
              key={i}
              className="relative group"
              title={data.label}
            >
              <Image
                src={`/images/ui/effect/${data.icon}`}
                alt={data.label}
                width={28}
                height={28}
                style={{ width: 28, height: 28 }}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
