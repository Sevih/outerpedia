'use client';

import { useEffect, useState, type ReactNode } from 'react';

export interface GuideVersionEntry {
  /** Clé stable (dossier `versions/YYYY-MM`) — sert d'ancre `#version=`. */
  key: string;
  label: string;
  content: ReactNode;
  /** Bandeau « ancienne version » (déjà localisé) — absent sur la plus récente. */
  warning?: string;
}

/**
 * Sélecteur de versions d'un guide : un MENU DÉROULANT compact (un guide
 * récurrent accumule des versions — une rangée d'onglets ne tient pas la
 * distance). Les contenus sont RENDUS CÔTÉ SERVEUR (passés en ReactNode) ; le
 * client ne fait que basculer l'affichage. La version active se synchronise
 * avec `#version=<clé>` (liens partageables) ; le défaut est la première
 * entrée (la plus récente).
 */
export function GuideVersions({
  versions,
  label,
  shared,
}: {
  versions: GuideVersionEntry[];
  /** Libellé du sélecteur, déjà localisé (« Versions du guide »). */
  label: string;
  /**
   * Ce qui NE DÉPEND PAS de la version — le panneau du boss d'un guide récurrent :
   * les saisons rejouent le même combat, seule la tactique date. Rendu une fois,
   * sous le sélecteur (qui reste le premier contrôle de la page) et au-dessus du
   * contenu de la saison choisie. Le mettre DANS chaque version le rendait autant
   * de fois qu'il y a de saisons, pour un résultat identique.
   */
  shared?: ReactNode;
}) {
  const [active, setActive] = useState(versions[0]?.key);

  useEffect(() => {
    // Restauration au montage uniquement : le HTML statique ne connaît pas le
    // hash — la resynchronisation post-hydratation est le comportement voulu.
    const m = window.location.hash.match(/^#version=(.+)$/);
    const key = m ? decodeURIComponent(m[1]) : null;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (key && versions.some((v) => v.key === key)) setActive(key);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const select = (key: string) => {
    setActive(key);
    window.history.replaceState(null, '', `#version=${encodeURIComponent(key)}`);
  };

  const current = versions.find((v) => v.key === active) ?? versions[0];
  if (!current) return null;

  return (
    <div className="space-y-6">
      {versions.length > 1 && (
        <label className="flex items-center gap-2 text-sm">
          <span className="text-content-muted">{label}</span>
          <select
            value={current.key}
            onChange={(e) => select(e.target.value)}
            className="border-line-subtle bg-surface-raised text-content-strong hover:border-line focus:border-accent rounded-md border px-3 py-1.5 font-medium outline-none"
          >
            {versions.map((v) => (
              <option key={v.key} value={v.key}>
                {v.label}
              </option>
            ))}
          </select>
        </label>
      )}
      {current.warning && <div className="panel-warning px-4 py-3 text-sm">{current.warning}</div>}
      {shared}
      <div key={current.key} className="space-y-6">
        {current.content}
      </div>
    </div>
  );
}
