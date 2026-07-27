'use client';

/**
 * Panneau Debug du damage calculator — DEV ONLY (jamais rendu en prod, le
 * parent le monte derrière `process.env.NODE_ENV !== 'production'`).
 *
 * Implémente la maquette Claude Design « Debug Harness.dc.html » (projet
 * b8621239) sur les TOKENS réels du site — les hex de la maquette n'étaient
 * qu'un proxy visuel (note de design). Spec : docs/specs/damage-debug-harness.md.
 *
 * Libellés EN DUR (pas de locales) : exemption dev-only actée par la maquette
 * elle-même — spec § 5.
 *
 * Phase UI : le moteur n'est pas branché — la structure (trace 3 branches,
 * table des fixtures) est en place et affiche son état vide ; les données
 * arriveront du moteur (`TraceStep[]`) et de `src/lib/damage/fixtures/`.
 */

import { useState } from 'react';
import type { DamageBranch, DamageFixture } from '@/lib/damage/harness';

/** Version courante des tables extraites — celle du binaire de référence. */
const GAME_VERSION = '1.4.9';

const BRANCHES: { key: DamageBranch; label: string; cls: string }[] = [
  { key: 'normal', label: 'NORMAL', cls: 'text-content-muted' },
  { key: 'critical', label: 'CRITICAL', cls: 'text-warn' },
  { key: 'miss', label: 'MISS', cls: 'text-content-subtle' },
];

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

