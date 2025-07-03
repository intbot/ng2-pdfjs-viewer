@echo off
setlocal

echo ========================================
echo Building and updating ng2-pdfjs-viewer
echo ========================================

REM Step 1: Build the library
echo.
echo Step 1: Building library...
cd lib
npm run build
if %errorlevel% neq 0 (
    echo ERROR: Library build failed!
    pause
    exit /b 1
)

REM Step 2: Publish to yalc
echo.
echo Step 2: Publishing to yalc...
yalc publish
if %errorlevel% neq 0 (
    echo ERROR: Yalc publish failed!
    pause
    exit /b 1
)

REM Step 3: Update SampleApp
echo.
echo Step 3: Updating SampleApp...
cd ..\SampleApp
yalc update
if %errorlevel% neq 0 (
    echo ERROR: Yalc update failed!
    pause
    exit /b 1
)

REM Step 4: Install dependencies
echo.
echo Step 4: Installing dependencies...
npm install
if %errorlevel% neq 0 (
    echo ERROR: npm install failed!
    pause
    exit /b 1
)

REM Step 5: Update assets (force copy from node_modules)
echo.
echo Step 5: Updating assets...
if exist "src\assets\pdfjs" (
    echo Removing old assets...
    rmdir /s /q "src\assets\pdfjs"
)
echo Copying new assets from node_modules...
xcopy "node_modules\ng2-pdfjs-viewer\pdfjs" "src\assets\pdfjs" /e /i /y
if %errorlevel% neq 0 (
    echo ERROR: Asset copy failed!
    pause
    exit /b 1
)

REM Step 6: Start the app
echo.
echo Step 6: Starting Angular dev server...
echo ========================================
echo Build complete! Starting SampleApp...
echo ========================================
npm start

endlocal 