/**
 * Collecte des textes traduisibles d'un ÉVÉNEMENT (audit F9) — cœur PUR, sorti
 * du composant pour être lisible et testable seul.
 *
 * ⚠ Les valeurs sont rendues PAR RÉFÉRENCE : l'appelant travaille sur une copie
 * profonde de l'événement et `applyTranslation` remplit les champs EN PLACE.
 * Rendre des copies ici casserait la traduction en silence — elle s'appliquerait
 * à des objets jetés aussitôt.
 */
import type { LocalizedText } from '@contracts';
import type { EventEntry } from '@/lib/data/events';

/* --- Collecte des textes à traduire ---------------------------------------- */

/**
 * Toutes les valeurs localisées d'un événement, PAR RÉFÉRENCE : l'appelant
 * travaille sur une copie profonde et remplit les champs en place.
 */
export function collectTexts(e: EventEntry): LocalizedText[] {
  const out: LocalizedText[] = [e.title];
  if (e.summary) out.push(e.summary);
  for (const p of e.phases ?? []) out.push(p.label);
  for (const b of e.blocks) {
    if ('title' in b && b.title) out.push(b.title);
    switch (b.kind) {
      case 'prose':
      case 'callout':
        out.push(b.text);
        break;
      case 'list':
        out.push(...b.items);
        break;
      case 'sections':
        for (const s of b.items) out.push(s.title, s.text);
        break;
      case 'cta':
        out.push(b.label);
        if (b.note) out.push(b.note);
        break;
      case 'videos':
        for (const v of b.entries) if (v.featured) out.push(v.featured);
        break;
      case 'image':
        if (b.alt) out.push(b.alt);
        if (b.caption) out.push(b.caption);
        break;
      case 'timeline':
        break;
    }
  }
  return out;
}
