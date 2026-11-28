/**
 * `PROTECT` de l'auto-traduction (B77) : la CIBLE d'un lien markdown
 * `[libellé](cible)` ne part pas au traducteur et revient intacte ; son
 * libellé, lui, est envoyé à traduire. Vu par ce que `autoTranslate` envoie à
 * DeepL et à Haiku (`fetch` simulé : aucun appel réel).
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/lib/admin/guard', () => ({ IS_DEV: true }));

const { autoTranslate } = await import('./translate-actions');

const LINE =
  '🔗 [Survey (Global)](https://t.co/KxxijqwJ0f) · see [the {I-I/Free Ether} guide](/guides/x)';

/** Le corps JSON du `n`-ième appel à `fetch`. */
const sent = (fetchMock: ReturnType<typeof vi.fn>, n = 0) =>
  JSON.parse(String((fetchMock.mock.calls[n][1] as RequestInit).body)) as Record<string, unknown>;

beforeEach(() => {
  vi.stubEnv('DEEPL_API_KEY', '');
  vi.stubEnv('DEEPL_API', '');
  vi.stubEnv('ANTHROPIC_API_KEY', '');
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe('autoTranslate — la cible d’un lien markdown est protégée', () => {
  it('DeepL : la cible part en balise ignorée, le libellé en prose ; la cible revient intacte', async () => {
    vi.stubEnv('DEEPL_API_KEY', 'test:fx');
    const fetchMock = vi.fn(async (_url: string, init: RequestInit) => {
      const xml = (JSON.parse(String(init.body)) as { text: string[] }).text[0];
      // Le « traducteur » réécrit la prose et rend les balises telles quelles.
      const text = xml.replace('Survey (Global)', 'Sondage (Global)').replace('see', 'voir');
      return new Response(JSON.stringify({ translations: [{ text }] }), { status: 200 });
    });
    vi.stubGlobal('fetch', fetchMock);

    const { results, provider } = await autoTranslate([LINE], ['fr']);
    expect(provider).toBe('deepl');

    const xml = (sent(fetchMock).text as string[])[0];
    expect(xml).toBe('🔗 [Survey (Global)<x>0</x> · see [the <x>1</x> guide<x>2</x>');
    expect(xml).not.toContain('t.co');
    expect(xml).not.toContain('/guides/x');

    expect(results[0].fr).toBe(
      '🔗 [Sondage (Global)](https://t.co/KxxijqwJ0f) · voir [the {I-I/Free Ether} guide](/guides/x)',
    );
  });

  it('Haiku : la cible part en marqueur ⟦n⟧, le libellé en prose ; la cible revient intacte', async () => {
    vi.stubEnv('ANTHROPIC_API_KEY', 'test');
    const fetchMock = vi.fn(async (_url: string, init: RequestInit) => {
      const body = JSON.parse(String(init.body)) as { messages: { content: string }[] };
      const user = body.messages[0].content;
      const payload = JSON.parse(user.slice(user.indexOf('['))) as { id: number; text: string }[];
      const fr = payload[0].text.replace('Survey', 'Sondage');
      return new Response(JSON.stringify({ content: [{ text: JSON.stringify({ 0: { fr } }) }] }), {
        status: 200,
      });
    });
    vi.stubGlobal('fetch', fetchMock);

    const { results, provider } = await autoTranslate([LINE], ['fr']);
    expect(provider).toBe('haiku');

    const user = (sent(fetchMock).messages as { content: string }[])[0].content;
    expect(user).toContain('[Survey (Global)⟦0⟧ · see [the ⟦1⟧ guide⟦2⟧');
    expect(user).not.toContain('t.co');
    expect(user).not.toContain('/guides/x');

    expect(results[0].fr).toBe(
      '🔗 [Sondage (Global)](https://t.co/KxxijqwJ0f) · see [the {I-I/Free Ether} guide](/guides/x)',
    );
  });
});
