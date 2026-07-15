/**
 * LE PLAN DE JEU D'UNE ÉQUIPE — une SÉQUENCE ordonnée, une ligne par personnage,
 * triée par VITESSE décroissante = l'ordre de jeu.
 *
 * Fusionne ce qui était deux blocs (la file ATB de `TurnOrder` + le tableau de
 * builds) : le tri par SPD PORTAIT déjà l'ordre de jeu, la file ATB le répétait.
 * Ici l'ordre se lit d'un coup d'œil — un NUMÉRO d'ordre (1→n) sur le rail, le
 * filet qui sépare les lignes fait la « chaîne » — et la VITESSE est le pivot de
 * chaque ligne : l'icône de stat porte le sens « vitesse », la valeur reste en
 * gras neutre (aucun token dédié, `text-accent` est réservé aux noms/liens).
 *
 * Chaque valeur d'équipement/priorité est un token éditorial ({I-W/}, {AS/}, {S/}…)
 * résolu par `parseText` contre les données — un item inconnu JETTE (STRICT).
 *
 * Composant SERVEUR.
 */
import { Fragment } from 'react';
import type { LocalizedText } from '@contracts';
import type { TranslationKey } from '@/i18n';
import { parseText, type ParseCtx } from '@/lib/parse-text';
import { lRec } from '@/lib/i18n/localize';
import { resolveGuideCharacter } from '@/lib/data/characters';
import { STAT_ICON } from '@/lib/stats';
import { img } from '@/lib/images';
import { CharacterPortrait } from '@/components/character/CharacterPortrait';

type LText = LocalizedText & { en: string };

/** Un build de personnage dans une équipe. */
export interface RequirementEntry {
  character: string;
  /** Stats visées : clés `spd`/`eff`/`atk`/`def`/`hp`/`chc`/`chd`/`trans`. */
  stats?: Record<string, string>;
  /** Priorité de stats (chaîne de tokens `{S/…}` ou texte). */
  prio?: string[];
  /** Équipement conseillé (tokens {I-W/}, {I-A/}, {I-T/}, {AS/}, {EE/}…). */
  equipment?: {
    weapon?: string[];
    amulet?: string[];
    talisman?: string[];
    set?: string[];
    ee?: string[];
  };
  /** Notes localisées. */
  notes?: LText[];
}

export interface RequirementsData {
  entries: RequirementEntry[];
  /** Note de pied de tableau, localisée. */
  note?: LText;
}

/** Ordre + abréviation des stats ; `trans` n'a pas d'icône (libellé texte).
 *  `spd` en est SORTIE : la vitesse est le pivot de la ligne, pas une puce parmi
 *  d'autres. */
const STAT_ROWS: { key: string; abbr?: string; label?: TranslationKey }[] = [
  { key: 'eff', abbr: 'EFF' },
  { key: 'atk', abbr: 'ATK' },
  { key: 'def', abbr: 'DEF' },
  { key: 'hp', abbr: 'HP' },
  { key: 'chc', abbr: 'CHC' },
  { key: 'chd', abbr: 'CHD' },
  { key: 'trans', label: 'sys.stat.trans' },
];

const EQUIP_ROWS: {
  key: keyof NonNullable<RequirementEntry['equipment']>;
  label: TranslationKey;
}[] = [
  { key: 'weapon', label: 'equip.tab.weapons' },
  { key: 'amulet', label: 'equip.tab.accessories' },
  { key: 'talisman', label: 'equip.tab.talismans' },
  { key: 'set', label: 'equip.tab.sets' },
  { key: 'ee', label: 'equip.tab.ee' },
];

/** Vitesse numérique d'une entrée (pour le tri), sinon null. */
function spdOf(entry: RequirementEntry): number | null {
  const raw = entry.stats?.spd;
  const m = raw?.match(/-?\d+(?:\.\d+)?/);
  return m ? Number(m[0]) : null;
}

