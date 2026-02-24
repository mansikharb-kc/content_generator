# Redeploy on Vercel (Frontend) & Render (Backend)

## Summary
Your code is now on GitHub. Follow these steps to redeploy on both platforms.

---

## 🚀 BACKEND REDEPLOY - Render

### Option 1: Auto Deploy (If Already Connected)
Render automatically redeploys when you push to GitHub. Check:
1. Go to https://dashboard.render.com
2. Select your service
3. Look for the new deployment in **Activity** tab
4. Wait for build to complete (2-5 minutes)

### Option 2: Manual Trigger
```bash
# In PowerShell (optional - Render auto-deploys)
# Just wait or do manual redeploy from dashboard
```

**Steps:**
1. Go to https://dashboard.render.com
2. Click on your backend service
3. Click **Manual Deploy** button
4. Select **Deploy latest commit**
5. Wait for build to complete

### Verify Backend Deployed
```bash
# Test your Render backend
curl https://your-backend-name.onrender.com/
# Should return: {"status":"API running","db":"connected"}
```

**Common Render URLs:** 
- Pattern: `https://your-service-name.onrender.com`
- Example: `https://marketing-api.onrender.com`

---

## 🚀 FRONTEND REDEPLOY - Vercel

### Option 1: Auto Deploy (If Already Connected)
Vercel automatically redeploys when you push to GitHub.

**Steps:**
1. Go to https://vercel.com/dashboard
2. Click your project
3. Check **Recent Deployments** tab
4. New deployment should be building/live

### Option 2: Manual Trigger
1. Go to https://vercel.com/dashboard
2. Select your project
3. Click **Deployments** tab
4. Find the latest deployment
5. Click **→** to view or..
6. Use Vercel CLI to redeploy:

```bash
# Install Vercel CLI (if not already)
npm install -g vercel

# Redeploy frontend
cd client
vercel deploy --prod
```

### Update Frontend API URL
**IMPORTANT:** Update the API URL to point to your Render backend

Edit `client/src/config/api.js`:
```javascript
// Change this:
// const API_URL = 'http://localhost:5000';

// To this (your Render backend URL):
const API_URL = 'https://your-backend-name.onrender.com';
```

Then commit and push:
```bash
git add client/src/config/api.js
git commit -m "Update API URL to Render backend"
git push mansikharb main
```

Vercel will auto-redeploy with the updated URL.

### Verify Frontend Deployed
1. Go to https://vercel.com/dashboard
2. Click your project
3. Wait for build to complete
4. Click the preview link
5. Test the app - create an idea to verify API connection

---

## ✅ Environment Variables Checklist

### Render Backend
Check these are set:
1. Go to https://dashboard.render.com
2. Select your backend service
3. Click **Environment**
4. Verify these exist:
   - [ ] `OPENAI_API_KEY` - Your OpenAI API key
   - [ ] `MONGODB_URI` - Your MongoDB connection string
   - [ ] `JWT_SECRET` - Your JWT secret
   - [ ] `CLERK_SECRET_KEY` - Your Clerk API key
   - [ ] `NODE_ENV` - set to `production`

**If missing:** Add them and redeploy

### Vercel Frontend
Check these are set:
1. Go to https://vercel.com/dashboard
2. Select your project
3. Click **Settings** → **Environment Variables**
4. Verify (if using any):
   - [ ] `VITE_API_URL` - Your Render backend URL (if applicable)

---

## Deployment Checklist

- [ ] Code pushed to GitHub (`git push mansikharb main`)
- [ ] Render backend updated (auto or manual deploy)
- [ ] Render environment variables verified
- [ ] Render backend health check passes (curl test)
- [ ] Frontend API URL updated in `client/src/config/api.js`
- [ ] Frontend code committed and pushed
- [ ] Vercel frontend redeploy triggered (auto or manual)
- [ ] Vercel build completes successfully
- [ ] Frontend loads in browser
- [ ] Can create ideas (tests API connection)

---

## Troubleshooting

### Backend (Render) Not Deploying
1. Check if GitHub is connected: Dashboard → Settings → Project Repository
2. Check recent builds in Activity tab
3. If failed, click build to see error logs
4. Fix error and push new commit to trigger redeploy

### Frontend (Vercel) Not Deploying
1. Check Deployments tab for errors
2. Click failed deployment to see logs
3. Common issues:
   - Environment variables missing
   - Build command failing (check vercel.json)
   - API URL incorrect in code

### API Connection Not Working
1. Verify Render backend URL is correct in `client/src/config/api.js`
2. Verify CORS is enabled (it is by default)
3. Check browser console for errors
4. Test backend directly: `curl https://your-backend-url/`

### Still Can't Generate Ideas
1. Check Render logs for OpenAI errors
2. Verify OPENAI_API_KEY is set in Render
3. App should use mock responses if API blocked
4. Check browser console for errors

---

## Quick Redeploy Commands

```bash
# If you need to trigger everything
cd c:\Users\LT13\Desktop\marketing\marketing_ai

# 1. Make sure everything is committed
git status  # Should show "nothing to commit"

# 2. View what was pushed
git log --oneline -5

# 3. Render will auto-redeploy (wait 2-5 mins)

# 4. For Vercel (optional if not auto-deployed)
cd client
vercel deploy --prod
```

---

## Verification Steps

### Test Backend
```bash
# Replace with your actual Render URL
curl https://your-backend-name.onrender.com/

# Expected response:
# {"status":"API running","db":"connected"}
```

### Test Frontend
1. Go to your Vercel deployment URL
2. Log in
3. Try creating an idea
4. Should see generated content (real or mock)

### Check Logs

**Render Backend Logs:**
- Dashboard → Service → Logs tab

**Vercel Frontend Logs:**
- Dashboard → Project → Deployments → Click deployment → Logs

---

## If Redeploy Fails

### Render Backend
1. Check build logs in Activity tab
2. Verify all env vars are still set (they might have been cleared)
3. Try rebuilding from recent commit
4. If still failing, check for errors in server code

### Vercel Frontend
1. Check deployment logs
2. Verify vercel.json is correct
3. Check for build errors in package.json scripts
4. Try clearing cache: Dashboard → Settings → Redeploy

---

## What's New in This Deployment

✅ **Backend Improvements:**
- OpenAI fallback when API blocked
- Better error handling
- Support for custom endpoints
- Improved logging

✅ **New Files:**
- Deployment guides and checklists
- Docker configuration
- Environment templates

✅ **Code Quality:**
- Better error messages
- Graceful degradation
- Production-ready

---

## Next Steps

1. ✅ Verify Render backend deployed
2. ✅ Verify Vercel frontend deployed
3. ✅ Update API URL in frontend
4. ✅ Test full application flow
5. ✅ Check logs if anything fails

---

**Your deployment is live!** 🚀

If you have issues, check the relevant service logs on their dashboard.
