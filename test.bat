@echo off
setlocal enabledelayedexpansion
set build_lib=true
if "%1"=="--sample-only" (
    set build_lib=false
)
echo DEBUG: build_lib value is !build_lib!
if "!build_lib!"=="true" (
    echo BUILD BLOCK
    goto :end
) else (
    echo DEBUG: Entering sample-only block
    echo ========================================
    echo Running SampleApp only (skipping library build)
    echo ========================================
    echo.
    cd SampleApp
    REM Step 1: Install dependencies
    echo.
    echo Step 1: Installing dependencies...
    echo Current directory: %CD%
    echo Running: npm install
    call npm install
    set npm_install_exit_code=%errorlevel%
    echo npm install exit code: !npm_install_exit_code!
    if !npm_install_exit_code! neq 0 (
        echo ERROR: npm install failed with exit code !npm_install_exit_code!
        echo.
        echo Please check the npm install output above for errors.
        pause
        exit /b 1
    )
    echo Step 1 completed successfully!

    REM Step 2: Update assets
    echo.
    echo Step 2: Updating assets...
    echo Current directory: %CD%
    if exist "src\assets\pdfjs" (
        echo Removing old assets...
        rmdir /s /q "src\assets\pdfjs"
    )
    echo Copying new assets from node_modules...
    xcopy "node_modules\ng2-pdfjs-viewer\pdfjs" "src\assets\pdfjs" /e /i /y
    set xcopy_exit_code=%errorlevel%
    echo xcopy exit code: !xcopy_exit_code!
    if !xcopy_exit_code! neq 0 (
        echo ERROR: Asset copy failed with exit code !xcopy_exit_code!
        echo.
        echo Please check the xcopy output above for errors.
        pause
        exit /b 1
    )
    echo Step 2 completed successfully!

    REM Step 3: Stop any existing process on port 4200
    echo.
    echo Step 3: Stopping any existing process on port 4200...
    echo Current directory: %CD%
    for /f "tokens=5" %%a in ('netstat -aon ^| findstr :4200') do (
        echo Stopping process with PID: %%a
        taskkill /f /pid %%a >nul 2>&1
    )
    echo Port 4200 cleared.

    REM Step 4: Start the app with log capture
    echo.
    echo Step 4: Starting Angular dev server with log capture...
    echo Current directory: %CD%
    echo ========================================
    echo Build complete! Starting SampleApp with LOG CAPTURE...
    echo ========================================
    echo.
    echo Starting Angular dev server in background...
    start "Angular Dev Server" cmd /k "npm start"
    echo Waiting for server to start (up to 2 minutes)...
    set max_attempts=60
    set attempt=0
    goto check_server_loop
)

:check_server_loop
set /a attempt+=1
echo Checking server availability (attempt !attempt!/!max_attempts!)...
REM Try multiple methods to check if server is running
curl -s -o nul -w "%%{http_code}" http://localhost:4200 > temp_status.txt 2>nul
set /p server_check=<temp_status.txt
del temp_status.txt >nul 2>&1
REM Also try a simple connection test
netstat -an | findstr ":4200" | findstr "LISTENING" >nul 2>&1
set port_check=%errorlevel%
echo DEBUG: server_check=!server_check!, port_check=!port_check!
REM Check if either method indicates server is ready
if "!server_check!"=="200" (
    echo Server is responding with HTTP 200!
    goto start_logs
)
if !port_check! equ 0 (
    echo Port 4200 is listening!
    goto start_logs
)
if !attempt! lss !max_attempts! (
    echo Server not ready yet, waiting 10 seconds...
    timeout /t 10 /nobreak >nul
    goto check_server_loop
)
echo Server failed to start within !max_attempts! attempts
echo The Angular dev server may still be starting up
echo You can manually check http://localhost:4200
echo.
echo Starting log capture anyway (may fail if server isn't ready)...
goto start_logs

:start_logs
    echo.
    echo ========================================
    echo   Console Logs Will Appear Below
    echo ========================================
    echo.
    echo Testing ng2-pdfjs-viewer features with real-time logging!
    echo You can now test:
    echo    - Cursor modes (Hand, Select, Zoom)
    echo    - Scroll modes (Vertical, Horizontal, Wrapped, Page)
    echo    - Spread modes (None, Odd, Even)
    echo    - Zoom levels and locale changes
    echo    - Auto actions (download, print, rotate)
    echo.
    echo Press Ctrl+C to stop logging and close browser.
    echo.
    call node log-capture.js
    goto end_script

:end_script
endlocal
exit /b 
