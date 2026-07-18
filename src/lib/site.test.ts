import { afterEach, describe, expect, it, vi } from 'vitest';

/**
 * `site.ts` fige son profil de déploiement AU CHARGEMENT (env `NEXT_PUBLIC_*`
 * bakées au build). On stubbe l'env puis on ré-importe le module frais pour
 * couvrir les deux stratégies d'URL (path / subdomain) de façon déterministe.
 */
async function loadSite(env: Record<string, string>) {
  vi.resetModules();
  for (const [k, v] of Object.entries(env)) vi.stubEnv(k, v);
  return import('@/lib/site');
}

afterEach(() => {
  vi.unstubAllEnvs();
  vi.resetModules();
});

describe('buildUrl — routage par CHEMIN (dev / staging)', () => {
  const env = {
    NEXT_PUBLIC_SITE_ORIGIN: 'https://staging.example',
    NEXT_PUBLIC_LANG_ROUTING: 'path',
  };

  it('préfixe chaque langue en segment de chemin, langue par défaut incluse', async () => {
    const { buildUrl } = await loadSite(env);
    expect(buildUrl('en', '/characters')).toBe('https://staging.example/en/characters');
    expect(buildUrl('jp', '/guides')).toBe('https://staging.example/jp/guides');
  });

  it('la racine `/` ne laisse pas de slash traînant', async () => {
    const { buildUrl } = await loadSite(env);
    expect(buildUrl('en', '/')).toBe('https://staging.example/en');
  });

  it('normalise une langue invalide vers la langue par défaut', async () => {
    const { buildUrl } = await loadSite(env);
    expect(buildUrl('zz' as never, '/x')).toBe('https://staging.example/en/x');
  });

  it('getBaseUrl = origine du déploiement', async () => {
    const { getBaseUrl } = await loadSite(env);
    expect(getBaseUrl()).toBe('https://staging.example');
  });
});

describe('buildUrl — routage par SOUS-DOMAINE (prod finale)', () => {
  const env = {
    NEXT_PUBLIC_SITE_ORIGIN: 'https://outerpedia.com',
    NEXT_PUBLIC_LANG_ROUTING: 'subdomain',
  };

  it('langue par défaut = apex (pas de sous-domaine)', async () => {
    const { buildUrl } = await loadSite(env);
    expect(buildUrl('en', '/x')).toBe('https://outerpedia.com/x');
    expect(buildUrl('en', '/')).toBe('https://outerpedia.com');
  });

  it('les autres langues passent par leur sous-domaine', async () => {
    const { buildUrl } = await loadSite(env);
    expect(buildUrl('jp', '/x')).toBe('https://jp.outerpedia.com/x');
  });
});
