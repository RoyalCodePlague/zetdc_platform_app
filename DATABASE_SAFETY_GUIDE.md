# 🛡️ Database Safety Guide - Prevent User Data Loss

## 🎯 Understanding Your Database Setup

You have **TWO SEPARATE DATABASES**:

1. **Local (Development)**: SQLite file (`db.sqlite3`) on your computer
2. **Production (Railway)**: PostgreSQL database on Railway servers

**These DO NOT sync with each other!**

---

## ⚠️ Common Mistakes That Delete Data

### ❌ **NEVER Do These:**

1. **Delete Railway PostgreSQL Service**
   - ❌ Going to Railway → PostgreSQL → Delete
   - ✅ Keep the same PostgreSQL service forever

2. **Delete Railway Project and Recreate**
   - ❌ Deleting entire Railway project
   - ✅ Keep project and just redeploy

3. **Confusing Local vs Production**
   - ❌ Testing locally then expecting data in production
   - ✅ Understand they are separate databases

---

## ✅ Safe Deployment Process

### 1️⃣ Code Changes (Frontend or Backend)

```bash
# Make your changes
git add .
git commit -m "Your changes"
git push origin main
```

**What happens:**
- ✅ Railway auto-deploys backend (runs migrations)
- ✅ Vercel auto-deploys frontend
- ✅ **Database data is preserved!**

### 2️⃣ Database Schema Changes (New Fields, Tables)

```bash
# 1. Create migrations locally
python manage.py makemigrations

# 2. Test locally (optional)
python manage.py migrate

# 3. Commit and push
git add .
git commit -m "Add new database fields"
git push origin main
```

**What happens:**
- ✅ Railway runs migrations automatically
- ✅ **All existing data is preserved!**
- ✅ New fields/tables are added

---

## 🔒 How Railway Protects Your Data

### Railway.json Configuration:

```json
{
  "deploy": {
    "startCommand": "python manage.py migrate && python manage.py create_admin && gunicorn backend.wsgi:application --bind 0.0.0.0:$PORT"
  }
}
```

**What this does:**
1. Runs migrations (safe - only adds new schema)
2. Creates admin user (only if doesn't exist)
3. Starts server

**Your data is NEVER deleted by this process!**

---

## 🎯 Best Practices

### ✅ DO:

1. **Keep Same PostgreSQL Service**
   - Use the same Railway PostgreSQL database forever
   - It has persistent storage

2. **Use Migrations for Schema Changes**
   - Always use `makemigrations` for database changes
   - Never manually modify the database

3. **Backup Important Data**
   - Railway → PostgreSQL → Settings → Enable automatic backups
   - Export data periodically

4. **Test Locally, Deploy to Production**
   - Create test users locally (SQLite)
   - Create real users in production (PostgreSQL)

### ❌ DON'T:

1. **Delete PostgreSQL Service**
   - This WILL delete all data permanently

2. **Run Destructive Commands**
   - Never run `python manage.py flush` in production
   - Never run `DROP DATABASE` or similar

3. **Recreate Railway Project**
   - Keep the same project and services

---

## 🔄 Updating Without Data Loss

### Frontend Updates (100% Safe):
```bash
# Change anything in frontend/
git add frontend/
git commit -m "Update frontend"
git push
```
**Result**: Frontend updates, database untouched ✅

### Backend Code Updates (100% Safe):
```bash
# Change views, serializers, services, etc.
git add backend/ usersAuth/ meters/ transactions/
git commit -m "Update backend logic"
git push
```
**Result**: Backend updates, database untouched ✅

### Database Schema Updates (Safe if done correctly):
```bash
# Add new fields to models
# Then:
python manage.py makemigrations
git add .
git commit -m "Add new fields"
git push
```
**Result**: Schema updated, existing data preserved ✅

---

## 🚨 Data Loss Scenarios (And How to Avoid)

### Scenario 1: "I deleted the PostgreSQL service"
**Problem**: All production data gone  
**Solution**: NEVER delete the PostgreSQL service  
**Recovery**: No recovery - data is gone forever

### Scenario 2: "I recreated the Railway project"
**Problem**: New empty database created  
**Solution**: Keep same project, just redeploy  
**Recovery**: Restore from backup if available

### Scenario 3: "Local users don't appear in production"
**Problem**: Misunderstanding - they're separate databases  
**Solution**: Create users directly in production  
**Prevention**: Use Django admin in production URL

---

## 💾 Backup Strategy

### Automatic Backups (Railway):
1. Go to Railway Dashboard
2. Click on PostgreSQL service
3. Settings → Backups → Enable
4. Set schedule (daily recommended)

### Manual Backup:
```bash
# Connect to Railway PostgreSQL
railway run python manage.py dumpdata > backup.json

# Restore if needed
railway run python manage.py loaddata backup.json
```

---

## 🔍 Verify Database Connection

### Check Production Database:
```bash
# In Railway dashboard
railway run python manage.py dbshell

# Or check users exist
railway run python manage.py shell
>>> from django.contrib.auth import get_user_model
>>> User = get_user_model()
>>> User.objects.all()
```

---

## 📊 Database Status Check

### Verify Data is Safe:
1. Go to Railway Dashboard
2. Click PostgreSQL service
3. Check "Metrics" tab - database size should be > 0
4. Check "Data" tab - see your tables and data

---

## ✅ Summary

**Your data is safe when you:**
- ✅ Push code changes (git push)
- ✅ Run migrations (automatic on Railway)
- ✅ Keep same PostgreSQL service
- ✅ Use proper Django migrations

**Your data is lost when you:**
- ❌ Delete PostgreSQL service
- ❌ Recreate Railway project
- ❌ Run flush/reset commands in production

---

## 🆘 Quick Checklist

Before deploying, ask yourself:

- [ ] Am I just pushing code changes? → Safe ✅
- [ ] Did I add new migrations? → Safe ✅
- [ ] Am I keeping the same Railway project? → Safe ✅
- [ ] Am I keeping the same PostgreSQL service? → Safe ✅
- [ ] Am I deleting anything? → STOP ⛔

If all checks pass, you're good to deploy! 🚀

---

## 📞 Need Help?

If you accidentally deleted data:
1. Check Railway backups immediately
2. Don't make any more changes
3. Try to restore from latest backup

**Prevention is better than cure!** Always keep backups enabled.
