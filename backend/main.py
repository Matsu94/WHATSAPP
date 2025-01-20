from fastapi import FastAPI
from db.dbConnection import Matias

app = FastAPI()

def get_db():
    db = Matias()
    try:
        db.conecta()
        yield db
    finally:
        db.desconecta()