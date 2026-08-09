/**
 * RENDU DE CONTRÔLE DE `AnimatedPortrait` (dev-only, route `/dev/AnimatedPortrait`
 * — `.dev.tsx` non buildé en prod).
 *
 * `/dev/portrait` confronte au jeu le portrait STATIQUE. Cette page-ci ne le
 * refait pas : elle ne montre que ce que l'autre laisse vide, `FX_Holder`, et
 * elle est bâtie pour être CONFRONTÉE au jeu — une rangée par question qu'on
 * peut trancher d'un coup d'œil à l'écran des personnages.
 *
 * Elle porte aussi ce qui ne se voit PAS sur un rendu : les branches du shader
 * qu'on a relues et celles qu'on n'a pas, le plafond de contextes WebGL, et ce
 * que le désassemblage a tranché. C'est le tableau de bord du portage.
 *
 * Composant SERVEUR — la table est lue directement ; seul le canvas est client.
 */
import { AnimatedPortrait } from '@/components/character/AnimatedPortrait';
import { Portrait } from '@/components/character/Portrait';
import { PORTRAIT_FX } from '@/components/character/portrait-fx';
import { characterNamePrefix, getAllCharacters } from '@/lib/data/characters';
import { lRec } from '@/lib/i18n/localize';
import type { Character } from '@contracts';

export const metadata = { title: 'Portrait animé' };

const name = (c: Character) => lRec(c.name, 'en') || c.name.en;

/** Réf de contenu cassée = bug de page de test : on casse, pas de repli muet. */
function byId(id: string): Character {
  const c = getAllCharacters().find((x) => x.id === id);
  if (!c) throw new Error(`/dev/AnimatedPortrait : perso « ${id} » absent de characters.json`);
  return c;
}

const DEMI = 'FX_UI_Character_List_Demi';
const DUNGEON = 'FX_UI_Character_List_Dungeon';
const SEASONAL = 'FX_UI_Character_List_Seasonal';
/** Les effets servis, dans l'ordre du portage — la table par calque les déroule tous. */
const SERVED = [DEMI, DUNGEON, SEASONAL];

/**
 * LES PORTEURS, tels que le jeu les désigne — et l'écart entre ce qu'il pose et
 * ce que le site sait poser.
 *
 * `byCharacter` porte les 25 lignes de `CharacterExtraTemplet`, entières. Un id
 * peut n'être PAS un personnage du site : `2010063` est un SKIN, et la table du
 * jeu le désigne comme n'importe quel autre. C'est une information, pas un
 * accident — d'où le tri en trois seaux plutôt qu'un filtre muet.
 */
const ROSTER = getAllCharacters();
const CARRIERS = Object.entries(PORTRAIT_FX.byCharacter)
  .map(([id, fx]) => ({
    id,
    fx,
    short: fx.replace('FX_UI_Character_List_', ''),
    char: ROSTER.find((c) => c.id === id),
    served: Boolean(PORTRAIT_FX.effects[fx]),
  }))
  .sort((a, b) => a.short.localeCompare(b.short) || a.id.localeCompare(b.id));

/** Les sujets rendus : des porteurs des effets servis, réellement au roster. */
const DEMI_SUBJECTS = CARRIERS.filter((c) => c.short === 'Demi' && c.char).map((c) => c.char!);
const DUNGEON_SUBJECTS = CARRIERS.filter((c) => c.short === 'Dungeon' && c.char).map(
  (c) => c.char!,
);
const SEASONAL_SUBJECTS = CARRIERS.filter((c) => c.short === 'Seasonal' && c.char).map(
  (c) => c.char!,
);
const SUBJECT = byId('2000053'); // Stella — le premier porteur de `_Demi` par id

/**
 * Les QUATRE paliers responsives de `CharacterCard` — mêmes libellés que
 * `/dev/portrait`. La taille du prefab (`w-45`) n'y est pas : c'est celle des
 * sections du haut. La page pose 10 portraits animés pour un plafond de 8
 * contextes WebGL : l'éviction peut donc jouer au défilement — mais elle ne
 * frappe que HORS écran, et la carte évincée ressuscite en revenant. Une carte
 * qu'on regarde ne s'éteint jamais.
 */
const SIZES = [
  { label: 'w-20 · 80 px · <640', cls: 'w-20' },
  { label: 'w-26 · 104 px · ≥640', cls: 'w-26' },
  { label: 'w-32 · 128 px · ≥1024', cls: 'w-32' },
  { label: 'w-38 · 152 px · ≥1280', cls: 'w-38' },
];

