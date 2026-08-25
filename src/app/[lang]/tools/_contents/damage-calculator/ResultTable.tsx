'use client';

/**
 * Table RÉSULTAT du calculateur : une ligne par skill offensif (sous-lignes
 * de burst B1..B3), trois colonnes de branches, DoT en pied de table — plus,
 * en devMode, les coches de branches observables, la saisie « en jeu » (obs),
 * le Δ et le « + » de capture. Extrait du composant principal (audit D4
 * phase 2, 25/08/2026 — JSX déplacé tel quel ; l'état, `saveCell` et le
 * rapport restent au parent).
 */
import { Fragment } from 'react';
import { distinctDots, type DamageData, type DamageReportResult } from '@/lib/damage/inputs';
import type { DamageBranch } from '@/lib/damage/harness';
import type { Lang } from '@/lib/i18n/config';
import type { DcChar, DcEffectRef, DcSkillRow, Props } from './contracts';
import { DEFAULT_TOLERANCE } from './stores';
import { EffectRefTag, Eyebrow, vars } from './ui';
import { SkillIconTip } from './SkillTip';

export function ResultTable({
  attacker,
  kit,
  supportSkills,
  report,
  skillLvls,
  lang,
  devMode,
  branchOn,
  setBranchOn,
  obs,
  setObs,
  saveCell,
  effectRefs,
  dmgData,
  dmgErr,
  labels: L,
}: {
  attacker: DcChar | undefined;
  kit: DcSkillRow[];
  /** Skills de soutien du kit (note sous la table — pas de ligne). */
  supportSkills: DcSkillRow[];
  report: DamageReportResult | null;
  skillLvls: Record<string, number>;
  lang: Lang;
  devMode: boolean;
  branchOn: Record<DamageBranch, boolean>;
  setBranchOn: (
    next:
      | Record<DamageBranch, boolean>
      | ((prev: Record<DamageBranch, boolean>) => Record<DamageBranch, boolean>),
  ) => void;
  /** Saisies « en jeu » par ligne (clé `slot|branch`, la même que flattenReport). */
  obs: Record<string, string>;
  setObs: (
    next: Record<string, string> | ((prev: Record<string, string>) => Record<string, string>),
  ) => void;
  saveCell: (slot: string, branch: DamageBranch, real: number) => void;
  effectRefs: Record<string, DcEffectRef>;
  dmgData: DamageData | null;
  dmgErr: string | null;
  labels: Props['labels'];
}) {
  return (
    <>
      <div className="flex items-center gap-2">
        <Eyebrow>{L.panels.result}</Eyebrow>
        <span className="text-content-subtle font-mono text-[10px]">{L.report.branchesNote}</span>
      </div>

      {attacker && !dmgData && (
        <p className={`text-center text-[11px] ${dmgErr ? 'text-danger' : 'text-content-subtle'}`}>
          {dmgErr ? L.report.tablesError : L.report.loading}
        </p>
      )}

      {!attacker ? (
        <div className="border-line-subtle bg-surface-raised/40 text-content-subtle rounded-xl border px-4 py-10 text-center text-sm">
          {L.report.empty}
        </div>
      ) : (
        <>
          {/* Table COMPACTE (Sevih 27/07/2026) : une ligne par skill
                  offensif, trois colonnes de branches — rien de plus. */}
          <div className="border-line bg-surface-raised/60 overflow-hidden rounded-xl border">
            <div className="bg-line-subtle grid grid-cols-[auto_1fr_1fr_1fr] gap-px">
              <div className="bg-surface-sunken/60 px-3 py-2" />
              {(
                [
                  { br: 'normal', label: L.report.normal },
                  { br: 'critical', label: L.report.critical },
                  { br: 'miss', label: L.report.miss },
                ] as const
              ).map(({ br, label }) => (
                <div
                  key={br}
                  className={`bg-surface-sunken/60 flex items-center justify-center gap-1.5 px-2 py-2 text-center font-mono text-[9px] tracking-wide uppercase ${
                    br === 'critical' ? 'text-warn' : 'text-content-subtle'
                  }`}
                >
                  {/* Harnais : la coche décide quelles colonnes prennent
                          une saisie « en jeu » et partent dans la capture ;
                          MISS cochée force sa branche (buff de miss chance). */}
                  {devMode && (
                    <input
                      type="checkbox"
                      checked={branchOn[br]}
                      onChange={() => setBranchOn((p) => ({ ...p, [br]: !p[br] }))}
                      className="accent-accent h-3 w-3 cursor-pointer"
                    />
                  )}
                  {label}
                </div>
              ))}
              {kit.flatMap((sk) => {
                // Une ligne par SlotReport du moteur — le slot du skill
                // BURSTABLE (`burstAP` : S1 chez Caren/Valentine, S2
                // chez la plupart) déplie ses états burst en sous-lignes
                // B1..B3.
                // Un slot offensif que le moteur v1 ne calcule pas garde
                // sa ligne à « — » ; un soutien sans burst n'a pas de
                // ligne (note sous la table).
                const slotReports = report?.slots.filter((s) => s.slot === sk.slot) ?? [];
                const rows = slotReports.length ? slotReports : sk.offensive ? [null] : [];
                return rows.map((sr, ri) => (
                  <Fragment key={`${sk.slot}:${sr?.burst ?? `p${ri}`}`}>
                    <div
                      className="bg-surface-raised/80 flex items-center gap-2 px-3 py-1.5"
                      title={sk.name}
                    >
                      {/* La ligne Bn cumule les descs B1..Bn (en jeu le
                              burst n inclut les effets des paliers précédents) ;
                              la ligne de base n'en montre aucune. */}
                      <SkillIconTip
                        row={sk}
                        lvl={skillLvls[sk.slot] ?? sk.maxLevel}
                        lang={lang}
                        burstMax={sr?.burst ?? 0}
                      >
                        {sk.iconSrc ? (
                          <img
                            src={sk.iconSrc}
                            alt=""
                            aria-hidden
                            width={28}
                            height={28}
                            className="block h-7 w-7 rounded-md"
                            loading="lazy"
                          />
                        ) : (
                          <span className="border-line-subtle bg-surface-sunken/70 block h-7 w-7 rounded-md border" />
                        )}
                      </SkillIconTip>
                      <span className="text-content-subtle font-mono text-[10px] font-bold">
                        {sk.slot}
                        {sr?.burst !== undefined && <span className="text-warn"> B{sr.burst}</span>}
                      </span>
                    </div>
                    {(['normal', 'critical', 'miss'] as const).map((br) => {
                      const states = sr?.report.states ?? [];
                      // Slot présent mais chaîne de hits IRRÉSOLUE
                      // (§ 12.4) : placeholder « pas encore supporté »
                      // — et la saisie « en jeu » reste possible, la
                      // valeur attendra le moteur (Sevih 06/08/2026).
                      const unsupported =
                        sr !== null && sr.hitsUnresolved === true && states.length === 0;
                      const branch = states[0]?.branches.find((b) => b.branch === br);
                      // Plusieurs états de chaîne : la cellule montre la
                      // chaîne de BASE, le détail passe en tooltip.
                      const detail =
                        states.length > 1
                          ? states
                              .map(
                                (st) =>
                                  `${st.chain}: ${
                                    st.branches
                                      .find((b) => b.branch === br)
                                      ?.totalDamage.toLocaleString() ?? '—'
                                  }`,
                              )
                              .join('\n')
                          : undefined;
                      // Harnais : clé de saisie « en jeu » — la MÊME que
                      // flattenReport (l'état de base quand il y a
                      // plusieurs chaînes).
                      const lineSlot = sr
                        ? `${sr.slot}${sr.burst !== undefined ? `b${sr.burst}` : ''}${
                            states.length > 1 ? `#${states[0].chain}` : ''
                          }`
                        : null;
                      const obsKey = lineSlot !== null ? `${lineSlot}|${br}` : null;
                      const seen = obsKey !== null ? Number(obs[obsKey]) : NaN;
                      const filled = Number.isFinite(seen) && seen > 0;
                      const delta =
                        branch && filled ? ((branch.totalDamage - seen) / seen) * 100 : undefined;
                      return (
                        <div
                          key={br}
                          className="bg-surface-raised/80 flex flex-col items-center gap-1 px-2 py-1.5"
                          title={detail}
                        >
                          <span
                            className={`flex items-center gap-1.5 font-mono text-sm font-bold tabular-nums ${
                              branch ? 'text-content' : 'text-content-muted'
                            }`}
                          >
                            {branch ? (
                              branch.totalDamage.toLocaleString()
                            ) : unsupported && (br !== 'miss' || branchOn.miss) ? (
                              <span
                                title={L.report.unsupportedHint}
                                className="text-content-muted cursor-help font-sans text-[10px] font-medium italic"
                              >
                                {L.report.unsupported}
                              </span>
                            ) : (
                              '—'
                            )}
                            {branch && detail !== undefined && (
                              <span className="text-content-subtle">*</span>
                            )}
                            {/* `+` = sauvegarder CE scénario (cette ligne
                                    + le z courant), à droite du calculé — les
                                    lignes « pas encore supporté » se capturent
                                    AUSSI (valeur en attente du moteur). */}
                            {devMode &&
                              branchOn[br] &&
                              (branch || unsupported) &&
                              lineSlot !== null &&
                              obsKey && (
                                <button
                                  type="button"
                                  onClick={() => saveCell(lineSlot, br, Math.round(seen))}
                                  disabled={!filled}
                                  title={
                                    filled
                                      ? 'sauvegarder ce scénario'
                                      : 'saisir la valeur en jeu d’abord'
                                  }
                                  className="text-success hover:text-accent cursor-pointer font-mono text-base leading-none font-extrabold disabled:cursor-not-allowed disabled:opacity-35"
                                >
                                  +
                                </button>
                              )}
                          </span>
                          {devMode &&
                            branchOn[br] &&
                            (branch || unsupported) &&
                            lineSlot !== null &&
                            obsKey && (
                              <span className="flex items-center gap-1.5">
                                <input
                                  value={obs[obsKey] ?? ''}
                                  onChange={(e) =>
                                    setObs((p) => ({ ...p, [obsKey]: e.target.value }))
                                  }
                                  inputMode="numeric"
                                  placeholder="en jeu"
                                  className="border-line-subtle bg-surface-sunken/70 text-content focus:border-accent h-6 w-24 rounded border px-1.5 text-right font-mono text-[11px] outline-none"
                                />
                                <span
                                  className={`w-14 text-center font-mono text-[10px] ${
                                    delta === undefined
                                      ? 'text-content-subtle'
                                      : Math.abs(delta) <= DEFAULT_TOLERANCE
                                        ? 'text-success'
                                        : 'text-danger'
                                  }`}
                                >
                                  {delta !== undefined ? `${delta.toFixed(2)}%` : 'Δ'}
                                </span>
                              </span>
                            )}
                        </div>
                      );
                    })}
                  </Fragment>
                ));
              })}
              {/* DoT posés par le kit (§ 11) : UNE ligne par EFFET en
                      pied de table — le tag et les dégâts PAR TICK, rien
                      d'autre (Sevih 22/08/2026 : la durée ne compte pas).
                      Dédup `distinctDots` — la MÊME que flattenReport : la
                      clé de capture `dot:<buffId>` retrouve sa ligne au
                      rejeu. En devMode, saisie « en jeu » + Δ + « + » comme
                      les cellules de branches (dépannage d'un tick § 11). */}
              {(() => {
                const distinct = distinctDots(report?.slots ?? []);
                if (!distinct.length) return null;
                return (
                  <div className="bg-surface-raised/60 col-span-4 space-y-1 px-3 py-1.5">
                    <span className="text-content-subtle font-mono text-[9px] tracking-wide uppercase">
                      {L.report.dot}
                    </span>
                    {distinct.map((d, di) => {
                      const ref =
                        d.tooltipId !== undefined ? effectRefs[String(d.tooltipId)] : undefined;
                      const lineSlot = `dot:${d.buffId}`;
                      const obsKey = `${lineSlot}|normal`;
                      const seen = Number(obs[obsKey]);
                      const filled = Number.isFinite(seen) && seen > 0;
                      const delta = filled ? ((d.damagePerTick - seen) / seen) * 100 : undefined;
                      return (
                        <div
                          key={`${d.buffId}:${di}`}
                          className="flex flex-wrap items-center gap-1.5 text-xs"
                        >
                          {ref ? (
                            <EffectRefTag r={ref} />
                          ) : (
                            <span className="text-content-subtle font-mono">{d.buffId}</span>
                          )}
                          <span className="text-content font-mono font-bold tabular-nums">
                            {vars(L.report.dotTick, { n: d.damagePerTick.toLocaleString() })}
                          </span>
                          {d.applyProbability < 1 && (
                            <span className="text-content-subtle text-[10px]">
                              {vars(L.report.dotApply, {
                                p: Math.round(d.applyProbability * 100),
                              })}
                            </span>
                          )}
                          {devMode && (
                            <span className="flex items-center gap-1.5">
                              <input
                                value={obs[obsKey] ?? ''}
                                onChange={(e) =>
                                  setObs((p) => ({ ...p, [obsKey]: e.target.value }))
                                }
                                inputMode="numeric"
                                placeholder="en jeu"
                                className="border-line-subtle bg-surface-sunken/70 text-content focus:border-accent h-6 w-24 rounded border px-1.5 text-right font-mono text-[11px] outline-none"
                              />
                              <span
                                className={`w-14 text-center font-mono text-[10px] ${
                                  delta === undefined
                                    ? 'text-content-subtle'
                                    : Math.abs(delta) <= DEFAULT_TOLERANCE
                                      ? 'text-success'
                                      : 'text-danger'
                                }`}
                              >
                                {delta !== undefined ? `${delta.toFixed(2)}%` : 'Δ'}
                              </span>
                              <button
                                type="button"
                                onClick={() => saveCell(lineSlot, 'normal', Math.round(seen))}
                                disabled={!filled}
                                title={
                                  filled
                                    ? 'sauvegarder ce scénario'
                                    : 'saisir la valeur en jeu d’abord'
                                }
                                className="text-success hover:text-accent cursor-pointer font-mono text-base leading-none font-extrabold disabled:cursor-not-allowed disabled:opacity-35"
                              >
                                +
                              </button>
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
            </div>
          </div>

          {supportSkills.length > 0 && (
            <p className="text-content-subtle text-center text-[11px]">
              {vars(L.report.supportSkills, {
                names: supportSkills.map((s) => s.name).join(', '),
              })}
            </p>
          )}
        </>
      )}
    </>
  );
}
