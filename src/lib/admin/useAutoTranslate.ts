'use client';

/**
 * ÉCHAFAUDAGE du bouton « Translate » des éditeurs admin (audit F4).
 *
 * Le comportement (l'anglais fait foi, seul le périmé repart au traducteur) vit
 * déjà en un seul endroit : `translate-fill.ts`. Ce qui restait dupliqué, c'est
 * la PLOMBERIE autour — quatre éditeurs portaient la même séquence au caractère
 * près : deux états, la liste des cibles, la sortie anticipée, l'appel, la boucle
 * `applyTranslation` + `markFresh`, la mise en état, le message. Jusqu'aux
 * chaînes littérales, identiques dans six fichiers.
 *
 * Ce que le hook NE prend PAS en charge, parce que ça dépend vraiment de chaque
 * éditeur : construire la copie mutable et collecter les enregistrements
 * (`collect`), puis publier cette copie dans l'état (`commit`). Les éditeurs
 * MUTENT des objets localisés partagés par référence avec leur état — d'où ce
 * découpage collect/commit plutôt qu'un hook qui posséderait la donnée.
 *
 * Placé dans `lib/admin/` et non `src/hooks/` : il ne sert QUE l'admin et tire
 * une server action gardée `IS_DEV`. Le sortir de la frontière `admin/` ferait
 * exactement ce que l'audit F2 reproche déjà au reste.
 */
import { useState } from 'react';
import type { Lang } from '@/lib/i18n/config';
import { autoTranslate } from '@/lib/admin/translate-actions';
import { applyTranslation, type Freshness } from '@/lib/admin/translate-fill';

type Localized = Partial<Record<Lang, string>>;

export type TranslateState = 'idle' | 'loading' | 'done' | 'error';

/** Fournisseur → libellé affiché (Haiku = repli quand le quota DeepL est atteint). */
export const providerLabel = (provider: string): string =>
  provider === 'haiku' ? 'Haiku (DeepL quota reached)' : 'DeepL';

/**
 * Messages du bouton, EXPORTÉS : deux éditeurs gardent leur propre câblage
 * d'état (bandeau partagé pour `EventsEditor`, helper dédié pour
 * `PremiumLimitedEditor`) mais doivent afficher les MÊMES phrases. Les
 * mutualiser ici évite que six copies divergent — c'est déjà arrivé (« note »
 * au lieu de « text », `Haiku` sans la mention du quota).
 */
export const TRANSLATE_MSG = {
  nothingStale: 'Nothing to translate — every English text is already up to date.',
  noChange: 'Every translation already matched the English text.',
  filled: (n: number, provider: string) =>
    `${n} field(s) translated via ${providerLabel(provider)} — review before saving.`,
} as const;

export interface AutoTranslateOptions<D> {
  /** Langues de l'éditeur ; l'EN en est retiré (c'est la source). */
  langs: readonly Lang[];
  /** Photo des EN au chargement — décide de ce qui est périmé. */
  freshness: Freshness;
  /**
   * Prépare le travail : `draft` = copie mutable à publier ensuite, `records` =
   * les textes localisés candidats (le hook filtre lui-même les périmés).
   */
  collect: () => { draft: D; records: Localized[] };
  /** Publie la copie mutée dans l'état du composant. */
  commit: (draft: D) => void;
}

export interface AutoTranslateResult {
  state: TranslateState;
  message: string | null;
  /** Lance la traduction ; ne lève jamais (l'erreur passe dans `message`). */
  run: () => Promise<void>;
}

export function useAutoTranslate<D>(opts: AutoTranslateOptions<D>): AutoTranslateResult {
  const [state, setState] = useState<TranslateState>('idle');
  const [message, setMessage] = useState<string | null>(null);

  async function run(): Promise<void> {
    setState('loading');
    setMessage(null);
    const targets = opts.langs.filter((l) => l !== 'en');
    const { draft, records } = opts.collect();
    // Ne part au traducteur que ce qui a BOUGÉ (EN édité/ajouté) ou à qui il
    // manque une langue — inutile de repayer DeepL pour l'identique.
    const stale = records.filter((r) => opts.freshness.isStale(r, targets));
    if (!stale.length) {
      setState('done');
      setMessage(TRANSLATE_MSG.nothingStale);
      return;
    }
    try {
      const { results, provider } = await autoTranslate(
        stale.map((r) => r.en!),
        [...targets],
      );
      let filled = 0;
      stale.forEach((rec, k) => {
        filled += applyTranslation(rec, results[k] ?? {}, targets);
        opts.freshness.markFresh(rec);
      });
      // Publication APRÈS mutation : les enregistrements collectés appartiennent
      // au `draft`, que l'éditeur pousse dans son état.
      opts.commit(draft);
      setState('done');
      setMessage(filled ? TRANSLATE_MSG.filled(filled, provider) : TRANSLATE_MSG.noChange);
    } catch (e) {
      setState('error');
      setMessage((e as Error).message);
    }
  }

  return { state, message, run };
}
