/**
 * Contrat des outils d'édition de l'onglet « Discord » (`discord-editor.mjs`) :
 * la barre, la palette, le sélecteur d'emojis, l'autocomplétion.
 *
 * Tout y est pur — texte et sélection en entrée, texte et sélection en sortie —
 * et se lit donc à l'œil : dans les cas ci-dessous `‹` et `›` bornent la
 * sélection (`‹›` : un curseur seul).
 *
 * Deux choses à tenir. Ce que la barre pose SE VOIT dans l'aperçu (chaque outil
 * est repassé par `renderDiscord`), et un second clic défait le premier.
 */
import { describe, expect, it } from 'vitest';
import { formatTimestamp, renderDiscord } from './discord';
import {
  INLINE,
  LINE,
  RECENT_MAX,
  TIMESTAMP_STYLES,
  applyTool,
  convertDates,
  dateAt,
  diffEdit,
  emojiQueryAt,
  insertEmoji,
  insertLink,
  insertTimestamp,
  isUrl,
  linkAt,
  matchEmojis,
  mergeGuildEmojis,
  pickerSections,
  pushRecent,
  recentEmojis,
  resolvePalette,
  searchEmojis,
  shortcutTool,
  toggleCodeBlock,
  toggleInline,
  toggleLine,
  unlink,
  utcToUnix,
} from './discord-editor.mjs';

interface Edit {
  text: string;
  start: number;
  end: number;
}

/** `'un ‹mot› ici'` → le texte sans les bornes, et la sélection qu'elles marquent. */
function ed(marked: string): Edit {
  const start = marked.indexOf('‹');
  const end = marked.indexOf('›') - 1;
  if (start < 0 || end < start) throw new Error(`sélection mal marquée : ${marked}`);
  return { text: marked.replace(/[‹›]/g, ''), start, end };
}

/** L'inverse : le texte, sa sélection bornée. */
const show = (e: Edit): string =>
  `${e.text.slice(0, e.start)}‹${e.text.slice(e.start, e.end)}›${e.text.slice(e.end)}`;

const tool = (marked: string, name: string): string => show(applyTool(ed(marked), name));

/** Tous les états traversés par les cas d'un bloc, pour `diffEdit`. */
const seen: [string, string][] = [];
const track = (marked: string, name: string): string => {
  const before = ed(marked);
  const after = applyTool(before, name);
  seen.push([before.text, after.text]);
  return show(after);
};

// ----------------------------------------------------------- en ligne --------

describe('outils en ligne', () => {
  it.each([
    ['bold', 'un **‹mot›** ici', '<strong>mot</strong>'],
    ['italic', 'un *‹mot›* ici', '<em>mot</em>'],
    ['underline', 'un __‹mot›__ ici', '<u>mot</u>'],
    ['strike', 'un ~~‹mot›~~ ici', '<s>mot</s>'],
    ['code', 'un `‹mot›` ici', '<code>mot</code>'],
    ['spoiler', 'un ||‹mot›|| ici', '<span class="spoiler">mot</span>'],
  ])('%s : pose autour de la sélection, se voit dans l’aperçu, se retire', (name, posed, html) => {
    expect(track('un ‹mot› ici', name)).toBe(posed);
    expect(renderDiscord(ed(posed).text)).toBe(`<div class="ln">un ${html} ici</div>`);
    // Second clic : la sélection est restée sur le mot, les marqueurs autour.
    expect(track(posed, name)).toBe('un ‹mot› ici');
  });

  it.each(Object.keys(INLINE))(
    '%s : sans sélection, le marqueur vide et le curseur dedans',
    (name) => {
      const m = INLINE[name];
      expect(track('a ‹› b', name)).toBe(`a ${m}‹›${m} b`);
      expect(track(`a ${m}‹›${m} b`, name)).toBe('a ‹› b');
    },
  );

  it('retire aussi des marqueurs pris DANS la sélection', () => {
    expect(track('un ‹**mot**› ici', 'bold')).toBe('un ‹mot› ici');
    expect(track('‹~~barré~~›', 'strike')).toBe('‹barré›');
    // Quatre étoiles seules ne sont pas un gras à vider.
    expect(track('‹****›', 'bold')).toBe('**‹****›**');
  });

  it('gras et italique partagent l’étoile sans se confondre', () => {
    expect(track('**‹mot›**', 'italic')).toBe('***‹mot›***');
    expect(renderDiscord('***mot***')).toBe('<div class="ln"><strong><em>mot</em></strong></div>');
    expect(track('***‹mot›***', 'italic')).toBe('**‹mot›**');
    expect(track('***‹mot›***', 'bold')).toBe('*‹mot›*');
    expect(track('*‹mot›*', 'bold')).toBe('***‹mot›***');
    // Curseur entre deux étoiles doubles : un gras vide, pas un italique.
    expect(track('**‹›**', 'italic')).toBe('***‹›***');
  });

  it('laisse dehors les blancs de bord et le marqueur de ligne', () => {
    expect(track('un‹ mot ›ici', 'italic')).toBe('un *‹mot›* ici');
    expect(track('‹- puce›', 'bold')).toBe('- **‹puce›**');
    expect(track('‹## Titre›', 'underline')).toBe('## __‹Titre›__');
    expect(track('‹> - dans une citation›', 'bold')).toBe('> - **‹dans une citation›**');
    expect(track('‹-# petit›', 'italic')).toBe('-# *‹petit›*');
    expect(renderDiscord('- **puce**')).toBe('<ul><li><strong>puce</strong></li></ul>');
  });

  it('sur plusieurs lignes : chacune pour elle-même, lignes vides passées', () => {
    const posed = track('‹- un\n\n- deux›', 'bold');
    expect(posed).toBe('- ‹**un**\n\n- **deux**›');
    expect(renderDiscord(ed(posed).text)).toBe(
      '<ul><li><strong>un</strong></li></ul><div class="ln"><br></div><ul><li><strong>deux</strong></li></ul>',
    );
    expect(track(posed, 'bold')).toBe('- ‹un\n\n- deux›');
    // Une seule des deux est en gras : on complète, on ne retire rien.
    expect(track('‹**un**\ndeux›', 'bold')).toBe('‹**un**\n**deux**›');
  });

  it('une sélection de blancs seuls ne reçoit rien', () => {
    expect(track('a‹   ›b', 'bold')).toBe('a‹   ›b');
    expect(track('a‹\n›b', 'code')).toBe('a‹\n›b');
  });
});

