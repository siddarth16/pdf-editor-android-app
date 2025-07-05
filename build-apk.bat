@echo off
echo 🚀 PDF Editor Pro - APK Build Script (Windows)
echo ============================================
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js 18+ first.
    pause
    exit /b 1
)

REM Check if npm is installed
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ npm is not installed. Please install npm first.
    pause
    exit /b 1
)

echo ✅ Node.js and npm are installed

REM Install dependencies
echo 📦 Installing dependencies...
npm install

REM Check if Expo CLI is installed
expo --version >nul 2>&1
if %errorlevel% neq 0 (
    echo 📱 Installing Expo CLI...
    npm install -g @expo/cli
)

REM Check if EAS CLI is installed
eas --version >nul 2>&1
if %errorlevel% neq 0 (
    echo 🔧 Installing EAS CLI...
    npm install -g eas-cli
)

echo ✅ All tools are installed

REM Check if user is logged in to Expo
echo 🔐 Checking Expo authentication...
expo whoami >nul 2>&1
if %errorlevel% neq 0 (
    echo Please log in to your Expo account:
    expo login
)

echo ✅ Expo authentication successful

REM Configure EAS Build if needed
if not exist "eas.json" (
    echo ⚙️ Configuring EAS Build...
    eas build:configure
)

REM Build the APK
echo 🏗️ Building Android APK...
echo This may take 10-15 minutes depending on your internet connection...
echo.

eas build --platform android --profile preview

echo.
echo ✅ Build completed!
echo 📱 You can download your APK from the Expo dashboard:
echo    https://expo.dev/accounts/[username]/projects/pdf-editor-pro/builds
echo.
echo Or check the link provided in the build output above.
echo.
echo 🎉 Thanks for using PDF Editor Pro!
pause 