from fastapi import FastAPI, Depends, HTTPException, Query
import hashlib
from pydantic import BaseModel, validator
from typing import Annotated, List
from sqlmodel import Field, Session, SQLModel, create_engine, select, Relationship
from sqlalchemy import JSON, Column, Integer, String
import os
from dotenv import load_dotenv

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


class Granja(SQLModel, table=True):
    id: int = Field(default=None,
                    sa_column=Column(Integer, primary_key=True, index=True, autoincrement=True))
    nombre: str = Field(sa_column=Column(String, nullable=False))
    user_id: int = Field(foreign_key="user.id")


Granja.user = Relationship(back_populates="user")


class Galpon(SQLModel, table=True):
    id: int = Field(default=None,
                    sa_column=Column(Integer, primary_key=True, index=True, autoincrement=True))
    nombre: str = Field(sa_column=Column(String, nullable=False))
    granja_id: int = Field(foreign_key="granja.id")


Galpon.granja = Relationship(back_populates="granja")


class ProductoVentaLink(SQLModel, table=True):
    id: int = Field(default=None,
                    sa_column=Column(Integer, primary_key=True, index=True, autoincrement=True))
    producto_id: int = Field(foreign_key="producto.id")
    venta_id: int = Field(foreign_key="venta.id")


class Venta(SQLModel, table=True):
    id: int = Field(default=None,
                    sa_column=Column(Integer, primary_key=True, index=True, autoincrement=True))
    fecha: str = Field(sa_column=Column(String, nullable=False))
    total: float = Field(sa_column=Column(Integer, nullable=False))
    user_id: int = Field(foreign_key="user.id")
    productos: List["Producto"] = Relationship(
        back_populates="ventas", link_model=ProductoVentaLink)
    galpon_id: int = Field(foreign_key="galpon.id")


Venta.galpon = Relationship(back_populates="galpon")


class Gasto(SQLModel, table=True):
    id: int = Field(default=None,
                    sa_column=Column(Integer, primary_key=True, index=True, autoincrement=True))
    fecha: str = Field(sa_column=Column(String, nullable=False))
    concepto: str = Field(sa_column=Column(String, nullable=False))
    categoria: str = Field(sa_column=Column(String, nullable=False))
    valorUnitario: float = Field(sa_column=Column(Integer, nullable=False))
    cantidad: int = Field(sa_column=Column(Integer, nullable=False))
    total: float = Field(sa_column=Column(Integer, nullable=False))
    user_id: int = Field(foreign_key="user.id")
    galpon_id: int = Field(foreign_key="galpon.id")


Gasto.user = Relationship(back_populates="user")
Gasto.galpon = Relationship(back_populates="galpon")


class Producto(SQLModel, table=True):
    id: int = Field(default=None,
                    sa_column=Column(Integer, primary_key=True, index=True, autoincrement=True))
    nombre: str = Field(sa_column=Column(String, nullable=False))
    precio: float = Field(sa_column=Column(Integer, nullable=False))
    descripcion: str = Field(sa_column=Column(String, nullable=False))
    cantidadStock: int = Field(sa_column=Column(Integer, nullable=False))
    user_id: int = Field(foreign_key="user.id")
    ventas: List["Venta"] = Relationship(
        back_populates="productos", link_model=ProductoVentaLink)


User.productos = Relationship(back_populates="user")


class Cliente(SQLModel, table=True):
    id: int = Field(default=None,
                    sa_column=Column(Integer, primary_key=True, index=True, autoincrement=True))
    nombre: str = Field(sa_column=Column(String, nullable=False))
    celular: str = Field(sa_column=Column(String, nullable=False))
    cedula: str = Field(sa_column=Column(String, nullable=False))
    correo: str = Field(sa_column=Column(String, nullable=False))


Venta.cliente = Relationship(back_populates="ventas")

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

engine = create_engine(DATABASE_URL)


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


# Granjas

@app.post("/{user_id}/granjas/create/{granja_name}")
def create_granja(user_id: int, granja_name: str, session: SessionDep):
    granja = Granja(nombre=granja_name, user_id=user_id)
    session.add(granja)
    session.commit()
    session.refresh(granja)
    return granja


@app.get("/granjas/")
def read_granjas(session: SessionDep, offset: int = 0, limit: Annotated[int, Query(le=100)] = 100,) -> list[Granja]:
    granjas = session.exec(
        select(Granja).offset(offset).limit(limit)).all()
    return granjas


@app.get("/{user_id}/granjas/")
def read_granjas_by_user(user_id: int, session: SessionDep):
    granjas = session.exec(select(Granja).where(
        Granja.user_id == user_id)).all()
    return granjas


@app.delete("/granjas/{granja_id}")
def delete_granja(granja_id: int, session: SessionDep):
    granja = session.get(granja, granja_id)
    if not granja:
        raise HTTPException(status_code=404, detail="granja not found")
    session.delete(granja)
    session.commit()
    return {"ok": True}


# Galpones

@app.post("/{granja_id}/galpones/create/{galpon_name}")
def create_galpon(granja_id: int, galpon_name: str, session: SessionDep):
    galpon = Galpon(nombre=galpon_name, granja_id=granja_id)
    session.add(galpon)
    session.commit()
    session.refresh(galpon)
    return galpon


@app.get("/galpones/")
def read_galpones(session: SessionDep, offset: int = 0, limit: Annotated[int, Query(le=100)] = 100,) -> list[Galpon]:
    galpones = session.exec(
        select(Galpon).offset(offset).limit(limit)).all()
    return galpones


