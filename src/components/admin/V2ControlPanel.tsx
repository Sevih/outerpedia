import type { V2Control } from '@/lib/admin/review-store';

const fmt = (v: unknown) => (v === undefined ? '—' : typeof v === 'string' ? v : JSON.stringify(v));

const GAP_LABELS: Record<string, string> = {
  curated: 'curé (vérifier data/curated)',
  todo: 'À INTÉGRER',
  unknown: 'INCONNU (à classer dans la coverage spec)',
};

/**
 * Contrôle vs V2 : valeurs comparées champ à champ + « ce qu'il reste » (champs
 * du fichier V2 hors extraction). C'est LE panneau qui dit si on peut intégrer
 * sereinement et ce qui manque encore.
 */
export function V2ControlPanel({ control }: { control: V2Control }) {
  if (!control.found) {
    return (
      <p className="text-content-subtle border-line-subtle rounded-lg border border-dashed p-3 text-sm">
        Pas de fichier V2 pour ce perso (postérieur à V2) — rien à contrôler.
      </p>
    );
  }

  const ko = control.checks.filter((c) => !c.ok && !c.expected);
  const info = control.checks.filter((c) => !c.ok && c.expected);
  const okCount = control.checks.filter((c) => c.ok).length;
  const todo = control.gaps.filter((g) => g.status !== 'curated');

  return (
    <section className="border-line-subtle space-y-3 rounded-lg border p-3">
      <p className="text-content-strong text-xs font-semibold uppercase">
        Contrôle vs V2 —{' '}
        <span className={ko.length ? 'text-danger' : 'text-success'}>
          {okCount}/{control.checks.length} valeurs OK
        </span>
      </p>

      {ko.length > 0 && (
        <table className="w-full text-xs">
          <thead className="text-content-subtle text-left uppercase">
            <tr>
              <th className="py-1 pr-3 font-medium">Champ</th>
              <th className="py-1 pr-3 font-medium">V3</th>
              <th className="py-1 font-medium">V2</th>
            </tr>
          </thead>
          <tbody>
            {ko.map((c) => (
              <tr key={c.field} className="border-line-subtle border-t align-top">
                <td className="text-danger py-1 pr-3 font-mono">{c.field}</td>
                <td className="bg-success/5 py-1 pr-3">{fmt(c.v3)}</td>
                <td className="bg-danger/5 py-1">{fmt(c.v2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {info.length > 0 && (
        <p className="text-content-subtle text-xs">
          ℹ écarts attendus : {info.map((c) => c.field).join(', ')}
        </p>
      )}

      {control.skillEffects.length > 0 && (
        <div className="space-y-1">
          <p className="text-warn text-xs font-semibold uppercase">
            Effets de skills ≠ V2 ({control.skillEffects.length} skill(s))
          </p>
          <table className="w-full text-xs">
            <thead className="text-content-subtle text-left uppercase">
              <tr>
                <th className="py-1 pr-3 font-medium">Skill</th>
                <th className="py-1 pr-3 font-medium">V2 seul (miss possible)</th>
                <th className="py-1 font-medium">V3 seul (en plus)</th>
              </tr>
            </thead>
            <tbody>
              {control.skillEffects.map((s) => (
                <tr key={s.skill} className="border-line-subtle border-t align-top">
                  <td className="py-1 pr-3 font-mono">{s.skill}</td>
                  <td className="text-danger py-1 pr-3 font-mono">{s.missing.join(', ') || '—'}</td>
                  <td className="text-content-muted py-1 font-mono">{s.extra.join(', ') || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {todo.length > 0 ? (
        <div className="space-y-1">
          <p className="text-warn text-xs font-semibold uppercase">
            Reste à intégrer depuis V2 ({todo.length})
          </p>
          <ul className="text-content-muted text-xs">
            {todo.map((g) => (
              <li key={g.field}>
                <span className="font-mono">{g.field}</span>{' '}
                <span className="text-content-subtle">— {GAP_LABELS[g.status] ?? g.status}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <p className="text-success text-xs">✓ Tous les champs V2 sont couverts (extraits/curés).</p>
      )}
      {control.gaps.some((g) => g.status === 'curated') && (
        <p className="text-content-subtle text-xs">
          Champs curés côté V2 :{' '}
          {control.gaps
            .filter((g) => g.status === 'curated')
            .map((g) => g.field)
            .join(', ')}
        </p>
      )}
    </section>
  );
}
