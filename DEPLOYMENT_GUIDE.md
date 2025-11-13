# 🚀 ZETDC Platform - Free Deployment Guide

## Overview
This guide will help you deploy your ZETDC platform for **FREE** using:
- **Backend (Django)**: Render.com (Free tier)
- **Frontend (React)**: Vercel (Free tier)
- **Database**: PostgreSQL on Render (Free tier)

---

## 📋 Prerequisites

1. **GitHub Account** - [Sign up here](https://github.com/signup)
2. **Render Account** - [Sign up here](https://render.com/register)
3. **Vercel Account** - [Sign up here](https://vercel.com/signup)

---

## 🔧 Part 1: Prepare Your Code

### 1.1 Create a GitHub Repository

```bash
# Initialize git (if not already done)
cd c:/Users/Legion Ideapad 3/zetdc_platform
git init

# Create .gitignore
echo "venv/
__pycache__/
*.pyc
.env
db.sqlite3
media/
staticfiles/
node_modules/
frontend/dist/
frontend/.env
.vscode/" > .gitignore

# Add and commit
git add .
git commit -m "Initial commit - ZETDC Platform"

# Create repository on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/zetdc-platform.git
git branch -M main
git push -u origin main
```

---

## 🐘 Part 2: Deploy Backend to Render

### 2.1 Create New Web Service

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository
4. Configure:
   - **Name**: `zetdc-backend`
   - **Environment**: `Python 3`
   - **Build Command**: `./build.sh`
   - **Start Command**: `gunicorn backend.wsgi:application`

### 2.2 Add Environment Variables

In Render dashboard, add these environment variables:

```
SECRET_KEY=your-super-secret-key-here-generate-new-one
DEBUG=False
ALLOWED_HOSTS=zetdc-backend.onrender.com
CORS_ALLOWED_ORIGINS=https://your-frontend.vercel.app
DATABASE_URL=(Auto-filled by Render PostgreSQL)
```

**Generate SECRET_KEY:**
```python
python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
```

### 2.3 Add PostgreSQL Database

1. In Render Dashboard, click **"New +"** → **"PostgreSQL"**
2. Name it: `zetdc-db`
3. Once created, copy the **Internal Database URL**
4. Go back to your Web Service → Environment
5. Add: `DATABASE_URL` = (paste the Internal Database URL)

### 2.4 Deploy

Click **"Manual Deploy"** → **"Deploy latest commit"**

Wait 5-10 minutes for deployment to complete.

Your backend will be live at: `https://zetdc-backend.onrender.com`

---

## ⚡ Part 3: Deploy Frontend to Vercel

### 3.1 Create .env file for Frontend

Create `frontend/.env` with:

```env
VITE_API_URL=https://zetdc-backend.onrender.com/api
```

Commit this change:
```bash
git add frontend/.env
git commit -m "Add production API URL"
git push
```

### 3.2 Deploy to Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **"Add New..."** → **"Project"**
3. Import your GitHub repository
4. Configure:
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

### 3.3 Add Environment Variables

In Vercel project settings → Environment Variables:

```
VITE_API_URL=https://zetdc-backend.onrender.com/api
```

### 3.4 Deploy

Click **"Deploy"**

Your frontend will be live at: `https://your-project.vercel.app`

---

## 🔄 Part 4: Update CORS Settings

### 4.1 Update Backend CORS

Go back to **Render Dashboard** → Your Web Service → Environment

Update the `CORS_ALLOWED_ORIGINS` variable:

```
CORS_ALLOWED_ORIGINS=https://your-project.vercel.app
```

Save and redeploy.

---

## 👨‍💼 Part 5: Create Django Superuser

### 5.1 Access Render Shell

1. In Render Dashboard → Your Web Service
2. Click **"Shell"** tab
3. Run:

```bash
python manage.py createsuperuser
```

Follow prompts to create admin account.

### 5.2 Access Admin Panel

Visit: `https://zetdc-backend.onrender.com/admin/`

Login with your superuser credentials.

---

## ✅ Part 6: Test Your Deployment

1. **Frontend**: Visit `https://your-project.vercel.app`
2. **Create Account**: Register a new user
3. **Login**: Test authentication
4. **Submit Support Ticket**: Test the support form
5. **Admin Panel**: Check if ticket appears at `https://zetdc-backend.onrender.com/admin/`

---

## 🎯 Important Notes

### Free Tier Limitations:

**Render (Backend)**:
- ✅ 750 hours/month (enough for 24/7)
- ⚠️ Spins down after 15 min of inactivity (takes 30-60s to wake up)
- ✅ 512 MB RAM
- ✅ PostgreSQL 1 GB storage

**Vercel (Frontend)**:
- ✅ Unlimited bandwidth
- ✅ Instant deployments
- ✅ Global CDN

### Tips:
- Backend may be slow on first request (cold start)
- Keep backend active: use a service like [UptimeRobot](https://uptimerobot.com/) to ping it every 5 minutes
- Media files won't persist on Render free tier - use Cloudinary for images

---

## 🔍 Troubleshooting

### Backend 500 Error:
```bash
# Check logs in Render Dashboard → Logs tab
# Common issues:
# - Missing environment variables
# - Database not connected
# - Static files not collected
```

### Frontend Can't Connect:
- Check CORS settings in backend
- Verify `VITE_API_URL` in Vercel environment variables
- Check browser console for errors

### Database Issues:
```bash
# In Render Shell:
python manage.py migrate
python manage.py collectstatic --noinput
```

---

## 📱 Alternative Free Hosting Options

### Backend Alternatives:
- **Railway.app** (500 hours/month)
- **PythonAnywhere** (Limited to 1 web app)
- **Fly.io** (3 GB RAM free)

### Frontend Alternatives:
- **Netlify** (100 GB bandwidth/month)
- **GitHub Pages** (Unlimited, but static only)
- **Cloudflare Pages** (Unlimited bandwidth)

### Database Alternatives:
- **Supabase** (500 MB PostgreSQL)
- **MongoDB Atlas** (512 MB)
- **ElephantSQL** (20 MB PostgreSQL)

---

## 🚀 Next Steps

1. **Custom Domain**: 
   - Vercel: Add custom domain in project settings (free)
   - Render: Requires paid plan for custom domains

2. **Email Configuration**:
   - Use SendGrid (100 emails/day free)
   - Or Mailgun (5,000 emails/month free)

3. **Media Storage**:
   - Use Cloudinary (25 GB free)
   - Or AWS S3 with CloudFront

4. **Monitoring**:
   - Use Sentry for error tracking (5,000 errors/month free)
   - UptimeRobot to keep backend alive

---

## 📞 Support

If you encounter issues:
1. Check Render logs
2. Check Vercel deployment logs
3. Verify all environment variables are set correctly
4. Ensure GitHub repository is up to date

---

## 🎉 Congratulations!

Your ZETDC platform is now live and accessible worldwide for **FREE**! 🚀

**Your URLs:**
- Frontend: `https://your-project.vercel.app`
- Backend API: `https://zetdc-backend.onrender.com/api`
- Admin Panel: `https://zetdc-backend.onrender.com/admin`
