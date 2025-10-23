# 🚀 Deployment Guide - Vercel

## Quick Deploy to Vercel

### Prerequisites
- Vercel account (free tier works)
- OpenAI API key
- Git repository

### Step-by-Step Deployment

#### 1. Install Vercel CLI (Optional)
```bash
npm install -g vercel
```

#### 2. Deploy via CLI (Recommended)

```bash
# Login to Vercel
vercel login

# Deploy from project root
vercel

# Follow the prompts:
# - Set up and deploy? Y
# - Which scope? (your account)
# - Link to existing project? N
# - Project name? timetable-extractor
# - Directory? ./
# - Override settings? N
```

#### 3. Set Environment Variables

After deployment, add your OpenAI API key:

**Via CLI:**
```bash
vercel env add OPENAI_API_KEY
# Paste your API key when prompted
# Select: Production, Preview, Development
```

**Via Vercel Dashboard:**
1. Go to https://vercel.com/dashboard
2. Select your project
3. Go to Settings → Environment Variables
4. Add:
   - Name: `OPENAI_API_KEY`
   - Value: `your-openai-api-key-here`
   - Environment: Production, Preview, Development

#### 4. Redeploy (if needed)
```bash
vercel --prod
```

---

## Alternative: Deploy via GitHub

### 1. Push to GitHub
```bash
git remote add origin https://github.com/yourusername/timetable-extractor.git
git branch -M main
git push -u origin main
```

### 2. Import to Vercel
1. Go to https://vercel.com/new
2. Import your Git repository
3. Configure project:
   - Framework Preset: Other
   - Root Directory: ./
   - Build Command: (leave empty)
   - Output Directory: backend/public
4. Add environment variables:
   - `OPENAI_API_KEY`: your key
5. Click "Deploy"

---

## Configuration

The project is already configured for Vercel with:

### `vercel.json`
```json
{
  "version": 2,
  "builds": [
    {
      "src": "backend/src/index.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "backend/src/index.js"
    },
    {
      "src": "/(.*)",
      "dest": "backend/public/$1"
    }
  ]
}
```

This configuration:
- Builds the Express app as a serverless function
- Routes `/api/*` to the backend
- Serves static files from `backend/public`

---

## After Deployment

Your app will be available at:
- **Production**: `https://your-project-name.vercel.app`
- **Preview**: `https://your-project-name-xxxxx.vercel.app` (for each commit)

### Test Your Deployment

1. **Visit the homepage**:
   ```
   https://your-project-name.vercel.app
   ```

2. **Check documentation**:
   ```
   https://your-project-name.vercel.app/docs.html
   ```

3. **Test API endpoint**:
   ```bash
   curl https://your-project-name.vercel.app/api/health
   ```

4. **Upload a timetable**:
   - Use the web UI at the homepage
   - Or use the API:
   ```bash
   curl -X POST https://your-project-name.vercel.app/api/extract \
     -F "file=@timetable.png"
   ```

---

## Important Notes

### ⚠️ **Serverless Function Limits (Vercel Free Tier)**

- **Execution Time**: 10 seconds max
- **Memory**: 1024 MB
- **Request Size**: 5 MB max

If extraction takes longer than 10 seconds:
- Upgrade to Vercel Pro ($20/month) for 60s limit
- Or use a different deployment platform (Railway, Render, etc.)

### 🔒 **Security**

- ✅ OpenAI API key stored securely in environment variables
- ✅ `.env` file not committed (in `.gitignore`)
- ✅ CORS configured for production
- ⚠️ For production, add rate limiting and authentication

### 💡 **Tips**

1. **Custom Domain**: Add your own domain in Vercel Dashboard
2. **Preview Deployments**: Every git push creates a preview URL
3. **Analytics**: Enable Vercel Analytics for usage tracking
4. **Logs**: View function logs in Vercel Dashboard → Logs

---

## Troubleshooting

### Issue: "Function Timeout"
**Solution**: GPT-4 Vision can take 15-30 seconds
- Upgrade to Vercel Pro for longer timeouts
- Or deploy to Railway/Render (no timeout limits)

### Issue: "Module not found"
**Solution**: Ensure all dependencies in `package.json`
```bash
cd backend
npm install
```

### Issue: "API Key not working"
**Solution**:
1. Check environment variable name: `OPENAI_API_KEY`
2. Redeploy after adding env var
3. Check Vercel logs for errors

### Issue: "CORS errors"
**Solution**: CORS is configured in `src/index.js`:
```javascript
app.use(cors({
  origin: config.corsOrigin
}));
```

---

## Alternative Deployment Platforms

If Vercel doesn't work for your needs:

### Railway (Recommended Alternative)
- ✅ No timeout limits
- ✅ Persistent storage
- ✅ Simple deployment
- 💰 Free $5 credit/month

```bash
npm install -g @railway/cli
railway login
railway init
railway up
```

### Render
- ✅ Free tier available
- ✅ No timeout on paid tier
- ✅ Easy deployment

### Heroku
- ✅ Well-documented
- ⚠️ No longer has free tier

---

## Cost Estimate

**Vercel Free Tier:**
- Hosting: Free
- Bandwidth: 100 GB/month
- Function Executions: 100 GB-Hrs/month
- ⚠️ OpenAI API costs apply separately

**Expected OpenAI Costs:**
- GPT-4o Vision: ~$0.01-0.05 per timetable extraction
- 100 extractions/month ≈ $1-5

---

## Share with Your Mentor

After deployment, share:

1. **Live App**: `https://your-project.vercel.app`
2. **Documentation**: `https://your-project.vercel.app/docs.html`
3. **GitHub Repo**: Your repository URL
4. **Demo Video**: Loom recording link

---

## Next Steps

1. ✅ Deploy to Vercel
2. ✅ Test with example timetables
3. ✅ Share URL with mentor
4. ✅ Record Loom video demonstrating the live app

**Good luck!** 🚀
