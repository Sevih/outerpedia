/**
 * RENDU DE CONTRÔLE DU CARROUSEL D'ÉQUIPE (dev-only, route `/dev/carousel` —
 * `.dev.tsx` non buildé en prod).
 *
 * Le carrousel est le seul endroit du site où une carte est TOURNÉE. Ses voisines
 * se projettent hors de la scène, et de combien ne se devine pas : ça dépend du
 * nombre d'options, pas de la taille de la carte (cf. `sideOverflow`). Cette page
 * existe pour VOIR ce débordement, aux quatre paliers du barème.
 *
 * Le cadre rend UNE ÉQUIPE : quatre postes, parce qu'une équipe compte quatre
 * personnages — c'est la seule rangée que les guides produisent, et donc la seule
 * dont l'encombrement se juge. Le nombre d'OPTIONS par poste, lui, varie de 2 à 8
 * selon le poste : il est ici au sélecteur, uniforme sur les quatre, ce qui est le
 * pire cas de chaque cardinalité.
 *
 * POURQUOI DES IFRAMES. Les tailles de carte sont décidées par des breakpoints,
 * donc par la largeur du VIEWPORT. Une page ne peut pas montrer quatre viewports à
 * la fois — sauf en en ouvrant quatre. Chaque iframe charge cette même route en
 * mode `?frame=1` et lui impose sa largeur : les média-queries s'y résolvent pour
 * de vrai, on rend le VRAI composant dans le VRAI chemin de code, sans prop de
 * contournement qui finirait par diverger de la prod.
 *
 * Le lien « avant/après » repasse `selfSpacing={false}` — l'état d'avant, où le
 * conteneur essayait de couvrir le débordement avec un écart choisi à l'œil.
 */
import Link from 'next/link';
import type { Route } from 'next';
import {
  characterBaseName,
  characterNamePrefix,
  characterDisplayName,
  getAllCharacters,
  slugForId,
} from '@/lib/data/characters';
import { characterTags, loadCuratedCharacters } from '@/lib/data/curated';
import { CharacterCard } from '@/components/character/CharacterCard';
import { TeamSlotCarousel } from '@/components/guides/TeamSlotCarousel';

export const metadata = { title: 'Carrousel d’équipe' };

/** Une équipe = quatre personnages, donc quatre postes. Ce nombre-là ne varie pas. */
const SLOTS = 4;

/**
 * Les cardinalités d'options qui existent VRAIMENT dans les guides : sur les 56
 * emplacements, 21 offrent quatre options ou plus et deux en offrent huit. 2 et 3
 * sont là comme témoins bas — c'est le seul régime où le débordement est
 * négligeable.
 */
const COUNTS = [2, 3, 4, 5, 6, 8];
const DEFAULT_COUNT = 5;

/**
 * Les quatre paliers du barème de `CharacterCard`, chacun avec une largeur d'iframe
 * qui tombe DANS le palier sans être à sa frontière (une bordure de breakpoint ne
 * prouve rien). `height` suit ce que le palier demande : au plus étroit, quatre
 * postes ne tiennent pas sur une ligne et la rangée s'enroule.
 */
const VIEWPORTS = [
  { px: 400, palier: 'base · < 640', card: 80, height: 760 },
  { px: 700, palier: 'sm · ≥ 640', card: 104, height: 620 },
  { px: 1100, palier: 'lg · ≥ 1024', card: 128, height: 400 },
  { px: 1500, palier: 'xl · ≥ 1440', card: 152, height: 440 },
];

/**
 * Débordement latéral attendu, en px et par côté — la MÊME formule que
 * `sideOverflow`, recopiée ici pour que le tableau de référence soit lisible sans
 * ouvrir le composant. Si les deux divergent un jour, c'est le composant qui a
 * raison : lui mesure, celui-ci suppose.
 */
const PERSPECTIVE_PX = 150;
function expectedOverflow(width: number, count: number): number {
  const radius = Math.round(width * 1.4) + Math.max(0, count - 5) * 10;
  const half = width / 2;
  let max = 0;
  for (let d = 1; d <= 2; d++) {
    const th = (2 * Math.PI * d) / count;
    for (const edge of [-1, 1]) {
      const x = edge * half * Math.cos(th) + radius * Math.sin(th);
      const z = radius * Math.cos(th) - edge * half * Math.sin(th) - radius;
      max = Math.max(max, Math.abs((x * PERSPECTIVE_PX) / Math.max(1, PERSPECTIVE_PX - z)));
    }
  }
  return Math.max(0, Math.round(max - half));
}

/** Les écarts que le conteneur posait AVANT, par palier (`gap-12 sm:gap-16 lg:gap-24`). */
const LEGACY_GAP = [48, 64, 96, 96];

