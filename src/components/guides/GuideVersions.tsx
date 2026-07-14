'use client';

import { type ReactNode } from 'react';
import { useUrlSlice, writeUrl } from '@/hooks/useUrlSlice';

export interface GuideVersionEntry {
  /** Clé stable (dossier `versions/YYYY-MM`) — sert d'ancre `#version=`. */
  key: string;
  label: string;
  content: ReactNode;
  /** Bandeau « ancienne version » (déjà localisé) — absent sur la plus récente. */
  warning?: string;
}

// Le hash est la SOURCE DE VÉRITÉ de la version affichée (cf. useUrlSlice) :
// lien partageable, Back/Forward et édition manuelle du hash pilotent l'UI.
const readVersionHash = () => {
  const m = window.location.hash.match(/^#version=(.+)$/);
  return m ? decodeURIComponent(m[1]) : null;
};

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
  const hashKey = useUrlSlice('hashchange', readVersionHash);
  const active = hashKey && versions.some((v) => v.key === hashKey) ? hashKey : versions[0]?.key;

  const select = (key: string) => {
    // replaceState ne déclenche pas `hashchange` — writeUrl notifie le store.
    writeUrl(() => window.history.replaceState(null, '', `#version=${encodeURIComponent(key)}`));
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
