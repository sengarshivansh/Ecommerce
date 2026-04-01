import os
from datetime import datetime, timedelta, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session
from passlib.context import CryptContext
from fastapi.security import OAuth2PasswordRequestForm, OAuth2PasswordBearer
from jose import JWTError, jwt


from ..database import SessionLocal
from ..model import Users



router = APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)


SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = os.getenv("ALGORITHM")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES"))

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


db_dependency = Depends(get_db)

bcrypt_Context = CryptContext(schemes=["argon2"], deprecated="auto")


@router.get("/test")
def test():
    return {"Authentication": "Working"}


class RegisterUserRequest(BaseModel):
    username: str
    first_name: str
    last_name: str
    email: str
    password: str
    phone_number: str


def create_access_token(user_id: str, email: str, role: str):

    expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)

    payload = {
        "sub": str(user_id),
        "email": email,
        "role": role,
        "exp": int(expire.timestamp())

    }

    token = jwt.encode(payload, SECRET_KEY, algorithm= ALGORITHM)

    return token


def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = db_dependency
    ):
    
    try:
        print("TOKEN:", token)
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        print("PAYLOAD:", payload)
        user_id = payload.get("sub")

        if user_id is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid Token"
            )
        user_id = int(user_id)
    except JWTError:
        raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid or expired Token"
            )
    
    user = db.query(Users).filter(Users.id == user_id).first()

    if user is None:
        raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User is not Found!!"
            )

    return user


@router.post("/register")
def register_user(
    register_users_request: RegisterUserRequest,
    db: Session = db_dependency
    ):
    register_users_model = Users(
        username=register_users_request.username,
        first_name=register_users_request.first_name,
        last_name=register_users_request.last_name,
        email=register_users_request.email,
        hashed_password=bcrypt_Context.hash(
            register_users_request.password
            ),
        role="user",
        phone_number=register_users_request.phone_number
    )
    db.add(register_users_model)
    db.commit()
    db.refresh(register_users_model)

    return {
        "id": register_users_model.id,
        "username": register_users_model.username,
        "email": register_users_model.email,
        "role": register_users_model.role
    }


@router.post("/login")
def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = db_dependency
    ):
    user = db.query(Users).filter(Users.username == form_data.username).first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials"
        )
    
    if not bcrypt_Context.verify(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials"
        )

    token = create_access_token(user.id, user.email, user.role)
    return {
        "access_token": token,
        "token_type": "bearer"
    }


@router.get("/me")
def read_me(current_user: Users = Depends(get_current_user)):
    return {
        "id": current_user.id,
        "email": current_user.email,
        "role": current_user.role
    }


def get_current_admin(current_user: Users = Depends(get_current_user)):

    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not Permitted"
        )
    return current_user

    