/**
 * PARSE-TEXT — moteur des tags inline du contenu éditorial (portage V2, en
 * mieux : résolution 100 % CÔTÉ SERVEUR contre nos données ; le client ne
 * garde que l'interactivité des tooltips).
 *
 * Tags : {B/clé} {D/clé} (effets via l'encyclopédie), {E/élément}, {C/classe},
 * {S/stat}, {P/perso}, {SK/perso|S1..S3|Passive|Chain}, {EE/perso},
 * {L/label|/chemin}, {I-W|A|T/nom} (équipement par nom EN → lien vers la page
 * détail), {I-I/nom} (item générique du catalogue), {AS/nom} (set d'armure,
 * tooltip 2P/4P). Le tag restant ({SKB/…} — skills de boss) est rendu en texte
 * stylé neutre en attendant l'extraction du domaine monstres (portage guides).
 *
 * Une clé inconnue s'affiche en ROUGE (comme en V2) : c'est un signal d'erreur
 * de contenu, voulu et visible.
 */
import type { ReactNode } from 'react';
import type { Lang } from '@/lib/i18n/config';
import type { TFunction, TranslationKey } from '@/i18n';
import { lRec } from '@/lib/i18n/localize';
import { img, ELEMENT_TEXT, GRADE_TEXT } from '@/lib/images';
import { STAT_ICON, statDesc, statName } from '@/lib/stats';
import { SKILL_SHORTHAND } from '@/lib/skills';
import { resolveEffectKey } from '@/lib/data/effects';
import { getAllCharacters, characterDisplayName, slugForId } from '@/lib/data/characters';
import {
  getAmuletFamilies,
  getSetViews,
  getTalismanFamilies,
  getWeaponFamilies,
  type GearFamily,
  type SetView,
} from '@/lib/data/equipment';
import { localePath } from '@/lib/navigation';
import { InlineIcon } from '@/components/inline/InlineIcon';
import { ItemInline } from '@/components/inline/ItemInline';
import { StatInline } from '@/components/inline/StatInline';
import { EffectIconTile } from '@/components/character/EffectChips';
import type { Character, Item, Skill, LangDict } from '@contracts';
import skillsData from '@data/generated/skills.json';
import eeData from '@data/generated/equipment/ee.json';
import itemsData from '@data/generated/items.json';

const SKILLS = skillsData as unknown as Record<string, Skill>;
const EE = eeData as unknown as Record<string, { name: LangDict }>;
const ITEMS = itemsData as unknown as Record<string, Item>;

export interface ParseCtx {
  lang: Lang;
  t: TFunction;
}

// Index perso par NOM D'AFFICHAGE EN (clé du contenu éditorial), construit une fois.
let charByName: Map<string, Character> | null = null;
function findCharacter(name: string): Character | undefined {
  if (!charByName) {
    charByName = new Map();
    for (const c of getAllCharacters()) {
      charByName.set(characterDisplayName(c, 'en').toLowerCase(), c);
    }
  }
  return charByName.get(name.trim().toLowerCase());
}

/** Chip d'effet ({B/…}/{D/…}) : tuile d'icône RECOLORÉE (comme les chips de
 * skill) + libellé + tooltip descriptif. */
function effectChip(side: 'buff' | 'debuff', key: string, ctx: ParseCtx, k: number): ReactNode {
  const eff = resolveEffectKey(side, key);
  if (!eff)
    return (
      <span key={k} className="text-red-500">
        {key}
      </span>
    );
  const label = lRec(eff.name, ctx.lang) || eff.name.en || key;
  const desc = lRec(eff.desc, ctx.lang) || eff.desc.en;
  const isDebuff = side === 'debuff';
  const tooltip = (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-1.5">
        {eff.icon && <EffectIconTile icon={eff.icon} isDebuff={isDebuff} className="h-6 w-6" />}
        <span className="text-sm font-bold text-white">{label}</span>
      </div>
      {desc && <p className="text-xs text-neutral-200">{desc}</p>}
    </div>
  );
  return (
    <InlineIcon
      key={k}
      iconNode={
        eff.icon ? (
          <EffectIconTile icon={eff.icon} isDebuff={isDebuff} className="h-4.5 w-4.5" />
        ) : undefined
      }
      label={label}
      color={side === 'buff' ? 'text-buff' : 'text-debuff'}
      tooltip={tooltip}
      tooltipBg={side === 'buff' ? 'bg-buff-bg' : 'bg-debuff-bg'}
    />
  );
}

