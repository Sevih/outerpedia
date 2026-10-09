/**
 * Les locales n'hébergent QUE des clés consommées — fin du pré-seed hérité.
 *
 * Historique : les 5 fichiers de langue ont été transplantés AVANT le
 * portage des pages, chaque namespace attendant sa page (« pré-seed », tracé
 * dans TODO § Pages manquantes). Le portage étant terminé (bascule du 21/07),
 * une clé sans consommateur redevient un SIGNAL : vestige à purger, ou
 * faute de frappe entre le code et la locale.
 *
 * Deux gardes, et ce sont les SEULES : l'ordre des clés, les commentaires et
 * les numéros de ligne ne sont ni alignés entre langues ni vérifiés ici
 * (prettier replie les chaînes longues différemment selon la langue) :
 *   1. clés identiques dans toutes les langues (une clé ajoutée dans une
 *      seule langue rendrait sa traduction silencieusement impossible) ;
 *   2. chaque clé EN est consommée quelque part — en littéral, ou via un
 *      PRÉFIXE DYNAMIQUE détecté dans le code (`t(\`tools.\${slug}\`)`,
 *      `'guides.' + x`…). Les préfixes sont EXTRAITS du source, pas déclarés à
 *      la main : un refactor qui supprime le consommateur dynamique ré-expose
 *      ses clés au test.
 */
import { readdirSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { LANGUAGES } from '@/lib/i18n/config';
import en from './en';
import jp from './jp';
import kr from './kr';
import zh from './zh';

const LOCALES_DIR = resolve(__dirname);
const LANGS = Object.keys(LANGUAGES);

function keysOf(lang: string): string[] {
  const src = readFileSync(join(LOCALES_DIR, `${lang}.ts`), 'utf8');
  return [...src.matchAll(/^\s*'([^']+)':/gm)].map((m) => m[1]);
}

/** Tout le code susceptible de consommer une clé (src + datagen, locales exclues). */
function sourceCorpus(): string {
  let out = '';
  const walk = (dir: string): void => {
    for (const e of readdirSync(dir, { withFileTypes: true })) {
      const p = join(dir, e.name);
      if (e.isDirectory()) {
        if (!p.includes('locales') && !e.name.startsWith('.')) walk(p);
      } else if (/\.(ts|tsx)$/.test(e.name) && !e.name.endsWith('.test.ts')) {
        out += readFileSync(p, 'utf8');
      }
    }
  };
  walk(resolve(LOCALES_DIR, '../..')); // src/
  walk(resolve(LOCALES_DIR, '../../../datagen'));
  return out;
}

describe('locales — contrat des clés', () => {
  const enKeys = keysOf('en');

  it('toutes les langues portent EXACTEMENT les mêmes clés', () => {
    const ref = new Set(enKeys);
    for (const lang of LANGS) {
      if (lang === 'en') continue;
      const keys = keysOf(lang);
      const missing = enKeys.filter((k) => !keys.includes(k));
      const extra = keys.filter((k) => !ref.has(k));
      expect(missing, `${lang} : clés absentes`).toEqual([]);
      expect(extra, `${lang} : clés en trop`).toEqual([]);
    }
  });

  it('chaque clé a un consommateur (littéral ou préfixe dynamique du code)', () => {
    const corpus = sourceCorpus();
    // Préfixes dynamiques réels : segment de template `xxx${` ou concat `'xxx' +`.
    // AUCUNE contrainte sur le caractère final du préfixe : exiger un point a
    // fait purger à tort `page.character.skill.target_mono` & co (consommées
    // via `target_${key}` — préfixe en underscore). Un préfixe doit juste
    // contenir un point pour compter (sinon `Lv.`-like trop courts matchent tout).
    const dynamic = new Set<string>(
      [
        ...[...corpus.matchAll(/`([a-z][a-z0-9_.-]*)\$\{/gi)].map((m) => m[1]),
        ...[...corpus.matchAll(/'([a-z][a-z0-9_.-]*)'\s*\+/gi)].map((m) => m[1]),
      ].filter((p) => p.includes('.')),
    );
    const dead = enKeys.filter(
      (k) =>
        !corpus.includes(`'${k}'`) &&
        !corpus.includes(`"${k}"`) &&
        !corpus.includes(`\`${k}\``) &&
        ![...dynamic].some((p) => k.startsWith(p)),
    );
    expect(dead, 'clés sans consommateur (vestige à purger, ou typo)').toEqual([]);
  });
});

/**
 * Le test de parité ci-dessus ne voit pas une VALEUR restée en anglais : une
 * clé copiée sans être traduite a bien sa place dans chaque langue. En
 * japonais, coréen et chinois, du texte latin identique à l'anglais est un
 * signal fiable (en français et en espagnol, trop de mots s'écrivent pareil —
 * « Guides », « Type », « Source » — pour en faire une règle).
 *
 * Deux listes, tenues EXACTES (une entrée traduite doit en sortir) :
 *   - IDENTICAL_OK : sigles du wiki, marques, URL — identiques par nature ;
 *   - TO_TRANSLATE : restes relevés par l'audit docs/audit-langues-liens.md.
 */
const IDENTICAL_OK: Record<string, string> = {
  'page.equipment.title_suffix': 'jp,kr,zh',
  'tools.damage-calculator.target.lv_prefix': 'jp,kr,zh',
  'tools.damage-calculator.stat.HP': 'jp,kr',
  'tools.damage-calculator.stat.ATK': 'jp,kr',
  'tools.damage-calculator.stat.DEF': 'jp,kr',
  'tools.damage-calculator.stat.SPD': 'jp,kr',
  'tools.damage-calculator.stat.CHC': 'jp,kr',
  'tools.damage-calculator.stat.CHD': 'jp,kr',
  'tools.damage-calculator.stat.EFF': 'jp,kr',
  'tools.damage-calculator.stat.RES': 'jp,kr',
  'tools.damage-calculator.stat.PEN': 'jp,kr',
  'tools.damage-calculator.stat.DR': 'jp,kr',
  'tools.damage-calculator.stat.DMG_INC': 'jp,kr',
  'tools.damage-calculator.equipment.ee': 'jp,kr',
  'tools.damage-calculator.equipment.cf': 'jp,kr',
  'tools.damage-calculator.equipment.passive_lv0': 'jp,kr,zh',
  'tools.damage-calculator.equipment.passive_lv10': 'jp,kr,zh',
  'tools.damage-calculator.attacker.tag_dmg': 'jp,kr,zh',
  'footer.social.github': 'jp,kr,zh',
  'footer.social.evamains_discord': 'jp,kr,zh',
  'footer.social.reddit': 'jp,kr,zh',
  'footer.social.youtube': 'jp,kr,zh',
  'footer.social.rss': 'jp,kr,zh',
  'filters.roles.dps': 'jp,kr',
  'page.character.skill.level': 'jp,kr,zh',
  'page.character.skill.cooldown': 'zh',
  'wallpapers.cat.Outerpedia': 'jp,kr,zh',
  'comics.credit': 'jp,kr,zh',
  'tools.patch-history.era.smilegate': 'kr',
  'link.officialwebsite': 'zh',
};
const TO_TRANSLATE: Record<string, string> = {
  'equip.detail.minmax': 'jp,kr,zh',
};

describe('locales — valeurs restées en anglais (jp, kr, zh)', () => {
  it('aucune valeur latine identique à l’anglais hors des deux listes', () => {
    const cjk = { jp, kr, zh } as Record<string, Record<string, string>>;
    const found: Record<string, string> = {};
    for (const [key, value] of Object.entries(en as Record<string, string>)) {
      // Les variables `{x}` ne comptent pas : « {start} — {end} » n'a rien à traduire.
      if (!/[A-Za-z]{2,}/.test(value.replace(/\{[^}]*\}/g, ''))) continue;
      const langs = Object.keys(cjk).filter((l) => cjk[l][key] === value);
      if (langs.length) found[key] = langs.join(',');
    }
    expect(found).toEqual({ ...IDENTICAL_OK, ...TO_TRANSLATE });
  });
});
