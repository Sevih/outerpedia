import Image from 'next/image';
import stats from '@/data/stats.json';

const statValues: Record<string, string[]> = {
  ATK: ['40', '80', '120', '160', '200', '240'],
  'ATK%': ['4%', '8%', '12%', '16%', '20%', '24%'],
  DEF: ['40', '80', '120', '160', '200', '240'],
  'DEF%': ['4%', '8%', '12%', '16%', '20%', '24%'],
  HP: ['73', '146', '219', '292', '365', '438'],
  'HP%': ['3%', '6%', '9%', '12%', '15%', '18%'],
  CHC: ['3%', '6%', '9%', '12%', '15%', '18%'],
  CHD: ['4%', '8%', '12%', '16%', '20%', '24%'],
  SPD: ['3', '6', '9', '12', '15', '18'],
  EFF: ['2.5%', '5.0%', '7.5%', '10.0%', '12.5%', '15.0%'],
  RES: ['2.5%', '5.0%', '7.5%', '10.0%', '12.5%', '15.0%'],
  EVA: ['2%', '4%', '6%', '8%', '10%', '12%'],
  ACC: ['2%', '4%', '6%', '8%', '10%', '12%']
};

type SubstatSegmentProps = {
  stat: keyof typeof stats;
  yellow: number;
  orange: number;
};

export default function SubstatBarWithValue({ stat, yellow, orange }: SubstatSegmentProps) {
  const total = Math.min(yellow + orange, 6);
  const value = statValues[stat]?.[total - 1] ?? '?';
  const statMeta = stats[stat];

  return (
    <div className="w-fit">
      {/* Header row */}
      <div className="flex justify-between items-center mb-1">
        <span className="inline-flex items-center gap-1 text-white">
          <Image
            src={`/images/ui/effect/${statMeta.icon}`}
            alt={statMeta.label}
            width={18}
            height={18}
            className="object-contain"
          />
          {statMeta.label}
        </span>
        <span className="text-white text-sm">{value}</span>
      </div>

      {/* Bar */}
      <div className="flex gap-1">
        {Array.from({ length: 6 }).map((_, i) => {
          const color =
            i < yellow ? 'bg-yellow-400' :
            i < yellow + orange ? 'bg-orange-400' :
            'bg-gray-700';
          return (
            <div
              key={i}
              className={`h-2 rounded-sm ${color}`}
              style={{ width: '50px' }}
            />
          );
        })}
      </div>
    </div>
  );
}
