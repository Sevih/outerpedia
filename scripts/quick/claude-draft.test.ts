import { describe, expect, it } from 'vitest';
import {
  DRAFT_MODEL,
  RAW_REPLY,
  childEnv,
  claudeCommand,
  draftModel,
  extractDraft,
  proposeDraft,
  type ClaudeRun,
} from './claude-draft';

describe('premier jet par Claude Code — sous l’abonnement, jamais par la clé d’API', () => {
  it('`childEnv` retire les secrets de .env.local et toute clé d’API Anthropic', () => {
    const env = childEnv(
      {
        PATH: '/usr/bin',
        HOME: '/home/x',
        ANTHROPIC_API_KEY: 'sk-venue-du-shell',
        ANTHROPIC_AUTH_TOKEN: 't',
        DISCORD_BOT_TOKEN: 'jeton',
        R2_SECRET_ACCESS_KEY: 'r2',
      },
      ['DISCORD_BOT_TOKEN', 'R2_SECRET_ACCESS_KEY', 'ANTHROPIC_API_KEY'],
    );
    expect(env).toEqual({ PATH: '/usr/bin', HOME: '/home/x' });
  });

  it('`draftModel` n’accepte qu’un nom de modèle, sinon le défaut', () => {
    expect(draftModel(undefined)).toBe(DRAFT_MODEL);
    expect(draftModel('opus')).toBe('opus');
    expect(draftModel('claude-sonnet-5-5')).toBe('claude-sonnet-5-5');
    expect(draftModel('sonnet & calc')).toBe(DRAFT_MODEL);
    expect(draftModel('--dangerously')).toBe(DRAFT_MODEL);
  });

  it('`claudeCommand` : sans outil ni session ; par l’interpréteur sous Windows, d’une pièce', () => {
    const posix = claudeCommand('sonnet', 'linux');
    expect(posix.shell).toBe(false);
    expect(posix.command).toBe('claude');
    expect(posix.args.slice(0, 8)).toEqual([
      '-p',
      '--model',
      'sonnet',
      '--effort',
      'medium',
      '--no-session-persistence',
      '--tools',
      '',
    ]);
    const win = claudeCommand('sonnet', 'win32');
    expect(win.shell).toBe(true);
    expect(win.args).toEqual([]);
    expect(win.command).toMatch(
      /^claude -p --model sonnet --effort medium --no-session-persistence --tools "" --system-prompt "[^"&|<>^%]+"$/,
    );
    // Un modèle douteux ne passe pas sur la ligne de commande.
    expect(claudeCommand('x" & del', 'win32').command).toContain(`--model ${DRAFT_MODEL} `);
  });

  it('`extractDraft` retire l’enveloppe de code, pas les blocs du message', () => {
    const message = '# :scroll: TL;DR\n```ansi\n[1;32mSIGMA[0m\n```\n- fin';
    expect(extractDraft(`${message}\n`)).toBe(message);
    expect(extractDraft(`\`\`\`\`markdown\n${message}\n\`\`\`\`\n`)).toBe(message);
    expect(extractDraft(`\`\`\`\n# titre\n- a\n\`\`\``)).toBe('# titre\n- a');
    // Un message qui COMMENCE par son propre bloc ansi et finit par un autre n'est pas une enveloppe.
    const twoBlocks = '```ansi\na\n```\ntexte\n```ansi\nb\n```';
    expect(extractDraft(twoBlocks)).toBe(twoBlocks);
    expect(extractDraft('a\r\nb')).toBe('a\nb');
  });

  const run = (r: Partial<ClaudeRun>) => {
    const seen: string[] = [];
    return {
      seen,
      deps: {
        model: 'sonnet',
        run: (prompt: string): Promise<ClaudeRun> => {
          seen.push(prompt);
          return Promise.resolve({ code: 0, stdout: '', stderr: '', ...r });
        },
      },
    };
  };

  it('`proposeDraft` rend le message, et demande une réponse nue', async () => {
    const { deps, seen } = run({ stdout: '```\n# :scroll: TL;DR\n```\n' });
    const steps: [string, boolean | undefined][] = [];
    const out = await proposeDraft('DEMANDE', deps, (line, doing) => steps.push([line, doing]));
    expect(out).toMatchObject({ ok: true, text: '# :scroll: TL;DR' });
    expect(seen).toEqual([`DEMANDE${RAW_REPLY}`]);
    expect(steps).toHaveLength(1);
    expect(steps[0][1]).toBe(true);
  });

  it('`proposeDraft` dit pourquoi le jet ne vient pas', async () => {
    const said = async (r: Partial<ClaudeRun>) => (await proposeDraft('D', run(r).deps)).log[0];
    expect(await said({ code: null, missing: true })).toMatch(/introuvable sur ce poste/);
    expect(
      await said({
        code: 1,
        stderr: "'claude' is not recognized as an internal or external command",
      }),
    ).toMatch(/introuvable sur ce poste/);
    expect(await said({ code: null, timedOut: true })).toMatch(/pas répondu à temps/);
    expect(await said({ code: 1, stderr: 'Invalid API key · Please run /login' })).toBe(
      'Claude Code a échoué (code 1) : Invalid API key · Please run /login',
    );
    expect(await said({ code: 0, stdout: '  \n' })).toMatch(/réponse vide/);
  });
});
