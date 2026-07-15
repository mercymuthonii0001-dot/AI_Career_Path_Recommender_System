import os
import sys
import json

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, BASE_DIR)
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'career_recommender.settings')

import django
from django.test import Client

django.setup()
from django.contrib.auth.models import User

client = Client()
username = 'smoketest'
password = 'Password123'
email = 'smoke@test.local'

User.objects.filter(username=username).delete()

register = client.post(
    '/api/register',
    {
        'username': username,
        'email': email,
        'password': password,
        'full_name': 'Smoke Test',
        'course': '',
        'year_of_study': '',
    }
)
print('register', register.status_code, register.content.decode('utf-8'))

login = client.post('/api/login', {'username': username, 'password': password})
print('login', login.status_code, login.content.decode('utf-8'))

if login.status_code != 200:
    raise SystemExit('Login failed')

token = json.loads(login.content.decode('utf-8'))['tokens']['access']
client.defaults['HTTP_AUTHORIZATION'] = f'Bearer {token}'

recommend = client.post(
    '/api/recommend',
    json.dumps({
        'favourite_subject': 'Mathematics',
        'interest_area': 'Technology',
        'skills': ['Programming', 'Problem Solving'],
    }),
    content_type='application/json',
)
print('recommend', recommend.status_code, recommend.content.decode('utf-8'))

careers = client.get('/api/careers')
print('careers', careers.status_code, len(json.loads(careers.content.decode('utf-8'))) if careers.status_code == 200 else careers.content.decode('utf-8'))

history = client.get('/api/history')
print('history', history.status_code, len(json.loads(history.content.decode('utf-8'))) if history.status_code == 200 else history.content.decode('utf-8'))
