import { notFound } from 'next/navigation'
import characters from '@/data/characters.json'
import Image from 'next/image'
import type { Metadata } from 'next'
import classDataRaw from '@/data/class.json'
import type { ClassDataMap } from '@/types/types'
import { highlightKeywordsAndNumbers } from '@/utils/textHighlighter';
import WeaponMiniCard from "@/app/components/WeaponMiniCard"
import AccessoryMiniCard from "@/app/components/AccessoryMiniCard"
import rawWeapons from "@/data/weapon.json"
import rawAmulets from "@/data/amulet.json"
import SetMiniCard from "@/app/components/SetMiniCard"
import type { WeaponMini, AmuletMini, EquipmentBase } from "@/types/equipment"
import RecommendedGearTabs from "@/app/components/RecommendedGearTabs"


const weapons = rawWeapons as unknown as EquipmentBase[]
const amulets = rawAmulets as unknown as EquipmentBase[]
const classData = classDataRaw as ClassDataMap

type GearReference = { name: string; mainStat: string; usage?: string }

// Page de détails d'un personnage
export default async function CharacterDetailPage(params: { params: Promise<{ name: string }> }) {
  const name = (await params.params).name.toLowerCase()
  const character = characters.find((c) => c.name.toLowerCase() === name)

  if (!character) return notFound()

  const classInfo = classData[character.class as keyof typeof classData]
  const subclassInfo = classInfo?.subclasses?.[character.subclass as keyof typeof classInfo.subclasses]
  const statLabels = ["Health","Defense","Evasion", "Accuracy","Speed","Attack"]



  type GearReference = { name: string; mainStat: string; usage?: string }

function buildRecommendedMini<T extends EquipmentBase>(
  refs: GearReference[] | undefined,
  fullList: T[]
): T[] {
  return (
    refs
      ?.map(ref => {
        const item = fullList.find(i => i.name === ref.name)
        if (!item) return null

        return {
          ...item,
          forcedMainStat: ref.mainStat,
          ...(ref.usage ? { usage: ref.usage } : {}),
        } as T
      })
      .filter((x): x is T => x !== null) ?? []
  )
}

  
function renderRecommendedGearBlock(mode: 'PVE' | 'PVP') {
  if (!character) return null; // sécurité typescript
  const gear = mode === 'PVE' ? character.recommendedGearPVE : character.recommendedGearPVP

  const recommendedWeapons = buildRecommendedMini<WeaponMini>(gear?.Weapon, weapons)
  const recommendedAmulets = buildRecommendedMini<AmuletMini>(gear?.Amulet, amulets)

  return (
    <div className="mt-6">
      <h2 className="text-2xl font-bold text-white mb-4 text-center">Recommended Gear {mode}</h2>
      <div className="flex flex-col md:flex-row justify-center gap-10 text-center">
        
        {/* Armes */}
        <div className="flex flex-col items-center gap-2">
          <h3 className="text-lg font-semibold text-white mb-1">Weapons</h3>
          {recommendedWeapons.map((weapon, idx) => (
            <WeaponMiniCard key={`weapon-${mode}-${idx}`} weapon={weapon} />
          ))}
        </div>

        {/* Accessoires */}
        <div className="flex flex-col items-center gap-2">
          <h3 className="text-lg font-semibold text-white mb-1">Accessories</h3>
          {recommendedAmulets.map((amulet, idx) => (
            <AccessoryMiniCard key={`amulet-${mode}-${idx}`} accessory={amulet} />
          ))}
        </div>

        {/* Sets */}
        <div className="flex flex-col items-center">
          <h3 className="text-lg font-semibold text-white mb-1">Sets</h3>
          <div className="flex flex-wrap justify-center gap-4">
            {gear?.Set?.map((sets, idx) => (
              <SetMiniCard key={`set-${mode}-${idx}`} sets={sets} />
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}

  return (
    <div className="max-w-5xl mx-auto p-6">
      {/* Partie haute : illustration + infos principales */}
      <div className="grid grid-cols-1 md:grid-cols-[400px_1fr] gap-6">
        {/* Illustration du personnage */}
        <div className="relative rounded overflow-hidden shadow">
          <Image
            src={`/images/characters/full/IMG_${character.id}.png`} 
            alt={character.name}
            width={360}
            height={400}
            priority
            style={{ width: 360, height: 400 , maxHeight:400,maxWidth:360}}
            className="object-contain"
          />
        </div>

        {/* Détails à droite : nom, rareté, classe, etc. */}
        <div className="space-y-4">
          <h1 className="text-4xl font-bold text-white mb-2">{character.name}</h1>

          {/* Rareté sous forme d'étoiles */}
          <div className="flex items-center gap-2">
            {[...Array(character.rarity)].map((_, i) => (
              <Image
                key={i}
                src="/images/ui/star.png"
                alt="star"
                width={20}
                height={20}
                style={{ width: 20, height: 20 }}
              />
            ))}
          </div>

          {/* Élément, Classe, Sous-classe */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <Image src={`/images/ui/elem/${character.element.toLowerCase()}.png`} alt={character.element} width={24} height={24} style={{ width: 24, height: 24 }} />
              <span className="text-base">{character.element}</span>
            </div>
            <div className="flex items-center gap-1">
              <Image src={`/images/ui/class/${character.class.toLowerCase()}.png`} alt={character.class} width={24} height={24} style={{ width: 24, height: 24 }} />
              <span className="text-base">{character.class}</span>
            </div>
            <div className="flex items-center gap-1">
              <Image src={`/images/ui/class/${character.subclass.toLowerCase()}.png`} alt={character.subclass} width={24} height={24} style={{ width: 24, height: 24 }} />
              <span className="text-base">{character.subclass}</span>
            </div>
          </div>

          {/* Statistiques (diagramme) + descriptions de classe */}
          <div className="grid grid-cols-1 md:grid-cols-[220px_1fr] gap-4">
            <div className="relative p-2 rounded text-sm w-fit h-fit">
              {subclassInfo?.image ? (
                <div className="relative mx-auto">
                  <Image
                    src={subclassInfo.image}
                    alt={character.subclass}
                    width={200} 
                    height={200} 
                    style={{ width: 200, height: 200 }}
                    className="object-contain"
                  />
                  {statLabels.map((label, index) => {
                    const angle = (index / statLabels.length) * 2 * Math.PI - Math.PI / 2
                    let labelRadius = 120
                    if (label === "Health" || label === "Accuracy") labelRadius = 110
                    const x = 100 + Math.cos(angle) * labelRadius
                    const y = 100 + Math.sin(angle) * labelRadius
                    return (
                      <div
                        key={index}
                        className="absolute text-[12px] text-center text-white whitespace-nowrap"
                        style={{ left: `${x}px`, top: `${y}px`, transform: 'translate(-50%, -50%)' }}
                      >
                        {label}
                      </div>
                    )
                  })}
                </div>
              ) : (
                <p>No subclass image found.</p>
              )}
            </div>

            <div className="flex flex-col gap-4">
              <div className="p-2 rounded text-sm">
                <p className="font-semibold">Class Effects : {character.class} </p>
                <p className="whitespace-pre-line">{classInfo?.description || 'No class description found.'}</p>
              </div>
              <div className="p-2 rounded text-sm">
                <p className="font-semibold">Subclass description : {character.subclass}</p>
                <p>{subclassInfo?.description || 'No subclass description found.'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Section des 3 skills */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
        {character.skills?.slice(0, 3).map((skill, index) => (
          <div key={index} className="p-4 rounded text-white">            
            <div className="flex items-start gap-2 mb-2">
              {/* Icône de skill avec éventuel badge B */}
              <div className="relative w-12 h-12">
                <Image
                  src={`/images/characters/skills/Skill_${getSkillLabel(index)}_${character.id}.png`} 
                  alt={skill.name}
                  width={48} 
                  height={48} 
                  style={{ width: 48, height: 48 }}
                  className="rounded object-contain"
                />
                {skill.burnEffect && skill.burnEffect.length > 0 && (
                  <div className="absolute top-0 left-0 bg-black text-white text-xs font-bold px-1 rounded-full border border-white">
                    B
                  </div>
                )}
              </div>

              {/* Nom du skill + WGR + cooldown */}
              <div>
                <p className="text-lg font-semibold">{skill.name}</p>
                <p className="text-sm text-gray-400 italic mb-1">
                  Weakness Gauge Reduction : {skill.wgr ?? '—'}<br />
                  Cooldown : {skill.cooldown ? `${skill.cooldown} turn(s)` : '—'}
                </p>
              </div>
            </div>
            {/* Description avec colorisation */}
            <p className="text-sm text-gray-200 whitespace-pre-line">
              {highlightKeywordsAndNumbers(skill.description)}
            </p>
          </div>
        ))}

        {/* Blocs vides s'il y a moins de 3 skills */}
        {Array.from({ length: 3 - (character.skills?.length || 0) }).map((_, i) => (
          <div key={`empty-${i}`} className="bg-gray-800 p-4 rounded text-center text-gray-500">
            No Skill
          </div>
        ))}
      </div>

      {/* Section burn + chain/dual attack */}
      <div className="flex flex-col lg:flex-row gap-6 mt-6">
        {/* Affichage des effets de burn sous forme de cartes */}
        <div className="flex-1 p-2 rounded text-white">
          {(() => {
            const skillWithBurn = character.skills?.find(s => s.burnEffect && s.burnEffect.length > 0);
            if (!skillWithBurn) {
              return <p className="text-gray-400">Burn effect placeholder.</p>;
            }

            return (
              <div className="flex flex-row gap-1">
                {skillWithBurn.burnEffect.map((burn, index) => (
                  <div
                    key={index}
                    className="relative w-[185px] h-[262px] bg-cover bg-center rounded overflow-hidden text-white transform transition-transform duration-200 hover:scale-105 hover:shadow-lg hover:ring-[1px] hover:ring-yellow-400 hover:ring-offset-[0.2px] cursor-pointer"
                    style={{ backgroundImage: `url(/images/ui/Burst${burn.level}.png)` }}
                  >
                    {/* Coût en haut à droite */}
                    <div
                      className="absolute top-2.5 right-2.5 text-[15px] font-bold rounded-full flex items-center justify-center"
                      style={{ width: '26px', height: '26px' }}
                    >
                      {burn.cost}
                    </div>

                    {/* Texte d'effet centré dans la zone noire */}
                    <div
                      className="absolute text-center text-[11px] leading-snug text-white drop-shadow-md"
                      style={{
                        top: '135px',
                        left: '12.5px',
                        width: '160px',
                        height: '90px',
                        overflow: 'hidden',
                        display: '-webkit-box',
                        WebkitBoxOrient: 'vertical',
                        WebkitLineClamp: 3,
                      }}
                    >
                      <div className="flex items-center justify-center w-full h-full px-2">
                        {burn.effect}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            );
          })()}
        </div>
        {/* Section chain/dual attack */}
        <div className="flex-1 p-4 rounded text-white flex flex-col gap-6">
          {/* Bloc Chain Attack */}
          <div className="flex gap-4 items-start">
            <div className="w-16 h-16 shrink-0">
              <Image
                src={`/images/characters/chain/Skill_ChainPassive_${character.element}_${character.type_chain}.png`}
                alt={`Chain icon for ${character.element} ${character.type_chain}`}
                width={64}
                height={64}
                className="object-contain"
              />
            </div>
            <div>
              <p className="font-semibold mb-1">Chain {character.type_chain || '—'} Effect</p>
              <p className="text-sm text-gray-400 italic mb-1">Weakness Gauge Reduction : {character.chain_wgr || '—'}</p>
              <p className="text-sm text-gray-200">
                {highlightKeywordsAndNumbers(character.chain_effect ?? '') || '—'}
              </p>
            </div>
          </div>

            {/* Bloc Dual Attack */}
            <div className="flex gap-4 items-start">
              <div className="w-16 h-16 shrink-0">
                <Image
                  src={`/images/characters/chain/Skill_ChainPassive_${character.element}_Join.png`}
                  alt={`Dual icon for ${character.element}`}
                  width={64}
                  height={64}
                  className="object-contain"
                />
              </div>
              <div>
                <p className="font-semibold mb-1">Dual Attack Effect</p>
                <p className="text-sm text-gray-400 italic mb-1">Weakness Gauge Reduction : {character.dual_wgr || '—'}</p>
                <p className="text-sm text-gray-200">
                  {highlightKeywordsAndNumbers(character.dual_effect ?? '') || '—'}
                </p>
              </div>
            </div>
          </div>
          </div>
      
          <RecommendedGearTabs
  character={character}
  weapons={weapons}
  amulets={amulets}
/>










      {/* Section vidéo */}
      <div className="w-full rounded overflow-hidden mt-6" style={{ height: '450px' }}>
        <iframe
          className="w-full h-full"
          src={`https://www.youtube.com/embed/${character.video}`}
          title={`Skill video of ${character.name}`}
          style={{ border: 'none' }}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        ></iframe>
      </div>
    </div>
  )
}

export async function generateMetadata(props: { params: Promise<{ name: string }> }): Promise<Metadata> {
  const params = await props.params;
  const name = params.name.toLowerCase();
  const character = characters.find((c) => c.name.toLowerCase() === name);

  if (!character) {
    return { title: 'Outerpedia' };
  }

  const title = `${character.name} - Outerpedia`;
  const description = `View chracter details for ${character.name}, a ${character.class} (${character.subclass}) in Outerplane.`;
  const image = `https://outerpedia.com${character.fullArt}`;
  const url = `https://outerpedia.com/characters/${character.name.toLowerCase()}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url,
      type: 'website',
      images: [
        {
          url: image,
          width: 360,
          height: 400,
          alt: character.name,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [image],
    },
  };
}

function getSkillLabel(index: number): string {
  return ["First", "Second", "Ultimate"][index] || `Skill ${index + 1}`;
}