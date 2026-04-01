from typing import Optional
from datetime import datetime, timedelta, timezone
from Sellify.routers.auth import get_current_admin, get_db
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session
from passlib.context import CryptContext
from fastapi.security import OAuth2PasswordRequestForm, OAuth2PasswordBearer
from jose import JWTError, jwt

from ..services import product_service
from ..database import SessionLocal
from ..model import Users, Products, Category


router = APIRouter(
    prefix="/product",
    tags=["Products"]
)


class CreateProductRequest(BaseModel):
    name: str
    description: str
    price: int
    discounted_price: Optional[int] = None
    stock: int
    category_id: int


class ProductResponse(BaseModel):
    id: int
    name: str
    description : str
    price : int
    discounted_price : Optional[int] = None
    stock : int

    class Config:
        from_attributes = True

class ProductListResponse(BaseModel):
    page: int
    limit: int
    data: list[ProductResponse]



@router.post("/create",  response_model = ProductResponse)
def create_product(
    create_product_request: CreateProductRequest,
    admin: Users = Depends(get_current_admin),
    db: Session = Depends(get_db)
    ):
    category = db.query(Category).filter(Category.id == create_product_request.category_id).first()
    if not category:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Category not found")
    product_model = Products(**create_product_request.model_dump())

    db.add(product_model)
    db.commit()
    db.refresh(product_model)

    return product_model


# @router.get("/list", response_model = list[ProductResponse])
# def read_all_products(
#     db: Session = Depends(get_db)
# ):
#     products = db.query(Products).all()
    
#     return products


@router.get("/list", response_model=ProductListResponse)
def read_all_products(
    category_id: Optional[int] = None,
    search: Optional[str] = None,
    sort: Optional[str] = None,
    min_price: Optional[int] = None,
    max_price: Optional[int] = None,
    page: int = 1,
    limit: int = 10,
    db: Session = Depends(get_db)
):
    return product_service.get_products(
        db,
        category_id,
        search,
        sort,
        min_price,
        max_price,
        page,
        limit
    )
#for getting one product based on ID (This will be Used when user click on one particular Product)

@router.get("/{product_id}", response_model = ProductResponse)
def get_product(
    product_id : int,
    db:Session = Depends(get_db)
):
    product = db.query(Products).filter(Products.id == product_id).first()

    if not product:
        raise HTTPException(
            status_code = status.HTTP_404_NOT_FOUND,
            detail = "Product not found"
        )

    return product
    

    #User → Cart → CartItems → Product