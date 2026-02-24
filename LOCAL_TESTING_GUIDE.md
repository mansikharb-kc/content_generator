# Local Testing & Development Guide

## Test Locally Before Deployment

### 1. Install Dependencies
```bash
cd server
npm install
```

### 2. Create .env File
```bash
cp .env.example .env

# Edit the .env file with your credentials
nano .env
# Add these at minimum:
OPENAI_API_KEY=sk-your-key-here
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/database
JWT_SECRET=test-secret-key
NODE_ENV=development
```

### 3. Start Backend Server
```bash
# Terminal 1 - Backend
cd server
npm run dev

# You should see:
# ✅ MongoDB Atlas connected!
# ✅ Server running on port 5000
```

### 4. Start Frontend (in another terminal)
```bash
# Terminal 2 - Frontend
cd client
npm install
npm run dev

# You should see:
# ➜  local:   http://localhost:5173/
```

### 5. Test API Endpoints

**Test without auth (health check):**
```bash
curl http://localhost:5000/
# Response: {"status":"API running","db":"connected"}
```

**Generate an idea:**
```bash
curl -X POST http://localhost:5000/api/ideas/generate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-jwt-token" \
  -d '{
    "title": "Test Idea",
    "description": "Test marketing idea"
  }'
```

**List ideas (requires auth token):**
```bash
curl http://localhost:5000/api/ideas \
  -H "Authorization: Bearer your-jwt-token"
```

### 6. Test in Browser
```
http://localhost:5173/
```

Login with your credentials and test:
- [ ] Create new marketing idea
- [ ] View generated ideas
- [ ] Edit an idea
- [ ] Delete an idea
- [ ] Export as CSV

---

## What to Check Before Deploying

### Backend Checklist
- [ ] No console errors when starting server
- [ ] MongoDB Atlas shows successful connection
- [ ] All API endpoints respond (even if data is empty)
- [ ] Health check returns correct status
- [ ] OpenAI API works OR fallback mock responses work

### Frontend Checklist  
- [ ] Application loads without errors
- [ ] Login flow works
- [ ] Can create/edit/delete ideas
- [ ] API calls complete within reasonable time
- [ ] No CORS errors in browser console

### Env Variables Checklist
- [ ] .env file exists in `/server` folder
- [ ] All required variables are set
- [ ] No sensitive data in Git (add .env to .gitignore)
- [ ] Different values for dev vs production

---

## Test OpenAI API Directly

Before deploying, verify OpenAI API works:

```bash
# In server folder, create test.js:
cat > test_openai_live.js << 'EOF'
const OpenAI = require('openai');

async function test() {
    try {
        const client = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY
        });
        
        const result = await client.models.list();
        console.log('✅ OpenAI API works!');
        console.log('Available models:', result.data.slice(0, 3).map(m => m.id));
    } catch (err) {
        console.error('❌ OpenAI API failed:', err.message);
    }
}

test();
EOF

# Run it
node test_openai_live.js
```

Expected output:
```
✅ OpenAI API works!
Available models: [ 'gpt-4-turbo', 'gpt-4', 'gpt-3.5-turbo' ]
```

---

## Test Database Connection

```bash
# In server folder:
cat > test_db_connection.js << 'EOF'
const mongoose = require('mongoose');

async function test() {
    try {
        await mongoose.connect(process.env.MONGODB_URI, {
            serverSelectionTimeoutMS: 5000
        });
        console.log('✅ MongoDB Connected!');
        
        // Test query
        const collections = await mongoose.connection.db.listCollections().toArray();
        console.log('Collections:', collections.map(c => c.name));
        
        process.exit(0);
    } catch (err) {
        console.error('❌ MongoDB Failed:', err.message);
        process.exit(1);
    }
}

test();
EOF

# Run it
node test_db_connection.js
```

---

## Performance Testing

Test how your API performs under load:

```bash
# Install Apache Bench (if not already installed)
# On Mac: brew install httpd
# On Linux: sudo apt-get install apache2-utils

# Test 100 requests, 10 concurrent:
ab -n 100 -c 10 http://localhost:5000/

# You should see something like:
# Requests per second: 50 [#/sec]
# Time per request: 200 [ms]
```

---

## Monitoring Logs

### Check Backend Logs
```bash
# If using npm run dev (with nodemon):
# Logs appear in terminal automatically

# For production (with PM2):
pm2 logs marketing-api

# For Docker:
docker logs -f marketing-api

# For Vercel:
vercel logs --follow
```

Look for these success indicators:
```
✅ MongoDB Atlas connected!
✅ OpenAI Response received successfully
📌 Server running on port 5000
```

---

## Common Development Issues

### Issue: `Cannot find module 'openai'`
```bash
# Fix:
cd server
npm install openai
```

### Issue: `OPENAI_API_KEY is missing`
```bash
# Make sure .env file exists and has:
OPENAI_API_KEY=sk-your-actual-key
# Then restart server with: npm run dev
```

### Issue: CORS errors in frontend
Watch browser console for errors like:
```
Access to XMLHttpRequest at 'http://localhost:5000/api/ideas' 
from origin 'http://localhost:5173' has been blocked
```

Fix in [server/index.js](../server/index.js):
```javascript
app.use(cors()); // Already included!
```

### Issue: Database won't connect
```bash
# Check MongoDB Atlas IP whitelist:
# 1. Go to MongoDB Atlas Dashboard
# 2. Network Access
# 3. Add your IP (or 0.0.0.0/0 for development)
```

### Issue: API timeout
```bash
# If OpenAI takes >30 seconds:
# The server now has a 30-second timeout
# Check OpenAI API status: https://status.openai.com
```

---

## Clean Start (Reset Everything)

```bash
# Remove dependencies
rm -rf node_modules package-lock.json

# Clear MongoDB (optional - deletes all data!)
# Go to MongoDB Atlas Dashboard → Collections → Delete Database

# Reinstall
npm install

# Restart
npm run dev
```

---

## Ready to Deploy!

Once all checks pass:

1. ✅ All tests pass locally
2. ✅ No console errors
3. ✅ Database connected
4. ✅ API endpoints working
5. ✅ OpenAI working (or mock fallback enabled)

**Next step:** Follow [DEPLOYMENT_CHECKLIST.md](DEPLOYMENT_CHECKLIST.md)
