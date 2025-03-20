from fastapi import FastAPI, Depends, HTTPException
from sqlmodel import Session

import sys
import os

sys.path.append(os.path.abspath(
    os.path.join(os.path.dirname(__file__), "../../")))
from db.database import get_session
from models.User import User, UserUpdate


app = FastAPI()


@app.put("/update/")
def update(user_update: UserUpdate, session: Session = Depends(get_session)):
    user = session.get(User, user_update.id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    for key, value in user_update.model_dump().items():
        setattr(user, key, value)
    session.add(user)
    session.commit()
    session.refresh(user)

    return user.model_dump()
