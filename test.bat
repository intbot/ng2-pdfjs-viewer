@echo off
setlocal enabledelayedexpansion

echo ========================================
echo BUILD AND RUN (playground)
echo ========================================
echo.
echo Builds the ng2-pdfjs-viewer library and runs the playground demo against
echo your local build (linked with yalc), serving on http://localhost:4300.
echo Requires Node ^>= 22.12 and TypeScript 6.0 (Angular 22 toolchain).
echo.
echo USAGE: test.bat [--play-only]
echo   --play-only : skip the library rebuild; just run the playground
echo.

set build_lib=true
if "%1"=="--play-only" set build_lib=false

if "!build_lib!"=="true" (
    echo === 1/3 Building the library ===
    cd lib
    if not exist "node_modules" ( call npm install || goto :fail )
    call npm run build || goto :fail
    echo === Publishing the build to yalc ===
    call yalc publish || goto :fail
    cd ..
)

echo === 2/3 Linking the local build into the playground ===
cd playground
if not exist "node_modules" ( call npm install || goto :fail )
REM yalc link overrides the published ng2-pdfjs-viewer with the local build
REM without touching package.json (which must stay ^26 for the Vercel deploy).
call yalc link ng2-pdfjs-viewer || goto :fail

echo === Stopping any dev server already on port 4300 ===
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :4300') do taskkill /f /pid %%a >nul 2>&1

echo === 3/3 Starting the playground on http://localhost:4300 ===
call npm start
goto :eof

:fail
echo.
echo BUILD FAILED - see the error above.
cd /d "%~dp0"
exit /b 1
