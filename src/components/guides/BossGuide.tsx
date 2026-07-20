import type { LocalizedText } from '@contracts';
import { getT } from '@/i18n';
import { lRec } from '@/lib/i18n/localize';
import { parseText, type ParseCtx } from '@/lib/parse-text';
import { readGuideFile, type GuideContentProps } from '@/lib/data/guides';
import { resolveSectionTitle, type SectionTitle } from '@/lib/data/guide-sections';
import { BossPanel } from '@/components/guides/BossPanel';
import { TacticalTips } from '@/components/guides/TacticalTips';
import { RecommendedCharacters } from '@/components/guides/RecommendedCharacters';
import { MultiVideoEmbed, type VideoItem } from '@/components/ui/MultiVideoEmbed';

/** Une section de conseils : ce qui la caractérise + ses points. */
export type TipsSection = SectionTitle & { items: (LocalizedText & { en: string })[] };

/** Un bloc d'équipe : ce qui le caractérise + ses groupes de persos. */
export type TeamSection = SectionTitle & {
  groups: { characters: string[]; reason?: LocalizedText & { en: string } }[];
};

/** Contenu éditorial d'un guide de boss (`content.json`). */
export interface BossGuideContent {
  intro: LocalizedText & { en: string };
  tips?: TipsSection[];
  teams?: TeamSection[];
  videos?: VideoItem[];
}

/**
 * RENDU PARTAGÉ d'un guide de boss — intro, panneau du boss, conseils, équipes,
 * vidéos.
 *
 * Les 13 guides Dimensional Singularity de la V2 étaient ISOMORPHES : zéro
 * section propre à l'un d'eux, seul le NOMBRE de blocs variait. Ils existaient
 * pourtant en 13 fichiers TSX quasi identiques — d'où les dérives (titres
 * d'équipe divergents, id du boss écrit trois fois par fichier). Ici le rendu
 * vit une fois, il lit LUI-MÊME le `content.json` du guide (`readGuideFile`,
 * comme TowerGuide) — et l'`index.tsx` d'un guide n'est qu'un re-export d'une
 * ligne, identique dans toute la famille.
 *
 * Le même composant sert aux autres modes à boss (joint challenge, world boss,
 * guild raid) : leur anatomie est la même.
 *
 * STRICT : un `content.json` absent, un tag ou un nom de perso inconnu JETTE
 * (build SSG cassé), comme partout ailleurs dans les guides.
 */
export async function BossGuide({ lang, guide }: GuideContentProps) {
  const t = await getT(lang);
  const ctx: ParseCtx = { lang, t, strict: true };
  const at = `${guide.category}/${guide.slug}`;

  const content = readGuideFile<BossGuideContent>(guide, 'content.json');
  if (!content) {
    throw new Error(`${at} : content.json manquant (guide de boss — cf. BossGuide).`);
  }

  return (
    <>
      {/* Du contenu éditorial, pas une légende : il se lit à la même encre que
          le reste du guide. Le gris (`content-muted`) est réservé au chrome —
          fil d'Ariane, dates, méta. */}
      <p className="text-content text-sm leading-relaxed">
        {parseText(lRec(content.intro, lang), ctx)}
      </p>

      {guide.bossId && <BossPanel monsterId={guide.bossId} lang={lang} />}

      {content.tips?.map((section, i) => (
        <TacticalTips
          key={i}
          title={resolveSectionTitle(section, 'tips', lang, t, `${at} · tips[${i}]`)}
          tips={section.items.map((tip) => parseText(lRec(tip, lang), ctx))}
        />
      ))}

      {content.teams?.map((section, i) => (
        <RecommendedCharacters
          key={i}
          title={resolveSectionTitle(section, 'team', lang, t, `${at} · teams[${i}]`)}
          lang={lang}
          groups={section.groups.map((g) => ({
            characters: g.characters,
            reason: g.reason ? parseText(lRec(g.reason, lang), ctx) : undefined,
          }))}
        />
      ))}

      {content.videos?.length ? (
        <section className="space-y-2">
          <h2 className="text-content-strong text-xl font-bold">{t('guides.combat_footage')}</h2>
          <MultiVideoEmbed byLabel={t('video.by')} videos={content.videos} />
        </section>
      ) : null}
    </>
  );
}
