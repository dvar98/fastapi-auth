from sqlmodel import Session, SQLModel, create_engine
from dotenv import load_dotenv
import os

from models.User import User

# Cargar variables de entorno
load_dotenv()

# Obtener la URL de la base de datos
DATABASE_URL = os.getenv("DATABASE_URL")

# Crear el motor de la base de datos
engine = create_engine(DATABASE_URL)


# Definir una función para crear la base de datos y las tablas
def create_db_and_tables():
    SQLModel.metadata.create_all(engine)


# Obtener una sesión de la base de datos
def get_session():
    with Session(engine) as session:
        return session


if __name__ == "__main__":
    create_db_and_tables()
