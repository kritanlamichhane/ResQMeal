import logging
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from sqlalchemy.exc import OperationalError
from app.core.config import settings

logger = logging.getLogger("ResQMeal.Database")

db_url = settings.DATABASE_URL
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
            f"Configured remote database is unreachable ({exc}). Falling back to local zero-setup SQLite engine: sqlite:///./resqmeal.db"
        )
        db_url = "sqlite:///./resqmeal.db"
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

