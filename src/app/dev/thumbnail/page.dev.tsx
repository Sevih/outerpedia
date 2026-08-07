/**
 * RENDU DE CONTRÔLE DE `Thumbnail` (dev-only, route `/dev/thumbnail` —
 * `.dev.tsx` non buildé en prod).
 *
 * La vignette est la transcription de DEUX prefabs (`uimonsterthumbnail` et
 * `uicharacterthumbnail`, un seul MonoBehaviour derrière) : cette page existe
 * pour les CONFRONTER au jeu, pas pour les illustrer. Une rangée par axe que le
 * prefab fait varier, et rien de plus — un axe se vérifie sur trois vignettes
 * aussi bien que sur dix.
 *
 * Ce qu'on ne montre PAS, volontairement : le fond d'un MONSTRE selon la rareté.
 * Le jeu choisit par `CHARACTER_TYPE` (`SetMonsterBG`), point. Chez le PERSO
 * c'est l'inverse, et cette page met les deux règles face à face — c'est le seul
 * endroit où la confusion se dissipe.
 *
 * Les monstres sont choisis en dur et pour une raison : le manifeste d'assets ne
 * collecte que les vignettes RÉFÉRENCÉES (rencontres, guides, tours…), donc un
 * monstre pris au hasard afficherait un 404. Ceux-ci ont tous leur sprite.
 * Composant SERVEUR — il lit la donnée générée directement.
 */
import { getMonster } from '@/lib/data/monsters';
import { getAllCharacters } from '@/lib/data/characters';
import { lRec } from '@/lib/i18n/localize';
import { Thumbnail } from '@/components/ui/Thumbnail';
import type { Character, Monster } from '@contracts';

export const metadata = { title: 'Vignette du jeu' };

/** Réf de contenu cassée = bug de page de test : on casse, pas de repli muet. */
function monster(id: string): Monster & { id: string } {
  const m = getMonster(id);
  if (!m) throw new Error(`/dev/thumbnail : monstre « ${id} » absent de monsters.json`);
  return { ...m, id };
}

/**
 * Le premier perso de chaque rareté, par id croissant. Trié pour que la page
 * rende la même chose d'une exécution à l'autre — l'ordre du JSON généré n'est
 * pas un contrat. Contrairement aux monstres, pas de contrainte de sprite ici :
 * toutes les face icons sont collectées.
 */
function firstOfRarity(rarity: number): Character {
  const c = getAllCharacters()
    .filter((x) => x.rarity === rarity)
    .sort((a, b) => a.id.localeCompare(b.id))[0];
  if (!c) throw new Error(`/dev/thumbnail : aucun perso de rareté ${rarity}`);
  return c;
}

const name = (e: { name: Monster['name'] }) => lRec(e.name, 'en') || e.name.en;

// --- séries : une par axe des prefabs, réduites au strict nécessaire ----------

/** Les trois fonds que `SetMonsterBG` sait produire. */
const BY_TYPE = ['400102', '402001', '400101'].map(monster);
/** Les cinq éléments — chaque sprite a son propre cadrage, d'où les cinq. */
const BY_ELEMENT = ['400201', '400801', '400301', '402101', '400101'].map(monster);
/** Les cinq classes. */
const BY_CLASS = ['400101', '401201', '402602', '400201', '402701'].map(monster);
/** Un creux, un plein, le maximum : le chevauchement se lit là. */
const BY_STARS = ['400503', '401102', '403001'].map(monster);
/** Vignette `MT_` d'un côté, modèle de perso (`icon` en « 2 » → `FI_`) de l'autre. */
const BY_ICON = ['400301', '400101'].map(monster);

const SIZES = [
  { px: 32, cls: 'h-8 w-8' },
  { px: 64, cls: 'h-16 w-16' },
  { px: 128, cls: 'h-32 w-32' },
];

/** Ce que les deux prefabs font DIFFÉREMMENT — le reste est commun. */
const DIFFS = [
  ['Fond', 'MT_Slot_Normal / Magic / Rare, par TYPE', 'CT_Slot_Magic / Rare / Unique, par RARETÉ'],
  ['Vignetage', 'CT_Slot_Dim_2 à 54,9 %', 'le même sprite, à 65,1 %'],
  [
    'Ombre du bas',
    'MT_Slot_Bottom, border nul → étirée',
    'CT_Slot_Bottom, border 28 → 9-slice (même bitmap)',
  ],
  ['Élément', 'boîte 46 à (+7,77 ; +5,61)', 'boîte 50 × 0,9 = 45 à (+6,1 ; +5,61)'],
  ['Classe', '35×35 à (+0,19 ; −39,08)', '34×34 à (0 ; −39,08)'],
  [
    'Étoiles',
    'MT_Slot_Star, un compteur, centre y = 114',
    'CM_icon_star_y/o/r/v, table de transcendance, y = 113',
  ],
  ['Niveau', '#FFFFF3, Shadow 80 % + Outline 40 %', '#F1F1F1, Outline 50,2 % + Shadow 50 %'],
  ['Bannière', 'MT_Boss', 'CT_Slot_Boss'],
];

