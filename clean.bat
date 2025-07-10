@echo off
setlocal enabledelayedexpansion

echo ========================================
echo CACHE CLEANING SCRIPT
echo ========================================
echo.
echo This script performs a complete cache cleanup to resolve build issues.
echo All steps are executed in order and the script will FAIL if any step fails.
echo.
echo STEPS EXECUTED IN ORDER:
echo 1. Clear yalc cache - Removes all yalc package installations
echo 2. Remove lib/node_modules - Deletes library dependencies
echo 3. Remove lib/dist - Deletes library build output
echo 4. Remove SampleApp/node_modules - Deletes app dependencies  
echo 5. Clear Angular cache - Removes Angular build cache
echo 6. Clear yalc lock files - Removes yalc.lock and .yalc folder
echo 7. Clear package-lock files - Removes npm lock files
echo 8. Stop Angular dev server - Kills any running dev server
echo 9. Provide browser cache instructions - Manual step required
echo.
echo Use test.bat afterwards to rebuild everything
echo.

REM Step 1: Clear yalc cache
echo.
echo Step 1: Clearing yalc cache...
echo Running: yalc installations clean
call yalc installations clean
set yalc_exit_code=%errorlevel%
if %yalc_exit_code% neq 0 (
    echo ERROR: yalc installations clean failed with exit code %yalc_exit_code%
    echo.
    echo Please check the yalc output above for errors.
    pause
    exit /b 1
) else (
    echo -> Yalc cache cleared successfully
)

REM Step 2: Remove lib/node_modules
echo.
echo Step 2: Removing lib/node_modules...
if exist "lib\node_modules" (
    echo Removing lib\node_modules...
    rmdir /s /q "lib\node_modules"
    set rmdir_exit_code=%errorlevel%
    if %rmdir_exit_code% neq 0 (
        echo ERROR: Failed to remove lib\node_modules with exit code %rmdir_exit_code%
        echo.
        echo Please check if any files are locked or in use.
        pause
        exit /b 1
    ) else (
        echo -> lib/node_modules removed
    )
) else (
    echo -> lib/node_modules not found (already clean)
)

REM Step 3: Remove lib/dist
echo.
echo Step 3: Removing lib/dist...
if exist "lib\dist" (
    echo Removing lib\dist...
    rmdir /s /q "lib\dist"
    set rmdir_exit_code=%errorlevel%
    if %rmdir_exit_code% neq 0 (
        echo ERROR: Failed to remove lib\dist with exit code %rmdir_exit_code%
        echo.
        echo Please check if any files are locked or in use.
        pause
        exit /b 1
    ) else (
        echo -> lib/dist removed
    )
) else (
    echo -> lib/dist not found (already clean)
)

REM Step 4: Remove SampleApp/node_modules
echo.
echo Step 4: Removing SampleApp/node_modules...
if exist "SampleApp\node_modules" (
    echo Removing SampleApp\node_modules...
    rmdir /s /q "SampleApp\node_modules"
    set rmdir_exit_code=%errorlevel%
    if %rmdir_exit_code% neq 0 (
        echo ERROR: Failed to remove SampleApp\node_modules with exit code %rmdir_exit_code%
        echo.
        echo Please check if any files are locked or in use.
        pause
        exit /b 1
    ) else (
        echo -> SampleApp/node_modules removed
    )
) else (
    echo -> SampleApp/node_modules not found (already clean)
)

REM Step 5: Clear Angular cache
echo.
echo Step 5: Clearing Angular cache...
if exist "SampleApp\.angular" (
    echo Removing .angular cache...
    rmdir /s /q "SampleApp\.angular"
    set rmdir_exit_code=%errorlevel%
    if %rmdir_exit_code% neq 0 (
        echo ERROR: Failed to remove Angular cache with exit code %rmdir_exit_code%
        echo.
        echo Please check if any files are locked or in use.
        pause
        exit /b 1
    ) else (
        echo  -> Angular cache cleared
    )
) else (
    echo -> Angular cache not found (already clean)
)

REM Step 6: Clear yalc lock files
echo.
echo Step 6: Clearing yalc lock files...
if exist "SampleApp\yalc.lock" (
    echo Removing yalc.lock...
    del "SampleApp\yalc.lock"
    set del_exit_code=%errorlevel%
    if %del_exit_code% neq 0 (
        echo ERROR: Failed to remove yalc.lock with exit code %del_exit_code%
        echo.
        echo Please check if the file is locked or in use.
        pause
        exit /b 1
    ) else (
        echo  -> yalc.lock removed
    )
) else (
    echo  -> yalc.lock not found (already clean)
)

if exist "SampleApp\.yalc" (
    echo Removing .yalc folder...
    rmdir /s /q "SampleApp\.yalc"
    set rmdir_exit_code=%errorlevel%
    if %rmdir_exit_code% neq 0 (
        echo ERROR: Failed to remove .yalc folder with exit code %rmdir_exit_code%
        echo.
        echo Please check if any files are locked or in use.
        pause
        exit /b 1
    ) else (
        echo  -> .yalc folder removed
    )
) else (
    echo -> .yalc folder not found (already clean)
)

REM Step 7: Clear package-lock files
echo.
echo Step 7: Clearing package-lock files...
if exist "lib\package-lock.json" (
    echo Removing lib/package-lock.json...
    del "lib\package-lock.json"
    set del_exit_code=%errorlevel%
    if %del_exit_code% neq 0 (
        echo ERROR: Failed to remove lib/package-lock.json with exit code %del_exit_code%
        echo.
        echo Please check if the file is locked or in use.
        pause
        exit /b 1
    ) else (
        echo  -> lib/package-lock.json removed
    )
) else (
    echo  -> lib/package-lock.json not found (already clean)
)

if exist "SampleApp\package-lock.json" (
    echo Removing SampleApp/package-lock.json...
    del "SampleApp\package-lock.json"
    set del_exit_code=%errorlevel%
    if %del_exit_code% neq 0 (
        echo ERROR: Failed to remove SampleApp/package-lock.json with exit code %del_exit_code%
        echo.
        echo Please check if the file is locked or in use.
        pause
        exit /b 1
    ) else (
        echo  -> SampleApp/package-lock.json removed
    )
) else (
    echo  -> SampleApp/package-lock.json not found (already clean)
)

REM Step 8: Stop any existing Angular dev server
echo.
echo Step 8: Stopping any existing Angular dev server...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :4200') do (
    echo Stopping process with PID: %%a
    taskkill /f /pid %%a >nul 2>&1
    set taskkill_exit_code=%errorlevel%
    if %taskkill_exit_code% neq 0 (
        echo WARNING: Failed to stop process %%a (may already be stopped)
    )
)
echo Port 4200 cleared.

REM Step 9: Clear browser cache instructions
echo.
echo Step 9: Browser cache clearing instructions...
echo ========================================
echo MANUAL STEP REQUIRED:
echo.
echo Please clear your browser cache:
echo 1. Open DevTools (F12)
echo 2. Right-click the refresh button
echo 3. Select "Empty Cache and Hard Reload"
echo 4. Or use Ctrl+Shift+R
echo.
echo Alternative: Open incognito/private window
echo ========================================

echo.
echo ========================================
echo CACHE CLEANING COMPLETE!
echo ========================================
echo.
echo Next steps:
echo 1. Clear browser cache (see instructions above)
echo 2. Run: ./test.bat
echo 3. Check for BUILD_ID logs in console
echo.
echo The iframe URL should now include cache-busting parameters:
echo ?file=...&cb=timestamp&_t=timestamp
echo.
pause 