import { CharactersSidebar, type SidebarRow } from '@/components/admin/CharactersSidebar';
import { characterDisplayName, getCharacter, getCharacterListItems } from '@/lib/data/characters';
import { loadCuratedCharacters } from '@/lib/data/curated';
import { characterV2Control, reviewTarget, type ControlGlossaries } from '@/lib/admin/review-store';
import type { Glossaries, Skill } from '@contracts';
import glossariesData from '@data/generated/glossaries.json';
import skillsData from '@data/generated/skills.json';

const G = glossariesData as unknown as Glossaries;
const SKILLS = skillsData as unknown as Record<string, Skill>;

/** Écarts restants vs V2 (valeurs ≠ + kits d'effets ≠) pour un perso committé. */
function v2DiffCount(id: string): number {
  const char = getCharacter(id);
  if (!char) return 0;
  const skills = char.skills.map((sid) => SKILLS[sid]).filter(Boolean);
  const control = characterV2Control(
    char as unknown as Record<string, unknown>,
    G as unknown as ControlGlossaries,
    skills,
  );
  if (!control.found) return 0;
  return control.checks.filter((c) => !c.ok).length + control.skillEffects.length;
}

export const dynamic = 'force-dynamic';

/**
 * Master-detail : sidebar extracteur (statuts calculés committé ↔ extraction
 * fraîche) + contenu à droite. Un perso `new` = extrait mais pas intégré.
 */
export default function AdminCharactersLayout({ children }: { children: React.ReactNode }) {
  const items = getCharacterListItems();
  const curated = loadCuratedCharacters();
  const review = reviewTarget('character');
  const diffCounts = new Map(review.diff.changed.map((c) => [c.key, c.fields.length]));

  const rows: SidebarRow[] = [
    // Nouveaux : extraits, pas encore committés.
    ...review.diff.added.map((id) => ({
      id,
      name: id,
      element: '',
      class: '',
      rarity: 0,
      status: 'new' as const,
      diffCount: 0,
      v2Count: 0,
      curated: false,
    })),
    ...items.map((c) => ({
      id: c.id,
      name: characterDisplayName(c),
      element: c.element,
      class: c.class,
      rarity: c.rarity,
      status: (diffCounts.has(c.id) ? 'diff' : 'ok') as SidebarRow['status'],
      diffCount: diffCounts.get(c.id) ?? 0,
      v2Count: v2DiffCount(c.id),
      curated: Boolean(curated[c.id] && Object.keys(curated[c.id]).length),
    })),
  ];

  return (
    <div className="flex gap-6">
      <CharactersSidebar rows={rows} />
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