// --- vues ---------------------------------------------------------------------

function Section({
  title,
  note,
  children,
}: {
  title: string;
  note?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="border-line-subtle bg-surface-raised rounded-xl border p-4">
      <h2 className="text-content-strong text-sm font-semibold tracking-wide uppercase">{title}</h2>
      {note && <p className="text-content-muted mt-1 text-sm">{note}</p>}
      <div className="mt-3">{children}</div>
    </section>
  );
}

/** Un axe des prefabs : ce qu'il fait varier à gauche, les vignettes à droite. */
function Row({
  label,
  note,
  children,
}: {
  label: string;
  note: string;
  children: React.ReactNode;
}) {
  return (
    <div className="border-line-subtle flex flex-col gap-3 border-t py-4 first:border-t-0 first:pt-0 sm:flex-row sm:gap-6">
      <div className="shrink-0 sm:w-64">
        <h3 className="text-content-strong text-sm font-semibold">{label}</h3>
        <p className="text-content-muted mt-0.5 text-xs leading-snug">{note}</p>
      </div>
      <div className="flex flex-wrap gap-4">{children}</div>
    </div>
  );
}

/** Une légende sous une vignette. Marge généreuse : l'élément sort de la case. */
function Cell({
  title,
  label,
  children,
}: {
  title: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <figure className="flex w-28 flex-col items-center gap-2">
      <div className="pt-2 pr-2">{children}</div>
      <figcaption className="text-content-muted text-center text-[11px] leading-tight">
        <span className="text-content block truncate" title={title}>
          {title}
        </span>
        <span className="font-mono">{label}</span>
      </figcaption>
    </figure>
  );
}

function MonsterCell({
  m,
  label,
  level,
  size = 'h-24 w-24',
}: {
  m: Monster & { id: string };
  label: string;
  level?: number;
  size?: string;
}) {
  return (
    <Cell title={name(m)} label={label}>
      <Thumbnail
        kind="monster"
        icon={m.icon}
        type={m.type}
        element={m.element}
        cls={m.class}
        stars={m.rarity}
        level={level}
        name={name(m)}
        className={size}
      />
    </Cell>
  );
}

function CharacterCell({
  c,
  label,
  transcendence,
  level,
}: {
  c: Character;
  label: string;
  transcendence?: number;
  level?: number;
}) {
  return (
    <Cell title={name(c)} label={label}>
      <Thumbnail
        kind="character"
        id={c.id}
        rarity={c.rarity}
        transcendence={transcendence}
        element={c.element}
        cls={c.class}
        level={level}
        name={name(c)}
        className="h-24 w-24"
      />
    </Cell>
  );
}

