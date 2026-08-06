'use client';

/**
 * Panneau Debug du damage calculator — HARNAIS (le parent le monte quand le
 * mode harnais est actif : build de dev, ou opt-in `?dev=1` en production —
 * flux beta testeurs, Sevih 06/08/2026).
 *
 * BRANCHÉ sur le moteur (harnais § 2–3) : l'état `?z=` courant passe par le
 * pont partagé (`buildInputsFromZ`) puis l'amont pur (`buildDamageReport`,
 * trace comprise) — le MÊME chemin que `fixtures.test.ts` rejouera sans UI.
 * Le panneau ne recalcule ni ne reconstruit RIEN : il rend la trace produite
 * par le moteur, valeurs brutes, aucun arrondi d'affichage.
 *
 * Les tables damage arrivent du PARENT (props `data`/`dataErr`) : depuis le
 * branchement du rapport public (05/08/2026), l'import dynamique vit dans
 * DamageCalculatorBrowser — un seul chargement pour le rapport ET le panneau.
 *
 * Libellés EN DUR (pas de locales) : exemption harnais actée — spec § 5 (le
 * public opt-in `?dev=1` est un outil de contribution, pas l'UI publique).
 */

import { useState } from 'react';
import LZString from 'lz-string';
import {
  ENGINE_GAME_VERSION,
  type DamageBranch,
  type DamageFixture,
  type TraceStep,
} from '@/lib/damage/harness';
import { buildDamageReport, type DamageData, type DamageReportResult } from '@/lib/damage/inputs';
import {
  buildInputsFromZ,
  flattenReport,
  type CalculatorUrlState,
  type ResolvedPresetTarget,
  type ScenarioBuildOptions,
} from '@/lib/damage/scenario';
import { FIXTURES } from '@/lib/damage/fixtures';

/** Version courante des tables extraites — partagée avec fixtures.test.ts. */
const GAME_VERSION = ENGINE_GAME_VERSION;

const BRANCH_STYLE: Record<DamageBranch, { label: string; cls: string }> = {
  normal: { label: 'NORMAL', cls: 'text-content-muted' },
  critical: { label: 'CRITICAL', cls: 'text-warn' },
  miss: { label: 'MISS', cls: 'text-content-subtle' },
};

const WELL = 'border-line-subtle bg-surface-sunken/70 rounded-lg border';

/** En-tête de section : titre mono + explication. */
function SectionHead({ title, note }: { title: string; note: string }) {
  return (
    <div className="flex flex-wrap items-baseline gap-x-2.5 gap-y-0.5">
      <span className="text-content-muted font-mono text-[10px] font-bold tracking-[0.14em] uppercase">
        {title}
      </span>
      <span className="text-content-subtle text-[11px]">{note}</span>
    </div>
  );
}

/** Rangée d'accordéon (▸/▾) — le contenu n'est monté que déplié. */
function Fold({
  summary,
  sub,
  open,
  onToggle,
  children,
}: {
  summary: string;
  sub?: string;
  open: boolean;
  onToggle: () => void;
  children?: React.ReactNode;
}) {
  return (
    <div className={`${WELL} overflow-hidden`}>
      <button
        type="button"
        onClick={onToggle}
        className={`hover:bg-surface-raised/60 flex w-full cursor-pointer items-center gap-2 px-3 py-2 text-left ${open ? 'border-line-subtle border-b' : ''}`}
      >
        <span className={`text-[10px] ${open ? 'text-accent' : 'text-content-subtle'}`}>
          {open ? '▾' : '▸'}
        </span>
        <span className="text-content text-xs font-bold">{summary}</span>
        {sub && <span className="text-content-subtle font-mono text-[10px]">{sub}</span>}
      </button>
      {open && children}
    </div>
  );
}

