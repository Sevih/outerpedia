'use client';

/**
 * Briques d'édition de `GuideEditor` (audit F9) — sorties du fichier de
 * l'éditeur, qui frôlait 1 100 lignes.
 *
 * ⚠ CE DÉCOUPAGE EST UNE PROTECTION, pas seulement du rangement. Ces composants
 * DOIVENT vivre au niveau module : déclarés dans le corps de `GuideEditor`, leur
 * identité change à chaque rendu et React démonte puis remonte tout leur
 * sous-arbre à CHAQUE frappe — le champ perd le focus et chaque aperçu est
 * relancé (une requête par champ, par lettre). C'est le bug vécu le 24/07, et la
 * surface exacte que F9 visait à réduire. Dans un fichier séparé, l'erreur
 * devient impossible à commettre par distraction.
 *
 * Les constantes partagées (`DATALIST_ID`, styles) vivent ici pour la même
 * raison : les briques et l'éditeur doivent parler des mêmes.
 */
import type { InlineRefs } from '@/lib/admin/inline-refs';
import type { InlineSegment } from '@/lib/parse-text';
import { hasText, type RecoGroupDraft } from '@/lib/admin/guide-draft';
import { InlinePreview } from '@/components/admin/InlinePreview';
import { CharacterChips, type ChipView } from '@/components/admin/CharacterChips';
import { CharacterGroups, type GroupWithReason } from '@/components/admin/CharacterGroups';
import { LANGS } from '@/lib/i18n/config';
import { btn, inputFull as input } from '../_ui';
export { btn, input };

/** Langues du SITE (5) — dérivées de la source de vérité i18n. */
export { LANGS };
export type L = (typeof LANGS)[number];

/** Nombre max de slots d'une équipe (contrainte du jeu). */
export const MAX_SLOTS = 4;
/** Datalist des noms de persos, posée une fois par page. */
export const DATALIST_ID = 'guide-char-names';
/** Jeton stocké par les guides = NOM D'AFFICHAGE EN du perso. */
export type ViewOf = (token: string) => ChipView | undefined;

export const heading = 'text-content-strong text-sm font-semibold';

/** Cadre commun des textes au repos — cliquable pour passer en édition. */
const restingBox =
  'border-line-subtle hover:border-accent min-h-8 w-full cursor-pointer rounded-md border px-2 py-1 text-left text-sm leading-snug';

/**
 * Note d'équipe AU REPOS : l'aperçu rendu, cliquable pour éditer (audit F5).
 * Sans ça, chaque note montait un `InlineTextField` qui lançait son propre
 * aperçu à l'ouverture du guide — une requête par équipe, sans une frappe.
 */
export function RestingNote({
  segments,
  empty,
  onEdit,
}: {
  segments: InlineSegment[] | undefined;
  empty: string;
  onEdit: () => void;
}) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onEdit}
      onKeyDown={(e) => e.key === 'Enter' && onEdit()}
      className={restingBox}
    >
      {segments?.length ? (
        <InlinePreview segments={segments} />
      ) : (
        <span className="text-content-subtle italic">{empty}</span>
      )}
    </div>
  );
}

/**
 * Note-LISTE au repos (mode `named`) — même rendu à puces que l'aperçu
 * `previewMode="list"` du champ, pour que passer en édition ne déplace rien.
 */
export function RestingNoteList({
  paragraphs,
  onEdit,
}: {
  paragraphs: InlineSegment[][] | undefined;
  onEdit: () => void;
}) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onEdit}
      onKeyDown={(e) => e.key === 'Enter' && onEdit()}
      className={restingBox}
    >
      {paragraphs?.length ? (
        <ul className="list-disc space-y-1 pl-4">
          {paragraphs.map((seg, i) => (
            <li key={i}>
              <InlinePreview segments={seg} />
            </li>
          ))}
        </ul>
      ) : (
        <span className="text-content-subtle italic">One paragraph per line…</span>
      )}
    </div>
  );
}

/** Bloc de slots d'équipe (max 4) — une ligne = les alternatives d'un slot. */
export function SlotsBlock({
  slots,
  viewOf,
  onChange,
}: {
  slots: string[][];
  viewOf: ViewOf;
  onChange: (slots: string[][]) => void;
}) {
  return (
    <div className="space-y-2">
      {slots.map((slot, si) => (
        <div key={si} className="flex items-start gap-2">
          <span className="text-content-subtle mt-3 w-6 shrink-0 text-right text-xs">{si + 1}</span>
          <div className="min-w-0 flex-1">
            <CharacterChips
              values={slot}
              datalistId={DATALIST_ID}
              viewOf={viewOf}
              onChange={(names) => onChange(slots.map((s, j) => (j === si ? names : s)))}
            />
          </div>
          <button
            type="button"
            className="text-danger mt-2 shrink-0 text-sm"
            title="Delete slot"
            onClick={() => onChange(slots.filter((_, j) => j !== si))}
          >
            ✕
          </button>
        </div>
      ))}
      {slots.length < MAX_SLOTS && (
        <button type="button" className={btn} onClick={() => onChange([...slots, []])}>
          + slot
        </button>
      )}
    </div>
  );
}

/**
 * Persos recommandés — même brique que les synergies d'une fiche perso (des
 * portraits + une raison, éditée une à la fois). Les guides désignent les persos
 * par NOM EN, d'où l'adaptation `characters` ⇄ `heroes` en entrée/sortie.
 */
export function RecoGroups({
  groups,
  onChange,
  lang,
  refs,
  viewOf,
}: {
  groups: RecoGroupDraft[];
  onChange: (groups: RecoGroupDraft[]) => void;
  lang: L;
  refs: InlineRefs;
  viewOf: ViewOf;
}) {
  const adapted: GroupWithReason[] = groups.map((g) => ({
    heroes: g.characters,
    ...(g.reason ? { reason: g.reason } : {}),
  }));
  return (
    <CharacterGroups
      groups={adapted}
      onChange={(next) =>
        onChange(
          next.map((g) => ({
            characters: g.heroes,
            // L'EN reste la structure du contenu localisé (cf. `editLText`).
            ...(hasText(g.reason) ? { reason: { ...g.reason, en: g.reason?.en ?? '' } } : {}),
          })),
        )
      }
      newGroup={() => ({ heroes: [] })}
      lang={lang}
      refs={refs}
      datalistId={DATALIST_ID}
      viewOf={viewOf}
      chipSize={48}
    />
  );
}
