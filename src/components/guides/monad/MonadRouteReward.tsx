/**
 * En-tête des récompenses d'une route Monad Gate — présentation « bête » :
 * les lignes sont déjà RÉSOLUES et localisées par l'orchestrateur (serveur), ce
 * composant ne fait qu'afficher (utilisable dans le wrapper client sans importer
 * le catalogue d'items, 984 Ko).
 */
import { ItemInline } from '@/components/inline/ItemInline';

/** Une ligne de récompense prête à afficher. */
export interface RewardLine {
  name: string;
  iconSrc: string;
  /** Grade slug (cadre de rareté de la tuile). */
  grade: string;
  /** Quantité formatée (`3` ou `3-5`). */
  qty: string;
}

/** Récompenses d'une route : par clear (boss) + bonus de premier clear (True Ending). */
export interface RewardDisplay {
  clear: RewardLine[];
  firstClear: RewardLine[];
}

interface Props {
  reward: RewardDisplay;
  labels: { rewards: string; firstClear: string };
}

function Row({ lines }: { lines: RewardLine[] }) {
  return (
    <div className="flex flex-wrap items-center gap-4">
      {lines.map((r, i) => (
        <div key={i} className="flex items-center gap-2">
          <ItemInline item={{ name: r.name, iconSrc: r.iconSrc, grade: r.grade }} />
          <span className="text-content-muted">x{r.qty}</span>
        </div>
      ))}
    </div>
  );
}

export default function MonadRouteReward({ reward, labels }: Props) {
  if (reward.clear.length === 0 && reward.firstClear.length === 0) return null;
  return (
    <div className="mt-6 space-y-4">
      {reward.clear.length > 0 && (
        <div>
          <h2 className="mb-2 text-lg font-semibold">{labels.rewards}</h2>
          <Row lines={reward.clear} />
        </div>
      )}
      {reward.firstClear.length > 0 && (
        <div>
          <h3 className="text-monad-key-soft mb-2 text-sm font-semibold">{labels.firstClear}</h3>
          <Row lines={reward.firstClear} />
        </div>
      )}
    </div>
  );
}
