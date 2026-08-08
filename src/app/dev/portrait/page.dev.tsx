/**
 * RENDU DE CONTRÔLE DE `Portrait` (dev-only, route `/dev/portrait` — `.dev.tsx`
 * non buildé en prod).
 *
 * Le portrait est la transcription de `CharacterThumbnailList` — la carte de la
 * page « personnages ». Cette page existe pour la CONFRONTER au jeu, pas pour
 * l'illustrer : une rangée par axe que le prefab fait varier, et rien de plus.
 *
 * Le jeu a un second nœud en 180×344, `CUICharacterLongThumbnail` (celui que
 * `CUIFaceIcon.m_LongThumbnail` désigne), qui porte le même MonoBehaviour. Il a été
 * transcrit d'abord puis écarté : le site ne veut que la carte. Les quatre valeurs
 * où il diverge sont notées en commentaire dans `Portrait`.
 *
 * Elle porte aussi ce qui ne se voit PAS sur un rendu — ce que le portrait ne
 * partage pas avec la vignette carrée, et les écarts que les deux copies
 * manuscrites actuelles (`CharacterCard`, mode « cartes » du tier-list-maker)
 * portent aujourd'hui. C'est le tableau de bord du portage, pas une galerie.
 *
 * Composant SERVEUR — il lit la donnée générée directement.
 */
import { fitsOnTwoLines } from '@/components/character/CharacterPortrait';
import { Portrait } from '@/components/character/Portrait';
import { characterNamePrefix, getAllCharacters } from '@/lib/data/characters';
import { loadShortNames } from '@/lib/data/short-names';
import { lRec } from '@/lib/i18n/localize';
import type { Character } from '@contracts';

export const metadata = { title: 'Portrait du jeu' };

const name = (c: Character) => lRec(c.name, 'en') || c.name.en;

/** Réf de contenu cassée = bug de page de test : on casse, pas de repli muet. */
function byId(id: string): Character {
  const c = getAllCharacters().find((x) => x.id === id);
  if (!c) throw new Error(`/dev/portrait : perso « ${id} » absent de characters.json`);
  return c;
}

/**
 * Le premier perso de chaque axe, par id croissant — trié pour que la page rende
 * la même chose d'une exécution à l'autre (l'ordre du JSON généré n'est pas un
 * contrat). Tous les portraits sont collectés : pas de contrainte de sprite.
 */
function first(pred: (c: Character) => boolean): Character {
  const c = getAllCharacters()
    .filter(pred)
    .sort((a, b) => a.id.localeCompare(b.id))[0];
  if (!c) throw new Error('/dev/portrait : aucun perso pour cet axe');
  return c;
}

/**
 * Ce qui s'écrit SOUS le cadre quand l'appelant coupe `hideName`, et c'est la règle
 * de `CharacterPortrait` — appelée, pas recopiée.
 *
 * UN SEUL BLOC « titre + nom », pas deux lignes : c'est la forme que les appelants
 * passent déjà (« Holy Night's Blessing Dianne »), et c'est elle que mesure
 * `fitsOnTwoLines`. Séparer le titre du nom paraîtrait plus fidèle au cadre, mais
 * viderait la règle de son sens : un nom seul tient presque toujours sur deux
 * lignes, et le repli sur le nom court ne se déclencherait jamais.
 *
 * Le `+ 24` est celui de là-bas : le libellé déborde un peu du portrait, c'est voulu.
 */
const SHORT_NAMES = loadShortNames();

function belowLabel(c: Character, px: number): string {
  const prefix = characterNamePrefix(c, 'en');
  const full = prefix ? `${prefix} ${name(c)}` : name(c);
  const short = lRec(SHORT_NAMES[c.id] ?? {}, 'en');
  return short && !fitsOnTwoLines(full, px + 24) ? short : full;
}

const ELEMENTS = ['fire', 'water', 'earth', 'light', 'dark'] as const;
const CLASSES = ['striker', 'defender', 'ranger', 'mage', 'healer'] as const;

const BY_ELEMENT = ELEMENTS.map((e) => first((c) => c.element === e));
const BY_CLASS = CLASSES.map((k) => first((c) => c.class === k));
const BY_RARITY = [1, 2, 3].map((r) => first((c) => c.rarity === r));

