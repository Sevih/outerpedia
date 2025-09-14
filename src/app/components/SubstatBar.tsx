type SubstatBarProps = {
  yellow: number;
  orange?: number;
};

export default function SubstatBar({ yellow, orange=0 }: SubstatBarProps) {
  return (
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
  );
}
