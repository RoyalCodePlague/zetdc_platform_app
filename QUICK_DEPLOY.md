# ⚡ Quick Deploy Checklist

## 🎯 5-Minute Deployment

### 1️⃣ GitHub (2 minutes)
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/zetdc-platform.git
git push -u origin main
```

### 2️⃣ Render - Backend (10 minutes)
1. **[dashboard.render.com](https://dashboard.render.com/)** → New → PostgreSQL
   - Name: `zetdc-db`
   - Copy Internal Database URL

2. **New → Web Service**
   - Connect GitHub repo
   - Build: `./build.sh`
   - Start: `gunicorn backend.wsgi:application`
   
3. **Environment Variables:**
   ```
   SECRET_KEY=<generate-new-key>
   DEBUG=False
   ALLOWED_HOSTS=zetdc-backend.onrender.com
   DATABASE_URL=<paste-database-url>
   CORS_ALLOWED_ORIGINS=https://<your-vercel-app>.vercel.app
   ```

4. **Deploy** → Wait 10 mins

### 3️⃣ Vercel - Frontend (3 minutes)
1. **[vercel.com/new](https://vercel.com/new)**
   - Import GitHub repo
   - Root Directory: `frontend`
   - Framework: Vite

2. **Environment Variable:**
   ```
   VITE_API_URL=https://zetdc-backend.onrender.com/api
   ```

3. **Deploy** → Done in 2 mins!

### 4️⃣ Create Admin (1 minute)
Render → Shell:
```bash
python manage.py createsuperuser
```

## ✅ Done!
- 🌐 Frontend: `https://your-app.vercel.app`
- 🔧 Backend: `https://zetdc-backend.onrender.com`
- 👨‍💼 Admin: `https://zetdc-backend.onrender.com/admin`

---

## 🆓 Completely FREE Forever!
- ✅ Render: 750 hrs/month (24/7)
- ✅ Vercel: Unlimited
- ✅ PostgreSQL: 1 GB free

## ⚠️ Only Limitation
Backend sleeps after 15 min → wakes in 30-60 sec on first request

**Solution:** Use [uptimerobot.com](https://uptimerobot.com) to ping every 5 minutes (also free!)

---

See **DEPLOYMENT_GUIDE.md** for detailed instructions.
