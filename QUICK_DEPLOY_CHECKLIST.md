# Quick Deployment Checklist

## Before You Deploy

### 1. GitHub Repository
- [ ] All files committed: `git add -A && git commit -m "Deploy"`
- [ ] Pushed to main: `git push origin main`
- [ ] Repository is public or private (both work with Vercel/Render)

### 2. MongoDB Setup
- [ ] Create MongoDB Atlas account
- [ ] Create a cluster
- [ ] Create database user (save credentials)
- [ ] Get connection string and save it
- [ ] Add IP addresses to network access (or use 0.0.0.0/0)

### 3. OpenAI API
- [ ] Create OpenAI account
- [ ] Generate API key
- [ ] Save the key (can't view after creation)

### 4. Generate Secrets
Run in terminal to generate JWT secret:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```
Copy the output and save it.

---

## Deployment Steps (In Order)

### Phase 1: Deploy Backend First (IMPORTANT!)

#### Step 1A: Create Render Account
1. Go to https://render.com
2. Click "New +" → "Web Service"
3. Connect your GitHub repository

#### Step 1B: Configure Render Service
- **Service Name**: `marketing-api`
- **Region**: Choose closest region
- **Branch**: `main`
- **Runtime**: Node
- **Start Command**: `cd server && npm start`

#### Step 1C: Add Environment Variables to Render
Go to "Environment" and add these EXACTLY (one per line):

```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/marketing_ai?retryWrites=true&w=majority
OPENAI_API_KEY=sk-xxxxxxxxxxxxxx
JWT_SECRET=your-generated-secret-here
NODE_ENV=production
CORS_ORIGIN=https://your-frontend-will-go-here.vercel.app
PORT=8080
```

**Important**: Leave `CORS_ORIGIN` as placeholder for now. Update it after frontend deployment.

#### Step 1D: Deploy
1. Click "Create Web Service"
2. Wait for deployment (3-5 minutes)
3. Check "Logs" tab for errors
4. Once green/deployed, copy your Render URL (e.g., `https://marketing-api-xyz.onrender.com`)

#### Step 1E: Verify Backend
Open this in browser:
```
https://your-render-url/
```
Should show: `{"status":"API running","db":"connected"}`

---

### Phase 2: Deploy Frontend (After Backend is Ready!)

#### Step 2A: Create Vercel Account
1. Go to https://vercel.com
2. Click "Add New..." → "Project"
3. Import your GitHub repository

#### Step 2B: Configure Vercel Project
- **Project Name**: `marketing-ai`
- **Framework**: Vite (auto-detected)
- **Root Directory**: `./client`
- **Build Command**: `npm run build`
- **Output Directory**: `dist`

#### Step 2C: Add Environment Variables
1. Go to "Settings" → "Environment Variables"
2. Add variable:
   ```
   Key: VITE_API_BASE
   Value: https://your-render-url.onrender.com
   Environments: Production, Preview, Development
   ```
3. Click "Save"

#### Step 2D: Deploy
1. Click "Deploy"
2. Wait for build (2-3 minutes)
3. Check build logs for errors
4. Get your Vercel URL (e.g., `https://marketing-ai-xyz.vercel.app`)

---

### Phase 3: Update Backend CORS (Final Step!)

Go back to Render and update:

1. Select your service
2. Go to "Settings" → "Environment"
3. Edit `CORS_ORIGIN`:
   ```
   https://your-vercel-url.vercel.app
   ```
4. Click "Save Changes"
5. Service will auto-redeploy

---

## Environment Variables Reference

### Frontend (Vercel)
```
VITE_API_BASE=https://marketing-api-xyz.onrender.com
```

### Backend (Render)
```
MONGODB_URI=mongodb+srv://username:password@cluster0.mongodb.net/marketing_ai
OPENAI_API_KEY=sk-...
JWT_SECRET=your-generated-secret
NODE_ENV=production
CORS_ORIGIN=https://marketing-ai-xyz.vercel.app
PORT=8080
```

---

## Testing After Deployment

1. **Open Frontend URL**
   - Should load without errors
   - Check browser console (F12) for errors

2. **Test Login Page**
   - Try registering a new account
   - Check Network tab → network requests should hit your Render URL

3. **Check Backend Logs**
   - Render dashboard → Logs
   - Should see registration request

4. **Test Full Flow**
   - Login → Dashboard → Generate Ideas → Verify data saves

---

## Troubleshooting Commands

### Check Render Logs
```bash
# In Render dashboard, click "Logs" tab and search for errors
```

### Local Testing Before Deploy
```bash
cd server
npm start  # Should connect to MongoDB

# In another terminal
cd client
npm run dev  # Should connect to localhost backend
```

### Verify MongoDB Connection
```javascript
// Copy this test query in MongoDB Atlas
db.users.find().limit(1)
```

---

## Common Issues & Fixes

| Error | Fix |
|-------|-----|
| CORS blocked | Update CORS_ORIGIN in Render → Environment Variables |
| 502 Bad Gateway | Check Render logs, restart service, verify MongoDB URI |
| Build fails on Vercel | Delete node_modules, npm install, push to GitHub |
| API returns 500 | Check OpenAI API key is valid |
| Can't register users | Check MongoDB connection in Render logs |
| Blank white page | Open DevTools console, check for JavaScript errors |

---

## Post-Deployment

- [ ] Frontend loads
- [ ] API calls work (check Network tab)
- [ ] Login/Register works
- [ ] Dashboard displays ideas
- [ ] Ideas can be generated
- [ ] No errors in console
- [ ] Check both dashboard logs regularly

## Monitor Your Deployments

### Vercel
- Dashboard → Project → Deployments (check for failed builds)
- Settings → Analytics (monitor performance)

### Render
- Dashboard → Service → Logs (check for errors)
- Metrics tab (monitor CPU, memory, requests)

---

## URLs After Deployment

- **Frontend**: https://your-project.vercel.app
- **Backend**: https://your-api.onrender.com
- **MongoDB Atlas**: https://cloud.mongodb.com
- **OpenAI Dashboard**: https://platform.openai.com

---

## Next Steps

1. Set up domain (optional but recommended)
2. Enable auto-scaling on Render
3. Set up monitoring/alerts
4. Add backup strategy for MongoDB
5. Plan for future upgrades

Deployment complete! 🚀
