import { listGameTables } from '@/lib/admin/gamedata-store';

export const dynamic = 'force-dynamic';

export default function ToolGameData() {
  const tables = listGameTables();
  const bytes = tables.reduce((sum, t) => sum + t.bytes, 0);
  const last = Math.max(0, ...tables.map((t) => t.mtimeMs));

  return (
    <div className="max-w-2xl space-y-4">
      <div>
        <h1 className="text-content-strong text-xl font-semibold">Tools · Données du jeu</h1>
        <p className="text-content-muted text-sm">
          Lecteur des tables BRUTES extraites du jeu (<code>.gamedata/parsed</code>) — telles que le
          parser les produit, sans interprétation. C&apos;est l&apos;outil d&apos;exploration
          d&apos;avant-générateur : on y cherche une colonne, on suit un id, on lit la clé de texte
          qui va avec.
        </p>
      </div>

      {tables.length === 0 ? (
        <p className="text-warn text-sm">
          Aucune table parsée. Lancer l&apos;extraction (<code>pnpm datagen:convert</code>) pour
          alimenter <code>.gamedata/parsed</code>.
        </p>
      ) : (
        <>
          <ul className="text-content-subtle space-y-1 text-sm">
            <li>
              <span className="text-content-strong">{tables.length}</span> tables ·{' '}
              <span className="text-content-strong">{(bytes / 1_000_000).toFixed(0)} Mo</span> ·
              dernière extraction le{' '}
              <span className="text-content-strong">
                {new Date(last).toLocaleString('fr-FR', { dateStyle: 'medium' })}
              </span>
            </li>
          </ul>
          <div className="text-content-muted space-y-1 text-sm">
            <p>Choisir une table à gauche. Sur une table :</p>
            <ul className="list-disc space-y-1 pl-5">
              <li>
                la recherche et la pagination se font au serveur (jusqu&apos;à 18 Mo par table) ;
              </li>
              <li>
                les colonnes jamais renseignées sont masquées par défaut — les colonnes hors en-tête
                (<code>_unknown_*</code>) sont, elles, toujours montrées ;
              </li>
              <li>
                une cellule qui est une clé de texte affiche l&apos;anglais dessous ; une colonne{' '}
                <code>*ID</code> dont la table existe (<span className="text-accent">↗</span>)
                devient un lien vers la ligne visée ;
              </li>
              <li>cliquer une ligne montre son JSON brut.</li>
            </ul>
          </div>
        </>
      )}
    </div>
  );
}
