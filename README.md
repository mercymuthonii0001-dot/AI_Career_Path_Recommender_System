# AI Career Path Recommender System

Production-ready Django REST + vanilla JavaScript project for recommending student career paths using a Scikit-learn Decision Tree model.

## Problem Statement

Students in many institutions face difficulties identifying the right career path after completing their studies. Guidance services are either unavailable or too general to cater to individual differences. As a result, students make uninformed career decisions. There is a need for a system that can intelligently analyze a student’s academic interest and personal attributes to provide accurate, personalized recommendations.

## Technology Stack

Backend:
- Python 3.12
- Django 5
- Django REST Framework
- Simple JWT authentication
- Pandas
- Scikit-learn
- PostgreSQL

Frontend:
- HTML5
- CSS3
- Vanilla JavaScript
- Vite local development server

Deployment:
- Backend: Render
- Database: Supabase PostgreSQL
- Frontend: Vercel

## Project Structure

```text
AI_Career_Path_Recommender_System/
  backend/
    api/
      ml/
        recommender.py
      migrations/
        0001_initial.py
      admin.py
      models.py
      serializers.py
      urls.py
      views.py
    career_recommender/
      settings.py
      urls.py
      wsgi.py
      asgi.py
    manage.py
    requirements.txt
    runtime.txt
    build.sh
    render.yaml
    .env.example
  frontend/
    css/styles.css
    src/main.js
    index.html
    package.json
    .env.example
    vercel.json
```

## Local Requirements

Install these before running locally:

- Python 3.12 recommended (Python 3.14 is also supported)
- PostgreSQL (for the default setup)
- Node.js LTS, which includes `npm`

Confirm installation:

```powershell
py --version
py -m pip --version
node --version
npm --version
```

## Start the System

Open two terminals.

### Terminal 1 - Backend

Run these commands from the project root folder:

```powershell
cd backend
py -m pip install -r requirements.txt
set DJANGO_USE_SQLITE=False
set POSTGRES_DB=ai_career_recommender
set POSTGRES_USER=postgres
set POSTGRES_PASSWORD=postgres
set POSTGRES_HOST=localhost
set POSTGRES_PORT=5432
py manage.py migrate
py manage.py createsuperuser
py manage.py runserver
```

The API will be available at:

```text
http://127.0.0.1:8000/api
```

### Terminal 2 - Frontend

Run these commands from the project root folder:

```powershell
cd frontend
npm install
npm run dev
```

The frontend will be available at:

```text
http://127.0.0.1:5173
```

> If you are already inside the backend folder, do not run `cd backend` again. Use the commands directly from that folder.

## Quick SQLite Fallback

If you only want a quick local test and do not need PostgreSQL, use:

```powershell
set DJANGO_USE_SQLITE=True
py manage.py migrate
py manage.py runserver
```

## Troubleshooting

- `DJANGO_USE_SQLITE=False` means PostgreSQL is used.
- `DJANGO_USE_SQLITE=True` means SQLite is used instead.
- If both `DATABASE_URL` and `DJANGO_USE_SQLITE` are set, `DATABASE_URL` takes precedence.
- If PostgreSQL fails, verify the `POSTGRES_*` values or set a valid `DATABASE_URL`.
- Use SQLite only for quick local testing.

## Database Schema

```text
User
- Django built-in user table
- username
- email
- password hash

Profile
- user
- full_name
- email
- course
- year_of_study

Career
- name
- description
- required_skills
- learning_resources

RecommendationHistory
- user
- favourite_subject
- interest_area
- skills
- predicted_career
- confidence_score
- career_description
- required_skills
- learning_resources
- created_at
```

## PostgreSQL Setup

Create a local PostgreSQL database:

```sql
CREATE DATABASE ai_career_recommender;
```

Use environment variables:

```text
POSTGRES_DB=ai_career_recommender
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
```

If you do not set `DATABASE_URL`, Django will use the local PostgreSQL values above.

## Supabase Configuration

In Supabase:

1. Create a new project.
2. Open Project Settings.
3. Copy the PostgreSQL connection string.
4. Set it as `DATABASE_URL` in Render.

Example:

```text
DATABASE_URL=postgresql://postgres.project-ref:password@aws-0-region.pooler.supabase.com:6543/postgres
DB_SSL_REQUIRE=True
```

## API Endpoints

```text
POST /api/register
POST /api/login
POST /api/logout
POST /api/token/refresh
GET  /api/profile
PUT  /api/profile
POST /api/recommend
GET  /api/history
GET  /api/careers
```

Authenticated requests use:

```text
Authorization: Bearer <access_token>
```

## Machine Learning

The recommender uses `DecisionTreeClassifier`.

The backend automatically:

- preprocesses categorical inputs
- encodes selected skills
- trains the model from sample data
- saves the trained model to `api/ml/trained/career_decision_tree.joblib`
- loads the model for predictions
- stores each recommendation in the database

## Frontend Notes

The frontend reads the API URL from:

```text
VITE_API_BASE_URL=http://127.0.0.1:8000/api
```

Create `frontend/.env` from `frontend/.env.example` if you need to change the backend API URL.

The frontend is a single-page app rendered from `frontend/src/main.js`.

## Render Deployment

Backend deployment files are already included:

- `requirements.txt`
- `runtime.txt`
- `build.sh`
- `render.yaml`

On Render, set these environment variables:

```text
DEBUG=False
SECRET_KEY=<secure random secret>
DATABASE_URL=<supabase postgres connection string>
ALLOWED_HOSTS=.onrender.com
CORS_ALLOWED_ORIGINS=https://your-vercel-app.vercel.app
CSRF_TRUSTED_ORIGINS=https://your-vercel-app.vercel.app
DB_SSL_REQUIRE=True
```

Render build command:

```bash
./build.sh
```

Render start command:

```bash
gunicorn career_recommender.wsgi:application
```

## Vercel Deployment

Deploy the `frontend/` folder to Vercel.

Set this Vercel environment variable:

```text
VITE_API_BASE_URL=https://your-render-service.onrender.com/api
```

## Admin Panel

After creating a superuser, open:

```text
http://127.0.0.1:8000/admin/
```

The admin can manage:

- Users
- Profiles
- Careers
- Recommendation histories

## Security Features

- Django password hashing
- JWT authentication
- Role-protected Django admin
- Input validation through serializers
- CSRF middleware enabled
- CORS restricted by configured origins
- PostgreSQL SSL support for Supabase
