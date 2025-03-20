from fastapi import FastAPI, Depends, HTTPException
from sqlmodel import Session

import sys
import os

sys.path.append(os.path.abspath(
    os.path.join(os.path.dirname(__file__), "../../")))
from db.database import get_session
from models.User import User


app = FastAPI()


@app.delete("/delete/{user_id}")
def delete_user(user_id: int, session: Session = Depends(get_session)):
    user = session.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    session.delete(user)
    session.commit()
    return {"ok": True}