/**
 * Sujets choisis par Sevih, et tous deux 3★ — ce qui compte : c'est la SEULE
 * rareté dont les paliers colorent une étoile (les 1★ et 2★ gardent leur « + »
 * en jaune, invisible). Un 3★ est donc le seul cas où le rail se lit vraiment.
 */
const TRANS_SUBJECT = byId('2000093');
const STATE_SUBJECT = byId('2000086');
/** Les paliers d'un 3★, de sa rareté à 9 — cf. la table `TRANSCENDENCE`. */
const TRANS_STEPS = [3, 4, 5, 6, 7, 8, 9];

/**
 * Le `px` double la classe Tailwind parce que la règle des deux lignes de
 * `CharacterPortrait` raisonne en pixels, pas en classes — c'est elle qu'on rejoue
 * plus bas, telle quelle.
 */
const SIZES = [
  { label: 'w-20 · 80 px', cls: 'w-20', px: 80 },
  { label: 'w-32 · 128 px', cls: 'w-32', px: 128 },
  { label: 'w-45 · 180 px (prefab)', cls: 'w-45', px: 180 },
];

/**
 * LE SEUL NOMBRE DE CETTE PAGE QUI NE VIENNE PAS DU JEU, et il est ici — pas dans
 * `Portrait` — précisément pour ça.
 *
 * En dessous de cette largeur de cadre, l'appelant coupe `hideName` et réécrit le
 * nom sous le portrait. La valeur : le nom rendu vaut 16,9 unités sur 180, soit
 * `16,9 × largeur / 180` px ; il passe sous `text-xs` (12 px, le plus petit corps
 * du site) en dessous de 128. C'est un choix de lisibilité, pas un relevé — et
 * c'est cette rangée qui doit le faire réviser, à l'œil, quand on branchera les
 * appelants.
 */
const NAME_INSIDE_MIN_PX = 128;

/**
 * Les cas qui mettent `m_BestFit` à l'épreuve : le nom le plus court du site, le
 * plus long, le titre le plus long, et le même nom dans les quatre écritures.
 *
 * « Ais Wallenstein » est le cas qui a fait tomber le premier jet : la largeur y
 * était ESTIMÉE par classe de caractère et sortait 10,6 % trop courte, assez pour
 * que le « n » final passe hors cadre. Elle est maintenant lue au `hmtx` des deux
 * polices du jeu (SUIT ExtraBold pour le nom, SUIT Bold pour le titre). Les
 * trois écritures non latines vérifient l'autre moitié de la table — hangûl à
 * 0,874, kana et idéogrammes à pleine chasse sur une police système.
 */
const SHORTEST = byId('2000001'); // « K » — un seul caractère
const LONGEST = byId('2000096'); // « Ais Wallenstein » — 15
const LONGEST_TITLE = byId('2000022'); // Noa, dont le titre fait 40 caractères
const BEST_FIT_CASES: { k: string; c: Character; n: string; p?: string }[] = [
  { k: 'le plus court (1 car.)', c: SHORTEST, n: name(SHORTEST) },
  { k: 'le plus long (15 car.)', c: LONGEST, n: name(LONGEST) },
  {
    k: 'titre le plus long (40 car.)',
    c: LONGEST_TITLE,
    n: name(LONGEST_TITLE),
    // Ce titre-là, le jeu ne l'affiche PAS (`showNickName` est absent pour Noa) :
    // on le force ici, et seulement ici, pour éprouver le pire cas de réduction.
    p: lRec(LONGEST_TITLE.nickname, 'en') || undefined,
  },
  ...(['jp', 'kr', 'zh'] as const).map((lang) => ({
    k: `le plus long en ${lang}`,
    c: LONGEST,
    n: lRec(LONGEST.name, lang) || name(LONGEST),
  })),
];

/**
 * Ce que le PORTRAIT fait autrement que la VIGNETTE CARRÉE. Les deux portent le
 * même MonoBehaviour (`CUICharacterThumbnail`) — d'où l'intérêt de la liste :
 * elle dit ce qu'un même composant produit de radicalement différent.
 */
