# ZETDC Platform - Replit Configuration

## Project Overview
This is a full-stack Django + React (Vite) application migrated from Vercel to Replit. The application provides an electricity meter management and recharge platform.

## Architecture
- **Backend**: Django REST Framework (Python 3.11) running on port 8000
- **Frontend**: React + Vite + TypeScript + Shadcn UI running on port 5000
- **Database**: PostgreSQL (Replit managed)

## Recent Changes (November 9, 2025)
### Migration from Vercel to Replit
1. Configured Vite to bind to 0.0.0.0:5000 for Replit compatibility
2. Updated Django CORS and CSRF settings to include Replit domains dynamically
3. Set up PostgreSQL database with migrations
4. Created unified start script to run both backend and frontend
5. Fixed CORS security vulnerability by disabling CORS_ORIGIN_ALLOW_ALL

## Environment Variables
Required secrets in Replit:
- `SECRET_KEY`: Django secret key for cryptographic signing
- `DATABASE_URL`: PostgreSQL connection string (auto-configured)
- `REPLIT_DOMAINS`: Auto-populated by Replit environment

Frontend (.env):
- `VITE_API_URL`: Backend API URL (currently points to Replit domain)

## Project Structure
```
├── backend/          # Django application
│   ├── settings.py   # Main Django configuration
│   ├── urls.py       # URL routing
│   └── ...
├── frontend/         # React Vite application
│   ├── src/          # Source files
│   ├── public/       # Static assets
│   └── package.json  # Node dependencies
├── meters/           # Meters app (Django)
├── transactions/     # Transactions app (Django)
├── usersAuth/        # User authentication app (Django)
├── notifications/    # Notifications app (Django)
├── support/          # Support app (Django)
├── start.sh          # Startup script for both services
└── requirements.txt  # Python dependencies
```

## How to Run
The application runs automatically via the `run` workflow which executes `start.sh`:
- Django backend starts on http://0.0.0.0:8000
- Vite frontend starts on http://0.0.0.0:5000 (accessible via webview)

## Security Notes
- CORS is configured with explicit origin whitelist (not allow-all)
- CSRF protection enabled with trusted origins
- Session cookies use SameSite=None and Secure flags for cross-origin support
- Database credentials managed via Replit secrets

## User Preferences
None documented yet.
