from fastapi import FastAPI
from models.User import UserCreate, UserUpdate
import requests

from db.database import create_db_and_tables

app = FastAPI()

SERVICES = {
    "create": "http://localhost:8001/create",
    "read": "http://localhost:8002/read",
    "update": "http://localhost:8003/update",
    "delete": "http://localhost:8004/delete",
}

HEADERS = {
    "accept": "application/json",
    "Content-Type": "application/json"
}


@app.on_event("startup")
def on_startup():
    create_db_and_tables()


@app.post("/create")
def create(item: UserCreate):
    return requests.post(SERVICES["create"], json=item.model_dump(), headers=HEADERS).json()


@app.get("/read")
def read():
    return requests.get(SERVICES["read"], headers=HEADERS).json()


@app.get("/read/{item_id}")
def read_by_id(item_id: int):
    return requests.get(f"{SERVICES['read']}/{item_id}", headers=HEADERS).json()


@app.put("/update")
def update(item: UserUpdate):
    return requests.put(SERVICES["update"], json=item.model_dump(), headers=HEADERS).json()


@app.delete("/delete/{item_id}")
def delete(item_id: int):
    return requests.delete(f"{SERVICES['delete']}/{item_id}", headers=HEADERS).json()