// ------------------------------------------------------------ de ligne -------

describe('outils de ligne', () => {
  it.each([
    ['h1', '# Ti‹›tre', '<h1>Titre</h1>'],
    ['h2', '## Ti‹›tre', '<h2>Titre</h2>'],
    ['h3', '### Ti‹›tre', '<h3>Titre</h3>'],
    ['sub', '-# Ti‹›tre', '<div class="sub">Titre</div>'],
    ['quote', '> Ti‹›tre', '<blockquote><div class="ln">Titre</div></blockquote>'],
    ['list', '- Ti‹›tre', '<ul><li>Titre</li></ul>'],
  ])('%s : pose en tête de ligne, se voit dans l’aperçu, se retire', (name, posed, html) => {
    expect(posed.startsWith(LINE[name])).toBe(true);
    expect(track('Ti‹›tre', name)).toBe(posed);
    expect(renderDiscord(ed(posed).text)).toBe(html);
    expect(track(posed, name)).toBe('Ti‹›tre');
  });

  it('changer de niveau REMPLACE le précédent', () => {
    expect(track('# Titre‹›', 'h3')).toBe('### Titre‹›');
    expect(track('### Titre‹›', 'h2')).toBe('## Titre‹›');
    expect(track('## Titre‹›', 'sub')).toBe('-# Titre‹›');
    expect(track('-# Titre‹›', 'list')).toBe('- Titre‹›');
    expect(track('- Titre‹›', 'h1')).toBe('# Titre‹›');
  });

  it('toutes les lignes touchées, lignes vides passées', () => {
    expect(track('avant\n‹un\n\ndeux›\naprès', 'list')).toBe('avant\n- ‹un\n\n- deux›\naprès');
    expect(track('avant\n- ‹un\n\n- deux›\naprès', 'list')).toBe('avant\n‹un\n\ndeux›\naprès');
    // Sélection posée au milieu des lignes : elles sont prises entières.
    expect(track('pre‹mière\nsec›onde', 'h2')).toBe('## pre‹mière\n## sec›onde');
  });

  it('bascule : posé partout si une seule ligne le porte, retiré si toutes', () => {
    expect(track('‹- un\ndeux\n## trois›', 'list')).toBe('- ‹un\n- deux\n- trois›');
    expect(track('- ‹un\n- deux\n- trois›', 'list')).toBe('‹un\ndeux\ntrois›');
  });

  it('une sélection qui s’arrête en début de ligne ne prend pas cette ligne', () => {
    expect(track('‹un\n›deux', 'quote')).toBe('> ‹un\n›deux');
  });

  it('ligne vide : le marqueur, curseur derrière ; un second clic le reprend', () => {
    expect(track('‹›', 'h2')).toBe('## ‹›');
    expect(track('## ‹›', 'h2')).toBe('‹›');
    expect(track('## ‹›', 'h1')).toBe('# ‹›');
    expect(track('a\n‹›\nb', 'list')).toBe('a\n- ‹›\nb');
    expect(track('a\n- ‹›\nb', 'list')).toBe('a\n‹›\nb');
  });

  it('la citation entoure le reste, sans le remplacer', () => {
    expect(track('## Ti‹›tre', 'quote')).toBe('> ## Ti‹›tre');
    expect(renderDiscord('> ## Titre')).toBe('<blockquote><h2>Titre</h2></blockquote>');
    expect(track('> ## Ti‹›tre', 'h2')).toBe('> Ti‹›tre');
    expect(track('> Ti‹›tre', 'list')).toBe('> - Ti‹›tre');
    expect(track('> - Ti‹›tre', 'quote')).toBe('- Ti‹›tre');
  });

  it('une puce garde son retrait, un titre le perd', () => {
    expect(track('- parent\n  - enf‹›ant', 'list')).toBe('- parent\n  enf‹›ant');
    expect(track('- parent\n  enf‹›ant', 'list')).toBe('- parent\n  - enf‹›ant');
    expect(track('* éto‹›ile', 'list')).toBe('éto‹›ile');
    expect(track('  - enf‹›ant', 'h3')).toBe('### enf‹›ant');
    // `#mot` et un titre en retrait ne sont pas des titres : rien à remplacer.
    expect(track('#mot‹›', 'h1')).toBe('# #mot‹›');
  });

  it('un curseur resté dans l’ancien marqueur vient au début du texte', () => {
    expect(track('#‹›# Titre', 'h2')).toBe('‹›Titre');
    expect(track('‹›## Titre', 'h1')).toBe('# ‹›Titre');
  });
});

// --------------------------------------------------------- bloc de code ------

