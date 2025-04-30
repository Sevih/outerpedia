"use client";

import { useEffect, useState } from "react";
import characters from "@/data/_allCharacters.json";
import { toKebabCase } from "@/utils/formatText";
import AssetCard from "@/app/components/AssetCard";

const IMAGE_BASE = "/images/characters";
const EFFECT_BASE = "/images/ui/effect";
const UI_BASE = "/images/ui";
const BOSS_BASE = "/images/characters/boss";

type Character = {
    ID: string;
    Fullname: string;
};

const categories = ["Characters", "Effects", "Bosses", "UI"];

const imageTypes = [
    {
        label: "Full Art",
        path: "full",
        name: (id: string) => `IMG_${id}`,
    },
    {
        label: "Portrait",
        path: "portrait",
        name: (id: string) => `CT_${id}`,
    },
    {
        label: "Exclusive",
        path: "ex",
        name: (_: string, fullname: string) => toKebabCase(fullname),
    },
    {
        label: "Skill - First",
        path: "skills",
        name: (id: string) => `Skill_First_${id}`,
    },
    {
        label: "Skill - Second",
        path: "skills",
        name: (id: string) => `Skill_Second_${id}`,
    },
    {
        label: "Skill - Ultimate",
        path: "skills",
        name: (id: string) => `Skill_Ultimate_${id}`,
    },
    {
        label: "ATB (Normal)",
        path: "atb",
        name: (id: string) => `IG_Turn_${id}`,
    },
    {
        label: "ATB (Enemie)",
        path: "atb",
        name: (id: string) => `IG_Turn_${id}_E`,
    },
];

export default function ToolsClient() {
    const [category, setCategory] = useState("Characters");
    const [search, setSearch] = useState("");
    const [selectedChar, setSelectedChar] = useState<Character | null>(null);
    const [effectFiles, setEffectFiles] = useState<string[]>([]);
    const [uiFiles, setUiFiles] = useState<string[]>([]);
    const [bossFiles, setBossFiles] = useState<string[]>([]);

    const filtered = characters
        .filter((char) =>
            char.Fullname.toLowerCase().includes(search.toLowerCase())
        )
        .sort((a, b) => a.Fullname.localeCompare(b.Fullname))
        .slice(0, 10);

        useEffect(() => {
            const manifestMap: Record<string, { url: string; loaded: boolean; setter: (val: string[]) => void }> = {
              Effects: { url: "/images/ui/effect/manifest.json", loaded: effectFiles.length > 0, setter: setEffectFiles },
              UI: { url: "/images/ui/manifest.json", loaded: uiFiles.length > 0, setter: setUiFiles },
              Bosses: { url: "/images/characters/boss/manifest.json", loaded: bossFiles.length > 0, setter: setBossFiles },
            };
          
            const entry = manifestMap[category];
            if (entry && !entry.loaded) {
              fetch(entry.url)
                .then((res) => res.json())
                .then(entry.setter)
                .catch(() => {});
            }
          }, [category, effectFiles.length, uiFiles.length, bossFiles.length]);
              
          

    return (
        
        <>
            <div className="mb-6 flex gap-4">
            <script
  type="application/ld+json"
  dangerouslySetInnerHTML={{
    __html: JSON.stringify({
      "@context": "https://schema.org",
      "@type": "WebApplication",
      "name": "Outerpedia Assets Download",
      "url": "https://outerpedia.com/tools/assets-dl",
      "applicationCategory": "Utility",
      "operatingSystem": "All",
      "description": "Browse and download characters, skills, UI and effect images from Outerplane.",
      "creator": {
        "@type": "Organization",
        "name": "Outerpedia",
        "url": "https://outerpedia.com"
      }
    }),
  }}
/>

                {categories.map((cat) => (
                    <button
                        key={cat}
                        onClick={() => {
                            setCategory(cat);
                            setSelectedChar(null);
                            setSearch("");
                        }}
                        className={`px-4 py-2 rounded-lg border text-sm font-medium transition ${category === cat
                                ? "bg-primary text-white"
                                : "bg-neutral-800 text-neutral-300 hover:bg-neutral-700"
                            }`}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            {category === "Characters" && (
                <>
                    <div className="mb-6 max-w-md relative">
                        <input
                            type="text"
                            placeholder="Search character..."
                            value={search}
                            onChange={(e) => {
                                setSearch(e.target.value);
                                setSelectedChar(null);
                            }}
                            className="w-full border border-neutral-700 bg-neutral-900 text-white placeholder:text-neutral-400 rounded-lg px-4 py-2"
                        />
                        {search && filtered.length > 0 && (
                            <ul className="absolute z-10 w-full bg-neutral-800 border border-neutral-700 mt-1 rounded-lg max-h-60 overflow-y-auto">
                                {filtered.map((char) => (
                                    <li
                                        key={char.ID}
                                        onClick={() => {
                                            setSelectedChar(char);
                                            setSearch("");
                                        }}
                                        className="px-4 py-2 cursor-pointer hover:bg-neutral-700 text-white"
                                    >
                                        {char.Fullname}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    {selectedChar && (
                        <section
                            className="grid gap-4"
                            style={{
                                display: "grid",
                                gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))",
                                gridAutoFlow: "dense",
                                alignItems: "start",
                            }}
                        >
                            {imageTypes.map((type) => {
                                const filename = type.name(selectedChar.ID, selectedChar.Fullname);
                                const srcBase = `${IMAGE_BASE}/${type.path}/${filename}`;

                                let displaySize: number | undefined;
                                if (type.path === "skills") displaySize = 50;
                                else if (["atb", "ex"].includes(type.path)) displaySize = 80;

                                return (
                                    <AssetCard
                                        key={filename}
                                        label={type.label}
                                        srcBase={srcBase}
                                        displaySize={displaySize}
                                    />
                                );
                            })}
                        </section>
                    )}
                </>
            )}

{category === "Effects" && (
  <section className="grid gap-4" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gridAutoFlow: "dense", alignItems: "start" }}>
    {effectFiles.map((name) => {
      const srcBase = `${EFFECT_BASE}/${name.replace(/\.(webp|png)$/g, "")}`;
      return <AssetCard key={name} label="" srcBase={srcBase} displaySize={40} />;
    })}
  </section>
)}

{category === "UI" && (
  <section className="grid gap-4" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gridAutoFlow: "dense", alignItems: "start" }}>
    {uiFiles.map((name) => {
      const srcBase = `${UI_BASE}/${name.replace(/\.(webp|png)$/g, "")}`;
      return <AssetCard key={name} label="" srcBase={srcBase} />;
    })}
  </section>
)}

{category === "Bosses" && (
  <section className="grid gap-4" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gridAutoFlow: "dense", alignItems: "start" }}>
    {bossFiles.map((name) => {
      const srcBase = `${BOSS_BASE}/${name.replace(/\.(webp|png)$/g, "")}`;
      return <AssetCard key={name} label="" srcBase={srcBase} />;
    })}
  </section>
)}


        </>
    );
}