export default function ThumbnailDev() {
  const ref = BY_TYPE[2];
  /** Un perso par rareté : c'est elle qui choisit le fond de leur côté. */
  const chars = [1, 2, 3].map(firstOfRarity);

  return (
    <div className="bg-surface-base text-content min-h-screen space-y-4 p-6">
      <header>
        <h1 className="text-content-strong text-2xl font-bold">Vignette du jeu</h1>
        <p className="text-content-muted mt-1 max-w-3xl text-sm">
          Transcription des prefabs{' '}
          <code className="text-content">prefabs/ui/uimonsterthumbnail</code> et{' '}
          <code className="text-content">prefabs/ui/uicharacterthumbnail</code> — un seul
          MonoBehaviour derrière (<code className="text-content">CUICharacterThumbnail</code>), donc
          un seul composant à deux habillages. Chaque position vient d&apos;un RectTransform relevé
          aux bundles, pas d&apos;un réglage à l&apos;œil.
        </p>
      </header>

      <Section
        title="Les deux habillages"
        note="Tout ce qui n'est pas dans ce tableau est COMMUN aux deux prefabs : case de 128, portrait de 122, ombre du bas de 122×32 remontée de 3, étoiles de 22 au pas de 18, ancrages au coin haut-droit, bannière de 60×20 au coin haut-gauche, cartouche de niveau jamais dessiné."
      >
        <div className="overflow-x-auto">
          <table className="w-full min-w-2xl text-left text-xs">
            <thead className="text-content-subtle font-mono uppercase">
              <tr>
                <th className="py-1 pr-4 font-normal">Calque</th>
                <th className="py-1 pr-4 font-normal">Monstre</th>
                <th className="py-1 font-normal">Personnage</th>
              </tr>
            </thead>
            <tbody className="text-content">
              {DIFFS.map(([layer, mon, chr]) => (
                <tr key={layer} className="border-line-subtle border-t">
                  <td className="py-1.5 pr-4 font-mono">{layer}</td>
                  <td className="py-1.5 pr-4">{mon}</td>
                  <td className="py-1.5">{chr}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <Section
        title="Tailles"
        note="Tout est exprimé en pourcentage de la case : une seule géométrie, quelle que soit la taille rendue. Le trait pointillé montre les 128 unités — la boîte de l'élément est ancrée HORS de la case, elle sort, et le prefab le veut. À l'appelant de laisser la marge, ou de rogner en connaissance de cause."
      >
        <div className="flex flex-wrap items-end gap-8 p-2">
          {SIZES.map((s) => (
            <figure key={s.px} className="flex flex-col items-center gap-2">
              <div className="border-accent/60 border border-dashed">
                <Thumbnail
                  kind="monster"
                  icon={ref.icon}
                  type={ref.type}
                  element={ref.element}
                  cls={ref.class}
                  stars={ref.rarity}
                  level={80}
                  name={name(ref)}
                  className={s.cls}
                />
              </div>
              <figcaption className="text-content-muted font-mono text-[11px]">{s.px}px</figcaption>
            </figure>
          ))}
        </div>
      </Section>

      <Section title="Monstre — ce que le prefab fait varier">
        <Row
          label="Fond — par TYPE"
          note="SetMonsterBG(CHARACTER_TYPE) : monster → Normal, named → Magic, boss → Rare. area_boss et season_boss retombent sur Rare, d'où trois fonds pour cinq types. La rareté n'entre pas dans ce choix : elle part dans les étoiles."
        >
          {BY_TYPE.map((m) => (
            <MonsterCell key={m.id} m={m} label={m.type} />
          ))}
        </Row>

        <Row
          label="Élément"
          note="Chaque sprite a son propre cadrage utile (46 pour Earth/Fire, 50 pour Water/Light/Dark) — le prefab dimensionne chaque boîte, un pourcentage unique les déformerait."
        >
          {BY_ELEMENT.map((m) => (
            <MonsterCell key={m.id + m.element} m={m} label={m.element} />
          ))}
        </Row>

        <Row label="Classe" note="35×35, même ancrage que l'élément, posée dessous.">
          {BY_CLASS.map((m) => (
            <MonsterCell key={m.id + m.class} m={m} label={m.class} />
          ))}
        </Row>

        <Row
          label="Étoiles"
          note="1 à 6, 22×22 avec un pas de 18 : elles se CHEVAUCHENT (le HorizontalLayoutGroup porte un espacement de −4). C'est ici que la rareté d'un monstre se lit, pas dans le fond."
        >
          {BY_STARS.map((m) => (
            <MonsterCell key={m.id + m.rarity} m={m} label={`${m.rarity}★ · ${m.type}`} />
          ))}
        </Row>

        <Row
          label="Niveau"
          note="Aucune plaque derrière : le nœud Level porte bien un sprite, mais à alpha 0 — il n'est jamais dessiné. Le chiffre tient sur une Shadow noire à 80 % et un Outline noir à 40 %, en graisse normale."
        >
          {[9, 120].map((lvl) => (
            <MonsterCell key={lvl} m={ref} label={`niveau ${lvl}`} level={lvl} />
          ))}
        </Row>

        <Row
          label="Source de l'icône"
          note="Un « icon » commençant par 2 est un modèle de perso réutilisé en boss : la source devient la face icon composée. Même traitement des deux côtés — le cadre du prefab FaceIcon fait 122×122 pour les 234 persos comme pour les 499 monstres."
        >
          {BY_ICON.map((m) => (
            <MonsterCell
              key={m.id}
              m={m}
              label={m.icon.startsWith('2') ? `FI_${m.icon}` : `MT_${m.icon}`}
            />
          ))}
        </Row>
      </Section>

      <Section title="Personnage — l'autre habillage">
        <Row
          label="Fond — par RARETÉ"
          note="m_BGObjects = [Magic, Rare, Unique], indexé sur le BasicStar : 1 → Magic, 2 → Rare, 3 → Unique. C'est bien l'inverse du monstre, et c'est le SetData privé qui le dit — il prend _byBasicStar ET _nStar, deux paramètres distincts."
        >
          {chars.map((c) => (
            <CharacterCell key={c.id} c={c} label={`${c.rarity}★`} />
          ))}
        </Row>

        <Row
          label="Étoiles par PALIER"
          note="La règle n'est pas dans le prefab (ses quatre rangées d'étoiles sont des maquettes inactives, dont une contredit le jeu) mais dans CharacterTranscendentTemplet. Le nombre d'étoiles ne suit pas le palier — 4 au palier 5, 5 aux paliers 6, 7 ET 8, 6 au palier 9 — et une seule étoile se colore, la dernière, quand le palier porte un « + »."
        >
          {[3, 4, 5, 6, 7, 8, 9].map((t) => (
            <CharacterCell key={t} c={chars[2]} label={`palier ${t}`} transcendence={t} />
          ))}
        </Row>

        <Row
          label="Niveau"
          note="Même piège que le monstre (cartouche à alpha 0), mais deux effets différents : un Outline à 50,2 % et une Shadow à 50 %, sur un blanc plus froid (#F1F1F1 contre #FFFFF3)."
        >
          {[9, 120].map((lvl) => (
            <CharacterCell key={lvl} c={chars[2]} label={`niveau ${lvl}`} level={lvl} />
          ))}
        </Row>
      </Section>
    </div>
  );
}
