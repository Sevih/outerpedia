import { cn } from '@/lib/cn';

/** Carte : surface élevée, bordure subtile, coins arrondis, ombre légère. */
export function Card({ className, children, ...rest }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'border-line-subtle bg-surface-raised text-content rounded-lg border shadow-sm',
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  );
}

/** En-tête de carte (titre fort + séparateur). */
export function CardHeader({ className, children, ...rest }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'border-line-subtle text-content-strong border-b px-4 py-3 font-semibold',
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  );
}

/** Corps de carte. */
export function CardBody({ className, children, ...rest }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('px-4 py-3', className)} {...rest}>
      {children}
    </div>
  );
}
