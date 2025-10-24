#!/bin/bash

# Update Vercel Environment Variable
# Run this script to update OPENAI_API_KEY in Vercel

echo "Updating OPENAI_API_KEY in Vercel..."

# Make sure you have Vercel CLI installed: npm i -g vercel

vercel env add OPENAI_API_KEY production
# When prompted, paste your API key

echo "✅ Environment variable updated!"
echo "Now redeploy your project with: vercel --prod"
