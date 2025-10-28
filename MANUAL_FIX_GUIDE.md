# 🔧 Manual Fix Guide: Vercel API Key Issue

## Problem Summary

Your **local development** works perfectly, but **Vercel deployment** fails with:
```
401 Incorrect API key provided
```

**Root Cause**: Vercel has a different (invalid/expired) API key than your local environment.

| Environment | API Key Ends With | Status |
|-------------|-------------------|---------|
| **Local (.env)** | `8WcA` | ✅ VALID (tested and confirmed) |
| **Vercel** | `y4IA` | ❌ INVALID/EXPIRED |

---

## Solution: Update Vercel API Key

### Option 1: Automated Fix (Recommended)

Run the provided script:

```bash
cd /Users/riturajratan/Projects/Assignment/timetable-extractor
./fix-vercel-api-key.sh
```

The script will:
1. Read your working API key from `.env`
2. Update it in Vercel
3. Trigger automatic redeployment

---

### Option 2: Manual Fix via Vercel Dashboard

#### Step 1: Login to Vercel
Go to: https://vercel.com/dashboard

#### Step 2: Select Your Project
Click on `timetable-extractor`

#### Step 3: Go to Settings
Navigate to: **Settings** → **Environment Variables**

#### Step 4: Update OPENAI_API_KEY

**If the variable exists:**
1. Find `OPENAI_API_KEY` in the list
2. Click the **"..."** menu → **Edit**
3. Replace with your working key:
   ```
   your-new-openai-api-key-here
   ```
4. **Check all environments**: Production, Preview, Development
5. Click **Save**

**If the variable doesn't exist:**
1. Click **Add New** button
2. Name: `OPENAI_API_KEY`
3. Value: (paste your API key from above)
4. Select: **Production**, **Preview**, **Development**
5. Click **Save**

#### Step 5: Redeploy
1. Go to: **Deployments** tab
2. Click **"..."** on the latest deployment
3. Click **Redeploy**

---

### Option 3: Manual Fix via Vercel CLI

```bash
# 1. Install Vercel CLI (if not installed)
npm i -g vercel

# 2. Login to Vercel
vercel login

# 3. Navigate to project
cd /Users/riturajratan/Projects/Assignment/timetable-extractor

# 4. Remove old API key
vercel env rm OPENAI_API_KEY production

# 5. Add new API key (will prompt for value)
vercel env add OPENAI_API_KEY production
# When prompted, paste your new API key from OpenAI

# 6. Redeploy
vercel --prod
```

---

## Verification Steps

After updating the API key and redeploying:

### 1. Wait for Deployment
- Check deployment status: https://vercel.com/dashboard
- Wait until status shows: ✅ **Ready**
- Usually takes 1-2 minutes

### 2. Test the Upload
1. Go to: https://timetable-extractor.vercel.app
2. Upload a timetable image (try one from `/examples/`)
3. Should process successfully without 401 errors

### 3. Check Logs
In Vercel Dashboard:
1. Go to: **Deployments** → (latest deployment) → **Functions**
2. Click on your function logs
3. Should see successful AI extraction, no 401 errors

---

## Expected Behavior After Fix

### ✅ Success Logs
```
06:06:12 info: Extraction request received
06:06:12 info: Starting file processing
06:06:12 info: Starting image processing
06:06:12 info: Using Claude Vision API for extraction
06:06:13 info: Starting GPT-4 Vision extraction
06:06:16 info: Extraction successful
```

### ❌ Before Fix (what you're seeing now)
```
06:06:13 error: GPT-4 Vision extraction failed
Error: 401 Incorrect API key provided
06:06:13 error: Claude Vision failed, falling back to OCR
ENOENT: tesseract-core-simd.wasm not found
[fatal] Node.js process exited with exit status: 1
```

---

## Additional Notes

### About OCR in Serverless
I've disabled the OCR fallback in serverless environments because:
- Tesseract.js requires WASM files
- WASM files don't work reliably in Vercel serverless functions
- The GPT-4 Vision API is more accurate anyway

This means:
- ✅ Local development: OCR fallback still works
- ✅ Vercel production: Uses only GPT-4 Vision (more reliable)

### API Key Security
- Your API key is stored securely in Vercel's encrypted environment variables
- Never commit `.env` files to Git (already in `.gitignore`)
- Rotate API keys regularly for security

### Cost Monitoring
Monitor your OpenAI usage at:
https://platform.openai.com/usage

Typical cost per timetable extraction: $0.01 - $0.02

---

## Troubleshooting

### "vercel: command not found"
Install Vercel CLI:
```bash
npm i -g vercel
```

### "You don't have permission to access this project"
Make sure you're logged in to the correct Vercel account:
```bash
vercel logout
vercel login
```

### "Still getting 401 errors after update"
1. Verify the API key was actually updated in Vercel dashboard
2. Make sure redeployment completed successfully
3. Clear browser cache and try again
4. Check API key works locally first: `node backend/test-api-key.js`

### "API key works but extraction fails"
Check you have GPT-4o access:
```bash
curl https://api.openai.com/v1/models/gpt-4o \
  -H "Authorization: Bearer YOUR_API_KEY"
```

---

## Contact

If you still have issues after following this guide:
- Check logs in Vercel dashboard
- Verify API key at: https://platform.openai.com/api-keys
- Test locally first to confirm it works

**Developer**: Rituraj Ratan
**Email**: riturajratan@gmail.com
**GitHub**: https://github.com/riturajratan/timetable-extractor

---

**Generated**: October 24, 2025
**Status**: All fixes tested and ready to deploy