@app.get("/{granja_id}/galpones/")
def read_galpones_by_granja(granja_id: int, session: SessionDep):
    galpones = session.exec(select(Galpon).where(
        Galpon.granja_id == granja_id)).all()
    return galpones


@app.delete("/galpones/{galpon_id}")
def delete_galpon(galpon_id: int, session: SessionDep):
    galpon = session.get(Galpon, galpon_id)
    if not galpon:
        raise HTTPException(status_code=404, detail="Galpon not found")
    session.delete(galpon)
    session.commit()
    return {"ok": True}


@app.get("/productos/")
def read_productos(
    session: SessionDep,
    offset: int = 0,
    limit: Annotated[int, Query(le=100)] = 100,
) -> list[Producto]:
    productos = session.exec(
        select(Producto).offset(offset).limit(limit)).all()
    return productos


@app.get('/{user_id}/productos/')
def read_productos_by_user(user_id: int, session: SessionDep):
    productos = session.exec(select(Producto).where(
        Producto.user_id == user_id)).all()
    return productos


@app.get("/productos/{producto_id}")
def read_producto(producto_id: int, session: SessionDep) -> Producto:
    producto = session.get(Producto, producto_id)
    if not producto:
        raise HTTPException(status_code=404, detail="Producto not found")
    return producto


class ProductoCreate(BaseModel):
    nombre: str
    precio: float
    descripcion: str
    cantidadStock: int


@app.post("/{user_id}/productos/create/")
def create_product(user_id: str, product: ProductoCreate, session: SessionDep):
    product = Producto(**product.model_dump(), user_id=user_id)
    session.add(product)
    session.commit()
    session.refresh(product)
    return product


@app.delete("/{user_id}/productos/{producto_id}")
def delete_product(producto_id: int, session: SessionDep):
    producto = session.get(Producto, producto_id)
    if not producto:
        raise HTTPException(status_code=404, detail="Producto not found")
    session.delete(producto)
    session.commit()
    return {"ok": True}


class VentaCreate(BaseModel):
    user_id: int
    fecha: str
    productos: List[int]


@app.post("/{galpon_id}/ventas/create/")
def create_venta(galpon_id: str, venta: VentaCreate, session: SessionDep):
    # Calcular total
    totalVenta = 0
    for producto_id in venta.productos:
        producto = session.get(Producto, producto_id)
        totalVenta += producto.precio
    # Crear la venta
    venta_db = Venta(fecha=venta.fecha, total=totalVenta,
                     user_id=venta.user_id, galpon_id=galpon_id)
    session.add(venta_db)
    session.commit()
    session.refresh(venta_db)

    # Crear las relaciones con los productos
    for producto_id in venta.productos:
        # restar en stock
        producto = session.get(Producto, producto_id)
        if producto.cantidadStock == 0:
            raise HTTPException(
                status_code=400, detail="Producto sin stock")
        producto.cantidadStock -= 1
        session.add(producto)
        producto_venta_link = ProductoVentaLink(
            producto_id=producto_id, venta_id=venta_db.id)
        session.add(producto_venta_link)

    session.commit()
    session.refresh(venta_db)
    return venta_db


@app.get("/{user_id}/ventas/")
def read_ventas_by_user(user_id: int, session: SessionDep):
    ventas = session.exec(select(Venta).where(
        Venta.user_id == user_id)).all()
    return ventas


@app.get("/{galpon_id}/ventas/")
def read_ventas_by_galpon(galpon_id: int, session: SessionDep):
    ventas = session.exec(select(Venta).where(
        Venta.galpon_id == galpon_id)).all()
    return ventas


@app.get("/ventas/{venta_id}")
def read_venta(venta_id: int, session: SessionDep) -> Venta:
    venta = session.get(Venta, venta_id)
    if not venta:
        raise HTTPException(status_code=404, detail="Venta not found")
    return venta


class GastoCreate(BaseModel):
    user_id: int
    fecha: str
    concepto: str
    categoria: str
    valorUnitario: float
    cantidad: int


@app.post("/{galpon_id}/gastos/create/")
def create_gasto(galpon_id: int, gasto: GastoCreate, session: SessionDep):
    gasto_db = Gasto(**gasto.model_dump(), total=gasto.cantidad *
                     gasto.valorUnitario, galpon_id=galpon_id)
    session.add(gasto_db)
    session.commit()
    session.refresh(gasto_db)
    return gasto_db


@app.get("/{user_id}/gastos/")
def read_gastos_by_user(user_id: int, session: SessionDep):
    gastos = session.exec(select(Gasto).where(
        Gasto.user_id == user_id)).all()
    return gastos


@app.get("/{galpon_id}/gastos/")
def read_gastos_by_galpon(galpon_id: int, session: SessionDep):
    gastos = session.exec(select(Gasto).where(
        Gasto.galpon_id == galpon_id)).all()
    return gastos


@app.get("/gastos/{gasto_id}")
def read_gasto(gasto_id: int, session: SessionDep) -> Gasto:
    gasto = session.get(Gasto, gasto_id)
    if not gasto:
        raise HTTPException(status_code=404, detail="Gasto not found")
    return gasto


@app.delete("/{user_id}/gastos/{gasto_id}")
def delete_gasto(gasto_id: int, session: SessionDep):
    gasto = session.get(Gasto, gasto_id)
    if not gasto:
        raise HTTPException(status_code=404, detail="Gasto not found")
    session.delete(gasto)
    session.commit()
    return {"ok": True}
