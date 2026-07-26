/**
 * Collecte des textes traduisibles des PRIORITÉS DE SHOP (audit F9) — cœur PUR,
 * sorti du composant pour être lisible et testable seul.
 *
 * ⚠ Les valeurs sont rendues PAR RÉFÉRENCE : la traduction écrit DANS ces objets.
 * Seuls les textes porteurs d'un EN non vide sont retenus — l'anglais est la
 * source, un texte sans EN n'a rien à traduire.
 */
import type { LocalizedText } from '@contracts';
import type { OverlayEntry, ShopEditorial } from '@/lib/admin/shop-priorities-store';

/**
 * Tous les textes localisés porteurs d'un EN, comme OBJETS (la traduction écrit
 * dedans) : notes de l'overlay + notes de shop + items éditoriaux (labels/notes)
 * + paragraphes des shops texte.
 */
export function allTexts(
  overlay: Record<string, OverlayEntry>,
  editorial: ShopEditorial,
): LocalizedText[] {
  const out: LocalizedText[] = [];
  const push = (t?: LocalizedText) => {
    if (t?.en?.trim()) out.push(t);
  };
  for (const e of Object.values(overlay)) push(e.notes);
  for (const n of Object.values(editorial.shopNotes)) push(n);
  for (const it of [...editorial.eventItems, ...editorial.resourceItems]) {
    push(it.label);
    push(it.notes);
  }
  for (const shop of Object.values(editorial.textShops)) {
    shop.paragraphs.forEach(push);
    push(shop.gearNote);
  }
  return out;
}
