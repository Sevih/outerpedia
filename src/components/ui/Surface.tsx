import { cn } from '@/lib/cn';

type Level = 'base' | 'raised' | 'overlay' | 'sunken';

const LEVEL: Record<Level, string> = {
  base: 'bg-surface-base',
  raised: 'bg-surface-raised',
  overlay: 'bg-surface-overlay',
  sunken: 'bg-surface-sunken',
};

/** Conteneur de surface théminé (le niveau pilote la profondeur visuelle). */
export function Surface({
  level = 'raised',
  className,
  children,
  ...rest
}: { level?: Level } & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn(LEVEL[level], 'text-content', className)} {...rest}>
      {children}
    </div>
  );
}
