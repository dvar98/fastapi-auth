from fastapi import FastAPI, Depends
from sqlmodel import Session
import sys, os

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "../../")))
from models.User import User, UserCreate

from db.database import get_session


app = FastAPI()


@app.post("/create/", response_model=User)
def create_user(user: UserCreate, session: Session = Depends(get_session)):
    db_user = User(name=user.name)
    session.add(db_user)
    session.commit()
    session.refresh(db_user)
    return db_user.model_dump()