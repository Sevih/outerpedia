'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { ResponsiveCharacterCard } from './ResponsiveCharacterCard';
import { CharactersFiltersBar, type FiltersBarLabels } from './filters/CharactersFiltersBar';
import { CharactersFiltersSidebar } from './filters/CharactersFiltersSidebar';
import { CharactersFiltersDrawer, type DrawerLabels } from './filters/CharactersFiltersDrawer';
import {
  ActiveFiltersStrip,
  type ActiveChipItem,
  type StripLabels,
} from './filters/ActiveFiltersStrip';
import type { AdvancedPanelLabels, FilterOption } from './filters/AdvancedFiltersPanel';
import { ELEMENT_HEX, ROLE_HEX, RARITY_HEX, TONE } from './filters/FilterAtoms';
import { decodeFilters, encodeFilters } from './filters/filter-codec';
import type { EffectGroup } from '@/lib/data/effect-filters';

/** Ligne allégée pour l'affichage + le filtrage. */
export interface CharacterRow {
  id: string;
  slug: string;
  /** Nom complet localisé (affiché sur la carte). */
  name: string;
  prefix?: string | null;
  /** Noms recherchables (toutes langues + id + slug), déjà normalisés. */
  searchNames: string[];
  element: string;
  class: string;
  rarity: number;
  chainType?: string;
  gift?: string;
  role?: string;
  isFusion: boolean;
  tags: string[];
  /** Clés d'effet CANONIQUES appliquées (repliées côté serveur) — filtres Effects. */
  buff?: string[];
  debuff?: string[];
  /** Mêmes clés canoniques ventilées par source de skill (s1/s2/ultimate/…). */
  effectsBySource?: Record<string, { buff: string[]; debuff: string[] }>;
  /** Stats données à toute l'équipe (bonus de transcendance) — filtre Bonus. */
  teamBonuses?: string[];
}

export interface CharactersBrowserLabels {
  bar: FiltersBarLabels;
  panel: AdvancedPanelLabels;
  strip: StripLabels;
  drawer: DrawerLabels;
  sidebar: { advanced: string; reset: string };
  noMatch: string;
  reset: string;
  /** Maps valeur → libellé localisé (options des filtres). */
  options: {
    element: Record<string, string>;
    class: Record<string, string>;
    role: Record<string, string>;
    chain: Record<string, string>;
    gift: Record<string, string>;
    tag: Record<string, string>;
  };
  /** Icônes des tags (slug → URL). */
  tagIcons: Record<string, string>;
  /** Données des filtres d'effets/bonus, construites côté serveur. */
  effects: {
    buff: EffectGroup[];
    debuff: EffectGroup[];
    sources: FilterOption[];
    teamBonus: FilterOption[];
  };
}

/** Options triées d'un champ, projetées en {value,label(,icon)}. */
function toOptions(
  values: string[],
  labelMap: Record<string, string>,
  icons?: Record<string, string>,
): FilterOption[] {
  return values.map((v) => ({ value: v, label: labelMap[v] ?? v, icon: icons?.[v] }));
}

