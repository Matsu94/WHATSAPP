from fastapi import Body, FastAPI, Depends, HTTPException, status
from fastapi.responses import RedirectResponse
from controllers.jwt_auth_users import ACCESS_TOKEN_EXPIRE_MINUTES, authenticate_user, create_access_token, get_current_user
from controllers.controllers import Matias
from models.models import Message, Group, User, Token
from datetime import timedelta
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://127.0.0.1:5500"],  # Aquí especifica los orígenes permitidos
    allow_credentials=True,
    allow_methods=["*"],  # Métodos permitidos (GET, POST, etc.)
    allow_headers=["*"],  # Headers permitidos
)

def get_db():
        db = Matias()
        try:
            db.conecta()
            yield db
        finally:
            db.desconecta()

@app.get("/") # ESTE LO CAMBIAMOS A log_in [[EN REALIDAD ES /TOKEN ABAJO DEL TODO]]
def read_root():
    return {"message": "Welcome to the home page!"}

@app.get("/users") # ESTE SERÍA EL PRIMER ENDPOINT DSPS DE LOGIN PERO PODRÍA SER DIRECTAMENTE getChats
def read_users(db: Matias = Depends(get_db)):
    return db.getUsers()

@app.post("/sendMessage")
def send_message(message: Message, db: Matias = Depends(get_db)):
    return db.sendMessage(message)

# Endpoint to check the number of messages the user has received and not read
@app.get("/check_messages")
def check_messages(db: Matias = Depends(get_db), receiver: str = Depends(get_current_user)):
    messages_ids = db.checkMessages(receiver) # A ESTO LE TIRAMOS UN .LENGTH Y TENEMOS EL Nº DE MSJS
    return RedirectResponse(url="/change_state/{2}", messages_ids = messages_ids, status_code=303)

@app.put("/change_state/{state_id}")
def change_state_received(
    state_id: int,  # ID del estado que se quiere cambiar
    messages_ids: list[int] = Body(...),  # Lista de IDs de mensajes recibida en el cuerpo de la solicitud
    db: Matias = Depends(get_db),  # Dependencia de la base de datos
):
    """
    Cambia el estado de los mensajes con los IDs especificados al estado proporcionado.
    """
    if not messages_ids:  # Verifica si la lista está vacía
        return {"error": "messages_ids no puede estar vacío."}
    
    result = db.changeMessageState(state_id, messages_ids)
    return {"message": "Estado actualizado correctamente.", "result": result}

# Endpoint to get all messages from a chat
@app.get("/receive_messages/{sender}/{isGroup}") # HAY QUE VER CÓMO CAMBIAR EL OFFSET AL HACER SCROLL (O PONERMOS BOTONES) Y AGREGAR {SENDER} AL ENDPOINT
def receive_messages(isGroup = bool, sender = str, limit: int = 10, offset: int = 0, db: Matias = Depends(get_db), receiver: str = Depends(get_current_user)): #ARREGLAR
    db.getMessagesChat(limit=limit, offset=offset, sender=sender, receiver=receiver, isGroup=isGroup) # RECIEVER.USER_ID
    return RedirectResponse(url="/change_state/{3}", status_code=303)



# Endpoint to change the state of a message after the user has read it
@app.put("/change_state/{3}")#o change_state_seen, no se
def change_state_recieved(db: Matias = Depends(get_db)):
    return db.changeMessageState(3)

# Endpoint to change the content of a message [ACÁ TENDRÍAMOS QUE PONER UN LIMITE DE TIEMPO O ASÍ]
@app.put("/change_content/{message_id}/{content}")
def change_content(message_id: int, content: str, db: Matias = Depends(get_db)):
    return db.changeContent(message_id, content)

# Endpoint to delete a message
@app.delete("/delete_message/{message_id}") # ESTE DEJA DE SER POSIBLE CUANDO EL ESTADO AMBIA A LEIDO (4)
def delete_message(message_id: int, db: Matias = Depends(get_db)):
    return db.deleteMessage(message_id)


#Acá todo lo de crear grupos y maybe administrar usuarios

# Endpoint to create a group
@app.post("/create_group")
def create_group(group: Group, db: Matias = Depends(get_db)):
    return db.createGroup(group)

# Endpoint to add a user to a group
@app.put("/add_user/{group_id}/{user_id}")
def add_user_to_group(group_id: int, user_id: int, db: Matias = Depends(get_db)):
    return db.addUserToGroup(group_id, user_id)

# Endpoint to delete a user from a group
@app.delete("/delete_user/{group_id}/{user_id}")
def delete_user_from_group(group_id: int, user_id: int, db: Matias = Depends(get_db)):
    return db.deleteUserFromGroup(group_id, user_id)

# Endpoint to delete a group
@app.delete("/delete_group/{group_id}")
def delete_group(group_id: int, db: Matias = Depends(get_db)):
    return db.deleteGroup(group_id)

# Endpoint to change group name
@app.put("/change_name/{group_id}/{name}")
def change_name(group_id: int, name: str, db: Matias = Depends(get_db)):
    return db.changeName(group_id, name)

# Endpoint to change group admin
@app.put("/change_admin/{group_id}/{user_id}")
def change_admin(group_id: int, user_id: int, db: Matias = Depends(get_db)):
    return db.changeAdmin(group_id, user_id)

# Endpoint to change group description
@app.put("/change_description/{group_id}/{description}")
def change_description(group_id: int, description: str, db: Matias = Depends(get_db)):
    return db.changeDescription(group_id, description)

# Endpoint to generate a token
@app.post("/token", response_model=Token)
async def login(user: User, db: Matias = Depends(get_db)):
    authenticated_user = authenticate_user(db, user.username, user.password)
    if not authenticated_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": authenticated_user["username"], "permits": authenticated_user["permits"]}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}