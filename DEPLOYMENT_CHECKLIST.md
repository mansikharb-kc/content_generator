# Deployment Checklist

## Pre-Deployment Setup
- [ ] Get OpenAI API key from https://platform.openai.com/account/api-keys
- [ ] Create MongoDB Atlas account at https://cloud.mongodb.com (free tier)
- [ ] Get your MongoDB connection string
- [ ] Get JWT_SECRET and CLERK_SECRET_KEY ready

## Choose Your Hosting Platform

### Option A: Vercel (Recommended) ⭐
```bash
# Step 1: Login to Vercel
npm install -g vercel
vercel login

# Step 2: Deploy
cd server
vercel deploy --prod

# Step 3: Add environment variables
# Dashboard → Settings → Environment Variables
# Add: OPENAI_API_KEY, MONGODB_URI, JWT_SECRET, CLERK_SECRET_KEY

# Step 4: Redeploy
vercel deploy --prod
```
- [ ] Deployed to Vercel
- [ ] Environment variables set in dashboard
- [ ] Redeployed after setting env vars

### Option B: Docker on Linux
```bash
ssh user@your-server-ip

# Copy these commands one by one
curl -fsSL https://get.docker.com -o get-docker.sh
bash get-docker.sh
sudo usermod -aG docker $USER
newgrp docker

# Clone repo
git clone https://github.com/YOUR-USERNAME/marketing-ai.git
cd marketing-ai/server

# Create .env file with your credentials
nano .env

# Build and run
docker build -t marketing-api .
docker run -d --name marketing-api --restart always -p 80:5000 --env-file .env marketing-api

# Test
curl http://your-server-ip/
```
- [ ] Docker installed
- [ ] Repository cloned
- [ ] .env file created with credentials
- [ ] Docker image built
- [ ] Container running
- [ ] Health check successful

### Option C: Render
- [ ] Project pushed to GitHub
- [ ] Connected Render to GitHub
- [ ] Set Build Command: `npm install`
- [ ] Set Start Command: `node index.js`
- [ ] Set Root Directory: `server`
- [ ] Added all environment variables
- [ ] Deployment successful

## Post-Deployment Verification

```bash
# Test health endpoint
curl https://your-deployment-url/
# Expected: {"status":"API running","db":"connected"} or similar

# Test API (if you have auth token)
curl https://your-deployment-url/api/ideas \
  -H "Authorization: Bearer YOUR_TOKEN"
```

- [ ] Health check passes
- [ ] API endpoints respond
- [ ] Database connection works
- [ ] No error messages in logs

## Update Frontend

Edit [client/src/config/api.js](../client/src/config/api.js):
```javascript
// Change from:
const API_URL = 'http://localhost:5000';

// To:
const API_URL = 'https://your-deployment-url.com';
```

- [ ] Frontend API URL updated
- [ ] Frontend rebuilt and deployed
- [ ] Frontend can communicate with backend

## If OpenAI API Not Accessible

✅ **Good news!** Your app now has automatic fallback:
- When OpenAI API is unreachable → Generates mock marketing content
- When OpenAI API key is missing → Uses mock responses
- No errors thrown → App keeps working!

Check logs with:
```bash
# Vercel
vercel logs --follow

# Docker
docker logs -f marketing-api

# Render
https://dashboard.render.com → Logs tab
```

Look for these success messages:
```
✅ OpenAI Response received successfully
📌 Using mock response as fallback
```

## Emergency Rollback

```bash
# If deployment fails, rollback:

# Vercel
vercel rollback

# Docker
docker rm -f marketing-api
docker build -t marketing-api .
docker run -d --name marketing-api --restart always -p 80:5000 --env-file .env marketing-api
```

## Common Issues & Fixes

| Issue | Solution |
|-------|----------|
| 404 errors | Check API URL in frontend config |
| Connection refused | Make sure port is open (80, 443) |
| CORS errors | Check CORS middleware in index.js |
| Database won't connect | Verify MONGODB_URI and IP whitelist |
| OpenAI not working | App automatically falls back to mock responses |
| Env vars not loading | Make sure .env file is in server root |

## Support Resources

- Vercel Docs: https://vercel.com/docs
- Render Docs: https://render.com/docs
- Docker Docs: https://docs.docker.com
- Express.js Docs: https://expressjs.com
- MongoDB Atlas Docs: https://docs.atlas.mongodb.com
- OpenAI API Docs: https://platform.openai.com/docs

---

**Need help?** Check your deployment platform's logs:
- Vercel: `vercel logs`
- Docker: `docker logs marketing-api`
- Render: Console tab in dashboard
