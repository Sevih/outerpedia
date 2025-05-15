import Image from "next/image";

type Props = {
  name: string;
  icon: string;
  icon_item:string;
  icon_effect: string;
  effect_name: string;
  effect: string;
  effect10: string;
};

export default function TalismanCard({
  name,
  icon,
  icon_item,
  icon_effect,
  effect_name,
  effect,
  effect10,
}: Props) {
  return (
    <div className="relative bg-white/5 p-4 rounded-2xl shadow flex flex-col items-center text-center gap-2 w-[260px]">

      {/* Zone image avec fond + icône + effet */}
      <div className="relative w-20 h-20">
        {/* Fond rouge */}
        <Image
          src="/images/ui/bg_item_leg.webp"
          alt="background"
          fill
          sizes="80px"
          className="absolute inset-0 z-0"
        />
        {/* Icône du talisman */}
        <Image
          src={`/images/equipment/TI_Equipment_Talisman_${icon}.webp`}
          alt={name}
          fill
          sizes="80px"
          className="relative z-10 object-contain"
        />
        {/* Icône d'effet en haut à droite */}
        <div className="absolute top-2 right-2 z-20 translate-x-1/3 -translate-y-1/3">
          <Image
            src={`/images/ui/effect/TI_Icon_UO_Talisman_${icon_item}.webp`}
            alt={effect_name}
            width={24}
            height={24}
          />
        </div>
      </div>

      {/* Infos texte */}
      <h3 className="text-lg font-semibold mt-2">{name}</h3>
      <div className="flex items-center gap-2">
        <Image
          src={`/images/ui/effect/Talisman_${icon_effect}.webp`}
          alt={effect_name}
          width={24}
          height={24}
          style={{ width: 24, height: 24 }}
        />
        <span className="text-sm">{effect_name}</span>
      </div>
      <p className="text-sm text-white/80">{effect}</p>
      {effect10 && (
        <p className="text-xs text-amber-300 mt-1 italic">Enhanced: {effect10}</p>
      )}
    </div>
  );
}
