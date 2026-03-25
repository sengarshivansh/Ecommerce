from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session
from datetime import datetime, timedelta, timezone

from ..database import SessionLocal
from ..model import Users, Products, Category, Cart, CartItem, Orders, OrderItems
from Sellify.routers.auth import get_current_admin, get_current_user, get_db

router = APIRouter(
    prefix="/order",
    tags=["Order"]
)

class OrderResponse(BaseModel):
    id: int
    total_price: int
    status: str
    created_at: datetime

    class Config:
        from_attributes = True

@router.post("/create")
def create_router(
    db:Session = Depends(get_db),
    user: Users = Depends(get_current_user)
):
    cart = db.query(Cart).filter(Cart.user_id == user.id).first()

    if not cart:
        raise HTTPException(
            status_code = 404,
            detail = "Cart not Found"
        )
    
    items = db.query(CartItem).filter(CartItem.cart_id == cart.id).all()
    if not items:
        raise HTTPException(
            status_code = 400,
            detail = "Cart is empty"
        )
    
    order = Orders(
        user_id = user.id,
        total_price = 0,
        status = "pending"
    )

    db.add(order)
    db.commit()
    db.refresh(order)

    total_price = 0

    for item in items:
        product = db.query(Products).filter(Products.id == item.product_id).first()
        item_total = product.price * item.quantity

        order_item = OrderItems(
            order_id = order.id,
            product_id = product.id,
            price = product.price,
            quantity = item.quantity
        )
        db.add(order_item)

        total_price += item_total

    order.total_price = total_price
    db.commit()

    db.query(CartItem).filter(CartItem.cart_id == cart.id).delete()

    db.commit()

    return {
        "order_id":order.id,
        "total_price":order.total_price,
        "status":order.status
    }
        
@router.get("/me", response_model = list[OrderResponse])
def read_order_history(
    user : Users = Depends(get_current_user),
    db : Session = Depends(get_db)
):
    orders = db.query(Orders).filter(Orders.user_id == user.id).all()
    return orders

@router.get("/{id}")
def get_order(
    id: int,
    db: Session = Depends(get_db),
    user: Users = Depends(get_current_user)
):

    order = db.query(Orders).filter(
        Orders.id == id,
        Orders.user_id == user.id
    ).first()

    if not order:
        raise HTTPException(
            status_code=404,
            detail="Order not found"
        )

    items = db.query(OrderItems).filter(
        OrderItems.order_id == order.id
    ).all()

    response_items = []

    for item in items:

        product = db.query(Products).filter(
            Products.id == item.product_id
        ).first()

        response_items.append({
            "product_id": product.id,
            "name": product.name,
            "price": item.price,
            "quantity": item.quantity
        })

    return {
        "order_id": order.id,
        "total_price": order.total_price,
        "status": order.status,
        "items": response_items
    }