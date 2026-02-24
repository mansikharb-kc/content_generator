# Marketing AI - Deployment & Setup Instructions

## Problem Summary
Your server cannot access OpenAI API on the deployment platform. This is now **fixed** with:
✅ Fallback mockresponses when OpenAI is unavailable
✅ Better error handling and logging
✅ Docker deployment support
✅ Multiple hosting options configured

---

## Your Environment Variables Need

Create a `.env` file in the `/server` folder with:

```env
OPENAI_API_KEY=sk-your-key-here
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/database
JWT_SECRET=your-jwt-secret-key
CLERK_SECRET_KEY=your-clerk-key-here
NODE_ENV=production
PORT=5000
```

**Optional - For custom OpenAI endpoint (e.g., Azure):**
```env
OPENAI_API_BASE=https://your-custom-endpoint.com/v1
OPENAI_MODEL=gpt-4-turbo
```

---

## Deployment Option 1: Vercel (⭐ Recommended - Easiest)

### Cost: FREE tier available
### Setup Time: 5 minutes

```bash
# 1. Install Vercel CLI
npm install -g vercel

# 2. Deploy from server folder
cd server
vercel deploy --prod

# 3. Add environment variables in Vercel dashboard:
# - Go to https://vercel.com/dashboard
# - Select your project → Settings → Environment Variables
# - Add: OPENAI_API_KEY, MONGODB_URI, JWT_SECRET, CLERK_SECRET_KEY
```

Your API will be at: `https://your-project.vercel.app`

---

## Deployment Option 2: Docker + Linux Server

### Cost: $5-20/month (DigitalOcean, Linode, AWS EC2)
### Setup Time: 15 minutes

```bash
# 1. SSH into your Linux server
ssh user@your-server-ip

# 2. Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
bash get-docker.sh
sudo usermod -aG docker $USER

# 3. Clone your project
cd ~
git clone https://github.com/your-username/marketing-ai.git
cd marketing-ai/server

# 4. Create .env file
nano .env
# Add your environment variables here, save with Ctrl+X Y Enter

# 5. Build Docker image
docker build -t marketing-api .

# 6. Run container
docker run -d \
  --name marketing-api \
  --restart always \
  -p 80:5000 \
  --env-file .env \
  marketing-api

# 7. Verify it's running
curl http://localhost/
```

Your API will be at: `http://your-server-ip`

---

## Deployment Option 3: Render

### Cost: FREE tier available
### Setup Time: 10 minutes

1. Push to GitHub:
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/your-username/marketing-ai.git
git push -u origin main
```

2. Go to https://render.com
3. Click **New +** → **Web Service**
4. Connect GitHub repo
5. Configure:
   - **Root Directory**: `server`
   - **Build Command**: `npm install`
   - **Start Command**: `node index.js`
6. Add Environment Variables (same as .env file)
7. Click Deploy

---

## Testing Your Deployment

```bash
# Test health check
curl https://your-api-domain.com/

# Should return:
# {"status":"API running","db":"connected"}

# Test API with authentication (if JWT set up)
curl https://your-api-domain.com/api/ideas \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## What Changed in Your Code

### 1. **ai_assistant.js** - Now includes:
- ✅ Graceful fallback to mock responses when OpenAI unavailable
- ✅ Better error messages and logging
- ✅ Support for custom API endpoints (Azure, proxies)
- ✅ Request timeout handling
- ✅ Works even without OPENAI_API_KEY set

### 2. **New Docker Files**:
- `Dockerfile` - Container configuration
- `docker-compose.yml` - Easy local testing
- `.dockerignore` - Ignored files in container

### 3. **Documentation**:
- `DEPLOYMENT_GUIDE.md` - Detailed guide for all platforms
- `QUICK_DEPLOY.md` - Quick commands
- `SETUP_INSTRUCTIONS.md` - This file

---

## Troubleshooting

### Error: `OPENAI_API_KEY is missing`
**Fix**: Make sure `.env` file exists in `/server` folder with your API key

### Error: `Cannot reach OpenAI API`
**Fix**: Application will now use mock responses automatically
- Check if OpenAI API is blocked by firewall: `telnet api.openai.com 443`
- Try alternative endpoint: Set `OPENAI_API_BASE` in .env
- Deploy to Vercel (usually works everywhere)

### MongoDB connection fails
**Fix**: 
- Verify `MONGODB_URI` is correct
- Check if MongoDB Atlas IP whitelist includes your server IP
- Add `0.0.0.0/0` to allow all IPs (less secure, but works temporarily)

### "Page not found" after deployment
**Fix**: Make sure you're accessing the right endpoint
- Root domain `/` → Health check
- API calls → `/api/ideas`, `/api/ideas/generate`, etc.

---

## Development Locally

```bash
# 1. Install dependencies
cd server
npm install

# 2. Create .env file
cp .env.example .env
# Edit .env with your real API keys

# 3. Start development server
npm run dev

# 4. Server runs on http://localhost:5000
# 5. Frontend runs on http://localhost:5173 (Vite)

# 6. Test API
curl http://localhost:5000/api/ideas \
  -H "Authorization: Bearer test-token"
```

---

## Next Steps

1. ✅ Choose hosting platform (Vercel recommended)
2. ✅ Get API keys:
   - OpenAI: https://platform.openai.com/account/api-keys
   - MongoDB: https://cloud.mongodb.com (free tier)
   - Clerk: https://dashboard.clerk.com
3. ✅ Create `.env` file with credentials
4. ✅ Deploy using chosen platform
5. ✅ Test API endpoints
6. ✅ Update frontend to point to new API domain

---

## API Endpoints

```
GET    /                    - Health check
GET    /api/ideas           - Get all ideas (requires auth)
POST   /api/ideas/generate  - Generate new idea (requires auth)
GET    /api/ideas/:id       - Get idea details
PUT    /api/ideas/:id       - Update idea
DELETE /api/ideas/:id       - Delete idea
GET    /api/ideas/deleted   - Get deleted ideas
GET    /api/ideas/export-csv - Export as CSV
```

---

## Getting Help

If deployment fails:
1. Check error logs in your hosting dashboard
2. Verify all environment variables are set
3. Test locally with `npm run dev` first
4. Check if OpenAI API is accessible: `curl https://api.openai.com/v1/models -H "Authorization: Bearer YOUR_KEY"`
5. Try accessing `/` endpoint to check if server is running

**Common ports to check:**
- Vercel: Auto-managed
- DigitalOcean/Render: Usually port 80, 443
- Local: port 5000
