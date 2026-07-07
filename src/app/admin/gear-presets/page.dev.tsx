import { GearPresetsEditor } from '@/components/admin/GearPresetsEditor';
import { gearSelectOptions } from '@/lib/admin/gear-options';
import { loadGearPresets, loadGearReco } from '@/lib/data/gear-reco';

export const dynamic = 'force-dynamic';

/** Presets partagés de gear reco : listes de talismans, combos de sets, substats. */
export default function AdminGearPresets() {
  const presets = loadGearPresets();
  const options = gearSelectOptions();

  // Usage : combien de builds référencent chaque preset (affiché, et garde-fou
  // serveur à la suppression).
  const usage: Record<string, number> = {};
  const bump = (k: string) => {
    usage[k] = (usage[k] ?? 0) + 1;
  };
  for (const builds of Object.values(loadGearReco()))
    for (const b of builds) {
      for (const tl of b.talismans ?? []) if (tl.startsWith('$')) bump(`talismans:${tl.slice(1)}`);
      for (const c of b.sets ?? []) if (c.preset) bump(`sets:${c.preset}`);
      if (b.substats?.startsWith('$')) bump(`substats:${b.substats.slice(1)}`);
    }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-content-strong text-xl font-semibold">Presets de gear reco</h1>
        <p className="text-content-muted text-sm">
          Référencés par <span className="font-mono">$slug</span> dans les builds des personnages.
          Un preset encore référencé ne peut pas être supprimé.
        </p>
      </div>
      <GearPresetsEditor
        initial={presets}
        talismanOptions={options.talismans}
        setOptions={options.sets}
        usage={usage}
      />
    </div>
  );
}
