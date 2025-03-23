from fastapi import Body, FastAPI, Depends, HTTPException, status, WebSocket, WebSocketDisconnect
from controllers.jwt_auth_users import *
from controllers.controllers import Matias
from models.models import *
from datetime import timedelta
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse
from typing import Dict, Set
import json

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Aquí especifica los orígenes permitidos
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


# Add WebSocket manager to handle connections
class ConnectionManager:
    def __init__(self):
        self.active_connections = {}

    async def connect(self, websocket: WebSocket, user_id: str):
        await websocket.accept()
        if user_id not in self.active_connections:
            self.active_connections[user_id] = []
        self.active_connections[user_id].append(websocket)
        print(f"User {user_id} connected. Active connections: {self.active_connections}")

    def disconnect(self, websocket: WebSocket, user_id: str):
        if user_id in self.active_connections:
            self.active_connections[user_id].remove(websocket)
            if not self.active_connections[user_id]:
                del self.active_connections[user_id]
        print(f"User {user_id} disconnected. Active connections: {self.active_connections}")

    async def send_personal_message(self, message: dict, user_id: str):
        if user_id in self.active_connections:
            message_array = [message]  # Wrap the message in an array
            for connection in self.active_connections[user_id]:
                # await connection.send_text(message)
                await connection.send_text(json.dumps(message_array))  # Send as JSON array
            print(f"Message sent to user {user_id}: {message}")
        else:
            print(f"User {user_id} is not connected.")

manager = ConnectionManager()

# WebSocket endpoint
@app.websocket("/ws/{user_id}")
async def websocket_endpoint(websocket: WebSocket, user_id: str):
    await manager.connect(websocket, user_id)
    try:
        while True:
            data = await websocket.receive_text()
            # You can handle incoming messages here if needed
    except WebSocketDisconnect:
        manager.disconnect(websocket, user_id)

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
async def send_message(message: Message, db: Matias = Depends(get_db), user: str = Depends(get_current_user)):
    message_id = db.sendMessage(message)
    username = user['username']
    # Convert the message to a dictionary
    message_dict = {
        "message_id": message_id,
        "sender_name": username,
        "user_name": username,
        "content": message.Content,
        "date": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        "status": message.Status,
        "sender_id": message.Sender,
        "receiver_id": message.Receiver,
        "is_group": message.isGroup,
    }

    # Check if it's a group message
    if message.isGroup:
        room_id = f"Group_{message.Receiver}"  # Ensure group WebSockets are prefixed
    else:
        room_id = message.Receiver
    
    # await manager.send_personal_message(
    #     json.dumps({"type": "new_message",}), room_id)

    await manager.send_personal_message(message_dict, room_id)
    return {"message_id": message_id}

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
    offset: int = 0,
    db: Matias = Depends(get_db),
    receiver: str = Depends(get_current_user)
):
    receiver_id = receiver['user_id']
    messages = db.getMessagesChat(offset=offset, sender_id=sender_id, receiver_id=receiver_id, isGroup=isGroup)
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

#==================GROUPS==================

# Endpoint to list user groups (1g) ESTE CREO NO ESTÁ HACIENDO NADA AHORA MISMO
@app.get("/groups")
def get_groups(user_id: int, db: Matias = Depends(get_db), user: str = Depends(get_current_user)):
    return db.getGroups(user_id)

# Endpoint to create a group (2g)
@app.post("/create_group")
def create_group(group: Group, db: Matias = Depends(get_db), user: str = Depends(get_current_user)):
    return db.createGroup(group)
# Endpoint to get members of a group
@app.get("/get_members/{group_id}")
def get_members(group_id: int, db: Matias = Depends(get_db), user: str = Depends(get_current_user)):
    return db.getMembers(group_id)

@app.get("/group_info/{group_id}")
def group_info(group_id: int, db: Matias = Depends(get_db), user: str = Depends(get_current_user)):
    return db.groupinfo(group_id)

# Endpoint to add a user to a group (3g)
@app.put("/add_users/{group_id}")
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
from fastapi import HTTPException

@app.delete("/leave_group/{group_id}")
def leave_group(group_id: int, db: Matias = Depends(get_db), admin: str = Depends(get_current_user)):
    admin_id = admin['user_id']
    result = db.leaveGroup(group_id, admin_id)

    if result is None:
        raise HTTPException(status_code=400, detail="You're the only admin left, promote another user before leaving.")
    
    return {"message": "Left group successfully"}


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

