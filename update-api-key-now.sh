#!/bin/bash

echo "🔑 Updating Vercel API Key"
echo "=========================="
echo ""

# Read the working API key from .env
WORKING_KEY=$(grep OPENAI_API_KEY backend/.env | cut -d '=' -f 2)

echo "✅ Found working local API key ending with: ${WORKING_KEY: -4}"
echo ""
echo "This will:"
echo "  1. Remove the OLD invalid key from Vercel"
echo "  2. Add your WORKING key to Vercel production"
echo ""

# Remove old key
echo "🗑️  Removing old invalid key..."
vercel env rm OPENAI_API_KEY production --yes 2>/dev/null

# Add new key (non-interactive)
echo ""
echo "➕ Adding your working API key..."
echo "$WORKING_KEY" | vercel env add OPENAI_API_KEY production

echo ""
echo "✅ API key updated in Vercel!"
echo ""
echo "Now redeploying to apply changes..."
vercel --prod --yes

echo ""
echo "🎉 Done! Wait 1-2 minutes for deployment, then test at:"
echo "   https://timetable-extractor.vercel.app"
