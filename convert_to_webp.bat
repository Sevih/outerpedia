@echo off
setlocal enabledelayedexpansion

:: Chemin vers cwebp.exe
set "CWEBP=C:\Users\colli\Downloads\libwebp-1.5.0-windows-x64\bin\cwebp.exe"

:: Dossier d'entrée
set "INPUT_DIR=public\images"
set "OUTPUT_DIR=public\images"

:: Qualité WebP
set "QUALITY=85"

echo.
echo 🖼️ Conversion récursive des images en .webp...
echo.

for /r "%INPUT_DIR%" %%f in (*.jpg *.jpeg *.png *.gif) do (
    set "SRC=%%f"
    set "WEBP=%%~dpnf.webp"

    if exist "!WEBP!" (
        for %%a in ("!SRC!") do set "SRC_DATE=%%~ta"
        for %%b in ("!WEBP!") do set "WEBP_DATE=%%~tb"

        if "!SRC_DATE!" GTR "!WEBP_DATE!" (
            echo ♻️  Source plus récente, reconversion de %%f...
            %CWEBP% -q %QUALITY% "!SRC!" -o "!WEBP!"
        ) else (
            echo 🔵 Déjà converti et à jour : %%f
        )
    ) else (
        echo 🛠️  Conversion nouvelle de %%f...
        %CWEBP% -q %QUALITY% "!SRC!" -o "!WEBP!"
    )
)

echo.
echo ✅ Conversion terminée !
pause
