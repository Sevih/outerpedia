/**
 * quick/ui/hero-tile — la vignette de perso du SITE (`Thumbnail kind="character"`,
 * `src/components/ui/Thumbnail.tsx`, la transcription du prefab
 * `uicharacterthumbnail`), en HTML : sur une case, le fond de rareté, le visage,
 * l'ombre du bas, le vignetage, l'icône d'élément et celle de classe au coin
 * haut droit. UNE construction pour toute la page : l'en-tête de la Fiche perso,
 * les synergies, les persos des Guides, le picker de héros, et les listes
 * (Bannières, Journal, Tableau de bord, Noms, Rangs).
 *
 * Les sprites sont ceux que le site donne à sa vignette (`img.characterSlot`,
 * `img.face`, `img.boss('CT_*')`), sous la base des images. Les PROPORTIONS — le
 * visage en retrait de 3 sur 128, l'ombre de 122 × 32, l'élément de 45 qui
 * déborde du coin, la classe de 34 dessous — sont dans `hero-tile.css`, sous les
 * classes `.ht*`, en fractions de la case : la vignette suit la taille qu'on lui
 * donne (`--ht`).
 *
 * Ce que `Thumbnail` fait et que la vignette ne reproduit pas : les étoiles de
 * transcendance (leur nombre et leur teinte se lisent dans la table du jeu, que
 * la page n'a pas), le niveau, la bannière BOSS, et le skin choisi dans les
 * réglages du site (`SettingsPortrait`).
 *
 * PUR, sans DOM : une chaîne en sortie. Du `.mjs` typé par JSDoc (`checkJs` de
 * `scripts/tsconfig.json`), comme `gear-view.mjs` : la page le charge tel quel
 * (`/ui/hero-tile.mjs`), les tests l'importent.
 */

/**
 * @typedef {object} TileEnv
 * @property {string} imgBase La base des images du site (`state.imgBase`).
 */

/**
 * Ce que la vignette lit d'un perso : une ligne du roster. Sans `id` — un nom
 * hors du roster — la case « ? » ; sans `rarity`, le fond neutre ; sans
 * `element` ou `class`, pas d'icône au coin.
 * @typedef {object} TileHero
 * @property {string} [id]
 * @property {string} [name] Le nom posé sous la vignette (`name`).
 * @property {number} [rarity] BasicStar 1..3 : choisit le fond.
 * @property {string} [element] fire, water, earth, light ou dark.
 * @property {string} [class] Le slug du site : striker, defender, ranger, mage ou healer.
 */

/**
 * Rareté → fond de la case (`CHARACTER_SLOT_BY_RARITY` du site). Une rareté
 * inconnue : le fond Normal des tuiles d'item (`TI_Slot_Normal`, gris, le même
 * motif) — le jeu n'a pas de `CT_Slot_Normal`, et le repli du site (Magic,
 * vert) ferait passer le perso pour un 1★.
 */
const SLOT = /** @type {Readonly<Record<number, string>>} */ ({
  1: 'ui/boss/CT_Slot_Magic',
  2: 'ui/boss/CT_Slot_Rare',
  3: 'ui/boss/CT_Slot_Unique',
});
const SLOT_NORMAL = 'ui/bg/TI_Slot_Normal';

/** @param {unknown} v */
const esc = (v) => String(v).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
/** @param {string} slug */
const cap = (slug) => slug.charAt(0).toUpperCase() + slug.slice(1);

/**
 * La vignette d'un perso, de `px` px de côté. Décorative : un nom la double
 * toujours — le sien (`name`, dessous, sur deux lignes au plus) ou celui que
 * l'appelant écrit à côté.
 *
 * @param {TileEnv} env
 * @param {TileHero | undefined} hero
 * @param {{ px?: number, name?: boolean }} [opts]
 */
export function heroTile(env, hero, { px = 44, name = false } = {}) {
  const box = `style="--ht:${px}px" aria-hidden="true"`;
  /** @param {string} path Sous `images/`, sans extension. */
  const src = (path) => `${esc(env.imgBase)}/images/${path}.webp`;
  /**
   * @param {string} cls
   * @param {string} path
   * @param {string} [attrs]
   */
  const img = (cls, path, attrs = '') =>
    `<img${cls ? ` class="${cls}"` : ''} src="${src(path)}" alt=""${attrs} />`;
  const tile = hero?.id
    ? `<span class="ht" ${box}>${img('ht-bg', SLOT[hero.rarity ?? 0] ?? SLOT_NORMAL)}${img(
        'ht-face',
        `characters/faceicon/FI_${esc(hero.id)}`,
        ` width="${px}" height="${px}" loading="lazy"`,
      )}<span class="ht-shade" style="border-image-source:url('${src('ui/boss/CT_Slot_Bottom')}')"></span>${img(
        'ht-dim',
        'ui/boss/CT_Slot_Dim_2',
      )}${
        hero.element
          ? `<span class="ht-el" data-el="${esc(hero.element)}">${img('', `ui/boss/CT_Element_${cap(esc(hero.element))}`)}</span>`
          : ''
      }${hero.class ? img('ht-cls', `ui/boss/CT_Class_${cap(esc(hero.class))}`) : ''}</span>`
    : `<span class="ht none" ${box}>?</span>`;
  if (!name) return tile;
  const label = hero?.name ?? '';
  return `<span class="ht-card" style="--ht:${px}px">${tile}<span class="ht-n" title="${esc(label)}">${esc(label)}</span></span>`;
}
