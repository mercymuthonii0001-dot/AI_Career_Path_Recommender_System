#!/usr/bin/env bash
set -o errexit

mkdir -p sessions
pip install -r requirements.txt
python manage.py collectstatic --no-input
python manage.py migrate --noinput