describe('bloc de code', () => {
  const block = (marked: string): string => {
    const before = ed(marked);
    const after = toggleCodeBlock(before);
    seen.push([before.text, after.text]);
    return show(after);
  };

  it('au curseur : deux clôtures sur leur ligne, curseur entre elles — et retour', () => {
    expect(block('‹›')).toBe('```\n‹›\n```');
    expect(block('```\n‹›\n```')).toBe('‹›');
    expect(block('a\n‹›\nb')).toBe('a\n```\n‹›\n```\nb');
    // En milieu de ligne, la ligne est coupée.
    expect(block('ab‹›cd')).toBe('ab\n```\n‹›\n```\ncd');
  });

  it('avec une sélection : les lignes entières, et un second clic les rend', () => {
    const posed = block('a\n‹b\nc›\nd');
    expect(posed).toBe('a\n```\n‹b\nc›\n```\nd');
    expect(renderDiscord(ed(posed).text)).toBe(
      '<div class="ln">a</div><pre><code>b\nc</code></pre><div class="ln">d</div>',
    );
    expect(block(posed)).toBe('a\n‹b\nc›\nd');
    expect(block('ab‹c›d')).toBe('```\n‹abcd›\n```');
    expect(block('‹un\n›deux')).toBe('```\n‹un›\n```\ndeux');
  });

  it('retire les clôtures d’un bloc sélectionné en entier, langage compris', () => {
    expect(block('‹```\nx\ny\n```›')).toBe('‹x\ny›');
    expect(block('‹```js\nx\n```›')).toBe('‹x›');
    expect(block('```js\n‹x›\n```')).toBe('‹x›');
    expect(block('‹```\n```›')).toBe('‹›');
  });

  it('`applyTool` : un nom de bouton → son outil, et rien pour un nom inconnu', () => {
    const e = ed('un ‹mot›\nici');
    for (const name of Object.keys(INLINE))
      expect(applyTool(e, name)).toEqual(toggleInline(e, INLINE[name]));
    for (const name of Object.keys(LINE)) expect(applyTool(e, name)).toEqual(toggleLine(e, name));
    expect(tool('‹x›', 'codeblock')).toBe('```\n‹x›\n```');
    expect(tool('‹x›', 'inconnu')).toBe('‹x›');
    expect(tool('‹x›', 'constructor')).toBe('‹x›');
  });
});

// ----------------------------------------------------------------- lien ------

describe('lien', () => {
  const link = (marked: string, url: string): string => {
    const before = ed(marked);
    const after = insertLink(before, url);
    seen.push([before.text, after.text]);
    return show(after);
  };

  it('la sélection devient le texte, l’adresse est celle qu’on donne', () => {
    const posed = link('voir ‹la note› ici', 'https://ex.com/note/');
    expect(posed).toBe('voir [la note](https://ex.com/note/)‹› ici');
    expect(renderDiscord(ed(posed).text)).toBe(
      '<div class="ln">voir <a href="https://ex.com/note/" target="_blank" rel="noopener noreferrer">la note</a> ici</div>',
    );
  });

  it('une sélection qui EST une adresse devient l’URL ; le texte reste à écrire', () => {
    expect(isUrl('https://ex.com/a?b=1')).toBe(true);
    expect(isUrl('voir https://ex.com')).toBe(false);
    expect(isUrl('ex.com')).toBe(false);
    expect(link('‹https://ex.com/a?b=1›', 'ignorée')).toBe('[‹›](https://ex.com/a?b=1)');
  });

  it('le curseur va là où il reste à écrire', () => {
    expect(link('a ‹› b', 'https://ex.com')).toBe('a [‹›](https://ex.com) b');
    expect(link('‹texte›', '')).toBe('[texte](‹›)');
    // L'invite rendue telle quelle, `https://` seul : pas d'adresse.
    expect(link('‹texte›', 'https://')).toBe('[texte](‹›)');
  });

  it('l’adresse est rendue écrivable : schéma, blancs, parenthèse fermante', () => {
    expect(link('‹x›', '  outerpedia.com/tools ')).toBe('[x](https://outerpedia.com/tools)‹›');
    expect(link('‹x›', 'http://ex.com/a b_(c)')).toBe('[x](http://ex.com/a%20b_(c%29)‹›');
    expect(renderDiscord('[x](http://ex.com/a%20b_(c%29)')).toContain(
      'href="http://ex.com/a%20b_(c%29"',
    );
    // Un texte pris sur deux lignes tient sur une.
    expect(link('‹un\n  deux›', 'https://ex.com')).toBe('[un deux](https://ex.com)‹›');
  });

  it('un second clic le défait : sur son texte, ou sur le lien entier', () => {
    const onLabel = ed('voir [‹la note›](https://ex.com/n) ici');
    const found = linkAt(onLabel);
    expect(found).toEqual({ from: 5, to: 32, label: 'la note' });
    expect(show(unlink(onLabel, found!))).toBe('voir ‹la note› ici');

    const whole = ed('voir ‹[la note](https://ex.com/n)› ici');
    expect(show(unlink(whole, linkAt(whole)!))).toBe('voir ‹la note› ici');

    // Le lien tout juste posé, curseur dans ses crochets vides.
    const empty = ed('[‹›](https://ex.com)');
    expect(show(unlink(empty, linkAt(empty)!))).toBe('‹›');

    expect(linkAt(ed('voir ‹la note› ici'))).toBeNull();
    expect(linkAt(ed('[‹a›] (pas un lien)'))).toBeNull();
  });
});

// ------------------------------------------------------------ raccourcis -----