/**
 * Ce que le désassemblage et les prefabs tranchent, et qu'aucun rendu ne montre.
 * Gardé sur la page parce que ce sont les affirmations les plus faciles à
 * contredire d'un coup d'œil au jeu — donc celles qui méritent d'être exposées.
 */
const FROM_BINARY: { k: string; v: string }[] = [
  {
    k: 'D’où vient l’effet',
    v: '`CUICharacterThumbnail.SetEffect` (RVA 0x27F74A4) détruit les enfants de `m_EffectHolder`, demande un NOM à `CTempletManager.GetCharacterCardEffectByID`, puis `CResourceManager.LoadAsset<GameObject>` + `Instantiate`. Aucun paramètre, aucune variante : le nom fait tout.',
  },
  {
    k: 'Qui en a un',
    v: '`CharacterExtraTemplet.ThumbnailEffect` — 25 lignes, dont une pour un SKIN (2010063) que le roster du site n’a pas. Le reste du roster n’a rien : un portrait sans effet n’est pas un portrait dégradé, c’est le cas ORDINAIRE (99 sur 124).',
  },
  {
    k: 'Pourquoi ça ne s’arrête pas',
    v: 'Les calques de cadre n’émettent QU’UNE particule, `looping = false`, durée de vie = `lengthInSec` (1,5 s). Ce serait un one-shot sans `ringBufferMode = 2` (LoopUntilReplaced) : la particule ne meurt jamais, son âge reboucle. C’est la seule valeur qui sépare « une bouffée » de « une parure ».',
  },
  {
    k: 'Où est l’animation',
    v: 'Dans le SHADER, pas dans le système. Les 22 matériaux des dix effets partagent `MASTA/S_Assemble_Particle_UI`, qui fait défiler quatre textures sur `_Time` et compose main × second × third × `_MainStrength`. Aucun `AnimationClip`, aucun `Animator` dans le bundle.',
  },
  {
    k: 'Ce que `_Dungeon` ajoute',
    v: 'Deux VRAIS émetteurs, `atlas` (halos, 2/s) et `star` (glints, 4/s). Leur nœud est TOURNÉ de −90° sur X — le +Z d’émission du Box pointe vers le haut — et la zone de naissance est un Box PLAT de ~100 px de large posé sous le bas de la carte. L’amorti de `ClampVelocity` (0,1 par image) écrase le coup de fouet initial (1 à 10 u/s) contre un plafond tiré entre 0,5 et 1 en un quart de seconde — la montée de croisière, c’est le PLAFOND (~25 à 60 px/s pendant 3 à 4 s de vie) : la traînée, multipliée par la section des quads (`multiplyDragByParticleSize`), ne fait qu’effleurer, et la gravité (0,03 en unités monde, ÷50 d’échelle) est un murmure. La feuille UV ne fait qu’un CHOIX de tuile — halo n° 5 en 4×4, glint n° 12 en 8×8 de la même planche — et les glints tirent leur hauteur à part, deux fois la largeur (`size3D`). Tout `_Dungeon` est à `applyActiveColorSpace` FAUX (couleurs brutes), et `star` mélange en `One One`.',
  },
  {
    k: 'L’espace colorimétrique',
    v: '`globalgamemanagers` donne `m_ActiveColorSpace = 1`, soit **Linear**. Ce n’est pas un réglage d’ambiance : les textures marquées sRGB sont linéarisées à l’échantillonnage et le mélange additif se fait en lumière linéaire. À mi-gris, le produit des trois échantillons du liseré vaut 0,0088 en linéaire (× 70 = 0,62, une lueur) contre 0,125 en gamma (× 70 = 8,75, un aplat blanc). Le premier jet supposait gamma et blanchissait la carte entière.',
  },
  {
    k: 'Ce que `_Seasonal` ajoute',
    v: 'Un seul émetteur, `bubble` : 7/s plafonné à 40, vie 2 à 3 s, vitesse tirée entre 0,2 et 9 — même Box plat sous la carte, même nœud à −90°, même frein qu’`atlas`/`star` (plafond 0,5–1, amorti 0,1, traînée 0,5 ×section ×vitesse²) et même bruit statique. Pas de feuille UV : `T_FX_2000045_Bubble` est la bulle entière, alpha par son canal A (`_MAIN_ALPHACHANNEL_ON`), `_MainStrength` 6, en `SrcAlpha One`. Et `out (1)` reprend une TROISIÈME fois le matériau de `_Demi` — trois effets, trois teintes, un matériau.',
  },
  {
    k: 'La couleur de particule',
    v: '`startColor` × `colorOverLifetime` arrive au shader en couleur de SOMMET, avec DEUX conversions possibles sur la route : `m_ApplyActiveColorSpace` (relevé émetteur par émetteur) la linéarise à la cuisson, puis la chaîne UIParticle → Canvas linéarise TOUTES les couleurs cuites en projet Linear. Les calques de `_Demi` cumulent donc les deux — c’est ce qui fait le rouge PROFOND du liseré (0,618 → 0,34 → 0,095), confronté à l’écran du jeu : une conversion seule plafonne le rapport vert/rouge à 0,34 et rend le ruban blanc rosé, jamais rouge.',
  },
  {
    k: 'Ce que `_Demi` pose',
    v: 'Deux calques, `inner` et `out`, chacun une maille dédiée (8 et 12 sommets) — pas un quad. `out` déborde volontairement le cadre — 5,54 unités à gauche, 3,47 à droite, 3,42 en haut, 2,74 en bas, pour une épaisseur de ruban de 13 — et le jeu ne le masque pas : `FX_Holder` est FRÈRE du `Mask`, pas son enfant. Le canvas déborde donc du maximum par axe, calculé sur les sommets.',
  },
  {
    k: 'Pourquoi l’effet suit le biseau',
    v: 'Le coin haut-droit coupé des cartes n’est pas un masque : il est DANS les mailles. `out` remplace son coin par un pan coupé entre (+0,63, +1,71) et (+0,89, +1,42), `inner` entre (+0,59, +1,63) et (+0,83, +1,37) — l’effet épouse la découpe de l’art sans que rien ne le rogne. Relevé en dépliant `m_VertexData` (`MeshHandler`), pas via l’export OBJ d’UnityPy : celui-ci NÉGATE X (main gauche → main droite du format) en laissant les UV fidèles — le biseau partait au coin haut-GAUCHE et tous les défilements horizontaux étaient en miroir, sans qu’aucun contrôle interne ne puisse le voir.',
  },
];