/** Plancher de la réserve : une équipe pleine (cf. `MIN_SPREAD` dans le carrousel). */
const MIN_SPREAD = 4;
/** Ce que le composant applique VRAIMENT : le débordement, plancher compris. */
const appliedPadding = (width: number, count: number) =>
  expectedOverflow(width, Math.max(MIN_SPREAD, count));

/**
 * Persos de démonstration : par id croissant, une tranche distincte par poste pour
 * qu'on distingue les quatre roues. Le contenu n'a aucune importance ici — seule la
 * géométrie compte — mais un ordre stable rend les captures comparables.
 */
function pickCharacters(slot: number, count: number) {
  const all = getAllCharacters()
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id));
  return Array.from({ length: count }, (_, i) => all[(slot * 8 + i) % all.length]);
}

/**
 * UNE RANGÉE HÉTÉROGÈNE, parce que c'est la seule qui prouve quelque chose.
 *
 * Les vrais guides mélangent les cardinalités dans une même équipe (constat Sevih
 * sur une rangée 2/2/6/2). Quatre postes égaux ne montreraient jamais le défaut que
 * `rowOptions` corrige : chaque poste réservant sa propre emprise, le poste fourni
 * écartait ses voisins de lui seul et les cartes cessaient d'être régulièrement
 * espacées. Le sélecteur fixe donc le MAXIMUM de la rangée, et les quatre postes se
 * répartissent autour.
 */
const slotCounts = (max: number) => [max, 1, Math.max(2, Math.ceil(max / 2)), max];