/** Étapes de trace du moteur, ligne à ligne : `§ref · label · in → out`. */
function TraceList({ steps }: { steps: TraceStep[] }) {
  return (
    <ol className="space-y-1 px-3 py-2">
      {steps.map((s, i) => (
        <li key={i} className="font-mono text-[10px] leading-relaxed">
          <span className="text-accent">{s.ref}</span>{' '}
          <span className="text-content font-sans text-[11px]">{s.label}</span>
          {s.unresolved && (
            <span className="text-warn border-warn/35 bg-warn/10 ml-1.5 rounded border px-1 py-px text-[9px] font-bold">
              unresolved § 12
            </span>
          )}
          <br />
          <span className="text-content-subtle">
            {Object.entries(s.in)
              .map(([k, v]) => `${k}=${v}`)
              .join(' ')}
          </span>{' '}
          <span className="text-content-muted">→ {s.out}</span>
        </li>
      ))}
    </ol>
  );
}

export function DebugHarness({
  state,
  skills,
  zState,
  resolvePreset,
  resolveGear,
  codexLevel,
  guildLevel,
  premiumHp,
  includeMiss,
  quirks,
  data,
  dataErr,
  extraIgnored,
}: {
  /** `debugState` du calculateur — le contrat d'entrée du moteur. */
  state: unknown;
  /** Skills OFFENSIFS de l'attaquant (noms lisibles des slots). */
  skills: { slot: string; name: string }[];
  /** L'objet `?z=` COURANT (avant compression — jamais l'URL débouncée). */
  zState: CalculatorUrlState;
  /** Cible preset → stats effectives au spawn (résolues par le parent). */
  resolvePreset: (targetId: string, spawnIdx: number) => ResolvedPresetTarget | undefined;
  /** Équipement (slug → groupes des tables damage, résolu par le parent). */
  resolveGear: NonNullable<ScenarioBuildOptions['resolveGear']>;
  /** Codex du COMPTE (localStorage — hors z, capturé à part). */
  codexLevel: number;
  /** Niveau de GUILDE du compte (localStorage — hors z, capturé à part). */
  guildLevel: number;
  /** Buff de titre « Premium Body » possédé (localStorage — hors z). */
  premiumHp: boolean;
  /** Branche MISS forcée par la coche de la table Résultat (parent) — la
   *  trace montre les MÊMES branches que la table. */
  includeMiss: boolean;
  /** Tables damage chargées par le PARENT (import dynamique partagé avec le
   *  rapport public — un seul chargement). Null tant qu'elles n'y sont pas. */
  data: DamageData | null;
  /** QUIRKS actifs du compte (réglage hors z — comme codex/guilde). */
  quirks: Record<string, number>;
  /** Erreur de chargement des tables, le cas échéant. */
  dataErr: string | null;
  /** Hors-v1 que seul le parent sait. */
  extraIgnored?: string[];
}) {
  const [open, setOpen] = useState<Record<string, boolean>>({});
  const toggle = (key: string) => setOpen((o) => ({ ...o, [key]: !o[key] }));

  // Le scénario courant, par le pont PARTAGÉ (le test rejoue ce chemin). La
  // saisie « en jeu » et le cycle save/load vivent dans la table Résultat du
  // parent (Sevih 05/08/2026) — ici, uniquement la trace et les fixtures.
  const inputs = buildInputsFromZ(zState, {
    codexLevel,
    guildLevel,
    premiumHp,
    quirks,
    resolvePreset,
    resolveGear,
  });
  const ignored = [...inputs.ignored, ...(extraIgnored ?? [])];
  let result: DamageReportResult | null = null;
  let engineErr: string | null = null;
  if (data && inputs.attacker && inputs.target) {
    try {
      result = buildDamageReport(inputs.attacker, inputs.target, data, {
        trace: true,
        includeMissBranch: includeMiss,
      });
    } catch (e) {
      engineErr = e instanceof Error ? e.message : String(e);
    }
  }
  const nameOf = (slot: string) => skills.find((s) => s.slot === slot)?.name;

  // Rejeu d'une fixture (même pont, même amont — sans trace) → calculés par
  // clé `slot|branch`. Null tant que les tables ne sont pas chargées ou si le
  // scénario ne se rejoue pas (z corrompu, perso hors tables…).
  const replay = (f: DamageFixture): Map<string, number> | null => {
    if (!data) return null;
    try {
      const st = JSON.parse(
        LZString.decompressFromEncodedURIComponent(f.z) || 'null',
      ) as CalculatorUrlState | null;
      if (!st) return null;
      const inp = buildInputsFromZ(st, {
        codexLevel: f.codex ?? 0,
        guildLevel: f.guild ?? 0,
        premiumHp: f.premium === true,
        ...(f.quirks ? { quirks: f.quirks } : {}),
        resolvePreset,
        resolveGear,
      });
      if (!inp.attacker || !inp.target) return null;
      // Un miss observé force sa branche — même règle que fixtures.test.ts.
      const wantMiss = f.observed.some((o) => o.branch === 'miss');
      const r = buildDamageReport(
        inp.attacker,
        inp.target,
        data,
        wantMiss ? { includeMissBranch: true } : {},
      );
      return new Map(flattenReport(r).map((l) => [`${l.slot}|${l.branch}`, l.damage]));
    } catch {
      return null;
    }
  };

  return (
    <section className="border-line-subtle bg-surface-raised/60 space-y-3.5 rounded-xl border p-3.5">
      {/* ── En-tête : titre + badge DEV ONLY ── */}
      <div className="flex flex-wrap items-center gap-2.5">
        <span className="text-content-subtle text-[10px] font-bold tracking-[0.14em] uppercase">
          Debug
        </span>
        <span className="text-warn border-warn/35 bg-warn/10 rounded border px-1.5 py-0.5 font-mono text-[9px] font-bold tracking-wide">
          HARNAIS
        </span>
        <span className="text-content-subtle font-mono text-[9px]">
          build de dev, ou ?dev=1 dans l&apos;URL
        </span>
      </div>

      {/* ── Section 1 : debugState (contrat d'entrée) ── */}
      <Fold
        summary="debugState"
        sub="contrat d'entrée du moteur — dump JSON"
        open={!!open.state}
        onToggle={() => toggle('state')}
      >
        <pre className="text-content-muted overflow-x-auto px-3 py-2 font-mono text-[11px] leading-relaxed">
          {JSON.stringify(state, null, 2)}
        </pre>
      </Fold>

      {/* ── Section 2 : le rapport du moteur (état, stats, trace) ── */}
      <div className="space-y-2">
        <SectionHead
          title="Trace de calcul"
          note="générée par le moteur (jamais reconstruite) · valeurs brutes, aucun arrondi d'affichage · ordre réel d'exécution"
        />

        {/* État du branchement : chargement, erreurs, scénario incomplet. */}
        {!data && !dataErr && (
          <p className={`${WELL} text-content-subtle px-3 py-3 text-[11px]`}>
            chargement des tables damage (characters/growth/buffs)…
          </p>
        )}
        {dataErr && (
          <p className={`${WELL} text-danger px-3 py-3 font-mono text-[11px]`}>
            tables damage : {dataErr}
          </p>
        )}
        {data && (!inputs.attacker || !inputs.target) && (
          <p className={`${WELL} text-content-subtle px-3 py-3 text-[11px]`}>
            scénario incomplet — choisir un attaquant ET une cible (preset ou élément manuel)
          </p>
        )}
        {engineErr && (
          <p className={`${WELL} text-danger px-3 py-3 font-mono text-[11px]`}>
            moteur : {engineErr}
          </p>
        )}

        {/* Ce que le moteur v1 IGNORE ou ne résout PAS — jamais tu. */}
        {(ignored.length > 0 || (result && result.unresolvedFx.length > 0)) && (
          <div className={`${WELL} space-y-1 px-3 py-2`}>
            {ignored.map((line) => (
              <p key={line} className="text-warn font-mono text-[10px]">
                ⚠ ignoré : {line}
              </p>
            ))}
            {result && result.unresolvedFx.length > 0 && (
              <p className="text-warn font-mono text-[10px]">
                ⚠ chips sans magnitude standard (contribution 0) : {result.unresolvedFx.join(', ')}
              </p>
            )}
          </div>
        )}

        {/* Fiche → combat (§ 16.1) : la reconstruction que le moteur consomme. */}
        {result && inputs.attacker && (
          <div className={`${WELL} px-3 py-2`}>
            <p className="text-content-subtle mb-1 font-mono text-[9px] tracking-wide uppercase">
              fiche → combat (§ 16.1)
            </p>
            <p className="text-content-muted font-mono text-[10px] leading-relaxed">
              {Object.entries(result.combatStats)
                .map(([slug, combat]) => {
                  const sheet = inputs.attacker?.sheet[slug] ?? 0;
                  return sheet === combat ? `${slug}=${combat}` : `${slug}=${sheet}→${combat}`;
                })
                .join(' · ') || '—'}
            </p>
            {result.maxHpBuff && (
              <p
                className={`mt-1 font-mono text-[10px] ${
                  result.maxHpBuff.sum > 0 ? 'text-content-muted' : 'text-warn'
                }`}
              >
                § 16.2{' '}
                {result.maxHpBuff.parts
                  .map(
                    (p) =>
                      `${p.source === 'guild' ? `guilde Lv ${p.level}` : 'titre'} +${p.value}%` +
                      (p.active ? '' : ' (inactif ici)'),
                  )
                  .join(' · ')}
                {result.maxHpBuff.sum > 0
                  ? ` : hp ${result.maxHpBuff.hpBefore} × ${result.maxHpBuff.rate} → ${result.maxHpBuff.hpAfter}`
                  : ' — hp inchangé dans ce contenu'}
              </p>
            )}
          </div>
        )}

        {/* Passifs de BOSS du preset (passives.ts) — entrées évaluées, jamais tues. */}
        {result?.bossPassives && (
          <div className={`${WELL} px-3 py-2`}>
            <p className="text-content-subtle mb-1 font-mono text-[9px] tracking-wide uppercase">
              passifs du boss (preset)
            </p>
            {result.bossPassives.entries.map((e, i) => (
              <p
                key={`${e.buffId}:${i}`}
                className={`font-mono text-[10px] leading-relaxed ${
                  e.active ? 'text-content-muted' : 'text-content-subtle'
                }`}
              >
                {e.side === 'attacker' ? '→ équipe joueuse' : '→ boss'} · {e.buffId} · {e.buff.type}
                {e.buff.stat ? ` ${e.buff.stat}` : ''}
                {e.buff.value !== undefined
                  ? ` ${e.buff.value > 0 ? '+' : ''}${e.buff.value}${e.buff.applyingType === 'OAT_RATE' ? '‰' : ''}`
                  : ''}
                {e.condition ? ` · si ${e.condition}` : ''}
                {e.active ? '' : ' — inactif (élément)'}
              </p>
            ))}
            {result.bossPassives.unresolved.map((u, i) => (
              <p key={`u:${u.buffId}:${i}`} className="text-warn font-mono text-[10px]">
                ⚠ {u.buffId} : {u.reason} — contribution 0
              </p>
            ))}
            {result.bossPassives.entries.length === 0 &&
              result.bossPassives.unresolved.length === 0 && (
                <p className="text-content-subtle font-mono text-[10px]">aucun passif statique</p>
              )}
          </div>
        )}

        {/* Passifs d'ÉQUIPEMENT (gear.ts § 15) — appliqués, procs, non-résolus. */}
        {result?.gearPassives && (
          <div className={`${WELL} px-3 py-2`}>
            <p className="text-content-subtle mb-1 font-mono text-[9px] tracking-wide uppercase">
              passifs d&apos;équipement (§ 15)
            </p>
            {result.gearPassives.entries.map((e, i) => (
              <p
                key={`${e.buffId}:${i}`}
                className={`font-mono text-[10px] leading-relaxed ${
                  e.active ? 'text-content-muted' : 'text-content-subtle'
                }`}
              >
                [{e.source}] {e.buffId} · {e.buff.type}
                {e.buff.stat ? ` ${e.buff.stat}` : ''}
                {e.buff.value !== undefined
                  ? ` ${e.buff.value > 0 ? '+' : ''}${e.buff.value}${e.buff.applyingType === 'OAT_RATE' ? '‰' : ''}`
                  : ''}
                {e.condition ? ` · si ${e.condition}` : ''}
                {e.side === 'allies'
                  ? ' — alliés seulement (jamais le porteur)'
                  : e.active
                    ? ''
                    : ' — inactif (condition)'}
              </p>
            ))}
            {result.gearPassives.dynamic.map((d, i) => (
              <p key={`d:${d.buffId}:${i}`} className="text-content-subtle font-mono text-[10px]">
                ⏱ [{d.source}] {d.buffId} · {d.buff.type} · proc {d.createType} — non simulé
                (représenter l&apos;état par une chip)
              </p>
            ))}
            {result.gearPassives.unresolved.map((u, i) => (
              <p key={`u:${u.buffId}:${i}`} className="text-warn font-mono text-[10px]">
                ⚠ [{u.source}] {u.buffId} : {u.reason} — contribution 0
              </p>
            ))}
            {result.gearPassives.entries.length === 0 &&
              result.gearPassives.dynamic.length === 0 &&
              result.gearPassives.unresolved.length === 0 && (
                <p className="text-content-subtle font-mono text-[10px]">aucun passif statique</p>
              )}
          </div>
        )}

        {/* Passifs du KIT du perso (gear.ts § 16.3 côté joueur). */}
        {result?.kitPassives && (
          <div className={`${WELL} px-3 py-2`}>
            <p className="text-content-subtle mb-1 font-mono text-[9px] tracking-wide uppercase">
              passifs du kit (perso)
            </p>
            {result.kitPassives.entries.map((e, i) => (
              <p
                key={`${e.buffId}:${i}`}
                className={`font-mono text-[10px] leading-relaxed ${
                  e.active ? 'text-content-muted' : 'text-content-subtle'
                }`}
              >
                [{e.sourceId}] {e.buffId} · {e.buff.type}
                {e.buff.stat ? ` ${e.buff.stat}` : ''}
                {e.buff.value !== undefined
                  ? ` ${e.buff.value > 0 ? '+' : ''}${e.buff.value}${e.buff.applyingType === 'OAT_RATE' ? '‰' : ''}`
                  : ''}
                {e.condition ? ` · si ${e.condition}` : ''}
                {e.side === 'allies'
                  ? ' — alliés seulement'
                  : e.active
                    ? ''
                    : ' — inactif (condition)'}
              </p>
            ))}
            {result.kitPassives.dynamic.map((d, i) => (
              <p key={`d:${d.buffId}:${i}`} className="text-content-subtle font-mono text-[10px]">
                ⏱ [{d.sourceId}] {d.buffId} · {d.buff.type} · proc {d.createType} — non simulé
                (représenter l&apos;état par une chip)
              </p>
            ))}
            {result.kitPassives.unresolved.map((u, i) => (
              <p key={`u:${u.buffId}:${i}`} className="text-warn font-mono text-[10px]">
                ⚠ [{u.sourceId}] {u.buffId} : {u.reason} — contribution 0
              </p>
            ))}
            {result.kitPassives.entries.length === 0 &&
              result.kitPassives.dynamic.length === 0 &&
              result.kitPassives.unresolved.length === 0 && (
                <p className="text-content-subtle font-mono text-[10px]">aucun passif statique</p>
              )}
          </div>
        )}

        {/* QUIRKS du compte (nœuds d'éveil à buff — gear.ts). */}
        {result?.quirkPassives && (
          <div className={`${WELL} px-3 py-2`}>
            <p className="text-content-subtle mb-1 font-mono text-[9px] tracking-wide uppercase">
              quirks du compte
            </p>
            {result.quirkPassives.entries.map((e, i) => (
              <p
                key={`${e.buffId}:${i}`}
                className={`font-mono text-[10px] leading-relaxed ${
                  e.active ? 'text-content-muted' : 'text-content-subtle'
                }`}
              >
                [nœud {e.sourceId}] {e.buffId} · {e.buff.type}
                {e.buff.stat ? ` ${e.buff.stat}` : ''}
                {e.buff.value !== undefined
                  ? ` ${e.buff.value > 0 ? '+' : ''}${e.buff.value}${e.buff.applyingType === 'OAT_RATE' ? '‰' : ''}`
                  : ''}
                {e.condition ? ` · si ${e.condition}` : ''}
                {e.active ? '' : ' — inactif (condition)'}
              </p>
            ))}
            {result.quirkPassives.dynamic.map((d, i) => (
              <p key={`d:${d.buffId}:${i}`} className="text-content-subtle font-mono text-[10px]">
                ⏱ [nœud {d.sourceId}] {d.buffId} · {d.buff.type} · proc {d.createType} — non simulé
              </p>
            ))}
            {result.quirkPassives.unresolved.map((u, i) => (
              <p key={`u:${u.buffId}:${i}`} className="text-warn font-mono text-[10px]">
                ⚠ [nœud {u.sourceId}] {u.buffId} : {u.reason} — contribution 0
              </p>
            ))}
          </div>
        )}

        {/* Un accordéon par slot du rapport ; dedans : états × branches. */}
        {result &&
          result.slots.map((s) => {
            const key = `${s.slot}${s.burst !== undefined ? `b${s.burst}` : ''}`;
            const title = `${s.slot}${s.burst !== undefined ? ` · burst ${s.burst}` : ''} · ${
              nameOf(s.slot) ?? s.skillId
            }`;
            return (
              <Fold
                key={key}
                summary={title}
                sub={`Lv ${s.skillLevel} · WG ${s.report.weaknessGaugeDamage}`}
                open={!!open[`sk:${key}`]}
                onToggle={() => toggle(`sk:${key}`)}
              >
                <div className="divide-line-subtle divide-y">
                  {s.hitsUnresolved && (
                    <p className="text-warn px-3 py-2 font-mono text-[10px]">
                      ⚠ chaînes de hits irrésolues (§ 12.4) — dégâts non fiables
                    </p>
                  )}
                  {s.report.defenderInvincible && (
                    <p className="text-content-subtle px-3 py-2 text-[11px]">
                      défenseur invincible — branches non émises, seule la jauge est servie (§ 11)
                    </p>
                  )}
                  {s.report.states.map((st) => (
                    <div key={st.chain}>
                      {s.report.states.length > 1 && (
                        <div className="border-line-subtle/60 flex items-baseline gap-2 border-b px-3 py-1.5">
                          <span className="text-content font-mono text-[10px] font-bold">
                            état : {st.chain}
                          </span>
                          <span className="text-content-subtle font-mono text-[10px]">
                            Σfacteur {st.totalFactor}
                          </span>
                          <span className="flex-1" />
                          <span className="text-content-subtle font-mono text-[10px]">
                            E[dégâts] = {st.expectedDamage}
                          </span>
                        </div>
                      )}
                      <div
                        className="divide-line-subtle grid divide-x"
                        style={{
                          gridTemplateColumns: `repeat(${st.branches.length || 1}, minmax(0, 1fr))`,
                        }}
                      >
                        {st.branches.map((b) => (
                          <div key={b.branch} className="flex min-w-0 flex-col">
                            <div className="border-line-subtle/60 flex items-baseline gap-2 border-b px-3 py-2">
                              <span
                                className={`font-mono text-[10px] font-bold tracking-wide ${BRANCH_STYLE[b.branch].cls}`}
                              >
                                {BRANCH_STYLE[b.branch].label}
                              </span>
                              <span className="text-content-subtle font-mono text-[10px]">
                                P = {b.probability}
                              </span>
                              <span className="flex-1" />
                              <span className="text-content-muted font-mono text-xs font-bold">
                                {b.totalDamage.toLocaleString()}
                              </span>
                            </div>
                            {b.trace ? (
                              <TraceList steps={b.trace} />
                            ) : (
                              <p className="text-content-subtle px-3 py-3 text-[11px]">
                                trace absente
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                  {s.report.wgTrace && (
                    <div>
                      <div className="border-line-subtle/60 border-b px-3 py-1.5">
                        <span className="text-content-subtle font-mono text-[10px] font-bold tracking-wide">
                          JAUGE DE FAIBLESSE (§ 11)
                        </span>
                      </div>
                      <TraceList steps={s.report.wgTrace} />
                    </div>
                  )}
                </div>
              </Fold>
            );
          })}
      </div>

      {/* ── Section 3 : fixtures COMMITTÉES (attendu / calculé / en jeu) ── */}
      <div className="space-y-2">
        <div className="flex flex-wrap items-baseline gap-x-2.5 gap-y-0.5">
          <span className="text-content-muted font-mono text-[10px] font-bold tracking-[0.14em] uppercase">
            Fixtures committées
          </span>
          <span className="text-content-subtle text-[11px]">
            src/lib/damage/fixtures/* · rejouées par fixtures.test.ts (vitest, sans UI)
          </span>
          <span className="flex-1" />
          <span className="text-content-subtle flex gap-3 font-mono text-[9px]">
            <span>
              <span className="text-success">●</span> Δ ≤ tolérance
            </span>
            <span>
              <span className="text-danger">●</span> Δ &gt; tolérance
            </span>
            <span>
              <span className="text-content-subtle">●</span> incertitude § 12 → skip
            </span>
          </span>
        </div>
        <div className={`${WELL} overflow-x-auto`}>
          <div className="min-w-165">
            <div className="border-line-subtle text-content-subtle grid grid-cols-[minmax(0,3fr)_80px_90px_110px_110px_70px_50px] gap-2 border-b px-3 py-1.5 font-mono text-[9px] tracking-wide uppercase">
              <span>Fixture</span>
              <span>Slot</span>
              <span>Branche</span>
              <span className="text-right">Attendu (jeu)</span>
              <span className="text-right">Calculé</span>
              <span className="text-right">Δ %</span>
              <span className="text-right">Tol.</span>
            </div>
            {FIXTURES.length ? (
              FIXTURES.flatMap((f) => {
                const calc = replay(f);
                const tol = f.tolerance ?? 0.5;
                return f.observed.map((o, i) => {
                  const computed = calc?.get(`${o.slot}|${o.branch}`);
                  const delta =
                    computed !== undefined && o.damage > 0
                      ? ((computed - o.damage) / o.damage) * 100
                      : undefined;
                  const cls = f.skipRef
                    ? 'text-content-subtle'
                    : delta === undefined
                      ? 'text-content-subtle'
                      : Math.abs(delta) <= tol
                        ? 'text-success'
                        : 'text-danger';
                  const stale =
                    !f.skipRef &&
                    delta !== undefined &&
                    Math.abs(delta) > tol &&
                    f.gameVersion !== GAME_VERSION;
                  return (
                    <div
                      key={`${f.name}:${o.slot}:${o.branch}:${i}`}
                      className="grid grid-cols-[minmax(0,3fr)_80px_90px_110px_110px_70px_50px] items-baseline gap-2 px-3 py-1.5 font-mono text-[11px]"
                    >
                      <span className="text-content truncate font-sans text-xs">
                        {f.name}{' '}
                        <span className="text-content-subtle font-mono text-[9px]">
                          {f.gameVersion}
                        </span>
                        {f.skipRef && (
                          <span className="text-content-subtle font-mono text-[9px]">
                            {' '}
                            · skip {f.skipRef}
                          </span>
                        )}
                        {stale && (
                          <span className="text-warn border-warn/35 bg-warn/10 ml-1.5 rounded border px-1 py-px font-mono text-[9px] font-bold">
                            à revérifier en jeu
                          </span>
                        )}
                      </span>
                      <span className="text-content-muted">{o.slot}</span>
                      <span className="text-content-muted">{o.branch}</span>
                      <span className="text-content-muted text-right">
                        {o.damage.toLocaleString()}
                      </span>
                      <span className="text-content-muted text-right">
                        {computed !== undefined ? computed.toLocaleString() : '—'}
                      </span>
                      <span className={`text-right ${cls}`}>
                        {delta !== undefined ? delta.toFixed(3) : '—'}
                      </span>
                      <span className="text-content-subtle text-right">{tol}</span>
                    </div>
                  );
                });
              })
            ) : (
              <p className="text-content-subtle px-3 py-3 text-[11px]">
                aucun fixture — sauvegarder un scénario corrigé puis « ⧉ JSON » (liste des
                scénarios) → coller dans src/lib/damage/fixtures/ et l&apos;importer dans
                fixtures/index.ts
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
