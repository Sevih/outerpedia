<#
.SYNOPSIS
  init — orchestrateur d'installation d'outerpedia-v3 sur une machine Windows.

.DESCRIPTION
  Enchaîne, de façon IDEMPOTENTE, tout ce qui met le projet en état de marche
  après un `git clone` + dépôt du `.env.local` :

    1. prérequis (fail-fast avec message si un secret / outil lourd manque) ;
    2. toolchain : Node 24 (nvm) → pnpm 11.13 (corepack) → `pnpm install` ;
    3. rclone (fetch des outils datamine depuis R2), installé via winget si absent ;
    4. pipeline data : [premier dump] → patch (pull → extract → … → promote en
       DRY, la revue reste humaine) → assets:pull
       (nécessite le client Steam d'OUTERPLANE installé ; sauté proprement sinon).

  VOLONTAIREMENT MINCE : il ne fait qu'APPELER les commandes déjà existantes
  (`corepack`, `pnpm`, `pnpm datagen:*`). Toute la logique fragile (adb, chemins
  Windows, extraction APK, dé-doublonnage) vit côté Node/tsx et n'est PAS
  dupliquée ici. Le choix PowerShell ne porte donc que sur le collage.

  Ré-exécutable sans risque : chaque étape est un no-op si déjà satisfaite.

.PARAMETER SkipData
  Ne lance pas le pipeline data (utile pour préparer le toolchain sans émulateur).

.PARAMETER SkipToolchain
  Saute Node/pnpm/install (si déjà en place) et va aux étapes data.

.EXAMPLE
  powershell -ExecutionPolicy Bypass -File scripts\init.ps1
#>
[CmdletBinding()]
param(
  [switch]$SkipData,
  [switch]$SkipToolchain
)

$ErrorActionPreference = 'Stop'

# Racine repo = dossier parent de scripts/. On y travaille pour tout le run.
$RepoRoot = Split-Path -Parent $PSScriptRoot
Set-Location $RepoRoot

# --- petits helpers ------------------------------------------------------------

function Say  ([string]$m) { Write-Host "`n=== $m ===" -ForegroundColor Cyan }
function Info ([string]$m) { Write-Host "  $m" -ForegroundColor Gray }
function Warn ([string]$m) { Write-Host "! $m" -ForegroundColor Yellow }
function Die  ([string]$m) { Write-Host "x $m" -ForegroundColor Red; exit 1 }
function Have ([string]$c) { [bool](Get-Command $c -ErrorAction SilentlyContinue) }

# Recharge le PATH de la session depuis le registre (Machine + User). Indispensable
# après un `winget install` : sinon le binaire fraîchement posé reste invisible tant
# qu'on n'a pas rouvert un terminal.
function Update-SessionPath {
  $machine = [Environment]::GetEnvironmentVariable('Path', 'Machine')
  $user = [Environment]::GetEnvironmentVariable('Path', 'User')
  $env:Path = (@($machine, $user) | Where-Object { $_ }) -join ';'
}

# Dernier recours : ajoute au PATH de session le dossier d'un exe trouvé sous les
# packages winget (certains paquets portables n'exposent pas de shim sur le PATH).
function Add-WingetExeToPath ([string]$exeName) {
  $root = Join-Path $env:LOCALAPPDATA 'Microsoft\WinGet\Packages'
  $found = Get-ChildItem $root -Recurse -Filter $exeName -ErrorAction SilentlyContinue | Select-Object -First 1
  if ($found) { $env:Path = "$($found.DirectoryName);$env:Path"; return $true }
  return $false
}

# Recharge PATH + variables d'env clés (NVM_*) depuis le registre après une install
# winget : sans ça, l'outil fraîchement posé reste invisible dans la session.
function Update-SessionEnv {
  Update-SessionPath
  foreach ($v in 'NVM_HOME', 'NVM_SYMLINK') {
    $val = [Environment]::GetEnvironmentVariable($v, 'User')
    if (-not $val) { $val = [Environment]::GetEnvironmentVariable($v, 'Machine') }
    if ($val) { Set-Item -Path "Env:$v" -Value $val }
  }
}

# Session PowerShell élevée (admin) ?
function Test-Admin {
  $id = [Security.Principal.WindowsIdentity]::GetCurrent()
  return ([Security.Principal.WindowsPrincipal]$id).IsInRole([Security.Principal.WindowsBuiltinRole]::Administrator)
}

# Installe un outil via winget s'il manque, puis rafraîchit l'env pour le rendre
# visible dans la session. No-op s'il est déjà présent. `$ok` = test de présence
# quand celle de la commande ne suffit pas (une version précise).
function Install-Tool ([string]$probe, [string]$wingetId, [string]$label, [scriptblock]$ok = { Have $probe }) {
  if (& $ok) { Info "$label présent."; return }
  if (-not (Have 'winget')) { Warn "$label absent et winget introuvable — installe-le à la main."; return }
  Warn "$label absent — installation via winget ($wingetId)."
  & winget install --id $wingetId -e --accept-source-agreements --accept-package-agreements
  Update-SessionEnv
  if (-not (& $ok)) { [void](Add-WingetExeToPath "$probe.exe") }
  if (& $ok) { Info "$label disponible." }
  else { Warn "$label installé mais pas visible dans la session — rouvre un terminal et relance (idempotent)." }
}

# Lance une commande native et STOPPE net si le code de sortie n'est pas 0.
function Run ([string]$exe, [string[]]$argv) {
  Info "> $exe $($argv -join ' ')"
  & $exe @argv
  if ($LASTEXITCODE -ne 0) { Die "échec ($LASTEXITCODE) : $exe $($argv -join ' ')" }
}

# --- 1. Prérequis --------------------------------------------------------------

Say 'Prérequis'

if (-not (Test-Path (Join-Path $RepoRoot '.env.local'))) {
  Die ".env.local manquant à la racine. Dépose tes secrets (voir docs/procedure/installation.md §2.1) puis relance."
}
Info ".env.local présent."

if (-not (Test-Path (Join-Path $RepoRoot 'package.json'))) {
  Die "package.json introuvable — lance ce script depuis un clone d'outerpedia-v3."
}

# --- 1b. Outils système auto-installables (winget) -----------------------------
# git : normalement DÉJÀ là (il a fallu cloner ce repo) — no-op. nvm-windows,
# .NET 10 (ilspycmd, `datagen:dump`) et rclone (fetch R2) sont installés s'ils manquent.

Say 'Outils système (winget)'
if (Test-Admin) {
  Warn "Session ADMINISTRATEUR détectée — À ÉVITER. Les fichiers créés (dont .git au clone) seront possédés par « Administrateurs » et git en utilisateur normal les refusera (« dubious ownership »). Lance plutôt clone + init en utilisateur NORMAL. Seul le tout premier 'nvm use' sur une machine SANS Node exige l'admin (à faire à part)."
}
Install-Tool 'git'    'Git.Git'                    'git'
Install-Tool 'nvm'    'CoreyButler.NVMforWindows'  'nvm-windows'
# ilspycmd cible net10.0 : un `dotnet` qui n'aurait que le runtime 8 passerait le
# simple test de commande, puis `datagen:dump` échouerait.
Install-Tool 'dotnet' 'Microsoft.DotNet.Runtime.10' '.NET 10 runtime (ilspycmd)' {
  (Have 'dotnet') -and [bool](& dotnet --list-runtimes | Select-String '^Microsoft\.NETCore\.App 10\.')
}
Install-Tool 'rclone' 'Rclone.Rclone'              'rclone'

# --- 1c. Outillage python (étapes datagen) -------------------------------------
# UnityPy + fontTools servent les trois étapes python du projet (face-layout,
# sprite-rect, font-metrics). Elles sont FACULTATIVES par machine : `refresh`
# saute l'étape avec un avertissement si son import échoue, le JSON committé
# prenant le relais. On n'installe donc PAS python via winget (gros runtime pour
# des étapes optionnelles) — mais s'il est là, on pose TOUT le requirements, sans
# quoi la dépendance ne vit que dans la mémoire de l'autre machine (c'est
# exactement comme ça que le portable s'est retrouvé sans UnityPy, puis sans
# fontTools).

Say 'Outillage python (datagen)'
$reqs = Join-Path $RepoRoot 'datagen/requirements.txt'
if (-not (Have 'python')) {
  Warn "python absent — les étapes python du datagen seront sautées par le refresh (non bloquant). Pour les activer : installe Python, puis 'python -m pip install -r datagen/requirements.txt'."
} else {
  & python -m pip install --disable-pip-version-check -q -r $reqs
  if ($LASTEXITCODE -ne 0) {
    Warn "pip install a échoué — les étapes python du datagen seront sautées par le refresh (non bloquant)."
  } else {
    Info 'Outillage python en place (face-layout, sprite-rect, font-metrics jouables).'
  }
}

# --- 2. Toolchain : Node 24 → pnpm → install -----------------------------------

if ($SkipToolchain) {
  Say 'Toolchain (sauté : -SkipToolchain)'
} else {
  Say 'Node 24'
  $nodeMajor = 0
  if (Have 'node') { $nodeMajor = [int]((node -v).TrimStart('v').Split('.')[0]) }
  if ($nodeMajor -ge 24) {
    Info "Node $(node -v) OK."
  } elseif (Have 'nvm') {
    Run 'nvm' @('install', '24')
    # 'nvm use' crée un lien symbolique (NVM_SYMLINK) → requiert l'admin sur une
    # machine neuve. On isole CE besoin d'élévation : surtout ne pas relancer TOUT
    # le script en admin (ça casserait la propriété git des fichiers créés).
    & nvm use 24
    if ($LASTEXITCODE -ne 0) {
      Die "'nvm use 24' a échoué (lien symbolique nvm = admin requis sur machine neuve). Fais UNE fois, dans un terminal ADMIN : ``nvm use 24`` — PUIS relance CE script en utilisateur NORMAL. N'exécute pas le clone / init entier en admin."
    }
    Update-SessionEnv
    if (-not (Have 'node')) { Die "Node introuvable après 'nvm use 24'. Ouvre un nouveau terminal et relance." }
    $nodeMajor = [int]((node -v).TrimStart('v').Split('.')[0])
    if ($nodeMajor -lt 24) { Die "Node toujours < 24 après nvm. Ouvre un nouveau terminal (PATH) et relance." }
    Info "Node $(node -v) actif."
  } else {
    Die "Node >= 24 requis et nvm introuvable (winget a-t-il pu l'installer ?). Installe nvm-windows manuellement puis relance."
  }

  Say 'pnpm 11.13 via corepack'
  Run 'corepack' @('enable')
  # corepack fourni avec Node peut avoir des clés de signature npm périmées
  # (« Cannot find matching keyid ») : on tente, et on répare via corepack@latest.
  & corepack prepare pnpm@11.13.1 --activate
  if ($LASTEXITCODE -ne 0) {
    Warn "corepack prepare a échoué (clés npm périmées ?) — mise à jour de corepack."
    Run 'npm' @('install', '-g', 'corepack@latest')
    Run 'corepack' @('enable')
    Run 'corepack' @('prepare', 'pnpm@11.13.1', '--activate')
  }
  Info "pnpm $(pnpm -v)."

  Say 'Dépendances (pnpm install)'
  Run 'pnpm' @('install')
}

# --- 3. Pipeline data (client Steam requis) ------------------------------------

# Sonde : APPELLE `findSteamInstall` (datagen/extract/steam.ts, exécuté seul) au
# lieu de refaire registre + libraryfolders.vdf + appmanifest ici — la même
# vérité que `datagen:pull`. 0 = trouvé (racine sur stdout), 2 = introuvable,
# autre = la sonde elle-même a échoué (node_modules absent après -SkipToolchain…).
function Find-SteamGame {
  if (-not (Have 'pnpm')) { return @{ Code = -1; Root = $null } }
  $out = & pnpm exec tsx datagen/extract/steam.ts
  return @{ Code = $LASTEXITCODE; Root = ($out | Select-Object -Last 1) }
}

# `datagen:patch` = refresh.ts : pull → re-dump SI le code du jeu a changé →
# extract → convert → étapes python → build → promote en DRY-RUN → damage. La
# donnée committée fait foi : promote n'écrit PAS data/generated, il affiche le
# diff à revoir (`pnpm datagen:promote --apply` pour le valider) ; seul damage y
# écrit en direct, sa revue étant le diff git. `regen` (build + promote --apply)
# écrivait tout sans revue.
#
# `datagen:dump` n'est joué que pour le PREMIER dump : sans empreinte, refresh
# ne décide pas de dumper (cf. `codeChanged`), or `build` lit dump.cs. Ensuite,
# c'est patch qui re-dumpe quand il le faut. Il lit l'install, pas le miroir :
# il peut précéder le pull.
#
# assets:pull (pas assets:collect) : on récupère l'ensemble d'images PUBLIÉ sur R2
# — ce que le site sert réellement, curés/manuels inclus. assets:collect ne
# régénère QUE les sprites extraits du jeu et rate ces assets-là. (collect+push
# reste le flux de PUBLICATION quand on datamine du nouveau, cf. newPatch.md.)
$gamedataRoot = if ($env:GAMEDATA_ROOT) { $env:GAMEDATA_ROOT } else { '.gamedata' }
$dumpStamp = [IO.Path]::Combine($RepoRoot, $gamedataRoot, 'apk', 'dumped', '.dump-stamp.json')
$dataCmds = @(
  if (-not (Test-Path $dumpStamp)) { 'datagen:dump' }
  'datagen:patch'
  'assets:pull'
)

if ($SkipData) {
  Say 'Données (sauté : -SkipData)'
} else {
  Say 'Données'
  $steam = Find-SteamGame
  if ($steam.Code -eq 0) {
    Info "OUTERPLANE (Steam) : $($steam.Root)"
    foreach ($c in $dataCmds) { Run 'pnpm' @($c) }
    Info "Revue : promote a tourné à blanc, data/generated inchangé hors damage (voir git diff). Pour valider : pnpm datagen:promote --apply"
  } else {
    if ($steam.Code -eq 2) {
      Warn "OUTERPLANE (Steam) introuvable — jeu installé et lancé une fois requis (ou OUTERPLANE_STEAM_DIR). Pipeline data sauté."
    } else {
      Warn "Sonde Steam en échec (code $($steam.Code)) — pnpm install fait ? Pipeline data sauté."
    }
    Info "Une fois le jeu prêt, relance simplement ce script, ou à la main :"
    foreach ($c in $dataCmds) { Info "  pnpm $c" }
  }
}

# --- Fin -----------------------------------------------------------------------

Say 'Terminé'
Write-Host "Projet prêt. Lance le dev :" -ForegroundColor Green
Write-Host "  pnpm dev" -ForegroundColor Green