/** Ce qui reste incertain — listé à part, jamais noyé dans le reste. */
const UNSURE: string[] = [
  'LES PARTICULES SONT APPROCHÉES, PAS CLONÉES. Trois écarts au ParticleSystem d’Unity, déclarés en tête de `portrait-fx-sim` : le bruit Perlin interne (le relevé dit un champ STATIQUE, `scrollSpeed = 0` : rendu par deux sinus déphasés échantillonnés le long du CHEMIN parcouru — une dérive de 0,05 u/s au plus, jamais une oscillation sur l’horloge, que le jeu n’a pas), le frein (`dampen` s’applique là-bas PAR IMAGE de simulation, rendu par convergence calée sur 60 pas/s ; `drag` suit la reconstruction publique `drag × π·(taille/2)² × vitesse²`, drapeaux `multiplyDragBy…` honorés, mais Unity ne documente pas sa formule ni s’il prend la taille de naissance ou celle du moment), et `size3D` dont on suppose que les axes tirent le MÊME aléa — les plages de `star`, ×2 exactes, gardent alors leur rapport. `autoRandomSeed` étant vrai côté jeu, l’aléa par montage est conforme, lui.',
  'LE TEMPS D’ORIGINE. `_Time` du jeu compte depuis le chargement de la scène et est PARTAGÉ par tous les effets : deux cartes de la même page y sont donc en phase. Ici chaque canvas compte depuis son propre montage, donc deux cartes montées à des instants différents sont déphasées. Invisible sur une carte seule, visible sur une rangée — et c’est un des arguments pour le contexte partagé ci-dessous.',
  'L’ÉCHELLE DU NŒUD RACINE. Les dix prefabs ont un `m_LocalScale` de (0, 0, 0) sur leur racine, ce qui écraserait tout. C’est de l’état d’éditeur : `UIParticle` pose l’échelle au runtime et son `m_Scale3D` vaut (1, 1, 1). La géométrie le confirme (le cadre tombe juste au pixel), mais c’est une déduction, pas un relevé.',
  'LE FILTRAGE ENTRE NIVEAUX. Le nombre de mips vient désormais du jeu (`m_MipCount`), et les cinq textures qui n’en ont aucun n’en reçoivent plus. Reste que `FilterMode.Bilinear` est rendu en `LINEAR_MIPMAP_NEAREST` pour les trois qui en ont : c’est la lecture usuelle de l’énum, pas une mesure, et Unity ne dit pas s’il génère les mêmes niveaux que `generateMipmap`.',
  'LA CHROME EN DOM. Étoiles, niveau, nom et badges sont posés par-dessus le canvas, donc composés par le navigateur en sRGB, quand le jeu les mélange en linéaire comme le reste. Ils sont opaques ou presque, là où les deux espaces coïncident — mais leurs bords antialiasés, eux, diffèrent d’un cheveu.',
];

