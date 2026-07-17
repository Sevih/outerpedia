import { getRequestLang } from '@/lib/i18n/server';
import { getT } from '@/i18n';

/** Pied de page global (portage minimal — le footer riche viendra avec le
 * chantier layout ; ses clés `footer.*` sont déjà dans les locales). */
export async function Footer() {
  const lang = getRequestLang();
  const t = await getT(lang);
  return (
    <footer className="border-line-subtle text-content-subtle mt-16 border-t py-8 text-center text-xs">
      <p>
        Outerpedia — {t('footer.tagline')} · {lang.toUpperCase()}
      </p>
    </footer>
  );
}
