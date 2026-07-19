import os
from dotenv import load_dotenv
import psycopg2

# Load environment variables from .env
load_dotenv()

# Fetch variables
DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    raise ValueError("DATABASE_URL is not set in the environment.")

# Connect to the database
connection = psycopg2.connect(DATABASE_URL)
print("Successfully connected to Supabase/PostgreSQL")
connection.close()