const VS_THUMBNAIL: [string, string, string][] = [
  ['Cadre', 'case CARRÉE de 128', 'rectangle de 180×344 (ratio 1,911:1, pas 1:2)'],
  [
    'Écriture du prefab',
    'unités absolues + `m_AnchoredPosition`',
    'unités absolues aussi — mais l’autre nœud écrit en ancres NORMALISÉES, d’où des rects RÉSOLUS pour pouvoir les comparer',
  ],
  [
    'Fond',
    '`CT_Slot_Magic/Rare/Unique` par rareté',
    'aucun — `m_BGObjects` est VIDE, le fond est cuit dans le PNG',
  ],
  [
    'Art',
    'face icon composée en rognant le portrait',
    'le portrait ENTIER, plein cadre, sans composition',
  ],
  ['Masque', 'aucun', '`CT_Mask_Thumbnail` en 9-slice — mais opaque partout, donc inerte'],
  [
    'Vignetage',
    '`CT_Slot_Dim_2`, décor FIXE',
    'aucun décor ; `Dim` est l’état de `SetDim`, éteint par défaut',
  ],
  [
    'Ombre du bas',
    '`CT_Slot_Bottom` 9-slice, toujours posée',
    '`CT_Detail_Bottom` présent mais INACTIF partout',
  ],
  [
    'Étoiles',
    'rangée HORIZONTALE de n étoiles, centrée',
    'rail VERTICAL de 6 creux fixes, remplis par le HAUT',
  ],
  [
    'Teinte des étoiles',
    '`m_Color` blanc',
    '`m_Color` blanc aussi — c’est l’autre nœud qui les teinte en #FCDB42, le seul calque où les deux divergent en couleur',
  ],
  ['Élément', 'coin HAUT-droit, débordant', 'coin BAS-droit, 46×46, à 9,4 du bord'],
  [
    'Classe',
    'coin haut-droit sous l’élément, 34',
    'coin bas-droit au-dessus de l’élément, 37, à 15 du bord',
  ],
  [
    'Niveau',
    'un texte, corps 20, `m_BestFit`',
    'DEUX textes (« Lv. » 15 + nombre 25) en layout horizontal, italiques',
  ],
  ['Nom', 'absent du prefab', '`Text_Name` corps 22, plus un `Text_Demi` optionnel au-dessus'],
  [
    'Police',
    'une seule, celle du site',
    'DEUX : SUIT ExtraBold (nom, niveau) et SUIT Bold (titre), embarquées depuis le jeu',
  ],
  ['Bannière BOSS', '`CT_Slot_Boss` au coin haut-gauche', 'aucune — `m_BossImage` est NULL'],
];

/**
 * Les ÉCARTS des deux copies manuscrites actuelles. Chacun est un bug que le site
 * porte aujourd'hui ; le branchement des appelants est un second lot.
 */
