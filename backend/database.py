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

from sqlalchemy import text, inspect

def ensure_schema_compatibility(target_engine):
    try:
        inspector = inspect(target_engine)
        tables = inspector.get_table_names()
        if "patients" in tables:
            cols = [col["name"] for col in inspector.get_columns("patients")]
            with target_engine.begin() as conn:
                if "age" not in cols:
                    conn.execute(text("ALTER TABLE patients ADD COLUMN age INT NULL"))
                if "blood_group" not in cols:
                    conn.execute(text("ALTER TABLE patients ADD COLUMN blood_group VARCHAR(20) NULL"))
                if "address" not in cols:
                    conn.execute(text("ALTER TABLE patients ADD COLUMN address TEXT NULL"))
                if "city" not in cols:
                    conn.execute(text("ALTER TABLE patients ADD COLUMN city VARCHAR(100) NULL"))
                if "state" not in cols:
                    conn.execute(text("ALTER TABLE patients ADD COLUMN state VARCHAR(100) NULL"))
                if "pincode" not in cols:
                    conn.execute(text("ALTER TABLE patients ADD COLUMN pincode VARCHAR(20) NULL"))
                if "department" not in cols:
                    conn.execute(text("ALTER TABLE patients ADD COLUMN department VARCHAR(100) NULL"))
                if "emergency_contact_name" not in cols:
                    conn.execute(text("ALTER TABLE patients ADD COLUMN emergency_contact_name VARCHAR(255) NULL"))
                if "emergency_contact_phone" not in cols:
                    conn.execute(text("ALTER TABLE patients ADD COLUMN emergency_contact_phone VARCHAR(50) NULL"))
                if "notes" not in cols:
                    conn.execute(text("ALTER TABLE patients ADD COLUMN notes TEXT NULL"))
                if "created_at" not in cols:
                    conn.execute(text("ALTER TABLE patients ADD COLUMN created_at DATETIME NULL"))
    except Exception as e:
        logger.warning(f"Schema compatibility check notice: {e}")

try:
    engine = get_engine(DATABASE_URL)
    # Test connection on startup
    with engine.connect() as conn:
        logger.info(f"Database connected successfully to {DATABASE_URL.split('@')[-1] if '@' in DATABASE_URL else DATABASE_URL}")
    ensure_schema_compatibility(engine)
except Exception as e:
    logger.warning(f"Failed to connect to primary database ({DATABASE_URL}): {e}. Falling back to SQLite.")
    DATABASE_URL = "sqlite:///./acentra.db"
    engine = get_engine(DATABASE_URL)
    ensure_schema_compatibility(engine)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

