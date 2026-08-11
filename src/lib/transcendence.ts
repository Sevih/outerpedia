/**
 * LA TRANSCENDANCE, CÔTÉ AFFICHAGE — une seule lecture de `CharacterTranscendentTemplet`.
 *
 * Trois colonnes de cette table décident de tout ce que le site MONTRE d'un palier :
 * `ShowUIStar` (combien d'étoiles s'allument), `StarColor` (la teinte de la dernière)
 * et `StarPlus` (le « + » du palier). Elles étaient lues à DEUX endroits :
 *
 *   - `data/generated/transcend.json`, EXTRAIT du jeu (`buildTranscend`) — d'où
 *     viennent le slider de la fiche perso, le damage calculator et les sweetspots
 *     des guides ;
 *   - une transcription À LA MAIN dans `components/ui/Thumbnail`, d'où venaient le
 *     portrait, la vignette et le peintre canvas.
 *
 * Les deux concordaient — vérifié colonne par colonne, et le test voisin le grave —
 * mais rien ne les y obligeait : une refonte des paliers côté jeu aurait mis à jour
 * l'extraction et laissé la copie manuelle en arrière, sans un mot. Ce module est
 * l'unique lecteur, et la copie manuelle a disparu.
 *
 * IL EST CLIENT-SÛR, et c'était la seule objection sérieuse à ce branchement :
 * `transcend.json` fait 30 ko bruts mais 745 OCTETS gzippés — il est massivement
 * répétitif — quand la table à la main en pesait ~1 ko de source. Le surcoût réel
 * pour le navigateur est de l'ordre du néant. Il n'importe QUE ce fichier, jamais
 * `char-progression` (qui traîne 6 Mo de skills/items) : c'est ce qui lui permet
 * d'être lu par un composant `use client`, cf. le même souci dans `lib/images`.
 */
import type { TranscendData, TranscendStep } from '@contracts';
import transcendData from '@data/generated/transcend.json';

const TRANSCEND = transcendData as unknown as TranscendData;

/**
 * `CHARACTER_STAR_COLOR` du jeu, dans le SUFFIXE du sprite (`CM_icon_star_*`).
 *
 * L'extraction publie le nom plein (`yellow`, `violet`) ; les fichiers d'art, eux,
 * s'appellent `CM_icon_star_y` / `_v`. La lettre n'est donc pas une abréviation de
 * confort : c'est le nom du fichier, et c'est pour ça qu'elle reste le type porté
 * jusqu'aux rendus.
 */
export type StarTone = 'y' | 'o' | 'r' | 'v';

const TONE: Record<string, StarTone> = { yellow: 'y', orange: 'o', red: 'r', violet: 'v' };

/**
 * L'ÉCHELLE qui s'applique à un perso : ses paliers propres s'il en a, sinon le
 * barème de sa rareté de base. Même résolution que `char-progression`
 * (`overrides[id] ?? byStar[rarity]`) — dix personnages portent une échelle à eux.
 *
 * `charId` est OPTIONNEL parce que les habillages ne l'ont pas tous sous la main, et
 * que les dix échelles propres sont aujourd'hui identiques au générique SUR CES
 * TROIS COLONNES (elles ne diffèrent que par les stats et les coûts). Le test voisin
 * le vérifie : le jour où l'une divergerait, il vire au rouge au lieu de laisser un
 * portrait mentir en silence.
 */
function ladder(rarity: number, charId?: string): TranscendStep[] {
  return (
    (charId ? TRANSCEND.overrides[charId] : undefined) ?? TRANSCEND.byStar[String(rarity)] ?? []
  );
}

