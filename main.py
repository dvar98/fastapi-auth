from fastapi import FastAPI, Depends
from models import User, UserCreate
from sqlmodel import create_engine, Session, SQLModel
from dotenv import load_dotenv
import os

app = FastAPI()

load_dotenv()
DATABASE_URL = os.getenv("DATABASE_URL")

engine = create_engine(DATABASE_URL)

def create_db_and_tables():
    SQLModel.metadata.create_all(engine)

def get_session():
    with Session(engine) as session:
        yield session

@app.on_event("startup")
def on_startup():
    create_db_and_tables() 


@app.post("/users/", response_model=User)
def create_user(user: UserCreate, session: Session = Depends(get_session)):
    db_user = User(name=user.name)
    session.add(db_user)
    session.commit()
    session.refresh(db_user)
    return db_user
