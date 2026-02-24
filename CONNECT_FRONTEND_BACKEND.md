# 🔗 Connect Frontend to Render Backend

Your frontend is configured to use the `VITE_API_URL` environment variable. Here's how to connect it to your Render backend:

---

## Step 1: Get Your Render Backend URL

### Go to Render Dashboard
https://dashboard.render.com

### Find Backend Service
Look for your backend service (like "marketing-api")

### Copy the URL
At the top of the page, you'll see something like:
```
https://your-service-name.onrender.com
```

**Copy this entire URL** (you'll need it next)

---

## Step 2: Set Environment Variable on Vercel

### Go to Vercel Dashboard
https://vercel.com/dashboard

### Open Your Frontend Project
Click on your project name

### Go to Environment Variables
**Settings** → **Environment Variables**

### Add New Variable
Click **Add New** (or similar button)

**Variable Name:** `VITE_API_URL`

**Value:** Paste your Render URL from Step 1
- Example: `https://marketing-api-xyz123.onrender.com`
- ⚠️ DO NOT include trailing slash

**Environment:** Select **Production** (or all if shown)

### Save
Click Save/Add button

---

## Step 3: Redeploy on Vercel

Once environment variable is saved:

### Automatic
- Vercel auto-redeploys within 1-2 minutes

### Manual (if needed)
- Dashboard → Deployments
- Click **...** menu on latest deployment
- Select **Redeploy**

---

## Step 4: Verify Connection

### Check Frontend Loads
1. Click deployment URL in Vercel dashboard
2. Wait for page to load
3. Log in if needed

### Test API Connection
1. Open browser developer tools: **F12**
2. Go to **Console** tab
3. Check for any red error messages
4. Try creating a new marketing idea
5. Should see content (real or mock)

### Check Network
In DevTools, click **Network** tab:
1. Create new idea
2. Look for requests to your API
3. Should see requests like: `POST https://your-render-url/api/ideas/generate`
4. Should see green checkmarks (200 status)

---

## ✅ Verification Checklist

- [ ] `VITE_API_URL` set in Vercel environment variables
- [ ] Value is correct Render URL (no trailing slash, https://)
- [ ] Vercel redeployed successfully (shows "Ready" status)
- [ ] Frontend loads without errors
- [ ] Browser console shows no red errors
- [ ] Network tab shows API requests
- [ ] API requests return 200 (success)
- [ ] Can create ideas successfully

---

## 🆘 If Still Not Working

### Frontend Shows "Cannot reach API"
1. Check environment variable is set: Vercel Dashboard → Settings → Environment Variables
2. Check exact URL is correct (no typos, no trailing slash)
3. Re-check browser console for actual error message
4. Try clearing browser cache: Ctrl+Shift+Del

### Network Requests Show 404
- API endpoint path might be wrong
- Check server logs on Render for errors

### Network Requests Show 500
- Render backend error
- Check Render service logs

### Still Getting CORS Errors
- CORS should be enabled (it is in backend)
- Verify frontend and backend URLs match exactly

---

## Example

**Your Render URL:**
```
https://marketing-api-kc.onrender.com
```

**In Vercel Environment Variables:**
- Name: `VITE_API_URL`
- Value: `https://marketing-api-kc.onrender.com`

**What happens:**
- Frontend will send API requests to: `https://marketing-api-kc.onrender.com/api/ideas/...`
- Backend on Render receives and processes requests
- Responses sent back to frontend
- Idea gets displayed ✅

---

## Quick Checklist

- [ ] Find your Render backend URL
- [ ] Go to Vercel dashboard
- [ ] Add `VITE_API_URL` environment variable
- [ ] Set value to Render backend URL
- [ ] Save changes
- [ ] Wait for redeploy (1-2 minutes)
- [ ] Test in browser
- [ ] Verify works

---

**Once this is done, your frontend will be connected to your Render backend!** 🎉
