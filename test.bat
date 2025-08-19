@echo off
setlocal enabledelayedexpansion

echo ========================================
echo BUILD AND TEST SCRIPT
echo ========================================
echo.
echo This script builds the ng2-pdfjs-viewer library and runs the SampleApp.
echo All steps are executed in order and the script will FAIL if any step fails.
echo.
echo USAGE: test.bat [--sample-only]
echo   --sample-only: Skip library build and yalc, run SampleApp only
echo.
echo STEPS EXECUTED IN ORDER (FULL BUILD):
echo 1. Build library - Installs dependencies and builds the library package
echo 2. Publish to yalc - Publishes built library to local yalc repository
echo 3. Update SampleApp - Updates SampleApp to use the latest library version
echo 4. Install dependencies - Installs SampleApp dependencies if needed
echo 5. Update assets - Copies PDF.js assets from library to SampleApp
echo 6. Stop dev server - Kills any existing Angular dev server on port 4200
echo 7. Start dev server - Starts Angular dev server with log capture
echo.
echo STEPS EXECUTED IN ORDER (SAMPLE-ONLY):
echo 1. Install dependencies - Installs SampleApp dependencies if needed
echo 2. Update assets - Copies PDF.js assets from library to SampleApp
echo 3. Stop dev server - Kills any existing Angular dev server on port 4200
echo 4. Start dev server - Starts Angular dev server with log capture
echo.

set build_lib=true
if "%1"=="--sample-only" (
    set build_lib=false
)

