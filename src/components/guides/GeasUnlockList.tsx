/**
 * LES GEAS D'UN SOUS-BOSS — la table de déblocage, et rien qu'elle.
 *
 * Chaque palier de kills (`stage_N`) débloque une paire : un BONUS de score et un
 * MALUS. La nature se lit sur le SIGNE de `points` (cf. `isBonusGeas`), jamais sur
 * le flag `positive`. Le composant ne fait que RENDRE une table déjà dérivée (cf.
 * `geasUnlockTable`) — il ne connaît ni combat ni saison, on lui passe les paliers.
 *
 * Rendu d'une icône : le CADRE de fond porte le grade (`GD_Slot_Bg_0{grade}`), le
 * glyphe (`GD_Geis_*`) est TEINTÉ buff/debuff exactement comme les chips d'effet
 * des skills de monstres (`TintedIcon`). Composant SERVEUR.
 */
import type { GuildRaidGeas } from '@contracts';
import { img } from '@/lib/images';
import { lRec } from '@/lib/i18n/localize';
import type { TFunction } from '@/i18n';
import type { Lang } from '@/lib/i18n/config';
import { TintedIcon } from '@/components/character/EffectChips';
import { isBonusGeas, resolveGeas, type GeasRef, type GeasUnlock } from '@/lib/data/geas';

/** Score signé lisible : `points` est per-mille (−700 = −70 %). */
function formatPoints(points: number): string {
  const pct = points / 10;
  return `${pct > 0 ? '+' : ''}${pct}%`;
}

/** Le texte du jeu peut porter des sauts de ligne échappés (`\n` littéral). */
function descLines(text: string): string[] {
  return text.split(/\\n|\n/).filter(Boolean);
}

/** Icône d'un geas : cadre de grade + glyphe teinté par sa nature (points). */
function GeasIcon({ geas, size = 44 }: { geas: GuildRaidGeas; size?: number }) {
  return (
    <span className="relative inline-block shrink-0" style={{ width: size, height: size }}>
      <img
        src={img.geasFrame(geas.grade)}
        alt=""
        className="absolute inset-0 h-full w-full object-contain"
      />
      {geas.icon && (
        <span className="absolute inset-[4.5%]">
          {/* Teinte = NATURE du geas comme en jeu : aide (positive) en bleu,
              handicap en rouge — indépendant du signe des points (le score). */}
          <TintedIcon
            src={img.geas(geas.icon)}
            isDebuff={!geas.positive}
            className="h-full w-full"
          />
        </span>
      )}
      {/* Label sur sprite SOMBRE fixe (les deux thèmes) → couleur claire figée en
          style inline : les tokens de thème s'inverseraient et deviendraient
          illisibles sur le cadre. */}
      <span
        style={{ color: '#fff', textShadow: '0 1px 2px #000' }}
        className="absolute bottom-0 left-1/2 -translate-x-1/2 text-[8px] font-bold"
      >
        Lv.{geas.grade}
      </span>
    </span>
  );
}

/** Une case de geas : icône + description + score (couleur = signe des points). */
function GeasCell({ entry, lang }: { entry?: GeasRef; lang: Lang }) {
  if (!entry) return null;
  const { geas } = entry;
  const bonus = isBonusGeas(geas);
  return (
    <div className="flex items-start gap-2">
      <GeasIcon geas={geas} />
      <p className="text-content-muted min-w-0 flex-1 text-xs leading-snug">
        {descLines(lRec(geas.desc, lang) || geas.desc.en).map((line, i) => (
          <span key={i} className="block">
            {line}
          </span>
        ))}
      </p>
      <span className={`shrink-0 text-xs font-bold ${bonus ? 'text-buff' : 'text-debuff'}`}>
        {formatPoints(geas.points)}
      </span>
    </div>
  );
}

