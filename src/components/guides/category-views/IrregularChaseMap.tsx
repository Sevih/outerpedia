import Link from 'next/link';
import { getT, type TFunction } from '@/i18n';
import type { Lang } from '@/lib/i18n/config';
import { lRec } from '@/lib/i18n/localize';
import { localePath } from '@/lib/navigation';
import { GRADE_TEXT, img } from '@/lib/images';
import type { Guide } from '@/lib/data/guides';
import { GUIDE_CATEGORIES, categoryArt } from '@/lib/data/guide-categories';
import { getMonster, monsterThumb } from '@/lib/data/monsters';
import { encountersOfGroup } from '@/lib/data/encounters';
import { pursuitLoot, type LootVariant } from '@/lib/data/rewards';
import { ItemInline } from '@/components/inline/ItemInline';
import { Thumbnail } from '@/components/ui/Thumbnail';
import { EmptyCategory } from './EmptyCategory';
import type { CategoryViewProps } from './types';

/**
 * Vue CARTE (visuel V2) : l'écran Irregular Chase du jeu en fond (`art` de la
 * catégorie), un pin par poursuite — nom et portrait du boss, encart de butin
 * en desktop.
 *
 * Tout vient du meta et de la donnée : le pin se place par `mapPos` (exigé par
 * la catégorie — un guide sans position casserait le scan au lieu de disparaître
 * de la carte comme en V2), le nom et le portrait par `bossId`, le butin par le
 * pool du donjon le plus dur de `group` (cf. `pursuitLoot` — la V2 portait
 * items, familles et classes en dur dans le composant).
 */
export default async function IrregularChaseMap({ lang, category, guides }: CategoryViewProps) {
  const t = await getT(lang);
  if (guides.length === 0) return <EmptyCategory lang={lang} />;
  const art = categoryArt(category);
  if (!art) {
    throw new Error(
      `IrregularChaseMap : la catégorie « ${category} » ne déclare pas d'art de carte ` +
        `(champ \`art\` de guide-categories.ts).`,
    );
  }

  return (
    <div className="ring-line relative aspect-1439/719 w-full overflow-hidden rounded-lg ring-1">
      <img
        src={img.guideIcon(art)}
        alt={lRec(GUIDE_CATEGORIES[category].label, lang)}
        className="absolute inset-0 h-full w-full object-cover"
      />
      {guides.map((g) => (
        <BossPin key={g.slug} guide={g} lang={lang} t={t} />
      ))}
    </div>
  );
}

/**
 * Nom de la COLLECTION d'une poursuite, dérivé du butin : le préfixe commun
 * aux noms des équipements du pool (« Gorgon's Wrath » / « Gorgon's Vanity »
 * → « Gorgon »), débarrassé du possessif ou de la particule finale ('s, の,
 * 의, 的, 之). `undefined` si les noms n'ont rien en commun — la ligne ne
 * s'affiche alors pas.
 */