/** La bande de carrousels — le contenu que les iframes chargent. */
function Strip({ count, legacy }: { count: number; legacy: boolean }) {
  const curated = loadCuratedCharacters();
  const counts = slotCounts(count);

  return (
    <div className="bg-surface-base text-content min-h-screen p-3">
      {/* Le MÊME conteneur que `TeamSlots` — s'il change là-bas, il change ici. En
          mode AVANT il reprend AUSSI ses anciens écarts : comparer l'ancien
          espacement à la nouvelle emprise sans rétablir l'ancien conteneur
          truquerait la démonstration en sa faveur. */}
      <div
        className={`flex flex-wrap justify-center ${
          legacy ? 'gap-12 sm:gap-16 lg:gap-24' : 'gap-x-0 gap-y-6'
        }`}
      >
        {Array.from({ length: SLOTS }, (_, slot) => {
          const chars = pickCharacters(slot, counts[slot]);
          return (
            // Le liseré matérialise l'EMPRISE déclarée du carrousel — sans lui, on
            // ne voit pas la différence entre « ça ne se touche pas » et « ça se
            // touche mais le flou le masque ».
            <div key={slot} className="outline-line-subtle rounded outline-1 outline-dashed">
              <TeamSlotCarousel
                labels={chars.map((c) => characterDisplayName(c, 'en'))}
                prevLabel="Précédent"
                nextLabel="Suivant"
                rowOptions={count}
                selfSpacing={!legacy}
              >
                {chars.map((c) => (
                  <CharacterCard
                    key={c.id}
                    id={c.id}
                    name={characterBaseName(c, 'en')}
                    prefix={characterNamePrefix(c, 'en')}
                    element={c.element}
                    classType={c.class}
                    rarity={c.rarity}
                    tags={characterTags(c, curated)}
                    href={slugForId(c.id) ? `/en/characters/${slugForId(c.id)}` : undefined}
                  />
                ))}
              </TeamSlotCarousel>
              <p className="text-content-subtle pb-1 text-center font-mono text-[10px]">
                poste {slot + 1} · {counts[slot]} opt.
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default async function DevCarouselPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const legacy = sp.legacy === '1';
  const asked = Number(sp.count);
  const count = COUNTS.includes(asked) ? asked : DEFAULT_COUNT;

  // Mode iframe : la bande seule, sans chrome de page.
  if (sp.frame === '1') return <Strip count={count} legacy={legacy} />;

  const link = (c: number, lg: boolean) =>
    `/dev/carousel?count=${c}${lg ? '&legacy=1' : ''}` as Route;

  return (
    <div className="bg-surface-base text-content min-h-screen p-6">
      <header className="mb-6 space-y-2">
        <p className="text-content-subtle font-mono text-xs">
          <Link href={'/dev' as Route} className="hover:text-accent underline">
            /dev
          </Link>{' '}
          / carousel
        </p>
        <h1 className="text-content-strong text-2xl font-bold">Carrousel d’équipe</h1>
        <p className="text-content-muted max-w-3xl text-sm">
          Chaque cadre est un <strong>viewport réel</strong> : le composant y suit ses propres
          breakpoints, sans prop de contournement. Il rend une{' '}
          <strong>équipe de quatre postes</strong> — la seule rangée que les guides produisent. Le
          liseré pointillé montre l’
          <strong>emprise déclarée</strong> de chaque carrousel, c’est-à-dire ce que le flex du
          conteneur voit ; ce qui déborde ce liseré empiète sur le poste voisin.
        </p>

        <div className="flex flex-wrap items-center gap-x-3 gap-y-2 pt-1">
          <span className="text-content-subtle font-mono text-xs">options par poste :</span>
          {COUNTS.map((c) => (
            <Link
              key={c}
              href={link(c, legacy)}
              className={`rounded-md border px-2.5 py-1 font-mono text-sm transition ${
                c === count
                  ? 'border-accent bg-accent/15 text-content-strong'
                  : 'border-line bg-surface-raised hover:border-line-strong'
              }`}
            >
              {c}
            </Link>
          ))}

          <span className="bg-line-subtle mx-2 h-5 w-px" />

          <Link
            href={link(count, !legacy)}
            className="border-line bg-surface-raised hover:border-line-strong hover:text-content-strong rounded-md border px-3 py-1 text-sm transition"
          >
            {legacy ? '→ Voir APRÈS' : '→ Voir AVANT'}
          </Link>
          <span
            className={`rounded px-2 py-1 font-mono text-xs ${
              legacy ? 'bg-amber-500/15 text-amber-200' : 'bg-emerald-500/15 text-emerald-200'
            }`}
          >
            {legacy ? 'AVANT — écart du conteneur, selfSpacing off' : 'APRÈS — emprise déclarée'}
          </span>
        </div>
      </header>

      {/* ── Le tableau de référence : ce que la géométrie prédit ── */}
      <section className="mb-8">
        <h2 className="text-content-strong mb-1 text-lg font-semibold">
          Débordement attendu, par côté
        </h2>
        <p className="text-content-muted mb-3 max-w-3xl text-sm">
          En rouge, les cas où les deux débordements voisins dépassaient l’écart que le conteneur
          posait AVANT. Noter que la valeur bouge à peine d’une colonne à l’autre : le débordement
          suit le <strong>nombre d’options</strong>, pas la taille de la carte. En dessous de{' '}
          {MIN_SPREAD} options la géométrie ne déborde presque plus, et les cartes se colleraient :
          la réserve appliquée ne descend donc jamais sous celle d’une équipe pleine — les valeurs
          concernées sont notées <span className="text-content-subtle">« → n »</span>.
        </p>
        <div className="overflow-x-auto">
          <table className="border-line-subtle border-collapse border text-sm">
            <thead>
              <tr className="bg-surface-raised">
                <th className="border-line-subtle border px-3 py-1.5 text-left font-medium">
                  options
                </th>
                {VIEWPORTS.map((v, i) => (
                  <th key={v.px} className="border-line-subtle border px-3 py-1.5 text-left">
                    <span className="text-content-strong">{v.palier}</span>
                    <br />
                    <span className="text-content-subtle font-mono text-[10px]">
                      carte {v.card} · écart avant {LEGACY_GAP[i]}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {COUNTS.map((c) => (
                <tr key={c} className={c === count ? 'bg-accent/10' : undefined}>
                  <td className="border-line-subtle bg-surface-raised border px-3 py-1.5 font-mono">
                    {c}
                  </td>
                  {VIEWPORTS.map((v, i) => {
                    const o = expectedOverflow(v.card, c);
                    const applied = appliedPadding(v.card, c);
                    const collides = 2 * o > LEGACY_GAP[i];
                    return (
                      <td
                        key={v.px}
                        className={`border-line-subtle border px-3 py-1.5 font-mono ${
                          collides ? 'bg-red-500/10 text-red-300' : 'text-content-muted'
                        }`}
                      >
                        {o} px
                        {applied !== o && (
                          <span className="text-content-subtle ml-1 text-[10px]">→ {applied}</span>
                        )}
                        {collides && (
                          <span className="ml-1 text-[10px]">
                            (chevauchait {2 * o - LEGACY_GAP[i]})
                          </span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ── Les quatre viewports ── */}
      <section className="space-y-8">
        {VIEWPORTS.map((v) => (
          <div key={v.px}>
            <h2 className="text-content-strong mb-2 text-lg font-semibold">
              {v.palier}
              <span className="text-content-subtle ml-2 font-mono text-xs">
                viewport {v.px} px · carte {v.card} px · réserve appliquée{' '}
                {appliedPadding(v.card, count)} px
              </span>
            </h2>
            <div className="border-line-subtle overflow-x-auto rounded-lg border">
              <iframe
                // `key` sur l'état : sans lui, React réutilise l'iframe et le
                // navigateur garde le document précédent au changement de bascule.
                key={`${count}-${legacy ? 'legacy' : 'fixed'}`}
                src={`/dev/carousel?frame=1&count=${count}${legacy ? '&legacy=1' : ''}`}
                title={`${v.palier} — ${legacy ? 'avant' : 'après'}`}
                width={v.px}
                height={v.height}
                className="block"
              />
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}
