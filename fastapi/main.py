from fastapi import FastAPI, Depends, HTTPException
import hashlib
import json
import os
from pydantic import BaseModel
app = FastAPI()


class User(BaseModel):
    name: str
    password: str


def hash_password(password) -> str:
    return hashlib.sha256(password.encode()).hexdigest()


def register_user(name, password):
    user_data = {"name": name,
                 "password": hash_password(password)
                 }

    if (name and password):
        if os.path.exists("users.json"):
            with open("users.json", "r") as file:
                users = json.load(file)
        else:
            users = []

        users.append(user_data)

        with open("users.json", "w") as file:
            json.dump(users, file, indent=4)

        return user_data["name"]
    else:
        raise HTTPException(status_code=404, detail="Sin datos")


def login_user(user: 'User'):
    user_data = {
        "name": user.name,
        "password": hash_password(user.password)
    }

    if os.path.exists("users.json"):
        with open("users.json", "r") as file:
            users = json.load(file)
            user_found = [u for u in users if u == user_data]

            if user_found:
                return user_found["name"]
            else:
                raise HTTPException(
                    status_code=404, detail="Usuario no encontrado")
    raise HTTPException(status_code=500, detail="Error interno")


@app.post("/register/")
async def register_user(user: User = Depends(register_user)):
    return {"message": f"Registro exitoso, {user}"}


@app.post("/login/")
async def login_user(user: User = Depends(login_user)):
    return {"message": f"Login exitoso, {user}"}
