import Image from "next/image";

type Props = {
  icon: string;
  label: string;
};

export default function EffectLabel({ icon, label }: Props) {
  return (
    <div className="inline-flex items-center gap-2 bg-white/10 px-3 py-1 rounded-full text-sm text-white font-medium whitespace-nowrap mx-auto max-w-[180px] justify-center">
<div className="relative w-[18px] h-[18px]">
<Image
src={icon}
alt={label}
fill
className="w-4 h-4 shrink-0"
sizes="18px"                
/>
</div>
      <span>{label}</span>
    </div>
  );
}
