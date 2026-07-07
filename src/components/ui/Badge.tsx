import { cn } from '@/lib/cn';

type Tone = 'neutral' | 'accent' | 'success' | 'warn' | 'danger' | 'buff' | 'debuff';

const TONE: Record<Tone, string> = {
  neutral: 'bg-surface-overlay text-content border-line',
  accent: 'bg-accent text-accent-fg border-transparent',
  success: 'border-success/40 text-success',
  warn: 'border-warn/40 text-warn',
  danger: 'border-danger/40 text-danger',
  buff: 'border-buff/40 text-buff',
  debuff: 'border-debuff/40 text-debuff',
};

/** Étiquette compacte (statut, catégorie, rareté…). */
export function Badge({
  tone = 'neutral',
  className,
  children,
}: {
  tone?: Tone;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-xs font-medium',
        TONE[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
