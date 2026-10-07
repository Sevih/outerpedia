/**
 * quick/ui/gear-view — la tuile d'item du jeu, telle que la page /equipment la
 * montre (`EquipmentIcon.tsx`), en HTML : le cadre de rareté, l'icône, les
 * étoiles, l'icône d'effet en haut à droite, celle de classe dessous. UNE
 * construction pour tout l'onglet « Gear reco » : les tuiles des pickers, les
 * pièces des cartes de build, les sets en grille et en rangée de combo.
 *
 * UN FICHIER, DEUX LECTEURS, comme `gear-sets.mjs` : l'onglet le charge tel
 * quel (`/ui/gear-view.mjs`) et `actions.test.ts` l'importe. D'où le `.mjs`, du
 * JavaScript nu typé par JSDoc (`checkJs` de `scripts/tsconfig.json`).
 *
 * PUR, sans DOM : des chaînes en sortie. Il ne connaît ni la page ni `lib.js` —
 * la base des images et l'échappement lui sont passés (`env`). Les proportions
 * (marge de l'icône, place des overlays) sont dans `tabs/gear.css`, sous les
 * classes `.gv-*` ; la taille de la tuile et celle des étoiles, qui en dépend,
 * sont posées ici.
 */

/**
 * @typedef {object} ViewEnv
 * @property {string} imgBase La base des images du site (`state.imgBase`).
 * @property {(value: unknown) => string} esc L'échappement HTML de la page.
 */

/**
 * Ce qu'une tuile montre d'une pièce : une option de `gearRecoState`.
 * @typedef {object} TileItem
 * @property {string} [icon] Sprite de la pièce (`images/equipment`).
 * @property {string} [grade] normal, magic, rare ou unique.
 * @property {number} [star] Étoiles posées en bas de la tuile.
 * @property {string} [overlayIcon] Icône d'effet (`images/equipment`).
 * @property {readonly string[]} [classLimits] Classes qui peuvent la porter.
 */

/**
 * @typedef {object} SetItem
 * @property {string} [setIcon] Icône d'enchantement du set (`TI_Icon_Set_*`).
 * @property {readonly string[]} [pieceIcons] helmet, armor, gloves, shoes.
 */

/** Grade → suffixe du sprite de cadre `TI_Slot_*` (table `SLOT_FRAME` du site). */
export const SLOT_FRAME = /** @type {Readonly<Record<string, string>>} */ ({
  normal: 'Normal',
  magic: 'Magic',
  rare: 'Rare',
  unique: 'Unique',
});

/** Grade → jeton de couleur du nom (`GRADE_TEXT` du site, jetons de `globals.css`). */
export const GRADE_TOKEN = /** @type {Readonly<Record<string, string>>} */ ({
  normal: '--item-normal',
  magic: '--item-superior',
  rare: '--item-epic',
  unique: '--item-legendary',
});

/** @param {string} slug */
const cap = (slug) => slug.charAt(0).toUpperCase() + slug.slice(1);

/**
 * Une image décorative sous `imgBase` : la tuile est doublée par un nom.
 * @param {ViewEnv} env
 * @param {string} cls
 * @param {string} path Sous `images/`, sans extension.
 * @param {string} [attrs]
 */
const img = (env, cls, path, attrs = '') =>
  `<img${cls ? ` class="${cls}"` : ''} src="${env.esc(env.imgBase)}/images/${env.esc(path)}.webp" alt=""${attrs} />`;

/**
 * La tuile d'une pièce, de `size` px de côté. Sans icône — une pièce que les
 * listes ne connaissent pas — sa place vide.
 *
 * L'icône de classe ne se pose que sur une pièce limitée à UNE classe (règle
 * de `GearCard`) ; les étoiles font 18 % de la tuile (8 px au moins) et se
 * chevauchent de 30 %.
 *
 * @param {ViewEnv} env
 * @param {TileItem | undefined} item
 * @param {number} size
 */
