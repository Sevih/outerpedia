'use client';

import { useMemo, useState } from 'react';
import { Tabs } from '@/components/ui/Tabs';
import {
  ClassIconPill,
  ElementIconPill,
  IconPill,
  StarPill,
  ELEMENT_HEX,
  TONE,
  FILTERS_TOOLBAR_CLASS,
  FILTERS_FIELD_CLASS,
  BarGroup,
  SearchField,
  ToolbarDivider,
} from '@/components/character/filters/FilterAtoms';
import { FilterPill } from '@/components/character/filters/FilterPill';
import { img } from '@/lib/images';
import { EECard, GearCard, SetCard, TalismanCard, shopIconSrc } from './cards';
import type { EERow, GearRow, RowSource, SetRow } from './cards';

/** Libellés pré-traduits (la page serveur passe le dictionnaire). */
export interface BrowserLabels {
  tabs: { weapons: string; amulets: string; sets: string; talismans: string; ee: string };
  search: string;
  class: string;
  element: string;
  source: string;
  mainStat: string;
  /** Groupe des étoiles (niveau max de l'équipement). */
  level: string;
  /** Groupe AP/CP des talismans. */
  type: string;
  /** Première option des selects (« Tous »). */
  all: string;
  /** `aria.star_rarity` — `{rarity}` interpolé. */
  starAria: string;
  unlock: string;
  upgrade: string;
  /** Libellés localisés des VALEURS d'options (slug → libellé), comme
   * CharactersBrowser — tooltips des pills et options des selects. */
  options: { element: Record<string, string>; class: Record<string, string> };
}

/** Bascule d'une valeur dans une sélection multiple (même sémantique que
 * CharactersBrowser : rien de sélectionné = tout passe). */
function toggle<T>(list: T[], v: T): T[] {
  return list.includes(v) ? list.filter((x) => x !== v) : [...list, v];
}

/** Ordre d'affichage canonique des éléments (celui des pills characters). */
const ELEMENT_ORDER = Object.keys(ELEMENT_HEX);

/** Option du filtre source — boss (portrait, halo élémentaire), boutique
 * (sprite du jeu) ou libellé curé (pill texte) ; sélection MULTIPLE (OU). */
interface SourceOption {
  value: string;
  label: string;
  /** URL du sprite (portrait de boss ou icône de boutique). */
  iconSrc?: string;
  /** Teinte du halo (élément du boss ; cyan sinon). */
  color?: string;
}

/** Queue de liste ÉDITORIALE du filtre source (choix Sevih) : les 4 boss
 * d'équipement dans l'ordre du jeu, puis les boutiques — tout le reste passe
 * devant, en alphabétique. */
const SOURCE_TAIL = [
  'b:51202001', // Iron Stretcher
  'b:51202002', // Blockbuster
  'b:51202003', // Mutated Wyvre
  'b:51202004', // Irregular Queen
  's:adventure_license',
  's:event_shop',
];

function sourceOptions(rows: { source?: RowSource }[]): SourceOption[] {
  const out = new Map<string, SourceOption>();
  for (const r of rows) {
    for (const b of r.source?.bosses ?? [])
      out.set(`b:${b.id}`, {
        value: `b:${b.id}`,
        label: b.name,
        iconSrc: img.boss(`MT_${b.icon}`),
        color: ELEMENT_HEX[b.element] ?? TONE.cyan,
      });
    for (const s of r.source?.shops ?? [])
      out.set(`s:${s.slug}`, {
        value: `s:${s.slug}`,
        label: s.label,
        iconSrc: shopIconSrc(s.slug),
      });
    if (r.source?.label)
      out.set(`l:${r.source.label}`, { value: `l:${r.source.label}`, label: r.source.label });
  }
  return [...out.values()].sort((a, b) => {
    const ra = SOURCE_TAIL.indexOf(a.value);
    const rb = SOURCE_TAIL.indexOf(b.value);
    if (ra !== rb) return ra - rb; // hors queue (-1) devant, la queue dans l'ordre déclaré
    return a.label.localeCompare(b.label);
  });
}

function matchesSource(r: { source?: RowSource }, sel: string[]): boolean {
  if (!sel.length) return true;
  return sel.some((s) => {
    if (s.startsWith('b:')) return Boolean(r.source?.bosses.some((b) => b.id === s.slice(2)));
    if (s.startsWith('s:')) return Boolean(r.source?.shops?.some((x) => x.slug === s.slice(2)));
    return r.source?.label === s.slice(2);
  });
}

/** Groupe de pills du filtre source : icônes (boss/boutiques) en IconPill,
 * libellés curés sans sprite en pill texte. */
