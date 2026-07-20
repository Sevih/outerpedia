import { getCharacterListItems } from '@/lib/data/characters';
import { loadShortNames } from '@/lib/data/short-names';

export const dynamic = 'force-dynamic';

export default function ToolShortNamesIndex() {
  const items = getCharacterListItems();
  const shortNames = loadShortNames();
  const done = items.filter((c) => shortNames[c.id] && Object.keys(shortNames[c.id]).length).length;

  return (
    <div className="space-y-3">
      <h1 className="text-content-strong text-xl font-semibold">Tools · Short names</h1>
      <p className="text-content-muted text-sm">
        {done}/{items.length} persos ont un nom court. Choisis un perso à gauche pour éditer.
      </p>
      <p className="text-content-subtle text-sm">
        Nom d&apos;affichage abrégé et localisé (« D.Stella » pour « Demiurge Stella »), utilisé là
        où la place manque (références de perso des recos d&apos;équipement, tuiles du
        tier-list-maker). Ce n&apos;est PAS un alias de recherche (cf. Search aliases).
      </p>
    </div>
  );
}