export function DebugHarness({
  state,
  skills,
}: {
  /** `debugState` du calculateur — le contrat d'entrée du moteur. */
  state: unknown;
  /** Skills OFFENSIFS de l'attaquant (slots de la trace et de la capture). */
  skills: { slot: string; name: string }[];
}) {
  const [open, setOpen] = useState<Record<string, boolean>>({});
  const [copied, setCopied] = useState(false);
  const toggle = (key: string) => setOpen((o) => ({ ...o, [key]: !o[key] }));

  // Fixtures : chargées depuis src/lib/damage/fixtures/ à la phase moteur —
  // la table rend déjà le format final (spec § 3).
  const fixtures: DamageFixture[] = [];

  // « Capturer » : compose le DamageFixture du scénario courant (le `?z=` de
  // l'URL) → presse-papiers. Les dégâts `observed` sont à remplacer par les
  // valeurs constatées EN JEU (le moteur pré-remplira ses calculés).
  const capture = () => {
    const fixture: DamageFixture = {
      name: '',
      z: new URLSearchParams(window.location.search).get('z') ?? '',
      gameVersion: GAME_VERSION,
      observed: skills.flatMap((s) =>
        BRANCHES.map((b) => ({ slot: s.slot, branch: b.key, damage: 0 })),
      ),
      notes: '',
    };
    void navigator.clipboard.writeText(JSON.stringify(fixture, null, 2)).then(() => {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <section className="border-line-subtle bg-surface-raised/60 space-y-3.5 rounded-xl border p-3.5">
      {/* ── En-tête : titre + badge DEV ONLY + capture ── */}
      <div className="flex flex-wrap items-center gap-2.5">
        <span className="text-content-subtle text-[10px] font-bold tracking-[0.14em] uppercase">
          Debug
        </span>
        <span className="text-warn border-warn/35 bg-warn/10 rounded border px-1.5 py-0.5 font-mono text-[9px] font-bold tracking-wide">
          DEV ONLY
        </span>
        <span className="text-content-subtle font-mono text-[9px]">
          NODE_ENV !== &apos;production&apos;
        </span>
        <span className="flex-1" />
        <div className="relative">
          <button
            type="button"
            onClick={capture}
            className="bg-accent text-surface-base hover:bg-accent/85 flex h-7 cursor-pointer items-center gap-1.5 rounded-md px-3 text-xs font-semibold"
          >
            <span aria-hidden>⧉</span>
            Capturer ce scénario
          </button>
          {copied && (
            <div className="text-success border-success/40 bg-surface-sunken absolute top-full right-0 z-10 mt-2 rounded-md border px-2.5 py-1.5 font-mono text-[10px] whitespace-nowrap shadow-lg">
              ✓ JSON copié — coller dans src/lib/damage/fixtures/
            </div>
          )}
        </div>
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

      {/* ── Section 2 : trace de calcul ── */}
      <div className="space-y-2">
        <SectionHead
          title="Trace de calcul"
          note="générée par le moteur (jamais reconstruite) · valeurs brutes, aucun arrondi d'affichage · ordre réel d'exécution"
        />
        {skills.length ? (
          skills.map((sk) => (
            <Fold
              key={sk.slot}
              summary={`${sk.slot} · ${sk.name}`}
              open={!!open[`sk:${sk.slot}`]}
              onToggle={() => toggle(`sk:${sk.slot}`)}
            >
              <div className="divide-line-subtle grid grid-cols-3 divide-x">
                {BRANCHES.map((b) => (
                  <div key={b.key} className="flex min-w-0 flex-col">
                    <div className="border-line-subtle/60 flex items-baseline gap-2 border-b px-3 py-2">
                      <span className={`font-mono text-[10px] font-bold tracking-wide ${b.cls}`}>
                        {b.label}
                      </span>
                      <span className="text-content-subtle font-mono text-[10px]">P = —</span>
                      <span className="flex-1" />
                      <span className="text-content-muted font-mono text-xs font-bold">—</span>
                    </div>
                    <p className="text-content-subtle px-3 py-3 text-[11px]">
                      trace indisponible — moteur non branché
                    </p>
                  </div>
                ))}
              </div>
            </Fold>
          ))
        ) : (
          <p className={`${WELL} text-content-subtle px-3 py-3 text-[11px]`}>
            aucun skill offensif — choisir un attaquant
          </p>
        )}
      </div>

      {/* ── Section 3 : attendu / calculé / en jeu ── */}
      <div className="space-y-2">
        <div className="flex flex-wrap items-baseline gap-x-2.5 gap-y-0.5">
          <span className="text-content-muted font-mono text-[10px] font-bold tracking-[0.14em] uppercase">
            Attendu / calculé / en jeu
          </span>
          <span className="text-content-subtle text-[11px]">
            src/lib/damage/fixtures/*.json · rejoués par fixtures.test.ts (vitest, sans UI)
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
            <div className="border-line-subtle text-content-subtle grid grid-cols-[minmax(0,3fr)_70px_90px_110px_110px_70px_50px] gap-2 border-b px-3 py-1.5 font-mono text-[9px] tracking-wide uppercase">
              <span>Fixture</span>
              <span>Skill</span>
              <span>Branche</span>
              <span className="text-right">Attendu (jeu)</span>
              <span className="text-right">Calculé</span>
              <span className="text-right">Δ %</span>
              <span className="text-right">Tol.</span>
            </div>
            {fixtures.length ? (
              fixtures.flatMap((f) =>
                f.observed.map((o, i) => (
                  <div
                    key={`${f.name}:${o.slot}:${o.branch}:${i}`}
                    className="grid grid-cols-[minmax(0,3fr)_70px_90px_110px_110px_70px_50px] items-baseline gap-2 px-3 py-1.5 font-mono text-[11px]"
                  >
                    <span className="text-content truncate font-sans text-xs">
                      {f.name}{' '}
                      <span className="text-content-subtle font-mono text-[9px]">
                        {f.gameVersion}
                      </span>
                    </span>
                    <span className="text-content-muted">{o.slot}</span>
                    <span className="text-content-muted">{o.branch}</span>
                    <span className="text-content-muted text-right">
                      {o.damage.toLocaleString()}
                    </span>
                    {/* Calculé / Δ : sorties du moteur — phase moteur. */}
                    <span className="text-content-subtle text-right">—</span>
                    <span className="text-content-subtle text-right">—</span>
                    <span className="text-content-subtle text-right">{f.tolerance ?? 0.5}</span>
                  </div>
                )),
              )
            ) : (
              <p className="text-content-subtle px-3 py-3 text-[11px]">
                aucun fixture — « Capturer ce scénario » compose le JSON à coller dans
                src/lib/damage/fixtures/
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