/** Chip perso ({P/…}) : lien + tooltip carte (visage, rareté, élément, classe). */
function characterChip(name: string, ctx: ParseCtx, k: number): ReactNode {
  const c = findCharacter(name);
  if (!c)
    return (
      <span key={k} className="text-red-500">
        {name}
      </span>
    );
  const display = characterDisplayName(c, ctx.lang);
  const slug = slugForId(c.id);
  const el = ctx.t(`sys.element.${c.element}` as TranslationKey);
  const cl = ctx.t(`sys.class.${c.class}` as TranslationKey);
  const tooltip = (
    <div className="flex gap-2">
      {/* eslint-disable-next-line @next/next/no-img-element -- asset R2/staging */}
      <img src={img.face(c.id)} alt={display} className="h-14 w-14 shrink-0 rounded" />
      <div className="flex flex-col gap-0.5">
        <span className="text-sm font-bold text-white">{display}</span>
        <span className="text-xs text-neutral-300">{'★'.repeat(c.rarity)}</span>
        <span className={`flex items-center gap-1 text-xs ${ELEMENT_TEXT[c.element] ?? ''}`}>
          {/* eslint-disable-next-line @next/next/no-img-element -- asset R2/staging */}
          <img src={img.element(c.element)} alt="" className="h-4 w-4" /> {el}
        </span>
        <span className="text-class flex items-center gap-1 text-xs">
          {/* eslint-disable-next-line @next/next/no-img-element -- asset R2/staging */}
          <img src={img.klass(c.class)} alt="" className="h-4 w-4" /> {cl}
        </span>
      </div>
    </div>
  );
  return (
    <InlineIcon
      key={k}
      label={display}
      color="text-buff"
      href={slug ? localePath(ctx.lang, `/characters/${slug}`) : undefined}
      tooltip={tooltip}
    />
  );
}

/** Chip skill ({SK/perso|S2}) : icône + nom du skill, lien vers la fiche. */
function skillChip(value: string, ctx: ParseCtx, k: number): ReactNode {
  const [name, shorthand] = value.split('|');
  const c = findCharacter(name);
  const type = SKILL_SHORTHAND[shorthand?.trim() ?? ''];
  const skill = c?.skills.map((id) => SKILLS[id]).find((s) => s && s.type === type);
  if (!c || !skill)
    return (
      <span key={k} className="text-red-500">
        {value}
      </span>
    );
  const slug = slugForId(c.id);
  const label = lRec(skill.name, ctx.lang) || skill.name.en || shorthand;
  return (
    <InlineIcon
      key={k}
      icon={skill.icon ? img.skill(skill.icon) : undefined}
      label={label}
      color="text-highlight"
      href={slug ? `${localePath(ctx.lang, `/characters/${slug}`)}#skills` : undefined}
    />
  );
}

/** Chip EE ({EE/perso}) : icône + nom de l'équipement exclusif. */
function eeChip(name: string, ctx: ParseCtx, k: number): ReactNode {
  const c = findCharacter(name);
  const ee = c?.ee ? EE[c.ee] : undefined;
  if (!c || !ee)
    return (
      <span key={k} className="text-red-500">
        {name}
      </span>
    );
  const slug = slugForId(c.id);
  return (
    <InlineIcon
      key={k}
      icon={img.ee(c.id)}
      label={lRec(ee.name, ctx.lang) || ee.name.en}
      color="text-item-legendary"
      href={slug ? `${localePath(ctx.lang, `/characters/${slug}`)}#ee` : undefined}
    />
  );
}

/** Tags différés (boss non extraits) — rendu neutre en attendant le domaine. */
function pendingChip(value: string, k: number): ReactNode {
  const label = value.split('|')[0];
  return (
    <span key={k} className="text-equipment underline decoration-dotted">
      {label}
    </span>
  );
}

// Index des sets d'armure par nom EN, par langue (les textes 2P/4P des vues
// sont pré-localisés). Le contenu écrit « Attack » ou « Attack Set ».
const setIndexes = new Map<Lang, Map<string, SetView>>();
function findSet(name: string, lang: Lang): SetView | undefined {
  let index = setIndexes.get(lang);
  if (!index) {
    index = new Map();
    for (const v of getSetViews(lang)) {
      const en = v.name.en.trim().toLowerCase();
      index.set(en, v);
      index.set(en.replace(/\s+set$/, ''), v);
    }
    setIndexes.set(lang, index);
  }
  return index.get(name.trim().toLowerCase());
}

