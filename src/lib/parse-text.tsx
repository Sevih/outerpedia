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
import { characterDisplayName, findCharacterByName, slugForId } from '@/lib/data/characters';
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
import type { CatalogEntry, Skill, LangDict } from '@contracts';
import skillsData from '@data/generated/skills.json';
import eeData from '@data/generated/equipment/ee.json';
import itemsData from '@data/generated/items.json';

const SKILLS = skillsData as unknown as Record<string, Skill>;
const EE = eeData as unknown as Record<string, { name: LangDict }>;
// Catalogue d'items UNIFIÉ (items + monnaies + costumes + curé baked).
const ITEMS = itemsData as unknown as Record<string, CatalogEntry>;

export interface ParseCtx {
  lang: Lang;
  t: TFunction;
  /**
   * Mode STRICT (guides) : une référence inconnue lève une exception au lieu
   * de s'afficher en rouge → le build SSG CASSE sur un tag mort plutôt que de
   * publier la page. Les pages tolérantes (curé perso legacy) restent en rouge.
   */
  strict?: boolean;
}

// Résolution par NOM D'AFFICHAGE EN (clé du contenu éditorial) : index partagé
// du data layer (également utilisé par les guides).
const findCharacter = findCharacterByName;

/** Référence de contenu inconnue : ROUGE en tolérant, EXCEPTION en strict. */
function unknownRef(display: string, ref: string, ctx: ParseCtx, k: number): ReactNode {
  if (ctx.strict) throw new Error(`parse-text : référence de contenu inconnue — ${ref}`);
  return (
    <span key={k} className="text-red-500">
      {display}
    </span>
  );
}

/** Chip d'effet ({B/…}/{D/…}) : tuile d'icône RECOLORÉE (comme les chips de
 * skill) + libellé + tooltip descriptif. */
