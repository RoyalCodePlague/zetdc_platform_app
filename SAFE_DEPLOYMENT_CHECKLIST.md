# ✅ Safe Deployment Checklist

## Before Every Deployment - Read This!

### 🛡️ Data Safety Pre-Flight Check

**Before you push ANY changes, verify:**

- [ ] I am NOT deleting the Railway PostgreSQL service
- [ ] I am NOT recreating the Railway project
- [ ] I am only pushing code or migration changes
- [ ] My local SQLite database (`db.sqlite3`) is in `.gitignore`
- [ ] I have tested my changes locally

---

## 🚀 Safe Deployment Steps

### Step 1: Check What Changed
```bash
git status
git diff
```

**Verify you're only changing:**
- ✅ Python code (.py files)
- ✅ Frontend code (.tsx, .ts, .css)
- ✅ Configuration files
- ✅ Migration files (if you added new fields)

**Make sure you're NOT changing:**
- ❌ db.sqlite3 (should be in .gitignore)
- ❌ Railway PostgreSQL credentials
- ❌ Production environment variables

### Step 2: Commit and Push
```bash
git add .
git commit -m "Your descriptive message"
git push origin main
```

### Step 3: Monitor Deployment

**Railway:**
- Watch logs: Railway Dashboard → Your Service → Deployments → View Logs
- Look for: "Applied X migrations" (good!)
- Look for: Any errors (fix immediately!)

**Vercel:**
- Watch build: Vercel Dashboard → Your Project → Deployments
- Status should be "Ready"

### Step 4: Verify Data Intact
```bash
# Quick check - users still exist
curl https://your-backend.railway.app/api/health/

# Or use Railway CLI
railway run python manage.py shell -c "from django.contrib.auth import get_user_model; print(f'Users: {get_user_model().objects.count()}')"
```

---

## 🎯 Different Update Types

### Frontend Only Update
```bash
# Changes in frontend/ folder only
git add frontend/
git commit -m "Update frontend UI"
git push
```
**Risk Level**: 🟢 Zero risk - database untouched

### Backend Code Update (No Database Changes)
```bash
# Changes in views, serializers, utils
git add backend/ usersAuth/ meters/
git commit -m "Update backend logic"
git push
```
**Risk Level**: 🟢 Zero risk - database untouched

### Database Schema Update (Adding Fields)
```bash
# 1. Update models.py
# 2. Create migrations
python manage.py makemigrations

# 3. Review migration file
cat usersAuth/migrations/0007_*.py

# 4. Commit and push
git add .
git commit -m "Add new user profile fields"
git push
```
**Risk Level**: 🟡 Low risk - existing data preserved, new fields added

---

## ⛔ NEVER Do These

### ❌ Delete Railway Services
```
Railway Dashboard → PostgreSQL → DELETE
```
**Result**: ALL DATA LOST PERMANENTLY ☠️

### ❌ Run Flush Commands in Production
```bash
railway run python manage.py flush  # DON'T DO THIS!
railway run python manage.py migrate --fake-initial  # CAREFUL!
```
**Result**: ALL DATA LOST ☠️

### ❌ Manually Delete Database
```
Railway Dashboard → PostgreSQL → Data → Drop Tables
```
**Result**: ALL DATA LOST ☠️

### ❌ Change DATABASE_URL to New Database
```
Railway Variables → DATABASE_URL → Change to new DB
```
**Result**: Old data orphaned, starting fresh ⚠️

---

## 🔄 What Happens During Deployment

### Railway Auto-Deploy Process:
```bash
1. git push detected
2. Railway pulls latest code
3. Installs dependencies (pip install -r requirements.txt)
4. Runs collectstatic
5. Runs migrations (python manage.py migrate) ✅ SAFE
6. Creates admin if not exists ✅ SAFE
7. Starts server with gunicorn
```

**All of this is SAFE!** Your data is preserved.

---

## 💾 Backup Before Major Changes

### Before Big Updates:
```bash
# 1. Backup data
railway run python manage.py dumpdata > backup_$(date +%Y%m%d).json

# 2. Make changes
# ...

# 3. If something goes wrong, restore:
railway run python manage.py loaddata backup_20241017.json
```

---

## 🆘 Emergency Recovery

### If You Accidentally Deleted Data:

1. **Stop immediately** - Don't push more changes
2. **Check Railway backups**:
   - Railway Dashboard → PostgreSQL → Backups
   - Restore from latest backup
3. **If no backups**:
   - Data is likely lost
   - Recreate admin: `railway run python manage.py create_admin`

---

## ✅ Post-Deployment Verification

### Check these after every deployment:

```bash
# 1. Backend is running
curl https://your-backend.railway.app/api/health/

# 2. Admin panel works
open https://your-backend.railway.app/admin/

# 3. Frontend is updated
open https://your-frontend.vercel.app/

# 4. Data is intact (check user count)
railway run python manage.py shell -c "from django.contrib.auth import get_user_model; print(get_user_model().objects.count())"
```

If all checks pass: ✅ Deployment successful!

---

## 📊 Monthly Maintenance

### First of Every Month:

- [ ] Verify Railway has reset your $5 credit
- [ ] Check database backups are enabled
- [ ] Review logs for any errors
- [ ] Test critical functionality
- [ ] Check database size (Railway → PostgreSQL → Metrics)

---

## 🔐 Security Reminder

**After deploying to production:**

1. Change admin password from default:
   ```bash
   railway run python manage.py changepassword admin
   ```

2. Set strong SECRET_KEY in Railway variables

3. Ensure DEBUG=False in production

---

## 📞 Quick Reference

**Safe Commands:**
- ✅ `git push` (always safe)
- ✅ `python manage.py migrate` (safe - only adds)
- ✅ `python manage.py makemigrations` (safe - just creates files)
- ✅ `python manage.py collectstatic` (safe)

**Dangerous Commands:**
- ⛔ `python manage.py flush` (deletes all data)
- ⛔ `python manage.py migrate zero` (rolls back everything)
- ⛔ Deleting Railway PostgreSQL service

---

## 🎓 Remember

**Your data is stored in Railway PostgreSQL, NOT in your code!**

- Pushing code ≠ Changing database
- Migrations = Safe schema updates
- Only deleting Railway PostgreSQL = Data loss

**When in doubt, DON'T delete anything in Railway!**

---

## ✨ You're Safe If:

- ✅ You only use `git push` to deploy
- ✅ You keep the same Railway PostgreSQL service
- ✅ You use Django migrations for schema changes
- ✅ You don't run dangerous commands in production

**Follow this checklist and your data will NEVER be lost!** 🛡️
