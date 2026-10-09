import { notFound } from 'next/navigation';
import type { Skill } from '@datagen/contracts';
import { MonsterKitEditor, type KitEditorSkill } from '@/components/admin/MonsterKitEditor';
import { EntitySwitch } from '@/components/admin/EntitySwitch';
import { monsterBossBadgeSrc, monsterIconSrc, monsterSlotSrc } from '@/lib/admin/monster-icon';
import { monsterKitCards, monsterKitCatalog } from '@/lib/admin/monster-kit';
import { committedMonsterSkills, committedMonsters } from '@/lib/admin/monster-store';
import { extractedMonsterBundle } from '@/lib/admin/review-store';
import { loadKitCurationSections } from '@/lib/admin/monster-skill-curated-store';

export const dynamic = 'force-dynamic';

/**
 * VUE EDITOR d'un monstre : le CÂBLAGE D'AFFICHAGE du kit (couche curée de
 * data/curated/monster-skills.json) — cartes de skills comme l'extracteur,
 * chips déplaçables (chipOwner), masquables (chipHide), ajoutables (chipAdd).
 * Présentation seule : la donnée extraite reste fidèle aux tables ; le
 * contrôle de l'extraction vit côté Extractor (bascule en haut).
 */
export default async function EditorMonsterPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const bundle = extractedMonsterBundle(id);
  const committed = committedMonsters()[id];
  const m = bundle?.monster ?? committed;
  if (!m) notFound();

  // Les cartes et les chips du kit : le calcul partagé avec quick, sur
  // l'extraction fraîche posée par-dessus le committé.
  const { cards, chips } = monsterKitCards(
    m,
    { ...committedMonsterSkills(), ...(bundle?.skills as Record<string, Skill> | undefined) },
    loadKitCurationSections(),
  );
  const editorSkills: KitEditorSkill[] = cards.map((c) => ({
    id: c.id,
    name: c.name,
    type: c.type,
    ...(c.desc ? { desc: c.desc } : {}),
    ...(c.icon ? { iconSrc: `/api/admin/sprite/${encodeURIComponent(c.icon)}` } : {}),
  }));
  const catalog = monsterKitCatalog();
  const chipAdd: Record<string, string[]> = Object.fromEntries(cards.map((c) => [c.id, c.added]));

  return (
    <div className="max-w-4xl space-y-5">
      <EntitySwitch id={m.id} mode="editor" entity="monsters" />

      <div className="flex items-center gap-3">
        <span className="relative h-14 w-14 shrink-0">
          <img
            src={monsterSlotSrc(m.type)}
            alt=""
            aria-hidden
            className="absolute inset-0 h-full w-full rounded object-cover"
          />
          <img
            src={monsterIconSrc(m.icon)}
            alt=""
            aria-hidden
            className="absolute inset-[7%] h-[86%] w-[86%] rounded object-cover"
          />
          {monsterBossBadgeSrc(m.type) && (
            <img
              src={monsterBossBadgeSrc(m.type)}
              alt="boss"
              className="absolute -top-1 -left-1 h-[30%] w-auto drop-shadow-md"
            />
          )}
        </span>
        <div>
          <h1 className="text-content-strong text-xl font-semibold">{m.name.en || '(no name)'}</h1>
          <p className="text-content-subtle text-sm">
            <span className="font-mono">{m.id}</span>
          </p>
        </div>
      </div>

      <MonsterKitEditor skills={editorSkills} chips={chips} chipAdd={chipAdd} catalog={catalog} />
    </div>
  );
}
