'use client'
import Link from 'next/link'
import Image from 'next/image' // 👈 Ajout de l'import

const categories = [
  { name: 'Characters', path: '/characters' },
  { name: 'Equipment', path: '/equipment' },
  { name: 'Tier List', path: '/tierlist' },
  { name: 'Guides', path: '/guides' },
]

export default function Home() {
  return (
    <div className="space-y-12">
      
      <section className="text-center">
        <h1 className="text-5xl font-bold mb-2">Welcome to Outerpedia</h1>
        <p className="text-gray-400">Your ultimate Outerplane companion wiki</p>
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-4">Categories</h2>
        <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {categories.map((cat) => (
            <li key={cat.path}>
              <Link href={cat.path}>
                <div className="bg-gray-800 hover:bg-gray-700 p-6 rounded-xl text-center shadow-lg transition cursor-pointer">
                  <span className="text-xl font-medium">{cat.name}</span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </section>
       
      <section>
        <h2 className="text-2xl font-semibold mb-4">Current Banners</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Image
            src="/images/banners/ryu_lion.jpg"
            alt="Ryu Lion"
            width={600}
            height={300}
            className="rounded-xl shadow-lg object-cover w-full h-auto"
          />
          <Image
            src="/images/banners/bell_cranel.jpg"
            alt="Bell Cranel"
            width={600}
            height={300}
            className="rounded-xl shadow-lg object-cover w-full h-auto"
          />
        </div>
      </section>
    </div>
  )
}
