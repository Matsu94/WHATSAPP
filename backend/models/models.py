from typing import Optional
from pydantic import BaseModel, field_validator
from datetime import datetime

class User(BaseModel):
    User_ID: Optional[int] = None
    username: Optional[str] = None
    password: Optional[str] = None

# Modelo de token de acceso
class Token(BaseModel):
    access_token: str
    token_type: str
    user_id: int 
    
# Modelo de mensaje
# ERAN 5 PROPIEDADES, NO RECUERDO LAS ULTIMAS 2
class Message(BaseModel):
    Message_ID: Optional[int] = None # ESTA NO SE SI ES NECESARIO
    Content: str
    Date: Optional[datetime] = None # Fecha de envío
    # EL ESTADO DE LOS MSJS LO PODEMOS PONER EN PLAN BOOLEANDO/ENUM DEL 0 AL 4, SIN ENVIAR, ENVIADO, RECIBIDO Y LEIDO 
    # SI TENEMOS "SIN ENVIAR" TENDRÍAMOS QUE TENER UN ALMACENAMIENTO LOCAL O LA OPCION ES QUE NO HAYA SIN ENVIAR Y 
    # EL MSJ DESAPAREZCA SI EL QUE LO ENVIA NO TIENE CONX
    Status: int = 1  # Foreign key, required
    Sender: str # Foreign key, required
    Receiver: str # Foreign key, required
    isGroup: bool # Si es un mensaje de grupo o no

    @field_validator("Content")
    def validate_content(cls, value):
        if not value.strip():
            raise ValueError("Message content cannot be empty.")
        return value
    
    # Modelo de grupo
class Group(BaseModel):
    Group_ID: Optional[int] = None
    Name: str
    Description: Optional[str] = None
    Creator_ID: int  #No se si serán str para el uname o los users tendrán id, jose nos va a dar la bd, igual en principio el creador es admin
    Members: list[int] = []  # Lista de miembros del grupo

    #Modelo para actualizar el nombre de un grupo
class NameUpdate(BaseModel):
    name: str

    #Modelo para actualizar la descripción de un grupo
class DescriptionUpdate(BaseModel):
    description: str
class NewMembers(BaseModel):
    Members: list[int] = []  # Lista de miembros del grupo
    