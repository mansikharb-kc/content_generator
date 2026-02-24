# 🔧 Render Deployment - Complete Fix Guide

Your server needs proper configuration. Let me help you fix it step-by-step.

---

## 🔍 Step 1: Verify Root Directory on Render

This is the most common issue!

1. Go to https://dashboard.render.com
2. Click **content-generator-s4fa** service
3. Click **Settings** tab
4. Scroll down to find **Root Directory**
5. **Change to: `server`** (if it's empty or set to something else)
6. Click **Save**

### Screenshot Path:
```
Dashboard → content-generator-s4fa → Settings → Root Directory → Change to "server" → Save
```

---

## 🔍 Step 2: Verify Environment Variables

1. Still in **Settings**, scroll to **Build Command**
2. Should be: `yarn`
3. Scroll to **Start Command**
4. Should be: `npm start`

### Screenshot Path:
```
Settings → Build Command: yarn
Settings → Start Command: npm start
```

---

## 🔍 Step 3: Check Environment Variables Are Set

1. Click **Environment** tab (not Settings)
2. You should see these 4 variables:
   - [ ] `MONGODB_URI` = `mongodb+srv://content_generator:CXdikSFCkEVdcU@cluster0.dm5a5bh.mongodb.net/content_generator?retryWrites=true&w=majority`
   - [ ] `OPENAI_API_KEY` = `sk-...` (your key)
   - [ ] `CLERK_SECRET_KEY` = your clerk key
   - [ ] `NODE_ENV` = `production`

If any are missing, click **Add Environment Variable** and add them.

---

## ✅ Step 4: Full Redeploy

1. Click **Deployments** tab
2. Click **Manual Deploy** button
3. Select **Clear build cache and deploy** ← Important!
4. Wait 3-5 minutes for build to complete

---

## 🧪 Step 5: Check Logs

After deployment completes:

1. Click **Logs** tab
2. Scroll to find the most recent deployment logs
3. Look for these messages:

**Success:**
```
[dotenv@17.3.1] injecting env (4) from .env
✅ MongoDB Atlas connected!
✅ Server running on port 10000
```

**Failure:**
```
injecting env (0) from .env
❌ MongoDB connection error
```

---

## 🆘 If Still Not Working

### Check Build Logs

1. Go to **Deployments** tab
2. Click on your latest failed deployment
3. Click "View build logs" or "View logs"
4. Look for errors like:
   - `cannot find module`
   - `syntax error`
   - `env variables not set`

### Common Errors & Fixes

| Error | Fix |
|-------|-----|
| `injecting env (0)` | Change Root Directory to `server` |
| `Cannot find module` | Root Directory not set correctly |
| `authentication failed` | MongoDB URI wrong or IP not whitelisted |
| `undefined MONGODB_URI` | Environment variable not saved in Render |

---

## 📋 Complete Checklist

### Settings Tab
- [ ] Root Directory = `server`
- [ ] Build Command = `yarn`
- [ ] Start Command = `npm start`

### Environment Tab
- [ ] MONGODB_URI is set (paste the long string)
- [ ] OPENAI_API_KEY is set (your key)
- [ ] CLERK_SECRET_KEY is set
- [ ] NODE_ENV = `production`

### Deployment
- [ ] Clicked "Manual Deploy"
- [ ] Selected "Clear build cache and deploy"
- [ ] Waited 3+ minutes
- [ ] Checked logs for success messages

---

## 🧪 Test After Fix

Once build succeeds, test:

```bash
curl https://content-generator-s4fa.onrender.com/

# Should return:
# {"status":"API running","db":"connected"}
```

If you see this ✅, your backend is working!

---

## 📸 Visual Guide

```
RENDER DASHBOARD
├── contentenerator-s4fa
│   ├── Settings
│   │   ├── Root Directory → Change to "server" ✅
│   │   ├── Build Command → yarn ✅
│   │   └── Start Command → npm start ✅
│   ├── Environment
│   │   ├── MONGODB_URI → [paste connection string]
│   │   ├── OPENAI_API_KEY → [your key]
│   │   ├── CLERK_SECRET_KEY → [your key]
│   │   └── NODE_ENV → production
│   ├── Deployments
│   │   └── Manual Deploy → Clear build cache and deploy ✅
│   └── Logs
│       └── Look for "✅ MongoDB Atlas connected!" ✅
```

---

## 💡 Why Root Directory Matters

- Render looks for `package.json` in Root Directory
- If Root Directory is empty or "/", it looks in project root
- Your package.json is in `/server`, not root
- So Root Directory MUST be `server`

---

## 🎯 Next Steps

1. ✅ Set Root Directory to `server`
2. ✅ Verify all 4 environment variables
3. ✅ Click "Clear build cache and deploy"
4. ✅ Wait 3-5 minutes
5. ✅ Check logs
6. ✅ Test with curl command

**Let me know what error you see in the logs!** 🚀
