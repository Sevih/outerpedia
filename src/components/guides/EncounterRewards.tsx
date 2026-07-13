import { getT } from '@/i18n';
import { LANGUAGES, type Lang } from '@/lib/i18n/config';
import type { Encounter } from '@/lib/data/encounters';
import { resolveRewardTable, type ResolvedReward } from '@/lib/data/rewards';
import { GRADE_TEXT } from '@/lib/images';
import { ItemInline } from '@/components/inline/ItemInline';

/**
 * LE BUTIN D'UNE RENCONTRE — les tables que le donjon référence, résolues et
 * affichées par nature : victoire, défaite, butin répétable de chaque combat.
 *
 * Tout vient de `DungeonRef.reward[Win|Lose]` → `rewardTables` → catalogue /
 * familles d'équipement (cf. lib/data/rewards). AUCUNE liste ici : la V2
 * portait le loot de l'irregular en dur dans sa vue de catégorie, et il aurait
 * suffi d'une rotation de boss pour qu'elle mente.
 *
 * Le pool ALÉATOIRE est annoncé comme tel — le client du jeu ne porte aucun
 * taux (pondération côté serveur), on ne prétend donc pas en afficher.
 */
export async function EncounterRewards({ encounter, lang }: { encounter: Encounter; lang: Lang }) {
  const t = await getT(lang);
  const d = encounter.ref;

  // Sections dans l'ordre de lecture d'un joueur : ce que rapporte la victoire,
  // ce que laisse la défaite, ce que chaque combat donne quoi qu'il arrive.
  const sections = [
    { key: 'win', label: t('guides.rewards.win'), table: d.rewardWin },
    { key: 'lose', label: t('guides.rewards.lose'), table: d.rewardLose },
    { key: 'battle', label: t('guides.rewards.battle'), table: d.reward },
  ].filter((s): s is typeof s & { table: string } => Boolean(s.table));
  if (!sections.length) return null;

  return (
    <section className="space-y-2">
      <h3 className="text-content font-mono text-[10px] font-semibold tracking-[0.14em] uppercase">
        {t('guides.rewards.title')}
      </h3>
      <div className="panel-info space-y-2 px-4 py-3 text-sm">
        {sections.map((s) => {
          const rewards = resolveRewardTable(s.table, lang);
          const fixed = rewards.filter((r) => !r.random);
          const random = rewards.filter((r) => r.random);
          return (
            <div key={s.key} className="flex flex-wrap items-baseline gap-x-3 gap-y-1.5">
              <span className="text-content-muted w-24 shrink-0 text-xs font-semibold">
                {s.label}
              </span>
              {fixed.map((r, i) => (
                <RewardChip key={i} reward={r} lang={lang} />
              ))}
              {random.length > 0 && (
                <>
                  <span className="text-content-muted text-xs italic">
                    {t('guides.rewards.random')}
                  </span>
                  {random.map((r, i) => (
                    <RewardChip key={i} reward={r} lang={lang} />
                  ))}
                </>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}

/** Une ligne de butin : la brique ItemInline commune + sa quantité. */
function RewardChip({ reward: r, lang }: { reward: ResolvedReward; lang: Lang }) {
  const fmt = (n: number) => n.toLocaleString(LANGUAGES[lang].htmlLang);
  const amount = r.min === r.max ? fmt(r.min) : `${fmt(r.min)}–${fmt(r.max)}`;
  return (
    <span className="inline-flex items-center gap-1 whitespace-nowrap">
      <ItemInline
        item={{ name: r.name, iconSrc: r.iconSrc, grade: r.grade, desc: r.desc }}
        color={r.href ? (GRADE_TEXT[r.grade] ?? 'text-equipment') : 'text-content'}
        href={r.href}
      />
      {/* ×1 sur un drop unitaire n'apprend rien — la quantité ne s'affiche
          que quand elle compte (monnaies, matériaux en nombre). */}
      {r.max > 1 && <span className="text-content-muted text-xs">×{amount}</span>}
    </span>
  );
}
