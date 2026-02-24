# Deployment Guide - OpenAI API Setup

## Problem
Your server cannot access OpenAI API on the deployment server. This is typically due to:
1. **Missing API Key** - `OPENAI_API_KEY` environment variable not set
2. **Network Restrictions** - Firewall blocking OpenAI API calls
3. **Incorrect Configuration** - Environment variables not configured properly

---

## Solution 1: Vercel Deployment (Recommended)

### Step 1: Deploy to Vercel
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy from server folder
cd server
vercel deploy
```

### Step 2: Set Environment Variables in Vercel Dashboard
1. Go to [https://vercel.com/dashboard](https://vercel.com/dashboard)
2. Select your project
3. Go to **Settings → Environment Variables**
4. Add these variables:
   - `OPENAI_API_KEY`: Your OpenAI API key
   - `MONGODB_URI`: Your MongoDB connection string
   - `NODE_ENV`: production

### Step 3: Redeploy
```bash
vercel deploy --prod
```

---

## Solution 2: Render Deployment

### Step 1: Push to GitHub
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/yourusername/marketing-ai.git
git push -u origin main
```

### Step 2: Create Render Service
1. Go to [https://render.com](https://render.com)
2. Click **New +** → **Web Service**
3. Connect your GitHub repository
4. Configure:
   - **Build Command**: `npm install`
   - **Start Command**: `node index.js`
   - **Root Directory**: `server`

### Step 3: Set Environment Variables
In Render dashboard, go to **Environment**:
```
OPENAI_API_KEY=sk-...
MONGODB_URI=mongodb+srv://...
NODE_ENV=production
```

---

## Solution 3: Self-Hosted Server (AWS EC2, DigitalOcean, etc.)

### Step 1: SSH into your server
```bash
ssh user@your-server-ip
```

### Step 2: Install Node.js & Dependencies
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
cd /var/www/marketing-ai/server
npm install
```

### Step 3: Create `.env` file
```bash
nano .env
```

Add:
```
OPENAI_API_KEY=sk-your-api-key-here
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database
PORT=5000
NODE_ENV=production
```

Save: `Ctrl + X`, then `Y`, then `Enter`

### Step 4: Use PM2 to keep server running
```bash
sudo npm install -g pm2
pm2 start index.js --name "marketing-api"
pm2 save
pm2 startup
```

### Step 5: Setup Nginx Reverse Proxy
```bash
sudo apt-get install nginx
sudo nano /etc/nginx/sites-available/default
```

Replace with:
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Restart Nginx:
```bash
sudo systemctl restart nginx
```

---

## Solution 4: Docker Deployment

Create [server/Dockerfile](Dockerfile):
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 5000
CMD ["node", "index.js"]
```

Create [server/.dockerignore](.dockerignore):
```
node_modules
npm-debug.log
.env.local
.git
```

Build and run:
```bash
docker build -t marketing-ai .
docker run -e OPENAI_API_KEY=sk-... -e MONGODB_URI=mongodb+srv://... -p 5000:5000 marketing-ai
```

---

## Solution 5: Use API Proxy (if OpenAI blocked)

If OpenAI API is completely blocked by your network, create a proxy endpoint:

Create [server/proxy-openai.js](proxy-openai.js):
```javascript
const express = require('express');
const router = express.Router();
const axios = require('axios');

router.post('/chat', async (req, res) => {
    try {
        const response = await axios.post(
            'https://api.openai.com/v1/chat/completions',
            req.body,
            {
                headers: {
                    'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
                    'Content-Type': 'application/json'
                }
            }
        );
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
```

---

## Troubleshooting

### Check if API Key works locally
```bash
node -e "require('dotenv').config(); const OpenAI = require('openai'); const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY }); client.models.list().then(r => console.log('✅ API Key Valid')).catch(e => console.error('❌', e.message))"
```

### Test connection to OpenAI
```bash
curl https://api.openai.com/v1/models \
  -H "Authorization: Bearer $OPENAI_API_KEY"
```

### Check firewall rules
```bash
# Test if port 443 is open
telnet api.openai.com 443
```

---

## Recommended: Vercel + MongoDB Atlas Setup

**Vercel** is ideal for Node.js + React apps because:
- ✅ Automatically scales
- ✅ Serverless functions (no server to manage)
- ✅ Easy environment variable setup
- ✅ Built-in CORS handling
- ✅ Free tier available

**MongoDB Atlas** is ideal because:
- ✅ Cloud-hosted database
- ✅ No maintenance needed
- ✅ Easy connection string
- ✅ Free tier (512MB storage)

---

## Next Steps
1. Choose a hosting platform (Vercel recommended)
2. Get your **OpenAI API Key** from [https://platform.openai.com/account/api-keys](https://platform.openai.com/account/api-keys)
3. Set environment variables in your hosting dashboard
4. Deploy and test the `/api/ideas` endpoint
