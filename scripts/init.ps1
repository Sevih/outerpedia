<#
.SYNOPSIS
  init — orchestrateur d'installation d'outerpedia-v3 sur une machine Windows.

.DESCRIPTION
  Enchaîne, de façon IDEMPOTENTE, tout ce qui met le projet en état de marche
  après un `git clone` + dépôt du `.env.local` :

    1. prérequis (fail-fast avec message si un secret / outil lourd manque) ;
    2. toolchain : Node 24 (nvm) → pnpm 11.13 (corepack) → `pnpm install` ;
    3. rclone (fetch des outils datamine depuis R2), installé via winget si absent ;
    4. pipeline data : pull → dump → extract → regen → assets:collect
       (nécessite LDPlayer lancé + jeu installé ; sauté proprement sinon).

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
# visible dans la session. No-op s'il est déjà présent.
function Install-Tool ([string]$probe, [string]$wingetId, [string]$label) {
  if (Have $probe) { Info "$label présent."; return }
  if (-not (Have 'winget')) { Warn "$label absent et winget introuvable — installe-le à la main."; return }
  Warn "$label absent — installation via winget ($wingetId)."
  & winget install --id $wingetId -e --accept-source-agreements --accept-package-agreements
  Update-SessionEnv
  if (-not (Have $probe)) { [void](Add-WingetExeToPath "$probe.exe") }
  if (Have $probe) { Info "$label disponible." }
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
# .NET (Il2CppDumper) et rclone (fetch R2) sont installés s'ils manquent.

Say 'Outils système (winget)'
if (Test-Admin) {
  Warn "Session ADMINISTRATEUR détectée — À ÉVITER. Les fichiers créés (dont .git au clone) seront possédés par « Administrateurs » et git en utilisateur normal les refusera (« dubious ownership »). Lance plutôt clone + init en utilisateur NORMAL. Seul le tout premier 'nvm use' sur une machine SANS Node exige l'admin (à faire à part)."
}
Install-Tool 'git'    'Git.Git'                    'git'
Install-Tool 'nvm'    'CoreyButler.NVMforWindows'  'nvm-windows'
Install-Tool 'dotnet' 'Microsoft.DotNet.Runtime.8' '.NET 8 runtime (Il2CppDumper)'
Install-Tool 'rclone' 'Rclone.Rclone'              'rclone'

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
  & corepack prepare pnpm@11.13.0 --activate
  if ($LASTEXITCODE -ne 0) {
    Warn "corepack prepare a échoué (clés npm périmées ?) — mise à jour de corepack."
    Run 'npm' @('install', '-g', 'corepack@latest')
    Run 'corepack' @('enable')
    Run 'corepack' @('prepare', 'pnpm@11.13.0', '--activate')
  }
  Info "pnpm $(pnpm -v)."

  Say 'Dépendances (pnpm install)'
  Run 'pnpm' @('install')
}

# --- 3. Pipeline data (émulateur requis) ---------------------------------------

function Get-AdbExe {
  if ($env:ADB_PATH) { return $env:ADB_PATH }
  if (Have 'adb') { return 'adb' }
  $ld = 'C:\LDPlayer\LDPlayer9\adb.exe'
  if (Test-Path $ld) { return $ld }
  return $null
}

function Test-Emulator {
  $adb = Get-AdbExe
  if (-not $adb) { return $false }
  try {
    $out = & $adb devices 2>$null
    return @($out | Where-Object { $_ -match 'device$' -and $_ -notmatch 'List of devices' }).Count -gt 0
  } catch { return $false }
}

# assets:pull (pas assets:collect) : on récupère l'ensemble d'images PUBLIÉ sur R2
# — ce que le site sert réellement, curés/manuels inclus. assets:collect ne
# régénère QUE les sprites extraits du jeu et rate ces assets-là. (collect+push
# reste le flux de PUBLICATION quand on datamine du nouveau, cf. newPatch.md.)
$dataCmds = @('datagen:pull', 'datagen:dump', 'datagen:extract', 'datagen:convert', 'datagen:regen', 'assets:pull')

if ($SkipData) {
  Say 'Données (sauté : -SkipData)'
} elseif (-not (Test-Emulator)) {
  Say 'Données'
  Warn "Émulateur non détecté (LDPlayer lancé + jeu installé requis). Pipeline data sauté."
  Info "Une fois l'émulateur prêt, relance simplement ce script, ou à la main :"
  foreach ($c in $dataCmds) { Info "  pnpm $c" }
} else {
  Say 'Données (émulateur détecté)'
  foreach ($c in $dataCmds) { Run 'pnpm' @($c) }
}

# --- Fin -----------------------------------------------------------------------

Say 'Terminé'
Write-Host "Projet prêt. Lance le dev :" -ForegroundColor Green
Write-Host "  pnpm dev" -ForegroundColor Green