describe('raccourcis', () => {
  it('Ctrl ou Cmd + B, I, U, K — seuls', () => {
    expect(shortcutTool({ key: 'b', ctrlKey: true })).toBe('bold');
    expect(shortcutTool({ key: 'I', ctrlKey: true })).toBe('italic');
    expect(shortcutTool({ key: 'u', metaKey: true })).toBe('underline');
    expect(shortcutTool({ key: 'k', ctrlKey: true })).toBe('link');
    expect(shortcutTool({ key: 'b' })).toBeNull();
    expect(shortcutTool({ key: 'z', ctrlKey: true })).toBeNull();
    // AltGr (Ctrl+Alt sous Windows) et Ctrl+Maj+I (outils du navigateur).
    expect(shortcutTool({ key: 'b', ctrlKey: true, altKey: true })).toBeNull();
    expect(shortcutTool({ key: 'I', ctrlKey: true, shiftKey: true })).toBeNull();
    expect(shortcutTool({ key: 'constructor', ctrlKey: true })).toBeNull();
  });
});

// ------------------------------------------------------------ annulation -----

describe('diffEdit — le remplacement donné à `execCommand`', () => {
  const apply = (before: string, after: string): string => {
    const d = diffEdit(before, after);
    return d ? before.slice(0, d.from) + d.insert + before.slice(d.to) : before;
  };

  it('le plus petit remplacement, ou rien', () => {
    expect(diffEdit('pareil', 'pareil')).toBeNull();
    expect(diffEdit('un mot ici', 'un **mot** ici')).toEqual({ from: 3, to: 6, insert: '**mot**' });
    expect(diffEdit('## Titre', 'Titre')).toEqual({ from: 0, to: 3, insert: '' });
    expect(diffEdit('', ':star: ')).toEqual({ from: 0, to: 0, insert: ':star: ' });
    expect(diffEdit('aaa', 'aa')).toEqual({ from: 2, to: 3, insert: '' });
    expect(diffEdit('aa', 'aaa')).toEqual({ from: 2, to: 2, insert: 'a' });
  });

  it('ne coupe jamais un emoji en deux', () => {
    // 😀 et 😁 partagent leur première unité, 😀 et U+1FA00 leur seconde.
    expect(diffEdit('a😀b', 'a😁b')).toEqual({ from: 1, to: 3, insert: '😁' });
    expect(diffEdit('a\u{1F600}b', 'a\u{1FA00}b')).toEqual({ from: 1, to: 3, insert: '\u{1FA00}' });
    expect(apply('😀😀', '😀')).toBe('😀');
  });

  it('mène bien du texte d’avant au texte d’après, pour chaque outil joué plus haut', () => {
    expect(seen.length).toBeGreaterThan(80);
    for (const [before, after] of seen) expect(apply(before, after)).toBe(after);
  });
});

// --------------------------------------------------------------- emojis ------

describe('emojis — filtre du sélecteur et de l’autocomplétion', () => {
  const guild = [
    { name: 'dark', id: '300000000000000001', animated: false },
    { name: 'Starfall', id: '300000000000000002', animated: true },
    { name: 'allstar', id: '300000000000000003', animated: false },
    { name: 'scroll', id: '300000000000000004', animated: false },
  ];
  const standard = [
    { name: 'scroll', char: '📜' },
    { name: 'star2', char: '🌟' },
    { name: 'star', char: '⭐' },
    { name: 'star_struck', char: '🤩' },
    { name: 'dizzy', char: '💫' },
    { name: 'mustard', char: '🌭' },
  ];
  const lists = { guild, standard };
  const names = (list: { name: string }[]): string[] => list.map((e) => e.name);

  it('dans une liste : le nom exact, puis le préfixe, puis la sous-chaîne', () => {
    expect(names(matchEmojis(standard, 'star'))).toEqual([
      'star',
      'star2',
      'star_struck',
      'mustard',
    ]);
    expect(names(matchEmojis(standard, '  STAR '))).toEqual(names(matchEmojis(standard, 'star')));
    expect(matchEmojis(standard, 'qq')).toEqual([]);
    // Sans recherche : la liste telle quelle (une copie).
    expect(matchEmojis(standard, '')).toEqual(standard);
    expect(matchEmojis(standard, '')).not.toBe(standard);
  });

  it('le serveur d’abord, puis les standards — sans égard à la casse', () => {
    expect(names(searchEmojis(lists, 'star'))).toEqual([
      'Starfall',
      'allstar',
      'star',
      'star2',
      'star_struck',
      'mustard',
    ]);
    // Même nom des deux côtés : celui du serveur passe devant, comme à l'envoi.
    expect(searchEmojis(lists, 'scroll')).toEqual([guild[3], standard[0]]);
    expect(names(searchEmojis(lists, 'st', [], 3))).toEqual(['Starfall', 'allstar', 'star2']);
  });

  it('à égalité, les derniers utilisés d’abord', () => {
    expect(names(matchEmojis(standard, 'sta', ['star_struck', 'star2']))).toEqual([
      'star_struck',
      'star2',
      'star',
      'mustard',
    ]);
    // Un récent ne passe ni devant un meilleur accord, ni devant le serveur.
    expect(names(searchEmojis(lists, 'star', ['mustard', 'star2']))).toEqual([
      'Starfall',
      'allstar',
      'star',
      'star2',
      'star_struck',
      'mustard',
    ]);
  });

  it('les récents : ceux qui existent encore, le serveur l’emportant', () => {
    expect(recentEmojis(lists, ['star', 'parti', 'scroll', 'dark'])).toEqual([
      standard[2],
      guild[3],
      guild[0],
    ]);
    expect(recentEmojis(lists, [])).toEqual([]);
  });

  it('`pushRecent` : en tête, sans doublon, dix au plus', () => {
    expect(pushRecent(['a', 'b', 'c'], 'b')).toEqual(['b', 'a', 'c']);
    expect(pushRecent([], 'a')).toEqual(['a']);
    const full = Array.from({ length: RECENT_MAX }, (_, i) => `e${i}`);
    expect(RECENT_MAX).toBe(10);
    expect(pushRecent(full, 'neuf')).toEqual(['neuf', ...full.slice(0, 9)]);
  });
});