export function itemTile(env, item, size) {
  const box = `style="width:${size}px;height:${size}px" aria-hidden="true"`;
  if (!item?.icon) return `<span class="gv-tile none" ${box}>?</span>`;
  const dim = ` width="${size}" height="${size}"`;
  const star = Math.max(8, Math.round(size * 0.18));
  const overlap = Number((star * 0.3).toFixed(1));
  const only = item.classLimits?.length === 1 ? item.classLimits[0] : '';
  return `<span class="gv-tile" ${box}>${img(
    env,
    'gv-frame',
    `ui/bg/TI_Slot_${SLOT_FRAME[item.grade ?? ''] ?? 'Normal'}`,
    dim,
  )}${img(env, 'gv-icon', `equipment/${item.icon}`, `${dim} loading="lazy"`)}${
    item.overlayIcon ? img(env, 'gv-fx', `equipment/${item.overlayIcon}`) : ''
  }${only ? img(env, 'gv-cls', `ui/class/IG_Turn_Class_${cap(only)}`) : ''}${
    item.star
      ? `<span class="gv-stars">${Array.from({ length: item.star }, (_, i) =>
          img(
            env,
            '',
            'ui/star/CM_icon_star_y',
            ` width="${star}" height="${star}"${i ? ` style="margin-left:-${overlap}px"` : ''}`,
          ),
        ).join('')}</span>`
      : ''
  }</span>`;
}

/**
 * La couleur du nom d'une pièce de ce grade, ou rien pour un grade inconnu.
 * @param {string | undefined} grade
 */
export const gradeColor = (grade) =>
  grade && GRADE_TOKEN[grade] ? `var(${GRADE_TOKEN[grade]})` : '';

/**
 * Le nom d'une pièce, coloré par son grade.
 * @param {ViewEnv} env
 * @param {string} label
 * @param {string | undefined} grade
 * @param {string} [cls]
 */
export function itemName(env, label, grade, cls = 'gv-name') {
  const color = gradeColor(grade);
  return `<span class="${cls}"${color ? ` style="color:${color}"` : ''}>${env.esc(label)}</span>`;
}

/**
 * Les pièces d'un set qu'un combo montre (règle de `shownPieceIdx`, fiche
 * perso) : joué à 4, les quatre ; en 2 + 2, helmet + armor pour le premier set
 * du combo, gloves + shoes pour les suivants.
 * @param {number} count
 * @param {number} idx Le rang du set dans son combo.
 */
export const shownPieces = (count, idx) =>
  count >= 4 ? [0, 1, 2, 3] : idx === 0 ? [0, 1] : [2, 3];

/**
 * Des pièces d'un set : cadre unique, l'icône du set en overlay (`SetCard`).
 * @param {ViewEnv} env
 * @param {SetItem | undefined} set
 * @param {number} size
 * @param {readonly number[]} shown
 */
const setTiles = (env, set, size, shown) =>
  set?.pieceIcons?.length
    ? shown
        .map((i) =>
          itemTile(
            env,
            { icon: set.pieceIcons?.[i], grade: 'unique', overlayIcon: set.setIcon },
            size,
          ),
        )
        .join('')
    : itemTile(env, undefined, size);

/**
 * Un set : la grille 2 × 2 de ses quatre pièces.
 * @param {ViewEnv} env
 * @param {SetItem | undefined} set
 * @param {number} [size]
 */
export const setGrid = (env, set, size = 34) =>
  `<span class="gv-set">${setTiles(env, set, size, [0, 1, 2, 3])}</span>`;

/**
 * Un set dans la rangée d'un combo : les pièces qu'il y occupe.
 * @param {ViewEnv} env
 * @param {SetItem | undefined} set
 * @param {{ count: number, idx: number }} at
 * @param {number} [size]
 */
export const setRow = (env, set, at, size = 32) =>
  `<span class="gv-row">${setTiles(env, set, size, shownPieces(at.count, at.idx))}</span>`;
