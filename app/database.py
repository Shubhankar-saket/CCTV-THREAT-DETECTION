from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# NOTE: In production, keep this in an .env file
SQLALCHEMY_DATABASE_URL = "postgresql://vigilens_postgres_user:IulQ8JbrDwDMJI31kZ5NioGiAVcvflrb@dpg-d50v1gmmcj7s73959mqg-a.oregon-postgres.render.com/vigilens_postgres"

engine = create_engine(SQLALCHEMY_DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()