describe('emojis — plusieurs serveurs cochés', () => {
  const eva = {
    id: '100000000000000001',
    name: 'EvaMains',
    emojis: [
      { name: 'dark', id: '300000000000000001', animated: false },
      { name: 'party', id: '300000000000000003', animated: true },
    ],
  };
  const home = {
    id: '100000000000000002',
    name: 'Chez Sevih',
    emojis: [
      { name: 'dark', id: '300000000000000011', animated: false },
      { name: 'Tactician', id: '300000000000000012', animated: false },
    ],
  };
  const standard = [
    { name: 'scroll', char: '📜' },
    { name: 'star', char: '⭐' },
    { name: 'party_popper', char: '🎉' },
  ];
  const ids = (list: { id?: string }[]): (string | undefined)[] => list.map((e) => e.id);

  it('réunis dans l’ordre des serveurs, chacun marqué du sien ; un nom en double, le premier gagne', () => {
    expect(mergeGuildEmojis([eva, home])).toEqual([
      { ...eva.emojis[0], guildId: eva.id },
      { ...eva.emojis[1], guildId: eva.id },
      // Le `dark` du second serveur ne pourrait pas s'écrire : il n'est pas proposé.
      { ...home.emojis[1], guildId: home.id },
    ]);
    expect(ids(mergeGuildEmojis([home, eva]))).toEqual([
      '300000000000000011',
      '300000000000000012',
      '300000000000000003',
    ]);
    // Serveur décoché : ses emojis ne sont plus là. Aucun serveur : rien.
    expect(ids(mergeGuildEmojis([home]))).toEqual(['300000000000000011', '300000000000000012']);
    expect(mergeGuildEmojis([])).toEqual([]);
  });

  const lists = { guild: mergeGuildEmojis([eva, home]), standard };
  const guilds = [eva, home];
  const shape = (sections: ReturnType<typeof pickerSections>) =>
    sections.map((s) => [s.key, s.title, s.items.map((e) => e.name), Boolean(s.folded)]);

  it('le sélecteur : une section par serveur, et les standards ABSENTS de la grille par défaut', () => {
    expect(shape(pickerSections(lists, guilds, '', [], false))).toEqual([
      [`guild:${eva.id}`, 'EvaMains', ['dark', 'party'], false],
      [`guild:${home.id}`, 'Chez Sevih', ['Tactician'], false],
      // Repliée : aucun des standards n'est déroulé.
      ['standard', 'Standards', [], true],
    ]);
  });

  it('les récents d’abord ; la section des standards se déplie, et le reste', () => {
    expect(shape(pickerSections(lists, guilds, '', ['star', 'Tactician', 'gone'], true))).toEqual([
      ['recent', 'Récents', ['star', 'Tactician'], false],
      [`guild:${eva.id}`, 'EvaMains', ['dark', 'party'], false],
      [`guild:${home.id}`, 'Chez Sevih', ['Tactician'], false],
      ['standard', 'Standards', ['scroll', 'star', 'party_popper'], false],
    ]);
  });

  it('une recherche trouve les standards, section repliée ou non — serveurs d’abord, sans les récents', () => {
    for (const open of [false, true])
      expect(shape(pickerSections(lists, guilds, 'part', ['star'], open))).toEqual([
        [`guild:${eva.id}`, 'EvaMains', ['party'], false],
        [`guild:${home.id}`, 'Chez Sevih', [], false],
        ['standard', 'Standards', ['party_popper'], false],
      ]);
  });

  it('l’autocomplétion propose toujours les standards', () => {
    expect(searchEmojis(lists, 'sc', [], 8)).toEqual([standard[0]]);
    expect(searchEmojis(lists, 'pa', [], 8).map((e) => e.name)).toEqual(['party', 'party_popper']);
  });

  it('aucun serveur coché : il ne reste que les standards', () => {
    const none = { guild: mergeGuildEmojis([]), standard };
    expect(shape(pickerSections(none, [], '', [], false))).toEqual([
      ['standard', 'Standards', [], true],
    ]);
    expect(searchEmojis(none, 'da', [], 8)).toEqual([]);
    expect(searchEmojis(none, 'st', [], 8)).toEqual([standard[1]]);
  });
});

