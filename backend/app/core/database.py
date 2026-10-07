import os
import logging
from pathlib import Path
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from sqlalchemy.exc import OperationalError
from app.core.config import settings

logger = logging.getLogger("ResQMeal.Database")

# Canonical fallback SQLite path inside backend directory
BACKEND_DIR = Path(__file__).resolve().parent.parent.parent
CANONICAL_SQLITE_PATH = (BACKEND_DIR / "resqmeal.db").as_posix()
CANONICAL_SQLITE_URL = f"sqlite:///{CANONICAL_SQLITE_PATH}"

db_url = settings.DATABASE_URL
# Convert relative sqlite URL to canonical absolute path
if db_url.startswith("sqlite") and ":///" in db_url and not os.path.isabs(db_url.split(":///", 1)[1]):
    db_url = CANONICAL_SQLITE_URL

connect_args = {}
if db_url.startswith("sqlite"):
    connect_args = {"check_same_thread": False}

try:
    engine = create_engine(
        db_url,
        connect_args=connect_args,
        echo=False,
        future=True,
        pool_pre_ping=True
    )
    # Validate connection immediately
    with engine.connect() as conn:
        pass
except (OperationalError, Exception) as exc:
    if not db_url.startswith("sqlite"):
        logger.warning(
            f"Configured remote database is unreachable ({exc}). Falling back to local zero-setup SQLite engine: {CANONICAL_SQLITE_URL}"
        )
        db_url = CANONICAL_SQLITE_URL
        connect_args = {"check_same_thread": False}
        engine = create_engine(
            db_url,
            connect_args=connect_args,
            echo=False,
            future=True
        )
    else:
        raise exc

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