/** Ce qui n'est pas fait, et qu'il vaut mieux écrire que sous-entendre. */
const TODO: string[] = [
  'LES SEPT AUTRES EFFETS. `extract-portrait-fx.py` sort `_Demi`, `_Dungeon` et `_Seasonal` par défaut. Le simulateur couvre les émetteurs billboard à forme Box sans rafales — `atlas`, `star` et `bubble` y passent tous — mais les six effets sur mesure demandent des branches du shader qu’on n’a pas relues (`_POLAR_UV_ON`, `_DISSOLVE_UV_ON`), et `_Synchro` (posé par `SetSynchroEffect`, pas par la table des porteurs) n’a pas été relevé. Chaque refus est LOUD : un calque non transcrit ne se rend pas à moitié, il se dit.',
  'UN CONTEXTE WebGL PARTAGÉ. Aujourd’hui, un contexte par carte, plafonné à 8 et recyclé par ordre de dernière apparition — ça tient une page, pas une grille de 124 personnages dont 15 animés. Un seul contexte qui peindrait toutes les cartes lèverait le plafond ET le déphasage noté plus haut.',
  'LE PASSAGE DANS `characters.json`. La table `byCharacter` vit dans `portrait-fx.json` parce qu’une page /dev ne justifie pas d’ouvrir un contrat de données. Le jour où l’effet sort d’ici, sa place est un champ de perso — le datagen lit déjà `CharacterExtraTemplet` pour `showNickName`.',
  'LE `Dim` DU PORTRAIT STATIQUE. Sans rapport avec l’effet, mais vu en lisant l’ordre des nœuds : dans le prefab, `Dim` est le 2ᵉ enfant de `CharacterInfo`, donc SOUS le rail d’étoiles, l’élément, la classe et le niveau. `Portrait` le rend en dernier, donc par-dessus tout. À vérifier en jeu avant de toucher quoi que ce soit.',
];

function Figure({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <figure className="flex flex-col items-center gap-1">
      {children}
      <figcaption className="text-content-subtle text-center font-mono text-xs">{label}</figcaption>
    </figure>
  );
}

