#!/usr/bin/env bash
# Exit on error
set -o errexit

# Install dependencies (if not already installed)
pip install -r requirements.txt

# Collect static files
python manage.py collectstatic --no-input

# Run migrations
python manage.py migrate
