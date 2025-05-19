'use client';

import Image from 'next/image';
import { toKebabCase } from '@/utils/formatText';
import { ResultEntry } from '@/types/gear-solver';
import { CharacterNameDisplay } from '@/app/components/CharacterNameDisplay';

export default function GearSearchResult({
  results,
  gearName,
}: {
  results: ResultEntry[];
  gearName: string;
}) {
  if (results.length === 0 && gearName) {
    return (
      <p className="text-sm text-red-400 italic mt-4">
        ❌ No build matches found for <span className="font-semibold">{gearName}</span>.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-4">
      {results.map((res, idx) => (
        <div
          key={idx}
          className="border border-gray-700 rounded-lg p-4 bg-gray-800 text-white shadow"
        >
          {res.data ? (
            <div className="flex items-center gap-3 mb-3">
              <div className="relative w-16 h-16 shrink-0">
                <Image
                  src={`/images/characters/atb/IG_Turn_${res.data.ID}.webp`}
                  alt={res.character}
                  width={64}
                  height={64}
                  className="rounded object-cover w-full h-full"
                />
                <Image
                  src={`/images/ui/effect/${res.data.Element.toLowerCase()}.webp`}
                  alt={res.data.Element}
                  width={24}
                  height={24}
                  className="absolute top-0 right-0 w-6 h-6"
                />
                <Image
                  src={`/images/ui/class/${res.data.Class.toLowerCase()}.webp`}
                  alt={res.data.Class}
                  width={24}
                  height={24}
                  className="absolute top-0 left-0 w-6 h-6"
                />
              </div>

              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <a
                    href={`/characters/${toKebabCase(res.character)}`}
                    className="text-lg font-semibold text-cyan-400 hover:underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <CharacterNameDisplay fullname={res.data.Fullname} layout="normal" />
                  </a>
                </div>

                <div className="flex gap-1 mt-1">
                  {[...Array(res.data.Rarity)].map((_, i) => (
                    <Image
                      key={i}
                      src="/images/ui/CM_icon_star_y.png"
                      alt="★"
                      width={16}
                      height={16}
                      className="w-4 h-4"
                    />
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <h3 className="text-lg font-semibold mb-2">{res.character}</h3>
          )}

          <div className="mt-2 text-sm text-cyan-300 font-medium">
            {res.builds.length} build{res.builds.length > 1 ? 's' : ''} match
          </div>
        </div>
      ))}
    </div>
  );
}
