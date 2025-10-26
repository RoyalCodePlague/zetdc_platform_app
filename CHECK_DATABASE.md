# 🔍 Quick Database Health Check

## Check if Your Production Data is Safe

### 1️⃣ Railway Dashboard Check

Visit: https://railway.app/dashboard

**Check these:**
- ✅ PostgreSQL service exists and is running
- ✅ Database size > 100 KB (means it has data)
- ✅ Last backup date is recent

### 2️⃣ Quick Command Check

```bash
# Check if database has users
railway run python manage.py shell -c "from django.contrib.auth import get_user_model; print(f'Users: {get_user_model().objects.count()}')"

# Check if database has meters
railway run python manage.py shell -c "from meters.models import Meter; print(f'Meters: {Meter.objects.count()}')"

# Check if database has transactions  
railway run python manage.py shell -c "from transactions.models import Transaction; print(f'Transactions: {Transaction.objects.count()}')"
```

### 3️⃣ Admin Panel Check

Visit your production admin:
```
https://your-backend-url.railway.app/admin/
```

**Login with:**
- Email: `admin@zetdc.com`
- Password: `admin123456` (or your custom password)

**Verify:**
- Users are listed
- Meters are listed
- Transactions are listed

---

## 🚨 If Data is Missing

### Check 1: Are you looking at the right database?

```bash
# Check which database is connected
railway run python manage.py dbshell
# Then type: \dt
# This lists all tables - should show auth_user, meters_meter, etc.
```

### Check 2: Is DATABASE_URL set correctly?

```bash
railway variables
# Check DATABASE_URL is pointing to your PostgreSQL
```

### Check 3: Have migrations been run?

```bash
railway run python manage.py showmigrations
# All should have [X] marks
```

---

## ✅ Data is Safe When You See:

- PostgreSQL service is active
- Database size > 100 KB
- Admin panel shows your data
- Railway logs show "Applied X migrations"

---

## 🔄 After Every Deployment

Run this quick check:

```bash
# Check production is working
curl https://your-backend-url.railway.app/api/health/

# Check admin works
curl https://your-backend-url.railway.app/admin/
```

If both return 200 OK, you're good! ✅
