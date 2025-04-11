import { notFound } from 'next/navigation'
import characters from '@/data/characters.json'
import Image from 'next/image'
import type { Metadata } from 'next'
import classDataRaw from '@/data/class.json'
import type { ClassDataMap } from '@/types/types'
import { highlightKeywordsAndNumbers } from '@/utils/textHighlighter'
import rawWeapons from "@/data/weapon.json"
import rawAmulets from "@/data/amulet.json"
import rawTalismans from "@/data/talisman.json"
import type { EquipmentBase } from "@/types/equipment"
import RecommendedGearTabs from "@/app/components/RecommendedGearTabs"
import BuffDebuffDisplay from '@/app/components/BuffDebuffDisplay'
import type { Character } from '@/types/character'
import type { Skill } from '@/types/character'
import type { Talisman } from "@/types/equipment"
import stats from '@/data/stats.json'
import TranscendenceSection  from "@/app/components/TranscendenceSection"
import YoutubeEmbed from '@/app/components/YoutubeEmbed'


const weapons = rawWeapons as unknown as EquipmentBase[]
const amulets = rawAmulets as unknown as EquipmentBase[]

const classData = classDataRaw as ClassDataMap
const talismans = rawTalismans as Talisman[] // ou EquipmentBase[] si tu n’as pas encore typé


