import os
import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# Ensure test runs always use isolated SQLite test database
os.environ["DATABASE_URL"] = "sqlite:///./test_resqmeal.db"
os.environ["ENVIRONMENT"] = "testing"

@pytest.fixture(scope="session", autouse=True)
def cleanup_test_database():
    yield
    # Cleanup test db file after session if desired
    if os.path.exists("./test_resqmeal.db"):
        try:
            os.remove("./test_resqmeal.db")
        except Exception:
            pass
