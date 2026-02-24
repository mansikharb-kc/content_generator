# Deployment Guide: Vercel (Frontend) + Render (Backend)

## Table of Contents
1. [Frontend Deployment (Vercel)](#frontend-deployment-vercel)
2. [Backend Deployment (Render)](#backend-deployment-render)
3. [Environment Variables Setup](#environment-variables-setup)
4. [Testing & Verification](#testing--verification)

---

## Frontend Deployment (Vercel)

### Step 1: Prepare Your Project
1. Ensure all changes are committed to git:
   ```bash
   git add -A
   git commit -m "Deploy to Vercel"
   ```

2. Push to GitHub:
   ```bash
   git push origin main
   ```

### Step 2: Create Vercel Account
1. Go to [vercel.com](https://vercel.com)
2. Sign up with GitHub (or your preferred method)
3. Click "New Project" button

### Step 3: Import Your Repository
1. Click "Import Project" → "Import Git Repository"
2. Select your GitHub repository (marketing_ai or content_generator)
3. Click "Import"

### Step 4: Configure Build Settings
1. **Project Name**: Keep as `marketing-ai` or `content-generator`
2. **Framework**: Select "Vite" (should auto-detect)
3. **Root Directory**: Select `./client`
4. **Build Command**: `npm run build`
5. **Output Directory**: `dist`

### Step 5: Set Environment Variables
1. Go to "Settings" → "Environment Variables"
2. Add the following:
   ```
   VITE_API_BASE=https://your-render-backend-url.onrender.com
   ```
   *(You'll get this URL after deploying the backend)*

3. Click "Save"

### Step 6: Deploy
1. Click "Deploy"
2. Wait for build to complete (2-3 minutes)
3. Once deployed, you'll get a Vercel URL like: `https://your-project.vercel.app`

---

## Backend Deployment (Render)

### Step 1: Prepare Your Project
1. Ensure `.gitignore` includes `node_modules` and `.env`
2. Verify `server/package.json` has a `start` script:
   ```json
   "scripts": {
     "start": "node index.js"
   }
   ```

### Step 2: Push to GitHub
1. Commit backend changes:
   ```bash
   git add -A
   git commit -m "Prepare backend for Render deployment"
   git push origin main
   ```

### Step 3: Create Render Account
1. Go to [render.com](https://render.com)
2. Click "Sign up" (use GitHub for easy setup)
3. Authorize GitHub access

### Step 4: Create Web Service
1. Click "New +" button → "Web Service"
2. Select your GitHub repository
3. Under "Connect a Repository", search and select your repo
4. Click "Connect"

### Step 5: Configure Service
Fill in the deployment settings:

| Setting | Value |
|---------|-------|
| **Name** | `marketing-api` or similar |
| **Environment** | `Node` |
| **Region** | Choose closest to your users (US/EU/Asia) |
| **Branch** | `main` |
| **Build Command** | Leave empty (Render auto-detects) |
| **Start Command** | `cd server && npm start` |

### Step 6: Set Environment Variables
1. Scroll down to "Environment"
2. Add each variable individually (do NOT paste as a group):

   ```
   MONGODB_URI=your_mongodb_connection_string
   OPENAI_API_KEY=your_openai_api_key
   JWT_SECRET=your_jwt_secret_key
   NODE_ENV=production
   CORS_ORIGIN=https://your-vercel-frontend-url.vercel.app
   ```

   **Where to get each:**
   - `MONGODB_URI`: MongoDB Atlas connection string
   - `OPENAI_API_KEY`: From OpenAI dashboard
   - `JWT_SECRET`: Create a strong random string (use `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`)
   - `CORS_ORIGIN`: Your Vercel frontend URL

3. Click "Save Changes"

### Step 7: Deploy
1. Click "Deploy Web Service"
2. Wait for build (3-5 minutes)
3. Check "Logs" tab for any errors
4. Once successful, copy your Render URL (e.g., `https://marketing-api-xyz.onrender.com`)

---

## Environment Variables Setup

### Frontend (`client/.env.local` or via Vercel Dashboard)
```env
VITE_API_BASE=https://your-render-backend-url.onrender.app
```

### Backend (`server/.env`)
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/dbname
OPENAI_API_KEY=sk-...your-key...
JWT_SECRET=your-very-secret-key-here
NODE_ENV=production
CORS_ORIGIN=https://your-vercel-url.vercel.app
PORT=8080
```

**Note**: Never commit `.env` files. Use Vercel/Render dashboard for production secrets.

---

## Testing & Verification

### After Deployment

#### 1. Test Frontend
- Visit your Vercel URL
- Check if page loads correctly
- Open browser DevTools → Console for errors

#### 2. Test API Connectivity
- Try logging in/registering
- Check network tab to confirm API calls reach Render backend
- Look for CORS errors (fix in backend if present)

#### 3. Check Backend Logs
In Render Dashboard:
1. Go to your service
2. Click "Logs" tab
3. Look for connection messages and errors

#### 4. Monitor Database
- Check MongoDB Atlas for connections
- Ensure data is being written on user registration

### Troubleshooting

| Issue | Solution |
|-------|----------|
| CORS errors | Update `CORS_ORIGIN` in Render environment |
| 502 Bad Gateway | Check Render logs, verify MongoDB connection |
| Build fails on Vercel | Check `vite.config.js`, ensure dependencies installed |
| API timeout | Verify Render backend is running (check logs) |
| Blank page | Check browser console for JavaScript errors |

---

## Post-Deployment Checklist

- [ ] Frontend loads on Vercel
- [ ] API calls work (check Network tab)
- [ ] User registration works
- [ ] Login redirects to dashboard
- [ ] Dashboard loads ideas from database
- [ ] No CORS errors in console
- [ ] Environment variables set in both platforms
- [ ] Database connection verified
- [ ] OpenAI API working
- [ ] Logs checked for errors

---

## Custom Domain Setup (Optional)

### Connect Domain to Vercel
1. Vercel Dashboard → Settings → Domains
2. Add custom domain
3. Update DNS records (Vercel provides DNS settings)
4. Wait 24-48 hours for propagation

### Connect Domain to Render
1. Render Dashboard → Service → Settings → Custom Domain
2. Add your domain
3. Vercel domains don't need additional setup if using Vercel DNS

---

## Deployment Successful! 🎉

Your app is now available at:
- **Frontend**: `https://your-project.vercel.app`
- **Backend**: `https://your-api.onrender.com`

Monitor both dashboards regularly for performance and errors.
