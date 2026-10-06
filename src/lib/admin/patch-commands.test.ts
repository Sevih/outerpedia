/**
 * Contrat du côté PUR des gestes « patch » de l'accueil admin : ce qui sépare
 * une saisie de la page d'un argument de `pnpm commit`, et la décision du
 * pré-vol avant le push. Aucune commande n'est lancée ici — le commit pousse
 * R2, le push déploie.
 */
import { describe, expect, it } from 'vitest';
import {
  COMMIT_MESSAGE_MAX,
  CURRENT_BRANCH_ARGS,
  PUSH_REVIEW_ARGS,
  commitMessageError,
  createLineSplitter,
  isBump,
  parseAheadBehind,
  parseBumpFlag,
  parsePublishRequest,
  publishArgs,
  pushArgs,
  pushBranchError,
  pushCompareArgs,
  pushFetchArgs,
  pushRefusal,
  pushVerifyArgs,
  stripAnsi,
} from './patch-commands';

describe('commitMessageError', () => {
  it('accepte un message conventionnel, avec ou sans portée', () => {
    expect(commitMessageError('chore(data): patch du 06/10')).toBeNull();
    expect(commitMessageError('fix: coquille')).toBeNull();
    expect(commitMessageError('feat(guides)!: carte Monad Gate')).toBeNull();
  });

  it('refuse un message sans préfixe conventionnel', () => {
    expect(commitMessageError('patch du 06/10')).toMatch(/préfixe conventionnel/);
    expect(commitMessageError('data: patch')).toMatch(/préfixe conventionnel/);
    expect(commitMessageError(' chore(data): espace en tête')).toMatch(/préfixe conventionnel/);
    expect(commitMessageError('chore(data):')).toMatch(/préfixe conventionnel/);
  });

  it('refuse le vide et ce qui n’est pas une chaîne', () => {
    for (const v of ['', undefined, null, 42, ['chore: x'], { message: 'chore: x' }])
      expect(commitMessageError(v)).toMatch(/attendu/);
  });

  it('refuse un retour à la ligne ou un caractère de contrôle', () => {
    for (const v of ['chore: a\nb', 'chore: a\r\nb', 'chore: a\tb', 'chore: a\u0000b'])
      expect(commitMessageError(v)).toMatch(/une ligne/);
  });

  it(`borne la longueur à ${COMMIT_MESSAGE_MAX} caractères`, () => {
    const head = 'chore(data): ';
    expect(commitMessageError(head + 'x'.repeat(COMMIT_MESSAGE_MAX - head.length))).toBeNull();
    expect(commitMessageError(head + 'x'.repeat(COMMIT_MESSAGE_MAX - head.length + 1))).toMatch(
      /trop long/,
    );
  });

  it('refuse ce qu’un shell en aval interpréterait entre guillemets', () => {
    for (const c of ['"', '$', '`', '\\', '%'])
      expect(commitMessageError(`chore(data): avant ${c}(id) après`)).toMatch(/refusés/);
    // L'apostrophe et la ponctuation courante passent.
    expect(commitMessageError("chore(data): l'extraction du 06/10 — Lambda & Sigma")).toBeNull();
  });
});

describe('isBump', () => {
  it('ne reconnaît que les trois niveaux', () => {
    expect(['patch', 'minor', 'major'].every(isBump)).toBe(true);
    for (const v of ['', 'Patch', 'none', '1', 0, null, undefined]) expect(isBump(v)).toBe(false);
  });
});

describe('parsePublishRequest', () => {
  it('rend la demande validée', () => {
    expect(parsePublishRequest({ message: 'chore(data): patch', bump: 'minor' })).toEqual({
      ok: true,
      request: { message: 'chore(data): patch', bump: 'minor' },
    });
  });

  it('refuse un corps qui n’est pas un objet', () => {
    for (const body of [null, 'chore: x', 42, ['chore: x', 'patch']])
      expect(parsePublishRequest(body)).toEqual({ ok: false, error: 'objet JSON attendu.' });
  });

  it('refuse un message invalide avant de regarder le bump', () => {
    const r = parsePublishRequest({ message: 'sans préfixe', bump: 'patch' });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toMatch(/préfixe conventionnel/);
  });

  it('refuse un bump absent ou inconnu', () => {
    for (const bump of [undefined, 'none', '--yes', 1]) {
      const r = parsePublishRequest({ message: 'chore(data): patch', bump });
      expect(r.ok).toBe(false);
      if (!r.ok) expect(r.error).toMatch(/bump attendu/);
    }
  });
});

describe('publishArgs', () => {
  it('garde le message d’UNE pièce, en argument de --msg', () => {
    expect(publishArgs({ message: 'chore(data): patch du 06/10', bump: 'patch' })).toEqual([
      'commit',
      '--msg',
      'chore(data): patch du 06/10',
      '--bump',
      'patch',
      '--yes',
      '--no-push',
    ]);
  });

  it('ne pousse jamais : --no-push part quel que soit le bump', () => {
    for (const bump of ['patch', 'minor', 'major'] as const)
      expect(publishArgs({ message: 'chore(data): patch', bump })).toContain('--no-push');
  });
});

describe('arguments du push', () => {
  it('lit la branche et la revue sans rien recevoir', () => {
    expect(CURRENT_BRANCH_ARGS).toEqual(['rev-parse', '--abbrev-ref', 'HEAD']);
    expect(PUSH_REVIEW_ARGS).toEqual(['log', '--oneline', '@{upstream}..HEAD']);
  });

  it('injecte la branche d’UNE pièce dans chaque commande', () => {
    expect(pushFetchArgs('main')).toEqual(['fetch', 'origin', 'main']);
    expect(pushVerifyArgs('main')).toEqual(['rev-parse', '--verify', 'origin/main']);
    expect(pushCompareArgs('main')).toEqual([
      'rev-list',
      '--left-right',
      '--count',
      'HEAD...origin/main',
    ]);
    expect(pushArgs('main')).toEqual(['push', '--no-verify', 'origin', 'main']);
    expect(pushArgs('feat/admin-auth')).toEqual([
      'push',
      '--no-verify',
      'origin',
      'feat/admin-auth',
    ]);
  });
});