describe('palette — les emojis toujours sous la main', () => {
  const guild = mergeGuildEmojis([
    {
      id: '100000000000000002',
      name: 'Chez Sevih',
      emojis: [
        { name: 'dark', id: '300000000000000011', animated: false },
        { name: 'Striker', id: '300000000000000013', animated: false },
        { name: 'star', id: '300000000000000014', animated: false },
      ],
    },
  ]);
  const standard = [
    { name: 'scroll', char: '📜' },
    { name: 'star', char: '⭐' },
    { name: 'fire', char: '🔥' },
  ];
  const groups = [
    { label: 'Éléments', names: ['fire', 'water', 'dark'] },
    { label: 'Classes', names: ['striker', 'defender'] },
    { label: 'Sous-classes', names: ['sweeper', 'wizard'] },
    { label: 'Génériques', names: ['scroll', 'star'] },
  ];

  it('chaque groupe garde ses noms dans l’ordre ; un serveur coché passe devant un standard, à la casse près', () => {
    const palette = resolvePalette(groups, { guild, standard });
    expect(palette.groups.map((g) => [g.label, g.items.map((e) => e.id ?? e.char)])).toEqual([
      ['Éléments', ['🔥', '300000000000000011']],
      // `striker` désigne l'emoji `Striker` du serveur.
      ['Classes', ['300000000000000013']],
      // `star` existe des deux côtés : celui du serveur, comme à l'envoi.
      ['Génériques', ['📜', '300000000000000014']],
    ]);
  });

  it('un nom que rien ne porte est LISTÉ, pas proposé — et un groupe sans bouton tombe', () => {
    const palette = resolvePalette(groups, { guild, standard });
    expect(palette.missing).toEqual(['water', 'defender', 'sweeper', 'wizard']);
    const offered = palette.groups.flatMap((g) => g.items.map((e) => e.name.toLowerCase()));
    for (const name of palette.missing) expect(offered).not.toContain(name);
    expect(palette.groups.map((g) => g.label)).not.toContain('Sous-classes');
  });

  it('sans emoji de serveur (jeton absent, rien de coché) : les standards seuls', () => {
    const palette = resolvePalette(groups, { guild: [], standard });
    expect(palette.groups.map((g) => [g.label, g.items.map((e) => e.name)])).toEqual([
      ['Éléments', ['fire']],
      ['Génériques', ['scroll', 'star']],
    ]);
    expect(palette.missing).toEqual(['water', 'dark', 'striker', 'defender', 'sweeper', 'wizard']);
    expect(resolvePalette([], { guild, standard })).toEqual({ groups: [], missing: [] });
  });

  it('un clic insère `:nom: ` au curseur — le nom que porte le serveur, et l’aperçu le rend', () => {
    const [, classes] = resolvePalette(groups, { guild, standard }).groups;
    const after = insertEmoji(ed('## ‹›Banners'), classes.items[0].name);
    expect(show(after)).toBe('## :Striker: ‹›Banners');
    // À la place de la sélection, sans doubler l'espace qui suit.
    const [elements] = resolvePalette(groups, { guild, standard }).groups;
    expect(show(insertEmoji(ed('a ‹ici› b'), elements.items[1].name))).toBe('a :dark: ‹›b');
  });
});

describe('emojis — le `:xx` à compléter', () => {
  /** `'un :sc‹›'` → ce que l'autocomplétion y voit. */
  const at = (marked: string): ReturnType<typeof emojiQueryAt> => {
    const e = ed(marked);
    return emojiQueryAt(e.text, e.start);
  };

  it('s’ouvre à `:` suivi de deux lettres, curseur au bout', () => {
    expect(at(':sc‹›')).toEqual({ from: 0, query: 'sc' });
    expect(at('## :scr‹›')).toEqual({ from: 3, query: 'scr' });
    expect(at('- **:star_s‹›')).toEqual({ from: 4, query: 'star_s' });
    expect(at(':star: :fi‹›')).toEqual({ from: 7, query: 'fi' });
    expect(at(':star::fi‹›')).toEqual({ from: 6, query: 'fi' });
    expect(at('ligne\n:da‹› suite')).toEqual({ from: 6, query: 'da' });
  });

  it('pas avant deux lettres, ni sur des chiffres', () => {
    expect(at(':‹›')).toBeNull();
    expect(at(':s‹›')).toBeNull();
    expect(at('sc‹›')).toBeNull();
    expect(at('10:30‹›')).toBeNull();
    expect(at(' :10‹›')).toBeNull();
  });

  it('pas collé à un mot, ni derrière un code déjà fermé', () => {
    expect(at('Note:ab‹›')).toBeNull();
    expect(at('10:am‹›')).toBeNull();
    expect(at(':scroll:ab‹›')).toBeNull();
    expect(at(':scroll:‹›')).toBeNull();
  });

  it('pas au milieu d’un nom, fermé ou non', () => {
    expect(at(':sc‹›roll:')).toBeNull();
    expect(at(':sc‹›roll')).toBeNull();
    expect(at(':sc‹›:')).toBeNull();
  });

  it('pas dans une adresse', () => {
    expect(at('https://ex.com/:id‹›')).toBeNull();
    expect(at('[note](https://ex.com/a/:ab‹›')).toBeNull();
    // L'adresse finie, on complète de nouveau.
    expect(at('https://ex.com/a :ab‹›')).toEqual({ from: 17, query: 'ab' });
  });

  it('pas dans du code, en ligne ou en bloc', () => {
    expect(at('`a :sc‹›')).toBeNull();
    expect(at('`a` :sc‹›')).toEqual({ from: 4, query: 'sc' });
    expect(at('```\n:sc‹›')).toBeNull();
    expect(at('```\nx\n```\n:sc‹›')).toEqual({ from: 10, query: 'sc' });
  });
});

describe('emojis — insertion', () => {
  it('au curseur : `:nom:` et une espace', () => {
    expect(show(insertEmoji(ed('a ‹›b'), 'star'))).toBe('a :star: ‹›b');
    expect(show(insertEmoji(ed('‹›'), 'dark'))).toBe(':dark: ‹›');
    // À la place de la sélection.
    expect(show(insertEmoji(ed('a ‹ici› b'), 'star'))).toBe('a :star: ‹›b');
  });

  it('en complétion : à la place du `:sc` tapé', () => {
    const e = ed('## :sc‹›\nsuite');
    const q = emojiQueryAt(e.text, e.start)!;
    expect(show(insertEmoji(e, 'scroll', q.from))).toBe('## :scroll: ‹›\nsuite');
  });

  it('une espace déjà là n’est pas doublée', () => {
    expect(show(insertEmoji(ed('## :st‹› Banners'), 'star', 3))).toBe('## :star: ‹›Banners');
  });
});