export default async function CharacterDetailPage(params: { params: Promise<{ name: string }> }) {
  
  const name = (await params.params).name.toLowerCase()
  const character = characters.find((c) => c.name.toLowerCase() === name) as Character

  if (!character) return notFound()

  const classInfo = classData[character.class as keyof typeof classData]
  const subclassInfo = classInfo?.subclasses?.[character.subclass as keyof typeof classInfo.subclasses]
  const statLabels = ["Health","Defense","Evasion", "Accuracy","Speed","Attack"]
  const transcendData = character.transcend?.[0];
  
  // Fonction utilitaire à placer au-dessus du return :
  function renderMainStat(stat: string) {
    const [baseStat, elementPart] = stat.split('(').map((s: string) => s.trim())
    const statCode: string = baseStat.split(' ')[0]
    const statInfo = stats[statCode.toUpperCase() as keyof typeof stats]
  
    const elementMatch: RegExpMatchArray | null = elementPart?.match(/To:\s*(\w+)/i) ?? null
    const element: string | undefined = elementMatch?.[1]
  
    return (
      <div className="flex items-center gap-1 text-sm italic text-gray-400">
        {statInfo && (
          <Image
            src={`/images/ui/effect/${statInfo.icon}`}
            alt={statInfo.label}
            width={18}
            height={18}
            style={{ width: 18, height: 18 }}
            className="object-contain"
          />
        )}
        <span>Main Stat:</span>
        <span>{statInfo?.label ?? '—'}</span>
        {element && (
          <span className="flex items-center gap-1 ml-1">
            (
            <Image
              src={`/images/ui/elem/${element.toLowerCase()}.png`}
              alt={element}
              width={16}
              height={16}
              style={{ width: 16, height: 16 }}
              className="object-contain"
            />
            To: {element})
          </span>
        )}
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
  <div className="flex items-center gap-2 mb-2">
    <h1 className="text-4xl font-bold text-white">{character.name}</h1>
    {character.rank && (
      <Image
        src={`/images/ui/IG_Event_Rank_${character.rank}.png`}
        alt={`Rank ${character.rank}`}
        width={36}
        height={36}
        style={{ width: 36, height: 36 }}
        className="object-contain"
      />
    )}
  </div>


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

      {(Array.isArray(character.exclusifEquip) && character.exclusifEquip.length > 0) || transcendData ? (
  <div className="mt-8 text-white">
    <div className="flex flex-wrap gap-4 items-start">
      {/* Equipement Exclusif */}
      {Array.isArray(character.exclusifEquip) && character.exclusifEquip.length > 0 && character.exclusifEquip.map((eq, index) => (
        <div
          key={index}
          className="flex flex-col md:flex-row rounded p-4 shadow hover:shadow-lg transition relative w-full md:w-[500px] min-w-[320px]"
        >
          {/* Rang en haut à droite */}
          {eq.rank && eq.rank.trim() !== '' && (
  <div className="absolute top-5 left-4 z-10">
    <Image
      src={`/images/ui/IG_Event_Rank_${eq.rank}.png`}
      alt={`Rank ${eq.rank}`}
      width={32}
      height={32}
      style={{ width: 32, height: 32 }}
      className="object-contain"
    />
  </div>
)}


          {/* Image de l’équipement */}
          <div
            className="w-[120px] h-[120px] relative shrink-0 mr-4 rounded overflow-hidden"
            style={{
              backgroundImage: "url(/images/ui/bg_item_leg.png)",
              backgroundSize: "cover",
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
            }}
          >
            <Image
  src={`/images/characters/ex/TI_Equipment_EX_${character.id}.png`}
  alt={`${character.name} Exclusive Equipment`}
  fill
  sizes="120px"
  className="object-contain p-2"
/>

          </div>

          {/* Infos texte */}
          <div className="flex flex-col gap-2">
            <p className="text-lg font-semibold">{eq.name}</p>
            {renderMainStat(eq.mainStat)}

            <div className="text-sm text-gray-300 flex flex-col gap-2">
              {eq.icon_effect && (
                <div className="bg-gray-500/80 rounded-full px-3 py-1 flex items-center gap-2 w-fit">
                  <Image
                    src={`/images/ui/effect/${eq.icon_effect}.png`}
                    alt={eq.icon_effect}
                    width={20}
                    height={20}
                    style={{ width: 20, height: 20 }}
                    className="object-contain"
                  />
                  <span className="text-sm font-semibold text-white">
                    {character.name}&apos;s Exclusive Equipment
                  </span>
                </div>
              )}

              <p>
                <span className="font-semibold text-white">Effect:</span> {eq.effect}
              </p>

              {eq.effect10 && (
                <p>
                  <span className="font-semibold text-white">[Rank 10]:</span> {eq.effect10}
                </p>
              )}
            </div>
          </div>
        </div>
      ))}

      {/* Transcendence */}
      {transcendData && (
        <div className="w-full md:w-[400px] min-w-[320px]">
          <TranscendenceSection transcendData={transcendData} />
        </div>
      )}
    </div>
  </div>
) : null}



      {/* Section des 3 skills */}
<div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
  {character.skills?.slice(0, 3).map((skill, index) => (
    <div key={index} className="p-4 rounded text-white">
      {/* Header avec icône + nom + WGR + CD */}
      <div className="flex items-start gap-2 mb-2">
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
        <div>
          <p className="text-lg font-semibold">{skill.name}</p>
          <p className="text-sm text-gray-400 italic mb-1">
            Weakness Gauge Reduction: {skill.wgr ?? '—'}<br />
            Cooldown: {skill.cooldown ? `${skill.cooldown} turn(s)` : '—'}
          </p>

          {/* Buffs/Debuffs */}
          <BuffDebuffDisplay buffs={skill.buffs} debuffs={skill.debuffs} />
        </div>
      </div>

      {/* Description */}
      <p className="text-sm text-gray-200 whitespace-pre-line">
        {highlightKeywordsAndNumbers(skill.description)}
      </p>
{/* Enhancement */}
{skill.enhancement?.[0] && (
  <div className="mt-3 text-xs text-gray-300 border-t border-gray-600 pt-2">
    <p className="font-bold mb-1">Enhancements:</p>
    <div className="space-y-2">
      {Object.entries(skill.enhancement[0]).map(([level, value]) => (
        <div key={level} className="flex">
          <div className="w-10 font-bold text-white flex-shrink-0">+{parseInt(level) + 2}:</div>
          <div className="text-gray-300 whitespace-pre-wrap">
            {value}
          </div>
        </div>
      ))}
    </div>
  </div>
)}



    </div>
  ))}

  {/* Placeholder si skill manquant */}
  {Array.from({ length: 3 - (character.skills?.length || 0) }).map((_, i) => (
    <div key={`empty-${i}`} className="bg-gray-800 p-4 rounded text-center text-gray-500">
      No Skill
    </div>
  ))}
</div>


      {/* Section burn + chain/dual attack */}
<div className="flex flex-col lg:flex-row gap-6 mt-6">
  <div className="flex-1 p-2 rounded text-white">
    {(() => {
      const skillWithBurn = character.skills?.find(
        s => s.burnEffect && s.burnEffect.length > 0
      ) as Skill & { burnEffect: NonNullable<Skill["burnEffect"]> }
      

      return (
        <div className="flex flex-row gap-1">
          {skillWithBurn.burnEffect.map((burn, index) => (
            <div
              key={index}
              className="relative w-[185px] h-[262px] bg-cover bg-center rounded overflow-hidden text-white transform transition-transform duration-200 hover:scale-105 hover:shadow-lg hover:ring-[1px] hover:ring-yellow-400 hover:ring-offset-[0.2px] cursor-pointer"
              style={{ backgroundImage: `url(/images/ui/Burst${burn.level}.png)` }}
            >
              <div
                className="absolute top-2.5 right-2.5 text-[15px] font-bold rounded-full flex items-center justify-center"
                style={{ width: '26px', height: '26px' }}
              >
                {burn.cost}
              </div>
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

  <div className="flex-1 p-4 rounded text-white flex flex-col gap-6">
    {/* Chain */}
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
        <BuffDebuffDisplay buffs={character.chain_buffs} debuffs={character.chain_debuffs} />
        <p className="text-sm text-gray-200">
          {highlightKeywordsAndNumbers(character.chain_effect ?? '') || '—'}
        </p>
      </div>
    </div>

    {/* Dual */}
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
        <BuffDebuffDisplay buffs={character.dual_buffs} debuffs={character.dual_debuffs} />
        <p className="text-sm text-gray-200">
          {highlightKeywordsAndNumbers(character.dual_effect ?? '') || '—'}
        </p>
        {/* Dual Enhancement */}
        {character.dual_enhancement?.[0] && (
          <div className="mt-3 text-xs text-gray-300 border-t border-gray-600 pt-2">
            <p className="font-bold mb-1">Enhancements:</p>
            <div className="space-y-2">
              {Object.entries(character.dual_enhancement[0]).map(([level, value]) => (
                <div key={level} className="flex">
                  <div className="w-10 font-bold text-white flex-shrink-0">+{parseInt(level) + 2}:</div>
                  <div className="text-gray-300 whitespace-pre-wrap">{value}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  </div>
</div>


      {/* Gear */}
      <RecommendedGearTabs
  character={{
    recommendedGearPVE: character.recommendedGearPVE,
    recommendedGearPVP: character.recommendedGearPVP
    }}
    weapons={weapons}
    amulets={amulets}
    talismans={talismans}
  />


      {/* Vidéo */}
      {character.video && (
  <YoutubeEmbed videoId={character.video} title={`Skill video of ${character.name}`} />
)}



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
  const image = `https://outerpedia.com/images/characters/atb/IG_Turn_${character.id}.png`;
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
