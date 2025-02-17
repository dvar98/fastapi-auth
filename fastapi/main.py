from fastapi import FastAPI, Depends
import hashlib
import json
import os

app = FastAPI()


class User:
    def __init__(self, name: str, password: str):
        self.name = name
        self.password = password

    def hash_password(self) -> str:
        return hashlib.sha256(self.password.encode()).hexdigest()


def save_user(user: User):
    user_data = {"name": user.name, 
                 "password": user.hash_password()
                 }
    if os.path.exists("users.json"):
        with open("users.json", "r") as file:
            users = json.load(file)
    else:
        users = []
    
    users.append(user_data)

    with open("users.json", "w") as file:
        json.dump(users, file, indent=4)


@app.post("/login/")
async def login_user(user: User = Depends(User)):
    save_user(user)
    response = {"message": f"Bienvenido, {user.name}"}

    return response