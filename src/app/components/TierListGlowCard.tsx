import Link from 'next/link'
import GlowFrame from './GlowFrame'
import Image from 'next/image'

type Props = {
  href: string
  title: string
  description: string
  image: string
  type: 'pve' | 'pvp'
}

export function TierListGlowCard({ href, title, description, image, type }: Props) {
  const glowShort = type === 'pve' ? 'blue' : 'red'

  return (
    <Link
      href={href}
      className="relative group overflow-hidden rounded-2xl shadow-xl hover:scale-[1.02] transition-all duration-300"
    >
      <div className="relative z-10 flex flex-col items-center text-center gap-4">
        {/* Cadre + GlowFrame imbriqués */}
        <div className="relative w-[130px] h-[180px]">
          <Image
            src="/images/ui/CLG_Ruins_Frame.png"
            alt="back Frame"
            fill
            priority
            className="object-contain z-0 pointer-events-none select-none"
          />
          <div className="absolute inset-0 flex items-center justify-center z-10">
            <GlowFrame src={image} alt={title} color={glowShort} size={70} />
          </div>
        </div>

        <h2 className="text-xl font-semibold text-white">{title}</h2>
        <p className="text-gray-300 text-sm">{description}</p>
      </div>
    </Link>
  )
}
