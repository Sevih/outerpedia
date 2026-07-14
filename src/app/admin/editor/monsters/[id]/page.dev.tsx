import { notFound } from 'next/navigation';
import type { Skill } from '@datagen/contracts';
import {
  MonsterKitEditor,
  type EffectOption,
  type KitChip,
  type KitEditorSkill,
} from '@/components/admin/MonsterKitEditor';
import { MonsterSwitch } from '@/components/admin/MonsterSwitch';
import { monsterChipMeta, monsterSkillViews } from '@/lib/skill-view';
import { getMergedEffects } from '@/lib/data/effects';
import { monsterBossBadgeSrc, monsterIconSrc, monsterSlotSrc } from '@/lib/admin/monster-icon';
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

  const committedSkills = committedMonsterSkills();
  const skills = m.skills
    .map((sid) => (bundle?.skills[sid] ?? committedSkills[sid]) as Skill | undefined)
    .filter((s): s is Skill => Boolean(s));

  // Positions sous les RÈGLES SEULES (caller/desc-réf, curation ignorée) : le
  // « défaut » que l'éditeur matérialise quand aucun chipOwner n'est posé.
  const defaultCards = new Map<string, string[]>();
  for (const v of monsterSkillViews(skills, {})) {
    for (const e of v.effects ?? []) {
      if (!e.buff) continue;
      const list = defaultCards.get(e.buff) ?? [];
      if (!list.includes(v.skill.id)) list.push(v.skill.id);
      defaultCards.set(e.buff, list);
    }
  }

  const cur = loadKitCurationSections();
  const kitIds = new Set(skills.map((s) => s.id));
  const ownerOf = (buff: string): string | null => {
    const o = cur.chipOwner[buff];
    const candidates = Array.isArray(o) ? o : o ? [o] : [];
    return candidates.find((c) => kitIds.has(c)) ?? null;
  };
  const hiddenOf = (buff: string): string[] =>
    skills.map((s) => s.id).filter((sid) => cur.chipHide[sid]?.includes(buff));

  const seen = new Set<string>();
  const chips: KitChip[] = skills.flatMap((s) =>
    (s.effects ?? []).flatMap((e) => {
      if (!e.buff || seen.has(e.buff)) return [];
      const meta = monsterChipMeta(e);
      if (!meta) return [];
      seen.add(e.buff);
      return [
        {
          buff: e.buff,
          carrier: s.id,
          ...meta,
          defaultCards: defaultCards.get(e.buff) ?? [s.id],
          owner: ownerOf(e.buff),
          hiddenOn: hiddenOf(e.buff),
        },
      ];
    }),
  );

  const editorSkills: KitEditorSkill[] = skills.map((s) => ({
    id: s.id,
    name: s.name.en,
    type: s.type,
    ...(s.desc?.en ? { desc: s.desc.en } : {}),
    ...(s.icon ? { iconSrc: `/api/admin/sprite/${encodeURIComponent(s.icon)}` } : {}),
  }));

  // Catalogue du glossaire pour le bouton + (effets non masqués, nommés).
  const catalog: Record<string, EffectOption> = Object.fromEntries(
    getMergedEffects()
      .filter((e) => !e.hidden && e.name.en)
      .map((e) => [
        e.id,
        {
          id: e.id,
          name: e.name.en,
          ...(e.icon ? { icon: e.icon } : {}),
          isDebuff: e.isDebuff,
          ...(e.irremovable ? { irremovable: true } : {}),
        },
      ]),
  );

  const chipAdd: Record<string, string[]> = Object.fromEntries(
    skills.map((s) => [s.id, cur.chipAdd[s.id] ?? []]),
  );

  return (
    <div className="max-w-4xl space-y-5">
      <MonsterSwitch id={m.id} mode="editor" />

      <div className="flex items-center gap-3">
        <span className="relative h-14 w-14 shrink-0">
          {/* eslint-disable-next-line @next/next/no-img-element -- sprite dev */}
          <img
            src={monsterSlotSrc(m.type)}
            alt=""
            className="absolute inset-0 h-full w-full rounded object-cover"
          />
          {/* eslint-disable-next-line @next/next/no-img-element -- sprite dev */}
          <img
            src={monsterIconSrc(m.icon)}
            alt=""
            className="absolute inset-[7%] h-[86%] w-[86%] rounded object-cover"
          />
          {monsterBossBadgeSrc(m.type) && (
            // eslint-disable-next-line @next/next/no-img-element -- sprite dev
            <img
              src={monsterBossBadgeSrc(m.type)}
              alt="boss"
              className="absolute -top-1 -left-1 h-[30%] w-auto drop-shadow-md"
            />
          )}
        </span>
        <div>
          <h1 className="text-content-strong text-xl font-semibold">{m.name.en || '(sans nom)'}</h1>
          <p className="text-content-subtle text-sm">
            <span className="font-mono">{m.id}</span>
          </p>
        </div>
      </div>

      <MonsterKitEditor skills={editorSkills} chips={chips} chipAdd={chipAdd} catalog={catalog} />
    </div>
  );
}
