'use client';

/**
 * Onglet RÉGLAGES (réglages de COMPTE, hors scénario) : Codex, guilde, titre
 * « Premium Body », arbres de quirks — extrait du composant principal (audit
 * D4 phase 2, 25/08/2026 — JSX déplacé tel quel ; l'état localStorage reste
 * au parent, via useScenarioState).
 */
import { GameText } from '@/components/ui/GameText';
import type { Props } from './contracts';
import { Card, Stepper } from './ui';

export function SettingsTab({
  codexLvl,
  setCodexLvl,
  codexTiers,
  guildLvl,
  setGuildLvl,
  guildTiers,
  premiumOn,
  setPremiumOn,
  titleHpPct,
  quirks,
  quirkLvls,
  setQuirkLvls,
  labels: L,
}: Pick<Props, 'codexTiers' | 'guildTiers' | 'titleHpPct' | 'quirks'> & {
  codexLvl: number;
  setCodexLvl: (next: number | ((prev: number) => number)) => void;
  guildLvl: number;
  setGuildLvl: (next: number | ((prev: number) => number)) => void;
  premiumOn: boolean;
  setPremiumOn: (next: boolean | ((prev: boolean) => boolean)) => void;
  quirkLvls: Record<number, number>;
  setQuirkLvls: (
    next: Record<number, number> | ((prev: Record<number, number>) => Record<number, number>),
  ) => void;
  labels: Props['labels'];
}) {
  return (
    <div className="mx-auto w-full max-w-3xl space-y-4">
      <p className="text-content-subtle text-center text-xs">{L.settings.subtitle}</p>

      {/* Codex (archive) : % de la stat de BASE seule, HORS multiplicateur
            de buffs (CalcFinalStat § 3) — le moteur devra retrancher ce terme
            de la fiche saisie avant d'appliquer les buffs (27/07/2026). */}
      <Card title={L.settings.codex}>
        <div className="flex items-center gap-3">
          {/* La courbe est indexée PAR NIVEAU : [0] = niveau 0 (0 %),
                [1..11] = les 11 paliers du jeu. */}
          <span className="text-content-muted min-w-0 flex-1 font-mono text-[11px] tabular-nums">
            {codexLvl > 0 && codexTiers[codexLvl]
              ? ['atk', 'def', 'hp']
                  .map(
                    (s) =>
                      `${s.toUpperCase()} +${(codexTiers[codexLvl][s as 'atk' | 'def' | 'hp'] ?? 0) / 10}%`,
                  )
                  .join(' · ')
              : '—'}
          </span>
          <Stepper
            value={Math.min(codexLvl, codexTiers.length - 1)}
            min={0}
            max={codexTiers.length - 1}
            onChange={setCodexLvl}
            format={(v) => `Lv ${v}`}
          />
        </div>
      </Card>

      {/* Guilde : buff MAX_HP (§ 16.2) — le NIVEAU est un réglage de
            compte ; son application dépend du MODE du contenu (preset) ou de
            la coche de la cible manuelle. */}
      <Card title={L.settings.guild}>
        <div className="flex items-center gap-3">
          {/* Indexé PAR NIVEAU : [0] = sans guilde (0 %), [1..10] = paliers. */}
          <span className="text-content-muted min-w-0 flex-1 font-mono text-[11px] tabular-nums">
            {guildLvl > 0 && guildTiers[guildLvl] ? `HP +${guildTiers[guildLvl]}%` : '—'}
          </span>
          <Stepper
            value={Math.min(guildLvl, guildTiers.length - 1)}
            min={0}
            max={guildTiers.length - 1}
            onChange={setGuildLvl}
            format={(v) => `Lv ${v}`}
          />
        </div>
      </Card>

      {/* Titre « Premium Body » (+5 % PV, § 16.2) : accordé côté SERVEUR
            (pass) — introuvable en jeu (Sevih 05/08/2026), exposé ici pour
            que les fixtures disent s'il matche quelque part. */}
      <Card title={L.settings.premium}>
        <label className="flex cursor-pointer items-center gap-3">
          <span className="text-content-muted min-w-0 flex-1 font-mono text-[11px] tabular-nums">
            {premiumOn && titleHpPct > 0 ? `HP +${titleHpPct}%` : '—'}
          </span>
          <input
            type="checkbox"
            checked={premiumOn}
            onChange={() => setPremiumOn(!premiumOn)}
            className="accent-accent h-4 w-4 cursor-pointer"
          />
        </label>
      </Card>

      {/* Tout à 0 / tout au max — réglage de COMPTE, pas de scénario. */}
      <div className="flex justify-center gap-2">
        <button
          type="button"
          onClick={() => setQuirkLvls({})}
          className="border-line-subtle text-content-subtle hover:text-content h-8 cursor-pointer rounded-lg border border-dashed px-3 text-xs"
        >
          {L.settings.reset}
        </button>
        <button
          type="button"
          onClick={() =>
            setQuirkLvls(
              Object.fromEntries(quirks.flatMap((g) => g.nodes.map((n) => [n.id, n.maxLevel]))),
            )
          }
          className="border-line-subtle text-content-subtle hover:text-content h-8 cursor-pointer rounded-lg border border-dashed px-3 text-xs"
        >
          {L.settings.activateAll}
        </button>
      </div>
      {quirks.map((g) => (
        <Card key={g.key} title={g.label}>
          <div className="space-y-1.5">
            {g.nodes.map((n) => {
              const lvl = Math.max(0, Math.min(quirkLvls[n.id] ?? 0, n.maxLevel));
              return (
                <div
                  key={n.id}
                  className={`border-line-subtle bg-surface-sunken/70 flex items-center gap-2.5 rounded-lg border px-2.5 py-2 ${lvl ? '' : 'opacity-60'}`}
                >
                  <span
                    className="grid h-8 w-8 shrink-0 place-items-center rounded-full"
                    style={{
                      background: `radial-gradient(circle, color-mix(in srgb, ${n.color} 22%, #0b0e14) 0%, #0b0e14 78%)`,
                      border: `2px solid ${n.color}`,
                    }}
                  >
                    <img src={n.iconSrc} alt="" className="h-4.5 w-4.5" draggable={false} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-content truncate text-xs font-semibold">{n.name}</p>
                    {/* À 0 : aperçu de l'effet Lv1 (le nœud dit ce qu'il ferait). */}
                    <GameText
                      text={n.texts[Math.max(1, lvl) - 1] ?? ''}
                      className="text-content-muted text-[11px] leading-relaxed whitespace-pre-line"
                    />
                  </div>
                  <Stepper
                    value={lvl}
                    min={0}
                    max={n.maxLevel}
                    onChange={(v) => setQuirkLvls((prev) => ({ ...prev, [n.id]: v }))}
                    format={(v) => `${v}/${n.maxLevel}`}
                  />
                </div>
              );
            })}
          </div>
        </Card>
      ))}
    </div>
  );
}
