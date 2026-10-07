/**
 * quick/ui/gear-view — la tuile d'item du jeu, telle que la page /equipment la
 * montre (`EquipmentIcon.tsx`), en HTML : le cadre de rareté, l'icône, les
 * étoiles, l'icône d'effet en haut à droite, celle de classe dessous. UNE
 * construction pour tout l'onglet « Gear reco » : les tuiles des pickers, les
 * pièces des cartes de build, les sets en grille et en rangée de combo.
 *
 * Et L'APERÇU d'un build (`previewHtml`) : ce que la fiche perso en montrera
 * (`GearRecoSection.tsx`), bâti sur ce que rend `POST /api/gear-reco/preview` —
 * le build résolu par le résolveur du site, la note en segments.
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

// ------------------------------------------------------------- l'aperçu
// Un build tel que la fiche perso le montrera (`GearRecoSection.tsx`) : les
// rangées Weapon / Accessory / Talisman, les combos de sets et la légende de
// leurs bonus, la priorité des substats, la note. Les données sont celles de
// `previewGearReco` (admin) ; rien n'y est cliquable, une `desc` passe en
// `title`. Les classes `.pv-*` et les couleurs sont dans `tabs/gear.css`.

/**
 * Une pièce résolue (`GearItem` du site) — ce que l'aperçu en lit.
 * @typedef {object} PreviewItem
 * @property {string} id
 * @property {string} name
 * @property {string} [icon]
 * @property {string} [grade]
 * @property {number} [star]
 * @property {string} [overlayIcon]
 * @property {string} [classType] La classe d'une pièce qui n'en a qu'une.
 * @property {string} [mainStat] Une stat (`ATK%`) ou une composée (`PEN%/CHD`).
 * @property {boolean} [unresolved] Une pièce que le résolveur ne connaît pas.
 */

/**
 * Un set dans un combo (`GearSetPiece` du site).
 * @typedef {object} PreviewSetPiece
 * @property {string} id
 * @property {string} name
 * @property {string} [icon] Icône d'enchantement du set.
 * @property {readonly string[]} [pieceIcons] helmet, armor, gloves, shoes.
 * @property {number} count
 */

/**
 * Les bonus d'un set du build (`GearSetEffect` du site).
 * @typedef {object} PreviewSetEffect
 * @property {string} id
 * @property {string} name
 * @property {number} maxCount Le plus grand nombre de pièces où le build le joue.
 * @property {string} [effect2]
 * @property {string} [effect4]
 */

/**
 * Un segment de note (`InlineSegment` de `parse-text.tsx`).
 * @typedef {object} PreviewSegment
 * @property {string} t text, br, unknown, icon, effect, item ou stat.
 * @property {string} [s] Le texte d'un segment `text` ou `unknown`.
 * @property {string} [label] Le libellé d'un segment `icon` ou `effect`.
 * @property {string} [name] Le nom d'un segment `item` ou `stat`.
 * @property {string} [color] La classe de couleur du site (`text-buff`…).
 * @property {string} [icon] `icon` : l'adresse de l'image ; `effect` : son sprite.
 * @property {string} [iconSrc] L'adresse de l'icône d'un `item`, d'une `stat`.
 * @property {string} [grade]
 * @property {boolean} [isDebuff]
 * @property {boolean} [underline]
 * @property {string} [desc] Sa description : le `title` du segment.
 */

/**
 * Un build d'aperçu (`PreviewBuild` de `gear-preview-actions.ts`).
 * @typedef {object} PreviewBuild
 * @property {readonly PreviewItem[]} weapons
 * @property {readonly PreviewItem[]} amulets
 * @property {readonly PreviewItem[]} talismans
 * @property {readonly (readonly PreviewSetPiece[])[]} sets
 * @property {readonly PreviewSetEffect[]} setEffects
 * @property {string} [substats]
 * @property {readonly PreviewSegment[]} noteSegments
 */

/**
 * Les libellés de la fiche (`GearRecoLabels`), dans la langue de l'aperçu.
 * @typedef {object} PreviewLabels
 * @property {string} weapon
 * @property {string} amulet
 * @property {string} talisman
 * @property {string} set
 * @property {string} substatPrio
 * @property {string} note
 * @property {string} piece2
 * @property {string} piece4
 */

/**
 * La classe de couleur qu'un segment porte, telle que le site la nomme
 * (`text-buff`, `text-item-legendary`…) : `tabs/gear.css` la traduit en jeton.
 * Tout autre texte n'entre pas dans un attribut `class`.
 * @param {string | undefined} cls
 */
