import Image from "next/image";

type Props = {
  icon: string;
  label: string;
};

export default function EffectLabel({ icon, label }: Props) {
  return (
    <div className="inline-flex items-center gap-2 bg-white/10 px-3 py-1 rounded-full text-sm text-white font-medium whitespace-nowrap mx-auto max-w-[180px] justify-center">
      <Image
        src={icon}
        alt={label}
        width={18}
        height={18}
        className="w-4 h-4 shrink-0"
        unoptimized
      />
      <span>{label}</span>
    </div>
  );
}
