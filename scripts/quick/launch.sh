#!/usr/bin/env bash
# Lanceur de l'icône du bureau (cf. install-launcher.ts).
#
# Volontairement SANS pnpm : une application démarrée depuis le menu n'hérite
# pas de ~/.bashrc, et pnpm vit dans ~/.local/bin — l'icône aurait échoué en
# silence. On appelle donc node (/usr/bin) et le tsx du dépôt directement.
#
# Rien ne s'affiche au démarrage (Terminal=false) : la sortie part dans un
# journal, et seul un DÉMARRAGE raté remonte en notification.
#
# « Démarrage raté » = le serveur n'écoute pas au bout de READY_TIMEOUT, ou le
# processus meurt avant. Ce qui arrive APRÈS ne déclenche plus rien : la
# première version alertait sur n'importe quelle sortie non nulle, donc un
# serveur parfaitement démarré puis arrêté (SIGTERM, fin de session) annonçait
# « Démarrage impossible ». Faux négatif vu le 2026-09-11.
#
# Le cas « déjà lancé » n'est PAS un échec : le serveur rend la main (exit 0)
# après avoir rouvert le navigateur, et le port répond — la sonde le voit.
set -u
cd "$(dirname "$(readlink -f "$0")")/../.." || exit 1

LOG="${XDG_RUNTIME_DIR:-/tmp}/outerpedia-quick.log"
PORT="${QUICK_PORT:-4747}"
READY_TIMEOUT=60 # × 0,25 s = 15 s, large pour un premier démarrage à froid

# APPEND, jamais de troncature : relancer ne doit pas effacer la trace de
# l'échec qu'on cherche justement à lire.
printf '\n=== %s ===\n' "$(date '+%F %T')" >>"$LOG"

node node_modules/tsx/dist/cli.mjs scripts/quick/server.ts >>"$LOG" 2>&1 &
pid=$!

# Sonde sans dépendance (/dev/tcp est natif bash — ni ss ni curl requis).
listening() { (exec 3<>"/dev/tcp/127.0.0.1/${PORT}") 2>/dev/null; }

fail() {
  notify-send -u critical "Outerpedia quick" "$1 — voir $LOG" 2>/dev/null
  exit 1
}

for _ in $(seq 1 "$READY_TIMEOUT"); do
  if listening; then
    ready=1
    break
  fi
  # Mort avant d'écouter : c'est LE vrai échec de démarrage.
  kill -0 "$pid" 2>/dev/null || fail "Le serveur s'est arrêté au démarrage"
  sleep 0.25
done

[ "${ready:-0}" = 1 ] || fail "Le serveur n'écoute pas sur le port ${PORT}"

# Démarrage acquis : on accompagne le serveur jusqu'au bout, en silence.
wait "$pid" 2>/dev/null
