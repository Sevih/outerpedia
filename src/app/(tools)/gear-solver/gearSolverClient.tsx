'use client';

import { useEffect, useState } from 'react';
import gearUsage from '@/data/stats/gear-usage.json';
import rawSubstatsMap from '@/data/substats-map.json';
import { normalizeClass } from '@/utils/gear';
import type { BuildData, GearItem } from '@/types/gear-solver';
const substatsMap = rawSubstatsMap as Record<string, Record<string, BuildData>>;
import Image from 'next/image'

import { toKebabCase } from '@/utils/formatText';
import GearSearchResult from '@/app/components/GearSearchResult';
import { ResultEntry } from '@/types/gear-solver';



type GearType = 'weapon' | 'amulet' | 'set';

export default function GearSolverClient() {
  const [gearType, setGearType] = useState<GearType>('weapon');
  const [gearName, setGearName] = useState('');
  const [charClass, setCharClass] = useState<string | null>(null);
  const [availableItems, setAvailableItems] = useState<string[]>([]);
  const [mainStats, setMainStats] = useState<string[]>([]);
  const [selectedMainStat, setSelectedMainStat] = useState<string | null>(null);
  const [substats, setSubstats] = useState<string[]>([]);
  const [searchResults, setSearchResults] = useState<ResultEntry[]>([]);
  const [statsLabels, setStatsLabels] = useState<Record<string, { label: string; icon: string }>>({});
  const [minSubstatMatch, setMinSubstatMatch] = useState(1);

  useEffect(() => {
    import('@/data/stats.json').then((m) => setStatsLabels(m.default));
  }, []);

  useEffect(() => {
    const loadData = async () => {
      let items: string[] = [];

      if (gearType === 'weapon') {
        const data: GearItem[] = await import('@/data/weapon.json').then((m) => m.default);
        items = data
          .filter((item) => !charClass || normalizeClass(item.class).includes(charClass))
          .map((item) => item.name);

        setMainStats(['ATK%', 'DEF%', 'HP%']);
      } else if (gearType === 'amulet') {
        const data: GearItem[] = await import('@/data/amulet.json').then((m) => m.default);
        items = data
          .filter((item) => !charClass || normalizeClass(item.class).includes(charClass))
          .map((item) => item.name);

        setMainStats([]);
      } else if (gearType === 'set') {
        const data: GearItem[] = await import('@/data/sets.json').then((m) => m.default);
        items = data.map((item) => item.name);

        setMainStats([]);
      }

      setAvailableItems(items);
      setGearName('');
      setSelectedMainStat(null);
    };

    loadData();
  }, [gearType, charClass]);

  useEffect(() => {
    if (gearType !== 'amulet' || !gearName) return;
    import('@/data/amulet.json').then((m) => {
      const data: GearItem[] = m.default;
      const found = data.find((item) => item.name === gearName);
      if (found) {
        setMainStats(found.mainStats || []);
        setSelectedMainStat(null);
      }
    });
  }, [gearName, gearType]);

  useEffect(() => {
    if (selectedMainStat && substats.includes(selectedMainStat)) {
      setSubstats((prev) => prev.filter((s) => s !== selectedMainStat));
    }
  }, [selectedMainStat, substats]);


  const normalize = (s: string) => s.toUpperCase().replace(/%/g, '').trim();

  const handleSearch = () => {
    setEnrichedResults([]);
    if (!gearName) {
      alert('Please select a gear name');
      return;
    }

    if (substats.length === 0) {
      alert('Please select at least one substat');
      return;
    }

    const gearEntry = gearUsage.find(entry => entry.name === gearName);
    if (!gearEntry) {
      setSearchResults([]);
      return;
    }

    const results: ResultEntry[] = [];
    const normUserSub = new Set(substats.map(normalize));


    for (const char of gearEntry.characters) {
      const key = toKebabCase(char);
      const buildsObj = substatsMap[key];
      if (!buildsObj) continue;

      for (const [buildName, buildData] of Object.entries(buildsObj as Record<string, BuildData>)) {
        const matchItem = () => {

          if (gearType === 'weapon') {
            return buildData.weaponSub?.some(w =>

              w.name === gearName && (selectedMainStat === null || w.mainStat.includes(selectedMainStat))
            );
          }
          if (gearType === 'amulet') {
            return buildData.amuletSub?.some(a =>
              a.name === gearName && (selectedMainStat === null || a.mainStat.includes(selectedMainStat))
            );
          }
          if (gearType === 'set') {
            return buildData.armorSets?.includes(gearName);
          }
          return false;
        };

        if (!matchItem()) continue;

        const normBuildSub = new Set(buildData.sub.map(normalize));
        const matchedSubstats = [...normUserSub].filter(stat => normBuildSub.has(stat));

        const adjustedMin = Math.min(minSubstatMatch, normUserSub.size, normBuildSub.size);
        if (matchedSubstats.length < adjustedMin) continue;

        const existing = results.find(r => r.character === char);
        if (existing) {
          existing.builds.push(buildName);
        } else {
          results.push({
            character: char,
            builds: [buildName],
            data: null
          });
        }
      }
    }

    setSearchResults(results);
  };

  const [enrichedResults, setEnrichedResults] = useState<ResultEntry[]>([]);

  // enrich les résultats dès qu'ils changent
  useEffect(() => {
    const enrichData = async () => {
      const enriched = await Promise.all(
        searchResults.map(async (r) => {
          const slug = toKebabCase(r.character);
          try {
            const data = await import(`@/data/char/${slug}.json`).then((m) => m.default);
            return { ...r, data };
          } catch {
            return { ...r, data: null };
          }
        })
      );
      setEnrichedResults(enriched);
    };

    if (searchResults.length > 0) enrichData();
  }, [searchResults]);




  const handleSubstatToggle = (key: string) => {
    setSubstats((prev) => {
      if (prev.includes(key)) {
        return prev.filter((s) => s !== key);
      } else if (prev.length < 4) {
        return [...prev, key];
      } else {
        return prev;
      }
    });
  };

  useEffect(() => {
    if (!mainStats.includes(selectedMainStat ?? '')) {
      setSelectedMainStat(null);
    }
  }, [selectedMainStat,mainStats]);


  return (
    
    <div className="max-w-3xl mx-auto p-6 rounded-xl shadow-lg space-y-6 mt-8">      
      {/* Gear Type + Class */}
      <div className="flex flex-col md:flex-row gap-6 items-start">
        <div>
          <label className="block text-sm font-medium text-white mb-1">Gear Type</label>
          <select
            value={gearType}
            onChange={(e) => {
              setGearType(e.target.value as GearType);
              setCharClass(null);
            }}
            className="w-[160px] h-7 px-2 py-1 rounded border text-sm bg-gray-700 text-white hover:bg-cyan-600 transition"
          >
            <option value="weapon">Weapon</option>
            <option value="amulet">Amulet</option>
            <option value="set">Armor Set</option>
          </select>
        </div>

        {gearType !== 'set' && (
          <div>
            <label className="block text-sm font-medium text-white mb-1">Character Class</label>
            <div className="flex flex-wrap gap-2">
              {['Striker', 'Defender', 'Ranger', 'Healer', 'Mage'].map((cl) => (
                <button
                  key={cl}
                  onClick={() => setCharClass(cl)}
                  className={`flex items-center justify-center w-7 h-7 rounded border transition ${charClass === cl ? 'bg-cyan-500' : 'bg-gray-700'
                    } hover:bg-cyan-600`}
                  title={cl}
                >
                  <Image
                    src={`/images/ui/class/${cl.toLowerCase()}.webp`}
                    alt={cl}
                    width={20}
                    height={20}
                    className="w-[20px] h-[20px] object-contain"
                  />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Gear Name */}
      <div>
        <label className="block text-sm font-medium text-white mb-1">Gear Name</label>
        <input
          type="text"
          list="gear-names"
          value={gearName}
          onChange={(e) => setGearName(e.target.value)}
          className="w-full max-w-md h-7 px-2 py-1 rounded border text-sm bg-gray-700 text-white hover:bg-cyan-600 transition"
        />
        <datalist id="gear-names">
          {availableItems.map(item => (
            <option key={item} value={item} />
          ))}
        </datalist>
      </div>

      {/* Main Stat */}
      {mainStats.length > 0 && (
        <div className="w-full max-w-xs">
          <label className="block text-sm font-medium text-white mb-1">Main Stat</label>
          <div className="flex items-center gap-2">
            {selectedMainStat && statsLabels[selectedMainStat]?.icon && (

              <Image
                src={`/images/ui/effect/${statsLabels[selectedMainStat].icon}`}
                alt={selectedMainStat}
                width={24}
                height={24}
                className="object-contain"
              />

            )}
            <select
              value={selectedMainStat ?? ''}
              onChange={(e) => {
                const value = e.target.value;
                setSelectedMainStat(value === '' ? null : value);
              }}

              className="w-full h-7 px-2 py-1 rounded border text-sm bg-gray-700 text-white hover:bg-cyan-600 transition"
            >
              <option value="">Select main stat</option>
              {mainStats.map(stat => (
                <option key={stat} value={stat}>
                  {statsLabels[stat]?.label ?? stat}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Min substat match */}
      <div>
        <label className="block text-sm font-medium text-white mb-1">Minimum substats to match</label>
        <select
          value={minSubstatMatch}
          onChange={(e) => setMinSubstatMatch(parseInt(e.target.value))}
          className="h-7 px-2 py-1 rounded border text-sm bg-gray-700 text-white hover:bg-cyan-600 transition"
        >
          {[1, 2, 3, 4].map(n => (
            <option key={n} value={n}>{n}</option>
          ))}
        </select>
      </div>

      {/* Substats */}
      <div>
        <label className="block text-sm font-medium text-white mb-1">Substats</label>
        <div className="flex flex-wrap gap-3">
          {Object.entries(statsLabels)
            .sort(([, a], [, b]) => a.label.localeCompare(b.label))
            .map(([key, value]) => {
              const isDisabled =
                key === selectedMainStat || (substats.length >= 4 && !substats.includes(key));

              return (
                <label
                  key={key}
                  className={`flex items-center gap-2 px-2 py-1 rounded cursor-pointer text-sm transition
          ${substats.includes(key)
                      ? 'bg-cyan-600 ring-2 ring-cyan-300 text-white font-semibold'
                      : 'bg-gray-700 text-white hover:bg-cyan-600'}
          ${isDisabled ? 'opacity-40 pointer-events-none' : ''}`}
                >
                  <input
                    type="checkbox"
                    value={key}
                    checked={substats.includes(key)}
                    disabled={isDisabled}
                    onChange={() => handleSubstatToggle(key)}
                    className="disabled:opacity-20"
                  />
                  <Image
                    src={`/images/ui/effect/${value.icon}`}
                    alt={key}
                    width={16}
                    height={16}
                    className="object-contain"
                  />
                  <span>{value.label}</span>
                </label>
              );
            })}

        </div>
      </div>

      {/* Buttons */}
      <div className="flex gap-4 pt-2">
        <button
          onClick={handleSearch}
          className="h-7 px-3 py-1 bg-gray-700 hover:bg-cyan-700 text-white rounded text-sm transition"
        >
          Search
        </button>
        <button
          onClick={() => {
            setCharClass(null);
            setGearName('');
            setMainStats([]);
            setSelectedMainStat(null);
            setSubstats([]);
            setSearchResults([]);
          }}
          className="h-7 px-3 py-1 bg-gray-600 hover:bg-red-700 text-white rounded text-sm transition"
        >
          Reset
        </button>
      </div>

      {/* Results */}
      <GearSearchResult results={enrichedResults} gearName={gearName} />

    </div>
  );
}