export default function DevAnimatedPortrait() {
  return (
    <div className="bg-surface-base text-content min-h-screen p-6">
      <header className="mb-8">
        <h1 className="text-content-strong text-2xl font-bold">Portrait animé</h1>
        <p className="text-content-muted mt-1 max-w-3xl text-sm">
          Le nœud que <code>/dev/portrait</code> laisse vide : <code>FX_Holder</code>, soit{' '}
          <code>CUICharacterThumbnail.m_EffectHolder</code>. Le prefab qu’on y instancie vient de{' '}
          <code>CharacterExtraTemplet.ThumbnailEffect</code> ; son mouvement vient du shader{' '}
          <code>MASTA/S_Assemble_Particle_UI</code>, dont le GLSL compilé est rejoué tel quel (
          <code>portrait-fx-gl</code>). Rien ici n’est une approximation CSS.
        </p>
        <p className="text-content-muted mt-2 max-w-3xl text-sm">
          <strong className="text-content-strong">Trois effets sont servis : </strong>
          <code>_Demi</code> ({DEMI_SUBJECTS.length} porteurs), <code>_Dungeon</code> (
          {DUNGEON_SUBJECTS.length} porteurs) et <code>_Seasonal</code> ({SEASONAL_SUBJECTS.length}{' '}
          porteur) — les deux derniers amènent les émetteurs de PARTICULES simulés (
          <code>portrait-fx-sim</code>). Les sept autres sont dans la table mais pas extraits — cf.
          « ce qui reste » en bas.
        </p>
      </header>

      <section className="mb-8">
        <h2 className="text-content-strong font-semibold">
          <code>_Demi</code> — le même portrait, sans puis avec
        </h2>
        <p className="text-content-muted mb-3 max-w-3xl text-sm">
          À la taille du prefab. Le portrait de gauche est celui de <code>/dev/portrait</code>,
          inchangé : <code>AnimatedPortrait</code> n’ajoute qu’un calque, à sa place du prefab —
          au-dessus de l’art, SOUS le rail d’étoiles, l’élément, la classe, le niveau et le nom.
          L’effet est fait de deux calques de cadre, voile intérieur (<code>inner</code>) et liseré
          débordant (<code>out</code>) — leurs matériaux et vitesses sont détaillés calque par
          calque dans le tableau plus bas.
        </p>
        <div className="flex flex-wrap items-end gap-6">
          <Figure label="Portrait (statique)">
            <Portrait
              id={SUBJECT.id}
              name={name(SUBJECT)}
              rarity={SUBJECT.rarity}
              element={SUBJECT.element}
              cls={SUBJECT.class}
              level={100}
              prefix={characterNamePrefix(SUBJECT, 'en') ?? undefined}
              className="w-45"
            />
          </Figure>
          <Figure label="AnimatedPortrait">
            <AnimatedPortrait
              id={SUBJECT.id}
              name={name(SUBJECT)}
              rarity={SUBJECT.rarity}
              element={SUBJECT.element}
              cls={SUBJECT.class}
              level={100}
              prefix={characterNamePrefix(SUBJECT, 'en') ?? undefined}
              className="w-45"
            />
          </Figure>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-content-strong font-semibold">
          <code>_Dungeon</code> — cadres, halos et glints
        </h2>
        <p className="text-content-muted mb-3 max-w-3xl text-sm">
          Trois calques de cadre (mêmes mailles que <code>_Demi</code>, et <code>out (1)</code>{' '}
          partage jusqu’à son matériau — seule la couleur de particule change), plus deux VRAIS
          émetteurs : les halos <code>atlas</code> et les glints <code>star</code>, nés dans une
          bande plate sous le bas de la carte et poussés vers le haut. Leur mouvement est simulé (
          <code>portrait-fx-sim</code>), leur rendu passe par le même shader. Les isolations{' '}
          <code>atlas</code> et <code>star</code> servent à confronter chaque famille de particules
          au jeu, seule.
        </p>
        <div className="flex flex-wrap items-end gap-6">
          {DUNGEON_SUBJECTS.slice(0, 1).map((c) => (
            <Figure key={`${c.id}-plain`} label="Portrait (statique)">
              <Portrait
                id={c.id}
                name={name(c)}
                rarity={c.rarity}
                element={c.element}
                cls={c.class}
                level={100}
                className="w-45"
              />
            </Figure>
          ))}
          {[undefined, ['atlas'], ['star']].map((only, i) => {
            const c = DUNGEON_SUBJECTS[0];
            if (!c) return null;
            return (
              <Figure
                key={only ? only.join('+') : 'tout'}
                label={only ? only.join(' + ') : 'AnimatedPortrait'}
              >
                <AnimatedPortrait
                  id={c.id}
                  name={name(c)}
                  rarity={c.rarity}
                  element={c.element}
                  cls={c.class}
                  level={100}
                  fxEmitters={only}
                  hideName={i > 0}
                  className="w-45"
                />
              </Figure>
            );
          })}
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-content-strong font-semibold">
          <code>_Seasonal</code> — cadres et bulles
        </h2>
        <p className="text-content-muted mb-3 max-w-3xl text-sm">
          Deux calques de cadre (mêmes mailles, et <code>out (1)</code> reprend une TROISIÈME fois
          le matériau de <code>_Demi</code> — seule la teinte de particule change), plus un émetteur
          de bulles : le jumeau structurel d’<code>atlas</code>/<code>star</code> — même Box plat
          sous la carte (2,2 de large, le plus étalé des trois), même frein, même bruit statique.
          Pas de feuille UV : la texture EST la bulle, et l’alpha vient de son canal A (
          <code>_MAIN_ALPHACHANNEL_ON</code>).
        </p>
        <div className="flex flex-wrap items-end gap-6">
          {SEASONAL_SUBJECTS.slice(0, 1).map((c) => (
            <Figure key={`${c.id}-plain`} label="Portrait (statique)">
              <Portrait
                id={c.id}
                name={name(c)}
                rarity={c.rarity}
                element={c.element}
                cls={c.class}
                level={100}
                className="w-45"
              />
            </Figure>
          ))}
          {[undefined, ['bubble']].map((only, i) => {
            const c = SEASONAL_SUBJECTS[0];
            if (!c) return null;
            return (
              <Figure
                key={only ? only.join('+') : 'tout'}
                label={only ? only.join(' + ') : 'AnimatedPortrait'}
              >
                <AnimatedPortrait
                  id={c.id}
                  name={name(c)}
                  rarity={c.rarity}
                  element={c.element}
                  cls={c.class}
                  level={100}
                  fxEmitters={only}
                  hideName={i > 0}
                  className="w-45"
                />
              </Figure>
            );
          })}
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-content-strong font-semibold">Quatre tailles</h2>
        <p className="text-content-muted mb-3 max-w-3xl text-sm">
          Les quatre paliers responsives que <code>Portrait</code> supporte de base, mêmes que{' '}
          <code>/dev/portrait</code>. Toute la géométrie de l’effet est en % du cadre : les sommets
          des mailles sont projetés depuis les unités du jeu, jamais depuis des pixels. Ce qui NE
          suit pas l’échelle, c’est l’épaisseur apparente du liseré en petit — le shader
          échantillonne en UV, donc le motif se resserre au lieu de s’amincir. C’est aussi ce que
          fait le jeu.
        </p>
        <div className="flex flex-wrap items-end gap-6">
          {SIZES.map(({ label, cls }) => (
            <Figure key={label} label={label}>
              <AnimatedPortrait
                id={SUBJECT.id}
                name={name(SUBJECT)}
                rarity={SUBJECT.rarity}
                element={SUBJECT.element}
                cls={SUBJECT.class}
                level={100}
                hideName={cls === 'w-20'}
                className={cls}
              />
            </Figure>
          ))}
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-content-strong mb-3 font-semibold">
          Ce que les prefabs posent, calque par calque
        </h2>
        <p className="text-content-muted mb-3 max-w-3xl text-sm">
          Rendu depuis <code>portrait-fx.json</code>, donc impossible à laisser dériver du code :
          c’est la table que le moteur lit. Les vitesses sont en UV par seconde ; un émetteur sans
          maille est un billboard simulé.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full min-w-3xl text-left text-sm">
            <thead className="text-content-subtle border-line-subtle border-b">
              <tr>
                <th className="py-2 pr-4 font-medium">Calque</th>
                <th className="py-2 pr-4 font-medium">Maille</th>
                <th className="py-2 pr-4 font-medium">Matériau</th>
                <th className="py-2 pr-4 font-medium">Mots-clés</th>
                <th className="py-2 font-medium">Textures et vitesses</th>
              </tr>
            </thead>
            <tbody>
              {SERVED.flatMap((fxName) =>
                (PORTRAIT_FX.effects[fxName]?.emitters ?? []).map((e) => ({ fxName, e })),
              ).map(({ fxName, e }) => {
                const m = e.material ? PORTRAIT_FX.materials[e.material] : undefined;
                const mesh = e.mesh ? PORTRAIT_FX.meshes[e.mesh] : undefined;
                const speed: Record<string, string> = {
                  _MainTex: '_MainSpeed',
                  _SecondTex: '_SecondTexSpeed',
                  _ThirdTex: '_ThirdTexSpeed',
                  _NoiseTex: '_NoiseSpeed',
                  _AlphaTex: '_AlphaSpeed',
                };
                return (
                  <tr
                    key={`${fxName}/${e.name}`}
                    className="border-line-subtle/50 border-b align-top"
                  >
                    <td className="text-content-strong py-2 pr-4 font-mono">
                      {fxName.replace('FX_UI_Character_List_', '')} · {e.name}
                      <div className="text-content-subtle font-sans text-xs">
                        taille {e.startSize} · échelle {e.scale[0]}×{e.scale[1]} · vie{' '}
                        {e.startLifetime}s · ring {e.ringBufferMode}
                      </div>
                    </td>
                    <td className="text-content-muted py-2 pr-4 font-mono text-xs">
                      {e.mesh ?? 'billboard'}
                      <div className="font-sans">
                        {mesh
                          ? `${mesh.v.length} sommets · ${mesh.i.length / 3} triangles`
                          : `${e.emission.rateOverTime}/s · ${e.maxParticles} max`}
                      </div>
                    </td>
                    <td className="text-content-muted py-2 pr-4 font-mono text-xs">
                      {e.material}
                      <div className="font-sans">
                        strength {m?.floats._MainStrength} · contraste {m?.floats._MainContrast} ·
                        bruit {m?.floats._NoiseStrength} · alpha {m?.floats._AlphaStrength}
                      </div>
                    </td>
                    <td className="text-content-muted py-2 pr-4 font-mono text-xs">
                      {m?.keywords.map((k) => (
                        <div key={k}>{k}</div>
                      ))}
                    </td>
                    <td className="text-content-muted py-2 font-mono text-xs">
                      {m &&
                        Object.entries(m.textures).map(([slot, t]) => {
                          const s = m.vectors[speed[slot]] ?? [0, 0];
                          const moving = s[0] || s[1];
                          return (
                            <div key={slot}>
                              <span className="text-content-subtle">{slot}</span> {t.tex}
                              {t.st[0] !== 1 || t.st[1] !== 1 ? ` ×${t.st[0]},${t.st[1]}` : ''}
                              {moving ? (
                                <span className="text-emerald-400">
                                  {' '}
                                  → {s[0]},{s[1]}
                                </span>
                              ) : (
                                <span className="text-content-subtle"> → fixe</span>
                              )}
                            </div>
                          );
                        })}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-content-strong mb-3 font-semibold">Les 25 porteurs du jeu</h2>
        <p className="text-content-muted mb-3 max-w-3xl text-sm">
          La table entière de <code>CharacterExtraTemplet</code>, y compris les lignes que le site
          ne sert pas — une liste tronquée laisserait croire qu’un perso absent n’a pas d’effet.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full min-w-2xl text-left text-sm">
            <thead className="text-content-subtle border-line-subtle border-b">
              <tr>
                <th className="py-2 pr-4 font-medium">Effet</th>
                <th className="py-2 pr-4 font-medium">Id</th>
                <th className="py-2 pr-4 font-medium">Personnage</th>
                <th className="py-2 font-medium">État</th>
              </tr>
            </thead>
            <tbody>
              {CARRIERS.map((c) => (
                <tr key={c.id} className="border-line-subtle/50 border-b">
                  <td className="text-content-strong py-1.5 pr-4 font-mono text-xs">{c.short}</td>
                  <td className="text-content-muted py-1.5 pr-4 font-mono text-xs">{c.id}</td>
                  <td className="text-content-muted py-1.5 pr-4">
                    {c.char ? name(c.char) : <span className="text-amber-400">hors roster</span>}
                  </td>
                  <td className="py-1.5 font-mono text-xs">
                    {!c.char ? (
                      <span className="text-content-subtle">skin — pas une fiche du site</span>
                    ) : c.served ? (
                      <span className="text-emerald-400">rendu</span>
                    ) : (
                      <span className="text-amber-400">non extrait</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-content-strong mb-3 font-semibold">Ce que disent les binaires</h2>
        <ul className="space-y-3">
          {FROM_BINARY.map((f) => (
            <li key={f.k} className="border-line-subtle bg-surface-raised rounded-lg border p-3">
              <div className="text-content-strong font-mono text-xs">{f.k}</div>
              <div className="text-content-muted mt-1 text-sm">{f.v}</div>
            </li>
          ))}
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-content-strong font-semibold">Ce dont je ne suis pas sûr</h2>
        <p className="text-content-muted mb-3 text-sm">
          Quatre points que la donnée ne tranche pas seule. Ils sont ici et nulle part ailleurs.
        </p>
        <ol className="text-content-muted list-inside list-decimal space-y-2 text-sm">
          {UNSURE.map((u, i) => (
            <li key={i}>{u}</li>
          ))}
        </ol>
      </section>

      <section>
        <h2 className="text-content-strong font-semibold">Ce qui reste</h2>
        <p className="text-content-muted mb-3 text-sm">
          Écrit plutôt que sous-entendu — ce palier sert un effet sur dix.
        </p>
        <ol className="text-content-muted list-inside list-decimal space-y-2 text-sm">
          {TODO.map((t, i) => (
            <li key={i}>{t}</li>
          ))}
        </ol>
      </section>
    </div>
  );
}
