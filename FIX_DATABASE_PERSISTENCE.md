# 🔧 Fix Database Persistence Issue

## 🚨 Problem: Users Deleted After Code Updates

If you're losing users every time you deploy, it means you're **NOT using persistent PostgreSQL**. You're likely using SQLite which is ephemeral on Railway.

---

## ✅ Solution: Verify and Fix Railway PostgreSQL

### Step 1: Check if PostgreSQL Exists

1. Go to **Railway Dashboard**: https://railway.app/dashboard
2. Open your project
3. **Look for TWO services**:
   - 🐍 Django/Python service (your backend)
   - 🐘 PostgreSQL service (your database)

**If you only see ONE service (Django), you DON'T have PostgreSQL!**

---

### Step 2: Add PostgreSQL (If Missing)

**In Railway Dashboard:**

1. Click **"+ New"** in your project
2. Select **"Database"**
3. Choose **"Add PostgreSQL"**
4. Wait 30 seconds for provisioning
5. PostgreSQL service will appear

---

### Step 3: Connect Django to PostgreSQL

**Set Environment Variable:**

1. Click on your **Django/Python service** (not PostgreSQL)
2. Go to **"Variables"** tab
3. Click **"+ New Variable"**
4. Add:
   ```
   Variable: DATABASE_URL
   Value: ${{Postgres.DATABASE_URL}}
   ```
   ☝️ **Important**: Type exactly `${{Postgres.DATABASE_URL}}` - Railway will auto-fill this with the actual database URL

**Alternative - Manual Connection:**

If the above doesn't work, get the connection string manually:

1. Click on **PostgreSQL service**
2. Go to **"Connect"** tab
3. Copy the **"Postgres Connection URL"**
4. Go back to **Django service** → **Variables**
5. Add:
   ```
   Variable: DATABASE_URL
   Value: <paste the full postgresql:// URL>
   ```

---

### Step 4: Verify Configuration

**Check these variables are set in your Django service:**

```env
DATABASE_URL=${{Postgres.DATABASE_URL}}  # ← MOST IMPORTANT!
SECRET_KEY=<your-secret-key>
DEBUG=False
ALLOWED_HOSTS=${{RAILWAY_PUBLIC_DOMAIN}}
CORS_ALLOWED_ORIGINS=https://your-vercel-app.vercel.app
```

---

### Step 5: Redeploy

1. Railway will auto-deploy when you save the variable
2. Or manually trigger: Click **"Deploy"** button
3. Watch logs for:
   ```
   Running migrations...
   Applied X migrations
   ```

---

## 🔍 How to Verify It's Working

### Method 1: Check Railway Logs

1. Click on Django service
2. Go to **"Deployments"** tab
3. Click latest deployment
4. Check logs for:
   ```
   ✅ "Applying migrations..."
   ✅ "Using PostgreSQL database"
   ❌ NOT "Using SQLite database"
   ```

### Method 2: Check Database Service

1. Click on **PostgreSQL service**
2. Go to **"Data"** tab
3. You should see tables like:
   - `auth_user`
   - `meters_meter`
   - `transactions_transaction`

### Method 3: Run Django Shell

```bash
# Install Railway CLI if not installed
npm i -g @railway/cli

# Login
railway login

# Link to your project
railway link

# Check database
railway run python manage.py dbshell

# In the PostgreSQL prompt, type:
\dt

# You should see a list of Django tables
# Type \q to exit
```

### Method 4: Check Users Persist

1. Create a test user in admin
2. Deploy a small code change
3. Check if user still exists

---

## 🎯 Common Mistakes

### ❌ Mistake 1: No PostgreSQL Service

**Problem**: Only have Django service, no database service

**Solution**: Add PostgreSQL service as shown in Step 2

### ❌ Mistake 2: DATABASE_URL Not Set

**Problem**: Environment variable missing

**Solution**: Add `DATABASE_URL=${{Postgres.DATABASE_URL}}`

### ❌ Mistake 3: Using SQLite in Production

**Problem**: Falling back to SQLite because DATABASE_URL not detected

