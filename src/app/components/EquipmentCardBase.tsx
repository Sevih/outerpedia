import Image from "next/image";

type Props = {
  iconPath: string;
  iconEffect?: string;
  classIcon?: string;
  name: string;
  subtitle?: string;
  description?: string;
};

export default function EquipmentCardBase({
  iconPath,
  iconEffect,
  classIcon,
  name,
  subtitle,
  description,
}: Props) {
  return (
    <div className="relative bg-white/5 p-4 rounded-2xl shadow flex flex-col items-center text-center gap-2 max-w-sm w-[110px]">
      <div className="relative w-[80px] h-[80px]">
        <Image
          src="/images/ui/bg_item_leg.png"
          alt="background"
          fill
          className="absolute inset-0 z-0"
        />
        <Image
          src={iconPath}
          alt={name}
          fill
          className="relative z-10 object-contain"
          unoptimized
        />
        {iconEffect && (
          <div className="absolute top-0 right-0 z-20 translate-x-1/3 -translate-y-1/3">
            <Image
              src={iconEffect}
              alt="Effect"
              width={28}
              height={28}
              unoptimized
            />
          </div>
        )}
        {classIcon && (
          <div className="absolute top-0 left-0 z-20 -translate-x-1/3 -translate-y-1/3">
            <Image
              src={classIcon}
              alt="Class"
              width={28}
              height={28}
              unoptimized
            />
          </div>
        )}
      </div>
      <h3 className="text-sm font-semibold mt-2">{name}</h3>
      {subtitle && <div className="text-xs text-white/70">{subtitle}</div>}
      {description && <p className="text-xs text-white/80">{description}</p>}
    </div>
  );
}
