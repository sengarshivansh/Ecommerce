from typing import Optional
from datetime import datetime, timedelta, timezone
from Sellify.routers.auth import get_current_admin, get_current_user, get_db
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session
from passlib.context import CryptContext
from fastapi.security import OAuth2PasswordRequestForm, OAuth2PasswordBearer
from jose import JWTError, jwt


from ..database import SessionLocal
from ..model import Users, Products, Category, Cart, CartItem


router = APIRouter(
    prefix="/cart",
    tags=["Cart"]
)

class AddToCartRequest(BaseModel):
    product_id: int
    quantity : int

class UpdateCartRequest(BaseModel):
    product_id: int
    quantity : int

class RemoveCartRequest(BaseModel):
    product_id: int

@router.post("/add")
def add_item(
    addtocartrequest: AddToCartRequest,
    db: Session = Depends(get_db),
    user: Users = Depends(get_current_user)
):
    product = db.query(Products).filter(Products.id == addtocartrequest.product_id).first()

    if not product:
        raise HTTPException (status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")
    
    if product.stock < addtocartrequest.quantity:
        raise HTTPException (status_code=status.HTTP_404_NOT_FOUND, detail="Not enough in stock")
    
    cart = db.query(Cart).filter(Cart.user_id == user.id).first()

    if not cart:
        cart = Cart(user_id = user.id)
        db.add(cart)
        db.commit()
        db.refresh(cart)

    item = db.query(CartItem).filter(
        CartItem.cart_id == cart.id,
        CartItem.product_id == product.id
    ).first()

    if not item:
        item = item = CartItem(
        cart_id = cart.id,
        product_id = product.id,
        quantity = addtocartrequest.quantity
    )
        db.add(item)
        
    else:
        item.quantity += addtocartrequest.quantity
    
    db.commit()
    
    return {"message": "Item added to cart"}


@router.get("/me")
def read_my_cart(
    db: Session = Depends(get_db),
    user : Users = Depends(get_current_user)
    ):
    cart = db.query(Cart).filter(Cart.user_id == user.id).first()

    if not cart:
        return {
            "items":[],
            "total_cost":0
        }

    items = db.query(CartItem).filter(CartItem.cart_id == cart.id).all()

    response_items = []
    total_cost = 0

    for item in items:

        product = db.query(Products).filter(Products.id == item.product_id).first()

        item_total = product.price * item.quantity

        total_cost += item_total

        response_items.append({
            "product_id": product.id,
            "name": product.name,
            "price": product.price,
            "quantity": item.quantity,
            "item_cost": item_total
        })
    
    return {"items": response_items,
        "total_cost": total_cost
    }

@router.put("/update")
def cart_update(
        updatecartrequest: UpdateCartRequest,
        db: Session = Depends(get_db),
        user : Users = Depends(get_current_user)
    ):
        cart = db.query(Cart).filter(Cart.user_id == user.id).first()

        if not cart:
            raise HTTPException(
                status_code=404,
                detail="Cart not found"
            )

        item = db.query(CartItem).filter(
            CartItem.cart_id== cart.id,
            CartItem.product_id == updatecartrequest.product_id
            ).first()
        
        if not item:
            raise HTTPException(
                status_code=404,
                detail="Item not in cart"
            )

        product = db.query(Products).filter(Products.id== item.product_id).first()

        if product.stock < updatecartrequest.quantity:
            raise HTTPException(
            status_code=400,
            detail="Not Enough Stock"
        )

        item.quantity = updatecartrequest.quantity
        db.commit()

        return {"message":"Cart Updated"}


@router.delete("/delete")
def remove_item(
        removecartrequest: RemoveCartRequest,
        db: Session = Depends(get_db),
        user : Users = Depends(get_current_user)
    ):
        cart = db.query(Cart).filter(Cart.user_id == user.id).first()

        if not cart:
                raise HTTPException(
                    status_code=404,
                    detail="Cart not found"
                )

        item = db.query(CartItem).filter(
                CartItem.cart_id== cart.id,
                CartItem.product_id == removecartrequest.product_id
                ).first()
            
        if not item:
                raise HTTPException(
                    status_code=404,
                    detail="Item not in cart"
                )
        db.delete(item)

        db.commit()

        return {"message": "Item removed from cart"}


@router.delete("/clearcart")
def clear_cart(
        db: Session = Depends(get_db),
        user : Users = Depends(get_current_user)
    ):
        cart = db.query(Cart).filter(Cart.user_id == user.id).first()

        if not cart:
                raise HTTPException(
                    status_code=404,
                    detail="Cart not found"
                )

        db.query(CartItem).filter(
        CartItem.cart_id == cart.id
        ).delete()

        db.commit()
        
        return {"message":"Cart is Cleared"}
        
    #add