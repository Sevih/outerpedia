import { img } from '@/lib/images';
import { statAbbr } from '@/lib/stats';
import { InlineTooltip } from '@/components/inline/InlineTooltip';
import { renderGameColors } from '@/components/ui/GameText';

/** Effet structuré (forme invariante ; les nombres viennent des `vars` du niveau). */
export interface ClientEffect {
  family: string;
  category: string;
  buff?: string;
  stat?: string;
  mode?: 'up' | 'down';
  tooltip?: string;
  /** Symbole CreateText (effet mécanique sans tooltip). */
  label?: string;
}

/** Statut nommé pré-localisé (référencé par `tooltip` ou `label`). */
export type StatusMap = Record<
  string,
  {
    name: string;
    isDebuff: boolean;
    icon?: string;
    desc?: string;
    /** Ignoré de la version live (curation `hidden`). */
    hidden?: boolean;
  }
>;

/**
 * Tuile d'icône d'effet : fond noir + recoloration buff/debuff (sauf variantes
 * « Interruption », déjà colorées avec leur cadre). Partagée chips + admin.
 *
 * Recoloration par MASQUE DE LUMINANCE : un aplat de la couleur cible masqué
 * par l'image — teinte 100 % UNIFORME quelle que soit la luminosité de l'art
 * (un filtre CSS teinte chaque pixel selon sa clarté → nuances disparates), et
 * le noir (fond opaque de certains sprites) devient transparent.
 */
export function EffectIconTile({
  icon,
  isDebuff,
  className = 'h-6 w-6',
}: {
  icon: string;
  isDebuff: boolean;
  className?: string;
}) {
  const src = img.effect(icon);
  const recolor = !icon.includes('Interruption');
  const mask: React.CSSProperties = {
    maskImage: `url(${src})`,
    maskMode: 'luminance',
    maskSize: 'contain',
    maskRepeat: 'no-repeat',
    maskPosition: 'center',
    WebkitMaskImage: `url(${src})`,
    WebkitMaskSize: 'contain',
    WebkitMaskRepeat: 'no-repeat',
    WebkitMaskPosition: 'center',
  };
  return (
    <span className={`relative inline-block shrink-0 rounded bg-black align-middle ${className}`}>
      {recolor ? (
        // Calque EMPILÉ ×3 : l'alpha du masque suit la luminance de l'art —
        // les arts gris ressortiraient éteints. L'empilement cumule l'alpha
        // (1-(1-a)³) et égalise la luminosité sans cramer les contours.
        [0, 1, 2].map((i) => (
          <span
            key={i}
            className={`absolute inset-0 ${isDebuff ? 'bg-debuff-tint' : 'bg-buff-tint'}`}
            style={mask}
          />
        ))
      ) : (
        // eslint-disable-next-line @next/next/no-img-element -- asset R2/staging
        <img src={src} alt="" className="absolute inset-0 h-full w-full object-contain" />
      )}
    </span>
  );
}

/** Libellé d'un effet : statut/mécanique nommé, sinon stat, sinon famille. */
function effectLabel(e: ClientEffect, statuses: StatusMap): string {
  const key = e.tooltip ?? e.label;
  if (key && statuses[key]) return statuses[key].name;
  if (e.stat) return statAbbr(e.stat);
  return e.family;
}

/** Un effet nommé, prêt à afficher (icône, nom et description déjà localisés). */
export interface NamedEffect {
  name: string;
  icon?: string;
  isDebuff: boolean;
  desc?: string;
}

/** Corps du tooltip d'un effet : icône + nom + description du jeu. */
export function EffectTooltipBody({ name, icon, isDebuff, desc }: NamedEffect) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-1.5">
        {icon && <EffectIconTile icon={icon} isDebuff={isDebuff} />}
        <span className="text-sm font-bold text-white">{name}</span>
      </div>
      {/* Texte du jeu : \n littéraux + balises <color=#hex> interprétés. */}
      {desc && (
        <p className="text-xs whitespace-pre-line text-neutral-200">
          {renderGameColors(desc.replace(/\\n/g, '\n'))}
        </p>
      )}
    </div>
  );
}

/**
 * Effet en ICÔNE SEULE, son nom au survol (ou au clic, au doigt) — la forme des
 * immunités : elles se lisent d'un coup d'œil, et une rangée de pastilles
 * nommées mangerait la moitié du panneau pour dire ce qu'une grille d'icônes dit
 * mieux. Le nom reste atteignable : `title` pour l'accessibilité, tooltip au
 * pointeur, tap sur mobile (InlineTooltip).
 */
