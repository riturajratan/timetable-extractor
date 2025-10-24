#!/bin/bash

# ============================================================
# Automated Vercel API Key Fixer
# ============================================================
# This script updates the OPENAI_API_KEY in Vercel with your
# working local API key
# ============================================================

echo "🔧 Vercel API Key Fixer"
echo "======================="
echo ""

# Check if vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI is not installed"
    echo ""
    echo "Install it with: npm i -g vercel"
    echo "Then run this script again"
    exit 1
fi

echo "✅ Vercel CLI found"
echo ""

# Read API key from .env file
if [ ! -f "backend/.env" ]; then
    echo "❌ Error: backend/.env file not found"
    exit 1
fi

API_KEY=$(grep OPENAI_API_KEY backend/.env | cut -d '=' -f 2)

if [ -z "$API_KEY" ]; then
    echo "❌ Error: OPENAI_API_KEY not found in .env file"
    exit 1
fi

echo "✅ Found API key ending with: ${API_KEY: -4}"
echo ""

# Show current directory
echo "📁 Current project: timetable-extractor"
echo ""

echo "This script will:"
echo "  1. Remove old OPENAI_API_KEY from Vercel"
echo "  2. Add new OPENAI_API_KEY to Vercel (production)"
echo "  3. Trigger automatic redeployment"
echo ""

read -p "Continue? (y/n): " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Cancelled"
    exit 0
fi

echo ""
echo "🗑️  Removing old API key from Vercel..."
vercel env rm OPENAI_API_KEY production --yes 2>/dev/null || echo "   (No existing key found)"

echo ""
echo "➕ Adding new API key to Vercel..."
echo "$API_KEY" | vercel env add OPENAI_API_KEY production

echo ""
echo "🚀 Triggering redeployment..."
vercel --prod

echo ""
echo "✅ Done!"
echo ""
echo "Your Vercel deployment should now use the correct API key."
echo "Wait 1-2 minutes for deployment to complete, then test at:"
echo "https://timetable-extractor.vercel.app"
echo ""
