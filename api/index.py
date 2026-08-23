import os
import sys

# Ensure backend directory is in python module search path
backend_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "backend"))
if backend_path not in sys.path:
    sys.path.insert(0, backend_path)

# Set DATABASE_URL environment variable if not already set
if not os.getenv("DATABASE_URL"):
    os.environ["DATABASE_URL"] = "postgresql://postgres.stbabnfkxoptufkjnvbp:MokshaShinde2008@aws-0-ap-southeast-2.pooler.supabase.com:5432/postgres"

from app.main import app
