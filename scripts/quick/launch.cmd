@echo off
rem Lanceur du raccourci Windows (cf. install-launcher.ts).
rem
rem Pendant Windows de launch.sh, volontairement plus simple : la fenetre de
rem console RESTE visible et sert d'indicateur (l'outil tourne tant qu'elle est
rem ouverte, la fermer l'arrete). Pas de sonde ni de notification a construire
rem comme sous Linux : une erreur s'affiche la, et le `pause` la retient au lieu
rem de la faire disparaitre avec la fenetre.
rem
rem Sans pnpm, comme sous Linux : node + le tsx du depot.
title Outerpedia quick
cd /d "%~dp0..\.."

node node_modules\tsx\dist\cli.mjs scripts\quick\server.ts

rem Code 3 = "Relancer quick" (RESTART_EXIT_CODE, restart.ts) : le nouveau
rem quick tourne deja, dans CETTE console (sortie heritee), qui reste ouverte
rem tant qu'il tourne. Ni "arrete" ni `pause` : il n'est pas arrete.
if "%ERRORLEVEL%"=="3" (
  echo.
  echo quick a ete relance : il continue dans cette fenetre.
  exit /b 0
)

echo.
echo Le serveur s'est arrete.
pause
