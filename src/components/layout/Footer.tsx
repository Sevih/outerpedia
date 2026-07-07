import { getRequestLang } from '@/lib/i18n/server';

/** Pied de page global (portage minimal). */
export function Footer() {
  const lang = getRequestLang();
  return (
    <footer className="border-line-subtle text-content-subtle mt-16 border-t py-8 text-center text-xs">
      <p>Outerpedia — wiki communautaire Outerplane · {lang.toUpperCase()}</p>
    </footer>
  );
}
