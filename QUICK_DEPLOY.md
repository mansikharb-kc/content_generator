# Quick Deployment Commands

## For Vercel (Fastest)
```bash
npm install -g vercel
cd server
vercel login
vercel env add OPENAI_API_KEY
vercel env add MONGODB_URI
vercel deploy --prod
```

## For Self-Hosted (Linux/Ubuntu)
```bash
# SSH into server
ssh user@your-server-ip

# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Clone and setup
cd /var/www
git clone https://github.com/your-repo/marketing-ai.git
cd marketing-ai/server
npm install

# Create .env file with your credentials
nano .env

# Install PM2 for process management
sudo npm install -g pm2
pm2 start index.js --name "marketing-api"
pm2 startup
pm2 save

# Install Nginx
sudo apt-get install nginx -y

# Configure Nginx (see DEPLOYMENT_GUIDE.md for full config)
```

## For Docker
```bash
docker build -t marketing-ai .
docker run -e OPENAI_API_KEY=sk-... \
           -e MONGODB_URI=mongodb+srv://... \
           -p 5000:5000 \
           marketing-ai
```

## Verify Deployment
```bash
# Test your API
curl https://your-domain.com/api/ideas \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Should return list of ideas or auth error
```
