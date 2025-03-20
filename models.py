from sqlmodel import SQLModel, Field,Column, Integer
from pydantic import BaseModel

class User(SQLModel, table=True):
    id: int = Field(default=None, sa_column=(Column(Integer,autoincrement=True, primary_key=True, index=True)))
    name: str = Field(index=True)

class UserCreate(BaseModel):
    name: str