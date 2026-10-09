import os
import logging
from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

logger = logging.getLogger("careflow.database")

# Load .env from backend or root directory
load_dotenv(os.path.join(os.path.dirname(__file__), ".env"))
load_dotenv(os.path.join(os.path.dirname(__file__), "..", ".env"))

DEFAULT_MYSQL_URL = "mysql+pymysql://root@localhost:3306/careflow_db"
DATABASE_URL = os.getenv("DATABASE_URL", DEFAULT_MYSQL_URL)

# Normalize mysql:// to mysql+pymysql:// for SQLAlchemy driver compatibility
if DATABASE_URL.startswith("mysql://"):
    DATABASE_URL = DATABASE_URL.replace("mysql://", "mysql+pymysql://", 1)

def get_engine(db_url: str):
    if "sqlite" in db_url:
        return create_engine(
            db_url,
            connect_args={"check_same_thread": False}
        )
    else:
        return create_engine(
            db_url,
            pool_pre_ping=True,
            pool_recycle=3600,
            pool_size=10,
            max_overflow=20
        )

try:
    engine = get_engine(DATABASE_URL)
    # Test connection on startup
    with engine.connect() as conn:
        logger.info(f"Database connected successfully to {DATABASE_URL.split('@')[-1] if '@' in DATABASE_URL else DATABASE_URL}")
except Exception as e:
    logger.warning(f"Failed to connect to primary database ({DATABASE_URL}): {e}. Falling back to SQLite.")
    DATABASE_URL = "sqlite:///./acentra.db"
    engine = get_engine(DATABASE_URL)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
