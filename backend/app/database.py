import os

from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, sessionmaker

load_dotenv()
DATABASE_URL = os.getenv("DATABASE_URL")

connect_args = {}
if DATABASE_URL and DATABASE_URL.startswith("postgresql://"):
    try:
        import psycopg
        DATABASE_URL = DATABASE_URL.replace("postgresql://", "postgresql+psycopg://", 1)
    except ImportError:
        DATABASE_URL = DATABASE_URL.replace("postgresql://", "postgresql+psycopg2://", 1)

if not DATABASE_URL:
    db_path = "/tmp/eventpulse.db" if os.getenv("VERCEL") else "eventpulse.db"
    DATABASE_URL = f"sqlite:///{db_path}"
    connect_args = {"check_same_thread": False}

try:
    engine = create_engine(DATABASE_URL, pool_pre_ping=True, connect_args=connect_args)
    if "postgresql" in DATABASE_URL:
        with engine.connect() as conn:
            pass
except Exception as e:
    print(f"Warning: PostgreSQL connection failed ({e}). Falling back to SQLite.")
    db_path = "/tmp/eventpulse.db" if os.getenv("VERCEL") else "eventpulse.db"
    DATABASE_URL = f"sqlite:///{db_path}"
    connect_args = {"check_same_thread": False}
    engine = create_engine(DATABASE_URL, pool_pre_ping=True, connect_args=connect_args)

SessionLocal = sessionmaker(bind=engine, autocommit=False, autoflush=False)


class Base(DeclarativeBase):
    pass


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