const DRIFT: { where: string; what: string; game: string }[] = [
  {
    where: 'CharacterCard — proportions',
    what: '66×128, 100×192, 120×231 → ratio 0,516 / 0,521 / 0,519',
    game: '180×344 = 0,5233. Les trois tailles écrasent l’art de 0,3 à 1,4 %.',
  },
  {
    where: 'CharacterCard — cadrage',
    what: '`object-cover` sur un cadre au mauvais ratio → l’art est ROGNÉ',
    game: 'le cadre est à la taille de l’art : rien n’est rogné.',
  },
  {
    where: 'CharacterCard — dégradé du bas',
    what: 'ajoute `bg-linear-to-t from-black/80` sur le quart inférieur',
    game: 'aucun dégradé : `LowBg` est inactif dans les onze copies du prefab.',
  },
  {
    where: 'CharacterCard — étoiles',
    what: 'compte les étoiles = `rarity`, sans creux, alignées en HAUT du slot',
    game: '6 creux fixes ; le nombre vient de `ShowUIStar`, pas de la rareté (un 3★ non transcendé en montre 3, un palier 6 en montre 5).',
  },
  {
    where: 'CharacterCard — badge de recrutement',
    what: 'pose `RECRUIT_TAG_SPRITE` au coin haut-gauche',
    game: 'aucun badge de RECRUTEMENT : `m_BossImage`, `m_NewImage`, `m_RareFrameImage`, `m_RecommandImage` sont NULL. Les deux seuls que le jeu pose sont core-fusion et synchro, qui partagent un emplacement.',
  },
  {
    where: 'CharacterCard — élément / classe',
    what: 'même taille pour les deux (18/22/26 px), collés au même `right-1`',
    game: 'élément 46 et classe 37, à des retraits DIFFÉRENTS (9,4 et 15).',
  },
  {
    where: 'CharacterCard — nom',
    what: '`text-shadow` à 4 copies de 1 px, `font-bold`',
    game: 'Outline(1,−1) à 50 % ET Shadow(1,−1) à 50 %, graisse NORMALE.',
  },
  {
    where: 'tier-list-maker (mode « cartes »)',
    what: 'seconde copie manuscrite, avec des nombres ENCORE différents : étoiles `h-3 w-3` sans slot, classe à `bottom-[26%]`, élément à `bottom-1`, dégradé du bas',
    game: 'les mêmes valeurs que ci-dessus — deux copies qui divergent l’une de l’autre autant que du jeu.',
  },
  {
    where: 'tier-list-maker — jumeau canvas',
    what: 'l’export PNG redessine tout au `drawImage`, une TROISIÈME fois',
    game: 'à faire dériver de la même table que le rendu DOM, sinon l’export et l’écran divergeront toujours.',
  },
];

/** Ce qui reste incertain — listé à part, jamais noyé dans le reste. */
const UNSURE: string[] = [
  'La teinte #FCDB42 des étoiles allumées — relevée sur l’AUTRE nœud, celui qu’on ne rend plus. Le nœud rendu laisse les siennes blanches, donc le cas courant est exact et rien ne manque à l’écran ; ce qui reste incertain, c’est qu’on ne saurait pas la rendre s’il le fallait : `m_Color` MULTIPLIE le sprite, ce qui n’a pas d’équivalent CSS simple sur une image non monochrome. La valeur est en commentaire dans `Portrait`, avec les trois autres divergences.',
  'Le sprite exact des étoiles allumées. Le prefab pose `CT_Slot_Star`, mais `SetStarImage` fait `set_sprite` avec une ressource chargée par nom — le prefab est donc écrasé au runtime. Le littéral n’a pas pu être résolu (les slots de metadata ne sont pas mappés dans le dump). On sert `CM_icon_star_*`, comme la vignette carrée, puisque c’est la MÊME fonction qui charge : les deux bitmaps sont de toute façon quasi identiques (233,184,61 contre 239,188,62).',
  'La largeur des KANA et des IDÉOGRAMMES, et d’eux seuls. Le reste ne s’estime plus : `datagen/assets/extract-font-metrics.py` relit le `hmtx` des deux polices et écrit `portrait-font-metrics.json` — 263 chasses par police, plus la chasse unique des 11 172 syllabes hangûl (0,874, identique dans les deux). Ce que ces polices ne couvrent PAS, c’est le japonais et le chinois (0 kana, 0 idéogramme sur 20 992) : là, c’est une police SYSTÈME qui peint, dans le jeu comme ici, et on la suppose pleine chasse — vrai de toutes les polices CJK usuelles, mais non mesuré.',
];

/**
 * Ce que le désassemblage a tranché, et qui ne se lit nulle part dans le prefab :
 * gardé sur la page parce que c'est l'affirmation la plus facile à contredire
 * d'un coup d'œil au jeu, donc celle qui mérite le plus d'être exposée.
 */
const FROM_CODE: string[] = [
  'Le SENS de remplissage du rail. `CUtilUI.SetStarImage` éteint tout le tableau, puis allume `m_StarImage[0..ShowUIStar-1]` par indexation DIRECTE et colore `m_StarImage[ShowUIStar-1]`. Le prefab câble ce tableau `[Star5 … Star0]` — index 0 en HAUT. D’où : les étoiles gagnées occupent le haut, les creux restent en bas, et la teinte du « + » va à la plus BASSE des allumées.',
  'Le NOMBRE d’étoiles, qui vient de `GetCharacterTranscendent` (colonnes `ShowUIStar` / `StarColor` / `StarPlus`) et non d’un compteur. C’est la MÊME fonction que la vignette carrée : la table est importée de `Thumbnail`, pas recopiée.',
  'Que le niveau n’est PAS contraint en largeur : le `ContentSizeFitter` de `Level` a `m_HorizontalFit = 2` (PreferredSize), donc la boîte s’ajuste au nombre. Seuls son `left` et son `top` sont posés.',
];

