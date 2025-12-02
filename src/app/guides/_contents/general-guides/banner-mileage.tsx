import GuideHeading from '@/app/components/GuideHeading';
import CharacterLinkCard from '@/app/components/CharacterLinkCard'
import BannerTabCards, { BannerTab } from '@/app/components/CardTabs';
import GuideIconInline from '@/app/components/GuideIconInline';
import LimitedHeroesList from '@/app/components/LimitedHeroesList';
import Image from 'next/image';


const decoration = "text-yellow-400 underline";
const star = <span className={`relative align-middle inline-flex w-[15px] h-[15px]`}>
    <Image
        src={`/images/ui/CM_icon_star_y.webp`}
        alt="badge"
        width={15}
        height={15}
        style={{ width: 15, height: 15 }}
        className="object-contain"
    />
</span>;


const bannerTabs: BannerTab[] = [
    {
        key: 'pickup',
        image: 'CM_Btn_Recruit_Custom',
        label: 'Custom Rate Up',
        badgeImg: 'CM_Recruit_Tag_PickUp',
        badgePosition: '-top-4 -right-4',
        content: (
            <div>
                <GuideHeading>Custom Rate Up Banner</GuideHeading>
                <p>Drop rate of 3{star} : 2.5%</p>
                <p>Drop rate of 2{star} : 19%</p>
                <p>Drop rate of 1{star} : 78.5%</p>
                <p className="mt-4"><span className={decoration}>Special feature</span>: Using Recruit x 10 recruit guarantees at least one 2{star} hero.</p>
                <p className='mt-4'><span className={decoration}>1 free pull per day</span></p>
                <p className='mt-4'>Pulling a hero you already own will gives you</p>
                <ul>
                    <li><span className={decoration}><GuideIconInline name="GC_Item_Piece" text='Wildcard pieces' /></span> : 1 for a 2{star} and 15 for a 3{star}</li>
                    <li><span className={decoration}><GuideIconInline name="CM_Piece_Frame" text='Hero pieces' /></span> : 5 for a 1{star}, 10 for a 2{star} and 150 for a 3{star}</li>
                </ul>

                <p className='mt-2'>
                    This banner is always available.<br /> You can choose up to 3 characters to force the drop rate of those. <br />For example if you select
                    <CharacterLinkCard name="Alice" />, <CharacterLinkCard name="Eliza" /> and <CharacterLinkCard name="Francesca" /> you can&apos;t drop another 3{star} except for those 3.</p>
                <p className='mt-4'>
                    It uses 3 types of ressources :</p>
                <ul>
                    <li>
                        <span className={decoration}><GuideIconInline name="TI_Item_Ticket_Recruit_04" text='Special Recruitement Ticket (Event)' /></span> : 1 for 1 unit, does not add to mileage count
                    </li>
                    <li>
                        <span className={decoration}><GuideIconInline name="TI_Item_Ticket_Recruit_02" text='Special Recruitement Ticket' /></span> : 1 for 1 unit, grants 1 <GuideIconInline name="CM_Icon_Recruit_Mileage_Element" text='Custom Mileage' size={25} />
                    </li>
                    <li>
                        <span className={decoration}><GuideIconInline name="TI_Item_Cristal_Cash" text='Ether' /></span> : 150 for 1 unit, grants 1 <GuideIconInline name="CM_Icon_Recruit_Mileage_Element" text='Custom Mileage' size={25} />
                    </li>
                </ul>

                <p className='mt-4'>
                    It&apos;s not recommended to use <GuideIconInline name="TI_Item_Cristal_Cash" text='Ether' /> on this banner
                </p>
                <p className='mt-4'>
                    <GuideIconInline name="CM_Icon_Recruit_Mileage_Element" text='Custom Mileage' size={25} /> are kept until you decide to use them.
                </p>
                <p className='mt-4'>
                    Use 200 <GuideIconInline name="CM_Icon_Recruit_Mileage_Element" text='Custom Mileage' size={25} /> to recruit the featured hero, or get 150 <GuideIconInline name="CM_Piece_Frame" text='Hero pieces' /><br />
                    Gain 15 additionnal <GuideIconInline name="GC_Item_Piece" text='Wildcard pieces' /> if you already own the hero.
                </p>
            </div>
        )
    },
    {
        key: 'new',
        image: 'CM_Btn_Recruit_PickUp_03',
        label: 'Rate Up Banner',
        badgeImg: 'CM_Recruit_Tag_New',
        badgePosition: '-top-4 -right-4',
        content: (
            <div>
                <GuideHeading>Rate Up Banner</GuideHeading>
                <p>3{star} focus drop rate: 1.25%</p>
                <p>3{star} non-focus drop rate: 1.25%</p>
                <p>2{star} drop rate: 19%</p>
                <p>1{star} drop rate: 78.5%</p>
                <p className="mt-4"><span className={decoration}>Special feature</span>: Using Recruit x 10 recruit guarantees at least one 2{star} hero.</p>
                <p className="mt-4">
                    Duplicates give:</p>
                <ul>
                    <li><span className={decoration}><GuideIconInline name="GC_Item_Piece" text="Wildcard pieces" /></span>: 1 for a 2{star}, 15 for a 3{star}</li>
                    <li><span className={decoration}><GuideIconInline name="CM_Piece_Frame" text="Hero pieces" /></span>: 5 for a 1{star}, 10 for a 2{star}, 50 for a 3{star} (150 if it&apos;s the banner unit)</li>
                </ul>

                <p className="mt-2">
                    This banner is temporary and usually lasts 2 weeks.
                </p>
                <p className="mt-4">
                    It uses 3 types of resources:</p>
                <ul>
                    <li><span className={decoration}><GuideIconInline name="TI_Item_Ticket_Recruit_04" text="Special Recruitment Ticket (Event)" /></span>: 1 per recruit, does not add to mileage count</li>
                    <li><span className={decoration}><GuideIconInline name="TI_Item_Ticket_Recruit_02" text="Special Recruitment Ticket" /></span>: 1 per recruit, grants 1 <GuideIconInline name="CM_Icon_Recruit_Mileage" text="Mileage" size={25} /></li>
                    <li><span className={decoration}><GuideIconInline name="TI_Item_Cristal_Cash" text="Ether" /></span>: 150 per recruit, grants 1 <GuideIconInline name="CM_Icon_Recruit_Mileage" text="Mileage" size={25} /></li>
                </ul>

                <p className='mt-4'>
                    It&apos;s not recommended to use <GuideIconInline name="TI_Item_Cristal_Cash" text='Ether' /> on this banner
                </p>
                <p className="mt-4"><GuideIconInline name="CM_Icon_Recruit_Mileage" text="Mileage" size={25} /> is kept until used.</p>
                <p className="mt-4">
                    Use 200 <GuideIconInline name="CM_Icon_Recruit_Mileage" text="Mileage" size={25} /> to recruit the featured hero, or get 150 <GuideIconInline name="CM_Piece_Frame" text="Hero pieces" />.<br />
                    Get 15 bonus <GuideIconInline name="GC_Item_Piece" text="Wildcard pieces" /> if you already own the hero.
                </p>

            </div>
        ),
    },
    {
        key: 'premium',
        image: 'CM_Btn_Recruit_Special',
        label: 'Premium Banner',
        badgeImg: 'CM_Recruit_Tag_Premium',
        badgePosition: '-top-4 -right-4',
        content: (
            <div>
                <GuideHeading>Premium Banner</GuideHeading>
                <p>3{star} focus drop rate: 1.25%</p>
                <p>3{star} non-focus drop rate: 2.5%</p>
                <p className="ml-10 text-gray-400">Demiurge heroes have about half the drop rate of regular off-banner 3{star} heroes</p>
                <p>2{star} drop rate: 19%</p>
                <p>1{star} drop rate: 77.25%</p>
                <p className="mt-4"><span className={decoration}>1 free pull per day</span></p>
                <p className="mt-4">
                    Duplicates give:
                </p>
                <ul>
                    <li><span className={decoration}><GuideIconInline name="GC_Item_Piece" text="Wildcard pieces" /></span>: 1 for a 2{star}, 15 for a 3{star}</li>
                    <li><span className={decoration}><GuideIconInline name="CM_Piece_Frame" text="Hero pieces" /></span>: 5 for a 1{star}, 10 for a 2{star}, 50 for a 3{star} (150 if it&apos;s the banner unit)</li>
                </ul>

                <p className="mt-2">
                    This is a permanent banner, and the only regular way (besides events like Demiurge Contract) to get Demiurge Heroes.<br />
                    These heroes are extremely powerful but also very rare. Demiurge heroes benefit more from transcendence overall, but some are strong right from base 3{star}.
                </p>
                <p className="mt-4">
                    It uses 3 types of resources:
                </p>
                <ul>
                    <li><span className={decoration}><GuideIconInline name="TI_Item_Recruit_Special_001_NonMileage" text="Call of the Demiurge (Event)" /></span>: 10 per recruit, does not add to mileage count</li>
                    <li><span className={decoration}><GuideIconInline name="TI_Item_Recruit_Special_001" text="Call of the Demiurge" /></span>: 10 per recruit, grants 1 <GuideIconInline name="CM_Icon_Recruit_Mileage_Special_001" text="False God's Proof" size={25} /></li>
                    <li><span className={decoration}><GuideIconInline name="TI_Item_Cristal_Cash" text="Ether" /></span>: 225 per recruit, grants 1 <GuideIconInline name="CM_Icon_Recruit_Mileage_Special_001" text="False God's Proof" size={25} /></li>
                </ul>

                <p className="mt-4"><GuideIconInline name="CM_Icon_Recruit_Mileage_Special_001" text="False God's Proof" size={25} /> is kept until used.</p>
                <p className="mt-4">
                    Use 200 <GuideIconInline name="CM_Icon_Recruit_Mileage_Special_001" text="False God's Proof" size={25} /> to recruit the featured hero, or get 150 <GuideIconInline name="CM_Piece_Frame" text="Hero pieces" />.<br />
                    Get 15 bonus <GuideIconInline name="GC_Item_Piece" text="Wildcard pieces" /> if you already own the hero.
                </p>
            </div>
        ),
    },
    {
        key: 'fes',
        image: 'CM_Btn_Recruit_Seasonal',
        label: 'Limited Banner',
        badgeImg: 'CM_Recruit_Tag_Seasonal',
        badgePosition: '-top-1 right-0 ',
        content: (
            <div>
                <GuideHeading>Limited Banner</GuideHeading>
                <p>3{star} focus drop rate: 1.25%</p>
                <p>3{star} non-focus drop rate: 1.25%</p>
                <p>2{star} drop rate: 19%</p>
                <p>1{star} drop rate: 78.5%</p>
                <p className="mt-4"><span className={decoration}>Special feature</span>: Using Recruit x 10 recruit guarantees at least one 2{star} hero.</p>
                <p className="mt-4">
                    Duplicates give:
                </p>
                <ul>
                    <li><span className={decoration}><GuideIconInline name="GC_Item_Piece" text="Wildcard pieces" /></span>: 1 for a 2{star}, 15 for a 3{star}</li>
                    <li><span className={decoration}><GuideIconInline name="CM_Piece_Frame" text="Hero pieces" /></span>: 5 for a 1{star}, 10 for a 2{star}, 150 for a 3{star}</li>
                </ul>


                <p className="mt-2">
                    This banner is temporary and the only way to obtain Limited Heroes. They are divided into 3 categories:</p>
                <ul>
                    <li><strong className='text-pink-400'>Limited</strong>: classic time-limited heroes</li>
                    <li><strong className='text-green-400'>Seasonal</strong>: heroes tied to yearly events like Halloween or Christmas</li>
                    <li><strong className='text-red-400'>Collab</strong>: heroes from crossovers with other licenses. they are the least likely to return</li>
                </ul>
                <p className="mt-2">
                    This banner typically runs for 2 to 4 weeks.<br />
                    Like Demiurge heroes, Limited units are (usually) extremely powerful, with their strongest abilities unlocking at high transcendence levels.
                </p>

                <p className="mt-4">
                    <strong className={decoration}>List of Limited Heroes and their release dates:</strong></p>
                <LimitedHeroesList />

                <p className="mt-4">
                    It uses 3 types of resources:
                </p>
                <ul>
                    <li>
                        <span className={decoration}>
                            <GuideIconInline name="TI_Item_Ticket_Recruit_06" text="Limited Recruitment Ticket (event)" />
                        </span>: 1 per recruit, does not add to mileage count (this item exist but hasn&apos;t been used yet)
                    </li>
                    <li>
                        <span className={decoration}>
                            <GuideIconInline name="TI_Item_Ticket_Recruit_05" text="Limited Recruitment Ticket" />
                        </span>: 1 per recruit, grants 1 <GuideIconInline name="CM_Icon_Recruit_Mileage_Seasonal" text="Limited Mileage" size={25} />
                    </li>
                    <li>
                        <span className={decoration}>
                            <GuideIconInline name="TI_Item_Cristal_Cash" text="Ether" />
                        </span>: 150 per recruit, grants 1 <GuideIconInline name="CM_Icon_Recruit_Mileage_Seasonal" text="Limited Mileage" size={25} />
                    </li>
                </ul>


                <p className="mt-4"><GuideIconInline name="CM_Icon_Recruit_Mileage_Seasonal" text="Limited Mileage" size={25} /> is kept until used.</p>
                <p className="mt-4">
                    Use 150 <GuideIconInline name="CM_Icon_Recruit_Mileage_Seasonal" text="Limited Mileage" size={25} /> to recruit the featured hero, or get 150 <GuideIconInline name="CM_Piece_Frame" text="Hero pieces" />.<br />
                    Get 15 bonus <GuideIconInline name="GC_Item_Piece" text="Wildcard pieces" /> if you already own the hero.
                </p>
            </div>
        ),

    },


];

export default function BannerAndMileageGuide() {
    return (
        <div className="space-y-6">
            <p>
                Like most gacha games, Outerplane features a recruitment system with multiple banners,
                each using different types of resources.
                This guide explains how banners and the mileage system work in Outerplane.
            </p>

            <p>
                Outerplane uses a <span className={decoration}>mileage system</span>.
                Unlike pity counters, mileage allows you to
                <strong> directly obtain</strong> the featured unit once you&apos;ve gathered enough points.
            </p>

            <p>
                Each recruit <strong>(except those using event tickets)</strong> grants 1 mileage.
                Once you reach the required amount, you can exchange your mileage for the banner unit.
            </p>

            <p>
                One major advantage of this system is that <strong>mileage is retained</strong> across banners.<br />
                Why is that useful?<br />
                Imagine you do a 10-recruit, get the unit, and also hit the mileage cap.
                If you&apos;re pulling for collection, you can <strong>save your mileage</strong> for a future banner
                with a unit you&apos;re more interested in — or just keep it to secure your next target more efficiently.
            </p>



            <BannerTabCards tabs={bannerTabs} imagePath="/images/guides/general-guides/banner/" />
        </div>
    );
}
