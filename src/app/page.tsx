import HomeClient from './HomeClient'
import CurrentlyPullable from './components/CurrentlyPullable'
import WarningBanner from "@/app/components/WarningBanner"
import Image from 'next/image'
import Link from 'next/link'

const categories = [
  { name: 'Characters', path: '/characters' },
  { name: 'Equipments', path: '/equipments' },
  { name: 'Tier List', path: '/tierlist' },
  { name: 'Guides', path: '/guides' },
]

export default function Home() {
  return (
    <>
      <WarningBanner />

      <div className="flex flex-col md:flex-row justify-between gap-8 mb-16 px-4 md:px-16">
  {/* Colonne gauche : Bannière + Categories */}
  <div className="flex flex-col gap-8 w-full md:w-3/5">
    {/* Bannière */}
    <div className="rounded-xl overflow-hidden banner-og">
      <Image
        src="/images/ui/og_home.jpg"
        alt="Outerpedia OG"
        width={600}
        height={340}
        className="w-full h-auto object-contain"
        priority
      />
    </div>

    {/* Categories directement sous la bannière */}
    <section className="text-center">
  <h2 className="text-2xl font-extrabold tracking-wide text-white mb-6 relative">
    <span className="z-10 relative">Categories</span>
    <span className="absolute left-1/2 transform -translate-x-1/2 -bottom-1 w-24 h-1 bg-cyan-600 opacity-70 rounded" />
  </h2>

  <ul className="grid grid-cols-2 lg:grid-cols-4 gap-6 place-items-center">
    {categories.map((cat) => {
      const iconMap: Record<string, string> = {
        Characters: 'CM_Lobby_Button_Character.png',
        Equipments: 'CM_Lobby_Button_Inventory.png',
        'Tier List': 'CM_Lobby_Button_Misson.png',
        Guides: 'CM_Lobby_Button_Organization.png',
      }

      const icon = iconMap[cat.name] || ''

      return (
        <li key={cat.path} className="w-full max-w-[140px]">
          <Link href={cat.path}>
            <div className="flex flex-col items-center bg-gray-800 hover:bg-gray-700 p-4 rounded-2xl shadow-lg transition-transform transform hover:scale-105 cursor-pointer aspect-square">
              <div className="w-full h-full flex flex-col justify-center items-center">
                <Image
                  src={`/images/ui/nav/${icon}`}
                  width={80}
                  height={80}
                  alt={cat.name}
                  className="object-contain mb-2"
                  unoptimized
                />
                <span className="text-md font-semibold text-white">{cat.name}</span>
              </div>
            </div>
          </Link>
        </li>
      )
    })}
  </ul>
</section>

  </div>

  {/* Colonne droite : Pullable + Discord */}
  <div className="flex flex-col gap-6 w-full md:w-2/5">
    <CurrentlyPullable />
  </div>
</div>

{/* Et ensuite tu continues avec ton HomeClient() */}
<HomeClient />
    </>
  )
}
