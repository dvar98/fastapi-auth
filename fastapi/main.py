from fastapi import FastAPI, Depends, HTTPException, Query
import hashlib
from pydantic import BaseModel, validator
from typing import Annotated
from sqlmodel import Field, Session, SQLModel, create_engine, select, Relationship
from sqlalchemy import JSON, Column, Integer, String

app = FastAPI()


class User(SQLModel, table=True):
    id: int | None = Field(default=None,  sa_column=Column(
        Integer, autoincrement=True, primary_key=True, index=True))
    email: str = Field(sa_column=Column(String, unique=True, nullable=False))
    name: str = Field(index=True)
    roles: list[str] = Field(default_factory=list, sa_column=Column(JSON))


class UserAuth(SQLModel, table=True):
    id: int = Field(default=None, sa_column=Column(
        Integer, autoincrement=True, primary_key=True, index=True))
    email: str = Field(sa_column=Column(
        String, unique=True, nullable=False, index=True))
    password: str = Field()
    user_id: int = Field(foreign_key="user.id")


User.auth = Relationship(back_populates="user")
UserAuth.user = Relationship(back_populates="auth")

sqlite_file_name = "database.db"
sqlite_url = f"sqlite:///{sqlite_file_name}"

connect_args = {"check_same_thread": False}
engine = create_engine(sqlite_url, connect_args=connect_args)


def create_db_and_tables():
    SQLModel.metadata.create_all(engine)


def get_session():
    with Session(engine) as session:
        yield session


SessionDep = Annotated[Session, Depends(get_session)]


@app.on_event("startup")
def on_startup():
    create_db_and_tables()


def hash_password(password) -> str:
    return hashlib.sha256(password.encode()).hexdigest()


class UserCreate(BaseModel):
    email: str
    name: str
    password: str
    roles: list[str] = Field(default_factory=lambda: [
                             "usuario"], sa_column=Column(JSON))

    @validator("roles", pre=True, each_item=True)
    def validate_roles(cls, v):
        allowed_roles = {"admin", "editor", "usuario"}
        if v not in allowed_roles:
            raise ValueError(
                f"Role '{v}' is not allowed. Allowed roles are: {allowed_roles}")
        return v


@app.post("/users/register/")
def create_user(user: UserCreate, session: SessionDep) -> User:
    # userInfo
    userInfo = User(email=user.email, name=user.name, roles=user.roles)
    session.add(userInfo)
    session.commit()
    session.refresh(userInfo)
    # userAuth
    userAuth = UserAuth(
        email=user.email, password=hash_password(user.password), user_id=userInfo.id)
    session.add(userAuth)
    session.commit()
    session.refresh(userAuth)
    return userInfo


class UserLogin(BaseModel):
    email: str
    password: str


def login_user(user: UserLogin, session: SessionDep):
    user_data = {
        "email": user.email,
        "password": hash_password(user.password)
    }

    user = session.exec(select(UserAuth).where(
        UserAuth.email == user_data["email"])).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if user.password != user_data["password"]:
        raise HTTPException(status_code=404, detail="Password incorrect")
    # obtener el usuario por el endpoint
    user = session.get(User, user.user_id)
    return user


@app.post("/users/login/")
async def login_user(user: User = Depends(login_user)):
    return {"message": f"Login exitoso, {user.name}"}


@app.get("/users/")
def read_users(
    session: SessionDep,
    offset: int = 0,
    limit: Annotated[int, Query(le=100)] = 100,
) -> list[User]:
    users = session.exec(select(User).offset(offset).limit(limit)).all()
    return users


@app.get("/users/{user_id}")
def read_user(user_id: int, session: SessionDep) -> User:
    user = session.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


@app.delete("/users/{user_id}")
def delete_user(user_id: int, session: SessionDep):
    user = session.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    session.delete(user)
    session.commit()
    return {"ok": True}
