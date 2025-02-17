from fastapi import FastAPI, Depends, HTTPException
from pydantic import BaseModel
import json
import os

class User(BaseModel):
    id: int
    password: str

app = FastAPI()

USERS_FILE = "users.json"

def save_user(user: User):
    users = load_users()
    if any(u["id"] == user.id for u in users):
        raise HTTPException(status_code=400, detail="User ID already exists")
    users.append(user.dict())
    with open(USERS_FILE, "w") as f:
        json.dump(users, f)
    return user

def load_users():
    if not os.path.exists(USERS_FILE):
        return []
    with open(USERS_FILE, "r") as f:
        try:
            return json.load(f)
        except json.JSONDecodeError:
            return []

@app.post("/register/")
async def register_user(user: User, saved_user: User = Depends(save_user)):
    return {"message": "User registered successfully", "user": saved_user}