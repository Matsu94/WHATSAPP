from fastapi import Body, FastAPI, Depends, HTTPException, status
from controllers.jwt_auth_users import ACCESS_TOKEN_EXPIRE_MINUTES, authenticate_user, create_access_token, get_current_user
from controllers.controllers import Matias
from models.models import *
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

@app.get("/")
def read_root():
    return {"message": "Welcome to the home page!"}

# Endpoint to list all users (1a)
@app.get("/usersWithoutChat")
def read_users_noChat(db: Matias = Depends(get_db), user: str = Depends(get_current_user)):
    user_id = user['user_id']
    return db.getUsersNoChat(user_id)

@app.get("/chats") # ESTE SERÍA EL PRIMER ENDPOINT DSPS DE LOGIN
def get_chats(db: Matias = Depends(get_db), user: str = Depends(get_current_user)):
    user_id = user['user_id']
    return db.getChats(user_id)
    
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
    db: Matias = Depends(get_db), 
    receiver: str = Depends(get_current_user)
):
    receiver_id = receiver['user_id']
    result = 0
    for message in messages:
        result += db.changeMessageState(message, state_id, receiver_id)
    return {"message": "Estado actualizado correctamente.", "result": result}

# Endpoint to change the content of a message
@app.put("/change_content/{message_id}/{content}")
def change_content(message_id: int, content: str, db: Matias = Depends(get_db)):
    return db.changeContent(message_id, content)

# Endpoint to delete a message 
@app.delete("/delete_message/{message_id}")
def delete_message(message_id: int, db: Matias = Depends(get_db)):
    return db.deleteMessage(message_id)

#==================GROUPS==================

# Endpoint to list user groups (1g) ESTE CREO NO ESTÁ HACIENDO NADA AHORA MISMO
@app.get("/groups")
def get_groups(user_id: int, db: Matias = Depends(get_db)):
    return db.getGroups(user_id)

# Endpoint to create a group (2g)
@app.post("/create_group")
def create_group(group: Group, db: Matias = Depends(get_db)):
    return db.createGroup(group)
# Endpoint to get members of a group
@app.get("/get_members/{group_id}")
def get_members(group_id: int, db: Matias = Depends(get_db)):
    return db.getMembers(group_id)

@app.get("/group_info/{group_id}")
def group_info(group_id: int, db: Matias = Depends(get_db)):
    return db.groupinfo(group_id)

# Endpoint to add a user to a group (3g)
@app.put("/add_users/{group_id}") # OLVIDAMOS PREGUNTARLE A JOSE SI ESTOS ENDPOINTS IBAN ASÍ CON VARIABLES T.T
def add_users_to_group(group_id: int, newMembers: NewMembers, db: Matias = Depends(get_db), admin: str = Depends(get_current_user)):
    res = 0
    for member_id in newMembers.Members:
        res += db.addUsersToGroup(group_id, member_id)
    return {"message": "Usuarios añadidos correctamente.", "result": res}

# Endpoint to delete a user from a group (3g)
@app.delete("/remove_user/{group_id}/{member_id}")
def delete_user_from_group(group_id: int, member_id: int, db: Matias = Depends(get_db), admin: str = Depends(get_current_user)):
    admin_id = admin['user_id']
    return db.deleteUserFromGroup(group_id, member_id, admin_id)

# Endpoint to change group admin (3g)
@app.put("/add_admin/{group_id}/{member_id}")
def add_admin(group_id: int, member_id: int, db: Matias = Depends(get_db), admin: str = Depends(get_current_user)):
    admin_id = admin['user_id']
    return db.addAdmin(group_id, member_id, admin_id)

# Endpoint to change group name (4g)
@app.put("/update_name/{group_id}")
def update_name(group_id: int, name: NameUpdate, db: Matias = Depends(get_db), admin: str = Depends(get_current_user)):
    return db.updateName(group_id, name)

# Endpoint to change group description
@app.put("/update_description/{group_id}")  
def update_description(group_id: int, description: DescriptionUpdate, db: Matias = Depends(get_db)):
    return db.updateDescription(group_id, description)

# Endpoint to leave a group (5g)
@app.delete("/leave_group/{group_id}") # ESTE POR LIMPIEZA EN LA BD TENDRÍA QUE HACER QUE BORRE TODA LA INFO DEL GRUPO, GROUP_MEMBERS, MENSAJES Y STATUS
def leave_group(group_id: int, db: Matias = Depends(get_db), admin: str = Depends(get_current_user)):
    admin_id = admin['user_id']
    return db.leaveGroup(group_id, admin_id)

# Endpoint to delete a group
@app.delete("/delete_group/{group_id}")  # EXTRA EXTRA EXTRA EXTRA EXTRA EXTRA EXTRA EXTRA EXTRA EXTRA
def delete_group(group_id: int, db: Matias = Depends(get_db)):
    return db.deleteGroup(group_id)

# Endpoint to get message status of group messages
@app.get("/group_message_status/{message_id}")
def group_message_status(message_id: int, db: Matias = Depends(get_db), receiver: str = Depends(get_current_user)):
    return db.groupMessageStatus(message_id)

@app.get("/get_missing_groups")
def get_missing_groups(db: Matias = Depends(get_db), user: str = Depends(get_current_user)):
    user_id = user['user_id']
    return db.getMissingGroups(user_id)

@app.get("/usersForGroup")
def read_users_noChat(db: Matias = Depends(get_db), user: str = Depends(get_current_user)):
    user_id = user['user_id']
    return db.getusersForGroup(user_id)

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

