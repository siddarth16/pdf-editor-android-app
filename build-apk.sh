#!/bin/bash

# PDF Editor Pro - APK Build Script
# This script helps you build the Android APK for the PDF Editor Pro app

echo "🚀 PDF Editor Pro - APK Build Script"
echo "====================================="
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

echo "✅ Node.js and npm are installed"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Check if Expo CLI is installed
if ! command -v expo &> /dev/null; then
    echo "📱 Installing Expo CLI..."
    npm install -g @expo/cli
fi

# Check if EAS CLI is installed
if ! command -v eas &> /dev/null; then
    echo "🔧 Installing EAS CLI..."
    npm install -g eas-cli
fi

echo "✅ All tools are installed"

# Check if user is logged in to Expo
echo "🔐 Checking Expo authentication..."
if ! expo whoami &> /dev/null; then
    echo "Please log in to your Expo account:"
    expo login
fi

echo "✅ Expo authentication successful"

# Configure EAS Build if needed
if [ ! -f "eas.json" ]; then
    echo "⚙️ Configuring EAS Build..."
    eas build:configure
fi

# Build the APK
echo "🏗️ Building Android APK..."
echo "This may take 10-15 minutes depending on your internet connection..."
echo ""

eas build --platform android --profile preview

echo ""
echo "✅ Build completed!"
echo "📱 You can download your APK from the Expo dashboard:"
echo "   https://expo.dev/accounts/[username]/projects/pdf-editor-pro/builds"
echo ""
echo "Or check the link provided in the build output above."
echo ""
echo "🎉 Thanks for using PDF Editor Pro!" 