/** Chip set d'armure ({AS/nom}) : tuile d'armure + nom, tooltip 2P/4P (V2). */
function setChip(name: string, ctx: ParseCtx, k: number): ReactNode {
  const set = findSet(name, ctx.lang);
  const icon = set?.pieceIcons.armor ?? Object.values(set?.pieceIcons ?? {})[0];
  if (!set || !icon)
    return (
      <span key={k} className="text-red-500">
        {name}
      </span>
    );
  const label = lRec(set.name, ctx.lang) || set.name.en;
  // Effets au palier ENCHANTÉ (dernier), comme la V2.
  const tier = set.tiers[set.tiers.length - 1];
  const tooltip = (
    <div className="flex gap-2">
      <span className="relative h-10 w-10 shrink-0">
        {/* eslint-disable-next-line @next/next/no-img-element -- asset R2/staging */}
        <img src={img.effect(set.icon)} alt={label} className="h-full w-full object-contain" />
      </span>
      <div className="flex flex-col gap-0.5">
        <span className="text-equipment text-sm font-bold">{label}</span>
        {tier?.p2 && (
          <p className="text-xs">
            <span className="text-buff">{ctx.t('equip.set.2piece')}: </span>
            <span className="text-neutral-200">{tier.p2}</span>
          </p>
        )}
        {tier?.p4 && (
          <p className="text-xs">
            <span className="text-buff">{ctx.t('equip.set.4piece')}: </span>
            <span className="text-neutral-200">{tier.p4}</span>
          </p>
        )}
      </div>
    </div>
  );
  return (
    <ItemInline
      key={k}
      item={{ name: label, iconSrc: img.equipment(icon), grade: 'legendary' }}
      tooltip={tooltip}
      href={localePath(ctx.lang, `/equipment/${set.slug}`)}
    />
  );
}

// Index des familles d'équipement par NOM D'AFFICHAGE EN (clé du contenu
// éditorial, comme les persos), construit une fois par type.
const familyIndexes: Partial<Record<'weapon' | 'amulet' | 'talisman', Map<string, GearFamily>>> =
  {};
function findFamily(kind: 'weapon' | 'amulet' | 'talisman', name: string): GearFamily | undefined {
  let index = familyIndexes[kind];
  if (!index) {
    const families =
      kind === 'weapon'
        ? getWeaponFamilies()
        : kind === 'amulet'
          ? getAmuletFamilies()
          : getTalismanFamilies();
    index = new Map(families.map((f) => [f.name.en.trim().toLowerCase(), f]));
    familyIndexes[kind] = index;
  }
  const key = name.trim().toLowerCase();
  // Tolère le suffixe de variante de classe des noms V2 (« … [Ranger] ») —
  // les familles V3 regroupent les déclinaisons sous le nom nu.
  return index.get(key) ?? index.get(key.replace(/\s*\[[^\]]+\]$/, ''));
}

/** Chip équipement ({I-W|A|T/nom}) : tuile du haut de famille (6★ légendaire)
 * sur son cadre de rareté + nom coloré par grade + lien détail. */
function equipmentChip(
  kind: 'weapon' | 'amulet' | 'talisman',
  name: string,
  ctx: ParseCtx,
  k: number,
): ReactNode {
  const f = findFamily(kind, name);
  if (!f)
    return (
      <span key={k} className="text-red-500">
        {name}
      </span>
    );
  return (
    <ItemInline
      key={k}
      item={{
        name: lRec(f.name, ctx.lang) || f.name.en,
        iconSrc: img.equipment(f.icon),
        grade: f.grade,
      }}
      color={GRADE_TEXT[f.grade] ?? 'text-equipment'}
      href={localePath(ctx.lang, `/equipment/${f.slug}`)}
    />
  );
}

// Index des items génériques par nom EN (catalogue extrait complet).
let itemByName: Map<string, Item & { id: string }> | null = null;
/** Chip item générique ({I-I/nom}) : icône + nom + description en tooltip. */
function itemChip(name: string, ctx: ParseCtx, k: number): ReactNode {
  if (!itemByName) {
    itemByName = new Map();
    for (const [id, it] of Object.entries(ITEMS)) {
      itemByName.set(it.name.en.trim().toLowerCase(), { ...it, id });
    }
  }
  const it = itemByName.get(name.trim().toLowerCase());
  if (!it)
    return (
      <span key={k} className="text-red-500">
        {name}
      </span>
    );
  const label = lRec(it.name, ctx.lang) || it.name.en;
  const desc = (lRec(it.desc, ctx.lang) || it.desc?.en || '').replace(/\\n/g, '\n');
  return (
    <ItemInline
      key={k}
      item={{
        name: label,
        iconSrc: img.equipment(it.icon),
        grade: it.grade,
        desc: desc || undefined,
      }}
    />
  );
}