function effectChip(side: 'buff' | 'debuff', key: string, ctx: ParseCtx, k: number): ReactNode {
  const eff = resolveEffectKey(side, key);
  if (!eff) return unknownRef(key, `{${side === 'buff' ? 'B' : 'D'}/${key}}`, ctx, k);
  const label = lRec(eff.name, ctx.lang) || eff.name.en || key;
  const desc = lRec(eff.desc, ctx.lang) || eff.desc.en;
  const isDebuff = side === 'debuff';
  const tooltip = (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-1.5">
        {eff.icon && <EffectIconTile icon={eff.icon} isDebuff={isDebuff} className="h-6 w-6" />}
        {/* Texte de tooltip sur surface sombre : tokens contenu (thème unique sombre). */}
        <span className="text-content-strong text-sm font-bold">{label}</span>
      </div>
      {desc && <p className="text-content text-xs">{desc}</p>}
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
  if (!c) return unknownRef(name, `{P/${name}}`, ctx, k);
  const display = characterDisplayName(c, ctx.lang);
  const slug = slugForId(c.id);
  const el = ctx.t(`sys.element.${c.element}` as TranslationKey);
  const cl = ctx.t(`sys.class.${c.class}` as TranslationKey);
  const tooltip = (
    <div className="flex gap-2">
      <img src={img.face(c.id)} alt={display} className="h-14 w-14 shrink-0 rounded" />
      <div className="flex flex-col gap-0.5">
        <span className="text-content-strong text-sm font-bold">{display}</span>
        <span className="text-content text-xs">{'★'.repeat(c.rarity)}</span>
        <span className={`flex items-center gap-1 text-xs ${ELEMENT_TEXT[c.element] ?? ''}`}>
          <img src={img.element(c.element)} alt="" className="h-4 w-4" /> {el}
        </span>
        <span className="text-class flex items-center gap-1 text-xs">
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
  if (!c || !skill) return unknownRef(value, `{SK/${value}}`, ctx, k);
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
  if (!c || !ee) return unknownRef(name, `{EE/${name}}`, ctx, k);
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
  if (!set || !icon) return unknownRef(name, `{AS/${name}}`, ctx, k);
  const label = lRec(set.name, ctx.lang) || set.name.en;
  // Effets au palier ENCHANTÉ (dernier), comme la V2.
  const tier = set.tiers[set.tiers.length - 1];
  const tooltip = (
    <div className="flex gap-2">
      <span className="relative h-10 w-10 shrink-0">
        <img src={img.equipment(set.icon)} alt={label} className="h-full w-full object-contain" />
      </span>
      <div className="flex flex-col gap-0.5">
        <span className="text-equipment text-sm font-bold">{label}</span>
        {tier?.p2 && (
          <p className="text-xs">
            <span className="text-buff">{ctx.t('equip.set.2piece')}: </span>
            <span className="text-content">{tier.p2}</span>
          </p>
        )}
        {tier?.p4 && (
          <p className="text-xs">
            <span className="text-buff">{ctx.t('equip.set.4piece')}: </span>
            <span className="text-content">{tier.p4}</span>
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
  if (!f) return unknownRef(name, `{I-${kind[0].toUpperCase()}/${name}}`, ctx, k);
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

/**
 * Index des items génériques par nom EN — catalogue SERVI UNIFIÉ (items +
 * monnaies + costumes + créations curées, bakées au build), même namespace
 * d'icône `images/items/`. Client-safe : `items.json` est un import statique,
 * la curation y est déjà fusionnée (pas d'accès `node:fs` requis).
 */
type CatalogChip = { id: string; name: LangDict; desc?: LangDict; icon: string; grade: string };
let itemByName: Map<string, CatalogChip> | null = null;
function catalogIndex(): Map<string, CatalogChip> {
  if (itemByName) return itemByName;
  const m = new Map<string, CatalogChip>();
  for (const [id, e] of Object.entries(ITEMS)) {
    if (e.hidden) continue; // masqué : non référençable
    const key = e.name.en?.trim().toLowerCase();
    if (key && !m.has(key))
      m.set(key, { id, name: e.name, desc: e.desc, icon: e.icon, grade: e.grade });
  }
  itemByName = m;
  return m;
}

/** Chip item générique ({I-I/nom}) : icône + nom + description en tooltip. */
function itemChip(name: string, ctx: ParseCtx, k: number): ReactNode {
  const it = catalogIndex().get(name.trim().toLowerCase());
  if (!it) return unknownRef(name, `{I-I/${name}}`, ctx, k);
  const label = lRec(it.name, ctx.lang) || it.name.en;
  const desc = (lRec(it.desc, ctx.lang) || it.desc?.en || '').replace(/\\n/g, '\n');
  return (
    <ItemInline
      key={k}
      item={{
        name: label,
        iconSrc: img.item(it.icon),
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
    if (!icon) return unknownRef(v, `{S/${v}}`, ctx, k);
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

/**
 * Options de `checkText` — le validateur de cibles internes est INJECTÉ par
 * l'appelant (test des guides, contrôle admin). `parse-text` ne peut pas
 * importer `data/guides` (node:fs → casserait le bundle client) : il reçoit
 * donc un prédicat plutôt qu'un accès disque.
 */
export interface CheckOptions {
  /**
   * Existence d'une cible interne `/guides/...` (landing de catégorie ou fiche).
   * Absent = liens NON validés (le rendu runtime n'en passe pas ; seuls le test
   * et l'admin, qui ont les données, l'injectent).
   */
  guideHrefExists?: (href: string) => boolean;
}

/** Vérifie qu'UN tag a une correspondance dans la donnée (même résolution que le rendu). */
function checkTag(
  type: string,
  value: string,
  opts?: CheckOptions,
): { ok: boolean; reason?: string } {
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
    case 'L': {
      const sep = v.indexOf('|');
      const href = sep === -1 ? '' : v.slice(sep + 1).trim();
      // Seules les cibles INTERNES `/guides/...` sont contrôlées, et seulement
      // si un validateur est fourni. Externes, ancres, autres domaines internes
      // et liens sans href (label seul) passent — hors périmètre.
      if (opts?.guideHrefExists && /^\/guides(\/|$)/.test(href)) {
        return opts.guideHrefExists(href)
          ? { ok: true }
          : { ok: false, reason: 'guide lié introuvable' };
      }
      return { ok: true };
    }
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
    case 'I-I':
      return catalogIndex().has(v.trim().toLowerCase())
        ? { ok: true }
        : { ok: false, reason: 'item inconnu' };
    default:
      return { ok: false, reason: 'type de tag inconnu' };
  }
}

/**
 * Aplatit un texte à tags en TEXTE BRUT (JSON-LD, meta descriptions) : chaque
 * tag est remplacé par son premier segment de payload — le nom visible dans la
 * quasi-totalité des cas (`{P/Delta}` → « Delta », `{L/label|/chemin}` →
 * « label », `{E/fire}` → « fire »). Approximation lisible et fidèle, sans
 * résolution : un schéma n'a pas besoin d'icônes ni de tooltips.
 */
export function plainInlineText(text: string): string {
  return text
    .replace(/\{[A-Z-]+\/([^}|]*)(?:\|[^}]*)?\}/g, '$1')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

/**
 * Contrôle d'un texte éditorial : tous les tags `{TYPE/valeur}` rencontrés,
 * avec leur statut de correspondance — y compris les tags MALFORMÉS que le
 * moteur de rendu ignorerait silencieusement (type hors liste).
 */
export function checkText(text: string, opts?: CheckOptions): TagCheck[] {
  const out: TagCheck[] = [];
  for (const m of text.matchAll(/\{([A-Z-]+)\/([^}]+)\}/g)) {
    const [tag, type, value] = m;
    const res = TAG_MAP[type]
      ? checkTag(type, value, opts)
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

  // Strict : un TYPE de tag hors liste ne matche pas TAG_REGEX et passerait en
  // texte brut — le motif générique (celui de checkText) l'attrape et on casse.
  if (ctx.strict) {
    for (const m of text.matchAll(/\{([A-Z-]+)\/([^}]+)\}/g)) {
      if (!TAG_MAP[m[1]]) throw new Error(`parse-text : type de tag inconnu — ${m[0]}`);
    }
  }

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
    parts.push(handler ? handler(value, ctx, key++) : unknownRef(match[0], match[0], ctx, key++));
    lastIndex = TAG_REGEX.lastIndex;
  }
  if (lastIndex < text.length) parts.push(...splitLineBreaks(text.slice(lastIndex), key));

  if (parts.length === 0) return null;
  if (parts.length === 1) return parts[0];
  return parts;
}

// --- Descripteurs d'aperçu (outil admin) ---------------------------------------
//
// L'éditeur inline (admin) ne peut pas rendre `parseText` dans le navigateur :
// ses résolveurs d'effets/équipement lisent la couche curée sur disque. On
// expose donc la RÉSOLUTION (server) sous forme de DONNÉES pures — mêmes
// résolveurs, mêmes icônes/couleurs/liens — que le composant client rend avec
// les VRAIS composants inline. Aucune dérive : les lookups sont partagés avec
// les handlers ci-dessus ; seule la mise en forme (déjà triviale) est projetée.

/** Un segment d'un texte éditorial résolu, en données sérialisables. */
export type InlineSegment =
  | { t: 'text'; s: string }
  | { t: 'br' }
  | { t: 'unknown'; s: string }
  | { t: 'icon'; label: string; color: string; icon?: string; href?: string; underline: boolean }
  | { t: 'effect'; label: string; color: string; icon?: string; isDebuff: boolean; desc?: string }
  | { t: 'item'; name: string; iconSrc: string; grade: string; color: string; href?: string; desc?: string } // prettier-ignore
  | { t: 'stat'; name: string; iconSrc?: string; desc?: string };

/** Résout UN tag en descripteur (ou `unknown` = rouge), miroir de `TAG_MAP`. */
function resolveSegment(type: string, value: string, lang: Lang, t: TFunction): InlineSegment {
  const unknown = (): InlineSegment => ({ t: 'unknown', s: `{${type}/${value}}` });
  switch (type) {
    case 'B':
    case 'D': {
      const side = type === 'B' ? 'buff' : 'debuff';
      const eff = resolveEffectKey(side, value);
      if (!eff) return unknown();
      return {
        t: 'effect',
        label: lRec(eff.name, lang) || eff.name.en || value,
        color: side === 'buff' ? 'text-buff' : 'text-debuff',
        icon: eff.icon,
        isDebuff: side === 'debuff',
        desc: lRec(eff.desc, lang) || eff.desc.en || undefined,
      };
    }
    case 'E': {
      const slug = value.trim().toLowerCase();
      return {
        t: 'icon',
        label: t(`sys.element.${slug}` as TranslationKey),
        color: ELEMENT_TEXT[slug] ?? '',
        icon: img.element(slug),
        underline: false,
      };
    }
    case 'C': {
      const [name, subclass] = value.split('|');
      const label = subclass
        ? t(`sys.subclass.${subclass.trim().toLowerCase()}` as TranslationKey)
        : t(`sys.class.${name.trim().toLowerCase()}` as TranslationKey);
      const icon = subclass
        ? img.subClass(subclass.trim().toLowerCase())
        : img.klass(name.trim().toLowerCase());
      return { t: 'icon', label, color: 'text-class', icon, underline: false };
    }
    case 'S': {
      const icon = STAT_ICON[value];
      if (!icon) return unknown();
      return { t: 'stat', name: statName(value, lang), iconSrc: img.statIcon(icon), desc: statDesc(value, lang) }; // prettier-ignore
    }
    case 'P': {
      const c = findCharacter(value);
      if (!c) return unknown();
      const slug = slugForId(c.id);
      return {
        t: 'icon',
        label: characterDisplayName(c, lang),
        color: 'text-buff',
        href: slug ? localePath(lang, `/characters/${slug}`) : undefined,
        underline: true,
      };
    }
    case 'SK': {
      const [name, shorthand] = value.split('|');
      const c = findCharacter(name);
      const skType = SKILL_SHORTHAND[shorthand?.trim() ?? ''];
      const skill = c?.skills.map((id) => SKILLS[id]).find((s) => s && s.type === skType);
      if (!c || !skill) return unknown();
      const slug = slugForId(c.id);
      return {
        t: 'icon',
        label: lRec(skill.name, lang) || skill.name.en || (shorthand ?? ''),
        color: 'text-highlight',
        icon: skill.icon ? img.skill(skill.icon) : undefined,
        href: slug ? `${localePath(lang, `/characters/${slug}`)}#skills` : undefined,
        underline: true,
      };
    }
    case 'EE': {
      const c = findCharacter(value);
      const ee = c?.ee ? EE[c.ee] : undefined;
      if (!c || !ee) return unknown();
      const slug = slugForId(c.id);
      return {
        t: 'icon',
        label: lRec(ee.name, lang) || ee.name.en,
        color: 'text-item-legendary',
        icon: img.ee(c.id),
        href: slug ? `${localePath(lang, `/characters/${slug}`)}#ee` : undefined,
        underline: true,
      };
    }
    case 'L': {
      const sep = value.indexOf('|');
      const label = sep === -1 ? value : value.slice(0, sep);
      const href = sep === -1 ? '' : value.slice(sep + 1);
      return {
        t: 'icon',
        label,
        color: 'text-highlight',
        href: href || undefined,
        underline: true,
      };
    }
    case 'I-W':
    case 'I-A':
    case 'I-T': {
      const kind = type === 'I-W' ? 'weapon' : type === 'I-A' ? 'amulet' : 'talisman';
      const f = findFamily(kind, value);
      if (!f) return unknown();
      return {
        t: 'item',
        name: lRec(f.name, lang) || f.name.en,
        iconSrc: img.equipment(f.icon),
        grade: f.grade,
        color: GRADE_TEXT[f.grade] ?? 'text-equipment',
        href: localePath(lang, `/equipment/${f.slug}`),
      };
    }
    case 'I-I': {
      const it = catalogIndex().get(value.trim().toLowerCase());
      if (!it) return unknown();
      return {
        t: 'item',
        name: lRec(it.name, lang) || it.name.en,
        iconSrc: img.item(it.icon),
        grade: it.grade,
        color: 'text-equipment',
        desc: (lRec(it.desc, lang) || it.desc?.en || '').replace(/\\n/g, '\n') || undefined,
      };
    }
    case 'AS': {
      const set = findSet(value, lang);
      const icon = set?.pieceIcons.armor ?? Object.values(set?.pieceIcons ?? {})[0];
      if (!set || !icon) return unknown();
      return {
        t: 'item',
        name: lRec(set.name, lang) || set.name.en,
        iconSrc: img.equipment(icon),
        grade: 'legendary',
        color: 'text-equipment',
        href: localePath(lang, `/equipment/${set.slug}`),
      };
    }
    case 'SKB':
      // Différé (skills de boss) : rendu neutre stylé, comme `pendingChip`.
      return { t: 'icon', label: value.split('|')[0], color: 'text-equipment', underline: true };
    default:
      return unknown();
  }
}

/**
 * Résout un texte éditorial en SEGMENTS de données (aperçu admin) : mêmes tags
 * et mêmes résolveurs que `parseText`, mais projetés en descripteurs purs
 * (sérialisables), rendus côté client par les vrais composants inline. Tolérant
 * (un tag mort devient un segment `unknown` = rouge) — c'est un aperçu, pas un build.
 */
export function resolveInlineSegments(text: string, ctx: ParseCtx): InlineSegment[] {
  if (!text) return [];
  const segments: InlineSegment[] = [];
  const pushText = (raw: string) => {
    const lines = raw.split(/\\n|\r?\n/);
    lines.forEach((line, i) => {
      if (i > 0) segments.push({ t: 'br' });
      if (line) segments.push({ t: 'text', s: line });
    });
  };
  let last = 0;
  for (const m of text.matchAll(/\{((?:[BDSCEPL])|EE|AS|SKB|SK|I-(?:W|A|T|I))\/([^}]+)\}/g)) {
    const at = m.index ?? 0;
    if (at > last) pushText(text.slice(last, at));
    segments.push(resolveSegment(m[1], m[2], ctx.lang, ctx.t));
    last = at + m[0].length;
  }
  if (last < text.length) pushText(text.slice(last));
  return segments;
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
