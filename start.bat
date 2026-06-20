@echo off
:: =========================================================================
:: Sui Nexus Local Development Orchestrator for Windows
:: =========================================================================
title Sui Nexus Local Node Sandbox
color 0B

echo =========================================================================
echo       ⚡ SUI NEXUS - MULTI-FIELD EXECUTABLE KNOWLEDGE PROTOCOL ⚡
echo             [Sui Move Enterprise Protocol Suite]
echo =========================================================================
echo.

:: Check for Node.js Installation
where node >nul 2>nul
if %errorlevel% neq 0 (
    color 0C
    echo ERROR: Node.js was not detected on your system's PATH.
    echo Please install Node.js v18 or newer to run this system locally.
    echo Download link: https://nodejs.org/
    echo.
    pause
    exit /b 1
)

:: Echo environment diagnostic
echo [*] Node.js environment detected successfully!
for /f "tokens=*" %%i in ('node -v') do set NODE_VERSION=%%i
echo [*] Node Version: %NODE_VERSION%
echo.

:: Install dependencies if node_modules folder is absent
if not exist node_modules (
    echo [!] "node_modules" not found. Commencing automated dependency setup...
    echo [*] Running "npm install"... This may take a moment depending on network speed.
    call npm install
    if %errorlevel% neq 0 (
        color 0C
        echo.
        echo ERROR: NPM dependency installation failed.
        echo Please verify your internet connection and run "npm install" manually.
        echo.
        pause
        exit /b 1
    )
    echo [*] Dependencies installed perfectly!
    echo.
) else (
    echo [*] "node_modules" detected. Advancing to developer pipeline...
)

:: Clear screen to present clean dashboard
cls
echo =========================================================================
echo       ⚡ SUI NEXUS - DEFI LAYERS & LIVE MUTATION CHAMBERS ⚡
echo            Local Development Process Initiating on Port 3000
echo =========================================================================
echo.
echo  - Shared State API Proxy:  Enabled
echo  - Port Target Gateway:     http://localhost:3000
echo  - Web Application Preview: http://localhost:3000/
echo.
echo [*] Starting local developer cluster via: npm run dev
echo [Note: Press Ctrl+C in this terminal window to stop the server at any time.]
echo -------------------------------------------------------------------------
echo.

call npm run dev

if %errorlevel% neq 0 (
    color 0C
    echo.
    echo ERROR: The Sui Nexus process terminated unexpectedly with error code %errorlevel%.
    echo Please resolve any configuration file discrepancies and retry.
    echo.
    pause
)