// ---------------------------------------------------------- horodatages ------

/** Le 10 octobre 2026 à minuit UTC. */
const OCT_10 = 1791590400;
/** Une horloge fixée : l'aperçu ne lit ni l'heure ni le fuseau de la machine. */
const CLOCK = { now: OCT_10 * 1000, timeZone: 'UTC', locale: 'en-GB' };

describe('horodatages — une date UTC → un instant Unix', () => {
  it('UTC strict : la date et l’heure de la note, sans fuseau de la machine', () => {
    expect(utcToUnix('2026-10-10')).toBe(OCT_10);
    expect(utcToUnix('2026-10-10', '00:00')).toBe(OCT_10);
    expect(utcToUnix('2026-10-06', '06:30')).toBe(Date.UTC(2026, 9, 6, 6, 30) / 1000);
    expect(utcToUnix('2026-12-31', '23:59')).toBe(Date.UTC(2026, 11, 31, 23, 59) / 1000);
    // Avant 1970 : un instant négatif, que Discord accepte.
    expect(utcToUnix('1969-12-31', '23:59')).toBe(-60);
    // Le 29 février n'existe que les années bissextiles.
    expect(utcToUnix('2028-02-29')).toBe(Date.UTC(2028, 1, 29) / 1000);
  });

  it.each([
    ['2026-02-30', '00:00', 'le 30 février'],
    ['2026-02-29', '00:00', 'le 29 février d’une année ordinaire'],
    ['2026-04-31', '00:00', 'le 31 avril'],
    ['2026-13-01', '00:00', 'le mois 13'],
    ['2026-00-10', '00:00', 'le mois 0'],
    ['2026-10-00', '00:00', 'le jour 0'],
    ['2026-10-10', '24:00', '24 heures'],
    ['2026-10-10', '12:60', '60 minutes'],
    ['2026-10-10', '6:30', 'une heure à un chiffre'],
    ['2026-1-5', '00:00', 'une date mal écrite'],
    ['10/10/2026', '00:00', 'une date dans un autre ordre'],
    ['', '00:00', 'rien'],
    ['0050-01-01', '00:00', 'une année que `Date.UTC` lirait 1950'],
  ])('refuse %s %s — %s', (date, time) => {
    expect(utcToUnix(date, time)).toBeNull();
  });

  it('la sélection qui EST une date préremplit le formulaire, blancs de bord exclus', () => {
    expect(dateAt(ed('le ‹2026-10-06› à'))).toEqual({
      date: '2026-10-06',
      time: '00:00',
      start: 3,
      end: 13,
    });
    expect(dateAt(ed('‹2026-10-06 06:30›'))).toMatchObject({ date: '2026-10-06', time: '06:30' });
    expect(dateAt(ed('‹2026-10-06 06:30 UTC›'))).toMatchObject({
      time: '06:30',
      start: 0,
      end: 20,
    });
    expect(dateAt(ed('‹2026-10-06 UTC›'))).toMatchObject({ date: '2026-10-06', time: '00:00' });
    // Sélection débordant d'une espace de chaque côté : seule la date sera remplacée.
    expect(dateAt(ed('le‹ 2026-10-06 06:30 ›à'))).toEqual({
      date: '2026-10-06',
      time: '06:30',
      start: 3,
      end: 19,
    });
    // Une date impossible reste une date : c'est le formulaire qui la refusera.
    expect(dateAt(ed('‹2026-02-30›'))).toMatchObject({ date: '2026-02-30' });
    for (const other of ['‹›', '‹demain›', '‹2026-10-06 à 6 h›', '‹le 2026-10-06›', '‹06:30›'])
      expect(dateAt(ed(other)), other).toBeNull();
  });

  it('insère `<t:instant:format>` au curseur, ou à la place de la sélection', () => {
    expect(show(insertTimestamp(ed('Pickup: ‹›'), OCT_10, 'F'))).toBe(`Pickup: <t:${OCT_10}:F>‹›`);
    expect(show(insertTimestamp(ed('le ‹2026-10-10› à'), OCT_10))).toBe(`le <t:${OCT_10}:f>‹› à`);
    // De la sélection au résultat : la date choisie dans le texte devient l'horodatage.
    const e = ed('Ends ‹2026-10-10 00:00 UTC›.');
    const found = dateAt(e)!;
    const unix = utcToUnix(found.date, found.time)!;
    expect(show(insertTimestamp({ ...e, start: found.start, end: found.end }, unix, 'R'))).toBe(
      `Ends <t:${OCT_10}:R>‹›.`,
    );
  });

  it('les six formats du formulaire sont ceux que l’aperçu sait rendre, `f` compris', () => {
    expect(TIMESTAMP_STYLES.map(([style]) => style)).toEqual(['d', 'D', 't', 'f', 'F', 'R']);
    for (const [style, label] of TIMESTAMP_STYLES) {
      expect(label).not.toBe('');
      expect(formatTimestamp(OCT_10, style, CLOCK), style).not.toBeNull();
      expect(
        renderDiscord(insertTimestamp(ed('‹›'), OCT_10, style).text, { clock: CLOCK }),
      ).toMatch(
        /^<div class="ln"><span class="ts" title="2026-10-10T00:00:00.000Z">[^<]+<\/span><\/div>$/,
      );
    }
  });
});