if "!build_lib!"=="true" (
    echo ========================================
    echo Building and updating ng2-pdfjs-viewer
    echo ========================================
    echo.
    
    REM Step 1: Build the library
    echo.
    echo Step 1: Building library...
    cd lib
    echo Current directory: %CD%
    
    REM Check if node_modules exists, install if needed
    if exist "node_modules" (
        echo node_modules found, skipping npm install...
    ) else (
        echo node_modules not found, installing dependencies...
        echo Running: npm install
        call npm install
        set npm_install_exit_code=%errorlevel%
        if !npm_install_exit_code! neq 0 (
            echo ERROR: lib npm install failed with exit code !npm_install_exit_code!
            echo.
            echo Please check the npm install output above for errors.
            pause
            exit /b 1
        )
        echo ✅ lib dependencies installed
    )
    
    echo Running: npm run build
    echo (This may take a few minutes...)
    call npm run build
    set build_exit_code=%errorlevel%
    echo.
    echo Build exit code: !build_exit_code!
    if !build_exit_code! neq 0 (
        echo ERROR: Library build failed with exit code !build_exit_code!
        echo.
        echo Please check the build output above for errors.
        echo If the build is taking too long, try running 'npm run build' manually in the lib directory.
        pause
        exit /b 1
    )
    echo Step 1 completed successfully!

    REM Verify build output exists
    if not exist "dist" (
        echo ERROR: Build output directory 'dist' not found!
        echo The build may have failed silently.
        pause
        exit /b 1
    )
    echo Build verification: dist directory found

    REM Step 2: Publish to yalc
    echo.
    echo Step 2: Publishing to yalc...
    echo Current directory: %CD%
    echo Running: yalc publish
    echo (This may take a moment...)
    call yalc publish
    set yalc_exit_code=%errorlevel%
    echo.
    echo Yalc publish exit code: !yalc_exit_code!
    if !yalc_exit_code! neq 0 (
        echo ERROR: Yalc publish failed with exit code !yalc_exit_code!
        echo.
        echo Please check the yalc output above for errors.
        pause
        exit /b 1
    )
    echo Step 2 completed successfully!

    REM Step 3: Update SampleApp
    echo.
    echo Step 3: Updating SampleApp...
    cd ..\SampleApp
    echo Current directory: %CD%
    
    REM Check if .yalc folder exists to determine whether to use add or update
    if exist ".yalc" (
        echo .yalc folder found, using yalc update...
        echo Running: yalc update
        call yalc update
        set yalc_update_exit_code=%errorlevel%
        echo Yalc update exit code: !yalc_update_exit_code!
        if !yalc_update_exit_code! neq 0 (
            echo ERROR: Yalc update failed with exit code !yalc_update_exit_code!
            echo.
            echo Please check the yalc update output above for errors.
            pause
            exit /b 1
        )
    ) else (
        echo .yalc folder not found, using yalc add...
        echo Running: yalc add ng2-pdfjs-viewer
        call yalc add ng2-pdfjs-viewer
        set yalc_add_exit_code=%errorlevel%
        echo Yalc add exit code: !yalc_add_exit_code!
        if !yalc_add_exit_code! neq 0 (
            echo ERROR: Yalc add failed with exit code !yalc_add_exit_code!
            echo.
            echo Please check the yalc add output above for errors.
            pause
            exit /b 1
        )
    )
    echo Step 3 completed successfully!

    REM Step 4: Install dependencies (only if node_modules doesn't exist)
    echo.
    echo Step 4: Checking dependencies...
    echo Current directory: %CD%
    if exist "node_modules" (
        echo node_modules found, skipping npm install...
        echo Step 4 completed successfully!
    ) else (
        echo node_modules not found, installing dependencies...
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
        echo Step 4 completed successfully!
    )

    REM Step 5: Update assets
    echo.
    echo Step 5: Updating assets...
    echo Current directory: %CD%
    if exist "src\assets\pdfjs" (
        echo Removing old assets...
        rmdir /s /q "src\assets\pdfjs"
        set rmdir_exit_code=%errorlevel%
        if !rmdir_exit_code! neq 0 (
            echo ERROR: Failed to remove old assets with exit code !rmdir_exit_code!
            echo.
            echo Please check if any files are locked or in use.
            pause
            exit /b 1
        )
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
    if exist "node_modules\ng2-pdfjs-viewer\build-info.js" (
        echo Copying build-info.js...
        copy "node_modules\ng2-pdfjs-viewer\build-info.js" "src\assets\pdfjs\build-info.js" /y
    )
    echo Step 5 completed successfully!

    REM Step 6: Stop any existing process on port 4200
    echo.
    echo Step 6: Stopping any existing process on port 4200...
    echo Current directory: %CD%
    for /f "tokens=5" %%a in ('netstat -aon ^| findstr :4200') do (
        echo Stopping process with PID: %%a
        taskkill /f /pid %%a >nul 2>&1
        set taskkill_exit_code=%errorlevel%
        if !taskkill_exit_code! neq 0 (
            echo WARNING: Failed to stop process %%a (may already be stopped)
        )
    )
    echo Port 4200 cleared.

    REM Step 7: Start the app with log capture
    echo.
    echo Step 7: Starting Angular dev server with log capture...
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
) else (
    echo ========================================
    echo Running SampleApp only (skipping library build)
    echo ========================================
    echo.
    cd SampleApp
    echo Current directory: %CD%
    
    REM Step 1: Install dependencies (only if needed)
    echo.
    echo Step 1: Checking dependencies...
    echo Current directory: %CD%
    if exist "node_modules" (
        echo node_modules found, skipping npm install...
        echo Step 1 completed successfully!
    ) else (
        echo node_modules not found, installing dependencies...
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
    )

    REM Step 2: Update assets
    echo.
    echo Step 2: Updating assets...
    echo Current directory: %CD%
    if exist "src\assets\pdfjs" (
        echo Removing old assets...
        rmdir /s /q "src\assets\pdfjs"
        set rmdir_exit_code=%errorlevel%
        if !rmdir_exit_code! neq 0 (
            echo ERROR: Failed to remove old assets with exit code !rmdir_exit_code!
            echo.
            echo Please check if any files are locked or in use.
            pause
            exit /b 1
        )
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
    if exist "node_modules\ng2-pdfjs-viewer\build-info.js" (
        echo Copying build-info.js...
        copy "node_modules\ng2-pdfjs-viewer\build-info.js" "src\assets\pdfjs\build-info.js" /y
    )
    echo Step 2 completed successfully!

    REM Step 3: Stop any existing process on port 4200
    echo.
    echo Step 3: Stopping any existing process on port 4200...
    echo Current directory: %CD%
    for /f "tokens=5" %%a in ('netstat -aon ^| findstr :4200') do (
        echo Stopping process with PID: %%a
        taskkill /f /pid %%a >nul 2>&1
        set taskkill_exit_code=%errorlevel%
        if !taskkill_exit_code! neq 0 (
            echo WARNING: Failed to stop process %%a (may already be stopped)
        )
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
