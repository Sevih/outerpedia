// 🔒 Forcer la génération statique uniquement
export const dynamic = 'force-static';

import { notFound } from 'next/navigation';
import { promises as fs } from 'fs';
import path from 'path';
import type { Metadata } from 'next';
import { CharacterJsonLdServeur } from '@/app/components/seo';
import Link from 'next/link';

import Image from 'next/image';
import classDataRaw from '@/data/class.json';
import rawWeapons from '@/data/weapon.json';
import rawAmulets from '@/data/amulet.json';
import rawTalismans from '@/data/talisman.json';

import type { ClassDataMap } from '@/types/types';
import type { EquipmentBase, Talisman, ExclusiveEquipment } from '@/types/equipment';
import type { Character, Skill } from '@/types/character';
import { CharacterNameDisplayBigNoH } from '@/app/components/CharacterNameDisplay'
import type { StatKey } from '@/types/types'


import RecommendedGearTabs from '@/app/components/RecommendedGearTabs';
import BuffDebuffDisplay from '@/app/components/BuffDebuffDisplayClient';
import SkillPriorityTabs from '@/app/components/SkillPriorityTabs'
import StatInlineTag from '@/app/components/StatInlineTag';
import GuideIconInline from '@/app/components/GuideIconInline';
import GiftCard from '@/app/components/GiftCard';
import CharacterProfileDescription from '@/app/components/CharacterProfileDescription ';
import rawProfiles from '@/data/character-profiles.json';

import TranscendenceSlider from '@/app/components/TranscendenceSlider';
import YoutubeEmbed from '@/app/components/YoutubeEmbed';
import formatEffectText from '@/utils/formatText';
import eeDataRaw from '@/data/ee.json';
import TagDisplayMini from '@/app/components/TagDisplayInline';
import rawTAGS from '@/data/tags.json'

type TagDef = {
  label: string
  image: string
  desc: string
  type: string // "unit-type" | "mechanic" | ...
}
type TagsMap = Record<string, TagDef>

const TAGS: TagsMap = rawTAGS as TagsMap

const UNIT_TYPE_ORDER = ['premium', 'limited', 'seasonal', 'collab'] as const

function UnitTypeBadge({ tags }: { tags?: string[] | string }) {
  const all = Array.isArray(tags) ? tags : tags ? [tags] : []

  // on garde uniquement les tags "unit-type"
  const unitTypeKeys = all.filter((k) => TAGS[k]?.type === 'unit-type')
  if (unitTypeKeys.length === 0) return null

  // priorité : premium > limited > seasonal > collab
  const picked = UNIT_TYPE_ORDER.find((k) => unitTypeKeys.includes(k)) ?? unitTypeKeys[0]

  // Réutilisation du composant inline (ton import par défaut)
  return <TagDisplayMini tags={[picked]} />
}



function getRoleBadge(role?: string) {
  if (!role) return null;
  const label: Record<string, string> = { dps: 'DPS', support: 'Support', sustain: 'Sustain' };
  const color: Record<string, string> = {
    dps: 'bg-rose-600/70',
    support: 'bg-sky-600/70',
    sustain: 'bg-emerald-600/70',
  };
  if (!label[role]) return null;
  return { label: label[role], className: color[role] };
}

