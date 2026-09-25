import { afterEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { proxy } from './proxy';

/** Requête vers `path` sur `host`, avec un éventuel cookie `lang`. */
function req(
  path: string,
  { host = 'localhost:3000', lang }: { host?: string; lang?: string } = {},
) {
  const headers: Record<string, string> = { host };
  if (lang) headers.cookie = `lang=${lang}`;
  return new NextRequest(`http://${host}${path}`, { headers });
}

/** Ce que le proxy a décidé : redirection (statut + cible), réécriture ou passage. */
function outcome(res: Response) {
  const location = res.headers.get('location');
  if (location) {
    const url = new URL(location);
    return { status: res.status, to: url.pathname + url.search };
  }
  const rewrite = res.headers.get('x-middleware-rewrite');
  if (rewrite) return { rewrite: new URL(rewrite).pathname };
  return { next: res.headers.get('x-middleware-next') === '1' };
}

/** Le `Set-Cookie` de `lang` émis par la réponse, s'il y en a un. */
function langSetCookie(res: Response): string | undefined {
  return res.headers
    .getSetCookie()
    .find((c) => c.startsWith('lang='))
    ?.toLowerCase();
}

describe('proxy — mode path (défaut des tests)', () => {
  it('préfixe non défaut : laisse passer et retient la langue', () => {
    const res = proxy(req('/fr/characters'));
    expect(outcome(res)).toEqual({ next: true });
    const cookie = langSetCookie(res);
    expect(cookie).toContain('lang=fr');
    expect(cookie).toContain('path=/');
    expect(cookie).toContain('samesite=lax');
    expect(cookie).toContain('max-age=31536000');
  });

  it('préfixe non défaut déjà retenu : pas de Set-Cookie superflu', () => {
    const res = proxy(req('/fr/characters', { lang: 'fr' }));
    expect(outcome(res)).toEqual({ next: true });
    expect(langSetCookie(res)).toBeUndefined();
  });

  it('préfixe non défaut différent du cookie : le cookie suit le préfixe', () => {
    const res = proxy(req('/jp/characters', { lang: 'fr' }));
    expect(outcome(res)).toEqual({ next: true });
    expect(langSetCookie(res)).toContain('lang=jp');
  });

  it('sans préfixe + cookie non défaut : 307 vers le chemin préfixé, query conservée', () => {
    expect(outcome(proxy(req('/characters?sort=name', { lang: 'fr' })))).toEqual({
      status: 307,
      to: '/fr/characters?sort=name',
    });
    expect(outcome(proxy(req('/', { lang: 'kr' })))).toEqual({ status: 307, to: '/kr' });
  });

  it('sans préfixe, cookie absent, défaut ou invalide : réécriture vers le défaut', () => {
    for (const lang of [undefined, 'en', 'xx']) {
      expect(outcome(proxy(req('/characters', { lang })))).toEqual({
        rewrite: '/en/characters',
      });
    }
  });

  it('/en/… : 308 vers /… et cookie effacé, sans cache de la redirection', () => {
    const res = proxy(req('/en/characters?x=1', { lang: 'fr' }));
    expect(outcome(res)).toEqual({ status: 308, to: '/characters?x=1' });
    const cookie = langSetCookie(res);
    expect(cookie).toMatch(/^lang=;/);
    expect(cookie).toMatch(/expires=thu, 01 jan 1970|max-age=0/);
    expect(res.headers.get('cache-control')).toBe('no-store');
  });

  it("pas de boucle : la cible d'une redirection ne redirige plus", () => {
    // Cookie fr : /x → /fr/x, qui passe.
    const first = outcome(proxy(req('/characters', { lang: 'fr' })));
    expect(first).toEqual({ status: 307, to: '/fr/characters' });
    expect(outcome(proxy(req('/fr/characters', { lang: 'fr' })))).toEqual({ next: true });
    // Retour à l'anglais : /en/x → /x, cookie effacé, donc /x est réécrit.
    expect(outcome(proxy(req('/en/characters', { lang: 'fr' })))).toMatchObject({ status: 308 });
    expect(outcome(proxy(req('/characters')))).toEqual({ rewrite: '/en/characters' });
  });

  it('chemins exclus : jamais redirigés, même avec un cookie', () => {
    for (const path of ['/api/x', '/_next/data/x', '/images/a/b', '/s/abc', '/admin']) {
      expect(outcome(proxy(req(path, { lang: 'fr' })))).toEqual({ next: true });
    }
  });
});

describe('proxy — sous-domaine détecté (inchangé)', () => {
  it('fr.outerpedia.com : réécriture par l’hôte, cookie ignoré et jamais posé', () => {
    const res = proxy(req('/characters', { host: 'fr.outerpedia.com', lang: 'jp' }));
    expect(outcome(res)).toEqual({ rewrite: '/fr/characters' });
    expect(langSetCookie(res)).toBeUndefined();
  });

  it('fr.outerpedia.com/zh/… : 308 vers le chemin sans préfixe du même hôte', () => {
    const res = proxy(req('/zh/characters', { host: 'fr.outerpedia.com' }));
    expect(outcome(res)).toEqual({ status: 308, to: '/characters' });
    expect(langSetCookie(res)).toBeUndefined();
  });
});

describe('proxy — LANG_ROUTING=subdomain, domaine racine (inchangé)', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  async function subdomainProxy() {
    vi.stubEnv('NEXT_PUBLIC_LANG_ROUTING', 'subdomain');
    vi.resetModules();
    return (await import('./proxy')).proxy;
  }

  it('apex sans préfixe : réécriture vers le défaut, le cookie ne compte pas', async () => {
    const p = await subdomainProxy();
    const res = p(req('/characters', { host: 'outerpedia.com', lang: 'fr' }));
    expect(outcome(res)).toEqual({ rewrite: '/en/characters' });
    expect(langSetCookie(res)).toBeUndefined();
  });

  it('apex /en/… : 308 sans toucher au cookie ni au cache', async () => {
    const p = await subdomainProxy();
    const res = p(req('/en/characters', { host: 'outerpedia.com', lang: 'fr' }));
    expect(outcome(res)).toEqual({ status: 308, to: '/characters' });
    expect(langSetCookie(res)).toBeUndefined();
    expect(res.headers.get('cache-control')).toBeNull();
  });
});
