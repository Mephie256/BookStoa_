@echo off
echo ========================================
echo Capacitor Setup for Pneuma BookStore
echo ========================================
echo.

echo Step 1: Installing Capacitor Core...
call npm install @capacitor/core @capacitor/cli
if %errorlevel% neq 0 goto error

echo.
echo Step 2: Installing Platform Packages...
call npm install @capacitor/android @capacitor/ios
if %errorlevel% neq 0 goto error

echo.
echo Step 3: Installing Capacitor Plugins...
call npm install @capacitor/filesystem @capacitor/share @capacitor/splash-screen @capacitor/status-bar @capacitor/app @capacitor/browser
if %errorlevel% neq 0 goto error

echo.
echo ========================================
echo Installation Complete!
echo ========================================
echo.
echo Next steps:
echo 1. Run: npx cap init "Pneuma BookStore" "org.christfaculty.books" --web-dir=dist
echo 2. Run: npm run build
echo 3. Run: npx cap add android
echo.
echo See CAPACITOR_SETUP.md for detailed instructions
echo.
pause
goto end

:error
echo.
echo ========================================
echo ERROR: Installation failed!
echo ========================================
echo Please check your internet connection and try again.
echo.
pause

:end
