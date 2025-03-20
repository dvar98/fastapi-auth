from fastapi import FastAPI, Depends, Query
from sqlmodel import Session, select
from typing import Annotated

import sys
import os

sys.path.append(os.path.abspath(
    os.path.join(os.path.dirname(__file__), "../../")))
from db.database import get_session
from models.User import User


app = FastAPI()


@app.get("/read/")
def read(
    session: Session = Depends(get_session),
    offset: int = 0,
    limit: Annotated[int, Query(le=100)] = 100,
) -> list[User]:
    users = session.exec(select(User).order_by(
        User.name).offset(offset).limit(limit)).all()
    return users

@app.get("/read/{user_id}")
def read_user(user_id: int, session: Session = Depends(get_session)) -> User:
    user = session.get(User, user_id)
    return user.model_dump()
