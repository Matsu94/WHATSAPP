from typing import Optional
from pydantic import BaseModel
from datetime import datetime

class User(BaseModel):
    User_ID: Optional[int] = None
    username: Optional[str] = None
    password: Optional[str] = None

# Modelo de token de acceso
class Token(BaseModel):
    access_token: str
    token_type: str
    
# Modelo de mensaje
# ERAN 5 PROPIEDADES, NO RECUERDO LAS ULTIMAS 2
class Message(BaseModel):
    Message_ID: Optional[int] = None # ESTA NO SE SI ES NECESARIO
    Content: str
    Date: datetime = datetime.now() # Fecha de envío
    # EL ESTADO DE LOS MSJS LO PODEMOS PONER EN PLAN BOOLEANDO/ENUM DEL 0 AL 4, SIN ENVIAR, ENVIADO, RECIBIDO Y LEIDO 
    # SI TENEMOS "SIN ENVIAR" TENDRÍAMOS QUE TENER UN ALMACENAMIENTO LOCAL O LA OPCION ES QUE NO HAYA SIN ENVIAR Y 
    # EL MSJ DESAPAREZCA SI EL QUE LO ENVIA NO TIENE CONX
    Status: int = 1  # Foreign key, required
    Sender: str # Foreign key, required
    Receiver: str # Foreign key, required
    
    # Modelo de grupo
class Group(BaseModel):
    Group_ID: Optional[int] = None
    Name: str
    Description: Optional[str] = None
    Admin: str #No se si serán str para el uname o los users tendrán id, jose nos va a dar la bd, igual en principio el creador es admin
    Members: list[str]