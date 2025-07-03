@echo off
setlocal enabledelayedexpansion

echo ========================================
echo Building and updating ng2-pdfjs-viewer
echo ========================================

REM Step 1: Build the library
echo.
echo Step 1: Building library...
cd lib
echo Current directory: %CD%
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
echo Step 3 completed successfully!

REM Step 4: Install dependencies
echo.
echo Step 4: Installing dependencies...
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
echo Step 4 completed successfully!

REM Step 5: Update assets (force copy from node_modules)
echo.
echo Step 5: Updating assets...
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
echo Step 5 completed successfully!

REM Step 6: Start the app
echo.
echo Step 6: Starting Angular dev server...
echo Current directory: %CD%
echo Running: npm start
echo ========================================
echo Build complete! Starting SampleApp...
echo ========================================
call npm start

endlocal 