describe('pushBranchError', () => {
  it('accepte un nom de branche', () => {
    for (const branch of ['main', 'feat/admin-auth', 'fix-1.7.4'])
      expect(pushBranchError(branch)).toBeNull();
  });

  it('refuse un HEAD détaché ou une sortie vide', () => {
    for (const branch of ['', 'HEAD']) expect(pushBranchError(branch)).toMatch(/HEAD détaché/);
  });

  it('refuse ce que git lirait comme une option ou comme deux arguments', () => {
    for (const branch of ['--force', '-f', 'main --force', 'main\nautre'])
      expect(pushBranchError(branch)).toMatch(/refusé/);
  });
});

describe('parseAheadBehind', () => {
  it('lit « en avance, en retard » de git rev-list --left-right --count', () => {
    expect(parseAheadBehind('42\t0\n')).toEqual({ ahead: 42, behind: 0 });
    expect(parseAheadBehind('0\t3')).toEqual({ ahead: 0, behind: 3 });
    expect(parseAheadBehind('1 2')).toEqual({ ahead: 1, behind: 2 });
  });

  it('rend null sur toute autre sortie', () => {
    for (const out of ['', '42', 'fatal: bad revision', '1\t2\t3', '-1\t0'])
      expect(parseAheadBehind(out)).toBeNull();
  });
});

describe('pushRefusal (pré-vol de commit.ts)', () => {
  it('laisse partir une branche à jour, en avance ou non', () => {
    expect(pushRefusal('main', '42\t0\n')).toBeNull();
    expect(pushRefusal('main', '0\t0\n')).toBeNull();
  });

  it('refuse une branche en retard, avec le compte et le remède', () => {
    const refusal = pushRefusal('main', '2\t3\n');
    expect(refusal).toMatch(/origin\/main a 3 commit\(s\)/);
    expect(refusal).toMatch(/rien n'a été poussé/);
    expect(refusal).toMatch(/git pull --rebase origin main/);
    expect(pushRefusal('main', '0\t1')).toMatch(/1 commit\(s\)/);
  });

  it('refuse quand la comparaison est illisible', () => {
    for (const out of ['', 'fatal: bad revision'])
      expect(pushRefusal('main', out)).toMatch(/illisible — rien n'a été poussé/);
  });
});

describe('parseBumpFlag (--bump de commit.ts)', () => {
  it('rend null sans le flag : le prompt reste', () => {
    expect(parseBumpFlag([])).toBeNull();
    expect(parseBumpFlag(['--dry-run', '--msg', 'chore: x', '--yes'])).toBeNull();
  });

  it('lit les trois niveaux, où que soit le flag', () => {
    expect(parseBumpFlag(['--bump', 'patch'])).toBe('patch');
    expect(parseBumpFlag(['--msg', 'chore: x', '--bump', 'minor', '--yes'])).toBe('minor');
    expect(parseBumpFlag(['--yes', '--bump', 'major'])).toBe('major');
  });

  it('lève sur une valeur inconnue plutôt que de retomber sur le prompt', () => {
    expect(() => parseBumpFlag(['--bump', 'gros'])).toThrow(/reçu « gros »/);
    expect(() => parseBumpFlag(['--bump', '1'])).toThrow(/patch, minor, major/);
  });

  it('lève quand la valeur manque ou qu’un autre flag la remplace', () => {
    expect(() => parseBumpFlag(['--bump'])).toThrow(/attendu/);
    expect(() => parseBumpFlag(['--bump', '--yes'])).toThrow(/reçu « --yes »/);
  });
});

describe('stripAnsi', () => {
  it('retire couleurs et effacements, garde le texte', () => {
    expect(stripAnsi('\u001b[31m✗ échec\u001b[0m')).toBe('✗ échec');
    expect(stripAnsi('\u001b[2K\u001b[1G▶ pré-vol : \u001b[36mmain\u001b[0m')).toBe(
      '▶ pré-vol : main',
    );
    expect(stripAnsi('sans séquence')).toBe('sans séquence');
  });
});

describe('createLineSplitter', () => {
  const collect = () => {
    const lines: string[] = [];
    return { lines, split: createLineSplitter((l) => lines.push(l)) };
  };

  it('recolle une ligne coupée entre deux morceaux', () => {
    const { lines, split } = collect();
    split.push('promotion extrait → val');
    expect(lines).toEqual([]);
    split.push('idé\n  characters.json');
    expect(lines).toEqual(['promotion extrait → validé']);
    split.flush();
    expect(lines).toEqual(['promotion extrait → validé', '  characters.json']);
  });

  it('garde les lignes vides et accepte CRLF, même coupé entre CR et LF', () => {
    const { lines, split } = collect();
    split.push('a\r');
    split.push('\n\nb\r\n');
    split.flush();
    expect(lines).toEqual(['a', '', 'b']);
  });

  it('traite un retour chariot seul comme une fin de ligne', () => {
    const { lines, split } = collect();
    split.push('10 %\r50 %\r100 %\n');
    expect(lines).toEqual(['10 %', '50 %', '100 %']);
  });

  it('flush n’émet rien quand tout est déjà sorti', () => {
    const { lines, split } = collect();
    split.push('a\n');
    split.flush();
    split.flush();
    expect(lines).toEqual(['a']);
  });
});