/** Une ligne du plan de jeu : rang, portrait, VITESSE (pivot), build. */
function EntryRow({ entry, step, ctx }: { entry: RequirementEntry; step: number; ctx: ParseCtx }) {
  const { lang, t } = ctx;
  const {
    character: c,
    name,
    href,
  } = resolveGuideCharacter(entry.character, lang, 'BuildRequirements');

  const spd = entry.stats?.spd;
  const stats = STAT_ROWS.filter((s) => entry.stats?.[s.key] !== undefined);
  const equip = EQUIP_ROWS.filter((e) => entry.equipment?.[e.key]?.length);

  return (
    <li className="flex items-start gap-3 p-3">
      {/* Rang dans l'ordre de jeu : le n° + le filet (divide-y) disent la séquence
          « qui joue avant qui » que la file ATB donnait d'un coup d'œil. */}
      <span className="bg-surface text-content-strong ring-line-subtle mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ring-1">
        {step}
      </span>

      {/* Portrait + nom (seul endroit avec le nom en accent/lien). */}
      <div className="flex w-14 shrink-0 flex-col items-center gap-1">
        <CharacterPortrait
          id={c.id}
          name={name}
          element={c.element}
          classType={c.class}
          rarity={c.rarity}
          size={52}
          href={href}
          showName={false}
        />
        <span className="text-accent w-full text-center text-xs leading-tight font-medium">
          {name}
        </span>
      </div>

      {/* VITESSE — pivot de la ligne. L'icône de stat porte le sens ; la valeur
          reste NEUTRE forte (pas de nouveau token, pas de text-accent). */}
      {spd !== undefined && (
        <div className="flex w-14 shrink-0 flex-col items-center justify-center gap-0.5 self-center">
          {STAT_ICON['SPD'] && (
            // eslint-disable-next-line @next/next/no-img-element -- icône de stat
            <img src={img.statIcon(STAT_ICON['SPD'])} alt="" className="h-5 w-5" />
          )}
          <span className="text-content-strong text-xl leading-none font-bold tabular-nums">
            {parseText(spd, ctx)}
          </span>
          <span className="text-content-muted text-[10px] font-semibold tracking-wide uppercase">
            SPD
          </span>
        </div>
      )}

      {/* Le build (stats hors SPD · priorité · équipement · notes). */}
      <div className="min-w-0 flex-1 space-y-1.5">
        {stats.length > 0 && (
          <div className="flex flex-wrap gap-x-3 gap-y-1">
            {stats.map((s) => (
              <span key={s.key} className="inline-flex items-center gap-1 text-sm">
                {s.abbr && STAT_ICON[s.abbr] ? (
                  // eslint-disable-next-line @next/next/no-img-element -- icône de stat
                  <img src={img.statIcon(STAT_ICON[s.abbr])} alt="" className="h-4 w-4" />
                ) : (
                  <span className="text-accent text-xs font-semibold tracking-wide uppercase">
                    {s.label ? t(s.label) : s.key}
                  </span>
                )}
                <span className="text-content-strong">{parseText(entry.stats![s.key], ctx)}</span>
              </span>
            ))}
          </div>
        )}

        {entry.prio?.length ? (
          <div className="text-content inline-flex flex-wrap items-center gap-1 text-sm">
            <span className="text-accent text-xs font-semibold tracking-wide uppercase">
              {t('requirements.prio')}
            </span>
            {entry.prio.map((p, i) => (
              <Fragment key={i}>
                {i > 0 && <span className="text-content-muted">›</span>}
                {parseText(p, ctx)}
              </Fragment>
            ))}
          </div>
        ) : null}

        {equip.length > 0 && (
          <div className="space-y-0.5">
            {equip.map((e) => (
              <div key={e.key} className="flex gap-1.5 text-sm">
                <span className="text-accent shrink-0 text-xs font-semibold tracking-wide uppercase">
                  {t(e.label)}
                </span>
                <span className="text-content-strong">
                  {entry.equipment![e.key]!.map((v, i) => (
                    <Fragment key={i}>
                      {i > 0 && ', '}
                      {parseText(v, ctx)}
                    </Fragment>
                  ))}
                </span>
              </div>
            ))}
          </div>
        )}

        {entry.notes?.length ? (
          <ul className="text-content space-y-0.5 text-sm">
            {entry.notes.map((n, i) => (
              <li key={i} className="flex gap-1.5">
                <span className="text-content-muted shrink-0">–</span>
                <span>{parseText(lRec(n, lang), ctx)}</span>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </li>
  );
}

export function BuildRequirements({ data, ctx }: { data: RequirementsData; ctx: ParseCtx }) {
  const { lang, t } = ctx;
  if (!data.entries.length) return null;

  // Tri par vitesse décroissante = l'ordre de jeu, quand les vitesses existent.
  const entries = [...data.entries].sort((a, b) => {
    const sa = spdOf(a);
    const sb = spdOf(b);
    if (sa === null || sb === null) return 0;
    return sb - sa;
  });

  return (
    <div className="border-line-subtle overflow-hidden rounded-lg border">
      <div className="border-line-subtle bg-surface-raised border-b px-4 py-2 text-center">
        <span className="text-content-strong text-sm font-semibold tracking-wide uppercase">
          {t('requirements.title')}
        </span>
      </div>
      {/* <ol> : l'ordre du DOM EST l'ordre de jeu ; le filet fait la séquence. */}
      <ol className="divide-line-subtle divide-y">
        {entries.map((entry, i) => (
          <EntryRow key={entry.character} entry={entry} step={i + 1} ctx={ctx} />
        ))}
      </ol>
      {data.note && (
        <div className="border-line-subtle bg-surface-raised border-t px-4 py-2 text-center">
          <p className="text-content-muted text-sm">{parseText(lRec(data.note, lang), ctx)}</p>
        </div>
      )}
    </div>
  );
}
