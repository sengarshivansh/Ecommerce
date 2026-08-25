import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

from dotenv import load_dotenv

load_dotenv()


SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL")

# pool_pre_ping: send a cheap SELECT 1 before handing out a pooled connection,
# so a connection the server has already dropped is replaced instead of raising mid-request.
# pool_recycle: never reuse a connection older than 5 minutes (Render closes idle ones).
engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    pool_pre_ping=True,
    pool_recycle=300,
)

SessionLocal = sessionmaker(autocommit = False, autoflush = False, bind = engine)

Base = declarative_base()
