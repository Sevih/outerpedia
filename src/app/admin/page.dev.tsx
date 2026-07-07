import Link from 'next/link';
import type { Route } from 'next';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { AcceptTargetButton } from '@/components/admin/AcceptTargetButton';
import { reviewAll, reviewTotals, type TargetReview } from '@/lib/admin/review-store';
import { characterDisplayName, getCharacterListItems } from '@/lib/data/characters';
import { loadCuratedCharacters } from '@/lib/data/curated';
import { getMergedEffects, v2MissingInV3 } from '@/lib/data/effects';

// Accueil = tableau de bord de revue (extraction fraîche), jamais prérendu.
export const dynamic = 'force-dynamic';

/** Nom affichable d'une entité, par cible (id → libellé). */
function namesFor(targetId: string): Record<string, string> {
  if (targetId === 'character') {
    return Object.fromEntries(getCharacterListItems().map((c) => [c.id, characterDisplayName(c)]));
  }
  return {};
}

/** Lien vers la fiche d'intervention d'une entité (là où on corrige). */
function entityHref(targetId: string, key: string): Route | null {
  if (targetId === 'character') return `/admin/characters/${key}` as Route;
  return null;
}

function EntityList({
  title,
  cls,
  keys,
  names,
  href,
}: {
  title: string;
  cls: string;
  keys: string[];
  names: Record<string, string>;
  href: (key: string) => Route | null;
}) {
  if (!keys.length) return null;
  return (
    <div className="space-y-1">
      <p className={`text-xs font-semibold uppercase ${cls}`}>
        {title} ({keys.length})
      </p>
      <ul className="text-content-muted space-y-0.5 text-sm">
        {keys.map((k) => {
          const h = href(k);
          const label = names[k] ?? k;
          return (
            <li key={k}>
              {h ? (
                <Link href={h} className="hover:text-accent">
                  {label}
                </Link>
              ) : (
                label
              )}{' '}
              <span className="text-content-subtle text-xs">({k})</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function TargetBlock({ r }: { r: TargetReview }) {
  const total = reviewTotals(r.diff);
  const names = namesFor(r.id);
  const changedKeys = r.diff.changed.map((c) => c.key);
  const href = (k: string) => entityHref(r.id, k);

  return (
    <div className="border-line-subtle space-y-3 rounded-lg border p-4">
      <div className="flex flex-wrap items-center gap-3">
        <span className="text-content-strong font-medium">{r.label}</span>
        <code className="text-content-subtle text-xs">{r.file}</code>
        <span className="ml-auto flex items-center gap-3 text-xs">
          {total === 0 ? (
            <span className="text-success">à jour</span>
          ) : (
            <>
              <span className="text-content-subtle">{total} écart(s)</span>
              <AcceptTargetButton id={r.id} file={r.file} />
            </>
          )}
        </span>
      </div>

      {total > 0 && (
        <div className="grid gap-4 sm:grid-cols-3">
          <EntityList
            title="modifiés"
            cls="text-warn"
            keys={changedKeys}
            names={names}
            href={href}
          />
          <EntityList
            title="nouveaux"
            cls="text-success"
            keys={r.diff.added}
            names={names}
            href={() => null}
          />
          <EntityList
            title="retirés"
            cls="text-danger"
            keys={r.diff.removed}
            names={names}
            href={() => null}
          />
        </div>
      )}
    </div>
  );
}

/** Rapport de collecte d'assets (écrit par `pnpm assets:collect`), si présent. */
function readAssetsReport(): { total: number; missingCount: number; generatedAt: string } | null {
  try {
    return JSON.parse(
      readFileSync(resolve(process.cwd(), '.assets-staging/manifest-report.json'), 'utf8'),
    ) as { total: number; missingCount: number; generatedAt: string };
  } catch {
    return null;
  }
}

export default function AdminHome() {
  const reviews = reviewAll();
  const curatedChars = loadCuratedCharacters();
  const chars = getCharacterListItems();
  const noVideo = chars.filter((c) => !curatedChars[c.id]?.videos?.length).length;
  const effects = getMergedEffects();
  const v2Missing = v2MissingInV3().length;
  const assets = readAssetsReport();

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-content-strong text-xl font-semibold">Administration</h1>
        <p className="text-content-muted text-sm">Outil local (dev-only), committé via git.</p>
      </div>

      <section className="space-y-2">
        <div className="flex items-baseline justify-between">
          <h2 className="text-content-strong text-sm font-semibold uppercase">
            Revue — donnée de jeu
          </h2>
          <span className="text-content-subtle text-xs">
            committé vs extraction fraîche · clic = fiche d&apos;intervention
          </span>
        </div>
        {reviews.map((r) => (
          <TargetBlock key={r.id} r={r} />
        ))}
      </section>

      <section className="space-y-2">
        <h2 className="text-content-strong text-sm font-semibold uppercase">
          Curation — connaissance humaine
        </h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <Link
            href={'/admin/characters' as Route}
            className="border-line bg-surface-raised hover:border-accent block rounded-lg border p-4 transition"
          >
            <div className="text-content-strong font-medium">Personnages</div>
            <div className="text-content-subtle text-sm">
              Tiers, rôle, tags, priorité de skills, vidéos…
              {noVideo > 0 && <span className="text-warn"> · {noVideo} sans vidéo</span>}
            </div>
          </Link>
          <Link
            href={'/admin/effects' as Route}
            className="border-line bg-surface-raised hover:border-accent block rounded-lg border p-4 transition"
          >
            <div className="text-content-strong font-medium">Effets</div>
            <div className="text-content-subtle text-sm">
              {effects.length} extraits
              {v2Missing > 0 ? (
                <span className="text-danger"> · {v2Missing} régression(s) vs V2</span>
              ) : (
                <span className="text-success"> · couverture V2 ✓</span>
              )}
            </div>
          </Link>
        </div>
      </section>

      <section className="space-y-2">
        <h2 className="text-content-strong text-sm font-semibold uppercase">Assets (R2)</h2>
        <div className="border-line-subtle bg-surface-raised rounded-lg border p-4 text-sm">
          {assets ? (
            <p className="text-content-muted">
              {assets.total} requis par la donnée ·{' '}
              {assets.missingCount > 0 ? (
                <span className="text-warn">{assets.missingCount} manquant(s) au pool</span>
              ) : (
                <span className="text-success">tout est collecté</span>
              )}{' '}
              <span className="text-content-subtle">
                (collecte du {new Date(assets.generatedAt).toLocaleDateString('fr-FR')})
              </span>
            </p>
          ) : (
            <p className="text-content-subtle">
              Aucun rapport — lance <code>pnpm assets:collect</code> puis{' '}
              <code>pnpm assets:push</code>.
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