function SourcePills({
  options,
  selected,
  onToggle,
}: {
  options: SourceOption[];
  selected: string[];
  onToggle: (v: string) => void;
}) {
  return (
    <>
      {options.map((o) =>
        o.iconSrc ? (
          <IconPill
            key={o.value}
            active={selected.includes(o.value)}
            color={o.color ?? TONE.cyan}
            onClick={() => onToggle(o.value)}
            title={o.label}
            aria-label={o.label}
          >
            <img
              src={o.iconSrc}
              alt=""
              aria-hidden
              className="size-7 rounded-md object-contain"
              width={28}
              height={28}
            />
          </IconPill>
        ) : (
          <FilterPill
            key={o.value}
            active={selected.includes(o.value)}
            onClick={() => onToggle(o.value)}
            className="h-9 px-3"
          >
            {o.label}
          </FilterPill>
        ),
      )}
    </>
  );
}

/** Toolbar d'onglet : même coquille que la barre de /characters, compteur à
 * droite. Les enfants sont les groupes (SearchField, BarGroup, selects…). */
function Toolbar({ count, children }: { count: number; children: React.ReactNode }) {
  return (
    <div className={FILTERS_TOOLBAR_CLASS}>
      {children}
      <div className="flex-1" />
      <span className="text-content-subtle pb-2 font-mono text-xs">{count}</span>
    </div>
  );
}

/** Select assorti à la toolbar, précédé de son eyebrow (mêmes codes que
 * BarGroup — pour les listes trop longues pour des pills : sources, stats). */
function SelectGroup({
  label,
  value,
  onChange,
  allLabel,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  allLabel: string;
  options: { value: string; label: string }[];
}) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-content-muted text-center font-mono text-[10px] font-semibold tracking-[0.16em] uppercase">
        {label}
      </span>
      <select
        className={FILTERS_FIELD_CLASS}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="">{allLabel}</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}

/** Onglet armes / amulettes (filtres classe / étoiles / source / main stat). */
function GearTab({
  rows,
  labels,
  withMainStat,
}: {
  rows: GearRow[];
  labels: BrowserLabels;
  withMainStat?: boolean;
}) {
  const [q, setQ] = useState('');
  const [klass, setKlass] = useState<string[]>([]);
  const [stars, setStars] = useState<number[]>([]);
  const [source, setSource] = useState<string[]>([]);
  const [mainStat, setMainStat] = useState('');

  const classes = useMemo(() => [...new Set(rows.flatMap((r) => r.classLimits))].sort(), [rows]);
  const starOptions = useMemo(
    () => [...new Set(rows.map((r) => r.stars.at(-1) ?? 0))].filter(Boolean).sort((a, b) => a - b),
    [rows],
  );
  const sources = useMemo(() => sourceOptions(rows), [rows]);
  const mainStats = useMemo(() => [...new Set(rows.flatMap((r) => r.mainStats))].sort(), [rows]);

  const filtered = rows.filter(
    (r) =>
      (!q || r.name.toLowerCase().includes(q.trim().toLowerCase())) &&
      (!klass.length ||
        r.classLimits.length === 0 ||
        r.classLimits.some((c) => klass.includes(c))) &&
      (!stars.length || stars.includes(r.stars.at(-1) ?? 0)) &&
      matchesSource(r, source) &&
      (!mainStat || r.mainStats.includes(mainStat)),
  );

  return (
    <div className="space-y-4">
      <Toolbar count={filtered.length}>
        <div className="w-64 max-w-full">
          <SearchField value={q} onChange={setQ} placeholder={labels.search} />
        </div>
        <ToolbarDivider />
        <BarGroup label={labels.class}>
          {classes.map((c) => (
            <ClassIconPill
              key={c}
              classType={c}
              active={klass.includes(c)}
              onClick={() => setKlass(toggle(klass, c))}
              title={labels.options.class[c] ?? c}
            />
          ))}
        </BarGroup>
        <ToolbarDivider />
        <BarGroup label={labels.level}>
          {starOptions.map((s) => (
            <StarPill
              key={s}
              stars={s}
              active={stars.includes(s)}
              onClick={() => setStars(toggle(stars, s))}
              ariaLabel={labels.starAria.replace('{rarity}', String(s))}
            />
          ))}
        </BarGroup>
        {sources.length > 0 && (
          <>
            <ToolbarDivider />
            <BarGroup label={labels.source}>
              <SourcePills
                options={sources}
                selected={source}
                onToggle={(v) => setSource(toggle(source, v))}
              />
            </BarGroup>
          </>
        )}
        {withMainStat && (
          <>
            <ToolbarDivider />
            <SelectGroup
              label={labels.mainStat}
              value={mainStat}
              onChange={setMainStat}
              allLabel={labels.all}
              options={mainStats.map((m) => ({ value: m, label: m }))}
            />
          </>
        )}
      </Toolbar>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filtered.map((r) => (
          <GearCard key={r.id} row={r} sourceTitle={labels.source} />
        ))}
      </div>
    </div>
  );
}

