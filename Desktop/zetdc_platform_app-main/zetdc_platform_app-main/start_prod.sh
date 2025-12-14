#!/bin/bash
set -euo pipefail

echo "[deploy-start] $(date -u) - Starting deploy_start script"
echo "[deploy-start] ENV summary:"
echo "  DJANGO_SETTINGS_MODULE=${DJANGO_SETTINGS_MODULE:-backend.settings}"
echo "  PORT=${PORT:-not-set}"
echo "  DATABASE_URL=${DATABASE_URL:-(not-set)}"
echo "[deploy-start] Listing installed packages:"
python -m pip freeze | sed -n '1,80p'

echo "[deploy-start] Running migrations"
python manage.py migrate --noinput

echo "[deploy-start] Starting gunicorn"
exec gunicorn backend.wsgi:application --bind 0.0.0.0:${PORT:-8000} --log-level debug --capture-output --workers 2