function collectionName(pieces: LootVariant[]): string | undefined {
  const names = [...new Set(pieces.map((p) => p.name).filter(Boolean))];
  if (names.length < 2) return undefined;
  let prefix = names[0];
  for (const n of names.slice(1)) {
    while (prefix && !n.startsWith(prefix)) prefix = prefix.slice(0, -1);
  }
  const cleaned = prefix.replace(/(?:['’]s?|の|의|的|之)?\s*$/u, '').trim();
  return cleaned || undefined;
}

/** Pin d'une poursuite : libellé + vignette du boss, butin dessous (desktop). */
function BossPin({ guide, lang, t }: { guide: Guide; lang: Lang; t: TFunction }) {
  const at = `${guide.category}/${guide.slug}`;
  // `requires` de la catégorie au scan — les gardes restent pour un appel hors catégorie.
  if (!guide.mapPos || !guide.bossId || !guide.group) {
    throw new Error(`IrregularChaseMap : « ${at} » sans mapPos/bossId/group dans son meta.`);
  }
  const monster = getMonster(guide.bossId);
  if (!monster) {
    throw new Error(
      `IrregularChaseMap : monstre « ${guide.bossId} » (${at}) absent de ` +
        `data/generated/monsters.json — à extraire/valider via l'admin (Extractor › Monsters).`,
    );
  }
  const ladder = encountersOfGroup(guide.group);
  if (!ladder.length) {
    throw new Error(
      `IrregularChaseMap : aucun donjon pour « ${guide.group} » (${at}) — ` +
        `vérifier le meta contre data/generated/encounters.json.`,
    );
  }

  const name = lRec(monster.name, lang) || monster.name.en;
  // Butin = le donjon le plus DUR de la poursuite (c'est lui qu'on farme).
  const top = ladder[ladder.length - 1];
  const tableId = top.ref.rewardWin ?? top.ref.reward;
  const loot = tableId ? pursuitLoot(tableId, lang) : undefined;
  const collection = loot ? collectionName([...loot.weapons, ...loot.amulets]) : undefined;
  const pos = guide.mapPos;

  return (
    <div
      className="absolute top-(--pin-top) flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-1 lg:top-(--pin-top-lg)"
      style={
        {
          '--pin-top': `${pos.mobileTop ?? pos.top}%`,
          '--pin-top-lg': `${pos.top}%`,
          left: `${pos.left}%`,
        } as React.CSSProperties
      }
    >
      <Link
        href={localePath(lang, `/guides/${guide.category}/${guide.slug}`)}
        className="group flex flex-col items-center gap-1"
      >
        {/* Pin décalé vers le bas en mobile (`mobileTop`) = le libellé passe
            SOUS la vignette, pour ne pas chevaucher le pin voisin. */}
        <span
          className={`bg-surface-sunken/70 text-content-strong rounded px-2 py-0.5 text-[10px] font-bold whitespace-nowrap drop-shadow-lg lg:text-xs ${
            pos.mobileTop !== undefined ? 'order-1 lg:-order-1' : ''
          }`}
        >
          {name}
        </span>
        {/* Le pin portait un cadre de rareté d'ITEM (`TI_Slot_Unique`) détourné
            en fond de monstre. Le jeu a le sien (`MT_Slot_*`, choisi par le
            type) et la vignette le pose. Le halo rouge du survol passe sur un
            conteneur : rien ne doit rogner la vignette, son icône d'élément sort
            volontairement du cadre. */}
        <span className="ring-danger-deep group-hover:ring-danger shrink-0 rounded-md ring-1 transition-all">
          <Thumbnail
            {...monsterThumb(monster)}
            kind="monster"
            name={name}
            className="h-12 w-12 lg:h-16 lg:w-16"
          />
        </span>
      </Link>
      {loot && (
        <div className="bg-surface-sunken/80 hidden flex-col items-center gap-0.5 rounded px-2 py-1 text-[10px] lg:flex">
          {loot.currencies.map((c, i) => (
            <ItemInline
              key={i}
              item={{ name: c.name, iconSrc: c.iconSrc, grade: c.grade, desc: c.desc }}
              color={GRADE_TEXT[c.grade] ?? 'text-content'}
            />
          ))}
          {collection && (
            <span className="text-equipment font-bold">
              {t('guides.collection', { name: collection })}
            </span>
          )}
          <div className="flex gap-0.5">
            {loot.weapons.map((v) => (
              <VariantIcon key={v.iconSrc} variant={v} />
            ))}
          </div>
          <div className="flex gap-0.5">
            {loot.amulets.map((v) => (
              <VariantIcon key={v.iconSrc} variant={v} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/** Vignette d'une variante d'équipement : cadre de rareté + icône, nom au survol. */
function VariantIcon({ variant: v }: { variant: LootVariant }) {
  return (
    <span title={v.name} className="relative inline-block h-4.5 w-4.5 shrink-0 lg:h-6 lg:w-6">
      <img
        src={img.slotFrame(v.grade)}
        alt=""
        aria-hidden
        className="absolute inset-0 h-full w-full object-contain"
      />
      <img src={v.iconSrc} alt={v.name} className="absolute inset-0 h-full w-full object-contain" />
    </span>
  );
}