export function CharactersBrowser({
  rows,
  labels,
}: {
  rows: CharacterRow[];
  labels: CharactersBrowserLabels;
}) {
  const router = useRouter();
  const pathname = usePathname();

  const [q, setQ] = useState('');
  const [element, setElement] = useState<string[]>([]);
  const [klass, setKlass] = useState<string[]>([]);
  const [rarity, setRarity] = useState<number[]>([]);
  const [chain, setChain] = useState<string[]>([]);
  const [gift, setGift] = useState<string[]>([]);
  const [role, setRole] = useState<string[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [tagLogic, setTagLogic] = useState<'AND' | 'OR'>('OR');
  const [buffs, setBuffs] = useState<string[]>([]);
  const [debuffs, setDebuffs] = useState<string[]>([]);
  const [effectLogic, setEffectLogic] = useState<'AND' | 'OR'>('OR');
  const [sources, setSources] = useState<string[]>([]);
  const [showUnique, setShowUnique] = useState(false);
  const [teamBonuses, setTeamBonuses] = useState<string[]>([]);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const hydrated = useRef(false);
  const lastUrl = useRef('');

  // ── Options distinctes (dérivées des lignes) ──
  const distinct = useCallback(
    (key: keyof CharacterRow) =>
      [...new Set(rows.map((r) => r[key]).filter(Boolean) as string[])].sort(),
    [rows],
  );
  const elements = useMemo(() => distinct('element'), [distinct]);
  const classes = useMemo(() => distinct('class'), [distinct]);
  const chains = useMemo(() => distinct('chainType'), [distinct]);
  const gifts = useMemo(() => distinct('gift'), [distinct]);
  const roles = useMemo(() => distinct('role'), [distinct]);
  const rarities = useMemo(
    () => [...new Set(rows.map((r) => r.rarity))].sort((a, b) => b - a),
    [rows],
  );
  const allTags = useMemo(() => [...new Set(rows.flatMap((r) => r.tags))].sort(), [rows]);

  // ── Bascule multi-sélection générique ──
  const toggle =
    <T,>(setter: React.Dispatch<React.SetStateAction<T[]>>) =>
    (value: T) =>
      setter((prev) => (prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]));

  // ── Hydratation depuis l'URL (au montage) ──
  // `?z=` compact (codec — liens V2 inclus) d'abord ; à défaut, les params en
  // clair (`?el=fire&…`) que la V3 a écrits entre le portage de la page et le
  // retour au codec (21/07) — des liens de cette période circulent peut-être.
  useEffect(() => {
    if (hydrated.current) return;
    hydrated.current = true;
    const p = new URLSearchParams(window.location.search);
    const decoded = decodeFilters(p.get('z'));
    const list = (k: string) => (p.get(k) ? p.get(k)!.split(',').filter(Boolean) : []);
    setQ(decoded ? decoded.q : (p.get('q') ?? ''));
    setElement(decoded ? decoded.element : list('el'));
    setKlass(decoded ? decoded.klass : list('cl'));
    setRarity(
      decoded
        ? decoded.rarity
        : list('r')
            .map(Number)
            .filter((n) => !Number.isNaN(n)),
    );
    setChain(decoded ? decoded.chain : list('chain'));
    setGift(decoded ? decoded.gift : list('gift'));
    setRole(decoded ? decoded.role : list('role'));
    setTags(decoded ? decoded.tags : list('tags'));
    setTagLogic(decoded ? decoded.tagLogic : p.get('tl') === 'AND' ? 'AND' : 'OR');
    setBuffs(decoded ? decoded.buffs : list('b'));
    setDebuffs(decoded ? decoded.debuffs : list('d'));
    setEffectLogic(decoded ? decoded.effectLogic : p.get('el2') === 'AND' ? 'AND' : 'OR');
    setSources(decoded ? decoded.sources : list('src'));
    setShowUnique(decoded ? decoded.showUnique : p.get('uniq') === '1');
    setTeamBonuses(decoded ? decoded.teamBonuses : list('tb'));
  }, []);

  // ── Sync filtres → URL (débattu) ──
  // La barre d'adresse EST le lien de partage : un seul `?z=` compact (l'URL
  // reste courte quel que soit le nombre de facettes), format V2 (filter-codec).
  useEffect(() => {
    if (!hydrated.current) return;
    const z = encodeFilters({
      q,
      element,
      klass,
      rarity,
      chain,
      gift,
      role,
      tags,
      tagLogic,
      buffs,
      debuffs,
      effectLogic,
      sources,
      showUnique,
      teamBonuses,
    });
    const url = z ? `${pathname}?z=${z}` : pathname;
    const handle = setTimeout(() => {
      if (lastUrl.current === url) return;
      lastUrl.current = url;
      // URL dynamique (filtres) → hors du typage des routes statiques de Next.
      router.replace(url as Parameters<typeof router.replace>[0], { scroll: false });
    }, 150);
    return () => clearTimeout(handle);
  }, [
    q,
    element,
    klass,
    rarity,
    chain,
    gift,
    role,
    tags,
    tagLogic,
    buffs,
    debuffs,
    effectLogic,
    sources,
    showUnique,
    teamBonuses,
    pathname,
    router,
  ]);

  // ── Filtrage ──
  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    const elS = new Set(element);
    const clS = new Set(klass);
    const rS = new Set(rarity);
    const chS = new Set(chain);
    const gS = new Set(gift);
    const roS = new Set(role);

    // Un effet appliqué par le perso, RESTREINT aux sources sélectionnées le cas
    // échéant (parité V2 `charHasEffectFromSources`). Clés déjà canoniques.
    const hasEffect = (row: CharacterRow, key: string, side: 'buff' | 'debuff') => {
      if (!sources.length) return (row[side] ?? []).includes(key);
      const ebs = row.effectsBySource;
      if (!ebs) return (row[side] ?? []).includes(key);
      return sources.some((s) => (ebs[s]?.[side] ?? []).includes(key));
    };

    return rows.filter((row) => {
      if (needle && !row.searchNames.some((n) => n.includes(needle))) return false;
      if (elS.size && !elS.has(row.element)) return false;
      if (clS.size && !clS.has(row.class)) return false;
      if (rS.size && !rS.has(row.rarity)) return false;
      if (chS.size && (!row.chainType || !chS.has(row.chainType))) return false;
      if (gS.size && (!row.gift || !gS.has(row.gift))) return false;
      if (roS.size && (!row.role || !roS.has(row.role))) return false;
      if (tags.length) {
        const ok =
          tagLogic === 'AND'
            ? tags.every((t) => row.tags.includes(t))
            : tags.some((t) => row.tags.includes(t));
        if (!ok) return false;
      }
      // Effets : buffs et debuffs combinés selon la logique ET/OU (parité V2).
      if (buffs.length || debuffs.length) {
        const hb = buffs.length
          ? effectLogic === 'AND'
            ? buffs.every((b) => hasEffect(row, b, 'buff'))
            : buffs.some((b) => hasEffect(row, b, 'buff'))
          : true;
        const hd = debuffs.length
          ? effectLogic === 'AND'
            ? debuffs.every((d) => hasEffect(row, d, 'debuff'))
            : debuffs.some((d) => hasEffect(row, d, 'debuff'))
          : true;
        const match =
          buffs.length && debuffs.length
            ? effectLogic === 'AND'
              ? hb && hd
              : hb || hd
            : buffs.length
              ? hb
              : hd;
        if (!match) return false;
      }
      // Bonus d'équipe : le perso doit fournir AU MOINS un des bonus cochés (OU).
      if (teamBonuses.length && !row.teamBonuses?.some((tb) => teamBonuses.includes(tb)))
        return false;
      return true;
    });
  }, [
    rows,
    q,
    element,
    klass,
    rarity,
    chain,
    gift,
    role,
    tags,
    tagLogic,
    buffs,
    debuffs,
    effectLogic,
    sources,
    teamBonuses,
  ]);

  // ── Reset / partage ──
  const resetAll = () => {
    setQ('');
    setElement([]);
    setKlass([]);
    setRarity([]);
    setChain([]);
    setGift([]);
    setRole([]);
    setTags([]);
    setTagLogic('OR');
    setBuffs([]);
    setDebuffs([]);
    setEffectLogic('OR');
    setSources([]);
    setShowUnique(false);
    setTeamBonuses([]);
  };
  const copyShareUrl = () => {
    if (typeof window === 'undefined') return;
    navigator.clipboard.writeText(window.location.href).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    });
  };

  // ── Chips actifs ──
  const chips: ActiveChipItem[] = useMemo(() => {
    const out: ActiveChipItem[] = [];
    if (q.trim())
      out.push({ key: 'q', label: `"${q.trim()}"`, color: TONE.cyan, onRemove: () => setQ('') });
    for (const el of element)
      out.push({
        key: `el-${el}`,
        label: labels.options.element[el] ?? el,
        color: ELEMENT_HEX[el] ?? TONE.cyan,
        onRemove: () => setElement((p) => p.filter((v) => v !== el)),
      });
    for (const cl of klass)
      out.push({
        key: `cl-${cl}`,
        label: labels.options.class[cl] ?? cl,
        color: TONE.cyan,
        onRemove: () => setKlass((p) => p.filter((v) => v !== cl)),
      });
    for (const r of rarity)
      out.push({
        key: `r-${r}`,
        label: `${r}★`,
        color: RARITY_HEX[r] ?? TONE.cyan,
        onRemove: () => setRarity((p) => p.filter((v) => v !== r)),
      });
    for (const c of chain)
      out.push({
        key: `ch-${c}`,
        label: labels.options.chain[c] ?? c,
        color: TONE.cyan,
        onRemove: () => setChain((p) => p.filter((v) => v !== c)),
      });
    for (const ro of role)
      out.push({
        key: `ro-${ro}`,
        label: labels.options.role[ro] ?? ro,
        color: ROLE_HEX[ro] ?? TONE.cyan,
        onRemove: () => setRole((p) => p.filter((v) => v !== ro)),
      });
    for (const g of gift)
      out.push({
        key: `g-${g}`,
        label: labels.options.gift[g] ?? g,
        color: TONE.amber,
        onRemove: () => setGift((p) => p.filter((v) => v !== g)),
      });
    for (const tk of tags)
      out.push({
        key: `t-${tk}`,
        label: labels.options.tag[tk] ?? tk,
        color: TONE.indigo,
        onRemove: () => setTags((p) => p.filter((v) => v !== tk)),
      });
    // Libellés des effets/sources/bonus (buff et debuff séparés : une même clé,
    // ex. `BT_STAT|ST_ATK`, existe des deux côtés avec un libellé différent).
    const flat = (gs: EffectGroup[]) =>
      new Map(gs.flatMap((g) => g.effects.map((e) => [e.key, e.label] as const)));
    const buffL = flat(labels.effects.buff);
    const debuffL = flat(labels.effects.debuff);
    const srcL = new Map(labels.effects.sources.map((o) => [o.value, o.label] as const));
    const tbL = new Map(labels.effects.teamBonus.map((o) => [o.value, o.label] as const));
    for (const b of buffs)
      out.push({
        key: `b-${b}`,
        label: buffL.get(b) ?? b,
        color: TONE.cyan,
        onRemove: () => setBuffs((p) => p.filter((v) => v !== b)),
      });
    for (const d of debuffs)
      out.push({
        key: `d-${d}`,
        label: debuffL.get(d) ?? d,
        color: TONE.rose,
        onRemove: () => setDebuffs((p) => p.filter((v) => v !== d)),
      });
    for (const s of sources)
      out.push({
        key: `src-${s}`,
        label: srcL.get(s) ?? s,
        color: TONE.cyan,
        onRemove: () => setSources((p) => p.filter((v) => v !== s)),
      });
    for (const tb of teamBonuses)
      out.push({
        key: `tb-${tb}`,
        label: tbL.get(tb) ?? tb,
        color: TONE.emerald,
        onRemove: () => setTeamBonuses((p) => p.filter((v) => v !== tb)),
      });
    return out;
  }, [
    q,
    element,
    klass,
    rarity,
    chain,
    role,
    gift,
    tags,
    buffs,
    debuffs,
    sources,
    teamBonuses,
    labels,
  ]);

  const advancedCount =
    chain.length +
    role.length +
    gift.length +
    tags.length +
    buffs.length +
    debuffs.length +
    sources.length +
    teamBonuses.length +
    (showUnique ? 1 : 0);

  const panelProps = {
    labels: labels.panel,
    chains: toOptions(chains, labels.options.chain),
    chainFilter: chain,
    onToggleChain: toggle(setChain),
    roles: toOptions(roles, labels.options.role),
    roleFilter: role,
    onToggleRole: toggle(setRole),
    gifts: toOptions(gifts, labels.options.gift),
    giftFilter: gift,
    onToggleGift: toggle(setGift),
    tags: toOptions(allTags, labels.options.tag, labels.tagIcons),
    tagFilter: tags,
    onToggleTag: toggle(setTags),
    tagLogic,
    onTagLogicChange: setTagLogic,
    // Effects
    buffGroups: labels.effects.buff,
    debuffGroups: labels.effects.debuff,
    selectedBuffs: buffs,
    onToggleBuff: toggle(setBuffs),
    selectedDebuffs: debuffs,
    onToggleDebuff: toggle(setDebuffs),
    effectLogic,
    onEffectLogicChange: setEffectLogic,
    sources: labels.effects.sources,
    sourceFilter: sources,
    onToggleSource: toggle(setSources),
    showUnique,
    onToggleShowUnique: () => setShowUnique((v) => !v),
    // Team Bonus
    teamBonusOptions: labels.effects.teamBonus,
    teamBonusFilter: teamBonuses,
    onToggleTeamBonus: toggle(setTeamBonuses),
  };

  return (
    <div className="space-y-3 px-2 md:px-4">
      <CharactersFiltersBar
        query={q}
        onQueryChange={setQ}
        elements={elements}
        elementFilter={element}
        onToggleElement={toggle(setElement)}
        classes={classes}
        classFilter={klass}
        onToggleClass={toggle(setKlass)}
        rarities={rarities}
        rarityFilter={rarity}
        onToggleRarity={toggle(setRarity)}
        labels={labels.bar}
        advancedCount={advancedCount}
        onOpenAdvanced={() => setDrawerOpen(true)}
        advancedOpen={drawerOpen}
      />

      <div className="flex gap-4">
        <CharactersFiltersSidebar
          advancedLabel={labels.sidebar.advanced}
          resetLabel={labels.sidebar.reset}
          onResetAll={resetAll}
          {...panelProps}
        />

        <div className="min-w-0 flex-1 space-y-3">
          <ActiveFiltersStrip
            items={chips}
            matchCount={filtered.length}
            labels={labels.strip}
            onResetAll={resetAll}
            onCopyShareUrl={copyShareUrl}
            copied={copied}
          />

          {filtered.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-12 text-center">
              <p className="text-content-muted text-sm">{labels.noMatch}</p>
              <button
                type="button"
                onClick={resetAll}
                className="border-line-subtle bg-surface-raised text-content-muted hover:border-line hover:text-content-strong rounded-md border px-3 py-1.5 text-xs transition"
              >
                {labels.reset}
              </button>
            </div>
          ) : (
            <div className="flex flex-wrap justify-center gap-4 lg:gap-6">
              {filtered.map((row, i) => (
                <ResponsiveCharacterCard
                  key={row.id}
                  starAriaLabel={labels.bar.starAria}
                  id={row.id}
                  name={row.name}
                  prefix={row.prefix}
                  element={row.element}
                  classType={row.class}
                  rarity={row.rarity}
                  tags={row.tags}
                  href={`/characters/${row.slug}`}
                  priority={i <= 5}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <CharactersFiltersDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onResetAll={resetAll}
        matchCount={filtered.length}
        totalCount={rows.length}
        drawerLabels={labels.drawer}
        {...panelProps}
      />
    </div>
  );
}