function toKebabCase(str: string): string {
  return str
    .toLowerCase()
    .normalize("NFD") // enlever accents
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function getSkillLabel(index: number): string {
  return ['First', 'Second', 'Ultimate'][index] || `Skill ${index + 1}`;
}

export async function generateStaticParams() {
  const dirPath = path.join(process.cwd(), 'src/data/char');
  const files = await fs.readdir(dirPath);

  return files
    .filter((file) => file.endsWith('.json'))
    .map((file) => ({ name: file.replace('.json', '').toLowerCase() }));
}

// ✅ SEO dynamique
export async function generateMetadata(context: { params: Promise<{ name: string }> }): Promise<Metadata> {
  const { name } = await context.params;
  const filePath = path.join(process.cwd(), 'src/data/char', `${name}.json`);

  try {
    const raw = await fs.readFile(filePath, 'utf-8');
    const character: Character = JSON.parse(raw);

    const title = `Character Details : ${character.Fullname} - Outerpedia`;
    const image = `https://outerpedia.com/images/characters/atb/IG_Turn_${character.ID}.png`;
    const url = `https://outerpedia.com/characters/${name}`;

    const description = `${character.Element} ${character.Class} ${character.Fullname} overview — skill breakdown and upgrade priority, ranking, exclusive equipment, and recommended sets.`;


    return {
      title,
      description,
      keywords: [
        'Outerplane', 'Outerpedia', character.Fullname,
        `${character.Fullname} Outerplane`, `${character.Fullname} Build`, `${character.Fullname} Guide`,
        `${character.Class}`, `${character.SubClass}`, `${character.Element}`, `${character.Fullname} pve tier`, `${character.Fullname} pvp tier`
      ],
      alternates: {
        canonical: url,
      },
      openGraph: {
        title,
        description,
        url,
        type: 'website',
        images: [{ url: image, width: 150, height: 150, alt: `${character.Fullname} Portrait - Outerplane` }],
        locale: 'en_US',
        siteName: 'Outerpedia',
      },
      twitter: {
        card: 'summary',
        title,
        description,
        images: [image],
      },
    };
  } catch {
    return {
      title: 'Outerplane Characters - Outerpedia',
      description: 'Browse all Outerplane characters with detailed guides, skills and recommended builds on Outerpedia.',
      alternates: {
        canonical: 'https://outerpedia.com/characters',
      },
      openGraph: {
        title: 'Outerplane Characters - Outerpedia',
        description: 'Browse all Outerplane characters with detailed guides, skills and recommended builds on Outerpedia.',
        url: 'https://outerpedia.com/characters',
        type: 'website',
        images: [{
          url: 'https://outerpedia.com/images/ui/nav/CM_Lobby_Button_Character.png',
          width: 150,
          height: 150,
          alt: 'Outerpedia Characters'
        }],
        locale: 'en_US',
        siteName: 'Outerpedia',
      },
      twitter: {
        card: 'summary_large_image',
        title: 'Outerplane Characters - Outerpedia',
        description: 'Browse all Outerplane characters with detailed guides, skills and recommended builds on Outerpedia.',
        images: ['https://outerpedia.com/images/ui/nav/CM_Lobby_Button_Character.png'],
      },
    };
  }
}



// ✅ Page personnage (Next.js 15+ : params est une Promise)
export default async function CharacterDetailPage(context: { params: Promise<{ name: string }> }) {
  const { name } = await context.params;
  const label = `⏱️ Character page: ${name} - ${Date.now()}`;
  console.time(label);
  const filePath = path.join(process.cwd(), 'src/data/char', `${name}.json`);

  try {
    const raw = await fs.readFile(filePath, 'utf-8');
    const character: Character = JSON.parse(raw);
    if (!character) return notFound();

    const weapons = rawWeapons as unknown as EquipmentBase[];
    const amulets = rawAmulets as unknown as EquipmentBase[];
    const classData = classDataRaw as ClassDataMap;
    const talismans = rawTalismans as Talisman[];
    const eeData = eeDataRaw as Record<string, ExclusiveEquipment>
    const classInfo = classData[character.Class as keyof typeof classData]
    const subclassInfo = classInfo?.subclasses?.[character.SubClass as keyof typeof classInfo.subclasses]
    const statLabels = ["Health", "Defense", "Evasion", "Accuracy", "Speed", "Attack"]
    const recoFile = toKebabCase(character.Fullname.toLowerCase())
    let recoData = null
    const baseStats = subclassInfo?.[`stats${character.Rarity}`];

    try {
      const baseUrl = process.env.NEXT_PUBLIC_SITE_URL;
      const res = await fetch(`${baseUrl}/api/reco/${recoFile}`);
      if (res.ok) {
        const data = await res.json();
        if (data && data.status !== 'empty') {
          recoData = data;
        } else {
          recoData = null;
        }
      }
    } catch {
      recoData = null;
    }

    console.timeEnd(label);
    // Fonction utilitaire à placer au-dessus du return :
    function renderMainStat(stat: string) {
      return (
        <div className="text-sm italic text-gray-300 flex items-center gap-2">
          <span className="font-semibold text-white">Main Stat:</span>
          <span>{stat}</span>
        </div>
      );
    }

    type CharacterProfile = {
      birthday?: string;
      height?: string;
      weight?: string;
      story?: string;
    };

    const ee = eeData[toKebabCase(character.Fullname)];
    const characterProfiles = rawProfiles as Record<string, CharacterProfile>;
    const profile = characterProfiles[character.Fullname];
    const jobTitle = [character.Class, character.SubClass].filter(Boolean).join(' ');
    const skills = [
      character.skills.SKT_FIRST?.name,
      character.skills.SKT_SECOND?.name,
      character.skills.SKT_ULTIMATE?.name
    ].filter((s): s is string => Boolean(s))
    const roleBadge = getRoleBadge(character.role);


    return (
      <>

        <CharacterJsonLdServeur
          jsonLd={{
            "@context": "https://schema.org",
            "@type": "VideoGame",
            name: "Outerplane",
            url: "https://outerpedia.com",
            character: {
              "@type": "Person",
              name: character.Fullname,
              description: `${character.Element} ${character.Class} ${character.Fullname} overview — skill breakdown, ranking, exclusive equipment, and more.`,
              image: `https://outerpedia.com/images/characters/atb/IG_Turn_${character.ID}.webp`,
              url: `https://outerpedia.com/characters/${name}`,
              birthDate: profile?.birthday,
              height: profile?.height,
              weight: profile?.weight,
              jobTitle: jobTitle,
              skills: skills
            },
            mainEntityOfPage: {
              "@type": "WebPage",
              "@id": `https://outerpedia.com/characters/${name}`
            }
          }}
        />



        {/* Flèche retour */}
        <div className="relative top-4 left-4 z-20 h-[32px] w-[32px]">
          <Link href={`/characters`} className="relative block h-full w-full">
            <Image
              src="/images/ui/CM_TopMenu_Back.webp"
              alt="Back"
              fill
              sizes='32px'
              className="opacity-80 hover:opacity-100 transition-opacity"
            />
          </Link>
        </div>

        <div className="max-w-6xl mx-auto p-6">
          {/* Partie haute : illustration + infos principales */}
          <CharacterNameDisplayBigNoH fullname={character.Fullname} />
          <div className="grid grid-cols-1 md:grid-cols-[400px_1fr] gap-6">
            {/* Illustration du personnage */}
            <div className="relative rounded overflow-hidden shadow mt-10">
              <Image
                src={`/images/characters/full/IMG_${character.ID}.webp`}
                alt={character.Fullname}
                width={360}
                height={400}
                priority
                style={{ width: 360, height: 400, maxHeight: 400, maxWidth: 360 }}
                className="object-contain"
              />
            </div>

            {/* Détails à droite : nom, rareté, classe, etc. */}
            <div className="space-y-4">



              {/* Rareté sous forme d'étoiles */}
              <div className="flex items-center gap-2">
                {[...Array(character.Rarity)].map((_, i) => (
                  <Image
                    key={i}
                    src="/images/ui/star.webp"
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
                  <Image src={`/images/ui/elem/${character.Element.toLowerCase()}.webp`} alt={character.Element} width={24} height={24} style={{ width: 24, height: 24 }} />
                  <span className="text-base">{character.Element}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Image src={`/images/ui/class/${character.Class.toLowerCase()}.webp`} alt={character.Class} width={24} height={24} style={{ width: 24, height: 24 }} />
                  <span className="text-base">{character.Class}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Image src={`/images/ui/class/${character.SubClass.toLowerCase()}.webp`} alt={character.SubClass} width={24} height={24} style={{ width: 24, height: 24 }} />
                  <span className="text-base">{character.SubClass}</span>
                </div>
                <div className="mt-2 mb-3 flex flex-wrap items-center gap-2">
                   <span className=''><UnitTypeBadge tags={character.tags} /></span>

                  {roleBadge && (
                    <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm text-white ring-1 ring-white/10 ${roleBadge.className}`}>
                      {/* Optionnel: si tu as des icônes de rôle, dé-commente et ajuste le chemin */}
                      {/* <Image src={`/images/ui/roles/${character.role}.webp`} alt={roleBadge.label} width={16} height={16} /> */}
                      <span>{roleBadge.label}</span>
                    </span>
                  )}
                </div>
              </div>
              <div className="mt-2 p-2 bg-black/30 rounded">
                <CharacterProfileDescription fullname={character.Fullname} />
              </div>
              <p className="text-gray-300 text-sm max-w-2xl mx-auto">
                {`${character.Fullname} is a ${character.Element} ${character.Class}. ${subclassInfo?.description || ''}`}
              </p>

              {/* Statistiques (diagramme) + descriptions de classe + base stats */}
              <div className="grid grid-cols-1 md:grid-cols-[220px_1fr] gap-4">
                <div className="relative p-2 rounded text-sm w-fit h-fit">
                  {subclassInfo?.image ? (
                    <div className="relative mx-auto">
                      <Image
                        src={subclassInfo.image}
                        alt={character.SubClass}
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

                <div className="flex flex-col gap-4 w-fit">
                  <div className="p-2 rounded text-sm">
                    <p className="font-semibold">Class Effects Details : {character.Class} </p>
                    <p className="whitespace-pre-line">{classInfo?.description || 'No class description found.'}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Base Stats */}
          {baseStats && (() => {
            const entries = Object.entries(baseStats);

            return (
              <div>
                <div className="mt-6 px-4 py-2 bg-yellow-800/50 border-l-4 border-yellow-400 rounded text-yellow-300 text-sm italic">
                  Base stats shown assume the character is upgraded <GuideIconInline name='CM_Evolution_05' text='Stage 6 (Lv. 100)' size={20} />.
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 text-sm text-white mt-5 m-auto">
                  {entries.map(([key, value]) => {
                    const upperKey = key.toUpperCase() as StatKey;
                    return (
                      <div
                        key={key}
                        className="flex items-center gap-2 px-2 py-1 bg-black/30 rounded"
                      >
                        <StatInlineTag name={upperKey} abbr={true} />
                        <span className="text-white mt-1">
                          {key === "chc" || key === "chd" ? `${value}%` : value}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })()}

          {(ee || character.transcend) && (
            <div className="mt-8 text-white flex flex-col gap-4 items-start">
              {/* Ligne : EE à gauche + Colonne à droite */}
              <div className="flex flex-wrap md:flex-nowrap gap-4 w-full items-start">
                {/* EE à gauche */}
                {ee && (
                  <div className="flex flex-col md:flex-row rounded p-4 shadow hover:shadow-lg transition relative w-full md:w-[500px] min-w-[320px]">

                    {/* EE à gauche */}
                    <div className="flex flex-col items-center md:items-start w-full md:w-[140px] min-w-[140px] rounded shadow hover:shadow-lg transition relative">
                      {/* Image EE */}
                      <div
                        id="ee"
                        className="w-[120px] h-[120px] relative shrink-0 rounded overflow-hidden"
                        style={{
                          backgroundImage: "url(/images/ui/bg_item_leg.webp)",
                          backgroundSize: "cover",
                          backgroundPosition: "center",
                          backgroundRepeat: "no-repeat",
                        }}
                      >
                        <Image
                          src={`/images/characters/ex/${toKebabCase(character.Fullname)}.webp`}
                          alt={`${character.Fullname} Exclusive Equipment`}
                          fill
                          sizes="120px"
                          className="object-contain p-2"
                        />
                      </div>

                      {/* GiftCard SOUS l’image EE, en ligne */}
                      {character.gift && (
                        <div className="mt-2 flex flex-col gap-1">
                          <p className="text-sm font-semibold text-white text-center underline"><GuideIconInline name="CM_Goods_FriendPoint" text='Preferred Gift' /></p>
                          <div className="mx-auto">
                            <GiftCard category={character.gift} />
                          </div>
                        </div>
                      )}

                    </div>



                    <div className="flex flex-col gap-2">
                      <p className="text-lg font-semibold">{ee.name}</p>
                      {renderMainStat(ee.mainStat)}

                      <div className="text-sm text-gray-300 flex flex-col gap-2">
                        {ee.icon_effect && (
                          <div className="bg-gray-500/80 rounded-full px-3 py-1 flex items-center gap-2 w-fit">
                            <Image
                              src={`/images/ui/effect/${ee.icon_effect}.webp`}
                              alt={ee.icon_effect}
                              width={20}
                              height={20}
                              style={{ width: 20, height: 20 }}
                              className="object-contain"
                            />
                            <span className="text-sm font-semibold text-white">
                              {character.Fullname}&apos;s Exclusive Equipment
                            </span>
                          </div>
                        )}

                        <p>
                          <span className="font-semibold text-white">Effect:</span> {ee.effect}
                        </p>

                        {ee.effect10 && (
                          <p>
                            <span className="font-semibold text-white">[LV 10]:</span> {ee.effect10}
                          </p>
                        )}

                        {/* Affichage des buffs/debuffs de l'EE */}
                        {(ee.buff || ee.debuff) && (
                          <div className="mt-2">
                            <BuffDebuffDisplay buffs={ee.buff} debuffs={ee.debuff} />
                          </div>
                        )}

                      </div>
                    </div>
                  </div>
                )}

                {/* Colonne à droite : Tier + Priority + Transcend */}
                <div className="flex flex-col gap-4 w-full md:w-auto">
                  {/* Tier + EE Priority côte à côte */}
                  <div className="flex gap-4">
                    {/* EE Priority */}
                    <div className="border border-gray-600 rounded-md p-4 w-[122px] h-[100px] flex flex-col justify-center items-center">
                      <p className="font-semibold text-white mb-2">EE Priority</p>
                      {ee?.rank ? (
                        <Image
                          src={`/images/ui/IG_Event_Rank_${ee.rank}.webp`}
                          alt={`EE Rank ${ee.rank}`}
                          width={32}
                          height={32}
                          style={{ width: 32, height: 32 }}
                          className="object-contain"
                        />
                      ) : (
                        <p className="text-gray-400 italic text-center">Coming soon...</p>
                      )}
                    </div>
                    {/* Character Tier PvE*/}
                    <div className="border border-gray-600 rounded-md p-4 w-[122px] h-[100px] flex flex-col justify-center items-center">
                      <p className="font-semibold text-white mb-2">PvE Tier</p>
                      {character.rank ? (
                        <Image
                          src={`/images/ui/IG_Event_Rank_${character.rank}.webp`}
                          alt={`Rank ${character.rank}`}
                          width={32}
                          height={32}
                          style={{ width: 32, height: 32 }}
                          className="object-contain"
                        />
                      ) : (
                        <p className="text-gray-400 italic text-center">Not Available</p>
                      )}
                    </div>
                    {/* Character Tier PvP*/}
                    <div className="border border-gray-600 rounded-md p-4 w-[122px] h-[100px] flex flex-col justify-center items-center">
                      <p className="font-semibold text-white mb-2">PvP Tier</p>
                      {character.rank_pvp ? (
                        <Image
                          src={`/images/ui/IG_Event_Rank_${character.rank_pvp}.webp`}
                          alt={`Rank ${character.rank_pvp}`}
                          width={32}
                          height={32}
                          style={{ width: 32, height: 32 }}
                          className="object-contain"
                        />
                      ) : (
                        <p className="text-gray-400 italic text-center">Not Available</p>
                      )}
                    </div>


                  </div>

                  {/* Transcendence Slider en-dessous */}
                  {character.transcend && (
                    <div className="w-full md:w-[400px] min-w-[320px]">
                      <TranscendenceSlider transcendData={character.transcend} />
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}






          <div className="mt-6 px-4 py-2 bg-yellow-800/50 border-l-4 border-yellow-400 rounded text-yellow-300 text-sm italic">
            Skills are displayed here with minimum enhancements applied. However, buffs and debuffs from Burst skills are still included in the display.
          </div>


          {/* Section des 3 skills */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            {[character.skills.SKT_FIRST, character.skills.SKT_SECOND, character.skills.SKT_ULTIMATE].filter((s): s is Skill => Boolean(s))
              .map((skill, index) => (
                <div key={index} className="p-4 rounded text-white">
                  {/* Header avec icône + nom + WGR + CD */}
                  <div className="flex items-start gap-2 mb-2">
                    <div className="relative w-12 h-12 contents">
                      <Image
                        src={`/images/characters/skills/Skill_${getSkillLabel(index)}_${character.ID}.webp`}
                        alt={skill.name}
                        width={48}
                        height={48}
                        className="object-contain"
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
                        Cooldown: {skill.cd ? `${skill.cd} turn(s)` : '—'}
                      </p>

                      <BuffDebuffDisplay buffs={skill.buff} debuffs={skill.debuff} />
                    </div>
                  </div>

                  {/* Description */}
                  <div className="text-sm text-gray-200 whitespace-pre-line">
                    {formatEffectText(skill.true_desc ?? '—')}
                  </div>

                  {/* Enhancement */}
                  {skill.enhancement && (
                    <div className="mt-3 text-xs text-gray-300 border-t border-gray-600 pt-2">
                      <p className="font-bold mb-1">Enhancements:</p>
                      <div className="space-y-2">
                        {Object.entries(skill.enhancement).map(([level, value]) => (
                          <div key={level} className="flex">
                            <div className="w-10 font-bold text-white flex-shrink-0">+{parseInt(level)}:</div>
                            <div className="text-gray-300 whitespace-pre-wrap ml-10">
                              {Array.isArray(value)
                                ? value.map((line, i) => <div key={i}>{formatEffectText(line)}</div>)
                                : typeof value === 'string'
                                  ? formatEffectText(value)
                                  : null}
                            </div>
                          </div>
                        ))}

                      </div>
                    </div>
                  )}

                </div>
              ))}



            {/* Placeholder si skill manquant */}
            {Array.from({ length: 3 - Object.values(character.skills || {}).length }).map((_, i) => (
              <div key={`empty-${i}`} className="bg-gray-800 p-4 rounded text-center text-gray-500">
                No Skill
              </div>
            ))}
          </div>
          {/* Section burn + chain/dual attack */}
          <div className="flex flex-col gap-6 mt-6">
            {/* Burn cards centrées */}
            <div className="flex justify-center">
              <div className="flex flex-wrap justify-center gap-2">
                {(() => {
                  const entries = Object.entries(character.skills || {});
                  const skillWithBurnEntry = entries.find(
                    ([, skill]) => !!skill?.burnEffect && Object.keys(skill.burnEffect).length > 0
                  );

                  if (!skillWithBurnEntry) return null;

                  const [skillKey, skillWithBurn] = skillWithBurnEntry as [string, Skill & {
                    burnEffect: Record<string, { level: number; cost: number; effect: string }>;
                  }];

                  const index = ['SKT_FIRST', 'SKT_SECOND', 'SKT_ULTIMATE'].indexOf(skillKey);
                  const burns = Object.values(skillWithBurn.burnEffect);

                  return (
                    <div className="flex justify-center gap-6 items-center">
                      {/* Colonne gauche : icône + nom du skill */}
                      <div className="flex flex-col items-center gap-2 relative w-16 h-16">
                        <Image
                          src={`/images/characters/skills/Skill_${getSkillLabel(index)}_${character.ID}.webp`}
                          alt={skillWithBurn.name}
                          width={48}
                          height={48}
                          className="object-contain"
                        />
                        <Image
                          src="/images/ui/CM_Skill_Icon_Burst.webp"
                          alt="Burn icon"
                          width={20}
                          height={20}
                          className="absolute top-0 left-0 w-5 h-5 z-10 pointer-events-none"
                        />
                        <span className="text-sm font-semibold text-white text-center mt-1">
                          {skillWithBurn.name}
                        </span>
                      </div>


                      {/* Cartes burn */}
                      <div className="flex flex-wrap justify-center gap-2">
                        {burns.map((burn) => (
                          <div
                            key={burn.level}
                            className="relative w-[185px] h-[262px] bg-cover bg-center rounded overflow-hidden text-white transform transition-transform duration-200 hover:scale-105 hover:shadow-lg hover:ring-[1px] hover:ring-yellow-400 hover:ring-offset-[0.2px] cursor-pointer"
                            style={{ backgroundImage: `url(/images/ui/Burst${burn.level}.webp)` }}
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
                                top: '125px',
                                left: '20.5px',
                                width: '139px',
                                height: '109px',
                                overflow: 'hidden',
                                display: '-webkit-box',
                                WebkitBoxOrient: 'vertical',
                                WebkitLineClamp: 3,
                              }}
                            >
                              <div className="flex items-center justify-center w-full h-full text-center">
                                {formatEffectText(burn.effect)}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>

            {/* Skill Priority & Sweetspots */}
            {character.skill_priority && (
              <SkillPriorityTabs
                priority={character.skill_priority}
                characterId={character.ID}
                skillNames={{
                  First: character.skills.SKT_FIRST?.name,
                  Second: character.skills.SKT_SECOND?.name,
                  Ultimate: character.skills.SKT_ULTIMATE?.name,
                }}
              />
            )}


            {/* Chain & Dual en-dessous */}
            {character.skills?.SKT_CHAIN_PASSIVE && (
              <div className="flex flex-col gap-6 text-white">
                {/* Chain */}
                <div className="flex gap-4 items-start">
                  <div className="w-16 h-16 shrink-0">
                    <Image
                      src={`/images/characters/chain/Skill_ChainPassive_${character.Element}_${character.Chain_Type}.webp`}
                      alt={`Chain icon for ${character.Element} ${character.Chain_Type}`}
                      width={64}
                      height={64}
                      className="object-contain"
                    />
                  </div>
                  <div>
                    <p className="font-semibold mb-1">Chain & Dual Attack</p>
                    <p className="text-sm text-gray-400 italic mb-1">
                      Weakness Gauge Reduction : {character.skills.SKT_CHAIN_PASSIVE.wgr ?? '—'}
                    </p>
                    <BuffDebuffDisplay
                      buffs={character.skills.SKT_CHAIN_PASSIVE.buff}
                      debuffs={character.skills.SKT_CHAIN_PASSIVE.debuff}
                    />
                    <div className="text-sm text-gray-200 whitespace-pre-line mt-1">
                      {formatEffectText(
                        (character.skills.SKT_CHAIN_PASSIVE.true_desc?.split('<color=#ffd732>Dual Attack Effect</color>:')[0] ?? '—').trim()
                      )}
                      {/* Dual */}
                      <div className="flex gap-4 items-start">
                        <div>
                          <p className="text-sm text-gray-400 italic mb-1">
                            Weakness Gauge Reduction : {character.skills.SKT_CHAIN_PASSIVE.wgr_dual ?? '—'}
                          </p>
                          <BuffDebuffDisplay
                            buffs={
                              Array.isArray(character.skills.SKT_CHAIN_PASSIVE.dual_buff)
                                ? character.skills.SKT_CHAIN_PASSIVE.dual_buff
                                : character.skills.SKT_CHAIN_PASSIVE.dual_buff
                                  ? [character.skills.SKT_CHAIN_PASSIVE.dual_buff]
                                  : []
                            }
                            debuffs={
                              Array.isArray(character.skills.SKT_CHAIN_PASSIVE.dual_debuff)
                                ? character.skills.SKT_CHAIN_PASSIVE.dual_debuff
                                : character.skills.SKT_CHAIN_PASSIVE.dual_debuff
                                  ? [character.skills.SKT_CHAIN_PASSIVE.dual_debuff]
                                  : []
                            }
                          />
                          <div className="text-sm text-gray-200 whitespace-pre-line mt-1">
                            <span style={{ color: '#ffd732' }}>Dual Attack Effect:</span>{' '}
                            {formatEffectText(
                              (character.skills.SKT_CHAIN_PASSIVE.true_desc?.split('<color=#ffd732>Dual Attack Effect</color>:')[1] ?? '—').trim()
                            )}
                          </div>


                          {character.skills.SKT_CHAIN_PASSIVE.enhancement && (
                            <div className="mt-3 text-xs text-gray-300 border-t border-gray-600 pt-2">
                              <p className="font-bold mb-1">Enhancements:</p>
                              <div className="space-y-2">
                                {Object.entries(character.skills.SKT_CHAIN_PASSIVE.enhancement).map(([level, lines]) => (
                                  <div key={level} className="flex">
                                    <div className="w-10 font-bold text-white flex-shrink-0">+{parseInt(level)}:</div>
                                    <div className="text-gray-300 whitespace-pre-wrap">
                                      {(lines as string[]).map((line, i) => (
                                        <div key={i}>{formatEffectText(line)}</div>
                                      ))}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>


          {/* Gear */}
          {recoData ? (
            <RecommendedGearTabs
              character={{ builds: recoData }}
              weapons={weapons}
              amulets={amulets}
              talismans={talismans}
            />
          ) : (
            <div className="mt-6">
              <h2 className="text-2xl font-bold text-white mb-4 text-center">Recommended Build and Gear</h2>
              <p className="text-sm text-gray-400 text-center italic">
                No recommended gear information available for this character yet.
              </p>
            </div>
          )}




          {/* Vidéo */}
          {character.video && (
            <YoutubeEmbed videoId={character.video} title={`Skill video of ${character.Fullname}`} />
          )}



        </div>
      </>
    )


  } catch {
    console.timeEnd(label);
    return notFound();
  }
}
