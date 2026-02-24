# ⚡ QUICK REFERENCE CARD

## Problem → Solution
**"Can't use OpenAI API on server"** 
→ **✅ FIXED** - App now has automatic fallback

---

## 3-Minute Setup Flow

### 1️⃣ Create `.env` in server/ folder
```env
OPENAI_API_KEY=sk-your-key
MONGODB_URI=mongodb+srv://...
JWT_SECRET=secret123
CLERK_SECRET_KEY=key123
```

### 2️⃣ Test Locally (5 min)
```bash
cd server
npm install
npm run dev
# Visit http://localhost:5000
```

### 3️⃣ Deploy (Choose ONE)

**OPTION A - Vercel (⭐ Easiest, 5 min)**
```bash
vercel deploy --prod
# Add env vars in dashboard
vercel deploy --prod
```

**OPTION B - Docker (15 min)**
```bash
docker build -t api .
docker run -p 5000:5000 --env-file .env api
```

**OPTION C - Render (10 min)**
- Push to GitHub
- Connect on render.com
- Add env vars
- Deploy

### 4️⃣ Update Frontend
Edit `client/src/config/api.js`:
```javascript
const API_URL = 'https://your-deployment-url';
```

---

## Environment Variables Cheat Sheet

| Variable | Value | Where to Get |
|----------|-------|-------------|
| `OPENAI_API_KEY` | sk-... | https://platform.openai.com/account/api-keys |
| `MONGODB_URI` | mongodb+srv://... | https://cloud.mongodb.com (free tier) |
| `JWT_SECRET` | anything | Create your own |
| `CLERK_SECRET_KEY` | key... | https://dashboard.clerk.com |
| `NODE_ENV` | production | Set this |
| `PORT` | 5000 | Default, optional |

---

## API Health Check

```bash
# Should return {"status":"API running","db":"connected"}
curl https://your-api.com/

# ✅ Green = Server is working
# ❌ Red = Check logs
```

---

## Troubleshooting Flowchart

```
❌ API down?
├─ Check logs (see platform below)
├─ Check .env file exists
├─ Check env vars set correctly
└─ Restart server

❌ Can't access OpenAI?
├─ ✅ Don't worry! Auto fallback active
├─ Check OPENAI_API_KEY set
├─ Check API key is valid
└─ App will use mock responses if needed

❌ Database won't connect?
├─ Verify MONGODB_URI
├─ Check MongoDB Atlas IP whitelist
└─ Add 0.0.0.0/0 temporarily (dev only)

❌ Frontend can't reach backend?
├─ Check API_URL in client config
├─ Check CORS enabled (it is!)
└─ Check both are running
```

---

## View Logs

| Platform | Command |
|----------|---------|
| Vercel   | `vercel logs` |
| Docker   | `docker logs -f container-name` |
| Render   | Dashboard → Logs tab |
| Local    | Terminal output (npm run dev) |

---

## Key Files Modified

| File | What Changed |
|------|-------------|
| `server/utils/ai_assistant.js` | ✅ Added fallback + better errors |

---

## New Files Added

- `DEPLOYMENT_SUMMARY.md` - READ THIS FIRST
- `SETUP_INSTRUCTIONS.md` - All platforms explained
- `DEPLOYMENT_CHECKLIST.md` - Step-by-step tasks
- `LOCAL_TESTING_GUIDE.md` - Test before deploy
- `DEPLOYMENT_GUIDE.md` - Detailed guides
- `QUICK_DEPLOY.md` - Command reference
- `README_DEPLOYMENT.md` - Navigation guide
- `server/Dockerfile` - Docker config
- `server/docker-compose.yml` - Local Docker
- `server/.env.example` - Template

---

## What Works Now

| Scenario | Result |
|----------|--------|
| OpenAI API available | ✅ Real AI responses |
| OpenAI API blocked | ✅ Auto fallback to mock |
| No API key set | ✅ Uses mock responses |
| Database down | ❌ Will show error (expected) |
| Wrong API key | ✅ Falls back gracefully |

---

## Common Commands

```bash
# Test API
curl https://your-api.com/

# Generate idea (with token)
curl -X POST https://your-api.com/api/ideas/generate \
  -H "Authorization: Bearer TOKEN"

# Test OpenAI connection
node test_openai_live.js

# View Docker logs
docker logs -f api

# Restart Docker container
docker restart api

# Check if port is open
telnet your-server.com 443

# SSH into server
ssh user@your-server-ip

# Install Docker
curl -fsSL https://get.docker.com | bash

# Deploy to Vercel
vercel deploy --prod

# View Vercel logs
vercel logs

# View env vars
cat server/.env
```

---

## Next Steps

1. ✅ Read: [DEPLOYMENT_SUMMARY.md](DEPLOYMENT_SUMMARY.md) (5 min)
2. ✅ Read: [SETUP_INSTRUCTIONS.md](SETUP_INSTRUCTIONS.md) (10 min)
3. ✅ Follow: [DEPLOYMENT_CHECKLIST.md](DEPLOYMENT_CHECKLIST.md)
4. ✅ Test: [LOCAL_TESTING_GUIDE.md](LOCAL_TESTING_GUIDE.md)
5. ✅ Deploy!

---

## Emergency Help

| Problem | Doc |
|---------|-----|
| How to deploy? | SETUP_INSTRUCTIONS.md |
| Step by step? | DEPLOYMENT_CHECKLIST.md |
| Test locally? | LOCAL_TESTING_GUIDE.md |
| Docker setup? | DEPLOYMENT_GUIDE.md |
| Getting errors? | DEPLOYMENT_GUIDE.md → Troubleshooting |

---

**⏱️ Estimated Time to Deploy: 15-30 minutes**  
**✅ Your app is ready!**

💾 Bookmark: [README_DEPLOYMENT.md](README_DEPLOYMENT.md)