export function GeasUnlockList({
  unlocks,
  lang,
  t,
}: {
  unlocks: GeasUnlock[];
  lang: Lang;
  t: TFunction;
}) {
  if (!unlocks.length) return null;
  return (
    <section className="space-y-2">
      <h2 className="text-content-strong text-xl font-bold">{t('guildraid.geas')}</h2>
      <div className="border-line-subtle bg-surface-raised space-y-2 rounded-lg border p-3">
        {unlocks.map((u) => (
          <div key={u.kill} className="flex items-start gap-3">
            {/* Badge de palier : le nombre de kills qui débloque la paire. */}
            <span className="bg-surface text-content-strong ring-line-subtle mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ring-1">
              {u.kill}
            </span>
            <div className="min-w-0 flex-1 space-y-1.5">
              <GeasCell entry={u.bonus} lang={lang} />
              <GeasCell entry={u.malus} lang={lang} />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/**
 * LES GEAS ACTIFS d'une équipe de phase 2 — une rangée compacte de pastilles.
 *
 * En phase 2 le boss principal n'a pas de table de déblocage : les geas sont
 * CHOISIS par l'équipe (le contenu déclare les ids activés). Chaque pastille est
 * colorée par sa nature (points) — de quoi lire d'un coup le score que l'équipe
 * s'impose. Bonus d'abord, malus ensuite.
 */
export function ActiveGeasRow({ geas, lang, t }: { geas: GeasRef[]; lang: Lang; t: TFunction }) {
  if (!geas.length) return null;
  const sorted = [...geas].sort((a, b) => b.geas.points - a.geas.points);
  return (
    <div className="space-y-1.5">
      <h4 className="text-content-strong text-sm font-semibold">{t('guildraid.active_geas')}</h4>
      <div className="flex flex-wrap gap-2">
        {sorted.map((r) => {
          const bonus = isBonusGeas(r.geas);
          return (
            <span
              key={r.id}
              title={lRec(r.geas.desc, lang) || r.geas.desc.en}
              className="border-line-subtle bg-surface-raised inline-flex items-center gap-1 rounded-full border py-0.5 pr-2 pl-0.5"
            >
              <GeasIcon geas={r.geas} size={24} />
              <span className={`text-[11px] font-bold ${bonus ? 'text-buff' : 'text-debuff'}`}>
                {formatPoints(r.geas.points)}
              </span>
            </span>
          );
        })}
      </div>
    </div>
  );
}

/** Une colonne de sous-boss pour la table combinée : portrait + table de déblocage. */
export interface GeasColumn {
  portraitSrc?: string;
  name: string;
  unlocks: GeasUnlock[];
}

/** Une case de la table combinée : icône, cochée (check bleu) si active, grisée sinon. */
function GeasTableCell({
  entry,
  active,
  mark,
  lang,
}: {
  entry?: GeasRef;
  active: boolean;
  /** `true` quand un ensemble actif est fourni : coche les actifs, grise le reste. */
  mark: boolean;
  lang: Lang;
}) {
  if (!entry) return <span aria-hidden className="h-10 w-10" />;
  const { geas } = entry;
  const desc = lRec(geas.desc, lang) || geas.desc.en;
  return (
    <span
      title={`${desc.replace(/\\n/g, ' ')} (${formatPoints(geas.points)})`}
      className={`relative inline-flex ${mark && !active ? 'opacity-30' : ''}`}
    >
      <GeasIcon geas={geas} size={40} />
      {mark && active && (
        <span className="absolute inset-0 flex items-center justify-center">
          <span
            style={{ textShadow: '0 1px 3px #000' }}
            className="text-buff-tint text-2xl leading-none font-black"
          >
            ✓
          </span>
        </span>
      )}
    </span>
  );
}

/** Portrait de boss en tête de colonne (carte + badge « BOSS »). */
function BossHead({ col }: { col: GeasColumn }) {
  if (!col.portraitSrc) return <div className="h-14" aria-hidden />;
  return (
    <div className="flex h-14 items-center justify-center">
      <span className="relative shrink-0">
        <img
          src={col.portraitSrc}
          alt={col.name}
          width={48}
          height={48}
          className="border-line-subtle h-12 w-12 rounded border object-cover"
        />
        <span
          style={{ color: '#fff' }}
          className="bg-debuff absolute top-0 left-0 rounded-br px-1 text-[7px] font-bold"
        >
          BOSS
        </span>
      </span>
    </div>
  );
}

/**
 * LA TABLE DE GEAS D'UNE ÉQUIPE (phase 2) — RÉSUMÉ visible + DÉTAIL repliable.
 *
 * Le résumé (toujours là) : le MULTIPLICATEUR de score en tête + une rangée de
 * pastilles des geas actifs. C'est ce qu'on lit à chaque coup d'œil.
 *
 * Le détail (dans un `<details>` natif, replié par défaut — donc SANS JS, on reste
 * server-side) : la table complète des paliers, disposition du JEU — les deux
 * sous-boss côte à côte, l'échelle de paliers (losanges reliés) au milieu, MALUS
 * à gauche / BONUS à droite par sous-boss. Les geas de l'équipe y sont COCHÉS
 * (check bleu), les autres grisés. Cette grille est IDENTIQUE d'une équipe à
 * l'autre (seuls les checks changent) : la déplier sous chaque équipe serait du
 * bruit — d'où le repli.
 */
export function GeasTable({
  left,
  right,
  activeIds,
  lang,
  t,
}: {
  left: GeasColumn;
  right: GeasColumn;
  /** Ids actifs (phase 2) → cochés ; le reste grisé. Absent = table de référence. */
  activeIds?: string[];
  lang: Lang;
  t: TFunction;
}) {
  const active = new Set(activeIds ?? []);
  const mark = activeIds !== undefined;
  const levels = [...new Set([...left.unlocks, ...right.unlocks].map((u) => u.kill))].sort(
    (a, b) => a - b,
  );
  const byKill = (col: GeasColumn) => new Map(col.unlocks.map((u) => [u.kill, u]));
  const leftByKill = byKill(left);
  const rightByKill = byKill(right);

  const cell = (u: GeasUnlock | undefined, which: 'malus' | 'bonus') => (
    <GeasTableCell
      entry={u?.[which]}
      active={active.has(u?.[which]?.id ?? '')}
      mark={mark}
      lang={lang}
    />
  );

  // Une colonne de sous-boss : portrait puis une ligne par palier (malus | bonus).
  const bossColumn = (map: Map<number, GeasUnlock>, col: GeasColumn) => (
    <div className="flex flex-col gap-2">
      <BossHead col={col} />
      {levels.map((k) => (
        <div key={k} className="flex h-12 items-center justify-center gap-1.5">
          {cell(map.get(k), 'malus')}
          {cell(map.get(k), 'bonus')}
        </div>
      ))}
    </div>
  );

  // Geas ACTIFS, listés (desc + ratio), triés par PALIER DE DÉBLOCAGE et séparés
  // bonus / malus — le détail lisible sous la grille.
  const unlockLevel = new Map<string, number>();
  for (const u of [...left.unlocks, ...right.unlocks]) {
    if (u.bonus) unlockLevel.set(u.bonus.id, u.kill);
    if (u.malus) unlockLevel.set(u.malus.id, u.kill);
  }
  const byUnlock = (a: GeasRef, b: GeasRef) =>
    (unlockLevel.get(a.id) ?? 0) - (unlockLevel.get(b.id) ?? 0);
  const activeGeas = resolveGeas(activeIds ?? []);
  const activeBonuses = activeGeas.filter((r) => isBonusGeas(r.geas)).sort(byUnlock);
  const activeMaluses = activeGeas.filter((r) => !isBonusGeas(r.geas)).sort(byUnlock);
  // Multiplicateur de score : somme des points actifs (per-mille /10), départ à 0.
  const multiplier = activeGeas.reduce((s, r) => s + r.geas.points, 0) / 10;

  // La grille + la liste desc — le contenu « lourd », rendu une fois, réutilisé
  // ouvert (table de référence) ou dans le <details> (équipe).
  const fullTable = (
    <div className="flex flex-wrap items-start gap-6">
      {/* La table complète — pas de fond ni de bordure, jamais tronquée. */}
      <div className="flex gap-3">
        {bossColumn(leftByKill, left)}

        {/* Échelle centrale : losanges numérotés reliés par une ligne verticale. */}
        <div className="flex flex-col gap-2">
          <div className="h-14" aria-hidden />
          <div className="relative flex flex-col gap-2">
            <span
              className="bg-line-subtle absolute inset-y-2 left-1/2 w-px -translate-x-1/2"
              aria-hidden
            />
            {levels.map((k) => (
              <span key={k} className="relative z-10 flex h-12 items-center justify-center">
                <span className="bg-surface border-line-strong flex h-6 w-6 rotate-45 items-center justify-center border">
                  <span className="text-content-strong -rotate-45 text-xs font-bold">{k}</span>
                </span>
              </span>
            ))}
          </div>
        </div>

        {bossColumn(rightByKill, right)}
      </div>

      {/* Résumé détaillé des geas actifs (liste desc + ratio), à droite. */}
      {mark && activeGeas.length > 0 && (
        <div className="min-w-64 flex-1 space-y-3">
          {activeBonuses.length > 0 && (
            <div className="space-y-1.5">
              {activeBonuses.map((r) => (
                <GeasCell key={r.id} entry={r} lang={lang} />
              ))}
            </div>
          )}
          {activeMaluses.length > 0 && (
            <div className="border-line-subtle space-y-1.5 border-t pt-3">
              {activeMaluses.map((r) => (
                <GeasCell key={r.id} entry={r} lang={lang} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );

  // Table de RÉFÉRENCE (pas d'ensemble actif) : rien à résumer, on l'ouvre direct.
  if (!mark) {
    return (
      <section className="space-y-2">
        <h4 className="text-content-strong text-sm font-semibold">{t('guildraid.active_geas')}</h4>
        {fullTable}
      </section>
    );
  }

  return (
    <section className="space-y-2">
      {/* RÉSUMÉ — toujours visible : titre + multiplicateur, puis les pastilles. */}
      <div className="flex items-center justify-between gap-2">
        <h4 className="text-content-strong text-sm font-semibold">{t('guildraid.active_geas')}</h4>
        {activeGeas.length > 0 && (
          <span className="flex items-baseline gap-1.5">
            <span className="text-content-muted text-xs">{t('guildraid.total_multiplier')}</span>
            <span className="text-content-strong text-lg font-bold tabular-nums">
              {multiplier}%
            </span>
          </span>
        )}
      </div>
      {activeGeas.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {[...activeBonuses, ...activeMaluses].map((r) => {
            const bonus = isBonusGeas(r.geas);
            return (
              <span
                key={r.id}
                title={(lRec(r.geas.desc, lang) || r.geas.desc.en).replace(/\\n/g, ' ')}
                className="border-line-subtle bg-surface-raised inline-flex items-center gap-1 rounded-full border py-0.5 pr-2 pl-0.5"
              >
                <GeasIcon geas={r.geas} size={24} />
                <span className={`text-[11px] font-bold ${bonus ? 'text-buff' : 'text-debuff'}`}>
                  {formatPoints(r.geas.points)}
                </span>
              </span>
            );
          })}
        </div>
      )}

      {/* DÉTAIL — repliable, natif (aucun JS). La grille est identique d'une équipe
          à l'autre, donc repliée par défaut. */}
      <details className="group">
        <summary className="text-content-muted hover:text-content flex w-fit cursor-pointer list-none items-center gap-1 text-xs font-medium select-none [&::-webkit-details-marker]:hidden">
          <span aria-hidden className="inline-block transition-transform group-open:rotate-90">
            ▸
          </span>
          {t('guildraid.geas_table_full')}
        </summary>
        <div className="mt-3">{fullTable}</div>
      </details>
    </section>
  );
}
