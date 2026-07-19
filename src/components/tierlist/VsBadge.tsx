/**
 * Médaillon « vs » posé dans la gouttière entre les cartes PvE et PvP. Pur
 * décor, aucun JS. Neutres → tokens ; halo en valeurs littérales.
 */
export function VsBadge() {
  return (
    <div
      aria-hidden
      className="border-line from-surface-raised to-surface-base relative flex size-14 shrink-0 items-center justify-center rounded-full border bg-radial shadow-[0_0_0_4px_#0a0a0a,0_0_0_5px_#27272a]"
    >
      <span className="bg-linear-to-br from-rose-400 to-indigo-400 bg-clip-text font-serif text-lg font-bold tracking-tighter text-transparent italic">
        vs
      </span>
    </div>
  );
}
