import type { LocalizedText } from '@contracts';
import { getT } from '@/i18n';
import { lRec } from '@/lib/i18n/localize';
import { parseText, type ParseCtx } from '@/lib/parse-text';
import type { GuideContentProps } from '@/lib/data/guides';
import {
  bossWaveMonsters,
  encounterLabel,
  encountersOfIds,
  pickMonsters,
} from '@/lib/data/encounters';
import { BossEncounters } from '@/components/guides/BossEncounters';
import { TacticalTips } from '@/components/guides/TacticalTips';
import { RecommendedCharacters } from '@/components/guides/RecommendedCharacters';

type LText = LocalizedText & { en: string };

/** Contenu éditorial d'un guide de stage d'histoire (`content.json`). */
export interface StoryGuideContent {
  intro: LText;
  /**
   * Ce que le stage a de particulier À SAVOIR AVANT le combat — en pratique, le
   * stage jumeau que le guide couvre aussi (« vaut aussi pour S2 Hard 5-9 »).
   * Il se lit AVANT le boss, pas au milieu des conseils : il change le périmètre
   * de ce qu'on lit.
   */
  note?: LText;
  tips?: LText[];
  recommended?: { characters: string[]; reason?: LText }[];
}

/**
 * RENDU PARTAGÉ d'un guide de STAGE D'HISTOIRE — intro, boss aux deux modes
 * (Story Normal / Story Hard), conseils, personnages recommandés.
 *
 * Les 20 guides adventure de la V2 étaient ISOMORPHES : aucun n'avait de section
 * en propre, seul variait le NOMBRE de blocs. Ils vivaient pourtant en 20 TSX
 * qui recopiaient chacun la même mécanique — et surtout, cinq d'entre eux
 * câblaient à la main les comparses du boss (Sterope, Maxie, Roxie, Vlada) dans
 * un `MinionDisplay` piloté par un `useState` synchronisé sur le sélecteur de
 * version, avec deux API concurrentes selon le guide. Ici, les comparses sont
 * simplement les autres monstres de la VAGUE DU BOSS (`bossWaveMonsters`) : ils
 * viennent de la donnée, ils suivent le mode tout seuls, et un guide n'est plus
 * que `meta.json` + `content.json`. Les deux stages que cette règle ne sert pas
 * (Alpha combat une vague avant Leo ; Maxwell traîne un clone et un orbe muets)
 * désignent leurs monstres dans le meta — une DONNÉE, pas un cas dans le code.
 *
 * Le combat vient des `dungeons` du META : l'histoire n'a pas de `group` (cf.
 * `encountersOfIds`). Le mode le plus dur ouvre par défaut — c'est pour lui que
 * les conseils sont écrits, et le bandeau le dit.
 *
 * STRICT : un donjon, un tag ou un nom de perso inconnu JETTE (build SSG cassé),
 * comme partout ailleurs dans les guides.
 */
export async function StoryBossGuide({
  lang,
  guide,
  content,
}: GuideContentProps & { content: StoryGuideContent }) {
  const t = await getT(lang);
  const ctx: ParseCtx = { lang, t, strict: true };
  const at = `${guide.category}/${guide.slug}`;

  if (!guide.dungeons?.length) {
    throw new Error(`${at} : « dungeons » manquant dans meta.json (guide de stage d'histoire).`);
  }

  // Les conseils sont écrits pour le mode le plus dur — le dire, comme partout :
  // le lecteur qui bascule sur Normal doit savoir que ce qu'il lit dessous ne
  // parle pas de son combat.
  const encounters = encountersOfIds(guide.dungeons);
  const target = encounterLabel(encounters[encounters.length - 1].ref, lang, t);

  // Le guide peut DÉSIGNER ses monstres quand la vague du boss ne dit pas le
  // combat (cf. `GuideMeta.monsters`). Un id qui ne tombe dans AUCUN donjon est
  // une carte qui disparaîtrait sans un bruit : on casse le build à la place.
  const chosen = guide.monsters;
  if (chosen) {
    for (const id of chosen) {
      if (!encounters.some((e) => e.monsters.some((m) => m.id === id))) {
        throw new Error(
          `${at} : monstre « ${id} » (meta.monsters) absent des donjons du guide ` +
            `(${guide.dungeons.join(', ')}).`,
        );
      }
    }
  }

  return (
    <>
      {/* Du contenu éditorial, pas une légende : même encre que le reste du guide. */}
      <p className="text-content text-sm leading-relaxed">
        {parseText(lRec(content.intro, lang), ctx)}
      </p>

      {content.note && (
        <p className="text-content border-highlight border-l-2 py-1 pl-3 text-sm italic">
          {parseText(lRec(content.note, lang), ctx)}
        </p>
      )}

      <BossEncounters
        dungeons={guide.dungeons}
        lang={lang}
        monsters={chosen ? (e) => pickMonsters(e, chosen) : bossWaveMonsters}
      />

      {content.tips?.length ? (
        <>
          <p className="text-content text-xs italic">
            {t('guides.difficulty.tips_for', { difficulty: target })}
          </p>
          <TacticalTips
            title={t('guides.tips.tactical')}
            tips={content.tips.map((tip) => parseText(lRec(tip, lang), ctx))}
          />
        </>
      ) : null}

      {content.recommended?.length ? (
        <RecommendedCharacters
          title={t('guides.recommended.title')}
          lang={lang}
          groups={content.recommended.map((g) => ({
            characters: g.characters,
            reason: g.reason ? parseText(lRec(g.reason, lang), ctx) : undefined,
          }))}
        />
      ) : null}
    </>
  );
}