/**
 * LES ÉTOILES D'UN PERSO NE SE COMPTENT PAS, ELLES SE LISENT DANS LA TABLE.
 *
 * Deux pièges, et le prefab ment sur les deux :
 *
 *   1. `StarPlus` n'est PAS un nombre d'étoiles colorées, c'est le « + » du palier
 *      (5★+1, 5★+2). Il n'y a jamais qu'UNE étoile colorée — la dernière — et
 *      seulement quand ce niveau dépasse 0.
 *
 *   2. Le prefab fige quatre rangées `Star_4` / `Star_5` / `Star_5_Plus` / `Star_6`
 *      qui ressemblent à la règle. Elles sont INACTIVES, et `Star_6` (six étoiles
 *      violettes) ne correspond à AUCUNE ligne de la table : le palier à six étoiles
 *      les affiche jaunes. Ce sont des maquettes d'éditeur. La rangée réellement
 *      rendue est `Star`, dont le script réassigne les sprites d'après la table.
 *
 * Le nombre d'étoiles ne suit donc pas le palier : 4 étoiles au palier 5, puis 5 au
 * palier 6, puis toujours 5 aux paliers 7 et 8, puis 6 au palier 9.
 *
 * Les raretés 1 et 2 gardent leur `StarPlus` mais avec une teinte JAUNE : le +
 * existe, il ne se voit pas. Seuls les persos 3★ ont des étoiles colorées — d'où le
 * soin, dans `transcendenceLabel`, à lire `StarPlus` et non la couleur.
 *
 * Palier omis = perso non transcendé, donc le palier de base (sa rareté). Palier ou
 * rareté hors table : autant de jaunes que la rareté — une donnée inattendue ne doit
 * pas faire disparaître les étoiles.
 */
export function transcendenceRow(
  rarity: number,
  transcendence?: number,
  charId?: string,
): readonly [number, StarTone, number] {
  const step = ladder(rarity, charId).find((s) => s.star === (transcendence ?? rarity));
  if (!step) return [Math.min(Math.max(rarity, 0), 6), 'y', 0];
  return [step.showStar, TONE[step.starColor] ?? 'y', step.starPlus];
}

/**
 * LA RANGÉE D'ÉTOILES d'un palier : une teinte par étoile allumée, dans l'ordre du
 * rail (haut → bas au portrait, gauche → droite à la vignette).
 *
 * La règle tient en une ligne — seule la DERNIÈRE étoile prend la teinte, et
 * seulement si le palier porte un « + » — mais elle était écrite QUATRE fois : à la
 * vignette, au portrait, et deux fois au peintre canvas. Quatre copies d'un
 * `plus > 0 && i === show - 1` qui n'ont jamais divergé par chance.
 */
export function transcendenceStars(
  rarity: number,
  transcendence?: number,
  charId?: string,
): StarTone[] {
  const [show, tone, plus] = transcendenceRow(rarity, transcendence, charId);
  return Array.from({ length: show }, (_, i) => (plus > 0 && i === show - 1 ? tone : 'y'));
}

/**
 * LE PALIER TEL QU'UN JOUEUR L'ÉCRIT — « 4★ », « 5★+ », « 5★++ », « 6★ ».
 *
 * Le suffixe vient de `StarPlus`, JAMAIS de la couleur. Le déduire de la couleur
 * (`yellow` → rien) paraît équivalent sur un 3★ et se trompe sur toutes les raretés
 * 1 et 2, dont les paliers « + » restent jaunes : le slider de la fiche perso y
 * affichait « 4 | 4 | 5 | 5 | 5 | 6 », trois crans portant le même nom.
 */
export function transcendenceLabel(rarity: number, transcendence: number, charId?: string): string {
  const [show, , plus] = transcendenceRow(rarity, transcendence, charId);
  return `${show}★${'+'.repeat(plus)}`;
}

/** Le même libellé depuis un palier DÉJÀ lu — pour qui tient son `TranscendStep`. */
export function stepLabel(step: Pick<TranscendStep, 'showStar' | 'starPlus'>): string {
  return `${step.showStar}${'+'.repeat(step.starPlus)}`;
}

/** Tous les paliers (`TransStar`) d'une rareté, du plus bas au plus haut. */
export function transcendenceSteps(rarity: number, charId?: string): number[] {
  return ladder(rarity, charId).map((s) => s.star);
}

/**
 * LES PALIERS « PLEINS » — ceux SANS « + » : 3, 4, 6 et 9 pour un 3★, soit 3★, 4★,
 * 5★ et 6★.
 *
 * C'est la granularité à laquelle la tier list PvE se range et se cure : un rang
 * éditorial ne bascule pas sur un 5★+. Les paliers intermédiaires existent bel et
 * bien et le portrait sait les rendre — ils n'ont simplement rien à faire dans un
 * filtre, où trois crans à cinq étoiles ne se distingueraient qu'à la teinte.
 */
export function transcendenceFullSteps(rarity: number, charId?: string): number[] {
  return ladder(rarity, charId)
    .filter((s) => s.starPlus === 0)
    .map((s) => s.star);
}
