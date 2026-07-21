/**
 * Blocs du guide « Premium & Limited » : cibles PvE/PvP, table d'impact par
 * étoile, sweetspots de transcendance. Les NOTES (cibles, impact) sont
 * éditoriales ; les sweetspots DÉRIVENT des paliers officiels du jeu
 * (char-progression) — la V2 rechargeait ces textes côté client par perso.
 */
import type { Character } from '@contracts';
import type { Lang } from '@/lib/i18n/config';
import { img } from '@/lib/images';
import { cn } from '@/lib/cn';
import { getTranscendSweetspots } from '@/lib/data/char-progression';
import { renderGameColors } from '@/components/ui/GameText';
import { StarIcon } from '@/components/guides/editorial/banner/StarText';

/** Rangée de n étoiles jaunes (notes d'impact, cibles). */
function StarRow({ count, size = 14 }: { count: number; size?: number }) {
  return (
    <span className="inline-flex items-center gap-0.5" role="img" aria-label={`${count} stars`}>
      {Array.from({ length: count }, (_, i) => (
        <StarIcon key={i} size={size} />
      ))}
    </span>
  );
}

/**
 * Valeur de cible éditoriale → étoiles (« 4 to 5 », « Any »,
 * « 5 (support) 6 (dps) ») — même découpage que la V2 : chaque nombre devient
 * une rangée d'étoiles, le texte restant est rendu tel quel.
 */
function TargetDisplay({ value }: { value: string }) {
  if (!value) return <span>—</span>;
  const parts = value.match(/\d+(?:\s*\([^)]*\))?|[^\d]+/g) ?? [];
  return (
    <div className="text-content space-y-1 text-center text-sm">
      {parts.map((part, i) => {
        const num = parseInt(part, 10);
        if (!Number.isNaN(num)) {
          const extra = part.replace(/^\d+\s*/, '');
          return (
            <div key={i}>
              <StarRow count={num} /> {extra}
            </div>
          );
        }
        return <div key={i}>{part.trim()}</div>;
      })}
    </div>
  );
}

/** Cibles recommandées PvE / PvP (deux colonnes, icônes de nav du jeu). */
export function RecoTargets({ pve, pvp }: { pve: string; pvp: string }) {
  const cols = [
    { title: 'PvE', icon: img.navIcon('pve'), ring: 'border-ed-sky-deep/40', value: pve },
    { title: 'PvP', icon: img.navIcon('pvp'), ring: 'border-ed-rose-deep/40', value: pvp },
  ];
  return (
    <div className="divide-line-subtle grid grid-cols-2 divide-x">
      {cols.map(({ title, icon, ring, value }) => (
        <div key={title} className="flex flex-col items-center gap-2 px-4 py-2">
          <span
            className={cn(
              'bg-surface-overlay/50 relative h-14 w-14 overflow-hidden rounded-lg border-2',
              ring,
            )}
          >
            <img src={icon} alt={title} className="h-full w-full object-contain p-2" />
          </span>
          <span className="text-content-strong text-sm font-semibold">{title}</span>
          <TargetDisplay value={value || '—'} />
        </div>
      ))}
    </div>
  );
}

export type ImpactMap = Record<'3' | '4' | '5' | '6', { pve: string; pvp: string }>;

/** Note (1-5, éditoriale) rendue en étoiles ; tout autre texte tel quel. */
function ImpactCell({ value }: { value: string }) {
  const num = parseInt(value, 10);
  if (!Number.isNaN(num) && String(num) === value.trim()) return <StarRow count={num} />;
  return <span>{value || '—'}</span>;
}

/** Impact de la transcendance : note PvE/PvP par étoile (3★→6★). */
export function ImpactTable({ impact, starLabel }: { impact: ImpactMap; starLabel: string }) {
  const rows = ['3', '4', '5', '6'] as const;
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-content-subtle text-left">
            <th className="py-1 pr-2 font-semibold">{starLabel}</th>
            <th className="py-1 pr-2 font-semibold">PvE</th>
            <th className="py-1 pr-2 font-semibold">PvP</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r} className="border-line-subtle border-t">
              <td className="py-1.5 pr-2">
                <StarRow count={Number(r)} />
              </td>
              <td className="py-1.5 pr-2">
                <ImpactCell value={impact[r]?.pve ?? '—'} />
              </td>
              <td className="py-1.5 pr-2">
                <ImpactCell value={impact[r]?.pvp ?? '—'} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/**
 * Sweetspots de transcendance (4★/5★/6★) : ce que chaque palier APPORTE —
 * lignes officielles des paliers (mêmes sources que le slider de la fiche
 * perso), dérivées au build.
 */
export function TranscendSweetspots({ character, lang }: { character: Character; lang: Lang }) {
  const spots = getTranscendSweetspots(character, lang, [4, 5, 6]);
  if (spots.length === 0) return null;
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {spots.map((s) => (
        <div key={s.star} className="border-line-subtle rounded-md border p-3">
          <div className="mb-2 flex items-center gap-0.5">
            {s.stars.map((sprite, i) => (
              <img key={i} src={img.transcendStar(sprite)} alt="" className="h-4.5 w-4.5" />
            ))}
          </div>
          <div className="text-content-muted space-y-1 text-xs leading-tight">
            {s.lines.map((line, i) => (
              <p key={i} className="whitespace-pre-line">
                {renderGameColors(line.replace(/\\n/g, '\n'))}
              </p>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
