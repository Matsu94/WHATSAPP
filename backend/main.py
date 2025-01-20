from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.responses import RedirectResponse
from controllers.jwt_auth_users import ACCESS_TOKEN_EXPIRE_MINUTES, authenticate_user, create_access_token, get_current_user
from db.dbConnection import Matias
from models.models import Matias, Message, Group
from db.dbConnection import get_db
from datetime import timedelta
from models.models import User, Token

app = FastAPI()

@app.get("/")
def read_root():
    return {"message": "Welcome to the home page!"}

@app.post("/sendMessage")
def send_message(message: Message, db: Matias = Depends(get_db)):
    return db.sendMessage(message)

# Endpoint to check the number of messages the user has received and not read
@app.get("/check_messages")
def check_messages(db: Matias = Depends(get_db), receiver: str = Depends(get_current_user)):
    db.checkMessages(receiver)
    return RedirectResponse(url="/change_state/{2}", status_code=303)

# Endpoint to change the state of a message after the user has received it
@app.put("/change_state/{2}")#o change_state_recieved, no se
def change_state_recieved(db: Matias = Depends(get_db)):
    return db.changeMessageState(2)

# Endpoint to get all messages
@app.get("/recieve_messages") # ESTE TIENE QUE SER UN ONCLICK EN EL CHAT ESPECIFICO Y HAY QUE VER CÓMO CAMBIAR EL OFFSET AL HACER SCROLL (O PONERMOS BOTONES)
def recieve_messages(limit: int = 10, offset: int = i, db: Matias = Depends(get_db), receiver: str = Depends(get_current_user), sender: str = user_ID): #ARREGLAR
    i = cargarMensajesAnteriores()
    db.getMessages(limit=limit, offset=offset, sender=sender, receiver=receiver)
    return RedirectResponse(url="/change_state/{3}", status_code=303)

def cargarMensajesAnteriores():
    return i + 10

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