export function EffectIconBadge({
  effect,
  className = 'h-7 w-7',
}: {
  effect: NamedEffect;
  className?: string;
}) {
  if (!effect.icon) {
    return (
      <span className={effect.isDebuff ? 'text-debuff text-xs' : 'text-buff text-xs'}>
        {effect.name}
      </span>
    );
  }
  return (
    <InlineTooltip
      content={<EffectTooltipBody {...effect} />}
      bg={effect.isDebuff ? 'bg-debuff-bg' : 'bg-buff-bg'}
    >
      <button type="button" className="cursor-default" title={effect.name}>
        <span className="sr-only">{effect.name}</span>
        <EffectIconTile icon={effect.icon} isDebuff={effect.isDebuff} className={className} />
      </button>
    </InlineTooltip>
  );
}

/**
 * Pill NUE d'effet (icône + nom) avec emplacement d'ACTIONS en enfants —
 * même visuel qu'EffectChip, pour les surfaces interactives (éditeur de
 * câblage admin : croix, poignée de drag). Les couleurs restent ici, sous
 * l'exception V2 confinée à ce dossier.
 */
export function EffectPillShell({
  icon,
  name,
  isDebuff,
  children,
}: {
  icon?: string;
  name: string;
  isDebuff: boolean;
  children?: React.ReactNode;
}) {
  return (
    <span
      className={`flex items-center gap-1 rounded-md py-0.5 pr-1 pl-0.5 [&_button]:text-white ${
        isDebuff ? 'bg-debuff-bg' : 'bg-buff-bg'
      }`}
    >
      {icon && <EffectIconTile icon={icon} isDebuff={isDebuff} className="h-5 w-5" />}
      <span className="text-[11px] font-semibold text-white">{name}</span>
      {children}
    </span>
  );
}

/**
 * Chip d'effet (portage V2 BuffDebuffDisplay) : pill buff/debuff avec icône du
 * jeu recolorée (sauf variantes « Interruption »), NOM SEUL dans la pill — les
 * montants/durées vivent dans la description du skill, comme en V2 — et
 * tooltip icône + nom + description au survol.
 */
export function EffectChip({ effect, statuses }: { effect: ClientEffect; statuses: StatusMap }) {
  const key = effect.tooltip ?? effect.label;
  const status = key ? statuses[key] : undefined;
  const label = effectLabel(effect, statuses);
  const isDebuff = status ? status.isDebuff : effect.category !== 'buff';
  const bg = isDebuff ? 'bg-debuff-bg' : 'bg-buff-bg';
  const icon = status?.icon;

  const pill = (
    <span className={`flex items-center gap-1 rounded-md py-0.5 pr-1.5 pl-0.5 ${bg}`}>
      {icon && <EffectIconTile icon={icon} isDebuff={isDebuff} className="h-5 w-5" />}
      <span className="text-[11px] font-semibold text-white">{label}</span>
    </span>
  );

  if (!status?.desc) return pill;
  return (
    <InlineTooltip
      content={
        <EffectTooltipBody name={status.name} icon={icon} isDebuff={isDebuff} desc={status.desc} />
      }
      bg={bg}
    >
      <button type="button" className="cursor-default">
        {pill}
      </button>
    </InlineTooltip>
  );
}

/**
 * Rangée de chips (équivalent BuffDebuffDisplay V2). Seuls les effets NOMMÉS
 * (tooltip/label) apparaissent — les effets techniques sans nom (bonus de
 * pénétration passif, dégâts proportionnels à une stat…) sont du câblage
 * interne, pas des statuts côté joueur. Les statuts curés `hidden` sont
 * ignorés de la version live.
 */
export function EffectChipsRow({
  effects,
  statuses,
}: {
  effects: ClientEffect[];
  statuses: StatusMap;
}) {
  // Dédup par libellé affiché (un skill peut appliquer 2 buffs du même statut,
  // ex. double « Cooldown Reduction »). La variante irremovable COEXISTE avec
  // sa version de base (icônes différentes, comme en V2) mais se dédoublonne
  // AUSSI entre elles : le flag entre dans la clé (les passifs world boss
  // appliquent 5 stacks du même « Courage Against Despair » irremovable —
  // une seule chip).
  const seen = new Set<string>();
  const visible = effects.filter((e) => {
    const key = e.tooltip ?? e.label;
    if (!key) return false;
    const status = statuses[key];
    if (status?.hidden) return false;
    const isIrremovable = Boolean(status?.icon?.includes('Interruption'));
    const displayKey = `${isIrremovable ? 'IR|' : ''}${status?.name ?? key}`;
    if (seen.has(displayKey)) return false;
    seen.add(displayKey);
    return true;
  });
  if (!visible.length) return null;
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {visible.map((e, i) => (
        <EffectChip key={i} effect={e} statuses={statuses} />
      ))}
    </div>
  );
}