describe('horodatages — « convertir les dates »', () => {
  const convert = (marked: string) => {
    const r = convertDates(ed(marked));
    return { text: show(r.edit), count: r.count, invalid: r.invalid };
  };

  it('remplace chaque `AAAA-MM-JJ HH:MM UTC` par `<t:…:f>`, et dit combien', () => {
    const draft = [
      '- Pickup: 2026-10-10 00:00 UTC ~ 2026-10-27 03:59 UTC',
      '- Maintenance (2026-10-06 06:30 UTC)‹›',
    ].join('\n');
    const end = Date.UTC(2026, 9, 27, 3, 59) / 1000;
    const maintenance = Date.UTC(2026, 9, 6, 6, 30) / 1000;
    expect(convert(draft)).toEqual({
      text: [
        `- Pickup: <t:${OCT_10}:f> ~ <t:${end}:f>`,
        `- Maintenance (<t:${maintenance}:f>)‹›`,
      ].join('\n'),
      count: 3,
      invalid: [],
    });
  });

  it('le suffixe ` UTC` est EXIGÉ : rien d’autre n’est converti', () => {
    for (const kept of [
      '‹›2026-10-10 00:00',
      '‹›2026-10-10',
      '‹›2026-10-10 00:00 CEST',
      '‹›2026-10-10 00:00 UTC+2',
      '‹›2026-10-10 00:00 UTC-5',
      '‹›2026-10-10 00:00UTC',
      '‹›2026-10-10T00:00 UTC',
      '‹›10/10/2026 00:00 UTC',
      '‹›12026-10-10 00:00 UTC',
      '‹›2026-10-10 00:00 UTCX',
    ])
      expect(convert(kept), kept).toEqual({ text: kept, count: 0, invalid: [] });
    // La ponctuation qui suit ne gêne pas.
    expect(convert('‹›(2026-10-10 00:00 UTC).').text).toBe(`‹›(<t:${OCT_10}:f>).`);
    expect(convert('‹›2026-10-10 00:00 UTC - end').text).toBe(`‹›<t:${OCT_10}:f> - end`);
  });

  it('une date qui n’existe pas est laissée, et nommée', () => {
    expect(
      convert('‹›2026-02-30 10:00 UTC puis 2026-10-10 00:00 UTC, 2026-10-10 24:00 UTC'),
    ).toEqual({
      text: `‹›2026-02-30 10:00 UTC puis <t:${OCT_10}:f>, 2026-10-10 24:00 UTC`,
      count: 1,
      invalid: ['2026-02-30 10:00 UTC', '2026-10-10 24:00 UTC'],
    });
  });

  it('rien n’est converti dans du code : Discord n’y rend pas un horodatage', () => {
    const text = [
      '`2026-10-10 00:00 UTC`',
      '```',
      '2026-10-10 00:00 UTC',
      '```',
      '2026-10-10 00:00 UTC‹›',
    ].join('\n');
    expect(convert(text)).toEqual({
      text: text.replace('2026-10-10 00:00 UTC‹›', `<t:${OCT_10}:f>‹›`),
      count: 1,
      invalid: [],
    });
  });

  it('la sélection suit son texte ; prise dans une date, elle vient au bout de l’horodatage', () => {
    expect(convert('a 2026-10-10 00:00 UTC ‹mot› 2026-10-10 00:00 UTC z').text).toBe(
      `a <t:${OCT_10}:f> ‹mot› <t:${OCT_10}:f> z`,
    );
    expect(convert('‹a› 2026-10-10 00:00 UTC').text).toBe(`‹a› <t:${OCT_10}:f>`);
    expect(convert('2026-10-‹10 00›:00 UTC z').text).toBe(`<t:${OCT_10}:f>‹› z`);
    expect(convert('‹2026-10-10 00:00 UTC›').text).toBe(`‹<t:${OCT_10}:f>›`);
  });

  it('ce qui est converti se voit dans l’aperçu, et un second clic ne change plus rien', () => {
    const once = convertDates(ed('Ends 2026-10-10 00:00 UTC‹›'));
    expect(renderDiscord(once.edit.text, { clock: CLOCK })).toBe(
      `<div class="ln">Ends <span class="ts" title="2026-10-10T00:00:00.000Z">${formatTimestamp(OCT_10, 'f', CLOCK)}</span></div>`,
    );
    expect(diffEdit('Ends 2026-10-10 00:00 UTC', once.edit.text)).toEqual({
      from: 5,
      to: 25,
      insert: `<t:${OCT_10}:f>`,
    });
    expect(convertDates(once.edit)).toEqual({ edit: once.edit, count: 0, invalid: [] });
  });

  it('une date SANS heure devient une date seule, posée à midi UTC', () => {
    const r = convertDates({
      text: 'Bingo : 2026-10-06 UTC ~ 2026-10-20 23:59 UTC',
      start: 0,
      end: 0,
    });
    expect(r.count).toBe(2);
    // Midi UTC : le même jour de calendrier de UTC-12 à UTC+11.
    expect(r.edit.text).toBe(
      `Bingo : <t:${Date.UTC(2026, 9, 6, 12) / 1000}:D> ~ <t:${Date.UTC(2026, 9, 20, 23, 59) / 1000}:f>`,
    );
    // Sans le suffixe, une date nue reste du texte ; dans du code aussi.
    expect(convertDates({ text: '2026-10-06 et `2026-10-06 UTC`', start: 0, end: 0 }).count).toBe(
      0,
    );
    expect(convertDates({ text: '2026-02-30 UTC', start: 0, end: 0 }).invalid).toEqual([
      '2026-02-30 UTC',
    ]);
  });
});
