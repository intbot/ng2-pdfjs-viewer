@echo off
setlocal enabledelayedexpansion

echo ========================================
echo CACHE CLEANING SCRIPT
echo ========================================
echo.
echo Removes yalc links, node_modules, build output and Angular caches for the
echo library and the playground, then frees port 4300. Run test.bat afterwards.
echo.

echo Step 1: Clearing yalc installations...
call yalc installations clean

echo Step 2: Removing build output and dependencies...
for %%d in ("lib\node_modules" "lib\dist" "playground\node_modules" "playground\.angular" "playground\.yalc") do (
    if exist %%d ( echo  - removing %%d & rmdir /s /q %%d )
)

echo Step 3: Removing yalc + lock files...
for %%f in ("lib\package-lock.json" "playground\yalc.lock") do (
    if exist %%f ( echo  - removing %%f & del /q %%f )
)

echo Step 4: Stopping any dev server on port 4300...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :4300') do taskkill /f /pid %%a >nul 2>&1
echo Port 4300 cleared.

echo.
echo ========================================
echo CACHE CLEANING COMPLETE
echo ========================================
echo Next: run test.bat to rebuild and serve the playground.
echo (Tip: hard-reload the browser with Ctrl+Shift+R to clear cached assets.)
echo.
