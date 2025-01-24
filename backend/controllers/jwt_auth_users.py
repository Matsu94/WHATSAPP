from fastapi import HTTPException, status, Depends
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt 
from typing import Optional
from datetime import datetime, timedelta
from controllers.controllers import Matias
from werkzeug.security import generate_password_hash, check_password_hash

# Clave secreta para firmar los tokens (debería ser una variable de entorno en producción)
SECRET_KEY = "dafc45fae71b61692ccd8c1c55dc7f1696943d93ce9e648b7c5252a9fd8bcbb3"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 300131400 #3 meses
# Configuración para el esquema de autenticación
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

# User verification using the database
def authenticate_user(db: Matias, username: str, password: str):
    try:
        user_data = db.checkUser(username)
        if user_data and check_password_hash(user_data['password'], password):  # Replace with password hashing if used
            return {
                "user_id": user_data['user_id'],
                "username": user_data['username'],
            }
        return None
    except Exception as e:
        print(f"Error authenticating user: {e}")
        return None


# Create a JWT access token
def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    expire = datetime.now() + (expires_delta or timedelta(minutes=15))
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


# Validate the JWT token and get the current user and permits
async def get_current_user(token: str = Depends(oauth2_scheme)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: int = payload.get("user_id")
        username: str = payload.get("username")
        if username is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Could not validate credentials",
                headers={"WWW-Authenticate": "Bearer"},
            )
        # Fetch user details from the database
        user_data = {
            "username": username,
            "user_id": user_id
        }
        return user_data
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token",
            headers={"WWW-Authenticate": "Bearer"},
        )