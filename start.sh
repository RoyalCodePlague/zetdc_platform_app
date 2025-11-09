#!/bin/bash

# Start Django backend on port 8000
python manage.py runserver 0.0.0.0:8000 &

# Start Vite frontend on port 5000
cd frontend && npm run dev
