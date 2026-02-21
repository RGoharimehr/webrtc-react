@echo off
:: repo.bat — Omniverse WebRTC Monitor (Kit App Template launcher)
::
:: Usage:
::   .\repo.bat build           — build the application
::   .\repo.bat launch          — launch the desktop viewer
::   .\repo.bat launch --app apps\omni.webrtc_monitor.streaming.kit
::                              — launch with WebRTC streaming enabled
::
:: This script is identical in structure to the one provided by the upstream
:: kit-app-template repository. It bootstraps Packman (NVIDIA's package manager)
:: and delegates to repoman.

SETLOCAL ENABLEDELAYEDEXPANSION
set OMNI_REPO_ROOT="%~dp0"

IF NOT EXIST "%~dp0repo-cache.json" goto :RepoCacheEnd

for /f "usebackq tokens=*" %%i in (`powershell -NoProfile -Command "$PM_PACKAGES_ROOT = (Get-Content '%~dp0repo-cache.json' | ConvertFrom-Json).PM_PACKAGES_ROOT; if ([System.IO.Path]::IsPathRooted($PM_PACKAGES_ROOT)) { Write-Output ('absolute;' + $PM_PACKAGES_ROOT) } else { Write-Output ('relative;' + $PM_PACKAGES_ROOT) }"`) do (
    for /f "tokens=1,2 delims=;" %%A in ("%%i") do (
        if /i "%%A" == "relative" (
            set PM_PACKAGES_ROOT=%~dp0%%B
        ) else (
            set PM_PACKAGES_ROOT=%%B
        )
    )
)

:RepoCacheEnd

call "%~dp0tools\packman\python.bat" "%~dp0tools\repoman\repoman.py" %*
if %errorlevel% neq 0 ( goto Error )

:Success
ENDLOCAL
exit /b 0

:Error
ENDLOCAL
exit /b %errorlevel%
