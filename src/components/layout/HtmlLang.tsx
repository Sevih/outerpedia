'use client';

import { useEffect } from 'react';
import type { Lang } from '@/lib/i18n/config';

/**
 * Aligne `<html lang>` sur la langue de la route.
 *
 * Le layout racine est global (hors `[lang]`) et ne connaît pas la langue : il
 * pose `lang="en"` en dur. On corrige ici, au montage et à chaque changement de
 * langue.
 *
 * Pourquoi un effet et pas un `<script>` inline : en navigation client (bascule
 * EN → FR), React re-rend le layout côté navigateur ; un `<script>` créé à ce
 * moment-là n'est jamais exécuté par le navigateur — l'attribut serait resté sur
 * l'ancienne langue, et React émettait un avertissement en dev.
 */
export function HtmlLang({ lang }: { lang: Lang }) {
  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  return null;
}