function SetsTab({ rows, labels }: { rows: SetRow[]; labels: BrowserLabels }) {
  const [q, setQ] = useState('');
  const [source, setSource] = useState<string[]>([]);
  const sources = useMemo(() => sourceOptions(rows), [rows]);
  const filtered = rows.filter(
    (r) =>
      (!q || r.name.toLowerCase().includes(q.trim().toLowerCase())) && matchesSource(r, source),
  );
  return (
    <div className="space-y-4">
      <Toolbar count={filtered.length}>
        <div className="w-64 max-w-full">
          <SearchField value={q} onChange={setQ} placeholder={labels.search} />
        </div>
        {sources.length > 0 && (
          <>
            <ToolbarDivider />
            <BarGroup label={labels.source}>
              <SourcePills
                options={sources}
                selected={source}
                onToggle={(v) => setSource(toggle(source, v))}
              />
            </BarGroup>
          </>
        )}
      </Toolbar>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filtered.map((r) => (
          <SetCard key={r.id} row={r} sourceTitle={labels.source} />
        ))}
      </div>
    </div>
  );
}

function TalismansTab({ rows, labels }: { rows: GearRow[]; labels: BrowserLabels }) {
  const [q, setQ] = useState('');
  const [modes, setModes] = useState<string[]>([]);
  const filtered = rows.filter(
    (r) =>
      (!q || r.name.toLowerCase().includes(q.trim().toLowerCase())) &&
      (!modes.length || (r.mode && modes.includes(r.mode))),
  );
  return (
    <div className="space-y-4">
      <Toolbar count={filtered.length}>
        <div className="w-64 max-w-full">
          <SearchField value={q} onChange={setQ} placeholder={labels.search} />
        </div>
        <ToolbarDivider />
        <BarGroup label={labels.type}>
          {(['AP', 'CP'] as const).map((m) => (
            <FilterPill
              key={m}
              active={modes.includes(m)}
              onClick={() => setModes(toggle(modes, m))}
              className="h-8 px-3"
            >
              {m}
            </FilterPill>
          ))}
        </BarGroup>
      </Toolbar>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filtered.map((r) => (
          <TalismanCard key={r.id} row={r} sourceTitle={labels.source} />
        ))}
      </div>
    </div>
  );
}

function EETab({ rows, labels }: { rows: EERow[]; labels: BrowserLabels }) {
  const [q, setQ] = useState('');
  const [elements, setElements] = useState<string[]>([]);
  const [klass, setKlass] = useState<string[]>([]);
  const elementOptions = useMemo(
    () =>
      [...new Set(rows.map((r) => r.element))].sort(
        (a, b) => ELEMENT_ORDER.indexOf(a) - ELEMENT_ORDER.indexOf(b),
      ),
    [rows],
  );
  const classes = useMemo(() => [...new Set(rows.map((r) => r.classType))].sort(), [rows]);
  const filtered = rows.filter((r) => {
    const needle = q.trim().toLowerCase();
    return (
      (!needle ||
        r.name.toLowerCase().includes(needle) ||
        r.charName.toLowerCase().includes(needle)) &&
      (!elements.length || elements.includes(r.element)) &&
      (!klass.length || klass.includes(r.classType))
    );
  });
  return (
    <div className="space-y-4">
      <Toolbar count={filtered.length}>
        <div className="w-64 max-w-full">
          <SearchField value={q} onChange={setQ} placeholder={labels.search} />
        </div>
        <ToolbarDivider />
        <BarGroup label={labels.element}>
          {elementOptions.map((el) => (
            <ElementIconPill
              key={el}
              element={el}
              active={elements.includes(el)}
              onClick={() => setElements(toggle(elements, el))}
              title={labels.options.element[el] ?? el}
            />
          ))}
        </BarGroup>
        <ToolbarDivider />
        <BarGroup label={labels.class}>
          {classes.map((c) => (
            <ClassIconPill
              key={c}
              classType={c}
              active={klass.includes(c)}
              onClick={() => setKlass(toggle(klass, c))}
              title={labels.options.class[c] ?? c}
            />
          ))}
        </BarGroup>
      </Toolbar>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filtered.map((r) => (
          <EECard
            key={r.itemId}
            row={r}
            labels={{ unlock: labels.unlock, upgrade: labels.upgrade }}
          />
        ))}
      </div>
    </div>
  );
}

export function EquipmentBrowser({
  weapons,
  amulets,
  sets,
  talismans,
  ee,
  labels,
}: {
  weapons: GearRow[];
  amulets: GearRow[];
  sets: SetRow[];
  talismans: GearRow[];
  ee: EERow[];
  labels: BrowserLabels;
}) {
  return (
    <Tabs
      urlParam="tab"
      variant="game"
      tabs={[
        {
          id: 'weapons',
          label: labels.tabs.weapons,
          content: <GearTab rows={weapons} labels={labels} />,
        },
        {
          id: 'amulets',
          label: labels.tabs.amulets,
          content: <GearTab rows={amulets} labels={labels} withMainStat />,
        },
        { id: 'sets', label: labels.tabs.sets, content: <SetsTab rows={sets} labels={labels} /> },
        {
          id: 'talismans',
          label: labels.tabs.talismans,
          content: <TalismansTab rows={talismans} labels={labels} />,
        },
        { id: 'ee', label: labels.tabs.ee, content: <EETab rows={ee} labels={labels} /> },
      ]}
    />
  );
}
