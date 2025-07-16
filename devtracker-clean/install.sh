#!/bin/bash

echo "🚀 DevTracker App - Quick Install"
echo "=================================="

# Check if npm is available
if ! command -v npm &> /dev/null; then
    echo "❌ npm is required but not installed."
    echo "Please install Node.js from https://nodejs.org/"
    exit 1
fi

echo "📦 Installing dependencies..."
npm install

echo "🔧 Building application..."
npm run build:static

echo "✅ Installation complete!"
echo ""
echo "📁 Your app is built in the 'dist' folder"
echo "🌐 Upload the 'dist' folder to any static hosting service"
echo ""
echo "🎯 Quick deploy options:"
echo "  • Netlify: Drag 'dist' folder to netlify.com"
echo "  • Vercel: Connect GitHub repo at vercel.com"
echo "  • Any static host: Upload 'dist' folder"
echo ""
echo "🧪 To test locally: npx serve dist"