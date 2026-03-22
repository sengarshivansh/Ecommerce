from datetime import datetime, timedelta, timezone
from unicodedata import category
from Sellify.routers.auth import get_current_admin, get_db
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session
from passlib.context import CryptContext
from fastapi.security import OAuth2PasswordRequestForm, OAuth2PasswordBearer
from jose import JWTError, jwt


from ..database import SessionLocal
from ..model import Users, Category


router = APIRouter(
    prefix="/category",
    tags=["Category"]
)

class CreateCategoryRequest(BaseModel):
    name: str

class CategoryResponse(BaseModel):
    id: int
    name: str

    class Config:
        from_attributes = True


@router.post("/create")
def create_category(
    create_category_request: CreateCategoryRequest,
    admin: Users = Depends(get_current_admin),
    db: Session = Depends(get_db)
):

    category_model = Category(**create_category_request.model_dump())

    db.add(category_model)
    db.commit()

    return category_model

@router.get("/list", response_model = list[CategoryResponse])
def real_all_category(
    db: Session = Depends(get_db)
):
    categories = db.query(Category).all()
    
    return categories