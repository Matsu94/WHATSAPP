from fastapi import Body, FastAPI, Depends, HTTPException, status
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

# /llistaamics: és tot el grup de la clase, tots els usuaris de la taula usuarisclase. (1a)

# Endpoint to list all users (1a)
@app.get("/usersWithoutChat")
def read_users_noChat(db: Matias = Depends(get_db), user: str = Depends(get_current_user)):
    user_id = user['user_id']
    return db.getUsersNoChat(user_id)

# /missatgesAmics: permet enviar missatges a un amic (1m) o rebre els missatges d’aquest amic. (2m)
# Inicialment rebrà els 10 missatges més recents, tant els que hem enviat com els que hem rebut, cronològicament. (2m)
# Després el sistema ha de permetre anar rebent els missatges més antics de 10 en 10. (FRONTEND)
# Els missatges enviats ha d’indicar l’estat del missatge (enviat, rebut, llegit) (FRONTEND)
# /check : ha de modificar l'estat d’un missatge a rebut o llegit. (3m)
# /missatgesgrup: El mateix que a missatgesAmics, però amb grups . (1-2m)
# Els missatges rebuts s’ha d’indicar de quin usuari són. (FRONTEND)
# Els missatges a grup tenen estat (enviat, rebut, llegit). Enviat és únic per qui envia el missatge, 
# pero rebut i llegit poden ser diferents pels membres del grup. (3m)

@app.get("/chats") # ESTE SERÍA EL PRIMER ENDPOINT DSPS DE LOGIN
def get_chats(db: Matias = Depends(get_db), user: str = Depends(get_current_user)):
    user_id = user['user_id']
    return db.getChats(user_id)

@app.get("/get_missing_groups")
def get_missing_groups(db: Matias = Depends(get_db), user: str = Depends(get_current_user)):
    user_id = user['user_id']
    return db.getMissingGroups(user_id)
    

# Endpoint to send a message (1m)
@app.post("/sendMessage") 
def send_message(message: Message, db: Matias = Depends(get_db)):
    return db.sendMessage(message)

# Endpoint to check the number of messages the user has received and not read (3m)
@app.get("/check_messages") 
def check_messages(db: Matias = Depends(get_db), receiver: str = Depends(get_current_user)):
    receiver_id = receiver['user_id']
    return db.checkMessages(receiver_id)

# Endpoint to get all messages from a chat (2m) (3m)
@app.get("/receive_messages/{sender_id}/{isGroup}")
def receive_messages(
    sender_id: str,
    isGroup: bool,
    limit: int = 10,
    offset: int = 0,
    db: Matias = Depends(get_db),
    receiver: str = Depends(get_current_user)
):
    receiver_id = receiver['user_id']
    messages = db.getMessagesChat(limit=limit, offset=offset, sender_id=sender_id, receiver_id=receiver_id, isGroup=isGroup)
    return messages

# Endpoint to change the state of a message (3m)
@app.put("/change_state/{state_id}")
def change_state(
    state_id: int,  # ID del estado que se quiere cambiar
    messages: list[dict] = Body(...),  # Lista de IDs de mensajes recibida en el cuerpo de la solicitud
    db: Matias = Depends(get_db), # Dependencia de la base de datos
    receiver: str = Depends(get_current_user) # Dependencia del usuario actual
):
    receiver_id = receiver['user_id']
    result = 0  # Initialize result to 0
    for message in messages:
        result += db.changeMessageState(message, state_id, receiver_id)  # Pass message_id directly
    return {"message": "Estado actualizado correctamente.", "result": result}

# Endpoint to change the content of a message [ACÁ TENDRÍAMOS QUE PONER UN LIMITE DE TIEMPO O ASÍ]
@app.put("/change_content/{message_id}/{content}")  # EXTRA EXTRA EXTRA EXTRA EXTRA EXTRA EXTRA EXTRA EXTRA EXTRA
def change_content(message_id: int, content: str, db: Matias = Depends(get_db)):
    return db.changeContent(message_id, content)

# Endpoint to delete a message # ESTE DEJA DE SER POSIBLE CUANDO EL ESTADO AMBIA A LEIDO (4) 
@app.delete("/delete_message/{message_id}")  # EXTRA EXTRA EXTRA EXTRA EXTRA EXTRA EXTRA EXTRA EXTRA EXTRA
def delete_message(message_id: int, db: Matias = Depends(get_db)):
    return db.deleteMessage(message_id)


#Acá todo lo de crear grupos y maybe administrar usuarios

# /grups: ha de permetre visualitzar els meus grups (1g) i afegir un grup nou (2g). 
# L’usuari que crei el grup en serà l’administrador(2g). Podrà modificar també els usuaris que formen part (3g) i canviar el nom.(4g) 
# L’administrador del grup pot afegir altres administradors. (3g)
# Els usuaris que no son administradors (els administradors també) han de poder abandonar el grup. (5g)

# Endpoint to list user groups (1g)
@app.get("/groups")
def get_groups(user_id: int, db: Matias = Depends(get_db)):
    return db.getGroups(user_id)

# Endpoint to create a group (2g)
@app.post("/create_group")
def create_group(group: Group, db: Matias = Depends(get_db)):
    return db.createGroup(group)

# Endpoint to add a user to a group (3g)
@app.put("/add_user/{group_id}/{member_id}") # OLVIDAMOS PREGUNTARLE A JOSE SI ESTOS ENDPOINTS IBAN ASÍ CON VARIABLES T.T
def add_user_to_group(group_id: int, member_id: int, db: Matias = Depends(get_db), admin_id: str = Depends(get_current_user)):
    return db.addUserToGroup(group_id, member_id, admin_id)

# Endpoint to delete a user from a group (3g)
@app.delete("/delete_user/{group_id}/{member_id}")
def delete_user_from_group(group_id: int, member_id: int, db: Matias = Depends(get_db), admin_id: str = Depends(get_current_user)):
    return db.deleteUserFromGroup(group_id, member_id, admin_id)

# Endpoint to change group admin (3g)
@app.put("/change_admin/{group_id}/{member_id}")
def change_admin(group_id: int, member_id: int, db: Matias = Depends(get_db), admin_id: str = Depends(get_current_user)):
    return db.addAdmin(group_id, member_id, admin_id)

# Endpoint to change group name (4g)
@app.put("/change_name/{group_id}/{name}")
def change_name(group_id: int, name: str, db: Matias = Depends(get_db), admin_id: str = Depends(get_current_user)):
    return db.changeName(group_id, name, admin_id)

# Endpoint to leave a group (5g)
@app.delete("/leave_group/{group_id}/{user_id}")
def leave_group(group_id: int, db: Matias = Depends(get_db), admin_id: str = Depends(get_current_user)):
    return db.leaveGroup(group_id, admin_id)

# Endpoint to delete a group
@app.delete("/delete_group/{group_id}")  # EXTRA EXTRA EXTRA EXTRA EXTRA EXTRA EXTRA EXTRA EXTRA EXTRA
def delete_group(group_id: int, db: Matias = Depends(get_db)):
    return db.deleteGroup(group_id)

# Endpoint to change group description
@app.put("/change_description/{group_id}/{description}")  # EXTRA EXTRA EXTRA EXTRA EXTRA EXTRA EXTRA EXTRA EXTRA EXTRA
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
        data={"username": authenticated_user["username"], "user_id": authenticated_user["user_id"]}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer", "user_id": authenticated_user["user_id"]}