type TagHandler = (value: string, ctx: ParseCtx, key: number) => ReactNode;

const TAG_MAP: Record<string, TagHandler> = {
  B: (v, ctx, k) => effectChip('buff', v, ctx, k),
  D: (v, ctx, k) => effectChip('debuff', v, ctx, k),
  E: (v, ctx, k) => {
    const slug = v.trim().toLowerCase();
    return (
      <InlineIcon
        key={k}
        icon={img.element(slug)}
        label={ctx.t(`sys.element.${slug}` as TranslationKey)}
        color={ELEMENT_TEXT[slug] ?? ''}
        underline={false}
      />
    );
  },
  C: (v, ctx, k) => {
    const [name, subclass] = v.split('|');
    const slug = name.trim().toLowerCase();
    const label = subclass
      ? ctx.t(`sys.subclass.${subclass.trim().toLowerCase()}` as TranslationKey)
      : ctx.t(`sys.class.${slug}` as TranslationKey);
    const icon = subclass ? img.subClass(subclass.trim().toLowerCase()) : img.klass(slug);
    return <InlineIcon key={k} icon={icon} label={label} color="text-class" underline={false} />;
  },
  S: (v, ctx, k) => {
    const icon = STAT_ICON[v];
    if (!icon)
      return (
        <span key={k} className="text-red-500">
          {v}
        </span>
      );
    return (
      <StatInline
        key={k}
        iconSrc={img.statIcon(icon)}
        name={statName(v, ctx.lang)}
        desc={statDesc(v, ctx.lang)}
      />
    );
  },
  P: (v, ctx, k) => characterChip(v, ctx, k),
  SK: (v, ctx, k) => skillChip(v, ctx, k),
  EE: (v, ctx, k) => eeChip(v, ctx, k),
  L: (v, _ctx, k) => {
    const sep = v.indexOf('|');
    const label = sep === -1 ? v : v.slice(0, sep);
    const href = sep === -1 ? '' : v.slice(sep + 1);
    return <InlineIcon key={k} label={label} color="text-highlight" href={href || undefined} />;
  },
  // Domaine équipement : items branchés sur les familles / le catalogue.
  'I-W': (v, ctx, k) => equipmentChip('weapon', v, ctx, k),
  'I-A': (v, ctx, k) => equipmentChip('amulet', v, ctx, k),
  'I-T': (v, ctx, k) => equipmentChip('talisman', v, ctx, k),
  'I-I': (v, ctx, k) => itemChip(v, ctx, k),
  AS: (v, ctx, k) => setChip(v, ctx, k),
  // Restant : différé (rendu neutre, pas une erreur de contenu) — les skills
  // de boss attendent l'extraction du domaine monstres (portage des guides).
  SKB: (v, _ctx, k) => pendingChip(v, k),
};

const TAG_REGEX = /\{((?:[BDSCEPL])|EE|AS|SKB|SK|I-(?:W|A|T|I))\/([^}]+)\}/g;

// --- Contrôle des tags (outil admin) -------------------------------------------

/** Un tag inline rencontré dans un texte éditorial + son statut de résolution. */
export interface TagCheck {
  tag: string;
  type: string;
  value: string;
  ok: boolean;
  /** Raison d'échec (type inconnu / clé sans correspondance). */
  reason?: string;
}