const colorClass = (cls) => (cls && /^text-[a-z0-9-]+$/.test(cls) ? cls : '');

/**
 * L'adresse d'une image que le site a résolue. Relative (`/images/…` : le
 * processus de quick n'a pas `NEXT_PUBLIC_IMG_BASE`), elle passe sous `imgBase`.
 * @param {ViewEnv} env
 * @param {string} src
 */
const srcOf = (env, src) => env.esc(src.startsWith('/') ? `${env.imgBase}${src}` : src);

/**
 * Une description du jeu en `title` : sans ses balises de couleur, ses `\n`
 * littéraux en sauts de ligne.
 * @param {ViewEnv} env
 * @param {string | undefined} desc
 */
const titleOf = (env, desc) =>
  desc ? ` title="${env.esc(desc.replace(/<\/?color[^>]*>/gi, '').replace(/\\n/g, '\n'))}"` : '';

/**
 * Un texte du jeu : `<color=#hex>…</color>` en span coloré (`renderGameColors`
 * du site), les sauts de ligne — `\n` littéraux des tables compris — en `<br>`.
 * @param {ViewEnv} env
 * @param {string} text
 */
export function gameText(env, text) {
  /** @param {string} part */
  const lines = (part) => env.esc(part).replace(/\\n|\r?\n/g, '<br>');
  let out = '';
  let last = 0;
  for (const m of text.matchAll(/<color=(#[0-9a-fA-F]{3,8})>([\s\S]*?)<\/color>/gi)) {
    out += `${lines(text.slice(last, m.index))}<span style="color:${m[1]}">${lines(m[2])}</span>`;
    last = m.index + m[0].length;
  }
  return out + lines(text.slice(last));
}

/**
 * Une note en segments, telle que le site la rend (`InlinePreview.tsx`) : le
 * texte, les sauts de ligne, et chaque balise résolue — icône et libellé dans
 * la couleur du site. Une balise que le site ne résout pas (`unknown`) sort en
 * ROUGE : c'est l'alerte de syntaxe.
 * @param {ViewEnv} env
 * @param {readonly PreviewSegment[]} segments
 */
export function noteHtml(env, segments) {
  /** @param {string} src */
  const ico = (src) =>
    `<img class="pv-ico" src="${srcOf(env, src)}" alt="" width="18" height="18" />`;
  /**
   * @param {PreviewSegment} seg
   * @param {string} body
   */
  const chip = (seg, body) =>
    `<span class="${['pv-seg', colorClass(seg.color)].filter(Boolean).join(' ')}"${titleOf(env, seg.desc)}>${body}</span>`;
  /**
   * @param {string | undefined} text
   * @param {boolean} [underline]
   */
  const word = (text, underline) =>
    underline ? `<span class="pv-u">${env.esc(text ?? '')}</span>` : env.esc(text ?? '');

  return segments
    .map((seg) => {
      switch (seg.t) {
        case 'text':
          return env.esc(seg.s ?? '');
        case 'br':
          return '<br>';
        case 'icon':
          return chip(seg, `${seg.icon ? ico(seg.icon) : ''}${word(seg.label, seg.underline)}`);
        case 'effect':
          return chip(
            seg,
            `${
              seg.icon
                ? `<span class="pv-fx ${seg.isDebuff ? 'debuff' : 'buff'}">${img(env, '', `ui/effect/${seg.icon}`)}</span>`
                : ''
            }${word(seg.label, true)}`,
          );
        case 'item':
          return chip(
            seg,
            `<span class="pv-it">${img(env, '', `ui/bg/TI_Slot_${SLOT_FRAME[seg.grade ?? ''] ?? 'Normal'}`)}${
              seg.iconSrc ? `<img src="${srcOf(env, seg.iconSrc)}" alt="" />` : ''
            }</span>${word(seg.name, true)}`,
          );
        case 'stat':
          return chip(
            { ...seg, color: 'text-stat' },
            `${seg.iconSrc ? ico(seg.iconSrc) : ''}${word(seg.name)}`,
          );
        // `unknown`, et tout segment que ce module ne connaît pas encore.
        default:
          return `<span class="pv-unknown">${env.esc(seg.s ?? `{${seg.t}}`)}</span>`;
      }
    })
    .join('');
}

/**
 * Les combos d'un build en LIGNES (`groupCombos` de la fiche perso) : les
 * combos 2 + 2 qui partagent un set se regroupent sous lui — le plus partagé
 * du build à gauche, l'ordre curé à égalité ; un set joué à 4 fait sa ligne.
 * @param {readonly (readonly PreviewSetPiece[])[]} sets
 * @returns {{ head: PreviewSetPiece, tails: PreviewSetPiece[] }[]}
 */
export function groupCombos(sets) {
  /** @type {Map<string, number>} */
  const freq = new Map();
  for (const combo of sets)
    if (combo.length > 1) for (const p of combo) freq.set(p.id, (freq.get(p.id) ?? 0) + 1);
  /** @type {{ head: PreviewSetPiece, tails: PreviewSetPiece[] }[]} */
  const lines = [];
  for (const combo of sets) {
    if (!combo.length) continue;
    const [head, ...rest] =
      combo.length > 1
        ? [...combo].sort((a, b) => (freq.get(b.id) ?? 0) - (freq.get(a.id) ?? 0))
        : combo;
    const line = rest.length
      ? lines.find((l) => l.head.id === head.id && l.tails.length > 0)
      : undefined;
    if (line) line.tails.push(...rest);
    else lines.push({ head, tails: rest });
  }
  return lines;
}

/** Les segments d'une barre de priorité (`TOTAL_SEGMENTS` de la fiche perso). */
const BAR_SEGMENTS = 6;

/**
 * La priorité des substats en BARRE (`SubstatPrioBar` de la fiche perso, que
 * l'éditeur de l'admin montre aussi) : une ligne par stat — son icône, son
 * abréviation — et dessous six segments, pleins jusqu'à son rang.
 *
 * La chaîne se lit comme sur le site : `>` sépare les rangs, et chaque rang
 * perd un segment (il en reste toujours un) ; un rang vide — un `>>` — en fait
 * perdre un de plus ; `=` met plusieurs stats au même rang. Sans le verdict
 * flat / % de la fiche : l'admin ne l'a pas non plus.
 *
 * @param {ViewEnv} env
 * @param {string} prio La priorité curée (`ATK>CHC=CHD>SPD`).
 * @param {Readonly<Record<string, string>>} statIcons Abréviation → sprite (`STAT_ICON`).
 */
export function substatBarHtml(env, prio, statIcons) {
  let lines = '';
  let level = 0;
  for (const token of prio.split('>')) {
    const rank = token.trim();
    if (rank) {
      const filled = Math.max(1, BAR_SEGMENTS - level);
      const segs = Array.from(
        { length: BAR_SEGMENTS },
        (_, i) => `<span class="pv-bar-seg${i < filled ? ' on' : ''}"></span>`,
      ).join('');
      for (const stat of rank.split('=').map((s) => s.trim()))
        lines += `<div class="pv-bar-line"><span class="pv-bar-stat">${
          statIcons[stat]
            ? img(env, '', `ui/stat/${statIcons[stat]}`, ' width="14" height="14"')
            : ''
        }${env.esc(stat)}</span><div class="pv-bar-segs">${segs}</div></div>`;
    }
    level++;
  }
  return `<div class="pv-bar">${lines}</div>`;
}

/**
 * L'aperçu d'un build : ce que la fiche perso en montrera. Vide quand le build
 * n'a ni pièce, ni set, ni substats, ni note.
 * @param {ViewEnv} env
 * @param {PreviewBuild} build
 * @param {PreviewLabels} labels
 * @param {Readonly<Record<string, string>>} statIcons Abréviation → sprite (`STAT_ICON`).
 */
export function previewHtml(env, build, labels, statIcons) {
  /**
   * @param {string} label
   * @param {string} body
   * @param {string} [cls]
   */
  const row = (label, body, cls = '') =>
    `<div class="pv-row${cls}"><span class="pv-lbl">${env.esc(label)}</span><div class="pv-cell">${body}</div></div>`;

  // Une pièce (`ItemRow`) : sa tuile, son nom dans la couleur du grade, ses
  // stats principales en puces. Inconnue du résolveur : son id, en rouge.
  /** @param {PreviewItem} item */
  const piece = (item) => {
    if (item.unresolved) return `<p class="pv-bad">${env.esc(item.name || item.id)}</p>`;
    const chips = (item.mainStat ?? '')
      .split('/')
      .map((stat) => stat.trim())
      .filter(Boolean)
      .map(
        (stat) =>
          `<span class="pv-chip">${
            statIcons[stat]
              ? img(env, '', `ui/stat/${statIcons[stat]}`, ' width="14" height="14"')
              : ''
          }${env.esc(stat)}</span>`,
      )
      .join('');
    return `<div class="pv-item">${
      item.icon
        ? itemTile(
            env,
            {
              icon: item.icon,
              grade: item.grade ?? 'normal',
              star: item.star,
              overlayIcon: item.overlayIcon,
              classLimits: item.classType ? [item.classType] : [],
            },
            44,
          )
        : ''
    }<div class="pv-item-t">${
      gradeColor(item.grade)
        ? itemName(env, item.name, item.grade, 'pv-name')
        : `<span class="pv-name text-equipment">${env.esc(item.name)}</span>`
    }${chips ? `<div class="pv-chips">${chips}</div>` : ''}</div></div>`;
  };
  /** @param {readonly PreviewItem[]} items */
  const pieces = (items) => `<div class="pv-items">${items.map(piece).join('')}</div>`;

  // Une ligne de combos (`ComboLineView`) : les tuiles du premier set et son
  // nom, puis « + », les tuiles gloves + shoes UNE fois et le nom de chaque
  // second set (son icône devant quand ils sont plusieurs).
  /**
   * @param {PreviewSetPiece} set
   * @param {number} idx
   */
  const tiles = (set, idx) =>
    `<span class="gv-row">${shownPieces(set.count, idx)
      .map((i) => set.pieceIcons?.[i])
      .filter(Boolean)
      .map((icon) => itemTile(env, { icon, grade: 'unique', overlayIcon: set.icon }, 32))
      .join('')}</span>`;
  /**
   * @param {PreviewSetPiece} set
   * @param {boolean} [icon]
   */
  const setName = (set, icon) =>
    `<span class="pv-set text-equipment">${
      icon && set.icon ? img(env, '', `ui/effect/${set.icon}`, ' width="16" height="16"') : ''
    }${env.esc(set.name)}</span>`;
  const combos = groupCombos(build.sets)
    .map(
      ({ head, tails }) =>
        `<div class="pv-combo">${tiles(head, 0)}${setName(head)}${
          head.count >= 4 ? `<span class="pv-dim">· ${env.esc(labels.piece4)}</span>` : ''
        }${
          tails.length
            ? `<span class="pv-plus">+</span>${tiles(
                tails.length === 1 ? tails[0] : { ...tails[0], icon: undefined },
                1,
              )}<span class="pv-tails">${tails
                .map(
                  (set, i) =>
                    `${i ? '<span class="pv-dot">·</span>' : ''}${setName(set, tails.length > 1)}`,
                )
                .join('')}</span>`
            : ''
        }</div>`,
    )
    .join('');

  // La légende des bonus (`SetEffectLines`) : le 4 pièces seulement si le set
  // est joué à 4 ; le préfixe « 2 pièces » seulement si un set du build l'est.
  const counted = build.setEffects.some((eff) => eff.maxCount >= 4);
  const legend = build.setEffects
    .map(
      (eff) =>
        `<span class="pv-set text-equipment">${env.esc(eff.name)}</span><div>${
          eff.effect2
            ? `<p>${counted ? `<span class="pv-count text-buff">${env.esc(labels.piece2)}</span> ` : ''}${gameText(env, eff.effect2)}</p>`
            : ''
        }${
          eff.maxCount >= 4 && eff.effect4
            ? `<p><span class="pv-count text-buff">${env.esc(labels.piece4)}</span> ${gameText(env, eff.effect4)}</p>`
            : ''
        }</div>`,
    )
    .join('');

  return [
    build.weapons.length ? row(labels.weapon, pieces(build.weapons)) : '',
    build.amulets.length ? row(labels.amulet, pieces(build.amulets)) : '',
    build.talismans.length ? row(labels.talisman, pieces(build.talismans)) : '',
    build.sets.length
      ? row(
          labels.set,
          `<div class="pv-combos">${combos}</div>${legend ? `<div class="pv-legend">${legend}</div>` : ''}`,
          ' pv-sets',
        )
      : '',
    build.substats ? row(labels.substatPrio, substatBarHtml(env, build.substats, statIcons)) : '',
    build.noteSegments.length
      ? row(labels.note, `<p class="pv-note">${noteHtml(env, build.noteSegments)}</p>`)
      : '',
  ].join('');
}