**Check**: Look in logs for "Using SQLite" - this is BAD for production

### ❌ Mistake 4: Deleting PostgreSQL Service

**Problem**: Accidentally deleted database service

**Solution**: Never delete PostgreSQL - create once, keep forever

### ❌ Mistake 5: Using Wrong DATABASE_URL

**Problem**: Pointing to wrong database or old deleted database

**Solution**: Verify URL matches your PostgreSQL service

---

## 📊 What Should Happen

### Before Fix (Using SQLite - BAD):
```
Deploy → SQLite file created in container
Create user → Saved to SQLite
Next deploy → Container recreated → SQLite file deleted → User gone ❌
```

### After Fix (Using PostgreSQL - GOOD):
```
Deploy → Connect to PostgreSQL
Create user → Saved to PostgreSQL (persistent)
Next deploy → Connect to same PostgreSQL → User still there ✅
```

---

## 🔐 Current Settings Check

**Your `settings.py` already has the correct logic:**

```python
if os.environ.get('DATABASE_URL'):
    DATABASES = {
        'default': dj_database_url.config(
            default=os.environ.get('DATABASE_URL'),
            conn_max_age=600,
            conn_health_checks=True,
        )
    }
else:
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.sqlite3',
            'NAME': BASE_DIR / 'db.sqlite3',
        }
    }
```

This means:
- ✅ If `DATABASE_URL` is set → Use PostgreSQL (persistent)
- ❌ If `DATABASE_URL` is NOT set → Use SQLite (ephemeral)

**Your goal**: Make sure `DATABASE_URL` IS SET in Railway!

---

## 🚀 Quick Fix Checklist

- [ ] Railway has TWO services: Django + PostgreSQL
- [ ] DATABASE_URL variable is set in Django service
- [ ] DATABASE_URL value is `${{Postgres.DATABASE_URL}}`
- [ ] Deployed and checked logs for "Applied migrations"
- [ ] Created test user
- [ ] Deployed again and user still exists
- [ ] Database shows in PostgreSQL "Data" tab

---

## 💾 Backup Strategy (Once Fixed)

### Enable Automatic Backups:

1. Click on **PostgreSQL service**
2. Go to **"Settings"** tab
3. Scroll to **"Backups"**
4. Enable **Daily Backups**

### Manual Backup:

```bash
# Backup all data
railway run python manage.py dumpdata > backup.json

# Restore if needed
railway run python manage.py loaddata backup.json
```

---

## 🆘 Still Having Issues?

### Check Deployment Logs:

```bash
railway logs
```

Look for these lines:
```
✅ "Connecting to PostgreSQL"
✅ "Running migrations"
✅ "Applied X migrations"
❌ "Database error" (fix DATABASE_URL)
❌ "Using SQLite" (DATABASE_URL not set)
```

### Verify in Python:

Add this temporarily to check which database is being used:

```python
# In views.py or any file
from django.conf import settings
print(f"DATABASE ENGINE: {settings.DATABASES['default']['ENGINE']}")
print(f"DATABASE NAME: {settings.DATABASES['default']['NAME']}")
```

**You should see:**
```
DATABASE ENGINE: django.db.backends.postgresql
DATABASE NAME: railway
```

**NOT:**
```
DATABASE ENGINE: django.db.backends.sqlite3
DATABASE NAME: /app/db.sqlite3
```

---

## 🎉 Success Indicators

After fixing, you should observe:

✅ PostgreSQL service exists and is running
✅ DATABASE_URL is set in Django service variables
✅ Deployment logs show "PostgreSQL" not "SQLite"
✅ Users persist across deployments
✅ Data visible in PostgreSQL "Data" tab
✅ Database size > 0 KB in metrics

---

## 📞 Final Note

**Railway PostgreSQL is PERSISTENT!** Once set up correctly, your data will NEVER be lost from normal deployments. Data only gets deleted if you:

1. Manually delete the PostgreSQL service
2. Delete the entire Railway project
3. Run destructive commands like `flush`

**Normal code deployments are 100% safe and preserve all data!**