/** Vérifie qu'UN tag a une correspondance dans la donnée (même résolution que le rendu). */
function checkTag(type: string, value: string): { ok: boolean; reason?: string } {
  const v = value.trim();
  switch (type) {
    case 'B':
      return resolveEffectKey('buff', v) ? { ok: true } : { ok: false, reason: 'effet inconnu' };
    case 'D':
      return resolveEffectKey('debuff', v) ? { ok: true } : { ok: false, reason: 'effet inconnu' };
    case 'E':
      return ELEMENT_TEXT[v.toLowerCase()] !== undefined
        ? { ok: true }
        : { ok: false, reason: 'élément inconnu' };
    case 'C':
      return { ok: true }; // classe/sous-classe : libellé i18n, jamais bloquant
    case 'S':
      return STAT_ICON[v] ? { ok: true } : { ok: false, reason: 'stat inconnue' };
    case 'P':
      return findCharacter(v) ? { ok: true } : { ok: false, reason: 'perso inconnu' };
    case 'SK': {
      const [name, shorthand] = v.split('|');
      const c = findCharacter(name ?? '');
      if (!c) return { ok: false, reason: 'perso inconnu' };
      const t = SKILL_SHORTHAND[shorthand?.trim() ?? ''];
      if (!t) return { ok: false, reason: 'raccourci de skill inconnu' };
      return c.skills.some((id) => SKILLS[id]?.type === t)
        ? { ok: true }
        : { ok: false, reason: 'skill absent du kit' };
    }
    case 'EE': {
      const c = findCharacter(v);
      if (!c) return { ok: false, reason: 'perso inconnu' };
      return c.ee && EE[c.ee] ? { ok: true } : { ok: false, reason: 'pas d’EE' };
    }
    case 'L':
      return { ok: true };
    case 'AS':
      return findSet(v, 'en') ? { ok: true } : { ok: false, reason: 'set inconnu' };
    case 'SKB':
      return { ok: true }; // différé (domaine monstres) — rendu neutre, pas une erreur
    case 'I-W':
      return findFamily('weapon', v) ? { ok: true } : { ok: false, reason: 'arme inconnue' };
    case 'I-A':
      return findFamily('amulet', v) ? { ok: true } : { ok: false, reason: 'amulette inconnue' };
    case 'I-T':
      return findFamily('talisman', v) ? { ok: true } : { ok: false, reason: 'talisman inconnu' };
    case 'I-I': {
      if (!itemByName) {
        itemByName = new Map();
        for (const [id, it] of Object.entries(ITEMS))
          itemByName.set(it.name.en.trim().toLowerCase(), { ...it, id });
      }
      return itemByName.has(v.toLowerCase()) ? { ok: true } : { ok: false, reason: 'item inconnu' };
    }
    default:
      return { ok: false, reason: 'type de tag inconnu' };
  }
}

/**
 * Contrôle d'un texte éditorial : tous les tags `{TYPE/valeur}` rencontrés,
 * avec leur statut de correspondance — y compris les tags MALFORMÉS que le
 * moteur de rendu ignorerait silencieusement (type hors liste).
 */
export function checkText(text: string): TagCheck[] {
  const out: TagCheck[] = [];
  for (const m of text.matchAll(/\{([A-Z-]+)\/([^}]+)\}/g)) {
    const [tag, type, value] = m;
    const res = TAG_MAP[type]
      ? checkTag(type, value)
      : { ok: false, reason: 'type de tag inconnu' };
    out.push({ tag, type, value, ...res });
  }
  return out;
}

/**
 * Parse un texte éditorial (tags inline + sauts de ligne) en nœuds React.
 * Server-safe : appeler depuis un Server Component avec `{ lang, t }`.
 */
export function parseText(text: string, ctx: ParseCtx): ReactNode {
  if (!text) return null;

  const parts: ReactNode[] = [];
  let lastIndex = 0;
  let key = 0;
  let match: RegExpExecArray | null;
  TAG_REGEX.lastIndex = 0;

  while ((match = TAG_REGEX.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(...splitLineBreaks(text.slice(lastIndex, match.index), key));
      key += 100;
    }
    const [, tagType, value] = match;
    const handler = TAG_MAP[tagType];
    parts.push(
      handler ? (
        handler(value, ctx, key++)
      ) : (
        <span key={key++} className="text-red-500">
          {match[0]}
        </span>
      ),
    );
    lastIndex = TAG_REGEX.lastIndex;
  }
  if (lastIndex < text.length) parts.push(...splitLineBreaks(text.slice(lastIndex), key));

  if (parts.length === 0) return null;
  if (parts.length === 1) return parts[0];
  return parts;
}

/** Coupe sur les sauts de ligne (littéraux `\n` inclus) et insère des <br/>. */
function splitLineBreaks(text: string, startKey: number): ReactNode[] {
  const lines = text.split(/\\n|\r?\n/);
  const result: ReactNode[] = [];
  for (let i = 0; i < lines.length; i++) {
    if (i > 0) result.push(<br key={`br${startKey + i}`} />);
    if (lines[i]) result.push(lines[i]);
  }
  return result;
}