function Row({
  title,
  desc,
  chars,
  render,
}: {
  title: string;
  desc: string;
  chars: Character[];
  render: (c: Character, i: number) => React.ReactNode;
}) {
  return (
    <section className="mb-8">
      <h2 className="text-content-strong font-semibold">{title}</h2>
      <p className="text-content-muted mb-3 text-sm">{desc}</p>
      <div className="flex flex-wrap items-end gap-4">{chars.map(render)}</div>
    </section>
  );
}

export default function DevPortrait() {
  return (
    <div className="bg-surface-base text-content min-h-screen p-6">
      <header className="mb-8">
        <h1 className="text-content-strong text-2xl font-bold">Portrait du jeu</h1>
        <p className="text-content-muted mt-1 max-w-3xl text-sm">
          Transcription de <code>CharacterThumbnailList</code>, la carte de la page « personnages »,
          dans <code>CUICharacterMainPageScrollCell</code>. Le nombre d’étoiles et leur sens de
          remplissage viennent du code (<code>CUtilUI.SetStarImage</code>), pas du prefab ; les
          chasses des deux polices viennent des fichiers eux-mêmes (
          <code>portrait-font-metrics.json</code>).
        </p>
      </header>

      <Row
        title="Les cinq éléments"
        desc="Coin bas-droit, boîte de 46×46 à 9,4 unités du bord. Chaque sprite est celui de la vignette carrée (CT_Element_*)."
        chars={BY_ELEMENT}
        render={(c) => (
          <figure key={c.id} className="flex flex-col items-center gap-1">
            <Portrait
              id={c.id}
              name={name(c)}
              rarity={c.rarity}
              element={c.element}
              cls={c.class}
              level={100}
            />
            <figcaption className="text-content-subtle font-mono text-xs">{c.element}</figcaption>
          </figure>
        )}
      />

      <Row
        title="Les cinq classes"
        desc="Juste au-dessus de l’élément, boîte de 37×37 à 15 unités du bord — un retrait DIFFÉRENT de celui de l’élément, et c’est dans la donnée."
        chars={BY_CLASS}
        render={(c) => (
          <figure key={c.id} className="flex flex-col items-center gap-1">
            <Portrait
              id={c.id}
              name={name(c)}
              rarity={c.rarity}
              element={c.element}
              cls={c.class}
              level={100}
            />
            <figcaption className="text-content-subtle font-mono text-xs">{c.class}</figcaption>
          </figure>
        )}
      />

      <Row
        title="Les trois raretés"
        desc="Le fond ne change PAS avec la rareté — il est cuit dans le PNG, et m_BGObjects est vide. Seul le nombre d’étoiles bouge."
        chars={BY_RARITY}
        render={(c) => (
          <figure key={c.id} className="flex flex-col items-center gap-1">
            <Portrait
              id={c.id}
              name={name(c)}
              rarity={c.rarity}
              element={c.element}
              cls={c.class}
              level={100}
            />
            <figcaption className="text-content-subtle font-mono text-xs">{c.rarity}★</figcaption>
          </figure>
        )}
      />

      <section className="mb-8">
        <h2 className="text-content-strong font-semibold">Les paliers de transcendance</h2>
        <p className="text-content-muted mb-3 text-sm">
          Le nombre d’étoiles NE SUIT PAS le palier : 4 au palier 5, puis 5 aux paliers 6, 7 et 8,
          puis 6 au palier 9. Les creux restants se voient en bas — le remplissage se fait par le
          HAUT, et la teinte du « + » va à la plus BASSE des allumées.
        </p>
        <div className="flex flex-wrap items-end gap-4">
          {TRANS_STEPS.map((t) => (
            <figure key={t} className="flex flex-col items-center gap-1">
              <Portrait
                id={TRANS_SUBJECT.id}
                name={name(TRANS_SUBJECT)}
                rarity={TRANS_SUBJECT.rarity}
                transcendence={t}
                element={TRANS_SUBJECT.element}
                cls={TRANS_SUBJECT.class}
                className="w-28"
              />
              <figcaption className="text-content-subtle font-mono text-xs">palier {t}</figcaption>
            </figure>
          ))}
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-content-strong font-semibold">Les états, et le texte optionnel</h2>
        <p className="text-content-muted mb-3 text-sm">
          <code>dim</code> est <code>SetDim(true)</code> : un aplat noir à 69,8 %, pas un vignetage.
          Le prefab le laisse actif en éditeur — le rendre par défaut noircirait tout.
        </p>
        <div className="flex flex-wrap items-end gap-4">
          {[
            { k: 'nu (ni nom ni niveau)', p: { hideName: true } },
            { k: 'nom seul', p: {} },
            { k: 'nom + niveau', p: { level: 100 } },
            { k: 'niveau à 3 chiffres', p: { level: 999 } },
            // TOUS LES PERSOS N'ONT PAS DE TITRE À AFFICHER, et ça ne se devine
            // pas du `nickname` — les 124 en ont un. L'indication est
            // `showNickName`, que le datagen tire du jeu : 21 persos sur 124.
            // La règle du site vit dans `characterNamePrefix`, qui gère aussi le
            // « Core Fusion » des entités fusionnées ; on l'appelle au lieu de
            // relire le nickname, sinon 103 portraits porteraient un titre que le
            // jeu ne montre pas.
            {
              k: 'avec un titre (Text_Demi)',
              p: { level: 100, prefix: characterNamePrefix(STATE_SUBJECT, 'en') ?? undefined },
            },
            { k: 'dim', p: { level: 100, dim: true } },
          ].map(({ k, p }) => (
            <figure key={k} className="flex flex-col items-center gap-1">
              <Portrait
                id={STATE_SUBJECT.id}
                name={name(STATE_SUBJECT)}
                rarity={STATE_SUBJECT.rarity}
                element={STATE_SUBJECT.element}
                cls={STATE_SUBJECT.class}
                className="w-32"
                {...p}
              />
              <figcaption className="text-content-subtle text-xs">{k}</figcaption>
            </figure>
          ))}
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-content-strong font-semibold">
          Trois tailles — et le point où le nom sort du cadre
        </h2>
        <p className="text-content-muted mb-3 max-w-3xl text-sm">
          Toute la géométrie est en % du cadre : le texte suit par <code>@container</code>, et la
          proportion est tenue par <code>aspect-180/344</code>. Il en découle MÉCANIQUEMENT que le
          texte rétrécit avec le portrait — le nom passe de 16,9 px à 180 de large, à 12,0 px à 128,
          à 7,5 px à 80 ; le titre, lui, de 14 à 10 puis 6,2.
        </p>
        <p className="text-content-muted mb-3 max-w-3xl text-sm">
          Chaque taille est donc rendue ICI COMME L’APPELANT DEVRA LA RENDRE, pas deux fois : au
          large, le nom et son titre restent dans le cadre ; en dessous de{' '}
          <code>{NAME_INSIDE_MIN_PX} px</code>, l’appelant coupe avec <code>hideName</code> et les
          réécrit sous le cadre en un SEUL bloc « titre + nom » — la forme que les appelants passent
          déjà. Les séparer en deux lignes paraîtrait plus fidèle au cadre, mais viderait la règle
          de son sens : un nom seul tient presque toujours sur deux lignes.
        </p>
        <p className="text-content-muted mb-3 max-w-3xl text-sm">
          <strong className="text-content-strong">
            Ce seuil est LE SEUL nombre de cette page qui ne vienne pas du jeu.
          </strong>{' '}
          Il vaut la largeur à laquelle le nom tombe sous <code>text-xs</code> (12 px), le plus
          petit corps du site — c’est un choix, pas un relevé, et c’est pour ça qu’il vit ici et non
          dans <code>Portrait</code>. Le repli sur le nom court, lui, n’est pas imité mais EXÉCUTÉ :{' '}
          <code>fitsOnTwoLines</code>, importée de <code>CharacterPortrait</code>, remplace le
          libellé dès qu’il déborde deux lignes — d’où «{' '}
          {lRec(SHORT_NAMES[STATE_SUBJECT.id] ?? {}, 'en')} » à 80 px là où 128 et 180 garderaient «{' '}
          {characterNamePrefix(STATE_SUBJECT, 'en')} {name(STATE_SUBJECT)} ».
        </p>
        <div className="flex flex-wrap items-start gap-6">
          {SIZES.map(({ label, cls, px }) => {
            const inside = px >= NAME_INSIDE_MIN_PX;
            return (
              <figure key={label} className={`flex flex-col items-center gap-1 ${cls}`}>
                <Portrait
                  id={STATE_SUBJECT.id}
                  name={name(STATE_SUBJECT)}
                  rarity={STATE_SUBJECT.rarity}
                  element={STATE_SUBJECT.element}
                  cls={STATE_SUBJECT.class}
                  level={100}
                  prefix={characterNamePrefix(STATE_SUBJECT, 'en') ?? undefined}
                  hideName={!inside}
                  className="w-full"
                />
                {/* Le chrome de l'APPELANT — classes et largeur de mesure
                    (`px + 24`) reprises de `CharacterPortrait`. */}
                {!inside && (
                  <span className="text-content-strong line-clamp-2 min-h-[2.5em] w-full text-center text-xs leading-tight font-semibold wrap-break-word">
                    {belowLabel(STATE_SUBJECT, px)}
                  </span>
                )}
                <figcaption className="text-content-subtle font-mono text-xs">
                  {label} · {inside ? 'dans le cadre' : 'sous le cadre'}
                </figcaption>
              </figure>
            );
          })}
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-content-strong font-semibold">La carte, et ses deux badges</h2>
        <p className="text-content-muted mb-3 text-sm">
          Le nœud rendu est <code>CharacterThumbnailList</code>, la carte de la page « personnages »
          — celle que les grilles du site imitent. Le jeu en a un SECOND en 180×344,{' '}
          <code>CUICharacterLongThumbnail</code> (pvploading, synchro, infiltrate, recruit), qui
          porte le même <code>CUICharacterThumbnail</code> ; il a été transcrit d’abord, puis
          écarté. Ce n’est pas une perte : les deux ne divergent que sur QUATRE valeurs, notées en
          commentaire dans le composant, et le lire a servi à confirmer tout le reste — rail
          d’étoiles, élément, classe, voile et ancrage du niveau y sont rigoureusement identiques.
        </p>
        <div className="flex flex-wrap items-end gap-4">
          <figure className="flex flex-col items-center gap-1">
            <Portrait
              id={STATE_SUBJECT.id}
              name={name(STATE_SUBJECT)}
              rarity={STATE_SUBJECT.rarity}
              transcendence={7}
              element={STATE_SUBJECT.element}
              cls={STATE_SUBJECT.class}
              level={100}
              prefix={characterNamePrefix(STATE_SUBJECT, 'en') ?? undefined}
              className="w-45"
            />
            <figcaption className="text-content-subtle font-mono text-xs">nom + titre</figcaption>
          </figure>
          {/* Les deux badges partagent UN emplacement (le `VerticalLayoutGroup` de
              `Sync_Core` cale son enfant actif en bas), et ils s'excluent : un
              core-fusion ne peut pas être synchronisé. On les montre donc
              séparément, pas empilés. */}
          {(
            [
              ['coreFusion', { coreFusion: true }],
              ['synchro', { synchro: true }],
            ] as const
          ).map(([label, flag]) => (
            <figure key={label} className="flex flex-col items-center gap-1">
              <Portrait
                id={STATE_SUBJECT.id}
                name={name(STATE_SUBJECT)}
                rarity={STATE_SUBJECT.rarity}
                element={STATE_SUBJECT.element}
                cls={STATE_SUBJECT.class}
                level={100}
                {...flag}
                className="w-45"
              />
              <figcaption className="text-content-subtle font-mono text-xs">{label}</figcaption>
            </figure>
          ))}
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-content-strong font-semibold">
          m_BestFit — les cas extrêmes, et les quatre écritures
        </h2>
        <p className="text-content-muted mb-3 text-sm">
          Le jeu réduit le corps pour que le texte tienne, SUR UNE LIGNE (vérifié en jeu). Le nom le
          plus long du site fait 15 caractères en anglais, et le titre le plus long 40 — dans une
          boîte de 150 unités, à corps 22 et 14 au maximum. C’est la rangée à regarder : la largeur
          n’est plus estimée mais lue dans la police, donc rien ne doit déborder du cadre ni
          chevaucher les étoiles, dans aucune des quatre écritures.
        </p>
        <div className="flex flex-wrap items-end gap-4">
          {BEST_FIT_CASES.map(({ k, c, n, p }) => (
            <figure key={k} className="flex max-w-40 flex-col items-center gap-1">
              <Portrait
                id={c.id}
                name={n}
                rarity={c.rarity}
                element={c.element}
                cls={c.class}
                level={100}
                prefix={p}
                className="w-32"
              />
              <figcaption className="text-content-subtle text-center text-xs">{k}</figcaption>
            </figure>
          ))}
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-content-strong mb-3 font-semibold">
          Ce que le portrait fait autrement que la vignette carrée
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full min-w-3xl text-left text-sm">
            <thead className="text-content-subtle border-line-subtle border-b">
              <tr>
                <th className="py-2 pr-4 font-medium">Calque</th>
                <th className="py-2 pr-4 font-medium">Vignette carrée (128)</th>
                <th className="py-2 font-medium">Portrait (180×344)</th>
              </tr>
            </thead>
            <tbody>
              {VS_THUMBNAIL.map(([k, a, b]) => (
                <tr key={k} className="border-line-subtle/50 border-b align-top">
                  <td className="text-content-strong py-2 pr-4 font-medium">{k}</td>
                  <td className="text-content-muted py-2 pr-4">{a}</td>
                  <td className="py-2">{b}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-content-strong font-semibold">
          Les écarts que le site porte aujourd’hui
        </h2>
        <p className="text-content-muted mb-3 text-sm">
          <code>CharacterCard</code> et le mode « cartes » du tier-list-maker rendent déjà{' '}
          <code>img.portrait(id)</code>, chacun avec sa chrome posée à l’estime — et des nombres
          différents l’un de l’autre. Rien n’est modifié dans ce lot ; le branchement est un second
          lot.
        </p>
        <ul className="space-y-3">
          {DRIFT.map((d) => (
            <li
              key={d.where}
              className="border-line-subtle bg-surface-raised rounded-lg border p-3"
            >
              <div className="text-content-strong font-mono text-xs">{d.where}</div>
              <div className="text-content-muted mt-1 text-sm">
                <span className="text-content-subtle">aujourd’hui : </span>
                {d.what}
              </div>
              <div className="mt-1 text-sm">
                <span className="text-content-subtle">le jeu : </span>
                {d.game}
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-content-strong font-semibold">
          Ce qui vient du CODE, et non du prefab
        </h2>
        <p className="text-content-muted mb-3 text-sm">
          Trois affirmations qu’aucun prefab ne porte : elles sortent du désassemblage de{' '}
          <code>libil2cpp.so</code>. Ce sont aussi les plus faciles à démentir d’un coup d’œil au
          jeu — donc celles qui méritent le plus d’être exposées.
        </p>
        <ol className="text-content-muted list-inside list-decimal space-y-2 text-sm">
          {FROM_CODE.map((f, i) => (
            <li key={i}>{f}</li>
          ))}
        </ol>
      </section>

      <section>
        <h2 className="text-content-strong font-semibold">Ce dont je ne suis pas sûr</h2>
        <p className="text-content-muted mb-3 text-sm">
          Trois points que la donnée ne tranche pas seule. Ils sont ici et nulle part ailleurs.
        </p>
        <ol className="text-content-muted list-inside list-decimal space-y-2 text-sm">
          {UNSURE.map((u, i) => (
            <li key={i}>{u}</li>
          ))}
        </ol>
      </section>
    </div>
  );
}
