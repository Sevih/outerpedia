'use client';

import { useSyncExternalStore } from 'react';

/**
 * HORLOGE — le temps qui passe, vu comme un store externe.
 *
 * Le temps est par nature hors-React : le lire pendant le rendu est impur, le
 * poser depuis un effet violerait `setState`-dans-un-effet. Un store qui bat la
 * seconde et notifie ses abonnés est la forme propre. Snapshot serveur = `null` :
 * rien ne s'affiche au SSR, donc pas de divergence d'hydratation — et de toute
 * façon un compte à rebours figé au build n'aurait aucun sens.
 *
 * Le store ne connaît QUE l'instant présent. La CIBLE lui est étrangère : c'est
 * la donnée qui la fixe (`SingularityState.nextChange`) et le composant qui fait
 * la soustraction. L'horloge visait auparavant « le prochain minuit UTC » EN DUR —
 * ce qui était faux en phase de récompense, où rien ne se passe à minuit : elle
 * décomptait vers une échéance qui n'existait pas.
 */
const clock = {
  now: null as number | null,
  listeners: new Set<() => void>(),
  timer: undefined as ReturnType<typeof setInterval> | undefined,
  tick() {
    clock.now = Date.now();
    for (const l of clock.listeners) l();
  },
  subscribe(listener: () => void) {
    clock.listeners.add(listener);
    if (!clock.timer) {
      clock.tick();
      clock.timer = setInterval(clock.tick, 1000);
    }
    return () => {
      clock.listeners.delete(listener);
      if (clock.listeners.size === 0) {
        clearInterval(clock.timer);
        clock.timer = undefined;
      }
    };
  },
  getSnapshot: () => clock.now,
  getServerSnapshot: () => null,
};

/**
 * Format NUMÉRIQUE (`4:12:03`, `61:24:51`), volontairement sans unités : la V2
 * écrivait « 4h 12m 3s » avec des suffixes anglais EN DUR, jamais traduits. Des
 * chiffres se lisent dans les cinq langues.
 *
 * Les heures ne sont PAS bornées à 24 : l'attente dépasse trois jours en phase de
 * récompense, et « 61:24:51 » se lit sans ambiguïté là où un compteur de jours
 * réintroduirait une unité à traduire.
 */
function format(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${h}:${pad(m)}:${pad(s)}`;
}

/**
 * « Prochain reset dans 4:12:03 ». `template` porte `{time}`, déjà localisé — et
 * il doit NOMMER l'échéance que `target` désigne : les deux se choisissent
 * ensemble, sans quoi le compteur dit vrai en chiffres et faux en mots.
 */
export function SingularityCountdown({
  target,
  template,
  className,
}: {
  /** Instant visé (epoch ms, UTC) — cf. `SingularityState.nextChange`. */
  target: number;
  template: string;
  className?: string;
}) {
  const now = useSyncExternalStore(clock.subscribe, clock.getSnapshot, clock.getServerSnapshot);
  if (now === null) return <span className={className} aria-hidden />;
  return <span className={className}>{template.replace('{time}', format(target - now))}</span>;
}
