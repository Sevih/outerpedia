import Link from 'next/link';
import type { Lang } from '@/lib/i18n/config';
import { lRec } from '@/lib/i18n/localize';
import { localePath } from '@/lib/navigation';
import { img } from '@/lib/images';
import type { Guide } from '@/lib/data/guides';
import { getMonster } from '@/lib/data/monsters';
import { encountersOfGroup, modeLabel } from '@/lib/data/encounters';
import { lootSignature, type LootBadge } from '@/lib/data/rewards';
import { EmptyCategory } from './EmptyCategory';
import { ModeColumns } from './ModeColumns';
import type { CategoryViewProps } from './types';

/**
 * Vue SPECIAL REQUEST : une colonne par MODE (Ecology Study / Identification),
 * dans l'ordre du jeu — côte à côte en desktop, onglets en mobile (visuel V2 :
 * cartes-bannières, nom en pastille, signature de loot en surimpression).
 *
 * Le MODE se lit sur le combat que chaque guide désigne (`meta.group`, exigé
 * par la catégorie) : le premier donjon de l'échelle porte son nom (glossaire
 * `modes`). L'ORDRE — des colonnes comme des cartes — est ÉDITORIAL : `meta.order`
 * (exigé par la catégorie), déjà appliqué par `listGuidesByCategory` ; on ne
 * fait que le préserver. La signature de loot vient du pool du stage le plus
 * haut (sets d'armure ou mains d'accessoires — cf. `lootSignature`). La V2
 * faisait la même page avec une table slug→élément dans un JSON à part et le
 * loot écrit à la main ; un boss ajouté au mode y serait resté invisible.
 */
export default async function SpecialRequestSplit({ lang, guides }: CategoryViewProps) {
  if (guides.length === 0) return <EmptyCategory lang={lang} />;

  const placed = guides.map((guide) => {
    // `requires: ['group']` au scan — le garde reste pour un appel hors catégorie.
    if (!guide.group) {
      throw new Error(
        `SpecialRequestSplit : « ${guide.category}/${guide.slug} » sans group dans son meta.`,
      );
    }
    const ladder = encountersOfGroup(guide.group);
    if (!ladder.length) {
      throw new Error(
        `SpecialRequestSplit : aucun donjon pour « ${guide.group} » (${guide.slug}) — ` +
          `vérifier le meta contre data/generated/encounters.json.`,
      );
    }
    // Signature de loot = pool du stage le plus HAUT (c'est lui qu'on farme).
    // Sans table (mode futur ?), la carte vit sans pastilles — rien à casser.
    const top = ladder[ladder.length - 1];
    const tableId = top.ref.reward ?? top.ref.rewardWin;
    const sig = tableId
      ? lootSignature(tableId, lang)
      : { sets: [] as LootBadge[], stats: [] as LootBadge[] };
    return { guide, first: ladder[0], sig };
  });

  // Colonnes par mode. `guides` arrive trié par `meta.order` et `Map.groupBy`
  // préserve l'ordre d'insertion : colonnes et cartes sont déjà en place.
  const columns = [...Map.groupBy(placed, (p) => p.first.ref.mode).values()];

  return (
    <ModeColumns
      sections={columns.map((entries) => ({
        key: entries[0].first.ref.mode,
        label: modeLabel(entries[0].first.ref, lang),
        content: (
          <div className="flex flex-col gap-3">
            {entries.map(({ guide, sig }) => (
              <BannerCard key={guide.slug} guide={guide} lang={lang} sig={sig} />
            ))}
          </div>
        ),
      }))}
    />
  );
}

/**
 * Carte-bannière d'un combat (visuel V2) : l'icône du guide est un art large
 * (`CLG_Raid_*`) rendu en fond plein, le nom en pastille, la signature de loot
 * à droite sur deux rangées.
 */
function BannerCard({ guide, lang, sig }: { guide: Guide; lang: Lang; sig: LootSig }) {
  // Le NOM DU BOSS, pas le titre du guide (huit metas portent le générique
  // « Strategy Guide ») : le monstre que `bossId` désigne — pas les boss du
  // combat, dont la liste est bruitée (le jumeau de Dek'Ril est un renfort,
  // la Chimère aligne un Ratman en rôle boss).
  if (!guide.bossId) {
    throw new Error(
      `SpecialRequestSplit : « ${guide.category}/${guide.slug} » sans bossId dans son meta.`,
    );
  }
  const monster = getMonster(guide.bossId);
  if (!monster) {
    throw new Error(
      `SpecialRequestSplit : monstre « ${guide.bossId} » (${guide.slug}) absent de ` +
        `data/generated/monsters.json — à extraire/valider via l'admin (Extractor › Monsters).`,
    );
  }
  const name = lRec(monster.name, lang) || monster.name.en;
  // Un pool ne porte qu'UNE nature de signature (sets OU stats) ; les stats
  // (icônes blanches du jeu) prennent une pastille ronde sombre pour se lire
  // sur l'art, comme en V2.
  const badges = sig.sets.length ? sig.sets : sig.stats;
  const rounded = sig.sets.length === 0;
  const half = Math.ceil(badges.length / 2);
  const rows = [badges.slice(0, half), badges.slice(half)].filter((r) => r.length);

  return (
    <Link
      href={localePath(lang, `/guides/${guide.category}/${guide.slug}`)}
      className="group ring-line-subtle hover:ring-select/50 relative mx-auto block aspect-27/5 w-full max-w-135 overflow-hidden rounded-lg ring-1 transition-all"
    >
      <img
        src={img.guideIcon(guide.icon)}
        alt=""
        aria-hidden
        loading="lazy"
        className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
      />
      <div className="absolute inset-x-0 bottom-0 px-3 pb-1.5">
        <p className="bg-surface-sunken/60 text-content-strong inline-block rounded px-3 py-0.5 text-lg font-bold drop-shadow-lg">
          {name}
        </p>
      </div>
      <div className="absolute top-1/2 right-2 flex -translate-y-1/2 flex-col items-end gap-0.5">
        {rows.map((row, i) => (
          <div key={i} className="flex gap-0.5">
            {row.map((b) => (
              <span
                key={b.iconSrc}
                title={b.name}
                className={`relative h-5 w-5 shrink-0 lg:h-8 lg:w-8 ${
                  rounded ? 'bg-surface-sunken/70 rounded-full' : ''
                }`}
              >
                <img
                  src={b.iconSrc}
                  alt={b.name}
                  loading="lazy"
                  className="absolute inset-0 h-full w-full object-contain drop-shadow-lg"
                />
              </span>
            ))}
          </div>
        ))}
      </div>
    </Link>
  );
}

/** Signature de loot d'une échelle (cf. `lootSignature`). */
type LootSig = { sets: LootBadge[]; stats: LootBadge[] };
